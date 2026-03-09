
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
    FOREIGN KEY (occupation_id) REFERENCES occupation(id),
    INDEX idx_occupation (occupation_id),
    INDEX idx_email (email)
);

-- Parent
CREATE TABLE IF NOT EXISTS parent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birth_date DATE,
    RG CHAR(12),
    CPF CHAR(15),
    occupation VARCHAR(255),
    phone VARCHAR(255),
    degree_of_kinship VARCHAR(255)
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
    responsible_parent_id INT,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_id) REFERENCES parent(id),
    FOREIGN KEY (second_parent_id) REFERENCES parent(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (active),
    INDEX idx_parent (parent_id)
);

-- Disciplinas/Matérias
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    professor_id INT,
    FOREIGN KEY (professor_id) REFERENCES user(id),
    INDEX idx_professor (professor_id)
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
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT,
    students_id INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (students_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Templates de Documentos
CREATE TABLE IF NOT EXISTS document_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    structure JSON NOT NULL,
    created_by INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(id),
    INDEX idx_created_by (created_by)
);

-- Campos Editáveis dos Templates
CREATE TABLE IF NOT EXISTS template_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT,
    field_name VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'number', 'date', 'select', 'textarea') NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    field_options JSON,
    default_value TEXT,
    FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE CASCADE,
    INDEX idx_template (template_id)
);

-- Permissões de Edição de Campos
CREATE TABLE IF NOT EXISTS field_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT,
    occupation_id INT,
    field_id INT,
    can_edit BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (occupation_id) REFERENCES occupation(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES template_fields(id) ON DELETE CASCADE,
    INDEX idx_template_occupation (template_id, occupation_id)
);

-- Documentos
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT,
    template_id INT,
    title VARCHAR(255),
    file_name VARCHAR(255),
    file_type VARCHAR(255),
    file_data LONGBLOB,
    content JSON,
    placeholders JSON,
    status ENUM('draft', 'published', 'archived', 'template') DEFAULT 'draft',
    version INT DEFAULT 1,
    created_by INT,
    last_modified_by INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE SET NULL,
    FOREIGN KEY (last_modified_by) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_subject (subject_id),
    INDEX idx_template (template_id),
    INDEX idx_created_by (created_by),
    INDEX idx_status (status)
);

-- Histórico de Versões dos Documentos
CREATE TABLE IF NOT EXISTS document_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT,
    version INT,
    content JSON,
    modified_by INT,
    modification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (modified_by) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_document_version (document_id, version)
);

-- Document Layouts
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

-- All Documents (documentos gerais)
CREATE TABLE IF NOT EXISTS all_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at),
    INDEX idx_mime_type (mime_type)
);


-- Tabela para permissões globais de documentos por role
CREATE TABLE IF NOT EXISTS global_document_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('professor', 'colaborador') NOT NULL,
    can_view_documents BOOLEAN DEFAULT TRUE,
    can_edit_documents BOOLEAN DEFAULT FALSE,
    can_upload_documents BOOLEAN DEFAULT FALSE,
    can_view_layouts BOOLEAN DEFAULT TRUE,
    can_edit_layouts BOOLEAN DEFAULT FALSE,
    can_upload_layouts BOOLEAN DEFAULT FALSE,
    can_view_all_documents BOOLEAN DEFAULT TRUE,
    can_edit_all_documents BOOLEAN DEFAULT FALSE,
    can_upload_all_documents BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role (role)
);

-- Permissões específicas para documentos (documents)
CREATE TABLE IF NOT EXISTS document_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    user_role ENUM('professor', 'colaborador') NOT NULL,
    can_view BOOLEAN DEFAULT NULL,
    can_edit BOOLEAN DEFAULT NULL,
    can_download BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_document_role (document_id, user_role),
    INDEX idx_document (document_id),
    INDEX idx_role (user_role)
);

-- Permissões específicas para layouts
CREATE TABLE IF NOT EXISTS layout_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    layout_id INT NOT NULL,
    user_role ENUM('professor', 'colaborador') NOT NULL,
    can_view BOOLEAN DEFAULT NULL,
    can_edit BOOLEAN DEFAULT NULL,
    can_use BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (layout_id) REFERENCES document_layouts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_layout_role (layout_id, user_role),
    INDEX idx_layout (layout_id),
    INDEX idx_role (user_role)
);

-- Permissões específicas para all_documents
CREATE TABLE IF NOT EXISTS all_document_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    user_role ENUM('professor', 'colaborador') NOT NULL,
    can_view BOOLEAN DEFAULT NULL,
    can_edit BOOLEAN DEFAULT NULL,
    can_download BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES all_documents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_all_document_role (document_id, user_role),
    INDEX idx_document (document_id),
    INDEX idx_role (user_role)
);


