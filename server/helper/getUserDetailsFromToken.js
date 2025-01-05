const jwt = require('jsonwebtoken')
const UserModel = require('C:\Users\JOGESH SHARMA\Downloads\ShadowTalk-main\ShadowTalk-main\server\models\UserModel.js')

const getUserDetailsFromToken = async(token)=>{
    
    if(!token){
        return {
            message : "session out",
            logout : true,
        }
    }

    const decode = await jwt.verify(token,process.env.JWT_SECREAT_KEY)

    const user = await UserModel.findById(decode.id).select('-password')

    return user
}

module.exports = getUserDetailsFromToken