export type PropertyType = 'PG' | 'Hostel' | 'Room' | 'PG AND Hostel';
export type GenderTarget = 'boys' | 'girls' | 'co-ed' | 'boys_and_girls';
export type SharingType = 'single' | '2-sharing' | '3-sharing' | '4-plus-sharing';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  college?: string;
  avatarUrl?: string;
  savedPropertyIds: string[];
}

export interface AmenityItem {
  id: string;
  name: string;
  iconName: string;
  category: 'essential' | 'comfort' | 'safety' | 'service';
}

export interface Owner {
  id: string;
  name: string;
  role: 'Owner' | 'Warden' | 'Caretaker' | 'Property Manager';
  phone: string;
  whatsapp: string;
  responseRate?: string;
  isVerified: boolean;
  avatarUrl?: string;
}

export interface Room {
  id: string;
  propertyId: string;
  roomType: string; // e.g. "Single Sharing AC", "2 Sharing Non-AC", "3 Sharing Deluxe"
  sharing: SharingType;
  rent: number;
  deposit: number;
  availableBeds: number;
  totalBeds: number;
  features: string[]; // e.g. ["Attached Washroom", "Study Table", "Balcony", "Wardrobe"]
  isAvailable: boolean;
}

export interface FoodDetails {
  included: boolean;
  type: 'Pure Veg' | 'Veg & Non-Veg' | 'Jain Food Available' | 'Self Cooking / Optional Mess';
  meals: ('Breakfast' | 'Lunch' | 'Dinner' | 'Evening Tea')[];
  description?: string;
  timing?: string;
}

export interface Review {
  id: string;
  propertyId: string;
  authorName: string;
  college: string;
  course?: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  verifiedStay: boolean;
  helpfulCount?: number;
}

export interface LocationRef {
  id: string;
  name: string; // e.g., "Kotecha Chowk, Rajkot"
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  type: 'area' | 'locality' | 'landmark' | 'college' | 'gps';
  subtitle?: string;
}

export interface College {
  id: string;
  name: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  shortName?: string;
  popularLandmark?: string;
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  gender: GenderTarget;
  tagline?: string;
  description: string;
  address: string;
  area: string; // e.g. "Kotecha Chowk"
  city: string; // e.g. "Rajkot"
  latitude: number;
  longitude: number;
  nearbyCollegeId?: string;
  nearbyCollegeName?: string;
  distanceKm?: number; // Calculated dynamically relative to search location
  verified: boolean;
  rating: number;
  reviewCount: number;
  startingRent: number;
  deposit: number;
  images: string[];
  rooms: Room[];
  amenities: string[]; // e.g. ["Wi-Fi", "Food", "AC", "Laundry", "Parking", ...]
  isFurnished: boolean;
  isAvailableNow: boolean;
  foodDetails: FoodDetails;
  houseRules: string[];
  owner: Owner;
  reviews?: Review[];
  noticePeriodDays?: number;
  gateClosingTime?: string;
  googleMapUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Favorite {
  propertyId: string;
  savedAt: string;
}

export interface Enquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  studentName: string;
  studentPhone: string;
  studentCollege: string;
  gender: 'boys' | 'girls';
  moveInDate: string;
  sharingPreference: string;
  message?: string;
  status: 'pending' | 'contacted';
  createdAt: string;
}

export interface FilterState {
  query?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
  gender?: 'boys' | 'girls' | 'all';
  propertyType?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  maxDistanceKm?: number;
  sharing?: SharingType[];
  amenities?: string[];
  furnishedOnly?: boolean;
  availableNowOnly?: boolean;
  verifiedOnly?: boolean;
  sortBy?: 'relevance' | 'distance' | 'price_low_high' | 'rating_high_low';
}

// Backward-compatibility aliases for existing components
export type Listing = Property;
export type ListingImage = {
  id: string;
  listing_id: string;
  image_url: string;
  created_at: string;
};
