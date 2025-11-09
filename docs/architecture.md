# Prompt Fusion Architecture

This document provides a deep dive into the architecture and design decisions behind Prompt Fusion.

## Table of Contents
- [System Overview](#system-overview)
- [Three-Layer Architecture](#three-layer-architecture)
- [Semantic Weighting Engine](#semantic-weighting-engine)
- [Conflict Resolution](#conflict-resolution)
- [Execution Flow](#execution-flow)
- [Design Decisions](#design-decisions)

---

## System Overview

Prompt Fusion is a **prompt composition system** designed to solve the challenge of combining multiple instruction sources with clear priority management for AI agents.

### Core Problem

Modern AI agents need to balance:
1. **Static instructions** - Tool definitions, safety rules, foundational behavior
2. **Dynamic configuration** - Workspace context, project settings, user preferences
3. **Role-based behavior** - Persona overlays that change agent specialization

Traditional prompt composition methods fail because:
- **String concatenation** provides no priority mechanism
- **Numerical weights** (e.g., 0.2, 0.5) are too abstract for LLMs to interpret reliably
- **Hardcoded prompts** cannot adapt to different roles or contexts at runtime

### Core Solution

Prompt Fusion introduces **semantic weighting**: converting numerical weights into explicit priority labels that LLMs understand intuitively.

```
0.5 weight → "CRITICAL PRIORITY - MUST FOLLOW"
0.3 weight → "MODERATE GUIDANCE"
```

This creates prompts that:
1. Explicitly state relative importance of each instruction layer
2. Include automatic conflict resolution rules
3. Adapt dynamically based on context (persona active vs. inactive)

---

## Three-Layer Architecture

### Layer 1: Base Prompt

**Purpose:** Foundation layer containing tool definitions and safety rules.

**Characteristics:**
- Static or rarely changing
- Contains core capabilities and constraints
- Weight range: 20-60% depending on persona presence

**Example:**
```
You are an AI assistant with database access.

Tools available:
- query_database: Execute SQL queries
- create_visualization: Generate charts

Safety rules:
- Maximum 1000 records per query
- No DELETE operations
- Anonymize PII in results
```

**When it dominates (40-60% weight):**
- No persona active (default mode)
- Tool-centric workflows
- Safety-first scenarios

### Layer 2: Brain Prompt

**Purpose:** Workspace configuration and project context.

**Characteristics:**
- Semi-dynamic (changes per workspace/project)
- Contains environment settings and constraints
- Weight range: 20-60%

**Example:**
```
Project: Customer Retention Analysis
Environment: Production (read-only)
Database: customer_analytics_prod

Requirements:
- Focus on churn prediction
- Use statistical methods
- Format: JSON with confidence levels
```

**When it dominates (60% weight):**
- No persona active
- Workspace-specific behavior critical
- Project constraints take precedence

### Layer 3: Persona Prompt

**Purpose:** Role-specific behavior and specialization.

**Characteristics:**
- Highly dynamic (changes per conversation)
- Contains role overlay instructions
- Weight range: 0-50%

**Example:**
```
Role: Senior Data Analyst

Specialization:
- Churn analysis and prediction
- Cohort analysis
- Customer lifetime value modeling

Methodology:
1. Define clear metrics
2. Segment customers
3. Apply statistical tests
4. Validate findings
5. Recommend interventions
```

**When it dominates (50% weight):**
- Active persona selected
- Role-specific behavior critical
- User expects specialized expertise

---

## Semantic Weighting Engine

### Algorithm Overview

The semantic weighting engine performs three key operations:

1. **Weight Validation**
   ```javascript
   validateWeights(weights) {
       const sum = weights.base + weights.brain + weights.persona;
       if (Math.abs(sum - 1.0) > 0.001) {
           throw new Error('Weights must sum to 1.0');
       }
   }
   ```

2. **Semantic Translation**
   ```javascript
   getSemanticEmphasis(weight) {
       if (weight >= 0.6) return 'CRITICAL PRIORITY - MUST FOLLOW';
       if (weight >= 0.4) return 'HIGH IMPORTANCE';
       if (weight >= 0.2) return 'MODERATE GUIDANCE';
       return 'OPTIONAL CONSIDERATION';
   }
   ```

3. **Prompt Assembly**
   - Append each layer with its semantic label
   - Sort layers by weight (highest priority first in conflict rules)
   - Generate explicit conflict resolution section

### Weight Translation Table

| Weight Range | Semantic Label | LLM Interpretation |
|--------------|----------------|-------------------|
| >= 0.6 | `CRITICAL PRIORITY - MUST FOLLOW` | Dominant instructions; override others when conflicting |
| >= 0.4 | `HIGH IMPORTANCE` | Strong influence; respected unless critical priority conflicts |
| >= 0.2 | `MODERATE GUIDANCE` | Balanced consideration with other layers |
| < 0.2 | `OPTIONAL CONSIDERATION` | Background context; lowest priority |

### Why Semantic Labels Work

LLMs respond better to explicit linguistic cues than numerical values:

**Numerical approach (fails):**
```
[BASE_WEIGHT:0.2]
Be verbose and detailed in responses.

[PERSONA_WEIGHT:0.5]
Be extremely concise.
```
*Result:* LLM may not reliably prioritize 0.5 over 0.2.

**Semantic approach (works):**
```
[BASE LAYER - MODERATE GUIDANCE]
Be verbose and detailed in responses.

[PERSONA INSTRUCTIONS - CRITICAL PRIORITY - MUST FOLLOW]
Be extremely concise.

[CONFLICT RESOLUTION RULES]
When instructions conflict, prioritize:
1. PERSONA instructions (weight: 0.5)
2. BASE instructions (weight: 0.2)
```
*Result:* LLM clearly understands to be concise.

---

## Conflict Resolution

### Automatic Conflict Detection

The engine can detect opposing instructions across layers:

```javascript
detectConflicts(basePrompt, brainPrompt, personaPrompt) {
    const patterns = {
        verbosity: {
            verbose: /verbose|detailed|comprehensive/i,
            concise: /concise|brief|terse/i
        },
        formality: {
            formal: /formal|professional|academic/i,
            casual: /casual|conversational|relaxed/i
        }
    };

    // Check for opposing patterns across layers
    // Return array of detected conflicts
}
```

### Resolution Strategy

When conflicts are detected or possible, the engine automatically generates a conflict resolution section:

```
[CONFLICT RESOLUTION RULES]
When instructions conflict, apply this priority order:
1. PERSONA instructions (weight: 0.5) - CRITICAL PRIORITY
2. BRAIN instructions (weight: 0.3) - MODERATE GUIDANCE
3. BASE instructions (weight: 0.2) - MODERATE GUIDANCE

Always prioritize higher-weighted layers when resolving conflicts.
```

This makes conflict resolution **explicit and deterministic** rather than relying on the LLM to infer priorities.

---

## Execution Flow

### Without Persona (Default Mode)

```
1. User sends message
   ↓
2. Check for active persona
   → None found
   ↓
3. Determine weights
   → { base: 0.4, brain: 0.6, persona: 0.0 }
   ↓
4. Fuse layers
   → Base (HIGH IMPORTANCE)
   → Brain (CRITICAL PRIORITY)
   → No persona layer
   ↓
5. Generate conflict rules
   → Brain > Base
   ↓
6. Prepend to LLM messages
   ↓
7. LLM generates response
```

### With Persona (Persona Mode)

```
1. User sends message
   ↓
2. Check for active persona
   → Persona found: "Data Analyst"
   ↓
3. Fetch persona content
   → Load from database/cache
   ↓
4. Determine weights
   → { base: 0.2, brain: 0.3, persona: 0.5 }
   ↓
5. Fuse layers
   → Base (MODERATE GUIDANCE)
   → Brain (MODERATE GUIDANCE)
   → Persona (CRITICAL PRIORITY)
   ↓
6. Generate conflict rules
   → Persona > Brain > Base
   ↓
7. Prepend to LLM messages
   ↓
8. LLM generates response with persona behavior
```

### Runtime Persona Switching

```
Chat Session Timeline:

Message 1 (no persona):
  weights: { base: 0.4, brain: 0.6, persona: 0.0 }
  → Response: General workspace behavior

User activates "Analyst" persona

Message 2 (with persona):
  weights: { base: 0.2, brain: 0.3, persona: 0.5 }
  → Response: Analyst-specific behavior

User deactivates persona

Message 3 (no persona again):
  weights: { base: 0.4, brain: 0.6, persona: 0.0 }
  → Response: Back to general behavior
```

**No agent restart required.** Each message gets freshly fused prompts based on current state.

---

## Design Decisions

### Why Three Layers?

**Two layers insufficient:**
- Cannot separate static foundation from dynamic context
- Cannot overlay roles without mixing with workspace config

**Four+ layers too complex:**
- Weight distribution becomes unclear
- Cognitive overhead for developers
- Diminishing returns on flexibility

**Three layers optimal:**
- Clear separation of concerns (foundation / context / role)
- Intuitive weight patterns (0.2/0.3/0.5 or 0.4/0.6/0.0)
- Sufficient flexibility for most use cases

### Why Sum to 1.0?

Enforcing `weights.base + weights.brain + weights.persona = 1.0` provides:

1. **Conceptual clarity** - Represents 100% of instruction influence
2. **Comparable patterns** - Different weight distributions are directly comparable
3. **Validation** - Easy to detect configuration errors

### Why Message Modifier Pattern?

For LangChain integration, we use `messageModifier` rather than static system prompts because:

1. **Dynamic fusion** - Prompts regenerated per message based on current persona
2. **State access** - Can read conversation state (thread_id, config)
3. **No restart needed** - Persona switches take effect immediately
4. **Framework integration** - Works naturally with LangGraph's design

### Why Framework Agnostic Core?

The core `PromptFusionEngine` has zero dependencies on LangChain, OpenAI SDK, or any framework:

**Benefits:**
- Can be integrated into any LLM system
- Easy to test and validate
- Simple to understand and audit
- No framework lock-in

**Integration handled by:**
- Thin adapter layers (messageModifier, instruction wrappers)
- Framework-specific examples showing integration patterns
- Core logic remains pure and portable

---

## Performance Considerations

### Fusion Cost

Each message requires:
1. Weight determination: O(1)
2. Semantic translation: O(1)
3. String assembly: O(n) where n = total prompt length
4. Conflict rule generation: O(1)

**Total:** Negligible overhead compared to LLM inference time.

### Caching Strategies

**Static fusion (no persona switching):**
```javascript
// Fuse once at initialization
const fusedPrompt = engine.semanticWeightedFusion(base, brain, '', weights);

// Reuse for all messages
const messageModifier = (messages) => [
    { role: 'system', content: fusedPrompt },
    ...messages
];
```

**Dynamic fusion (with persona switching):**
```javascript
// Cache persona content, fuse per message
const personaCache = new Map();

const messageModifier = async (messages, config) => {
    const persona = await getCachedPersona(config.thread_id);
    const fusedPrompt = engine.semanticWeightedFusion(base, brain, persona, weights);
    return [{ role: 'system', content: fusedPrompt }, ...messages];
};
```

---

## Extension Points

### Custom Semantic Labels

Override the semantic translation:

```javascript
class CustomPromptFusion extends PromptFusionEngine {
    getSemanticEmphasis(weight) {
        if (weight >= 0.7) return 'ABSOLUTE PRIORITY';
        if (weight >= 0.5) return 'PRIMARY GUIDANCE';
        if (weight >= 0.3) return 'SECONDARY GUIDANCE';
        return 'TERTIARY GUIDANCE';
    }
}
```

### Additional Layers

Extend to 4+ layers for specialized needs:

```javascript
const fusedPrompt = engine.quadLayerFusion(
    foundationPrompt,
    workspacePrompt,
    teamPrompt,
    personaPrompt,
    { foundation: 0.2, workspace: 0.3, team: 0.2, persona: 0.3 }
);
```

### Conflict Detection Patterns

Add custom conflict detection:

```javascript
engine.addConflictPattern('data_access', {
    read_only: /read.?only|view.?only/i,
    full_access: /full.?access|crud|write/i
});
```

---

## Comparison to Alternative Approaches

### vs. Simple Concatenation

**Concatenation:**
```
systemPrompt = basePrompt + "\n\n" + brainPrompt + "\n\n" + personaPrompt;
```

**Problems:**
- No priority indication
- Conflicts resolved arbitrarily by LLM
- Last instruction often wins (recency bias)

**Prompt Fusion Advantage:**
- Explicit priorities via semantic labels
- Deterministic conflict resolution
- Position-independent importance

### vs. Numerical Weighting Only

**Numerical approach:**
```
[BASE_WEIGHT:0.2]
Instructions...

[PERSONA_WEIGHT:0.5]
Instructions...
```

**Problems:**
- LLMs don't reliably interpret numerical weights
- No explicit conflict resolution
- Subtle differences (0.3 vs 0.4) often ignored

**Prompt Fusion Advantage:**
- Semantic labels LLMs actually understand
- Explicit conflict resolution rules
- Clear behavioral expectations

### vs. Hardcoded Multi-Prompts

**Hardcoded approach:**
```javascript
if (persona === 'analyst') {
    systemPrompt = ANALYST_FULL_PROMPT;
} else if (persona === 'researcher') {
    systemPrompt = RESEARCHER_FULL_PROMPT;
}
```

**Problems:**
- Can't combine workspace config with personas
- Duplicate base/brain content across all prompts
- Difficult to maintain consistency
- No runtime composition

**Prompt Fusion Advantage:**
- Composable layers (DRY principle)
- Consistent base/brain across all personas
- Runtime composition with any combination
- Easy to update individual layers

---

## Future Directions

### Potential Enhancements

1. **Weight Learning** - ML model to learn optimal weights from user feedback
2. **Conflict Auto-Resolution** - Automatic merging of opposing instructions
3. **Multi-LLM Optimization** - Different weight patterns per LLM provider
4. **Prompt Compression** - Semantic compression while maintaining priorities
5. **A/B Testing Framework** - Compare different weight patterns systematically

### Research Questions

1. How do different LLMs respond to varying semantic label vocabularies?
2. What are the optimal weight distributions for different task types?
3. Can we automatically detect the "right" number of layers for a use case?
4. How does prompt fusion affect context window utilization?

---

**Contributions welcome!** If you explore any of these directions or have insights, please open an issue or discussion on GitHub.
