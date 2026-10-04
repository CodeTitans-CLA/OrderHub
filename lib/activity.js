import dbConnect from './mongodb';
import ActivityLog from '@/models/ActivityLog';

const demo = [];
export async function addActivity(payload) {
  try {
    const db = await dbConnect();
    if (!db) {
      const item = { _id: String(Date.now()+Math.random()), ...payload, createdAt: new Date().toISOString() };
      demo.unshift(item); demo.splice(100); return item;
    }
    return await ActivityLog.create(payload);
  } catch (e) {
    console.error('Activity log failed:', e.message);
    return null;
  }
}
export async function getActivities(limit=30) {
  const db = await dbConnect();
  if (!db) return demo.slice(0, limit);
  return ActivityLog.find().sort({ createdAt: -1 }).limit(limit).lean();
}
