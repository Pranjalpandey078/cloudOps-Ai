USE cloudops_ai;

CREATE TABLE users(

    id INT AUTO_INCREMENT PRIMARY KEY,

    role_id INT NOT NULL,

    first_name VARCHAR(100),

    last_name VARCHAR(100),

    username VARCHAR(100) UNIQUE,

    email VARCHAR(200) UNIQUE,

    password_hash VARCHAR(255),

    phone VARCHAR(20),

    status ENUM(
        'ACTIVE',
        'INACTIVE',
        'BLOCKED'
    ) DEFAULT 'ACTIVE',

    last_login DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(role_id)
    REFERENCES roles(id)

);