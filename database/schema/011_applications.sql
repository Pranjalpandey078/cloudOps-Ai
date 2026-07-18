USE cloudops_ai;

CREATE TABLE applications (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    organization_id BIGINT NOT NULL,

    application_name VARCHAR(150) NOT NULL UNIQUE,

    description TEXT,

    repository_url VARCHAR(255),

    default_branch VARCHAR(100) DEFAULT 'main',

    language VARCHAR(100),

    framework VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)

);