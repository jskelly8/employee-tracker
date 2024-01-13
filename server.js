const inquirer = require('inquirer');
const mysql = require('mysql2');

// MySQL Connection
const connection = mysql.createConnection(
    {
    host: 'localhost',
    user: 'root',
    password: '', // Fill yours in here
    database: 'company_db'
    },
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
                'View Employees by Manager',
                'View Employees by Department',
                'View total utilized budget',
                'Update Manager of Employee',
                'Delete a Department',
                'Delete a Role',
                'Delete an Employee',
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
        case 'View Employees by Manager':
            await viewByManager();
            break;
        case 'View Employees by Department':
            await viewByDepartment();
            break;
        case 'View total utilized budget':
            await viewBudget();
            break;
        case 'Update Manager of an Employee':
            await updateManager();
            break;
        case 'Delete a Department':
            await deleteDepartment();
            break;
        case 'Delete a Role':
            await deleteRole();
            break;
        case 'Delete an Employee':
            await deleteEmployee();
            break;
        case 'Exit':
            connection.end();
            break;
    }
};

// Each choice's functions --------------

// Function to view all departments
const viewAllDepartments = async () => {
    try {
        const query = `SELECT * FROM department`; // MySQL query to retrieve requested data
        const [res] = await connection.query(query); // executes db query, waits for the completion, extracts the returned array result, then puts the result inside [res]
        console.table(res); // Show data in formatted table
        start(); // Main menu
    } catch (error) {
        // Throw an error if there's an issue with the database query or user input
        throw error;
    }
};

// Function to view all roles
const viewAllRoles = async () => {
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
        const [res] = await connection.query(query);
        console.table(res);
        start();
    } catch (error) {
        throw error;
    }
};

// Function to view all employees
const viewAllEmployees = async () => {
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
        const [res] = await connection.query(query);
        console.table(res);
        start();
    } catch (error) {
        throw error;
    }
};

// Function to add a department
const addDepartment = async () => {
    try {
        // Prompt to have user input name of new department
        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the name of the new department: '
            }
        ]);

        // Put the new department into the database
        const query = `INSERT INTO department SET ?`;
        await connection.query(query, { name: answer.name });
        console.log('Department successfully added.');
        start();
    } catch (error) {
        throw error;
    }
};

// Function to add a role
const addRole = async () => {
    try {
        // Pull the list of departments for the user to choose in the coming prompts
        const [departments] = await connection.query(`SELECT id, name FROM department`);

        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the new role: '
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for the new role: '
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department of the new role: ',
                choices: departments.map(department => ({ name: department.name, value: department.id }))
            }
        ]);

        const query = `INSERT INTO role SET ?`;
        await connection.query(query, { title: answer.title, salary: answer.salary, department_id: answer.department_id });
        console.log('Role successfully added.');
        start();
    } catch (error) {
        throw error;
    }
};

// Function to add a new employee
const addEmployee = async () => {
    try {
        const [roles] = await connection.query(`SELECT id, title FROM role`);
        const [employees] = await connection.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS full_name FROM employee`);

        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'Enter the first name of the new employee: '
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'Enter the last name of the new employee: '
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the role for the new employee: ',
                choices: roles.map(role => ({ name: role.title, value: role.id }))
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select the manager for the new employee: ',
                choices: [...employees.map(employee => ({ name: employee.full_name, value: employee.id }))]
            }
        ]);

        const query = `INSERT INTO employee SET ?`;
        await connection.query(query, {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: answer.role_id,
            manager_id: answer.manager_id
        });
        console.log('Employee successfully added.');
        start();
    } catch (error) {
        throw error;
    }
};

// Function to update an employee
const updateEmployee = async () => {
    try {
        const [employees] = await connection.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS full_name FROM employee`);
        const [roles] = await connection.query(`SELECT id, title FROM role`);

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select which employee you wish to update the role of: ',
                choices: [...employees.map(employee => ({ name: employee.full_name, value: employee.id }))]
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the new role for the employee: ',
                choices: roles.map(role => ({ name: role.title, value: role.id }))
            }
        ]);

        const query = `UPDATE employee SET role_id = ? WHERE id = ?`;
        await connection.query(query, [answer.role_id, answer.employee_id]);
        console.log('Employee successfully updated.');
        start();
    } catch (error) {
        throw error;
    }
};

