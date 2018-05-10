var express = require('express');
var router = express.Router();


const format = require('string-format');
const JSON = require('circular-json');

var path = require('path');
var ldap = require('ldapjs');
//var express = require('express');
var app = express();

var passport = require('passport');
var passportLocal = require('passport-local');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var client = ldap.createClient({
    url: 'ldap://ldap.northamerica.cerner.net:389',
});
//var flash = require('connect-flash');

var searchBase = 'dc=northamerica,dc=cerner,dc=net';

app.use(express.static(__dirname +'./../../')); //serves the LoginPage.ejs

app.use(bodyParser.urlencoded({extended: false}));
//app.use(express.bodyParser());
app.use(cookieParser());
app.use(session({
    key: 'session_id',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 6000000 }
}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(flash());

String.format = function() {
            var s = arguments[0];
            for (var i = 0; i < arguments.length - 1; i += 1) {
                var reg = new RegExp('\\{' + i + '\\}', 'gm');
                s = s.replace(reg, arguments[i + 1]);
            }
            return s;
        };

function verifyCreds(username, password, done){
    console.log('          Verify Creds');
    if(username.length===19){
        client.bind(username, password, function (err) {
            if (err) {
                done(null, false, {message: 'Invalid LDAP login credentials. Please try again.'});
            }
            else {
                done(null, {id: username, name: username, pass: password});
            }
        })
    }
    else {
        username = username + "@cerner.net";
        client.bind(username, password, function (err) {
            if (err) {
                done(null, false, {message: 'Invalid LDAP login credentials. Please try again.'});
            }
            else {
                done(null, {id: username, name: username, pass: password});
            }
        })
    }
}

passport.use(new passportLocal.Strategy(verifyCreds));

passport.serializeUser(function(user, done){
    done(null, user.id);
    console.log("            Passport: User Serialized");
});

passport.deserializeUser(function(id, done){
    done(null, {id: id, name: id});
    console.log("            Passport: User Deserialized");
});


app.get('/main', function(req, res){
    res.render('page', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
    });
  var opts = {
  filter: String.format('&(objectClass=*)(userPrincipalName={0})(l=Bangalore)',req.user.id.toString()),
  //filter: '(objectClass=*)',
  scope: 'sub',
}; 

client.search(searchBase, opts, function(err, res) {
  res.on('searchEntry', function (entry) {
    console.log(entry.attributes[13].vals[0].toString());
    global.fullName = entry.attributes[13].vals[0].toString();
  });
});

});

router.get('/login',function (req,res){
    res.render('loginForm', {
        title: 'Express',
    })
})

// router.post('/login',function (req,res){
//     res.render('index', {
//         title: 'Express',
//     })
// })

app.get('/main/data', function (req,res) {
    if(req.isAuthenticated())
    {
        res.send("Welcome: " + fullName);
    }
    else
    {
        res.sendStatus(404);
    }
})

router.post('/login', passport.authenticate('local'), function(req, res){
    console.log("hit hit");

    //passport.use(new passportLocal.Strategy(verifyCreds));

    res.render('index', {
        title: 'Express',
    })
//     passport.authenticate("local")(req, res, function(){
//         console.log("hit hit hit");
    
// })
})

// router.post('/login', passport.authenticate('local', {
//     successRedirect: '/main',
//     failureRedirect: '/login',
//     badRequestMessage: 'Missing Credentials. Enter Cerner Credentials',
//     //failureFlash: true
// })
// )


app.get('/logout', function(req,res){
    req.logout();
    delete req.isAuthenticated();
    res.clearCookie('blah_id');
    res.redirect('/main');
})





// /* GET home page. */
// router.get('/login', function(req, res, next) {
//     res.render('loginForm', { title: 'Express' });
//   });





module.exports = router;
