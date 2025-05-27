// app/api/reports/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin }  from "@/lib/supabase-admin";
import { buildPdf }       from "@/lib/pdf";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user_id = url.searchParams.get("user_id");
  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("pdf_reports")
    .select("id, user_id, report_url, generated_at")
    .eq("user_id", user_id)
    .order("generated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: Request) {
  const { user_id, resultIds } = await request.json();

  // 1) generate the PDF Buffer
  const pdfBuffer = await buildPdf(resultIds);

  // 2) upload to Supabase Storage
  const fileName = `${user_id}/${Date.now()}.pdf`;
  const { data: uploadData, error: uploadError } =
    await supabaseAdmin.storage
      .from("reports")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf"
      });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // 3) get the public URL
  const { data } = supabaseAdmin.storage
    .from("reports")
    .getPublicUrl(uploadData.path);
  const publicUrl = data.publicUrl;

  // 4) store the record
  const { data: record, error: dbError } = await supabaseAdmin
    .from("pdf_reports")
    .insert({ user_id, report_url: publicUrl })
    .single();
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(record, { status: 201 });
}
