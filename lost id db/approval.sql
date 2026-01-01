CREATE TABLE replacement_approvals (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_uuid UUID NOT NULL,
    staff_uuid UUID NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    comment TEXT,
    decision_date DATE DEFAULT CURRENT_DATE,

    FOREIGN KEY (request_uuid) REFERENCES replacement_requests(uuid),
    FOREIGN KEY (staff_uuid) REFERENCES users(uuid)
);
