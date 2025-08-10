"use client";

import React from "react";
import SingleProductView from "@/components/Products/SingleProductView";
import { PartnerProduct } from "@/redux/features/partnerProducts/partnerProductsTypes";

const LiverFunctionPage = () => {
  // Mock product data for demonstration
  const product: PartnerProduct = {
    id: "liver-function",
    partner_id: "optima-ai",
    admin_product_id: "admin-liver-function",
    partner_price: 30.00,
    partner_name: "Liver Function Blood Test",
    partner_description: "Essential liver health screening that measures key liver enzymes and proteins. This test evaluates how well your liver is working and can detect liver damage, disease, or dysfunction early. Perfect for monitoring liver health, especially if you take medications, consume alcohol, or have risk factors for liver disease.",
    partner_keywords: ["Liver Health", "Enzymes", "ALT", "AST", "Screening", "Early Detection"],
    is_active: true,
    product_image_urls: ["/medical-kit.jpg"],
    thumbnail_url: "/medical-kit.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <SingleProductView product={product} />;
};

export default LiverFunctionPage;
