export type Evaluation = {
  score: number; // 0-10
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export const basicScoreEvaluation = (answer: string): Evaluation => {
  const lengthScore = Math.min(answer.length / 200, 3); // до 3 баллов
  const tradeOffBonus = answer.toLowerCase().includes("trade-off") ? 2 : 0;
  const complexityBonus = answer.toLowerCase().includes("o(") ? 2 : 0;

  const rawScore = lengthScore + tradeOffBonus + complexityBonus;
  const score = Math.min(Math.round(rawScore), 10);

  return {
    score,
    strengths: [
      tradeOffBonus ? "Discussed trade-offs" : "",
      complexityBonus ? "Mentioned complexity analysis" : "",
    ].filter(Boolean),
    weaknesses: score < 6 ? ["Answer lacks depth or structure"] : [],
    recommendations:
      score < 7
        ? ["Add trade-offs", "Add edge cases", "Be more structured"]
        : ["Improve clarity and communication polish"],
  };
};
