// Importar modelo
const Publication = require("../models/publication");

// Acciones de prueba
const pruebaPublication = (req, res) =>{
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js"
    })
}

// Guardar publicacion

// Sacar una publicacion

// Eliminar publicaciones

// Listar todas las publicaciones

// Listar publicaciones de un usuario

// Subir ficheros

// Devolver archivos multimedia imagenes


// Exportar acciones
module.exports={
    pruebaPublication
}