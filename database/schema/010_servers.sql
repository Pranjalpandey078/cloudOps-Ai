USE cloudops_ai;

CREATE TABLE servers (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    organization_id BIGINT NOT NULL,

    environment_id BIGINT NOT NULL,

    hostname VARCHAR(150) NOT NULL UNIQUE,

    ip_address VARCHAR(45) NOT NULL UNIQUE,

    operating_system VARCHAR(100) NOT NULL,

    os_version VARCHAR(100),

    cpu_cores INT NOT NULL,

    memory_gb INT NOT NULL,

    disk_gb INT NOT NULL,

    cloud_provider ENUM(
        'AWS',
        'AZURE',
        'GCP',
        'ON_PREMISE'
    ) NOT NULL,

    region VARCHAR(100),

    availability_zone VARCHAR(100),

    instance_type VARCHAR(100),

    status ENUM(
        'RUNNING',
        'STOPPED',
        'MAINTENANCE'
    ) DEFAULT 'RUNNING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id)
        REFERENCES organizations(id),

    FOREIGN KEY (environment_id)
        REFERENCES environments(id)

);