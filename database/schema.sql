-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE property_type AS ENUM ('PG', 'Hostel', 'Room');
CREATE TYPE gender_target AS ENUM ('boys', 'girls', 'co-ed');
CREATE TYPE sharing_type AS ENUM ('single', '2-sharing', '3-sharing', '4-plus-sharing');
CREATE TYPE verification_status AS ENUM ('verified', 'unverified', 'demo');

-- Colleges Table
CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    short_name VARCHAR(50),
    popular_landmark VARCHAR(255),
    verification verification_status DEFAULT 'unverified',
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Owners Table
CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    role VARCHAR(50),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    response_rate VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    avatar_url TEXT
);

-- Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type property_type NOT NULL,
    gender gender_target NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    address TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    nearby_college_id UUID REFERENCES colleges(id),
    verification verification_status DEFAULT 'unverified',
    starting_rent INTEGER NOT NULL DEFAULT 0,
    deposit INTEGER NOT NULL DEFAULT 0,
    is_furnished BOOLEAN DEFAULT false,
    is_available_now BOOLEAN DEFAULT true,
    notice_period_days INTEGER,
    gate_closing_time VARCHAR(50),
    owner_id UUID REFERENCES owners(id),
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    room_type VARCHAR(100) NOT NULL,
    sharing sharing_type NOT NULL,
    rent INTEGER NOT NULL DEFAULT 0,
    deposit INTEGER NOT NULL DEFAULT 0,
    available_beds INTEGER NOT NULL DEFAULT 0,
    total_beds INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    features JSONB DEFAULT '[]'::jsonb
);

-- Amenities (Many-to-Many via JSONB or explicit table)
CREATE TABLE property_amenities (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (property_id, amenity_name)
);

-- Food Details Table
CREATE TABLE food_details (
    property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
    included BOOLEAN DEFAULT false,
    food_type VARCHAR(100),
    meals JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    timing VARCHAR(255)
);

-- House Rules Table
CREATE TABLE house_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    rule TEXT NOT NULL
);

-- Property Images Table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    author_name VARCHAR(100),
    college VARCHAR(255),
    course VARCHAR(100),
    rating DECIMAL(3,2),
    comment TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_stay BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0
);

-- Users Table (Student side)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    college VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites Table
CREATE TABLE favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, property_id)
);

-- Enquiries Table
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    property_name VARCHAR(255),
    student_name VARCHAR(255) NOT NULL,
    student_phone VARCHAR(20) NOT NULL,
    student_college VARCHAR(255),
    gender gender_target NOT NULL,
    move_in_date DATE,
    sharing_preference VARCHAR(100),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Public read access for property listings
CREATE POLICY "Public profiles are viewable by everyone." ON colleges FOR SELECT USING (true);
CREATE POLICY "Public properties are viewable by everyone." ON properties FOR SELECT USING (true);
CREATE POLICY "Rooms viewable by everyone." ON rooms FOR SELECT USING (true);
CREATE POLICY "Owners viewable by everyone." ON owners FOR SELECT USING (true);
CREATE POLICY "Amenities viewable by everyone." ON property_amenities FOR SELECT USING (true);
CREATE POLICY "Food details viewable by everyone." ON food_details FOR SELECT USING (true);
CREATE POLICY "House rules viewable by everyone." ON house_rules FOR SELECT USING (true);
CREATE POLICY "Property images viewable by everyone." ON property_images FOR SELECT USING (true);
CREATE POLICY "Reviews viewable by everyone." ON reviews FOR SELECT USING (true);

-- Protected student data (Assumes Supabase Auth mapping to users.id)
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own enquiries" ON enquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
