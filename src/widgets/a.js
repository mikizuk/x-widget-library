import { BaseWidget } from '../lib/base.js';

export default function createWidget(element) {
  return new WidgetA(element);
}

class WidgetA extends BaseWidget {
  init() {
    super.init();
    
    this.content = document.createElement('div');
    this.content.innerHTML = `
      <h3>Widget A</h3>
      <input type="text" class="input-field" placeholder="Type here...">
      <button class="action-btn">Click me</button>
    `;
    this.element.appendChild(this.content);

    this.input = this.content.querySelector('.input-field');
    this.button = this.content.querySelector('.action-btn');
    
    this.button.addEventListener('click', this.clickHandler);
    this.input.addEventListener('input', this.inputHandler);
  }

  clickHandler = (e) => {
    console.log('Widget A button clicked');
    this.button.textContent = 'Clicked!';
  }

  inputHandler = (e) => {
    console.log('Widget A input:', e.target.value);
  }

  destroy() {
    if (this.content) {
      this.content.remove();
    }
    super.destroy();
  }
}