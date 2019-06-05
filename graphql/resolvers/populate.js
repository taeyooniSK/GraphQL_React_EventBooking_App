const Event = require("../../models/event");
const User = require("../../models/user");

// helper function
const { dateToString } = require("../../helpers/date");

// const user, events, singleEvent make me to query more flexible way to a deeper level of queries 
// user.createdEvents put into eventIds paramter as arguments and it returns events which matches $in operator merging 'creator' property(creator(user)'s data)

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


const events = async eventIds => {
    try {
        const events = await Event.find({_id: { $in: eventIds} });
        return events.map(event => {
            return {
                ...event._doc, 
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
                createdEvents: events.bind(this, user.createdEvents)
        }; // merging with the rest properties of object that got found by mongoose
    } catch(err){
        throw err;
    }
};


// functions for merging

const transformEvent = event => {
    return {
        ...event._doc,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event._doc.creator) 
    }
}

const transformBooking = booking => {
    return {
        ...booking._doc,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    }
};








exports.user = user;
// exports.events = events;
exports.singleEvent = singleEvent;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;