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
    Borrow.findById(req.params.borrow_id, function (err, borrow) {
        // var temp = borrow;
        var temp = JSON.parse(JSON.stringify(borrow));
        if (Array.isArray(req.body.item)) {
            // กรณีส่งมาหลายตัว
            req.body.item.forEach(function (item, i) {
                // console.log(item + "  " + item.length)
                if (item.length != 1) {
                    var indexItem = item.substring(0, 1)
                    console.log(indexItem + " " + borrow.itemID[indexItem] + " " + borrow.itemName[indexItem])
                    var indexID = item.substring(1, )
                    console.log("ItemID: " + borrow.ID[indexItem][indexID])

                    var fItem = String(borrow.itemID[indexItem]);
                    var indexItem_temp = temp.itemID.indexOf(fItem);

                    var fID = String(borrow.ID[indexItem][indexID]);
                    var indexID_temp = temp.ID[indexItem_temp].indexOf(fID)

                    temp.ID[indexItem_temp].splice(indexID_temp, 1);
                    temp.qty[indexItem_temp]--;
                    if (temp.ID[indexItem_temp] == "") {
                        console.log("หมด")
                        temp.itemID.splice(indexItem_temp, 1);
                        temp.ID.splice(indexItem_temp, 1);
                        temp.itemName.splice(indexItem_temp, 1);
                        temp.qty.splice(indexItem_temp, 1);
                        temp.limit.splice(indexItem_temp, 1);
                        temp.pic.splice(indexItem_temp, 1);

                    }





                }
            })
            console.log(temp)
            console.log("=================================================")
        } else {
            // กรณีส่งมาตัวเดียว
            console.log(req.body.item)
        }
    })
})
router.get("/borrow/del/:borrow_id", function (req, res) {
    Borrow.findByIdAndRemove(req.params.borrow_id, function (err, borrow) {
        User.findById(req.user._id, function (err, user) {
            user.borrow.splice(user.borrow.indexOf(borrow._id), 1);
            user.save();
        })
        res.redirect("/borrow/pending");
    })
})

module.exports = router;