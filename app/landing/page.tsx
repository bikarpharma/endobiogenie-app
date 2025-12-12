"use client";
// ============================================================================
// INTEGRIA - LANDING PAGE ONE-PAGE PREMIUM
// Site de présentation avec animations scroll et design moderne
// ============================================================================

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// ============================================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================================

function AnimatedSection({
  children,
  className = "",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function GlowingButton({
  children,
  href,
  variant = "primary"
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  const baseStyles = "relative px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105";
  const variants = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50",
    secondary: "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
  };

  return (
    <Link href={href}>
      <motion.button
        className={`${baseStyles} ${variants[variant]}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
        {variant === "primary" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 blur-xl"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay
}: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 group cursor-pointer"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="text-5xl mb-6">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  description,
  delay
}: {
  number: number;
  title: string;
  description: string;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: number % 2 === 0 ? 50 : -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="flex items-start gap-6"
    >
      <motion.div
        className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/30"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        {number}
      </motion.div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
}

function FloatingElement({
  children,
  delay = 0,
  duration = 3,
  y = 20
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
}) {
  return (
    <motion.div
      animate={{ y: [-y, y, -y] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// SECTIONS
// ============================================================================

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center px-6 max-w-6xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Révolutionnez votre pratique médicale
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
        >
          <span className="text-white">Integ</span>
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">rIA</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto"
        >
          L&apos;intelligence artificielle au service de la
          <span className="text-emerald-400 font-semibold"> médecine intégrative</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          Phytothérapie • Gemmothérapie • Aromathérapie • Endobiogénie
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <GlowingButton href="/register" variant="primary">
            Commencer gratuitement
          </GlowingButton>
          <GlowingButton href="#demo" variant="secondary">
            Voir la démo
          </GlowingButton>
        </motion.div>

        {/* Floating badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-gray-500"
        >
          <FloatingElement delay={0}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm">
              <span className="text-2xl">🌿</span>
              <span>500+ plantes</span>
            </div>
          </FloatingElement>
          <FloatingElement delay={0.5}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm">
              <span className="text-2xl">🧬</span>
              <span>Analyse BDF</span>
            </div>
          </FloatingElement>
          <FloatingElement delay={1}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm">
              <span className="text-2xl">🤖</span>
              <span>IA avancée</span>
            </div>
          </FloatingElement>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function ProblemSection() {
  return (
    <AnimatedSection className="py-32 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            className="text-emerald-400 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Le constat
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            La médecine intégrative mérite
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              de meilleurs outils
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "⏱️",
              title: "Temps perdu",
              description: "Des heures à chercher les bonnes plantes dans des livres et références éparpillées"
            },
            {
              icon: "🧩",
              title: "Complexité",
              description: "Croiser les axes endocriniens, les terrains et les contre-indications est fastidieux"
            },
            {
              icon: "📚",
              title: "Connaissances dispersées",
              description: "L'endobiogénie, la phyto, la gemmo, l'aroma... tout est dans des sources différentes"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-red-500/5 border border-red-500/10"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function FeaturesSection() {
  // ID pour la navigation
  const features = [
    {
      icon: "🩺",
      title: "Interrogatoire intelligent",
      description: "Questionnaire clinique complet avec scoring automatique des axes endocriniens (corticotrope, thyroïdien, gonadotrope...)"
    },
    {
      icon: "📊",
      title: "Analyse BDF",
      description: "Bilan De Fonctionnement avec calcul automatique des index biologiques et interprétation des déséquilibres"
    },
    {
      icon: "🌿",
      title: "Phytodex",
      description: "Encyclopédie de 500+ plantes avec photos, indications, contre-indications et formes galéniques"
    },
    {
      icon: "📋",
      title: "Ordonnances IA",
      description: "Génération intelligente de prescriptions personnalisées avec justifications scientifiques"
    },
    {
      icon: "🔬",
      title: "RAG Hybride",
      description: "Base de connaissances issue des 4 volumes d'endobiogénie + manuels phyto/gemmo/aroma"
    },
    {
      icon: "🇹🇳",
      title: "Plantes tunisiennes",
      description: "Intégration des plantes médicinales du Nord tunisien avec noms arabes et vernaculaires"
    }
  ];

  return (
    <section id="features" className="py-32 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-20">
          <span className="text-emerald-400 font-medium">Fonctionnalités</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Tout ce dont vous avez besoin,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              en un seul endroit
            </span>
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-slate-950 to-emerald-950/30">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-20">
          <span className="text-emerald-400 font-medium">Processus</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Simple comme
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"> 1, 2, 3</span>
          </h2>
        </AnimatedSection>

        <div className="space-y-12">
          <StepCard
            number={1}
            title="Créez le dossier patient"
            description="Renseignez les informations de base et complétez l'interrogatoire clinique endobiogénique avec notre formulaire intelligent."
            delay={0}
          />
          <StepCard
            number={2}
            title="L'IA analyse le terrain"
            description="Notre moteur analyse les réponses, calcule les scores des axes endocriniens et identifie les déséquilibres du terrain."
            delay={0.2}
          />
          <StepCard
            number={3}
            title="Recevez vos recommandations"
            description="Obtenez une ordonnance personnalisée avec les plantes adaptées, leurs posologies et les justifications scientifiques."
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section id="demo" className="py-32 px-6 bg-gradient-to-b from-emerald-950/30 to-slate-950">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-emerald-400 font-medium">Aperçu</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Découvrez l&apos;interface
          </h2>
        </AnimatedSection>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Browser mockup */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-sm shadow-2xl shadow-emerald-500/10">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-slate-700/50 rounded-lg px-4 py-1.5 text-sm text-gray-400 text-center">
                  app.integria.tn
                </div>
              </div>
            </div>

            {/* Screenshot placeholder - grid of feature previews */}
            <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Phytodex preview */}
                <motion.div
                  className="rounded-xl bg-white/5 p-6 border border-white/10"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                    <span>🌿</span> Phytodex - Fiche plante
                  </h4>
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-4xl">
                      🌱
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium italic">Ficus carica</p>
                      <p className="text-gray-400 text-sm">Figuier</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Corticotrope</span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs">Adaptogène</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* BDF preview */}
                <motion.div
                  className="rounded-xl bg-white/5 p-6 border border-white/10"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                    <span>📊</span> Analyse BDF
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "Axe corticotrope", value: 72, color: "emerald" },
                      { label: "Axe thyroïdien", value: 45, color: "amber" },
                      { label: "Axe gonadotrope", value: 88, color: "emerald" }
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{item.label}</span>
                          <span className={`text-${item.color}-400`}>{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Ordonnance preview */}
                <motion.div
                  className="rounded-xl bg-white/5 p-6 border border-white/10 md:col-span-2"
                  whileHover={{ scale: 1.01 }}
                >
                  <h4 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                    <span>📋</span> Ordonnance générée par l&apos;IA
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { name: "Figuier (MG)", dose: "50 gouttes/jour", icon: "🌿" },
                      { name: "Cassis (MG)", dose: "30 gouttes × 2/jour", icon: "🫐" },
                      { name: "Lavande (HE)", dose: "2 gouttes au coucher", icon: "💜" }
                    ].map((rx, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <span className="text-2xl">{rx.icon}</span>
                        <div>
                          <p className="text-white font-medium text-sm">{rx.name}</p>
                          <p className="text-gray-500 text-xs">{rx.dose}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}

function TargetSection() {
  const targets = [
    {
      icon: "👨‍⚕️",
      title: "Médecins endobiogénistes",
      description: "Optimisez vos consultations avec un outil qui comprend la logique de terrain"
    },
    {
      icon: "🌿",
      title: "Naturopathes",
      description: "Accédez à une base de connaissances phyto/gemmo/aroma complète et fiable"
    },
    {
      icon: "💊",
      title: "Pharmaciens",
      description: "Conseillez vos patients avec des recommandations personnalisées et sourcées"
    }
  ];

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-emerald-400 font-medium">Pour qui ?</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Conçu pour les
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"> professionnels</span>
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {targets.map((target, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="text-center p-8"
            >
              <motion.div
                className="text-6xl mb-6"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                {target.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-3">{target.title}</h3>
              <p className="text-gray-400">{target.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-emerald-400 font-medium">Tarifs</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Simple et transparent
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-2">Découverte</h3>
            <div className="text-4xl font-bold text-white mb-6">
              Gratuit
            </div>
            <ul className="space-y-3 text-gray-400 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 5 patients
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Phytodex complet
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Interrogatoire clinique
              </li>
            </ul>
            <GlowingButton href="/register" variant="secondary">
              Commencer
            </GlowingButton>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium">
              Populaire
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Professionnel</h3>
            <div className="text-4xl font-bold text-white mb-1">
              29€<span className="text-lg text-gray-400">/mois</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">ou 290€/an (-17%)</p>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Patients illimités
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Ordonnances IA
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Analyse BDF complète
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Export PDF
              </li>
            </ul>
            <GlowingButton href="/register" variant="primary">
              Essai 14 jours gratuit
            </GlowingButton>
          </motion.div>

          {/* Clinic */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-2">Clinique</h3>
            <div className="text-4xl font-bold text-white mb-6">
              Sur devis
            </div>
            <ul className="space-y-3 text-gray-400 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Multi-praticiens
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Formation incluse
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> API personnalisée
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Support dédié
              </li>
            </ul>
            <GlowingButton href="mailto:contact@bikarpharma.com" variant="secondary">
              Nous contacter
            </GlowingButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-slate-950 to-emerald-950/50 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <AnimatedSection>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Prêt à transformer
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              votre pratique ?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Rejoignez les praticiens qui utilisent déjà IntegrIA pour optimiser leurs consultations en médecine intégrative.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowingButton href="/register" variant="primary">
              Démarrer gratuitement
            </GlowingButton>
            <GlowingButton href="mailto:contact@bikarpharma.com" variant="secondary">
              Demander une démo
            </GlowingButton>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-16 px-6 bg-slate-950 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/integria-logo.jpg"
                alt="IntegrIA"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-white">IntegrIA</span>
            </div>
            <p className="text-gray-400 mb-4">
              L&apos;intelligence artificielle au service de la médecine intégrative.
              <br />
              Une solution développée par Bikarpharma.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Produit</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Tarifs</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Phytodex</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Mentions légales</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">CGU</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">RGPD</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} IntegrIA by Bikarpharma. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// NAVIGATION STICKY
// ============================================================================

function Navigation() {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(2, 6, 23, 0)", "rgba(2, 6, 23, 0.9)"]
  );
  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(12px)"]
  );

  const navLinks = [
    { href: "#features", label: "Fonctionnalités" },
    { href: "#demo", label: "Démo" },
    { href: "#pricing", label: "Tarifs" },
  ];

  return (
    <motion.nav
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/0"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-3">
          <Image
            src="/integria-logo.jpg"
            alt="IntegrIA"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="text-xl font-bold text-white">
            Integ<span className="text-emerald-400">rIA</span>
          </span>
        </Link>

        {/* Nav links - desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-emerald-400 transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-300 hover:text-white transition-colors font-medium hidden sm:block"
          >
            Connexion
          </Link>
          <Link href="/register">
            <motion.button
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Essai gratuit
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ============================================================================
// PAGE PRINCIPALE
// ============================================================================

export default function LandingPage() {
  return (
    <main className="bg-slate-950 text-white overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DemoSection />
      <TargetSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
