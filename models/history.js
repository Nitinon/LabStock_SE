var mongoose = require("mongoose")

var HistorySchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        name: String,
        surname: String,
        stdID:String

    },
    approver: {
        id: {
            type: mongoose.Schema.ObjectId,
            ref: "Approver"
        },
        name: String,
        surname: String
    },
    itemID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "item"
    }],
    type:String,
    itemName: [],
    pic: [],
    ID: [],
    qty: [],
    date: Date
})
module.exports = mongoose.model("History", HistorySchema)