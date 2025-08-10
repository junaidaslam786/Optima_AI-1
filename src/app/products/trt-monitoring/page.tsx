"use client";

import React from "react";
import SingleProductView from "@/components/Products/SingleProductView";
import { PartnerProduct } from "@/redux/features/partnerProducts/partnerProductsTypes";

const TRTMonitoringPage = () => {
  // Mock product data for demonstration
  const product: PartnerProduct = {
    id: "trt-monitoring",
    partner_id: "optima-ai",
    admin_product_id: "admin-trt-monitoring",
    partner_price: 125.00,
    partner_name: "TRT Monitoring Blood Test",
    partner_description: "Comprehensive monitoring panel for men on Testosterone Replacement Therapy (TRT). This specialized test tracks testosterone levels, estradiol, hematocrit, PSA, and liver function to ensure safe and effective hormone therapy. Essential for ongoing TRT management and optimization.",
    partner_keywords: ["TRT", "Testosterone", "Hormone Therapy", "Men's Health", "Monitoring", "Optimization", "Safety"],
    is_active: true,
    product_image_urls: ["/medical-kit2.jpg", "/medical-kit.jpg"],
    thumbnail_url: "/medical-kit2.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <SingleProductView product={product} />;
};

export default TRTMonitoringPage;
