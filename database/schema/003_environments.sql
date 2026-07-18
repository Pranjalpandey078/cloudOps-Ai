USE cloudops_ai;

CREATE TABLE environments (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    organization_id BIGINT NOT NULL,

    environment_name ENUM(

        'Development',

        'Testing',

        'Staging',

        'Production'

    ) NOT NULL,

    description VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id)

    REFERENCES organizations(id)

);