import { XBaseWidget, createXWidget } from '../lib/xBaseWidget.js';

class WidgetA extends XBaseWidget {
  async createContent(wrapper) {
    wrapper.innerHTML = `
      <h3>Widget A</h3>
      <input type="text" class="input-field" placeholder="Type here...">
      <button class="action-btn">Click me</button>
      <span class="text-display"></div>
    `;

    this.textDisplay = wrapper.querySelector('.text-display');
    this.input = wrapper.querySelector('.input-field');
    this.button = wrapper.querySelector('.action-btn');
    
    this.button.addEventListener('click', this.clickHandler);
    this.input.addEventListener('input', this.inputHandler);
  }

  clickHandler() {
    console.log("button click this", this);
    this.button.textContent = 'Clicked!';
  }

  inputHandler(e) {
    this.textDisplay.textContent = e.target.value;
  }

  destroy() {
    super.destroy();
  }
}

export default createXWidget(WidgetA);