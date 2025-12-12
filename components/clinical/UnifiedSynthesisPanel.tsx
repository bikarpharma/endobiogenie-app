'use client'

// Panneau d'affichage de la synthèse clinique unifiée avec pédagogie interactive

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Brain, Activity, Heart, Zap, AlertTriangle, CheckCircle, Info, RefreshCw, Target, Leaf, Droplets, Wind, Utensils, ShieldAlert } from 'lucide-react'
import type { UnifiedAnalysisOutput } from '@/types/clinical-engine'
import { runUnifiedAnalysis } from '@/app/actions/clinical-pipeline'
import type { UnifiedSynthesis } from '@prisma/client'
import type { Prisma } from '@prisma/client'

interface UnifiedSynthesisPanelProps {
  patientId: string
  initialData?: UnifiedSynthesis | null
}

export function UnifiedSynthesisPanel({ patientId, initialData }: UnifiedSynthesisPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [synthesis, setSynthesis] = useState<UnifiedAnalysisOutput | null>(
    initialData ? (initialData.content as unknown as UnifiedAnalysisOutput) : null
  )

  const handleGenerate = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await runUnifiedAnalysis(patientId)
        setSynthesis(result.content as unknown as UnifiedAnalysisOutput)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      }
    })
  }

  // Couleurs selon le statut de l'axe
  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('hyper')) return 'bg-red-100 text-red-800 border-red-300'
    if (status.toLowerCase().includes('hypo')) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (status.toLowerCase().includes('normo')) return 'bg-green-100 text-green-800 border-green-300'
    return 'bg-gray-100 text-gray-800 border-gray-300'
  }

  // Couleur du terrain basée sur l'axe dominant (PAS Alpha/Beta/Gamma/Delta - ça n'existe pas en endobiogénie !)
  const getTerrainColor = (axeDominant: string) => {
    switch (axeDominant) {
      case 'Corticotrope': return 'bg-red-100 text-red-800 border-red-400'
      case 'Thyréotrope': return 'bg-blue-100 text-blue-800 border-blue-400'
      case 'Gonadotrope': return 'bg-pink-100 text-pink-800 border-pink-400'
      case 'Somatotrope': return 'bg-orange-100 text-orange-800 border-orange-400'
      case 'Mixte': return 'bg-purple-100 text-purple-800 border-purple-400'
      default: return 'bg-gray-100 text-gray-800 border-gray-400'
    }
  }

  // Icône selon l'axe
  const getAxisIcon = (axis: string) => {
    switch (axis) {
      case 'Corticotrope': return <Zap className="w-5 h-5" />
      case 'Thyréotrope': return <Activity className="w-5 h-5" />
      case 'Gonadotrope': return <Heart className="w-5 h-5" />
      case 'Somatotrope': return <Brain className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Bouton de génération */}
      {!synthesis && (
        <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="py-12 text-center">
            <Brain className="w-16 h-16 mx-auto text-purple-500 mb-4" />
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              Synthèse Endobiogénique Unifiée
            </h3>
            <p className="text-purple-700 mb-6 max-w-md mx-auto">
              Analyse complète du terrain, des axes endocriniens et de la concordance bio-clinique par l'IA.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isPending}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Générer la Synthèse IA
                </>
              )}
            </Button>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Résultat de la synthèse */}
      {synthesis && (
        <TooltipProvider delayDuration={200}>
          <div className="space-y-6">

            {/* Header avec bouton régénérer */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Brain className="w-7 h-7 text-purple-600" />
                Synthèse Endobiogénique
              </h2>
              <Button
                onClick={handleGenerate}
                disabled={isPending}
                variant="outline"
                size="sm"
              >
                {isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Régénérer
                  </>
                )}
              </Button>
            </div>

            {/* Section Terrain */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  🏔️ Terrain Endobiogénique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={`text-lg px-4 py-2 cursor-help border-2 ${getTerrainColor(synthesis.terrain.axeDominant)}`}
                        >
                          Axe {synthesis.terrain.axeDominant}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-4">
                        <p className="font-semibold mb-2">💡 Explication pédagogique :</p>
                        <p className="text-sm">{synthesis.terrain.pedagogicalHint}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {synthesis.terrain.profilSNA}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 mb-2">{synthesis.terrain.description || synthesis.terrain.justification}</p>
                    {synthesis.terrain.description && synthesis.terrain.justification && (
                      <p className="text-slate-500 text-sm">{synthesis.terrain.justification}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Équilibre Neuro-Végétatif */}
            {synthesis.neuroVegetative && (
              <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    ⚡ Équilibre Neuro-Végétatif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Badge
                      variant="outline"
                      className={`text-lg px-4 py-2 ${
                        synthesis.neuroVegetative.status === 'Sympathicotonia' ? 'bg-red-100 text-red-800' :
                        synthesis.neuroVegetative.status === 'Parasympathicotonia' ? 'bg-blue-100 text-blue-800' :
                        synthesis.neuroVegetative.status === 'Eutonia' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {synthesis.neuroVegetative.status}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      {synthesis.neuroVegetative.dominance}
                    </Badge>
                  </div>
                  <p className="mt-3 text-slate-700">{synthesis.neuroVegetative.explanation}</p>
                </CardContent>
              </Card>
            )}

            {/* Section Axes Endocriniens */}
            <Card className="border-2 border-indigo-200">
              <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  🧬 Axes Endocriniens
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {synthesis.endocrineAxes.map((axe, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Card className="cursor-help hover:shadow-md transition-shadow border-2">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getAxisIcon(axe.axis)}
                                <span className="font-semibold text-slate-800">{axe.axis}</span>
                              </div>
                              <Badge className={`border ${getStatusColor(axe.status)}`}>
                                {axe.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">{axe.mechanism}</p>
                            {axe.biomarkers && axe.biomarkers.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {axe.biomarkers.map((bio, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {bio}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md p-4">
                        <p className="font-semibold mb-2">💡 Pédagogie - Axe {axe.axis} :</p>
                        <p className="text-sm">{axe.pedagogicalHint}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section Synthèse Clinique */}
            {synthesis.clinicalSynthesis && (
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📋 Synthèse Clinique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Résumé */}
                  <div className="p-4 bg-white rounded-lg border border-amber-200">
                    <p className="text-slate-700">{synthesis.clinicalSynthesis.summary}</p>
                  </div>

                  {/* Score de concordance */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-600">Concordance Bio-Clinique :</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          synthesis.clinicalSynthesis.concordanceScore >= 70 ? 'bg-green-500' :
                          synthesis.clinicalSynthesis.concordanceScore >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${synthesis.clinicalSynthesis.concordanceScore}%` }}
                      />
                    </div>
                    <span className="font-bold text-lg">
                      {synthesis.clinicalSynthesis.concordanceScore}%
                    </span>
                  </div>

                  {/* Mécanismes physiopathologiques */}
                  {synthesis.clinicalSynthesis.mecanismesPhysiopathologiques && synthesis.clinicalSynthesis.mecanismesPhysiopathologiques.length > 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <h4 className="font-semibold text-slate-700 mb-2">Mécanismes physiopathologiques :</h4>
                      <ul className="space-y-1">
                        {synthesis.clinicalSynthesis.mecanismesPhysiopathologiques.map((meca, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-slate-400">•</span>
                            <span>{meca}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Discordances */}
                  {synthesis.clinicalSynthesis.discordances && synthesis.clinicalSynthesis.discordances.length > 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Points de Discordance
                      </h4>
                      <ul className="space-y-2">
                        {synthesis.clinicalSynthesis.discordances.map((disc, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                            <span className="text-amber-600 mt-0.5">⚠</span>
                            <span>{disc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pas de discordance */}
                  {(!synthesis.clinicalSynthesis.discordances || synthesis.clinicalSynthesis.discordances.length === 0) && (
                    <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
                      <p className="text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Bonne concordance entre la biologie et la clinique
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section Stratégie Thérapeutique */}
            {synthesis.therapeuticStrategy && (
              <Card className="border-2 border-teal-200 bg-gradient-to-br from-white to-teal-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-teal-600" />
                    Stratégie Thérapeutique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Priorités */}
                  {synthesis.therapeuticStrategy.priorites && synthesis.therapeuticStrategy.priorites.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-teal-800 mb-2">Priorités :</h4>
                      <div className="space-y-2">
                        {synthesis.therapeuticStrategy.priorites.map((priorite, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 bg-teal-50 rounded border border-teal-200">
                            <Badge variant="outline" className="bg-teal-100 text-teal-800 shrink-0">
                              {idx + 1}
                            </Badge>
                            <span className="text-sm text-teal-900">{priorite}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Objectifs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {synthesis.therapeuticStrategy.objectifsCourtTerme && synthesis.therapeuticStrategy.objectifsCourtTerme.length > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-teal-200">
                        <h5 className="font-medium text-teal-700 mb-2 text-sm">Court terme (1-2 mois)</h5>
                        <ul className="space-y-1">
                          {synthesis.therapeuticStrategy.objectifsCourtTerme.map((obj, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-teal-500">→</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {synthesis.therapeuticStrategy.objectifsMoyenTerme && synthesis.therapeuticStrategy.objectifsMoyenTerme.length > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-teal-200">
                        <h5 className="font-medium text-teal-700 mb-2 text-sm">Moyen terme (3-6 mois)</h5>
                        <ul className="space-y-1">
                          {synthesis.therapeuticStrategy.objectifsMoyenTerme.map((obj, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-teal-500">→</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Précautions */}
                  {synthesis.therapeuticStrategy.precautions && synthesis.therapeuticStrategy.precautions.length > 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h5 className="font-medium text-orange-700 mb-2 text-sm flex items-center gap-1">
                        <ShieldAlert className="w-4 h-4" />
                        Précautions
                      </h5>
                      <ul className="space-y-1">
                        {synthesis.therapeuticStrategy.precautions.map((prec, idx) => (
                          <li key={idx} className="text-xs text-orange-800 flex items-start gap-1">
                            <span>⚠</span>
                            <span>{prec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Hint pédagogique */}
                  {synthesis.therapeuticStrategy.pedagogicalHint && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <span className="font-medium">💡 </span>
                        {synthesis.therapeuticStrategy.pedagogicalHint}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section Prescription Suggérée */}
            {synthesis.suggestedPrescription && (
              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                    Prescription Suggérée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Phytothérapie */}
                  {synthesis.suggestedPrescription.phytotherapie && synthesis.suggestedPrescription.phytotherapie.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Phytothérapie
                      </h4>
                      <div className="space-y-3">
                        {synthesis.suggestedPrescription.phytotherapie.map((plante, idx) => (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className="p-3 bg-white rounded-lg border border-emerald-200 cursor-help hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-medium text-emerald-900">{plante.nom}</span>
                                    {plante.nomLatin && (
                                      <span className="text-xs text-slate-500 italic ml-2">({plante.nomLatin})</span>
                                    )}
                                    <Badge variant="secondary" className="ml-2 text-xs">{plante.forme}</Badge>
                                  </div>
                                  <Badge variant="outline" className="text-xs shrink-0">{plante.duree}</Badge>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{plante.posologie}</p>
                                <p className="text-xs text-emerald-700 mt-1">{plante.indication}</p>
                              </div>
                            </TooltipTrigger>
                            {plante.pedagogicalHint && (
                              <TooltipContent className="max-w-sm p-3">
                                <p className="text-sm">💡 {plante.pedagogicalHint}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gemmothérapie */}
                  {synthesis.suggestedPrescription.gemmotherapie && synthesis.suggestedPrescription.gemmotherapie.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-lime-800 mb-3 flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        Gemmothérapie
                      </h4>
                      <div className="space-y-3">
                        {synthesis.suggestedPrescription.gemmotherapie.map((bourgeon, idx) => (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className="p-3 bg-white rounded-lg border border-lime-200 cursor-help hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-medium text-lime-900">{bourgeon.nom}</span>
                                    {bourgeon.nomLatin && (
                                      <span className="text-xs text-slate-500 italic ml-2">({bourgeon.nomLatin})</span>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs shrink-0">{bourgeon.duree}</Badge>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{bourgeon.posologie}</p>
                                <p className="text-xs text-lime-700 mt-1">{bourgeon.indication}</p>
                              </div>
                            </TooltipTrigger>
                            {bourgeon.pedagogicalHint && (
                              <TooltipContent className="max-w-sm p-3">
                                <p className="text-sm">💡 {bourgeon.pedagogicalHint}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aromathérapie */}
                  {synthesis.suggestedPrescription.aromatherapie && synthesis.suggestedPrescription.aromatherapie.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-violet-800 mb-3 flex items-center gap-2">
                        <Wind className="w-4 h-4" />
                        Aromathérapie
                      </h4>
                      <div className="space-y-3">
                        {synthesis.suggestedPrescription.aromatherapie.map((huile, idx) => (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className="p-3 bg-white rounded-lg border border-violet-200 cursor-help hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-medium text-violet-900">{huile.huile}</span>
                                    {huile.nomLatin && (
                                      <span className="text-xs text-slate-500 italic ml-2">({huile.nomLatin})</span>
                                    )}
                                    <Badge variant="secondary" className="ml-2 text-xs">{huile.voie}</Badge>
                                  </div>
                                  <Badge variant="outline" className="text-xs shrink-0">{huile.duree}</Badge>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{huile.posologie}</p>
                                <p className="text-xs text-violet-700 mt-1">{huile.indication}</p>
                                {huile.precautions && (
                                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {huile.precautions}
                                  </p>
                                )}
                              </div>
                            </TooltipTrigger>
                            {huile.pedagogicalHint && (
                              <TooltipContent className="max-w-sm p-3">
                                <p className="text-sm">💡 {huile.pedagogicalHint}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conseils Hygiène et Alimentaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {synthesis.suggestedPrescription.conseilsHygiene && synthesis.suggestedPrescription.conseilsHygiene.length > 0 && (
                      <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                        <h5 className="font-medium text-sky-700 mb-2 text-sm">Conseils d'hygiène de vie</h5>
                        <ul className="space-y-1">
                          {synthesis.suggestedPrescription.conseilsHygiene.map((conseil, idx) => (
                            <li key={idx} className="text-xs text-sky-800 flex items-start gap-1">
                              <span>•</span>
                              <span>{conseil}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {synthesis.suggestedPrescription.conseilsAlimentaires && synthesis.suggestedPrescription.conseilsAlimentaires.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <h5 className="font-medium text-amber-700 mb-2 text-sm flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          Conseils alimentaires
                        </h5>
                        <ul className="space-y-1">
                          {synthesis.suggestedPrescription.conseilsAlimentaires.map((conseil, idx) => (
                            <li key={idx} className="text-xs text-amber-800 flex items-start gap-1">
                              <span>•</span>
                              <span>{conseil}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {synthesis.warnings && synthesis.warnings.length > 0 && (
              <Card className="border-2 border-red-200 bg-gradient-to-br from-white to-red-50">
                <CardContent className="py-4">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Alertes pour le praticien
                  </h4>
                  <ul className="space-y-2">
                    {synthesis.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">⚠</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Métadonnées */}
            {synthesis.meta && (
              <div className="text-xs text-slate-400 text-right space-y-1">
                <div>
                  Généré par {synthesis.meta.modelUsed} en {synthesis.meta.processingTime}ms
                  • Confiance: {Math.round((synthesis.meta.confidenceScore || 0) * 100)}%
                </div>
                {synthesis.meta.dataUsed && (
                  <div className="flex justify-end gap-2">
                    <Badge variant={synthesis.meta.dataUsed.biology ? 'default' : 'secondary'} className="text-xs">
                      BdF {synthesis.meta.dataUsed.biology ? '✓' : '✗'}
                    </Badge>
                    <Badge variant={synthesis.meta.dataUsed.anamnesis ? 'default' : 'secondary'} className="text-xs">
                      Anamnèse {synthesis.meta.dataUsed.anamnesis ? '✓' : '✗'}
                    </Badge>
                    <Badge variant={synthesis.meta.dataUsed.interrogatoire ? 'default' : 'secondary'} className="text-xs">
                      Interrogatoire {synthesis.meta.dataUsed.interrogatoire ? '✓' : '✗'}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </TooltipProvider>
      )}
    </div>
  )
}
