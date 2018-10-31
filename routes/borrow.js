var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var User = require("../models/user");
var Borrow = require("../models/borrow");
var middleware = require("../middleware");

router.get("/borrow/pending", function (req, res) {
    User.findById(req.user._id).populate("borrow").exec(function (err, user) {
        middleware.countQty(req, function (numcart) {
            res.render("borrow/bPending", {
                cart: user.cart,
                numcart: numcart,
                borrows: user.borrow
            })
        })
    })
})
router.post("/borrow/confirm/:borrow_id", function (req, res) {
    console.log(req.body.item)
    if (Array.isArray(req.body.item)) {
        // กรณีส่งมาหลายตัว
        console.log("ll" + req.body.item.length)
    } else {
        // กรณีส่งมาตัวเดียว
        console.log(req.body.item)
    }
})
router.get("/borrow/del/:borrow_id", function (req, res) {
    Borrow.findByIdAndRemove(req.params.borrow_id,function(err,borrow){
        User.findById(req.user._id,function(err,user){
            user.borrow.splice(user.borrow.indexOf(borrow._id), 1);
            user.save();
        })
        res.redirect("/borrow/pending");
    })
})

module.exports = router;