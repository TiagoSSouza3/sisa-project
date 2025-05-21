
-- Database: SISA

CREATE DATABASE IF NOT EXISTS sisa;
USE sisa;

-- Ocupações (Tipos de usuários)
CREATE TABLE occupation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Usuários
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    occupation_id INT,
    FOREIGN KEY (occupation_id) REFERENCES occupation(id)
);

-- Permissões configuráveis por ocupação
CREATE TABLE permission (
    id INT AUTO_INCREMENT PRIMARY KEY,
    occupation_id INT,
    can_edit_students BOOLEAN DEFAULT FALSE,
    can_edit_activities BOOLEAN DEFAULT FALSE,
    can_upload_documents BOOLEAN DEFAULT FALSE,
    can_edit_permissions BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (occupation_id) REFERENCES occupation(id)
);

-- Participantes (Alunos)
CREATE TABLE participant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    notes TEXT
);

-- Atividades (Turmas / Aulas)
CREATE TABLE activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    professor_id INT,
    FOREIGN KEY (professor_id) REFERENCES user(id)
);

-- Participantes em Atividades
CREATE TABLE activity_participant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT,
    participant_id INT,
    FOREIGN KEY (activity_id) REFERENCES activity(id),
    FOREIGN KEY (participant_id) REFERENCES participant(id)
);

-- Documentos ligados às atividades
CREATE TABLE document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT,
    title VARCHAR(100),
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_data LONGBLOB,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activity(id),
    FOREIGN KEY (created_by) REFERENCES user(id)
);
