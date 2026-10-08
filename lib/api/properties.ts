import { FilterState, Property, College, LocationRef, Enquiry } from '@/types';
import { MOCK_PROPERTIES, MOCK_COLLEGES, POPULAR_LOCATIONS } from './mockData';
import { calculateDistance } from '@/lib/utils/distance';

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  searchedLocation?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

/**
 * Main API function to query properties with filters, geolocation distance, and sorting.
 * Designed to be swapped seamlessly with a real backend REST/GraphQL/Supabase endpoint.
 */
export async function getProperties(filters: FilterState = {}): Promise<PropertySearchResponse> {
  // Simulate standard network latency for realistic UX / skeleton states
  await new Promise((resolve) => setTimeout(resolve, 150));

  let results = [...MOCK_PROPERTIES];

  const searchLat = filters.lat;
  const searchLng = filters.lng;

  // Compute dynamic distance if user searched a location or provided GPS coordinates
  results = results.map((prop) => {
    let distanceKm: number | undefined = undefined;
    if (searchLat && searchLng) {
      distanceKm = calculateDistance(searchLat, searchLng, prop.latitude, prop.longitude);
    } else {
      // Default distance relative to central area (Kotecha Chowk, Rajkot) as baseline
      distanceKm = calculateDistance(22.2905, 70.7818, prop.latitude, prop.longitude);
    }
    return {
      ...prop,
      distanceKm,
    };
  });

  // 1. Text search query (Colleges, Areas, Localities, Names)
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter((prop) => {
      return (
        prop.title.toLowerCase().includes(q) ||
        prop.area.toLowerCase().includes(q) ||
        prop.address.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        (prop.nearbyCollegeName && prop.nearbyCollegeName.toLowerCase().includes(q)) ||
        prop.amenities.some((a) => a.toLowerCase().includes(q))
      );
    });
  }

  // 2. Gender filter
  if (filters.gender && filters.gender !== 'all') {
    results = results.filter((prop) => {
      if (filters.gender === 'boys') return prop.gender === 'boys' || prop.gender === 'co-ed';
      if (filters.gender === 'girls') return prop.gender === 'girls' || prop.gender === 'co-ed';
      return true;
    });
  }

  // 3. Property Type filter (PG, Hostel, Room)
  if (filters.propertyType && filters.propertyType.length > 0) {
    results = results.filter((prop) => filters.propertyType!.includes(prop.type));
  }

  // 4. Budget / Price range filter
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    results = results.filter((prop) => prop.startingRent >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    results = results.filter((prop) => prop.startingRent <= filters.maxPrice!);
  }

  // 5. Distance / Radius filter
  if (filters.maxDistanceKm !== undefined && filters.maxDistanceKm > 0) {
    results = results.filter((prop) => {
      if (prop.distanceKm === undefined) return true;
      return prop.distanceKm <= filters.maxDistanceKm!;
    });
  }

  // 6. Room type / Sharing filter
  if (filters.sharing && filters.sharing.length > 0) {
    results = results.filter((prop) => {
      return prop.rooms.some((r) => filters.sharing!.includes(r.sharing));
    });
  }

  // 7. Amenities filter (Wi-Fi, Food, AC, Laundry, Parking, Study table, Attached bathroom, Power backup, CCTV, Housekeeping)
  if (filters.amenities && filters.amenities.length > 0) {
    results = results.filter((prop) => {
      return filters.amenities!.every((reqAmenity) =>
        prop.amenities.some((a) => a.toLowerCase() === reqAmenity.toLowerCase())
      );
    });
  }

  // 8. Furnished filter
  if (filters.furnishedOnly) {
    results = results.filter((prop) => prop.isFurnished);
  }

  // 9. Available Now filter
  if (filters.availableNowOnly) {
    results = results.filter((prop) => prop.isAvailableNow);
  }

  // 10. Verified property filter
  if (filters.verifiedOnly) {
    results = results.filter((prop) => prop.verified);
  }

  // 11. Sorting
  const sortBy = filters.sortBy || 'relevance';
  results.sort((a, b) => {
    if (sortBy === 'distance') {
      const distA = a.distanceKm ?? 999;
      const distB = b.distanceKm ?? 999;
      return distA - distB;
    }
    if (sortBy === 'price_low_high') {
      return a.startingRent - b.startingRent;
    }
    if (sortBy === 'rating_high_low') {
      return b.rating - a.rating;
    }
    // 'relevance': Verified first, then rating and distance
    if (a.verified !== b.verified) {
      return a.verified ? -1 : 1;
    }
    return (b.rating * 10 - (b.distanceKm ?? 0)) - (a.rating * 10 - (a.distanceKm ?? 0));
  });

  return {
    properties: results,
    total: results.length,
    searchedLocation: {
      name: filters.locationName || filters.query || 'Selected Area',
      latitude: searchLat,
      longitude: searchLng,
    },
  };
}

export async function getPropertyById(id: string): Promise<Property | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const found = MOCK_PROPERTIES.find((p) => p.id === id);
  if (!found) return null;

  // Calculate default baseline distance
  return {
    ...found,
    distanceKm: calculateDistance(22.2905, 70.7818, found.latitude, found.longitude),
  };
}

export async function getPopularLocations(): Promise<LocationRef[]> {
  return POPULAR_LOCATIONS;
}

export async function getColleges(): Promise<College[]> {
  return MOCK_COLLEGES;
}

/**
 * Universal search suggesting colleges, areas, and localities
 */
export async function searchLocations(query: string): Promise<LocationRef[]> {
  if (!query || !query.trim()) {
    return POPULAR_LOCATIONS.slice(0, 5);
  }
  const q = query.toLowerCase().trim();

  const matchedLocations = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.area.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q)
  );

  const matchedColleges = MOCK_COLLEGES.filter(
    (col) =>
      col.name.toLowerCase().includes(q) ||
      col.city.toLowerCase().includes(q) ||
      col.area.toLowerCase().includes(q)
  ).map((col) => ({
    id: `col-${col.id}`,
    name: col.name,
    area: col.area,
    city: col.city,
    latitude: col.latitude,
    longitude: col.longitude,
    type: 'college' as const,
    subtitle: `College location reference in ${col.city}`,
  }));

  const combined = [...matchedLocations, ...matchedColleges];
  // Deduplicate by name
  const seen = new Set<string>();
  return combined.filter((item) => {
    if (seen.has(item.name.toLowerCase())) return false;
    seen.add(item.name.toLowerCase());
    return true;
  });
}

/**
 * Mock enquiry submission with localStorage sync
 */
export async function submitEnquiry(enquiry: Omit<Enquiry, 'id' | 'status' | 'createdAt'>): Promise<Enquiry> {
  const newEnquiry: Enquiry = {
    ...enquiry,
    id: `enq-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('nestora_enquiries') || '[]');
      existing.unshift(newEnquiry);
      localStorage.setItem('nestora_enquiries', JSON.stringify(existing));
    } catch {
      // Fallback
    }
  }

  return newEnquiry;
}
