import express from "express";
import dotenv from "dotenv"; //dependencia para que express pueda leer las variables de entorno desde .env
import cors from "cors";
import conectarDB from "./config/db.js";
import veterinarioRouter from "./routes/veterinarioRoutes.js";
import pacienteRoutes from "./routes/pacienteRoutes.js";

const app = express();

app.use(express.json()); //de esta forma le decimos que le enviaremos los datos en forma de json

dotenv.config(); //escanea el proyercto buscando las variables de entorno

conectarDB(); //archivo creado por mi

const dominiosPermitidos = [process.env.FRONTEND_URL];

// configura la seguridad de los endpoints para que puedan comunicarse entre si
const corsOptions = {
    origin: function(origin, callback) {
        if(dominiosPermitidos.indexOf(origin) !== -1) {
            // El origen del request esta permitido
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}

app.use(cors(corsOptions));

app.use("/api/veterinarios", veterinarioRouter);
app.use("/api/pacientes", pacienteRoutes);

const PORT = process.env.PORT || 4000;

app.listen( PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
})