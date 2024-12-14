module.exports = (requiredRoles) => (req, res, next) => {
  if (!req.user || !requiredRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Acces interzis. Rol insuficient.' });
  }
  next();
};
