import { describe, test, expect, beforeEach, vi } from 'vitest';
import { XBaseWidget, createXWidget } from './XBaseWidget';

class MockElement {
  constructor() {
    this.children = [];
    this.eventListeners = {};
    this._classList = new Set();
    this.firstChild = null;
    
    this.classList = {
      add: (className) => this._classList.add(className),
      remove: (className) => this._classList.remove(className),
      contains: (className) => this._classList.has(className),
      toggle: (className) => {
        if (this._classList.has(className)) {
          this._classList.delete(className);
          return false;
        } else {
          this._classList.add(className);
          return true;
        }
      }
    };
  }

  appendChild(child) {
    this.children.push(child);
    if (this.children.length === 1) {
      this.firstChild = child;
    }
    return child;
  }

  insertBefore(newChild, referenceChild) {
    const index = this.children.indexOf(referenceChild);
    if (index === -1) {
      this.children.push(newChild);
    } else {
      this.children.splice(index, 0, newChild);
    }
    if (index === 0 || this.children.length === 1) {
      this.firstChild = newChild;
    }
    return newChild;
  }

  addEventListener(event, handler) {
    this.eventListeners[event] = this.eventListeners[event] || [];
    this.eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
    }
  }

  remove() {
    const parent = this._parentElement;
    if (parent) {
      const index = parent.children.indexOf(this);
      if (index !== -1) {
        parent.children.splice(index, 1);
        if (index === 0 && parent.children.length > 0) {
          parent.firstChild = parent.children[0];
        } else if (parent.children.length === 0) {
          parent.firstChild = null;
        }
      }
    }
  }

  get innerHTML() {
    return this._innerHTML || '';
  }

  set innerHTML(value) {
    this._innerHTML = value;
  }
}

class TestWidget extends XBaseWidget {
  clickHandler() {
  }

  async createContent(wrapper) {
    wrapper.innerHTML = '<div>Test Content</div>';
  }
}

describe('XBaseWidget', () => {
  let element;
  let widget;

  beforeEach(() => {
    element = new MockElement();
    widget = new TestWidget(element);
  });

  test('constructor initializes properties correctly', () => {
    expect(widget.element).toBe(element);
    expect(widget.boundHandlers).toBeInstanceOf(Map);
  });

  test('bindHandlers binds methods ending with Handler', () => {
    expect(widget.boundHandlers.has('clickHandler')).toBe(true);
    const boundHandler = widget.boundHandlers.get('clickHandler');
    expect(typeof boundHandler).toBe('function');
  });

  test('init creates wrapper with correct class', async () => {
    await widget.init();
    expect(element.children[0].classList.contains('widget-content')).toBe(true);
  });

  test('init adds wrapper as first child when element has children', async () => {
    const existingChild = new MockElement();
    element.appendChild(existingChild);
    
    await widget.init();
    
    expect(element.children.length).toBe(2);
    expect(element.children[0]).toBe(widget.wrapper);
    expect(element.children[0].classList.contains('widget-content')).toBe(true);
    expect(element.children[1]).toBe(existingChild);
    expect(element.firstChild).toBe(widget.wrapper);
  });

  test('destroy cleans up bound handlers', () => {
    const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
    
    widget.destroy();
    
    expect(widget.boundHandlers.size).toBe(0);
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  test('destroy removes wrapper element', async () => {
    await widget.init();
    const wrapperRemoveSpy = vi.spyOn(widget.wrapper, 'remove');
    
    widget.destroy();
    
    expect(wrapperRemoveSpy).toHaveBeenCalled();
  });

  test('createContent throws error if not implemented', async () => {
    class IncompleteWidget extends XBaseWidget {}
    const incompleteWidget = new IncompleteWidget(element);
    
    await expect(incompleteWidget.createContent()).rejects.toThrow('createContent method must be implemented');
  });
});

describe('createXWidget', () => {
  test('creates widget factory function', () => {
    const element = new MockElement();
    const widgetFactory = createXWidget(TestWidget);
    const widget = widgetFactory(element);
    
    expect(widget).toBeInstanceOf(TestWidget);
    expect(widget.element).toBe(element);
  });
});