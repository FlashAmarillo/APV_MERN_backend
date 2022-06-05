import jwt from "jsonwebtoken";
import Veterinario from "../models/veterinarioModel.js";

const checkAuth = async (req, res, next) => {
    
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // aqui decodificamos el token 
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.veterinario = await Veterinario.findById(decoded.id).select("-password -token -confirmado");

            return next();

        } catch (error) {
            // si llega a esta linea de codigo significa que nunca hubo un token
            const e = new Error('Token no valido');
            return res.status(403).json({msg: e.message});
        }
    }

    if(!token) {
        const error = new Error('Token no valido o Inexistente');
        res.status(403).json({msg: error.message});
    }

    next();
}

export default checkAuth;