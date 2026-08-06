import { describe, it, expect, vi } from 'vitest';
import { WindifyEventEmitter } from './WindifyEventEmitter';

describe('WindifyEventEmitter', () => {
  it('handles on, off, once, emit, getListenerCount, and removeAllListeners', () => {
    const emitter = new WindifyEventEmitter();
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    expect(emitter.getListenerCount()).toBe(0);
    expect(emitter.getListenerCount('click')).toBe(0);

    emitter.on('click', fn1);
    emitter.on('click', fn2);
    expect(emitter.getListenerCount('click')).toBe(2);
    expect(emitter.getListenerCount()).toBe(2);

    emitter.emit({ type: 'click', lngLat: [100, 10] });
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);

    emitter.off('click', fn1);
    expect(emitter.getListenerCount('click')).toBe(1);

    const onceFn = vi.fn();
    emitter.once('dblclick', onceFn);
    expect(emitter.getListenerCount('dblclick')).toBe(1);

    emitter.emit({ type: 'dblclick', lngLat: [100, 10] });
    expect(onceFn).toHaveBeenCalledTimes(1);
    expect(emitter.getListenerCount('dblclick')).toBe(0);

    emitter.off('click', fn2);
    expect(emitter.getListenerCount('click')).toBe(0);

    emitter.on('mousemove', fn1);
    emitter.removeAllListeners();
    expect(emitter.getListenerCount()).toBe(0);
  });
});
