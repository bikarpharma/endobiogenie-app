const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function test() {
  try {
    console.log('Testing connection with URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Connection successful!', result)
    await prisma.$disconnect()
  } catch (e) {
    console.error('❌ Connection failed:', e.message)
    process.exit(1)
  }
}

test()
