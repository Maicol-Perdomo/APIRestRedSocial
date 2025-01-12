const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");
const check = require("../middelwares/auth");

// Definir Rutas
router.get("/prueba-publication", PublicationController.pruebaPublication);
router.post("/save", check.auth, PublicationController.save);

// Exportar Rutas
module.exports = router;