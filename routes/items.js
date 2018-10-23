var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var User = require("../models/user");

var multer = require("multer");
var fs = require("fs");
var middleware = require("../middleware");

router.getImages = function (callback, limit) {
    Item.find(callback).limit(limit);
}
router.getImageById = function (id, callback) {
    Item.findById(id, callback);
}

var ddd = Date.now()
// To get more info about 'multer'.. you can go through https://www.npmjs.com/package/multer..
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});
var upload = multer({
    storage: storage
});

// router
router.post("/addCart/:item_id", function (req, res) {
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
router.get("/cart",function(req,res){
    middleware.countQty(req,function(numcart){
        res.render("cart/cart",{numcart:numcart,cart:req.user.cart})
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
        res.redirect("/")
    })
})
router.get("/editItems", middleware.isMember, function (req, res) {
    req.session.edit = true
    res.redirect("/")
    // console.log();
    // Item.findByIdAndUpdate(req.params.id,
    //     {$push: {itemID: "eiei"},$inc: { qty: 1 }},
    //     {safe: true, upsert: true},
    //     function(err, doc) {
    //         if(err){
    //         console.log(err);
    //         }else{
    //         //do stuff
    //         }
    //     }
    // ); 
})
router.get("/editItems/success", function (req, res) {
    req.session.edit = null
    res.redirect("/")
})
router.get("/editItems/:item_id", function (req, res) {
    // router.get("/editItems/:item_id",middleware.canEdit, function (req, res) {
    Item.findById(req.params.item_id, function (err, item) {
        if (err) {
            console.log(err)
        } else {
            middleware.countQty(req,function(numcart){
                res.render("items/edit", { item: item,numcart:numcart })
            })  
        }
    })
})
router.put("/editItems/:item_id", function (req, res) {
    Item.findByIdAndUpdate(req.params.item_id, req.body.item, function (err) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/")
        }
    })
})
router.post("/editItems/:item_id/addID", function (req, res) {
    Item.findById(req.params.item_id, function (err, foundedItem) {
        if (err) {
            console.log(err)
        } else {
            foundedItem.itemID.push(req.body.newID)
            foundedItem.qty++
            foundedItem.save()
            console.log(foundedItem)
            req.flash("success", "Add ID Complete")
            res.redirect("/editItems/" + req.params.item_id)
        }
    })
})

router.post("/editItems/:item_id/delID", function (req, res) {
    Item.findById(req.params.item_id, function (err, foundedItem) {
        if (err) {
            console.log(err)
        } else {
            console.log(req.body)
            foundedItem.itemID.splice(req.body.selectDel, 1)
            foundedItem.qty--
            foundedItem.save()
            console.log(foundedItem)
            req.flash("success", "Del ID Complete")
            res.redirect("/editItems/" + req.params.item_id)
        }
    })
})
router.get("/delItems/:id", middleware.isMember, function (req, res) {

    Item.findById(req.params.id, function (err, item) {
        if (err) {
            console.log(err)
        } else {
            console.log(item.path)
            fs.unlink(item.path, function (err) {
                if (err) throw err
                console.log("delPic")
            })
            item.remove();
            res.redirect("/")
        }
    })
})

router.get('/addItems', middleware.isMember, function (req, res, next) {
    middleware.countQty(req,function(numcart){
        res.render('items/add',{numcart:numcart});
    })   
});

router.post('/addItems', upload.any(), function (req, res) {
    var path = req.files[0].path;
    var imageName = req.files[0].filename;
    var imagepath = {};
    imagepath['path'] = path;
    imagepath['originalname'] = imageName;

    var newItem = new Item({
        name: req.body.name,
        category: req.body.category,
        type: req.body.type,
        itemID: [req.body.itemID],
        qty: req.body.qty,
        limit: req.body.limit,
        detail: req.body.detail,
        path: path,
        originalname: imageName,
    })
    if (req.body.type == "ID") {
        newItem.qty = 1;
    }
    Item.create(newItem, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("success")
            res.redirect("/")
        }
    })

});

router.get("/:category", function (req, res) {
    Item.find({ category: req.params.category }, function (err, allItems) {
        middleware.countQty(req,function(numcart){
            res.render('index', { message: req.flash('error'), items: allItems, category: req.params.category, numcart: numcart });
        });
    })

})

module.exports = router;
