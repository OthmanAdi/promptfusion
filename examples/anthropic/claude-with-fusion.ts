/**
 * Anthropic Claude + Prompt Fusion Integration Example
 *
 * Demonstrates how to use Prompt Fusion with Anthropic's Claude API
 * using the system parameter for dynamic prompt composition.
 *
 * Based on official Anthropic Claude documentation.
 */

import Anthropic from '@anthropic-ai/sdk';
import PromptFusionEngine from '../../core/promptFusionEngine.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const fusionEngine = new PromptFusionEngine();

// LAYER 1: Base System Prompt (Foundation & safety)
const baseSystemPrompt = `You are Claude, a helpful AI assistant by Anthropic.

CORE CAPABILITIES:
- Thoughtful analysis and reasoning
- Clear communication
- Ethical decision-making

OPERATING PRINCIPLES:
- Be helpful, harmless, and honest
- Acknowledge uncertainty
- Respect user privacy
- Provide citations when using specific knowledge`;

// LAYER 2: Brain System Prompt (Context & configuration)
const brainSystemPrompt = `CONTEXT: Research Assistant for Academic Work
DOMAIN: Scientific Literature Analysis

CONFIGURATION:
- Citation style: APA 7th edition
- Reading level: Graduate/postgraduate
- Focus: Empirical research and meta-analyses
- Source validation: Peer-reviewed only

RESPONSE FORMAT:
- Begin with key findings
- Support with evidence and citations
- Acknowledge limitations
- Suggest further research directions`;

// LAYER 3: Persona System Prompt (Role specialization)
const personaSystemPrompts = {
  methodologist: `SPECIALIZED ROLE: Research Methodologist

EXPERTISE:
- Experimental design and analysis
- Statistical methodology
- Research validity and reliability
- Systematic review protocols

FOCUS AREAS:
1. Methodological rigor assessment
2. Statistical approach evaluation
3. Bias and confound identification
4. Reproducibility considerations

OUTPUT STYLE:
- Technical precision
- Method-focused critique
- Quantitative emphasis
- Design recommendations`,

  theorist: `SPECIALIZED ROLE: Theoretical Analyst

EXPERTISE:
- Theoretical framework analysis
- Conceptual model development
- Paradigm evaluation
- Cross-disciplinary synthesis

FOCUS AREAS:
1. Theoretical foundation assessment
2. Conceptual coherence
3. Framework applicability
4. Paradigmatic assumptions

OUTPUT STYLE:
- Abstract reasoning
- Conceptual depth
- Interdisciplinary connections
- Philosophical grounding`
};

/**
 * Create fused system prompt for Claude
 */
function createFusedSystemPrompt(
  base: string,
  brain: string,
  persona: string = '',
  hasPersona: boolean = false
): string {
  // Determine weights
  const weights = hasPersona && persona
    ? { base: 0.2, brain: 0.3, persona: 0.5 }
    : { base: 0.4, brain: 0.6, persona: 0.0 };

  // Fuse prompts
  const fused = fusionEngine.semanticWeightedFusion(
    base,
    brain,
    persona,
    weights
  );

  return fused;
}

/**
 * Claude with Prompt Fusion
 */
async function claudeWithFusion(
  userMessage: string,
  personaType: 'methodologist' | 'theorist' | null = null
) {
  const personaContent = personaType ? personaSystemPrompts[personaType] : '';

  const systemPrompt = createFusedSystemPrompt(
    baseSystemPrompt,
    brainSystemPrompt,
    personaContent,
    personaType !== null
  );

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      { role: "user", content: userMessage }
    ]
  });

  return response.content[0].text;
}

/**
 * Claude with Extended Thinking + Prompt Fusion
 */
async function claudeWithThinkingAndFusion(
  userMessage: string,
  personaType: 'methodologist' | 'theorist' | null = null
) {
  const personaContent = personaType ? personaSystemPrompts[personaType] : '';

  const systemPrompt = createFusedSystemPrompt(
    baseSystemPrompt,
    brainSystemPrompt,
    personaContent,
    personaType !== null
  );

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    thinking: {
      type: "enabled",
      budget_tokens: 2048
    },
    system: systemPrompt,
    messages: [
      { role: "user", content: userMessage }
    ]
  });

  // Extract thinking and response
  const thinkingBlock = response.content.find(block => block.type === 'thinking');
  const textBlock = response.content.find(block => block.type === 'text');

  return {
    thinking: thinkingBlock?.thinking || '',
    response: textBlock?.text || ''
  };
}

/**
 * Streaming with Prompt Fusion
 */
async function streamingClaudeWithFusion(
  userMessage: string,
  personaType: 'methodologist' | 'theorist' | null = null,
  onChunk: (text: string) => void
) {
  const personaContent = personaType ? personaSystemPrompts[personaType] : '';

  const systemPrompt = createFusedSystemPrompt(
    baseSystemPrompt,
    brainSystemPrompt,
    personaContent,
    personaType !== null
  );

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      { role: "user", content: userMessage }
    ]
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onChunk(event.delta.text);
    }
  }
}

/**
 * Multi-turn conversation with fusion
 */
class ClaudeFusionChat {
  private messages: any[] = [];
  private currentPersona: 'methodologist' | 'theorist' | null = null;

  switchPersona(personaType: 'methodologist' | 'theorist' | null) {
    this.currentPersona = personaType;
    console.log(`Switched to persona: ${personaType || 'default'}`);
  }

  async send(userMessage: string): Promise<string> {
    // Add user message to history
    this.messages.push({ role: "user", content: userMessage });

    // Create fused system prompt
    const personaContent = this.currentPersona ? personaSystemPrompts[this.currentPersona] : '';
    const systemPrompt = createFusedSystemPrompt(
      baseSystemPrompt,
      brainSystemPrompt,
      personaContent,
      this.currentPersona !== null
    );

    // Call Claude
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: systemPrompt,
      messages: this.messages
    });

    const assistantMessage = response.content[0].text;

    // Add to history
    this.messages.push({ role: "assistant", content: assistantMessage });

    return assistantMessage;
  }

  getHistory() {
    return this.messages;
  }

  reset() {
    this.messages = [];
  }
}

/**
 * Example usage
 */
async function main() {
  console.log("=== Example 1: Basic Fusion ===");
  const response1 = await claudeWithFusion(
    "What are the key methodological considerations in randomized controlled trials?"
  );
  console.log(response1);

  console.log("\n=== Example 2: With Methodologist Persona ===");
  const response2 = await claudeWithFusion(
    "What are the key methodological considerations in randomized controlled trials?",
    'methodologist'
  );
  console.log(response2);

  console.log("\n=== Example 3: Multi-turn Conversation ===");
  const chat = new ClaudeFusionChat();

  // Start without persona
  let msg = await chat.send("What is meta-analysis?");
  console.log("Default:", msg);

  // Switch to theorist
  chat.switchPersona('theorist');
  msg = await chat.send("How does it relate to theory building?");
  console.log("Theorist:", msg);

  console.log("\n=== Example 4: Extended Thinking ===");
  const { thinking, response } = await claudeWithThinkingAndFusion(
    "Analyze the validity threats in quasi-experimental designs",
    'methodologist'
  );
  console.log("Thinking:", thinking);
  console.log("Response:", response);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  claudeWithFusion,
  claudeWithThinkingAndFusion,
  streamingClaudeWithFusion,
  ClaudeFusionChat
};
