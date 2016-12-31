var Flint = require('node-flint');
var webhook = require('node-flint/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

var util = require('util');
var request = require('request');

require('should');

var app_url = process.env.APP_URL + "/flint";
console.log("app_url: " + app_url);
console.log("process.env.TOKEN_SPARK_BOT: " + process.env.TOKEN_SPARK_BOT);
var token_spark = process.env.TOKEN_SPARK_BOT;

// flint options
var config = {
    webhookUrl: app_url,
    token: process.env.TOKEN_SPARK_BOT,
    port: 8080,
    removeWebhooksOnStart: false,
    maxConcurrent: 5,
    minTime: 50
};

// init flint
var flint = new Flint(config);
flint.start();

// say hello
flint.hears('/hello', function(bot, trigger) {
    bot.say('Hello %s!', trigger.personDisplayName);
});

// add flint event listeners
flint.on('message', function(bot, trigger, id) {
    flint.debug('"%s" said "%s" in room "%s"', trigger.personEmail, trigger.text, trigger.roomTitle);
});

flint.on('initialized', function() {
    flint.debug('initialized %s rooms', flint.bots.length);
});

// define express path for incoming webhooks
app.post('/flint', webhook(flint));

// start express server
var server = app.listen(config.port, function () {
    flint.debug('Flint listening on port %s', config.port);
});


// gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
    flint.debug('stoppping...');
    server.close();
    flint.stop().then(function() {
        process.exit();
    });
});


// echo test
flint.hears('/echo', function(bot, trigger) {
    console.log("echo command");
    console.log("echo " + trigger.args.join(' '));
    bot.say(trigger.args.join(' '));
});


flint.hears('/getroomid', function(bot, trigger) {
    console.log("/getroomid");
    bot.say(trigger.roomId);
});


// get xray
flint.hears('/getxray', function(bot, trigger) {
    var url = 'http://www.precisioncarenj.com/wp-content/uploads/2010/09/Lateral1.jpg';
    bot.say({file: url});
//    bot.say({text: "Here is your xray", file: url});
});
flint.hears('getxray', function(bot, trigger) {
    var url = 'http://www.precisioncarenj.com/wp-content/uploads/2010/09/Lateral1.jpg';
    bot.say({file: url});

});


// get mri
flint.hears('/getmri', function(bot, trigger) {
    var url = 'http://svdrads.com/images/home/grid/MRI-head-zoom-38266824-3.jpg';
    bot.say({file: url});
});
flint.hears('getmri', function(bot, trigger) {
    var url = 'http://svdrads.com/images/home/grid/MRI-head-zoom-38266824-3.jpg';
    bot.say({file: url});
});


// get patient record
flint.hears('/gethistory', function(bot, trigger) {
    var url = 'https://www.med.unc.edu/medclerk/files/UMNwriteup.pdf';
    bot.say({file: url});
});


// get patient record
flint.hears('/getlastvisit', function(bot, trigger) {
    var url = 'https://www.litholink.com/downloads/CKD%20Patient1%20Example%20with%20Patient%20Handout.pdf';
    bot.say({file: url});
});


// get map
flint.hears('/map', function(bot, trigger) {
    bot.say('https://www.google.com/maps/place/12900+Park+Plaza+Dr,+Cerritos,+CA+90703/@33.8673616,-118.0592793,17z/data=!3m1!4b1!4m2!3m1!1s0x80dd2c57cbc9e363:0x25a07604cf1df1bb');
});


// get EMR record
flint.hears('/nextgen', function(bot, trigger) {
    bot.say('https://nextgen.com/Events/1344?c=nextgen');
    bot.say('https://www.google.com/?gws_rd=ssl#q=Patient:' + trigger.roomTitle);
});
flint.hears('/getnextgen', function(bot, trigger) {
    bot.say('https://nextgen.com/Events/1344?c=nextgen');
    bot.say('https://www.google.com/?gws_rd=ssl#q=Patient:' + trigger.roomTitle);
});


flint.hears('/emr', function(bot, trigger) {
    bot.say('https://www.google.com/?gws_rd=ssl#q=Patient:' + trigger.roomTitle);
});
flint.hears('/getemr', function(bot, trigger) {
    bot.say('https://www.google.com/?gws_rd=ssl#q=Patient:' + trigger.roomTitle);
});


flint.hears('/epic', function(bot, trigger) {
    bot.say('http://www.epic.com/Epic/Post/1146');
    bot.say('https://www.google.com/?gws_rd=ssl#q=Patient:' + trigger.roomTitle);
});
flint.hears('/getepic', function(bot, trigger) {
    bot.say('http://www.epic.com/Epic/Post/1146');
    bot.say('https://www.google.com/?gws_rd=ssl#q=Patient:' + trigger.roomTitle);
});


