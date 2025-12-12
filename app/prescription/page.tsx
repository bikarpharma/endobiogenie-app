/**
 * ============================================================================
 * INTEGRIA - PAGE DE GÉNÉRATION DE PRESCRIPTION
 * ============================================================================
 * 
 * Page complète avec formulaire de diagnostic et affichage du résultat.
 * 
 * PLACEMENT: /app/prescription/page.tsx
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import { generatePrescription, GenerationResult } from '@/app/actions/prescription';
import { PrescriptionList } from '@/components/prescription/PrescriptionList';
import { DiagnosticInput } from '@/lib/validations';
import { 
  Loader2, 
  Send, 
  AlertCircle, 
  Sparkles,
  Stethoscope,
  Brain,
  Activity,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================

export default function PrescriptionPage() {
  // États
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  
  // Formulaire
  const [motif, setMotif] = useState('');
  const [axesPrioritaires, setAxesPrioritaires] = useState<string[]>([]);
  const [emonctoires, setEmonctoires] = useState<string[]>([]);
  const [patientAge, setPatientAge] = useState('');
  const [patientSexe, setPatientSexe] = useState<'M' | 'F' | ''>('');

  // Index BdF (simplifié)
  const [indexCortisol, setIndexCortisol] = useState('');
  const [indexAlpha, setIndexAlpha] = useState('');

  // Options disponibles
  const AXES_OPTIONS = [
    { id: 'Corticotrope', label: 'Corticotrope (Stress/Adaptation)' },
    { id: 'Gonadotrope', label: 'Gonadotrope (Hormones sexuelles)' },
    { id: 'Thyréotrope', label: 'Thyréotrope (Métabolisme)' },
    { id: 'Somatotrope', label: 'Somatotrope (Croissance)' },
  ];

  const EMONCTOIRES_OPTIONS = [
    { id: 'foie', label: 'Foie' },
    { id: 'rein', label: 'Rein' },
    { id: 'peau', label: 'Peau' },
    { id: 'poumon', label: 'Poumon' },
    { id: 'intestin', label: 'Intestin' },
    { id: 'pelvien', label: 'Pelvien' },
  ];

  // Handler de soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motif.trim()) {
      alert('Veuillez entrer un motif de consultation');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Construire l'objet diagnostic
      const diagnostic: DiagnosticInput = {
        motif: motif.trim(),
        terrain: {
          axes_desequilibres: axesPrioritaires,
          index_bdf: {
            ...(indexCortisol && { 'Index Cortisol': parseFloat(indexCortisol) }),
            ...(indexAlpha && { 'Index Alpha': parseFloat(indexAlpha) }),
          },
          emonctoires: emonctoires,
        },
        patient: {
          ...(patientAge && { age: parseInt(patientAge) }),
          ...(patientSexe && { sexe: patientSexe }),
        },
      };

      // Appeler l'action serveur
      const response = await generatePrescription(diagnostic);
      setResult(response);

    } catch (error) {
      console.error('Erreur:', error);
      setResult({
        success: false,
        error: 'Une erreur inattendue est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle pour les checkboxes
  const toggleAxe = (axe: string) => {
    setAxesPrioritaires(prev => 
      prev.includes(axe) 
        ? prev.filter(a => a !== axe)
        : [...prev, axe]
    );
  };

  const toggleEmonctoire = (em: string) => {
    setEmonctoires(prev => 
      prev.includes(em) 
        ? prev.filter(e => e !== em)
        : [...prev, em]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">IntegrIA</h1>
            <p className="text-sm text-slate-500">Système Expert en Endobiogénie</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* === FORMULAIRE DE DIAGNOSTIC === */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  Diagnostic Endobiogénique
                </CardTitle>
                <CardDescription>
                  Renseignez les informations du patient pour générer une prescription personnalisée
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Motif de consultation */}
                  <div className="space-y-2">
                    <Label htmlFor="motif" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Motif de consultation *
                    </Label>
                    <Textarea
                      id="motif"
                      placeholder="Ex: Anxiété avec troubles du sommeil depuis 3 mois..."
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      rows={3}
                      className="resize-none"
                      required
                    />
                  </div>

                  {/* Axes déséquilibrés */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Axes endocriniens déséquilibrés
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {AXES_OPTIONS.map((axe) => (
                        <div key={axe.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`axe-${axe.id}`}
                            checked={axesPrioritaires.includes(axe.id)}
                            onCheckedChange={() => toggleAxe(axe.id)}
                          />
                          <label
                            htmlFor={`axe-${axe.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {axe.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Index BdF */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Index BdF (optionnel)
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="indexCortisol" className="text-xs text-slate-500">
                          Index Cortisol
                        </Label>
                        <Input
                          id="indexCortisol"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 1.4"
                          value={indexCortisol}
                          onChange={(e) => setIndexCortisol(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="indexAlpha" className="text-xs text-slate-500">
                          Index Alpha (SNA)
                        </Label>
                        <Input
                          id="indexAlpha"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 2.1"
                          value={indexAlpha}
                          onChange={(e) => setIndexAlpha(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Émonctoires */}
                  <div className="space-y-3">
                    <Label>Émonctoires surchargés</Label>
                    <div className="flex flex-wrap gap-2">
                      {EMONCTOIRES_OPTIONS.map((em) => (
                        <Badge
                          key={em.id}
                          variant={emonctoires.includes(em.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleEmonctoire(em.id)}
                        >
                          {em.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Patient */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Âge du patient</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="45"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sexe">Sexe</Label>
                      <Select value={patientSexe} onValueChange={(v: 'M' | 'F') => setPatientSexe(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculin</SelectItem>
                          <SelectItem value="F">Féminin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bouton Submit */}
                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading || !motif.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Générer la Prescription
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Message d'aide */}
            <Alert className="bg-blue-50 border-blue-200">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Conseil</AlertTitle>
              <AlertDescription className="text-blue-700 text-sm">
                Plus vous fournissez d'informations sur le terrain du patient 
                (axes, index BdF, émonctoires), plus la prescription sera précise et adaptée.
              </AlertDescription>
            </Alert>
          </div>

          {/* === RÉSULTAT === */}
          <div className="space-y-6">
            {/* État initial */}
            {!result && !isLoading && (
              <Card className="h-full min-h-[400px] flex items-center justify-center bg-slate-50/50">
                <div className="text-center text-slate-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Prescription en attente</p>
                  <p className="text-sm">Remplissez le formulaire et cliquez sur Générer</p>
                </div>
              </Card>
            )}

            {/* Loading */}
            {isLoading && (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-emerald-600" />
                  <p className="text-lg font-medium text-slate-700">Analyse du terrain...</p>
                  <p className="text-sm text-slate-500">L'IA génère votre prescription</p>
                </div>
              </Card>
            )}

            {/* Erreur */}
            {result && !result.success && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur de génération</AlertTitle>
                <AlertDescription>
                  {result.error}
                  {result.debug?.validationErrors && (
                    <ul className="mt-2 text-xs list-disc pl-4">
                      {result.debug.validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Succès - Affichage de la prescription */}
            {result && result.success && result.data && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <PrescriptionList 
                  data={result.data}
                  patientName={patientSexe === 'M' ? 'Patient' : patientSexe === 'F' ? 'Patiente' : 'Patient'}
                  consultationDate={new Date().toLocaleDateString('fr-FR')}
                />
                
                {/* Debug info (dev only) */}
                {result.debug?.duration && (
                  <p className="text-xs text-slate-400 text-center mt-4">
                    Généré en {(result.debug.duration / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
