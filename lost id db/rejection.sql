CREATE TABLE replacement_rejections (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_uuid UUID NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    rejected_date DATE DEFAULT CURRENT_DATE,

    FOREIGN KEY (request_uuid) REFERENCES replacement_requests(uuid)
);
