(function initDebugConsole() {
  if (window.__DEBUG_CONSOLE_INITIALIZED__) return;
  window.__DEBUG_CONSOLE_INITIALIZED__ = true;

  const originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  function createDebugConsole() {
    const existing = document.getElementById('debug-console');
    if (existing) return existing;

    const container = document.createElement('div');
    container.id = 'debug-console';

    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '40%',
      padding: '10px',
      overflowY: 'auto',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: '100000',
      borderBottom: '2px solid #00ff00',
      boxSizing: 'border-box',
      pointerEvents: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    });

    document.body.appendChild(container);
    return container;
  }

  function stringifyArg(arg) {
    try {
      return typeof arg === 'string' ? arg : JSON.stringify(arg);
    } catch (error) {
      return String(arg);
    }
  }

  function appendLog(type, args) {
    const logContainer = document.getElementById('debug-console');
    if (!logContainer) return;

    const entry = document.createElement('div');
    entry.textContent = `[${new Date().toLocaleTimeString()}] [${type}] ${args
      .map(stringifyArg)
      .join(' ')}`;

    entry.style.borderBottom = '1px solid #333';
    entry.style.padding = '2px 0';
    entry.style.color =
      type === 'error' ? '#ff4444' : type === 'warn' ? '#ffff00' : '#00ff00';

    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  console.log = (...args) => {
    originalConsole.log(...args);
    appendLog('log', args);
  };

  console.warn = (...args) => {
    originalConsole.warn(...args);
    appendLog('warn', args);
  };

  console.error = (...args) => {
    originalConsole.error(...args);
    appendLog('error', args);
  };

  window.addEventListener('error', (event) => {
    console.error('window.error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('window.unhandledrejection', {
      reason: event.reason,
      message: event.reason?.message || event.reason,
      stack: event.reason?.stack,
      event: event
    });
  });

  // document.addEventListener('DOMContentLoaded', () => {
  //   createDebugConsole();
  //   console.log('--- Debug Console Initialized ---');
  // });
})();

let xrInitialized = false;
let xrRunning = false;

function ensureStatusBadge() {
  let badge = document.getElementById('target-status');

  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'target-status';

    Object.assign(badge.style, {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '99999',
      padding: '12px 18px',
      borderRadius: '999px',
      background: 'rgba(0, 0, 0, 0.75)',
      color: '#fff',
      fontFamily: 'Nunito, sans-serif',
      fontSize: '16px',
      fontWeight: '700',
      border: '2px solid rgba(255,255,255,0.15)',
    });

    badge.textContent = 'Waiting to start...';
    document.body.appendChild(badge);
  }

  return badge;
}

function setStatus(text, isGood = false) {
  const badge = ensureStatusBadge();
  badge.textContent = text;
  badge.style.background = isGood
    ? 'rgba(0, 128, 0, 0.85)'
    : 'rgba(0, 0, 0, 0.75)';
}

async function waitForXRLoaded() {
  if (window.XR8) {
    console.log('XR8 already present');
    return window.XR8;
  }

  console.log('Waiting for xrloaded...');
  return new Promise((resolve) => {
    window.addEventListener(
      'xrloaded',
      () => {
        console.log('xrloaded fired');
        resolve(window.XR8);
      },
      { once: true }
    );
  });
}

async function initializeXR8() {
  const XR8 = await waitForXRLoaded();

  console.log('XR8 surface', {
    version: typeof XR8.version === 'function' ? XR8.version() : XR8.version,
    keys: Object.keys(XR8),
  });

  if (!xrInitialized) {
    console.log('Calling XR8.initialize()...');
    await XR8.initialize();
    xrInitialized = true;
    console.log('XR8.initialize() resolved');
  }

  console.log('Loading slam chunk...');
  await XR8.loadChunk('slam');
  console.log('slam chunk loaded');

  console.log('XR8.XrController after slam load', XR8.XrController);

  if (!XR8.XrController) {
    throw new Error('XR8.XrController is unavailable after slam load');
  }

  return XR8;
}

