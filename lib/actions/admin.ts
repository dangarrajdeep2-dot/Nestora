'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { invalidatePropertiesCache } from '@/lib/api/properties';
import { MOCK_PROPERTIES } from '@/lib/api/mockData';

export async function requireAdmin(supabase: SupabaseClient) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (adminError || !admin) {
    throw new Error('Forbidden: Admin privileges required.');
  }

  return user;
}

export async function getAdminProperties() {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      type,
      gender,
      area,
      city,
      verification,
      is_available_now,
      starting_rent,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin properties:', error);
    throw new Error('Failed to fetch properties.');
  }

  return data;
}

export async function getAdminPropertyById(id: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

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
      property_images(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching admin property by id:', error);
    return null;
  }

  return data;
}

export async function getAdminColleges() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('colleges')
    .select('id, name, city, area, short_name')
    .order('name');

  if (error) {
    console.warn('Could not fetch colleges from database:', error.message);
    return [];
  }

  return data || [];
}

export async function updatePropertyStatus(id: string, verification: 'verified' | 'unverified' | 'demo') {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase
    .from('properties')
    .update({ verification, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating property status:', error);
    throw new Error('Failed to update status.');
  }

  invalidatePropertiesCache();
  revalidatePath('/admin/properties');
  revalidatePath('/search');
  revalidatePath('/');
  revalidatePath(`/property/${id}`);
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting property:', error);
    throw new Error('Failed to delete property.');
  }

  invalidatePropertiesCache();
  revalidatePath('/admin/properties');
  revalidatePath('/search');
  revalidatePath('/');
}

