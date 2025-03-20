import init, { SpaceByTimeMachine } from './blaze/pkg/busy_beaver_blaze.js';
import type { InitOutput } from './blaze/pkg/busy_beaver_blaze.js';

let initPromise: Promise<InitOutput> | null = null;

self.onmessage = async (event: MessageEvent) => {
    const { machineCode, canvasWidth, canvasHeight, binning, stepCount } = event.data;

    try {
        // Initialize the WASM module once
        if (!initPromise) {
            console.log("Initializing WASM module...");
            initPromise = init();
            await initPromise;
            console.log("WASM module initialized successfully.");
        }

        // Create the SpaceByTimeMachine instance
        const spaceTimeMachine = new SpaceByTimeMachine(
            machineCode,
            canvasWidth,
            canvasHeight,
            binning,
            0n
        );

        // Perform the computation
        if (stepCount > 1) {
            spaceTimeMachine.nth(BigInt(stepCount) - 2n);
        }

        // Get the PNG data and send it back to the main thread
        const pngData = spaceTimeMachine.png_data();
        self.postMessage({ type: 'image', data: pngData }, [pngData.buffer]); // Send the buffer with metadata
    } catch (error: unknown) {
        console.error("Worker error:", error); // Log the error for debugging
        // Send any errors back to the main thread
        if (error instanceof Error) {
            self.postMessage({ error: error.message });
        } else {
            self.postMessage({ error: 'Unknown error occurred' });
        }
    }
};
