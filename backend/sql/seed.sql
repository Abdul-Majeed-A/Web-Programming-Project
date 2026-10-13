-- ProjectPulse Sample Seed Data
-- Comprehensive realistic academic project dataset

USE `projectpulse`;

-- 1. Insert Review Stages
INSERT INTO `review_stages` (`id`, `stage_name`, `stage_order`, `description`, `weightage`, `is_active`) VALUES
(1, 'Review 1: Proposal Review', 1, 'Initial proposal evaluation including problem definition, literature survey, and innovation.', 33.33, TRUE),
(2, 'Review 2: Progress Review', 2, 'Mid-term progress evaluation covering implementation, database design, UI/UX, and core functionality.', 33.33, TRUE),
(3, 'Review 3: Final Review', 3, 'Final comprehensive evaluation including live working demonstration, technical implementation, and documentation.', 33.34, TRUE)
ON DUPLICATE KEY UPDATE `stage_name` = VALUES(`stage_name`);

-- 2. Insert Review Criteria for all 3 Stages
-- Stage 1: Proposal Review (Total 100)
INSERT INTO `review_criteria` (`id`, `stage_id`, `criterion_name`, `maximum_marks`, `display_order`) VALUES
(1, 1, 'Problem definition', 20, 1),
(2, 1, 'Literature survey', 20, 2),
(3, 1, 'Proposed solution', 20, 3),
(4, 1, 'Innovation', 20, 4),
(5, 1, 'Presentation', 20, 5),

-- Stage 2: Progress Review (Total 100)
(6, 2, 'Implementation progress', 25, 1),
(7, 2, 'Database design', 15, 2),
(8, 2, 'User interface and experience', 15, 3),
(9, 2, 'Functionality', 25, 4),
(10, 2, 'Progress against objectives', 20, 5),

-- Stage 3: Final Review (Total 100)
(11, 3, 'Working demonstration', 25, 1),
(12, 3, 'Technical implementation', 25, 2),
(13, 3, 'Documentation', 15, 3),
(14, 3, 'Presentation', 15, 4),
(15, 3, 'Innovation', 20, 5)
ON DUPLICATE KEY UPDATE `criterion_name` = VALUES(`criterion_name`);

-- 3. Insert Users (Password: Admin@123 for admin, Faculty@123 for faculty, Student@123 for students)
-- Password hashes generated with bcrypt 10 salt rounds:
-- Admin@123:   $2a$10$Y8F9lUXgaKlnEKcSuLE1wOaDiukGuhi.QBBvEFfh2eHmy5Tm9Y0Om
-- Faculty@123: $2a$10$ZKYCRlicN57x3AW2WpuC5O336IdLvGDUHFvFNQr3.W.5cDFm/hlBu
-- Student@123: $2a$10$5dd5j0pnbZTzg0XvjB/gD.iKUVo8CrPnSxDjr1i1QZUYpwFi/T1f6

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `department`, `student_or_faculty_identifier`, `account_status`) VALUES
-- Admin
(1, 'Dean Dr. Rajesh Verma', 'admin@projectpulse.edu', '$2a$10$Y8F9lUXgaKlnEKcSuLE1wOaDiukGuhi.QBBvEFfh2eHmy5Tm9Y0Om', 'admin', 'Computer Science & Engineering', 'EMP-ADM-001', 'active'),

-- Faculty Reviewers
(2, 'Dr. Ramesh Sharma', 'dr.sharma@projectpulse.edu', '$2a$10$ZKYCRlicN57x3AW2WpuC5O336IdLvGDUHFvFNQr3.W.5cDFm/hlBu', 'faculty', 'Computer Science & Engineering', 'FAC-CSE-101', 'active'),
(3, 'Prof. Priya Patel', 'prof.patel@projectpulse.edu', '$2a$10$ZKYCRlicN57x3AW2WpuC5O336IdLvGDUHFvFNQr3.W.5cDFm/hlBu', 'faculty', 'Information Technology', 'FAC-IT-102', 'active'),
(4, 'Dr. Anita Desai', 'dr.anita@projectpulse.edu', '$2a$10$ZKYCRlicN57x3AW2WpuC5O336IdLvGDUHFvFNQr3.W.5cDFm/hlBu', 'faculty', 'Artificial Intelligence & Data Science', 'FAC-AI-103', 'active'),

