const Follow = require("../models/follow");
const User = require("../models/user");

// Importar servicio
const followService = require("../services/followService");

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
const unfollow = async (req, res) =>{
    // Conseguir id del usuario identificado
    const userId = req.user.id;
    // Conseguir id del usuario a dejar de seguir
    const followedId = req.params.id;

    // Find de las coincidencias y hacer remove
    try{
        let followDeleted = await Follow.find({
            "user": userId, 
            "followed": followedId
        }).deleteOne()

        return res.status(200).send({
            status: "error",
            message: "Follow eliminado Correctamente"
        })

    }catch(error){
        return res.status(500).send({
            status: "error",
            message: "Ah ocurrido un error al dejar de seguir al usuario",
            error: error.message
        })
    }

}

// Accion listado de usuarios que cualquier usuario está siguiendo
const following = async (req, res) =>{
    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega el id por parametro en url
    if(req.params.id) userId = req.params.id;

    // comprobar si me llega la pagina, si no la pagina 1
    let page = 1;
    if(req.params.page) page = req.params.page;

    // Usuarios por pagina quiero mostrar
    const itemsPerPage = 2;

    // Find a follow, popular datos de los usuario y paginar con mongoose-paginate-v2
    try{
        let followings = await Follow.paginate(
            {user: userId}, 
            {
                page: page, 
                limit: itemsPerPage,
                sort: {created_at: -1},
                select: '-_id -__v -created_at',
                populate: [
                    {
                        path: 'followed',
                        select: '-password -role -__v -created_at'
                    },
                    {
                        path: 'user',
                        select: 'name'
                    }

                ]
            });
        
        // Listado de usuarios de trinity y soy victor
        //Sacar un array de ids de los usuarios que me siguen y los sigo como victor
        let followUserIds = await followService.followUserIds(userId);

        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que esta siguiendo",
            followings: followings.docs,
            totalUsers: followings.totalDocs,
            totalPages: followings.totalPages,
            page: followings.page,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        })

    }catch(err){
        return res.status(500).send({
            status: "success",
            message: "Error en la consulta"
        })
    }



    return res.status(200).send({
        status: "success",
        message: "Listado de usuarios que estoy siguiendo"
    })
}

// Accion listado de usuarios que me siguen
const followers = async (req, res) =>{
    return res.status(200).send({
        status: "success",
        message: "Listado de usuarios que me siguen"
    })
}

// Exportar acciones
module.exports={
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}