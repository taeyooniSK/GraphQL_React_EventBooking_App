const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const graphqlHttp = require("express-graphql"); // this enables me to use graphql like a middleware  in express
const mongoose = require("mongoose");

const isAuthenticated = require("./middleware/isAuth");

const graphqlSchema = require("./graphql/schema/index");
const graphqlResolvers = require("./graphql/resolvers/index"); 



// DB model

const Event = require("./models/event");
const User = require("./models/user");


app.use(bodyParser.json()); 

// middleware for taking care of CORS : every host or client can send requests to server
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Allow what methods the client can use for sending requests 
    res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
    // Allow what headers the client set for requests
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        // OPTIONS in req.method asks what methods can be used 
    if(req.method === "OPTIONS"){
        return res.sendStatus(200);
    }
    next();
});

app.use(isAuthenticated);

// Set graphql config options : 
app.use("/graphql", graphqlHttp({
    schema: graphqlSchema,    
    rootValue: graphqlResolvers,  
    graphiql: true
}));


mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-tdceq.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true })
.then(() => {
    console.log("MongoDB connected..");
})
.catch(err => {
    console.log(err);
})

app.listen(8000, ()=>{
    console.log("Server is running on 8000");
})