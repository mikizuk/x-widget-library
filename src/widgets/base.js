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

  createShape(type = 'circle', color = '#4CAF50') {
    const shape = document.createElement('div');
    shape.className = `widget-shape ${type}`;
    shape.style.setProperty('background-color', color);
    shape.style.setProperty('border-bottom-color', color);
    return shape;
  }

  renderChildren() {
    const children = [...this.element.children].filter(child => 
      child.hasAttribute('widget') && !child.querySelector('.widget-shape')
    );
    
    children.forEach(child => {
      const childShape = this.createShape('circle', '#2196F3');
      childShape.style.width = '20px';
      childShape.style.height = '20px';
      child.insertBefore(childShape, child.firstChild);
    });
  }

  init() {
    const shape = this.createShape(this.getShapeType(), this.getShapeColor());
    this.element.insertBefore(shape, this.element.firstChild);
    this.renderChildren();
  }

  getShapeType() {
    return 'circle';
  }

  getShapeColor() {
    return '#4CAF50';
  }

  destroy() {
    const shape = this.element.querySelector('.widget-shape');
    if (shape) {
      shape.remove();
    }
    
    // Remove all bound event handlers
    this.boundHandlers.forEach((handler, key) => {
      this.element.removeEventListener(key.replace('Handler', '').toLowerCase(), handler);
    });
    this.boundHandlers.clear();
  }
}