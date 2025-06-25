"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Assuming this path is correct for client-side Supabase
import { useSession } from "next-auth/react";
import { UploadCloud, Users } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner"; // Assuming this path is correct
import Button from "@/components/ui/Button"; // Assuming this path is correct
import { withAuth } from "@/components/Auth/withAuth"; // Assuming this path is correct
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL}/upload-csv`;

type Option = { id: string; name: string };

const CsvUploads: React.FC = () => {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Option[]>([]);
  const [clientId, setClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClientCsv, setIsClientCsv] = useState(true);

  useEffect(() => {
    async function loadClients() {
      if (status === "authenticated" && session?.user?.id) {
        const { data, error } = await supabase
          .from("users")
          .select("id,name")
          .eq("role", "client");
        if (data) setClients(data);
        if (error) toast.error(error.message);
      }
    }
    loadClients();
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    if (isClientCsv && !clientId) {
      toast.error("Please select a client for Client CSV.");
      return;
    }

    setLoading(true);

    let fileToUpload: File = file;
    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "xlsx" || fileExtension === "xls") {
        toast.loading("Converting Excel to CSV...", { id: "conversion" });
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const csvContent = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);

        const csvBlob = new Blob([csvContent], { type: "text/csv" });
        fileToUpload = new File([csvBlob], `${file.name.split(".")[0]}.csv`, {
          type: "text/csv",
        });
        toast.success("Conversion complete!", { id: "conversion" });
      } else if (fileExtension !== "csv") {
        toast.error(
          `Unsupported file type: .${fileExtension}. Please upload a CSV or XLSX file.`
        );
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("admin_user_id", session?.user.id ?? "");
      if (isClientCsv && clientId) {
        formData.append("client_user_id", clientId);
      }

      formData.append("file", fileToUpload);

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("Function Error Response:", json);
        throw new Error(json.error || res.statusText);
      }

      toast.success(json.message || "Upload successful!");
      setFile(null);
      setClientId("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center">
      {loading && (
        <div className="fixed inset-0 bg-secondary/70 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
          <LoadingSpinner />
          <p className="mt-4 text-primary text-lg font-semibold text-center">
            File is being uploaded, processed, and parsed.
            <br />
            Please wait, this may take a moment...
          </p>
        </div>
      )}
      <div className="w-full max-w-xl p-8 bg-primary/10 dark:bg-primary/20 rounded-2xl shadow-2xl">
        <div className="flex items-center mb-6">
          <UploadCloud className="h-8 w-8 text-primary" />
          <h1 className="ml-3 text-3xl font-bold text-primary">
            Upload Lab Report
          </h1>
        </div>

        {/* Upload Type Toggle */}
        <div className="mb-4">
          <label className="font-medium text-primary mr-4">Upload Type:</label>
          <div className="flex flex-row gap-8 mt-4">
            <Button
              type="button"
              onClick={() => setIsClientCsv(true)}
              className={`px-3 py-1 rounded-l-md ${
                isClientCsv
                  ? "bg-secondary text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
              }`}
            >
              Client CSV
            </Button>
            <Button
              type="button"
              onClick={() => setIsClientCsv(false)}
              className={`px-3 py-1 rounded-r-md ${
                !isClientCsv
                  ? "bg-secondary text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
              }`}
            >
              Admin CSV
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isClientCsv && (
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Select Client
              </label>
              <div className="relative">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="appearance-none w-full p-3 border border-primary/50 bg-primary/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— Choose client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Users className="absolute right-3 top-3 pointer-events-none text-primary/70" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Select File
            </label>
            <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-primary/50 rounded-lg cursor-pointer hover:border-primary/80">
              <div className="text-center">
                <p className="text-primary mb-2">
                  {file ? file.name : "Click to select or drag and drop"}
                </p>
                <p className="text-xs text-primary/70">
                  .csv or .xlsx files only
                </p>
              </div>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-secondary text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/80 transition disabled:opacity-50"
          >
            {loading ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default withAuth(CsvUploads, { allowedRoles: ["admin"] });
