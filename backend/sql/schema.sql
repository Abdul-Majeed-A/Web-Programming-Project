-- ProjectPulse Database Schema
-- Software Project Review and Evaluation System
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS `projectpulse` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `projectpulse`;

-- Drop existing tables if needed (in reverse dependency order)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `review_scores`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `review_schedules`;
DROP TABLE IF EXISTS `review_criteria`;
DROP TABLE IF EXISTS `review_stages`;
DROP TABLE IF EXISTS `project_documents`;
DROP TABLE IF EXISTS `project_assignments`;
DROP TABLE IF EXISTS `project_members`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'faculty', 'admin') NOT NULL,
  `department` VARCHAR(100) NOT NULL DEFAULT 'Computer Science & Engineering',
  `student_or_faculty_identifier` VARCHAR(50) NULL,
  `account_status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Review Stages table
CREATE TABLE `review_stages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `stage_name` VARCHAR(100) NOT NULL,
  `stage_order` INT NOT NULL,
  `description` TEXT NULL,
  `weightage` DECIMAL(5,2) DEFAULT 33.33,
  `is_active` BOOLEAN DEFAULT TRUE,
  UNIQUE KEY `uq_stage_order` (`stage_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Projects table
CREATE TABLE `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `objectives` TEXT NOT NULL,
  `technology_stack` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Web Development',
  `created_by` INT NOT NULL,
  `status` ENUM('Draft', 'Submitted', 'Under Review', 'Changes Required', 'Resubmitted', 'Approved', 'Rejected') DEFAULT 'Draft',
  `current_stage_id` INT NOT NULL DEFAULT 1,
  `final_score` DECIMAL(5,2) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `submitted_at` TIMESTAMP NULL,
  CONSTRAINT `fk_projects_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_projects_stage` FOREIGN KEY (`current_stage_id`) REFERENCES `review_stages` (`id`),
  INDEX `idx_projects_status` (`status`),
  INDEX `idx_projects_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Project Members table
CREATE TABLE `project_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `team_role` VARCHAR(100) DEFAULT 'Member',
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_members_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_members_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  UNIQUE KEY `uq_project_student` (`project_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Project Faculty Assignments table
CREATE TABLE `project_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `faculty_id` INT NOT NULL,
  `assigned_by` INT NOT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_assignments_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_assignments_admin` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  UNIQUE KEY `uq_project_faculty` (`project_id`, `faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Review Criteria table
CREATE TABLE `review_criteria` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `stage_id` INT NOT NULL,
  `criterion_name` VARCHAR(150) NOT NULL,
  `maximum_marks` INT NOT NULL,
  `display_order` INT NOT NULL,
  CONSTRAINT `fk_criteria_stage` FOREIGN KEY (`stage_id`) REFERENCES `review_stages` (`id`) ON DELETE CASCADE,
  INDEX `idx_criteria_stage` (`stage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Review Schedules table
CREATE TABLE `review_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `stage_id` INT NOT NULL,
  `scheduled_by` INT NOT NULL,
  `scheduled_at` DATETIME NOT NULL,
  `location_or_meeting_link` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `status` ENUM('Scheduled', 'Completed', 'Rescheduled', 'Cancelled') DEFAULT 'Scheduled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_schedules_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedules_stage` FOREIGN KEY (`stage_id`) REFERENCES `review_stages` (`id`),
  CONSTRAINT `fk_schedules_admin` FOREIGN KEY (`scheduled_by`) REFERENCES `users` (`id`),
  INDEX `idx_schedules_project` (`project_id`),
  INDEX `idx_schedules_date` (`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Reviews table
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `stage_id` INT NOT NULL,
  `reviewer_id` INT NOT NULL,
  `total_marks` DECIMAL(5,2) DEFAULT 0.00,
  `percentage` DECIMAL(5,2) DEFAULT 0.00,
  `feedback` TEXT NULL,
  `strengths` TEXT NULL,
  `weaknesses` TEXT NULL,
  `decision` ENUM('Approved', 'Changes Required', 'Rejected') NULL,
  `review_status` ENUM('Draft', 'Submitted') DEFAULT 'Draft',
  `submitted_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_stage` FOREIGN KEY (`stage_id`) REFERENCES `review_stages` (`id`),
  CONSTRAINT `fk_reviews_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  UNIQUE KEY `uq_review_per_stage` (`project_id`, `stage_id`, `reviewer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Review Scores table
CREATE TABLE `review_scores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `review_id` INT NOT NULL,
  `criterion_id` INT NOT NULL,
  `marks_awarded` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `comments` VARCHAR(255) NULL,
  CONSTRAINT `fk_scores_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_scores_criterion` FOREIGN KEY (`criterion_id`) REFERENCES `review_criteria` (`id`),
  UNIQUE KEY `uq_score_review_criterion` (`review_id`, `criterion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Project Documents table
CREATE TABLE `project_documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `uploaded_by` INT NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_size` INT NOT NULL,
  `mime_type` VARCHAR(100) NULL,
  `document_type` ENUM('Proposal', 'Progress Report', 'Final Report', 'Presentation', 'Code Archive', 'Other') DEFAULT 'Proposal',
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_docs_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_docs_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`),
  INDEX `idx_docs_project` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Notifications table
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `notification_type` ENUM('project_submission', 'reviewer_assignment', 'review_scheduled', 'review_completed', 'changes_required', 'project_approved', 'project_rejected', 'project_resubmitted', 'general') DEFAULT 'general',
  `link` VARCHAR(255) NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
