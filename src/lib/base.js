export class BaseWidget {
  constructor(element) {
    this.element = element;
    this.boundHandlers = new Map();
    this.bindHandlers();
  }

  bindHandlers() {
    // Automatically bind methods ending with 'Handler'
    Object.getPrototypeOf(this)
      .constructor.name.toLowerCase();
    
    Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(prop => prop.endsWith('Handler') && typeof this[prop] === 'function')
      .forEach(handler => {
        const bound = this[handler].bind(this);
        this.boundHandlers.set(handler, bound);
      });
  }

  init() { }

  destroy() {    
    // Remove all bound event handlers
    this.boundHandlers.forEach((handler, key) => {
      this.element.removeEventListener(key.replace('Handler', '').toLowerCase(), handler);
    });
    this.boundHandlers.clear();
  }
}