import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const { data: storageData, error: storageErr } = await supabaseAdmin.storage
    .from("csv-uploads")
    .upload(`some-path/${file.name}`, file);

  if (storageErr) {
    return NextResponse.json({ error: storageErr.message }, { status: 500 });
  }

  return NextResponse.json(storageData, { status: 201 });
}

export async function GET() {
  const { data, error } = await supabaseAdmin.from("uploads").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
