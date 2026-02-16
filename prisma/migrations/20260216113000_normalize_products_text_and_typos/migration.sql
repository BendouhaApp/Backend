-- Normalize product names/descriptions for French text quality.
-- Fixes encoding artifacts and common spelling mistakes.

CREATE OR REPLACE FUNCTION normalize_product_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  value TEXT := COALESCE(input_text, '');
BEGIN
  value := btrim(regexp_replace(value, '\s+', ' ', 'g'));

  -- Encoding artifacts from bad import pipelines.
  value := replace(value, chr(195) || chr(169), chr(233));
  value := replace(value, chr(194) || chr(176), chr(176));
  value := replace(value, chr(194), '');

  -- Common typo corrections.
  value := regexp_replace(value, '\mapplqiue\M', 'applique', 'gi');
  value := regexp_replace(value, '\malluminium\M', 'aluminium', 'gi');
  value := regexp_replace(value, '\mobdjectif\M', 'objectif', 'gi');
  value := regexp_replace(value, '\mruning\M', 'running', 'gi');
  value := regexp_replace(value, '\madesif\M', 'adh' || chr(233) || 'sif', 'gi');
  value := regexp_replace(value, '\mdetecteur\M', 'd' || chr(233) || 'tecteur', 'gi');
  value := regexp_replace(value, '\mantene\M', 'antenne', 'gi');
  value := regexp_replace(value, '\micline\M', 'inclin' || chr(233), 'gi');
  value := regexp_replace(value, '\metanche\M', chr(233) || 'tanche', 'gi');

  IF value = '' THEN
    RETURN value;
  END IF;

  RETURN upper(left(value, 1)) || substr(value, 2);
END;
$$;

UPDATE products
SET
  product_name = normalize_product_text(product_name),
  short_description = normalize_product_text(short_description),
  product_description = normalize_product_text(product_description);

DROP FUNCTION normalize_product_text(TEXT);
