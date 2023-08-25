// Accessing the mySQL database
const db = require("./DatabaseConfig");
var CustomerDB = {};

// Endpoint to POST a new customer
CustomerDB.createCustomer = (customerDetails, callback) => {
    // Establish connection with mySQL Server
    var conn = db.getConnection();
    // Define mySQL statement
    const createCustomerQuery = "BEGIN; INSERT INTO `bed_dvd_db`.`address` (`address`, `address2`, `district`, `city_id`, `postal_code`, `phone`) VALUES (?, ?, ?, ?, ?, ?); INSERT INTO `bed_dvd_db`.`customer` (`store_id`, `first_name`, `last_name`, `email`,`address_id`, `password`, `status`) VALUES (?, UPPER(?), UPPER(?), ?, LAST_INSERT_ID(), ?, 'customer'); COMMIT;";
    // Execute the query
    // Insert the parameters required in the JSON body
    // Access the address table in mySQL
    conn.query(createCustomerQuery, [customerDetails.address.address_line1, customerDetails.address.address_line2, customerDetails.address.district, customerDetails.address.city_id, customerDetails.address.postal_code, customerDetails.address.phone, customerDetails.store_id, customerDetails.first_name, customerDetails.last_name, customerDetails.email, customerDetails.password], (err, result) => {
        conn.end();
        // Returning the result
        if (err){
            return callback (err, null);
        } else {
            // Return the id of the new customer
            return callback (null, result[2].insertId);
        }
    });
};

// Endpoint GET address of the store (for the customer POST)
CustomerDB.getStoreAddress = (callback) => {
    // Establish connection with mySQL Server
    var conn = db.getConnection();
    // Define mySQL statement
    const getStoreAddressQuery = "SELECT store_id, address FROM store JOIN address ON store.address_id = address.address_id;";
    // Execute the mySQL query
    conn.query(getStoreAddressQuery, [], (err, result) => {
        conn.end();
        // Returning the result
        if (err) {
            return callback(err, null);
        } else {
            return callback(err, result);
        }
    })
}

// Endpoint to Verify Login for Customers
CustomerDB.verifyCustLogin = (email, password, callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    var verifyCustLoginQuery = "SELECT * FROM customer WHERE email = ? AND password = ?";
    // Create a mySQL query statement
    conn.query(verifyCustLoginQuery, [email, password], (err, result) => {
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

// Additional Endpoint to POST Reviews
CustomerDB.createFilmReview = (customer_id, film_id, score, comment, callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    var createFilmReviewQuery = "INSERT INTO reviews (customer_id, film_id, score, comment, review_date) VALUES (?, ?, ?, ?, NOW());"
    // Create a mySQL query statement
    conn.query(createFilmReviewQuery, [customer_id, film_id, score, comment], (err, result) => {
        conn.end();
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, result.insertId);
        }
    });
};

// Additional Endpoint to View Reviews in the DVD page
CustomerDB.viewFilmReviews = (film_id, callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    var viewFilmReviewsQuery = "SELECT review_id, score, comment, customer.first_name, review_date FROM bed_dvd_db.reviews LEFT JOIN bed_dvd_db.customer ON reviews.customer_id = customer.customer_id WHERE film_id = ?;";
    // Create a mySQL query statement
    conn.query(viewFilmReviewsQuery, [film_id], (err, result) => {
        conn.end();
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, result);
        }
    });
};

// Additional Endpoint to Delete Reviews in Customer Page
CustomerDB.deleteReviewById = (review_id, customer_id, callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    const deleteReviewByIdQuery = "DELETE FROM reviews WHERE review_id = ? AND customer_id = ?;";
    // Execute the query
    conn.query(deleteReviewByIdQuery, [review_id, customer_id], (err, result) => {
        conn.end();
        // Returning the result
        if (err) {
            return callback (err, null);
        } else {
            return callback (null, result);
        }
    })
}

// Additional Endpoint to Get Reviews by Customers
CustomerDB.viewCustomerReviews = (customer_id, callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    var viewCustomerReviewsQuery = "SELECT reviews.review_id, reviews.film_id, reviews.score, reviews.comment, film.title FROM bed_dvd_db.reviews LEFT JOIN bed_dvd_db.film ON reviews.film_id = film.film_id WHERE reviews.customer_id = ?;";
    // Create a mySQL query statement
    conn.query(viewCustomerReviewsQuery, [customer_id], (err, result) => {
        conn.end();
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, result);
        }
    });
};

// Exporting the module to App.js
module.exports = CustomerDB;
