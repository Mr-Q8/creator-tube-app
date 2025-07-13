/**
 * @fileOverview A service for executing Google Colab notebooks via a backend endpoint.
 */

import { z } from 'zod';

// Schema for the parameters accepted by the Colab notebook.
// Based on the `generate_video` function from the user-provided notebook.
export const ColabNotebookParametersSchema = z.object({
  prompt: z.string().describe("The main description of the video to be generated."),
  negative_prompt: z.string().optional().describe("Elements to avoid in the video."),
  width: z.number().int().default(832),
  height: z.number().int().default(480),
  seed: z.number().int().default(0),
  steps: z.number().int().min(1).max(100).default(25),
  cfg_scale: z.number().min(1).max(20).default(2.05),
  sampler_name: z.enum(["res_multistep", "euler", "dpmpp_2m", "ddim", "lms"]).default("res_multistep"),
  frames: z.number().int().min(1).max(120).default(73),
  fps: z.number().int().min(1).max(60).default(24),
  iteration: z.number().int().optional(), // Not in original notebook, but useful for our loop
});

export type ColabNotebookParameters = z.infer<typeof ColabNotebookParametersSchema>;

// Schema for the output of the Colab notebook execution.
export const ColabNotebookOutputSchema = z.object({
  success: z.boolean(),
  videoUrl: z.string().url().optional(),
  log: z.string(),
});

export type ColabNotebookOutput = z.infer<typeof ColabNotebookOutputSchema>;

/**
 * Triggers the execution of a Google Colab notebook via a backend Cloud Function.
 *
 * @param params The parameters to pass to the notebook.
 * @returns A promise that resolves with the output of the notebook execution.
 */
export async function runColabNotebook(params: ColabNotebookParameters): Promise<ColabNotebookOutput> {
  console.log('Triggering Colab notebook execution with params:', params);

  // Validate input parameters
  const validatedParams = ColabNotebookParametersSchema.parse(params);

  const colabRunnerUrl = process.env.NEXT_PUBLIC_COLAB_RUNNER_URL;

  if (!colabRunnerUrl) {
    console.error("NEXT_PUBLIC_COLAB_RUNNER_URL is not set. Using simulation.");
    // Fallback to simulation if the URL is not set
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      log: 'Simulated execution as NEXT_PUBLIC_COLAB_RUNNER_URL is not configured. Video generated successfully.',
    };
  }
  
  try {
    const response = await fetch(colabRunnerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedParams),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Backend request failed with status ${response.status}: ${errorBody}`);
    }

    const result: ColabNotebookOutput = await response.json();
    console.log('Execution result from backend:', result);
    return ColabNotebookOutputSchema.parse(result);

  } catch (error) {
    console.error('Error calling Colab runner backend:', error);
    throw new Error(error instanceof Error ? error.message : "An unknown error occurred while calling the backend.");
  }
}
