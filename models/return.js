var mongoose = require("mongoose")

var ReturnShcema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        name: String,
        surname: String,
        stdID:String
    },
    borrowID:{
        type: mongoose.Schema.ObjectId,
        ref: "BorrowID"
    
    },
    itemID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "item"
    }],
    itemName: [],
    pic: [],
    limit: [],
    ID: [],
    qty: [],
    date: Date
})
module.exports = mongoose.model("Return", ReturnShcema)