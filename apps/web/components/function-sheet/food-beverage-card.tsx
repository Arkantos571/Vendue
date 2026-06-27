import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FoodAndBeverage } from "@/lib/mock/function-sheet";

export function FoodBeverageCard({ foodAndBeverage }: { foodAndBeverage: FoodAndBeverage }) {
  const items = [
    { label: "Package / menu", value: foodAndBeverage.packageMenu },
    { label: "Dietary requirements", value: foodAndBeverage.dietaryRequirements },
    { label: "Bar setup", value: foodAndBeverage.barSetup },
    { label: "Drinks reception notes", value: foodAndBeverage.drinksReceptionNotes },
    { label: "Service style", value: foodAndBeverage.serviceStyle },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Food and beverage</CardTitle>
        <CardDescription>Menu, service, and bar details.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          {items.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-stone-700">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
