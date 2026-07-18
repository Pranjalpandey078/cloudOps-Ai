USE cloudops_ai;

CREATE TABLE permissions (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    permission_key VARCHAR(150) UNIQUE,

    module_name VARCHAR(100),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);