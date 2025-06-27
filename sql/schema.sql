CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS departments (
    department_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculties (
    faculty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
        ON DELETE SET NULL
);

-- ADDED FOR ADMIN
CREATE TABLE IF NOT EXISTS admins (
    admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS subjects (
    subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_name VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL,
    year INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    batch_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subject_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT,
    UNIQUE (subject_name, department_id, year, section)
);

CREATE TABLE IF NOT EXISTS faculty_subjects (
    faculty_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    PRIMARY KEY (faculty_id, subject_id),
    FOREIGN KEY (faculty_id) REFERENCES faculties(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
    student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- ADDED FOR STUDENT AUTHENTICATION
    department_id UUID NOT NULL,
    current_year INT,
    section VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

CREATE TYPE ATTENDANCE_STATUS AS ENUM ('open', 'closed', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS attendance_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL,
    faculty_id UUID NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME WITH TIME ZONE NOT NULL,
    end_time TIME WITH TIME ZONE,
    status ATTENDANCE_STATUS DEFAULT 'open',
    qr_code_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(faculty_id) ON DELETE CASCADE
);

CREATE TYPE ATTENDANCE_RECORD_STATUS AS ENUM ('present', 'absent', 'late');

CREATE TABLE IF NOT EXISTS attendance_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    student_id UUID NOT NULL,
    status ATTENDANCE_RECORD_STATUS NOT NULL DEFAULT 'absent',
    attended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE INDEX idx_faculties_email ON faculties(email);
CREATE INDEX idx_subjects_department ON subjects(department_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_attendance_sessions_subject ON attendance_sessions(subject_id);
CREATE INDEX idx_attendance_records_session_student ON attendance_records(session_id, student_id);
-- ADDED FOR ADMIN
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
-- ADDED FOR PERFORMANCE (Student attendance marking)
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_qrcode_status ON attendance_sessions(qr_code_data, status);