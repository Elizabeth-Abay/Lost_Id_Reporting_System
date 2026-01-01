CREATE TABLE found_id_reports (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_number VARCHAR(50) NOT NULL,
    found_at TEXT NOT NULL,
    reporter_name VARCHAR(100) NOT NULL,
    contact_info VARCHAR(100) NOT NULL,
    report_date DATE DEFAULT CURRENT_DATE
);
