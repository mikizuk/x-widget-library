export class BaseWidget {
  constructor(element) {
    this.element = element;
    this.boundHandlers = new Map();
    this.bindHandlers();
  }

  bindHandlers() {
    // Automatically bind methods ending with 'Handler'
    Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(prop => prop.endsWith('Handler') && typeof this[prop] === 'function')
      .forEach(handler => {
        const bound = this[handler].bind(this);
        this.boundHandlers.set(handler, bound);
      });
  }

  async init() {
    // Create a wrapper for widget content that will be placed at the top
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('widget-content');
    
    // Insert wrapper at the beginning of the element
    if (this.element.firstChild) {
      this.element.insertBefore(this.wrapper, this.element.firstChild);
    } else {
      this.element.appendChild(this.wrapper);
    }
    
    await this._initContent(this.wrapper);
  }

  // To be implemented by child classes
  async _initContent(wrapper) {
    throw new Error('_initContent method must be implemented');
  }

  destroy() {
    // Remove all bound event handlers
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