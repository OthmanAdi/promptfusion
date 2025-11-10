# Anthropic Claude + Prompt Fusion Integration

This example shows how to integrate Prompt Fusion with Anthropic's Claude API using the `system` parameter for dynamic prompt composition.

## What This Does

Demonstrates:
- Using Prompt Fusion with Claude's `system` parameter
- Multi-turn conversations with persona switching (via `ClaudeFusionChat` class)
- Extended thinking mode integration
- Streaming responses with fused prompts

## Prerequisites

- Node.js 18+
- Anthropic API key
- TypeScript knowledge (or use `ts-node`)

## Installation

```bash
npm install @anthropic-ai/sdk
```

## Setup

Create a `.env` file:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## How to Run

```bash
# Using ts-node
npx ts-node claude-with-fusion.ts

# Or using tsx
npx tsx claude-with-fusion.ts
```

The example includes 4 usage patterns - check the `main()` function at the bottom of the file.

## Code Overview

### Basic Usage

```typescript
import Anthropic from '@anthropic-ai/sdk';
import PromptFusionEngine from '../../core/promptFusionEngine.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const fusionEngine = new PromptFusionEngine();

// Fuse your prompts
const systemPrompt = fusionEngine.semanticWeightedFusion(
  baseSystemPrompt,
  brainSystemPrompt,
  personaSystemPrompts['methodologist'],
  { base: 0.2, brain: 0.3, persona: 0.5 }
);

// Use with Claude
const response = await client.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 2048,
  system: systemPrompt,  // Fused prompt goes here
  messages: [
    { role: "user", content: "Your question" }
  ]
});
```

### Pattern 1: Single Message

```typescript
const response = await claudeWithFusion(
  "What are the key methodological considerations in RCTs?",
  'methodologist'  // Persona type
);
```

### Pattern 2: Extended Thinking Mode

```typescript
const { thinking, response } = await claudeWithThinkingAndFusion(
  "Analyze validity threats in quasi-experimental designs",
  'methodologist'
);

console.log("Thinking:", thinking);
console.log("Response:", response);
```

### Pattern 3: Streaming

```typescript
await streamingClaudeWithFusion(
  "Explain mixed-methods research",
  'theorist',
  (chunk) => process.stdout.write(chunk)  // Handle each chunk
);
```

### Pattern 4: Multi-Turn with Persona Switching

```typescript
const chat = new ClaudeFusionChat();

// Start without persona
let msg = await chat.send("What is meta-analysis?");

// Switch to theorist mid-conversation
chat.switchPersona('theorist');
msg = await chat.send("How does it relate to theory building?");

// Switch back
chat.switchPersona(null);
```

## Key Features

### Fusion Timing

With Claude, fusion happens **before each API call**:

```typescript
function createFusedSystemPrompt(base, brain, persona, hasPersona) {
  const weights = hasPersona
    ? { base: 0.2, brain: 0.3, persona: 0.5 }
    : { base: 0.4, brain: 0.6, persona: 0.0 };

  return fusionEngine.semanticWeightedFusion(base, brain, persona, weights);
}
```

### Multi-Turn Conversation Management

The `ClaudeFusionChat` class:
- Maintains message history
- Re-fuses prompts when persona switches
- Passes history to Claude for context continuity

```typescript
class ClaudeFusionChat {
  private messages = [];
  private currentPersona = null;

  switchPersona(personaType) {
    this.currentPersona = personaType;
    // Next send() will use new persona
  }

  async send(userMessage) {
    this.messages.push({ role: "user", content: userMessage });

    const systemPrompt = createFusedSystemPrompt(/*...*/);

    const response = await client.messages.create({
      system: systemPrompt,
      messages: this.messages  // Full history
    });

    this.messages.push({ role: "assistant", content: response });
    return response;
  }
}
```

## Customization

### Add Your Own Personas

```typescript
const personaSystemPrompts = {
  methodologist: `...`,
  theorist: `...`,
  clinician: `SPECIALIZED ROLE: Clinical Researcher

  EXPERTISE:
  - Clinical trial design
  - Patient-centered outcomes
  - Translational research

  FOCUS AREAS:
  1. Clinical relevance assessment
  2. Safety and efficacy evaluation
  3. Real-world application`
};
```

### Adjust Thinking Budget

```typescript
const response = await client.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 4096,
  thinking: {
    type: "enabled",
    budget_tokens: 5000  // Increase for complex reasoning
  },
  system: fusedPrompt,
  messages: [/*...*/]
});
```

### Change Weight Patterns

```typescript
// Research-heavy (brain dominates when no persona)
const weights = hasPersona
  ? { base: 0.2, brain: 0.3, persona: 0.5 }
  : { base: 0.3, brain: 0.7, persona: 0.0 };

// Safety-first (base dominates)
const weights = hasPersona
  ? { base: 0.5, brain: 0.3, persona: 0.2 }
  : { base: 0.6, brain: 0.4, persona: 0.0 };
```

## Extended Thinking Integration

Extended thinking works seamlessly with fused prompts:

```typescript
const response = await client.messages.create({
  model: "claude-sonnet-4-5-20250929",
  thinking: { type: "enabled", budget_tokens: 2048 },
  system: fusedPrompt,  // Your fused prompt
  messages: [{ role: "user", content: "Complex question" }]
});

// Extract thinking and response
const thinkingBlock = response.content.find(b => b.type === 'thinking');
const textBlock = response.content.find(b => b.type === 'text');
```

The fused prompt provides context for both thinking and response generation.

## Troubleshooting

**Persona not applying:**
- Verify `hasPersona` boolean is true when persona content exists
- Log the `systemPrompt` to see the actual fused output
- Check persona content isn't empty string

**Message history growing too large:**
- Implement message trimming:
```typescript
if (this.messages.length > 20) {
  // Keep system context + recent messages
  this.messages = this.messages.slice(-10);
}
```

**Extended thinking not showing:**
- Make sure you're checking `response.content` array
- Thinking blocks have `type: 'thinking'`
- Not all queries trigger thinking - complex ones do

## Comparison with Other Frameworks

| Aspect | Claude (system param) | LangChain (messageModifier) |
|--------|----------------------|---------------------------|
| Fusion timing | Per API call | Per message (hook) |
| Multi-turn | Manual history management | Framework handled |
| Streaming | Native support | Native support |
| Thinking mode | Built-in | N/A |

## Learn More

- [Anthropic Claude API Docs](https://docs.anthropic.com/claude/reference/messages_post)
- [Extended Thinking Guide](https://docs.anthropic.com/claude/docs/extended-thinking)
- [Prompt Fusion Weight Patterns](../../docs/weight-patterns.md)
