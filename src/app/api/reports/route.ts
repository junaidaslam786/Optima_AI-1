import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildPdf } from "@/lib/pdf";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface Panel {
  id: string;
  name: string;
}

import type { Marker } from "@/lib/pdf";

type ReportRequestBody = {
  panels: Panel[];
  markers: Marker[];
  insights?: string;
};

export async function GET(request: NextRequest) {
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const user_id = session.user.id;
    const body = (await request.json()) as ReportRequestBody;
    const { panels, markers, insights } = body;
    if (!panels || !markers) {
      return NextResponse.json({ error: "Missing panels or markers" }, { status: 400 });
    }
    const pdfBuffer = await buildPdf({
      userName: session.user.name ?? "",
      userEmail: session.user.email ?? "",
      panels,
      markers,
      insights: insights ?? "",
    });
    const fileName = `${user_id}/${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("reports")
      .upload(fileName, pdfBuffer, { contentType: "application/pdf" });
    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    const { data: urlData } = supabaseAdmin.storage
      .from("reports")
      .getPublicUrl(uploadData.path);
    const now = new Date().toISOString();
    const { data: record, error: dbError } = await supabaseAdmin
      .from("pdf_reports")
      .insert({ user_id, report_url: urlData.publicUrl, generated_at: now })
      .select()
      .single();
    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    return NextResponse.json(record, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Unexpected /api/reports error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
