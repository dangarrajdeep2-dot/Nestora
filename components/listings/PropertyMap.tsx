'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  searchedLocation?: {
    name?: string;
    latitude?: number;
    longitude?: number;
  };
  selectedPropertyId?: string | null;
  onSelectProperty?: (id: string) => void;
}

export default function PropertyMap({
  properties,
  searchedLocation,
  selectedPropertyId,
  onSelectProperty,
}: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);
  const [LeafletComponents, setLeafletComponents] = useState<any>(null);

  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([reactLeaflet, leaflet]) => {
      if (!isCancelled) {
        delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        setLeafletComponents({
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          Marker: reactLeaflet.Marker,
          Popup: reactLeaflet.Popup,
          L: leaflet.default,
        });
        setMounted(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!mounted || !LeafletComponents) {
    return (
      <div className="w-full h-full min-h-[350px] bg-slate-100 dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-400 animate-pulse border border-slate-200 dark:border-slate-800">
        <MapPin size={32} className="mb-2 text-emerald-500 animate-bounce" />
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Loading interactive map...</span>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, L } = LeafletComponents;

  // Center calculation
  let centerLat = 22.2905;
  let centerLng = 70.7818;

  if (searchedLocation?.latitude && searchedLocation?.longitude) {
    centerLat = searchedLocation.latitude;
    centerLng = searchedLocation.longitude;
  } else if (properties.length > 0) {
    centerLat = properties[0].latitude;
    centerLng = properties[0].longitude;
  }

  // Create custom emerald price badges for markers
  const createPriceIcon = (rent: number, isSelected: boolean, gender: string) => {
    const formattedK = `₹${(rent / 1000).toFixed(1)}k`;
    const bgColor = isSelected 
      ? '#047857' // deep emerald
      : gender === 'girls' 
      ? '#f43f5e' 
      : '#059669'; // emerald

    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background-color: ${bgColor};
          color: white;
          font-weight: 800;
          font-size: 11px;
          padding: 4px 9px;
          border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          border: 2px solid white;
          white-space: nowrap;
          transform: translate(-50%, -50%);
          cursor: pointer;
        ">
          ${formattedK}
        </div>
      `,
      iconSize: [42, 22],
      iconAnchor: [21, 11],
    });
  };

  const centerIcon = L.divIcon({
    className: 'custom-center-pin',
    html: `
      <div style="
        background-color: #10b981;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.35);
        border: 2px solid white;
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <div className="w-full h-full min-h-[350px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full min-h-[400px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Searched Target Location Marker */}
        {searchedLocation?.latitude && searchedLocation?.longitude && (
          <Marker
            position={[searchedLocation.latitude, searchedLocation.longitude]}
            icon={centerIcon}
          >
            <Popup>
              <div className="text-xs p-1 font-sans">
                <strong className="text-emerald-600 block text-sm">Target Search Location</strong>
                <span>{searchedLocation.name || 'Selected Point'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Accommodation Pins */}
        {properties.map((prop) => {
          const isSelected = selectedPropertyId === prop.id;
          return (
            <Marker
              key={prop.id}
              position={[prop.latitude, prop.longitude]}
              icon={createPriceIcon(prop.startingRent, isSelected, prop.gender)}
              eventHandlers={{
                click: () => onSelectProperty?.(prop.id),
              }}
            >
              <Popup>
                <div className="w-48 font-sans p-1 text-left">
                  <div className="relative h-24 w-full rounded-lg overflow-hidden mb-2 bg-slate-100">
                    <Image
                      src={prop.images[0]}
                      alt={prop.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-bold capitalize">
                      {prop.gender}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1 mb-0.5">
                    {prop.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-1.5 flex items-center">
                    <MapPin size={10} className="mr-0.5 shrink-0 text-emerald-600" />
                    {prop.area}
                  </p>
                  <div className="flex items-center justify-between border-t pt-1.5">
                    <span className="font-extrabold text-emerald-600 text-xs">
                      {formatCurrency(prop.startingRent)}/mo
                    </span>
                    <Link
                      href={`/property/${prop.id}`}
                      className="text-[10px] bg-emerald-600 text-white px-2.5 py-1 rounded-md font-bold hover:bg-emerald-700 transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
