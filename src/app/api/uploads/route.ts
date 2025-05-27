import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // upload with service_role (bypasses RLS)
  const { data: storageData, error: storageErr } = await supabaseAdmin.storage
    .from("csv-uploads")
    .upload(`some-path/${file.name}`, file);

  if (storageErr) {
    return NextResponse.json({ error: storageErr.message }, { status: 500 });
  }

  // …then create your uploads row as before…
  // supabaseAdmin.from("uploads").insert({ … })
  return NextResponse.json(storageData, { status: 201 });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data, { status: 200 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updates = await request.json();
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .update(updates)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { error } = await supabaseAdmin.from("uploads").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ deleted: true }, { status: 200 });
}
