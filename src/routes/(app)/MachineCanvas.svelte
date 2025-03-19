<script lang="ts">
    import { tm_trace_to_image, tm_explore } from '$lib/tm';
    
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
    function draw(): void {
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
        if (isExploreMode(visualizationMode)) {
            drawCleanup = tm_explore(context, machine, initial_tape, nbIter);
        } else if (isBlazeMode(visualizationMode)) {
            // Initially, Blaze mode is a duplicate of Explore mode
            // In the future, this can be customized with different behavior
            drawCleanup = tm_explore(context, machine, initial_tape, nbIter);
        } else {
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
        
        if (canvas) {
            draw();
        }
    }
</script>

<div class="relative mr-5">
    <canvas class="bg-slate-800 image-render-pixel" bind:this={canvas} width="400" height="500" />
</div>