-- Students
(5, 'Aarav Mehta', 'student1@projectpulse.edu', '$2a$10$5dd5j0pnbZTzg0XvjB/gD.iKUVo8CrPnSxDjr1i1QZUYpwFi/T1f6', 'student', 'Computer Science & Engineering', 'STU-2023-CS-042', 'active'),
(6, 'Riya Sen', 'student2@projectpulse.edu', '$2a$10$5dd5j0pnbZTzg0XvjB/gD.iKUVo8CrPnSxDjr1i1QZUYpwFi/T1f6', 'student', 'Computer Science & Engineering', 'STU-2023-CS-089', 'active'),
(7, 'Kabir Malhotra', 'student3@projectpulse.edu', '$2a$10$5dd5j0pnbZTzg0XvjB/gD.iKUVo8CrPnSxDjr1i1QZUYpwFi/T1f6', 'student', 'Information Technology', 'STU-2023-IT-015', 'active'),
(8, 'Ananya Sharma', 'student4@projectpulse.edu', '$2a$10$5dd5j0pnbZTzg0XvjB/gD.iKUVo8CrPnSxDjr1i1QZUYpwFi/T1f6', 'student', 'Artificial Intelligence & Data Science', 'STU-2023-AI-031', 'active'),
(9, 'Vihaan Joshi', 'student5@projectpulse.edu', '$2a$10$5dd5j0pnbZTzg0XvjB/gD.iKUVo8CrPnSxDjr1i1QZUYpwFi/T1f6', 'student', 'Computer Science & Engineering', 'STU-2023-CS-114', 'active')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- 4. Insert Sample Projects
INSERT INTO `projects` (`id`, `title`, `description`, `objectives`, `technology_stack`, `category`, `created_by`, `status`, `current_stage_id`, `final_score`, `created_at`, `submitted_at`) VALUES
-- Project 1: Review 1 Completed (Approved), currently Under Review in Stage 2
(1, 'AI-Powered Medical Image Diagnostic Assistant', 
 'A deep-learning diagnostic assistant that analyzes chest X-rays and MRI scans to assist radiologists in early pulmonary and neurological lesion detection.',
 '1. Collect and preprocess clinical imaging datasets.\n2. Train ResNet-50 and EfficientNet deep models.\n3. Build responsive React medical viewer with DICOM support.\n4. Deploy REST inference API with confidence metrics.',
 'Python, PyTorch, React, FastAPIs, Docker, PostgreSQL',
 'Artificial Intelligence & Machine Learning',
 5, 'Under Review', 2, NULL, '2026-09-01 10:00:00', '2026-09-03 14:30:00'),

-- Project 2: Stage 1 Changes Required
(2, 'Blockchain-Based Academic Credential Verification System',
 'A decentralized platform allowing universities to issue tamper-proof verifiable degrees on Ethereum, enabling instant cryptographic validation by employers.',
 '1. Design ERC-721 smart contract architecture.\n2. Create institutional minting dashboard.\n3. Develop QR-based employer verification portal.\n4. Gas fee optimization and layer-2 testing.',
 'Solidity, Ethereum, Ethers.js, React, Node.js, IPFS',
 'Blockchain & Cybersecurity',
 7, 'Changes Required', 1, NULL, '2026-09-05 11:30:00', '2026-09-07 16:00:00'),

-- Project 3: Completed All 3 Stages (Approved)
(3, 'Smart Campus IoT Energy Optimization Platform',
 'An end-to-end IoT platform monitoring real-time power consumption across university laboratories and dormitories, utilizing predictive automation for HVAC control.',
 '1. Deploy ESP32 smart metering sensors.\n2. Stream MQTT telemetry to time-series DB.\n3. Build real-time analytics dashboard with peak alerts.\n4. Achieve 18% documented energy reduction.',
 'React, Node.js, MQTT, InfluxDB, Python, Grafana, ESP32',
 'Internet of Things (IoT)',
 8, 'Approved', 3, 91.50, '2026-08-15 09:00:00', '2026-08-18 10:00:00'),

