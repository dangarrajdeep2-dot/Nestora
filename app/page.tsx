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
import { getPopularLocations, getProperties } from '@/lib/api/properties';
import { HomeAuthPrompt } from '@/components/home/HomeAuthPrompt';

export const revalidate = 60; // Refresh data periodically

export default async function HomePage() {
  const popularLocations = await getPopularLocations();
  const { properties } = await getProperties();

  // Top featured properties
  const featuredProperties = properties.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <HomeAuthPrompt />
      
      {/* 1. Hero Section with Soft Pastel Lavender Ambience */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-24">
        
        {/* Soft Lavender Background Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-[#D9C8F0]/35 via-[#E6DAF5]/25 to-transparent dark:from-[#7B5EA7]/15 dark:via-[#4B2E83]/10 dark:to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Hero Grid: Left Content + Right 3D Showcase */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D9C8F0]/50 dark:bg-[#7B5EA7]/20 text-[#4B2E83] dark:text-[#D9C8F0] text-xs font-bold uppercase tracking-[0.08em] mb-4 border border-[#7B5EA7]/20 shadow-sm backdrop-blur-md">
                <Sparkles size={14} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
                <span>Student Accommodations Discovery</span>
              </div>

              {/* Main Heading: Space Grotesk, first part in --primary, rest in --ink */}
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl tracking-tight text-[#1B1530] dark:text-[#F3EDFB] leading-[1.08] mb-5 font-bold">
                <span className="text-[#7B5EA7] dark:text-[#9D7FD3]">Find your perfect stay</span> near your college
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-[#6B6580] dark:text-[#A89EC0] max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-6 font-medium">
                Discover verified PGs, hostels, and shared rooms. Filter by budget, meals, curfew, and distance. Connect directly with owners with <span className="font-bold text-[#1B1530] dark:text-[#F3EDFB]">zero brokerage fees</span>.
              </p>

              {/* Trust Badges: Soft Lilac Glass Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs font-bold uppercase tracking-[0.06em] text-[#4B2E83] dark:text-[#D9C8F0]">
                <div className="flex items-center gap-2 bg-white/70 dark:bg-[#1C142E]/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 dark:border-white/10 shadow-sm">
                  <CheckCircle2 size={15} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
                  <span>100% Student Safe</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 dark:bg-[#1C142E]/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 dark:border-white/10 shadow-sm">
                  <ShieldCheck size={15} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
                  <span>Verified Owners</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 dark:bg-[#1C142E]/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 dark:border-white/10 shadow-sm">
                  <Coins size={15} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
                  <span>Zero Brokerage</span>
                </div>
              </div>
            </div>

            {/* Right: 3D Floating Interactive Visualizer */}
            <div className="hidden lg:flex lg:col-span-5 justify-center w-full">
              <Hero3DVisualizer />
            </div>

          </div>

          {/* Main Search Component */}
          <HeroSearch />

          {/* Quick Value Props in Translucent Glass Cards with Soft Lilac Icons */}
          <div className="mt-12 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 text-center">
            <div className="glass-card p-4.5 rounded-[24px] flex items-center justify-center gap-3 h-full transition-all duration-300">
              <div className="icon-circle-lilac">
                <Coins size={17} />
              </div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.06em] text-[#1B1530] dark:text-[#F3EDFB]">Zero Brokerage</span>
            </div>

            <div className="glass-card p-4.5 rounded-[24px] flex items-center justify-center gap-3 h-full transition-all duration-300">
              <div className="icon-circle-lilac">
                <ShieldCheck size={17} />
              </div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.06em] text-[#1B1530] dark:text-[#F3EDFB]">Verified Owners</span>
            </div>

            <div className="glass-card p-4.5 rounded-[24px] flex items-center justify-center gap-3 h-full transition-all duration-300">
              <div className="icon-circle-lilac">
                <Utensils size={17} />
              </div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.06em] text-[#1B1530] dark:text-[#F3EDFB]">Mess Details</span>
            </div>

            <div className="glass-card p-4.5 rounded-[24px] flex items-center justify-center gap-3 h-full transition-all duration-300">
              <div className="icon-circle-lilac">
                <Wifi size={17} />
              </div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.06em] text-[#1B1530] dark:text-[#F3EDFB]">High-Speed Wi-Fi</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Popular & Recent Student Hubs Section */}
      <section className="py-14 sm:py-20 border-t border-white/60 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] mb-1">
                Prime Student Localities
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1B1530] dark:text-white">
                <span className="text-[#7B5EA7] dark:text-[#9D7FD3]">Explore Popular Stays</span> by Hub
              </h2>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] hover:text-[#4B2E83] dark:hover:text-white transition group py-1"
            >
              <span>View all locations</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {popularLocations.slice(0, 4).map((loc) => (
              <Link
                key={loc.id}
                href={`/search?q=${encodeURIComponent(loc.name)}&lat=${loc.latitude}&lng=${loc.longitude}`}
                className="group glass-card p-6 rounded-[24px] transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div>
                  <div className="w-11 h-11 rounded-full bg-[#D9C8F0]/50 dark:bg-[#7B5EA7]/25 text-[#4B2E83] dark:text-[#D9C8F0] flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 group-hover:bg-[#7B5EA7] group-hover:text-white transition-all duration-300">
                    <MapPin size={20} />
                  </div>
                  <h3 className="font-bold text-[#1B1530] dark:text-white text-base group-hover:text-[#7B5EA7] dark:group-hover:text-[#D9C8F0] transition-colors mb-1">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-[#6B6580] dark:text-[#A89EC0] line-clamp-2">
                    {loc.subtitle || `Student hub in ${loc.city}`}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-[0.06em] text-[#7B5EA7] dark:text-[#D9C8F0]">
                  <span>Explore nearby</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Accommodations */}
      <section className="py-14 sm:py-20 border-t border-white/60 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] mb-1">
                Handpicked Accommodations
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1B1530] dark:text-white">
                <span className="text-[#7B5EA7] dark:text-[#9D7FD3]">Top Rated PGs & Hostels</span> Near Campus
              </h2>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] hover:text-[#4B2E83] dark:hover:text-white transition group py-1"
            >
              <span>See all {properties.length} stays</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>

          {/* CTA Banner: Pill Button with Trailing Arrow */}
          <div className="mt-14 text-center">
            <Link
              href="/search"
              className="btn-primary-pill text-xs sm:text-sm px-9 py-4 inline-flex items-center gap-2.5 shadow-xl shadow-[#7B5EA7]/25"
            >
              <Compass size={18} />
              <span>Browse All PGs & Hostels with Filters</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How Nestora Works */}
      <section className="py-16 sm:py-24 border-t border-white/60 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] mb-1">
              Easy 4-Step Process
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1B1530] dark:text-white mb-3">
              <span className="text-[#7B5EA7] dark:text-[#9D7FD3]">How Nestora Helps You</span> Find A Stay
            </h2>
            <p className="text-sm text-[#6B6580] dark:text-[#A89EC0] font-medium">
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
              <div
                key={item.step}
                className="p-7 rounded-[24px] glass-card transition-all duration-300 relative h-full flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl font-heading text-[#7B5EA7]/40 dark:text-[#D9C8F0]/40 mb-3 tracking-wider">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-[#1B1530] dark:text-white text-base mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#6B6580] dark:text-[#A89EC0] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
