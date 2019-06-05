const authResolver = require("./auth");
const eventsResolvers = require("./events");
const bookingResolvers = require("./booking");

const rootResolver = {
    ...authResolver,
    ...eventsResolvers,
    ...bookingResolvers
}

module.exports = rootResolver;