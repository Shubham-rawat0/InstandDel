import jwt from "jsonwebtoken"
export const getToken=(userId:string)=>{
try {
    if (!process.env.JWT_SECRET){
        throw new Error("no Jwt secret")
    }
      const token =  jwt.sign({userId}, process.env.JWT_SECRET,{expiresIn:"7d"});
      return token
} catch (error) {
    console.error(error)
}
}