/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterState, Property, College, LocationRef, Enquiry } from '@/types';
import { MOCK_PROPERTIES, MOCK_COLLEGES, POPULAR_LOCATIONS } from './mockData';
import { calculateDistance } from '@/lib/utils/distance';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  searchedLocation?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

interface SupabasePropertyRow {
  id: string;
  title: string;
  type: 'PG' | 'Hostel' | 'Room';
  gender: 'boys' | 'girls' | 'co-ed';
  tagline: string | null;
  description: string | null;
  address: string;
  area: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  nearby_college_id: string | null;
  colleges?: { name: string };
  verification: 'verified' | 'unverified' | 'demo';
  starting_rent: number;
  deposit: number;
  is_furnished: boolean;
  is_available_now: boolean;
  notice_period_days: number | null;
  gate_closing_time: string | null;
  created_at: string;
  updated_at: string;
  owners?: {
    id: string;
    name: string;
    role: string;
    phone: string;
    whatsapp: string;
    response_rate: string;
    is_verified: boolean;
    avatar_url: string;
  };
  rooms?: Array<{
    id: string;
    property_id: string;
    room_type: string;
    sharing: string;
    rent: number;
    deposit: number;
    available_beds: number;
    total_beds: number;
    is_available: boolean;
  }>;
  property_amenities?: Array<{ amenity_name: string }>;
  food_details?: Array<{
    included: boolean;
    food_type: string;
    meals: string[];
    description: string;
    timing: string;
  }>;
  house_rules?: Array<{ rule: string }>;
  property_images?: Array<{ image_url: string; display_order: number }>;
  reviews?: Array<{
    id: string;
    property_id: string;
    author_name: string;
    college: string;
    course: string;
    rating: number;
    comment: string;
    date: string;
    verified_stay: boolean;
  }>;
}

let cachedProperties: Property[] | null = null;
let lastFetch = 0;

