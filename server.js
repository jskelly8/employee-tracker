const inquirer = require('inquirer');
const mysql = require('mysql2');

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Fill yours in here
    database: 'company_db',
});

// Database Connection
connection.connect(function (err) {
    if (err) throw err;
    console.log(`Connected to the comapny_db database.`);
    start();
});

// Function to start the app, called in database connection
function start() {
    // Inquirer prompts
    inquirer
        .prompt([
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
                    'View Employees by Manager',
                    'View Employees by Department',
                    'View total utilized budget',
                    'Update Manager of Employee',
                    'Delete a Department',
                    'Delete a Role',
                    'Delete an Employee',
                    'Exit',
                ],
            },
        ])
        .then(function (answer) {
            switch (answer.action) {
                case 'View all Departments':
                    viewAllDepartments();
                    break;
                case 'View all Roles':
                    viewAllRoles();
                    break;
                case 'View all Employees':
                    viewAllEmployees();
                    break;
                case 'Add a Department':
                    addDepartment();
                    break;
                case 'Add a Role':
                    addRole();
                    break;
                case 'Add an Employee':
                    addEmployee();
                    break;
                case 'Update an Employee':
                    updateEmployee();
                    break;
                case 'View Employees by Manager':
                    viewByManager();
                    break;
                case 'View Employees by Department':
                    viewByDepartment();
                    break;
                case 'View total utilized budget':
                    viewBudget();
                    break;
                case 'Update Manager of an Employee':
                    updateManager();
                    break;
                case 'Delete a Department':
                    deleteDepartment();
                    break;
                case 'Delete a Role':
                    deleteRole();
                    break;
                case 'Delete an Employee':
                    deleteEmployee();
                    break;
                case 'Exit':
                    connection.end();
                    break;
            }
        });
};

// Each choice's functions --------------

// Function to view all departments
function viewAllDepartments() {
    try {
        const query = `SELECT * FROM department`; // MySQL query to retrieve requested data
        connection.query(query, function (err, res) {
            if (err) throw err;
            console.table(res); // Show data in formatted table
            start(); // Main menu
        });
    } catch (error) {
        // Throw an error if there's an issue with the database query or user input
        throw error;
    };
};

// Function to view all roles
function viewAllRoles() {
    try {
        const query = `
            SELECT role.id,
                role.title,
                role.salary,
                department.name AS department 
            FROM 
                role
                LEFT JOIN department ON role.department_id = department.id
        `;
        connection.query(query, function (err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });
    } catch (error) {
        throw error;
    };
};

// Function to view all employees
function viewAllEmployees() {
    try {
        const query = `
            SELECT employee.id,
                employee.first_name,
                employee.last_name,
                role.title AS job_title,
                department.name AS department,
                role.salary,
                CONCAT(manager.first_name, ' ', manager.last_name) AS manager
            FROM
                employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee manager ON employee.manager_id = manager.id
        `;
        connection.query(query, function (err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });
    } catch (error) {
        throw error;
    };
};

// Function to add a department
function addDepartment() {
    try {
        // Prompt to have user input name of new department
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Enter the name of the new department: ',
                },
            ])
            .then(function (answer) {
                // Put the new department into the database
                const query = `INSERT INTO department SET ?`;
                connection.query(query, { name: answer.name }, function (err) {
                    if (err) throw err;
                    console.log('Department successfully added.');
                    start();
                });
            });
    } catch (error) {
        throw error;
    };
};

// Function to add a role
function addRole() {
    try {
        // Pull the list of departments for the user to choose in the coming prompts
        connection.query(`SELECT id, name FROM department`, function (err, departments) {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: 'Enter the title of the new role: ',
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'Enter the salary for the new role: ',
                    },
                    {
                        type: 'list',
                        name: 'department_id',
                        message: 'Select the department of the new role: ',
                        choices: departments.map((department) => ({
                            name: department.name,
                            value: department.id,
                        })),
                    },
                ])
                .then(function (answer) {
                    const query = `INSERT INTO role SET ?`;
                    connection.query(
                        query,
                        { title: answer.title, salary: answer.salary, department_id: answer.department_id },
                        function (err) {
                            if (err) throw err;
                            console.log('Role successfully added.');
                            start();
                        }
                    );
                });
        });
    } catch (error) {
        throw error;
    };
};

