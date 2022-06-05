import Paciente from "../models/paciente.js"; // importamos el modelo del paciente
import mongoose from "mongoose";

const agregarPaciente = async(req, res) => {

    //instanciamos el modelo con la info que mandamos en la peticion
    const paciente = new Paciente(req.body)

    // almacenamos la informacion del usuario de la sesion para que maneje sus pacientes
    paciente.veterinario = req.veterinario._id
    
    //almacenamos el paciente en la DB
    try {
        const pacienteAlmacenado = await paciente.save();
        res.json(pacienteAlmacenado);
    } catch (error) {
        console.log(error)
    }
    
};

const obtenerPacientes = async(req, res) => { // trae todos los pacientes

    // ista los pacientes por el veterinario que los atiende
    const pacientes = await Paciente.find().where('veterinario').equals(req.veterinario);

    res.json(pacientes);
};

const obtenerPaciente = async(req, res) => {
    const { id } = req.params;

    const paciente = await Paciente.findById(id);

    if(!paciente) {
        res.status(404).json({msg: "no encontrado"});
    }

    // comprobamos que el paciente es del veterinario
    // para evitar conflictos, pasamos ambos ids a strings para compararlos
    if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({msg: "Acción NO válida"});
    }

    res.json(paciente);
     
}

const actualizarPaciente = async(req, res) => {
    const { id } = req.params;

    const paciente = await Paciente.findById(id);

    if(!paciente) {
        res.status(404).json({msg: "no encontrado"});
    }

    //comprobación
    if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({msg: "Acción NO válida"});
    }

    // Actualizar paciente 
    paciente.nombre = req.body.nombre || paciente.nombre;
    paciente.propietario = req.body.propietario || paciente.propietario;
    paciente.email = req.body.email || paciente.email;
    paciente.fecha = req.body.fecha || paciente.fecha;
    paciente.sintomas = req.body.sintomas || paciente.sintomas;

    // hace las peticiones a la DB
    try {
        const pacienteActualizado = await paciente.save();
        res.json(pacienteActualizado);
    } catch (error) {
        console.log(error);
    }

}

// const eliminarPaciente = async (req, res) => {
//     const { id } = req.params;

//     const paciente = await Paciente.findById(id);

//     // validacion de si hay un error
//     if(!paciente) {
//         res.status(404).json({msg: "no encontrado"});
//     }

//     //comprobación de la persona que intenta eliminar un registro es quien lo creo
//     if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
//         return res.json({msg: "Acción NO válida"});
//     }

//     // elimina el registro de la DB
//     try {
//         await paciente.deleteOne();
//         res.json({msg: 'Paciente Eliminado'})
//     } catch (error) {
//         console.log(error)
//     }
// };

// REVISAR CODIGO PARA ELIMINAR PACIENTES, OBTENIDO DE PREGUNTAS Y RESPUESTAS SECCION 456
// por arte de magia, ahora si funciona y elimina a los pacientes xD
const eliminarPaciente = async (req,res)=>{ const {id} = req.params
   
    try {
        const paciente = await Paciente.findById(id)
        
        if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()){
            return res.json('Accion no permitida')
        }
 
        try {
            await paciente.deleteOne()
            return res.json('Paciente eliminado')
            
        } catch (error) {
            return res.status(404).json('Error, hubo un error cuando se eliminaba') 
        }
 
        
    } catch (error) {
        return res.status(404).json('Error, no se ha encontrado paciente') 
    }
 
}

export {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente
}