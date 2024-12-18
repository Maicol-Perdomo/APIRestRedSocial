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
				message:"El usuario ya existe"
			});
		}      
        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10)
        params.password = pwd;

        // Crear objeto de usuario
        let user_to_save = new User(params);
        
        // Guardar usuario en la bbdd
        const userStored = await user_to_save.save();

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Usuario Registrado correctamente",
            userStored
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
    register
}