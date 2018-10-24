module.exports = middlewareObj;
var Item = require("../models/item");
var User = require("../models/user");

var middlewareObj = {};
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.user.role)
        return next();
    }
    console.log(req.user)
    req.flash("error", "Please Login First");
    res.redirect("/");
}
middlewareObj.isMember = function (req, res, next) {
    if (req.isAuthenticated() && req.user.role == "member") {
        return next();
    }
    req.flash("error", "You Don't have permission to access");
    res.redirect("/");
}
middlewareObj.canEdit = function (req, res, next) {
    if ((req.session.edit != null || req.session.edit != undefined) && req.session.edit == true) {
        return next();
    } else {
        req.flash("error", "You Don't have permission to access");
        res.redirect("/");
    }
}
middlewareObj.countQty = function (req,callback) {
    if (req.isAuthenticated()) {
        User.findById(req.user.id, function (err, user) {
            // count in cart
            var num=0
            user.cart.qty.forEach(function (qty) {
                num += parseInt(qty, 10)
            })
            // console.log(user.cart)
            console.log(num)
            return callback(num);
        })
    }
    else {
        return callback(0);
    }
}
// middlewareObj.checkCampgroundOwnership=function(req,res,next){
//         if(req.isAuthenticated()){
//             Campground.findById(req.params.id,function(err,foundCampground){
//                 if(err){
//                     req.flash("error","Campground not found");
//                     res.redirect("back");
//                 }else{
//                     if(foundCampground.author.id.equals(req.user._id)){
//                         next();
//                     }else{
//                         req.flash("error","You don't have permission to do that");
//                         res.redirect("back");
//                     }
//                 }
//             });
//         }else{
//             req.flash("error","Please Login to do that");
//             res.redirect("back");
//         }
//     }
// middlewareObj.checkCommentOwnership=function(req,res,next){
//     if(req.isAuthenticated()){
//         Comment.findById(req.params.comment_id,function(err,foundComment){
//             if(err){
//                 res.redirect("back");
//             }else{
//                 if(foundComment.author.id.equals(req.user._id)){
//                     next();
//                 }else{
//                     req.flash("error","You don't have permission to do that");
//                     res.redirect("back");
//                 }
//             }
//         });
//     }else{
//         req.flash("error","Please Login to do that");
//         res.redirect("back");
//     }
// }
module.exports = middlewareObj;