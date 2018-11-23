var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var User = require("../models/user");
var Borrow = require("../models/borrow");
var middleware = require("../middleware");

// router
router.post("/addCart/:item_id", middleware.isLoggedIn, function (req, res) {
    User.findById(req.user._id, function (err, user) {
        Item.findById(req.params.item_id, function (err, item) {
            if (req.body.qty > item.qty) {
                req.flash("error", "This item not enough!!")
                return res.redirect("/p/1")
            }
            // new
            if (user.cart.itemID.indexOf(req.params.item_id) == -1) {
                user.cart.itemID.push(item)
                user.cart.pic.push(item.originalname)

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
            res.redirect("/p/1")
        })

    })
})
router.get("/cart",middleware.isLoggedIn,function (req, res) {
    User.findById(req.user._id, function (err, user) {
        middleware.countQty(req, function (numcart) {
            // res.render('index', { message: req.flash('error'), items: allItems, category: "all", numcart: numcart });
            res.render("cart/cart", {
                cart: user.cart,
                numcart: numcart,
            })
        })
    })

})
// del item type ID
router.get("/cart/delItem/:item_id",middleware.isLoggedIn,function (req, res) {
    User.findById(req.user._id, function (err, user) {
        user.cart.itemID.splice(req.params.item_id, 1);
        user.cart.ID.splice(req.params.item_id, 1);
        user.cart.name.splice(req.params.item_id, 1);
        user.cart.qty.splice(req.params.item_id, 1);
        user.cart.limit.splice(req.params.item_id, 1);
        user.cart.pic.splice(req.params.item_id, 1);
        user.save()
        res.redirect("/cart")

    })
})
router.get("/cart/incItem/:indexItem",middleware.isLoggedIn,function (req, res) {
    User.findById(req.user._id, function (err, user) {
        var cart = user.cart
        var temp = user.cart.qty
        temp[req.params.indexItem]++
        user.cart.qty = []
        user.cart.qty = temp
        user.save()
        // เลขไม่เซฟ
        res.redirect("/cart")
    })
})
router.get("/cart/decItem/:indexItem",middleware.isLoggedIn,function (req, res) {
    User.findById(req.user._id, function (err, user) {
        var cart = user.cart
        var temp = user.cart.qty
        temp[req.params.indexItem]--
        user.cart.qty = []
        user.cart.qty = temp
        if (user.cart.qty[req.params.indexItem] == 0) {
            user.cart.itemID.splice(req.params.indexItem, 1);
            user.cart.ID.splice(req.params.indexItem, 1);
            user.cart.name.splice(req.params.indexItem, 1);
            user.cart.qty.splice(req.params.indexItem, 1);
            user.cart.limit.splice(req.params.indexItem, 1);
            user.cart.pic.splice(req.params.indexItem, 1);
        }
        user.save()
        // เลขไม่เซฟ
        res.redirect("/cart")
    })
})
router.get("/cart/:indexItem/:indexID",middleware.isLoggedIn,function (req, res) {
    User.findById(req.user._id, function (err, user) {
        var cart = user.cart
        cart.ID[req.params.indexItem].splice(req.params.indexID, 1);
        var temp = user.cart.qty
        temp[req.params.indexItem]--
        user.cart.qty = []
        user.cart.qty = temp
        if (user.cart.qty[req.params.indexItem] == 0) {
            user.cart.itemID.splice(req.params.indexItem, 1);
            user.cart.ID.splice(req.params.indexItem, 1);
            user.cart.name.splice(req.params.indexItem, 1);
            user.cart.qty.splice(req.params.indexItem, 1);
            user.cart.limit.splice(req.params.indexItem, 1);
            user.cart.pic.splice(req.params.indexItem, 1);
        }
        user.save()
        // เลขไม่เซฟ
        res.redirect("/cart")
    })
})
router.get("/checkout",middleware.isLoggedIn,function (req, res) {
    User.findById(req.user._id, function (err, user) {
        var cart = user.cart
        var author = {
            id: req.user._id,
            name: req.user.name,
            surname: req.user.surname
        };
        var now=new Date();
        var newOrder = new Borrow({
            author: author,
            itemID: cart.itemID,
            itemName: cart.name,
            pic: cart.pic,
            limit: cart.limit,
            ID: cart.ID,
            qty: cart.qty,
            approve: false,
            date:now
            
        })
        if(cart.itemID!=""){
        Borrow.create(newOrder, function (err, newBorrow) {
            if (err) {
                console.log(err)
            } else {

                user.borrow.push(newBorrow)
                user.cart.itemID = []
                user.cart.ID = []
                user.cart.name = []
                user.cart.qty = []
                user.cart.limit = []
                user.cart.pic = []
                user.save()
                req.flash("success", "order success pending for approve")
                res.redirect("/p/1")
            }
        })
    }else{
        req.flash("error","Cart is empty")
        res.redirect("/p/1")
    }
    })
})
router.get("/clearCart",middleware.isLoggedIn,function (req, res) {
    clearCart(req);
    res.redirect("/");
})

function clearCart(req) {
    User.findById(req.user._id, function (err, user) {
        user.cart.itemID = []
        user.cart.ID = []
        user.cart.name = []
        user.cart.qty = []
        user.cart.limit = []
        user.cart.pic = []
        user.save()
    })
}

module.exports = router;