const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const graphqlHttp = require("express-graphql"); // this enables me to use graphql like a middleware  in express
const { buildSchema } = require("graphql"); // buildSchema: a function that can make me build schema literally
const mongoose = require("mongoose");

// DB model

const Event = require("./models/event");


app.use(bodyParser.json()); 


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
            return Event.find({})
            .then(events => {
               console.log(events);
               return events;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
        },
        createEvent : args => { // createEvent(resolver)'s args contains all arguments put into createEvent's arguments in mutation type
          const event = new Event({
            title: args.eventInput.title,  
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date)
          });
          // save event in database
          return event.save()
          .then(result => {
              console.log(result);
              return result;
          })
          .catch(err => {
              console.log(err);
              throw err;
          })
        }
    },  
    graphiql: true
}));


mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-tdceq.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true })
.then(() => {
    console.log("MongoDB connected..");
})
.catch(err => {
    console.log(err);
})

app.listen(3000, ()=>{
    console.log("Server is running on 3000");
})