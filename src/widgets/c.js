import { XBaseWidget, createXWidget } from '../lib/xBaseWidget.js';

class WidgetC extends XBaseWidget {
  async createContent(wrapper) {
    wrapper.innerHTML = `
      <h3>Widget C</h3>
      <select class="theme-select">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <p class="preview">Preview Area</div>
    `;

    this.preview = wrapper.querySelector('.preview');
    this.select = wrapper.querySelector('.theme-select');
    this.select.addEventListener('change', this.themeChangeHandler);
  }

  themeChangeHandler(e) {
    const theme = e.target.value;
    this.preview.style.background = theme === 'dark' ? '#333' : '#fff';
    this.preview.style.color = theme === 'dark' ? '#fff' : '#333';
  }

  destroy() {
    super.destroy();
  }
}

export default createXWidget(WidgetC);