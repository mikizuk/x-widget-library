import { BaseWidget } from '../lib/base.js';

export default function createWidget(element) {
  return new WidgetB(element);
}

class WidgetB extends BaseWidget {
  init() {
    super.init();
    
    this.count = 0;
    this.content = document.createElement('div');
    this.content.innerHTML = `
      <h3>Widget B</h3>
      <div class="counter">
        <button class="decrement">-</button>
        <span class="count">0</span>
        <button class="increment">+</button>
      </div>
    `;
    this.element.appendChild(this.content);

    this.countDisplay = this.content.querySelector('.count');
    this.content.querySelector('.increment').addEventListener('click', this.incrementHandler);
    this.content.querySelector('.decrement').addEventListener('click', this.decrementHandler);
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
    if (this.content) {
      this.content.remove();
    }
    super.destroy();
  }
}