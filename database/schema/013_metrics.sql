USE cloudops_ai;

CREATE TABLE metrics (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    server_id BIGINT NOT NULL,

    cpu_usage DECIMAL(5,2),

    memory_usage DECIMAL(5,2),

    disk_usage DECIMAL(5,2),

    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(server_id)
    REFERENCES servers(id)

);