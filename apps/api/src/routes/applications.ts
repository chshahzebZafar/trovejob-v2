import { FastifyInstance }              from 'fastify'
import { prisma }                       from '@trovejob/db'
import { requireEmployer }              from '../middleware/auth'
import { uploadCV, getCVSignedUrl }     from '../services/storage'
import {
  sendApplicationConfirmation,
  sendNewApplicationAlert,
  sendApplicationStatusUpdate,
} from '../services/email'

export async function applicationRoutes(app: FastifyInstance) {

  // POST /api/applications — candidate submits (multipart)
  app.post('/', async (req, reply) => {
    const parts = req.parts()

    let jobId = '', name = '', email = '', note = ''
    let cvBuffer: Buffer | null = null
    let cvFilename = 'cv.pdf'

    for await (const part of parts) {
      if (part.type === 'file') {
        cvBuffer   = await part.toBuffer()
        cvFilename = part.filename
      } else {
        if (part.fieldname === 'jobId')  jobId = part.value as string
        if (part.fieldname === 'name')   name  = part.value as string
        if (part.fieldname === 'email')  email = part.value as string
        if (part.fieldname === 'note')   note  = part.value as string
      }
    }

    if (!jobId || !name || !email || !cvBuffer) {
      return reply.status(400).send({ error: 'jobId, name, email and CV are required' })
    }

    const job = await prisma.job.findUnique({
      where:   { id: jobId, status: 'active' },
      include: { company: { select: { name: true } } },
    })
    if (!job) return reply.status(404).send({ error: 'Job not found or no longer active' })

    // Create application first to get the ID for S3 key
    const application = await prisma.application.create({
      data: {
        jobId,
        name,
        email,
        note:  note || null,
        cvUrl: 'pending',
        cvKey: 'pending',
      },
    })

    // Upload CV to S3
    const { key } = await uploadCV(cvBuffer, cvFilename, application.id)

    // Update with real S3 key
    await prisma.application.update({
      where: { id: application.id },
      data:  { cvUrl: key, cvKey: key },
    })

    // Update company application count
    await prisma.company.update({
      where: { id: job.companyId },
      data:  { totalApplications: { increment: 1 } },
    })

    // Email candidate
    const deadline = new Date(job.deadline)
    deadline.setDate(deadline.getDate() - 0) // use job deadline as response deadline
    await sendApplicationConfirmation({
      to:       email,
      name,
      jobTitle: job.title,
      company:  job.company.name,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      token:    application.token,
    })

    // Get employer email and notify
    const employerUser = await prisma.employerUser.findFirst({
      where: { companyId: job.companyId, role: 'owner' },
    })
    if (employerUser) {
      const appUrl = `${process.env.WEB_URL}/employers/applications/${application.id}`
      await sendNewApplicationAlert({
        to:             employerUser.email,
        applicant:      name,
        jobTitle:       job.title,
        note:           note || undefined,
        applicationUrl: appUrl,
      })
    }

    return reply.status(201).send({
      message: 'Application submitted',
      token:   application.token,
    })
  })

  // GET /api/applications/status/:token — candidate checks status (no auth)
  app.get('/status/:token', async (req, reply) => {
    const { token } = req.params as { token: string }

    const application = await prisma.application.findUnique({
      where:   { token },
      include: {
        job: {
          select: {
            title:    true,
            deadline: true,
            company:  { select: { name: true } },
          },
        },
      },
    })

    if (!application) return reply.status(404).send({ error: 'Not found' })

    return reply.send({
      status:      application.status,
      jobTitle:    application.job.title,
      company:     application.job.company.name,
      deadline:    application.job.deadline,
      appliedAt:   application.createdAt,
      respondedAt: application.respondedAt,
    })
  })

  // GET /api/applications — employer gets their applications
  app.get('/', { preHandler: requireEmployer }, async (req, reply) => {
    const user = req.user as { companyId: string }
    const { status, jobId, page = '1' } = req.query as Record<string, string>

    const skip  = (parseInt(page) - 1) * 20
    const where: any = {
      job: { companyId: user.companyId },
    }
    if (status) where.status = status
    if (jobId)  where.jobId  = jobId

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take:    20,
        orderBy: { createdAt: 'desc' },
        include: { job: { select: { title: true, slug: true } } },
      }),
      prisma.application.count({ where }),
    ])

    return reply.send({ applications, total })
  })

  // GET /api/applications/:id — employer views single application + CV link
  app.get('/:id', { preHandler: requireEmployer }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user   = req.user as { companyId: string }

    const application = await prisma.application.findFirst({
      where:   { id, job: { companyId: user.companyId } },
      include: { job: { select: { title: true, companyId: true } } },
    })
    if (!application) return reply.status(404).send({ error: 'Not found' })

    // Mark as viewed if still received
    if (application.status === 'received') {
      await prisma.application.update({
        where: { id },
        data:  { status: 'viewed' },
      })
      await sendApplicationStatusUpdate({
        to:       application.email,
        name:     application.name,
        jobTitle: application.job.title,
        company:  '', // filled below
        status:   'viewed',
        token:    application.token,
      })
    }

    // Generate pre-signed CV URL (1 hour)
    const cvSignedUrl = await getCVSignedUrl(application.cvKey)

    return reply.send({ ...application, cvSignedUrl })
  })

  // POST /api/applications/:id/respond — employer responds
  app.post('/:id/respond', { preHandler: requireEmployer }, async (req, reply) => {
    const { id }   = req.params as { id: string }
    const user     = req.user as { companyId: string }
    const { action, personalNote } = req.body as {
      action:       'forward' | 'reject' | 'keep'
      personalNote?: string
    }

    const application = await prisma.application.findFirst({
      where:   { id, job: { companyId: user.companyId } },
      include: {
        job: {
          select: {
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    })
    if (!application) return reply.status(404).send({ error: 'Not found' })

    const newStatus = 'responded'

    await prisma.application.update({
      where: { id },
      data:  {
        status:       newStatus,
        employerNote: personalNote || null,
        respondedAt:  new Date(),
      },
    })

    // Recalculate company response rate
    const company = await prisma.company.update({
      where: { id: user.companyId },
      data:  { totalResponded: { increment: 1 } },
    })
    const rate = (company.totalResponded / Math.max(company.totalApplications, 1)) * 100
    await prisma.company.update({
      where: { id: user.companyId },
      data:  { responseRate: Math.round(rate) },
    })

    // Email candidate
    const note = action === 'reject'
      ? `Thank you for applying — we won't be moving forward at this time.${personalNote ? ' ' + personalNote : ''}`
      : personalNote

    await sendApplicationStatusUpdate({
      to:       application.email,
      name:     application.name,
      jobTitle: application.job.title,
      company:  application.job.company.name,
      status:   'responded',
      note,
      token:    application.token,
    })

    return reply.send({ success: true })
  })
}
