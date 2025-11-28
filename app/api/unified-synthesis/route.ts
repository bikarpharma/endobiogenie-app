import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const patientId = searchParams.get('patientId')

  if (!patientId) {
    return NextResponse.json({ error: 'patientId requis' }, { status: 400 })
  }

  try {
    // Récupère la dernière synthèse unifiée du patient
    const synthesis = await prisma.unifiedSynthesis.findFirst({
      where: {
        patientId,
        isLatest: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ synthesis })
  } catch (error) {
    console.error('[API unified-synthesis] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la synthèse' },
      { status: 500 }
    )
  }
}
