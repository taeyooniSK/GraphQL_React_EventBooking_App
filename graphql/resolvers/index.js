const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");


const singleEvent = async eventId => {
    try {
        const event = await Event.findById({_id: eventId });
        return {
            ...event._doc, 
            // _id: event.id, 
            creator: user.bind(this, event.creator)
        }
    } catch (err){
        throw err;
    }
    
}





// const user, events make me to query more flexible way to a deeper level of queries 

// user.createdEvents put into eventIds paramter as arguments and it returns events which matches $in operator merging 'creator' property(creator(user)'s data)
const events = async eventIds => {
    try {
        const events = await Event.find({_id: { $in: eventIds} });
        return events.map(event => {
            return {
                ...event._doc, 
                // _id: event.id, 
                creator: user.bind(this, event.creator)
            }
        });
    } catch (err){
        throw err;
    }
    
}


// In 'events' resolver, when event.creator value is put in as an argument, then 'user' returns data on the user including createdEvents(function) which enable me to query data on events 
const user = async userId => {
    try {
        const user = await User.findById(userId);
        //console.log(user._doc);
        return {
                ...user._doc,
                //  _id: user.id, 
                createdEvents: events.bind(this, user.createdEvents)
        }; // merging with the rest properties of object that got found by mongoose
    } catch(err){
        throw err;
    }
};


module.exports = { // javascript object where all the resolver functions are in 
    events: async () => {
        try {
           const events = await Event.find({});
           return events.map(event => {
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator) // event._doc.creator is a creator of event so you can get data about the creator(email, password)
                }
           })
        } catch(err){
            throw err;
        }
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find({});
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString(),
                }
            })
            
        } catch(err){
            throw err;
        }
    },
    createEvent : async args => { // createEvent(resolver)'s args contains all arguments put into createEvent's arguments in mutation type
      const event = new Event({
        title: args.eventInput.title,  
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: "5cf37ada34fd5d2b8c31b57c" // mongoose automatically converts this string to ObjectId of mongoose
      });
        let createdEvent; // this variable is going to contain event that is created by createEvent resolver
        try {
            const result = await event.save();
            createdEvent = {
                 ...result._doc, 
                 date: new Date(result._doc.date).toISOString(),
                 creator: user.bind(this, result._doc.creator) 
            };
            const creator = await User.findById({_id: result._doc.creator });
            // when user not found
            if(!creator){
                throw new Error("User is not found!");
            }
                
            // when user found, save event and save event in User's createdEvents field in database
            creator.createdEvents.push(event);
            await creator.save();
       
            return createdEvent; // when querying, I can get this newly created event
        } catch(err){
            console.log(err);
            throw err;
        }
    },
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
        return result;
        } catch(err){
            throw err;
        }
    },
    bookEvent : async args => {
        // find the event to book and get data
        const eventToBook = await Event.findOne({ _id: args.eventID });
        //console.log(eventToBook);
        const booking = new Booking({
            user: "5cf37ada34fd5d2b8c31b57c",
            event: eventToBook.id
        });
        const result = await booking.save();
        return {
            ...result._doc,
            user: user.bind(this, booking.user),
            event: singleEvent.bind(this, booking.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        }
    },
    cancelBooking : async args => {
        try {
            // get booking data populated with data referencing event
            const booking = await Booking.findById({_id : args.bookingID}).populate("event");
            console.log({...booking.event._doc});
            const event = {
                ...booking.event._doc,
                creator: user.bind(this, booking.event._doc.creator)
            };
            await Booking.deleteOne({_id: args.bookingID });
            return event;
        } catch(err) {
            throw err;
        }
    }
}