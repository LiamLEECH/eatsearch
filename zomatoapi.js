var request = require('request');
var zomatoKey = ""; // Put zomato api key here

// Randomly selects resturaunts from the provided lat lon, up to 'maxItems'
function getResturaunts (lat, lon, maxItems, cuisine, callback) {
    var headers = {
        'user-key': zomatoKey
    }
    var queryString = {
        'lat': lat,
        'lon': lon
    }
    var options = {
        url: 'https://developers.zomato.com/api/v2.1/geocode',
        method: 'GET',
        headers: headers,
        qs: queryString
    }
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            callback(processRestaurants(body, maxItems, cuisine));
        } else {
            callback("Error");
        }
    })
}

// Gets 3 resturaunts and their data from the entire json file
// Will also include a couple of other things, such as location, and cuisine type
// Will prefer restaurants that fit into preferCuisine
function processRestaurants(rJSON, maxItems, preferCuisine) {
    var parsed = JSON.parse(rJSON);

    // Check if there was an error with the selected location
    if (parsed.code == 404) {
        return { res: 'error' };
    }

    var zomatoResults = {
        location: parsed.location,
        restaurants: [],
        res: 'success'
    };
    var allRestaurants = parsed.nearby_restaurants;
    // If theres less than maxItems, just include all of them
    console.log(`There is ${allRestaurants.length} Restaurants here`);
    if (allRestaurants.length < maxItems) { 
        zomatoResults.restaurants = allRestaurants;
    } else {
        
        // Search for restaurants that fit preferCuisine
        var preferedRes = [];
        if (preferCuisine != "none") {
            for (var i = 0; i < allRestaurants.length; i++) {
                if (allRestaurants[i].restaurant.cuisines.toLowerCase().includes(preferCuisine.toLowerCase())) {
                    console.log(allRestaurants[i].restaurant.name + " prefered");
                    var tempRes = allRestaurants.splice(i, 1)[0];
                    preferedRes.push(tempRes);
                }
            }
        } else {
            console.log("Preferred cuisine is none");
        }
        console.log(preferedRes.length + " restaurants contain " + preferCuisine);
        logRes(preferedRes);
        //logRes(preferedRes);
        // If weve picked more than maxItems restaurants, pick maxItems randomly (shuffling array)
        if (preferedRes.length > maxItems) {
            console.log("Too many prefered restaurants, culling some");
            zomatoResults.restaurants = shuffleArray(preferedRes).slice(0, maxItems);
        } else if (preferedRes.length == maxItems) { // Picked the perfect amount
            console.log("Perfect number of prefered restaurants. Using all.");
            zomatoResults.restaurants = preferedRes;
        } else { // Not enough, get more
            console.log("Not enough prefered restaurants, getting some at random");
            allRestaurants = shuffleArray(allRestaurants);
            var resToGet = (maxItems - preferedRes.length);
            zomatoResults.restaurants = preferedRes;
            for (var i = 0; i < resToGet; i++) {
                zomatoResults.restaurants.push(allRestaurants.pop())
            }
        }
        console.log("Final restaurants: ");
        logRes(zomatoResults.restaurants);
    }
    // for each restaurant selected, make a google maps link to its exact location using lat and long
    zomatoResults.restaurants.forEach(function (res) {
        res.restaurant.location.gmaps = `http://maps.google.com/?q=${res.restaurant.location.latitude},${res.restaurant.location.longitude}`;
        console.log(res.restaurant.location.gmaps);
    });
    return zomatoResults;
}

// Shuffles an array and returns it
// Since array are passed by reference, probably don't need the return, but makes it cleaner i guess.
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// Console.logs the name and cuisines of given restaurants
function logRes(restaurants) {
    restaurants.forEach( function (r) {
        console.log(r.restaurant.name + " " + r.restaurant.cuisines);
    });
}

// Exports
exports.getResturaunts = getResturaunts;
