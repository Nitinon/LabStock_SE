var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    nodemailer = require("nodemailer"), //mail
    User = require("./models/user")

var path = require('path');
var indexRoute=require("./routes/index"),
    itemRoute = require("./routes/items")


// var smtpTransport = nodemailer.createTransport({
    //     service: "gmail",
    //     host: "smtp.gmail.com",
    //     auth: {
        //         user: "LabStock.KMITL@gmail.com",
        //         pass: "Nitinon.556"
        //     }
        // });
        
app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "/uploads"));

mongoose.connect("mongodb://localhost/Lab_stock")
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs")
app.use(methodOverride("_method"))
app.use(flash())
        
app.use(require("express-session")({
    secret: "Secret",
    resave: false,
    saveUninitialized: false,
    // cookie: { maxAge: 60000 }
}))
        
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
        // local
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    // sadsad
    res.locals.session = req.session;
    next();
});
        
app.use(itemRoute);
app.use(indexRoute)
// app.get("/hihi", function (req, res) {
//     User.find({}, "email", function (err, mails) {
//         mails.forEach(function (Element) {
//             var mailOptions = {
//                 to: Element.email,
//                 subject: req.query.subject,
//                 text: req.query.text
//             }
//             console.log(mailOptions);
//             smtpTransport.sendMail(mailOptions, function (error, response) {
//                 if (error) {
//                     console.log(error);
//                     res.end("error");
//                 } else {
//                     console.log("Message sent: " + response.message);
//                     res.end("sent");
//                 }
//             });
//         })
//     })
// })

// app.listen("3000","172.20.10.6", function () {
app.listen("3000", function () {
    console.log("connected")
})