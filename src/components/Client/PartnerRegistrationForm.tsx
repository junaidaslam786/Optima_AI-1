"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api-client";
import { PartnerProfile } from "@/types/db";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { withAuth } from "../Auth/withAuth";
import { CreatePartnerProfile } from "@/types/db";

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

  const registerPartnerMutation = useMutation<
    PartnerProfile,
    Error,
    CreatePartnerProfile
  >({
    mutationFn: (newPartnerData) =>
      api.post<PartnerProfile>(
        "/partner_profiles",
        newPartnerData as unknown as Record<string, unknown>
      ),
    onSuccess: () => {
      toast.success("Partner registration submitted! Awaiting approval.");
      setCompanyName("");
      setCompanySlug("");
      setContactEmail(user?.email || "");
      setCompanyDescription("");
      setContactPersonName("");
      setContactPhone("");
      setAddress("");
      setCountry("");
      setPartnerStatus("pending");
    },
    onError: (error) => {
      toast.error(`Failed to register partner: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreatePartnerProfile = {
      user_id: user?.id || "",
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

    registerPartnerMutation.mutate(payload);
  };

  if (sessionLoading) {
    return (
      <div className="w-full flex justify-center items-center">
        <LoadingSpinner />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-8 bg-white shadow-lg rounded-lg">
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
        <div></div>

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
            isLoading={registerPartnerMutation.isPending || sessionLoading}
            className="w-full md:w-auto"
          >
            Submit Registration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default withAuth(PartnerRegistrationForm, {
  allowedRoles: ["client"],
});
