var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

console.log('Inside On click');
var mysql = require('mysql');

/* GET home page. */
router.get('/table', function(req, res, next) {
    const nodemailer = require('nodemailer');

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing

    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtprr.cerner.com',
            port: 25,
            secure: false,
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Aaroh" <aaroh.mathur@cerner.com>', // sender address
            to: 'aishwarya.a@cerner.com', // list of receivers
            subject: 'email confirmation', // Subject line
            text: 'Your training room is booked', // plain text body
            html: '<b>Cerner Training Rooms</b>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });
    console.log("about to render");
    console.log(rooms);
    var table = req.body.room_table;
    var mydata = rooms;

    res.render('table1', {data: mydata});
  });


  var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "A1595",
    database: "trainingroom",
    insecureAuth: true
  });

global.rooms;

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    con.query("SELECT * FROM room", function (err, result1, fields) {
      if (err) throw err;
      rooms = result1;
      //console.log(result1);
  });

  });

module.exports = router;