"use client";

import React from "react";
import SingleProductView from "@/components/Products/SingleProductView";
import { PartnerProduct } from "@/redux/features/partnerProducts/partnerProductsTypes";

const WomensHormonesPage = () => {
  // Mock product data for demonstration
  const product: PartnerProduct = {
    id: "womens-hormones",
    partner_id: "optima-ai",
    admin_product_id: "admin-womens-hormones",
    partner_price: 95.00,
    partner_name: "Women's Hormones Blood Test",
    partner_description: "A comprehensive hormonal health assessment specifically designed for women. This test analyzes key hormones including estrogen, progesterone, thyroid hormones, and reproductive health markers to provide insights into menstrual health, fertility, menopause, and overall hormonal balance.",
    partner_keywords: ["Women's Health", "Hormones", "Estrogen", "Progesterone", "Thyroid", "Fertility", "Menopause"],
    is_active: true,
    product_image_urls: ["/medical-kit2.jpg", "/medical-kit.jpg"],
    thumbnail_url: "/medical-kit2.jpg",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <SingleProductView product={product} />;
};

export default WomensHormonesPage;
