import { FastifyInstance } from 'fastify'
import { prisma }          from '@trovejob/db'
import { requireEmployer } from '../middleware/auth'
import { uniqueJobSlug }   from '../utils/slug'

export async function jobRoutes(app: FastifyInstance) {

  // GET /api/jobs — public browse with filters
  app.get('/', async (req, reply) => {
    const {
      keyword, locationType, salaryMin,
      employmentType, page = '1', limit = '20',
    } = req.query as Record<string, string>

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {
      status: 'active',
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } },
      ],
    }

    if (keyword) {
      where.OR = [
        { title:       { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ]
    }
    if (locationType)    where.locationType   = locationType
    if (employmentType)  where.employmentType = employmentType
    if (salaryMin)       where.salaryMin      = { gte: parseInt(salaryMin) }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take:    parseInt(limit),
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        include: {
          company: {
            select: {
              id: true, name: true, slug: true,
              logoUrl: true, responseRate: true,
              avgResponseDays: true, verified: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ])

    return reply.send({ jobs, total, page: parseInt(page) })
  })

  // GET /api/jobs/:slug — public single job
  app.get('/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string }

    const job = await prisma.job.findUnique({
      where:   { slug, status: 'active' },
      include: {
        company: {
          select: {
            id: true, name: true, slug: true, tagline: true,
            logoUrl: true, description: true, craftStatement: true,
            size: true, founded: true, hqLocation: true, socialLinks: true,
            responseRate: true, avgResponseDays: true, verified: true,
          },
        },
      },
    })

    if (!job) return reply.status(404).send({ error: 'Job not found' })
    return reply.send(job)
  })

  // POST /api/jobs — employer creates job
  app.post('/', { preHandler: requireEmployer }, async (req, reply) => {
    const user = req.user as { companyId: string }
    const body = req.body as any

    const slug = await uniqueJobSlug(body.title)

    const job = await prisma.job.create({
      data: {
        companyId:       user.companyId,
        title:           body.title,
        slug,
        salaryMin:       body.salaryMin,
        salaryMax:       body.salaryMax,
        currency:        body.currency ?? 'USD',
        locationType:    body.locationType,
        city:            body.city,
        employmentType:  body.employmentType,
        description:     body.description,
        craftDescription:body.craftDescription,
        requirements:    body.requirements,
        benefits:        body.benefits,
        deadline:        body.deadline ? new Date(body.deadline) : null,
        status:          body.publish ? 'active' : 'draft',
      },
    })

    return reply.status(201).send(job)
  })

  // PATCH /api/jobs/:id — employer updates job
  app.patch('/:id', { preHandler: requireEmployer }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user   = req.user as { companyId: string }
    const body   = req.body as any

    const job = await prisma.job.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!job) return reply.status(404).send({ error: 'Not found' })

    const updated = await prisma.job.update({
      where: { id },
      data:  body,
    })
    return reply.send(updated)
  })

  // PATCH /api/jobs/:id/status — employer marks filled/paused/active
  app.patch('/:id/status', { preHandler: requireEmployer }, async (req, reply) => {
    const { id }     = req.params as { id: string }
    const user       = req.user as { companyId: string }
    const { status } = req.body as { status: string }

    const job = await prisma.job.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!job) return reply.status(404).send({ error: 'Not found' })

    const updated = await prisma.job.update({ where: { id }, data: { status } })
    return reply.send(updated)
  })

  // DELETE /api/jobs/:id — employer deletes draft
  app.delete('/:id', { preHandler: requireEmployer }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user   = req.user as { companyId: string }

    const job = await prisma.job.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!job) return reply.status(404).send({ error: 'Not found' })
    if (job.status !== 'draft') {
      return reply.status(400).send({ error: 'Only drafts can be deleted' })
    }

    await prisma.job.delete({ where: { id } })
    return reply.status(204).send()
  })
}
