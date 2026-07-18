USE cloudops_ai;

CREATE TABLE roles (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    role_name VARCHAR(100) UNIQUE,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
