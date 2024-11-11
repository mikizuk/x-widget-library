import { X } from './lib/x.js';

let selectedNode = null;
const logs = [];

function addLog(message, type = 'info', node = null) {
  const timestamp = new Date().toLocaleTimeString();
  const widgetPath = node?.getAttribute('widget');
  const formattedMessage = widgetPath
    ? `${message} ${widgetPath}`
    : message;

  logs.push({ message: formattedMessage, timestamp, type });
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

function traverseWidgets(node, callback) {
  if (node.hasAttribute('widget')) {
    callback(node);
  }
  const children = [...node.children].filter(child => child.hasAttribute('widget'));
  children.forEach(child => traverseWidgets(child, callback));
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

  initBtn.disabled = instance && (instance.initialized || instance.failed);
  destroyBtn.disabled = !instance || (!instance.initialized && !instance.failed);
  doneBtn.disabled = !instance || !instance.initialized || instance.failed || instance.done;
  failBtn.disabled = !instance || instance.failed;
}

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
  addLog(`Selected: ${widgetPath || 'regular DOM node'}`);
});

document.getElementById('init-btn').addEventListener('click', () => {
  if (!selectedNode || !selectedNode.hasAttribute('widget')) return;

  traverseWidgets(selectedNode, (node) => {
    addLog('Initializing widget:', 'info', node);
  });

  X.init(selectedNode, (errors) => {

    if (errors) {
      console.error('Initialization errors:', errors);
      errors.forEach(error => {
        addLog(`Error initializing ${error.node.getAttribute('widget')}: ${error.error.message}`, 'error');
      });
    } else {
      traverseWidgets(selectedNode, (node) => {
        const instance = X.getInstance(node);
        if (instance?.initialized) {
          addLog('Successfully initialized:', 'info', node);
        }
      });
    }
    updateInfo(selectedNode);
  });
});

document.getElementById('destroy-btn').addEventListener('click', () => {
  if (!selectedNode || !selectedNode.hasAttribute('widget')) return;

  traverseWidgets(selectedNode, (node) => {
    addLog('Destroyed:', 'info', node);
  });

  X.destroy(selectedNode);
  updateInfo(selectedNode);
});

document.getElementById('done-btn').addEventListener('click', () => {
  if (!selectedNode || !selectedNode.hasAttribute('widget')) return;


  try {
    const instance = X.getInstance(selectedNode);
    if (!instance || !instance.initialized || instance.failed) {
      throw new Error('Widget must be initialized and not in failed state');
    }
    X.markDone(selectedNode);
    addLog('Marked as done:', 'info', selectedNode);
    updateInfo(selectedNode);
  } catch (error) {
    console.error('Cannot mark as done:', error.message);
    addLog(`Failed to mark widget as done: ${error.message}`, 'error');
  }
});

document.getElementById('fail-btn').addEventListener('click', () => {
  if (!selectedNode || !selectedNode.hasAttribute('widget')) return;

  traverseWidgets(selectedNode, (node) => {
    addLog('Simulating failure for:', 'error', node);
  });

  X.simulateFail(selectedNode);
  updateInfo(selectedNode);
});