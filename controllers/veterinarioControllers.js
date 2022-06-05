import Veterinario from "../models/veterinarioModel.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js"; 
import emailOlvidePassword from "../helpers/emailOlvidePassword.js"; 

const registrar = async (req, res) => {
    //req lo que enviamos al servidor, res es la respuesta del servidor

    //mostrando la informacion que estamos recibiendo con el metodo post
    //console.log(req.body);

    const { email, nombre } = req.body; //obtiene los datos de un formulario
    
    // Prevenir usuarios duplicados
    const existeUsuario = await Veterinario.findOne({email});
    if(existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message});
    }

    try {
        // Guardar un nuevo veterinario
        const nuevoVeterinario = new Veterinario(req.body); //crea una nueva instancia
        const veterinarioGuardado = await nuevoVeterinario.save(); //mongoose guarda el objeto en la BD :3
        
        //Enviar el Email con el token para validar el registro (despues de terminar el await anterior)
        // le pasamos los un objeto con los parametros que necesita el correo
        emailRegistro({
            email, 
            nombre,
            token: veterinarioGuardado.token
        })


        // Imprimiendo respuesta en el HTML de la pagina de routing
        res.json(veterinarioGuardado);

    } catch (error) {
        console.log(error)
    }
}

const perfil = (req, res) => {

    const { veterinario } = req;

    res.json(veterinario);
}

const confirmar = async (req, res) => {

    const {token} = req.params; // obteniendo el token del routing dinamico
    
    const usuarioConfirmar = await Veterinario.findOne( {token} );
    
    if(!usuarioConfirmar) {
        const error = new Error('Token no valido')
        return res.status(404).json({msg: error.message});
    }

    try {
        //eliminamos el token y cambiamos el estado de la confirmacion
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        // Guardamos los cambios
        await usuarioConfirmar.save();

        //enviamos un mensaje de confirmacion de cuenta
        res.json({msg: 'Usuario confirmado correctamente'})

    } catch (error) {
        console.log(error)
    }

}

// funcion para autenticar a los usuarios
const autenticar = async (req, res) => {
    // extraemos del formulario el email y el password
    const {email, password} = req.body;

    //comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email})

    if(!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.msg});
    }

    //Comprobar si el usuario esta confirmado
    // niego la condicion, diciendo si no esta confirmado
    if(!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message});
    }

    // Revisar el password
    if( await usuario.comprobarPassword(password)) {
        // Autenticar el usuario
        
        //llama la funcion para generar el JWT con el id
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),
        });
    } else {
        const error = new Error("El password es incorrecto");
        return res.status(403).json({msg: error.message});
    }
}

const olvidePassword = async (req, res) => {
    const { email } = req.body;

    const existeVeterinario = await Veterinario.findOne({email});

    if(!existeVeterinario) {
        const error = new Error('El usuario no existe');
        return res.status(400).json({msg: error.message});
    }

    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        // Enviar Email cons instrucciones al usuario
        emailOlvidePassword({
            email, 
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })

        res.json({msg: 'Hemos enviado un email con las instrucciones'});
    } catch (error) {
        console.log(error)
    }
}

// ruta para validar el token que se le envia al usuario si olvido el password
const comprobarToken = async (req, res) => {
    const { token } = req.params; // params obtiene los datos de la URL

    const tokenValido = await Veterinario.findOne({token});

    if(tokenValido) {
        // El token es valido, el usuario existe
        res.json({msg: 'Token valido, el Usuario existe :D'});
    } else {
        const error = new Error('Token no valido');
        return res.status(400).json({msg: error.message});
    }
}

// ruta para crear el nuevo password despues de validar el token anterior
const nuevoPassword = async (req, res) => {
    
    const { token } = req.params;

    // nuevo password escrito por el usuario en el formulario
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({token});

    if(!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

    // los trycatch se utilizan cuando principalmente vamos a modificar la BD
    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({msg: "password modificado correctamente"})
    } catch (error) {
        console.log(error)
    }
}

// ruta privada para actualizar el perfil
const actualizarPerfil = async(req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    // Validacion
    if(!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({ msg: error.message });
    }

    const { email } = req.body

    // validacion del email
    if(veterinario.email !== email) {
        const existeEmail = await veterinario.findOne({email});

        if(existeEmail) {
            const error = new Error('Ese Email ya esta en uso');
            return res.status(400).json({ msg: error.message }); 
        }
    }

    // Si todo esta bien y pasa la validacion actualizamos el registro en la DB
    try {
        veterinario.nombre = req.body.nombre || veterinario.nombre;
        veterinario.email = req.body.email || veterinario.email;
        veterinario.web = req.body.web || veterinario.web;
        veterinario.telefono = req.body.telefono || veterinario.telefono;

        const veterinarioActualizado = await veterinario.save();

        res.json(veterinarioActualizado);

    } catch (error) {
        console.log(error)
    }
}

// ruta privada para actualizar el password
const actualizarPassword = async (req, res) => {
    // Leer los datos
    const { id } = req.veterinario;
    const { pwd_actual, pwd_nuevo } = req.body;
    
    //comprobar que el veterinario exista
    const veterinario = await Veterinario.findById(id);
    if(!veterinario) { // Validacion
        const error = new Error('Hubo un error');
        return res.status(400).json({ msg: error.message });
    }

    //comprobar su password
    if(await veterinario.comprobarPassword(pwd_actual)) {
        // Almacenar el nuevo password
        veterinario.password = pwd_nuevo;
        await veterinario.save();
        res.json({msg: 'Password Almacenado correctamente'});
    } else {
        const error = new Error('El password Actual es incorrecto');
        return res.status(400).json({ msg: error.message });
    }

}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword, 
    comprobarToken, 
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}