const validator = require("validator");

const validate = (params) =>{
    let name = !validator.isEmpty(params.name) &&
                validator.isLength(params.name, {min: 3, max: undefined}) &&
                validator.isAlpha(params.name, "es-ES");
    let surname
    let nick
    let email
    let password
    let bio

    if (!name){
        throw new Error("No se ha superado la validacion")
    }
}

module.exports = validate