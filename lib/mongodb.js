import mongoose from 'mongoose';

const state = global._orderHubMongo || (global._orderHubMongo = { conn: null, promise: null });

export default async function dbConnect() {
  if (process.env.DEMO_MODE !== 'false' && !process.env.MONGODB_URI) return null;
  if (!process.env.MONGODB_URI) return null;
  if (state.conn) return state.conn;
  if (!state.promise) state.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  state.conn = await state.promise;
  return state.conn;
}
