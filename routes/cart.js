var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var User = require("../models/user");
var middleware = require("../middleware");

// router
router.post("/addCart/:item_id",middleware.isLoggedIn, function (req, res) {
    User.findById(req.user._id, function (err, user) {
        Item.findById(req.params.item_id, function (err, item) {
            // new
            if (user.cart.itemID.indexOf(req.params.item_id) == -1) {
                user.cart.itemID.push(req.params.item_id)
                if (item.type == "ID") {
                    user.cart.ID.push([])
                    var a = user.cart.itemID.indexOf(req.params.item_id)
                    user.cart.ID[a].push(req.body.itemID)
                    user.cart.qty.push(1)

                } else {
                    user.cart.ID.push([])
                    user.cart.qty.push(req.body.qty)
                }
                user.cart.name.push(item.name)
                user.cart.limit.push(item.limit)


            } else {
                // add ID in array
                var exist = 0;
                if (item.type == "ID") {
                    var a = user.cart.itemID.indexOf(req.params.item_id)
                    var kk = user.cart.ID
                    var eiei = kk[a]
                    if (user.cart.ID[a].indexOf(req.body.itemID) == -1) {
                        eiei.push(req.body.itemID)
                        user.cart.ID = []
                        user.cart.ID = kk
                    } else {
                        exist = 1
                        req.flash("error", "You have this ID")
                    }
                }
                // add qty
                if (exist == 0) {
                    var temp = user.cart.qty
                    if (item.type == "ID") {
                        temp[user.cart.itemID.indexOf(req.params.item_id)]++
                    } else {
                        // ทำไมมัน += ไม่ได้ มันกลายเป็น string
                        for (var i = 0; i < req.body.qty; i++) {
                            temp[user.cart.itemID.indexOf(req.params.item_id)]++
                        }
                    }
                    user.cart.qty = []
                    user.cart.qty = temp
                }
            }
            user.save()
            res.redirect("/")
        })

    })
})
router.get("/cart", function (req, res) {
    middleware.countQty(req, function (numcart) {
        res.render("cart/cart", { numcart: numcart, cart: req.user.cart })
    })
})
router.get("/cart/delItem/:item_id", function (req, res) {
    User.findById(req.user._id, function (err, user) {
        user.cart.itemID.splice(req.params.item_id, 1);
        user.cart.ID.splice(req.params.item_id, 1);
        user.cart.name.splice(req.params.item_id, 1);
        user.cart.qty.splice(req.params.item_id, 1);
        user.cart.limit.splice(req.params.item_id, 1);
        user.save()
        res.redirect("/cart")

    })
})
router.get("/clearCart", function (req, res) {
    User.findById(req.user._id, function (err, user) {
        user.cart.itemID = []
        user.cart.ID = []
        user.cart.name = []
        user.cart.qty = []
        user.cart.limit = []

        user.save()
        console.log(user.cart);
        res.redirect("/cart")
    })
})
module.exports = router;
