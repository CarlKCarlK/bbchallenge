import init, { SpaceByTimeMachine } from './blaze/pkg/busy_beaver_blaze';

self.onmessage = async (event: MessageEvent) => {
    const { machineCode, canvasWidth, canvasHeight, binning, stepCount } = event.data;
    const run_for_seconds = 0.1;

    try {
        // Initialize the WASM module
        await init();

        // Create the SpaceByTimeMachine instance
        const spaceTimeMachine = new SpaceByTimeMachine(
            machineCode,
            canvasWidth,
            canvasHeight,
            binning,
            0n
        );

        // Perform the computation
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (!spaceTimeMachine.step_for_secs(
                run_for_seconds, 
                BigInt(stepCount), // Convert stepCount to BigInt
                10_000n // Already a BigInt
            )) break;

            const pngData = spaceTimeMachine.png_data();
            self.postMessage({ type: 'image', data: pngData }, [pngData.buffer]); // Send the buffer with metadata
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
