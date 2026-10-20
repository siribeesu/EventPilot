import { Router } from 'express';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CreateVendorSchema, UpdateVendorSchema } from '../schemas/index.js';

const router = Router();

// GET all vendors for an event
router.get('/events/:id/vendors', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found or access denied' });

    const vendors = await db.getVendors(event.id);
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST add vendor to an event
router.post('/events/:id/vendors', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found or access denied' });

    const parsed = CreateVendorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const vendor = await db.createVendor({
      event_id: event.id,
      ...parsed.data,
    });

    res.status(201).json(vendor);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH update vendor with ownership verification
router.patch('/vendors/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const vendorId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';

    const isOwner = await db.verifyVendorOwnership(vendorId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: vendor does not belong to user events' });
    }

    const parsed = UpdateVendorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const updated = await db.updateVendor(vendorId, parsed.data);
    if (!updated) return res.status(404).json({ error: 'Vendor not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE vendor with ownership verification
router.delete('/vendors/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const vendorId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';

    const isOwner = await db.verifyVendorOwnership(vendorId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: vendor does not belong to user events' });
    }

    const deleted = await db.deleteVendor(vendorId);
    if (!deleted) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
