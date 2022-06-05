import express  from "express";
import { registrar, perfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword, actualizarPerfil, actualizarPassword } from "../controllers/veterinarioControllers.js";
import checkAuth from "../middleware/authMiddleware.js";

//Definicion del router con express
const router = express.Router();

// routas del area pública(abiertas para cualquier usuario)
router.post('/', registrar); //envia datos al servidor, le sigue la funcion registrar
router.get('/confirmar/:token', confirmar); //funcion para validar token
router.post('/login', autenticar); //enviaremos los datos a un formulario
router.post('/olvide-password', olvidePassword); // enviamos el email para validar el usuario
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);

// Area privada
router.get('/perfil',checkAuth, perfil);
router.put('/perfil/:id', checkAuth, actualizarPerfil); 
router.put('/actualizar-password', checkAuth, actualizarPassword)
//obtiene datos del servidor, ejecuta la funcion checkout y despues perfil

/* como el middleware es propio lo podemos reutilizar para diferentes paginas 
y checkear que el usuario este autorizado */

export default router;