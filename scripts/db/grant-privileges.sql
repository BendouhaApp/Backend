ALTER DATABASE ecommerce_electrical OWNER TO ecommerce_app;
GRANT ALL PRIVILEGES ON DATABASE ecommerce_electrical TO ecommerce_app;
GRANT ALL PRIVILEGES ON SCHEMA public TO ecommerce_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecommerce_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecommerce_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ecommerce_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ecommerce_app;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public') LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO ecommerce_app';
  END LOOP;
  FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname='public') LOOP
    EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequencename) || ' OWNER TO ecommerce_app';
  END LOOP;
END $$;
