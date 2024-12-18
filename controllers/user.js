
// Acciones de prueba
const pruebaUser = (req, res) =>{
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js"
    })
}

// Registro de usuarios
const register = (req, res) =>{
    // recoger datos de la peticion

    // Comprobar que me llegan bien (+ validacion)

    // Control usuarios duplicados

    // Cifrar la contraseña

    // Guardar usuario en la bbdd

    // Devolver resultado
    return res.status(200).json({
        message: "Accion de registro de usuarios"
    });
}

// Exportar acciones
module.exports={
    pruebaUser,
    register
}