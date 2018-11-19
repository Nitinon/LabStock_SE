var mongoose = require("mongoose")
var passportLocalMongoose = require("passport-local-mongoose")
var uniqueValidator = require("mongoose-unique-validator")

var UserSchema = new mongoose.Schema({
    role: String,
    username: String,
    studentID: {
        type: String,
        unique: true
    },
    name: String,
    surname: String,
    tel: String,
    lineID: String,
    email: String,
    address: String,
    cart: {
        itemID: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "item"
        }],
        name: [String],
        pic: [String],
        limit: [String],
        ID: [
            [String]
        ],
        qty: [Number]
    },
    borrow: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Borrow"
    }],
    return: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Return"
    }],
    history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "History"
    }]
})
UserSchema.plugin(passportLocalMongoose)
UserSchema.plugin(uniqueValidator)
module.exports = mongoose.model("User", UserSchema)