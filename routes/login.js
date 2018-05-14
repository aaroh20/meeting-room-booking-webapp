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
var entry1;
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
                    //console.log(superUserId);
                    for (var i = 0; i < superUserId.length; i++) {
                        //console.log(superUserId[i].super_user_id);
                        if (username === (superUserId[i].super_user_id + "@cerner.net")) {
                            console.log(superUserId);
                            return res.redirect('/admin');

                        }
                        else {

                            console.log(associateId);
                            return res.redirect('/associateForm');

                        }
                    }
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
                    //console.log(superUserId);
                    for (var i = 0; i < superUserId.length; i++) {
                        //console.log(superUserId[i].super_user_id);
                        if (username === (superUserId[i].super_user_id + "@cerner.net")) {
                            console.log(superUserId);
                            return res.redirect('/admin');

                        }
                        else {

                            console.log(associateId);
                            return res.redirect('/associateForm');

                        }
                    }

                }
            })
        }
    }
    verifyCreds(req.body.username, req.body.password);
    global.logInUser = req.body.username;

    var opts = {
        filter: String.format('&(objectClass=*)(userPrincipalName={0})(l=Bangalore)', logInUser + "@cerner.net"),
        //filter: '(objectClass=*)',
        scope: 'sub',
    };
    client.search(searchBase, opts, function (err, res) {
        res.on('searchEntry', function (entry) {
            console.log(entry.attributes[13].vals[0].toString() + '1');
            global.fullName = entry.attributes[13].vals[0].toString();
            entry1 = entry;
            console.log(fullName + '2');
        });

    });
})

router.get('/admin', function (req, res) {
    res.send("Hello Admin");
})


router.get('/associateForm', function (req, res) {
    res.render('page', {
        isAuthenticated: req.IsLoggedIn,
        //value: entry1.attributes[13].vals[0].toString()
        value: logInUser
    });
});


router.get('/main/data', function (req, res) {

    if (IsLoggedIn) {
        res.send("Welcome: " + fullName);
    }
    else {
        res.sendStatus(404);
    }
})


router.get('/logout', function (req, res) {
    req.logout();
    IsLoggedIn = false;
    res.clearCookie('blah_id');
    res.redirect('/login');
})

/* MySql Config*/
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "password",
    database: "training_room",
    insecureAuth: true
});

global.superUserId;
global.associateId;

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

    con.query("SELECT super_user_id FROM super_user", function (err, result1, fields) {
        if (err) throw err;
        superUserId = result1;
        //console.log(result1);
    });
    con.query("SELECT Associate_id FROM associate", function (err, result2, fields) {
        if (err) throw err;
        associateId = result2;
        //console.log(result2);
    });
});





module.exports = router;