// Function to add a new employee
function addEmployee() {
    try {
        connection.query(`SELECT id, title FROM role`, function (err, roles) {
            if (err) throw err;
            connection.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS full_name FROM employee`, function (err, employees) {
                if (err) throw err;

                inquirer
                    .prompt([
                        {
                            type: 'input',
                            name: 'first_name',
                            message: 'Enter the first name of the new employee: ',
                        },
                        {
                            type: 'input',
                            name: 'last_name',
                            message: 'Enter the last name of the new employee: ',
                        },
                        {
                            type: 'list',
                            name: 'role_id',
                            message: 'Select the role for the new employee: ',
                            choices: roles.map((role) => ({ name: role.title, value: role.id })),
                        },
                        {
                            type: 'list',
                            name: 'manager_id',
                            message: 'Select the manager for the new employee: ',
                            choices: [...employees.map((employee) => ({ name: employee.full_name, value: employee.id }))],
                        },
                    ])
                    .then(function (answer) {
                        const query = `INSERT INTO employee SET ?`;
                        connection.query(
                            query,
                            {
                                first_name: answer.first_name,
                                last_name: answer.last_name,
                                role_id: answer.role_id,
                                manager_id: answer.manager_id,
                            },
                            function (err) {
                                if (err) throw err;
                                console.log('Employee successfully added.');
                                start();
                            }
                        );
                    });
            });
        });
    } catch (error) {
        throw error;
    };
};

// Function to update an employee
function updateEmployee() {
    try {
        connection.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS full_name FROM employee`, function (err, employees) {
            if (err) throw err;
            connection.query(`SELECT id, title FROM role`, function (err, roles) {
                if (err) throw err;

                inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'employee_id',
                            message: 'Select which employee you wish to update the role of: ',
                            choices: [...employees.map((employee) => ({ name: employee.full_name, value: employee.id }))],
                        },
                        {
                            type: 'list',
                            name: 'role_id',
                            message: 'Select the new role for the employee: ',
                            choices: roles.map((role) => ({ name: role.title, value: role.id })),
                        },
                    ])
                    .then(function (answer) {
                        const query = `UPDATE employee SET role_id = ? WHERE id = ?`;
                        connection.query(query, [answer.role_id, answer.employee_id], function (err) {
                            if (err) throw err;
                            console.log('Employee successfully updated.');
                            start();
                        });
                    });
            });
        });
    } catch (error) {
        throw error;
    };
};

// Function to view employees grouped by manager
function viewByManager() {
    try {
        connection.query('SELECT DISTINCT manager_id, CONCAT(first_name, " ", last_name) AS manager_name FROM employee WHERE manager_id IS NOT NULL AND role_id BETWEEN 1 AND 7', function (err, managers) {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: 'Select the manager to view the employees they oversee: ',
                        choices: managers.map((manager) => ({ name: manager.manager_name, value: manager.manager_id })),
                    },
                ])
                .then(function (answer) {
                    const query = `
                        SELECT 
                            employee.id,
                            employee.first_name,
                            employee.last_name,
                            role.title AS job_title,
                            department.name AS department,
                            role.salary,
                            CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
                        FROM
                            employee
                            LEFT JOIN role ON employee.role_id = role.id
                            LEFT JOIN department ON role.department_id = department.id
                            LEFT JOIN employee AS manager ON employee.manager_id = manager.id
                        WHERE
                        employee.manager_id = ?
                    `;

                    connection.query(query, [answer.manager_id], function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        start();
                    });
                });
        });
    } catch (error) {
        throw error;
    }
}

