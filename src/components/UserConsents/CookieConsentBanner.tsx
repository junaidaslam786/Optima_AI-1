import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideCookieBanner } from "@/redux/features/userConsents/userConsentsSlice";
import { useRecordUserConsentMutation } from "@/redux/features/userConsents/userConsentsApi";
import { selectIsCookieBannerVisible } from "@/redux/features/userConsents/userConsentsSelectors";
import Link from "next/link";
import { useSession } from "next-auth/react";

const COOKIE_CONSENT_VERSION = "1.0";

const CookieConsentBanner: React.FC = () => {
  const session = useSession();
  const dispatch = useDispatch();
  const isVisible = useSelector(selectIsCookieBannerVisible);

  const [recordConsent] = useRecordUserConsentMutation();

  useEffect(() => {
    const storedInteraction = localStorage.getItem(
      "hasInteractedWithCookieBanner"
    );
    if (storedInteraction === "true") {
      dispatch(hideCookieBanner());
    }
  }, [dispatch]);

  const handleConsent = async (agreed: boolean) => {
    try {
      await recordConsent({
        agreed,
        consent_type: "cookies",
        consent_version: COOKIE_CONSENT_VERSION,
        user_id: session.data?.user.id,
        user_agent: navigator.userAgent,
        notes: agreed ? "User accepted cookies" : "User declined cookies",
      }).unwrap();
      dispatch(hideCookieBanner());
      localStorage.setItem("hasInteractedWithCookieBanner", "true");
    } catch (error) {
      console.error("Failed to record user consent:", error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex flex-col md:flex-row items-center justify-between shadow-lg z-50">
      <p className="text-sm mb-3 md:mb-0 md:mr-4">
        We use cookies to ensure you get the best experience on our website.{" "}
        <Link href="/privacy-policy" className="underline">
          Learn more
        </Link>
        .
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => handleConsent(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Accept
        </button>
        <button
          onClick={() => handleConsent(false)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
