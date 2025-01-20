// Importar dependencias
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Importar modelos
const User = require("../models/user");
const Follow = require("../models/follow");
const Publication = require("../models/publication");


// importar servicios
const jwt = require("../services/jwt");
const followService = require("../services/followService");
const user = require("../models/user");


// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js"
    })
}

// Registro de usuarios
const register = async (req, res) => {
    // recoger datos de la peticion
    let params = req.body;
    // Comprobar que me llegan bien (+ validacion)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    };

    try {
        // Normalizar los datos
        params.email = params.email.toLowerCase().trim();
        params.nick = params.nick.toLowerCase().trim();
        params.name = params.name.toLowerCase().trim();

        // Control de usuarios duplicados 
        /*
          Todas las condiciones del or se tienen que cumplir una u otra
          Si existe una u otra, es que existe el usuario
        */
        const users = await User.find({
            $or:
                [
                    { email: params.email.toLowerCase() },
                    { nick: params.nick.toLowerCase() }
                ]
        });

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe",
                field: users[0].email == params.email ? "El email ya esta registrado" : "El nick ya esta registrado"
            });
        }
        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10)
        params.password = pwd;

        // Crear objeto de usuario
        let user_to_save = new User(params);

        // Guardar usuario en la bbdd
        const userStored = await user_to_save.save();

        const userToReturn = userStored.toObject();
        delete userToReturn.password;

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Usuario Registrado correctamente",
            user: userToReturn
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta"
        });
    }
}

// login de usuarios
const login = async (req, res) => {
    // Recoger parametros
    let params = req.body
    params.email = params.email.toLowerCase().trim();
    if (!params.email || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }
    try {
        // Buscar usuario en la bbdd
        const user = await User.findOne({ email: params.email });
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Usuarion no encontrado"
            })
        }
        // Comprobar contraseña
        const pwd = bcrypt.compareSync(params.password, user.password);
        if (!pwd) {
            return res.status(400).json({
                status: "error",
                message: "Contrasenia incorrecta"
            })
        }

        // Coseguir Token 
        const token = jwt.createTokens(user);

        // Devolver Datos Usuario
        return res.status(200).json({
            status: "success",
            message: "Te has identificado correctamente",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick,
            },
            token
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta"
        });
    }
}

const profile = async (req, res) => {
    // Recibir el parametro del id de ususario por url
    let userId = req.params.id;

    try {
        // Consulta para sacar los datos del usuario, sin devolver password ni role
        let userProfile = await User.findById(userId).select("-password -role");
        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "El Usuario no esta registrado"
            })
        }

        //Info de seguimiento
        const followInfo = await followService.followThisUser(req.user.id, userId)
        // Devolver resultado
        return res.status(200).send({
            status: "succes",
            user: userProfile,
            follower: followInfo.follower,
            following: followInfo.following
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta"
        });
    }
}

const list = async (req, res) => {
    // Controlar en que pagina estamos
    let page = parseInt(req.params.page) || 1;
    let itemsPerPage = 5;

    try {
        // Consulta con mongoose paginate
        const options = {
            page: page,
            limit: itemsPerPage,
            sort: { _id: 1 },
            select: '-password -email -role -__v'
        };

        const result = await User.paginate({}, options);

        if (!result.docs || result.docs.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios que mostrar"
            });
        }
        //Sacar un array de ids de los usuarios que me siguen y los sigo como victor
        let followUserIds = await followService.followUserIds(req.user.id);

        // Devolver resultado
        return res.status(200).send({
            status: "success",
            message: "Ruta de listado de usuarios",
            users: result.docs,
            totalUsers: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta"
        });
    }
};

const update = async (req, res) => {
    // Recoger los datos del usuario
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Elimnar campos innecesarios
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // Comprobar si el usuario existe
    try {
        // Normalizar los datos si existen
        if (userToUpdate.email) userToUpdate.email = userToUpdate.email.toLowerCase().trim();
        if (userToUpdate.nick) userToUpdate.nick = userToUpdate.nick.toLowerCase().trim();
        if (userToUpdate.name) userToUpdate.name = userToUpdate.name.toLowerCase().trim();

        // Control de usuarios duplicados 
        /*
          Todas las condiciones del or se tienen que cumplir una u otra
          Si existe una u otra, es que existe el usuario
        */
        const users = await User.find({
            $or:
                [
                    { email: userToUpdate.email.toLowerCase() },
                    { nick: userToUpdate.nick.toLowerCase() }
                ]
        });

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            })
        }

        // Cifrar la contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10)
            userToUpdate.password = pwd;
        }else{
            delete userToUpdate.password;
        }

        // Buscar y actualizar
        let userUpdate = await User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true });

        if (!userUpdate) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no se ha actualizado"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Metodo actualizar usuario",
            user: userUpdate
        });
    } catch (err) {
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta"
        })
    }
}

const upload = async (req, res) => {
    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "No se ha subido ninguna imagen"
        })
    };

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1].toLowerCase();

    // Comprobar la extension, solo imagenes, si no es valida borrar el fichero
    const validExtensions = ["png", "jpg", "jpeg", "gif", "webp"];
    if (!validExtensions.includes(extension)) {
        // borrar el archivo
        const filePath = req.file.path;
        fs.unlinkSync(filePath);

        // Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "La extension del archivo no es valida"
        });
    }

    try {
        /*
        // si es correcto, guardar la imagen
        let updatedUser = await User.findByIdAndUpdate(req.user.id, {image: req.file.filename}, {new: true});
        */
        // Buscar el usuario
        let updatedUser = await User.findById(req.user.id);
        if (!updatedUser) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no encontrado"
            });
        }
        // obtener image
        let imageUser = updatedUser.image;
        // si tiene imagen, borrarla
        if (imageUser || imageUser != "default.png") {
            const filePath = `./uploads/avatars/${imageUser}`;
            fs.unlinkSync(filePath);
        }
        // Actualizar usuario
        updatedUser.image = req.file.filename;
        await updatedUser.save();


        // Devolver respuesta positiva
        return res.status(200).send({
            status: "success",
            message: "Metodo subir imagen",
            user: {
                name: updatedUser.name,
                nick: updatedUser.nick,
                image: updatedUser.image
            }
        });

    } catch (err) {
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta",
            error: err
        })
    }
}

const avatar = (req, res) => {
    // Sacar parametro de la url
    const file = req.params.file;

    // montar el path real de la imagen
    const filePath = `./uploads/avatars/${file}`;

    // comprobar que existe 
    fs.stat(filePath, (error, exist) => {
        if (error) {
            return res.status(500).send({
                status: "error",
                message: "Error en la consulta"
            })
        }

        if (!exist) {
            return res.status(404).send({
                status: "error",
                message: "La imagen no existe"
            })
        }

        // devolver file
        return res.sendFile(path.resolve(filePath));
    })
}

const counters = async (req, res) =>{
    let userId = req.user.id;

    if(req.params.id){
        userId = req.params.id;
    }
    try{
    const following = await Follow.countDocuments({"user": userId});

    const followed = await Follow.countDocuments({"followed": userId});

    const publications = await Publication.countDocuments({"user": userId});

    return res.status(200).send({
        userId,
        following,
        followed,
        publications
    })
    }catch(e){
        return res.status(500).send({
            status: "error",
            message: "error en counter",
            error: e.message
        })
    }
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}