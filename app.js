const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const graphqlHttp = require("express-graphql"); // this enables me to use graphql like a middleware  in express
const { buildSchema } = require("graphql"); // buildSchema: a function that can make me build schema literally


app.use(bodyParser.json()); 

// Set graphql config options : 
app.use("/graphql", graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]! 
        }

        type RootMutation {
            createEvent(name: String): String,

        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),    
    rootValue: { // javascript object where all the resolver functions are in 
        events: () => {
            return ["Cooking", "Sailing", "Coidng all day long"];
        },
        createEvent : (args) => {
            const eventName = args.name;

            return eventName;
        }
    },  
    graphiql: true
}));

app.listen(3000, ()=>{
    console.log("Server is running on 3000");
})