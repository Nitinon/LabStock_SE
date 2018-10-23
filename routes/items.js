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
