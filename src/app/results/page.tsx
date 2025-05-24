// app/results/page.tsx
import { BiomarkerCard } from "@/components/Results/BioMarkerCard";

export default function ResultsPage() {
  const cards = [
    { title: "Biomarker Name", value: 587, unit: "ng/dL", min: 264, max: 916 },
    { title: "Biomarker Name", value: 587, unit: "ng/dL", min: 264, max: 916 },
    { title: "Biomarker Name", value: 587, unit: "ng/dL", min: 264, max: 916 },
  ];

  const insights = [
    "Maintain a balanced diet rich in fruits and vegetables, especially zinc and vitamin D",
    "Prioritize resistance training to enhance muscle mass and strength",
    "Aim to manage weight through a combination of a healthy diet and consistent physical activity",
    "Increased testosterone levels can lead to improved energy levels and strength",
    "Maintain a balanced diet rich in fruits and vegetables, especially zinc and vitamin D",
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-8">
        {/* Page title */}
        <h1 className="text-3xl font-bold text-gray-900">
          Testosterone Results
        </h1>

        {/* two-column layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: list of cards */}
          <div className="space-y-6">
            {cards.map((c, i) => (
              <BiomarkerCard
                key={i}
                title={c.title}
                value={c.value}
                unit={c.unit}
                min={c.min}
                max={c.max}
              />
            ))}
          </div>

          {/* RIGHT: insights sidebar */}
          <aside>
            <div className="bg-cyan-50 rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-medium text-gray-800">
                Insights from Optima.AI
              </h2>
              <p className="text-gray-700">
                Optimizing testosterone level can optimize energy levels and
                strength.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {insights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
