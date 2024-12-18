// Importar dependencias y modulos
const User = require("../models/user")

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

    // Crear objeto de usuario
    let user_to_save = new User(params);
    try{
        // Control de usuarios duplicados 
        /*
          Todas las condiciones del or se tienen que cumplir una u otra
          Si existe una u otra, es que existe el usuario
        */
        const users = await User.find({ 
            $or: 
                [
                    {email: user_to_save.email.toLowerCase()},
                    {nick: user_to_save.nick.toLowerCase()}
            ]
        });

		if(users && users.length >= 1){
			return res.status(200).send({
				status: "success",
				message:"El usuario ya existe"
			});
		}      
        // Cifrar la contraseña

        // Guardar usuario en la bbdd

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Accion de registro de usuarios",
            params,
            user_to_save
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