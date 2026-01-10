-- Fixed and Complete Database Schema for Lost ID Automation System

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to recreate with proper schema
DROP TABLE IF EXISTS rejected_requests CASCADE;
DROP TABLE IF EXISTS requestFlow CASCADE;
DROP TABLE IF EXISTS Banned_Students CASCADE;
DROP TABLE IF EXISTS lostIdReport CASCADE;
DROP TABLE IF EXISTS foundIdReport CASCADE;
DROP TABLE IF EXISTS refreshToken CASCADE;
DROP TABLE IF EXISTS pendingUsers CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- Core Users table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT DEFAULT NULL,
    -- department is must for students and department_heads
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pending users table for email verification
CREATE TABLE pendingUsers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_number TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    otp_hashed TEXT NOT NULL,
    department TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh token table
CREATE TABLE refreshToken (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES Users (id) ON DELETE CASCADE,
    user_role TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Found ID reports table
CREATE TABLE foundIdReport (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    founder_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    found_id_number TEXT,
    found_at TEXT,
    matched BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lost ID reports table
CREATE TABLE lostIdReport (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users (id) ON DELETE CASCADE,
    lost_id_number TEXT,
    found_status BOOLEAN DEFAULT false,
    founded_by UUID REFERENCES foundIdReport (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banned students table
CREATE TABLE Banned_Students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_number TEXT NOT NULL,
    banned_by UUID REFERENCES Users (id) ON DELETE CASCADE,
    reason TEXT,
    stillBanned BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Request flow table for new ID requests
CREATE TABLE requestFlow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_number TEXT NOT NULL,
    requester_id UUID REFERENCES Users (id) ON DELETE CASCADE,
    library_sign UUID REFERENCES Users (id),
    registral_sign UUID REFERENCES Users (id),
    campusPolice_sign UUID REFERENCES Users (id),
    finance_sign UUID REFERENCES Users (id),
    bookStore_sign UUID REFERENCES Users (id),
    departmentHead_sign UUID REFERENCES Users (id),
    policeDocument TEXT, -- Store file path or base64 encoded image
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    -- rejection_id UUID REFERENCES rejected_requests (id),
    -- this is a bad design decision
    -- if a status = rejected then u will query the rejected table using the id of req flow
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rejected requests table
CREATE TABLE rejected_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rejected_by UUID REFERENCES Users (id) ON DELETE CASCADE,
    rejected_request_id UUID REFERENCES requestFlow (id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_id_number ON Users(id_number);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_lost_id_number ON lostIdReport(lost_id_number);
CREATE INDEX idx_found_id_number ON foundIdReport(found_id_number);
CREATE INDEX idx_request_flow_status ON requestFlow(status);
CREATE INDEX idx_banned_students_id_number ON Banned_Students(id_number);

-- Trigger to move user from pending to verified
CREATE OR REPLACE FUNCTION move_User_Into_Verified()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$ 
    BEGIN
        INSERT INTO Users(id, id_number, name, email, password, role, department)
        VALUES (OLD.id, OLD.id_number, OLD.name, OLD.email, OLD.password, OLD.role, OLD.department);
        
        RAISE NOTICE 'User moved from pending to verified: %', OLD.email;
        RETURN OLD;
    END;
$$;

CREATE OR REPLACE TRIGGER before_deleting
    BEFORE DELETE
    ON pendingUsers
    FOR EACH ROW
    EXECUTE PROCEDURE move_User_Into_Verified();

-- Function to handle lost ID report with automatic matching
CREATE OR REPLACE FUNCTION insertingIntoLostIdReport(
    p_user_id UUID,
    p_lost_id_number TEXT
)
RETURNS lostIdReport
LANGUAGE plpgsql
AS $$
    DECLARE matchedRow foundIdReport%ROWTYPE;
    DECLARE insertedRow lostIdReport%ROWTYPE;
    DECLARE payloadText TEXT;
BEGIN
    -- Check if there's a matching found ID
    SELECT * INTO matchedRow 
    FROM foundIdReport
    WHERE found_id_number = p_lost_id_number
    AND matched = FALSE
    LIMIT 1;

    IF FOUND THEN
        -- Update the found ID as matched
        UPDATE foundIdReport 
        SET matched = TRUE
        WHERE id = matchedRow.id;

        -- Insert lost ID report with found status
        INSERT INTO lostIdReport(user_id, lost_id_number, found_status, founded_by)
        VALUES(p_user_id, p_lost_id_number, TRUE, matchedRow.id)
        RETURNING * INTO insertedRow;

        -- Send notification
        payloadText := json_build_object(
            'founderTableInfo', matchedRow.id,
            'requesterId', insertedRow.user_id
        )::text;

        PERFORM pg_notify('lost_id_found', payloadText);
    ELSE
        -- Insert without matching
        INSERT INTO lostIdReport(user_id, lost_id_number)
        VALUES(p_user_id, p_lost_id_number)
        RETURNING * INTO insertedRow;
    END IF;
    
    RETURN insertedRow;
END;
$$;

-- Function to handle found ID report with automatic matching
CREATE OR REPLACE FUNCTION insertingIntoFoundIdReport(
    p_founder_name TEXT,
    p_contact_info TEXT,
    p_found_id_number TEXT, 
    p_found_at TEXT
)
RETURNS foundIdReport
LANGUAGE plpgsql
AS $$
    DECLARE lostIdReportRow lostIdReport%ROWTYPE;
    DECLARE insertedRow foundIdReport%ROWTYPE;
    DECLARE payloadText TEXT;
BEGIN
    -- Check if there's a matching lost ID
    SELECT * INTO lostIdReportRow
    FROM lostIdReport
    WHERE lost_id_number = p_found_id_number
    AND found_status = FALSE
    LIMIT 1;

    IF FOUND THEN
        -- Insert found ID as matched
        INSERT INTO foundIdReport(
            founder_name,
            contact_info,
            found_id_number,
            found_at,
            matched
        ) 
        VALUES (
            p_founder_name,
            p_contact_info,
            p_found_id_number, 
            p_found_at,
            TRUE
        )
        RETURNING * INTO insertedRow;

        -- Update lost ID report
        UPDATE lostIdReport
        SET found_status = TRUE,
        founded_by = insertedRow.id
        WHERE id = lostIdReportRow.id;

        -- Send notification
        payloadText := json_build_object(
            'founderTableInfo', insertedRow.id,
            'requesterId', lostIdReportRow.user_id
        )::text;

        PERFORM pg_notify('lost_id_found', payloadText);
    ELSE
        -- Insert without matching
        INSERT INTO foundIdReport(
            founder_name,
            contact_info,
            found_id_number,
            found_at
        ) 
        VALUES (
            p_founder_name,
            p_contact_info,
            p_found_id_number, 
            p_found_at
        )
        RETURNING * INTO insertedRow;
    END IF;

    RETURN insertedRow;
END;
$$;

-- Function to handle request rejection
CREATE OR REPLACE FUNCTION stopping_request_flow(
    p_rejected_by UUID,
    p_reason TEXT,
    p_rejected_request_id UUID
)
RETURNS rejected_requests
LANGUAGE plpgsql
AS $$
    DECLARE requestFlowRow requestFlow%ROWTYPE;
    DECLARE rejectedReqRow rejected_requests%ROWTYPE;
    DECLARE payloadText TEXT;
BEGIN
    -- Insert into rejected_requests
    INSERT INTO rejected_requests(rejected_by, reason, rejected_request_id)
    VALUES(p_rejected_by, p_reason, p_rejected_request_id)
    RETURNING * INTO rejectedReqRow;

    -- Update requestFlow
    UPDATE requestFlow
    SET status = 'rejected',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_rejected_request_id
    RETURNING * INTO requestFlowRow;

    -- Send notification to student
    payloadText := json_build_object(
        'requester_id', requestFlowRow.requester_id,
        'rejection_id', rejectedReqRow.id
    )::text;

    PERFORM pg_notify('rejected_request', payloadText);
    
    RETURN rejectedReqRow;
END;
$$;

-- Function to handle request unrejection
CREATE OR REPLACE FUNCTION unrejectingRequest(
    p_rejected_request_id UUID
)
RETURNS requestFlow
LANGUAGE plpgsql
AS $$
    DECLARE rejectedRow rejected_requests%ROWTYPE;
    DECLARE requestFlowRow requestFlow%ROWTYPE;
    DECLARE payloadText TEXT;
BEGIN
    -- Get the rejected request
    SELECT * INTO rejectedRow 
    FROM rejected_requests
    WHERE id = p_rejected_request_id;

    -- Update requestFlow
    UPDATE requestFlow
    SET status = 'pending',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = rejectedRow.rejected_request_id
    RETURNING * INTO requestFlowRow;

    -- Send notification
    payloadText := json_build_object(
        'unrejected_id', requestFlowRow.requester_id
    )::text;

    PERFORM pg_notify('unrejected_user', payloadText);

    -- Delete the rejected request
    DELETE FROM rejected_requests WHERE id = rejectedRow.id;

    RETURN requestFlowRow;
END;
$$;

-- Function to check if student is banned
CREATE OR REPLACE FUNCTION check_student_banned(p_id_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
    DECLARE banned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO banned_count
    FROM Banned_Students
    WHERE id_number = p_id_number
    AND stillBanned = TRUE;
    
    RETURN banned_count > 0;
END;
$$;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE
    ON Users
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_requestflow_timestamp
    BEFORE UPDATE
    ON requestFlow
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();

SELECT * FROM foundIdReport;
