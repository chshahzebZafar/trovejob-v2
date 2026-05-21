import { FastifyInstance }     from 'fastify'
import { prisma }              from '@trovejob/db'
import bcrypt                  from 'bcryptjs'
import { requireAdmin }        from '../middleware/auth'
import { uniqueCompanySlug }   from '../utils/slug'
import {
  sendEmployerWelcome,
} from '../services/email'

export async function adminRoutes(app: FastifyInstance) {

  // ── Auth ────────────────────────────────────────────────────────────────────

  app.post('/login', async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string }

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin) return reply.status(401).send({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, admin.passwordHash)
    if (!valid)  return reply.status(401).send({ error: 'Invalid credentials' })

    const token = app.jwt.sign(
      { adminId: admin.id, role: 'admin' },
      { expiresIn: '1d' },
    )

    reply.setCookie('admin_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/api/admin',
      maxAge:   60 * 60 * 24,
    })

    return reply.send({ success: true })
  })

  app.post('/logout', { preHandler: requireAdmin }, async (_req, reply) => {
    reply.clearCookie('admin_token', { path: '/api/admin' })
    return reply.send({ success: true })
  })

  // ── Dashboard overview ──────────────────────────────────────────────────────

  app.get('/dashboard', { preHandler: requireAdmin }, async (_req, reply) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      pendingRequests,
      newListings,
      newApplications,
      platformResponseRate,
      flaggedListings,
      revenue,
    ] = await Promise.all([
      prisma.employerRequest.count({ where: { status: 'pending' } }),
      prisma.job.count({ where: { createdAt: { gte: today } } }),
      prisma.application.count({ where: { createdAt: { gte: today } } }),
      prisma.company.aggregate({ _avg: { responseRate: true } }),
      0, // placeholder — add flag model later
      prisma.company.count({ where: { planStatus: 'active' } }),
    ])

    return reply.send({
      pendingRequests,
      newListings,
      newApplications,
      platformResponseRate: Math.round(platformResponseRate._avg.responseRate ?? 0),
      flaggedListings,
      activeSubscriptions: revenue,
    })
  })

  // ── Employer Requests ───────────────────────────────────────────────────────

  app.get('/employer-requests', { preHandler: requireAdmin }, async (req, reply) => {
    const { status = 'pending' } = req.query as { status?: string }

    const requests = await prisma.employerRequest.findMany({
      where:   { status },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(requests)
  })

  // Approve employer request — creates company + employer user + sends welcome
  app.post('/employer-requests/:id/approve', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }

    const request = await prisma.employerRequest.findUnique({ where: { id } })
    if (!request) return reply.status(404).send({ error: 'Not found' })
    if (request.status !== 'pending') {
      return reply.status(400).send({ error: 'Already processed' })
    }

    const slug = await uniqueCompanySlug(request.companyName)

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10)
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    // Create company + employer user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name:        request.companyName,
          slug,
          website:     request.website,
          description: request.description,
          verified:    true,
          planStatus:  'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
        },
      })

      const user = await tx.employerUser.create({
        data: {
          companyId:    company.id,
          email:        request.contactEmail,
          passwordHash,
          role:         'owner',
        },
      })

      await tx.employerRequest.update({
        where: { id },
        data:  { status: 'approved', companyId: company.id },
      })

      return { company, user }
    })

    // Send welcome email with temp password
    const loginUrl = `${process.env.WEB_URL}/employers/login`
    await sendEmployerWelcome({
      to:       request.contactEmail,
      name:     request.contactName,
      company:  request.companyName,
      loginUrl: `${loginUrl}?email=${encodeURIComponent(request.contactEmail)}`,
    })

    return reply.send({
      message:    'Approved',
      companyId:  result.company.id,
      tempPassword, // admin sees this once to share if needed
    })
  })

  // Reject employer request
  app.post('/employer-requests/:id/reject', { preHandler: requireAdmin }, async (req, reply) => {
    const { id }    = req.params as { id: string }
    const { notes } = req.body as { notes?: string }

    await prisma.employerRequest.update({
      where: { id },
      data:  { status: 'rejected', adminNotes: notes || null },
    })

    return reply.send({ message: 'Rejected' })
  })

  // ── Plans ───────────────────────────────────────────────────────────────────

  app.get('/plans', { preHandler: requireAdmin }, async (_req, reply) => {
    const plans = await prisma.plan.findMany({ orderBy: { priceMonthly: 'asc' } })
    return reply.send(plans)
  })

  app.post('/plans', { preHandler: requireAdmin }, async (req, reply) => {
    const body = req.body as any
    const plan = await prisma.plan.create({ data: body })
    return reply.status(201).send(plan)
  })

  app.patch('/plans/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const plan   = await prisma.plan.update({ where: { id }, data: req.body as any })
    return reply.send(plan)
  })

  app.delete('/plans/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await prisma.plan.delete({ where: { id } })
    return reply.status(204).send()
  })

  // ── Employers ───────────────────────────────────────────────────────────────

  app.get('/employers', { preHandler: requireAdmin }, async (req, reply) => {
    const { planStatus, page = '1' } = req.query as Record<string, string>
    const skip = (parseInt(page) - 1) * 30

    const where: any = {}
    if (planStatus) where.planStatus = planStatus

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: {
          plan:   { select: { name: true } },
          _count: { select: { jobs: true } },
        },
      }),
      prisma.company.count({ where }),
    ])

    return reply.send({ companies, total })
  })

  // Assign plan to employer
  app.patch('/employers/:id/plan', { preHandler: requireAdmin }, async (req, reply) => {
    const { id }                 = req.params as { id: string }
    const { planId, planStatus, notes } = req.body as any

    const company = await prisma.company.update({
      where: { id },
      data:  {
        planId:     planId     || undefined,
        planStatus: planStatus || undefined,
        adminNotes: notes      || undefined,
      },
    })
    return reply.send(company)
  })

  // Suspend / unsuspend employer
  app.patch('/employers/:id/suspend', { preHandler: requireAdmin }, async (req, reply) => {
    const { id }      = req.params as { id: string }
    const { suspend } = req.body as { suspend: boolean }

    await prisma.company.update({
      where: { id },
      data:  { planStatus: suspend ? 'suspended' : 'active' },
    })
    return reply.send({ success: true })
  })

  // ── Listings ────────────────────────────────────────────────────────────────

  app.get('/listings', { preHandler: requireAdmin }, async (req, reply) => {
    const { status, page = '1' } = req.query as Record<string, string>
    const skip = (parseInt(page) - 1) * 30

    const where: any = {}
    if (status) where.status = status

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take:    30,
        orderBy: { createdAt: 'desc' },
        include: {
          company:  { select: { name: true } },
          _count:   { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ])

    return reply.send({ jobs, total })
  })

  // Admin force-update any listing status
  app.patch('/listings/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id }   = req.params as { id: string }
    const body     = req.body as any
    const allowed  = ['status', 'featured', 'title', 'salaryMin', 'salaryMax']
    const data: any = {}
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = body[k]
    }
    const job = await prisma.job.update({ where: { id }, data })
    return reply.send(job)
  })

  // ── Response Rate Tracker ───────────────────────────────────────────────────

  app.get('/response-rates', { preHandler: requireAdmin }, async (_req, reply) => {
    const companies = await prisma.company.findMany({
      where:   { verified: true, totalApplications: { gt: 0 } },
      orderBy: { responseRate: 'asc' },
      select: {
        id: true, name: true, slug: true,
        responseRate: true, avgResponseDays: true,
        totalApplications: true, totalResponded: true,
      },
    })

    const below    = companies.filter(c => c.responseRate < 70)
    const good     = companies.filter(c => c.responseRate >= 90)
    const platform = companies.length
      ? Math.round(companies.reduce((s, c) => s + c.responseRate, 0) / companies.length)
      : 100

    return reply.send({ platform, below, good, all: companies })
  })

  // ── All Applications ────────────────────────────────────────────────────────

  app.get('/applications', { preHandler: requireAdmin }, async (req, reply) => {
    const { page = '1' } = req.query as Record<string, string>
    const skip = (parseInt(page) - 1) * 30

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        skip,
        take:    30,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              title:   true,
              company: { select: { name: true } },
            },
          },
        },
      }),
      prisma.application.count(),
    ])

    return reply.send({ applications, total })
  })

  // ── Analytics ───────────────────────────────────────────────────────────────

  app.get('/analytics', { preHandler: requireAdmin }, async (_req, reply) => {
    const [
      totalJobs,
      activeJobs,
      totalCompanies,
      verifiedCompanies,
      totalApplications,
      totalAlerts,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'active' } }),
      prisma.company.count(),
      prisma.company.count({ where: { verified: true } }),
      prisma.application.count(),
      prisma.jobAlert.count(),
      prisma.company.count({ where: { planStatus: 'active' } }),
    ])

    return reply.send({
      totalJobs,
      activeJobs,
      totalCompanies,
      verifiedCompanies,
      totalApplications,
      totalAlerts,
      activeSubscriptions,
    })
  })
}
