-- Aadhi Movies & Series Database Schema
-- Run this in your MySQL server:
-- CREATE DATABASE IF NOT EXISTS aadhi_watchlog;
-- USE aadhi_watchlog;

CREATE TABLE IF NOT EXISTS languages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('movie', 'series') NOT NULL,
  name VARCHAR(100) NOT NULL,
  CONSTRAINT unique_category_name UNIQUE (category, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS titles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('movie', 'series') NOT NULL,
  language_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  year VARCHAR(4) DEFAULT NULL,
  director VARCHAR(150) DEFAULT NULL,
  actor VARCHAR(150) DEFAULT NULL,
  actress VARCHAR(150) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Seed Data
INSERT INTO languages (category, name) VALUES 
('movie', 'Tamil'),
('movie', 'Telugu'),
('movie', 'Hindi'),
('movie', 'English'),
('series', 'English'),
('series', 'Tamil')
ON DUPLICATE KEY UPDATE name=name;

-- Sample Movie titles
INSERT INTO titles (category, language_id, name, year, director, actor, actress) VALUES
('movie', (SELECT id FROM languages WHERE category='movie' AND name='Tamil' LIMIT 1), 'Vikram', '2022', 'Lokesh Kanagaraj', 'Kamal Haasan', NULL),
('movie', (SELECT id FROM languages WHERE category='movie' AND name='Tamil' LIMIT 1), 'Nayakan', '1987', 'Mani Ratnam', 'Kamal Haasan', 'Saranya'),
('movie', (SELECT id FROM languages WHERE category='movie' AND name='Tamil' LIMIT 1), 'Sivaji: The Boss', '2007', 'S. Shankar', 'Rajinikanth', 'Shriya Saran'),
('movie', (SELECT id FROM languages WHERE category='movie' AND name='English' LIMIT 1), 'Interstellar', '2014', 'Christopher Nolan', 'Matthew McConaughey', 'Anne Hathaway'),
('movie', (SELECT id FROM languages WHERE category='movie' AND name='English' LIMIT 1), 'Inception', '2010', 'Christopher Nolan', 'Leonardo DiCaprio', 'Marion Cotillard');

-- Sample Series titles
INSERT INTO titles (category, language_id, name, year, director, actor, actress) VALUES
('series', (SELECT id FROM languages WHERE category='series' AND name='English' LIMIT 1), 'Breaking Bad', '2008', 'Vince Gilligan', 'Bryan Cranston', 'Anna Gunn'),
('series', (SELECT id FROM languages WHERE category='series' AND name='English' LIMIT 1), 'Severance', '2022', 'Ben Stiller', 'Adam Scott', 'Patricia Arquette');
