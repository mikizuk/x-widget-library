import { BaseWidget } from './base.js';

export default function createWidget(element) {
  return new WidgetC(element);
}

class WidgetC extends BaseWidget {
  init() {
    super.init();
    
    this.content = document.createElement('div');
    this.content.innerHTML = `
      <h3>Widget C</h3>
      <select class="theme-select">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <div class="preview">Preview Area</div>
    `;
    this.element.appendChild(this.content);

    this.preview = this.content.querySelector('.preview');
    this.select = this.content.querySelector('.theme-select');
    this.select.addEventListener('change', this.themeChangeHandler);
  }

  getShapeType() {
    return 'diamond';
  }

  getShapeColor() {
    return '#2196F3';
  }

  themeChangeHandler = (e) => {
    const theme = e.target.value;
    this.preview.style.background = theme === 'dark' ? '#333' : '#fff';
    this.preview.style.color = theme === 'dark' ? '#fff' : '#333';
  }

  destroy() {
    if (this.content) {
      this.content.remove();
    }
    super.destroy();
  }
}