-- Seed communes from Yalidine "Nos agences" (Wilaya/Commune columns)
-- Source: https://www.yalidine.com/nos-agences/
WITH source(wilaya_code, wilaya_slug, commune_slug, commune_display_name) AS (
VALUES
  (1, 'adrar', 'adrar', 'Adrar'),
  (2, 'chlef', 'chlef', 'Chlef'),
  (2, 'chlef', 'tenes', 'Ténès'),
  (3, 'laghouat', 'aflou', 'Aflou'),
  (3, 'laghouat', 'laghouat', 'Laghouat'),
  (4, 'oum-el-bouaghi', 'ain-mlila', 'Aïn M''lila'),
  (4, 'oum-el-bouaghi', 'oum-el-bouaghi', 'Oum el Bouaghi'),
  (5, 'batna', 'barika', 'Barika'),
  (5, 'batna', 'batna', 'Batna'),
  (6, 'bejaia', 'akbou', 'Akbou'),
  (6, 'bejaia', 'bejaia', 'Béjaïa'),
  (6, 'bejaia', 'el-kseur', 'El Kseur'),
  (7, 'biskra', 'biskra', 'Biskra'),
  (7, 'biskra', 'tolga', 'Tolga'),
  (8, 'bechar', 'bechar', 'Béchar'),
  (9, 'blida', 'blida', 'Blida'),
  (9, 'blida', 'boufarik', 'Boufarik'),
  (9, 'blida', 'larbaa', 'Larbaa'),
  (9, 'blida', 'mouzaia', 'Mouzaia'),
  (9, 'blida', 'ouled-yaich', 'Ouled Yaïch'),
  (10, 'bouira', 'ain-bessem', 'Aïn Bessem'),
  (10, 'bouira', 'bouira', 'Bouira'),
  (10, 'bouira', 'lakhdaria', 'Lakhdaria'),
  (10, 'bouira', 'sour-el-ghouzlane', 'Sour El Ghouzlane'),
  (11, 'tamanrasset', 'tamanrasset', 'Tamanrasset'),
  (12, 'tebessa', 'cheria', 'Cheria'),
  (12, 'tebessa', 'tebessa', 'Tébessa'),
  (13, 'tlemcen', 'chetouane', 'Chetouane'),
  (13, 'tlemcen', 'maghnia', 'Maghnia'),
  (13, 'tlemcen', 'remchi', 'Remchi'),
  (13, 'tlemcen', 'tlemcen', 'Tlemcen'),
  (14, 'tiaret', 'tiaret', 'Tiaret'),
  (15, 'tizi-ouzou', 'azazga', 'Azazga'),
  (15, 'tizi-ouzou', 'beni-douala', 'Beni Douala'),
  (15, 'tizi-ouzou', 'draa-ben-khedda', 'Draâ Ben Khedda'),
  (15, 'tizi-ouzou', 'tizi-gheniff', 'Tizi Gheniff'),
  (15, 'tizi-ouzou', 'tizi-ouzou', 'Tizi Ouzou'),
  (16, 'alger', 'ain-benian', 'Aïn Benian'),
  (16, 'alger', 'alger-centre', 'Alger Centre'),
  (16, 'alger', 'bab-el-oued', 'Bab El Oued'),
  (16, 'alger', 'bab-ezzouar', 'Bab Ezzouar'),
  (16, 'alger', 'bachdjerrah', 'Bachdjerrah'),
  (16, 'alger', 'baraki', 'Baraki'),
  (16, 'alger', 'bir-mourad-rais', 'Bir Mourad Raïs'),
  (16, 'alger', 'birkhadem', 'Birkhadem'),
  (16, 'alger', 'birtouta', 'Birtouta'),
  (16, 'alger', 'bordj-el-bahri', 'Bordj El Bahri'),
  (16, 'alger', 'bordj-el-kiffan', 'Bordj El Kiffan'),
  (16, 'alger', 'cheraga', 'Cheraga'),
  (16, 'alger', 'dar-el-beida', 'Dar El Beïda'),
  (16, 'alger', 'djasr-kasentina', 'Djasr Kasentina'),
  (16, 'alger', 'draria', 'Draria'),
  (16, 'alger', 'hussein-dey', 'Hussein Dey'),
  (16, 'alger', 'les-eucalyptus', 'Les Eucalyptus'),
  (16, 'alger', 'mahelma', 'Mahelma'),
  (16, 'alger', 'mohammadia', 'Mohammadia'),
  (16, 'alger', 'oued-smar', 'Oued Smar'),
  (16, 'alger', 'ouled-fayet', 'Ouled Fayet'),
  (16, 'alger', 'reghaia', 'Reghaïa'),
  (16, 'alger', 'rouiba', 'Rouïba'),
  (16, 'alger', 'zeralda', 'Zeralda'),
  (17, 'djelfa', 'ain-oussara', 'Aïn Oussara'),
  (17, 'djelfa', 'djelfa', 'Djelfa'),
  (18, 'jijel', 'el-milia', 'El Milia'),
  (18, 'jijel', 'jijel', 'Jijel'),
  (18, 'jijel', 'kaous', 'Kaous'),
  (18, 'jijel', 'taher', 'Taher'),
  (19, 'setif', 'ain-oulmene', 'Aïn Oulmene'),
  (19, 'setif', 'bougaa', 'Bougaa'),
  (19, 'setif', 'el-eulma', 'El Eulma'),
  (19, 'setif', 'setif', 'Sétif'),
  (20, 'saida', 'saida', 'Saïda'),
  (21, 'skikda', 'azzaba', 'Azzaba'),
  (21, 'skikda', 'collo', 'Collo'),
  (21, 'skikda', 'el-harrouch', 'El Harrouch'),
  (21, 'skikda', 'skikda', 'Skikda'),
  (22, 'sidi-bel-abbes', 'sidi-bel-abbes', 'Sidi Bel Abbes'),
  (23, 'annaba', 'annaba', 'Annaba'),
  (23, 'annaba', 'el-bouni', 'El Bouni'),
  (24, 'guelma', 'guelma', 'Guelma'),
  (24, 'guelma', 'oued-zenati', 'Oued Zenati'),
  (25, 'constantine', 'constantine', 'Constantine'),
  (25, 'constantine', 'didouche-mourad', 'Didouche Mourad'),
  (25, 'constantine', 'el-khroub', 'El Khroub'),
  (26, 'medea', 'beni-slimane', 'Beni Slimane'),
  (26, 'medea', 'medea', 'Médéa'),
  (26, 'medea', 'tablat', 'Tablat'),
  (27, 'mostaganem', 'mostaganem', 'Mostaganem'),
  (28, 'msila', 'berhoum', 'Berhoum'),
  (28, 'msila', 'bou-saada', 'Bou Saâda'),
  (28, 'msila', 'msila', 'M''Sila'),
  (28, 'msila', 'sidi-aissa', 'Sidi Aïssa'),
  (29, 'mascara', 'mascara', 'Mascara'),
  (30, 'ouargla', 'hassi-messaoud', 'Hassi Messaoud'),
  (30, 'ouargla', 'ouargla', 'Ouargla'),
  (31, 'oran', 'arzew', 'Arzew'),
  (31, 'oran', 'bir-el-djir', 'Bir El Djir'),
  (31, 'oran', 'oran', 'Oran'),
  (32, 'el-bayadh', 'el-bayadh', 'El Bayadh'),
  (33, 'illizi', 'illizi', 'Illizi'),
  (33, 'illizi', 'in-amenas', 'In Amenas'),
  (34, 'bordj-bou-arreridj', 'bordj-bou-arreridj', 'Bordj Bou Arreridj'),
  (35, 'boumerdes', 'bordj-menaiel', 'Bordj Menaiel'),
  (35, 'boumerdes', 'boudouaou', 'Boudouaou'),
  (35, 'boumerdes', 'boumerdes', 'Boumerdes'),
  (35, 'boumerdes', 'hammedi', 'Hammedi'),
  (36, 'el-tarf', 'drean', 'Dréan'),
  (36, 'el-tarf', 'el-tarf', 'El Tarf'),
  (37, 'tindouf', 'tindouf', 'Tindouf'),
  (38, 'tissemsilt', 'tissemsilt', 'Tissemsilt'),
  (39, 'el-oued', 'el-oued', 'El Oued'),
  (40, 'khenchela', 'khenchela', 'Khenchela'),
  (41, 'souk-ahras', 'souk-ahras', 'Souk Ahras'),
  (42, 'tipaza', 'cherchell', 'Cherchell'),
  (42, 'tipaza', 'hadjout', 'Hadjout'),
  (42, 'tipaza', 'kolea', 'Koléa'),
  (42, 'tipaza', 'tipaza', 'Tipaza'),
  (43, 'mila', 'chelghoum-laid', 'Chelghoum Laid'),
  (43, 'mila', 'ferdjioua', 'Ferdjioua'),
  (43, 'mila', 'mila', 'Mila'),
  (44, 'ain-defla', 'ain-defla', 'Aïn Defla'),
  (44, 'ain-defla', 'khemis-miliana', 'Khemis Miliana'),
  (45, 'naama', 'mecheria', 'Mecheria'),
  (46, 'ain-temouchent', 'ain-temouchent', 'Aïn Témouchent'),
  (46, 'ain-temouchent', 'beni-saf', 'Beni Saf'),
  (47, 'ghardaia', 'bounoura', 'Bounoura'),
  (47, 'ghardaia', 'ghardaia', 'Ghardaïa'),
  (48, 'relizane', 'relizane', 'Relizane'),
  (49, 'timimoun', 'timimoun', 'Timimoun'),
  (51, 'ouled-djellal', 'ouled-djellal', 'Ouled Djellal'),
  (53, 'in-salah', 'in-salah', 'In Salah'),
  (55, 'touggourt', 'touggourt', 'Touggourt'),
  (56, 'djanet', 'djanet', 'Djanet'),
  (57, 'el-mghair', 'djamaa', 'Djamaa'),
  (57, 'el-mghair', 'el-mghair', 'El M''Ghair'),
  (58, 'el-menia', 'el-menia', 'El Menia')
),
matched_zones AS (
  SELECT DISTINCT ON (s.wilaya_code, s.commune_slug)
    z.id AS shipping_zone_id,
    s.commune_slug,
    s.commune_display_name
  FROM source s
  JOIN shipping_zones z
    ON (
      regexp_replace(
        translate(
          lower(coalesce(z.name, '')),
          'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
          'aaaaaaceeeeiiiinooooouuuuyy'
        ),
        '[^a-z0-9]+',
        '',
        'g'
      ) = regexp_replace(s.wilaya_slug, '[^a-z0-9]+', '', 'g')
      OR regexp_replace(
        translate(
          lower(coalesce(z.display_name, '')),
          'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
          'aaaaaaceeeeiiiinooooouuuuyy'
        ),
        '[^a-z0-9]+',
        '',
        'g'
      ) = regexp_replace(s.wilaya_slug, '[^a-z0-9]+', '', 'g')
      OR z.id = s.wilaya_code
    )
  ORDER BY
    s.wilaya_code,
    s.commune_slug,
    CASE
      WHEN regexp_replace(
        translate(
          lower(coalesce(z.name, '')),
          'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
          'aaaaaaceeeeiiiinooooouuuuyy'
        ),
        '[^a-z0-9]+',
        '',
        'g'
      ) = regexp_replace(s.wilaya_slug, '[^a-z0-9]+', '', 'g') THEN 0
      WHEN regexp_replace(
        translate(
          lower(coalesce(z.display_name, '')),
          'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
          'aaaaaaceeeeiiiinooooouuuuyy'
        ),
        '[^a-z0-9]+',
        '',
        'g'
      ) = regexp_replace(s.wilaya_slug, '[^a-z0-9]+', '', 'g') THEN 1
      WHEN z.id = s.wilaya_code THEN 2
      ELSE 3
    END,
    z.id
)
INSERT INTO shipping_communes (
  shipping_zone_id,
  name,
  display_name,
  active,
  free_shipping,
  home_delivery_enabled,
  home_delivery_price,
  office_delivery_enabled,
  office_delivery_price
)
SELECT
  mz.shipping_zone_id,
  mz.commune_slug,
  mz.commune_display_name,
  z.active,
  z.free_shipping,
  z.home_delivery_enabled,
  z.home_delivery_price,
  z.office_delivery_enabled,
  z.office_delivery_price
FROM matched_zones mz
JOIN shipping_zones z
  ON z.id = mz.shipping_zone_id
WHERE mz.commune_slug <> ''
ON CONFLICT (shipping_zone_id, name) DO NOTHING;
