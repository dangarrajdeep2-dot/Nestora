-- Supabase Initial Schema

CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'hostel',
    title TEXT NOT NULL,
    description TEXT,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    rent INTEGER NOT NULL,
    deposit INTEGER,
    gender TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    whatsapp TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE saved_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- For future auth
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, listing_id)
);

-- Indexes
CREATE INDEX idx_listings_college_id ON listings(college_id);
CREATE INDEX idx_listings_rent ON listings(rent);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_verified ON listings(verified);

-- Seed Data for Colleges
INSERT INTO colleges (id, name, city, latitude, longitude) VALUES 
('11111111-1111-1111-1111-111111111111', 'Delhi University (North Campus)', 'New Delhi', 28.6883, 77.2073),
('22222222-2222-2222-2222-222222222222', 'IIT Bombay', 'Mumbai', 19.1334, 72.9133),
('33333333-3333-3333-3333-333333333333', 'Christ University', 'Bangalore', 12.9345, 77.6059),
('44444444-4444-4444-4444-444444444444', 'Pune University', 'Pune', 18.5538, 73.8251),
('55555555-5555-5555-5555-555555555555', 'VIT Vellore', 'Vellore', 12.9692, 79.1559);

-- Seed Data for Listings
INSERT INTO listings (id, type, title, description, college_id, rent, deposit, gender, address, latitude, longitude, phone, whatsapp, amenities, verified) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'hostel', 'Sunrise Boys Hostel', 'Clean and affordable hostel near North Campus', '11111111-1111-1111-1111-111111111111', 8000, 16000, 'male', 'Kamla Nagar, New Delhi', 28.6811, 77.2001, '9876543210', '9876543210', '["Wi-Fi", "AC", "Laundry", "Mess"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'hostel', 'Starlight Girls Hostel', 'Premium girls hostel with high security', '11111111-1111-1111-1111-111111111111', 12000, 24000, 'female', 'Vijay Nagar, New Delhi', 28.6922, 77.2044, '9876543211', '9876543211', '["Wi-Fi", "AC", "Gym", "Security 24/7"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'hostel', 'Greenwoods PG', 'Peaceful environment for focused students', '11111111-1111-1111-1111-111111111111', 6000, 10000, 'male', 'Roop Nagar, New Delhi', 28.6855, 77.2012, '9876543212', NULL, '["Wi-Fi", "Non-AC", "Water Purifier"]', false),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'hostel', 'Pioneer Student Housing', 'Modern amenities and spacious rooms', '11111111-1111-1111-1111-111111111111', 9500, 19000, 'any', 'GTB Nagar, New Delhi', 28.6955, 77.2066, '9876543213', '9876543213', '["Wi-Fi", "AC", "Meals Included"]', true),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'hostel', 'Lakeview Boys Residency', 'Walking distance from IIT Bombay main gate', '22222222-2222-2222-2222-222222222222', 15000, 30000, 'male', 'Powai, Mumbai', 19.1234, 72.9100, '9876543214', '9876543214', '["Wi-Fi", "AC", "Gym", "Pool"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'hostel', 'Hiranandani Scholar Home', 'Luxury living for students', '22222222-2222-2222-2222-222222222222', 25000, 50000, 'any', 'Hiranandani Gardens, Powai, Mumbai', 19.1189, 72.9122, '9876543215', '9876543215', '["Wi-Fi", "AC", "Housekeeping", "Laundry"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'hostel', 'Powai Girls PG', 'Safe and secure PG for girls', '22222222-2222-2222-2222-222222222222', 11000, 22000, 'female', 'Chandivali, Mumbai', 19.1100, 72.8999, '9876543216', '9876543216', '["Wi-Fi", "Security 24/7", "Mess"]', false),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 'hostel', 'Vihar Lake Hostel', 'Affordable rooms near the lake', '22222222-2222-2222-2222-222222222222', 7500, 15000, 'male', 'Vihar Lake Road, Mumbai', 19.1456, 72.9056, '9876543217', NULL, '["Non-AC", "Meals Included"]', false),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9', 'hostel', 'Koramangala Student Hub', 'Right next to Christ University', '33333333-3333-3333-3333-333333333333', 13000, 30000, 'any', 'Koramangala 5th Block, Bangalore', 12.9322, 77.6111, '9876543218', '9876543218', '["Wi-Fi", "AC", "Washing Machine", "Power Backup"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'hostel', 'Tavarekere Girls Hostel', 'Comfortable stay with home food', '33333333-3333-3333-3333-333333333333', 8500, 17000, 'female', 'Tavarekere, Bangalore', 12.9234, 77.6067, '9876543219', '9876543219', '["Wi-Fi", "Home Food", "Security"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa11', 'hostel', 'BTM Layout Boys PG', 'Spacious rooms in a lively area', '33333333-3333-3333-3333-333333333333', 9000, 15000, 'male', 'BTM 1st Stage, Bangalore', 12.9166, 77.6100, '9876543220', '9876543220', '["Wi-Fi", "TV", "Meals Included"]', false),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa12', 'hostel', 'Christites Residency', 'Exclusively for Christ students', '33333333-3333-3333-3333-333333333333', 14000, 25000, 'male', 'Koramangala 3rd Block, Bangalore', 12.9288, 77.6155, '9876543221', '9876543221', '["Wi-Fi", "AC", "Gym"]', true),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa13', 'hostel', 'Shivajinagar Boys Hostel', 'Close to Pune University gate', '44444444-4444-4444-4444-444444444444', 6500, 10000, 'male', 'Shivajinagar, Pune', 18.5312, 73.8400, '9876543222', NULL, '["Wi-Fi", "Mess", "Hot Water"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa14', 'hostel', 'Aundh Girls Home', 'Quiet area, perfect for studying', '44444444-4444-4444-4444-444444444444', 10500, 20000, 'female', 'Aundh, Pune', 18.5622, 73.8055, '9876543223', '9876543223', '["Wi-Fi", "AC", "Security"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa15', 'hostel', 'Baner Student Living', 'Modern PG with fast internet', '44444444-4444-4444-4444-444444444444', 12000, 24000, 'any', 'Baner, Pune', 18.5599, 73.7866, '9876543224', '9876543224', '["Wi-Fi", "AC", "Washing Machine", "Gym"]', false),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa16', 'hostel', 'FC Road Budget Hostel', 'Heart of the city on a budget', '44444444-4444-4444-4444-444444444444', 5000, 8000, 'male', 'FC Road, Pune', 18.5204, 73.8390, '9876543225', '9876543225', '["Non-AC", "Hot Water"]', false),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa17', 'hostel', 'Katpadi Boys Dorms', 'Just outside VIT campus', '55555555-5555-5555-5555-555555555555', 7000, 10000, 'male', 'Katpadi, Vellore', 12.9755, 79.1455, '9876543226', '9876543226', '["Wi-Fi", "Mess", "Laundry"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa18', 'hostel', 'Vellore Queens Hostel', 'Best girls hostel in Vellore', '55555555-5555-5555-5555-555555555555', 8500, 15000, 'female', 'Gandhi Nagar, Vellore', 12.9455, 79.1355, '9876543227', '9876543227', '["Wi-Fi", "AC", "Security 24/7"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa19', 'hostel', 'Campus View PG', 'Awesome view of the university', '55555555-5555-5555-5555-555555555555', 9000, 15000, 'male', 'Brahmapuram, Vellore', 12.9600, 79.1655, '9876543228', '9876543228', '["Wi-Fi", "AC", "Power Backup"]', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa20', 'hostel', 'VITians Den', 'Lively atmosphere for VIT students', '55555555-5555-5555-5555-555555555555', 6000, 10000, 'male', 'Katpadi Extension, Vellore', 12.9700, 79.1400, '9876543229', NULL, '["Wi-Fi", "Non-AC"]', false);

-- Listing Images (1 image per listing for simplicity)
INSERT INTO listing_images (listing_id, image_url) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'https://images.unsplash.com/photo-1502672260266-1c1e5250320a?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'https://images.unsplash.com/photo-1502672260266-1c1e5250320a?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa11', 'https://images.unsplash.com/photo-1502672260266-1c1e5250320a?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa12', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa13', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa14', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa15', 'https://images.unsplash.com/photo-1502672260266-1c1e5250320a?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa16', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa17', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa18', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa19', 'https://images.unsplash.com/photo-1502672260266-1c1e5250320a?auto=format&fit=crop&q=80&w=800'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa20', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800');
