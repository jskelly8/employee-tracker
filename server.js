const inquirer = require('inquirer');
const mysql = require('mysql2');

// MySQL Connection
const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '', // Fill yours in here
        database: 'company_db'
    }
);

// Database Connection
connection.connect((err) => {
    if (err) throw err;
    console.log(`Connected to the comapny_db database.`);
    start(); 
});

// Function to start the app, called in database connection
const start = async () => {
    // Inquirer prompts
    const answer = await inquirer.prompt([
        {
            // Main Menu -- choices
            type: 'list',

        }
    ]);

    switch (answer.action) {
        // case -> choice
            // await func();
            // break;
    }
};

// each choice's function

