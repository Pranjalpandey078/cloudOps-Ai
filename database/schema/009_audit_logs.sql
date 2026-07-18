USE cloudops_ai;

CREATE TABLE audit_logs (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT,

    module_name VARCHAR(100),

    action VARCHAR(100),

    resource_id BIGINT,

    old_value JSON,

    new_value JSON,

    ip_address VARCHAR(45),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)

    REFERENCES users(id)

);