USE cloudops_ai;

CREATE TABLE server_applications (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    server_id BIGINT NOT NULL,

    application_id BIGINT NOT NULL,

    deployed_version VARCHAR(50),

    deployment_path VARCHAR(255),

    deployment_status ENUM(
        'RUNNING',
        'STOPPED',
        'FAILED'
    ) DEFAULT 'RUNNING',

    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(server_id)
    REFERENCES servers(id)
    ON DELETE CASCADE,

    FOREIGN KEY(application_id)
    REFERENCES applications(id)
    ON DELETE CASCADE

);