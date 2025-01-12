// Importar modelo
const Publication = require("../models/publication");

// Acciones de prueba
const pruebaPublication = (req, res) =>{
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js"
    })
}

// Guardar publicacion
const save = async (req, res) =>{
    // Recoger datos del body
    const params = req.body
    // Si no llegan dar respuesta negativa
    if(!params.text) return res.status(400).send({
        status: "error",
        message: "Debes enviar el texto de la publicacion"
    });
    
    // Crear y rellenar el objeto del modelo 
    let newPublication = new Publication(params);
    newPublication.user = req.user.id
    
    // Guardar objeto en bbdd
    try{
        let publicationStored = await newPublication.save();
        if(!publicationStored){
            return res.status(500).send({
                status: "error",
                message: "No se ha creado la publicacion"
            })
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "publicacion guardada",
            publication: publicationStored
        });
    }catch(e){
        return res.status(500).send({
            status: "error",
            message: "Ah ocurrido un error en la consulta",
            e
        })
    }
}

// Sacar una publicacion

// Eliminar publicaciones

// Listar todas las publicaciones

// Listar publicaciones de un usuario

// Subir ficheros

// Devolver archivos multimedia imagenes


// Exportar acciones
module.exports={
    pruebaPublication,
    save
}