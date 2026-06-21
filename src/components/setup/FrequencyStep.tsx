'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface FrequencyStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function FrequencyStep({ value, onChange }: FrequencyStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Training Frequency</h2>
        <p className="text-muted-foreground mt-1">
          How many days per week do you plan to train?
        </p>
      </div>
      <RadioGroup
        value={String(value)}
        onValueChange={(v) => onChange(parseInt(v, 10))}
        className="grid grid-cols-3 gap-4"
      >
        {[3, 4, 5].map((freq) => (
          <div key={freq}>
            <RadioGroupItem value={String(freq)} id={`freq-${freq}`} className="peer sr-only" />
            <Label
              htmlFor={`freq-${freq}`}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <span className="text-3xl font-bold">{freq}</span>
              <span className="text-sm text-muted-foreground">days/week</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Recommended:</strong> Start with 3 days/week if you are new to training.
            4-5 days is for those with more experience or time available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
