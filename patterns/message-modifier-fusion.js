/**
 * Message Modifier Fusion Pattern
 *
 * Shows how to integrate Prompt Fusion with LangChain's messageModifier
 * callback to dynamically inject fused prompts before each LLM invocation.
 *
 * This pattern allows for:
 * - Per-request prompt fusion
 * - Dynamic role/persona switching
 * - Stateful weight adjustment
 */

import PromptFusionEngine from '../core/promptFusionEngine.js';
import { determineWeights } from './weight-determination.js';

/**
 * Create a messageModifier callback for LangChain agents
 *
 * This is the production pattern extracted from a working implementation.
 *
 * @param {Object} options - Configuration
 * @param {string} options.basePrompt - Base layer (tool definitions)
 * @param {string} options.brainPrompt - Brain layer (workspace config)
 * @param {Function} options.getPersonaContent - Async function to fetch persona
 * @returns {Function} messageModifier callback
 */
export function createFusionMessageModifier(options) {
    const { basePrompt, brainPrompt, getPersonaContent } = options;
    const fusionEngine = new PromptFusionEngine();

    return async (messages, config) => {
        // Extract context from LangChain config
        const chatId = config?.configurable?.thread_id;
        let personaContent = null;
        let activePersonaId = 'default';

        // Fetch persona if chat context exists
        if (chatId && getPersonaContent) {
            const personaData = await getPersonaContent(chatId);
            if (personaData) {
                personaContent = personaData.content;
                activePersonaId = personaData.id || 'default';
            }
        }

        // Determine fusion weights dynamically
        const weights = determineWeights(activePersonaId, personaContent);

        // Fuse prompts using semantic weighting
        const systemContent = fusionEngine.semanticWeightedFusion(
            basePrompt,
            brainPrompt || '',
            personaContent || '',
            weights
        );

        // Create system message with fused content
        const systemMessage = {
            role: 'system',
            content: systemContent,
            metadata: {
                mode: activePersonaId === 'default' ? 'default' : 'persona',
                personaId: activePersonaId,
                fusionWeights: weights
            }
        };

        // Prepend system message to conversation
        return [systemMessage, ...messages];
    };
}

/**
 * Example usage with LangChain createReactAgent
 */
async function exampleLangChainIntegration() {
    // Define your prompts
    const basePrompt = `You are a helpful AI assistant with access to tools.

Available tools:
- search_memory: Search knowledge graph for entities and relationships
- create_entity: Create new entity in knowledge graph
- query_database: Execute database queries

Safety rules:
- Never delete data without confirmation
- Always validate user permissions`;

    const brainPrompt = `Workspace: Customer Analytics
Environment: Production
Constraints:
- Read-only access to customer data
- Maximum query depth: 5 levels
- Response format: Structured JSON`;

    // Create persona fetcher
    async function getPersonaContent(chatId) {
        // In production, fetch from Redis/DB
        // For example: return await personaService.getChatPersona(chatId);
        return {
            id: 'analyst',
            content: `You are a Data Analyst role.

Focus areas:
- Statistical analysis
- Data visualization
- Trend identification

Tool restrictions:
- Cannot create or delete entities
- Read-only database access
- Maximum 1000 records per query`
        };
    }

    // Create the messageModifier
    const messageModifier = createFusionMessageModifier({
        basePrompt,
        brainPrompt,
        getPersonaContent
    });

    // Use with LangChain agent
    const agentConfig = {
        llm: model, // your LLM instance
        tools: tools, // your tools array
        messageModifier: messageModifier
    };

    // Every invocation will dynamically fuse prompts
    // based on the active persona for that chat
}

/**
 * Simplified messageModifier for static prompts
 */
export function createStaticFusionModifier(basePrompt, brainPrompt, personaPrompt = '') {
    const fusionEngine = new PromptFusionEngine();

    // Determine weights once
    const weights = determineWeights(
        personaPrompt ? 'custom' : 'default',
        personaPrompt
    );

    // Pre-fuse the prompts
    const fusedContent = fusionEngine.semanticWeightedFusion(
        basePrompt,
        brainPrompt,
        personaPrompt,
        weights
    );

    // Return a simple modifier that injects the pre-fused prompt
    return (messages) => {
        return [
            { role: 'system', content: fusedContent },
            ...messages
        ];
    };
}

export default { createFusionMessageModifier, createStaticFusionModifier };
