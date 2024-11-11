const tabsWithClips = new Set();
let isEnabled = true;

function setDisabledIcon(tabId) {
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      '16': 'icons/zoom-16-disabled.png',
      '32': 'icons/zoom-32-disabled.png',
      '48': 'icons/zoom-48-disabled.png',
      '128': 'icons/zoom-128-disabled.png'
    }
  });
}

function setDetectedIcon(tabId) {
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      '16': 'icons/zoom-16-detected.png',
      '32': 'icons/zoom-32-detected.png',
      '48': 'icons/zoom-48-detected.png',
      '128': 'icons/zoom-128-detected.png'
    }
  });
}

function setNotDetectedIcon(tabId) {
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      '16': 'icons/zoom-16-not-detected.png',
      '32': 'icons/zoom-32-not-detected.png',
      '48': 'icons/zoom-48-not-detected.png',
      '128': 'icons/zoom-128-not-detected.png'
    }
  });
}

async function initializeState() {
  try {
    const result = await chrome.storage.local.get(['isEnabled']);
    isEnabled = result.isEnabled ?? true;
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => updateIcon(tab.id));
  } catch (error) {
    console.error('Error initializing state:', error);
  }
}

function updateIcon(tabId) {
  if (!isEnabled) {
    setDisabledIcon(tabId);
    return;
  }
  
  if (tabsWithClips.has(tabId)) {
    setDetectedIcon(tabId);
  } else {
    setNotDetectedIcon(tabId);
  }
}

initializeState();

chrome.action.onClicked.addListener(async () => {
  isEnabled = !isEnabled;
  await chrome.storage.local.set({ isEnabled });

  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    updateIcon(tab.id);
    chrome.tabs.sendMessage(tab.id, { isEnabled }).catch(() => {});
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!isEnabled) {
    setDisabledIcon(tabId);
    return;
  }

  if (changeInfo.status === 'loading' && changeInfo.url) {
    tabsWithClips.delete(tabId);
    updateIcon(tabId);
  }
  
  if (tabsWithClips.has(tabId)) {
    updateIcon(tabId);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.getState) {
    sendResponse({ isEnabled });
    return true;
  }
  
  if (message.clipsDetected && sender.tab && isEnabled) {
    const tabId = sender.tab.id;
    tabsWithClips.add(tabId);
    updateIcon(tabId);
  }
}); 