-- Project 4: Freshly Submitted, Pending Reviewer Assignment
(4, 'Autonomous Drone Delivery Route Planner',
 '3D path planning algorithms for autonomous micro-drones in dense urban environments with dynamic obstacle avoidance and wind vector compensation.',
 '1. Simulate urban geometry using ROS2 and Gazebo.\n2. Implement A* and RRT* obstacle avoidance.\n3. Develop ground control station web app.\n4. Hardware validation with Pixhawk flight controller.',
 'Python, C++, ROS2, React, WebSockets, Three.js',
 'Robotics & Automation',
 6, 'Submitted', 1, NULL, '2026-09-20 15:45:00', '2026-09-22 11:20:00'),

-- Project 5: Draft
(5, 'Collaborative Peer Mentorship & Code Review Portal',
 'An academic platform enabling senior engineering students to mentor juniors through annotated git diffs, gamified skill badges, and scheduled 1-on-1 office hours.',
 '1. Git OAuth integration.\n2. Interactive diff commenting engine.\n3. Matchmaking algorithm based on tech stack.\n4. Gamification points and leaderboard.',
 'React, TypeScript, Express, MySQL, Socket.io',
 'Web Development',
 5, 'Draft', 1, NULL, '2026-09-25 08:30:00', NULL)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 5. Insert Project Members
INSERT INTO `project_members` (`project_id`, `student_id`, `team_role`) VALUES
(1, 5, 'Team Lead & ML Engineer'),
(1, 6, 'Frontend Developer'),
(2, 7, 'Smart Contract Developer'),
(2, 9, 'Full Stack Web Developer'),
(3, 8, 'IoT Embedded Engineer & Lead'),
(3, 5, 'Data Pipeline Specialist'),
(4, 6, 'Autonomous Navigation Lead'),
(5, 5, 'Full Stack Developer')
ON DUPLICATE KEY UPDATE `team_role` = VALUES(`team_role`);

-- 6. Insert Faculty Assignments
INSERT INTO `project_assignments` (`project_id`, `faculty_id`, `assigned_by`, `assigned_at`) VALUES
(1, 2, 1, '2026-09-04 10:00:00'), -- Dr. Sharma assigned to Project 1
(1, 4, 1, '2026-09-04 10:00:00'), -- Dr. Anita assigned to Project 1
(2, 3, 1, '2026-09-08 09:30:00'), -- Prof. Patel assigned to Project 2
(3, 2, 1, '2026-08-19 14:00:00'), -- Dr. Sharma assigned to Project 3
(3, 3, 1, '2026-08-19 14:00:00')  -- Prof. Patel assigned to Project 3
ON DUPLICATE KEY UPDATE `assigned_at` = VALUES(`assigned_at`);

-- 7. Insert Review Schedules
INSERT INTO `review_schedules` (`project_id`, `stage_id`, `scheduled_by`, `scheduled_at`, `location_or_meeting_link`, `notes`, `status`) VALUES
-- Project 1 Stage 1 completed, Stage 2 upcoming
(1, 1, 1, '2026-09-10 10:30:00', 'Seminar Hall B / Google Meet: https://meet.google.com/prj-pulse-01', 'Bring slide deck and dataset sample overview.', 'Completed'),
(1, 2, 1, '2026-10-18 11:00:00', 'Lab 304, CSE Block', 'Present live API endpoints and database schema diagrams.', 'Scheduled'),

-- Project 2 Stage 1
(2, 1, 1, '2026-09-12 14:00:00', 'Room 205, IT Department', 'Prepare threat model and smart contract flowcharts.', 'Completed'),

