import React from 'react';
import './public-path';  // For proper Qiankun integration
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Store the root instance for proper unmounting
let root: ReturnType<typeof createRoot> | null = null;

function render(props: { container?: HTMLElement }) {
  const { container } = props;
  const rootElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (rootElement) {
    console.log('[App12] Rendering in container:', rootElement);
    // Create the root instance if it doesn't exist
    if (!root) {
      root = createRoot(rootElement);
    }
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.warn('[App12] Root element not found!');
  }
}

// Register lifecycle methods via renderWithQiankun
// This is the correct way for Vite-based microfrontends
renderWithQiankun({
  bootstrap() {
    console.log('[App12] Bootstrapping...');
  },
  mount(props) {
    console.log('[App12] Mounting...', props);
    render(props);
  },
  unmount(props: any) {
    console.log('[App12] Unmounting...', props);
    // Find the root element where we mounted
    const { container } = props;
    const rootElement = container
      ? container.querySelector('#root')
      : document.getElementById('root');

    if (root && rootElement) {
      console.log('[App12] Unmounting from container:', rootElement);
      root.unmount();
      root = null;  // Reset the root instance
    } else {
      console.warn('[App12] Root element not found for unmounting!');
    }
  },
  update(props) {
    console.log('[App12] Update', props);
  }
});

// Standalone mode: If the app is running outside Qiankun, it will use this code
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('[App12] Running in standalone mode');
  render({});
} else {
  console.log('[App12] Running inside Qiankun');
}
