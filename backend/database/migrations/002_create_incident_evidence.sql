CREATE TABLE IF NOT EXISTS incident_evidence (
    id BIGINT NOT NULL AUTO_INCREMENT,
    incident_id BIGINT NOT NULL,
    server_id BIGINT NOT NULL,
    evidence_type VARCHAR(60) NOT NULL,
    evidence_data JSON NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_incident_evidence_incident (
        incident_id,
        created_at
    ),

    KEY idx_incident_evidence_server (
        server_id,
        created_at
    ),

    CONSTRAINT fk_incident_evidence_incident
        FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_incident_evidence_server
        FOREIGN KEY (server_id)
        REFERENCES servers(id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
