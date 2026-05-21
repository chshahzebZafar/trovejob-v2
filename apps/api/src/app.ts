import Fastify     from 'fastify'
import cookie      from '@fastify/cookie'
import cors        from '@fastify/cors'
import jwt         from '@fastify/jwt'
import helmet      from '@fastify/helmet'
import multipart   from '@fastify/multipart'

import { jobRoutes }         from './routes/jobs'
import { companyRoutes }     from './routes/companies'
import { applicationRoutes } from './routes/applications'
import { employerRoutes }    from './routes/employers'
import { adminRoutes }       from './routes/admin'
import { alertRoutes }       from './routes/alerts'

export function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  })

  // ── Security ────────────────────────────────────────────────────────────────
  app.register(helmet, { contentSecurityPolicy: false })

  app.register(cors, {
    origin:      process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true,
    methods:     ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // ── Auth ────────────────────────────────────────────────────────────────────
  app.register(cookie, {
    secret: process.env.COOKIE_SECRET!,
  })

  app.register(jwt, {
    secret: process.env.JWT_SECRET!,
    cookie: {
      cookieName: 'token',
      signed:     false,
    },
  })

  // ── File uploads ────────────────────────────────────────────────────────────
  app.register(multipart, {
    limits: {
      fileSize:  5 * 1024 * 1024,  // 5 MB
      files:     1,
    },
  })

  // ── Routes ──────────────────────────────────────────────────────────────────
  app.register(jobRoutes,         { prefix: '/api/jobs' })
  app.register(companyRoutes,     { prefix: '/api/companies' })
  app.register(applicationRoutes, { prefix: '/api/applications' })
  app.register(employerRoutes,    { prefix: '/api/employers' })
  app.register(adminRoutes,       { prefix: '/api/admin' })
  app.register(alertRoutes,       { prefix: '/api/alerts' })

  // ── Health check ────────────────────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

  return app
}
