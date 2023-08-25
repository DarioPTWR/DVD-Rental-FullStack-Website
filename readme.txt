Name : Dario Prawara Teh Wei Rong
Class : DAAA/FT/1B/04
File Name : readme.txt

================================================================================================================

Instructions for setting up the Back-End Web Development Assignment CA2 :

=================================================================================================================================
Setting up mySQL schema and privileges :
=================================================================================================================================

1. Using mySQL, open Local instance MySQL80.
2. Create a new schema, with the name bed_dvd_db. 
3. Create a new user by navigating to the Administration and select 'Users and Privileges' under MANAGEMENT.
4. Click 'Add Account', configuring the 'Login Name' as bed_dvd_root and 'Password' as pa$$woRD123.
5. Under bed_dvd_root, go to 'Schema Privileges' and add all privileges for the user. 
6. Import the sakila_bed.sql file into mySQL and run the script for the bed_dvd_db database.

	- To do this, click on 'File' and 'Open SQL Script'.
	- When faced with an encoding configuration page, use the default encoding provided.

7. Refresh the schema page and ensure all the tables are loaded.

- Modifications of Tables

	Creating a reviews table to store customer reviews :

	CREATE TABLE reviews (
		review_id INT AUTO_INCREMENT PRIMARY KEY,
		customer_id SMALLINT UNSIGNED NOT NULL,
		film_id SMALLINT UNSIGNED NOT NULL,
		score INT NOT NULL,
		comment TEXT NOT NULL,
		review_date DATETIME NOT NULL,
		FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
		FOREIGN KEY (film_id) REFERENCES film(film_id)
	);

	* Set review_date to CURRENT_TIMESTAMP

- In staff table, add two new columns : 'password' and 'role' by clicking the wrench icon beside the table name
and setting 'password' to VARCHAR(40) and 'role' to VARCHAR(5), with both having NULL as the default
expressions. 

- In customer table, add two new columns : 'password' and 'status' by clicking the wrench icon beside the table name
and setting 'password' to VARCHAR(40) and 'status' to VARCHAR(8), with both having NULL as the default
expressions. 

	* CLICK APPLY FOR ALL CHANGES MADE TO SAVE.

=================================================================================================================================
Setting up Files for BACKEND :
=================================================================================================================================

8. Create a new folder in Visual Studio Code. In that folder, ensure the files : config.js, Server.js are created.
9. Create Server.js file to host the server.
	
	// Importing App.js
	const App = require("./Controller/App")

	App.listen(3000,()=> {
    		console.log("Server started.");
	});

10. Create three sub-folders : Controller, Auth and Model 

11. Inside the Controller folder, ensure the following JS files are created : App.js (Endpoints are created here : E.G. app.put("/actors/:actor_id", (req, res)...)
12. Inside the Model folder, ensure the following JS files are created : ActorDB.js, CustomerDB.js, DatabaseConfig.js, FilmDB.js
13. Inside the Auth folder, ensure that the JS file isLoggedInMiddleware.js is created.

14. Initialize the file using npm init to create a new project folder.
15. Install the following packages into Visual Studio Code:

	- npm install express (To install express)
	- npm install mysql (To import mySQL)
	- npm install cors (To install cors)
	- npm install jsonwebtoken

16. Open App.js and ensure the file is set up as such :

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

17. Open DatabaseConfig.js and insert the following code to get connection from mySQL
    ** Alter the details for user, password, database based on specifications.

	const mysql = require("mysql");

	var dbconnect = {
    	   getConnection: function () {
      	var conn = mysql.createConnection({
        	host: 'localhost',
        	port: 3306,
        	user: 'bed_dvd_root',
        	password: 'pa$$woRD123', 
        	database: 'bed_dvd_db',
        	dateStrings: true,
        	multipleStatements: true
          });
          return conn;
    	   }
	};
  
module.exports = dbconnect;

18. Open ActorDB.js
    Insert the following code into the file to connect to mySQL database.
	const db = require("./DatabaseConfig");
    Create an object for ActorDB to contain functions to execute mySQL query statements.
    	var ActorDB = {};

19. Export ActorDB.js to App.js : module.exports = ActorDB;
    ** ActorDB.js has already been imported into App.js earlier in step 15.

20. Repeat steps 18 and 19 for CustomerDB.js and FilmDB.js.

=================================================================================================================================
Setting up Files for FRONTEND :
=================================================================================================================================

21. After downloading the open-source template, locate the HTML files.
22. Create a public folder for the HTML files, and locate index.html.
23. Using Server.js and index.html, access the website on your browser.




