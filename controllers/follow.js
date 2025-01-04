const Follow = require("../models/follow")
const User = require("../models/user")

// Acciones de prueba
const pruebaFollow = (req, res) =>{
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/follow.js"
    })
}

// Accion de guardar un follow (accion seguir)
const save = async (req, res) => {

    // Conseguir datos por body
    const params = req.body;

    // Sacar id del usuario identificado
    const identity = req.user;

    // Crear objeto con modelo follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    // Guardar objeto en bbdd
    try{
        let followStored = await userToFollow.save();
        if(!followStored){
            return res.status(404).send({
                status: "error",
                message: "No se ha podido seguir al usuario"
            })
        }
        return res.status(200).send({
            status: "success",
            message: "Metodo dar follow",
            follow: followStored
        })
    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "Error en el servidor",
            error: error.message
        })
    }
}

// Accion de borrar un follow (accion dejar de seguir)

// Accion listado de usuarios que estoy siguiendo

// Accion listado de usuarios que me siguen

// Exportar acciones
module.exports={
    pruebaFollow,
    save
}