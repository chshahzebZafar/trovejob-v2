import { FastifyInstance } from 'fastify'
import { prisma }          from '@trovejob/db'

export async function companyRoutes(app: FastifyInstance) {

  // GET /api/companies — public list
  app.get('/', async (req, reply) => {
    const companies = await prisma.company.findMany({
      where:   { verified: true },
      orderBy: { responseRate: 'desc' },
      select: {
        id: true, name: true, slug: true, tagline: true,
        logoUrl: true, size: true, hqLocation: true,
        responseRate: true, verified: true,
        _count: { select: { jobs: { where: { status: 'active' } } } },
      },
    })
    return reply.send(companies)
  })

  // GET /api/companies/:slug — public profile
  app.get('/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string }

    const company = await prisma.company.findUnique({
      where: { slug, verified: true },
      select: {
        id: true, name: true, slug: true, tagline: true,
        description: true, craftStatement: true,
        logoUrl: true, teamPhotos: true,
        size: true, founded: true, hqLocation: true, socialLinks: true,
        responseRate: true, avgResponseDays: true, verified: true,
        createdAt: true,
        jobs: {
          where:   { status: 'active' },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, title: true, slug: true,
            salaryMin: true, salaryMax: true, currency: true,
            locationType: true, employmentType: true, createdAt: true,
          },
        },
      },
    })

    if (!company) return reply.status(404).send({ error: 'Company not found' })
    return reply.send(company)
  })
}
