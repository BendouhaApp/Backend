-- Assign real local photos for categories/subcategories based on business naming.
-- Images are served from Frontend/public/images/categories/real.

UPDATE categories
SET image = CASE category_name
  -- Main categories
  WHEN 'APPLIQUES' THEN '/images/categories/real/appliques.jpg'
  WHEN 'LUSTRES' THEN '/images/categories/real/lustre-led.jpg'
  WHEN 'LAMPES' THEN '/images/categories/real/gu10.jpg'
  WHEN 'EXTERIEUR' THEN '/images/categories/real/jardin.jpg'
  WHEN 'POTEAUX' THEN '/images/categories/real/jardin.jpg'
  WHEN 'HUBLOTS' THEN '/images/categories/real/hublot.jpg'
  WHEN 'DOWNLIGHTS' THEN '/images/categories/real/downlight-haut-gamme.jpg'
  WHEN 'ECLAIRAGE LED' THEN '/images/categories/real/led-decoratif.jpg'
  WHEN 'RAILS' THEN '/images/categories/real/rail.jpg'
  WHEN 'SUSPENDUS' THEN '/images/categories/real/suspendu-led.jpg'
  WHEN 'SPOTS' THEN '/images/categories/real/spot.jpg'
  WHEN 'RUBANS LED' THEN '/images/categories/real/ruban-led.jpg'
  WHEN 'TRACK LIGHT MAGNETIQUE' THEN '/images/categories/real/track-magnetique.jpg'

  -- Subcategories
  WHEN 'APPLIQUE EXTERIEURE ETANCHE' THEN '/images/categories/real/spot-etanche.jpg'
  WHEN 'APPLIQUE LISEUSE ET INTERRUPTEUR' THEN '/images/categories/real/liseuse.jpg'
  WHEN 'APPLIQUE MURALE A BOULE' THEN '/images/categories/real/applique-boule.jpg'
  WHEN 'LUSTRE A BOULES' THEN '/images/categories/real/lustres-boules.jpg'
  WHEN 'LUSTRE CUISINE' THEN '/images/categories/real/lustre-cuisine.jpg'
  WHEN 'LUSTRE LED' THEN '/images/categories/real/lustre-led.jpg'
  WHEN 'LUSTRE PLAFONNIER' THEN '/images/categories/real/plafonnier.jpg'
  WHEN 'LAMPE GU10' THEN '/images/categories/real/gu10.jpg'
  WHEN 'POTEAU DE JARDIN' THEN '/images/categories/real/jardin.jpg'
  WHEN 'HUBLOT PLASTIQUE' THEN '/images/categories/real/hublot.jpg'
  WHEN 'RAIL PROFIL' THEN '/images/categories/real/rail.jpg'
  WHEN 'RAIL PROJECTEUR 220V' THEN '/images/categories/real/rail.jpg'
  WHEN 'SUSPENDU BOULE' THEN '/images/categories/real/suspendu-boule.jpg'
  WHEN 'SUSPENDU LED' THEN '/images/categories/real/suspendu-led.jpg'
  WHEN 'SPOT 3D' THEN '/images/categories/real/spot.jpg'
  WHEN 'SPOT ANTI EBLOUISSEMENT' THEN '/images/categories/real/spot.jpg'
  WHEN 'SPOT APPARENT' THEN '/images/categories/real/spot.jpg'
  WHEN 'SPOT COB' THEN '/images/categories/real/spot-cob.jpg'
  WHEN 'SPOT ETANCHE IP40' THEN '/images/categories/real/spot-etanche.jpg'
  WHEN 'SPOT MURAL OU ESCALIER' THEN '/images/categories/real/spot-escalier.jpg'
  WHEN 'SPOTS ET DOWNLIGHTS HAUT DE GAMME' THEN '/images/categories/real/downlight-haut-gamme.jpg'
  WHEN 'LED DECORATIF' THEN '/images/categories/real/led-decoratif.jpg'
  WHEN 'PROFIL LED' THEN '/images/categories/real/profil-led.jpg'
  WHEN 'RAIL TRACK LIGHT MAGNETIQUE' THEN '/images/categories/real/track-magnetique.jpg'
  WHEN 'TRACK LIGHT MAGNETIQUE ENCASTRE ET APPARENT' THEN '/images/categories/real/track-magnetique.jpg'
  WHEN 'TRACK LIGHT MAGNETIQUE SLIM' THEN '/images/categories/real/track-slim.jpg'
  WHEN 'TRACK SLIM 2EME MODELES' THEN '/images/categories/real/track-slim.jpg'

  ELSE image
END;

-- Safety net: inherit parent image when a subcategory has no image.
UPDATE categories child
SET image = parent.image
FROM categories parent
WHERE child.parent_id = parent.id
  AND (child.image IS NULL OR btrim(child.image) = '');

-- Last fallback to defaults.
UPDATE categories
SET image = '/images/categories/default-subcategory.svg'
WHERE parent_id IS NOT NULL
  AND (image IS NULL OR btrim(image) = '');

UPDATE categories
SET image = '/images/categories/default-category.svg'
WHERE parent_id IS NULL
  AND (image IS NULL OR btrim(image) = '');
