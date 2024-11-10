import { BaseWidget } from '../lib/base.js';

export default function createWidget(element) {
  return new WidgetB(element);
}

class WidgetB extends BaseWidget {
  async _initContent(wrapper) {
    this.count = 0;
    wrapper.innerHTML = `
      <h3>Widget B</h3>
      <button class="decrement">-</button>
      <span class="count">0</span>
      <button class="increment">+</button>
    `;

    this.countDisplay = wrapper.querySelector('.count');
    wrapper.querySelector('.increment').addEventListener('click', this.incrementHandler);
    wrapper.querySelector('.decrement').addEventListener('click', this.decrementHandler);
  }

  incrementHandler = () => {
    this.count++;
    this.updateDisplay();
  }

  decrementHandler = () => {
    this.count--;
    this.updateDisplay();
  }

  updateDisplay() {
    this.countDisplay.textContent = this.count;
  }

  destroy() {
    super.destroy();
  }
}