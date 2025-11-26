module.exports = (req, res, next) => {
  if (req.usuario?.rol !== "Admin") {
    return res.status(403).json({ error: "Acceso denegado: solo administradores." });
  }
  next();
};
