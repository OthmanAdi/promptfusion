/**
 * TypeScript type definitions for Prompt Fusion
 */

export interface WeightDistribution {
    /** Weight for base layer (tools, safety rules) - Range: 0.0-1.0 */
    base: number;
    /** Weight for brain layer (workspace configuration) - Range: 0.0-1.0 */
    brain: number;
    /** Weight for persona layer (role overlay) - Range: 0.0-1.0 */
    persona: number;
}

export interface PromptLayers {
    /** Base layer: Tool definitions, safety rules, foundational instructions */
    base: string;
    /** Brain layer: Workspace-specific configuration, user preferences */
    brain: string;
    /** Persona layer: Role-based overlay, specific behavioral instructions */
    persona: string;
}

export interface ConflictDetectionResult {
    /** Type of conflict detected */
    type: 'verbosity' | 'tone' | 'speed' | 'approach';
    /** First layer involved in conflict */
    layer1: string;
    /** Second layer involved in conflict */
    layer2: string;
    /** Human-readable description */
    description: string;
}

export type SemanticEmphasis =
    | 'CRITICAL PRIORITY - MUST FOLLOW'  // weight >= 0.6
    | 'HIGH IMPORTANCE'                   // weight >= 0.4
    | 'MODERATE GUIDANCE'                 // weight >= 0.2
    | 'OPTIONAL CONSIDERATION';           // weight < 0.2

export type FusionStrategy = 'weighted' | 'semanticWeighted';

export interface FusionOptions {
    /** Include weight markers in output */
    includeMarkers?: boolean;
    /** Run conflict detection */
    detectConflicts?: boolean;
}

/**
 * Common weight patterns for different scenarios
 */
export const WeightPatterns = {
    /** Pattern when persona is active - Persona dominates (50%) */
    WITH_PERSONA: {
        base: 0.2,
        brain: 0.3,
        persona: 0.5
    } as WeightDistribution,

    /** Pattern without persona - Brain dominates (60%) */
    WITHOUT_PERSONA: {
        base: 0.4,
        brain: 0.6,
        persona: 0.0
    } as WeightDistribution,

    /** Balanced pattern for multi-step workflows */
    BALANCED: {
        base: 0.5,
        brain: 0.3,
        persona: 0.2
    } as WeightDistribution,

    /** Base-heavy pattern - Tool definitions emphasized */
    BASE_PRIORITY: {
        base: 0.6,
        brain: 0.3,
        persona: 0.1
    } as WeightDistribution
};

/**
 * Metadata added to fused prompts for tracking
 */
export interface FusionMetadata {
    /** Fusion mode used */
    mode: 'default' | 'persona';
    /** Active persona ID if applicable */
    personaId?: string;
    /** Whether brain prompt is active */
    brainPromptActive: boolean;
    /** Weights used for fusion */
    fusionWeights: WeightDistribution;
}
