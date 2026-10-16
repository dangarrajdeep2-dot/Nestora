'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Plus, 
  Trash2, 
  Check, 
  Utensils, 
  ShieldCheck, 
  Phone, 
  Image as ImageIcon, 
  ArrowLeft,
  Sparkles,
  Info,
  DollarSign,
  UploadCloud,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { createProperty, updatePropertyDetails, uploadPropertyImage } from '@/lib/actions/admin';
import { SafeImage, isValidImageUrl, isUnsupportedShareUrl } from '@/components/ui/SafeImage';

const CITIES = ['Rajkot', 'Ahmedabad', 'Surat', 'Vadodara'] as const;

const CITY_AREAS: Record<string, string[]> = {
  Rajkot: [
    'Kotecha Chowk',
    'Kalawad Road',
    'University Road',
    '150 Feet Ring Road',
    'Raiya Road',
    'Tagore Road',
    'Nana Mava',
    'Tramba',
    'Gauridad',
    'Mavdi',
  ],
  Ahmedabad: [
    'Navrangpura',
    'Vastrapur',
    'Satellite',
    'Bodakdev',
    'Naranpura',
    'Paldi',
    'Chandkheda',
    'Gota',
    'Thaltej',
  ],
  Surat: [
    'Vesu',
    'Piplod',
    'Ghod Dod Road',
    'Adajan',
    'Athwalines',
    'Pal',
    'Varachha',
  ],
  Vadodara: [
    'Fatehgunj',
    'Sayajigunj',
    'Alkapuri',
    'Waghodia Road',
    'Manjalpur',
    'Karelibaug',
    'Gotri',
  ],
};

const STANDARD_AMENITIES = [
  'Wi-Fi',
  'Food',
  'AC',
  'Laundry',
  'Study table',
  'Attached bathroom',
  'Power backup',
  'CCTV',
  'Housekeeping',
  'Parking',
  'RO Water',
  'Refrigirator / Fridge',
  'Geyser / Hot Water',
  'Gym',
];

const STANDARD_RULES = [
  'Gate closes at 10:00 PM sharp',
  'Strictly vegetarian premises',
  'Non-resident guests not allowed in rooms',
  'Quiet study hours after 10:30 PM',
  'Valid student college ID card required at move-in',
  'Smoking and alcohol strictly prohibited',
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
];

interface CollegeOption {
  id: string;
  name: string;
  city: string;
  area: string;
  short_name?: string;
}

interface RoomState {
  id?: string;
  room_type: string;
  sharing: 'single' | '2-sharing' | '3-sharing' | '4-plus-sharing';
  rent: number;
  deposit: number;
  available_beds: number;
  total_beds: number;
  is_available: boolean;
  features: string[];
}

interface PropertyFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProperty?: Record<string, any>;
  colleges?: CollegeOption[];
  mode: 'create' | 'edit';
}

