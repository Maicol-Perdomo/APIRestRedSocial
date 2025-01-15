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
const detail = async (req, res) =>{
    // Sacar id de la url
    const publicationId = req.params.id;

    // Find condicion id
    try{
        let publicationFind = await Publication.findById(publicationId).select("-_id -__v");

        if(!publicationFind){
            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion buscada"
            })
        }
        
        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "mostrar publicacion",
            publication: publicationFind
        });

    }catch(e){
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta",
            error: e.message
        });
    }

    
}

// Eliminar publicaciones
const remove = async (req, res) =>{
    // Sacar id 
    const publicationId = req.params.id;

    // Find y luego un remove
    try{
        let publicationRemove = Publication.find({"user": req.user.id, "_id": publicationId}).remove();
    
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "eliminar publicacion",
            publication: publicationRemove
        })
    }catch(e){
        return res.status(500).send({
            status: "error",
            message: "No se ha eliminado la publicacion"
            
        })
    }
}

// Listar todas las publicaciones
const user = async (req, res) =>{
    // sacar id del usuario
    const userId = req.params.id;

    // Controlar la pagina
    let page = 1;

    if(req.params.page){
        page = req.params.page;
    }
    
    const itemsPerPage = 5;

    // Find, populate, ordenar, paginar
    try{
        let publications = await Publication.paginate(
            {user: userId},
            {
                page: page,
                limit: itemsPerPage,
                sort: { created_at: -1},
                select: '-_id -__v',
                populate: [
                    {
                        path: 'user',
                        select: '-password -role -__v'
                    }
                ]
            }
        );

        if(publications.totalDocs <= 0){
            return res.status(404).send({
                status: "succes",
                message: "El usuario no tiene publicaciones"
            })
        }

        return res.status(200).send({
            status: "success",
            message: "listado de publicaciones del usuario",
            publications: publications.docs,
            page: publications.page,
            totalPublications: publications.totalDocs
        });
    }catch(e){
        return res.status(500).send({
            status: error,
            message: "Ha ocurrido un error en la consulta",
            error: e.message
        });
    }


    // devolver usuario
    return res.status(200).send({
        status: "success",
        message: "Publicaciones del perfil de un usuario",
        user: req.user
    })
}

// Listar publicaciones de un usuario (FEED)

// Subir ficheros

// Devolver archivos multimedia imagenes


// Exportar acciones
module.exports={
    pruebaPublication,
    save,
    detail,
    remove,
    user
}