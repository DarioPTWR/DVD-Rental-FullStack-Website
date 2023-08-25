// Accessing the mySQL database
const e = require("express");
const db = require("./DatabaseConfig");
var FilmDB = {};

// Endpoint GET : Retrieve Films By Title, Category, Rental Rate
FilmDB.getFilmsBySearch = (film_substring, film_category, film_rental, limit, offset, callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    var getFilmsBySearchQuery = `SELECT film.film_id, film.title,film.release_year,film.rating FROM bed_dvd_db.film 
    JOIN film_category ON film.film_id = film_category.film_id
    JOIN category ON film_category.category_id = category.category_id `;

    // Define an array for the search inputs
    var searchField = [];
    // Conditional if-else check statements
    if (film_substring) {
        getFilmsBySearchQuery += `AND film.title LIKE CONCAT('%', ?, '%') `;
        searchField.push(film_substring);
    }

    if (film_category) {
        getFilmsBySearchQuery += `AND category.name = ? `;
        searchField.push(film_category);
    }

    if (film_rental) {
        getFilmsBySearchQuery += `AND film.rental_rate <= ? `;
        searchField.push(film_rental);
    }
    getFilmsBySearchQuery += `ORDER BY film.title ASC LIMIT ? OFFSET ?;`;
    searchField.push(limit, offset);

    // Execute the mySQL query
    conn.query(getFilmsBySearchQuery, searchField, (err, result) => {
        conn.end();
        // Returning the result
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, result);
        }
    });
};

// GET total number of films in the database FILM table
FilmDB.getFilmCount = (callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    const getFilmCountQuery = "SELECT COUNT(*) as count FROM film;";
    // Execute the mySQL query
    conn.query(getFilmCountQuery, [], (err, result) => {
        conn.end();
        // Returning the result
        if (err) {
            return callback(err, null)
        } else {
            return callback(null, result[0].count);
        }
    });
};

// Endpoint GET all Categories
FilmDB.getFilmCategories = (callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    const getFilmCategoriesQuery = "SELECT name AS category FROM category";
    // Execute the mySQL query
    conn.query(getFilmCategoriesQuery, [], (err, result) => {
        conn.end();
        // Returning the result
        if (err) {
            return callback(err, null)
        } else {
            return callback(null, result)
        }
    })
}

// Endpoint GET : Retrieve all information of the film selected by title
FilmDB.getFilmByTitle = (film_title, callback) => {
    // Establish connection with mySQL server
    var conn = db.getConnection();
    // Define mySQL statement
    const getFilmByTitleQuery = `
    SELECT film.film_id, film.title, category.name as 'category', film.release_year, film.description, film.rating, 
    group_concat(actor.first_name, ' ', actor.last_name SEPARATOR ', ') as 'actor'
    FROM film
    LEFT JOIN film_category ON film.film_id = film_category.film_id
    LEFT JOIN category ON film_category.category_id = category.category_id
    LEFT JOIN film_actor ON film.film_id = film_actor.film_id
    LEFT JOIN actor ON film_actor.actor_id = actor.actor_id
    WHERE film.title = ?
    GROUP BY film.film_id;
    `
    // Execute the mySQL query
    conn.query(getFilmByTitleQuery, [film_title], (err, result) => {
        conn.end();
        // Returning the result
        if (err) {
            return callback(err, null)
        } else {
            return callback(null, result)
        }
    });
};

// Exporting the module to App.js
module.exports = FilmDB;
