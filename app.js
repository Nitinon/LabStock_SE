var express=require("express"),
    app=express(),
    bodyParser=require("body-parser"),
    mongoose=require("mongoose"),
    flash=require("connect-flash"),
    passport=require("passport"),
    LocalStrategy=require("passport-local"),
    methodOverride=require("method-override"),
    User=require("./models/user")


mongoose.connect("mongodb://localhost/Lab_stock")
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs")
app.use(express.static(__dirname+"/public"))
app.use(methodOverride("_method"))
app.use(flash())

app.use(require("express-session")({
    secret:"Secret",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// local
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    // res.locals.error=req.flash("error");
    // res.locals.success=req.flash("success");
    next();
});

app.get("/",function(req,res){
    res.render('index', {message: req.flash('error')}
    );
})
app.get("/register",function(req,res){
    res.render("register")
})
app.post("/register",function(req,res){
    var user=new User({
        username    :req.body.username,
        studentID   :req.body.studentID,
        tel         :req.body.tel,
        lineID      :req.body.lineID,
        email       :req.body.email,
        address     :req.body.address
    })
    if(req.body.password!=req.body.confirm_password){
        console.log("not match")
    }else{
        User.register(user,req.body.password,function(err,user){
            if(err){
                console.log(err)
            }else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/")
                })
            }
        })
    }
})
app.post("/login",passport.authenticate("local",
    {
        successRedirect:"/",
        failureRedirect:"/",
        failureFlash: true
    }
))
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});
app.get("/:user_id/editInfo",function(req,res){
    User.findById(req.params.user_id, function(err, user){
        user.changePassword("0861731038","1234",function(err){
            if(err){console.log(err)}else{
                user.save()
                console.log("eieizaa")
            }
        })
    })
})

app.listen("3000",function(){
    console.log("connected")
})