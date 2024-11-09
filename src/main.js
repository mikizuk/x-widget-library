import { X } from './lib/X.js';

let selectedNode = null;

function updateInfo(node) {
  const pathDisplay = document.getElementById('selected-path');
  const statusDisplay = document.getElementById('status');
  
  if (!node) {
    pathDisplay.textContent = 'none';
    statusDisplay.textContent = '-';
    return;
  }

  const path = node.getAttribute('widget') || 'no widget';
  pathDisplay.textContent = path;

  const instance = X.getInstance(node);
  const status = instance 
    ? instance.done 
      ? 'Done'
      : 'Initialized'
    : 'Not initialized';
  statusDisplay.textContent = status;
}

// Event delegation for widget selection
document.getElementById('root').addEventListener('click', (e) => {
  const widget = e.target.closest('[widget]');
  if (!widget) return;

  // Remove previous selection
  document.querySelectorAll('[widget].selected').forEach(node => {
    node.classList.remove('selected');
  });

  widget.classList.add('selected');
  selectedNode = widget;
  updateInfo(selectedNode);
});

// Button handlers
document.getElementById('initBtn').addEventListener('click', () => {
  if (!selectedNode) return;
  
  X.init(selectedNode, (errors) => {
    if (errors) {
      console.error('Initialization errors:', errors);
    }
    updateInfo(selectedNode);
  });
});

document.getElementById('destroyBtn').addEventListener('click', () => {
  if (!selectedNode) return;
  
  X.destroy(selectedNode);
  updateInfo(selectedNode);
});

document.getElementById('doneBtn').addEventListener('click', () => {
  if (!selectedNode) return;
  
  try {
    X.markDone(selectedNode);
    updateInfo(selectedNode);
  } catch (error) {
    console.error('Cannot mark as done:', error);
  }
});

document.getElementById('failBtn').addEventListener('click', () => {
  if (!selectedNode) return;
  
  X.simulateFail(selectedNode);
  updateInfo(selectedNode);
});