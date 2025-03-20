import init, { SpaceByTimeMachine } from './blaze/pkg/busy_beaver_blaze.js';

let initPromise: Promise<void> | null = null;

interface WorkerMessage {
	machineCode: string;
	canvasWidth: number;
	canvasHeight: number;
	binning: number;
	stepCount: number;
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
	const { machineCode, canvasWidth, canvasHeight, binning, stepCount } = event.data;

	try {
		// Initialize the WASM module once
		if (!initPromise) {
			initPromise = init();
			await initPromise;
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
		const pngData: Uint8Array = spaceTimeMachine.png_data();
		self.postMessage(pngData, [pngData.buffer]);
	} catch (error: any) {
		// Send any errors back to the main thread
		self.postMessage({ error: error.message });
	}
};
