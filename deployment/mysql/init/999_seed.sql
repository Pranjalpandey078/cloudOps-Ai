USE cloudops_ai;

INSERT INTO organizations (
    id,
    organization_name,
    company_code,
    contact_email,
    contact_phone,
    address,
    status
)
VALUES (
    1,
    'CloudOps AI',
    'CLOUDAI001',
    'admin@cloudops.ai',
    NULL,
    'Cloud Deployment',
    'ACTIVE'
);

INSERT INTO environments (
    id,
    organization_id,
    environment_name,
    description
)
VALUES (
    1,
    1,
    'Production',
    'CloudOps production environment'
);

INSERT INTO roles (
    id,
    role_name,
    description
)
VALUES
    (1, 'SUPER_ADMIN', 'Full System Access'),
    (2, 'DEVOPS_ENGINEER', 'Infrastructure Management'),
    (3, 'DEVELOPER', 'Application Management'),
    (4, 'VIEWER', 'Read Only');

INSERT INTO permissions (
    id,
    permission_key,
    module_name,
    description
)
VALUES
    (1, 'USER_CREATE', 'Users', 'Create User'),
    (2, 'USER_UPDATE', 'Users', 'Update User'),
    (3, 'USER_DELETE', 'Users', 'Delete User'),
    (4, 'SERVER_VIEW', 'Inventory', 'View Server'),
    (5, 'SERVER_CREATE', 'Inventory', 'Create Server'),
    (6, 'DEPLOYMENT_START', 'Deployment', 'Start Deployment'),
    (7, 'DEPLOYMENT_ROLLBACK', 'Deployment', 'Rollback Deployment'),
    (8, 'INCIDENT_CREATE', 'Incident', 'Create Incident'),
    (9, 'INCIDENT_CLOSE', 'Incident', 'Close Incident'),
    (10, 'AI_ANALYSIS', 'AI', 'Run AI Analysis');

-- Initial admin user is provisioned separately during deployment.
-- Do not store a default password/hash in the public repository.

-- Initial admin user and role assignment are provisioned separately during deployment.

INSERT INTO servers (
    id,
    organization_id,
    environment_id,
    hostname,
    ip_address,
    operating_system,
    os_version,
    cpu_cores,
    memory_gb,
    disk_gb,
    cloud_provider,
    discovery_source,
    status
)
VALUES (
    1,
    1,
    1,
    'cloudops-demo-server',
    '127.0.0.1',
    'Linux',
    'Container',
    2,
    4,
    40,
    'ON_PREMISE',
    'MANUAL',
    'RUNNING'
);

INSERT INTO monitoring_rules (
    id,
    organization_id,
    metric_name,
    warning_threshold,
    critical_threshold,
    enabled
)
VALUES
    (1, 1, 'CPU', 70.00, 90.00, 1),
    (2, 1, 'MEMORY', 80.00, 90.00, 1),
    (3, 1, 'DISK', 80.00, 95.00, 1);