export default function PropertyForm({
  initialProperty,
  colleges = [],
  mode,
}: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Basic Info
  const [title, setTitle] = useState(initialProperty?.title || '');
  const [type, setType] = useState<'PG' | 'Hostel' | 'Room'>(initialProperty?.type || 'PG');
  const [gender, setGender] = useState<'boys' | 'girls'>(initialProperty?.gender === 'girls' ? 'girls' : 'boys');
  const [verification, setVerification] = useState<'verified' | 'unverified'>(
    initialProperty?.verification === 'verified' ? 'verified' : 'unverified'
  );
  const [isFurnished, setIsFurnished] = useState<boolean>(initialProperty?.is_furnished ?? false);
  const [isAvailableNow, setIsAvailableNow] = useState<boolean>(initialProperty?.is_available_now ?? true);

  // 2. Location
  const [city, setCity] = useState<string>(initialProperty?.city || 'Rajkot');
  const knownAreas = CITY_AREAS[city] || [];
  const initialAreaIsCustom = initialProperty?.area && !knownAreas.includes(initialProperty.area);
  const [areaSelect, setAreaSelect] = useState<string>(
    initialAreaIsCustom ? '__other__' : (initialProperty?.area || knownAreas[0] || 'Kotecha Chowk')
  );
  const [customArea, setCustomArea] = useState<string>(initialAreaIsCustom ? (initialProperty?.area || '') : '');
  const [address, setAddress] = useState(initialProperty?.address || '');
  const [nearbyCollegeId, setNearbyCollegeId] = useState<string>(initialProperty?.nearby_college_id || '');
  const [tagline, setTagline] = useState(initialProperty?.tagline || '');
  const [googleMapUrl, setGoogleMapUrl] = useState<string>(initialProperty?.source_url || initialProperty?.googleMapUrl || '');
  const [latitude, setLatitude] = useState<string>(initialProperty?.latitude ? String(initialProperty.latitude) : '');
  const [longitude, setLongitude] = useState<string>(initialProperty?.longitude ? String(initialProperty.longitude) : '');

  const handleGoogleMapUrlChange = (value: string) => {
    let clean = value.trim();

    // 1. If <iframe> embed code was pasted, extract the src URL
    const iframeMatch = clean.match(/src=["'](https:\/\/[^"']+)["']/i);
    if (iframeMatch) {
      clean = iframeMatch[1];
    }

    setGoogleMapUrl(clean);

    // 2. Try to auto-extract latitude and longitude from URL
    const coordMatch = clean.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                       clean.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      setLatitude(coordMatch[1]);
      setLongitude(coordMatch[2]);
    }
  };

  // 3. Pricing & Policies
  const [startingRent, setStartingRent] = useState<string>(
    initialProperty?.starting_rent !== undefined ? String(initialProperty.starting_rent) : ''
  );
  const [deposit, setDeposit] = useState<string>(
    initialProperty?.deposit !== undefined ? String(initialProperty.deposit) : ''
  );
  const [gateClosingTime, setGateClosingTime] = useState(initialProperty?.gate_closing_time || '10:00 PM');
  const [noticePeriodDays, setNoticePeriodDays] = useState<string>(
    initialProperty?.notice_period_days !== undefined ? String(initialProperty.notice_period_days) : '30'
  );
  const [description, setDescription] = useState(initialProperty?.description || '');

  // 4. Rooms
  const initialRooms: RoomState[] = Array.isArray(initialProperty?.rooms) && initialProperty.rooms.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? initialProperty.rooms.map((r: any) => ({
        id: r.id,
        room_type: r.room_type || '2 Sharing Comfort',
        sharing: r.sharing || '2-sharing',
        rent: Number(r.rent) || 5000,
        deposit: Number(r.deposit) || 5000,
        available_beds: Number(r.available_beds) || 2,
        total_beds: Number(r.total_beds) || 4,
        is_available: r.is_available !== false,
        features: Array.isArray(r.features) ? r.features : ['Attached Washroom', 'AC', 'Study Table'],
      }))
    : [
        {
          room_type: '2 Sharing Comfort',
          sharing: '2-sharing',
          rent: 6500,
          deposit: 6500,
          available_beds: 2,
          total_beds: 4,
          is_available: true,
          features: ['Attached Washroom', 'AC', 'Study Table'],
        },
      ];
  const [rooms, setRooms] = useState<RoomState[]>(initialRooms);

  // 5. Amenities
  const initialAmenities: string[] = Array.isArray(initialProperty?.property_amenities)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? initialProperty.property_amenities.map((a: any) => a.amenity_name)
    : (Array.isArray(initialProperty?.amenities) ? initialProperty.amenities : ['Wi-Fi', 'Food', 'Attached bathroom', 'RO Water']);
  const [amenities, setAmenities] = useState<string[]>(initialAmenities);

  // 6. Food Details
  const initialFood = Array.isArray(initialProperty?.food_details)
    ? initialProperty.food_details[0]
    : initialProperty?.food_details;
  const [foodIncluded, setFoodIncluded] = useState<boolean>(initialFood?.included ?? true);
  const [foodType, setFoodType] = useState<string>(initialFood?.food_type || 'Pure Veg');
  const [foodMeals, setFoodMeals] = useState<string[]>(
    Array.isArray(initialFood?.meals) ? initialFood.meals : ['Breakfast', 'Lunch', 'Dinner']
  );
  const [foodTiming, setFoodTiming] = useState<string>(
    initialFood?.timing || 'Breakfast: 7:30 - 9:30 AM | Dinner: 7:45 - 10:00 PM'
  );
  const [foodDescription, setFoodDescription] = useState<string>(
    initialFood?.description || 'Freshly cooked nutritious vegetarian student meals with unlimited breakfast and dinner.'
  );

  // 7. House Rules
  const initialRules: string[] = Array.isArray(initialProperty?.house_rules)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? initialProperty.house_rules.map((r: any) => r.rule)
    : [
        'Gate closes at 10:00 PM sharp',
        'Strictly vegetarian premises',
        'Non-resident guests not allowed in rooms',
        'Quiet study hours after 10:30 PM',
      ];
  const [selectedRules, setSelectedRules] = useState<string[]>(
    initialRules.filter(r => STANDARD_RULES.includes(r))
  );
  const [customRules, setCustomRules] = useState<string[]>(
    initialRules.filter(r => !STANDARD_RULES.includes(r))
  );
  const [newCustomRule, setNewCustomRule] = useState('');

  // 8. Owner
  const initialOwner = initialProperty?.owners || {};
  const [ownerName, setOwnerName] = useState(initialOwner.name || '');
  const [ownerRole, setOwnerRole] = useState(initialOwner.role || 'Owner');
  const [ownerPhone, setOwnerPhone] = useState(initialOwner.phone || '');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState(initialOwner.whatsapp || initialOwner.phone || '');

  // 9. Images (URLs)
  const initialImages: string[] = Array.isArray(initialProperty?.property_images) && initialProperty.property_images.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? initialProperty.property_images.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)).map((i: any) => i.image_url)
    : (Array.isArray(initialProperty?.images) ? initialProperty.images : SAMPLE_IMAGES.slice(0, 2));
  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [activeImageTab, setActiveImageTab] = useState<'upload' | 'url'>('upload');

  // Handlers
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const newAreas = CITY_AREAS[newCity] || [];
    setAreaSelect(newAreas[0] || '__other__');
    setCustomArea('');
    // Clear nearby college if it belongs to another city
    setNearbyCollegeId('');
  };

  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      {
        room_type: `${rooms.length + 1} Sharing Room`,
        sharing: '2-sharing',
        rent: 5500,
        deposit: 5500,
        available_beds: 1,
        total_beds: 2,
        is_available: true,
        features: ['Attached Washroom', 'Study Table'],
      },
    ]);
  };

  const handleRemoveRoom = (index: number) => {
    if (rooms.length <= 1) {
      alert('At least one room configuration is required.');
      return;
    }
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleRoomChange = (index: number, field: keyof RoomState, value: unknown) => {
    const updated = [...rooms];
    updated[index] = { ...updated[index], [field]: value };
    setRooms(updated);
  };

  const handleToggleAmenity = (name: string) => {
    if (amenities.includes(name)) {
      setAmenities(amenities.filter((a) => a !== name));
    } else {
      setAmenities([...amenities, name]);
    }
  };

  const handleToggleMeal = (meal: string) => {
    if (foodMeals.includes(meal)) {
      setFoodMeals(foodMeals.filter((m) => m !== meal));
    } else {
      setFoodMeals([...foodMeals, meal]);
    }
  };

  const handleToggleRule = (rule: string) => {
    if (selectedRules.includes(rule)) {
      setSelectedRules(selectedRules.filter((r) => r !== rule));
    } else {
      setSelectedRules([...selectedRules, rule]);
    }
  };

  const handleAddCustomRule = () => {
    if (newCustomRule.trim()) {
      setCustomRules([...customRules, newCustomRule.trim()]);
      setNewCustomRule('');
    }
  };

  const handleRemoveCustomRule = (index: number) => {
    setCustomRules(customRules.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    setUploadError('');
    setUploadSuccess('');
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;

    if (isUnsupportedShareUrl(trimmed)) {
      setUploadError(
        'Sharing links (Google Drive, Google Photos, share.google, Dropbox) are web viewer pages, not direct image files. Please use the "Upload from Laptop" tab to upload your photo directly, or provide a direct image URL ending in .jpg, .png, or .webp.'
      );
      return;
    }

    if (!isValidImageUrl(trimmed)) {
      setUploadError('Please enter a valid HTTP or HTTPS direct image URL.');
      return;
    }

    if (images.includes(trimmed)) {
      setUploadError('This image URL is already in the list.');
      return;
    }

    setImages([...images, trimmed]);
    setNewImageUrl('');
    setUploadSuccess('Image URL added successfully.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const maxFileSize = 5 * 1024 * 1024; // 5 MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const newUploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Client-side validations
        if (file.size > maxFileSize) {
          throw new Error(`"${file.name}" exceeds the 5MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        }

        if (!allowedTypes.includes(file.type.toLowerCase())) {
          throw new Error(`"${file.name}" is an unsupported format. Please upload JPG, JPEG, PNG, or WEBP only.`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadPropertyImage(formData);
        if (result.success && result.url) {
          newUploadedUrls.push(result.url);
        }
      }

      if (newUploadedUrls.length > 0) {
        setImages((prevImages) => {
          const isOnlySampleImages =
            prevImages.length > 0 &&
            prevImages.every((img) => SAMPLE_IMAGES.some((sample) => img.startsWith(sample.split('?')[0])));

          if (isOnlySampleImages) {
            return [...newUploadedUrls];
          } else {
            // Deduplicate if any uploaded URL was already present, then prepend as cover
            const filtered = prevImages.filter((img) => !newUploadedUrls.includes(img));
            return [...newUploadedUrls, ...filtered];
          }
        });

        setUploadSuccess(
          `Successfully uploaded ${newUploadedUrls.length} image${newUploadedUrls.length > 1 ? 's' : ''}! Set as cover.`
        );
      }
    } catch (err: unknown) {
      console.error('File upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'An error occurred during upload.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetAsCover = (index: number) => {
    setImages((prevImages) => {
      if (index <= 0 || index >= prevImages.length) return prevImages;
      const targetImage = prevImages[index];
      const remainingImages = prevImages.filter((_, i) => i !== index);
      return [targetImage, ...remainingImages];
    });
    setUploadSuccess('Cover photo updated.');
    setUploadError('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setUploadSuccess('');
    setUploadError('');
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setImages((prevImages) => {
      if (direction === 'left' && index === 0) return prevImages;
      if (direction === 'right' && index === prevImages.length - 1) return prevImages;
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      const updated = [...prevImages];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleLoadSampleImages = () => {
    setImages([...images, ...SAMPLE_IMAGES]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Form Validations
    if (!title.trim()) {
      setError('Property title is required.');
      setLoading(false);
      return;
    }

    const resolvedArea = areaSelect === '__other__' ? customArea.trim() : areaSelect;
    if (!resolvedArea) {
      setError('Area / Locality is required.');
      setLoading(false);
      return;
    }

    if (!address.trim()) {
      setError('Full address is required.');
      setLoading(false);
      return;
    }

    const numStartingRent = Number(startingRent);
    if (isNaN(numStartingRent) || numStartingRent <= 0) {
      setError('Please provide a valid starting rent greater than 0.');
      setLoading(false);
      return;
    }

    if (ownerPhone && ownerPhone.trim().replace(/\D/g, '').length < 10) {
      setError('Owner phone number must have at least 10 digits.');
      setLoading(false);
      return;
    }

    // Combine rules
    const allRules = [...selectedRules, ...customRules].filter(Boolean);

    // Build payload
    const payload = {
      title: title.trim(),
      type,
      gender,
      verification,
      is_furnished: isFurnished,
      is_available_now: isAvailableNow,
      city,
      area: resolvedArea,
      address: address.trim(),
      nearby_college_id: nearbyCollegeId || null,
      tagline: tagline.trim() || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      source_url: googleMapUrl.trim() || null,
      starting_rent: numStartingRent,
      deposit: deposit ? Number(deposit) : numStartingRent,
      gate_closing_time: gateClosingTime.trim() || null,
      notice_period_days: noticePeriodDays ? Number(noticePeriodDays) : null,
      description: description.trim() || null,

      // Owner
      owner: ownerPhone.trim() ? {
        name: ownerName.trim() || 'Property Owner',
        role: ownerRole || 'Owner',
        phone: ownerPhone.trim(),
        whatsapp: ownerWhatsapp.trim() || ownerPhone.trim(),
      } : null,

      // Rooms
      rooms: rooms.map((r) => ({
        room_type: r.room_type.trim(),
        sharing: r.sharing,
        rent: Number(r.rent) || 0,
        deposit: Number(r.deposit) || 0,
        available_beds: Number(r.available_beds) || 0,
        total_beds: Number(r.total_beds) || 0,
        is_available: r.is_available,
        features: r.features,
      })),

      // Amenities
      amenities,

      // Food
      food_details: {
        included: foodIncluded,
        food_type: foodType,
        meals: foodMeals,
        timing: foodTiming.trim(),
        description: foodDescription.trim(),
      },

      // House Rules
      house_rules: allRules,

      // Images
      images: images.map((url, idx) => ({
        image_url: url,
        display_order: idx,
      })),
    };

    try {
      if (mode === 'create') {
        await createProperty(payload);
        setSuccess('Property created successfully with all structured details!');
        setTimeout(() => {
          router.push('/admin/properties');
        }, 1200);
      } else {
        await updatePropertyDetails(initialProperty?.id, payload);
        setSuccess('Property updated successfully with clean relational synchronization!');
        setTimeout(() => {
          router.push('/admin/properties');
        }, 1200);
      }
    } catch (err: unknown) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during save.');
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter((c) => c.city.toLowerCase() === city.toLowerCase());

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status & Banner Alerts */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Info size={16} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/properties"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-lg font-black text-white">
              {mode === 'create' ? 'Create New Student Stay' : `Editing: ${title || 'Property'}`}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'create' ? 'Complete all structured fields to register a verified stay' : 'Update existing listing and sync relations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Status:</span>
            <select
              value={verification}
              onChange={(e) => setVerification(e.target.value as 'verified' | 'unverified')}
              className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="verified" className="bg-slate-900 text-emerald-400">Published (Live)</option>
              <option value="unverified" className="bg-slate-900 text-slate-400">Draft / Archived (Hidden)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check size={15} />
                <span>{mode === 'create' ? 'Publish Stay' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: Basic Information */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Building2 size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">1. Basic Property Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Property Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shanti Niketan Student Stay & PG"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Property Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'PG' | 'Hostel' | 'Room')}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="PG">PG (Paying Guest)</option>
              <option value="Hostel">Hostel</option>
              <option value="Room">Independent Room</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Gender Target *
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'boys' | 'girls')}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="boys">Boys Only</option>
              <option value="girls">Girls Only</option>
            </select>
          </div>

          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={isFurnished}
                onChange={(e) => setIsFurnished(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
              />
              <span>Fully Furnished</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={isAvailableNow}
                onChange={(e) => setIsAvailableNow(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
              />
              <span>Ready for Immediate Move-in</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 2: Location & Address */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <MapPin size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">2. Location & Campus Proximity</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              City *
            </label>
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Student Area / Locality *
            </label>
            <select
              value={areaSelect}
              onChange={(e) => setAreaSelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {knownAreas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
              <option value="__other__">+ Other (Specify Custom Area)</option>
            </select>
          </div>

          {areaSelect === '__other__' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Specify Custom Area *
              </label>
              <input
                type="text"
                required
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                placeholder="e.g. Near New Bus Stand"
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Address *
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot No 42, Near Kotecha Circle, Kalawad Road, Rajkot - 360005"
              className="w-full px-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nearby College (Optional)
            </label>
            <select
              value={nearbyCollegeId}
              onChange={(e) => setNearbyCollegeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="">-- None / Independent Landmark --</option>
              {filteredColleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.area})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Landmark / Tagline (Optional)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. 500m from University Gate 2"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Google Maps Link or Embed Code with Auto GPS extraction */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-400 shrink-0" />
                Google Maps Link or Embed Code (Recommended)
              </label>
              <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full w-fit">
                Auto-fills Coordinates
              </span>
            </div>

            <input
              type="text"
              value={googleMapUrl}
              onChange={(e) => handleGoogleMapUrlChange(e.target.value)}
              placeholder="Paste Google Maps Share Link, Place URL, or <iframe> Embed Code..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />

            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 <strong>Tip:</strong> Google Maps me hostel search karke <strong>Share ➔ Embed a map (Copy HTML)</strong> ya <strong>Copy Link</strong> karke yahan paste karein. Latitude aur Longitude automatically calculate ho jayenge!
            </p>

            {googleMapUrl && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <Check size={14} className="shrink-0" />
                <span>Google Map link successfully linked!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-[10px]">
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="22.2905"
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-[10px]">
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="70.7818"
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Pricing & Description */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <DollarSign size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">3. Pricing, Curfew & Overview</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Starting Monthly Rent (₹) *
            </label>
            <input
              type="number"
              required
              min="100"
              value={startingRent}
              onChange={(e) => setStartingRent(e.target.value)}
              placeholder="e.g. 5500"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Security Deposit (₹)
            </label>
            <input
              type="number"
              min="0"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder="e.g. 5500"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Gate Curfew Time
            </label>
            <input
              type="text"
              value={gateClosingTime}
              onChange={(e) => setGateClosingTime(e.target.value)}
              placeholder="e.g. 10:00 PM"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Notice Period (Days)
            </label>
            <input
              type="number"
              min="0"
              value={noticePeriodDays}
              onChange={(e) => setNoticePeriodDays(e.target.value)}
              placeholder="30"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Property Overview / Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the atmosphere, study environment, walking distance to colleges, and key features..."
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Room Configurations */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Bed size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">4. Room Types & Sharing Configurations</h3>
          </div>
          <button
            type="button"
            onClick={handleAddRoom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition border border-emerald-500/30 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Room Type</span>
          </button>
        </div>

        <div className="space-y-4">
          {rooms.map((room, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Room Configuration #{idx + 1}
                </span>
                {rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRoom(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1 text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Room Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={room.room_type}
                    onChange={(e) => handleRoomChange(idx, 'room_type', e.target.value)}
                    placeholder="e.g. 2 Sharing Deluxe AC"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Sharing Capacity *
                  </label>
                  <select
                    value={room.sharing}
                    onChange={(e) => handleRoomChange(idx, 'sharing', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="single">Single Occupancy</option>
                    <option value="2-sharing">2 Sharing</option>
                    <option value="3-sharing">3 Sharing</option>
                    <option value="4-plus-sharing">4+ Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Rent (₹ / month) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={room.rent}
                    onChange={(e) => handleRoomChange(idx, 'rent', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Available Beds / Total *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="0"
                      value={room.available_beds}
                      onChange={(e) => handleRoomChange(idx, 'available_beds', Number(e.target.value))}
                      placeholder="Avail"
                      className="w-1/2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-slate-500">/</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={room.total_beds}
                      onChange={(e) => handleRoomChange(idx, 'total_beds', Number(e.target.value))}
                      placeholder="Total"
                      className="w-1/2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: Amenities */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">5. Amenities & Facilities</h3>
          </div>
          <button
            type="button"
            onClick={() => setAmenities(STANDARD_AMENITIES)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            Select All Standard
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {STANDARD_AMENITIES.map((amenity) => {
            const isChecked = amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => handleToggleAmenity(amenity)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer text-left ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{amenity}</span>
                {isChecked && <Check size={14} className="text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: Food & Mess Details */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Utensils size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">6. Food & Mess Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={foodIncluded}
                onChange={(e) => setFoodIncluded(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
              />
              <span>Meals Included in Monthly Rent</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Dietary Preference *
            </label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="Pure Veg">Pure Veg</option>
              <option value="Veg & Non-Veg">Veg & Non-Veg</option>
              <option value="Jain Food Available">Jain Food Available</option>
              <option value="Self Cooking / Optional Mess">Self Cooking / Optional Mess</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Mess Serving Timings
            </label>
            <input
              type="text"
              value={foodTiming}
              onChange={(e) => setFoodTiming(e.target.value)}
              placeholder="e.g. 7:30 - 9:30 AM | 7:45 - 10:00 PM"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Meals Provided:
            </label>
            <div className="flex flex-wrap gap-3">
              {['Breakfast', 'Lunch', 'Dinner', 'Evening Tea'].map((meal) => {
                const isChecked = foodMeals.includes(meal);
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => handleToggleMeal(meal)}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{meal}</span>
                    {isChecked && <Check size={13} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Menu / Mess Description
            </label>
            <textarea
              rows={2}
              value={foodDescription}
              onChange={(e) => setFoodDescription(e.target.value)}
              placeholder="Daily rotating vegetarian Gujarati, Kathiyawadi & Punjabi menu with sunday specials..."
              className="w-full px-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 7: House Rules */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <ShieldCheck size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">7. House Rules & Safety Policies</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STANDARD_RULES.map((rule) => {
              const isChecked = selectedRules.includes(rule);
              return (
                <button
                  key={rule}
                  type="button"
                  onClick={() => handleToggleRule(rule)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer text-left ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{rule}</span>
                  {isChecked && <Check size={14} className="text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Custom Rules List */}
          {customRules.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <span className="text-xs font-bold uppercase text-slate-400">Custom House Rules:</span>
              {customRules.map((cr, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
                  <span>{cr}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomRule(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Custom Rule Input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newCustomRule}
              onChange={(e) => setNewCustomRule(e.target.value)}
              placeholder="Type an additional custom house rule..."
              className="flex-1 px-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomRule}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 8: Owner & Management Contact */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Phone size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">8. Owner / Manager Contact (Verified Connect)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contact Person Name *
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <select
              value={ownerRole}
              onChange={(e) => setOwnerRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="Owner">Owner</option>
              <option value="Warden">Warden</option>
              <option value="Caretaker">Caretaker</option>
              <option value="Property Manager">Property Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number (10 Digits) *
            </label>
            <input
              type="tel"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              placeholder="9825123456"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={ownerWhatsapp}
              onChange={(e) => setOwnerWhatsapp(e.target.value)}
              placeholder="9825123456"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 9: Photos */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">9. Property Photos</h3>
          </div>
          <button
            type="button"
            onClick={handleLoadSampleImages}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            + Add Sample PG Photos
          </button>
        </div>

        {/* Tab selection: Laptop Upload vs Direct URL */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <button
            type="button"
            onClick={() => {
              setActiveImageTab('upload');
              setUploadError('');
              setUploadSuccess('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeImageTab === 'upload'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UploadCloud size={15} />
            <span>Upload from Laptop</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveImageTab('url');
              setUploadError('');
              setUploadSuccess('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeImageTab === 'url'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon size={15} />
            <span>Add Image URL</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {uploadError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
            <Check size={16} className="shrink-0 text-emerald-400" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Tab 1: Laptop Upload Dropzone */}
        {activeImageTab === 'upload' && (
          <div className="space-y-3">
            <label className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/50 hover:bg-slate-950/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileUpload}
                disabled={uploading}
                className="sr-only"
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 transition">
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-emerald-400" />
                ) : (
                  <UploadCloud size={24} />
                )}
              </div>
              <div className="text-sm font-bold text-white mb-1">
                {uploading ? 'Uploading to Supabase Storage...' : 'Click to select photos from your laptop'}
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Supported formats: <strong className="text-slate-300">JPG, JPEG, PNG, WEBP</strong> (Max 5MB per image).
              </p>
            </label>
          </div>
        )}

        {/* Tab 2: Direct Image URL */}
        {activeImageTab === 'url' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => {
                  setNewImageUrl(e.target.value);
                  if (uploadError) setUploadError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
                placeholder="https://images.unsplash.com/photo-... or https://...image.jpg"
                className="flex-1 px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
              >
                Add URL
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Direct image file links only (.jpg, .png, .webp, or image CDNs). Web viewing pages (Google Drive / Photos) will be rejected.
            </p>
          </div>
        )}

        {/* Current Image Gallery List */}
        {images.length > 0 ? (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Added Photos ({images.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">First photo will be displayed as the main cover</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              {images.map((imgUrl, idx) => {
                const isUnsupported = isUnsupportedShareUrl(imgUrl);
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border bg-slate-950 overflow-hidden shadow-md transition flex flex-col ${
                      isUnsupported ? 'border-amber-500/50 ring-1 ring-amber-500/30' : 'border-slate-800'
                    }`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      <SafeImage
                        src={imgUrl}
                        alt={`Property photo ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-md ${
                            idx === 0 ? 'bg-emerald-600 text-white' : 'bg-black/75 text-white'
                          }`}
                        >
                          {idx === 0 ? '★ Cover' : `#${idx + 1}`}
                        </span>
                        {isUnsupported && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/90 text-black shadow">
                            ⚠️ Share link
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Controls - Clearly Visible */}
                    <div className="p-2.5 bg-slate-950 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-800/80">
                      {idx === 0 ? (
                        <span className="text-[11px] font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                          ★ Main Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetAsCover(idx)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 border border-slate-700"
                          title="Set as Cover photo"
                        >
                          ★ Set as Cover
                        </button>
                      )}

                      <div className="flex items-center gap-1 ml-auto">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'left')}
                            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer transition border border-slate-800"
                            title="Move left (earlier in order)"
                          >
                            <ChevronLeft size={13} />
                          </button>
                        )}
                        {idx < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, 'right')}
                            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer transition border border-slate-800"
                            title="Move right (later in order)"
                          >
                            <ChevronRight size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 border border-rose-500/20"
                          title="Remove photo"
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            No photos added yet. Upload from laptop or paste a direct image URL above.
          </div>
        )}
      </div>

      {/* Bottom Sticky Submit Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
        <Link
          href="/admin/properties"
          className="px-5 py-2.5 border border-slate-800 text-slate-400 hover:bg-slate-900 rounded-xl text-xs font-semibold transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          {loading ? (
            <span>Saving Property...</span>
          ) : (
            <>
              <Check size={16} />
              <span>{mode === 'create' ? 'Create & Publish Property' : 'Save Property Changes'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
