// components/customer/PartnerList.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button'; // Import Button
import { api } from '@/lib/api-client';
import { PartnerProfile } from '@/types/db';
import Link from 'next/link';

const PartnerList: React.FC = () => {
  const { data: partners, isLoading, isError, error } = useQuery<PartnerProfile[], Error>({
    queryKey: ['approvedPartners'],
    queryFn: () => api.get('/partner_profiles'), // Your API route needs to filter by status='approved' or handle it here
    select: (data) => data.filter(p => p.partner_status === 'approved')
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /><p className="ml-2">Loading partners...</p></div>;
  }

  if (isError) {
    return <div className="text-center text-red-600 mt-10"><Alert type="error" message={`Error: ${error?.message || 'Failed to load partners'}`} /></div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Our Trusted Partners</h1>
      {partners?.length === 0 ? (
        <p className="text-gray-600 text-center py-8 text-lg">No approved partners found at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners?.map((partner) => (
            <div key={partner.id} className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{partner.company_name}</h2>
              <p className="text-gray-600 mb-4">{partner.company_slug}</p>
              <p className="text-sm text-gray-500 mb-4">Contact: {partner.contact_email}</p>
              <Link href={`/partners/${partner.id}/products`}>
                <Button variant="primary" size="md" type="button">View Products</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnerList;