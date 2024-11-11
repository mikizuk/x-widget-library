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

  static async init(root, callback) {

    try {
      if (this.#isInitializing(root)) {
        throw new Error('WidgetDestroyed: Widget initialization interrupted by another process');
      }
      else {
        
        await this.#initializeWidgets(root);
        callback(null);
      }
    } catch (error) {
      callback([{ 
        node: root, 
        error: error instanceof Error ? error : new Error(String(error))
      }]);
    }
  }

  static #isInitializing(node) {
    if (this.#initializingNodes.has(node)) return true;
    return [...node.children]
      .filter(child => child.hasAttribute('widget'))
      .some(child => this.#isInitializing(child));
  }

  static async #initializeWidgets(node) {
    console.log("initializeWidgets", );
    // Get or create widget instance for the node
    if (node.hasAttribute('widget') && !this.#instances.has(node)) {
      await this.#loadAndInitWidget(node);
    }

    // Process children in a top-to-bottom approach
    const children = [...node.children].filter(child => child.hasAttribute('widget'));
    for (const child of children) {
      await this.#initializeWidgets(child);
    }
  }

  static async #loadAndInitWidget(node) {
    console.log("loadAndInitWidget", );
    const widgetPath = node.getAttribute('widget');
    this.#initializingNodes.add(node);
    node.classList.add('widget-initializing');

    try {
      const module = await this.#resolver(widgetPath);
      const widget = module.default(node);
      await widget.init();
      
      this.#instances.set(node, {
        widget,
        initialized: true,
        done: false,
        failed: false
      });

      node.classList.add('widget-initialized');
    } catch (error) {
      this.#instances.set(node, { initialized: false, done: false, failed: true });
      node.classList.add('widget-failed');
      throw error;
    } finally {
      node.classList.remove('widget-initializing');
      this.#initializingNodes.delete(node);
    }
  }


  // ----- ----- -----
  // ----- ----- -----
  // ----- ----- -----
  // ----- ----- -----

  static destroy(root) {
    const processNode = (node) => {
      const children = [...node.children].filter(child => child.hasAttribute('widget'));
      children.forEach(child => processNode(child));

      const instance = this.#instances.get(node);
      if (instance) {
        if (instance?.widget?.destroy) {
          instance.widget.destroy();
        }
        node.classList.remove('widget-initialized');
        node.classList.remove('widget-done');
        node.classList.remove('widget-failed');
        this.#instances.delete(node);
      }
    };

    processNode(root);
  }

  static getInstance(node) {
    return this.#instances.get(node);
  }

  static markDone(node) {
    const instance = this.#instances.get(node);
    if (!instance || !instance.initialized || instance.failed) {
      throw new Error('Widget must be initialized and not in failed state');
    }
    instance.done = true;
    node.classList.add('widget-done');
  }

  static simulateFail(node) {
    const processFailure = (node) => {
      const instance = this.#instances.get(node);
      if (!instance) return;

      const children = [...node.children].filter(child => child.hasAttribute('widget'));
      children.forEach(child => processFailure(child));

      if (instance?.widget?.destroy) {
        instance.widget.destroy();
      }

      this.#instances.set(node, {
        initialized: false,
        done: false,
        failed: true
      });

      node.classList.add('widget-failed');
      node.classList.remove('widget-initialized');
      node.classList.remove('widget-done');
    };

    processFailure(node);
  }
}