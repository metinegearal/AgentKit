// apps/actions/orchestrate.ts
"use server"

import { lamaticClient } from "../lib/lamatic-client"

// ---------------------------------------------------------
// FLOW 1: Generate Text/Context
// ---------------------------------------------------------
export async function generateTextContext(
  level: string,
  context: string,
  words: string[]
) {
  try {
    // Read directly from environment variables to bypass Next.js external directory build limits
    const workflowId = process.env.NEXT_PUBLIC_LESSON_FLOW_ID;
    if (!workflowId) throw new Error("NEXT_PUBLIC_LESSON_FLOW_ID not found in environment variables");

    const query = `
      query ExecuteWorkflow($workflowId: String!, $context: String, $level: String, $words: [String]) {
        executeWorkflow(
          workflowId: $workflowId
          payload: { context: $context, level: $level, words: $words }
        ) {
          status
          result
        }
      }`;

    const variables = {
      workflowId,
      level,
      context,
      words
    };

    const response = await lamaticClient.executeGraphQL(query, variables);
    return { success: true, data: response.result };

  } catch (error: unknown) {
    console.error("Text Generation Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------
// FLOW 2: Generate Questions
// ---------------------------------------------------------
export async function generateQuestions(
  level: string,
  storyContext: string,
  text: string,
  questionNumber: number,
  counts: { grammar: number; vocabulary: number; context: number; kanji: number }
) {
  try {
    const workflowId = process.env.NEXT_PUBLIC_QUIZ_FLOW_ID;
    if (!workflowId) throw new Error("NEXT_PUBLIC_QUIZ_FLOW_ID not found in environment variables");

    const query = `
      query ExecuteWorkflow(
        $workflowId: String!
        $level: String
        $context: String
        $question_number: Int
        $grammar: Int
        $vocabulary: Int
        $q_context: Int
        $kanji: Int
        $text: String        
      ) {
        executeWorkflow(
          workflowId: $workflowId
          payload: {
            level: $level
            context: $context
            question_number: $question_number
            question_counts: {
              grammar: $grammar
              vocabulary: $vocabulary
              context: $q_context
              kanji: $kanji
            }    
            text: $text
          }
        ) {
            status
            result
        }
      }`;

    const variables = {
      workflowId,
      level,
      context: storyContext,
      question_number: questionNumber,
      grammar: counts.grammar,
      vocabulary: counts.vocabulary,
      q_context: counts.context, 
      kanji: counts.kanji,
      text
    };

    const response = await lamaticClient.executeGraphQL(query, variables);
    return { success: true, data: response.result };

  } catch (error: unknown) {
    console.error("Question Generation Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}