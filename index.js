const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// GET all properties
app.get('/api/properties', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM properties ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data from database" });
    }
});

// GET single property
app.get('/api/properties/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Property not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching property" });
    }
});

// POST new property
app.post('/api/properties', async (req, res) => {
    try {
        const p = req.body;
        const id = Date.now().toString();
        const query = `
            INSERT INTO properties (
                id, title, type, price, area, rooms, bathrooms, location, status, image, "isAvailable", "isSpecialOffer"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [
            id, p.title, p.type, p.price, p.area, p.rooms, p.bathrooms, p.location, p.status, p.image,
            p.isAvailable ?? true, p.isSpecialOffer ?? false
        ];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving property" });
    }
});

// PUT update property
app.put('/api/properties/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const p = req.body;
        const query = `
            UPDATE properties SET 
                title = COALESCE($1, title),
                type = COALESCE($2, type),
                price = COALESCE($3, price),
                area = COALESCE($4, area),
                rooms = COALESCE($5, rooms),
                bathrooms = COALESCE($6, bathrooms),
                location = COALESCE($7, location),
                status = COALESCE($8, status),
                image = COALESCE($9, image),
                "isAvailable" = COALESCE($10, "isAvailable"),
                "isSpecialOffer" = COALESCE($11, "isSpecialOffer")
            WHERE id = $12
            RETURNING *
        `;
        const values = [
            p.title, p.type, p.price, p.area, p.rooms, p.bathrooms, p.location, p.status, p.image,
            p.isAvailable, p.isSpecialOffer, id
        ];
        const { rows } = await db.query(query, values);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Property not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating property" });
    }
});

// DELETE property
app.delete('/api/properties/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM properties WHERE id = $1', [req.params.id]);
        if (result.rowCount > 0) {
            res.json({ message: "Property deleted" });
        } else {
            res.status(404).json({ message: "Property not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting property" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

