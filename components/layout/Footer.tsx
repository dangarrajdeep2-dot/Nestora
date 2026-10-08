import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-850">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="Nestora Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Nestora</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find verified PGs, hostels, and student rooms near your college or any searched locality. Zero brokerage, transparent rent, and verified owner connections.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck size={14} />
              <span>100% Student-Verified Stays</span>
            </div>
          </div>

          {/* Popular Student Localities */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Popular Localities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/search?q=Kotecha+Chowk,+Rajkot" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-500" />
                  <span>Kotecha Chowk, Rajkot</span>
                </Link>
              </li>
              <li>
                <Link href="/search?q=Kalawad+Road,+Rajkot" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-500" />
                  <span>Kalawad Road, Rajkot</span>
                </Link>
              </li>
              <li>
                <Link href="/search?q=University+Road,+Rajkot" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-500" />
                  <span>University Road, Rajkot</span>
                </Link>
              </li>
              <li>
                <Link href="/search?q=FC+Road,+Pune" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-500" />
                  <span>FC Road, Pune</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Stays Near Colleges */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Colleges & Campuses
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/search?q=Saurashtra+University" className="hover:text-emerald-400 transition">
                  Near Saurashtra University
                </Link>
              </li>
              <li>
                <Link href="/search?q=RK+University" className="hover:text-emerald-400 transition">
                  Near RK University (RKU)
                </Link>
              </li>
              <li>
                <Link href="/search?q=Marwadi+University" className="hover:text-emerald-400 transition">
                  Near Marwadi University (MU)
                </Link>
              </li>
              <li>
                <Link href="/search?q=Atmiya+University" className="hover:text-emerald-400 transition">
                  Near Atmiya University
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Accommodations */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/search?gender=girls" className="hover:text-emerald-400 transition">
                  Girls PGs & Hostels
                </Link>
              </li>
              <li>
                <Link href="/search?gender=boys" className="hover:text-emerald-400 transition">
                  Boys PGs & Hostels
                </Link>
              </li>
              <li>
                <Link href="/search?type=PG" className="hover:text-emerald-400 transition">
                  Verified PGs with Food
                </Link>
              </li>
              <li>
                <Link href="/search?type=Room" className="hover:text-emerald-400 transition">
                  Independent Student Rooms
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Nestora Inc. Crafted for college students with zero brokerage.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-400 transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-emerald-400 transition">Terms of Service</Link>
            <Link href="/" className="hover:text-emerald-400 transition">Student Safety Tips</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
