var express=require("express");
var router = express.Router();
var Item=require("../models/item");
var multer=require("multer");
router.getImages = function (callback, limit) {
    Item.find(callback).limit(limit);
}
router.getImageById = function (id, callback) {
    Item.findById(id, callback);
}

var ddd=Date.now()
// To get more info about 'multer'.. you can go through https://www.npmjs.com/package/multer..
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+file.originalname);
    }
});
var upload = multer({
    storage: storage
});

router.get("/:category",function (req,res) {
    Item.find({category:req.params.category},function(err,allItems){
        res.render('index', { message: req.flash('error'),items:allItems,category:req.params.category});
    })

})
router.get('/addItems', function (req, res, next) {
    res.render('items/add');
});

router.post('/addItems',upload.any(),function (req,res) {
    var path = req.files[0].path;
    var imageName = req.files[0].filename;
    var imagepath = {};
    imagepath['path'] = path;
    imagepath['originalname'] = imageName;

    var newItem = new Item({
        name: req.body.name,
        category: req.body.category,
        type: req.body.type,
        itemID: req.body.itemID,
        qty: req.body.qty,
        limit: req.body.limit,
        detail:req.body.detail,
        path:path,
        originalname:imageName
    })
    Item.create(newItem,function(err){
        if(err){
            console.log(err)
        }else{
            console.log("success")
            res.redirect("/")
        }
    })

});

module.exports = router;
