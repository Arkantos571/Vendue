"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FoodAndBeverage } from "@/lib/mock/function-sheet";

const fields: { key: keyof FoodAndBeverage; label: string; multiline?: boolean }[] = [
  { key: "packageMenu", label: "Package / menu", multiline: true },
  { key: "dietaryRequirements", label: "Dietary requirements", multiline: true },
  { key: "barSetup", label: "Bar setup", multiline: true },
  { key: "drinksReceptionNotes", label: "Drinks reception notes", multiline: true },
  { key: "serviceStyle", label: "Service style" },
];

export function FoodBeverageCard({
  foodAndBeverage,
  onChange,
}: {
  foodAndBeverage: FoodAndBeverage;
  onChange: (value: FoodAndBeverage) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Food and beverage</CardTitle>
        <CardDescription>Menu, service, and bar details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map(({ key, label, multiline }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`fnb-${key}`}>{label}</Label>
            {multiline ? (
              <Textarea
                id={`fnb-${key}`}
                value={foodAndBeverage[key]}
                onChange={(event) => onChange({ ...foodAndBeverage, [key]: event.target.value })}
                rows={3}
              />
            ) : (
              <Input
                id={`fnb-${key}`}
                value={foodAndBeverage[key]}
                onChange={(event) => onChange({ ...foodAndBeverage, [key]: event.target.value })}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
