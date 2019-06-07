// mongoose Schema
const User = require("../../models/user");
const Event = require("../../models/event");

// functions for merging

const { transformEvent } = require("./populate");



// Resolvers for events

module.exports = { // javascript object where all the resolver functions are in 
    events: async () => {
        try {
           const events = await Event.find({});
           return events.map(event => {
                return transformEvent(event);
           })
        } catch(err){
            throw err;
        }
    },
    createEvent : async (args, req) => { // createEvent(resolver)'s args contains all arguments put into createEvent's arguments in mutation type
      if (!req.isAuthenticated){
          throw new Error("It's not authenticated!");
      }
        const event = new Event({
            title: args.eventInput.title,  
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: req.userId // user who is authenticated
        });
        let createdEvent; // this variable is going to contain event that is created by createEvent resolver
        try {
            const result = await event.save();
            createdEvent = transformEvent(result);
            const creator = await User.findById({_id: result._doc.creator });
            // when user not found
            if(!creator){
                throw new Error("User is not found!");
            }
                
            // when user found, save event and save event in User's createdEvents field in database
            creator.createdEvents.push(event);
            await creator.save();
            console.log(createdEvent);
            return createdEvent; // when querying, I can get this newly created event
        } catch(err){
            console.log(err);
            throw err;
        }
    },
}