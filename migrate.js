const fs = require('fs');
const path = require('path');
const db = require('./db');

const DATA_FILE = path.join(__dirname, 'properties.json');

const migrate = async () => {
    try {
        console.log('Starting migration...');

        // 1. Create Table
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await db.query(schema);
        console.log('Table "properties" checked/created.');

        // 2. Read JSON data
        if (!fs.existsSync(DATA_FILE)) {
            console.log('No properties.json found. Skipping data migration.');
            return;
        }

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        console.log(`Found ${data.length} records in JSON.`);

        // 3. Insert into PG
        for (const p of data) {
            const query = `
                INSERT INTO properties (
                    id, title, type, price, area, rooms, bathrooms, location, status, image, "isAvailable", "isSpecialOffer"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (id) DO NOTHING
            `;
            const values = [
                p.id, p.title, p.type, p.price, p.area, p.rooms, p.bathrooms, p.location, p.status || 'متاح', p.image,
                p.isAvailable !== undefined ? p.isAvailable : true,
                p.isSpecialOffer !== undefined ? p.isSpecialOffer : false
            ];
            await db.query(query, values);
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
