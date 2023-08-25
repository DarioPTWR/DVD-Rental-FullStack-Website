const express = require("express");
const App = express();

// Import DB files
const ActorDB = require("../Model/ActorDB")
const FilmDB = require("../Model/FilmDB")
const CustomerDB = require("../Model/CustomerDB");
const AdminDB = require("../Model/AdminDB");

// Importing files for Authentication Purposes
const cors = require("cors");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config"); 
const isLoggedInMiddleWare = require("../Auth/isLoggedInMiddleWare");
const { application } = require("express");
const e = require("express");

// Declaring the use of JSON middleware
App.use(express.json());
App.use(express.static("../../CA2_HTML_PUBLIC"))
App.use(cors())

// Endpoints for Admin Use

// Endpoint for Logging in of Admin
App.post("/admin/login", (req,res) => {
    AdminDB.verifyLogin(req.body.email, req.body.password, (err, staff) => {
        if (err) {
            res.status(500).send({ auth: false, error_msg: "Internal Server Error" });
            return;
        } else if (staff === null) {
            res.status(401).send({"auth": false, "message":"Access Denied."});
            return;
        } else {
            if (err){
                res.status(401).send({"auth": false, "message":"Access Denied."});
                return;
            } else {
                res.status(200);
                var payload = {email: staff[0].email, role:staff[0].role};
                var jwToken = jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" }, {expiresIn:"1h"});
                res.send({ auth: true, token: jwToken, name: staff[0].first_name, role: staff[0].role});
            }      
        }
    });
});

// Endpoint for POST of a new actor
App.post("/actors", isLoggedInMiddleWare, (req,res) => {
    if (req.auth.role == 'admin') {
        ActorDB.createActor(req.body, (err, actor_id) => {
            if (err?.code == "ER_BAD_NULL_ERROR") {
                res.status(400).send({"error_msg": "missing data"});
                return;
            } else if (err) {
                res.status(500).send({"error_msg": "Internal server error"});
                return;
            } else {
                // Send 201 CREATED if successful
                res.status(200).send({"success_msg": `Actor Record ${actor_id.toString()} has been successfully created.`});
            } 
        });
    } else {
        res.status(401).send("Insufficient Privileges.")
    }
});

// Endpoint for POST a new customer
App.post("/customers", isLoggedInMiddleWare, (req,res) => {
    if (req.auth.role == 'admin') {
        // Check if JSON body has missing information
        const requiredMainFields = ["store_id", "first_name", "last_name", "email", "address", "password"];
        const requiredAddressFields = ["address_line1", "address_line2", "district", "city_id", "postal_code", "phone"];
        let missingFields = false;
        // Use try and catch to send error 400 if there are any missing fields in the JSON body
        try {
            for (field in requiredMainFields) {
                if (!Object.keys(req.body).includes(requiredMainFields[field]))
                    missingFields = true;
            }
            for (field in requiredAddressFields) {
                if (!Object.keys(req.body.address).includes(requiredAddressFields[field]))
                    missingFields = true;
            }
        } catch {
            missingFields = true;
        }
        // Send error 400 if missingFields = true
        if (missingFields == true) {
            res.status(400).send({"error_msg": "missing data"});
        // Run the else statement if all required fields are valid and found in the JSON body
        } else {
            CustomerDB.createCustomer(req.body, (err, customer_id) => {
                // Check if email in JSON body is a duplicate of an entry in mySQL table
                if (customer_id == null) {
                    res.status(409).send({"conflict_msg": "Email exists in database. Please enter another email."});
                } else if (err) {
                    res.status(500).send({"error_msg": "Internal server error"});
                } else {
                    // Send 201 CREATED if successful
                    res.status(201).send({"success_msg": `Customer Record ${customer_id.toString()} has been successfully created.`});
                }
            });
        }
    } else {
        res.status(401).send("Insufficient Privileges.")
    }
});


// Endpoint for GET Store Address (to POST a new customer)
App.get("/store/address", (req,res) => {
    CustomerDB.getStoreAddress((err, store) => {
        if (err){
            res.status(500).send({"error_msg": "Internal server error"});
        } else {
            res.status(200).send(store);
        }
    })
})

// Endpoints for Public / Customer Use

