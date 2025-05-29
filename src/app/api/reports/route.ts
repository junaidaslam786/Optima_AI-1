// app/api/reports/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildPdf } from "@/lib/pdf";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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
  try {
    // 1) Make sure the user is signed in
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const user_id = session.user.id;

    // 2) Grab your panels/markers/insights from the JSON body
    const { panels, markers, insights } = await request.json();
    if (!panels || !markers) {
      return NextResponse.json(
        { error: "Missing panels or markers" },
        { status: 400 }
      );
    }

    // 3) Build the PDF buffer
    const pdfBuffer = await buildPdf({
      userName: session.user.name || "",
      userEmail: session.user.email || "",
      panels,
      markers,
      insights,
    });

    // 4) Upload to Supabase Storage
    const fileName = `${user_id}/${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("reports")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 5) Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("reports")
      .getPublicUrl(uploadData.path);

    // 6) Insert into pdf_reports, now with a real user_id
    const now = new Date().toISOString();
    const { data: record, error: dbError } = await supabaseAdmin
      .from("pdf_reports")
      .insert({
        user_id,
        report_url: urlData.publicUrl,
        generated_at: now,
      })
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 7) Return the new row
    return NextResponse.json(record, { status: 201 });
  } catch (err: any) {
    console.error("Unexpected /api/reports error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
