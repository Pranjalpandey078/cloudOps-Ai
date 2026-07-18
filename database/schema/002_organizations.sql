USE cloudops_ai;

CREATE TABLE organizations (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    organization_name VARCHAR(150) NOT NULL UNIQUE,

    company_code VARCHAR(50) UNIQUE NOT NULL,

    contact_email VARCHAR(150),

    contact_phone VARCHAR(20),

    address TEXT,

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);