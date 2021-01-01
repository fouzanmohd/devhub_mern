const jwt = require('jwt');
const config = require('config')

module.exports = (req,res,next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({message: "No token, Authorization declined."})   
     }
     try{
         const decoded = jwt.verify(token, config.get('jwtSecret'))
         req.user = decoded.user
         next()
     }catch(err){
         res.status(401).json({message: "Token is not valid!"})
     }
}