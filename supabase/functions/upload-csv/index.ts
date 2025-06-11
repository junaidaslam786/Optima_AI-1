// // supabase/functions/upload-csv/index.ts
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// const BUCKET = "csv-uploads";
// const CORS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };
// Deno.serve(async (req) => {
//   // CORS preflight
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       status: 204,
//       headers: CORS,
//     });
//   }
//   if (req.method !== "POST") {
//     return new Response("Method Not Allowed", {
//       status: 405,
//       headers: CORS,
//     });
//   }
//   try {
//     // 1️⃣ pull form-data
//     const form = await req.formData();
//     const file = form.get("file");
//     const admin_user_id = form.get("admin_user_id")?.toString();
//     const client_user_id = form.get("client_user_id")?.toString();
//     if (!(file instanceof File) || !admin_user_id || !client_user_id) {
//       return new Response(
//         JSON.stringify({
//           error: "Missing file or form fields",
//         }),
//         {
//           status: 400,
//           headers: CORS,
//         }
//       );
//     }
//     // 2️⃣ upload CSV to Storage
//     const ts = Date.now();
//     const objPath = `${client_user_id}/${ts}_${file.name}`;
//     const upRes = await fetch(
//       `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(
//         objPath
//       )}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//           "Content-Type": file.type,
//           "x-upsert": "false",
//         },
//         body: file.stream(),
//       }
//     );
//     if (!upRes.ok) {
//       const detail = await upRes.text();
//       console.error("Storage error:", detail);
//       return new Response(
//         JSON.stringify({
//           error: "Storage upload failed",
//           detail,
//         }),
//         {
//           status: upRes.status,
//           headers: CORS,
//         }
//       );
//     }
//     // 3️⃣ record upload metadata (without panel_id now!)
//     const uploadMetaRes = await fetch(`${SUPABASE_URL}/rest/v1/uploads`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//         apikey: SERVICE_ROLE_KEY,
//         "Content-Type": "application/json",
//         Prefer: "return=representation",
//       },
//       body: JSON.stringify({
//         admin_user_id,
//         client_user_id,
//         filename: objPath,
//       }),
//     });
//     if (!uploadMetaRes.ok) {
//       const detail = await uploadMetaRes.text();
//       console.error("Upload meta failed:", detail);
//       return new Response(
//         JSON.stringify({
//           error: "Failed to create upload record",
//           detail,
//         }),
//         {
//           status: 500,
//           headers: CORS,
//         }
//       );
//     }
//     const [uploadRecord] = await uploadMetaRes.json();
//     const csvfile_id = uploadRecord.id;
//     // 4️⃣ read & inline-parse CSV text
//     const buf = await file.arrayBuffer();
//     const text = new TextDecoder().decode(buf);
//     function parseCsv(txt) {
//       const lines = txt.split(/\r?\n/).filter((l) => l.trim());
//       const [h, ...rows] = lines;
//       const headings = h.split(",").map((c) => c.trim());
//       return rows.map((r) => {
//         const cols = r.split(",");
//         return headings.reduce((obj, col, i) => {
//           obj[col] = (cols[i] ?? "").trim();
//           return obj;
//         }, {});
//       });
//     }
//     const rows = parseCsv(text);
//     // 5️⃣ panelName → panelId cache
//     const panelCache = new Map();
//     // 6️⃣ for each row: resolve panel, then insert marker
//     for (const row of rows) {
//       const panelName = row["Panel"] || "Default";
//       let panel_id;
//       if (panelCache.has(panelName)) {
//         panel_id = panelCache.get(panelName);
//       } else {
//         // A) try to fetch existing
//         const q = encodeURIComponent(panelName);
//         const lookup = await fetch(
//           `${SUPABASE_URL}/rest/v1/panels?select=id&name=eq.${q}`,
//           {
//             headers: {
//               Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//               apikey: SERVICE_ROLE_KEY,
//             },
//           }
//         );
//         const existing = await lookup.json();
//         if (lookup.ok && Array.isArray(existing) && existing.length) {
//           panel_id = existing[0].id;
//         } else {
//           // B) create new panel
//           const create = await fetch(`${SUPABASE_URL}/rest/v1/panels`, {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//               apikey: SERVICE_ROLE_KEY,
//               "Content-Type": "application/json",
//               Prefer: "return=representation",
//             },
//             body: JSON.stringify({
//               name: panelName,
//             }),
//           });
//           const created = await create.json();
//           panel_id = created[0].id;
//         }
//         panelCache.set(panelName, panel_id);
//       }
//       // compute low/high
//       let normal_low = null;
//       let normal_high = null;
//       const rr = row["Reference Range"] || "";
//       if (rr.includes("–")) {
//         const [l, h] = rr.split("–").map((v) => parseFloat(v));
//         normal_low = isNaN(l) ? null : l;
//         normal_high = isNaN(h) ? null : h;
//       } else if (rr.startsWith(">")) {
//         const v = parseFloat(rr.slice(1));
//         normal_low = isNaN(v) ? null : v;
//       } else if (rr.startsWith("<")) {
//         const v = parseFloat(rr.slice(1));
//         normal_high = isNaN(v) ? null : v;
//       }
//       // D) insert the marker
//       const payload = {
//         csvfile_id,
//         user_id: client_user_id,
//         panel_id,
//         marker: row["Test Name"] || "",
//         value: parseFloat(row["Result"] || "0"),
//         unit: row["Units"] || "",
//         normal_low,
//         normal_high,
//         status: row["Flag"] || "",
//         col_date: row["Collection Date"] || null,
//         rep_date: row["Reported Date"] || null,
//       };
//       const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/markers`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//           apikey: SERVICE_ROLE_KEY,
//           "Content-Type": "application/json",
//           Prefer: "return=minimal",
//         },
//         body: JSON.stringify(payload),
//       });
//       if (!insertRes.ok) {
//         const detail = await insertRes.text();
//         console.error("Marker insert failed:", detail, payload);
//       }
//     }
//     return new Response(
//       JSON.stringify({
//         message: "Uploaded, panels & markers created",
//       }),
//       {
//         status: 201,
//         headers: CORS,
//       }
//     );
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     return new Response(
//       JSON.stringify({
//         error: "Internal Server Error",
//       }),
//       {
//         status: 500,
//         headers: CORS,
//       }
//     );
//   }
// });
