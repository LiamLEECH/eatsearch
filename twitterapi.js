var request = require('request');
// Twitter api key:
var twitterKey = "";
var twitterSecret = "";

// Used to authorize with twitter and obtain a bearer token, using the twitterKey and twitterSecret
function twitterAuth(callback) {
    var secretKey = `${twitterKey}:${twitterSecret}`;
    var b64SecretKey = Buffer.from(secretKey, 'utf8').toString('base64');
    console.log(secretKey + " - " + b64SecretKey);
    var headers = {
        'Authorization': `Basic ${b64SecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    }
    var options = {
        url: 'https://api.twitter.com/oauth2/token',
        method: 'POST',
        headers: headers,
        body: 'grant_type=client_credentials'
    }
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body).access_token);
        } else {
            console.log("error getting twitter authentication token");
        }
    })
}

// Returns 0-5 twitter posts that are hopefully relevant
// Searches using the Restaurant name
function getTweets(resName, bearerToken, callback) {
    var headers = {
        'Authorization': `Bearer ${bearerToken}`
    }
    var options = {
        url: `https://api.twitter.com/1.1/search/tweets.json?q=${resName}&src=typd`,
        method: 'GET',
        headers: headers,
    }
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var parsed = JSON.parse(body);
            var result = parsed.statuses.slice(0, 5);
            callback(result);
        } else {
            console.log("Error getting tweets :(");
        }
    });
}

// Returns 0-5 embedable twitter posts (using getTweets from above)
function getEmbedTweets(resName, bearerToken, callback) {
    getTweets(resName, bearerToken, function(tweets) {
        var tctr = 0;
        if (tweets.length === 0) {
            callback(tweets);
        }
        tweets.forEach(function(tweet) {
            var tweeturl = `https://twitter.com/e/statuses/${tweet.id_str}`;
            var options = {
                method: 'GET',
                url: `https://publish.twitter.com/oembed?url=${tweeturl}`,
            }
            request (options, function(err, res, body) {
                tweet.emb = JSON.parse(body);
                tctr++;
                console.log("Embed tweets " + tctr + " of " + tweets.length);
                if (tctr >= tweets.length) {
                    callback(tweets);
                }
            });
        });
    });
}

exports.twitterAuth = twitterAuth;
exports.getTweets = getTweets;
exports.getEmbedTweets = getEmbedTweets;