export async function createProperty(data: Record<string, any>) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  // Extract relational datasets
  const { owner, rooms, amenities, food_details, house_rules, images, ...propertyData } = data;

  // 1. Resolve Owner record safely
  let resolvedOwnerId: string | null = propertyData.owner_id || null;
  if (owner && owner.phone && String(owner.phone).trim().length >= 10) {
    const cleanPhone = String(owner.phone).trim().replace(/\D/g, '').slice(-10);
    const { data: existingOwner } = await supabase
      .from('owners')
      .select('id, name, whatsapp, role')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingOwner) {
      resolvedOwnerId = existingOwner.id;
      await supabase
        .from('owners')
        .update({
          name: owner.name?.trim() || existingOwner.name || 'Owner',
          whatsapp: owner.whatsapp ? String(owner.whatsapp).trim().replace(/\D/g, '').slice(-10) : cleanPhone,
          role: owner.role?.trim() || existingOwner.role || 'Owner',
        })
        .eq('id', existingOwner.id);
    } else {
      const { data: newOwner, error: newOwnerErr } = await supabase
        .from('owners')
        .insert([{
          name: owner.name?.trim() || 'Owner',
          phone: cleanPhone,
          whatsapp: owner.whatsapp ? String(owner.whatsapp).trim().replace(/\D/g, '').slice(-10) : cleanPhone,
          role: owner.role?.trim() || 'Owner',
          is_verified: true,
        }])
        .select('id')
        .single();

      if (!newOwnerErr && newOwner) {
        resolvedOwnerId = newOwner.id;
      }
    }
  }

  // 2. Prepare Parent Property Payload
  const cleanPropertyData = {
    title: String(propertyData.title || '').trim(),
    type: propertyData.type || 'PG',
    gender: propertyData.gender || 'boys',
    tagline: propertyData.tagline?.trim() || null,
    description: propertyData.description?.trim() || null,
    address: String(propertyData.address || '').trim(),
    area: String(propertyData.area || '').trim(),
    city: String(propertyData.city || '').trim(),
    latitude: propertyData.latitude ? Number(propertyData.latitude) : null,
    longitude: propertyData.longitude ? Number(propertyData.longitude) : null,
    nearby_college_id: propertyData.nearby_college_id || null,
    verification: propertyData.verification === 'verified' ? 'verified' : (propertyData.verification === 'demo' ? 'demo' : 'unverified'),
    starting_rent: Math.max(0, Math.round(Number(propertyData.starting_rent) || 0)),
    deposit: Math.max(0, Math.round(Number(propertyData.deposit) || 0)),
    is_furnished: Boolean(propertyData.is_furnished),
    is_available_now: propertyData.is_available_now !== false,
    notice_period_days: propertyData.notice_period_days ? Math.round(Number(propertyData.notice_period_days)) : null,
    gate_closing_time: propertyData.gate_closing_time?.trim() || null,
    owner_id: resolvedOwnerId,
    source_url: propertyData.source_url || null,
  };

  const { data: prop, error: propError } = await supabase
    .from('properties')
    .insert([cleanPropertyData])
    .select()
    .single();

  if (propError || !prop) {
    console.error('Error creating property:', propError);
    throw new Error(`Failed to create property: ${propError?.message || 'Database error'}`);
  }

  // 3. Child Relations with Rollback Compensation
  try {
    // Rooms
    if (Array.isArray(rooms) && rooms.length > 0) {
      const roomsData = rooms.map((r: any, idx: number) => ({
        property_id: prop.id,
        room_type: String(r.room_type || `Room ${idx + 1}`).trim(),
        sharing: r.sharing || '2-sharing',
        rent: Math.max(0, Math.round(Number(r.rent) || 0)),
        deposit: Math.max(0, Math.round(Number(r.deposit) || 0)),
        available_beds: Math.max(0, Math.round(Number(r.available_beds) || 0)),
        total_beds: Math.max(0, Math.round(Number(r.total_beds) || 0)),
        is_available: r.is_available !== false,
        features: Array.isArray(r.features) ? r.features : [],
      }));
      const { error: roomsError } = await supabase.from('rooms').insert(roomsData);
      if (roomsError) throw new Error(`Rooms insert failed: ${roomsError.message}`);
    }

    // Amenities
    if (Array.isArray(amenities) && amenities.length > 0) {
      const uniqueAmenities = Array.from(new Set(amenities.map(a => String(a).trim()).filter(Boolean)));
      if (uniqueAmenities.length > 0) {
        const amenitiesData = uniqueAmenities.map((a: string) => ({
          property_id: prop.id,
          amenity_name: a,
        }));
        const { error: amenitiesError } = await supabase.from('property_amenities').insert(amenitiesData);
        if (amenitiesError) throw new Error(`Amenities insert failed: ${amenitiesError.message}`);
      }
    }

    // Food Details
    if (food_details) {
      const foodData = {
        property_id: prop.id,
        included: Boolean(food_details.included),
        food_type: food_details.food_type || 'Self Cooking / Optional Mess',
        meals: Array.isArray(food_details.meals) ? food_details.meals : [],
        description: food_details.description?.trim() || null,
        timing: food_details.timing?.trim() || null,
      };
      const { error: foodError } = await supabase.from('food_details').insert([foodData]);
      if (foodError) throw new Error(`Food details insert failed: ${foodError.message}`);
    }

    // House Rules
    if (Array.isArray(house_rules) && house_rules.length > 0) {
      const uniqueRules = Array.from(new Set(house_rules.map(r => String(r).trim()).filter(Boolean)));
      if (uniqueRules.length > 0) {
        const rulesData = uniqueRules.map((rule: string) => ({
          property_id: prop.id,
          rule,
        }));
        const { error: rulesError } = await supabase.from('house_rules').insert(rulesData);
        if (rulesError) throw new Error(`House rules insert failed: ${rulesError.message}`);
      }
    }

    // Property Images
    if (Array.isArray(images) && images.length > 0) {
      const imagesData = images
        .map((img: any, idx: number) => {
          const url = typeof img === 'string' ? img.trim() : (img?.image_url || '').trim();
          const order = typeof img === 'object' && img.display_order !== undefined ? Number(img.display_order) : idx;
          return { property_id: prop.id, image_url: url, display_order: order };
        })
        .filter((img: { image_url: string }) => img.image_url.length > 0);

      if (imagesData.length > 0) {
        const { error: imagesError } = await supabase.from('property_images').insert(imagesData);
        if (imagesError) throw new Error(`Images insert failed: ${imagesError.message}`);
      }
    }
  } catch (relError) {
    console.error('Error inserting relations, compensating newly created property:', relError);
    // Reliable compensation: Only delete this specific newly created property
    await supabase.from('properties').delete().eq('id', prop.id);
    throw relError;
  }

  invalidatePropertiesCache();
  revalidatePath('/admin/properties');
  revalidatePath('/search');
  revalidatePath('/');
  revalidatePath(`/property/${prop.id}`);
  return prop;
}

