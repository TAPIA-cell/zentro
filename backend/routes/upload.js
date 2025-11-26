// backend/routes/upload.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// 🟢 RUTA REAL donde quieres guardar las imágenes:
const IMG_DIR = "/home/ubuntu/zentro-react/public/img";

// Crear carpeta si no existe
if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  console.log("✔ Carpeta creada:", IMG_DIR);
}

// Validar formatos permitidos
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Formato no permitido"), false);
  }
  cb(null, true);
};

// Config storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMG_DIR);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, unique + ext);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// SUBIR IMAGEN
router.post("/", upload.single("imagen"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió archivo" });

  const url = `/img/${req.file.filename}`; // lo que React usará

  return res.json({ ok: true, url });
});

export default router;
