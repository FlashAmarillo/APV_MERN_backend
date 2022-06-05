import jwt from "jsonwebtoken";

const generarJWT = (id) => {
    // solo nos interesa guardar el id del usuario en el token
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",

    }) 

}

export default generarJWT;