async function requestMotionPermission() {
  try {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      console.log('Requesting motion permission...');
      const result = await DeviceMotionEvent.requestPermission();
      console.log('Motion permission result', result);
    } else {
      console.log('Motion permission API not required');
    }
  } catch (error) {
    console.warn('Motion permission failed', error);
  }
}

async function requestOrientationPermission() {
  try {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      console.log('Requesting orientation permission...');
      const result = await DeviceOrientationEvent.requestPermission();
      console.log('Orientation permission result', result);
    } else {
      console.log('Orientation permission API not required');
    }
  } catch (error) {
    console.warn('Orientation permission failed', error);
  }
}

function buildCameraAndImageDebugModule() {
  return {
    name: 'camera-and-image-debug',

    listeners: [
      {
        event: 'reality.imageloading',
        process: ({ detail }) => {
          console.log('Event: reality.imageloading', detail);
          if (detail.imageTargets) {
            detail.imageTargets.forEach((target) => {
              console.log(`Hardcoding target ${target.name} type to 'FLAT'`);
              target.type = 'FLAT';
            });
          }
          setStatus('Loading target images...');
        },
      },
      {
        event: 'reality.imagescanning',
        process: ({ detail }) => {
          console.log('Event: reality.imagescanning', detail);
          setStatus('Scanning for target...');
        },
      },
      {
        event: 'reality.imagefound',
        process: ({ detail }) => {
          console.log('Event: reality.imagefound', detail)
          setStatus(`Target found: ${detail?.name || 'unknown'}`, true)
          const scene = document.querySelector('a-scene')
          if (scene) scene.emit('xrimagefound', detail)
        },
      },
      {
        event: 'reality.imageupdated',
        process: ({ detail }) => {
          console.log('Event: reality.imageupdated', detail)
          const scene = document.querySelector('a-scene')
          if (scene) scene.emit('xrimageupdated', detail)
        },
      },
      {
        event: 'reality.imagelost',
        process: ({ detail }) => {
          console.log('Event: reality.imagelost', detail)
          setStatus('Target lost')
          const scene = document.querySelector('a-scene')
          if (scene) scene.emit('xrimagelost', detail)
        },
      },
      {
        event: 'reality.trackingstatus',
        process: ({ detail }) => {
          console.log('Event: reality.trackingstatus', detail);
        },
      },
      {
        event: 'reality.error',
        process: ({ detail }) => {
          console.error('Event: reality.error', detail);
          setStatus(`XR Error: ${detail?.error || 'unspecified'}`);
        },
      },
      {
        event: 'reality.ready',
        process: ({ detail }) => {
          console.log('Event: reality.ready', detail)
          setStatus('AR Ready - Scan your card', true)
        },
      },
      {
        event: 'reality.camerastatuschange',
        process: ({ detail }) => {
          console.log('Event: reality.camerastatuschange', detail);
        },
      },
    ],

    onBeforeRun() {
      console.log('[camera-and-image-debug] onBeforeRun');
      setStatus('XR run requested...');
    },

    onBeforeSessionInitialize(args) {
      console.log('[camera-and-image-debug] onBeforeSessionInitialize', args);
      setStatus('Initializing session...');
    },

    onStart() {
      console.log('[camera-and-image-debug] onStart');
      setStatus('XR started...');
      setupARScene();
    },

    onUpdate: (args) => {
      syncAFrameCamera(args);
    },

    onSessionAttach(args) {
      console.log('[camera-and-image-debug] onSessionAttach', args);
      setStatus('Session attached', true);
    },

    onSessionDetach(args) {
      console.log('[camera-and-image-debug] onSessionDetach', args);
      setStatus('Session detached');
    },

    onAttach() {
      console.log('[camera-and-image-debug] onAttach');
      setStatus('Pipeline attached', true);
    },

    onDetach() {
      console.log('[camera-and-image-debug] onDetach');
      setStatus('Pipeline detached');
    },

    onCameraStatusChange(args) {
      console.log('[camera-and-image-debug] onCameraStatusChange', args);
      setStatus(`Camera: ${args?.status || 'unknown'}`, args?.status === 'hasVideo');
    },

    onCanvasSizeChange(args) {
      console.log('[camera-and-image-debug] onCanvasSizeChange', args);
    },

    onVideoSizeChange(args) {
      console.log('[camera-and-image-debug] onVideoSizeChange', args);
    },

    onException(error) {
      console.error('[camera-and-image-debug] onException', error);
      setStatus('XR exception');
    },
  };
}

