"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const UpdatePasswordForm: React.FC = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session) {
        setIsTokenValid(true);
        toast.success("Session restored! You can now set your new password.");
      } else if (error) {
        console.error("Error getting session:", error.message);
        toast.error(
          "Invalid or expired password reset link. Please request a new one."
        );
        setIsTokenValid(false);
      } else {
        // No session and no error means token might be missing or invalid
        toast.error(
          "Invalid or missing password reset link. Please request a new one."
        );
        setIsTokenValid(false);
      }
      setIsLoading(false);
      setInitialCheckDone(true);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isTokenValid) {
      toast.error("Cannot update password: Invalid or expired link.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      // Supabase default minimum password length
      toast.error("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      // This uses the client-side Supabase client to update the user's password.
      // It works because the session has been restored from the URL token.
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Error updating password:", error.message);
        toast.error(`Failed to update password: ${error.message}`);
      } else {
        toast.success(
          "Password updated successfully! You can now log in with your new password."
        );
        router.push("/auth/login"); // Redirect to login page
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !initialCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Verifying reset link...</p>
      </div>
    );
  }

  if (!isTokenValid && initialCheckDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Invalid Link</h2>
          <p className="text-gray-700 mb-6">
            The password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/auth/forgot-password")}
          >
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Set New Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="New Password"
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Enter your new password"
          />
          <Input
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your new password"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={
              isLoading ||
              !newPassword ||
              newPassword !== confirmPassword ||
              newPassword.length < 6
            }
            className="w-full py-3 text-lg"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;
