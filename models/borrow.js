var mongoose = require("mongoose")

var BorrowShcema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        name: String,
        surname: String,
        stdID:String,
        email:String
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
    approve:Boolean,
    date:Date,
    lateStatus:Boolean
})
module.exports = mongoose.model("Borrow", BorrowShcema)