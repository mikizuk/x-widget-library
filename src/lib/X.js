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
          await widget.init();
          
          const instance = {
            widget,
            initialized: true,
            done: false,
            failed: false
          };
          
          this.#instances.set(node, instance);
          node.classList.remove('widget-initializing');
          node.classList.add('widget-initialized');
          
          const children = [...node.children].filter(child => child.hasAttribute('widget'));
          await Promise.all(children.map(child => processNode(child)));
          
        } catch (error) {
          errors.push({ node, error });
          node.classList.add('widget-failed');
          this.#instances.set(node, { initialized: false, done: false, failed: true });
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