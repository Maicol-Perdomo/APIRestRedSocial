const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
const check = require("../middelwares/auth");

// Definir rutas

router.get("/prueba-follow", FollowController.pruebaFollow);
router.post("/save", check.auth, FollowController.save);


// Exportar rutas
module.exports = router;