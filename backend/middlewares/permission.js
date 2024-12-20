module.exports = (requiredPermission) => (req, res, next) => {
  if (!req.user || !req.user.permissions.includes(requiredPermission)) {
    return res
      .status(403)
      .json({
        error: `Acces interzis. Nu aveți permisiunea necesară (${requiredPermission}).`,
      });
  }
  next();
};
