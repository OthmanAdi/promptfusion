/**
 * Weight Determination Pattern
 *
 * Demonstrates how to dynamically determine weights based on
 * the presence of a persona/role overlay.
 *
 * Extracted from production implementation.
 */

/**
 * Determine fusion weights based on persona activation
 *
 * @param {string|null} personaId - Active persona ID
 * @param {string|null} personaContent - Persona content/instructions
 * @returns {Object} Weight distribution {base, brain, persona}
 */
export function determineWeights(personaId, personaContent) {
    // Check if persona is active (not default and has content)
    const hasActivePersona = personaId &&
                             personaId !== 'default' &&
                             personaContent &&
                             personaContent.trim().length > 0;

    if (hasActivePersona) {
        // WITH PERSONA: Persona dominates the conversation
        return {
            base: 0.2,      // 20% - Background tool definitions
            brain: 0.3,     // 30% - Workspace configuration
            persona: 0.5    // 50% - Role overlay (DOMINANT)
        };
    } else {
        // WITHOUT PERSONA: Brain configuration dominates
        return {
            base: 0.4,      // 40% - Tool definitions more prominent
            brain: 0.6,     // 60% - Workspace config (DOMINANT)
            persona: 0.0    // 0%  - No role overlay
        };
    }
}

/**
 * Example usage in an agent
 */
async function exampleUsage(personaService, chatId, brainId) {
    // Fetch active persona for the chat
    const personaData = await personaService.getBrainChatPersona(brainId, chatId);

    const personaId = personaData?.id || 'default';
    const personaContent = personaData?.content || '';

    // Determine weights dynamically
    const weights = determineWeights(personaId, personaContent);

    console.log('Active weights:', weights);
    // Output with persona: { base: 0.2, brain: 0.3, persona: 0.5 }
    // Output without:     { base: 0.4, brain: 0.6, persona: 0.0 }

    return weights;
}

/**
 * Alternative: Context-based weight determination
 *
 * Adjust weights based on task type or user role
 */
export function determineContextualWeights(context) {
    const { taskType, userRole, urgency } = context;

    // Example: Adjust based on task complexity
    if (taskType === 'complex_analysis') {
        return {
            base: 0.5,  // Strong tool foundation
            brain: 0.4, // Workspace guidance
            persona: 0.1 // Light role overlay
        };
    }

    // Example: Adjust based on user expertise
    if (userRole === 'expert') {
        return {
            base: 0.3,  // Expert knows tools
            brain: 0.2, // Light workspace guidance
            persona: 0.5 // Strong role definition
        };
    }

    // Default balanced
    return { base: 0.4, brain: 0.3, persona: 0.3 };
}

export default { determineWeights, determineContextualWeights };