export async function updatePropertyDetails(id: string, data: Record<string, any>) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { owner, rooms, amenities, food_details, house_rules, images, ...propertyData } = data;

  // 1. Resolve Owner
  let resolvedOwnerId: string | undefined = propertyData.owner_id;
  if (owner && owner.phone && String(owner.phone).trim().length >= 10) {
    const cleanPhone = String(owner.phone).trim().replace(/\D/g, '').slice(-10);
    const { data: existingOwner } = await supabase
      .from('owners')
      .select('id, name, whatsapp, role')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingOwner) {
      resolvedOwnerId = existingOwner.id;
      await supabase
        .from('owners')
        .update({
          name: owner.name?.trim() || existingOwner.name || 'Owner',
          whatsapp: owner.whatsapp ? String(owner.whatsapp).trim().replace(/\D/g, '').slice(-10) : cleanPhone,
          role: owner.role?.trim() || existingOwner.role || 'Owner',
        })
        .eq('id', existingOwner.id);
    } else {
      const { data: newOwner, error: newOwnerErr } = await supabase
        .from('owners')
        .insert([{
          name: owner.name?.trim() || 'Owner',
          phone: cleanPhone,
          whatsapp: owner.whatsapp ? String(owner.whatsapp).trim().replace(/\D/g, '').slice(-10) : cleanPhone,
          role: owner.role?.trim() || 'Owner',
          is_verified: true,
        }])
        .select('id')
        .single();

      if (!newOwnerErr && newOwner) {
        resolvedOwnerId = newOwner.id;
      }
    }
  }

  // 2. Prepare Clean Property Updates
  const cleanPropertyData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (propertyData.title !== undefined) cleanPropertyData.title = String(propertyData.title).trim();
  if (propertyData.type !== undefined) cleanPropertyData.type = propertyData.type;
  if (propertyData.gender !== undefined) cleanPropertyData.gender = propertyData.gender;
  if (propertyData.tagline !== undefined) cleanPropertyData.tagline = propertyData.tagline?.trim() || null;
  if (propertyData.description !== undefined) cleanPropertyData.description = propertyData.description?.trim() || null;
  if (propertyData.address !== undefined) cleanPropertyData.address = String(propertyData.address).trim();
  if (propertyData.area !== undefined) cleanPropertyData.area = String(propertyData.area).trim();
  if (propertyData.city !== undefined) cleanPropertyData.city = String(propertyData.city).trim();
  if (propertyData.latitude !== undefined) cleanPropertyData.latitude = propertyData.latitude ? Number(propertyData.latitude) : null;
  if (propertyData.longitude !== undefined) cleanPropertyData.longitude = propertyData.longitude ? Number(propertyData.longitude) : null;
  if (propertyData.nearby_college_id !== undefined) cleanPropertyData.nearby_college_id = propertyData.nearby_college_id || null;
  if (propertyData.verification !== undefined) cleanPropertyData.verification = propertyData.verification;
  if (propertyData.starting_rent !== undefined) cleanPropertyData.starting_rent = Math.max(0, Math.round(Number(propertyData.starting_rent) || 0));
  if (propertyData.deposit !== undefined) cleanPropertyData.deposit = Math.max(0, Math.round(Number(propertyData.deposit) || 0));
  if (propertyData.is_furnished !== undefined) cleanPropertyData.is_furnished = Boolean(propertyData.is_furnished);
  if (propertyData.is_available_now !== undefined) cleanPropertyData.is_available_now = Boolean(propertyData.is_available_now);
  if (propertyData.notice_period_days !== undefined) cleanPropertyData.notice_period_days = propertyData.notice_period_days ? Math.round(Number(propertyData.notice_period_days)) : null;
  if (propertyData.gate_closing_time !== undefined) cleanPropertyData.gate_closing_time = propertyData.gate_closing_time?.trim() || null;
  if (propertyData.source_url !== undefined) cleanPropertyData.source_url = propertyData.source_url?.trim() || null;
  if (resolvedOwnerId !== undefined) cleanPropertyData.owner_id = resolvedOwnerId;

  // 3. Update Parent Property
  const { error: propError } = await supabase
    .from('properties')
    .update(cleanPropertyData)
    .eq('id', id);

  if (propError) {
    console.error('Error updating property:', propError);
    throw new Error(`Failed to update property: ${propError.message}`);
  }

  // 4. Safely Sync Child Relations (Delete and Reinsert for this property_id)
  // Rooms
  if (rooms !== undefined) {
    const { error: delRoomsError } = await supabase.from('rooms').delete().eq('property_id', id);
    if (delRoomsError) throw new Error(`Failed to clear existing rooms: ${delRoomsError.message}`);

    if (Array.isArray(rooms) && rooms.length > 0) {
      const roomsData = rooms.map((r: any, idx: number) => ({
        property_id: id,
        room_type: String(r.room_type || `Room ${idx + 1}`).trim(),
        sharing: r.sharing || '2-sharing',
        rent: Math.max(0, Math.round(Number(r.rent) || 0)),
        deposit: Math.max(0, Math.round(Number(r.deposit) || 0)),
        available_beds: Math.max(0, Math.round(Number(r.available_beds) || 0)),
        total_beds: Math.max(0, Math.round(Number(r.total_beds) || 0)),
        is_available: r.is_available !== false,
        features: Array.isArray(r.features) ? r.features : [],
      }));
      const { error: roomsError } = await supabase.from('rooms').insert(roomsData);
      if (roomsError) throw new Error(`Rooms update failed: ${roomsError.message}`);
    }
  }

  // Amenities
  if (amenities !== undefined) {
    const { error: delAmenError } = await supabase.from('property_amenities').delete().eq('property_id', id);
    if (delAmenError) throw new Error(`Failed to clear existing amenities: ${delAmenError.message}`);

    if (Array.isArray(amenities) && amenities.length > 0) {
      const uniqueAmenities = Array.from(new Set(amenities.map(a => String(a).trim()).filter(Boolean)));
      if (uniqueAmenities.length > 0) {
        const amenitiesData = uniqueAmenities.map((a: string) => ({
          property_id: id,
          amenity_name: a,
        }));
        const { error: amenError } = await supabase.from('property_amenities').insert(amenitiesData);
        if (amenError) throw new Error(`Amenities update failed: ${amenError.message}`);
      }
    }
  }

  // Food Details
  if (food_details !== undefined) {
    const { error: delFoodError } = await supabase.from('food_details').delete().eq('property_id', id);
    if (delFoodError) throw new Error(`Failed to clear food details: ${delFoodError.message}`);

    if (food_details) {
      const foodData = {
        property_id: id,
        included: Boolean(food_details.included),
        food_type: food_details.food_type || 'Self Cooking / Optional Mess',
        meals: Array.isArray(food_details.meals) ? food_details.meals : [],
        description: food_details.description?.trim() || null,
        timing: food_details.timing?.trim() || null,
      };
      const { error: foodError } = await supabase.from('food_details').insert([foodData]);
      if (foodError) throw new Error(`Food details update failed: ${foodError.message}`);
    }
  }

  // House Rules
  if (house_rules !== undefined) {
    const { error: delRulesError } = await supabase.from('house_rules').delete().eq('property_id', id);
    if (delRulesError) throw new Error(`Failed to clear rules: ${delRulesError.message}`);

    if (Array.isArray(house_rules) && house_rules.length > 0) {
      const uniqueRules = Array.from(new Set(house_rules.map(r => String(r).trim()).filter(Boolean)));
      if (uniqueRules.length > 0) {
        const rulesData = uniqueRules.map((rule: string) => ({
          property_id: id,
          rule,
        }));
        const { error: rulesError } = await supabase.from('house_rules').insert(rulesData);
        if (rulesError) throw new Error(`House rules update failed: ${rulesError.message}`);
      }
    }
  }

  // Images
  if (images !== undefined) {
    const { error: delImagesError } = await supabase.from('property_images').delete().eq('property_id', id);
    if (delImagesError) throw new Error(`Failed to clear images: ${delImagesError.message}`);

    if (Array.isArray(images) && images.length > 0) {
      const imagesData = images
        .map((img: any, idx: number) => {
          const url = typeof img === 'string' ? img.trim() : (img?.image_url || '').trim();
          const order = typeof img === 'object' && img.display_order !== undefined ? Number(img.display_order) : idx;
          return { property_id: id, image_url: url, display_order: order };
        })
        .filter((img: { image_url: string }) => img.image_url.length > 0);

      if (imagesData.length > 0) {
        const { error: imagesError } = await supabase.from('property_images').insert(imagesData);
        if (imagesError) throw new Error(`Images update failed: ${imagesError.message}`);
      }
    }
  }

  invalidatePropertiesCache();
  revalidatePath('/admin/properties');
  revalidatePath('/search');
  revalidatePath('/');
  revalidatePath(`/property/${id}`);
}

