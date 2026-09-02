CREATE TABLE IF NOT EXISTS remediation_verifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    execution_id BIGINT NOT NULL,
    incident_id BIGINT NOT NULL,
    server_id BIGINT DEFAULT NULL,
    verification_status ENUM(
        'PENDING',
        'CHECKING',
        'RECOVERED',
        'FAILED',
        'INCONCLUSIVE'
    ) NOT NULL DEFAULT 'PENDING',
    metric_name VARCHAR(100) NOT NULL,
    before_value DECIMAL(10,2) DEFAULT NULL,
    after_value DECIMAL(10,2) DEFAULT NULL,
    threshold_value DECIMAL(10,2) DEFAULT NULL,
    evidence_data JSON DEFAULT NULL,
    verification_message TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (id),

    KEY idx_verification_execution (
        execution_id
    ),

    KEY idx_verification_incident (
        incident_id
    ),

    KEY idx_verification_server (
        server_id
    ),

    CONSTRAINT fk_verification_execution
        FOREIGN KEY (execution_id)
        REFERENCES remediation_executions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_verification_incident
        FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_verification_server
        FOREIGN KEY (server_id)
        REFERENCES servers(id)
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
