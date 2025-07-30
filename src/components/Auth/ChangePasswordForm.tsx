// src/components/Auth/ChangePasswordForm.tsx
"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react"; // For getting the access token
import { useChangePasswordMutation } from "@/redux/features/auth/authApi"; // RTK Query hook

interface CustomSession {
  accessToken?: string;
  user?: {
    accessToken?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const ChangePasswordForm: React.FC = () => {
  const { data: session, status } = useSession();
  const [currentPassword, setCurrentPassword] = useState(""); // For UX, not backend validation
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "loading") {
      toast.loading("Session is still loading. Please wait.");
      return;
    }
    if (status === "unauthenticated" || !session) {
      toast.error("You must be logged in to change your password.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
    const customSession = session as unknown as CustomSession;
    const accessToken =
      customSession?.accessToken || customSession?.user?.accessToken;

    if (!accessToken) {
      toast.error("Authentication token missing. Please log in again.");
      return;
    }
    }

    const customSession = session as unknown as CustomSession;
    const accessToken =
      customSession.accessToken || customSession.user?.accessToken;

    if (!accessToken) {
      toast.error("Authentication token missing. Please log in again.");
      return;
    }

    try {
      await changePassword({ newPassword, accessToken }).unwrap();
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: unknown) {
      console.error("Error changing password:", error);
      let errorMessage = "An unexpected error occurred.";
      if (typeof error === "object" && error !== null) {
        type ErrorWithData = { data?: { error?: string }; message?: string };
        const err = error as ErrorWithData;
        if ("data" in err && typeof err.data?.error === "string") {
          errorMessage = err.data.error!;
        } else if ("message" in err && typeof err.message === "string") {
          errorMessage = err.message;
        }
      }
      toast.error(`Failed to change password: ${errorMessage}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Change Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password field for UX - not validated on backend by Supabase Auth */}
          <Input
            label="Current Password"
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Enter your current password"
          />
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
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            placeholder="Confirm your new password"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={
              isLoading ||
              !currentPassword ||
              !newPassword ||
              newPassword !== confirmNewPassword ||
              newPassword.length < 6
            }
            className="w-full py-3 text-lg"
          >
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
