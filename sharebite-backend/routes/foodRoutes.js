const express = require('express');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const Delivery = require('../models/Delivery');
const Food = require('../models/Food');
const router = express.Router();
const asyncRoute = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const requireRole = (...roles) => (req,res,next) => roles.includes(req.user?.role) ? next() : res.status(403).json({message:'Your account role is not allowed to perform this action.'});

router.get('/health', (req,res) => res.json({ ok: true, database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected' }));
router.get('/donations', asyncRoute(async (req,res) => res.json(await Donation.find().sort({ createdAt: -1 }))));
router.post('/donations', requireRole('donor'), asyncRoute(async (req,res) => {
 const { title, quantity, location, donor } = req.body;
 if (!title?.trim() || !Number.isFinite(Number(quantity)) || Number(quantity) < 1 || !location?.trim() || !donor?.trim()) return res.status(400).json({message:'Title, valid quantity, pickup location and donor are required.'});
 const item = await Donation.create({...req.body, quantity:Number(quantity)}); res.status(201).json(item);
}));
router.patch('/donations/:id', requireRole('donor'), asyncRoute(async (req,res) => { const item = await Donation.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true}); if(!item) return res.status(404).json({message:'Donation not found'}); res.json(item); }));
router.delete('/donations/:id', requireRole('donor'), asyncRoute(async (req,res) => { const item = await Donation.findByIdAndDelete(req.params.id); if(!item) return res.status(404).json({message:'Donation not found'}); await Request.deleteMany({donationId:req.params.id}); await Delivery.deleteMany({donationId:req.params.id}); res.json({message:'Donation deleted'}); }));
router.get('/requests', asyncRoute(async (req,res) => res.json(await Request.find().sort({createdAt:-1}))));
router.post('/requests', requireRole('needy','charity'), asyncRoute(async (req,res) => {
 const {donationId, donationTitle, requester, requesterRole, quantity, location} = req.body;
 if(!donationId || !donationTitle || !requester) return res.status(400).json({message:'Donation and requester details are required.'});
 const donation = await Donation.findById(donationId); if(!donation) return res.status(404).json({message:'Donation not found.'});
 if(donation.status !== 'Available') return res.status(409).json({message:'This donation is no longer available.'});
 const existing = await Request.findOne({donationId, requester, status:{$in:['Pending','Approved']}}); if(existing) return res.status(409).json({message:'You already have an active request for this donation.'});
 const item = await Request.create({donationId, donationTitle, requester, requesterRole, quantity:quantity || donation.quantity, location:location || donation.location});
 donation.status='Claimed'; await donation.save(); res.status(201).json(item);
}));
router.patch('/requests/:id', requireRole('charity'), asyncRoute(async (req,res) => { const item = await Request.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true}); if(!item) return res.status(404).json({message:'Request not found'}); res.json(item); }));
router.get('/deliveries', asyncRoute(async (req,res) => res.json(await Delivery.find().sort({createdAt:-1}))));
router.post('/deliveries', requireRole('charity'), asyncRoute(async (req,res) => { const {donationId,title} = req.body; if(!donationId || !title) return res.status(400).json({message:'Donation details are required.'}); res.status(201).json(await Delivery.create(req.body)); }));
router.patch('/deliveries/:id', requireRole('volunteer'), asyncRoute(async (req,res) => { const item = await Delivery.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true}); if(!item) return res.status(404).json({message:'Delivery task not found'}); res.json(item); }));
// Backwards-compatible legacy food endpoints.
router.get('/foods', asyncRoute(async (req,res) => res.json(await Food.find().sort({ _id:-1 }))));
router.post('/foods', asyncRoute(async (req,res) => { const {name,quantity}=req.body; if(!name || !quantity) return res.status(400).json({message:'Name and quantity are required'}); res.status(201).json(await Food.create({name,quantity})); }));
router.put('/foods/:id', asyncRoute(async (req,res) => { const item=await Food.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}); if(!item)return res.status(404).json({message:'Food item not found'}); res.json(item); }));
router.delete('/foods/:id', asyncRoute(async (req,res) => { const item=await Food.findByIdAndDelete(req.params.id); if(!item)return res.status(404).json({message:'Food item not found'}); res.json({message:'Food item deleted'}); }));
module.exports = router;
