# Database Entity Relationship Diagram

This diagram maps the new normalized PostgreSQL schema that supports real-world data and provenance tracking while maintaining compatibility with the existing TypeScript interfaces.

```mermaid
erDiagram
    COLLEGES ||--o{ PROPERTIES : "nearby_college"
    OWNERS ||--o{ PROPERTIES : "owns/manages"
    PROPERTIES ||--o{ ROOMS : "contains"
    PROPERTIES ||--o{ PROPERTY_AMENITIES : "has"
    PROPERTIES ||--o| FOOD_DETAILS : "provides"
    PROPERTIES ||--o{ HOUSE_RULES : "enforces"
    PROPERTIES ||--o{ PROPERTY_IMAGES : "displays"
    PROPERTIES ||--o{ REVIEWS : "receives"
    USERS ||--o{ FAVORITES : "saves"
    PROPERTIES ||--o{ FAVORITES : "saved_by"
    USERS ||--o{ ENQUIRIES : "creates"
    PROPERTIES ||--o{ ENQUIRIES : "receives"

    COLLEGES {
        uuid id PK
        varchar name
        varchar city
        varchar area
        decimal latitude
        decimal longitude
        varchar short_name
        varchar popular_landmark
        enum verification "verified|unverified|demo"
        text source_url
        timestamp created_at
    }

    OWNERS {
        uuid id PK
        varchar name "nullable"
        varchar role
        varchar phone "nullable"
        varchar whatsapp "nullable"
        varchar response_rate
        boolean is_verified
        text avatar_url
    }

    PROPERTIES {
        uuid id PK
        varchar title
        enum type "PG|Hostel|Room"
        enum gender "boys|girls|co-ed"
        varchar tagline
        text description
        text address
        varchar area
        varchar city
        decimal latitude
        decimal longitude
        uuid nearby_college_id FK
        enum verification "verified|unverified|demo"
        integer starting_rent
        integer deposit
        boolean is_furnished
        boolean is_available_now
        integer notice_period_days
        varchar gate_closing_time
        uuid owner_id FK
        text source_url
        timestamp created_at
        timestamp updated_at
    }

    ROOMS {
        uuid id PK
        uuid property_id FK
        varchar room_type
        enum sharing "single|2-sharing|3-sharing|4-plus-sharing"
        integer rent
        integer deposit
        integer available_beds
        integer total_beds
        boolean is_available
        jsonb features
    }

    PROPERTY_AMENITIES {
        uuid property_id FK
        varchar amenity_name
    }

    FOOD_DETAILS {
        uuid property_id PK, FK
        boolean included
        varchar food_type
        jsonb meals
        text description
        varchar timing
    }

    HOUSE_RULES {
        uuid id PK
        uuid property_id FK
        text rule
    }

    PROPERTY_IMAGES {
        uuid id PK
        uuid property_id FK
        text image_url
        integer display_order
    }
    
    REVIEWS {
        uuid id PK
        uuid property_id FK
        varchar author_name
        varchar college
        varchar course
        decimal rating
        text comment
        timestamp date
        boolean verified_stay
        integer helpful_count
    }

    USERS {
        uuid id PK
        varchar name
        varchar email
        varchar phone
        varchar college
        text avatar_url
        timestamp created_at
    }

    FAVORITES {
        uuid user_id PK, FK
        uuid property_id PK, FK
        timestamp saved_at
    }

    ENQUIRIES {
        uuid id PK
        uuid property_id FK
        varchar property_name
        varchar student_name
        varchar student_phone
        varchar student_college
        enum gender "boys|girls|co-ed"
        date move_in_date
        varchar sharing_preference
        text message
        varchar status
        uuid user_id FK
        timestamp created_at
    }
```
