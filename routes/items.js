var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var multer = require("multer");
var fs=require("fs");
var middleware=require("../middleware");

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

router.get("/editItems",middleware.isMember, function (req, res) {
    req.session.edit=true
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
router.get("/editItems/success",function(req,res){
    req.session.edit=null
    res.redirect("/")
})
router.get("/delItems/:id",middleware.isMember,function(req,res){

    Item.findById(req.params.id,function(err,item){
        if(err){
            console.log(err)
        }else{
            console.log(item.path)
            fs.unlink(item.path,function(err){
                if(err)throw err
                console.log("delPic")
            })
            item.remove();
            res.redirect("/")
        }
    })
})

router.get('/addItems',middleware.isMember, function (req, res, next) {
    res.render('items/add');
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
router.get("/edit",middleware.isMember,middleware.canEdit, function (res, req) {
    res.redirect("/")
})
router.get("/:category", function (req, res) {
    Item.find({ category: req.params.category }, function (err, allItems) {
        res.render('index', { message: req.flash('error'), items: allItems, category: req.params.category });
    })

})

module.exports = router;
