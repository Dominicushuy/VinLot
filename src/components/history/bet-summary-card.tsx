// src/components/history/bet-summary-card.tsx
import { Card, CardContent } from "@/components/ui/card";

interface BetSummaryCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: "ticket" | "hourglass" | "trophy" | "trending-up";
  valueColor?: string;
}

export function BetSummaryCard({
  title,
  value,
  subValue,
  icon,
  valueColor = "text-gray-900",
}: BetSummaryCardProps) {
  // Map các icon
  const iconMap = {
    ticket: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 9a1 1 0 0 1 .97-.754h16.06a1 1 0 0 1 .97 1.255L18.75 15l-1.477 4.42A1 1 0 0 1 16.328 20H5.67a1 1 0 0 1-.946-.58L3.25 15 2 9.5V9z" />
        <path d="M2 9v7" />
        <path d="M22 9v7" />
        <rect width="18" height="2" x="3" y="5" rx="1" />
      </svg>
    ),
    hourglass: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 22h14" />
        <path d="M5 2h14" />
        <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
        <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
      </svg>
    ),
    trophy: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 22v-4" />
        <path d="M14 22v-4" />
        <path d="M8 22v-7.36a4 4 0 0 0-1.143-2.804l-.668-.668A3.998 3.998 0 0 1 5 7.822V2h14v5.822a4 4 0 0 1-1.189 2.85l-.668.668A4 4 0 0 0 16 13.64V22" />
      </svg>
    ),
    "trending-up": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
            {subValue && (
              <p className="text-sm text-gray-500 mt-1">{subValue}</p>
            )}
          </div>
          <div className="p-2 bg-gray-100 rounded-md text-gray-500">
            {iconMap[icon]}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