export async function uploadPropertyImage(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const file = formData.get('file') as File | null;
  if (!file) {
    throw new Error('No image file provided.');
  }

  // 1. Validate file size (max 5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB limit.`);
  }

  // 2. Validate MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
    throw new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are supported.');
  }

  // 3. Generate sanitized unique storage path
  const originalName = file.name || 'image.jpg';
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const filePath = `properties/${timestamp}-${randomSuffix}.${cleanExt}`;

  // 4. Attempt upload to Supabase Storage bucket 'property-images'
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase storage upload error:', uploadError);
    if (uploadError.message.toLowerCase().includes('bucket not found') || (uploadError as any).statusCode === '404') {
      throw new Error(
        "Supabase Storage bucket 'property-images' does not exist yet. Please create the public bucket in the Supabase Dashboard SQL Editor (see database/03_storage_property_images.sql)."
      );
    }
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 5. Get permanent public URL
  const { data: publicUrlData } = supabase.storage
    .from('property-images')
    .getPublicUrl(uploadData.path);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Could not retrieve public URL for uploaded photo.');
  }

  return {
    success: true,
    url: publicUrlData.publicUrl,
    path: uploadData.path,
  };
}

export interface AdminReview {
  id: string;
  property_id: string;
  property_title: string;
  property_area: string;
  property_city: string;
  author_name: string;
  college: string;
  course?: string;
  rating: number;
  comment: string;
  date: string;
  verified_stay: boolean;
  helpful_count: number;
}

