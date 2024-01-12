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
            // Main Menu
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all Departments',
                'View all Roles',
                'View all Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee',
                // 'View Employees by Manager',
                // 'View Employees by Department',
                // 'View total utilized budget',
                // Update an Employee's Manager,
                // Delete a Department, Role, or Employee,
                'Exit'
            ]

        }
    ]);

    switch (answer.action) {
        case 'View all Departments':
            await viewAllDepartments();
            break;
        case 'View all Roles':
            await viewAllRoles();
            break;
        case 'View all Employees':
            await viewAllEmployees();
            break;
        case 'Add a Department':
            await addDepartment();
            break;
        case 'Add a Role':
            await addRole();
            break;
        case 'Add an Employee':
            await addEmployee();
            break;
        case 'Update an Employee':
            await updateEmployee();
            break;
        // case 'View Employees by Manager':
            // await viewByManager();
            // break;
        // case 'View Employees by Department':
            // await viewByDepartment();
            // break;
        // case 'View total utilized budget':
            // await viewBudget();
            // break;
        // case Update an Employee's Manager:
            // await updateManager();
            // break;
        // case Delete a Department, Role, or Employee: --- separate out???
            // await deleteDRE();
            // break;
        case 'Exit':
            connection.end();
            break;
    }
};

// Each choice's functions --------------

// Function to view all departments
const viewAllDepartments = async () => {
    const query = `SELECT * FROM department`; // MySQL query to retrieve requested data
    const [res] = await connection.query(query); // executes db query, waits for the completion, extracts the returned array result, then puts the result inside [res]
    console.table(res); // Show data in formatted table
    start(); // Main menu
};

// Function to view all roles
const viewAllRoles = async () => {
    const query = `
        SELECT role.id,
               role.title,
               role.salary,
               department.name AS department 
        FROM 
               role
               LEFT JOIN department ON role.department_id = department.id
    `;
    const [res] = await connection.query(query);
    console.table(res);
    start();
};

// Function to view all employees
const viewAllEmployees = async () => {
    const query = `{
        SELECT employee.id,
               employee.first_name,
               employee.last_name,
               role.title AS job_title,
               department.name AS department,
               role.salary,
               CONCAT(manager.first_name, '', manager.last_name) AS manager
        FROM
               employee
               LEFT JOIN role ON employee.role_id = role.id
               LEFT JOIN department ON role.department_id = department.id
               LEFT JOIN employee manager ON employee.manager_id = manager.id
    }`;
};


addDepartment()
addRole()
addEmployee()
updateEmployee()
//viewByManager()
//viewByDepartment()
//viewBudget()
//updateManager()
//deleteDRE()


