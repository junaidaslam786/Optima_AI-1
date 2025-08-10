"use client";

import React from "react";
import SingleProductView from "@/components/Products/SingleProductView";
import { PartnerProduct } from "@/redux/features/partnerProducts/partnerProductsTypes";

const UltimatePerformancePage = () => {
  // Mock product data for demonstration
  const product: PartnerProduct = {
    id: "ultimate-performance",
    partner_id: "optima-ai",
    admin_product_id: "admin-ultimate-performance",
    partner_price: 85.00,
    partner_name: "Ultimate Performance Blood Test",
    partner_description: "Comprehensive blood analysis designed for athletes and fitness enthusiasts. This advanced test provides insights into key performance markers including testosterone, cortisol, vitamin D, iron levels, and metabolic markers that directly impact your athletic performance and recovery.",
    partner_keywords: ["Performance", "Athletes", "Testosterone", "Recovery", "Fitness", "Comprehensive"],
    is_active: true,
    product_image_urls: ["/medical-kit.jpg", "/medical-kit2.jpg"],
    thumbnail_url: "/medical-kit.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <SingleProductView product={product} />;
};

export default UltimatePerformancePage;
