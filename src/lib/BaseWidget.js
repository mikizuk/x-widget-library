export class BaseWidget {
  #initialized = false;
  #target = null;
  #done = false;

  constructor() {
    const proto = Object.getPrototypeOf(this);
    Object.getOwnPropertyNames(proto).forEach(prop => {
      if (prop.endsWith('Handler') && typeof this[prop] === 'function') {
        this[prop] = this[prop].bind(this);
      }
    });
  }

  async init(target) {
    if (this.#initialized) return;
    this.#target = target;
    target.classList.add('widget-initializing');
    await this._init(target);
  }

  async finishInit() {
    if (this.#initialized) return;
    this.#initialized = true;
    this.#target.classList.remove('widget-initializing');
    this.#target.classList.add('widget-initialized');
    await this._finishInit();
  }

  destroy() {
    if (!this.#initialized) return;
    this._destroy();
    this.#target.classList.remove('widget-initialized');
    this.#target.classList.remove('widget-done');
    this.#initialized = false;
    this.#done = false;
    this.#target = null;
  }

  markDone() {
    if (!this.#initialized) throw new Error('Widget not initialized');
    this.#done = true;
    this.#target.classList.add('widget-done');
  }

  simulateFail() {
    if (!this.#initialized) return;
    this._onFail();
    this.#target.classList.add('widget-failed');
  }

  // Override these methods in child classes
  async _init(target) {}
  async _finishInit() {}
  _destroy() {}
  _onFail() {}

  isInitialized() {
    return this.#initialized;
  }

  isDone() {
    return this.#done;
  }
}