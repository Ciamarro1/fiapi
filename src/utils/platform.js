/**
 * FIAPI AI Platform — Platform Response Helpers
 * Standard envelope for all 8 domain services.
 */

export const ok = (c, data, meta = {}) =>
  c.json({ success: true, data, meta: { timestamp: new Date().toISOString(), ...meta } });

export const err = (c, message, status = 400) =>
  c.json({ success: false, error: message }, status);

export const notAllowed = (c) => c.text('Method Not Allowed', 405);

export const noContent = () => new Response(null, { status: 204 });

/** Validates presence and non-empty string */
export const requireString = (val, name, maxLen = 2000) => {
  if (val === undefined || val === null) return `${name} is required`;
  if (typeof val !== 'string' || val.trim() === '') return `${name} must be a non-empty string`;
  if (val.length > maxLen) return `${name} exceeds maximum length of ${maxLen} characters`;
  return null;
};

/** Parse and validate JSON body, returning [body, errorResponse] */
export const parseBody = async (c) => {
  let body;
  try { body = await c.req.json(); } catch { return [null, err(c, 'Invalid JSON request body')]; }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return [null, err(c, 'Request body must be a JSON object')];
  return [body, null];
};
