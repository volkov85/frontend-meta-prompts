export type Level = "junior" | "middle" | "senior";

export type IncludeSection =
  | "idealAnswer"
  | "commonMistakes"
  | "edgeCases"
  | "tradeOffs"
  | "seniorVsMiddle"
  | "scoringRubric"
  | "measurementPlan"
  | "rolloutPlan"
  | "securityConsiderations";

export type InterviewTemplate = {
  id: string;
  title: string;
  levels: Level[];
  focus: string[];
  questionStyles: string[];
  constraints?: string[];
  promptOverrides?: {
    followUps?: number;
    include?: IncludeSection[];
    plainLanguage?: boolean;
    goodAnswerCriteria?: string[];
  };
};

export type InterviewConfig = {
  version: string;
  defaults: {
    companyBar: string;
    stack: string[];
    language: "ru" | "en";
    followUps: number;
    include: IncludeSection[];
    simulation: boolean;
    timeboxedMinutes: number;
  };
  templates: InterviewTemplate[];
};

export type Session = {
  id: string;
  date: string;
  templateId: string;
  level: Level;
  score?: number;
  notes?: string;
};
