/**
 * Prompt Fusion Engine
 *
 * A semantic weighted prompt layering system for AI agents.
 * Combines multiple prompt layers (Base, Brain, Persona) with intelligent
 * weight-to-priority translation for improved LLM instruction following.
 *
 * @author Othman Adi
 * @license MIT
 */

export default class PromptFusionEngine {
    constructor() {
        this.fusionStrategies = {
            weighted: this.weightedFusion.bind(this),
            semanticWeighted: this.semanticWeightedFusion.bind(this)
        };
    }

    /**
     * Basic weighted fusion with numeric markers
     *
     * @param {string} basePrompt - Foundation layer (tools, safety rules)
     * @param {string} brainPrompt - Workspace/configuration layer
     * @param {string} personaPrompt - Role/persona layer
     * @param {Object} weights - Weight distribution {base, brain, persona}
     * @returns {string} Fused prompt with weight markers
     */
    weightedFusion(basePrompt, brainPrompt, personaPrompt, weights) {
        const { base: baseWeight = 0.5, brain: brainWeight = 0.3, persona: personaWeight = 0.2 } = weights;

        // Validate weights sum to 1.0
        const weightSum = baseWeight + brainWeight + personaWeight;
        if (Math.abs(weightSum - 1.0) > 0.001) {
            throw new Error(`Weights must sum to 1.0, got ${weightSum}. Please adjust weights.`);
        }

        let fusedPrompt = '';

        if (basePrompt && baseWeight > 0) {
            fusedPrompt += `[BASE_WEIGHT:${baseWeight}]\n${basePrompt}\n\n`;
        }

        if (brainPrompt && brainWeight > 0) {
            fusedPrompt += `[BRAIN_WEIGHT:${brainWeight}]\n${brainPrompt}\n\n`;
        }

        if (personaPrompt && personaWeight > 0) {
            fusedPrompt += `[PERSONA_WEIGHT:${personaWeight}]\n${personaPrompt}\n\n`;
        }

        return fusedPrompt.trim();
    }

    /**
     * Semantic weighted fusion - RECOMMENDED
     *
     * Converts numeric weights into semantic priority labels that LLMs
     * understand better than raw numbers. Includes automatic conflict
     * resolution rules.
     *
     * @param {string} basePrompt - Foundation layer
     * @param {string} brainPrompt - Workspace layer
     * @param {string} personaPrompt - Role layer
     * @param {Object} weights - Weight distribution
     * @returns {string} Fused prompt with semantic emphasis
     */
    semanticWeightedFusion(basePrompt, brainPrompt, personaPrompt, weights) {
        const { base: baseWeight = 0.5, brain: brainWeight = 0.3, persona: personaWeight = 0.2 } = weights;

        // Validate weights
        const weightSum = baseWeight + brainWeight + personaWeight;
        if (Math.abs(weightSum - 1.0) > 0.001) {
            throw new Error(`Weights must sum to 1.0, got ${weightSum}`);
        }

        let fusedPrompt = '';

        // Apply semantic emphasis based on weight
        if (basePrompt && baseWeight > 0) {
            const emphasis = this.getSemanticEmphasis(baseWeight);
            fusedPrompt += `[BASE LAYER - ${emphasis}]\n${basePrompt}\n\n`;
        }

        if (brainPrompt && brainWeight > 0) {
            const emphasis = this.getSemanticEmphasis(brainWeight);
            fusedPrompt += `[BRAIN CONFIGURATION - ${emphasis}]\n${brainPrompt}\n\n`;
        }

        if (personaPrompt && personaWeight > 0) {
            const emphasis = this.getSemanticEmphasis(personaWeight);
            fusedPrompt += `[PERSONA INSTRUCTIONS - ${emphasis}]\n${personaPrompt}\n\n`;
        }

        // Add conflict resolution rules
        fusedPrompt += this.generateConflictResolutionRules(weights);

        return fusedPrompt.trim();
    }

    /**
     * Convert numerical weight to semantic emphasis label
     *
     * Weight ranges:
     * - >= 0.6: CRITICAL PRIORITY - MUST FOLLOW
     * - >= 0.4: HIGH IMPORTANCE
     * - >= 0.2: MODERATE GUIDANCE
     * - <  0.2: OPTIONAL CONSIDERATION
     *
     * @param {number} weight - Numerical weight (0.0 - 1.0)
     * @returns {string} Semantic priority label
     */
    getSemanticEmphasis(weight) {
        if (weight >= 0.6) {
            return 'CRITICAL PRIORITY - MUST FOLLOW';
        } else if (weight >= 0.4) {
            return 'HIGH IMPORTANCE';
        } else if (weight >= 0.2) {
            return 'MODERATE GUIDANCE';
        } else {
            return 'OPTIONAL CONSIDERATION';
        }
    }

