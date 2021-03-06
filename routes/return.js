var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var User = require("../models/user");
var Borrow = require("../models/borrow");
var Return = require("../models/return");
var History = require("../models/history")
var middleware = require("../middleware");
var nodemailer = require("nodemailer"); //mail


var middleware = require("../middleware");

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "LabStock.KMITL@gmail.com",
        pass: "Nitinon.556"
    }
});

router.post("/returnn/confirm/:id_return", function (req, res) {
    if (req.body.item == undefined) {
        req.flash("error", "Please select item to approve")
        res.redirect("/return/pending/member")
    } else {
        Return.findById(req.params.id_return, function (err, returnn) {
            // var temp = borrow;
            var temp = JSON.parse(JSON.stringify(returnn)); //clone OBJ
            var temp2 = JSON.parse(JSON.stringify(returnn)); //clone OBJ
            if (!Array.isArray(req.body.item)) { //กรณีส่งมาตัวเดียวมันจะไม่เป็น array ก็จับมันยัดเข้า array ไป 
                req.body.item = [req.body.item]
            }
            // กรณีส่งมาหลายตัว
            console.log(req.body.item)
            req.body.item.forEach(function (item, i) {
                if (item.length != 1) { //ของ Type ID
                    var indexItem = item.substring(0, 1)
                    // console.log(indexItem + " " + borrow.itemID[indexItem] + " " + borrow.itemName[indexItem])
                    var indexID = item.substring(1, )
                    console.log("ItemID: " + returnn.ID[indexItem][indexID])

                    var fItem = String(returnn.itemID[indexItem]);
                    var indexItem_temp = temp.itemID.indexOf(fItem);

                    var fID = String(returnn.ID[indexItem][indexID]);
                    var indexID_temp = temp.ID[indexItem_temp].indexOf(fID)

                    temp.ID[indexItem_temp].splice(indexID_temp, 1);
                    temp.qty[indexItem_temp]--;
                    if (temp.ID[indexItem_temp] == "") {
                        //ตัด string 
                        temp.itemID.splice(indexItem_temp, 1);
                        temp.ID.splice(indexItem_temp, 1);
                        temp.itemName.splice(indexItem_temp, 1);
                        temp.qty.splice(indexItem_temp, 1);
                        temp.limit.splice(indexItem_temp, 1);
                        temp.pic.splice(indexItem_temp, 1);
                    }
                } else { //ของ Type Non-ID
                    var indexItem = item
                    var fItem = String(returnn.itemID[indexItem]);
                    var indexItem_temp = temp.itemID.indexOf(fItem);
                    temp.itemID.splice(indexItem_temp, 1);
                    temp.ID.splice(indexItem_temp, 1);
                    temp.itemName.splice(indexItem_temp, 1);
                    temp.qty.splice(indexItem_temp, 1);
                    temp.limit.splice(indexItem_temp, 1);
                    temp.pic.splice(indexItem_temp, 1);
                }
            })
            temp.itemID.forEach(function (itemID, i) {
                // console.log(itemID + " " + i + " " + temp.itemName[i])clea
                var fItem = temp2.itemID.indexOf(itemID)
                temp.ID[i].forEach(function (ID, j) {
                    // console.log("ID: " + ID)
                    var fID = temp2.ID[fItem].indexOf(ID)
                    temp2.ID[fItem].splice(fID, 1)
                    temp2.qty[fItem]--;
                })
                if (temp2.ID[fItem] == "") {
                    temp2.itemID.splice(fItem, 1);
                    temp2.ID.splice(fItem, 1);
                    temp2.itemName.splice(fItem, 1);
                    temp2.qty.splice(fItem, 1);
                    temp2.limit.splice(fItem, 1);
                    temp2.pic.splice(fItem, 1);
                }
            })
            //  ================== add item to DB================================================
            //  // ==================================================================================
            if (temp.itemID != "") {
                Borrow.findById(temp.borrowID, function (err, founded) {
                    founded.itemID = temp.itemID
                    founded.itemName = temp.itemName
                    founded.pic = temp.pic
                    founded.qty = temp.qty
                    founded.ID = temp.ID
                    founded.limit = temp.limit
                    founded.save();
                })
            } else {
                Borrow.findById(temp.borrowID, function (err, founded) {
                    if (founded.itemID == "")
                        founded.remove();
                })
            }
            temp2.itemID.forEach(function (itemID, i) {
                if (temp2.ID[i] == "") { //it's mean Non id
                    console.log(temp2.itemID[i] + "  " + temp2.qty[i])
                    // ค่า i
                    Item.findById(temp2.itemID[i], function (err, item) {
                        if (err) {
                            console.log(err)
                        }
                        item.qty += temp2.qty[i];
                        item.save();
                    })
                } else {
                    Item.findById(temp2.itemID[i], function (err, item) {
                        temp2.ID[i].forEach(function (ID) {
                            console.log("ID: " + ID)
                            console.log("itemID " + temp2.itemID[i])
                            item.itemID.push(ID)
                            item.qty++;
                        })
                        item.save();

                    })

                }
            })

            var approver = {
                id: req.user._id,
                name: req.user.name,
                surname: req.user.surname
            }

            var historyR = {
                author: returnn.author,
                approver: approver,
                type: "return",
                itemID: temp2.itemID,
                itemName: temp2.itemName,
                pic: temp2.pic,
                ID: temp2.ID,
                qty: temp2.qty,
                date: temp2.date
            }
            History.create(historyR, function (err, history) {
                if (err) console.log(err)
                else {
                    User.findById(history.author.id, function (err, user) {
                        if (err) console.log(err)
                        else {
                            user.history.push(history)
                            user.save()
                            var txt = ""
                            history.itemName.forEach(function (name) {
                                txt += name + " ,"
                            })
                            var mailOptions = {
                                to: user.email,
                                subject: "Approve your return order complete.",
                                text: "อนุมัติการคืนอุปกรณ์เรียบร้อย: " + txt
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
                }
            })
            returnn.save();
            res.redirect("/return/pending/member")
            returnn.remove()
        })
    }
})
router.get("/return/pending/member", middleware.isLoggedIn, function (req, res) {
    // User.findById(req.user._id).populate("borrow").exec(function (err, user) {
    User.findById(req.user._id, function (err, user) {
        Return.find({

        }, function (err, foundedReturn) {
            middleware.countQty(req, function (numcart) {
                res.render("return/rPending_member", {
                    cart: user.cart,
                    numcart: numcart,
                    returnns: foundedReturn,
                    approve: true
                })
            })
        })
    })
})

router.get("/return", middleware.isLoggedIn, function (req, res) {
    User.findById(req.user._id).populate({
        path: 'borrow',
        match: {
            approve: true
        },
        options: {
            sort: {
                date: -1
            }
        }
    }).exec(function (err, user) {
        middleware.countQty(req, function (numcart) {
            res.render("return/request", {
                cart: user.cart,
                numcart: numcart,
                returnns: user.borrow,
                status: "request"
            })
        })
    })
})
// ========================search============================================
router.post("/return/request", function (req, res) {
    User.findById(req.user._id).populate({
        path: 'borrow',
        match: {
            approve: true
        },
        options: {
            sort: {
                date: -1
            }
        }
    }).exec(function (err, user) {
        var returnItem = [];
        user.borrow.forEach(function (borrow) {
            var dayy = borrow.date.toDateString() + " " + borrow.date.toLocaleTimeString();
            if (dayy.includes(req.body.search)) {
                returnItem.push(borrow)
            } else {
                borrow.itemName.forEach(function (name) {
                    if (name.includes(req.body.search)) {
                        returnItem.push(borrow)
                        return false
                    }
                })
            }
        })
        middleware.countQty(req, function (numcart) {
            res.render("return/request", {
                cart: user.cart,
                numcart: numcart,
                returnns: returnItem,
                status: "request"
            })
        })
    })
})
router.get("/return/returned", middleware.isLoggedIn, function (req, res) {
    User.findById(req.user._id).populate({
            path: 'history',
            match: {
                type: "return"
            },
            options: {
                sort: {
                    date: -1
                }
            }
        })
        .exec(function (err, user) {
            middleware.countQty(req, function (numcart) {
                res.render("return/request", {
                    cart: user.cart,
                    numcart: numcart,
                    returnns: user.history,
                    status: "returned"
                })
            })
        })
})
// =========================search===================================
router.post("/return/returned", function (req, res) {
    User.findById(req.user._id).populate({
            path: 'history',
            match: {
                type: "return"
            },
            options: {
                sort: {
                    date: -1
                }
            }
        })
        .exec(function (err, user) {
            var returnItem = [];
            user.history.forEach(function (returnn) {
                var dayy = returnn.date.toDateString() + " " + returnn.date.toLocaleTimeString();
                if (dayy.includes(req.body.search)) {
                    returnItem.push(returnn)
                } else {
                    returnn.itemName.forEach(function (name) {
                        if (name.includes(req.body.search)) {
                            returnItem.push(returnn)
                            return false
                        }
                    })
                }
            })
            middleware.countQty(req, function (numcart) {
                res.render("return/request", {
                    cart: user.cart,
                    numcart: numcart,
                    returnns: returnItem,
                    status: "returned"
                })
            })
        })
})
router.get("/return/pending", middleware.isLoggedIn, function (req, res) {
    User.findById(req.user._id).populate({
        path: 'return',

        options: {
            sort: {
                date: -1
            }
        }
    }).exec(function (err, user) {
        middleware.countQty(req, function (numcart) {
            res.render("return/request", {
                cart: user.cart,
                numcart: numcart,
                returnns: user.return,
                status: "pending"
            })
        })
    })
})
// =================================search=================================
router.post("/return/pending", function (req, res) {
    User.findById(req.user._id).populate({
        path: 'return',
        options: {
            sort: {
                date: -1
            }
        }
    }).exec(function (err, user) {
        var returnItem = [];
        user.return.forEach(function (returnn) {
            var dayy = returnn.date.toDateString() + " " + returnn.date.toLocaleTimeString();
            if (dayy.includes(req.body.search)) {
                returnItem.push(returnn)
            } else {
                returnn.itemName.forEach(function (name) {
                    if (name.includes(req.body.search)) {
                        returnItem.push(returnn)
                        return false
                    }
                })
            }
        })
        middleware.countQty(req, function (numcart) {
            res.render("return/request", {
                cart: user.cart,
                numcart: numcart,
                returnns: returnItem,
                status: "pending"
            })
        })
    })
})
router.post("/return/request/:borrow_id", function (req, res) {
    if (req.body.item == undefined) {
        req.flash("error", "Please select item to return")
        res.redirect("/return")
    } else {
        Borrow.findById(req.params.borrow_id, function (err, borrow) {
            // var temp = borrow;
            var temp = JSON.parse(JSON.stringify(borrow)); //clone OBJ
            var temp2 = JSON.parse(JSON.stringify(borrow)); //clone OBJ

            if (!Array.isArray(req.body.item)) { //กรณีส่งมาตัวเดียวมันจะไม่เป็น array ก็จับมันยัดเข้า array ไป 
                req.body.item = [req.body.item]
            }
            // กรณีส่งมาหลายตัว
            console.log(req.body.item)
            req.body.item.forEach(function (item, i) {
                if (item.length != 1) { //ของ Type ID
                    var indexItem = item.substring(0, 1)
                    console.log(indexItem + " " + borrow.itemID[indexItem] + " " + borrow.itemName[indexItem])
                    var indexID = item.substring(1, )
                    // console.log("ItemID: " + borrow.ID[indexItem][indexID])

                    var fItem = String(borrow.itemID[indexItem]);
                    var indexItem_temp = temp.itemID.indexOf(fItem);

                    var fID = String(borrow.ID[indexItem][indexID]);
                    var indexID_temp = temp.ID[indexItem_temp].indexOf(fID)

                    temp.ID[indexItem_temp].splice(indexID_temp, 1);
                    temp.qty[indexItem_temp]--;
                    if (temp.ID[indexItem_temp] == "") {
                        //ตัด string 
                        temp.itemID.splice(indexItem_temp, 1);
                        temp.ID.splice(indexItem_temp, 1);
                        temp.itemName.splice(indexItem_temp, 1);
                        temp.qty.splice(indexItem_temp, 1);
                        temp.limit.splice(indexItem_temp, 1);
                        temp.pic.splice(indexItem_temp, 1);
                    }
                } else { //ของ Type Non-ID
                    var indexItem = item
                    var fItem = String(borrow.itemID[indexItem]);
                    var indexItem_temp = temp.itemID.indexOf(fItem);
                    temp.itemID.splice(indexItem_temp, 1);
                    temp.ID.splice(indexItem_temp, 1);
                    temp.itemName.splice(indexItem_temp, 1);
                    temp.qty.splice(indexItem_temp, 1);
                    temp.limit.splice(indexItem_temp, 1);
                    temp.pic.splice(indexItem_temp, 1);
                }
            })
            temp.itemID.forEach(function (itemID, i) {
                console.log(itemID + " " + i + " " + temp.itemName[i])
                var fItem = temp2.itemID.indexOf(itemID)
                temp.ID[i].forEach(function (ID, j) {
                    console.log("ID: " + ID)
                    var fID = temp2.ID[fItem].indexOf(ID)
                    temp2.ID[fItem].splice(fID, 1)
                    temp2.qty[fItem]--;
                })
                if (temp2.ID[fItem] == "") {
                    temp2.itemID.splice(fItem, 1);
                    temp2.ID.splice(fItem, 1);
                    temp2.itemName.splice(fItem, 1);
                    temp2.qty.splice(fItem, 1);
                    temp2.limit.splice(fItem, 1);
                    temp2.pic.splice(fItem, 1);
                }
            })
            var author = {
                id: req.user._id,
                name: req.user.name,
                surname: req.user.surname,
                stdID: req.user.studentID
            };
            var requestReuturn = new Return({
                author: author,
                borrowID: borrow._id,
                itemID: temp2.itemID,
                itemName: temp2.itemName,
                pic: temp2.pic,
                ID: temp2.ID,
                limit: temp2.limit,
                qty: temp2.qty,
                approve: false,
                date: new Date()
            })
            borrow.itemID = temp.itemID
            borrow.itemName = temp.itemName
            borrow.pic = temp.pic
            borrow.ID = temp.ID
            borrow.limit = temp.limit
            borrow.qty = temp.qty

            console.log(borrow)
            console.log("=============================")
            console.log(requestReuturn)

            Return.create(requestReuturn, function (err, request) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(request)
                    User.findById(req.user._id, function (err, foundedUser) {
                        if (err) {
                            console.log(err)
                        } else {
                            foundedUser.return.push(request)
                            foundedUser.save();
                        }
                    })
                }
            })

            borrow.save();
            res.redirect("/return")

            console.log("=================================================")
        })
    }
})
module.exports = router;