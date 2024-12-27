/* 
  OBJETOS QUE VAN A DEFINIR EL MOLDE QUE VA A TENER CADA DOCUMENTO QUE VOY A GUARDAR 
*/
const {Schema, model} = require("mongoose");
const mongoosePagination = require("mongoose-paginate-v2")

const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    surname: String,
    bio: String,
    nick: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "role_user"
    },
    image: {
        type: String,
        default: "default.png"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

UserSchema.plugin(mongoosePagination);

module.exports = model("User", UserSchema, "users"); // nombre, formato, en que coleccion de datos lo guardare(por defecto seria users)
