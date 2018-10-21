var mongoose = require("mongoose")

var ItemShcema = new mongoose.Schema({
    name: String,
    category: String,
    type: String,
    itemID: [],
    qty: Number,
    limit: Number,
    detail: String,
    // for pic
    path: {
        type: String,
        required: true,
        trim: true
    },
    originalname: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model("Item", ItemShcema)