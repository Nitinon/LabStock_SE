var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User = require("./models/user")


app.use(express.static(__dirname + "/public"))
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
    next();
});

app.get("/", function (req, res) {
    res.render('index', { message: req.flash('error') }
    );
})
app.get("/register", function (req, res) {
    res.render("register")
})
app.post("/register", function (req, res) {
    var user = new User({
        role:"borrower",
        username: req.body.username,
        studentID: req.body.studentID,
        name: req.body.name,
        surname: req.body.surname,
        tel: req.body.tel,
        lineID: req.body.lineID,
        email: req.body.email,
        address: req.body.address
    })
    if (req.body.password != req.body.confirm_password) {
        req.flash("error", "password and comfirm password not match!!");
        res.redirect("/register");
    } else {
        User.register(user, req.body.password, function (err, user) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/")
                })
            }
        })
    }
})
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/",
        failureFlash: true,
        successFlash: 'Welcome!'
    }
))
app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Log out success")
    res.redirect("/");
});
app.get("/editInfo/:user_id", function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            res.render("editInfo")
        }
    })
})
app.put("/updateInfo/:user_id",function(req,res){
    User.findByIdAndUpdate(req.params.user_id,req.body.user,function(err,updatedUser){
        console.log(req.body.user)
        if(err){
            console.log(err)
        }else{
            req.flash("success","Update Info Complete")
            res.redirect("/")
        }

    })
})
app.get("/changePass/:user_id", function (req, res) {
    res.render("changePass")
})
app.post("/changePass/:user_id", function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
        if (err) {
            console.log("can't find")
            console.log(err)
        } else {
            // if(req.body.oldPassword==req.body.newPassword){
            user.changePassword(req.body.oldPassword, req.body.newPassword, function (err) {
                if (err) {
                    req.flash("error",error)
                } else {
                    req.flash("success","change password success")
                    res.redirect("/")
                }
            })
        }
    })
})

app.listen("3000", function () {
    console.log("connected")
})