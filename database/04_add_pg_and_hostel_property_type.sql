-- Migration: Add 'PG AND Hostel' value to property_type ENUM
-- Description: Extends the property_type postgres enum to support combined 'PG AND Hostel' properties.

ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'PG AND Hostel';
