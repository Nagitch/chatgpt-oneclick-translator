let collectedNodes = [];

const isVisible = (node) => {
  if (node.nodeType !== Node.TEXT_NODE) return false;
  const parent = node.parentElement;
  if (!parent) return false;
  const tag = parent.tagName;
  if (["SCRIPT","STYLE","NOSCRIPT","TEXTAREA","INPUT","CODE","PRE"].includes(tag)) return false;
  if (parent.isContentEditable) return false;
  const style = window.getComputedStyle(parent);
  if (!style || style.visibility === "hidden" || style.display === "none") return false;
  if (parent.offsetParent === null && style.position !== "fixed") return false;
  return node.nodeValue.trim().length > 0;
};

const getTextNodes = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let current;
  while ((current = walker.nextNode())) {
    if (isVisible(current)) {
      nodes.push(current);
    }
  }
  return nodes;
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'collectText') {
    collectedNodes = getTextNodes();
    const texts = collectedNodes.map(n => n.nodeValue);
    sendResponse({ texts });
    return true;
  } else if (msg.type === 'applyTranslations') {
    const { translations } = msg;
    if (translations && translations.length === collectedNodes.length) {
      collectedNodes.forEach((node, i) => {
        node.nodeValue = translations[i];
      });
    }
  }
});