// Endpoint for Logging in of Customer
App.post("/customer/login", (req,res) => {
    CustomerDB.verifyCustLogin(req.body.email, req.body.password, (err, customer) => {
        if (err) {
            res.status(500).send({ auth: false, error_msg: "Internal Server Error" });
            return;
        } else if (customer === null) {
            res.status(401).send({"auth": false, "message":"Access Denied."});
            return;
        } else {
            if (err){
                res.status(401).send({"auth": false, "message":"Access Denied."});
                return;
            } else {
                res.status(200);
                var payload = {customer_id: customer[0]?.customer_id, email: customer[0]?.email, status:customer[0]?.status};
                var jwToken = jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" });
                res.send({ auth: true, token: jwToken, id: customer[0].customer_id, name: customer[0].first_name, status: customer[0].status});
            }      
        }
    });
});

// Endpoint for GET films by search
App.get("/dvdSearch", (req,res) => {
    // Get total number of films in the FILM table
    FilmDB.getFilmCount((err, count) => {
        if (err){
            res.status(500).send({"error_msg": "Internal server error"});
        } else {
            // Get the limit and offset
            const limit = count;
            const page = req.query.page || 1
            const offset = (page - 1) * limit;
            FilmDB.getFilmsBySearch(req.query.film_substring, req.query.film_category, req.query.film_rental, limit, offset, (err, films) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({"error_msg": "Internal server error"});
                } else if (films?.length == 0) {
                    res.status(200).send({"message": "No DVD record found."});
                } else {
                    res.status(200).send(films);
                }
            });
        }
    })
});

// Endpoint to GET all film categories
App.get("/filmCategories", (req,res) => {
    FilmDB.getFilmCategories((err, result) => {
        if (err) {
            res.status(500).send({"error_msg": "Internal server error"});
        } else {
            res.status(200).send(result);
        }
    })
})

// Endpoint to GET film information by film title
App.get("/dvd/information", (req,res) => {
    FilmDB.getFilmByTitle(req.query.film_title, (err, film) => {
        if (err) {
            res.status(500).send({"error_msg": "Internal server error"});
        } else {
            res.status(200).send(film);
        }
    });
});

// Additional Endpoint for Reviews

// Additional Endpoint to POST reviews by customers
App.post("/customer/review", isLoggedInMiddleWare, (req,res) => {
    if (req.body.comments?.length > 100) {
        res.status(401).send({"error_msg":"Please enter a review within 100 characters."})
    } else {
        CustomerDB.createFilmReview(req.auth.customer_id, req.body.film_id, req.body.score, req.body.comments, (err, review) => {
            if (req.body.score == ''|| req.body.comments == '') {
                res.status(400).send({"error_msg": "missing data"});
            } else if (err) {
                console.log(err)
                res.status(500).send({"error_msg": "Internal server error"});
            } else {
                // Send status code 201 if successful
                res.status(201).send({"success_msg": `Review record ${review.toString()} was successfully created.`});
            }
        });
    }
});

// Additional Endpoint to GET reviews based on film id
App.get("/film-review", (req,res) => {
    CustomerDB.viewFilmReviews(req.query.film_id, (err, review) => {
        if (err){
            res.status(500).send({"error_msg": "Internal server error"});
        } else if (review?.length == 0) {
            res.status(204).send();
        } else {
            res.status(200).send(review);
        }
    });
});

// Additional Endpoint to DELETE reviews based on review id
App.delete("/delete-review", isLoggedInMiddleWare, (req,res) => {
    CustomerDB.deleteReviewById(req.query.review_id, req.auth.customer_id, (err, review) => {
        if (err) {
            res.status(500).send({"error_msg":"Internal server error"})
        } else if (review?.affectedRows == 0) {
            res.status(204).send()
        } else {
            res.status(200).send({"success_msg":"review deleted"});
        }
    })
})

// Additional Endpoint to GET reviews based on customer id
App.get("/cust-review",isLoggedInMiddleWare ,(req,res) => {
    CustomerDB.viewCustomerReviews(req.auth.customer_id, (err, review) => {
        if (err){
            res.status(500).send({"error_msg": "Internal server error"});
        } else if (review?.length == 0) {
            res.status(204).send();
        } else {
            res.status(200).send(review);
        }
    });
});

// Exporting the module to Server.js 
module.exports = App;