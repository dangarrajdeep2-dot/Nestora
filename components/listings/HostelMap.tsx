'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon paths
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const collegeIcon = L.icon({
  ...icon.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
});

interface HostelMapProps {
  hostel: {
    latitude: number;
    longitude: number;
    title: string;
  };
  college: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

export default function HostelMap({ hostel, college }: HostelMapProps) {
  if (!hostel.latitude || !hostel.longitude || !college.latitude || !college.longitude) {
    return <div className="bg-gray-100 p-8 text-center text-gray-600 rounded-lg">Map coordinates unavailable</div>;
  }

  // Calculate center between college and hostel
  const centerLat = (hostel.latitude + college.latitude) / 2;
  const centerLon = (hostel.longitude + college.longitude) / 2;

  // Calculate distance for zoom level approximation (very rough)
  const dLat = Math.abs(hostel.latitude - college.latitude);
  const zoom = dLat > 0.05 ? 12 : 14;

  return (
    <div className="h-64 sm:h-80 w-full rounded-lg overflow-hidden border border-gray-200 z-0">
      <MapContainer 
        center={[centerLat, centerLon]} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[college.latitude, college.longitude]} icon={collegeIcon}>
          <Popup>
            <strong>{college.name}</strong><br/>Campus Location
          </Popup>
        </Marker>
        <Marker position={[hostel.latitude, hostel.longitude]} icon={icon}>
          <Popup>
            <strong>{hostel.title}</strong><br/>Hostel
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
