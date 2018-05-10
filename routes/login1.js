
var express = require('express');
var router = express.Router();


const format = require('string-format');
const JSON = require('circular-json');

var path = require('path');
var ldap = require('ldapjs');
var app = express();

var passport = require('passport');
var passportLocal = require('passport-local');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var client = ldap.createClient({
    url: 'ldap://ldap.northamerica.cerner.net:389',
});

var searchBase = 'dc=northamerica,dc=cerner,dc=net';

//app.use(express.static(__dirname +'./../../')); //serves the LoginPage.ejs

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    key: 'session_id',
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 6000000 }
}));

global.IsLoggedIn = false;


String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i += 1) {
        var reg = new RegExp('\\{' + i + '\\}', 'gm');
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
};

router.get('/login', function (req, res) {
    res.render('loginForm', {
        title: 'Express',
    })
})

router.post('/login', function (req, res) {
    console.log("hit hit");
    function verifyCreds(username, password) {
        console.log('          Verify Creds');
        if (username.length === 19) {
            client.bind(username, password, function (err) {
                if (err) {
                    console.log(err);
                    res.send('Missing Credentials. Enter Cerner Credentials')
                }
                else {
                    IsLoggedIn = true;
                    res.redirect('/main');
                }
            })
        }
        else {
            username = username + "@cerner.net";
            client.bind(username, password, function (err) {
                if (err) {
                    console.log(err);
                    res.send('Missing Credentials. Enter Cerner Credentials')
                }
                else {
                    IsLoggedIn = true;
                    res.redirect('/main');
                }
            })
        }
    }
    verifyCreds(req.body.username, req.body.password);
    global.logInUser = req.body.username;

})


router.get('/main', function (req, res) {
    res.render('page', {
        isAuthenticated: req.IsLoggedIn,
        value: logInUser,
    });
    var opts = {
        filter: String.format('&(objectClass=*)(userPrincipalName={0})(l=Bangalore)', logInUser + "@cerner.net"),
        //filter: '(objectClass=*)',
        scope: 'sub',
    };

    client.search(searchBase, opts, function (err, res) {
        res.on('searchEntry', function (entry) {
            console.log(entry.attributes[13].vals[0].toString());
            global.fullName = entry.attributes[13].vals[0].toString();
        });
    });

});


router.get('/main/data', function (req, res) {
   console.log(IsLoggedIn);
    if (IsLoggedIn) {
        res.send("Welcome: " + fullName);
    }
    else {
        res.sendStatus(404);
    }
})





// router.post('/login',function (req,res){
//     res.render('index', {
//         title: 'Express',
//     })
// })






// router.post('/login', passport.authenticate('local', {
//     successRedirect: '/main',
//     failureRedirect: '/login',
//     badRequestMessage: 'Missing Credentials. Enter Cerner Credentials',
//     //failureFlash: true
// })
// )


router.get('/logout', function (req, res) {
    req.logout();
    IsLoggedIn = false;
    res.clearCookie('blah_id');
    res.redirect('/login');
})





// /* GET home page. */
// router.get('/login', function(req, res, next) {
//     res.render('loginForm', { title: 'Express' });
//   });





module.exports = router;