// get SIP URI
flint.hears('/geturi', function(bot, trigger) {
    console.log("this is the /geturi command");
    getRoomDetails(trigger.roomId, token_spark, function (error, roomObj) {
        console.log("roomObj: ");
        console.log(roomObj);
        var room = JSON.parse(roomObj);
        console.log("room: " + room);
        bot.say(room.sipAddress);
    });
});


flint.hears('/getroomdetails', function(bot, trigger) {
    getRoomDetails(trigger.roomId, token_spark, function(error, roomObj) {
        console.log("roomObj: ");
        console.log(roomObj);
        bot.say(roomObj);
    });
});


flint.hears('/flinthelp', function(bot, trigger, id) {
    bot.say(flint.showHelp());
});


// add a person or people to room by email
flint.hears('/add', function(bot, trigger) {
    var email = trigger.args;
    console.log("email: " + email);
    if(email) bot.add(email);
});


// remove a person or people from room by email
flint.hears('/remove', function(bot, trigger) {
    var email = trigger.args;
    console.log("email: " + email);
    if(email) bot.remove(email);
});


// implode room - remove everyone and then remove self
flint.hears('/release', function(bot, trigger) {
//    bot.implode();
    bot.implode(function(err) {
        if(err) {
            console.log('error imploding room');
        }
    });
});


// say bot properties
flint.hears('/whoami', function(bot, trigger) {
    bot.say('Hi ' + trigger.personDisplayName + '.  Hope you are well. I am ' + flint.person.displayName + ' in room ' + trigger.roomTitle + '.  My email is ' + flint.email + '. It is a pleasure to meet you.');
});


flint.hears('/cleanup', function(bot, trigger) {
    // get message list
    request({
            url: "https://api.ciscospark.com/v1/messages",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token_spark,
                "Content-Type": "application/json"
            },
            qs: {
                roomId: trigger.roomId,
                max: 500,
            }
        },  //request parameters - add bot to room
        function (error, response, body) {
            if (error) {
                console.log("error: " + error);
            } else {
                console.log("body: " + body);
                // convert json to array
                var messageList = JSON.parse(body);
                var numMessages = messageList.items.length;
                console.log("Number of messages in room: " + numMessages);
//                console.log('typeof messageList.items[0].files: ' + typeof messageList.items[0].files);

                //parse array of messages
                for(var i = 0; i < numMessages; i++) {
                    // delete any message where files is not null and email is bot email
                    if ((typeof messageList.items[i].files != "undefined") && (messageList.items[i].personEmail == flint.email)) {
                        console.log("Delete message[" + i + "]: " + messageList.items[i].id);
                        console.log("   from " + messageList.items[i].personEmail + " at " + messageList.items[i].created);
                        request({
                                url: "https://api.ciscospark.com/v1/messages/" + messageList.items[i].id,
                                method: "DELETE",
                                headers: {
                                    "Authorization": "Bearer " + token_spark,
                                    "Content-Type": "application/json"
                                },  //headers
                            },  //request parameters - delete message
                            function (error, response, body) {
                                if(error) {
                                    console.log("delete error: " + error);
                                } else {
                                    console.log("delete body: " + body);
                                }
                            } //function - request delete message
                        ); //request - delete message
                    } // if if ((typeof messageList.items[i].files != "undefined") && (messageList.items[i].personEmail == flint.email))
                } //for(var i=0; i<messageList.items.length; i++)
                bot.say("Cleanup is complete.");
            }
        }
    );
});


// documenting the bot - general
flint.hears('/help', function(bot, trigger) {
    bot.say('I am the demo bot.  I am a living bot that will grow to satisfy many use cases.  If you have an idea and wonder what I can, ask.  Here are my commands:');
    bot.say('  - /help - you should have this one figured out already');
    bot.say('  - /helphealth - show the command set for healthcare demos');
    bot.say('  - /helpmanufacturing - coming soon');
    bot.say('  - /helppharma - coming soon');
    bot.say('  - /helpinsurance - coming soon');
    bot.say('  - /echo <text> - repeat the <text> portion');
    bot.say('  - /add <email> - add the user with <email> to this room');
    bot.say('  - /remove <email> - remove the user with <email> from this room (if permissions allow)');
    bot.say('  - /release - remove all users from the room, including the bot, and implode the room');
    bot.say('  - /cleanup - remove any content added to the room by the bot itself');
    bot.say("  - /getroomid - return the Spark room ID");
    bot.say("  - /geturi - return the Spark room SIP URI for this room");
    bot.say("  - /getroomdetails - return the Spark room details of a hard coded room ID");
    bot.say('  - /whoami - I will give my name, rank, and serial number -- err name, room name, and bot email');
});