-- Project 3 All stages completed
(3, 1, 1, '2026-08-25 10:00:00', 'Conference Hall A', 'Initial proposal evaluation.', 'Completed'),
(3, 2, 1, '2026-09-15 11:30:00', 'IoT Innovation Lab', 'Sensor hardware prototype demonstration.', 'Completed'),
(3, 3, 1, '2026-10-05 14:00:00', 'Auditorium Audi-2', 'Final working project demonstration and report submission.', 'Completed')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 8. Insert Completed Reviews
-- Review for Project 1 (Stage 1 by Dr. Sharma)
INSERT INTO `reviews` (`id`, `project_id`, `stage_id`, `reviewer_id`, `total_marks`, `percentage`, `feedback`, `strengths`, `weaknesses`, `decision`, `review_status`, `submitted_at`) VALUES
(1, 1, 1, 2, 88.00, 88.00, 
 'Excellent clinical grounding and strong motivation. Dataset preprocessing strategy is well articulated.',
 'Clear problem formulation, good understanding of convolutional architectures, comprehensive literature review.',
 'Ensure validation on external hospital test sets to prevent model overfitting.',
 'Approved', 'Submitted', '2026-09-10 11:45:00'),

-- Review for Project 2 (Stage 1 by Prof. Patel) -> Changes Required
(2, 2, 1, 3, 64.00, 64.00,
 'Interesting use of blockchain, but the threat model lacks concrete analysis of key recovery and gas costs.',
 'Innovative concept for cross-university credential issuance.',
 'Literature survey misses recent zero-knowledge rollups; smart contract gas optimization plan is missing.',
 'Changes Required', 'Submitted', '2026-09-12 15:30:00'),

-- Reviews for Project 3 (Stage 1, 2, 3 by Dr. Sharma & Prof. Patel)
(3, 3, 1, 2, 92.00, 92.00,
 'Outstanding proposal with measurable sustainability impact on college infrastructure.',
 'Feasible hardware architecture, explicit power metrics, rigorous timeline.',
 'None notable.',
 'Approved', 'Submitted', '2026-08-25 11:15:00'),

(4, 3, 2, 2, 90.00, 90.00,
 'Hardware sensors functioning reliably with MQTT broker. Database time-series partitioning looks solid.',
 'Robust hardware telemetry, low latency UI dashboard, responsive graphs.',
 'Calibrate sensor tolerance against certified laboratory power meters.',
 'Approved', 'Submitted', '2026-09-15 12:45:00'),

(5, 3, 3, 2, 92.50, 92.50,
 'Exceptional final working demo. Verified 18.2% energy savings across test classrooms. Complete documentation.',
 'Production-ready code, elegant documentation, great presentation by both team members.',
 'Minor UI responsiveness improvements on mobile screens.',
 'Approved', 'Submitted', '2026-10-05 15:30:00')
ON DUPLICATE KEY UPDATE `total_marks` = VALUES(`total_marks`);

-- 9. Insert Review Scores per criterion
-- For Review 1 (Project 1, Stage 1)
INSERT INTO `review_scores` (`review_id`, `criterion_id`, `marks_awarded`, `comments`) VALUES
(1, 1, 18.00, 'Well defined clinical objective'),
(1, 2, 17.50, 'Thorough survey of recent 2024-2025 papers'),
(1, 3, 18.00, 'Sound pipeline design with dual-backbone'),
(1, 4, 17.00, 'DICOM integration is innovative'),
(1, 5, 17.50, 'Confident presentation and Q&A'),

-- For Review 2 (Project 2, Stage 1)
(2, 1, 14.00, 'Scope is somewhat too broad'),
(2, 2, 11.00, 'Literature survey needs more decentralized identity references'),
(2, 3, 13.00, 'Smart contract architecture needs gas modeling'),
(2, 4, 13.00, 'Good concept but standard token implementation'),
(2, 5, 13.00, 'Needs clearer slides on revocation mechanism'),

-- For Review 3 (Project 3, Stage 1)
(3, 1, 19.00, 'Exceptional environmental problem definition'),
(3, 2, 18.00, 'Solid comparative analysis with existing BMS'),
(3, 3, 19.00, 'Well architected MQTT/InfluxDB design'),
(3, 4, 18.00, 'Novel dynamic load-shedding heuristic'),
(3, 5, 18.00, 'Polished presentation'),

