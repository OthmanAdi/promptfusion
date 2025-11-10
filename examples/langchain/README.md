# LangChain + Prompt Fusion Integration

This example shows how to integrate Prompt Fusion with LangChain's ReAct agents using the `messageModifier` callback pattern.

## What This Does

Creates a LangChain ReAct agent that:
- Dynamically fuses base instructions, workspace config, and persona prompts before each LLM call
- Switches between personas at runtime without restarting the agent
- Uses semantic weighting to handle conflicting instructions

The fusion happens via `messageModifier` - a callback that runs before every LLM invocation to inject the fused system prompt.

## Prerequisites

- Node.js 18+
- OpenAI API key
- TypeScript knowledge (or use `ts-node`)

## Installation

```bash
npm install @langchain/langgraph @langchain/openai @langchain/core zod
```

## Setup

Create a `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## How to Run

```bash
# Using ts-node
npx ts-node agent-with-fusion.ts

# Or using tsx
npx tsx agent-with-fusion.ts
```

## Code Overview

### Key Components

**1. Prompt Layers:**
- `basePrompt` - Tool definitions and safety rules
- `brainPrompt` - Workspace configuration (Customer Analytics in this example)
- `personaPrompt` - Role overlay (Analyst or Researcher, loaded dynamically)

**2. messageModifier Function:**
```typescript
return async (messages, config) => {
  const persona = await getPersona(config.thread_id);
  const weights = persona ? { base: 0.2, brain: 0.3, persona: 0.5 }
                          : { base: 0.4, brain: 0.6, persona: 0.0 };
  const fused = fusionEngine.semanticWeightedFusion(...);
  return [new SystemMessage(fused), ...messages];
};
```

**3. Agent Creation:**
```typescript
const agent = createReactAgent({
  llm: model,
  tools: tools,
  messageModifier: createFusionModifier(basePrompt, brainPrompt, getPersona)
});
```

### How It Works

1. User sends a message
2. `messageModifier` runs before LLM call
3. Checks if a persona is active (via `thread_id`)
4. Determines weights: persona active → (0.2/0.3/0.5), no persona → (0.4/0.6/0.0)
5. Fuses layers with semantic labels
6. Injects fused prompt as system message
7. Agent processes with fused context

## Customization

### Add Your Own Tools

```typescript
const myTool = tool(
  async ({ input }) => {
    // Your implementation
    return result;
  },
  {
    name: "my_tool",
    description: "What your tool does",
    schema: z.object({
      input: z.string()
    })
  }
);

const tools = [searchTool, myTool];
```

### Change Weight Patterns

```typescript
// Safety-first (base dominates)
const weights = { base: 0.6, brain: 0.3, persona: 0.1 };

// Context-first (brain dominates)
const weights = { base: 0.2, brain: 0.7, persona: 0.1 };
```

### Add More Personas

```typescript
const personas = {
  analyst: { /* ... */ },
  researcher: { /* ... */ },
  developer: {
    id: 'developer',
    content: `ROLE: Senior Developer
    SPECIALIZATION: Code review, architecture design...`
  }
};
```

## Troubleshooting

**Agent repeats instructions verbatim:**
- Weights might be too balanced. Increase the gap between layers (use 0.1+ differences).

**Persona not applying:**
- Check that `getPersona()` is actually returning content
- Verify `thread_id` is being passed in config
- Log the fused prompt to see what the LLM receives

**Tool calls failing:**
- Make sure tool schemas match the actual function parameters
- Check that tools are properly passed to `createReactAgent`

## Learn More

- [LangChain Agents Documentation](https://js.langchain.com/docs/modules/agents/)
- [messageModifier Pattern](https://js.langchain.com/docs/modules/agents/concepts#message-modifier)
- [Prompt Fusion Weight Patterns](../../docs/weight-patterns.md)