-- Sistema de permissões baseado em usuários individuais
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    can_access_dashboard BOOLEAN DEFAULT TRUE,
    can_access_users BOOLEAN DEFAULT FALSE,
    can_access_students BOOLEAN DEFAULT FALSE,
    can_access_subjects BOOLEAN DEFAULT FALSE,
    can_access_documents BOOLEAN DEFAULT FALSE,
    can_access_storage BOOLEAN DEFAULT FALSE,
    can_access_summary_data BOOLEAN DEFAULT FALSE,
    can_view_documents BOOLEAN DEFAULT FALSE,
    can_edit_documents BOOLEAN DEFAULT FALSE,
    can_upload_documents BOOLEAN DEFAULT FALSE,
    can_view_layouts BOOLEAN DEFAULT FALSE,
    can_edit_layouts BOOLEAN DEFAULT FALSE,
    can_upload_layouts BOOLEAN DEFAULT FALSE,
    document_view_roles JSON,
    document_edit_roles JSON,
    document_upload_roles JSON,
    layout_view_roles JSON,
    layout_edit_roles JSON,
    layout_upload_roles JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS granular_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    restricted_layouts JSON,
    restricted_documents JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(user_id, user_role),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user_role (user_id, user_role)
);


CREATE TABLE IF NOT EXISTS global_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(100) NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    is_allowed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role_permission (role, permission_name),
    INDEX idx_role (role)
);


-- Storage
CREATE TABLE IF NOT EXISTS storage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    last_price DECIMAL(10, 2),
    last_price_date TIMESTAMP,
    amount INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);

-- Storage Log
CREATE TABLE IF NOT EXISTS storage_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_item INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    last_price DECIMAL(10, 2),
    last_price_date TIMESTAMP,
    last_change TEXT,
    amount INT,
    value_diference INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at),
    INDEX idx_id_item (id_item)
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

-- Inserir ocupações padrão
INSERT INTO occupation (name) VALUES
    ('Administrador'),
    ('Colaborador'),
    ('Professor')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Inserir usuários padrão
INSERT INTO user (id, name, email, password, occupation_id, first_login, reset_token, reset_token_expires) VALUES 
(1, "Tiago Dos Santos Souza", "tirigopeixe@gmail.com", "$2b$10$Q2WnzVrpRLs.uEDSgZ2WxOn1mPF0eu4aVlZ.Ix2Sy6qxDKnJ/jO8K", 1, FALSE, NULL, NULL),
(2, 'Felipe souza', 'felipe20@gmail.com', '$2b$10$ENLkVCRPlF13TsPpFzRjCeUbUsc35uDAY2PTpKShRpn19b6/wN5fi', 3, FALSE, NULL, NULL),
(3, 'Rosana', 'rosanamssouza9@gmail.com', '$2b$10$S20LoNUde/3rcHsaIC3mb.1U70JTLzyPcJGpcD6P0hlMUvb5lNOcG', 2, FALSE, NULL, NULL)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    email = VALUES(email),
    password = VALUES(password),
    occupation_id = VALUES(occupation_id);


-- Inserir permissões globais padrão para professores
INSERT INTO global_document_permissions (role, can_view_documents, can_edit_documents, can_upload_documents, can_view_layouts, can_edit_layouts, can_upload_layouts, can_view_all_documents, can_edit_all_documents, can_upload_all_documents) 
VALUES 
    ('professor', TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE),
    ('colaborador', TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE)
ON DUPLICATE KEY UPDATE
    can_view_documents = VALUES(can_view_documents),
    can_edit_documents = VALUES(can_edit_documents),
    can_upload_documents = VALUES(can_upload_documents),
    can_view_layouts = VALUES(can_view_layouts),
    can_edit_layouts = VALUES(can_edit_layouts),
    can_upload_layouts = VALUES(can_upload_layouts),
    can_view_all_documents = VALUES(can_view_all_documents),
    can_edit_all_documents = VALUES(can_edit_all_documents),
    can_upload_all_documents = VALUES(can_upload_all_documents);


