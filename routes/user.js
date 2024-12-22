const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const check = require("../middelwares/auth");

// Definir rutas
router.get("/prueba-user", check.auth ,UserController.pruebaUser);
router.post("/register", UserController.register);
router.get("/login", UserController.login);

// Exportar router
module.exports= router