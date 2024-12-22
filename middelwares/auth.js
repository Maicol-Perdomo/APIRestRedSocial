// Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave Secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// Funcion autenticacion 
exports.auth = (req, res, next) => {
    // Comprobar si me llega la cabecera de auth
    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabezera de autenticacion"
        });
    }

    // Limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, '');

    // Decodificar el token
    try{
        let payload = jwt.decode(token,secret);
        // Comprobar si el token ha expirado
        if(payload.exp <= moment().unix()){
            return res.status(404).send({
                status: "error",
                message: "El token ha expirado"
            })
        };

        // Agregar datos de usuario al request
        req.user = payload;
    
    }catch(ex){
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            ex
        })
    }



    // pasar a la ejecucuion de accion
    next();
}
