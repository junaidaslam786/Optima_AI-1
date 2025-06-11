// app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const updates = await request.json();

  const { data, error } = await supabaseAdmin
    .from("pdf_reports")
    .update(updates)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  const { data: record, error: fetchError } = await supabaseAdmin
    .from("pdf_reports")
    .select("report_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 });
  }
  const filePath = record.report_url.split("/object/public/")[1];
  if (filePath) {
    await supabaseAdmin.storage.from("reports").remove([filePath]);
  }
  const { error: deleteError } = await supabaseAdmin
    .from("pdf_reports")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Report deleted" }, { status: 200 });
}