function getFallbackAdminReviews(): AdminReview[] {
  const list: AdminReview[] = [];
  for (const prop of MOCK_PROPERTIES) {
    if (prop.reviews && prop.reviews.length > 0) {
      for (const rev of prop.reviews) {
        list.push({
          id: rev.id,
          property_id: prop.id,
          property_title: prop.title,
          property_area: prop.area,
          property_city: prop.city,
          author_name: rev.authorName,
          college: rev.college,
          course: rev.course || '',
          rating: rev.rating,
          comment: rev.comment,
          date: rev.date,
          verified_stay: Boolean(rev.verifiedStay),
          helpful_count: rev.helpfulCount || 0,
        });
      }
    }
  }
  return list;
}

export async function getAdminReviews(): Promise<AdminReview[]> {
  const supabase = await createClient();
  await requireAdmin(supabase);

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        property_id,
        author_name,
        college,
        course,
        rating,
        comment,
        date,
        verified_stay,
        helpful_count,
        properties:property_id (
          id,
          title,
          area,
          city
        )
      `)
      .order('date', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn('Notice: Error fetching reviews from Supabase, serving fallback:', error.message);
      }
      return getFallbackAdminReviews();
    }

    return data.map((r: any) => ({
      id: r.id,
      property_id: r.property_id,
      property_title: r.properties?.title || 'Verified Accommodation',
      property_area: r.properties?.area || '',
      property_city: r.properties?.city || '',
      author_name: r.author_name || 'Student Resident',
      college: r.college || 'College Student',
      course: r.course || '',
      rating: Number(r.rating) || 5,
      comment: r.comment || '',
      date: r.date ? new Date(r.date).toLocaleDateString() : 'Recently',
      verified_stay: Boolean(r.verified_stay),
      helpful_count: Number(r.helpful_count || 0),
    }));
  } catch (err) {
    console.error('getAdminReviews caught error:', err);
    return getFallbackAdminReviews();
  }
}

export async function deleteAdminReview(id: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.warn('Supabase delete review note:', error.message);
  }

  invalidatePropertiesCache();
  revalidatePath('/admin/reviews');
  revalidatePath('/admin');
  revalidatePath('/property/[id]', 'page');
  return { success: true };
}

export async function toggleReviewVerifiedStay(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase
    .from('reviews')
    .update({ verified_stay: !currentStatus })
    .eq('id', id);

  if (error) {
    console.warn('Supabase update review verified note:', error.message);
  }

  invalidatePropertiesCache();
  revalidatePath('/admin/reviews');
  revalidatePath('/admin');
  revalidatePath('/property/[id]', 'page');
  return { success: true, verified_stay: !currentStatus };
}


