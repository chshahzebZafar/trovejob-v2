import { FastifyInstance }         from 'fastify'
import { prisma }                  from '@trovejob/db'
import bcrypt                      from 'bcryptjs'
import { requireEmployer }         from '../middleware/auth'
import { uploadPublicImage }       from '../services/storage'
import { uniqueCompanySlug }       from '../utils/slug'

export async function employerRoutes(app: FastifyInstance) {

  // POST /api/employers/request — submit access request
  app.post('/request', async (req, reply) => {
    const body = req.body as any
    const existing = await prisma.employerRequest.findFirst({
      where: { contactEmail: body.contactEmail, status: { not: 'rejected' } },
    })
    if (existing) {
      return reply.status(409).send({ error: 'A request for this email already exists' })
    }

    const request = await prisma.employerRequest.create({
      data: {
        companyName:  body.companyName,
        website:      body.website,
        description:  body.description,
        rolesHired:   body.rolesHired,
        hiresPerYear: body.hiresPerYear,
        linkedinUrl:  body.linkedinUrl || null,
        contactName:  body.contactName,
        contactEmail: body.contactEmail,
      },
    })

    return reply.status(201).send({ message: 'Request submitted. You will hear back within 24 hours.', id: request.id })
  })

  // POST /api/employers/login
  app.post('/login', async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string }

    const user = await prisma.employerUser.findUnique({ where: { email } })
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return reply.status(401).send({ error: 'Invalid credentials' })

    // Check company is not suspended
    const company = await prisma.company.findUnique({ where: { id: user.companyId } })
    if (!company || company.planStatus === 'suspended') {
      return reply.status(403).send({ error: 'Account suspended' })
    }

    await prisma.employerUser.update({
      where: { id: user.id },
      data:  { lastLoginAt: new Date() },
    })

    const token = app.jwt.sign(
      { userId: user.id, companyId: user.companyId, role: 'employer' },
      { expiresIn: '7d' },
    )

    reply.setCookie('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24 * 7,
    })

    return reply.send({ companyId: user.companyId, company: company.name })
  })

  // POST /api/employers/logout
  app.post('/logout', async (_req, reply) => {
    reply.clearCookie('token', { path: '/' })
    return reply.send({ success: true })
  })

  // GET /api/employers/me — dashboard data
  app.get('/me', { preHandler: requireEmployer }, async (req, reply) => {
    const user = req.user as { companyId: string }

    const [company, activeJobs, pendingApps] = await Promise.all([
      prisma.company.findUnique({
        where:   { id: user.companyId },
        include: { plan: true },
      }),
      prisma.job.count({
        where: { companyId: user.companyId, status: 'active' },
      }),
      prisma.application.count({
        where: {
          status:  'received',
          job:     { companyId: user.companyId },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    if (!company) return reply.status(404).send({ error: 'Company not found' })

    return reply.send({ company, stats: { activeJobs, pendingApps } })
  })

  // GET /api/employers/jobs — all employer's jobs
  app.get('/jobs', { preHandler: requireEmployer }, async (req, reply) => {
    const user   = req.user as { companyId: string }
    const { status } = req.query as { status?: string }

    const jobs = await prisma.job.findMany({
      where:   { companyId: user.companyId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    })

    return reply.send(jobs)
  })

  // PATCH /api/employers/profile — update company profile
  app.patch('/profile', { preHandler: requireEmployer }, async (req, reply) => {
    const user = req.user as { companyId: string }
    const body = req.body as any

    const allowed = [
      'tagline', 'description', 'craftStatement',
      'size', 'founded', 'hqLocation', 'socialLinks',
    ]
    const data: any = {}
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = body[k]
    }

    const company = await prisma.company.update({
      where: { id: user.companyId },
      data,
    })

    return reply.send(company)
  })

  // POST /api/employers/logo — upload company logo
  app.post('/logo', { preHandler: requireEmployer }, async (req, reply) => {
    const user  = req.user as { companyId: string }
    const parts = req.parts()

    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer   = await part.toBuffer()
        const { key, url } = await uploadPublicImage(
          buffer, part.filename, 'logos', user.companyId,
        )
        await prisma.company.update({
          where: { id: user.companyId },
          data:  { logoUrl: url, logoKey: key },
        })
        return reply.send({ logoUrl: url })
      }
    }

    return reply.status(400).send({ error: 'No file provided' })
  })
}
