// Accessing the mySQL database
const db = require("./DatabaseConfig");
var ActorDB = {};

// Endpoint to POST a new actor
ActorDB.createActor = (actorDetails, callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    const createActorQuery = "INSERT INTO `bed_dvd_db`.`actor` (`first_name`, `last_name`) VALUES (UPPER(?), UPPER(?));";
    // Execute the query
    // Inserting parameters required in the JSON body
    conn.query(createActorQuery, [actorDetails.first_name, actorDetails.last_name], (err, result) => {
        conn.end();
        // Returning the result
        if (err){
            return callback (err, null);
        } else {
            return callback (null, result.insertId);
        }
    });
};

// Exporting the module to App.js
module.exports = ActorDB;

