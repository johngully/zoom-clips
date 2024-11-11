// State management
const tabsWithClips = new Set();
let isEnabled = true; // Default to enabled

function setDisabledIcon(tabId) {
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      "16": "icons/zoom-16-disabled.png",
      "32": "icons/zoom-32-disabled.png",
      "48": "icons/zoom-48-disabled.png",
      "128": "icons/zoom-128-disabled.png"
    }
  });
}

function setDetectedIcon(tabId) {
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      "16": "icons/zoom-16-detected.png",
      "32": "icons/zoom-32-detected.png",
      "48": "icons/zoom-48-detected.png",
      "128": "icons/zoom-128-detected.png"
    }
  });
}

function setNotDetectedIcon(tabId) {
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      "16": "icons/zoom-16-not-detected.png",
      "32": "icons/zoom-32-not-detected.png",
      "48": "icons/zoom-48-not-detected.png",
      "128": "icons/zoom-128-not-detected.png"
    }
  });
}

// Initialize state from storage
async function initializeState() {
  try {
    const result = await chrome.storage.local.get(['isEnabled']);
    isEnabled = result.isEnabled ?? true; // Use true as default
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => updateIcon(tab.id));
  } catch (error) {
    console.error("Error initializing state:", error);
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

// Run initialization
initializeState();

// Handle extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  isEnabled = !isEnabled;
  await chrome.storage.local.set({ isEnabled });

  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    updateIcon(tab.id);
    chrome.tabs.sendMessage(tab.id, { isEnabled }).catch(() => {});
  });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('Tab update:', {
    tabId,
    status: changeInfo.status,
    url: changeInfo.url,
    hasClips: tabsWithClips.has(tabId),
    isEnabled,
    changeInfo  // Log the full changeInfo object
  });

  if (!isEnabled) {
    setDisabledIcon(tabId);
    return;
  }

  // Only reset on initial page load
  if (changeInfo.status === 'loading' && changeInfo.url) {
    console.log('Resetting clip state for tab:', tabId);
    tabsWithClips.delete(tabId);
    updateIcon(tabId);
  }
  
  // Update icon for any other changes if we have clips
  if (tabsWithClips.has(tabId)) {
    console.log('Updating icon for tab with clips:', tabId);
    updateIcon(tabId);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from tab:', sender?.tab?.id);
  
  if (message.getState) {
    sendResponse({ isEnabled });
    return true;
  }
  
  if (message.clipsDetected && sender.tab && isEnabled) {
    const tabId = sender.tab.id;
    console.log('Clips detected in tab:', tabId);
    tabsWithClips.add(tabId);
    updateIcon(tabId);
  }
}); 