CREATE TABLE notifications (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_uuid UUID NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_uuid) REFERENCES users(uuid)
);
