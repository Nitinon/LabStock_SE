var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var User = require("../models/user");
var Borrow = require("../models/borrow");
var History = require("../models/history");
var middleware = require("../middleware");
router.get("/history/notReturn",middleware.isLoggedIn,function(req,res){
    User.findById(req.user._id,function(err,user){
        Borrow.find({approve:true},function(err,borrowNot){
        middleware.countQty(req, function (numcart) {
            borrowNot.forEach(function(borrow){
                borrow.limit.forEach(function(limit){
                    var tempDate=new Date(borrow.date)
                    var DateNow=new Date(Date.now())
                    tempDate.setDate(tempDate.getDate()+parseInt(limit))
                    console.log(DateNow.toDateString()+" "+tempDate.toDateString())
                    console.log(DateNow>tempDate)
                    if(DateNow>tempDate)borrow.lateStatus=true;
                    
                })
                borrow.save()
            })
            res.render("history/historyNot", {
                cart: user.cart,
                numcart: numcart,
                histories: borrowNot,
                type:"Not Return"
            })
        })
    })
})
})
router.get("/history", function (req, res) {
    User.findById(req.user._id).populate({
        path: 'history',
        options: {
            sort: {
                date: -1
            }
        }
    }).exec(function (err, user) {
        middleware.countQty(req, function (numcart) {
            res.render("history/history", {
                cart: user.cart,
                numcart: numcart,
                histories: user.history,
                type:"History"
            })
        })
    })
})

router.get("/history/all", function (req, res) {
    User.findById(req.user._id, function (err, user) {
        History.find({}).sort({date: -1}).exec(function(err, history){
            if (err) console.log(err)
            else {
                middleware.countQty(req, function (numcart) {
                    res.render("history/history", {
                        cart: user.cart,
                        numcart: numcart,
                        histories: history,
                        type:"All History"
                    })
                })
            }
        })
    })
})
module.exports = router;