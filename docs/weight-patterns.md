# Weight Patterns Guide

This guide provides practical weight distribution patterns for different scenarios when using Prompt Fusion.

## Table of Contents
- [Weight Fundamentals](#weight-fundamentals)
- [Standard Patterns](#standard-patterns)
- [Scenario-Based Patterns](#scenario-based-patterns)
- [Advanced Patterns](#advanced-patterns)
- [Pattern Selection Guide](#pattern-selection-guide)

---

## Weight Fundamentals

### Core Principle

Weights must sum to **1.0** (representing 100% of instruction influence).

```javascript
const weights = {
    base: 0.2,
    brain: 0.3,
    persona: 0.5
};

// Sum: 0.2 + 0.3 + 0.5 = 1.0 ✓
```

### Semantic Translation

Weights automatically translate to priority labels:

| Weight | Label | Effect |
|--------|-------|--------|
| **>= 0.6** | CRITICAL PRIORITY | Dominates all other layers |
| **>= 0.4** | HIGH IMPORTANCE | Strong influence |
| **>= 0.2** | MODERATE GUIDANCE | Balanced consideration |
| **< 0.2** | OPTIONAL CONSIDERATION | Background context |

### General Guidelines

1. **One dominant layer** - Typically one layer has 40-60% weight
2. **Clear gaps** - Use 0.1+ differences between layers for clarity
3. **Context determines dominance** - Persona active vs. inactive changes priorities
4. **Test and validate** - Observe agent behavior with different patterns

---

## Standard Patterns

### Pattern 1: WITH_PERSONA (Persona Dominates)

```javascript
const WITH_PERSONA = {
    base: 0.2,      // MODERATE GUIDANCE - Background rules
    brain: 0.3,     // MODERATE GUIDANCE - Project context
    persona: 0.5    // CRITICAL PRIORITY - Role behavior
};
```

**When to use:**
- User has activated a specific persona/role
- Role-specific behavior is critical
- Persona overlay should drive agent behavior

**Example scenario:**
```
User activates "Data Analyst" persona
→ Agent should behave primarily as analyst
→ Workspace context provides domain (customer analytics)
→ Base provides tools and safety
→ Persona weight: 50% (dominant)
```

**Effect:**
```
[BASE LAYER - MODERATE GUIDANCE]
Safety rules, tool definitions

[BRAIN CONFIGURATION - MODERATE GUIDANCE]
Workspace: Customer Analytics, Format: JSON

[PERSONA INSTRUCTIONS - CRITICAL PRIORITY - MUST FOLLOW]
Role: Data Analyst, Focus: Statistical analysis

Conflict resolution:
1. PERSONA (0.5) - wins conflicts
2. BRAIN (0.3)
3. BASE (0.2)
```

---

### Pattern 2: WITHOUT_PERSONA (Brain Dominates)

```javascript
const WITHOUT_PERSONA = {
    base: 0.4,      // HIGH IMPORTANCE - Foundation stronger
    brain: 0.6,     // CRITICAL PRIORITY - Workspace config drives
    persona: 0.0    // Not included
};
```

**When to use:**
- No persona activated (default mode)
- Workspace/project configuration should drive behavior
- General agent behavior without role overlay

**Example scenario:**
```
User in workspace with no persona
→ Agent behaves according to workspace configuration
→ Workspace defines output format, constraints
→ Base provides capabilities
→ Brain weight: 60% (dominant)
```

**Effect:**
```
[BASE LAYER - HIGH IMPORTANCE]
Safety rules, tool definitions, core behavior

[BRAIN CONFIGURATION - CRITICAL PRIORITY - MUST FOLLOW]
Workspace: Customer Analytics, Environment: Production
Access: Read-only, Format: JSON with citations

Conflict resolution:
1. BRAIN (0.6) - wins conflicts
2. BASE (0.4)
```

---

### Pattern 3: BALANCED (Multi-Step Workflows)

```javascript
const BALANCED = {
    base: 0.5,      // CRITICAL PRIORITY - Tool foundation
    brain: 0.3,     // MODERATE GUIDANCE - Light context
    persona: 0.2    // MODERATE GUIDANCE - Light role flavor
};
```

**When to use:**
- Multi-step workflows where tool usage is primary
- Agent needs strong foundation behavior
- Context and role provide light guidance

**Example scenario:**
```
Complex workflow: Search → Analyze → Generate Report
→ Tool usage patterns most important (base)
→ Output format from workspace (brain)
→ Communication style from persona (light)
→ Base weight: 50% (dominant)
```

**Effect:**
```
[BASE LAYER - CRITICAL PRIORITY - MUST FOLLOW]
Tool definitions, workflow patterns, safety rules

[BRAIN CONFIGURATION - MODERATE GUIDANCE]
Output format, environment constraints

[PERSONA INSTRUCTIONS - MODERATE GUIDANCE]
Communication style, presentation preferences

Conflict resolution:
1. BASE (0.5) - wins conflicts
2. BRAIN (0.3)
3. PERSONA (0.2)
```

---

## Scenario-Based Patterns

### Customer Support Agent

**Scenario:** Customer support with different expertise levels

```javascript
// Junior Support (Brain-heavy: procedures and scripts)
const JUNIOR_SUPPORT = {
    base: 0.3,      // Tools and escalation paths
    brain: 0.6,     // CRITICAL: Follow scripts exactly
    persona: 0.1    // Friendly tone (minimal)
};

// Senior Support (Persona-heavy: expertise and judgment)
const SENIOR_SUPPORT = {
    base: 0.2,      // Tools available
    brain: 0.3,     // Guidelines (flexible)
    persona: 0.5    // CRITICAL: Expert judgment and empathy
};
```

---

### Research Agent

**Scenario:** Academic research with different specializations

```javascript
// General Research (Brain-heavy: domain and constraints)
const GENERAL_RESEARCH = {
    base: 0.3,      // Search tools, citation format
    brain: 0.6,     // CRITICAL: Domain focus, source requirements
    persona: 0.1    // Light academic tone
};

// Methodologist Specialist (Persona-heavy: expert analysis)
const METHODOLOGIST = {
    base: 0.2,      // Research tools
    brain: 0.3,     // Domain context
    persona: 0.5    // CRITICAL: Statistical expertise, methodology focus
};
```

---

### Code Generation Agent

**Scenario:** Software development with varying contexts

```javascript
// Strict Environment (Base-heavy: standards and constraints)
const PRODUCTION_CODER = {
    base: 0.6,      // CRITICAL: Security, patterns, testing requirements
    brain: 0.3,     // Project tech stack
    persona: 0.1    // Code style preferences
};

// Exploratory Coding (Persona-heavy: creative solutions)
const PROTOTYPE_CODER = {
    base: 0.2,      // Basic language features
    brain: 0.3,     // Project goals
    persona: 0.5    // CRITICAL: Innovative approaches, experimentation
};
```

---

### Data Analysis Agent

**Scenario:** Analytics with different roles

```javascript
// Exploratory Analysis (Brain-heavy: dataset and questions)
const EXPLORATORY = {
    base: 0.3,      // Analysis tools
    brain: 0.6,     // CRITICAL: Dataset characteristics, business questions
    persona: 0.1    // Light analytical tone
};

// Statistical Expert (Persona-heavy: rigorous methodology)
const STATISTICIAN = {
    base: 0.2,      // Statistical tools
    brain: 0.3,     // Dataset context
    persona: 0.5    // CRITICAL: Statistical rigor, methodology validation
};
```

---

## Advanced Patterns

### Pattern: Safety-First

```javascript
const SAFETY_FIRST = {
    base: 0.7,      // CRITICAL: Safety rules dominate
    brain: 0.2,     // Minimal context
    persona: 0.1    // Minimal role
};
```

**Use case:** High-risk operations where safety cannot be compromised
- Medical advice agents
- Financial transaction agents
- Critical infrastructure control

---

### Pattern: Context-First

```javascript
const CONTEXT_FIRST = {
    base: 0.15,     // Minimal foundation
    brain: 0.7,     // CRITICAL: Context dominates
    persona: 0.15   // Minimal role
};
```

**Use case:** Highly specialized domains where context is everything
- Legal document analysis (jurisdiction-specific)
- Regulatory compliance (environment-specific)
- Domain-specific validation

---

### Pattern: Role-First

```javascript
const ROLE_FIRST = {
    base: 0.15,     // Minimal tools
    brain: 0.15,    // Minimal context
    persona: 0.7    // CRITICAL: Role dominates
};
```

**Use case:** Persona simulation or role-playing
- Interview practice agents
- Character-based interactions
- Specialized expertise personas

---

### Pattern: Equal Weight

```javascript
const EQUAL_WEIGHT = {
    base: 0.33,     // Balanced
    brain: 0.34,    // Balanced
    persona: 0.33   // Balanced
};
```

**Use case:** Experimental or when no clear priority exists
- Testing different instruction sources
- Prototyping new agent types
- Academic research on prompt interaction

**Note:** Generally not recommended for production as it lacks clear priorities.

---

## Pattern Selection Guide

### Decision Tree

```
START
│
├─ Is there an active persona?
│  │
│  ├─ YES → Is role expertise critical?
│  │        │
│  │        ├─ YES → Use WITH_PERSONA (0.2/0.3/0.5)
│  │        │
│  │        └─ NO → Use BALANCED (0.5/0.3/0.2)
│  │
│  └─ NO → Is workspace context highly specific?
│           │
│           ├─ YES → Use WITHOUT_PERSONA (0.4/0.6/0.0)
│           │
│           └─ NO → Use BASE_FOCUSED (0.6/0.4/0.0)
```

### Priority Questions

Ask yourself:

1. **What should win conflicts?**
   - Safety rules? → Base-heavy (0.6+)
   - Workspace config? → Brain-heavy (0.6+)
   - Role expertise? → Persona-heavy (0.5+)

2. **How specialized is the task?**
   - General → Lower weights across all
   - Specialized → Higher weight on specialized layer

3. **How dynamic is the behavior?**
   - Static → Pre-fuse with fixed weights
   - Dynamic → Runtime fusion with conditional weights

4. **What's the risk profile?**
   - High risk → Base-heavy (safety first)
   - Low risk → Persona-heavy (flexibility)

---

## Pattern Validation

### Testing Your Pattern

1. **Create opposing instructions** across layers
2. **Observe which layer wins** in agent responses
3. **Adjust weights** if results don't match expectations

**Example test:**
```javascript
const testLayers = {
    base: "Be extremely verbose and detailed.",
    brain: "Maintain moderate length responses.",
    persona: "Be extremely concise and brief."
};

const testWeights = { base: 0.2, brain: 0.3, persona: 0.5 };

// Expected: Agent should be concise (persona wins)
// If agent is verbose, increase persona weight or check fusion logic
```

### A/B Testing Patterns

```javascript
// Test Pattern A vs Pattern B on same prompts
const patternA = { base: 0.3, brain: 0.4, persona: 0.3 };
const patternB = { base: 0.2, brain: 0.3, persona: 0.5 };

// Measure:
// - Response quality
// - Adherence to role
// - Workspace constraint respect
// - User satisfaction
```

---

## Common Mistakes

### Mistake 1: Too Many Equal Weights

```javascript
// ❌ BAD: No clear priorities
const unclear = { base: 0.33, brain: 0.33, persona: 0.34 };
```

**Fix:** Establish clear dominance
```javascript
// ✓ GOOD: Clear priority
const clear = { base: 0.2, brain: 0.3, persona: 0.5 };
```

---

### Mistake 2: Tiny Differences

```javascript
// ❌ BAD: Differences too subtle
const subtle = { base: 0.32, brain: 0.34, persona: 0.34 };
```

**Fix:** Use meaningful gaps (0.1+ difference)
```javascript
// ✓ GOOD: Clear separation
const clear = { base: 0.2, brain: 0.3, persona: 0.5 };
```

---

### Mistake 3: Forgetting to Sum to 1.0

```javascript
// ❌ BAD: Sum = 0.8
const wrong = { base: 0.3, brain: 0.3, persona: 0.2 };
```

**Fix:** Always validate sum
```javascript
// ✓ GOOD: Sum = 1.0
const correct = { base: 0.4, brain: 0.4, persona: 0.2 };
```

---

## Pattern Library

Quick reference for copy-paste:

```javascript
// Persona-driven interactions
export const WITH_PERSONA = { base: 0.2, brain: 0.3, persona: 0.5 };

// Workspace-driven behavior
export const WITHOUT_PERSONA = { base: 0.4, brain: 0.6, persona: 0.0 };

// Tool-heavy workflows
export const TOOL_FOCUSED = { base: 0.6, brain: 0.3, persona: 0.1 };

// Context-specific operations
export const CONTEXT_FOCUSED = { base: 0.2, brain: 0.7, persona: 0.1 };

// Safety-critical operations
export const SAFETY_FIRST = { base: 0.7, brain: 0.2, persona: 0.1 };

// Balanced multi-step
export const BALANCED = { base: 0.5, brain: 0.3, persona: 0.2 };

// Role simulation
export const ROLE_PLAY = { base: 0.15, brain: 0.15, persona: 0.7 };
```

---

## Contributing Your Patterns

Discovered an effective pattern for a specific use case? We'd love to hear about it!

**What to share:**
1. **Pattern weights** - The specific distribution
2. **Use case** - What scenario it's designed for
3. **Results** - How well it worked
4. **Trade-offs** - Any limitations observed

Open an issue or PR on GitHub with your findings!

---

**Next Steps:**
- Review [Architecture Documentation](./architecture.md) for deeper understanding
- Try different patterns with your agents
- Share your discoveries with the community
