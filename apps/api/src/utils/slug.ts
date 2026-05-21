import slugify from 'slugify'
import { prisma } from '@trovejob/db'

export async function uniqueJobSlug(title: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true })
  let slug = base
  let i = 1
  while (await prisma.job.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }
  return slug
}

export async function uniqueCompanySlug(name: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true })
  let slug = base
  let i = 1
  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }
  return slug
}
