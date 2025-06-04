// app/api/reports/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/reports/:id
export async function GET(request: Request, { params }) {
  const { id } = params;
  const { data, error } = await supabaseAdmin
    .from("pdf_reports")
    .select("id, user_id, report_url, generated_at")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data, { status: 200 });
}

// DELETE /api/reports/:id
export async function DELETE(request: Request, { params }) {
  const { id } = params;

  // 1) Fetch the record to get the `report_url` (so we can remove from storage)
  const { data: record, error: fetchError } = await supabaseAdmin
    .from("pdf_reports")
    .select("report_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 });
  }

  // 2) Extract the storage path. publicUrl has the form:
  //    https://<project>.supabase.co/storage/v1/object/public/reports/<userId>/<timestamp>.pdf
  //    We need to split on "/object/public/" and take the latter part:
  const filePath = record.report_url.split("/object/public/")[1];
  if (filePath) {
    await supabaseAdmin.storage.from("reports").remove([filePath]);
  }

  // 3) Delete the DB row
  const { error: deleteError } = await supabaseAdmin
    .from("pdf_reports")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Report deleted" }, { status: 200 });
}
