export class XBaseWidget {
  #initialized = false;
  #done = false;

  constructor(element) {
    this.element = element;
    this.boundHandlers = new Map();
    this.bindHandlers();
  }

  bindHandlers() {
    const handlerMethods = this.#getHandlerMethods();

    // Bind each handler method to this instance
    handlerMethods.forEach(handler => {
      const boundMethod = this[handler].bind(this);
      this.boundHandlers.set(handler, boundMethod);
      this[handler] = boundMethod;
    });
  }

  #getHandlerMethods() {
    const allProperties = this.#getAllPropertiesFromPrototypeChain(this);

    return allProperties.filter(prop => this.#isValidHandlerMethod(prop));
  }

  #getAllPropertiesFromPrototypeChain(obj) {
    const properties = new Set();
    let currentObj = obj;

    while (currentObj && currentObj !== Object.prototype) {
      Object.getOwnPropertyNames(currentObj).forEach(prop => properties.add(prop));
      currentObj = Object.getPrototypeOf(currentObj);
    }

    return Array.from(properties);
  }

  #isValidHandlerMethod(propertyName) {
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(this),
      propertyName
    );

    return (
      propertyName.endsWith('Handler') &&
      typeof this[propertyName] === 'function' &&
      (!descriptor || descriptor.configurable)
    );
  }

  async init() {
    if (this.#initialized) return;

    try {
      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('widget-content');

      if (this.element.firstChild) {
        this.element.insertBefore(this.wrapper, this.element.firstChild);
      } else {
        this.element.appendChild(this.wrapper);
      }

      await this.createContent(this.wrapper);

      this.#initialized = true;
      this.element.classList.add('widget-initialized');
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  async createContent(wrapper) {
    throw new Error('createContent method must be implemented');
  }

  destroy() {
    if (!this.#initialized && !this.wrapper) return;

    this.boundHandlers.forEach((handler, key) => {
      const eventName = key.replace('Handler', '').toLowerCase();
      this.element.removeEventListener(eventName, handler);
    });
    this.boundHandlers.clear();

    if (this.wrapper) {
      this.wrapper.remove();
      this.wrapper = null;
    }

    this.element.classList.remove('widget-initialized', 'widget-done');
    this.#initialized = false;
    this.#done = false;
  }

  isInitialized() {
    return this.#initialized;
  }

  isDone() {
    return this.#done;
  }

  markDone() {
    if (!this.#initialized) {
      throw new Error('Cannot mark as done: widget not initialized');
    }
    this.#done = true;
    this.element.classList.add('widget-done');
  }
}

export function createXWidget(WidgetClass) {
  return function (element) {
    return new WidgetClass(element);
  }
}