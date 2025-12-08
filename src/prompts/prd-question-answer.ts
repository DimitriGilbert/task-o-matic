export const PRD_QUESTION_ANSWER_PROMPT = `You are a product expert helping to clarify a PRD.

PRD Content:
{PRD_CONTENT}{CONTEXT_TEXT}

Please answer the following questions based on the PRD and context:

{QUESTIONS_TEXT}

Provide thoughtful, specific answers that will help refine the PRD.
Format your response as JSON with the following structure:
{
  "answers": {
    "1": "answer to question 1",
    "2": "answer to question 2",
    ...
  }
}`;

export const PRD_QUESTION_ANSWER_SYSTEM_PROMPT = `You are a product expert analyzing PRDs and answering clarifying questions.
Your answers should be:
- Specific and actionable
- Based on the PRD content and project context
- Helpful for refining the PRD
- Formatted as JSON`;
