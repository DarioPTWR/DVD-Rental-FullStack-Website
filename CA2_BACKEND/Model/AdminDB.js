// Accessing the mySQL database
const db = require("./DatabaseConfig");
var AdminDB = {};

// Endpoint to Verify Login for Staff (Admins)
AdminDB.verifyLogin = (email, password, callback) => {
    // Establish connection with mySQL
    var conn = db.getConnection();
    // Define mySQL statement
    var verifyLoginQuery = "SELECT * FROM staff WHERE email = ? AND password = ?";
    // Create a mySQL query statement
    conn.query(verifyLoginQuery, [email, password], (err, result) => {
        conn.end();
        if (err) {
            return callback(err, null);
        } else if (result?.length === 0) {
            return callback(null, null);
        } else {
            return callback(null, result);
        }
    });
};


module.exports = AdminDB;