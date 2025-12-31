SELECT * FROM pending_users;



TRUNCATE TABLE pending_users;


-- definning a trigger for database
-- the trigger will run before deleting a user and moves the user into verified user before deleting them
-- before deletion backend will verify otp(time and consistency) and then delete the user from pending_users
-- before deleting the user from pending_users then insert all neccessary info into verified user from the database side
-- and generate an access and refresh token on the backend to be sent to the user

CREATE OR REPLACE FUNCTION moving_users_into_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
    BEGIN
        INSERT INTO verified_users( id , username, email, password_hashed) 
        VALUES ( OLD.id , OLD.user_name , OLD.email , OLD.password_hashed);

        -- bc we use the same info for token generation
        
        RETURN OLD;
        -- bc we are deleting there is no new
    END;
$$;


CREATE OR REPLACE TRIGGER before_deleting
    BEFORE DELETE
    ON pending_users
    FOR EACH ROW
EXECUTE PROCEDURE moving_users_into_verified();




SELECT * FROM verified_users;

CREATE TABLE verified_users(
    id UUID PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hashed TEXT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


SELECT * FROM refresh_token_info;


TRUNCATE TABLE refresh_token_info;


DROP TABLE verified_users;

TRUNCATE TABLE  verified_users;


CREATE TABLE refresh_token_info(
    id UUID PRIMARY KEY ,
    -- bc in the ref token it needs to have its own id like it need it saved
    user_id UUID REFERENCES verified_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATE DEFAULT CURRENT_DATE + 20,
    is_valid BOOLEAN DEFAULT true
);

DROP TABLE  refresh_token_info;

SELECT * FROM pending_users;

SELECT * FROM verified_users;

SELECT * FROM refresh_token_info;

