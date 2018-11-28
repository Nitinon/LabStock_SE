var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var User = require("../models/user");
var Borrow = require("../models/borrow");
var History = require("../models/history");
var System = require("../models/system");
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
router.get("/borrow/pending/member/:borrow_id/:history_id", function (req, res) {
    console.log(req.params.history_id)
    System.findOne({}, function (err, sys) {
        console.log(sys)
        if (sys.statusError == true) {
            Borrow.findByIdAndDelete(req.params.borrow_id, function (err, borrow) {
                var mailOptions = {
                    to: borrow.author.email,
                    subject: "Reject you borrow order.",
                    text: "ปฏิเสธรายการยืมอุปกรณ์ของคุณเนื่องจาก มีอุปกรณ์บางชิ้นไม่ครบ"
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
            })
            History.findByIdAndDelete(req.params.history_id, function () {})

        } else {
            Borrow.findById(req.params.borrow_id, function (err, borrow) {
                if (err) console.log(err)
                else {
                    var txt = ""
                    borrow.itemName.forEach(function (name) {
                        txt += name + " ,"
                    })
                    console.log("txt: " + txt)
                    var mailOptions = {
                        to: borrow.author.email,
                        subject: "Approve your order complete.",
                        text: "อนุมัติการยืมอุปกรณ์เรียบร้อย : " + txt
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
        sys.statusError = false
        sys.save()
    })
    res.redirect("/borrow/pending/member")
})

router.get("/borrow/pending/member", function (req, res) {
    // User.findById(req.user._id).populate("borrow").exec(function (err, user) {
    User.findById(req.user._id, function (err, user) {
        Borrow.find({
            approve: "false"
        }, function (err, foundedBorrow) {
            middleware.countQty(req, function (numcart) {
                res.render("borrow/bPending_member", {
                    cart: user.cart,
                    numcart: numcart,
                    borrows: foundedBorrow,
                    approve: true
                })
            })
        })
    })
})
router.get("/borrow/pending", function (req, res) {
    User.findById(req.user._id).populate({
        path: 'borrow',
        match: {
            approve: "false"
        },
        options: {
            sort: {
                date: -1
            }
        }
    }).exec(function (err, user) {
        middleware.countQty(req, function (numcart) {
            res.render("borrow/bPending", {
                cart: user.cart,
                numcart: numcart,
                borrows: user.borrow,
                status: "pending"
            })
        })
    })
})
// ===================search===============================
router.post("/borrow/pending", function (req, res) {
    User.findById(req.user._id).populate({
        path: 'borrow',
        match: {
            approve: "false"
        },
        options: {
            sort: {
                date: -1
            }
        }
    }).exec(function (err, user) {
        var borrowItem = [];
        user.borrow.forEach(function (borrow) {
            var dayy = borrow.date.toDateString() + " " + borrow.date.toLocaleTimeString();
            if (dayy.includes(req.body.search)) {
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
            res.render("borrow/bPending", {
                cart: user.cart,
                numcart: numcart,
                borrows: borrowItem,
                status: "pending"
            })
        })
    })
})

router.get("/borrow/borrowed", function (req, res) {
    User.findById(req.user._id).populate({
        path: 'history',
        match: {
            type: "borrow"
        },
        options: {
            sort: {
                date: -1
            }
        }
    }).exec(function (err, user) {
        middleware.countQty(req, function (numcart) {
            res.render("borrow/bPending", {
                cart: user.cart,
                numcart: numcart,
                borrows: user.history,
                status: "borrowed"

            })
        })
    })
})

router.post("/borrow/borrowed", function (req, res) {
    User.findById(req.user._id).populate({
        path: 'history',
        match: {
            type: "borrow"
        },
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
            res.render("borrow/bPending", {
                cart: user.cart,
                numcart: numcart,
                borrows: borrowItem,
                status: "borrowed"

            })
        })
    })
})
router.post("/borrow/confirm/:borrow_id", function (req, res) {

    if (req.body.item == undefined) {
        req.flash("error", "Please select item to approve")
        res.redirect("/borrow/pending/member")
    } else {
        Borrow.findById(req.params.borrow_id, function (err, borrow) {
            var temp = JSON.parse(JSON.stringify(borrow)); //clone OBJ
            var temp2 = JSON.parse(JSON.stringify(borrow)); //clone OBJ
            if (!Array.isArray(req.body.item)) { //กรณีส่งมาตัวเดียวมันจะไม่เป็น array ก็จับมันยัดเข้า array ไป 
                req.body.item = [req.body.item]
            }
            var now = new Date();
            temp2.date = now;
            // กรณีส่งมาหลายตัว
            console.log(req.body.item)
            req.body.item.forEach(function (item, i) {
                if (item.length != 1) { //ของ Type ID
                    var indexItem = item.substring(0, 1)
                    // console.log(indexItem + " " + borrow.itemID[indexItem] + " " + borrow.itemName[indexItem])
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
                var fItem = temp2.itemID.indexOf(itemID)
                temp.ID[i].forEach(function (ID, j) {
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
            borrow.itemID = temp2.itemID
            borrow.itemName = temp2.itemName
            borrow.pic = temp2.pic
            borrow.ID = temp2.ID
            borrow.limit = temp2.limit
            borrow.qty = temp2.qty
            borrow.date = temp2.date
            borrow.approve = true
            borrow.lateStatus = false
            // ==================================================================================
            temp2.itemID.forEach(function (itemID, i) {
                if (temp2.ID[i] == "") { //it's mean Non id
                    // ค่า i
                    Item.findById(temp2.itemID[i], function (err, item) {
                        if (err) {
                            console.log(err)
                        }
                        if (item.qty > 0 && item.qty - temp2.qty[i] >= 0) {
                            item.qty -= temp2.qty[i];
                            item.save();
                        } else {
                            System.findOne({}, function (err, sys) {
                                console.log("============================================")
                                sys.statusError = true;
                                console.log(sys)
                                sys.save()
                            })
                        }
                    })
                } else {
                    Item.findById(temp2.itemID[i], function (err, item) {
                        temp2.ID[i].forEach(function (ID) {
                            if (item.itemID.indexOf(ID) != -1) {
                                // console.log("ID: " + ID)
                                // console.log("itemID " + temp2.itemID[i])
                                item.itemID.splice(item.itemID.indexOf(ID), 1)
                                item.qty--;
                            } else {
                                req.flash("error", "some item error")
                                System.findOne({}, function (err, sys) {
                                    console.log("============================================")
                                    sys.statusError = true;
                                    console.log(sys)
                                    sys.save()
                                })
                            }
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
            var historyB = {
                author: borrow.author,
                approver: approver,
                type: "borrow",
                itemID: temp2.itemID,
                itemName: temp2.itemName,
                pic: temp2.pic,
                ID: temp2.ID,
                qty: temp2.qty,
                date: temp2.date
            }
            History.create(historyB, function (err, history) {
                console.log("====================Hisssssssssss========================")
                if (err) console.log(err)
                else {
                    User.findById(history.author.id, function (err, user) {
                        // console.log(user)
                        if (err) console.log(err)
                        else {
                            user.history.push(history)
                            user.save()
                        }
                    })
                }
                res.redirect("/borrow/pending/member/" + borrow._id + "/" + history._id)

            })
            // ==================================================================================
            borrow.save()

        })


    }
})
router.get("/borrow/del/:borrow_id", function (req, res) {
    Borrow.findByIdAndRemove(req.params.borrow_id, function (err, borrow) {
        User.findById(req.user._id, function (err, user) {
            var txt = ""
            borrow.itemName.forEach(function (name) {
                txt += name + " ,"
            })
            var mailOptions = {
                to: user.email,
                subject: "Reject you borrow order.",
                text: "รายการการยืมอุปกรณ์ "+txt+" ของคุณถูกปฏิเสธจากสมาชิก"
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
            user.borrow.splice(user.borrow.indexOf(borrow._id), 1);
            user.save();
        })
        res.redirect("/borrow/pending/member");
    })
})

module.exports = router;