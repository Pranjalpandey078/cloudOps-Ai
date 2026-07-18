USE cloudops_ai;

CREATE TABLE permissions(

    id INT AUTO_INCREMENT PRIMARY KEY,

    permission_name VARCHAR(150) UNIQUE NOT NULL,

    module_name VARCHAR(100) NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);