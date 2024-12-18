// Importar dependencias
const connection  = require("./database/connection")
const express = require("express")
const cors = require("cors")

// Mensaje bienvenida
console.log("API NODE para RED SOCIAL");

// Conexion a bbdd
connection();

// Crear Servidor node
const app = express();
const puerto = 3900;

// Configurar cors
app.use(cors()) /* se hace en un middelware para que se ejecute antes que las propias rutas o endpoints */

// COnvertir los datos del body a objetos js
app.use(express.json()); /** middelware que nos codifica los datos del body y los convierte en json */
app.use(express.urlencoded({extended: true})) /** cualquier dato que llegue en formato form URL en codec lo codifica */

// Cargar conf rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow")

app.use("/api", UserRoutes);
app.use("/api", PublicationRoutes);
app.use("/api", FollowRoutes);

// Ruta de Prueba
app.get("/ruta-prueba", (req, res) =>{
        return res.status(200).json({
            "id": 1,
            "nombre": "Maicol",
            "web": "maicol.es"
        })
    }
)

// Poner servidor a escuchar peticiones http
app.listen(puerto, ()=>{
    console.log("Servidor de node corriendo en el puerto: ", puerto);
})