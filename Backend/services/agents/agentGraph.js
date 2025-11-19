// src/services/agent/agentGraph.js
import { START, END, StateGraph } from "@langchain/langgraph";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { createGoogleModel } from "./googleModel.js";
import { LAW_SYSTEM_PROMPT } from "./lawSystemPrompt.js";

const model = createGoogleModel();

// New correct LLM chain
const llmChain = RunnableSequence.from([
  (input) => [
    new SystemMessage(LAW_SYSTEM_PROMPT),
    new HumanMessage(input.user_message)
  ],

  model, // model.invoke([...messages])

  (response) => ({
    output: Array.isArray(response.content)
      ? response.content.map(c => c.text).join(" ")
      : response.content
  })
]);

// Graph: START → LLM → END
const graph = new StateGraph({
  channels: {
    user_message: {},
    output: {}
  }
})
  .addNode("llm_node", async (state) => {
    const result = await llmChain.invoke({
      user_message: state.user_message
    });

    return { output: result.output };
  })
  .addEdge(START, "llm_node")
  .addEdge("llm_node", END);

export const agentGraph = graph.compile();
