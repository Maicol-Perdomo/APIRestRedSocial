const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");

// Definir Rutas
router.get("/prueba-publication", PublicationController.pruebaPublication);

// Exportar Rutas
module.exports = router;