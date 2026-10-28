import { applyAlpha, attachRefineBrush, type BrushMode, type CutResult } from '@dloizides/background-removal';
import { pushSnapshot } from './logic';

const UNDO_LIMIT = 20;

export interface EditorTools {
  mode(): BrushMode;
  radiusCss(): number;
  onUndoable(available: boolean): void;
}

export interface Editor {
  undo(): void;
  detach(): void;
}

function paint(canvas: HTMLCanvasElement, cut: CutResult): void {
  const pixels = applyAlpha(cut.image, cut.mask.data);
  canvas.getContext('2d')?.putImageData(new ImageData(pixels, cut.mask.width, cut.mask.height), 0, 0);
}

/** Shows the cut on the canvas, wires the keep/erase brush and a snapshot undo. */
export function openEditor(canvas: HTMLCanvasElement, cut: CutResult, tools: EditorTools): Editor {
  canvas.width = cut.mask.width;
  canvas.height = cut.mask.height;
  paint(canvas, cut);
  let stack: Uint8ClampedArray[] = [];
  const snapshot = (): void => { stack = pushSnapshot(stack, cut.mask.data.slice(), UNDO_LIMIT); tools.onUndoable(true); };
  canvas.addEventListener('pointerdown', snapshot);
  const scale = (): number => cut.mask.width / Math.max(1, canvas.clientWidth);
  const detachBrush = attachRefineBrush(canvas, { mask: cut.mask, image: cut.image, getMode: tools.mode, getRadius: () => tools.radiusCss() * scale() });
  tools.onUndoable(false);
  return {
    undo: () => {
      const previous = stack.pop();
      if (previous === undefined) return;
      cut.mask.data.set(previous);
      paint(canvas, cut);
      tools.onUndoable(stack.length > 0);
    },
    detach: () => { canvas.removeEventListener('pointerdown', snapshot); detachBrush(); },
  };
}
