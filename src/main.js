import { X } from './lib/X.js';

let selectedNode = null;
const logs = [];

function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  logs.push({ message, timestamp, type });
  updateLogs();
}

function updateLogs() {
  const logsContainer = document.querySelector('.info-logs');
  logsContainer.innerHTML = logs
    .slice(-10)
    .map(log => `
      <div class="log-entry ${log.type}">
        <span class="log-time">${log.timestamp}</span>
        <span class="log-message">${log.message}</span>
      </div>
    `)
    .join('');
}

function updateButtonStates(instance) {
  initBtn.disabled = instance && (instance.initialized || instance.failed);
  destroyBtn.disabled = !instance || (!instance.initialized && !instance.failed);
  doneBtn.disabled = !instance || !instance.initialized || instance.failed || instance.done;
  failBtn.disabled = !instance || instance.failed;
}

function updateInfo(node) {
  const pathDisplay = document.querySelector('.selected-path');
  const statusDisplay = document.querySelector('.status');
  const doneBtn = document.getElementById('done-btn');
  const initBtn = document.getElementById('init-btn');
  const destroyBtn = document.getElementById('destroy-btn');
  const failBtn = document.getElementById('fail-btn');

  if (!node) {
    pathDisplay.textContent = 'none';
    statusDisplay.textContent = '-';
    [doneBtn, initBtn, destroyBtn, failBtn].forEach(btn => btn.disabled = true);
    return;
  }

  const path = node.getAttribute('widget') || 'not a widget';
  pathDisplay.textContent = path;

  if (!node.hasAttribute('widget')) {
    statusDisplay.textContent = 'Regular DOM node';
    [doneBtn, initBtn, destroyBtn, failBtn].forEach(btn => btn.disabled = true);
    return;
  }

  const instance = X.getInstance(node);
  const status = instance
    ? instance.done
      ? 'Done'
      : instance.failed
        ? 'Failed'
        : 'Initialized'
    : 'Not initialized';
  statusDisplay.textContent = status;

  updateButtonStates(instance);
}

// Event delegation for node selection
document.getElementById('root').addEventListener('click', (e) => {
  if (e.target.closest('.widget-content')) return;

  document.querySelectorAll('.selected').forEach(node => {
    node.classList.remove('selected');
  });

  const node = e.target.closest('#root div');
  if (!node) {
    selectedNode = null;
    updateInfo(null);
    addLog('No node selected');
    return;
  }

  node.classList.add('selected');
  selectedNode = node;
  updateInfo(selectedNode);

  const widgetPath = node.getAttribute('widget');
  addLog(`Selected ${widgetPath || 'regular DOM node'}`);
});

document.getElementById('init-btn').addEventListener('click', () => {
  if (!selectedNode || !selectedNode.hasAttribute('widget')) return;

  const widgetPath = selectedNode.getAttribute('widget');
  addLog(`Initializing widget: ${widgetPath}`);

  X.init(selectedNode, (errors) => {
    if (errors) {
      console.error('Initialization errors:', errors);
      errors.forEach(error => {
        addLog(`Error initializing ${error.node.getAttribute('widget')}: ${error.error.message}`, 'error');
      });
    } else {
      addLog(`Successfully initialized widget: ${widgetPath}`);
    }
    updateInfo(selectedNode);
  });
});

document.getElementById('destroy-btn').addEventListener('click', () => {
  if (!selectedNode || !selectedNode.hasAttribute('widget')) return;

  const widgetPath = selectedNode.getAttribute('widget');
  addLog(`Destroying widget: ${widgetPath}`);

  X.destroy(selectedNode);
  updateInfo(selectedNode);
});

document.getElementById('done-btn').addEventListener('click', () => {
  if (!selectedNode || !selectedNode.hasAttribute('widget')) return;

  const widgetPath = selectedNode.getAttribute('widget');

  try {
    const instance = X.getInstance(selectedNode);
    if (!instance || !instance.initialized || instance.failed) {
      throw new Error('Widget must be initialized and not in failed state');
    }
    X.markDone(selectedNode);
    addLog(`Marked widget as done: ${widgetPath}`);
    updateInfo(selectedNode);
  } catch (error) {
    console.error('Cannot mark as done:', error.message);
    addLog(`Failed to mark widget as done: ${error.message}`, 'error');
  }
});

document.getElementById('fail-btn').addEventListener('click', () => {
  if (!selectedNode || !selectedNode.hasAttribute('widget')) return;

  const widgetPath = selectedNode.getAttribute('widget');
  addLog(`Simulating failure for widget: ${widgetPath}`, 'error');

  X.simulateFail(selectedNode);
  updateInfo(selectedNode);
});