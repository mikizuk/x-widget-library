# Widget Library Demo

A lightweight, modular widget management system built with vanilla JavaScript. This library demonstrates a flexible approach to handling widget initialization, lifecycle management, and state control.

## Features

- **Dynamic Widget Loading**: Asynchronous loading of widget modules
- **Lifecycle Management**: Complete widget lifecycle control (init, destroy, done states)
- **State Handling**: Built-in state management for widget instances
- **Error Handling**: Robust error handling with visual feedback
- **Event Management**: Automatic event binding and cleanup
- **Visual Feedback**: CSS-based status indicators for widget states

## Project Structure

```
├── src/
│   ├── lib/
│   │   ├── X.js           # Core widget management system
│   │   └── BaseWidget.js  # Base widget class
│   └── widgets/
│       ├── a.js           # Widget A implementation
│       ├── b.js           # Widget B implementation
│       └── c.js           # Widget C implementation
├── index.html
├── main.js
└── style.css
```

## Development

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Widget States

Widgets can be in one of these states:
- **Not Initialized**: Default state
- **Initializing**: During async initialization
- **Initialized**: Ready for use
- **Done**: Completed state
- **Failed**: Error state

### Controls

- **Init Selected**: Initialize the selected widget and its children
- **Destroy Selected**: Clean up the widget and remove it from DOM
- **Mark Done**: Set widget to completed state
- **Simulate Fail**: Trigger error state for testing

### Creating a New Widget

1. Create a new file in `src/widgets/`
2. Extend the BaseWidget class:

```javascript
import { BaseWidget, createWidget } from './base.js';

class MyWidget extends BaseWidget {
  async _initContent(wrapper) {
    // Initialize your widget
  }

  destroy() {
    // Cleanup
    super.destroy();
  }
}

export default createWidget(MyWidget);
```

## License

MIT