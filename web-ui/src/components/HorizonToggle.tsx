import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { UI_COPY } from "../lib/uiCopy";
import { InterviewLanguage } from "../lib/types";

export const HORIZON_OPTIONS = [12, 26, 52] as const;
export type HorizonWeeks = (typeof HORIZON_OPTIONS)[number];

type HorizonToggleProps = {
  language: InterviewLanguage;
  value: HorizonWeeks;
  onChange: (next: HorizonWeeks) => void;
};

export const HorizonToggle = ({ language, value, onChange }: HorizonToggleProps) => {
  const copy = UI_COPY[language];

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, next) => {
        if (next !== null) onChange(next as HorizonWeeks);
      }}
      aria-label={copy.horizonToggleAriaLabel}
    >
      {HORIZON_OPTIONS.map((weeks) => (
        <ToggleButton
          key={weeks}
          value={weeks}
          aria-label={copy.horizonToggleOption(weeks)}
          sx={{ px: 1.25, py: 0.25, lineHeight: 1.2, textTransform: "none" }}
        >
          {copy.horizonToggleOption(weeks)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
