export class X {
  static #instances = new WeakMap();
  static #resolver = path => {
    // Remove 'widgets/' prefix and handle path resolution
    const widgetName = path.replace('widgets/', '');
    return import(`../widgets/${widgetName}.js`);
  };

  static setResolver(resolver) {
    this.#resolver = resolver;
  }

  static async init(root, callback) {
    try {
      const errors = [];
      
      const processNode = async (node) => {
        if (this.#instances.has(node)) {
          return;
        }

        const widgetPath = node.getAttribute('widget');
        if (!widgetPath) return;

        try {
          node.classList.add('widget-initializing');
          const module = await this.#resolver(widgetPath);
          const createWidget = module.default;
          
          const widget = createWidget(node);
          widget.init(); // Call init to render shapes and content
          
          const instance = {
            widget,
            initialized: true,
            done: false
          };
          
          this.#instances.set(node, instance);
          node.classList.remove('widget-initializing');
          node.classList.add('widget-initialized');
          
          // Process children after parent initialization
          const children = [...node.children].filter(child => child.hasAttribute('widget'));
          await Promise.all(children.map(child => processNode(child)));
          
        } catch (error) {
          errors.push({ node, error });
          node.classList.add('widget-failed');
        }
      };

      await processNode(root);
      callback(errors.length ? errors : null);
    } catch (error) {
      callback([{ node: root, error }]);
    }
  }

  static destroy(root) {
    const processNode = (node) => {
      // Process children first (bottom-up)
      const children = [...node.children].filter(child => child.hasAttribute('widget'));
      children.forEach(child => processNode(child));

      const instance = this.#instances.get(node);
      if (instance) {
        instance.widget.destroy();
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
    if (!instance || !instance.initialized) {
      throw new Error('Widget not initialized');
    }
    instance.done = true;
    node.classList.add('widget-done');
  }

  static simulateFail(node) {
    const instance = this.#instances.get(node);
    if (!instance) return;
    
    node.classList.add('widget-failed');
    if (instance.widget.destroy) {
      instance.widget.destroy();
    }
    this.#instances.delete(node);
  }
}