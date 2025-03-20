import init, { SpaceByTimeMachine } from './blaze/pkg/busy_beaver_blaze';

interface WorkerMessage {
	machineCode: string;
	canvasWidth: number;
	canvasHeight: number;
	binning: boolean;
	stepCount: number;
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
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

		// if (stepCount > 1) {
		// 	spaceTimeMachine.nth(BigInt(stepCount) - 2n);
		// }
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (!spaceTimeMachine.step_for_secs(
                run_for_seconds, 
                BigInt(stepCount), // Convert stepCount to BigInt
                10_000n // Already a BigInt
            )) break;
            // const pngData = spaceTimeMachine.png_data();
			// self.postMessage(pngData, [pngData.buffer]);    
		}


		// Get the PNG data and send it back to the main thread
		const pngData: Uint8Array = spaceTimeMachine.png_data();
		self.postMessage(pngData, [pngData.buffer]);
	} catch (error: any) {
		// Send any errors back to the main thread
		self.postMessage({ error: error.message });
	}
};
