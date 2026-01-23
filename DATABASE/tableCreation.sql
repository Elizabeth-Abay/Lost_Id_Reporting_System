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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    token_hash TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES Users (id) ON DELETE CASCADE,
    user_role TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Found ID reports table
CREATE TABLE foundIdReport (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    founder_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    found_id_number TEXT,
    found_at TEXT,
    matched BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lost ID reports table
CREATE TABLE lostIdReport (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES Users (id) ON DELETE CASCADE,
    lost_id_number TEXT,
    found_status BOOLEAN DEFAULT false,
    founded_by UUID REFERENCES foundIdReport (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seen BOOLEAN DEFAULT FALSE
);

SELECT * FROM lostIdReport;

SELECT * FROM foundIdReport;

-- Banned students table
CREATE TABLE Banned_Students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    id_number TEXT NOT NULL,
    banned_by UUID REFERENCES Users (id) ON DELETE CASCADE,
    reason TEXT,
    stillBanned BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Request flow table for new ID requests
CREATE TABLE requestFlow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    id_number TEXT NOT NULL,
    requester_id UUID REFERENCES Users (id) ON DELETE CASCADE,
    library_sign UUID REFERENCES Users (id),
    registral_sign UUID REFERENCES Users (id),
    campusPolice_sign UUID REFERENCES Users (id),
    finance_sign UUID REFERENCES Users (id),
    bookStore_sign UUID REFERENCES Users (id),
    departmentHead_sign UUID REFERENCES Users (id),
    policeDocument TEXT, -- Store file path or base64 encoded image
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'approved',
            'rejected'
        )
    ),
    -- rejection_id UUID REFERENCES rejected_requests (id),
    -- this is a bad design decision
    -- if a status = rejected then u will query the rejected table using the id of req flow
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rejected requests table
CREATE TABLE rejected_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    rejected_by UUID REFERENCES Users (id) ON DELETE CASCADE,
    rejected_request_id UUID REFERENCES requestFlow (id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

TRUNCATE RequestFlow CASCADE;

SELECT * FROM RequestFlow;

SELECT *
FROM Users
WHERE
    id = '90843f5e-c52d-45ac-97eb-631c40cf9bf0';

-- Create indexes for better performance
CREATE INDEX idx_users_id_number ON Users (id_number);

CREATE INDEX idx_users_email ON Users (email);

CREATE INDEX idx_lost_id_number ON lostIdReport (lost_id_number);

CREATE INDEX idx_found_id_number ON foundIdReport (found_id_number);

CREATE INDEX idx_request_flow_status ON requestFlow (status);

CREATE INDEX idx_banned_students_id_number ON Banned_Students (id_number);

-- Trigger to move user from pending to verified
CREATE OR REPLACE FUNCTION move_User_Into_Verified(idPending UUID)
RETURNS Users
LANGUAGE plpgsql
AS $$ 
    DECLARE pendingUserRow pendingUsers%ROWTYPE;
    DECLARE userCreatedRow Users%ROWTYPE;
    BEGIN

        SELECT * INTO pendingUserRow 
        FROM pendingUsers 
        WHERE id = idPending;


        INSERT INTO Users(id, id_number, name, email, password, role, department)
        VALUES (pendingUserRow.id, pendingUserRow.id_number, pendingUserRow.name, pendingUserRow.email, pendingUserRow.password, pendingUserRow.role, pendingUserRow.department)
        RETURNING * INTO userCreatedRow;


        DELETE FROM pendingUsers WHERE id = idPending;


        RETURN userCreatedRow;
    END;
$$;

CREATE OR REPLACE TRIGGER before_deleting
    BEFORE DELETE
    ON pendingUsers
    FOR EACH ROW
    EXECUTE PROCEDURE move_User_Into_Verified();

DROP TRIGGER before_deleting ON pendingUsers;

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
        'rejection_id', rejectedReqRow.id,
        'rejector_id' , rejectedReqRow.rejected_by
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

SELECT * FROM pendingUsers;

TRUNCATE TABLE pendingUsers;

DROP TABLE Users;

DROP TABLE refreshToken;

SELECT * FROM Users;

INSERT INTO Users ()



DELETE FROM Users WHERE id = '8700fd90-6d15-4ef6-826f-b288445a4c99';

SELECT * FROM rejected_requests;

SELECT * FROM requestFlow;

-- when staff requests the id then they will also get the police picture everytime

SELECT * FROM Banned_Students;

SELECT * FROM lostIdReport;

SELECT * FROM foundIdReport;

DELETE FROM Users
WHERE
    id in (
        'c47c0ed2-843d-482b-b4de-46c9e7a38f83',
        'beeb9de9-c340-4d2e-9fe7-c6f5263e8aa2',
        '9aca3036-1390-4772-84a6-82a6590492ea',
        'eb693950-fdbb-4057-9145-5dc1a4d77390',
        '493db439-2f06-420c-aae0-9212eeb04212',
        'c1249d50-ad34-4f2a-8eea-4ed8925e2425',
        'a2b8bff4-0d82-44a1-b39f-7ed9d24a013b',
        '3df610a4-c649-4bfb-a083-4ca36d161c23',
        '4f737928-52e7-4622-a249-5070564f67e6'
    );

SELECT * FROM RequestFlow;

DROP FUNCTION update_request_by_role;

CREATE OR REPLACE FUNCTION update_request_by_role(
    p_role TEXT,
    request_flow_id UUID,
    new_value UUID
)
RETURNS requestFlow
LANGUAGE plpgsql
AS $$
DECLARE updated_row requestFlow%ROWTYPE;
DECLARE payloadText TEXT;
BEGIN
    -- Check which column to update based on p_role
    IF p_role = 'campus_police' THEN
        UPDATE requestflow
        SET campuspolice_sign = new_value
        WHERE id = request_flow_id
        RETURNING * INTO updated_row;

    ELSIF p_role = 'library' THEN
        UPDATE requestflow
        SET library_sign = new_value
        WHERE id = request_flow_id
        RETURNING * INTO updated_row;

    ELSIF p_role = 'registral' THEN
        RAISE NOTICE 'reached p_role = registral';

        UPDATE requestflow
        SET registral_sign = new_value,
        status = 'approved'
        WHERE id = request_flow_id
        RETURNING * INTO updated_row;

        -- then also u need to notify the student via email
        payloadText := json_build_object(
        'request_id', updated_row.id
        )::text;

        RAISE NOTICE 'reached payload';

        PERFORM pg_notify( 'request_approved' , payloadText);
        
        RAISE NOTICE 'sent out notification';
        

    ELSIF p_role = 'financial' THEN
        UPDATE requestflow
        SET finance_sign = new_value
        WHERE id = request_flow_id
        RETURNING * INTO updated_row;

    ELSIF p_role = 'book_store' THEN
        UPDATE requestflow
        SET bookstore_sign = new_value
        WHERE id = request_flow_id
        RETURNING * INTO updated_row;

    ELSIF p_role = 'department_head' THEN
        UPDATE requestflow
        SET departmentHead_sign = new_value
        WHERE id = request_flow_id
        RETURNING * INTO updated_row;

    ELSE
        RAISE EXCEPTION 'Invalid p_role: %', p_role;
    END IF;

    -- Check if any row was updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'RequestFlow not found or not updated';
    END IF;

    RETURN updated_row;
END;
$$;

CREATE OR REPLACE FUNCTION getting_Notification_for_students
(
    p_studentId UUID
)
RETURNS TABLE(
    status_received TEXT,
    acceptor_one_name TEXT,
    acceptor_one_role TEXT,
    acceptor_two_name TEXT,
    acceptor_two_role TEXT,
    acceptor_third_name TEXT,
    acceptor_third_role TEXT,
    acceptor_fourth_name TEXT,
    acceptor_fourth_role TEXT,
    acceptor_fifth_name TEXT,
    acceptor_fifth_role TEXT,
    acceptor_sixth_name TEXT,
    acceptor_sixth_role TEXT,
    rejector_name TEXT,
    rejector_role TEXT,
    reason TEXT
)
LANGUAGE plpgsql
AS $$
    DECLARE 
        reqId UUID;
        rowSelected RequestFlow%ROWTYPE;
    
        -- declare an array to hold the user id values
        signer_Id UUID ARRAY := '{}' ;
        -- an array to hold uuid values
    BEGIN
        FOR rowSelected IN
            SELECT * 
            FROM RequestFlow
            WHERE requester_id = p_studentId
            AND status != 'approved'
            LIMIT 1

        LOOP
            reqId := rowSelected.id;
            status_received := rowSelected.status;

            IF rowSelected.library_sign IS NOT NULL THEN
                signer_Id :=  array_append(signer_Id , rowSelected.library_sign );
            END IF;
            IF rowSelected.registral_sign IS NOT NULL THEN
                signer_Id := array_append(signer_Id , rowSelected.registral_sign );
            END IF;
            IF rowSelected.campuspolice_sign IS NOT NULL THEN
                signer_Id := array_append(signer_Id , rowSelected.campuspolice_sign );
            END IF;
            IF rowSelected.finance_sign IS NOT NULL THEN
                signer_Id := array_append(signer_Id , rowSelected.finance_sign);
            END IF;
            IF rowSelected.bookstore_sign IS NOT NULL THEN
                signer_Id := array_append(signer_Id , rowSelected.bookstore_sign );
            END IF;
            IF rowSelected.departmenthead_sign IS NOT NULL THEN
                signer_Id := array_append(signer_Id , rowSelected.departmenthead_sign);
            END IF;
        END LOOP;

        -- By the end of the loop then array will have ppl who approved
        -- so do a join with UserTable on who accepted
        -- but do this not unnest but by counting the number of items in the array
        -- array contains id of users table

        RAISE NOTICE 'signer id %' , signer_Id;

        IF cardinality(signer_Id) >= 1 THEN
            -- RAISE NOTICE 'yep';
            SELECT name , role 
            INTO acceptor_one_name ,acceptor_one_role
            FROM Users WHERE id = signer_Id[1];
        END IF;

        IF cardinality(signer_Id) >= 2 THEN
            SELECT name , role 
            INTO acceptor_two_name ,acceptor_two_role
            FROM Users WHERE id = signer_Id[2];
        END IF;
        IF cardinality(signer_Id) >= 3 THEN
            SELECT name , role
            INTO acceptor_third_name ,acceptor_third_role 
            FROM Users WHERE id = signer_Id[3];
        END IF;
        IF cardinality(signer_Id) >= 4 THEN
            SELECT name , role
            INTO acceptor_fourth_name ,acceptor_fourth_role 
            FROM Users WHERE id = signer_Id[4];
        END IF;
        IF cardinality(signer_Id) >= 5 THEN
            SELECT name , role
            INTO acceptor_fifth_name ,acceptor_fifth_role 
            FROM Users WHERE id = signer_Id[5];
        END IF;
        IF cardinality(signer_Id) >= 6 THEN
            SELECT name , role 
            INTO acceptor_sixth_name ,acceptor_sixth_role
            FROM Users WHERE id = signer_Id[6];
        END IF;

        IF status_received = 'rejected' THEN        
        -- select the rejected id from request by using reqId
            SELECT u.name , u.role , r.reason 
            INTO rejector_name , rejector_role, reason
            FROM rejected_requests AS r 
            JOIN Users AS u 
            ON  u.id = r.rejected_by
            WHERE r.rejected_request_id = reqId;

        END IF;
    RETURN NEXT;
    END;
$$;





SELECT * FROM requestFlow;

SELECT * FROM rejected_requests;


SELECT * FROM Banned_Students;


SELECT * FROM lostIdReport;

SELECT * FROM foundIdReport;



SELECT * FROM Users ;
 WHERE id = '9582af04-b777-4396-9355-2ec1b6d9f1db';


SELECT * FROM RefreshToken;



TRUNCATE requestFlow CASCADE;



SELECT * FROM rep



TRUNCATE requestFlow CASCADE;

