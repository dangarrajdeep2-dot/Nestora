import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Compass,
  Utensils,
  Wifi,
  Coins
} from 'lucide-react';
import { HeroSearch } from '@/components/home/HeroSearch';
import { Hero3DVisualizer } from '@/components/home/Hero3DVisualizer';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { Tilt3D } from '@/components/ui/Tilt3D';
import { getPopularLocations, getProperties } from '@/lib/api/properties';

export const revalidate = 60; // Refresh data periodically

export default async function HomePage() {
  const popularLocations = await getPopularLocations();
  const { properties } = await getProperties();

  // Top featured properties
  const featuredProperties = properties.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section with Emerald Glass Glow */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50/40 to-transparent dark:from-emerald-950/20 dark:via-slate-950/40 dark:to-slate-950 pt-8 sm:pt-14 pb-16 sm:pb-24 border-b border-slate-200/50 dark:border-slate-800/60">
        
        {/* Ambient Emerald Glass Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-400/20 via-teal-300/15 to-emerald-200/10 dark:from-emerald-600/15 dark:via-teal-600/10 dark:to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Hero Grid: Left Content + Right 3D Showcase */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20 shadow-sm backdrop-blur-md">
                <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Student Accommodations Discovery</span>
              </div>

              {/* Main Heading (Requirement #2) */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12] mb-4">
                Find your perfect stay <span className="gradient-text-emerald">near your college</span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-6">
                Discover verified PGs, hostels, and shared rooms. Filter by budget, meals, curfew, and distance. Connect directly with owners with <span className="font-bold text-slate-900 dark:text-white">zero brokerage fees</span>.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>100% Student Safe</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <ShieldCheck size={15} className="text-emerald-500" />
                  <span>Verified Owners</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <Coins size={15} className="text-amber-500" />
                  <span>Zero Brokerage</span>
                </div>
              </div>
            </div>

            {/* Right: 3D Floating Interactive Visualizer (Desktop Only - Clean on Mobile) */}
            <div className="hidden lg:flex lg:col-span-5 justify-center w-full">
              <Hero3DVisualizer />
            </div>

          </div>

          {/* Main Search Component */}
          <HeroSearch />

          {/* Quick Value Props in 3D Glass Cards */}
          <div className="mt-10 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
            <Tilt3D maxTilt={8} scale={1.03} enableGlare={false}>
              <div className="glass-card card-3d-hover p-4 rounded-2xl flex items-center justify-center gap-2.5 h-full">
                <Coins size={18} className="text-amber-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Zero Brokerage</span>
              </div>
            </Tilt3D>

            <Tilt3D maxTilt={8} scale={1.03} enableGlare={false}>
              <div className="glass-card card-3d-hover p-4 rounded-2xl flex items-center justify-center gap-2.5 h-full">
                <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Verified Owners</span>
              </div>
            </Tilt3D>

            <Tilt3D maxTilt={8} scale={1.03} enableGlare={false}>
              <div className="glass-card card-3d-hover p-4 rounded-2xl flex items-center justify-center gap-2.5 h-full">
                <Utensils size={18} className="text-teal-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Mess Details</span>
              </div>
            </Tilt3D>

            <Tilt3D maxTilt={8} scale={1.03} enableGlare={false}>
              <div className="glass-card card-3d-hover p-4 rounded-2xl flex items-center justify-center gap-2.5 h-full">
                <Wifi size={18} className="text-emerald-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">High-Speed Wi-Fi</span>
              </div>
            </Tilt3D>
          </div>

        </div>
      </section>

      {/* 2. Popular & Recent Student Hubs Section */}
      <section className="py-12 sm:py-16 bg-white/50 dark:bg-slate-950/50 border-b border-slate-200/50 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                Prime Student Localities
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Explore Popular Stays by Hub
              </h2>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
            >
              <span>View all locations</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {popularLocations.slice(0, 4).map((loc) => (
              <Tilt3D key={loc.id} maxTilt={8} scale={1.02} enableGlare={true}>
                <Link
                  href={`/search?q=${encodeURIComponent(loc.name)}&lat=${loc.latitude}&lng=${loc.longitude}`}
                  className="group glass-card card-3d-hover hover:border-emerald-500/40 p-5 rounded-3xl transition-all duration-300 flex flex-col justify-between h-full md:preserve-3d"
                >
                  <div className="md:preserve-3d">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform md:translate-z-20">
                      <MapPin size={20} />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {loc.subtitle || `Student hub in ${loc.city}`}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Explore nearby PGs</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Tilt3D>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Accommodations */}
      <section className="py-12 sm:py-20 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                Handpicked Accommodations
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Top Rated PGs & Hostels Near Campus
              </h2>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
            >
              <span>See all {properties.length} stays</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-12 text-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition active:scale-95"
            >
              <Compass size={18} />
              <span>Browse All PGs & Hostels with Filters</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How Nestora Works */}
      <section className="py-16 sm:py-20 bg-white/70 dark:bg-slate-950/70 border-t border-slate-200/50 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              How Nestora Helps You Find A Stay
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Finding accommodation for college should take minutes, not days of wandering streets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Search Location',
                desc: 'Enter your college name or area (e.g. Kotecha Chowk, Rajkot) or use GPS.',
              },
              {
                step: '02',
                title: 'Select Boys or Girls',
                desc: 'Filter easily for girls PGs, boys hostels, or private student rooms.',
              },
              {
                step: '03',
                title: 'Check Amenities & Food',
                desc: 'Review meal plans, curfew hours, room sharing options & verified badges.',
              },
              {
                step: '04',
                title: 'Contact Owner Free',
                desc: 'Connect via WhatsApp, direct call, or enquiry form with zero broker commission.',
              },
            ].map((item) => (
              <Tilt3D key={item.step} maxTilt={8} scale={1.02} enableGlare={true}>
                <div className="p-6 rounded-3xl glass-card card-3d-hover relative h-full md:preserve-3d">
                  <div className="text-3xl font-black text-emerald-600/40 dark:text-emerald-400/40 mb-3 font-mono md:translate-z-20">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </Tilt3D>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
