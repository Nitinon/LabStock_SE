var mongoose = require("mongoose")

var SystemSchema = new mongoose.Schema({
    statusError:Boolean
})
module.exports = mongoose.model("System", SystemSchema)