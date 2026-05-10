# Lost ID Automation System

## Overview

The Lost ID Automation System is a digital platform developed to simplify and automate the process of reporting, managing, tracking, and recovering lost identification cards. The system is designed to reduce manual paperwork, improve communication between users and administrators, and provide a secure and efficient way to manage lost and found ID records.

This project aims to solve the common challenges faced in institutions and organizations where students, employees, or citizens frequently lose identification cards such as student IDs, employee badges, library cards, or national IDs.

The system provides an organized environment where users can report lost IDs, administrators can manage requests, and found IDs can be tracked efficiently.



# Problem Statement

Traditional lost ID handling systems are usually manual and inefficient. Many organizations rely on physical reports, verbal communication, or paper-based records, which can lead to:

* Delayed recovery processes
* Poor record management
* Miscommunication between users and administrators
* Difficulty tracking lost and found IDs
* Increased workload for administrators
* Loss of important information

The Lost ID Automation System addresses these issues by creating a centralized digital solution.

# Objectives

## General Objective
To develop a secure and automated system for managing lost and found identification cards.
## Specific Objectives

* Allow users to report lost IDs digitally
* Enable administrators to manage reports efficiently
* Store lost and found records in a structured database
* Improve communication between users and administrators
* Reduce paperwork and manual processing
* Provide quick search and tracking functionalities
* Improve data organization and accessibility



# Features

## User Features

* User registration and login
* Report lost ID cards
* View report status
* Search for found IDs
* Receive updates on recovery progress
* Update personal information

## Admin Features

* Admin authentication
* View all lost ID reports
* Approve or reject reports
* Manage found ID records
* Update report status
* Search and filter records
* Generate reports and statistics

## System Features

* Database integration
* Secure authentication system
* Organized dashboard interface
* Real-time record management
* Search and filtering capabilities
* User-friendly interface

---

# Technologies Used

The system can be implemented using the following technologies:

## Frontend

* HTML
* CSS
* JavaScript
* Bootstrap

## Backend

* Node.js with Express.js


## Database
* PostgreSQL


## Tools

* Git & GitHub
* VS Code 
* PostgreSQL Server



# System Architecture

The Lost ID Automation System follows a client-server architecture:

1. Users interact with the frontend interface.
2. Requests are sent to the backend server.
3. The backend processes the requests.
4. Data is stored and retrieved from the database.
5. Results are displayed to users and administrators.

# Functional Requirements

## User Requirements

* The system must allow users to register.
* The system must allow users to log in securely.
* Users must be able to report lost IDs.
* Users must be able to view their submitted reports.
* Users must be able to search for found IDs.

## Admin Requirements

* Admins must be able to log in securely.
* Admins must be able to manage reports.
* Admins must be able to update report statuses.
* Admins must be able to remove invalid reports.

# Non-Functional Requirements

* The system should be user-friendly.
* The system should provide fast response times.
* The system should ensure data security.
* The system should be scalable and maintainable.
* The system should provide reliable performance.

# Database Design
The database contains tables such as:
## Users Table
Stores user information:
* User ID
* Full Name
* Email
* Password
* Phone Number
## Lost IDs Table

Stores lost ID information:

* Report ID
* User ID
* ID Type
* Description
* Date Lost
* Status

## Found IDs Table
Stores found ID records:

* Found ID
* ID Type
* Location Found
* Date Found
* Status
# Workflow

## Reporting a Lost ID

1. User logs into the system.
2. User fills out the lost ID report form.
3. Information is stored in the database.
4. Admin reviews the report.
5. Status updates are provided to the user.

## Managing Found IDs

1. Admin adds found ID information.
2. Users search the system.
3. Matching records help identify recovered IDs.
4. Admin updates recovery status.

## Configure Database

* Create a database in MySQL or PostgreSQL
* Import the provided SQL file
* Update database configuration settings



# Future Improvements

The following features can be added in future versions:

* SMS alerts
* QR code verification
* Mobile application support
* AI-based matching system
* Cloud deployment
* Multi-language support
* Biometric verification integration
  
# Advantages of the System

* Reduces manual work
* Saves time
* Improves record management
* Enhances communication
* Provides better tracking of lost IDs
* Increases efficiency and accuracy



# Challenges Faced During Development

* Database design and normalization
* Authentication and security implementation
* Form validation
* Connecting frontend and backend components
* Managing large datasets efficiently

# Learning Outcomes

This project helped improve understanding of:

* Software development processes
* Database management systems
* Frontend and backend integration
* Authentication systems
* Problem-solving and debugging
* Team collaboration and version control using GitHub



# Conclusion

The Lost ID Automation System provides an efficient and organized solution for handling lost and found identification cards. By automating the reporting and management process, the system reduces manual effort, improves communication, and enhances data management.

The project demonstrates practical application of software development concepts including database management, user authentication, frontend-backend integration, and system design.







# License

This project is developed for educational and learning purposes.
