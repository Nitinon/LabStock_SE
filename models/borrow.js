var mongoose = require("mongoose")

var BorrowShcema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        name: String,
        surname: String
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
    repatriate:Boolean,
    approve:Boolean
})
module.exports = mongoose.model("Borrow", BorrowShcema)