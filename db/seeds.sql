USE company_db;

INSERT INTO department (name)
VALUES  ('Executive'),
        ('Marketing'),
        ('Operations'),
        ('Administration');

INSERT INTO role (title, salary, department_id)
VALUES ('Chief Executive Officer', 500000.00, 1),
       ('Marketing Director', 350000.00, 2),
       ('Operations Director', 350000.00, 3),
       ('Administration Director', 350000.00, 4),
       ('Marketing Manager', 150000.00, 2),
       ('Operations Manager', 150000.00, 3),
       ('Administration Manager', 150000.00, 4),
       ('Sales Team Member', 80000.00, 2),
       ('Advertising Team Member', 80000.00, 2),
       ('Production Team Member', 80000.00, 3),
       ('Customer Service Team Member', 50245.12, 4),
       ('Finance Team Member', 80000.00, 4),
       ('Human Resource Team Member', 80000.00, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Jess', 'Skelton', 1, NULL),
       ('Junior', 'Adams', 2, 1),
       ('Keith', 'Lewis', 3, 1),
       ('Rosie', 'Winters', 4, 1),
       ('Ronald','Ferguson', 5, 2),
       ('Bette', 'Hurst', 6, 3),
       ('Gordon', 'Holms', 7, 4),
       ('Brandon', 'Brown', 8, 5),
       ('Rita', 'Branch', 9, 5),
       ('Laura', 'Phelps', 10, 6),
       ('Brady', 'Whitaker', 11, 6),
       ('Micah', 'Hess', 12, 7),
       ('Sandra', 'Fletcher', 13, 7);
