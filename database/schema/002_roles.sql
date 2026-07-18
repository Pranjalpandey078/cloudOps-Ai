USE cloudops_ai;

CREATE TABLE roles (

    id INT AUTO_INCREMENT PRIMARY KEY,

    role_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);