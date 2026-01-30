CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT,
    price NUMERIC,
    area NUMERIC,
    rooms INTEGER,
    bathrooms INTEGER,
    location TEXT,
    status TEXT,
    image TEXT,
    "isAvailable" BOOLEAN DEFAULT true,
    "isSpecialOffer" BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
