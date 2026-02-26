import interviews from "./data/interviews.json";
import { composeInterviewPrompt } from "./engine";
import { createSession, updateSessionScore } from "./engine";
import { basicScoreEvaluation } from "./engine";

const templateId = "js-deep-dive-core";
const level = "senior";

const session = createSession(templateId, level);

const prompt = composeInterviewPrompt(interviews as any, {
  templateId,
  level,
});

console.log(prompt);

const myAnswer = "Here is my answer...";

const evaluation = basicScoreEvaluation(myAnswer);

updateSessionScore(session.id, evaluation.score);

console.log(evaluation);
