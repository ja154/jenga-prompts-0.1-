import modelSpecs from '../model-specs.json';
import { PromptMode } from '../types';

// A more specific type could be built from the JSON structure, but `any` is fine for now.
type ModelSpec = any;

interface TransformPromptArgs {
    userPrompt: string;
    mode: PromptMode.Image | PromptMode.Video;
    modelKey: string;
    options: Record<string, any>;
}

export interface TransformedPrompt {
    prompt: string;
    params: Record<string, any>;
}

/**
 * Truncates a prompt to a given word limit.
 * A more advanced tokenizer could be used in the future.
 */
const tokenTruncator = (prompt: string, limit: number): string => {
    const words = prompt.split(' ');
    if (words.length > limit) {
        return words.slice(0, limit).join(' ') + '...';
    }
    return prompt;
};

/**
 * Transforms a user prompt into a model-specific prompt based on the selected framework.
 */
export const transformPrompt = ({ userPrompt, mode, modelKey, options }: TransformPromptArgs): TransformedPrompt => {
    const modelSpec: ModelSpec = (modelSpecs as any)[mode === PromptMode.Image ? 'text-to-image' : 'text-to-video'][modelKey];

    if (!modelSpec) {
        throw new Error(`Model specification not found for key: ${modelKey}`);
    }

    // Step 1: Token optimization
    let optimizedPrompt = tokenTruncator(userPrompt, modelSpec.token_limit || 400);

    // Step 2 & 3: Structure enforcement and Model-specific enhancements
    let structuredPrompt = optimizedPrompt;

    // Apply model-specific templates and boosters
    if (modelKey === 'sd_xl_turbo' && modelSpec.recommended_boosters) {
        structuredPrompt = `${modelSpec.recommended_boosters.join(', ')}, ${structuredPrompt}`;
    } else if (modelKey === 'midjourney_v7' && modelSpec.prompt_format && modelSpec.required_parameters) {
        structuredPrompt = `${modelSpec.prompt_format.replace('[scene description]', structuredPrompt)} ${modelSpec.required_parameters.join(' ')}`;
    }
    // DALL-E 3 has automatic prompt enhancement, so we often pass a more natural prompt.
    // For now, we don't add specific boosters unless the user options imply them.

    if (modelSpec.required_boilerplate) {
        structuredPrompt = `${structuredPrompt}, ${modelSpec.required_boilerplate}`;
    }

    // Step 5: Parameter injection
    const params: Record<string, any> = {
        engine: modelKey,
        media_type: mode,
        resolution: options.resolution || modelSpec.default_resolution,
    };

    if (mode === PromptMode.Video) {
        params.duration_sec = options.duration || modelSpec.max_duration;
    }

    if (mode === PromptMode.Image) {
        params.aspect_ratio = options.aspectRatio || modelSpec.default_aspect_ratio;
    }

    if (modelSpec.negative_prompt_required) {
        // In a real implementation, this would come from a UI element.
        params.negative_prompt = "blurry, low quality, deformed, artifacts, poorly drawn";
    }

    return {
        prompt: structuredPrompt,
        params,
    };
};

/**
 * Validates a prompt against model specifications.
 */
export const validatePrompt = (prompt: string, modelKey: string, mode: PromptMode.Image | PromptMode.Video) => {
    const issues: string[] = [];
    const modelSpec: ModelSpec = (modelSpecs as any)[mode === PromptMode.Image ? 'text-to-image' : 'text-to-video'][modelKey];

    if (!modelSpec) {
        return { valid: false, warnings: ['Model specification not found.'] };
    }

    const wordCount = prompt.split(' ').filter(Boolean).length;
    const tokenLimit = modelSpec.token_limit || 400;

    if (wordCount > tokenLimit) {
        issues.push(`Prompt is ~${wordCount} words, which may exceed the ~${tokenLimit} word limit for ${modelSpec.name}. Consider shortening it.`);
    }

    if (modelSpec.negative_prompt_required) {
        issues.push(`${modelSpec.name} works best with negative prompts to avoid common issues.`);
    }

    if (mode === PromptMode.Video && modelSpec.max_duration) {
         issues.push(`Tip: ${modelSpec.name} can generate videos up to ${modelSpec.max_duration} seconds long.`);
    }


    return {
        valid: issues.length === 0, // We are only creating warnings for now, so it's always "valid"
        warnings: issues,
    };
};
