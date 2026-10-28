import '@fontsource/delius/400.css';
import './styles.css';
import { BrushMode, createBackgroundRemover, encodeCutout, type BackgroundRemover, type CutResult } from '@dloizides/background-removal';
import { openEditor, type Editor } from './editor';
import { clampSplit, cutoutName, isSupportedImage, seconds } from './logic';
import { FM } from './strings';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const ui = {
  empty: $('empty'), work: $('work'), file: $<HTMLInputElement>('file'), choose: $<HTMLButtonElement>('choose'),
  orig: $<HTMLImageElement>('orig'), canvas: $<HTMLCanvasElement>('cut'), status: $('status'), compare: $('compare'),
  split: $<HTMLInputElement>('split'), keep: $<HTMLButtonElement>('keep'), erase: $<HTMLButtonElement>('erase'),
  size: $<HTMLInputElement>('size'), undo: $<HTMLButtonElement>('undo'), again: $<HTMLButtonElement>('new'),
  download: $<HTMLButtonElement>('download'), dropError: $('drop-error'),
};
const editControls = [ui.keep, ui.erase, ui.size, ui.undo, ui.download];

let remover: Promise<BackgroundRemover> | undefined;
let mode: BrushMode = BrushMode.Keep;
let editor: Editor | undefined;
let current: { cut: CutResult; name: string } | undefined;
let origUrl = '';

const loadRemover = (): Promise<BackgroundRemover> =>
  (remover ??= Promise.resolve(createBackgroundRemover(__BG_REMOVAL_URLS__)));

function setEditing(enabled: boolean): void {
  for (const c of editControls) c.disabled = !enabled;
  ui.download.classList.toggle('primary', enabled);
  ui.work.dataset.state = enabled ? 'cut' : 'cutting';
}

function showEmpty(): void {
  editor?.detach();
  editor = undefined;
  current = undefined;
  ui.work.hidden = true;
  ui.empty.hidden = false;
  ui.file.value = '';
  ui.choose.focus();
}

function showCut(cut: CutResult, name: string): void {
  current = { cut, name };
  ui.canvas.hidden = false;
  editor = openEditor(ui.canvas, cut, { mode: () => mode, radiusCss: () => Number(ui.size.value), onUndoable: (on) => { ui.undo.disabled = !on; } });
  setEditing(true);
  ui.undo.disabled = true;
  ui.status.textContent = FM('status.done', seconds(cut.elapsedMs));
  ui.download.focus();
}

async function cutPhoto(file: File): Promise<void> {
  if (!isSupportedImage(file.type)) { ui.dropError.textContent = FM('status.unsupported'); return; }
  ui.dropError.textContent = '';
  URL.revokeObjectURL(origUrl);
  origUrl = URL.createObjectURL(file);
  ui.orig.src = origUrl;
  ui.canvas.hidden = true;
  ui.empty.hidden = true;
  ui.work.hidden = false;
  setEditing(false);
  ui.status.textContent = FM('status.cutting');
  ui.again.focus();
  try {
    showCut(await (await loadRemover()).removeBackground(file), file.name);
  } catch (error: unknown) {
    ui.status.textContent = FM('status.failed', error instanceof Error ? error.message : String(error));
  }
}

async function download(): Promise<void> {
  if (current === undefined) return;
  const url = URL.createObjectURL(await encodeCutout(current.cut.image, current.cut.mask));
  const a = Object.assign(document.createElement('a'), { href: url, download: cutoutName(current.name) });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url));
}

function pickMode(picked: BrushMode): void {
  mode = picked;
  ui.keep.setAttribute('aria-pressed', String(picked === BrushMode.Keep));
  ui.erase.setAttribute('aria-pressed', String(picked === BrushMode.Erase));
}

function wireDrop(): void {
  ui.empty.addEventListener('dragover', (e) => { e.preventDefault(); ui.empty.classList.add('over'); });
  ui.empty.addEventListener('dragleave', () => ui.empty.classList.remove('over'));
  ui.empty.addEventListener('drop', (e) => {
    e.preventDefault();
    ui.empty.classList.remove('over');
    const file = e.dataTransfer?.files[0];
    if (file !== undefined) void cutPhoto(file);
  });
}

function wire(): void {
  ui.choose.addEventListener('click', () => ui.file.click());
  ui.file.addEventListener('change', () => { const f = ui.file.files?.[0]; if (f !== undefined) void cutPhoto(f); });
  ui.keep.addEventListener('click', () => pickMode(BrushMode.Keep));
  ui.erase.addEventListener('click', () => pickMode(BrushMode.Erase));
  ui.undo.addEventListener('click', () => editor?.undo());
  ui.again.addEventListener('click', showEmpty);
  ui.download.addEventListener('click', () => void download());
  ui.split.addEventListener('input', () => ui.compare.style.setProperty('--split', `${clampSplit(Number(ui.split.value))}%`));
  ui.split.setAttribute('aria-label', FM('compare'));
  wireDrop();
  pickMode(BrushMode.Keep);
  ui.choose.focus();
}

wire();
