USE cloudops_ai;

CREATE TABLE users (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    organization_id BIGINT NOT NULL,

    first_name VARCHAR(100),

    last_name VARCHAR(100),

    username VARCHAR(100) UNIQUE,

    email VARCHAR(150) UNIQUE,

    password_hash VARCHAR(255),

    phone VARCHAR(20),

    account_status ENUM(

        'ACTIVE',

        'BLOCKED',

        'DISABLED'

    ) DEFAULT 'ACTIVE',

    last_login DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id)

    REFERENCES organizations(id)

);