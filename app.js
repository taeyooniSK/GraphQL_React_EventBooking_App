const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const graphqlHttp = require("express-graphql"); // this enables me to use graphql like a middleware  in express
const { buildSchema } = require("graphql"); // buildSchema: a function that can make me build schema literally
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// DB model

const Event = require("./models/event");
const User = require("./models/user");


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

        type User {
            _id : ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]! 
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User

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
            date: new Date(args.eventInput.date),
            creator: "5cf37ada34fd5d2b8c31b57c" // mongoose automatically converts this string to ObjectId of mongoose
          });
            let createdEvent;
            return event.save()
           .then(event => {
                createdEvent = event;
                return User.findById({_id: event.creator})
            })
           .then(foundUser => {
                // when user not found
                if(!foundUser){
                    throw new Error("User is not found!");
                }
                    
                // when user found, save event and save event in User's createdEvents field in database
                foundUser.createdEvents.push(event);
                return foundUser.save();
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                if(err) throw err;
            })
        },
        createUser: args => {
                // check if the same email in DB
            return User.findOne({email : args.userInput.email})
            .then(foundUser => {
                if(foundUser){
                    throw new Error("The email already exists.");
                }
                // graphql waits for 'return value' so this should be returned        
                return bcrypt.hash(args.userInput.password, 12);
            })        
            .then(hashedPassword => {
                const user = new User({
                    email : args.userInput.email,
                    password: hashedPassword
                });

                return user.save(); // returns promise object so it should be returned as well
            })
            .then(result => {
                console.log("A New user is signed up");
                result.password = null; // retrieving password is not good for sercurity purpose so null
                return result;
            })
            .catch(err => {
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