-- Criar permissões padrão para administradores existentes
INSERT INTO permissions (
    user_id, 
    can_access_dashboard, 
    can_access_users, 
    can_access_students, 
    can_access_subjects, 
    can_access_documents, 
    can_access_storage, 
    can_access_summary_data,
    can_view_documents,
    can_edit_documents,
    can_upload_documents,
    can_view_layouts,
    can_edit_layouts,
    can_upload_layouts,
    document_view_roles,
    document_edit_roles,
    document_upload_roles,
    layout_view_roles,
    layout_edit_roles,
    layout_upload_roles
)
SELECT 
    id,
    TRUE,  -- can_access_dashboard
    TRUE,  -- can_access_users
    TRUE,  -- can_access_students
    TRUE,  -- can_access_subjects
    TRUE,  -- can_access_documents
    TRUE,  -- can_access_storage
    TRUE,  -- can_access_summary_data
    TRUE,  -- can_view_documents
    TRUE,  -- can_edit_documents
    TRUE,  -- can_upload_documents
    TRUE,  -- can_view_layouts
    TRUE,  -- can_edit_layouts
    TRUE,  -- can_upload_layouts
    JSON_ARRAY('professor', 'colaborador'), -- document_view_roles
    JSON_ARRAY('professor', 'colaborador'), -- document_edit_roles
    JSON_ARRAY('professor', 'colaborador'), -- document_upload_roles
    JSON_ARRAY('professor', 'colaborador'), -- layout_view_roles
    JSON_ARRAY('professor', 'colaborador'), -- layout_edit_roles
    JSON_ARRAY('professor', 'colaborador')  -- layout_upload_roles
FROM user 
WHERE occupation_id = 1 -- Administradores
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

-- Criar permissões padrão para colaboradores existentes
INSERT INTO permissions (
    user_id, 
    can_access_dashboard, 
    can_access_users, 
    can_access_students, 
    can_access_subjects, 
    can_access_documents, 
    can_access_storage, 
    can_access_summary_data,
    can_view_documents,
    can_edit_documents,
    can_upload_documents,
    can_view_layouts,
    can_edit_layouts,
    can_upload_layouts,
    document_view_roles,
    document_edit_roles,
    document_upload_roles,
    layout_view_roles,
    layout_edit_roles,
    layout_upload_roles
)
SELECT 
    id,
    TRUE,  -- can_access_dashboard
    FALSE, -- can_access_users (ÚNICA PÁGINA NEGADA)
    TRUE,  -- can_access_students
    TRUE,  -- can_access_subjects
    TRUE,  -- can_access_documents
    TRUE,  -- can_access_storage
    TRUE,  -- can_access_summary_data
    TRUE,  -- can_view_documents
    TRUE,  -- can_edit_documents
    TRUE,  -- can_upload_documents
    TRUE,  -- can_view_layouts
    TRUE,  -- can_edit_layouts
    TRUE,  -- can_upload_layouts
    JSON_ARRAY('colaborador'), -- document_view_roles
    JSON_ARRAY('colaborador'), -- document_edit_roles
    JSON_ARRAY('colaborador'), -- document_upload_roles
    JSON_ARRAY('colaborador'), -- layout_view_roles
    JSON_ARRAY('colaborador'), -- layout_edit_roles
    JSON_ARRAY('colaborador')  -- layout_upload_roles
FROM user 
WHERE occupation_id = 2 -- Colaboradores
AND id NOT IN (SELECT user_id FROM permissions WHERE user_id IS NOT NULL)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

-- Criar permissões padrão para professores existentes
INSERT INTO permissions (
    user_id, 
    can_access_dashboard, 
    can_access_users, 
    can_access_students, 
    can_access_subjects, 
    can_access_documents, 
    can_access_storage, 
    can_access_summary_data,
    can_view_documents,
    can_edit_documents,
    can_upload_documents,
    can_view_layouts,
    can_edit_layouts,
    can_upload_layouts,
    document_view_roles,
    document_edit_roles,
    document_upload_roles,
    layout_view_roles,
    layout_edit_roles,
    layout_upload_roles
)
SELECT 
    id,
    TRUE,  -- can_access_dashboard
    FALSE, -- can_access_users (NEGADO)
    FALSE, -- can_access_students (NEGADO)
    TRUE,  -- can_access_subjects
    TRUE,  -- can_access_documents
    FALSE, -- can_access_storage (NEGADO)
    TRUE,  -- can_access_summary_data
    TRUE,  -- can_view_documents
    TRUE,  -- can_edit_documents
    TRUE,  -- can_upload_documents
    TRUE,  -- can_view_layouts
    TRUE,  -- can_edit_layouts
    TRUE,  -- can_upload_layouts
    JSON_ARRAY('professor'), -- document_view_roles
    JSON_ARRAY('professor'), -- document_edit_roles
    JSON_ARRAY('professor'), -- document_upload_roles
    JSON_ARRAY('professor'), -- layout_view_roles
    JSON_ARRAY('professor'), -- layout_edit_roles
    JSON_ARRAY('professor')  -- layout_upload_roles
FROM user 
WHERE occupation_id = 3 -- Professores
AND id NOT IN (SELECT user_id FROM permissions WHERE user_id IS NOT NULL)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);
