import dbConnect from './mongodb';
import User from '@/models/User';
import { hashPassword, verifyPassword } from './password';

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function isGmail(email) {
  return normalizeEmail(email).endsWith('@gmail.com');
}

export async function findDbUserByEmail(email) {
  const db = await dbConnect();
  if (!db) return null;
  return User.findOne({ email: normalizeEmail(email) }).lean();
}

export async function authenticateDbUser(email, password) {
  const db = await dbConnect();
  if (!db) return null;
  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) return null;
  if (!user.emailVerified) throw new Error('Please verify your Gmail before signing in.');
  return user.toObject();
}

export async function createLocalUser({ name, email, password, sheetName = '' }) {
  const db = await dbConnect();
  if (!db) throw new Error('MongoDB is required for user signup.');
  const normalized = normalizeEmail(email);
  if (!isGmail(normalized)) throw new Error('Please use a Gmail address.');
  if (String(password || '').length < 8) throw new Error('Password must be at least 8 characters.');
  const exists = await User.findOne({ email: normalized });
  if (exists) throw new Error('An account with this email already exists.');
  return User.create({
    name: String(name || '').trim(),
    email: normalized,
    passwordHash: hashPassword(password),
    role: 'User',
    sheetName: String(sheetName || name || '').trim(),
    monthlyTarget: 1100,
    emailVerified: false,
  });
}

export async function upsertGoogleUser(profile) {
  const db = await dbConnect();
  if (!db) throw new Error('MongoDB is required for Google sign-in.');
  const email = normalizeEmail(profile.email);
  if (!profile.verified_email) throw new Error('Google email is not verified.');
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: profile.name || email.split('@')[0],
      email,
      role: 'User',
      googleSub: profile.id || '',
      picture: profile.picture || '',
      sheetName: profile.name || '',
      monthlyTarget: 1100,
      emailVerified: true,
    });
  } else {
    user.googleSub = profile.id || user.googleSub;
    user.picture = profile.picture || user.picture;
    if (!user.name) user.name = profile.name || email.split('@')[0];
    await user.save();
  }
  return user.toObject();
}

export async function listUsers() {
  const db = await dbConnect();
  if (!db) return [];
  return User.find().sort({ createdAt: -1 }).select('-passwordHash -resetTokenHash -verifyTokenHash').lean();
}
