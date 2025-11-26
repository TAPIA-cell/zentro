import jwt from "jsonwebtoken";

// Middleware para verificar token
export const authRequired = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Middleware para permitir solo administradores
export const adminOnly = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ error: "No autenticado" });

  if (req.user.rol !== "Admin")
    return res.status(403).json({ error: "Acceso denegado: solo Admin" });

  next();
};
