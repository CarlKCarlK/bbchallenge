<script lang="ts">
    import { tm_trace_to_image, tm_explore, tm_blaze } from '$lib/tm';
    
    // Define our VisualizationMode enum with proper TypeScript typing
    enum VisualizationMode {
        DEFAULT = 'default',
        EXPLORE = 'explore',
        BLAZE = 'blaze'
    }
    
    // Replace the binary exploreMode prop with visualizationMode
    export let visualizationMode: VisualizationMode = VisualizationMode.DEFAULT;
    export let machine: any;
    export let initial_tape: string;
    export let tapeWidth: number;
    export let nbIter: number;
    export let origin_x: number;
    export let showHeadMove: boolean;
    
    export let machineName: string;
    
    // Renamed from xStretch to stretch
    export let stretch: boolean = true;
    
    // New quality parameter for binning control in Blaze mode
    export let quality: boolean = true;
    
    // Helper functions to simplify conditional checks with proper types
    function isDefaultMode(mode: VisualizationMode): boolean {
        return mode === VisualizationMode.DEFAULT;
    }
    
    function isExploreMode(mode: VisualizationMode): boolean {
        return mode === VisualizationMode.EXPLORE;
    }
    
    function isBlazeMode(mode: VisualizationMode): boolean {
        return mode === VisualizationMode.BLAZE;
    }
    
    // Helper function to check if a parameter should be shown based on visualization mode
    export function shouldShowParameter(mode: VisualizationMode, paramName: string): boolean {
        if (isBlazeMode(mode)) {
            // Blaze mode only shows steps parameter
            return paramName === 'nbIter';
        }
        // Default and Explore modes show all parameters
        return true;
    }
    
    let canvas: HTMLCanvasElement;
    
    const drawRect = (context: CanvasRenderingContext2D): void => {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fill();
    };
    
    let drawCleanup: (() => void) | undefined;
    async function draw(): Promise<void> {
        if (drawCleanup) drawCleanup();
        
        // Update the width of the canvas based on visualization mode
        // Non-default modes use the wider canvas
        canvas.width = isDefaultMode(visualizationMode) ? 400 : 800;
        
        if (!machine) {
            return;
        }
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        drawRect(context);
        
		// Choose visualization method based on mode
		switch (visualizationMode) {
			case VisualizationMode.EXPLORE:
			drawCleanup = tm_explore(context, machine, initial_tape, nbIter);
			break;
			
			case VisualizationMode.BLAZE:
				// Pass stretch and quality parameters to tm_blaze
				await tm_blaze(context, machine, nbIter, stretch, quality).catch(error => {
					console.error("Error in blaze visualization:", error);
				});
				break;
			
			case VisualizationMode.DEFAULT:
			default:
			// Default mode
			tm_trace_to_image(
				context,
				machine,
				initial_tape,
				tapeWidth,
				nbIter,
				origin_x,
				true,
				showHeadMove
			);
			break;
		}
    }
    
    $: {
        // Dependencies:
        visualizationMode;
        machine;
        initial_tape;
        tapeWidth;
        nbIter;
        origin_x;
        showHeadMove;
        stretch; // Renamed from xStretch
        quality; // Add new dependency
        
        if (canvas) {
            draw();
        }
    }
</script>

<div class="relative mr-5">
    <canvas class="bg-slate-800 image-render-pixel" bind:this={canvas} width="400" height="500" />
</div>
