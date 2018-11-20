var express = require("express")
var router = express.Router()
var passport = require("passport");
var User = require("../models/user");
var Item = require("../models/item");
var middleware = require("../middleware");

router.get("/", function (req, res) {
    res.redirect("/p/1")
})
router.get('/p/:page', function (req, res, next) {
    var perPage = 6
    var page = req.params.page || 1
    Item
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function (err, allItems) {
            Item.count().exec(function (err, count) {
                if (err) return next(err)
                middleware.countQty(req, function (numcart) {
                    // res.render('index', { message: req.flash('error'), items: allItems, category: "all", numcart: numcart });
                    res.render('index', {
                        message: req.flash('error'),
                        items: allItems,
                        category: "all",
                        numcart: numcart,
                        current: page,
                        pages: Math.ceil(count / perPage),
                        found: true
                    })
                });
            })
        })
})
router.get("/register", function (req, res) {
    res.render("register")
})
router.post("/register", function (req, res) {
    var user = new User({
        role: "borrower",
        username: req.body.username,
        studentID: req.body.studentID,
        name: req.body.name,
        surname: req.body.surname,
        tel: req.body.tel,
        lineID: req.body.lineID,
        email: req.body.email,
        address: req.body.address
    })
    if (req.body.password != req.body.confirm_password) {
        req.flash("error", "password and comfirm password not match!!");
        res.redirect("/register");
    } else {
        User.register(user, req.body.password, function (err, user) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/")
                })
            }
        })
    }
})
router.post("/login", passport.authenticate("local", {
    successRedirect: "/p/1",
    failureRedirect: "/p/1",
    failureFlash: true,
    successFlash: 'Welcome!'
}))
router.get("/logout", function (req, res) {
    req.session.edit = null
    req.logout();
    req.flash("success", "Log out success")
    res.redirect("/");
});
router.get("/editInfo/:user_id", middleware.isLoggedIn, function (req, res) {

    req.session.cart = {}
    User.findById(req.params.user_id, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            middleware.countQty(req, function (numcart) {
                res.render("editInfo", {
                    numcart: numcart
                })
            })
        }
    })
})
router.put("/updateInfo/:user_id", function (req, res) {
    User.findByIdAndUpdate(req.params.user_id, req.body.user, function (err, updatedUser) {
        console.log(req.body.user)
        if (err) {
            console.log(err)
        } else {
            req.flash("success", "Update Info Complete")
            res.redirect("/p/1")
        }

    })
})
router.get("/changePass/:user_id", middleware.isLoggedIn, function (req, res) {
    middleware.countQty(req, function (numcart) {

        res.render("changePass",{numcart:numcart})
    })
})
router.post("/changePass/:user_id", function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
        if (err) {
            console.log("can't find")
            console.log(err)
        } else {
            // if(req.body.oldPassword==req.body.newPassword){
            user.changePassword(req.body.oldPassword, req.body.newPassword, function (err) {
                if (err) {
                    req.flash("error", error)
                } else {
                    req.flash("success", "change password success")
                    res.redirect("/p/1")
                }
            })
        }
    })
})


module.exports = router;