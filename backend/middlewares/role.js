const roleMiddleware = (requiredRoles) => (req, res, next) => {
  if (!req.user || !requiredRoles.includes(req.user.role)) {
    return res
      .status(403)
      .json({
        error: `Acces interzis. Trebuie să aveți unul dintre următoarele roluri: ${requiredRoles.join(', ')}.`,
      });
  }
  next();
};

module.exports = {
  roleMiddleware,
};
