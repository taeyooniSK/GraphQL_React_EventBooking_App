const bcrypt = require("bcrypt");

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
}