// Function to view employess grouped by manager
const viewByManager = async () => {
    try {
        const [managers] = await connection.query('SELECT DISTINCT manager_id FROM employee WHERE manager_id IS NOT NULL');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select the manager to view the employees they oversee: ',
                choices: managers.map(manager => ({ name: `Manager ${manager.manager_id}`, value: manager.manager_id }))
            }
        ]);

        const query = `
            SELECT 
                employee.id,
                employee.first_name,
                employee.last_name,
                role.title AS job_title,
                department.name AS depeartment,
                role.salary
            FROM
                employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department on role.department_id = department.id
            WHERE
                employee.id IN (1, 2, 3, 4, 5, 6, 7)
        `;

        const [res] = await connection.query(query, [answer.manager_id]);
        console.table(res);
        start();
    } catch (error) {
        throw error;
    }
};

// Function to view employees by Department
const viewByDepartment = async () => {
    try {
        const [departments] = await connection.query('SELECT id, name FROM department');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department you wish to see the employees of: ',
                choices: departments.map(department => ({ name: department.name, value: department.id }))
            }
        ]);

        const query = `
            SELECT
                employee.id,
                employee.first_name,
                employee.last_name,
                role.title AS job_title,
                role.salary
            FROM
                employee
                LEFT JOIN role ON employee.role_id = role.id
            WHERE
                role.department_id = ?
        `;

        const [res] = await connection.query(query, [answer.department_id]);
        console.table(res);
        start();
    } catch (error) {
        throw error;
    }
};

// Function to view the total utilized budget
const viewBudget = async () => {
    try {
        const [departments] = await connection.query('SELECT id, name FROM department');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department to view the total utilized budget: ',
                choices: departments.map(department => ({ name: department.name, value: department.id }))
            }
        ]);

        const query = `
            SELECT 
                department.name AS department,
                SUM(role.salary) AS total_budget
            FROM
                employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
            WHERE
                role.department_id = ?
        `;

        const [res] = await connection.query(query, [answer.department_id]);
        console.log(`Total Budget for ${res[0].department}: $${res[0].total_budget.toFixed(2)}`);
        start();
    } catch (error) {
        throw error;
    }
};

//Function to update the manager of an employee
const updateManager = async () => {
    try {
        const [employees] = await connection.query('SELECT id, first_name, last_name FROM employee');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select the employee you wish to update the manager of: ',
                choices: employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select the new manager for the chosen employee: ',
                choices: employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
            }
        ])

        const query = 'UPDATE employee SET manager_id = ? WHERE id = ?';

        await connection.query(query, [answer.manager_id, answer.employee_id]);
        console.log('Manager of employee successfully updated.');
        start();
    } catch (error) {
        throw error;
    }
};

// Function to delete a Department
const deleteDepartment = async () => {
    try {
        const [departments] = await connection.query('SELECT id, name FROM department');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the Department you wish to delete: ',
                choices: departments.map(department => ({ name: department.name, value: department.id }))
            }
        ]);

        const query = 'DELETE FROM department WHERE id = ?';
        await connection.query(query, [answer.department_id]);
        console.log('Department successfully deleted.');
        start();
    } catch (error) {
        throw error;
    }
};

// Function to delete a Role
const deleteRole = async () => {
    try {
        const [roles] = await connection.query('SELECT id, title FROM role');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the role you wish to delete: ',
                choices: roles.map(role => ({ name: role.title, value: role.id }))
            }
        ]);

        const query = 'DELETE FROM role WHERE id = ?';
        await connection.query(query, [answer.role_id]);
        console.log('Role successfully deleted.');
        start();
    } catch (error) {
        throw error;
    }
};

// Function to delete an Employee
const deleteEmployee = async () => {
    try {
        const [employees] = await connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select the employee you wish to delete: ',
                choices: employees.map(employee => ({ name: employee.full_name, value: employee.id }))
            }
        ]);

        const query = 'DELETE FROM employee WHERE id = ?';
        await connection.query(query, [answer.employee_id]);
        console.log('Employee successfully deleted.');
        start();
    } catch (error) {
        throw error;
    }
};
