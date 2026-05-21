import { FastifyInstance } from 'fastify'
import { prisma }          from '@trovejob/db'

export async function alertRoutes(app: FastifyInstance) {

  // POST /api/alerts — subscribe to job alerts
  app.post('/', async (req, reply) => {
    const { email, keyword, location, salaryMin } = req.body as any

    if (!email) return reply.status(400).send({ error: 'Email required' })

    // Upsert — same email + keyword = update, not duplicate
    const existing = await prisma.jobAlert.findFirst({
      where: { email, keyword: keyword || null },
    })

    if (existing) {
      await prisma.jobAlert.update({
        where: { id: existing.id },
        data:  { location, salaryMin: salaryMin ? parseInt(salaryMin) : null },
      })
      return reply.send({ message: 'Alert preferences updated' })
    }

    await prisma.jobAlert.create({
      data: {
        email,
        keyword:   keyword   || null,
        location:  location  || null,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
      },
    })

    return reply.status(201).send({ message: 'You\'re on the list' })
  })

  // DELETE /api/alerts/unsubscribe/:token — one-click unsubscribe
  app.delete('/unsubscribe/:token', async (req, reply) => {
    const { token } = req.params as { token: string }

    const alert = await prisma.jobAlert.findUnique({ where: { token } })
    if (!alert) return reply.status(404).send({ error: 'Not found' })

    await prisma.jobAlert.delete({ where: { token } })
    return reply.send({ message: 'Unsubscribed' })
  })
}
