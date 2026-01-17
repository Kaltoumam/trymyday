const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

async function getUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data).users;
    } catch (error) {
        return [];
    }
}

async function saveUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2));
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const users = await getUsers();

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // In a real app, hash this!
            role: 'client',
            walletBalance: 0,
            joined: new Date().toISOString().split('T')[0],
            transactions: []
        };

        users.push(newUser);
        await saveUsers(users);

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await getUsers();

        // Special Admin Bypass check (from old AuthContext)
        // If it's the admin email, ensure they have admin role
        if (email.toLowerCase() === 'trymyday235@gmail.com') {
            let adminUser = users.find(u => u.email.toLowerCase() === 'trymyday235@gmail.com');
            if (!adminUser) {
                // Create admin if missing
                adminUser = {
                    id: 'admin_1',
                    name: 'Trymyday',
                    email: 'Trymyday235@gmail.com',
                    password: password,
                    role: 'admin',
                    walletBalance: 0,
                    joined: new Date().toISOString().split('T')[0],
                    transactions: []
                };
                users.push(adminUser);
                await saveUsers(users);
            } else if (adminUser.role !== 'admin') {
                adminUser.role = 'admin';
                adminUser.name = 'Trymyday'; // Enforce name
                const idx = users.findIndex(u => u.email === adminUser.email);
                users[idx] = adminUser;
                await saveUsers(users);
            }
            return res.json({ ...adminUser, balance: adminUser.walletBalance });
        }

        const user = users.find(u => u.email === email); // && u.password === password
        // In this simple version we might assume password check is needed if provided, 
        // but legacy code often mocked it. Let's check password if user has one.

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If user has password field, check it (simple string compare for now per legacy style)
        if (user.password && user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ ...user, balance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
