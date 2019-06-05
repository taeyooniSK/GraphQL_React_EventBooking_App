const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mongoose Schema
const User = require("../../models/user");


module.exports = { // javascript object where all the resolver functions are in 
    createUser: async args => {
        try {
         // check if the same email in DB
        const user = await User.findOne({email : args.userInput.email});
        if(user){
            throw new Error("The email already exists.");
        }
        // graphql waits for 'return value' so this should be returned        
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);      
        const userToSave = new User({
            email : args.userInput.email,
            password: hashedPassword
        });
        
        const result = await userToSave.save(); 

        console.log("A New user is signed up");

        // retrieving password is not good for sercurity purpose so null
        return { 
            ...result._doc, password: null
        } 
        } catch(err){
            throw err;
        }
    },
    login : async ({email, password}) => {
        const user = await User.findOne({email: email});
        if(!user){
            throw new Error("User does not exist");
        }
        const isMatched = await bcrypt.compare(password, user.password);
        if(!isMatched){
            throw new Error("Password is not correct");
        }

        const token = jwt.sign({
            userId: user.id,
            email: user.email
        }, "SuperSecretKey", {expiresIn :"1h"})
        
        return { userId: user.id, token: token, tokenExpiration : 1}
    }
}