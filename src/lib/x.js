export class X {
  static #instances = new WeakMap();
  static #initializingNodes = new WeakSet();

  static async #resolver(path) {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const normalizedPath = path.replace(/^widgets\//, '');
      const module = await import(`../widgets/${normalizedPath}.js`);
      return module;
    } catch (error) {
      throw new Error(`Failed to load widget: ${path}`);
    }
  }

  static #isInitializing(node) {
    if (this.#initializingNodes.has(node)) return true;
    return [...node.children]
      .filter(child => child.hasAttribute('widget'))
      .some(child => this.#isInitializing(child));
  }

  static async #loadAndInitWidget(node) {
    const widgetPath = node.getAttribute('widget');
    this.#initializingNodes.add(node);
    node.classList.add('widget-initializing');

    try {
      const module = await this.#resolver(widgetPath);
      const widget = module.default(node);

      await widget.init();
      
      this.#instances.set(node, new WeakRef({
        widget,
        initialized: widget.isInitialized(),
        done: widget.isDone(),
        failed: false
      }));
    } catch (error) {
      this.#instances.set(node, new WeakRef({ 
        widget: null,
        initialized: false, 
        done: false, 
        failed: true 
      }));
      node.classList.add('widget-failed');
      throw error;
    } finally {
      node.classList.remove('widget-initializing');
      this.#initializingNodes.delete(node);
    }
  }

  static async #initializeWidgets(node, errors = []) {
    if (node.hasAttribute('widget')) {
      const instance = this.#instances.get(node)?.deref();

      if (!instance?.widget || !instance.initialized) {
        try {
          await this.#loadAndInitWidget(node);
        } catch (error) {
          errors.push({ node, error });
          return errors;
        }
      }
    }

    const children = [...node.children].filter(child => child.hasAttribute('widget'));
    for (const child of children) {
      const childInstance = this.#instances.get(child)?.deref();
      if (!childInstance?.initialized) {
        await this.#initializeWidgets(child, errors);
      }
    }
    return errors;
  }

  static getInstance(node) {
    return this.#instances.get(node)?.deref();
  }

  static async init(root, callback) {
    let errors = [];
    try {
      if (this.#isInitializing(root)) {
        errors.push({
          node: root,
          error: new Error('Widget initialization interrupted by another process')
        });
      } else {
        const initErrors = await this.#initializeWidgets(root);
        if (initErrors.length > 0) {
          errors.push(...initErrors);
        }
      }
    } catch (error) {
      errors.push({ 
        node: root, 
        error: error instanceof Error ? error : new Error(String(error))
      });
    } finally {
      callback(errors.length > 0 ? errors : null);
    }
  }

  static destroy(root) {
    const processNode = (node) => {
      // Process children first (bottom-up)
      const children = [...node.children].filter(child => child.hasAttribute('widget'));
      children.forEach(child => processNode(child));

      const instance = this.#instances.get(node)?.deref();
      if (instance?.widget) {
        instance.widget.destroy();
      }
      this.#instances.delete(node);
      node.classList.remove('widget-initialized', 'widget-done', 'widget-failed');
    };

    processNode(root);
  }

  static markDone(node) {
    const instance = this.#instances.get(node)?.deref();
    if (!instance?.widget?.isInitialized()) {
      throw new Error('Widget must be initialized');
    }
    instance.widget.markDone();
    instance.done = true;
  }

  static simulateFail(node) {
    const processFailure = (node) => {
      const instance = this.#instances.get(node)?.deref();
      if (!instance) return;

      const children = [...node.children].filter(child => child.hasAttribute('widget'));
      children.forEach(child => processFailure(child));

      if (instance.widget) {
        instance.widget.destroy();
      }

      this.#instances.set(node, new WeakRef({
        widget: null,
        initialized: false,
        done: false,
        failed: true
      }));

      node.classList.add('widget-failed');
      node.classList.remove('widget-initialized', 'widget-done');
    };

    processFailure(node);
  }
}