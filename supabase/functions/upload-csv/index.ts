// supabase/functions/upload-csv/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPEN_AI_KEY = Deno.env.get("OPEN_AI_KEY"); // Ensure this secret is set in Supabase!
const BUCKET = "csv-uploads"; // Your storage bucket name
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
// Helper function to parse CSV text
function parseCsv(txt) {
  const lines = txt.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0)
    return {
      headings: [],
      rows: [],
    };
  const [headerLine, ...rowLines] = lines;
  const headings = headerLine.split(",").map((h) => h.trim());
  const rows = rowLines.map((line) => {
    const values = line.split(",");
    return headings.reduce((obj, key, index) => {
      obj[key] = (values[index] ?? "").trim();
      return obj;
    }, {});
  });
  return {
    headings,
    rows,
  };
}
// Fallback helper function to determine marker status (if AI fails or is not used)
function getMarkerStatusFallback(
  value,
  normalLow,
  normalHigh,
  rawStatusFlag = null
) {
  if (rawStatusFlag && rawStatusFlag.toLowerCase() === "critical") {
    return "critical"; // Prioritize explicit critical flag
  }
  if (normalLow !== null && value < normalLow) {
    return "low";
  }
  if (normalHigh !== null && value > normalHigh) {
    return "high";
  }
  return "normal";
}
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: CORS_HEADERS,
    });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    const admin_user_id = form.get("admin_user_id")?.toString();
    const client_user_id = form.get("client_user_id")?.toString(); // client_user_id from frontend
    if (!(file instanceof File) || !admin_user_id) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required form fields (file, admin_user_id, or client_user_id).",
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }
    const filenameParts = file.name.split(".");
    const ext = filenameParts.at(-1)?.toLowerCase();
    if (ext !== "csv") {
      return new Response(
        JSON.stringify({
          error: `Unsupported file type: .${ext}. Please upload a CSV file.`,
          detail:
            "XLSX parsing requires external libraries not suitable for direct Deno Edge Function execution.",
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }
    // 2️⃣ Upload CSV to Storage
    const ts = Date.now();
    const objPath = `${client_user_id}/${ts}_${file.name}`;
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(
        objPath
      )}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": file.type,
          "x-upsert": "false",
        },
        body: file.stream(),
      }
    );
    if (!uploadRes.ok) {
      const detail = await uploadRes.text();
      console.error("Storage upload failed:", detail);
      return new Response(
        JSON.stringify({
          error: "Storage upload failed",
          detail,
        }),
        {
          status: uploadRes.status,
          headers: CORS_HEADERS,
        }
      );
    }
    // 3️⃣ Record upload metadata in public.uploads
    const metaRes = await fetch(`${SUPABASE_URL}/rest/v1/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        admin_user_id,
        client_user_id,
        filename: objPath,
      }),
    });
    if (!metaRes.ok) {
      const detail = await metaRes.text();
      console.error("Upload metadata insertion failed:", detail);
      return new Response(
        JSON.stringify({
          error: "Failed to create upload record in database",
          detail,
        }),
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
    const [uploadRecord] = await metaRes.json();
    const csvfile_id = uploadRecord.id;
    // 4️⃣ Read & parse CSV text
    const buf = await file.arrayBuffer();
    const text = new TextDecoder().decode(buf);
    const { headings, rows } = parseCsv(text);
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          message: "CSV file is empty or malformed after parsing.",
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }
    // Use 5 sample rows for AI prompt
    const sampleRows = rows.slice(0, Math.min(5, rows.length));
    const aiPrompt = `
      You are an expert medical data analyst. You are given a CSV with the following headers:
      ${JSON.stringify(headings)}.

      Here are sample rows from the CSV:
      ${JSON.stringify(sampleRows, null, 2)}

      Your task:
      1. Identify the CSV column that corresponds to each of the following medical fields:
          - marker_name
          - panel_name
          - marker_value
          - marker_unit
          - normal_range_text
          - collection_date
          - report_date
          - status_flag
          - category (if any, related to product_categories table)

      If a field is not directly present, indicate 'null'. The output for column mapping should have these exact keys.

      2. Return a JavaScript function (as a string) named \`calculateStatus\` that takes 4 parameters: \`value\`, \`normalLow\`, \`normalHigh\`, and \`rawStatusFlag\` (string from CSV), and returns one of: "low", "high", "critical", or "normal".

      Use this logic:
      - If 'rawStatusFlag' is explicitly "Critical" (case-insensitive) or implies a critical state, return "critical".
      - If 'value' is less than 'normalLow', return "low".
      - If 'value' is greater than 'normalHigh', return "high".
      - Otherwise, return "normal".

      Return the output as a JSON object with two keys:
      {
        "column_mapping": {
          "marker_name": "...",
          "panel_name": "...",
          "marker_value": "...",
          "marker_unit": "...",
          "normal_range_text": "...",
          "collection_date": "...",
          "report_date": "...",
          "status_flag": "...",
          "category": "..." // This key must be present even if null
        },
        "status_logic_function": "function calculateStatus(value, normalLow, normalHigh, rawStatusFlag) { /* ...logic... */ }"
      }
    `;
    // 5️⃣ Call OpenAI API for column mapping and status logic
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPEN_AI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        temperature: 0.3,
        response_format: {
          type: "json_object",
        },
      }),
    });
    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error("OpenAI API call failed:", aiRes.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to get column mapping from AI API",
          detail: errorText,
        }),
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
    const aiJson = await aiRes.json();
    console.log(
      "AI Raw Response (Parsed JSON):",
      JSON.stringify(aiJson, null, 2)
    );
    if (
      !aiJson ||
      !aiJson.choices ||
      aiJson.choices.length === 0 ||
      !aiJson.choices[0].message ||
      !aiJson.choices[0].message.content
    ) {
      console.error("Unexpected or empty AI response structure:", aiJson);
      return new Response(
        JSON.stringify({
          error:
            "AI response did not contain expected content (choices[0].message.content).",
          detail: aiJson.error
            ? aiJson.error.message
            : "No valid content or error message from AI.",
        }),
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
    let aiContent;
    try {
      aiContent = JSON.parse(aiJson.choices[0].message.content);
    } catch (parseError) {
      console.error(
        "Failed to parse AI message content as JSON:",
        parseError,
        aiJson.choices[0].message.content
      );
      return new Response(
        JSON.stringify({
          error: "AI returned invalid JSON content.",
          detail: "Check AI response format. " + parseError.message,
        }),
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }
    const columnMapping = aiContent.column_mapping;
    const calculateStatusAI = eval(`(${aiContent.status_logic_function})`); // WARNING: Eval is risky!
    const categoryCache = new Map();
    const panelCache = new Map();
    const markerCache = new Map();
    // 6️⃣ Process each row from the CSV
    for (const row of rows) {
      // --- Handle Category (if mapped) ---
      const categoryName =
        columnMapping.category && row[columnMapping.category]
          ? row[columnMapping.category]
          : "General";
      let category_id;
      if (categoryCache.has(categoryName)) {
        category_id = categoryCache.get(categoryName);
      } else {
        const catLookup = await fetch(
          `${SUPABASE_URL}/rest/v1/product_categories?select=id&name=eq.${encodeURIComponent(
            categoryName
          )}`,
          {
            headers: {
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              apikey: SERVICE_ROLE_KEY,
            },
          }
        );
        const catExisting = await catLookup.json();
        if (catLookup.ok && Array.isArray(catExisting) && catExisting.length) {
          category_id = catExisting[0].id;
        } else {
          const catCreate = await fetch(
            `${SUPABASE_URL}/rest/v1/product_categories`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
                apikey: SERVICE_ROLE_KEY,
                "Content-Type": "application/json",
                Prefer: "return=representation",
              },
              body: JSON.stringify({
                name: categoryName,
                description: `Auto-created from CSV upload for file: ${file.name}`,
              }),
            }
          );
          const createdCategory = await catCreate.json();
          category_id = createdCategory[0].id;
        }
        categoryCache.set(categoryName, category_id);
      }
      // --- Handle Panel ---
      const panelName =
        columnMapping.panel_name && row[columnMapping.panel_name]
          ? row[columnMapping.panel_name]
          : "Default Panel";
      let panel_id;
      if (panelCache.has(panelName)) {
        panel_id = panelCache.get(panelName);
      } else {
        const panelLookup = await fetch(
          `${SUPABASE_URL}/rest/v1/panels?select=id&name=eq.${encodeURIComponent(
            panelName
          )}`,
          {
            headers: {
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              apikey: SERVICE_ROLE_KEY,
            },
          }
        );
        const panelExisting = await panelLookup.json();
        if (
          panelLookup.ok &&
          Array.isArray(panelExisting) &&
          panelExisting.length
        ) {
          panel_id = panelExisting[0].id;
        } else {
          const panelCreate = await fetch(`${SUPABASE_URL}/rest/v1/panels`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              apikey: SERVICE_ROLE_KEY,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              name: panelName,
              description: `Auto-generated panel for ${panelName} from CSV upload.`,
              category_id: category_id,
            }),
          });
          const createdPanel = await panelCreate.json();
          panel_id = createdPanel[0].id;
        }
        panelCache.set(panelName, panel_id);
      }
      // --- Extract Marker Details ---
      const markerName =
        columnMapping.marker_name && row[columnMapping.marker_name]
          ? row[columnMapping.marker_name].trim()
          : "Unknown Marker";
      const markerUnit =
        columnMapping.marker_unit && row[columnMapping.marker_unit]
          ? row[columnMapping.marker_unit].trim()
          : "";
      const rawNormalRangeText =
        columnMapping.normal_range_text && row[columnMapping.normal_range_text]
          ? row[columnMapping.normal_range_text].trim()
          : "";

      let normal_low: number | null = null;
      let normal_high: number | null = null;

      if (rawNormalRangeText) {
        // Use a regex to robustly find numbers separated by a hyphen or ranges like <X, >X
        const rangeMatch = rawNormalRangeText.match(
          /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/
        );
        const lessThanMatch = rawNormalRangeText.match(/<\s*(\d+\.?\d*)/);
        const greaterThanMatch = rawNormalRangeText.match(/>\s*(\d+\.?\d*)/);

        if (rangeMatch) {
          normal_low = parseFloat(rangeMatch[1]);
          normal_high = parseFloat(rangeMatch[2]);
        } else if (lessThanMatch) {
          normal_high = parseFloat(lessThanMatch[1]);
        } else if (greaterThanMatch) {
          normal_low = parseFloat(greaterThanMatch[1]);
        }
      }

      // Normalize numeric values for lookup and cache key to avoid floating point issues
      const normalizedNormalLow =
        normal_low !== null ? parseFloat(normal_low.toFixed(5)) : null; // To 5 decimal places
      const normalizedNormalHigh =
        normal_high !== null ? parseFloat(normal_high.toFixed(5)) : null; // To 5 decimal places

      // Construct a unique key for marker (panel_id is crucial for uniqueness along with other attributes)
      const uniqueMarkerKey = `${panel_id}-${markerName}-${markerUnit}-${
        normalizedNormalLow ?? "null"
      }-${normalizedNormalHigh ?? "null"}`;
      let marker_id: string;

      if (markerCache.has(uniqueMarkerKey)) {
        marker_id = markerCache.get(uniqueMarkerKey)!;
      } else {
        // --- CORRECTED MARKER LOOKUP URL FOR NULLS AND DEDUPLICATION ---
        let markerLookupUrl = `${SUPABASE_URL}/rest/v1/markers?select=id&marker=eq.${encodeURIComponent(
          markerName
        )}&unit=eq.${encodeURIComponent(markerUnit)}&panel_id=eq.${panel_id}`;

        if (normalizedNormalLow !== null) {
          markerLookupUrl += `&normal_low=eq.${normalizedNormalLow}`;
        } else {
          markerLookupUrl += `&normal_low=is.null`; // Correct for NULL
        }

        if (normalizedNormalHigh !== null) {
          markerLookupUrl += `&normal_high=eq.${normalizedNormalHigh}`;
        } else {
          markerLookupUrl += `&normal_high=is.null`; // Correct for NULL
        }
        // --- END CORRECTED MARKER LOOKUP URL ---

        console.log(`DEBUG: Marker Lookup URL: ${markerLookupUrl}`); // Log the full URL
        const markerLookup = await fetch(markerLookupUrl, {
          headers: {
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            apikey: SERVICE_ROLE_KEY,
          },
        });
        const existingMarker = await markerLookup.json();
        console.log(
          `DEBUG: Marker Lookup Response for ${markerName} (Key: ${uniqueMarkerKey}):`,
          existingMarker
        ); // Log response

        if (
          markerLookup.ok &&
          Array.isArray(existingMarker) &&
          existingMarker.length
        ) {
          marker_id = existingMarker[0].id;
        } else {
          console.log(
            `DEBUG: Creating new marker for ${markerName} (Key: ${uniqueMarkerKey}) under panel ${panelName}`
          );
          const createMarker = await fetch(`${SUPABASE_URL}/rest/v1/markers`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              apikey: SERVICE_ROLE_KEY,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              panel_id,
              marker: markerName,
              unit: markerUnit,
              normal_low: normal_low,
              normal_high: normal_high,
            }),
          });
          const createdMarker = await createMarker.json();
          marker_id = createdMarker[0].id;
        }
        markerCache.set(uniqueMarkerKey, marker_id);
      }

      // --- Insert into patient_marker_values table ---
      const markerValue = parseFloat(
        row[columnMapping.marker_value || ""] || "0"
      );
      const rawStatusFlag =
        columnMapping.status_flag && row[columnMapping.status_flag]
          ? row[columnMapping.status_flag]
          : "normal";
      let finalStatus;
      try {
        finalStatus = calculateStatusAI(
          markerValue,
          normal_low,
          normal_high,
          rawStatusFlag
        );
      } catch (e) {
        console.warn(
          "AI status calculation failed or invalid, falling back to heuristic:",
          e
        );
        finalStatus = getMarkerStatusFallback(
          markerValue,
          normal_low,
          normal_high,
          rawStatusFlag
        );
      }
      finalStatus = finalStatus || "normal";
      const collectionDateStr =
        columnMapping.collection_date && row[columnMapping.collection_date]
          ? row[columnMapping.collection_date]
          : null;
      const reportedDateStr =
        columnMapping.report_date && row[columnMapping.report_date]
          ? row[columnMapping.report_date]
          : null;
      const patientMarkerPayload = {
        csvfile_id,
        user_id: client_user_id,
        marker_id,
        col_date: collectionDateStr
          ? new Date(collectionDateStr).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        rep_date: reportedDateStr
          ? new Date(reportedDateStr).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        value: markerValue,
        status: finalStatus,
      };
      const insertPatientMarkerRes = await fetch(
        `${SUPABASE_URL}/rest/v1/patient_marker_values`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            apikey: SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(patientMarkerPayload),
        }
      );
      if (!insertPatientMarkerRes.ok) {
        const detail = await insertPatientMarkerRes.text();
        console.error(
          "Patient marker value insert failed for payload:",
          patientMarkerPayload,
          "Detail:",
          detail
        );
      }
    }
    return new Response(
      JSON.stringify({
        message: "File uploaded and data processed successfully!",
        csvfile_id: csvfile_id,
      }),
      {
        status: 201,
        headers: CORS_HEADERS,
      }
    );
  } catch (err) {
    console.error("Unexpected error in upload-csv function:", err);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        detail: err.message,
      }),
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }
});
