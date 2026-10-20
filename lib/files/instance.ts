import { supabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { makeDerivatives } from "./derivatives";
import { createFileService } from "./service";
export const fileService = createFileService({ client: supabase, requireAdmin, makeDerivatives });
