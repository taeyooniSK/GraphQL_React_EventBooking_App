const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const graphqlHttp = require("express-graphql"); // this enables me to use graphql like a middleware  in express
const { buildSchema } = require("graphql"); // buildSchema: a function that can make me build schema literally


app.use(bodyParser.json()); 



// Dummy data
const events = [];

// Set graphql config options : 
app.use("/graphql", graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id : ID!
            title: String!
            description: String!
            price: Float!
            date: String! 
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]! 
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event

        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),    
    rootValue: { // javascript object where all the resolver functions are in 
        events: () => {
            return events;
        },
        createEvent : (args) => { // createEvent(resolver)'s args contains all arguments put into createEvent's arguments in mutation type
            const event = {
               _id: Math.random().toString(),
               title: args.eventInput.title,    //createEvent의 argument인 eventInput은 EventInput이라는 input type형태의 테이터를 가지고 있는 객체이므로 args안에 nested되어있음
               description: args.eventInput.description,
               price: args.eventInput.price,
               date: args.eventInput.date
           };
           
           console.log(args);
           events.push(event);
           return event;
        }
    },  
    graphiql: true
}));

app.listen(3000, ()=>{
    console.log("Server is running on 3000");
})