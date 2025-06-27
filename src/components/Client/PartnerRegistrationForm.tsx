"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react"; // Make sure this path is correct
import FullPageLoader from "@/components/ui/FullPageLoader"; // Import the FullPageLoader
import { withAuth } from "../Auth/withAuth";
import { CreatePartnerProfile } from "@/redux/features/partnerProfiles/partnerProfilesTypes";
import { useCreatePartnerProfileMutation } from "@/redux/features/partnerProfiles/partnerProfilesApi"; // Import the RTK Query hook

const PartnerRegistrationForm: React.FC = () => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const sessionLoading = status === "loading";

  // required
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");

  // optional CreatePartnerProfile fields
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [partnerStatus, setPartnerStatus] =
    useState<CreatePartnerProfile["partner_status"]>("pending");

  // Redux Toolkit Query mutation hook
  const [
    createPartnerProfile,
    {
      isLoading: isCreatingPartner, // RTK Query gives us isLoading directly
      isSuccess: createSuccess,
      isError: createError,
      error: createErrorDetails,
    },
  ] = useCreatePartnerProfileMutation();

  // Handle side effects of the mutation (success/error toasts)
  useEffect(() => {
    if (createSuccess) {
      toast.success("Partner registration submitted! Awaiting approval.");
      // Reset form fields on success
      setCompanyName("");
      setCompanySlug("");
      setContactEmail(user?.email || ""); // Reset to current user email or empty
      setCompanyDescription("");
      setContactPersonName("");
      setContactPhone("");
      setAddress("");
      setCountry("");
      setPartnerStatus("pending");
    }
    if (createError) {
      let errorMessage = "Failed to register partner: Unknown error";
      // Assuming createErrorDetails might be an object with 'data' or 'error' property from RTK Query
      if (
        createErrorDetails &&
        "data" in createErrorDetails &&
        typeof createErrorDetails.data === "string"
      ) {
        errorMessage = `Failed to register partner: ${createErrorDetails.data}`;
      } else if (
        createErrorDetails &&
        "message" in createErrorDetails &&
        typeof createErrorDetails.message === "string"
      ) {
        errorMessage = `Failed to register partner: ${createErrorDetails.message}`;
      } else if (
        createErrorDetails &&
        "error" in createErrorDetails &&
        typeof createErrorDetails.error === "string"
      ) {
        errorMessage = `Failed to register partner: ${createErrorDetails.error}`;
      }
      toast.error(errorMessage);
    }
  }, [createSuccess, createError, createErrorDetails, user?.email]); // Add user?.email to dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!user?.id) {
      toast.error("User ID not available. Please log in.");
      return;
    }
    if (!companyName || !companySlug || !contactEmail) {
      toast.error(
        "Please fill in all required fields (Company Name, Company Slug, Contact Email)."
      );
      return;
    }

    const payload: CreatePartnerProfile = {
      user_id: user.id, // Ensure user.id is used here
      company_name: companyName,
      company_slug: companySlug,
      contact_email: contactEmail,
      // only include optional fields if they have values
      ...(companyDescription && { company_description: companyDescription }),
      ...(contactPersonName && { contact_person_name: contactPersonName }),
      ...(contactPhone && { contact_phone: contactPhone }),
      ...(address && { address }),
      ...(country && { country }),
      partner_status: partnerStatus,
    };

    try {
      await createPartnerProfile(payload).unwrap();
      // Success is handled by the useEffect above
    } catch (err) {
      // Error is handled by the useEffect above
      console.error("Partner registration submission failed:", err);
    }
  };

  // Determine global loading state for the FullPageLoader
  const globalLoading = sessionLoading || isCreatingPartner;
  let globalLoadingMessage = "";
  if (sessionLoading) {
    globalLoadingMessage = "Loading user data...";
  } else if (isCreatingPartner) {
    globalLoadingMessage = "Submitting partner registration...";
  }

  return (
    <div className="w-full mx-auto p-8 bg-white shadow-lg rounded-lg relative">
      {" "}
      {/* Add relative for FullPageLoader positioning */}
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">
        Become Our Partner
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Required Fields */}
        <Input
          id="companyName"
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          placeholder="e.g., My Awesome Brand"
        />
        <Input
          id="companySlug"
          label="Company Slug"
          value={companySlug}
          onChange={(e) => setCompanySlug(e.target.value)}
          required
          placeholder="e.g., my-awesome-brand"
          pattern="[-a-z0-9]+"
          title="Lowercase letters, numbers, and hyphens only."
        />
        <Input
          id="contactEmail"
          label="Contact Email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          placeholder="contact@yourcompany.com"
        />
        <div></div> {/* Empty div for grid alignment */}
        {/* Optional Fields */}
        <Input
          id="contactPersonName"
          label="Contact Person Name"
          value={contactPersonName}
          onChange={(e) => setContactPersonName(e.target.value)}
          placeholder="Name of primary contact"
        />
        <Input
          id="contactPhone"
          label="Contact Phone"
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="+44 20 7123 4567"
        />
        <Input
          id="address"
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street, City, ZIP"
        />
        <Input
          id="country"
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g., United Kingdom"
        />
        <Textarea
          id="companyDescription"
          label="Company Description"
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
          placeholder="Brief description about your company"
        />
        {/* Submit Button */}
        <div className="col-span-full flex justify-end">
          <Button
            type="submit"
            isLoading={isCreatingPartner} // Only show button loader for the specific mutation
            className="w-full md:w-auto"
            disabled={sessionLoading || isCreatingPartner} // Disable if session loading or mutation in progress
          >
            Submit Registration
          </Button>
        </div>
      </form>
      {/* Full Page Loader */}
      <FullPageLoader
        isLoading={globalLoading}
        message={globalLoadingMessage}
      />
    </div>
  );
};

export default withAuth(PartnerRegistrationForm, {
  allowedRoles: ["client"],
});
