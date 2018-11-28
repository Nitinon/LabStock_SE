var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var User = require("../models/user");
var Borrow = require("../models/borrow");
var History = require("../models/history");
var middleware = require("../middleware");
var middleware = require("../middleware");
var nodemailer = require("nodemailer"); //mail


var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "LabStock.KMITL@gmail.com",
        pass: "Nitinon.556"
    }
});
router.get("/history/notReturn", middleware.isLoggedIn, function (req, res) {
    User.findById(req.user._id, function (err, user) {
        Borrow.find({
            approve: true
        }, function (err, borrowNot) {
            middleware.countQty(req, function (numcart) {
                borrowNot.forEach(function (borrow) {
                    borrow.limit.forEach(function (limit) {
                        var tempDate = new Date(borrow.date)
                        var DateNow = new Date(Date.now())
                        tempDate.setDate(tempDate.getDate() + parseInt(limit))
                        console.log(DateNow.toDateString() + " " + tempDate.toDateString())
                        console.log(DateNow > tempDate)
                        if (DateNow > tempDate) {
                            borrow.lateStatus = true;
                            var mailOptions = {
                                to: borrow.author.email,
                                subject: "Some order lated",
                                text: "มีรายการยืมอุปกรณ์ของคุณเลยกำหนดโปรดนำมาคืนโดนด่วน"
                            }
                            smtpTransport.sendMail(mailOptions, function (error, response) {
                                if (error) {
                                    console.log(error);
                                    res.end("error");
                                } else {
                                    console.log("Message sent: " + response.message);
                                    res.end("sent");
                                }
                            });
                        }
                    })
                    borrow.save()
                })
                res.render("history/historyNot", {
                    cart: user.cart,
                    numcart: numcart,
                    histories: borrowNot,
                    type: "Not Return"
                })
            })
        })
    })
})

router.post("/history/notReturn", middleware.isLoggedIn, function (req, res) {
    User.findById(req.user._id, function (err, user) {
        Borrow.find({
            approve: true
        }, function (err, borrowNot) {
            var borrowItem = [];
            borrowNot.forEach(function (borrow) {
                var name = borrow.author.name + " " + borrow.author.surname;
                var dayy = borrow.date.toDateString() + " " + borrow.date.toLocaleTimeString();
                if (dayy.includes(req.body.search)) {
                    borrowItem.push(borrow)
                } else
                if (name.includes(req.body.search) || borrow.author.stdID.includes(req.body.search)) {
                    borrowItem.push(borrow)
                } else {
                    borrow.itemName.forEach(function (name) {
                        if (name.includes(req.body.search)) {
                            borrowItem.push(borrow)
                            return false
                        }
                    })
                }
            })

            middleware.countQty(req, function (numcart) {
                res.render("history/historyNot", {
                    cart: user.cart,
                    numcart: numcart,
                    histories: borrowItem,
                    type: "Not Return"
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
                type: "History"
            })
        })
    })
})
router.post("/history", middleware.isLoggedIn, function (req, res) {
    User.findById(req.user._id).populate({
        path: 'history',
        options: {
            sort: {
                date: -1
            }
        }
    }).exec(function (err, user) {
        var borrowItem = [];
        user.history.forEach(function (borrow) {
            var dayy = borrow.date.toDateString() + " " + borrow.date.toLocaleTimeString();
            if (dayy.includes(req.body.search)) {
                borrowItem.push(borrow)
            } else
            if (borrow.type.includes(req.body.search)) {
                borrowItem.push(borrow)
            } else {
                borrow.itemName.forEach(function (name) {
                    if (name.includes(req.body.search)) {
                        borrowItem.push(borrow)
                        return false
                    }
                })
            }
        })
        middleware.countQty(req, function (numcart) {
            res.render("history/history", {
                cart: user.cart,
                numcart: numcart,
                histories: borrowItem,
                type: "History"
            })
        })
    })
})
router.get("/history/all", function (req, res) {
    User.findById(req.user._id, function (err, user) {
        History.find({}).sort({
            date: -1
        }).exec(function (err, history) {
            if (err) console.log(err)
            else {
                middleware.countQty(req, function (numcart) {
                    res.render("history/history", {
                        cart: user.cart,
                        numcart: numcart,
                        histories: history,
                        type: "All History"
                    })
                })
            }
        })
    })
})
router.post("/history/all", function (req, res) {
    User.findById(req.user._id, function (err, user) {
        History.find({}).sort({
            date: -1
        }).exec(function (err, history) {
            var historyItem = [];
            // searching algorithm
            history.forEach(function (borrow) {
                var name = borrow.author.name + " " + borrow.author.surname;
                var dayy = borrow.date.toDateString() + " " + borrow.date.toLocaleTimeString();
                if (dayy.includes(req.body.search)) {
                    borrowItem.push(borrow)
                } else
                if (name.includes(req.body.search) || borrow.author.stdID.includes(req.body.search) || borrow.type.includes(req.body.search)) {
                    historyItem.push(borrow)
                } else {
                    borrow.itemName.forEach(function (name) {
                        if (name.includes(req.body.search)) {
                            historyItem.push(borrow)
                            return false
                        }
                    })
                }
            })
            middleware.countQty(req, function (numcart) {
                res.render("history/history", {
                    cart: user.cart,
                    numcart: numcart,
                    histories: historyItem,
                    type: "All History"
                })
            })
        })
    })
})
module.exports = router;