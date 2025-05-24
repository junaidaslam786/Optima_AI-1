import { PageHeader } from "../components/Dashboard/PageHeader";
import { HormonesSection } from "../components/Dashboard/HormonesSection";
import { InfoCard } from "../components/Dashboard/InfoCard";

export default function HomePage() {
  const recommendation =
    "Your testosterone markers are within range. Maintaining strength training and zinc intake is advised.";

  // Repeat the callout text 3× for sidebar scroll
  const sidebarText = Array(3).fill(recommendation).join("\n\n");

  return (
    <>
      {/* Left column */}
      <div className="flex-1">
        <PageHeader />
        {[1, 2, 3].map((_, idx) => (
          <HormonesSection key={idx} />
        ))}
      </div>

      {/* Right sidebar */}
      <InfoCard title={recommendation} body={sidebarText} />
    </>
  );
}
