ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "lighting_specs_enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "public"."products" ALTER COLUMN "angle" DROP NOT NULL;
ALTER TABLE "public"."products" ALTER COLUMN "cct" DROP NOT NULL;
ALTER TABLE "public"."products" ALTER COLUMN "cri" DROP NOT NULL;
ALTER TABLE "public"."products" ALTER COLUMN "lumen" DROP NOT NULL;
ALTER TABLE "public"."products" ALTER COLUMN "power" DROP NOT NULL;