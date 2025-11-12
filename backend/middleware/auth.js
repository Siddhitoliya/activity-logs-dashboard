const VECTOR_SECRET_TOKEN = process.env.VECTOR_SECRET_TOKEN;

function authenticateVector(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  if (token !== VECTOR_SECRET_TOKEN) {
    return res.status(403).json({ error: 'Invalid authentication token' });
  }

  next();
}

function authenticateDashboard(req, res, next) {
  next();
}

module.exports = {
  authenticateVector,
  authenticateDashboard
};