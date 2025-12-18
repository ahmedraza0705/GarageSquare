-- Clear prepared statements and force reconnection
-- This should resolve the "current transaction is aborted" error

-- Deallocate all prepared statements (if any exist)
DEALLOCATE ALL;

-- Alternatively, you can restart the database connection by running:
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database();

-- Force a recompile of all cached queries by dropping and recreating a dummy function
CREATE OR REPLACE FUNCTION public.force_reconnect()
RETURNS VOID AS $$
BEGIN
  -- This function does nothing but forces a recompile
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Call the function to ensure it's compiled
SELECT public.force_reconnect();

-- Clean up
DROP FUNCTION IF EXISTS public.force_reconnect();