function addModuleWithLog(XR8, label, module) {
  console.log(`Installing pipeline module: ${label}`, {
    moduleName: module?.name,
    keys: module ? Object.keys(module) : [],
  });

  XR8.addCameraPipelineModule(module);

  console.log(`Installed pipeline module: ${label}`, {
    moduleName: module?.name,
  });
}

function setupARScene() {
  if (document.getElementById('aframe-root')) return;

  const config = window.APP_CONFIG || { getMapUrl: () => '' };
  
  console.log('Creating AR Scene with Map Plane...', {
    hasConfig: !!window.APP_CONFIG,
    mapUrl: config.getMapUrl()
  });

  const aframeRoot = document.createElement('div');
  aframeRoot.id = 'aframe-root';
  Object.assign(aframeRoot.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10',
    pointerEvents: 'none',
  });

  aframeRoot.innerHTML = `
    <a-scene 
      embedded 
      renderer="alpha: true; antialias: true; colorManagement: true" 
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false">
      
      <a-camera id="ar-camera" position="0 0 0" wasd-controls-enabled="false" look-controls-enabled="false"></a-camera>

      <a-entity simple-image-target="name: upcard">
        <!-- Background Plane -->
        <a-plane 
          id="BG_PLANE" 
          position="0 0 0.005" 
          rotation="0 0 180" 
          width="1.125" 
          height="1.7" 
          material="color: #ffffff; opacity: 0.8; side: double">
        </a-plane>

        <!-- Map Plane -->
        <a-plane 
          id="MAP_PLANE" 
          position="0 0 0.01" 
          rotation="0 0 180" 
          width="1.125" 
          height="1.7" 
          material="src: ${config.getMapUrl()}; side: double; transparent: false">
        </a-plane>
      </a-entity>
    </a-scene>
  `;

  document.body.appendChild(aframeRoot);
  console.log('AR Scene added to DOM');
}

/**
 * Manually syncs the A-Frame camera with XR8 reality data.
 * This replaces the need for the 'xrweb' component which was causing conflicts.
 */
function syncAFrameCamera(args) {
  const scene = document.querySelector('a-scene');
  if (!scene || !scene.hasLoaded) return;

  const camera = document.getElementById('ar-camera');
  if (!camera) return;

  const { processCpuResult } = args;
  if (!processCpuResult || !processCpuResult.reality) return;

  const { rotation, position, intrinsics } = processCpuResult.reality;

  // 1. Sync Transform
  if (rotation) {
    camera.object3D.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }
  if (position) {
    camera.object3D.position.set(position.x, position.y, position.z);
  }

  // 2. Sync Projection Matrix (Intrinsics)
  if (intrinsics) {
    const proj = camera.getObject3D('camera').projectionMatrix.elements;
    for (let i = 0; i < 16; i++) {
      proj[i] = intrinsics[i];
    }
  }
}

