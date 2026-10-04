import { isAdmin } from './session';

function clean(v = '') { return String(v ?? '').replace(/\u00A0/g, ' ').trim().toLowerCase(); }

export function orderBelongsToUser(order, user) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const needles = [user.sheetName, user.name].map(clean).filter(Boolean);
  if (!needles.length) return false;
  const employee = clean(order['Employee Name']);
  const assign = clean(order['Assign Person']);
  return needles.some(n => employee === n || assign.split(/[\/,|]+/).map(clean).includes(n) || assign.includes(n));
}

export function filterOrdersForUser(orders, user) {
  return isAdmin(user) ? orders : orders.filter(o => orderBelongsToUser(o, user));
}
