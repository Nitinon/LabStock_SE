var mongoose = require("mongoose")
var uniqueValidator = require("mongoose-unique-validator")

var ItemShcema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    category: String,
    type: String,
    itemID: [],
    qty: Number,
    limit: Number,
    detail: String,
    originalname:String
    // for pic
    // path: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
    // originalname: {
    //     type: String,
    //     required: true
    // }
})
module.exports = mongoose.model("Item", ItemShcema)