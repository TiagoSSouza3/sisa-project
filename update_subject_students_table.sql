-- Script para atualizar a tabela subject_students existente
-- Adiciona o campo createdAt se ele não existir

-- Verificar se a coluna createdAt já existe
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'subject_students'
    AND COLUMN_NAME = 'createdAt'
);

-- Adicionar a coluna createdAt se ela não existir
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE subject_students ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER students_id',
    'SELECT "Coluna createdAt já existe" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Atualizar registros existentes que não têm createdAt definido
UPDATE subject_students 
SET createdAt = CURRENT_TIMESTAMP 
WHERE createdAt IS NULL;

-- Verificar o resultado
SELECT 'Tabela subject_students atualizada com sucesso' as message;