// Function to view employees by Department
function viewByDepartment() {
    try {
        // Fetch departments from the database
        connection.query('SELECT id, name FROM department', function (err, departments) {
            if (err) throw err;

            // Prompt user to choose a department
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'department_id',
                        message: 'Select the department you wish to see the employees of: ',
                        choices: departments.map((department) => ({ name: department.name, value: department.id })),
                    },
                ])
                .then(function (answer) {
                    // SQL query to retrieve employees of the selected department
                    const query = `
                        SELECT 
                            employee.id,
                            employee.first_name,
                            employee.last_name,
                            role.title AS job_title,
                            department.name AS department,
                            role.salary
                        FROM
                            employee
                            LEFT JOIN role ON employee.role_id = role.id
                            LEFT JOIN department on role.department_id = department.id
                        WHERE
                            role.department_id = ?
                    `;

                    // Execute the query with the selected department_id
                    connection.query(query, [answer.department_id], function (err, res) {
                        if (err) throw err;

                        // Display the result in a table format
                        console.table(res);

                        // Call the start function (assuming it's defined somewhere)
                        start();
                    });
                });
        });
    } catch (error) {
        throw error;
    }
};

// Function to view the total utilized budget
function viewBudget() {
    try {
        connection.query('SELECT id, name FROM department', function (err, departments) {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'department_id',
                        message: 'Select the department to view the total utilized budget: ',
                        choices: departments.map((department) => ({ name: department.name, value: department.id })),
                    },
                ])
                .then(function (answer) {
                    const query = `
                        SELECT 
                            department.name AS department,
                            SUM(role.salary) AS total_budget
                        FROM
                            role
                            LEFT JOIN employee ON role.id = employee.role_id
                            LEFT JOIN department ON role.department_id = department.id
                        WHERE
                            role.department_id = ?
                    `;

                    connection.query(query, [answer.department_id], function (err, res) {
                        if (err) throw err;

                        const totalBudget = parseFloat(res[0].total_budget);

                        if (!isNaN(totalBudget)) {
                            console.log(`Total Budget for ${res[0].department}: $${totalBudget.toFixed(2)}`);
                        } else {
                            console.log(`No budget information available for ${res[0].department}.`);
                        }

                        start();
                    });
                });
        });
    } catch (error) {
        console.error(error.message);
        start();
    };
};

//Function to update the manager of an employee
function updateManager() {
    try {
        connection.query('SELECT id, first_name, last_name FROM employee', function (err, employees) {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'employee_id',
                        message: 'Select the employee you wish to update the manager of: ',
                        choices: employees.map((employee) => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id })),
                    },
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: 'Select the new manager for the chosen employee: ',
                        choices: employees.map((employee) => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id })),
                    },
                ])
                .then(function (answer) {
                    const query = 'UPDATE employee SET manager_id = ? WHERE id = ?';

                    connection.query(query, [answer.manager_id, answer.employee_id], function (err) {
                        if (err) throw err;
                        console.log('Manager of employee successfully updated.');
                        start();
                    });
                });
        });
    } catch (error) {
        throw error;
    };
};

// Function to delete a Department
function deleteDepartment() {
    connection.query('SELECT id, name FROM department', async (err, departments) => {
        if (err) throw err;

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the Department you wish to delete: ',
                choices: departments.map(department => ({ name: department.name, value: department.id }))
            }
        ]);

        const query = 'DELETE FROM department WHERE id = ?';
        connection.query(query, [answer.department_id], (err) => {
            if (err) throw err;
            console.log('Department successfully deleted.');
            start();
        });
    });
};

// Function to delete a Role
function deleteRole() {
    connection.query('SELECT id, title FROM role', async (err, roles) => {
        if (err) throw err;

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the role you wish to delete: ',
                choices: roles.map(role => ({ name: role.title, value: role.id }))
            }
        ]);

        const query = 'DELETE FROM role WHERE id = ?';
        connection.query(query, [answer.role_id], (err) => {
            if (err) throw err;
            console.log('Role successfully deleted.');
            start();
        });
    });
};

// Function to delete an Employee
function deleteEmployee() {
    connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee', async (err, employees) => {
        if (err) throw err;

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select the employee you wish to delete: ',
                choices: employees.map(employee => ({ name: employee.full_name, value: employee.id }))
            }
        ]);

        const query = 'DELETE FROM employee WHERE id = ?';
        connection.query(query, [answer.employee_id], (err) => {
            if (err) throw err;
            console.log('Employee successfully deleted.');
            start();
        });
    });
};