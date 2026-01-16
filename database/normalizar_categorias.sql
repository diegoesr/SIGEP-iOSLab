-- Script para normalizar las categorías en la base de datos
-- Este script actualiza todas las categorías inconsistentes

USE labios_db;

-- Normalizar Periférico a Periféricos
UPDATE equipos SET tipo = 'Periféricos' WHERE tipo = 'Periférico';

-- Normalizar Tablet e Ipad a iPad
UPDATE equipos SET tipo = 'iPad' WHERE tipo = 'Tablet' OR tipo = 'Ipad';

-- Verificar que solo existan las 4 categorías correctas
SELECT tipo, COUNT(*) as cantidad 
FROM equipos 
GROUP BY tipo 
ORDER BY tipo;
