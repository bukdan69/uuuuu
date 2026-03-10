import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn']
      : ['error'],
    errorFormat: 'pretty',
  })

// Ensure Prisma client is reused in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Handle connection errors
db.$on('error', (e) => {
  console.error('Prisma error:', e)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await db.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await db.$disconnect()
  process.exit(0)
})