# OpenAI SDK + Prompt Fusion Integration

**Note:** This example demonstrates the *pattern* for integrating Prompt Fusion with agent-style frameworks using an `instructions` parameter. The `@openai/agents` package shown is conceptual - adapt this pattern to your actual OpenAI implementation (Assistants API, function calling, etc.).

## What This Does

Shows how to:
- Fuse prompts into a single `instructions` string for agent initialization
- Create an `AdaptiveAgent` class that switches personas dynamically
- Use template-based configuration for different agent roles

The key difference from LangChain: fusion happens **once at initialization** or **when switching personas**, not per-message.

## Prerequisites

- Node.js 18+
- OpenAI API key
- Your chosen OpenAI implementation (Assistants API, custom agent framework, etc.)

## Installation

For OpenAI Assistants API (real implementation):

```bash
npm install openai
```

For the conceptual pattern shown in the example:

```bash
# This package doesn't exist - adapt the pattern to your framework
npm install openai
```

## Setup

Create a `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## Adapting to OpenAI Assistants API

Since `@openai/agents` is conceptual, here's how to adapt this to the real **Assistants API**:

```typescript
import OpenAI from 'openai';
import PromptFusionEngine from '../../core/promptFusionEngine.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const fusionEngine = new PromptFusionEngine();

// Fuse your prompts
const fusedInstructions = fusionEngine.semanticWeightedFusion(
  baseInstructions,
  brainInstructions,
  personaInstructions['analyst'],
  { base: 0.2, brain: 0.3, persona: 0.5 }
);

// Create Assistant with fused instructions
const assistant = await openai.beta.assistants.create({
  name: "Customer Analytics Agent",
  instructions: fusedInstructions,
  model: "gpt-4o",
  tools: [{ type: "code_interpreter" }]
});

// Create thread and run
const thread = await openai.beta.threads.create();
await openai.beta.threads.messages.create(thread.id, {
  role: "user",
  content: "Analyze customer retention trends"
});

const run = await openai.beta.threads.runs.create(thread.id, {
  assistant_id: assistant.id
});
```

## Code Overview

### Pattern: Pre-Fusion at Initialization

```typescript
function createFusionAgent(personaType) {
  const fusedInstructions = createFusedInstructions(
    baseInstructions,
    brainInstructions,
    personaContent,
    personaType !== null
  );

  return new Agent({
    instructions: fusedInstructions,  // Fused once here
    // ... other config
  });
}
```

### Pattern: Dynamic Persona Switching

The `AdaptiveAgent` class recreates the agent when persona changes:

```typescript
class AdaptiveAgent {
  switchPersona(personaType) {
    this.currentAgent = this.createAgent(personaType);  // Re-fuse & recreate
  }
}
```

### Weight Logic

```typescript
const weights = personaActive
  ? { base: 0.2, brain: 0.3, persona: 0.5 }  // Persona dominates
  : { base: 0.4, brain: 0.6, persona: 0.0 }; // Brain dominates
```

## When to Use This Pattern

Use **initialization-time fusion** when:
- Your framework uses a static `instructions` parameter
- Persona changes are infrequent
- You want to minimize per-message overhead

Use **per-message fusion** (like LangChain example) when:
- Persona can change between messages
- You need dynamic context injection
- Framework supports message-level hooks

## Customization

### Template-Based Agents

```typescript
const config: AgentConfig = {
  role: "Data Scientist",
  domain: "Healthcare Analytics",
  constraints: [
    "HIPAA compliant data handling",
    "Anonymize all patient data"
  ],
  guidelines: [
    "Use evidence-based approaches",
    "Cite medical literature"
  ]
};

const agent = createConfiguredAgent(config);
```

### Add Your Personas

```typescript
const personaInstructions = {
  analyst: `...`,
  researcher: `...`,
  engineer: `ROLE: Software Engineer

  SPECIALIZATION:
  - Code architecture and design patterns
  - Performance optimization
  - Technical documentation`
};
```

## Comparison with LangChain Pattern

| Aspect | LangChain (messageModifier) | OpenAI SDK (instructions) |
|--------|----------------------------|---------------------------|
| Fusion timing | Per-message | At initialization |
| Overhead | Minimal per-call | One-time |
| Persona switching | Instant | Requires re-init |
| Use case | Dynamic multi-turn | Static or infrequent changes |

## Real-World Implementation

For production use with OpenAI:

1. **Assistants API:** Fuse prompts → create assistant with `instructions`
2. **Function Calling:** Fuse prompts → pass as `system` message
3. **Custom Framework:** Adapt the fusion pattern to your architecture

## Learn More

- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)
- [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Prompt Fusion Architecture](../../docs/architecture.md)
