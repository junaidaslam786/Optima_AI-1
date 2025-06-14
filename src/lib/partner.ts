import { supabaseAdmin } from "./supabase-admin";
import type { PartnerProfile } from "@/types/db";

export async function getPartnerBySlug(
  slug: string
): Promise<PartnerProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("partner_profiles") // no generics
    .select("*")
    .eq("company_slug", slug)
    .maybeSingle();
  if (error) {
    console.error(error);
    return null;
  }
  return data as PartnerProfile | null;
}
