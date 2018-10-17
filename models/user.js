var mongoose=require("mongoose")
var passportLocalMongoose=require("passport-local-mongoose")
var uniqueValidator=require("mongoose-unique-validator")

var UserSchema=new mongoose.Schema({
    username    :String,
    studentID   :{type:String,unique:true},
    name        :String,
    surname     :String,
    tel         :String,
    lineID      :String,
    email       :String,
    address     :String
})
UserSchema.plugin(passportLocalMongoose)
UserSchema.plugin(uniqueValidator)
module.exports=mongoose.model("User",UserSchema)