import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#4B2E83] to-[#20113D] text-white pt-14 pb-24 md:pb-14 rounded-t-[36px] sm:rounded-t-[48px] shadow-2xl mt-16 sm:mt-24 border-t border-white/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="space-y-3.5 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="Nestora Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-heading tracking-wider text-white">Nestora</span>
            </div>
            <p className="text-xs text-[#D9C8F0]/80 leading-relaxed font-medium">
              Find verified PGs, hostels, and student rooms near your college or any searched locality. Zero brokerage, transparent rent, and verified owner connections.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#D9C8F0] font-bold uppercase tracking-[0.06em]">
              <ShieldCheck size={14} className="text-[#D9C8F0]" />
              <span>100% Student-Verified Stays</span>
            </div>
          </div>

          {/* Popular Student Localities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[#D9C8F0] mb-4">
              Popular Localities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/search?q=Kotecha+Chowk,+Rajkot" className="hover:text-[#D9C8F0] text-white/80 transition flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#D9C8F0]" />
                  <span>Kotecha Chowk, Rajkot</span>
                </Link>
              </li>
              <li>
                <Link href="/search?q=Kalawad+Road,+Rajkot" className="hover:text-[#D9C8F0] text-white/80 transition flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#D9C8F0]" />
                  <span>Kalawad Road, Rajkot</span>
                </Link>
              </li>
              <li>
                <Link href="/search?q=University+Road,+Rajkot" className="hover:text-[#D9C8F0] text-white/80 transition flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#D9C8F0]" />
                  <span>University Road, Rajkot</span>
                </Link>
              </li>
              <li>
                <Link href="/search?q=FC+Road,+Pune" className="hover:text-[#D9C8F0] text-white/80 transition flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#D9C8F0]" />
                  <span>FC Road, Pune</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Stays Near Colleges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[#D9C8F0] mb-4">
              Colleges & Campuses
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/search?q=Saurashtra+University" className="hover:text-[#D9C8F0] text-white/80 transition">
                  Near Saurashtra University
                </Link>
              </li>
              <li>
                <Link href="/search?q=RK+University" className="hover:text-[#D9C8F0] text-white/80 transition">
                  Near RK University (RKU)
                </Link>
              </li>
              <li>
                <Link href="/search?q=Marwadi+University" className="hover:text-[#D9C8F0] text-white/80 transition">
                  Near Marwadi University (MU)
                </Link>
              </li>
              <li>
                <Link href="/search?q=Atmiya+University" className="hover:text-[#D9C8F0] text-white/80 transition">
                  Near Atmiya University
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Accommodations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[#D9C8F0] mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/search?gender=girls" className="hover:text-[#D9C8F0] text-white/80 transition">
                  Girls PGs & Hostels
                </Link>
              </li>
              <li>
                <Link href="/search?gender=boys" className="hover:text-[#D9C8F0] text-white/80 transition">
                  Boys PGs & Hostels
                </Link>
              </li>
              <li>
                <Link href="/search?type=PG" className="hover:text-[#D9C8F0] text-white/80 transition">
                  Verified PGs with Food
                </Link>
              </li>
              <li>
                <Link href="/search?type=Room" className="hover:text-[#D9C8F0] text-white/80 transition">
                  Independent Student Rooms
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D9C8F0]/70 gap-3">
          <p>© {new Date().getFullYear()} Nestora Inc. Crafted for college students with zero brokerage.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/" className="hover:text-white transition">Student Safety Tips</Link>
            <Link href="/admin/login" className="hover:text-white transition text-[#D9C8F0]/50 hover:underline">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
