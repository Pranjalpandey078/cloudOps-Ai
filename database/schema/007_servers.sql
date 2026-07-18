USE cloudops_ai;

CREATE TABLE servers(

    id INT AUTO_INCREMENT PRIMARY KEY,

    environment_id INT NOT NULL,

    hostname VARCHAR(100) UNIQUE NOT NULL,

    ip_address VARCHAR(50) UNIQUE NOT NULL,

    operating_system VARCHAR(100),

    os_version VARCHAR(100),

    cpu_cores INT,

    memory_gb INT,

    disk_gb INT,

    ssh_port INT DEFAULT 22,

    cloud_provider ENUM(

        'AWS',

        'Azure',

        'GCP',

        'On-Premise'

    ) DEFAULT 'AWS',

    region VARCHAR(100),

    instance_type VARCHAR(100),

    server_status ENUM(

        'Running',

        'Stopped',

        'Maintenance'

    ) DEFAULT 'Running',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(environment_id)

    REFERENCES environments(id)

);