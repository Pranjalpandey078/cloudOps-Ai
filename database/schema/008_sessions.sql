USE cloudops_ai;

CREATE TABLE user_sessions (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT,

    login_time DATETIME,

    logout_time DATETIME,

    ip_address VARCHAR(45),

    device VARCHAR(150),

    browser VARCHAR(150),

    session_token VARCHAR(255),

    FOREIGN KEY(user_id)

    REFERENCES users(id)

);