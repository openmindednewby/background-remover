import { describe, expect, it } from 'vitest';
import { clampSplit, cutoutName, isSupportedImage, pushSnapshot, seconds } from '../src/logic';

describe('isSupportedImage', () => {
  it('with a WebP type, returns true', () => {
    const type = 'image/webp';

    const result = isSupportedImage(type);

    expect(result).toBe(true);
  });

  it('with a GIF type, returns false', () => {
    const type = 'image/gif';

    const result = isSupportedImage(type);

    expect(result).toBe(false);
  });
});

describe('cutoutName', () => {
  it('with a dotted JPG name, swaps only the extension for -cutout.png', () => {
    const name = 'holiday.beach.jpg';

    const result = cutoutName(name);

    expect(result).toBe('holiday.beach-cutout.png');
  });

  it('with only an extension, falls back to photo-cutout.png', () => {
    const name = '.png';

    const result = cutoutName(name);

    expect(result).toBe('photo-cutout.png');
  });
});

describe('seconds', () => {
  it('with 1449 ms, returns "1.4"', () => {
    const ms = 1449;

    const result = seconds(ms);

    expect(result).toBe('1.4');
  });
});

describe('clampSplit', () => {
  it('with 140, returns 100', () => {
    const value = 140;

    const result = clampSplit(value);

    expect(result).toBe(100);
  });

  it('with NaN, returns the middle 50', () => {
    const value = Number.NaN;

    const result = clampSplit(value);

    expect(result).toBe(50);
  });
});

describe('pushSnapshot', () => {
  it('with the stack at the limit, drops the oldest snapshot', () => {
    const stack = ['a', 'b'];

    const result = pushSnapshot(stack, 'c', 2);

    expect(result).toEqual(['b', 'c']);
  });
});
