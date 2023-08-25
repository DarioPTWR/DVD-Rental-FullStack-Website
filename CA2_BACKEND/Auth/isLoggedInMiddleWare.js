const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");

function verifyToken (req,res,next){
    var token = req.headers["authorization"];
    if(!token || !token.includes("Bearer")){
        res.status(403);
        res.send({ auth: false, message:"Not authorized"});
    } else {
        token = token.split("Bearer ")[1];
        jwt.verify(token, JWT_SECRET,(err, decodedToken)=>{
            if(err){
                res.status(403).send({ auth: false, message: "Erroneous token" });
            } else {
                req.auth = decodedToken;
                next();
            }
        })
    }
}

module.exports = verifyToken;