// documenting the bot - healthcare
flint.hears('/helphealth', function(bot, trigger) {
    bot.say('I can be a healthcare bot.  Here are my healthcare commands:');
//    bot.say('  - /911 - create a new Spark room, add emergency response folks, and start a meeting in that room');
//    bot.say('  - /9111 - add emergency response folks to this room ');
//    bot.say('  - /911txt - add emergency response folks to this room and send SMS notification message');
//    bot.say('  - /911tro - blast dial all emergency response folks, add to Tropo conference, and send SMS to join message');
    bot.say('  - /gethistory - push a PDF of patient history into the discussion');
    bot.say('  - /getlastvisit - push a PDF of patient last visit details into the discussion');
    bot.say('  - /getmri - push patient MRI into discussion');
    bot.say('  - /getxray - push patient X-ray into discussion');
    bot.say('  - /emr - present a generic EMR URL to the patient ');
    bot.say('  - /epic - present the Epic EMR URL to the patient');
    bot.say('  - /nextgen - present the NextGen EMR URL to the patient ');
    bot.say('  - /map - map the address of the patient');
    bot.say('  - /release - release room, removing all participants and then deconstructing room');
    bot.say('  - /cleanup - remove any content added to the room by the bot itself');

});

/*
// load a contact list as a file uploaded to Spark
flint.hears('/loadlist', function(bot, trigger) {
    var fileArray = trigger.messages.files.id;
    console.log("fileArray.length: " + fileArray.length);
    console.log("fileArray: " + fileArray);

    // check if there is a file list
    if (fileArray.length = 0) {
        bot.say("Please upload a file in the same message as this command (if multiple files are uploaded in the same message, additional files will be ignored).  The name of the file does not matter.  The file is a comma separated list of values with the following format:");
        bot.say("   <spark_email_address>");
    } else {
        console.log("fileArray[0].id: " + fileArray[0].id);
        request({
                url: "https://api.ciscospark.com/v1/contents/" + fileArray[0].id,
                method: "GET",
                headers: {
                    "Authorization": "BEARER " + token_spark,
                    "Content-Type": "text/plain"
//                "Content-Type": "application/json"
                } //headers
            }, //request
            function (error, response, body) {
                console.log("body: " + body);
                bot.say(body);
            } //function
        ); //request
    } //else

}); //flint.hears
*/

/*
flint.hears('/addcompliance', function(bot, trigger) {
    // get regex as string

    // convert string to regex

    // store regex

});

// all messages that do not match a command
//  #perform compliance check#
// (change * below to #)
flint.hears(/.$/, function(bot, trigger) {
    // retrieve regex

    // comapare regex for all parts of message
    var compliant = true;
    for (var i=0; i < trigger.args.length; i++) {
        check = trigger.args[i].match(myregex);
        if check.length > 0 {
            trigger.args[i] = "XXXXXXXXXXX";
            compliant = false;
        }
    }

    // delete/mask if match
    if compliant == false {
        bot.say('You can't say that!);
        request({
                url: "https://api.ciscospark.com/v1/messages/" + messageList.items[i].id,
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token_spark,
                    "Content-Type": "application/json"
                },  //headers
            },  //request parameters - delete message
            function (error, response, body) {
                if(error) {
                    console.log("delete error: " + error);
                } else {
                    console.log("delete body: " + body);
                }
            } //function - request delete message
        ); //request - delete message
        bot.say(trigger.personDisplayName + ": " + trigger.args);
    }
});
*/



flint.hears('/compliancetest', function(bot, trigger) {
    // get regex as string
    // generic 16 digit numberic code: [0-9]{13}
    console.log("/compliance");
    bot.say("test starting");
    var str1 = "[0-9]{16}";
    console.log("str1: " + str1);

    // convert string to regex
    var myregex = new RegExp(str1);
    console.log("myregex : " + myregex);

    // compare regex
    var str2 = "1234567890123456";
    var res = str2.match(myregex);
    console.log("str2: " + str2);
    console.log("res: " + res);

    var str3 = "123456789012345";
    res = str3.match(myregex);
    console.log("str3: " + str3);
    console.log("res: " + res);

    var str4 = "123456789o123456";
    res = str4.match(myregex);
    console.log("str4: " + str4);
    console.log("res: " + res);

    bot.say("test done");

    // delete/mask if match

});

function getRoomDetails(roomId, tokenSpark, callback) {
    console.log("getRoomDetails(" + roomId + ", " + tokenSpark + ")");
    console.log("Received room id: " + roomId);
    var apiUrl = "https://api.ciscospark.com/v1/rooms/" + roomId;
    console.log("apiUrl: " + apiUrl);
    request({
            url: apiUrl,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + tokenSpark,
                "Content-Type": "application/json"
            }, //headers
            qs: {
                showSipAddress: "true"
            } //qs
        }, //request
        function (error, response, body) {
            if(error) {
                console.log("Room detail retrieval error: " +  error);
            } else {
                console.log("body: ");
                console.log(body);
//                return body;
            } //else
            callback(error, body);
        } //function
    ); //request
}; //function getRoomDetails