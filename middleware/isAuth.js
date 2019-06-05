const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // req.get method: get matching content type specified 
    const authHeader = req.get("Authorization"); 
    // authHeader returns "Bearer asdqweasd(token)" 
    console.log(authHeader);
    if(!authHeader){
        req.isAuthenticated = false;
        return next();
    }
    //Authrization: Bearer asdlkqjwe  <- 이런 형태임 그러나 authHeader로 인해 Bearer asdlkqjwe 이런 형태로 되어있음 so if I use split, I can get the token
    const token = authHeader.split(" ")[1]; 
    // if there is no token
    if(!token || token === ""){
        req.isAuthenticated = false;
        return next();
    }
    let decodedToken;

    try {
    
        decodedToken =  jwt.verify(token, "SuperSecretKey");
        
    } catch (err){
        req.isAuthenticated = false;
        return next();
        
    }

    if(!decodedToken){
        req.isAuthenticated = false;
        return next();
    }

    req.isAuthenticated = true;
    req.userId = decodedToken.userId;
    next();
}