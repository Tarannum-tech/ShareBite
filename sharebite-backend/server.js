const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const foodRoutes = require('./routes/foodRoutes');
const authRoutes = require('./routes/authRoutes');
const crypto = require('crypto');
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({limit:'1mb'}));
app.get('/', (req,res) => res.json({ name:'ShareBite API', status:'running', health:'/api/health' }));
app.get('/api/health', (req,res) => res.json({ ok:true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', authRoutes);
function requireAuth(req,res,next) {
 const header = req.headers.authorization || '';
 const token = header.startsWith('Bearer ') ? header.slice(7) : '';
 if (!token || !process.env.JWT_SECRET) return res.status(401).json({ message:'Please sign in to continue.' });
 const parts = token.split('.');
 if (parts.length !== 2) return res.status(401).json({ message:'Your session is invalid. Please sign in again.' });
 const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(parts[0]).digest();
 let supplied; try { supplied = Buffer.from(parts[1], 'base64url'); } catch { return res.status(401).json({ message:'Your session is invalid. Please sign in again.' }); }
 if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return res.status(401).json({ message:'Your session is invalid. Please sign in again.' });
 let payload; try { payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')); } catch { return res.status(401).json({ message:'Your session is invalid. Please sign in again.' }); }
 if (!payload.exp || payload.exp < Math.floor(Date.now()/1000)) return res.status(401).json({ message:'Your session has expired. Please sign in again.' });
 req.user = payload; next();
}
app.use('/api', requireAuth, foodRoutes);
app.use((err,req,res,next) => { console.error(err.message); const status = err.name === 'ValidationError' ? 400 : err.name === 'CastError' ? 400 : 500; res.status(status).json({message: status === 500 ? 'Server error. Check MongoDB connection and server logs.' : err.message}); });
const PORT = process.env.PORT || 5000;
async function start(){
 if(!process.env.MONGO_URI){ console.error('MONGO_URI is missing. Copy .env.example to .env and configure MongoDB.'); process.exit(1); }
 if(!process.env.JWT_SECRET){ console.error('JWT_SECRET is missing. Add a long random JWT_SECRET to sharebite-backend/.env.'); process.exit(1); }
 try { await mongoose.connect(process.env.MONGO_URI); console.log('MongoDB connected'); app.listen(PORT,()=>console.log(`ShareBite API listening on http://localhost:${PORT}`)); }
 catch(err){ console.error('MongoDB connection failed:',err.message); process.exit(1); }
}
start();
