'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InterrogatoireEndobiogenique } from '@/lib/interrogatoire/types';

export default function InterrogatoirePage() {
  const { id: patientId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  // État du formulaire
  const [formData, setFormData] = useState<Partial<InterrogatoireEndobiogenique>>({
    sexe: 'F',
    axeNeuroVegetatif: {},
    axeAdaptatif: {},
    axeThyroidien: {},
    axeGonadiqueFemme: {},
    axeGonadiqueHomme: {},
    axeDigestifMetabolique: {},
    axeImmunoInflammatoire: {},
    rythmes: {},
    axesDeVie: {},
  });

  // Charger les données patient et interrogatoire existant
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger info patient
        const patientRes = await fetch(`/api/patients/${patientId}`);
        const patientData = await patientRes.json();
        setPatient(patientData);

        // Charger interrogatoire existant
        const interroRes = await fetch(`/api/interrogatoire/update?patientId=${patientId}`);
        const interroData = await interroRes.json();

        if (interroData.interrogatoire) {
          setFormData(interroData.interrogatoire);
        } else {
          // Initialiser avec le sexe du patient si disponible
          setFormData(prev => ({
            ...prev,
            sexe: patientData.sexe || 'F',
          }));
        }
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Helper pour mettre à jour un champ
  const updateField = (axe: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [axe]: {
        ...prev[axe as keyof InterrogatoireEndobiogenique],
        [field]: value,
      },
    }));
  };

  // Sauvegarder
  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('📤 Envoi interrogatoire pour patient:', patientId);
      console.log('📋 Données:', formData);

      const res = await fetch('/api/interrogatoire/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          interrogatoire: formData,
        }),
      });

      console.log('📡 Statut réponse:', res.status);
      const data = await res.json();
      console.log('📥 Réponse:', data);

      if (res.ok && data.success) {
        alert('✅ Interrogatoire sauvegardé avec succès !');
        // Attendre un peu avant de rediriger pour que l'utilisateur voie le message
        setTimeout(() => {
          router.push(`/patients/${patientId}`);
        }, 1000);
      } else {
        alert('❌ Erreur : ' + (data.error || 'Erreur inconnue'));
        console.error('Détails erreur:', data);
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde. Vérifiez la console (F12).');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 0, name: 'Neurovégétatif', icon: '🧠' },
    { id: 1, name: 'Adaptatif (Stress)', icon: '😰' },
    { id: 2, name: 'Thyroïdien', icon: '🦋' },
    { id: 3, name: 'Gonadique', icon: '⚤' },
    { id: 4, name: 'Digestif', icon: '🍽️' },
    { id: 5, name: 'Immuno-inflammatoire', icon: '🛡️' },
    { id: 6, name: 'Rythmes', icon: '⏰' },
    { id: 7, name: 'Axes de vie', icon: '🏃' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📋 Interrogatoire Endobiogénique
              </h1>
              <p className="text-gray-600 mt-1">
                Patient : {patient?.nom} {patient?.prenom}
              </p>
            </div>
            <button
              onClick={() => router.push(`/patients/${patientId}`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Retour
            </button>
          </div>
        </div>

        {/* Sexe */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sexe du patient
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sexe"
                value="F"
                checked={formData.sexe === 'F'}
                onChange={(e) => setFormData({ ...formData, sexe: 'F' })}
                className="w-4 h-4 text-blue-600"
              />
              <span>Femme</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sexe"
                value="H"
                checked={formData.sexe === 'H'}
                onChange={(e) => setFormData({ ...formData, sexe: 'H' })}
                className="w-4 h-4 text-blue-600"
              />
              <span>Homme</span>
            </label>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* TAB 0: Neurovégétatif */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🧠 Axe Neurovégétatif
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <SelectField
                  label="Difficultés d'endormissement ?"
                  value={formData.axeNeuroVegetatif?.sommeil_endormissement_difficile}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'sommeil_endormissement_difficile', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Réveils nocturnes ?"
                  value={formData.axeNeuroVegetatif?.sommeil_reveils_nocturnes}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'sommeil_reveils_nocturnes', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <TextField
                  label="Heure des réveils (si applicable)"
                  placeholder="ex: 3h du matin"
                  value={formData.axeNeuroVegetatif?.sommeil_heure_reveils || ''}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'sommeil_heure_reveils', v)}
                />

                <SelectField
                  label="Réveils avec fatigue ?"
                  value={formData.axeNeuroVegetatif?.sommeil_reveils_fatigue}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'sommeil_reveils_fatigue', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Faim matinale ?"
                  value={formData.axeNeuroVegetatif?.appetit_faim_matinale}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'appetit_faim_matinale', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Fringales ?"
                  value={formData.axeNeuroVegetatif?.appetit_fringales}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'appetit_fringales', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Soif importante ?"
                  value={formData.axeNeuroVegetatif?.soif_importante}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'soif_importante', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Transpiration abondante ?"
                  value={formData.axeNeuroVegetatif?.transpiration_abondante}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'transpiration_abondante', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Frilosité ?"
                  value={formData.axeNeuroVegetatif?.frilosite}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'frilosite', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Intolérance chaleur ?"
                  value={formData.axeNeuroVegetatif?.intolerance_chaleur}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'intolerance_chaleur', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Type de transit"
                  value={formData.axeNeuroVegetatif?.transit_type}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'transit_type', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'lent', label: 'Lent (constipation)' },
                    { value: 'rapide', label: 'Rapide (diarrhée)' },
                    { value: 'alternant', label: 'Alternant' },
                  ]}
                />

                <SelectField
                  label="Palpitations ?"
                  value={formData.axeNeuroVegetatif?.palpitations}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'palpitations', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Énergie du matin"
                  value={formData.axeNeuroVegetatif?.energie_matin}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'energie_matin', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'mauvaise', label: 'Mauvaise' },
                    { value: 'moyenne', label: 'Moyenne' },
                    { value: 'bonne', label: 'Bonne' },
                  ]}
                />

                <SelectField
                  label="Énergie de l'après-midi"
                  value={formData.axeNeuroVegetatif?.energie_apresmidi}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'energie_apresmidi', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'mauvaise', label: 'Mauvaise' },
                    { value: 'moyenne', label: 'Moyenne' },
                    { value: 'bonne', label: 'Bonne' },
                  ]}
                />

                <SelectField
                  label="Énergie du soir"
                  value={formData.axeNeuroVegetatif?.energie_soir}
                  onChange={(v) => updateField('axeNeuroVegetatif', 'energie_soir', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'mauvaise', label: 'Mauvaise' },
                    { value: 'moyenne', label: 'Moyenne' },
                    { value: 'bonne', label: 'Bonne' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 1: Adaptatif */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                😰 Axe Adaptatif (Stress / ACTH / Cortisol)
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <SelectField
                  label="Stress actuel ?"
                  value={formData.axeAdaptatif?.stress_actuel}
                  onChange={(v) => updateField('axeAdaptatif', 'stress_actuel', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Stress chronique ?"
                  value={formData.axeAdaptatif?.stress_chronique}
                  onChange={(v) => updateField('axeAdaptatif', 'stress_chronique', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Description du stress (optionnel)"
                    placeholder="Décrivez le contexte, la nature du stress..."
                    value={formData.axeAdaptatif?.description_stress || ''}
                    onChange={(v) => updateField('axeAdaptatif', 'description_stress', v)}
                  />
                </div>

                <SelectField
                  label="Irritabilité"
                  value={formData.axeAdaptatif?.irritabilite}
                  onChange={(v) => updateField('axeAdaptatif', 'irritabilite', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'jamais', label: 'Jamais' },
                    { value: 'rarement', label: 'Rarement' },
                    { value: 'parfois', label: 'Parfois' },
                    { value: 'souvent', label: 'Souvent' },
                    { value: 'toujours', label: 'Toujours' },
                  ]}
                />

                <SelectField
                  label="Sautes d'humeur"
                  value={formData.axeAdaptatif?.sautes_humeur}
                  onChange={(v) => updateField('axeAdaptatif', 'sautes_humeur', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'jamais', label: 'Jamais' },
                    { value: 'rarement', label: 'Rarement' },
                    { value: 'parfois', label: 'Parfois' },
                    { value: 'souvent', label: 'Souvent' },
                    { value: 'toujours', label: 'Toujours' },
                  ]}
                />

                <SelectField
                  label="Sensation d'épuisement ?"
                  value={formData.axeAdaptatif?.sensation_epuisement}
                  onChange={(v) => updateField('axeAdaptatif', 'sensation_epuisement', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Besoin de stimulants (café, sucre...) ?"
                  value={formData.axeAdaptatif?.besoin_stimulants}
                  onChange={(v) => updateField('axeAdaptatif', 'besoin_stimulants', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Fatigue du matin"
                  value={formData.axeAdaptatif?.fatigue_matin}
                  onChange={(v) => updateField('axeAdaptatif', 'fatigue_matin', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'faible', label: 'Faible' },
                    { value: 'moderee', label: 'Modérée' },
                    { value: 'importante', label: 'Importante' },
                  ]}
                />

                <SelectField
                  label="Fatigue de l'après-midi"
                  value={formData.axeAdaptatif?.fatigue_apresmidi}
                  onChange={(v) => updateField('axeAdaptatif', 'fatigue_apresmidi', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'faible', label: 'Faible' },
                    { value: 'moderee', label: 'Modérée' },
                    { value: 'importante', label: 'Importante' },
                  ]}
                />

                <SelectField
                  label="Craving sucre ?"
                  value={formData.axeAdaptatif?.craving_sucre}
                  onChange={(v) => updateField('axeAdaptatif', 'craving_sucre', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Tensions musculaires cervicales ?"
                  value={formData.axeAdaptatif?.tensions_musculaires_cervicales}
                  onChange={(v) => updateField('axeAdaptatif', 'tensions_musculaires_cervicales', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Thyroïdien */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🦋 Axe Thyroïdien
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <SelectField
                  label="Sensibilité au froid ?"
                  value={formData.axeThyroidien?.sensibilite_froid}
                  onChange={(v) => updateField('axeThyroidien', 'sensibilite_froid', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Sensibilité à la chaleur ?"
                  value={formData.axeThyroidien?.sensibilite_chaleur}
                  onChange={(v) => updateField('axeThyroidien', 'sensibilite_chaleur', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Prise de poids récente ?"
                  value={formData.axeThyroidien?.prise_poids_recent}
                  onChange={(v) => updateField('axeThyroidien', 'prise_poids_recent', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Perte de poids récente ?"
                  value={formData.axeThyroidien?.perte_poids_recent}
                  onChange={(v) => updateField('axeThyroidien', 'perte_poids_recent', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Chute de cheveux ?"
                  value={formData.axeThyroidien?.chute_cheveux}
                  onChange={(v) => updateField('axeThyroidien', 'chute_cheveux', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Peau sèche ?"
                  value={formData.axeThyroidien?.peau_seche}
                  onChange={(v) => updateField('axeThyroidien', 'peau_seche', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Lenteur mentale ?"
                  value={formData.axeThyroidien?.lenteur_mentale}
                  onChange={(v) => updateField('axeThyroidien', 'lenteur_mentale', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Troubles de mémoire ?"
                  value={formData.axeThyroidien?.troubles_memoire}
                  onChange={(v) => updateField('axeThyroidien', 'troubles_memoire', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Transit lent ?"
                  value={formData.axeThyroidien?.transit_lent}
                  onChange={(v) => updateField('axeThyroidien', 'transit_lent', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Palpitations ?"
                  value={formData.axeThyroidien?.palpitations}
                  onChange={(v) => updateField('axeThyroidien', 'palpitations', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Gonadique */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ⚤ Axe Gonadique
              </h2>

              {formData.sexe === 'F' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded">
                    <p className="font-semibold text-blue-900">Questions pour les femmes</p>
                  </div>

                  <SelectField
                    label="Cycle régulier ?"
                    value={formData.axeGonadiqueFemme?.cycle_regulier}
                    onChange={(v) => updateField('axeGonadiqueFemme', 'cycle_regulier', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="Saignements abondants ?"
                    value={formData.axeGonadiqueFemme?.cycle_saignements_abondants}
                    onChange={(v) => updateField('axeGonadiqueFemme', 'cycle_saignements_abondants', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="SPM : Irritabilité ?"
                    value={formData.axeGonadiqueFemme?.spm_irritabilite}
                    onChange={(v) => updateField('axeGonadiqueFemme', 'spm_irritabilite', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="SPM : Douleurs seins ?"
                    value={formData.axeGonadiqueFemme?.spm_douleurs_seins}
                    onChange={(v) => updateField('axeGonadiqueFemme', 'spm_douleurs_seins', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="Bouffées de chaleur ?"
                    value={formData.axeGonadiqueFemme?.bouffees_chaleur}
                    onChange={(v) => updateField('axeGonadiqueFemme', 'bouffees_chaleur', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="Libido basse ?"
                    value={formData.axeGonadiqueFemme?.libido_basse}
                    onChange={(v) => updateField('axeGonadiqueFemme', 'libido_basse', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="Contraception hormonale ?"
                    value={formData.axeGonadiqueFemme?.contraception_hormonale}
                    onChange={(v) => updateField('axeGonadiqueFemme', 'contraception_hormonale', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />
                </div>
              )}

              {formData.sexe === 'H' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded">
                    <p className="font-semibold text-blue-900">Questions pour les hommes</p>
                  </div>

                  <SelectField
                    label="Libido basse ?"
                    value={formData.axeGonadiqueHomme?.libido_basse}
                    onChange={(v) => updateField('axeGonadiqueHomme', 'libido_basse', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="Érections matinales diminuées ?"
                    value={formData.axeGonadiqueHomme?.erections_matinales_diminuees}
                    onChange={(v) => updateField('axeGonadiqueHomme', 'erections_matinales_diminuees', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="Perte de muscle ?"
                    value={formData.axeGonadiqueHomme?.perte_muscle}
                    onChange={(v) => updateField('axeGonadiqueHomme', 'perte_muscle', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="Prise de graisse abdominale ?"
                    value={formData.axeGonadiqueHomme?.prise_graisse_abdominale}
                    onChange={(v) => updateField('axeGonadiqueHomme', 'prise_graisse_abdominale', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />

                  <SelectField
                    label="Troubles urinaires ?"
                    value={formData.axeGonadiqueHomme?.troubles_urinaires}
                    onChange={(v) => updateField('axeGonadiqueHomme', 'troubles_urinaires', v)}
                    options={[
                      { value: '', label: '-' },
                      { value: 'oui', label: 'Oui' },
                      { value: 'non', label: 'Non' },
                    ]}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Digestif */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🍽️ Axe Digestif & Métabolique
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <SelectField
                  label="Digestion lente ?"
                  value={formData.axeDigestifMetabolique?.digestion_lente}
                  onChange={(v) => updateField('axeDigestifMetabolique', 'digestion_lente', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Digestion lourde ?"
                  value={formData.axeDigestifMetabolique?.digestion_lourde}
                  onChange={(v) => updateField('axeDigestifMetabolique', 'digestion_lourde', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Ballonnements ?"
                  value={formData.axeDigestifMetabolique?.ballonnements}
                  onChange={(v) => updateField('axeDigestifMetabolique', 'ballonnements', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Ballonnements après repas ?"
                  value={formData.axeDigestifMetabolique?.ballonnements_apres_repas}
                  onChange={(v) => updateField('axeDigestifMetabolique', 'ballonnements_apres_repas', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <TextField
                  label="Intolérances connues"
                  placeholder="ex: lait, gluten"
                  value={formData.axeDigestifMetabolique?.intolerances_connues || ''}
                  onChange={(v) => updateField('axeDigestifMetabolique', 'intolerances_connues', v)}
                />

                <SelectField
                  label="Transit"
                  value={formData.axeDigestifMetabolique?.transit}
                  onChange={(v) => updateField('axeDigestifMetabolique', 'transit', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'constipation', label: 'Constipation' },
                    { value: 'diarrhee', label: 'Diarrhée' },
                    { value: 'alternant', label: 'Alternant' },
                  ]}
                />

                <SelectField
                  label="Hypoglycémies (fringales urgentes) ?"
                  value={formData.axeDigestifMetabolique?.hypoglycemies}
                  onChange={(v) => updateField('axeDigestifMetabolique', 'hypoglycemies', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Intolérance alcool ?"
                  value={formData.axeDigestifMetabolique?.intolerance_alcool}
                  onChange={(v) => updateField('axeDigestifMetabolique', 'intolerance_alcool', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 5: Immuno-inflammatoire */}
          {activeTab === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🛡️ Axe Immuno-inflammatoire
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <SelectField
                  label="Douleurs articulaires ?"
                  value={formData.axeImmunoInflammatoire?.douleurs_articulaires}
                  onChange={(v) => updateField('axeImmunoInflammatoire', 'douleurs_articulaires', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Douleurs musculaires ?"
                  value={formData.axeImmunoInflammatoire?.douleurs_musculaires}
                  onChange={(v) => updateField('axeImmunoInflammatoire', 'douleurs_musculaires', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Allergies saisonnières ?"
                  value={formData.axeImmunoInflammatoire?.allergies_saisonnieres}
                  onChange={(v) => updateField('axeImmunoInflammatoire', 'allergies_saisonnieres', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Allergies alimentaires ?"
                  value={formData.axeImmunoInflammatoire?.allergies_alimentaires}
                  onChange={(v) => updateField('axeImmunoInflammatoire', 'allergies_alimentaires', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <TextField
                  label="Détails allergies"
                  placeholder="ex: pollen de bouleau, arachides..."
                  value={formData.axeImmunoInflammatoire?.details_allergies || ''}
                  onChange={(v) => updateField('axeImmunoInflammatoire', 'details_allergies', v)}
                />

                <SelectField
                  label="Infections récidivantes ?"
                  value={formData.axeImmunoInflammatoire?.infections_recidivantes}
                  onChange={(v) => updateField('axeImmunoInflammatoire', 'infections_recidivantes', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Eczéma ?"
                  value={formData.axeImmunoInflammatoire?.eczema}
                  onChange={(v) => updateField('axeImmunoInflammatoire', 'eczema', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Psoriasis ?"
                  value={formData.axeImmunoInflammatoire?.psoriasis}
                  onChange={(v) => updateField('axeImmunoInflammatoire', 'psoriasis', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 6: Rythmes */}
          {activeTab === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ⏰ Rythmes Circadiens
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <TextField
                  label="Heure de coucher habituelle"
                  placeholder="ex: 23h"
                  value={formData.rythmes?.rythme_sommeil_couche_heure || ''}
                  onChange={(v) => updateField('rythmes', 'rythme_sommeil_couche_heure', v)}
                />

                <TextField
                  label="Heure de réveil habituelle"
                  placeholder="ex: 6h30"
                  value={formData.rythmes?.rythme_sommeil_reveil_heure || ''}
                  onChange={(v) => updateField('rythmes', 'rythme_sommeil_reveil_heure', v)}
                />

                <SelectField
                  label="Travail de nuit ?"
                  value={formData.rythmes?.travail_nuit}
                  onChange={(v) => updateField('rythmes', 'travail_nuit', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Décalages horaires fréquents ?"
                  value={formData.rythmes?.decalage_horaire_frequent}
                  onChange={(v) => updateField('rythmes', 'decalage_horaire_frequent', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Pic d'énergie le matin ?"
                  value={formData.rythmes?.energie_pic_matin}
                  onChange={(v) => updateField('rythmes', 'energie_pic_matin', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui (du matin)' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Pic d'énergie le soir ?"
                  value={formData.rythmes?.energie_pic_soir}
                  onChange={(v) => updateField('rythmes', 'energie_pic_soir', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui (du soir)' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <TextField
                  label="Saison d'amélioration"
                  placeholder="ex: été, printemps"
                  value={formData.rythmes?.saison_amelioration || ''}
                  onChange={(v) => updateField('rythmes', 'saison_amelioration', v)}
                />

                <TextField
                  label="Saison d'aggravation"
                  placeholder="ex: hiver, automne"
                  value={formData.rythmes?.saison_aggravation || ''}
                  onChange={(v) => updateField('rythmes', 'saison_aggravation', v)}
                />
              </div>
            </div>
          )}

          {/* TAB 7: Axes de vie */}
          {activeTab === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🏃 Axes de Vie & Histoire
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <SelectField
                  label="Traumatisme majeur dans le passé ?"
                  value={formData.axesDeVie?.traumatisme_majeur_historique}
                  onChange={(v) => updateField('axesDeVie', 'traumatisme_majeur_historique', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Burnout passé ?"
                  value={formData.axesDeVie?.burnout_passe}
                  onChange={(v) => updateField('axesDeVie', 'burnout_passe', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Contexte professionnel"
                    placeholder="Décrivez le travail, stress, horaires..."
                    value={formData.axesDeVie?.contexte_professionnel || ''}
                    onChange={(v) => updateField('axesDeVie', 'contexte_professionnel', v)}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Contexte familial"
                    placeholder="Situation familiale, stress..."
                    value={formData.axesDeVie?.contexte_familial || ''}
                    onChange={(v) => updateField('axesDeVie', 'contexte_familial', v)}
                  />
                </div>

                <SelectField
                  label="Activité physique régulière ?"
                  value={formData.axesDeVie?.activite_physique_reguliere}
                  onChange={(v) => updateField('axesDeVie', 'activite_physique_reguliere', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <TextField
                  label="Type d'activité physique"
                  placeholder="ex: course, yoga, musculation"
                  value={formData.axesDeVie?.type_activite_physique || ''}
                  onChange={(v) => updateField('axesDeVie', 'type_activite_physique', v)}
                />

                <SelectField
                  label="Qualité de sommeil ressentie"
                  value={formData.axesDeVie?.qualite_sommeil_ressentie}
                  onChange={(v) => updateField('axesDeVie', 'qualite_sommeil_ressentie', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'mauvaise', label: 'Mauvaise' },
                    { value: 'moyenne', label: 'Moyenne' },
                    { value: 'bonne', label: 'Bonne' },
                  ]}
                />

                <SelectField
                  label="Consommation tabac ?"
                  value={formData.axesDeVie?.consommation_tabac}
                  onChange={(v) => updateField('axesDeVie', 'consommation_tabac', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Consommation alcool ?"
                  value={formData.axesDeVie?.consommation_alcool}
                  onChange={(v) => updateField('axesDeVie', 'consommation_alcool', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />

                <SelectField
                  label="Consommation caféine ?"
                  value={formData.axesDeVie?.consommation_cafeine}
                  onChange={(v) => updateField('axesDeVie', 'consommation_cafeine', v)}
                  options={[
                    { value: '', label: '-' },
                    { value: 'oui', label: 'Oui' },
                    { value: 'non', label: 'Non' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex gap-4 justify-between">
          <button
            onClick={() => activeTab > 0 && setActiveTab(activeTab - 1)}
            disabled={activeTab === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>

          <div className="flex gap-4">
            {activeTab < tabs.length - 1 ? (
              <button
                onClick={() => setActiveTab(activeTab + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>💾 Sauvegarder l'interrogatoire</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Étape {activeTab + 1} / {tabs.length}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function SelectField({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({ label, placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

function TextAreaField({ label, placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
