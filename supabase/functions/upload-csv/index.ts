// supabase/functions/upload-csv/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parse } from "https://deno.land/x/csv@0.8.0/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase     = createClient(SUPABASE_URL, SERVICE_KEY);

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // 1) pull out the file + form fields
    const form = await req.formData();
    const file = form.get("file");
    const client_user_id = form.get("client_user_id")?.toString();
    const panel_id       = form.get("panel_id")?.toString();

    if (!(file instanceof File) || !client_user_id || !panel_id) {
      return new Response("Missing file or form fields", { status: 400 });
    }

    // 2) upload CSV to Storage
    const timestamp = Date.now();
    const path = `${client_user_id}/${timestamp}_${file.name}`;
    const { error: uploadErr } = await supabase
      .storage
      .from("csv-uploads")
      .upload(path, file, { contentType: file.type });

    if (uploadErr) {
      console.error("Storage error:", uploadErr);
      return new Response(uploadErr.message, { status: 500 });
    }

    // 3) parse CSV text
    const buf  = await file.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(buf);
    const rows = (await parse(text, { header: true })) as Record<string, string>[];

    // 4) insert each marker
    for (const row of rows) {
      // map your columns
      const refRange = row["Reference Range"] ?? "";
      let normal_low:  number | null = null;
      let normal_high: number | null = null;
      if (refRange.includes("–")) {
        const [low, high] = refRange.split("–").map((s) => parseFloat(s));
        normal_low  = low;
        normal_high = high;
      } else if (refRange.startsWith(">")) {
        normal_low = parseFloat(refRange.slice(1));
      } else if (refRange.startsWith("<")) {
        normal_high = parseFloat(refRange.slice(1));
      }

      await supabase
        .from("markers")
        .insert({
          csvfile_id:  path,
          user_id:     client_user_id,
          panel_id,
          marker:      row["Test Name"]      || "",
          value:       parseFloat(row["Result"]      || "0"),
          unit:        row["Units"]           || "",
          normal_low,
          normal_high,
          status:      row["Flag"]            || "",
          col_date:    row["Collection Date"] || null,
          rep_date:    row["Reported Date"]   || null,
        });
    }

    return new Response(
      JSON.stringify({ message: "CSV uploaded & markers created" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
