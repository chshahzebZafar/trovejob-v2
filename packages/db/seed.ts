import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Seeding TroveJob database...\n')

  // ── 1. Plans ────────────────────────────────────────────────────────────────
  const plans = [
    {
      name: 'Starter',
      priceMonthly: 0,
      maxListings: 1,
      hasProfile: false,
      hasCvAccess: false,
      hasAnalytics: false,
      hasFeaturedBoost: false,
    },
    {
      name: 'Growth',
      priceMonthly: 49,
      maxListings: 5,
      hasProfile: true,
      hasCvAccess: true,
      hasAnalytics: false,
      hasFeaturedBoost: false,
    },
    {
      name: 'Pro',
      priceMonthly: 99,
      maxListings: 15,
      hasProfile: true,
      hasCvAccess: true,
      hasAnalytics: true,
      hasFeaturedBoost: false,
    },
    {
      name: 'Scale',
      priceMonthly: 199,
      maxListings: -1,           // unlimited
      hasProfile: true,
      hasCvAccess: true,
      hasAnalytics: true,
      hasFeaturedBoost: true,
    },
  ]

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } })
    if (existing) {
      console.log(`  ✓  Plan "${plan.name}" already exists — skipping`)
    } else {
      await prisma.plan.create({ data: plan })
      console.log(`  ✅  Created plan: ${plan.name} ($${plan.priceMonthly}/mo)`)
    }
  }

  // ── 2. Admin User ───────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@trovejob.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!'

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log(`\n  ✓  Admin "${adminEmail}" already exists — skipping`)
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await prisma.adminUser.create({
      data: { email: adminEmail, passwordHash },
    })
    console.log(`\n  ✅  Created admin user`)
    console.log(`      Email   : ${adminEmail}`)
    console.log(`      Password: ${adminPassword}`)
    console.log(`      ⚠️   Change this password after first login!\n`)
  }

  console.log('\n🎉  Seed complete!\n')
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
