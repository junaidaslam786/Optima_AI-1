// components/Auth/withAuth.tsx
"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";

interface WithAuthOptions {
  allowedRoles?: string[];
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: WithAuthOptions
) {
  const { allowedRoles } = options ?? {};
  return function ProtectedRoute(props: P) {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";
    const userRole = session?.user?.role;
    const isAuthorized = allowedRoles
      ? userRole != null && allowedRoles.includes(userRole)
      : isAuthenticated;

    const [notified, setNotified] = useState(false);

    useEffect(() => {
      if (!isLoading && !notified) {
        if (!isAuthenticated) {
          setNotified(true);
          toast.error("You must be signed in to view this page.", {
            id: "auth-error",
          });
          setTimeout(() => window.history.back(), 1000);
        } else if (allowedRoles && !isAuthorized) {
          setNotified(true);
          toast.error("You don't have access to this page.", {
            id: "auth-error",
          });
          setTimeout(() => window.history.back(), 1000);
        }
      }
    }, [isLoading, isAuthenticated, isAuthorized, notified]);

    if (isLoading) {
      return (
        <div className="w-full h-full flex justify-center items-center bg-secondary/10 py-8">
          <div className="flex justify-center items-center">
            <LoadingSpinner />
            <p className="ml-2 text-primary">Checking authentication…</p>
          </div>
        </div>
      );
    }

    if (isAuthenticated && isAuthorized) {
      return <Component {...props} />;
    }

    return null;
  };
}
