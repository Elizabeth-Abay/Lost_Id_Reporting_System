CREATE TABLE lost_id_reports (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_uuid UUID NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    status VARCHAR(20)
        CHECK (status IN ('pending', 'approved', 'rejected'))
        DEFAULT 'pending',
    report_date DATE DEFAULT CURRENT_DATE,

    FOREIGN KEY (user_uuid) REFERENCES users(uuid)
);