-- For Review 4 (Project 3, Stage 2)
(4, 6, 23.00, 'ESP32 boards installed and communicating'),
(4, 7, 14.00, 'InfluxDB retention policies well tuned'),
(4, 8, 13.50, 'Grafana and custom dashboard both look clean'),
(4, 9, 22.50, 'Automated relay triggers working'),
(4, 10, 17.00, 'Met 85% of milestones on schedule'),

-- For Review 5 (Project 3, Stage 3)
(5, 11, 23.50, 'Live classroom automated shutoff demonstrated successfully'),
(5, 12, 23.00, 'Clean modular microservices code'),
(5, 13, 14.00, 'Comprehensive 72-page engineering report'),
(5, 14, 14.00, 'Clear speaker delivery and slide structure'),
(5, 15, 18.00, 'Strong intellectual contribution for campus sustainability')
ON DUPLICATE KEY UPDATE `marks_awarded` = VALUES(`marks_awarded`);

-- 10. Insert Project Documents
INSERT INTO `project_documents` (`id`, `project_id`, `uploaded_by`, `original_filename`, `stored_filename`, `file_path`, `file_size`, `mime_type`, `document_type`, `uploaded_at`) VALUES
(1, 1, 5, 'AI_Diagnostic_Proposal_v1.pdf', '1728000000000-AI_Diagnostic_Proposal_v1.pdf', 'uploads/1728000000000-AI_Diagnostic_Proposal_v1.pdf', 2451000, 'application/pdf', 'Proposal', '2026-09-03 14:35:00'),
(2, 1, 5, 'Proposal_Presentation_Deck.pptx', '1728000000001-Proposal_Presentation_Deck.pptx', 'uploads/1728000000001-Proposal_Presentation_Deck.pptx', 5120000, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'Presentation', '2026-09-08 09:00:00'),
(3, 2, 7, 'Blockchain_Credentials_Specification.pdf', '1728000000002-Blockchain_Credentials_Specification.pdf', 'uploads/1728000000002-Blockchain_Credentials_Specification.pdf', 1840000, 'application/pdf', 'Proposal', '2026-09-07 16:05:00'),
(4, 3, 8, 'SmartCampus_Final_Project_Report.pdf', '1728000000003-SmartCampus_Final_Project_Report.pdf', 'uploads/1728000000003-SmartCampus_Final_Project_Report.pdf', 8400000, 'application/pdf', 'Final Report', '2026-10-04 18:20:00')
ON DUPLICATE KEY UPDATE `original_filename` = VALUES(`original_filename`);

-- 11. Insert Sample In-App Notifications
INSERT INTO `notifications` (`user_id`, `title`, `message`, `notification_type`, `link`, `is_read`, `created_at`) VALUES
(5, 'Review 1 Approved', 'Your project "AI-Powered Medical Image Diagnostic Assistant" has passed Review 1 with 88.00 marks.', 'project_approved', '/student/projects/1', FALSE, '2026-09-10 11:45:00'),
(5, 'Review 2 Scheduled', 'Review 2: Progress Review has been scheduled for 18-Oct-2026 at 11:00 AM in Lab 304.', 'review_scheduled', '/student/schedules', FALSE, '2026-10-01 10:00:00'),
(7, 'Changes Required in Proposal', 'Reviewer Prof. Priya Patel requested revisions for "Blockchain-Based Academic Credential Verification System". Please check feedback.', 'changes_required', '/student/projects/2', FALSE, '2026-09-12 15:30:00'),
(2, 'New Project Assigned', 'You have been assigned as reviewer for "AI-Powered Medical Image Diagnostic Assistant".', 'reviewer_assignment', '/faculty/assigned', TRUE, '2026-09-04 10:00:00'),
(1, 'Project Submitted for Review', 'Student Aarav Mehta submitted project "Autonomous Drone Delivery Route Planner" for Review 1.', 'project_submission', '/admin/projects', FALSE, '2026-09-22 11:20:00');
