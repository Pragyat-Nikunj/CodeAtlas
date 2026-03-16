'use client';

import Hero from '@/components/landingPage/Hero';
import Features from '@/components/landingPage/Features';
import Footer from '@/components/landingPage/Footer';
import FloatingLines from '@/components/ui/FloatingLines';

export default function LandingPage() {
  return (
    <main className="relative bg-slate-950 text-white min-h-screen">
      {/* Background layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FloatingLines />
      </div>

      {/* Content layers */}
      <div className="relative z-10">
        <Hero />
        <Features />
        <Footer />
      </div>
    </main>
  );
}
