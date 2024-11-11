export class XBaseWidget {
  constructor(element) {
    this.element = element;
    this.boundHandlers = new Map();
    this.bindHandlers();
  }

  bindHandlers() {
    const getAllProperties = (obj) => {
      const props = new Set();
      let currentObj = obj;
      
      while (currentObj && currentObj !== Object.prototype) {
        Object.getOwnPropertyNames(currentObj).forEach(prop => props.add(prop));
        currentObj = Object.getPrototypeOf(currentObj);
      }
      
      return Array.from(props);
    };

    getAllProperties(this)
      .filter(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), prop);
        return prop.endsWith('Handler') && 
               typeof this[prop] === 'function' && 
               (!descriptor || descriptor.configurable);
      })
      .forEach(handler => {
        const bound = this[handler].bind(this);

        this.boundHandlers.set(handler, bound);
        this[handler] = bound;
      });
  }

  async init() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('widget-content');

    if (this.element.firstChild) {
      this.element.insertBefore(this.wrapper, this.element.firstChild);
    } else {
      this.element.appendChild(this.wrapper);
    }

    await this.createContent(this.wrapper);
  }

  async createContent(wrapper) {
    throw new Error('createContent method must be implemented');
  }

  destroy() {
    this.boundHandlers.forEach((handler, key) => {
      this.element.removeEventListener(key.replace('Handler', '').toLowerCase(), handler);
    });
    this.boundHandlers.clear();

    // Remove the content wrapper
    if (this.wrapper) {
      this.wrapper.remove();
    }
  }
}

export function createXWidget(WidgetClass) {
  return function(element) {
    return new WidgetClass(element);
  }
}