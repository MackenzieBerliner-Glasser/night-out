const Log = require('../models/Log');
const getPreferences = require('./user-preferences');
const { getLocation, getPlaces } = require('./google-map-service');


const getRandomPlace = places => {
    return places[0];
};

module.exports = (user, zipcode) => {

    return getLocation(zipcode)
        .then(location => {
            return Promise.all([Promise.resolve(location), getPreferences(user)]);
        })
        .then(([location, userPrefs]) => {
            return Promise.all(userPrefs.map(logPref => {
                return getPlaces(location, logPref);
            }));
        })
        .then(logPlaces => {
            const logsObj = logPlaces.map(getRandomPlace).map(logPlace => ({
                place_id: logPlace.placeId,
                user: user._id,
                tags: logPlace.types,
                name: logPlace.name,
                price: logPlace.price
            }));
            return Log.create(logsObj);
        });
};