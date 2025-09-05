-- Database: SISA

CREATE DATABASE IF NOT EXISTS sisa;
USE sisa;

-- Ocupações (Tipos de usuários)
CREATE TABLE IF NOT EXISTS occupation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name ENUM('Administrador', 'Colaborador', 'Professor') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Usuários
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    occupation_id INT,
    first_login BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255) NULL,
    reset_token_expires TIMESTAMP NULL,
    FOREIGN KEY (occupation_id) REFERENCES occupation(id)
);

-- Permissões configuráveis por ocupação
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    occupation_id INT,
    can_edit_subjects BOOLEAN DEFAULT FALSE,
    can_edit_activities BOOLEAN DEFAULT FALSE,
    can_upload_documents BOOLEAN DEFAULT FALSE,
    can_edit_permissions BOOLEAN DEFAULT FALSE,
    can_manage_templates BOOLEAN DEFAULT FALSE,
    can_view_documents BOOLEAN DEFAULT FALSE,
    can_edit_documents BOOLEAN DEFAULT FALSE,
    can_delete_documents BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (occupation_id) REFERENCES occupation(id)
);

-- Estudantes
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration INT,
    CPF CHAR(15),
    gender VARCHAR(50),
    skin_color VARCHAR(50),
    RG CHAR(12),
    email VARCHAR(255),
    phone VARCHAR(255),
    second_phone VARCHAR(255),
    responsable VARCHAR(255),
    degree_of_kinship VARCHAR(255),
    UBS VARCHAR(255),
    is_on_school BOOLEAN,
    school_year VARCHAR(50),
    school_name VARCHAR(255),
    school_period VARCHAR(50),
    birth_date DATE,
    address TEXT,
    neighborhood TEXT,
    cep CHAR(9),
    notes TEXT,
    parent_id INT,
    second_parent_id INT,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_id) REFERENCES parent(id),
    FOREIGN KEY (second_parent_id) REFERENCES parent(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Parent
CREATE TABLE IF NOT EXISTS parent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birth_date DATE,
    RG CHAR(12),
    CPF CHAR(15),
    occupation VARCHAR(255)
);


-- Disciplinas/Matérias
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    professor_id INT,
    FOREIGN KEY (professor_id) REFERENCES user(id)
);

-- Professores das Disciplinas
CREATE TABLE IF NOT EXISTS subject_professor (
    subject_id INT,
    professor_id INT,
    PRIMARY KEY (subject_id, professor_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Students to Subjects
CREATE TABLE IF NOT EXISTS subject_students (
    subject_id INT,
    students_id INT,
    PRIMARY KEY (subject_id, students_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (students_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Templates de Documentos
CREATE TABLE IF NOT EXISTS document_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    structure JSON NOT NULL, -- Estrutura do template em formato JSON
    created_by INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(id)
);

-- Campos Editáveis dos Templates
CREATE TABLE IF NOT EXISTS template_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT,
    field_name VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'number', 'date', 'select', 'textarea') NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    field_options JSON, -- Para campos do tipo select
    default_value TEXT,
    FOREIGN KEY (template_id) REFERENCES document_templates(id)
);

-- Permissões de Edição de Campos
CREATE TABLE IF NOT EXISTS field_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT,
    occupation_id INT,
    field_id INT,
    can_edit BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (template_id) REFERENCES document_templates(id),
    FOREIGN KEY (occupation_id) REFERENCES occupation(id),
    FOREIGN KEY (field_id) REFERENCES template_fields(id)
);

-- Modificar a tabela documents existente
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT,
    template_id INT,
    title VARCHAR(255),
    file_name VARCHAR(255),
    file_type VARCHAR(255),
    file_data LONGBLOB,
    content JSON, -- Conteúdo do documento baseado no template
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    version INT DEFAULT 1,
    created_by INT,
    last_modified_by INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (template_id) REFERENCES document_templates(id),
    FOREIGN KEY (created_by) REFERENCES user(id),
    FOREIGN KEY (last_modified_by) REFERENCES user(id)
);

-- Histórico de Versões dos Documentos
CREATE TABLE IF NOT EXISTS document_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT,
    version INT,
    content JSON,
    modified_by INT,
    modification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (modified_by) REFERENCES user(id)
);

-- Dados Resumidos
CREATE TABLE IF NOT EXISTS summary_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    students_active INT,
    students_total INT,
    students_male INT,
    students_female INT,
    students_family_income INT,
    students_with_NIS INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_layouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  placeholders TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS storage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  last_price DECIMAL(10, 2),
  last_price_date DATE,
  amount INT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS storage_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_item INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  last_price DECIMAL(10, 2),
  last_price_date DATE,
  last_change TEXT,
  amount INT,
  value_diference INT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);

-- Inserir ocupações padrão
INSERT INTO occupation (name) VALUES
    ('Administrador'),
    ('Colaborador'),
    ('Professor');

INSERT INTO user (id, name, email, password, occupation_id, first_login, reset_token, reset_token_expires) VALUES 
(1, "Tiago Dos Santos Souza", "tirigopeixe@gmail.com", "$2b$10$Q2WnzVrpRLs.uEDSgZ2WxOn1mPF0eu4aVlZ.Ix2Sy6qxDKnJ/jO8K", 1, FALSE, NULL, NULL),
(2, 'Felipe souza', 'felipe20@gmail.com', '$2b$10$ENLkVCRPlF13TsPpFzRjCeUbUsc35uDAY2PTpKShRpn19b6/wN5fi', 3, FALSE, NULL, NULL),
(3, 'Rosana', 'rosanamssouza9@gmail.com', '$2b$10$S20LoNUde/3rcHsaIC3mb.1U70JTLzyPcJGpcD6P0hlMUvb5lNOcG', 2, FALSE, NULL, NULL);

-- Atualizar permissões do Administrador
UPDATE permissions 
SET can_manage_templates = TRUE,
    can_view_documents = TRUE,
    can_edit_documents = TRUE,
    can_delete_documents = TRUE
WHERE occupation_id = (SELECT id FROM occupation WHERE name = 'Administrador');

ALTER TABLE documents ADD COLUMN placeholders JSON;
ALTER TABLE documents MODIFY COLUMN status ENUM('draft', 'published', 'archived', 'template') DEFAULT 'draft';


SELECT * FROM students;