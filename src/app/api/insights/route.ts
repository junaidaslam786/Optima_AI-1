import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const { result_id, promptOverride } = await request.json();
  // 1) fetch the result
  const { data: result } = await supabaseAdmin
    .from("results")
    .select("marker_id,value")
    .eq("id", result_id)
    .single();
  // 2) call OpenAI
  if (!result) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
  }
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-turbo",
    messages: [
      { role: "system", content: "You are a lab-insights generator." },
      {
        role: "user",
        content: promptOverride || `Interpret result ${result.value}`,
      },
    ],
  });
  const insight = resp.choices[0].message?.content || "";
  // 3) store insight
  const { data, error } = await supabaseAdmin
    .from("insights")
    .insert({ result_id, insight })
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET(request: Request) {
  const { result_id } = Object.fromEntries(new URL(request.url).searchParams);
  const { data, error } = await supabaseAdmin
    .from("insights")
    .select("*")
    .eq("result_id", result_id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
