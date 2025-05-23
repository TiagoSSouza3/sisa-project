-- Database: SISA

CREATE DATABASE IF NOT EXISTS sisa;
USE sisa;

-- Ocupações (Tipos de usuários)
CREATE TABLE occupation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name ENUM('Administrador', 'Colaborador', 'Professor') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Usuários
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    occupation_id ENUM('Administrador', 'Colaborador', 'Professor')
);

-- Permissões configuráveis por ocupação
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    occupation_id INT,
    can_edit_subjects BOOLEAN DEFAULT FALSE,
    can_edit_activities BOOLEAN DEFAULT FALSE,
    can_upload_documents BOOLEAN DEFAULT FALSE,
    can_edit_permissions BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (occupation_id) REFERENCES occupation(id)
);

-- Estudantes
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255),
    birth_date DATE,
    address TEXT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Disciplinas/Matérias
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    professor_id INT,
    FOREIGN KEY (professor_id) REFERENCES user(id)
);

-- Documentos
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT,
    title VARCHAR(255),
    file_name VARCHAR(255),
    file_type VARCHAR(255),
    file_data LONGBLOB,
    created_by INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (created_by) REFERENCES user(id)
);

-- Inserir ocupações padrão
INSERT INTO occupation (name) VALUES
    ('Administrador'),
    ('Colaborador'),
    ('Professor');
