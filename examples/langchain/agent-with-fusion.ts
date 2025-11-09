/**
 * LangChain + Prompt Fusion Integration Example
 *
 * Demonstrates how to use Prompt Fusion with LangChain's createReactAgent
 * using the messageModifier pattern for dynamic prompt composition.
 *
 * Based on official LangChain documentation and production patterns.
 */

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { SystemMessage } from "@langchain/core/messages";
import PromptFusionEngine from "../../core/promptFusionEngine.js";

// Initialize fusion engine
const fusionEngine = new PromptFusionEngine();

// Define your tools
const searchTool = tool(
  async ({ query }) => {
    // Implementation
    return `Search results for: ${query}`;
  },
  {
    name: "search_knowledge",
    description: "Search the knowledge graph",
    schema: z.object({
      query: z.string().describe("Search query"),
    }),
  }
);

const tools = [searchTool];

// LAYER 1: Base Prompt (Tool definitions & safety rules)
const basePrompt = `You are an AI assistant with knowledge graph access.

AVAILABLE TOOLS:
- search_knowledge: Query the knowledge graph for entities and relationships

SAFETY RULES:
- Always validate search queries
- Never expose sensitive information
- Cite sources when using knowledge graph data`;

// LAYER 2: Brain Prompt (Workspace configuration)
const brainPrompt = `WORKSPACE: Customer Analytics
ENVIRONMENT: Production

CONFIGURATION:
- Maximum query depth: 5 levels
- Response format: Structured with citations
- Data access: Read-only

GUIDELINES:
- Focus on data-driven insights
- Provide quantitative analysis when possible
- Always include confidence levels`;

// LAYER 3: Persona Prompt (Role overlay - loaded dynamically)
async function getPersonaForChat(chatId: string): Promise<{id: string, content: string} | null> {
  // In production: fetch from database/Redis
  // Example personas:
  const personas = {
    'analyst': {
      id: 'analyst',
      content: `You are a DATA ANALYST role.

SPECIALIZATION:
- Statistical analysis and pattern recognition
- Data visualization recommendations
- Trend identification and forecasting

TOOL PERMISSIONS:
- search_knowledge: Full access
- Query limit: 1000 records per request

COMMUNICATION STYLE:
- Technical but accessible
- Always quantify findings
- Provide actionable insights`
    },
    'researcher': {
      id: 'researcher',
      content: `You are a RESEARCH SPECIALIST role.

SPECIALIZATION:
- Deep empirical investigation
- Source validation and citation
- Comprehensive literature review

TOOL PERMISSIONS:
- search_knowledge: Full access
- Query limit: Unlimited

COMMUNICATION STYLE:
- Academic rigor
- Detailed explanations
- Complete source attribution`
    }
  };

  // For this example, return analyst persona
  return personas['analyst'];
}

// Create messageModifier with Prompt Fusion
function createFusionModifier(
  basePrompt: string,
  brainPrompt: string,
  getPersona: (chatId: string) => Promise<{id: string, content: string} | null>
) {
  return async (messages: any[], config: any) => {
    const chatId = config?.configurable?.thread_id || 'default';

    // Fetch persona dynamically
    const personaData = await getPersona(chatId);
    const personaContent = personaData?.content || '';
    const personaId = personaData?.id || 'default';

    // Determine weights based on persona presence
    const weights = personaId !== 'default' && personaContent
      ? { base: 0.2, brain: 0.3, persona: 0.5 }  // Persona dominates
      : { base: 0.4, brain: 0.6, persona: 0.0 }; // Brain dominates

    // Fuse prompts with semantic weighting
    const fusedContent = fusionEngine.semanticWeightedFusion(
      basePrompt,
      brainPrompt,
      personaContent,
      weights
    );

    // Create system message
    const systemMessage = new SystemMessage(fusedContent);

    // Prepend to messages
    return [systemMessage, ...messages];
  };
}

// Create the agent
const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

const agent = createReactAgent({
  llm: model,
  tools: tools,
  messageModifier: createFusionModifier(basePrompt, brainPrompt, getPersonaForChat)
});

// Use the agent
async function main() {
  const config = { configurable: { thread_id: "user-123-chat-456" } };

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Analyze customer retention trends" }],
  }, config);

  console.log(result.messages[result.messages.length - 1].content);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { agent, createFusionModifier };
