const express = require('express');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/User');
const router = express.Router();
const scrypt = promisify(crypto.scrypt);
const secret = process.env.JWT_SECRET;

function makeToken(user) {
  const payload = Buffer.from(JSON.stringify({ sub: String(user._id), role: user.role, name: user.name, exp: Math.floor(Date.now()/1000) + 7*24*60*60 })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}
async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}
async function verifyPassword(password, stored) {
  const [salt, key] = (stored || '').split(':');
  if (!salt || !key) return false;
  const candidate = await scrypt(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  return expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);
}
function publicUser(user) { return { id: String(user._id), name: user.name, email: user.email, role: user.role }; }

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password || !role) return res.status(400).json({ message: 'Name, email, password and role are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (!['donor','charity','volunteer','needy'].includes(role)) return res.status(400).json({ message: 'Choose a valid account role.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password), role });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' }); next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email?.trim() || !password || !role) return res.status(400).json({ message: 'Email, password and role are required.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await verifyPassword(password, user.passwordHash))) return res.status(401).json({ message: 'Incorrect email or password.' });
    if (user.role !== role) return res.status(403).json({ message: `This account is registered as ${user.role}. Choose that role to sign in.` });
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
});
module.exports = router;
