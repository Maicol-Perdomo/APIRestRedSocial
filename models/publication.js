const {Schema, model} = require("mongoose");
const mongoosePagination = require("mongoose-paginate-v2")

const PublicationSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    text:{
        type: String,
        require: true
    },
    file: String,
    created_at: {
        type: Date,
        default: Date.now
    }
    
});

PublicationSchema.plugin(mongoosePagination);

module.exports = model("Publication", PublicationSchema, "publications");