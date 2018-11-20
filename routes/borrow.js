var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var User = require("../models/user");
var Borrow = require("../models/borrow");
var History=require("../models/history");
var middleware = require("../middleware");

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
        options:{sort:{date:-1}}
    }).exec(function (err, user) {
        middleware.countQty(req, function (numcart) {
            res.render("borrow/bPending", {
                cart: user.cart,
                numcart: numcart,
                borrows: user.borrow,
                status:"pending"
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
        options:{sort:{date:-1}}
    }).exec(function (err, user) {
        middleware.countQty(req, function (numcart) {
            res.render("borrow/bPending", {
                cart: user.cart,
                numcart: numcart,
                borrows: user.history,
                status:"borrowed"

            })
        })
    })
})
router.post("/borrow/confirm/:borrow_id", function (req, res) {
    Borrow.findById(req.params.borrow_id, function (err, borrow) {
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
                // console.log(indexItem + " " + borrow.itemID[indexItem] + " " + borrow.itemName[indexItem])
                var indexID = item.substring(1, )
                console.log("ItemID: " + borrow.ID[indexItem][indexID])

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
        borrow.approve = true
// ==================================================================================
        borrow.itemID.forEach(function (itemID, i) {
            if (borrow.ID[i] == "") { //it's mean Non id
                console.log(borrow.itemID[i] + "  " + borrow.qty[i])
                // ค่า i
                Item.findById(borrow.itemID[i], function (err, item) {
                    if (err) {
                        console.log(err)
                    }
                    item.qty -= borrow.qty[i];
                    item.save();
                })
            } else {
                Item.findById(borrow.itemID[i], function (err, item) {
                    borrow.ID[i].forEach(function (ID) {
                        console.log("ID: " + ID)
                        console.log("itemID " + borrow.itemID[i])
                        item.itemID.splice(item.itemID.indexOf(ID), 1)
                        item.qty--;
                    })
                    item.save();
                })
            }
        })
        borrow.save()
        var approver={
            id:req.user._id,
            name:req.user.name,
            surname:req.user.surname
        }
        var now=new Date();
        var historyB={
            author:borrow.author,
            approver:approver,
            type:"borrow",
            itemID:temp2.itemID,
            itemName:temp2.itemName,
            pic:temp2.pic,
            ID:temp2.ID,
            qty:temp2.qty,
            date:now
        }
        console.log(historyB)
        History.create(historyB,function(err,history){
            if(err) console.log(err)
            else{
            User.findById(req.user._id,function(err,user){
                if(err)console.log(err)
                else{
                    user.history.push(history)
                    user.save()
                }
            })
        }
        })
// ==================================================================================
        res.redirect("/borrow/pending/member")
    })
})
router.get("/borrow/del/:borrow_id", function (req, res) {
    Borrow.findByIdAndRemove(req.params.borrow_id, function (err, borrow) {
        User.findById(req.user._id, function (err, user) {
            user.borrow.splice(user.borrow.indexOf(borrow._id), 1);
            user.save();
        })
        res.redirect("/borrow/pending/member");
    })
})

module.exports = router;