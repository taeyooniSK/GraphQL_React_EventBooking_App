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

// const user, events make me to query more flexible way to a deeper level of queries 

// user.createdEvents put into eventIds paramter as arguments and it returns events which matches $in operator merging 'creator' property(creator(user)'s data)
const events = eventIds => {
    return Event.find({_id: { $in: eventIds} })
    .then(events => {
        return events.map(event => {
            return {
                ...event._doc, 
                // _id: event.id, 
                creator: user.bind(this, event.creator)
            }
        })
    })
}

// In 'events' resolver, when event.creator value is put in as an argument, then 'user' returns data on the user including createdEvents(function) which enable me to query data on events 
const user = userId => {
    return User.findById(userId)
    .then(user => {
        return {
            ...user._doc,
            //  _id: user.id, 
             createdEvents: events.bind(this, user.createdEvents)} // merging with the rest properties of object that got found by mongoose
    })
    .catch(err => {
        throw err;
    })
};


// Set graphql config options : 
app.use("/graphql", graphqlHttp({
    schema: buildSchema(`

    type Event {
        _id : ID!
        title: String!
        description: String!
        price: Float!
        date: String! 
        creator: User!
    }
    
    type User {
        _id : ID!
        email: String!
        password: String
        createdEvents: [Event!]
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
               return events.map(event => {
                    return {
                        ...event._doc,
                        // _id: event.id,
                        creator: user.bind(this, event._doc.creator) // event._doc.creator is a creator of event so you can get data about the creator(email, password)
                    }
               })
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
            let createdEvent; // this variable is going to contain event that is created by createEvent resolver
            return event.save()
           .then(event => {
                createdEvent = {
                     ...event._doc, 
                     creator: user.bind(this, event._doc.creator) 
                    };
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
                return createdEvent; // when querying, I can get this newly created event
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