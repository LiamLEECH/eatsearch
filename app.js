var zomatoApi = require('./zomatoapi.js');
var twitterApi = require('./twitterapi.js');

var express = require('express');
var app = express();
var https = require('https');

const hostname = '127.0.0.1';
const port = 3000;

app.use(express.static(__dirname + '/views'));

app.set('view engine', 'ejs');

app.get('/', function(appReq, appRes) {
    appRes.render('pages/index');
});

app.get('/result/:lat/:lon/:cuisine', function(appReq, appRes) {
    console.log(appReq.params);
    console.log(appReq.params.lat + " : " + appReq.params.lon);
    zomatoApi.getResturaunts(appReq.params.lat, appReq.params.lon, 3, appReq.params.cuisine, function(zomatoResults) {
        if (zomatoResults.res == 'success') {
            twitterApi.twitterAuth(function(token) {
                var ctr = 0; // Count the number of restaurants completed so that we dont render the page before its done
                zomatoResults.restaurants.forEach(function(r){
                    twitterApi.getEmbedTweets(r.restaurant.name, token, function(result) {
                        r.tweets = result;
                        ctr++;
                        console.log("Obtained all tweets for res " + ctr + " of " + zomatoResults.restaurants.length)
                        if (ctr === zomatoResults.restaurants.length) {
                            // Have all tweets and zomato results now, so render the page
                            appRes.render('pages/result', {result: zomatoResults})
                        }
                    });
                });
            });
        } else {
            appRes.render('pages/error');
        }
    });
});

app.listen(port, function () {
    console.log(`Server listening at http://${hostname}:${port}/`);
    
});