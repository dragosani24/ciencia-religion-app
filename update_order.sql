-- Actualizar el campo order para que sea secuencial dentro de cada capítulo
SET @row_number = 0;
SET @current_chapter = 0;

UPDATE paragraphs p
JOIN (
  SELECT 
    id,
    @row_number := IF(@current_chapter = chapter_id, @row_number + 1, 0) AS new_order,
    @current_chapter := chapter_id AS chapter_id
  FROM paragraphs
  ORDER BY chapter_id, id
) AS ranked ON p.id = ranked.id
SET p.`order` = ranked.new_order;
