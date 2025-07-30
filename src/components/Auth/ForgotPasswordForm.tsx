"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApi";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      const redirectToUrl = `${window.location.origin}/auth/update-password`;

      const response = await forgotPassword({
        email,
        redirectTo: redirectToUrl,
      }).unwrap();
      toast.success(response.message);
      setMessage(response.message);
      setEmail("");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error?.data?.error ||
        error?.message ||
        "Failed to send reset email. Please try again.";
      toast.error(errorMessage);
      setMessage(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Forgot Password
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@example.com"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || !email}
            className="w-full py-3 text-lg"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/auth/login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
