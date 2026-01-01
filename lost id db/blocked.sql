CREATE TABLE blocked_users (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_uuid UUID NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,

    FOREIGN KEY (user_uuid) REFERENCES users(uuid)
);
