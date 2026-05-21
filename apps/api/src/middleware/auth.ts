import { FastifyRequest, FastifyReply } from 'fastify'

export async function requireEmployer(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await req.jwtVerify()
    const user = req.user as { role: string; companyId: string }
    if (user.role !== 'employer') {
      return reply.status(403).send({ error: 'Forbidden' })
    }
  } catch {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}

export async function requireAdmin(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await req.jwtVerify()
    const user = req.user as { role: string }
    if (user.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden' })
    }
  } catch {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}
