// mongoose Schema
const Event = require("../../models/event");
const Booking = require("../../models/booking");


const { transformBooking, transformEvent } = require("./populate");


// Resolvers for booking
module.exports = { // javascript object where all the resolver functions are in 
    bookings: async (args, req) => {
        if (!req.isAuthenticated){
            throw new Error("It's not authenticated!");
        }
        try {
            const bookings = await Booking.find({});
            return bookings.map(booking => {
                return transformBooking(booking);
            })
            
        } catch(err){
            throw err;
        }
    },
    bookEvent : async (args, req) => {
        if (!req.isAuthenticated){
            throw new Error("It's not authenticated!");
        }
        // find the event to book and get data
        const eventToBook = await Event.findOne({ _id: args.eventID });
        //console.log(eventToBook);
        const booking = new Booking({
            user: req.userId,
            event: eventToBook.id
        });
        const result = await booking.save();
        return transformBooking(result);
    },
    cancelBooking : async (args, req) => {
        if (!req.isAuthenticated){
            throw new Error("It's not authenticated!");
        }
        try {
            // get booking data populated with data referencing event
            const booking = await Booking.findById({_id : args.bookingID}).populate("event");
            console.log({...booking.event._doc});
            const event = transformEvent(booking.event);
            await Booking.deleteOne({_id: args.bookingID });
            return event;
        } catch(err) {
            throw err;
        }
    }
}