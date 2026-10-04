/**
 * OrderHub Google Sheet audit bridge
 * 1) Set WEBHOOK_URL to https://YOUR-DOMAIN.com/api/audit/webhook
 * 2) Set WEBHOOK_SECRET to the same AUDIT_WEBHOOK_SECRET used in .env
 * 3) In Apps Script > Triggers, create an INSTALLABLE "On edit" trigger for onOrderHubEdit.
 *
 * Note: Google may not expose the editor's email in every account/security context.
 */
const WEBHOOK_URL = 'https://YOUR-DOMAIN.com/api/audit/webhook';
const WEBHOOK_SECRET = 'CHANGE_ME';
const ORDER_ID_HEADER = 'Order ID';

function onOrderHubEdit(e) {
  if (!e || !e.range || e.range.getRow() === 1) return;
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  const col = e.range.getColumn();
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const field = headers[col - 1] || `Column ${col}`;
  const orderIdCol = headers.indexOf(ORDER_ID_HEADER) + 1;
  const orderId = orderIdCol > 0 ? sheet.getRange(row, orderIdCol).getDisplayValue() : '';
  let actorEmail = '';
  try {
    if (e.user && typeof e.user.getEmail === 'function') actorEmail = e.user.getEmail() || '';
    if (!actorEmail) actorEmail = Session.getActiveUser().getEmail() || '';
  } catch (err) {}
  const payload = {
    actorName: actorEmail || 'Unknown Sheet Editor',
    actorEmail,
    orderId,
    rowNumber: row,
    field,
    oldValue: typeof e.oldValue === 'undefined' ? '' : e.oldValue,
    newValue: typeof e.value === 'undefined' ? '' : e.value
  };
  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-orderhub-secret': WEBHOOK_SECRET },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