    /**
     * Generate explicit conflict resolution rules
     *
     * Creates a priority-ordered list of layers to guide the LLM
     * when instructions conflict across layers.
     *
     * @param {Object} weights - Weight distribution
     * @returns {string} Formatted conflict resolution rules
     */
    generateConflictResolutionRules(weights) {
        const { base: baseWeight = 0.5, brain: brainWeight = 0.3, persona: personaWeight = 0.2 } = weights;

        // Sort layers by weight (highest first)
        const layers = [
            { name: 'PERSONA', weight: personaWeight },
            { name: 'BRAIN', weight: brainWeight },
            { name: 'BASE', weight: baseWeight }
        ]
            .filter(l => l.weight > 0)
            .sort((a, b) => b.weight - a.weight);

        let rules = '\n[CONFLICT RESOLUTION RULES]\n';
        rules += 'When instructions conflict, apply this priority order:\n';
        layers.forEach((layer, index) => {
            rules += `${index + 1}. ${layer.name} instructions (weight: ${layer.weight})\n`;
        });
        rules += '\nAlways prioritize higher-weighted layers when resolving conflicts.\n';

        return rules;
    }

    /**
     * Detect potential conflicts between prompt layers
     *
     * Analyzes prompts for opposing instruction patterns such as:
     * - Verbosity (verbose vs. concise)
     * - Tone (formal vs. casual)
     * - Speed (fast vs. thorough)
     * - Approach (creative vs. conservative)
     *
     * @param {string} basePrompt - Base layer
     * @param {string} brainPrompt - Brain layer
     * @param {string} personaPrompt - Persona layer
     * @returns {Array} Array of detected conflicts
     */
    detectConflicts(basePrompt, brainPrompt, personaPrompt) {
        const conflicts = [];

        // Define opposing instruction patterns
        const opposingPatterns = [
            { pattern1: /verbose|detailed|comprehensive/i, pattern2: /concise|brief|short/i, type: 'verbosity' },
            { pattern1: /formal|professional/i, pattern2: /casual|informal/i, type: 'tone' },
            { pattern1: /fast|quick|immediate/i, pattern2: /careful|thorough|deliberate/i, type: 'speed' },
            { pattern1: /creative|innovative/i, pattern2: /conservative|traditional/i, type: 'approach' }
        ];

        const prompts = { base: basePrompt, brain: brainPrompt, persona: personaPrompt };
        const layers = Object.keys(prompts);

        // Check for conflicts between layers
        for (let i = 0; i < layers.length; i++) {
            for (let j = i + 1; j < layers.length; j++) {
                const prompt1 = prompts[layers[i]];
                const prompt2 = prompts[layers[j]];

                if (!prompt1 || !prompt2) continue;

                opposingPatterns.forEach(({ pattern1, pattern2, type }) => {
                    const has1in1 = pattern1.test(prompt1);
                    const has2in1 = pattern2.test(prompt1);
                    const has1in2 = pattern1.test(prompt2);
                    const has2in2 = pattern2.test(prompt2);

                    if ((has1in1 && has2in2) || (has2in1 && has1in2)) {
                        conflicts.push({
                            type,
                            layer1: layers[i],
                            layer2: layers[j],
                            description: `Conflicting ${type} instructions between ${layers[i]} and ${layers[j]}`
                        });
                    }
                });
            }
        }

        return conflicts;
    }

    /**
     * Main fusion entry point with strategy selection
     *
     * @param {Object} layers - {base, brain, persona} prompts
     * @param {string} strategy - 'weighted' or 'semanticWeighted'
     * @param {Object} weights - Weight distribution
     * @returns {string} Fused prompt
     */
    fusePrompts(layers, strategy = 'semanticWeighted', weights = {}) {
        const { base, brain, persona } = layers;
        const fusionStrategy = this.fusionStrategies[strategy];

        if (!fusionStrategy) {
            throw new Error(`Unknown fusion strategy: ${strategy}`);
        }

        return fusionStrategy(base, brain, persona, weights);
    }
}
