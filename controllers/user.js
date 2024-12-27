// Importar dependencias
const bcrypt = require("bcrypt");

// Importar modelos
const User = require("../models/user");


// importar servicios
const jwt = require("../services/jwt");
const user = require("../models/user");

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

    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta"
        });
    }
}

const profile = async (req, res) => {
    // Recibir el parametro del id de ususario por url
    let userId = req.params.id;
   
    try{
        // Consulta para sacar los datos del usuario, sin devolver password ni role
        let userProfile = await User.findById(userId).select("-password -role");
        if(!userProfile){
            return res.status(404).send({
                status: "error",
                message: "El Usuario no esta registrado"
            })
        }

        // Devolver resultado
        return res.status(200).send({
            status: "succes",
            user: userProfile
        })

    }catch(error){
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
            sort: { _id: 1 }
        };

        const result = await User.paginate({}, options);

        if (!result.docs || result.docs.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios que mostrar"
            });
        }

        // Devolver resultado
        return res.status(200).send({
            status: "success",
            message: "Ruta de listado de usuarios",
            users: result.docs,
            totalUsers: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta"
        });
    }
};

const update = async (req, res) =>{
    // Recoger los datos del usuario
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Elimnar campos innecesarios
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // Comprobar si el usuario existe
    try{
        // Normalizar los datos si existen
        if(userToUpdate.email) userToUpdate.email = userToUpdate.email.toLowerCase().trim();
        if(userToUpdate.nick) userToUpdate.nick = userToUpdate.nick.toLowerCase().trim();
        if(userToUpdate.name) userToUpdate.name = userToUpdate.name.toLowerCase().trim();

        // Control de usuarios duplicados 
        /*
          Todas las condiciones del or se tienen que cumplir una u otra
          Si existe una u otra, es que existe el usuario
        */
        const users = await User.find({ 
            $or: 
                [
                    {email: userToUpdate.email.toLowerCase()},
                    {nick: userToUpdate.nick.toLowerCase()}
            ]
        });   

        let userIsset = false;
        users.forEach(user => {
            if(user && user._id != userIdentity.id) userIsset = true;
        });

        if(userIsset){
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            })
        }

        // Cifrar la contraseña
        if(userToUpdate.password){
            let pwd = await bcrypt.hash(userToUpdate.password, 10)
            userToUpdate.password = pwd;
        }

        // Buscar y actualizar
        let userUpdate = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, {new: true});

        if(!userUpdate){
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
    }catch(err){
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta",
            userToUpdate
        })
    }
}

// Exportar acciones
module.exports={
    pruebaUser,
    register,
    login,
    profile,
    list,
    update
}