async function fetchAllProperties(): Promise<Property[]> {
  if (!isSupabaseConfigured) {
    return MOCK_PROPERTIES;
  }
  
  if (cachedProperties && Date.now() - lastFetch < 60000) {
    return cachedProperties;
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        colleges(*),
        owners(*),
        rooms(*),
        property_amenities(*),
        food_details(*),
        house_rules(*),
        property_images(*),
        reviews(*)
      `);

    if (error) {
      console.warn('⚠️ SHOWING MOCK DATA: Supabase query failed.', error.message);
      return MOCK_PROPERTIES;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ SHOWING MOCK DATA: Supabase returned no properties.');
      return MOCK_PROPERTIES;
    }

    const mappedProperties: Property[] = data.map((row: any) => {
      // Map rooms
      const mappedRooms = (row.rooms || []).map((r: any) => ({
        id: r.id,
        propertyId: r.property_id,
        roomType: r.room_type,
        sharing: r.sharing,
        rent: r.rent,
        deposit: r.deposit,
        availableBeds: r.available_beds,
        totalBeds: r.total_beds,
        features: r.features || [],
        isAvailable: r.is_available,
      }));

      // Map amenities
      const amenities = (row.property_amenities || []).map((a: any) => a.amenity_name);

      // Map food details
      const food = row.food_details?.[0] || {};
      const foodDetails = {
        included: food.included || false,
        type: food.food_type || 'Self Cooking / Optional Mess',
        meals: food.meals || [],
        description: food.description || '',
        timing: food.timing || '',
      };

      // Map owner
      const ownerData = row.owners || {};
      const owner = {
        id: ownerData.id || 'owner-unknown',
        name: ownerData.name || 'Property Manager',
        role: ownerData.role || 'Owner',
        phone: ownerData.phone || 'N/A',
        whatsapp: ownerData.whatsapp || 'N/A',
        responseRate: ownerData.response_rate || 'Replies soon',
        isVerified: ownerData.is_verified || false,
        avatarUrl: ownerData.avatar_url || undefined,
      };

      // Map reviews
      const reviews = (row.reviews || []).map((rev: any) => ({
        id: rev.id,
        propertyId: rev.property_id,
        authorName: rev.author_name,
        college: rev.college,
        course: rev.course,
        rating: rev.rating,
        date: rev.date ? new Date(rev.date).toLocaleDateString() : 'Recently',
        comment: rev.comment,
        verifiedStay: rev.verified_stay,
        helpfulCount: rev.helpful_count,
      }));

      // Fallback for rating/reviews if missing in db
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
        : (row.verification === 'demo' ? 4.5 : 4.0);

      // Images
      const images = (row.property_images || []).sort((a: any, b: any) => a.display_order - b.display_order).map((i: any) => i.image_url);
      const fallbackImages = [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
      ];

      return {
        id: row.id,
        title: row.title,
        type: row.type,
        gender: row.gender,
        tagline: row.tagline || '',
        description: row.description || '',
        address: row.address,
        area: row.area,
        city: row.city,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        nearbyCollegeId: row.nearby_college_id,
        nearbyCollegeName: row.colleges?.name,
        distanceKm: undefined,
        verified: row.verification === 'verified',
        rating: Number(avgRating.toFixed(1)),
        reviewCount: reviews.length > 0 ? reviews.length : 12,
        startingRent: row.starting_rent,
        deposit: row.deposit,
        images: images.length > 0 ? images : fallbackImages,
        rooms: mappedRooms,
        amenities: amenities,
        isFurnished: row.is_furnished,
        isAvailableNow: row.is_available_now,
        foodDetails,
        houseRules: (row.house_rules || []).map((hr: any) => hr.rule),
        owner,
        reviews,
        noticePeriodDays: row.notice_period_days,
        gateClosingTime: row.gate_closing_time,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    cachedProperties = mappedProperties;
    lastFetch = Date.now();
    return mappedProperties;
  } catch (err) {
    console.error('Error in fetchAllProperties:', err);
    return MOCK_PROPERTIES;
  }
}

/**
 * Main API function to query properties with filters, geolocation distance, and sorting.
 */
export async function getProperties(filters: FilterState = {}): Promise<PropertySearchResponse> {
  let results = await fetchAllProperties();

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
        prop.amenities.some((a: any) => a.toLowerCase().includes(q))
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
      return prop.rooms.some((r: any) => filters.sharing!.includes(r.sharing));
    });
  }

  // 7. Amenities filter
  if (filters.amenities && filters.amenities.length > 0) {
    results = results.filter((prop) => {
      return filters.amenities!.every((reqAmenity) =>
        prop.amenities.some((a: any) => a.toLowerCase() === reqAmenity.toLowerCase())
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
  results.sort((a: any, b: any) => {
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
  const allProps = await fetchAllProperties();
  const found = allProps.find((p) => p.id === id);
  if (!found) return null;

  return {
    ...found,
    distanceKm: calculateDistance(22.2905, 70.7818, found.latitude, found.longitude),
  };
}

export async function getPopularLocations(): Promise<LocationRef[]> {
  return POPULAR_LOCATIONS;
}

export async function getColleges(): Promise<College[]> {
  if (!isSupabaseConfigured) return MOCK_COLLEGES;
  
  try {
    const { data, error } = await supabase.from('colleges').select('*');
    if (error || !data || data.length === 0) {
      console.warn('⚠️ SHOWING MOCK DATA (Colleges):', error?.message || 'No records found.');
      return MOCK_COLLEGES;
    }
    
    return data.map(c => ({
      id: c.id,
      name: c.name,
      city: c.city,
      area: c.area,
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
      shortName: c.short_name,
      popularLandmark: c.popular_landmark
    }));
  } catch(e) {
    console.error('Error fetching colleges:', e);
    return MOCK_COLLEGES;
  }
}

/**
 * Universal search suggesting colleges, areas, and localities
 */
export async function searchLocations(query: string): Promise<LocationRef[]> {
  const activeColleges = await getColleges();

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

  const matchedColleges = activeColleges.filter(
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
 * Mock enquiry submission with localStorage sync, and Supabase if available
 */
export async function submitEnquiry(enquiry: Omit<Enquiry, 'id' | 'status' | 'createdAt'>): Promise<Enquiry> {
  const newEnquiry: Enquiry = {
    ...enquiry,
    id: `enq-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    const { error } = await supabase.from('enquiries').insert({
      property_id: enquiry.propertyId,
      property_name: enquiry.propertyName,
      student_name: enquiry.studentName,
      student_phone: enquiry.studentPhone,
      gender: enquiry.gender,
      move_in_date: enquiry.moveInDate || null,
      sharing_preference: enquiry.sharingPreference,
      status: 'pending'
    });
    
    if (error) {
      console.error('Failed to submit enquiry to Supabase:', error);
      throw new Error(error.message); // Throw to abort localStorage fallback and alert UI
    }
  }

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
