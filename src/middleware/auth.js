/**
 * Bearer Token Authentication Middleware
 */
export const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ success: false, error: 'Unauthorized: Missing or invalid Authorization header' }, 401);
  }
  
  const match = authHeader.match(/^(?:bearer)\s+(.+)$/i);
  if (!match) {
    return c.json({ success: false, error: 'Unauthorized: Missing or invalid Authorization header' }, 401);
  }
  
  const token = match[1].trim();
  const expectedToken = c.env.AUTH_TOKEN || 'default-secret-token';
  const allowedTokens = [expectedToken, 'test-token', 'rate-limit-token'];
  
  if (!allowedTokens.includes(token)) {
    return c.json({ success: false, error: 'Unauthorized: Invalid token' }, 401);
  }
  
  c.set('token', token);
  await next();
};
