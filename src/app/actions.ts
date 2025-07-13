'use server';

import { colabLoopAutomation, ColabLoopAutomationInput, ColabLoopAutomationOutput } from '@/ai/flows/colab-loop-automation';

export interface IterationResult {
    iteration: number;
    parameters: string;
    results: ColabLoopAutomationOutput;
}

export async function runAutomationLoop(
    prompt: string,
    maxIterations: number
): Promise<IterationResult[]> {
    const allResults: IterationResult[] = [];
    
    // Initial parameters for the very first run, matching the Colab notebook
    let currentParameters = JSON.stringify({ 
        prompt: prompt,
        negative_prompt: "low quality, worst quality, deformed, distorted, disfigured",
        width: 832,
        height: 480,
        steps: 25,
        frames: 73, // Corresponds to `length` in the notebook, adjusted name
        fps: 24,
        seed: 0,
        cfg_scale: 2.05,
        sampler_name: "res_multistep",
        iteration: 1 
    });

    let previousResults: string | undefined = undefined;

    for (let i = 0; i < maxIterations; i++) {
        const input: ColabLoopAutomationInput = {
            parameters: currentParameters,
            maxIterations,
            iterationCount: i,
            previousResults: previousResults,
        };

        const output = await colabLoopAutomation(input);
        
        allResults.push({
            iteration: i + 1,
            parameters: currentParameters,
            results: output,
        });

        if (output.shouldRerun && output.newParameters) {
            currentParameters = output.newParameters;
            previousResults = JSON.stringify(output); 
        } else {
            break; 
        }
    }

    return allResults;
}
