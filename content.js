let isEnabled = false;

function createEmbedHTML(clipId) {
  return `<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
    <iframe src="https://us06web.zoom.us/clips/embed/${clipId}" 
      frameborder="0" 
      allowfullscreen="allowfullscreen" 
      style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
    </iframe>
  </div>`;
}

function replaceZoomClips() {
  if (!isEnabled) return;

  const zoomClipRegex = /https:\/\/[\w.]*zoom\.us\/clips\/share\/([\w.-]+)/g;
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const nodesToReplace = [];
  let node;
  while (node = walker.nextNode()) {
    const testRegex = new RegExp(zoomClipRegex);
    if (testRegex.test(node.textContent)) {
      nodesToReplace.push(node);
    }
  }

  if (nodesToReplace.length > 0) {
    chrome.runtime.sendMessage({ clipsDetected: true });
    
    nodesToReplace.forEach(node => {
      const content = node.textContent;
      const matches = [...content.matchAll(zoomClipRegex)];
      
      const container = document.createElement('div');
      let lastIndex = 0;
      
      matches.forEach(match => {
        container.appendChild(
          document.createTextNode(content.slice(lastIndex, match.index))
        );
        
        const embedDiv = document.createElement('div');
        embedDiv.innerHTML = createEmbedHTML(match[1]);
        container.appendChild(embedDiv);
        
        lastIndex = match.index + match[0].length;
      });
      
      if (lastIndex < content.length) {
        container.appendChild(
          document.createTextNode(content.slice(lastIndex))
        );
      }
      
      node.parentNode.replaceChild(container, node);
    });
  }
}

chrome.runtime.sendMessage({ getState: true }, (response) => {
  if (response && 'isEnabled' in response) {
    isEnabled = response.isEnabled;
    if (isEnabled) {
      replaceZoomClips();
    }
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if ('isEnabled' in message) {
    isEnabled = message.isEnabled;
    if (!isEnabled) {
      window.location.reload();
    } else {
      replaceZoomClips();
    }
  }
});

const observer = new MutationObserver(() => {
  if (isEnabled) {
    replaceZoomClips();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});