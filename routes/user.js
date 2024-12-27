const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const check = require("../middelwares/auth");

// Definir rutas
router.get("/prueba-user", check.auth ,UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);

// Exportar router
module.exports= router