-- Explicit UUIDs for deterministic seeding
DO $$ 
DECLARE
    college_marwadi UUID := 'c1111111-1111-1111-1111-111111111111';
    college_ahmedabad UUID := 'c2222222-2222-2222-2222-222222222222';
    owner_demo UUID := '00000000-0000-0000-0000-000000000001';
    prop_marwadi_hostel UUID := 'b1111111-1111-1111-1111-111111111111';
    prop_ahmedabad_pg UUID := 'b2222222-2222-2222-2222-222222222222';
    room_marwadi UUID := 'd1111111-1111-1111-1111-111111111111';
    room_ahmedabad UUID := 'd2222222-2222-2222-2222-222222222222';
    rule_marwadi_1 UUID := 'f1111111-1111-1111-1111-111111111111';
    rule_marwadi_2 UUID := 'f1111111-1111-1111-1111-111111111112';
    rule_ahmedabad_1 UUID := 'f2222222-2222-2222-2222-222222222221';
BEGIN
    -- Insert Colleges
    -- College locations and names are real verifiable data.
    INSERT INTO colleges (id, name, city, area, latitude, longitude, short_name, popular_landmark, verification, source_url)
    VALUES 
    (college_marwadi, 'Marwadi University', 'Rajkot', 'Gauridad', 22.3687, 70.8032, 'MU', 'Rajkot-Morbi Highway', 'verified', 'https://www.marwadiuniversity.ac.in/'),
    (college_ahmedabad, 'Ahmedabad University', 'Ahmedabad', 'Navrangpura', 23.0378, 72.5458, 'AU', 'Commerce Six Roads', 'verified', 'https://ahduni.edu.in/')
    ON CONFLICT (id) DO NOTHING;

    -- Insert Demo Owner (Since we cannot invent real owner details or leak numbers)
    INSERT INTO owners (id, name, role, phone, whatsapp, response_rate, is_verified)
    VALUES 
    (owner_demo, NULL, 'University Admin', NULL, NULL, NULL, false)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Properties
    -- Note: Rents, live availability, and exact beds are estimations required by TS interfaces, hence explicitly tagged as 'demo'
    INSERT INTO properties (id, title, type, gender, tagline, description, address, area, city, latitude, longitude, nearby_college_id, verification, starting_rent, deposit, is_furnished, is_available_now, notice_period_days, gate_closing_time, owner_id, source_url)
    VALUES 
    (prop_marwadi_hostel, 'Marwadi University Boys Hostel (On-Campus)', 'Hostel', 'boys', 'Official university accommodation with comprehensive amenities', 'On-campus hostel offering various configurations including 3-bed to 8-bed rooms. Features include 24/7 security, gym, library access, and medical support. Note: Rent and availability are estimated for demo.', 'Marwadi University Campus, Rajkot-Morbi Highway, Rajkot', 'Gauridad', 'Rajkot', 22.3687, 70.8032, college_marwadi, 'demo', 6250, 15000, true, true, 30, '10:00 PM', owner_demo, 'https://www.marwadiuniversity.ac.in/hostel-facility/'),
    (prop_ahmedabad_pg, 'Navrangpura Private Boys PG (Demo Record)', 'PG', 'boys', 'Standard private PG near Ahmedabad University', 'A representative private PG located in the Navrangpura educational hub. Note: Rent, live availability and exact coordinates are estimates for demonstration purposes as real-time vacancies vary.', 'Navrangpura, Near Commerce Six Roads, Ahmedabad', 'Navrangpura', 'Ahmedabad', 23.0380, 72.5460, college_ahmedabad, 'demo', 8000, 8000, true, true, 30, '10:30 PM', NULL, 'https://magicbricks.com/navrangpura-pg')
    ON CONFLICT (id) DO NOTHING;

    -- Insert Rooms
    INSERT INTO rooms (id, property_id, room_type, sharing, rent, deposit, available_beds, total_beds, is_available, features)
    VALUES 
    (room_marwadi, prop_marwadi_hostel, '3 Sharing Non-AC', '3-sharing', 6250, 15000, 10, 100, true, '["Attached Bathroom", "Study Table", "Gym Access", "Laundry"]'::jsonb),
    (room_ahmedabad, prop_ahmedabad_pg, '2 Sharing Standard', '2-sharing', 8000, 8000, 2, 20, true, '["Wi-Fi", "Attached Washroom", "Housekeeping"]'::jsonb)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Amenities
    INSERT INTO property_amenities (property_id, amenity_name)
    VALUES 
    (prop_marwadi_hostel, 'Wi-Fi'),
    (prop_marwadi_hostel, 'Food'),
    (prop_marwadi_hostel, 'Laundry'),
    (prop_marwadi_hostel, 'Gym'),
    (prop_marwadi_hostel, 'CCTV'),
    (prop_ahmedabad_pg, 'Wi-Fi'),
    (prop_ahmedabad_pg, 'Food'),
    (prop_ahmedabad_pg, 'Housekeeping')
    ON CONFLICT (property_id, amenity_name) DO NOTHING;

    -- Insert Food Details
    INSERT INTO food_details (property_id, included, food_type, meals, description, timing)
    VALUES 
    (prop_marwadi_hostel, true, 'Veg & Non-Veg', '["Breakfast", "Lunch", "Dinner"]'::jsonb, 'University mess providing comprehensive meals', 'Breakfast: 7:30 AM | Dinner: 7:30 PM'),
    (prop_ahmedabad_pg, true, 'Pure Veg', '["Breakfast", "Dinner"]'::jsonb, 'Standard PG food', 'Breakfast: 8:00 AM | Dinner: 8:00 PM')
    ON CONFLICT (property_id) DO NOTHING;

    -- Insert House Rules
    INSERT INTO house_rules (id, property_id, rule)
    VALUES 
    (rule_marwadi_1, prop_marwadi_hostel, 'Valid university ID required for entry'),
    (rule_marwadi_2, prop_marwadi_hostel, 'No smoking or alcohol allowed on campus'),
    (rule_ahmedabad_1, prop_ahmedabad_pg, 'Gate closes at 10:30 PM')
    ON CONFLICT (id) DO NOTHING;
END $$;
