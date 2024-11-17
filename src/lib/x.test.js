import { describe, test, expect, beforeEach, vi } from 'vitest';
import { X } from './x.js';

class MockElement {
  constructor() {
    this._attributes = new Map();
    this.children = [];
    this._classList = new Set();
  }

  setAttribute(name, value) {
    this._attributes.set(name, value);
  }

  getAttribute(name) {
    return this._attributes.get(name);
  }

  hasAttribute(name) {
    return this._attributes.has(name);
  }

  get classList() {
    return {
      add: (className) => this._classList.add(className),
      remove: (...classNames) => classNames.forEach(cn => this._classList.delete(cn)),
      contains: (className) => this._classList.has(className)
    };
  }
}

const mockWidget = {
  init: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockReturnValue(true),
  isDone: vi.fn().mockReturnValue(false),
  destroy: vi.fn(),
  initialized: true
};

const createMockWidget = () => ({
  ...mockWidget,
  init: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockReturnValue(true),
  isDone: vi.fn().mockReturnValue(false),
  destroy: vi.fn(),
  initialized: true
});

describe('X', () => {
  let root;
  let child1;
  let child2;

  beforeEach(() => {
    vi.clearAllMocks();
    
    root = new MockElement();
    child1 = new MockElement();
    child2 = new MockElement();
    
    root.children = [child1, child2];
    
    vi.mock('../widgets/a.js', () => ({
      default: () => createMockWidget()
    }));
    
    vi.mock('../widgets/b.js', () => ({
      default: () => createMockWidget()
    }));
  });

  test('init calls callback with null when all widgets initialize successfully', async () => {
    root.setAttribute('widget', 'widgets/a');
    child1.setAttribute('widget', 'widgets/b');
    
    const callback = vi.fn();
    await X.init(root, callback);
    
    expect(callback).toHaveBeenCalledWith(null);
  });

  test('init calls callback with errors when widget initialization fails', async () => {
    root.setAttribute('widget', 'widgets/a');
    child1.setAttribute('widget', 'widgets/error');
    
    const callback = vi.fn();
    await X.init(root, callback);
    
    expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        node: child1,
        error: expect.any(Error)
      })
    ]));
  });

  test('init prevents children initialization when parent fails', async () => {
    root.setAttribute('widget', 'widgets/error');
    child1.setAttribute('widget', 'widgets/a');
    
    const callback = vi.fn();
    await X.init(root, callback);
    
    expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        node: root,
        error: expect.any(Error)
      })
    ]));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('init handles concurrent initialization attempts', async () => {
    root.setAttribute('widget', 'widgets/a');
    
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    const init1 = X.init(root, callback1);
    const init2 = X.init(root, callback2);
    
    await Promise.all([init1, init2]);
    
    expect(callback2).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        node: root,
        error: expect.objectContaining({
          message: expect.stringContaining('interrupted')
        })
      })
    ]));
  });

  test('init skips already initialized widgets', async () => {
    root.setAttribute('widget', 'widgets/a');
    child1.setAttribute('widget', 'widgets/b');
    
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    await X.init(root, callback1);
    
    vi.clearAllMocks();
    
    await X.init(root, callback2);
    
    expect(callback2).toHaveBeenCalledWith(null);
    
    const rootInstance = X.getInstance(root);
    const childInstance = X.getInstance(child1);
    
    expect(rootInstance.widget.init).not.toHaveBeenCalled();
    expect(childInstance.widget.init).not.toHaveBeenCalled();
  });

  test('getInstance returns derefed instance', async () => {
    root.setAttribute('widget', 'widgets/a');
    
    const callback = vi.fn();
    await X.init(root, callback);
    
    const instance = X.getInstance(root);
    expect(instance).toBeDefined();
    expect(instance.initialized).toBe(true);
  });

  test('destroy properly cleans up WeakRef instances', async () => {
    root.setAttribute('widget', 'widgets/a');
    child1.setAttribute('widget', 'widgets/b');
    
    const callback = vi.fn();
    await X.init(root, callback);
    
    X.destroy(root);
    
    const rootInstance = X.getInstance(root);
    const childInstance = X.getInstance(child1);
    
    expect(rootInstance?.initialized || false).toBe(false);
    expect(childInstance?.initialized || false).toBe(false);
  });

  test('callback is called exactly once with accumulated errors', async () => {
    root.setAttribute('widget', 'widgets/error');
    child1.setAttribute('widget', 'widgets/error');
    child2.setAttribute('widget', 'widgets/error');
    
    const callback = vi.fn();
    await X.init(root, callback);
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        node: root,
        error: expect.any(Error)
      })
    ]));
  });
});