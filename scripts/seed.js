// Script to populate the database with initial test data.
require('dotenv').config({ path: './.env' }); // Load environment variables
const { Pool } = require('pg'); // PostgreSQL client
const bcrypt = require('bcryptjs'); // For password hashing

// Database connection configuration (prefer DATABASE_URL for cloud/Render)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Always require SSL for cloud DB
    })
  : new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });

// Hashes a plain password.
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Main function to seed the database.
const seedDatabase = async () => {
    let client;
    try {
        client = await pool.connect(); // Get a database client from the pool
        console.log('Database client connected for seeding.');

        // Clear existing data from tables (important for re-running the script)
        console.log('Clearing existing data...');
        await client.query('DELETE FROM attendance_records;');
        await client.query('DELETE FROM attendance_sessions;');
        await client.query('DELETE FROM enrollments;');
        await client.query('DELETE FROM faculty_subjects;');
        await client.query('DELETE FROM students;');
        await client.query('DELETE FROM subjects;');
        await client.query('DELETE FROM faculties;');
        await client.query('DELETE FROM departments;');
        // If you had an old 'users' table from previous attempts, uncomment the line below:
        // await client.query('DELETE FROM users;');
        console.log('Existing data cleared.');

        // Insert Departments and capture their generated IDs.
        console.log('Inserting departments...');
        const departmentRes1 = await client.query(`INSERT INTO departments (name) VALUES ('ECE') RETURNING department_id;`);
        const eceDepartmentId = departmentRes1.rows[0].department_id;
        const departmentRes2 = await client.query(`INSERT INTO departments (name) VALUES ('IT') RETURNING department_id;`);
        const itDepartmentId = departmentRes2.rows[0].department_id;
        const departmentRes3 = await client.query(`INSERT INTO departments (name) VALUES ('IT-BI') RETURNING department_id;`);
        const itbiDepartmentId = departmentRes3.rows[0].department_id;
        console.log(`Departments inserted: ECE (${eceDepartmentId}), IT (${itDepartmentId}), IT-BI (${itbiDepartmentId})`);

        // Insert Faculty and capture its generated ID.
        console.log('Inserting faculties...');
        const facultyPasswordHash = await hashPassword('testpassword');
        const facultyRes = await client.query(
            `INSERT INTO faculties (name, email, password_hash, department_id) VALUES ($1, $2, $3, $4) RETURNING faculty_id;`,
            ['Dr. Mukesh Adani', 'mukesh.adani@example.com', facultyPasswordHash, eceDepartmentId]
        );
        const facultyId = facultyRes.rows[0].faculty_id;
        console.log(`Faculty inserted: Dr. Mukesh Adani (${facultyId})`);

        // Insert Subjects and capture their generated IDs.
        console.log('Inserting subjects...');
        const subjectRes1 = await client.query(
            `INSERT INTO subjects (subject_name, department_id, year, section, batch_name) VALUES ($1, $2, $3, $4, $5) RETURNING subject_id;`,
            ['Data Structures', eceDepartmentId, 3, 'A', '3rd Year A Batch']
        );
        const dataStructuresSubjectId = subjectRes1.rows[0].subject_id;

        const subjectRes2 = await client.query(
            `INSERT INTO subjects (subject_name, department_id, year, section, batch_name) VALUES ($1, $2, $3, $4, ($5)) RETURNING subject_id;`,
            ['Operating Systems', eceDepartmentId, 3, 'A', '3rd Year A Batch']
        );
        const operatingSystemsSubjectId = subjectRes2.rows[0].subject_id;
        console.log(`Subjects inserted: Data Structures (${dataStructuresSubjectId}), Operating Systems (${operatingSystemsSubjectId})`);

        // Assign Faculty to Subjects.
        console.log('Inserting faculty-subject assignments...');
        await client.query(
            `INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ($1, $2);`,
            [facultyId, dataStructuresSubjectId]
        );
        await client.query(
            `INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ($1, $2);`,
            [facultyId, operatingSystemsSubjectId]
        );
        console.log('Faculty-subject assignments created.');

        // Insert a Student and capture its generated ID.
        console.log('Inserting students...');
        const studentPasswordHash = await hashPassword('studentpass'); // Password for Student One
        const studentRes = await client.query(
        `INSERT INTO students (roll_number, name, email, password_hash, department_id, current_year, section) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING student_id;`,
        ['IEC2023021', 'Student One', 'student.one@example.com', studentPasswordHash, eceDepartmentId, 3, 'A']
        );
        const studentId = studentRes.rows[0].student_id;
        console.log(`Student inserted: Student One (${studentId})`);

        // Enroll Student in Subjects.
        console.log('Inserting student enrollments...');
        await client.query(
            `INSERT INTO enrollments (student_id, subject_id) VALUES ($1, $2);`,
            [studentId, dataStructuresSubjectId]
        );
        await client.query(
            `INSERT INTO enrollments (student_id, subject_id) VALUES ($1, $2);`,
            [studentId, operatingSystemsSubjectId]
        );
        console.log('Student enrollments created.');

        // Insert Attendance Sessions and Records for calendar view.
        console.log('Inserting attendance sessions and records...');
        // Corrected sessions: status 'open' and include qr_code_data
        const sept5SessionRes = await client.query(
            `INSERT INTO attendance_sessions (subject_id, faculty_id, session_date, start_time, status, qr_code_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING session_id, qr_code_data;`,
            [dataStructuresSubjectId, facultyId, '2024-09-05', '10:00:00', 'open', 'CODE5ABC'] // Status OPEN + QR Code
        );
        const sept5SessionId = sept5SessionRes.rows[0].session_id;
        const sept5QrCode = sept5SessionRes.rows[0].qr_code_data;
        await client.query(
            `INSERT INTO attendance_records (session_id, student_id, status, attended_at) VALUES ($1, $2, $3, $4);`,
            [sept5SessionId, studentId, 'present', '2024-09-05 10:05:00+05:30']
        );
        console.log(`Attendance for 2024-09-05 recorded (Present), Code: ${sept5QrCode}.`);

        const sept6SessionRes = await client.query(
            `INSERT INTO attendance_sessions (subject_id, faculty_id, session_date, start_time, status, qr_code_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING session_id, qr_code_data;`,
            [dataStructuresSubjectId, facultyId, '2024-09-06', '10:00:00', 'open', 'CODE6DEF'] // Status OPEN + QR Code
        );
        const sept6SessionId = sept6SessionRes.rows[0].session_id;
        const sept6QrCode = sept6SessionRes.rows[0].qr_code_data;
        await client.query(
            `INSERT INTO attendance_records (session_id, student_id, status, attended_at) VALUES ($1, $2, $3, $4);`,
            [sept6SessionId, studentId, 'present', '2024-09-06 10:02:00+05:30']
        );
        console.log(`Attendance for 2024-09-06 recorded (Present), Code: ${sept6QrCode}.`);

        const sept12SessionRes = await client.query(
            `INSERT INTO attendance_sessions (subject_id, faculty_id, session_date, start_time, status, qr_code_data) VALUES ($1, $2, $3, $4, ($5), $6) RETURNING session_id, qr_code_data;`,
            [dataStructuresSubjectId, facultyId, '2024-09-12', '10:00:00', 'open', 'CODE12GHI'] // Status OPEN + QR Code
        );
        const sept12SessionId = sept12SessionRes.rows[0].session_id;
        const sept12QrCode = sept12SessionRes.rows[0].qr_code_data;
        await client.query(
            `INSERT INTO attendance_records (session_id, student_id, status, attended_at) VALUES ($1, $2, $3, $4);`,
            [sept12SessionId, studentId, 'absent', null]
        );
        console.log(`Attendance for 2024-09-12 recorded (Absent), Code: ${sept12QrCode}.`);

        // NEW ADMIN USER INSERTION
        console.log('Inserting default admin user...');
        const adminPasswordHash = await hashPassword('adminpass');
        const adminRes = await client.query(
            `INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash RETURNING admin_id;`,
            ['Super Admin', 'admin@example.com', adminPasswordHash]
        );
        const adminId = adminRes.rows[0].admin_id;
        console.log(`Default admin inserted: admin@example.com (${adminId})`);

        console.log('All test data seeded successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        if (client) {
            client.release();
            console.log('Database client released.');
        }
        process.exit(0);
    }
};

seedDatabase();