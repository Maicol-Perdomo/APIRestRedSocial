// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Acciones de prueba
const pruebaUser = (req, res) =>{
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js"
    })
}

// Registro de usuarios
const register = async (req, res) =>{
    // recoger datos de la peticion
    let params = req.body;
    // Comprobar que me llegan bien (+ validacion)
    if(!params.name || !params.email || !params.password || !params.nick){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    };

    try{
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
                    {email: params.email.toLowerCase()},
                    {nick: params.nick.toLowerCase()}
            ]
        });

		if(users && users.length >= 1){
			return res.status(200).send({
				status: "success",
				message:"El usuario ya existe",
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
    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta"
        });
    }
}

// login de usuarios
const login = async (req, res) =>{
    // Recoger parametros
    let params = req.body
    params.email = params.email.toLowerCase().trim();
    if(!params.email || !params.password){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }
    try{
        // Buscar usuario en la bbdd
        const user = await User.findOne({email: params.email});
        if(!user){
            return res.status(404).json({
                status: "error",
                message: "Usuarion no encontrado"
            })
        }
        // Comprobar contraseña
        const pwd = bcrypt.compareSync(params.password, user.password);
        if(!pwd){
            return res.status(400).json({
                status: "error",
                message: "Contrasenia incorrecta"
            })
        }
        
        // Coseguir Token 
        const token = false;
        
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

    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta"
        });
    }
}

// Exportar acciones
module.exports={
    pruebaUser,
    register,
    login
}