async function startXR() {
  // Global listener for xrimageloading as suggested by user
  window.addEventListener('xrimageloading', ({ detail }) => {
    console.log('Event: xrimageloading intercept', detail);
    detail.imageTargets.forEach((target) => {
      console.log(`Hardcoding xrimageloading target ${target.name} type to FLAT`);
      target.type = 'FLAT';
    });
  });

  if (xrRunning) {
    console.log('XR already running');
    return;
  }

  const XR8 = await initializeXR8();

  console.log('Fetching image target data...');
  try {
    const response = await fetch('/image-targets/upcard.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch upcard.json: ${response.status} ${response.statusText}`);
    }
    const targetData = await response.json();
    console.log('Fetched raw targetData:', targetData);

    // Ensure imagePath is absolute to the current origin
    const baseUrl = window.location.origin + '/';
    targetData.imagePath = new URL(targetData.imagePath, baseUrl).href;
    console.log(`Resolved absolute imagePath: ${targetData.imagePath}`);

    // Some versions of XR8 prefer 'Flat' or 'FLAT'. 
    // The tool generates 'PLANAR'. Let's ensure it's 'FLAT' as suggested.
    targetData.type = 'FLAT';
    targetData.metadata = targetData.metadata || {}; // Ensure metadata is an object

    console.log('Final targetData object to be passed to XR8:', JSON.parse(JSON.stringify(targetData)));

    console.log('Configuring XrController for image targets...');
    XR8.XrController.configure({
      disableWorldTracking: true,
      imageTargetData: [targetData],
    });
    console.log('XrController configured with data object');
  } catch (err) {
    console.error('Error loading image target data:', err);
    setStatus('Target load failed');
  }

  console.log('Clearing pipeline modules...');
  XR8.clearCameraPipelineModules();
  console.log('Pipeline cleared');

  addModuleWithLog(XR8, 'GlTextureRenderer', XR8.GlTextureRenderer.pipelineModule());
  addModuleWithLog(XR8, 'XrController', XR8.XrController.pipelineModule());
  addModuleWithLog(XR8, 'FullWindowCanvas', XRExtras.FullWindowCanvas.pipelineModule());

  console.log('XR8.Threejs available keys:', Object.keys(XR8.Threejs || {}));
  if (XR8.Threejs && XR8.Threejs.pipelineModule) {
    console.log('XR8.Threejs.pipelineModule found');
  }

  addModuleWithLog(XR8, 'camera-and-image-debug', buildCameraAndImageDebugModule());

  let canvas = document.getElementById('xr-canvas');

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'xr-canvas';

    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100%',
      height: '100%',
      zIndex: '2',
      pointerEvents: 'none',
      background: '#000',
    });

    document.body.appendChild(canvas);
    console.log('XR canvas created');
  }

  canvas.width = Math.floor(window.innerWidth * window.devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * window.devicePixelRatio);

  console.log('XR canvas sized', {
    width: canvas.width,
    height: canvas.height,
    clientWidth: canvas.clientWidth,
    clientHeight: canvas.clientHeight,
    dpr: window.devicePixelRatio,
  });

  // Setup AR scene will be handled by reality.ready event

  console.log('Calling XR8.run...');
  XR8.run({
    canvas,
    allowedDevices: XR8.XrConfig.device().ANY,
  });

  xrRunning = true;
  console.log('XR8.run started');
}

async function startExperience() {
  const startButton = document.getElementById('start-button');
  const overlay = document.getElementById('start-overlay');

  try {
    console.log('startExperience begin');

    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = 'Starting...';
    }

    await requestMotionPermission();
    await requestOrientationPermission();
    await startXR();

    console.log('startExperience XR requested');

    if (overlay) {
      overlay.style.display = 'none';
      console.log('overlay hidden');
    }
  } catch (error) {
    console.error('startExperience failed', error);

    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = 'Start Experience';
    }
  }
}

function setupStartButton() {
  const startButton = document.getElementById('start-button');

  if (!startButton) {
    console.warn('Start button not found');
    return;
  }

  console.log('Start button found');
  startButton.addEventListener('click', startExperience);
  console.log('Click listener attached');
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
  ensureStatusBadge();
  setupStartButton();
});