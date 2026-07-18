USE cloudops_ai;

CREATE TABLE environments(

    id INT AUTO_INCREMENT PRIMARY KEY,

    environment_name VARCHAR(50) UNIQUE NOT NULL,

    description VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);