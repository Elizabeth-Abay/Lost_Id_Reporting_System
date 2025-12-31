-- so this is the vybe tables will be created
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE pending_users(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_name TEXT NOT NULL,
	email  TEXT NOT NULL UNIQUE,
	password_hashed TEXT NOT NULL,
	otp_hashed TEXT NOT NULL
);

TRUNCATE TABLE pending_users;
TRUNCATE TABLE verified_users;

CREATE TABLE verified_users(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_name TEXT NOT NULL,
	email  TEXT NOT NULL UNIQUE,
	password_hashed TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


SELECT * FROM pending_users;
