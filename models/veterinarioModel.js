import mongoose from "mongoose";
import bcrypt from "bcrypt"; // hashea los password y los compara en la bd
import generarId from "../helpers/generarId.js";

//A medida que mongoDB vaya agregando los registros automaticamente le asigna el id
const veterinarioShema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    telefono: {
        type: String,
        default: null,
        trim: true,
    },
    web: {
        type: String,
        default: null,
    },
    token: {
        type: String,
        default: generarId(),

    },
    confirmado: {
        type: Boolean,
        default: false,
    }
})

//moongose tiene hooks para insertar codigo antes o despues de ingresar un registro

// para antes de almacenar los datos usamos el hook .pre
veterinarioShema.pre('save', async function(next) {
    
    // de esta forma se hashea el password justo antes de que se almacene en la bd con .pre
    
    // este if valida si un password esta hasheado no lo vuelva a hashear, solo se hashea 1 vez
    if(!this.isModified('password')) {
        next();
    }

    /*si no han modificado el password entonces no lo hashees y pasa 
    al siguiente middleware, esto es útil si el usuario no ha actualizado
    su password, y en caso de que lo actualice no ejecuta el next y hashea el 
    password actualizado*/

    // las siguientes lineas de codigo hashean el password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

})

// funcion para comparar el password del formulario con el password hasheado
veterinarioShema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password)
}



const Veterinario = mongoose.model("Veterinario", veterinarioShema );
export default Veterinario;

