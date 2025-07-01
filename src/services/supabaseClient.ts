import { createClient } from "@supabase/supabase-js";
import { config } from "../config/env";

const supabase = createClient(
  config.SUPABASE_URL!,
  config.SUPABASE_SERVICE_KEY!
);

export default supabase;
