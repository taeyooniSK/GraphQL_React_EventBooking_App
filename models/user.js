const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        require: true
    },
    createdEvents: [ // user's id : since a user can make multiple events
        {
            type: Schema.Types.ObjectId,
            ref: "Event"   // relation with Event model
        }
    ]
});

module.exports = mongoose.model("User", userSchema);