/**
 * OpenAI Agent SDK + Prompt Fusion Integration Example
 *
 * Demonstrates how to layer prompts using the OpenAI Agents SDK
 * instructions parameter combined with Prompt Fusion for dynamic
 * instruction composition.
 *
 * Based on official OpenAI Agent SDK documentation.
 */

import { Agent } from '@openai/agents'; // Hypothetical SDK
import PromptFusionEngine from '../../core/promptFusionEngine.js';

const fusionEngine = new PromptFusionEngine();

// LAYER 1: Base Instructions (Tool definitions & safety)
const baseInstructions = `You are a professional AI assistant with specialized capabilities.

CORE COMPETENCIES:
- Research and analysis
- Data processing
- Information synthesis

OPERATIONAL GUIDELINES:
- Validate all inputs before processing
- Cite sources when using external knowledge
- Acknowledge uncertainty when appropriate
- Maintain user privacy and data security`;

// LAYER 2: Brain Instructions (Workspace/Project configuration)
const brainInstructions = `PROJECT CONTEXT: Customer Analytics Platform
ENVIRONMENT: Production
ACCESS LEVEL: Analyst

PROJECT REQUIREMENTS:
- Focus on customer retention metrics
- Provide data-driven recommendations
- Use structured JSON for quantitative data
- Include confidence levels in predictions

DATA CONSTRAINTS:
- Access limited to anonymized customer data
- Maximum query size: 10,000 records
- Retention period: Last 24 months only`;

// LAYER 3: Persona Instructions (Role-specific behavior)
const personaInstructions = {
  analyst: `ROLE: Data Analyst

SPECIALIZATION:
- Statistical analysis and hypothesis testing
- Pattern recognition in customer behavior
- Predictive modeling for churn prevention

METHODOLOGY:
1. Define clear metrics
2. Gather relevant data
3. Apply statistical methods
4. Validate findings
5. Present actionable insights

COMMUNICATION STYLE:
- Technical but accessible
- Quantify everything
- Use visualizations when helpful
- Provide specific recommendations`,

  researcher: `ROLE: Research Specialist

SPECIALIZATION:
- Deep literature review
- Experimental design
- Source validation

METHODOLOGY:
1. Comprehensive information gathering
2. Critical evaluation of sources
3. Synthesis of findings
4. Academic-style documentation

COMMUNICATION STYLE:
- Formal academic tone
- Complete citations
- Detailed explanations
- Transparent about limitations`
};

/**
 * Create a fused instruction set for OpenAI Agent
 */
function createFusedInstructions(
  base: string,
  brain: string,
  persona: string = '',
  personaActive: boolean = false
): string {
  // Determine weights
  const weights = personaActive && persona
    ? { base: 0.2, brain: 0.3, persona: 0.5 }
    : { base: 0.4, brain: 0.6, persona: 0.0 };

  // Fuse with semantic weighting
  const fused = fusionEngine.semanticWeightedFusion(
    base,
    brain,
    persona,
    weights
  );

  return fused;
}

/**
 * Create an OpenAI agent with fused instructions
 */
function createFusionAgent(
  personaType: 'analyst' | 'researcher' | null = null
) {
  const personaContent = personaType ? personaInstructions[personaType] : '';

  const fusedInstructions = createFusedInstructions(
    baseInstructions,
    brainInstructions,
    personaContent,
    personaType !== null
  );

  const agent = new Agent({
    name: personaType ? `${personaType}_agent` : 'default_agent',
    model: "gpt-4o",
    instructions: fusedInstructions,
    tools: [
      // Define your tools here
    ]
  });

  return agent;
}

/**
 * Dynamic persona switching
 */
class AdaptiveAgent {
  private baseInstructions: string;
  private brainInstructions: string;
  private currentAgent: any;
  private currentPersona: string | null = null;

  constructor(base: string, brain: string) {
    this.baseInstructions = base;
    this.brainInstructions = brain;
    this.currentAgent = this.createAgent(null);
  }

  private createAgent(personaType: 'analyst' | 'researcher' | null) {
    return createFusionAgent(personaType);
  }

  switchPersona(personaType: 'analyst' | 'researcher' | null) {
    if (this.currentPersona !== personaType) {
      console.log(`Switching persona from ${this.currentPersona} to ${personaType}`);
      this.currentAgent = this.createAgent(personaType);
      this.currentPersona = personaType;
    }
  }

  async run(userMessage: string) {
    return await this.currentAgent.run(userMessage);
  }
}

/**
 * Example usage
 */
async function main() {
  // Create adaptive agent
  const agent = new AdaptiveAgent(baseInstructions, brainInstructions);

  // Start without persona (brain-heavy)
  let response = await agent.run("What metrics should we track?");
  console.log("Default response:", response);

  // Switch to analyst persona (persona-heavy)
  agent.switchPersona('analyst');
  response = await agent.run("Analyze our customer retention rate");
  console.log("Analyst response:", response);

  // Switch to researcher persona
  agent.switchPersona('researcher');
  response = await agent.run("What does literature say about retention strategies?");
  console.log("Researcher response:", response);
}

/**
 * Template-based approach for multiple configurations
 */
interface AgentConfig {
  role: string;
  domain: string;
  constraints: string[];
  guidelines: string[];
}

function createConfiguredAgent(config: AgentConfig): any {
  const brainPrompt = `ROLE: ${config.role}
DOMAIN: ${config.domain}

CONSTRAINTS:
${config.constraints.map(c => `- ${c}`).join('\n')}

GUIDELINES:
${config.guidelines.map(g => `- ${g}`).join('\n')}`;

  const fusedInstructions = createFusedInstructions(
    baseInstructions,
    brainPrompt,
    '', // No persona
    false
  );

  return new Agent({
    name: `${config.role}_agent`,
    model: "gpt-4o",
    instructions: fusedInstructions
  });
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createFusionAgent, AdaptiveAgent, createConfiguredAgent };
