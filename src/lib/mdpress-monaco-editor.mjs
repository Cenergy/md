import { saveAs } from "file-saver";
import MarkdownIt from "markdown-it";
import katex$1 from "katex";
import dayjs from "dayjs";
import Viewer from "viewerjs";
import { Picker } from "emoji-mart";
const ACTIVE_CLASS = "active";
function extend$1(dest) {
  for (let i = 1; i < arguments.length; i++) {
    const src = arguments[i];
    for (const k in src) {
      dest[k] = src[k];
    }
  }
  return dest;
}
function isNil(obj) {
  return obj == null;
}
function isString(obj) {
  if (isNil(obj)) {
    return false;
  }
  return typeof obj === "string" || obj.constructor !== null && obj.constructor === String;
}
function stopPropagation(e2) {
  e2._cancelBubble = true;
  if (e2.stopPropagation) {
    e2.stopPropagation();
  } else {
    e2.cancelBubble = true;
  }
  return this;
}
function getDom(id2) {
  if (id2 instanceof HTMLElement) {
    return id2;
  }
  if (id2.indexOf("#") > -1 || id2.indexOf(".") > -1) {
    return document.querySelector(id2);
  }
  return document.getElementById(id2);
}
function createDom(tagName) {
  return document.createElement(tagName);
}
const on$1 = (target, event, hanlder) => {
  target.addEventListener(event, hanlder);
};
function createDialog() {
  const dialog = createDom("dialog");
  dialog.className = "mdeditor-dialog";
  dialog.innerHTML = `
    <div>
        <label>列数:</label>
        <input type="number" value="3" id="table-cols"/>
        </div>
    <br>
    <div>
        <label>行数:</label>
        <input type="number" value="3" id="table-rows"/>
    </div>
    <br>
    <div style="text-align: right;">
        <button id="table-btn-cancel">取消</button>
        <button id="table-btn-confirm">确认</button>
    </div>
    `;
  return dialog;
}
function createFolderTreeDialog() {
  const dialog = createDom("dialog");
  dialog.className = "mdeditor-dialog";
  dialog.innerHTML = `
    <div class="file-dnd-container">
         <h2>拖拽文件夹到此处</h2>
     </div>

    <br>
    <div style="text-align: right;">
        <button id="table-btn-cancel">取消</button>
    </div>
    `;
  return dialog;
}
function getTableMdText(rows, cols) {
  let head = [], headLine = [];
  let rowsText = "", row = [];
  for (let j = 1; j <= rows; j++) {
    row = [];
    for (let i = 1; i <= cols; i++) {
      if (j === 1) {
        head.push(`列${i}  `);
        headLine.push("-----");
      }
      row.push("     ");
    }
    row = row.join(" | ");
    row = `| ${row.toString()} |
`;
    rowsText += row;
  }
  head = head.join(" | ");
  head = `| ${head.toString()} |
`;
  headLine = headLine.join(" | ");
  headLine = `| ${headLine.toString()} |
`;
  return `${head}${headLine}${rowsText}`;
}
function getDomDisplay(dom) {
  return dom.style.display;
}
function setDomDisplay(dom, display) {
  dom.style.display = display;
}
function domShow(dom) {
  dom.style.display = "block";
}
function domHide(dom) {
  dom.style.display = "none";
}
function now() {
  return (/* @__PURE__ */ new Date()).getTime();
}
function domSizeByWindow(dom) {
  const { innerWidth, innerHeight } = window;
  dom.style.width = `${innerWidth}px`;
  dom.style.height = `${innerHeight}px`;
}
const LOADING_ID = "mdeditor-loading-container";
function showLoading() {
  const dom = document.getElementById(LOADING_ID);
  if (dom) {
    return;
  }
  const div = createDom("div");
  div.id = LOADING_ID;
  div.className = LOADING_ID;
  div.innerHTML = ' <div class="mdeditor-loading"></div> ';
  document.body.appendChild(div);
}
function hideLoading() {
  const dom = document.getElementById(LOADING_ID);
  if (!dom) {
    return;
  }
  document.body.removeChild(dom);
}
function isTitle(title, headContents) {
  title = title.trim();
  if (title[0] === "#") {
    title = trimTitle(title);
    return headContents.indexOf(title) > -1;
  }
}
function trimTitle(title) {
  title = title.replaceAll("#", "");
  title = title.trim();
  return title;
}
let idx = 1;
function domId() {
  return `dom-${idx++}`;
}
const HEADTAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6"
];
function isHeadTag(tag) {
  tag = tag.toLowerCase();
  return HEADTAGS.indexOf(tag) > -1;
}
function formatHeadContents(dom) {
  const children = dom.children || [];
  const contents = [];
  Array.prototype.forEach.call(children, (element) => {
    if (isHeadTag(element.tagName)) {
      const content = element.textContent;
      contents.push(trimTitle(content));
    }
  });
  return contents;
}
let shikiHighlighter;
function registerShikiHighlighter(highlighter) {
  shikiHighlighter = highlighter;
}
function getShikiHighlighter() {
  return shikiHighlighter;
}
let monaco$1;
function registerMonaco(monacoObj) {
  monaco$1 = monacoObj;
}
function getMonaco() {
  return monaco$1;
}
function registerHightLight(hls) {
}
let prettierjs;
function registerPrettier(prettier) {
  prettierjs = prettier;
}
function getPrettier() {
  return prettierjs;
}
function registerMarkMap(markmap) {
}
let swiperJS;
function registerSwiper(swiper) {
  swiperJS = swiper;
}
function getSwiper() {
  return swiperJS;
}
let qrcodeJS;
function registerQRCode(qrcode) {
  qrcodeJS = qrcode;
}
function getQRCode() {
  return qrcodeJS;
}
let mermaidJS;
function registerMermaid(mermaid2) {
  mermaidJS = mermaid2;
}
function getMermaid() {
  return mermaidJS;
}
let xlsxJS;
function registerXLSX(xlsx) {
  xlsxJS = xlsx;
}
function getXLSX() {
  return xlsxJS;
}
let x_spreadsheetJS;
function registerX_spreadsheet(x_spreadsheet) {
  x_spreadsheetJS = x_spreadsheet;
}
function getX_spreadsheet() {
  return x_spreadsheetJS;
}
let flowChartJS;
function registerFlowChart(flowChart) {
  flowChartJS = flowChart;
}
function getFlowChart() {
  return flowChartJS;
}
function checkDom(dom) {
  return dom && dom.addEventListener;
}
class ClickOutSide {
  constructor(container) {
    this.container = null;
    this.doms = [];
    this.inited = false;
    this._containerClickEvents = [];
    this._frameId = null;
    this.init(container);
  }
  init(container) {
    if (this.inited) {
      return this;
    }
    container = container || document.body;
    if (!checkDom(container)) {
      console.error(container, "is not dom");
      return this;
    }
    this.container = container;
    this.inited = true;
    this._containerClick = this.containerClick.bind(this);
    this.container.addEventListener("click", this._containerClick);
    this._loop = this.loop.bind(this);
    this._frameId = requestAnimationFrame(this._loop);
  }
  loop() {
    if (this._containerClickEvents.length) {
      const len = this._containerClickEvents.length;
      const event = this._containerClickEvents[len - 1];
      const { clientX, clientY } = event;
      this.doms.forEach((dom) => {
        if (!dom.getBoundingClientRect) {
          return;
        }
        const rect = dom.getBoundingClientRect();
        const { left, top: top2, right, bottom } = rect;
        const inRect = clientX >= left && clientX <= right && clientY >= top2 && clientY <= bottom;
        if (inRect) {
          const event2 = new Event("clickinside");
          dom.dispatchEvent(event2);
        }
        if (!inRect) {
          const event2 = new Event("clickoutside");
          dom.dispatchEvent(event2);
        }
      });
    }
    this._containerClickEvents = [];
    this._frameId = requestAnimationFrame(this._loop);
  }
  containerClick(e2) {
    this._containerClickEvents.push(e2);
  }
  addDom(dom) {
    if (!checkDom(dom)) {
      console.error(dom, "is not dom");
      return this;
    }
    if (!this.inited) {
      console.error("not init");
      return this;
    }
    const index = this.doms.indexOf(dom);
    if (index >= 0) {
      return this;
    }
    this.doms.push(dom);
    return this;
  }
  removeDom(dom) {
    if (!checkDom(dom)) {
      console.error(dom, "is not dom");
      return this;
    }
    if (!this.inited) {
      console.error("not init");
      return this;
    }
    const index = this.doms.indexOf(dom);
    if (index === -1) {
      return this;
    }
    this.doms.splice(index, 1);
    return this;
  }
  dispose() {
    cancelAnimationFrame(this._frameId);
    this.container.removeEventListener("click", this._containerClick);
    this.doms = null;
    this.container = null;
    this.inited = false;
    this._loop = null;
    this._containerClick = null;
    this._containerClickEvents = null;
    return this;
  }
}
function create(container) {
  return new ClickOutSide(container);
}
var DOCUMENT_FRAGMENT_NODE = 11;
function morphAttrs(fromNode, toNode) {
  var toNodeAttrs = toNode.attributes;
  var attr;
  var attrName;
  var attrNamespaceURI;
  var attrValue;
  var fromValue;
  if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
    return;
  }
  for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
    attr = toNodeAttrs[i];
    attrName = attr.name;
    attrNamespaceURI = attr.namespaceURI;
    attrValue = attr.value;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
      if (fromValue !== attrValue) {
        if (attr.prefix === "xmlns") {
          attrName = attr.name;
        }
        fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
      }
    } else {
      fromValue = fromNode.getAttribute(attrName);
      if (fromValue !== attrValue) {
        fromNode.setAttribute(attrName, attrValue);
      }
    }
  }
  var fromNodeAttrs = fromNode.attributes;
  for (var d2 = fromNodeAttrs.length - 1; d2 >= 0; d2--) {
    attr = fromNodeAttrs[d2];
    attrName = attr.name;
    attrNamespaceURI = attr.namespaceURI;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
        fromNode.removeAttributeNS(attrNamespaceURI, attrName);
      }
    } else {
      if (!toNode.hasAttribute(attrName)) {
        fromNode.removeAttribute(attrName);
      }
    }
  }
}
var range;
var NS_XHTML = "http://www.w3.org/1999/xhtml";
var doc = typeof document === "undefined" ? void 0 : document;
var HAS_TEMPLATE_SUPPORT = !!doc && "content" in doc.createElement("template");
var HAS_RANGE_SUPPORT = !!doc && doc.createRange && "createContextualFragment" in doc.createRange();
function createFragmentFromTemplate(str2) {
  var template2 = doc.createElement("template");
  template2.innerHTML = str2;
  return template2.content.childNodes[0];
}
function createFragmentFromRange(str2) {
  if (!range) {
    range = doc.createRange();
    range.selectNode(doc.body);
  }
  var fragment = range.createContextualFragment(str2);
  return fragment.childNodes[0];
}
function createFragmentFromWrap(str2) {
  var fragment = doc.createElement("body");
  fragment.innerHTML = str2;
  return fragment.childNodes[0];
}
function toElement(str2) {
  str2 = str2.trim();
  if (HAS_TEMPLATE_SUPPORT) {
    return createFragmentFromTemplate(str2);
  } else if (HAS_RANGE_SUPPORT) {
    return createFragmentFromRange(str2);
  }
  return createFragmentFromWrap(str2);
}
function compareNodeNames(fromEl, toEl) {
  var fromNodeName = fromEl.nodeName;
  var toNodeName = toEl.nodeName;
  var fromCodeStart, toCodeStart;
  if (fromNodeName === toNodeName) {
    return true;
  }
  fromCodeStart = fromNodeName.charCodeAt(0);
  toCodeStart = toNodeName.charCodeAt(0);
  if (fromCodeStart <= 90 && toCodeStart >= 97) {
    return fromNodeName === toNodeName.toUpperCase();
  } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
    return toNodeName === fromNodeName.toUpperCase();
  } else {
    return false;
  }
}
function createElementNS(name2, namespaceURI) {
  return !namespaceURI || namespaceURI === NS_XHTML ? doc.createElement(name2) : doc.createElementNS(namespaceURI, name2);
}
function moveChildren(fromEl, toEl) {
  var curChild = fromEl.firstChild;
  while (curChild) {
    var nextChild = curChild.nextSibling;
    toEl.appendChild(curChild);
    curChild = nextChild;
  }
  return toEl;
}
function syncBooleanAttrProp(fromEl, toEl, name2) {
  if (fromEl[name2] !== toEl[name2]) {
    fromEl[name2] = toEl[name2];
    if (fromEl[name2]) {
      fromEl.setAttribute(name2, "");
    } else {
      fromEl.removeAttribute(name2);
    }
  }
}
var specialElHandlers = {
  OPTION: function(fromEl, toEl) {
    var parentNode = fromEl.parentNode;
    if (parentNode) {
      var parentName = parentNode.nodeName.toUpperCase();
      if (parentName === "OPTGROUP") {
        parentNode = parentNode.parentNode;
        parentName = parentNode && parentNode.nodeName.toUpperCase();
      }
      if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
        if (fromEl.hasAttribute("selected") && !toEl.selected) {
          fromEl.setAttribute("selected", "selected");
          fromEl.removeAttribute("selected");
        }
        parentNode.selectedIndex = -1;
      }
    }
    syncBooleanAttrProp(fromEl, toEl, "selected");
  },
  /**
   * The "value" attribute is special for the <input> element since it sets
   * the initial value. Changing the "value" attribute without changing the
   * "value" property will have no effect since it is only used to the set the
   * initial value.  Similar for the "checked" attribute, and "disabled".
   */
  INPUT: function(fromEl, toEl) {
    syncBooleanAttrProp(fromEl, toEl, "checked");
    syncBooleanAttrProp(fromEl, toEl, "disabled");
    if (fromEl.value !== toEl.value) {
      fromEl.value = toEl.value;
    }
    if (!toEl.hasAttribute("value")) {
      fromEl.removeAttribute("value");
    }
  },
  TEXTAREA: function(fromEl, toEl) {
    var newValue = toEl.value;
    if (fromEl.value !== newValue) {
      fromEl.value = newValue;
    }
    var firstChild = fromEl.firstChild;
    if (firstChild) {
      var oldValue = firstChild.nodeValue;
      if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
        return;
      }
      firstChild.nodeValue = newValue;
    }
  },
  SELECT: function(fromEl, toEl) {
    if (!toEl.hasAttribute("multiple")) {
      var selectedIndex = -1;
      var i = 0;
      var curChild = fromEl.firstChild;
      var optgroup;
      var nodeName;
      while (curChild) {
        nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
        if (nodeName === "OPTGROUP") {
          optgroup = curChild;
          curChild = optgroup.firstChild;
          if (!curChild) {
            curChild = optgroup.nextSibling;
            optgroup = null;
          }
        } else {
          if (nodeName === "OPTION") {
            if (curChild.hasAttribute("selected")) {
              selectedIndex = i;
              break;
            }
            i++;
          }
          curChild = curChild.nextSibling;
          if (!curChild && optgroup) {
            curChild = optgroup.nextSibling;
            optgroup = null;
          }
        }
      }
      fromEl.selectedIndex = selectedIndex;
    }
  }
};
var ELEMENT_NODE = 1;
var DOCUMENT_FRAGMENT_NODE$1 = 11;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
function noop$1() {
}
function defaultGetNodeKey(node) {
  if (node) {
    return node.getAttribute && node.getAttribute("id") || node.id;
  }
}
function morphdomFactory(morphAttrs2) {
  return function morphdom2(fromNode, toNode, options) {
    if (!options) {
      options = {};
    }
    if (typeof toNode === "string") {
      if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML") {
        var toNodeHtml = toNode;
        toNode = doc.createElement("html");
        toNode.innerHTML = toNodeHtml;
      } else if (fromNode.nodeName === "BODY") {
        var toNodeBody = toNode;
        toNode = doc.createElement("html");
        toNode.innerHTML = toNodeBody;
        var bodyElement = toNode.querySelector("body");
        if (bodyElement) {
          toNode = bodyElement;
        }
      } else {
        toNode = toElement(toNode);
      }
    } else if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
      toNode = toNode.firstElementChild;
    }
    var getNodeKey = options.getNodeKey || defaultGetNodeKey;
    var onBeforeNodeAdded = options.onBeforeNodeAdded || noop$1;
    var onNodeAdded = options.onNodeAdded || noop$1;
    var onBeforeElUpdated = options.onBeforeElUpdated || noop$1;
    var onElUpdated = options.onElUpdated || noop$1;
    var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop$1;
    var onNodeDiscarded = options.onNodeDiscarded || noop$1;
    var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop$1;
    var skipFromChildren = options.skipFromChildren || noop$1;
    var addChild = options.addChild || function(parent, child2) {
      return parent.appendChild(child2);
    };
    var childrenOnly = options.childrenOnly === true;
    var fromNodesLookup = /* @__PURE__ */ Object.create(null);
    var keyedRemovalList = [];
    function addKeyedRemoval(key2) {
      keyedRemovalList.push(key2);
    }
    function walkDiscardedChildNodes(node, skipKeyedNodes) {
      if (node.nodeType === ELEMENT_NODE) {
        var curChild = node.firstChild;
        while (curChild) {
          var key2 = void 0;
          if (skipKeyedNodes && (key2 = getNodeKey(curChild))) {
            addKeyedRemoval(key2);
          } else {
            onNodeDiscarded(curChild);
            if (curChild.firstChild) {
              walkDiscardedChildNodes(curChild, skipKeyedNodes);
            }
          }
          curChild = curChild.nextSibling;
        }
      }
    }
    function removeNode(node, parentNode, skipKeyedNodes) {
      if (onBeforeNodeDiscarded(node) === false) {
        return;
      }
      if (parentNode) {
        parentNode.removeChild(node);
      }
      onNodeDiscarded(node);
      walkDiscardedChildNodes(node, skipKeyedNodes);
    }
    function indexTree(node) {
      if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
        var curChild = node.firstChild;
        while (curChild) {
          var key2 = getNodeKey(curChild);
          if (key2) {
            fromNodesLookup[key2] = curChild;
          }
          indexTree(curChild);
          curChild = curChild.nextSibling;
        }
      }
    }
    indexTree(fromNode);
    function handleNodeAdded(el) {
      onNodeAdded(el);
      var curChild = el.firstChild;
      while (curChild) {
        var nextSibling = curChild.nextSibling;
        var key2 = getNodeKey(curChild);
        if (key2) {
          var unmatchedFromEl = fromNodesLookup[key2];
          if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
            curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
            morphEl(unmatchedFromEl, curChild);
          } else {
            handleNodeAdded(curChild);
          }
        } else {
          handleNodeAdded(curChild);
        }
        curChild = nextSibling;
      }
    }
    function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
      while (curFromNodeChild) {
        var fromNextSibling = curFromNodeChild.nextSibling;
        if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
          addKeyedRemoval(curFromNodeKey);
        } else {
          removeNode(
            curFromNodeChild,
            fromEl,
            true
            /* skip keyed nodes */
          );
        }
        curFromNodeChild = fromNextSibling;
      }
    }
    function morphEl(fromEl, toEl, childrenOnly2) {
      var toElKey = getNodeKey(toEl);
      if (toElKey) {
        delete fromNodesLookup[toElKey];
      }
      if (!childrenOnly2) {
        var beforeUpdateResult = onBeforeElUpdated(fromEl, toEl);
        if (beforeUpdateResult === false) {
          return;
        } else if (beforeUpdateResult instanceof HTMLElement) {
          fromEl = beforeUpdateResult;
          indexTree(fromEl);
        }
        morphAttrs2(fromEl, toEl);
        onElUpdated(fromEl);
        if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
          return;
        }
      }
      if (fromEl.nodeName !== "TEXTAREA") {
        morphChildren(fromEl, toEl);
      } else {
        specialElHandlers.TEXTAREA(fromEl, toEl);
      }
    }
    function morphChildren(fromEl, toEl) {
      var skipFrom = skipFromChildren(fromEl, toEl);
      var curToNodeChild = toEl.firstChild;
      var curFromNodeChild = fromEl.firstChild;
      var curToNodeKey;
      var curFromNodeKey;
      var fromNextSibling;
      var toNextSibling;
      var matchingFromEl;
      outer:
        while (curToNodeChild) {
          toNextSibling = curToNodeChild.nextSibling;
          curToNodeKey = getNodeKey(curToNodeChild);
          while (!skipFrom && curFromNodeChild) {
            fromNextSibling = curFromNodeChild.nextSibling;
            if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            curFromNodeKey = getNodeKey(curFromNodeChild);
            var curFromNodeType = curFromNodeChild.nodeType;
            var isCompatible = void 0;
            if (curFromNodeType === curToNodeChild.nodeType) {
              if (curFromNodeType === ELEMENT_NODE) {
                if (curToNodeKey) {
                  if (curToNodeKey !== curFromNodeKey) {
                    if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                      if (fromNextSibling === matchingFromEl) {
                        isCompatible = false;
                      } else {
                        fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                        if (curFromNodeKey) {
                          addKeyedRemoval(curFromNodeKey);
                        } else {
                          removeNode(
                            curFromNodeChild,
                            fromEl,
                            true
                            /* skip keyed nodes */
                          );
                        }
                        curFromNodeChild = matchingFromEl;
                        curFromNodeKey = getNodeKey(curFromNodeChild);
                      }
                    } else {
                      isCompatible = false;
                    }
                  }
                } else if (curFromNodeKey) {
                  isCompatible = false;
                }
                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                if (isCompatible) {
                  morphEl(curFromNodeChild, curToNodeChild);
                }
              } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                isCompatible = true;
                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                  curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                }
              }
            }
            if (isCompatible) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            if (curFromNodeKey) {
              addKeyedRemoval(curFromNodeKey);
            } else {
              removeNode(
                curFromNodeChild,
                fromEl,
                true
                /* skip keyed nodes */
              );
            }
            curFromNodeChild = fromNextSibling;
          }
          if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
            if (!skipFrom) {
              addChild(fromEl, matchingFromEl);
            }
            morphEl(matchingFromEl, curToNodeChild);
          } else {
            var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
            if (onBeforeNodeAddedResult !== false) {
              if (onBeforeNodeAddedResult) {
                curToNodeChild = onBeforeNodeAddedResult;
              }
              if (curToNodeChild.actualize) {
                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
              }
              addChild(fromEl, curToNodeChild);
              handleNodeAdded(curToNodeChild);
            }
          }
          curToNodeChild = toNextSibling;
          curFromNodeChild = fromNextSibling;
        }
      cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
      var specialElHandler = specialElHandlers[fromEl.nodeName];
      if (specialElHandler) {
        specialElHandler(fromEl, toEl);
      }
    }
    var morphedNode = fromNode;
    var morphedNodeType = morphedNode.nodeType;
    var toNodeType = toNode.nodeType;
    if (!childrenOnly) {
      if (morphedNodeType === ELEMENT_NODE) {
        if (toNodeType === ELEMENT_NODE) {
          if (!compareNodeNames(fromNode, toNode)) {
            onNodeDiscarded(fromNode);
            morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
          }
        } else {
          morphedNode = toNode;
        }
      } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) {
        if (toNodeType === morphedNodeType) {
          if (morphedNode.nodeValue !== toNode.nodeValue) {
            morphedNode.nodeValue = toNode.nodeValue;
          }
          return morphedNode;
        } else {
          morphedNode = toNode;
        }
      }
    }
    if (morphedNode === toNode) {
      onNodeDiscarded(fromNode);
    } else {
      if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
        return;
      }
      morphEl(morphedNode, toNode, childrenOnly);
      if (keyedRemovalList) {
        for (var i = 0, len = keyedRemovalList.length; i < len; i++) {
          var elToRemove = fromNodesLookup[keyedRemovalList[i]];
          if (elToRemove) {
            removeNode(elToRemove, elToRemove.parentNode, false);
          }
        }
      }
    }
    if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
      if (morphedNode.actualize) {
        morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
      }
      fromNode.parentNode.replaceChild(morphedNode, fromNode);
    }
    return morphedNode;
  };
}
var morphdom = morphdomFactory(morphAttrs);
function getDefaultExportFromCjs(x2) {
  return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
const grinning = "😀";
const smiley = "😃";
const smile = "😄";
const grin = "😁";
const laughing = "😆";
const satisfied = "😆";
const sweat_smile = "😅";
const rofl = "🤣";
const joy = "😂";
const slightly_smiling_face = "🙂";
const upside_down_face = "🙃";
const wink = "😉";
const blush = "😊";
const innocent = "😇";
const smiling_face_with_three_hearts = "🥰";
const heart_eyes = "😍";
const star_struck = "🤩";
const kissing_heart = "😘";
const kissing = "😗";
const relaxed = "☺️";
const kissing_closed_eyes = "😚";
const kissing_smiling_eyes = "😙";
const smiling_face_with_tear = "🥲";
const yum = "😋";
const stuck_out_tongue = "😛";
const stuck_out_tongue_winking_eye = "😜";
const zany_face = "🤪";
const stuck_out_tongue_closed_eyes = "😝";
const money_mouth_face = "🤑";
const hugs = "🤗";
const hand_over_mouth = "🤭";
const shushing_face = "🤫";
const thinking = "🤔";
const zipper_mouth_face = "🤐";
const raised_eyebrow = "🤨";
const neutral_face = "😐";
const expressionless = "😑";
const no_mouth = "😶";
const smirk = "😏";
const unamused = "😒";
const roll_eyes = "🙄";
const grimacing = "😬";
const lying_face = "🤥";
const relieved = "😌";
const pensive = "😔";
const sleepy = "😪";
const drooling_face = "🤤";
const sleeping = "😴";
const mask = "😷";
const face_with_thermometer = "🤒";
const face_with_head_bandage = "🤕";
const nauseated_face = "🤢";
const vomiting_face = "🤮";
const sneezing_face = "🤧";
const hot_face = "🥵";
const cold_face = "🥶";
const woozy_face = "🥴";
const dizzy_face = "😵";
const exploding_head = "🤯";
const cowboy_hat_face = "🤠";
const partying_face = "🥳";
const disguised_face = "🥸";
const sunglasses = "😎";
const nerd_face = "🤓";
const monocle_face = "🧐";
const confused = "😕";
const worried = "😟";
const slightly_frowning_face = "🙁";
const frowning_face = "☹️";
const open_mouth = "😮";
const hushed = "😯";
const astonished = "😲";
const flushed = "😳";
const pleading_face = "🥺";
const frowning = "😦";
const anguished = "😧";
const fearful = "😨";
const cold_sweat = "😰";
const disappointed_relieved = "😥";
const cry = "😢";
const sob = "😭";
const scream = "😱";
const confounded = "😖";
const persevere = "😣";
const disappointed = "😞";
const sweat = "😓";
const weary = "😩";
const tired_face = "😫";
const yawning_face = "🥱";
const triumph = "😤";
const rage = "😡";
const pout = "😡";
const angry = "😠";
const cursing_face = "🤬";
const smiling_imp = "😈";
const imp = "👿";
const skull = "💀";
const skull_and_crossbones = "☠️";
const hankey = "💩";
const poop = "💩";
const shit = "💩";
const clown_face = "🤡";
const japanese_ogre = "👹";
const japanese_goblin = "👺";
const ghost = "👻";
const alien = "👽";
const space_invader = "👾";
const robot = "🤖";
const smiley_cat = "😺";
const smile_cat = "😸";
const joy_cat = "😹";
const heart_eyes_cat = "😻";
const smirk_cat = "😼";
const kissing_cat = "😽";
const scream_cat = "🙀";
const crying_cat_face = "😿";
const pouting_cat = "😾";
const see_no_evil = "🙈";
const hear_no_evil = "🙉";
const speak_no_evil = "🙊";
const kiss = "💋";
const love_letter = "💌";
const cupid = "💘";
const gift_heart = "💝";
const sparkling_heart = "💖";
const heartpulse = "💗";
const heartbeat = "💓";
const revolving_hearts = "💞";
const two_hearts = "💕";
const heart_decoration = "💟";
const heavy_heart_exclamation = "❣️";
const broken_heart = "💔";
const heart = "❤️";
const orange_heart = "🧡";
const yellow_heart = "💛";
const green_heart = "💚";
const blue_heart = "💙";
const purple_heart = "💜";
const brown_heart = "🤎";
const black_heart = "🖤";
const white_heart = "🤍";
const anger = "💢";
const boom = "💥";
const collision = "💥";
const dizzy = "💫";
const sweat_drops = "💦";
const dash = "💨";
const hole = "🕳️";
const bomb = "💣";
const speech_balloon = "💬";
const eye_speech_bubble = "👁️‍🗨️";
const left_speech_bubble = "🗨️";
const right_anger_bubble = "🗯️";
const thought_balloon = "💭";
const zzz = "💤";
const wave = "👋";
const raised_back_of_hand = "🤚";
const raised_hand_with_fingers_splayed = "🖐️";
const hand = "✋";
const raised_hand = "✋";
const vulcan_salute = "🖖";
const ok_hand = "👌";
const pinched_fingers = "🤌";
const pinching_hand = "🤏";
const v = "✌️";
const crossed_fingers = "🤞";
const love_you_gesture = "🤟";
const metal = "🤘";
const call_me_hand = "🤙";
const point_left = "👈";
const point_right = "👉";
const point_up_2 = "👆";
const middle_finger = "🖕";
const fu = "🖕";
const point_down = "👇";
const point_up = "☝️";
const thumbsup = "👍";
const thumbsdown = "👎";
const fist_raised = "✊";
const fist = "✊";
const fist_oncoming = "👊";
const facepunch = "👊";
const punch = "👊";
const fist_left = "🤛";
const fist_right = "🤜";
const clap = "👏";
const raised_hands = "🙌";
const open_hands = "👐";
const palms_up_together = "🤲";
const handshake = "🤝";
const pray = "🙏";
const writing_hand = "✍️";
const nail_care = "💅";
const selfie = "🤳";
const muscle = "💪";
const mechanical_arm = "🦾";
const mechanical_leg = "🦿";
const leg = "🦵";
const foot = "🦶";
const ear = "👂";
const ear_with_hearing_aid = "🦻";
const nose = "👃";
const brain = "🧠";
const anatomical_heart = "🫀";
const lungs = "🫁";
const tooth = "🦷";
const bone = "🦴";
const eyes = "👀";
const eye = "👁️";
const tongue = "👅";
const lips = "👄";
const baby = "👶";
const child = "🧒";
const boy = "👦";
const girl = "👧";
const adult = "🧑";
const blond_haired_person = "👱";
const man = "👨";
const bearded_person = "🧔";
const red_haired_man = "👨‍🦰";
const curly_haired_man = "👨‍🦱";
const white_haired_man = "👨‍🦳";
const bald_man = "👨‍🦲";
const woman = "👩";
const red_haired_woman = "👩‍🦰";
const person_red_hair = "🧑‍🦰";
const curly_haired_woman = "👩‍🦱";
const person_curly_hair = "🧑‍🦱";
const white_haired_woman = "👩‍🦳";
const person_white_hair = "🧑‍🦳";
const bald_woman = "👩‍🦲";
const person_bald = "🧑‍🦲";
const blond_haired_woman = "👱‍♀️";
const blonde_woman = "👱‍♀️";
const blond_haired_man = "👱‍♂️";
const older_adult = "🧓";
const older_man = "👴";
const older_woman = "👵";
const frowning_person = "🙍";
const frowning_man = "🙍‍♂️";
const frowning_woman = "🙍‍♀️";
const pouting_face = "🙎";
const pouting_man = "🙎‍♂️";
const pouting_woman = "🙎‍♀️";
const no_good = "🙅";
const no_good_man = "🙅‍♂️";
const ng_man = "🙅‍♂️";
const no_good_woman = "🙅‍♀️";
const ng_woman = "🙅‍♀️";
const ok_person = "🙆";
const ok_man = "🙆‍♂️";
const ok_woman = "🙆‍♀️";
const tipping_hand_person = "💁";
const information_desk_person = "💁";
const tipping_hand_man = "💁‍♂️";
const sassy_man = "💁‍♂️";
const tipping_hand_woman = "💁‍♀️";
const sassy_woman = "💁‍♀️";
const raising_hand = "🙋";
const raising_hand_man = "🙋‍♂️";
const raising_hand_woman = "🙋‍♀️";
const deaf_person = "🧏";
const deaf_man = "🧏‍♂️";
const deaf_woman = "🧏‍♀️";
const bow = "🙇";
const bowing_man = "🙇‍♂️";
const bowing_woman = "🙇‍♀️";
const facepalm = "🤦";
const man_facepalming = "🤦‍♂️";
const woman_facepalming = "🤦‍♀️";
const shrug = "🤷";
const man_shrugging = "🤷‍♂️";
const woman_shrugging = "🤷‍♀️";
const health_worker = "🧑‍⚕️";
const man_health_worker = "👨‍⚕️";
const woman_health_worker = "👩‍⚕️";
const student = "🧑‍🎓";
const man_student = "👨‍🎓";
const woman_student = "👩‍🎓";
const teacher = "🧑‍🏫";
const man_teacher = "👨‍🏫";
const woman_teacher = "👩‍🏫";
const judge = "🧑‍⚖️";
const man_judge = "👨‍⚖️";
const woman_judge = "👩‍⚖️";
const farmer = "🧑‍🌾";
const man_farmer = "👨‍🌾";
const woman_farmer = "👩‍🌾";
const cook = "🧑‍🍳";
const man_cook = "👨‍🍳";
const woman_cook = "👩‍🍳";
const mechanic = "🧑‍🔧";
const man_mechanic = "👨‍🔧";
const woman_mechanic = "👩‍🔧";
const factory_worker = "🧑‍🏭";
const man_factory_worker = "👨‍🏭";
const woman_factory_worker = "👩‍🏭";
const office_worker = "🧑‍💼";
const man_office_worker = "👨‍💼";
const woman_office_worker = "👩‍💼";
const scientist = "🧑‍🔬";
const man_scientist = "👨‍🔬";
const woman_scientist = "👩‍🔬";
const technologist = "🧑‍💻";
const man_technologist = "👨‍💻";
const woman_technologist = "👩‍💻";
const singer = "🧑‍🎤";
const man_singer = "👨‍🎤";
const woman_singer = "👩‍🎤";
const artist = "🧑‍🎨";
const man_artist = "👨‍🎨";
const woman_artist = "👩‍🎨";
const pilot = "🧑‍✈️";
const man_pilot = "👨‍✈️";
const woman_pilot = "👩‍✈️";
const astronaut = "🧑‍🚀";
const man_astronaut = "👨‍🚀";
const woman_astronaut = "👩‍🚀";
const firefighter = "🧑‍🚒";
const man_firefighter = "👨‍🚒";
const woman_firefighter = "👩‍🚒";
const police_officer = "👮";
const cop = "👮";
const policeman = "👮‍♂️";
const policewoman = "👮‍♀️";
const detective = "🕵️";
const male_detective = "🕵️‍♂️";
const female_detective = "🕵️‍♀️";
const guard = "💂";
const guardsman = "💂‍♂️";
const guardswoman = "💂‍♀️";
const ninja = "🥷";
const construction_worker = "👷";
const construction_worker_man = "👷‍♂️";
const construction_worker_woman = "👷‍♀️";
const prince = "🤴";
const princess = "👸";
const person_with_turban = "👳";
const man_with_turban = "👳‍♂️";
const woman_with_turban = "👳‍♀️";
const man_with_gua_pi_mao = "👲";
const woman_with_headscarf = "🧕";
const person_in_tuxedo = "🤵";
const man_in_tuxedo = "🤵‍♂️";
const woman_in_tuxedo = "🤵‍♀️";
const person_with_veil = "👰";
const man_with_veil = "👰‍♂️";
const woman_with_veil = "👰‍♀️";
const bride_with_veil = "👰‍♀️";
const pregnant_woman = "🤰";
const breast_feeding = "🤱";
const woman_feeding_baby = "👩‍🍼";
const man_feeding_baby = "👨‍🍼";
const person_feeding_baby = "🧑‍🍼";
const angel = "👼";
const santa = "🎅";
const mrs_claus = "🤶";
const mx_claus = "🧑‍🎄";
const superhero = "🦸";
const superhero_man = "🦸‍♂️";
const superhero_woman = "🦸‍♀️";
const supervillain = "🦹";
const supervillain_man = "🦹‍♂️";
const supervillain_woman = "🦹‍♀️";
const mage = "🧙";
const mage_man = "🧙‍♂️";
const mage_woman = "🧙‍♀️";
const fairy = "🧚";
const fairy_man = "🧚‍♂️";
const fairy_woman = "🧚‍♀️";
const vampire = "🧛";
const vampire_man = "🧛‍♂️";
const vampire_woman = "🧛‍♀️";
const merperson = "🧜";
const merman = "🧜‍♂️";
const mermaid = "🧜‍♀️";
const elf = "🧝";
const elf_man = "🧝‍♂️";
const elf_woman = "🧝‍♀️";
const genie = "🧞";
const genie_man = "🧞‍♂️";
const genie_woman = "🧞‍♀️";
const zombie = "🧟";
const zombie_man = "🧟‍♂️";
const zombie_woman = "🧟‍♀️";
const massage = "💆";
const massage_man = "💆‍♂️";
const massage_woman = "💆‍♀️";
const haircut = "💇";
const haircut_man = "💇‍♂️";
const haircut_woman = "💇‍♀️";
const walking = "🚶";
const walking_man = "🚶‍♂️";
const walking_woman = "🚶‍♀️";
const standing_person = "🧍";
const standing_man = "🧍‍♂️";
const standing_woman = "🧍‍♀️";
const kneeling_person = "🧎";
const kneeling_man = "🧎‍♂️";
const kneeling_woman = "🧎‍♀️";
const person_with_probing_cane = "🧑‍🦯";
const man_with_probing_cane = "👨‍🦯";
const woman_with_probing_cane = "👩‍🦯";
const person_in_motorized_wheelchair = "🧑‍🦼";
const man_in_motorized_wheelchair = "👨‍🦼";
const woman_in_motorized_wheelchair = "👩‍🦼";
const person_in_manual_wheelchair = "🧑‍🦽";
const man_in_manual_wheelchair = "👨‍🦽";
const woman_in_manual_wheelchair = "👩‍🦽";
const runner = "🏃";
const running = "🏃";
const running_man = "🏃‍♂️";
const running_woman = "🏃‍♀️";
const woman_dancing = "💃";
const dancer = "💃";
const man_dancing = "🕺";
const business_suit_levitating = "🕴️";
const dancers = "👯";
const dancing_men = "👯‍♂️";
const dancing_women = "👯‍♀️";
const sauna_person = "🧖";
const sauna_man = "🧖‍♂️";
const sauna_woman = "🧖‍♀️";
const climbing = "🧗";
const climbing_man = "🧗‍♂️";
const climbing_woman = "🧗‍♀️";
const person_fencing = "🤺";
const horse_racing = "🏇";
const skier = "⛷️";
const snowboarder = "🏂";
const golfing = "🏌️";
const golfing_man = "🏌️‍♂️";
const golfing_woman = "🏌️‍♀️";
const surfer = "🏄";
const surfing_man = "🏄‍♂️";
const surfing_woman = "🏄‍♀️";
const rowboat = "🚣";
const rowing_man = "🚣‍♂️";
const rowing_woman = "🚣‍♀️";
const swimmer = "🏊";
const swimming_man = "🏊‍♂️";
const swimming_woman = "🏊‍♀️";
const bouncing_ball_person = "⛹️";
const bouncing_ball_man = "⛹️‍♂️";
const basketball_man = "⛹️‍♂️";
const bouncing_ball_woman = "⛹️‍♀️";
const basketball_woman = "⛹️‍♀️";
const weight_lifting = "🏋️";
const weight_lifting_man = "🏋️‍♂️";
const weight_lifting_woman = "🏋️‍♀️";
const bicyclist = "🚴";
const biking_man = "🚴‍♂️";
const biking_woman = "🚴‍♀️";
const mountain_bicyclist = "🚵";
const mountain_biking_man = "🚵‍♂️";
const mountain_biking_woman = "🚵‍♀️";
const cartwheeling = "🤸";
const man_cartwheeling = "🤸‍♂️";
const woman_cartwheeling = "🤸‍♀️";
const wrestling = "🤼";
const men_wrestling = "🤼‍♂️";
const women_wrestling = "🤼‍♀️";
const water_polo = "🤽";
const man_playing_water_polo = "🤽‍♂️";
const woman_playing_water_polo = "🤽‍♀️";
const handball_person = "🤾";
const man_playing_handball = "🤾‍♂️";
const woman_playing_handball = "🤾‍♀️";
const juggling_person = "🤹";
const man_juggling = "🤹‍♂️";
const woman_juggling = "🤹‍♀️";
const lotus_position = "🧘";
const lotus_position_man = "🧘‍♂️";
const lotus_position_woman = "🧘‍♀️";
const bath = "🛀";
const sleeping_bed = "🛌";
const people_holding_hands = "🧑‍🤝‍🧑";
const two_women_holding_hands = "👭";
const couple = "👫";
const two_men_holding_hands = "👬";
const couplekiss = "💏";
const couplekiss_man_woman = "👩‍❤️‍💋‍👨";
const couplekiss_man_man = "👨‍❤️‍💋‍👨";
const couplekiss_woman_woman = "👩‍❤️‍💋‍👩";
const couple_with_heart = "💑";
const couple_with_heart_woman_man = "👩‍❤️‍👨";
const couple_with_heart_man_man = "👨‍❤️‍👨";
const couple_with_heart_woman_woman = "👩‍❤️‍👩";
const family = "👪";
const family_man_woman_boy = "👨‍👩‍👦";
const family_man_woman_girl = "👨‍👩‍👧";
const family_man_woman_girl_boy = "👨‍👩‍👧‍👦";
const family_man_woman_boy_boy = "👨‍👩‍👦‍👦";
const family_man_woman_girl_girl = "👨‍👩‍👧‍👧";
const family_man_man_boy = "👨‍👨‍👦";
const family_man_man_girl = "👨‍👨‍👧";
const family_man_man_girl_boy = "👨‍👨‍👧‍👦";
const family_man_man_boy_boy = "👨‍👨‍👦‍👦";
const family_man_man_girl_girl = "👨‍👨‍👧‍👧";
const family_woman_woman_boy = "👩‍👩‍👦";
const family_woman_woman_girl = "👩‍👩‍👧";
const family_woman_woman_girl_boy = "👩‍👩‍👧‍👦";
const family_woman_woman_boy_boy = "👩‍👩‍👦‍👦";
const family_woman_woman_girl_girl = "👩‍👩‍👧‍👧";
const family_man_boy = "👨‍👦";
const family_man_boy_boy = "👨‍👦‍👦";
const family_man_girl = "👨‍👧";
const family_man_girl_boy = "👨‍👧‍👦";
const family_man_girl_girl = "👨‍👧‍👧";
const family_woman_boy = "👩‍👦";
const family_woman_boy_boy = "👩‍👦‍👦";
const family_woman_girl = "👩‍👧";
const family_woman_girl_boy = "👩‍👧‍👦";
const family_woman_girl_girl = "👩‍👧‍👧";
const speaking_head = "🗣️";
const bust_in_silhouette = "👤";
const busts_in_silhouette = "👥";
const people_hugging = "🫂";
const footprints = "👣";
const monkey_face = "🐵";
const monkey = "🐒";
const gorilla = "🦍";
const orangutan = "🦧";
const dog = "🐶";
const dog2 = "🐕";
const guide_dog = "🦮";
const service_dog = "🐕‍🦺";
const poodle = "🐩";
const wolf = "🐺";
const fox_face = "🦊";
const raccoon = "🦝";
const cat = "🐱";
const cat2 = "🐈";
const black_cat = "🐈‍⬛";
const lion = "🦁";
const tiger = "🐯";
const tiger2 = "🐅";
const leopard = "🐆";
const horse = "🐴";
const racehorse = "🐎";
const unicorn = "🦄";
const zebra = "🦓";
const deer = "🦌";
const bison = "🦬";
const cow = "🐮";
const ox = "🐂";
const water_buffalo = "🐃";
const cow2 = "🐄";
const pig = "🐷";
const pig2 = "🐖";
const boar = "🐗";
const pig_nose = "🐽";
const ram = "🐏";
const sheep = "🐑";
const goat = "🐐";
const dromedary_camel = "🐪";
const camel = "🐫";
const llama = "🦙";
const giraffe = "🦒";
const elephant = "🐘";
const mammoth = "🦣";
const rhinoceros = "🦏";
const hippopotamus = "🦛";
const mouse = "🐭";
const mouse2 = "🐁";
const rat = "🐀";
const hamster = "🐹";
const rabbit = "🐰";
const rabbit2 = "🐇";
const chipmunk = "🐿️";
const beaver = "🦫";
const hedgehog = "🦔";
const bat = "🦇";
const bear = "🐻";
const polar_bear = "🐻‍❄️";
const koala = "🐨";
const panda_face = "🐼";
const sloth = "🦥";
const otter = "🦦";
const skunk = "🦨";
const kangaroo = "🦘";
const badger = "🦡";
const feet = "🐾";
const paw_prints = "🐾";
const turkey = "🦃";
const chicken = "🐔";
const rooster = "🐓";
const hatching_chick = "🐣";
const baby_chick = "🐤";
const hatched_chick = "🐥";
const bird = "🐦";
const penguin = "🐧";
const dove = "🕊️";
const eagle = "🦅";
const duck = "🦆";
const swan = "🦢";
const owl = "🦉";
const dodo = "🦤";
const feather = "🪶";
const flamingo = "🦩";
const peacock = "🦚";
const parrot = "🦜";
const frog = "🐸";
const crocodile = "🐊";
const turtle = "🐢";
const lizard = "🦎";
const snake = "🐍";
const dragon_face = "🐲";
const dragon = "🐉";
const sauropod = "🦕";
const whale = "🐳";
const whale2 = "🐋";
const dolphin = "🐬";
const flipper = "🐬";
const seal = "🦭";
const fish = "🐟";
const tropical_fish = "🐠";
const blowfish = "🐡";
const shark = "🦈";
const octopus = "🐙";
const shell$1 = "🐚";
const snail = "🐌";
const butterfly = "🦋";
const bug = "🐛";
const ant = "🐜";
const bee = "🐝";
const honeybee = "🐝";
const beetle = "🪲";
const lady_beetle = "🐞";
const cricket = "🦗";
const cockroach = "🪳";
const spider = "🕷️";
const spider_web = "🕸️";
const scorpion = "🦂";
const mosquito = "🦟";
const fly = "🪰";
const worm = "🪱";
const microbe = "🦠";
const bouquet = "💐";
const cherry_blossom = "🌸";
const white_flower = "💮";
const rosette = "🏵️";
const rose = "🌹";
const wilted_flower = "🥀";
const hibiscus = "🌺";
const sunflower = "🌻";
const blossom = "🌼";
const tulip = "🌷";
const seedling = "🌱";
const potted_plant = "🪴";
const evergreen_tree = "🌲";
const deciduous_tree = "🌳";
const palm_tree = "🌴";
const cactus = "🌵";
const ear_of_rice = "🌾";
const herb = "🌿";
const shamrock = "☘️";
const four_leaf_clover = "🍀";
const maple_leaf = "🍁";
const fallen_leaf = "🍂";
const leaves = "🍃";
const grapes = "🍇";
const melon = "🍈";
const watermelon = "🍉";
const tangerine = "🍊";
const orange = "🍊";
const mandarin = "🍊";
const lemon = "🍋";
const banana = "🍌";
const pineapple = "🍍";
const mango = "🥭";
const apple = "🍎";
const green_apple = "🍏";
const pear = "🍐";
const peach = "🍑";
const cherries = "🍒";
const strawberry = "🍓";
const blueberries = "🫐";
const kiwi_fruit = "🥝";
const tomato = "🍅";
const olive = "🫒";
const coconut = "🥥";
const avocado = "🥑";
const eggplant = "🍆";
const potato = "🥔";
const carrot = "🥕";
const corn = "🌽";
const hot_pepper = "🌶️";
const bell_pepper = "🫑";
const cucumber = "🥒";
const leafy_green = "🥬";
const broccoli = "🥦";
const garlic = "🧄";
const onion = "🧅";
const mushroom = "🍄";
const peanuts = "🥜";
const chestnut = "🌰";
const bread = "🍞";
const croissant = "🥐";
const baguette_bread = "🥖";
const flatbread = "🫓";
const pretzel = "🥨";
const bagel = "🥯";
const pancakes = "🥞";
const waffle = "🧇";
const cheese = "🧀";
const meat_on_bone = "🍖";
const poultry_leg = "🍗";
const cut_of_meat = "🥩";
const bacon = "🥓";
const hamburger = "🍔";
const fries = "🍟";
const pizza = "🍕";
const hotdog = "🌭";
const sandwich = "🥪";
const taco = "🌮";
const burrito = "🌯";
const tamale = "🫔";
const stuffed_flatbread = "🥙";
const falafel = "🧆";
const egg = "🥚";
const fried_egg = "🍳";
const shallow_pan_of_food = "🥘";
const stew = "🍲";
const fondue = "🫕";
const bowl_with_spoon = "🥣";
const green_salad = "🥗";
const popcorn = "🍿";
const butter = "🧈";
const salt = "🧂";
const canned_food = "🥫";
const bento = "🍱";
const rice_cracker = "🍘";
const rice_ball = "🍙";
const rice = "🍚";
const curry = "🍛";
const ramen = "🍜";
const spaghetti = "🍝";
const sweet_potato = "🍠";
const oden = "🍢";
const sushi = "🍣";
const fried_shrimp = "🍤";
const fish_cake = "🍥";
const moon_cake = "🥮";
const dango = "🍡";
const dumpling = "🥟";
const fortune_cookie = "🥠";
const takeout_box = "🥡";
const crab = "🦀";
const lobster = "🦞";
const shrimp = "🦐";
const squid = "🦑";
const oyster = "🦪";
const icecream = "🍦";
const shaved_ice = "🍧";
const ice_cream = "🍨";
const doughnut = "🍩";
const cookie = "🍪";
const birthday = "🎂";
const cake = "🍰";
const cupcake = "🧁";
const pie = "🥧";
const chocolate_bar = "🍫";
const candy = "🍬";
const lollipop = "🍭";
const custard = "🍮";
const honey_pot = "🍯";
const baby_bottle = "🍼";
const milk_glass = "🥛";
const coffee = "☕";
const teapot = "🫖";
const tea = "🍵";
const sake = "🍶";
const champagne = "🍾";
const wine_glass = "🍷";
const cocktail = "🍸";
const tropical_drink = "🍹";
const beer = "🍺";
const beers = "🍻";
const clinking_glasses = "🥂";
const tumbler_glass = "🥃";
const cup_with_straw = "🥤";
const bubble_tea = "🧋";
const beverage_box = "🧃";
const mate = "🧉";
const ice_cube = "🧊";
const chopsticks = "🥢";
const plate_with_cutlery = "🍽️";
const fork_and_knife = "🍴";
const spoon = "🥄";
const hocho = "🔪";
const knife = "🔪";
const amphora = "🏺";
const earth_africa = "🌍";
const earth_americas = "🌎";
const earth_asia = "🌏";
const globe_with_meridians = "🌐";
const world_map = "🗺️";
const japan = "🗾";
const compass = "🧭";
const mountain_snow = "🏔️";
const mountain = "⛰️";
const volcano = "🌋";
const mount_fuji = "🗻";
const camping = "🏕️";
const beach_umbrella = "🏖️";
const desert = "🏜️";
const desert_island = "🏝️";
const national_park = "🏞️";
const stadium = "🏟️";
const classical_building = "🏛️";
const building_construction = "🏗️";
const bricks = "🧱";
const rock = "🪨";
const wood = "🪵";
const hut = "🛖";
const houses = "🏘️";
const derelict_house = "🏚️";
const house = "🏠";
const house_with_garden = "🏡";
const office = "🏢";
const post_office = "🏣";
const european_post_office = "🏤";
const hospital = "🏥";
const bank = "🏦";
const hotel = "🏨";
const love_hotel = "🏩";
const convenience_store = "🏪";
const school = "🏫";
const department_store = "🏬";
const factory = "🏭";
const japanese_castle = "🏯";
const european_castle = "🏰";
const wedding = "💒";
const tokyo_tower = "🗼";
const statue_of_liberty = "🗽";
const church = "⛪";
const mosque = "🕌";
const hindu_temple = "🛕";
const synagogue = "🕍";
const shinto_shrine = "⛩️";
const kaaba = "🕋";
const fountain = "⛲";
const tent = "⛺";
const foggy = "🌁";
const night_with_stars = "🌃";
const cityscape = "🏙️";
const sunrise_over_mountains = "🌄";
const sunrise = "🌅";
const city_sunset = "🌆";
const city_sunrise = "🌇";
const bridge_at_night = "🌉";
const hotsprings = "♨️";
const carousel_horse = "🎠";
const ferris_wheel = "🎡";
const roller_coaster = "🎢";
const barber = "💈";
const circus_tent = "🎪";
const steam_locomotive = "🚂";
const railway_car = "🚃";
const bullettrain_side = "🚄";
const bullettrain_front = "🚅";
const train2 = "🚆";
const metro = "🚇";
const light_rail = "🚈";
const station = "🚉";
const tram = "🚊";
const monorail = "🚝";
const mountain_railway = "🚞";
const train = "🚋";
const bus = "🚌";
const oncoming_bus = "🚍";
const trolleybus = "🚎";
const minibus = "🚐";
const ambulance = "🚑";
const fire_engine = "🚒";
const police_car = "🚓";
const oncoming_police_car = "🚔";
const taxi = "🚕";
const oncoming_taxi = "🚖";
const car = "🚗";
const red_car = "🚗";
const oncoming_automobile = "🚘";
const blue_car = "🚙";
const pickup_truck = "🛻";
const truck = "🚚";
const articulated_lorry = "🚛";
const tractor = "🚜";
const racing_car = "🏎️";
const motorcycle = "🏍️";
const motor_scooter = "🛵";
const manual_wheelchair = "🦽";
const motorized_wheelchair = "🦼";
const auto_rickshaw = "🛺";
const bike = "🚲";
const kick_scooter = "🛴";
const skateboard = "🛹";
const roller_skate = "🛼";
const busstop = "🚏";
const motorway = "🛣️";
const railway_track = "🛤️";
const oil_drum = "🛢️";
const fuelpump = "⛽";
const rotating_light = "🚨";
const traffic_light = "🚥";
const vertical_traffic_light = "🚦";
const stop_sign = "🛑";
const construction = "🚧";
const anchor = "⚓";
const boat = "⛵";
const sailboat = "⛵";
const canoe = "🛶";
const speedboat = "🚤";
const passenger_ship = "🛳️";
const ferry = "⛴️";
const motor_boat = "🛥️";
const ship = "🚢";
const airplane = "✈️";
const small_airplane = "🛩️";
const flight_departure = "🛫";
const flight_arrival = "🛬";
const parachute = "🪂";
const seat = "💺";
const helicopter = "🚁";
const suspension_railway = "🚟";
const mountain_cableway = "🚠";
const aerial_tramway = "🚡";
const artificial_satellite = "🛰️";
const rocket = "🚀";
const flying_saucer = "🛸";
const bellhop_bell = "🛎️";
const luggage = "🧳";
const hourglass = "⌛";
const hourglass_flowing_sand = "⏳";
const watch = "⌚";
const alarm_clock = "⏰";
const stopwatch = "⏱️";
const timer_clock = "⏲️";
const mantelpiece_clock = "🕰️";
const clock12 = "🕛";
const clock1230 = "🕧";
const clock1 = "🕐";
const clock130 = "🕜";
const clock2 = "🕑";
const clock230 = "🕝";
const clock3 = "🕒";
const clock330 = "🕞";
const clock4 = "🕓";
const clock430 = "🕟";
const clock5 = "🕔";
const clock530 = "🕠";
const clock6 = "🕕";
const clock630 = "🕡";
const clock7 = "🕖";
const clock730 = "🕢";
const clock8 = "🕗";
const clock830 = "🕣";
const clock9 = "🕘";
const clock930 = "🕤";
const clock10 = "🕙";
const clock1030 = "🕥";
const clock11 = "🕚";
const clock1130 = "🕦";
const new_moon = "🌑";
const waxing_crescent_moon = "🌒";
const first_quarter_moon = "🌓";
const moon = "🌔";
const waxing_gibbous_moon = "🌔";
const full_moon = "🌕";
const waning_gibbous_moon = "🌖";
const last_quarter_moon = "🌗";
const waning_crescent_moon = "🌘";
const crescent_moon = "🌙";
const new_moon_with_face = "🌚";
const first_quarter_moon_with_face = "🌛";
const last_quarter_moon_with_face = "🌜";
const thermometer = "🌡️";
const sunny = "☀️";
const full_moon_with_face = "🌝";
const sun_with_face = "🌞";
const ringed_planet = "🪐";
const star = "⭐";
const star2 = "🌟";
const stars = "🌠";
const milky_way = "🌌";
const cloud = "☁️";
const partly_sunny = "⛅";
const cloud_with_lightning_and_rain = "⛈️";
const sun_behind_small_cloud = "🌤️";
const sun_behind_large_cloud = "🌥️";
const sun_behind_rain_cloud = "🌦️";
const cloud_with_rain = "🌧️";
const cloud_with_snow = "🌨️";
const cloud_with_lightning = "🌩️";
const tornado = "🌪️";
const fog = "🌫️";
const wind_face = "🌬️";
const cyclone = "🌀";
const rainbow = "🌈";
const closed_umbrella = "🌂";
const open_umbrella = "☂️";
const umbrella = "☔";
const parasol_on_ground = "⛱️";
const zap = "⚡";
const snowflake = "❄️";
const snowman_with_snow = "☃️";
const snowman = "⛄";
const comet = "☄️";
const fire = "🔥";
const droplet = "💧";
const ocean = "🌊";
const jack_o_lantern = "🎃";
const christmas_tree = "🎄";
const fireworks = "🎆";
const sparkler = "🎇";
const firecracker = "🧨";
const sparkles = "✨";
const balloon = "🎈";
const tada = "🎉";
const confetti_ball = "🎊";
const tanabata_tree = "🎋";
const bamboo = "🎍";
const dolls = "🎎";
const flags = "🎏";
const wind_chime = "🎐";
const rice_scene = "🎑";
const red_envelope = "🧧";
const ribbon = "🎀";
const gift = "🎁";
const reminder_ribbon = "🎗️";
const tickets = "🎟️";
const ticket = "🎫";
const medal_military = "🎖️";
const trophy = "🏆";
const medal_sports = "🏅";
const soccer = "⚽";
const baseball = "⚾";
const softball = "🥎";
const basketball = "🏀";
const volleyball = "🏐";
const football = "🏈";
const rugby_football = "🏉";
const tennis = "🎾";
const flying_disc = "🥏";
const bowling = "🎳";
const cricket_game = "🏏";
const field_hockey = "🏑";
const ice_hockey = "🏒";
const lacrosse = "🥍";
const ping_pong = "🏓";
const badminton = "🏸";
const boxing_glove = "🥊";
const martial_arts_uniform = "🥋";
const goal_net = "🥅";
const golf = "⛳";
const ice_skate = "⛸️";
const fishing_pole_and_fish = "🎣";
const diving_mask = "🤿";
const running_shirt_with_sash = "🎽";
const ski = "🎿";
const sled = "🛷";
const curling_stone = "🥌";
const dart$1 = "🎯";
const yo_yo = "🪀";
const kite = "🪁";
const crystal_ball = "🔮";
const magic_wand = "🪄";
const nazar_amulet = "🧿";
const video_game = "🎮";
const joystick = "🕹️";
const slot_machine = "🎰";
const game_die = "🎲";
const jigsaw = "🧩";
const teddy_bear = "🧸";
const pinata = "🪅";
const nesting_dolls = "🪆";
const spades = "♠️";
const hearts = "♥️";
const diamonds = "♦️";
const clubs = "♣️";
const chess_pawn = "♟️";
const black_joker = "🃏";
const mahjong = "🀄";
const flower_playing_cards = "🎴";
const performing_arts = "🎭";
const framed_picture = "🖼️";
const art = "🎨";
const thread = "🧵";
const sewing_needle = "🪡";
const yarn = "🧶";
const knot = "🪢";
const eyeglasses = "👓";
const dark_sunglasses = "🕶️";
const goggles = "🥽";
const lab_coat = "🥼";
const safety_vest = "🦺";
const necktie = "👔";
const shirt = "👕";
const tshirt = "👕";
const jeans = "👖";
const scarf = "🧣";
const gloves = "🧤";
const coat = "🧥";
const socks = "🧦";
const dress = "👗";
const kimono = "👘";
const sari = "🥻";
const one_piece_swimsuit = "🩱";
const swim_brief = "🩲";
const shorts = "🩳";
const bikini = "👙";
const womans_clothes = "👚";
const purse = "👛";
const handbag = "👜";
const pouch = "👝";
const shopping = "🛍️";
const school_satchel = "🎒";
const thong_sandal = "🩴";
const mans_shoe = "👞";
const shoe = "👞";
const athletic_shoe = "👟";
const hiking_boot = "🥾";
const flat_shoe = "🥿";
const high_heel = "👠";
const sandal = "👡";
const ballet_shoes = "🩰";
const boot = "👢";
const crown = "👑";
const womans_hat = "👒";
const tophat = "🎩";
const mortar_board = "🎓";
const billed_cap = "🧢";
const military_helmet = "🪖";
const rescue_worker_helmet = "⛑️";
const prayer_beads = "📿";
const lipstick = "💄";
const ring = "💍";
const gem = "💎";
const mute = "🔇";
const speaker = "🔈";
const sound = "🔉";
const loud_sound = "🔊";
const loudspeaker = "📢";
const mega = "📣";
const postal_horn = "📯";
const bell = "🔔";
const no_bell = "🔕";
const musical_score = "🎼";
const musical_note = "🎵";
const notes = "🎶";
const studio_microphone = "🎙️";
const level_slider = "🎚️";
const control_knobs = "🎛️";
const microphone = "🎤";
const headphones = "🎧";
const radio = "📻";
const saxophone = "🎷";
const accordion = "🪗";
const guitar = "🎸";
const musical_keyboard = "🎹";
const trumpet = "🎺";
const violin = "🎻";
const banjo = "🪕";
const drum = "🥁";
const long_drum = "🪘";
const iphone = "📱";
const calling = "📲";
const phone = "☎️";
const telephone = "☎️";
const telephone_receiver = "📞";
const pager = "📟";
const fax = "📠";
const battery = "🔋";
const electric_plug = "🔌";
const computer = "💻";
const desktop_computer = "🖥️";
const printer = "🖨️";
const keyboard = "⌨️";
const computer_mouse = "🖱️";
const trackball = "🖲️";
const minidisc = "💽";
const floppy_disk = "💾";
const cd = "💿";
const dvd = "📀";
const abacus = "🧮";
const movie_camera = "🎥";
const film_strip = "🎞️";
const film_projector = "📽️";
const clapper = "🎬";
const tv = "📺";
const camera = "📷";
const camera_flash = "📸";
const video_camera = "📹";
const vhs = "📼";
const mag = "🔍";
const mag_right = "🔎";
const candle = "🕯️";
const bulb = "💡";
const flashlight = "🔦";
const izakaya_lantern = "🏮";
const lantern = "🏮";
const diya_lamp = "🪔";
const notebook_with_decorative_cover = "📔";
const closed_book = "📕";
const book = "📖";
const open_book = "📖";
const green_book = "📗";
const blue_book = "📘";
const orange_book = "📙";
const books = "📚";
const notebook = "📓";
const ledger = "📒";
const page_with_curl = "📃";
const scroll = "📜";
const page_facing_up = "📄";
const newspaper = "📰";
const newspaper_roll = "🗞️";
const bookmark_tabs = "📑";
const bookmark = "🔖";
const label = "🏷️";
const moneybag = "💰";
const coin = "🪙";
const yen = "💴";
const dollar = "💵";
const euro = "💶";
const pound = "💷";
const money_with_wings = "💸";
const credit_card = "💳";
const receipt = "🧾";
const chart = "💹";
const envelope = "✉️";
const email = "📧";
const incoming_envelope = "📨";
const envelope_with_arrow = "📩";
const outbox_tray = "📤";
const inbox_tray = "📥";
const mailbox = "📫";
const mailbox_closed = "📪";
const mailbox_with_mail = "📬";
const mailbox_with_no_mail = "📭";
const postbox = "📮";
const ballot_box = "🗳️";
const pencil2 = "✏️";
const black_nib = "✒️";
const fountain_pen = "🖋️";
const pen = "🖊️";
const paintbrush = "🖌️";
const crayon = "🖍️";
const memo = "📝";
const pencil = "📝";
const briefcase = "💼";
const file_folder = "📁";
const open_file_folder = "📂";
const card_index_dividers = "🗂️";
const date = "📅";
const calendar = "📆";
const spiral_notepad = "🗒️";
const spiral_calendar = "🗓️";
const card_index = "📇";
const chart_with_upwards_trend = "📈";
const chart_with_downwards_trend = "📉";
const bar_chart = "📊";
const clipboard = "📋";
const pushpin = "📌";
const round_pushpin = "📍";
const paperclip = "📎";
const paperclips = "🖇️";
const straight_ruler = "📏";
const triangular_ruler = "📐";
const scissors = "✂️";
const card_file_box = "🗃️";
const file_cabinet = "🗄️";
const wastebasket = "🗑️";
const lock = "🔒";
const unlock = "🔓";
const lock_with_ink_pen = "🔏";
const closed_lock_with_key = "🔐";
const key = "🔑";
const old_key = "🗝️";
const hammer = "🔨";
const axe = "🪓";
const pick = "⛏️";
const hammer_and_pick = "⚒️";
const hammer_and_wrench = "🛠️";
const dagger = "🗡️";
const crossed_swords = "⚔️";
const gun = "🔫";
const boomerang = "🪃";
const bow_and_arrow = "🏹";
const shield = "🛡️";
const carpentry_saw = "🪚";
const wrench = "🔧";
const screwdriver = "🪛";
const nut_and_bolt = "🔩";
const gear = "⚙️";
const clamp = "🗜️";
const balance_scale = "⚖️";
const probing_cane = "🦯";
const link = "🔗";
const chains = "⛓️";
const hook = "🪝";
const toolbox = "🧰";
const magnet = "🧲";
const ladder = "🪜";
const alembic = "⚗️";
const test_tube = "🧪";
const petri_dish = "🧫";
const dna = "🧬";
const microscope = "🔬";
const telescope = "🔭";
const satellite = "📡";
const syringe = "💉";
const drop_of_blood = "🩸";
const pill = "💊";
const adhesive_bandage = "🩹";
const stethoscope = "🩺";
const door = "🚪";
const elevator = "🛗";
const mirror = "🪞";
const window$1 = "🪟";
const bed = "🛏️";
const couch_and_lamp = "🛋️";
const chair = "🪑";
const toilet = "🚽";
const plunger = "🪠";
const shower = "🚿";
const bathtub = "🛁";
const mouse_trap = "🪤";
const razor = "🪒";
const lotion_bottle = "🧴";
const safety_pin = "🧷";
const broom = "🧹";
const basket = "🧺";
const roll_of_paper = "🧻";
const bucket = "🪣";
const soap = "🧼";
const toothbrush = "🪥";
const sponge = "🧽";
const fire_extinguisher = "🧯";
const shopping_cart = "🛒";
const smoking = "🚬";
const coffin = "⚰️";
const headstone = "🪦";
const funeral_urn = "⚱️";
const moyai = "🗿";
const placard = "🪧";
const atm = "🏧";
const put_litter_in_its_place = "🚮";
const potable_water = "🚰";
const wheelchair = "♿";
const mens = "🚹";
const womens = "🚺";
const restroom = "🚻";
const baby_symbol = "🚼";
const wc = "🚾";
const passport_control = "🛂";
const customs = "🛃";
const baggage_claim = "🛄";
const left_luggage = "🛅";
const warning = "⚠️";
const children_crossing = "🚸";
const no_entry = "⛔";
const no_entry_sign = "🚫";
const no_bicycles = "🚳";
const no_smoking = "🚭";
const do_not_litter = "🚯";
const no_pedestrians = "🚷";
const no_mobile_phones = "📵";
const underage = "🔞";
const radioactive = "☢️";
const biohazard = "☣️";
const arrow_up = "⬆️";
const arrow_upper_right = "↗️";
const arrow_right = "➡️";
const arrow_lower_right = "↘️";
const arrow_down = "⬇️";
const arrow_lower_left = "↙️";
const arrow_left = "⬅️";
const arrow_upper_left = "↖️";
const arrow_up_down = "↕️";
const left_right_arrow = "↔️";
const leftwards_arrow_with_hook = "↩️";
const arrow_right_hook = "↪️";
const arrow_heading_up = "⤴️";
const arrow_heading_down = "⤵️";
const arrows_clockwise = "🔃";
const arrows_counterclockwise = "🔄";
const back = "🔙";
const end = "🔚";
const on = "🔛";
const soon = "🔜";
const top = "🔝";
const place_of_worship = "🛐";
const atom_symbol = "⚛️";
const om = "🕉️";
const star_of_david = "✡️";
const wheel_of_dharma = "☸️";
const yin_yang = "☯️";
const latin_cross = "✝️";
const orthodox_cross = "☦️";
const star_and_crescent = "☪️";
const peace_symbol = "☮️";
const menorah = "🕎";
const six_pointed_star = "🔯";
const aries = "♈";
const taurus = "♉";
const gemini = "♊";
const cancer = "♋";
const leo = "♌";
const virgo = "♍";
const libra = "♎";
const scorpius = "♏";
const sagittarius = "♐";
const capricorn = "♑";
const aquarius = "♒";
const pisces = "♓";
const ophiuchus = "⛎";
const twisted_rightwards_arrows = "🔀";
const repeat$1 = "🔁";
const repeat_one = "🔂";
const arrow_forward = "▶️";
const fast_forward = "⏩";
const next_track_button = "⏭️";
const play_or_pause_button = "⏯️";
const arrow_backward = "◀️";
const rewind = "⏪";
const previous_track_button = "⏮️";
const arrow_up_small = "🔼";
const arrow_double_up = "⏫";
const arrow_down_small = "🔽";
const arrow_double_down = "⏬";
const pause_button = "⏸️";
const stop_button = "⏹️";
const record_button = "⏺️";
const eject_button = "⏏️";
const cinema = "🎦";
const low_brightness = "🔅";
const high_brightness = "🔆";
const signal_strength = "📶";
const vibration_mode = "📳";
const mobile_phone_off = "📴";
const female_sign = "♀️";
const male_sign = "♂️";
const transgender_symbol = "⚧️";
const heavy_multiplication_x = "✖️";
const heavy_plus_sign = "➕";
const heavy_minus_sign = "➖";
const heavy_division_sign = "➗";
const infinity = "♾️";
const bangbang = "‼️";
const interrobang = "⁉️";
const question = "❓";
const grey_question = "❔";
const grey_exclamation = "❕";
const exclamation = "❗";
const heavy_exclamation_mark = "❗";
const wavy_dash = "〰️";
const currency_exchange = "💱";
const heavy_dollar_sign = "💲";
const medical_symbol = "⚕️";
const recycle = "♻️";
const fleur_de_lis = "⚜️";
const trident = "🔱";
const name_badge = "📛";
const beginner = "🔰";
const o$1 = "⭕";
const white_check_mark = "✅";
const ballot_box_with_check = "☑️";
const heavy_check_mark = "✔️";
const x = "❌";
const negative_squared_cross_mark = "❎";
const curly_loop = "➰";
const loop = "➿";
const part_alternation_mark = "〽️";
const eight_spoked_asterisk = "✳️";
const eight_pointed_black_star = "✴️";
const sparkle = "❇️";
const copyright = "©️";
const registered = "®️";
const tm = "™️";
const hash = "#️⃣";
const asterisk = "*️⃣";
const zero = "0️⃣";
const one = "1️⃣";
const two = "2️⃣";
const three = "3️⃣";
const four = "4️⃣";
const five = "5️⃣";
const six = "6️⃣";
const seven = "7️⃣";
const eight = "8️⃣";
const nine = "9️⃣";
const keycap_ten = "🔟";
const capital_abcd = "🔠";
const abcd = "🔡";
const symbols = "🔣";
const abc = "🔤";
const a$1 = "🅰️";
const ab = "🆎";
const b = "🅱️";
const cl = "🆑";
const cool = "🆒";
const free = "🆓";
const information_source = "ℹ️";
const id = "🆔";
const m = "Ⓜ️";
const ng = "🆖";
const o2 = "🅾️";
const ok = "🆗";
const parking = "🅿️";
const sos = "🆘";
const up = "🆙";
const vs = "🆚";
const koko = "🈁";
const sa = "🈂️";
const ideograph_advantage = "🉐";
const accept = "🉑";
const congratulations = "㊗️";
const secret = "㊙️";
const u6e80 = "🈵";
const red_circle = "🔴";
const orange_circle = "🟠";
const yellow_circle = "🟡";
const green_circle = "🟢";
const large_blue_circle = "🔵";
const purple_circle = "🟣";
const brown_circle = "🟤";
const black_circle = "⚫";
const white_circle = "⚪";
const red_square = "🟥";
const orange_square = "🟧";
const yellow_square = "🟨";
const green_square = "🟩";
const blue_square = "🟦";
const purple_square = "🟪";
const brown_square = "🟫";
const black_large_square = "⬛";
const white_large_square = "⬜";
const black_medium_square = "◼️";
const white_medium_square = "◻️";
const black_medium_small_square = "◾";
const white_medium_small_square = "◽";
const black_small_square = "▪️";
const white_small_square = "▫️";
const large_orange_diamond = "🔶";
const large_blue_diamond = "🔷";
const small_orange_diamond = "🔸";
const small_blue_diamond = "🔹";
const small_red_triangle = "🔺";
const small_red_triangle_down = "🔻";
const diamond_shape_with_a_dot_inside = "💠";
const radio_button = "🔘";
const white_square_button = "🔳";
const black_square_button = "🔲";
const checkered_flag = "🏁";
const triangular_flag_on_post = "🚩";
const crossed_flags = "🎌";
const black_flag = "🏴";
const white_flag = "🏳️";
const rainbow_flag = "🏳️‍🌈";
const transgender_flag = "🏳️‍⚧️";
const pirate_flag = "🏴‍☠️";
const ascension_island = "🇦🇨";
const andorra = "🇦🇩";
const united_arab_emirates = "🇦🇪";
const afghanistan = "🇦🇫";
const antigua_barbuda = "🇦🇬";
const anguilla = "🇦🇮";
const albania = "🇦🇱";
const armenia = "🇦🇲";
const angola = "🇦🇴";
const antarctica = "🇦🇶";
const argentina = "🇦🇷";
const american_samoa = "🇦🇸";
const austria = "🇦🇹";
const australia = "🇦🇺";
const aruba = "🇦🇼";
const aland_islands = "🇦🇽";
const azerbaijan = "🇦🇿";
const bosnia_herzegovina = "🇧🇦";
const barbados = "🇧🇧";
const bangladesh = "🇧🇩";
const belgium = "🇧🇪";
const burkina_faso = "🇧🇫";
const bulgaria = "🇧🇬";
const bahrain = "🇧🇭";
const burundi = "🇧🇮";
const benin = "🇧🇯";
const st_barthelemy = "🇧🇱";
const bermuda = "🇧🇲";
const brunei = "🇧🇳";
const bolivia = "🇧🇴";
const caribbean_netherlands = "🇧🇶";
const brazil = "🇧🇷";
const bahamas = "🇧🇸";
const bhutan = "🇧🇹";
const bouvet_island = "🇧🇻";
const botswana = "🇧🇼";
const belarus = "🇧🇾";
const belize = "🇧🇿";
const canada = "🇨🇦";
const cocos_islands = "🇨🇨";
const congo_kinshasa = "🇨🇩";
const central_african_republic = "🇨🇫";
const congo_brazzaville = "🇨🇬";
const switzerland = "🇨🇭";
const cote_divoire = "🇨🇮";
const cook_islands = "🇨🇰";
const chile = "🇨🇱";
const cameroon = "🇨🇲";
const cn = "🇨🇳";
const colombia = "🇨🇴";
const clipperton_island = "🇨🇵";
const costa_rica = "🇨🇷";
const cuba = "🇨🇺";
const cape_verde = "🇨🇻";
const curacao = "🇨🇼";
const christmas_island = "🇨🇽";
const cyprus = "🇨🇾";
const czech_republic = "🇨🇿";
const de = "🇩🇪";
const diego_garcia = "🇩🇬";
const djibouti = "🇩🇯";
const denmark = "🇩🇰";
const dominica = "🇩🇲";
const dominican_republic = "🇩🇴";
const algeria = "🇩🇿";
const ceuta_melilla = "🇪🇦";
const ecuador = "🇪🇨";
const estonia = "🇪🇪";
const egypt = "🇪🇬";
const western_sahara = "🇪🇭";
const eritrea = "🇪🇷";
const es = "🇪🇸";
const ethiopia = "🇪🇹";
const eu = "🇪🇺";
const european_union = "🇪🇺";
const finland = "🇫🇮";
const fiji = "🇫🇯";
const falkland_islands = "🇫🇰";
const micronesia = "🇫🇲";
const faroe_islands = "🇫🇴";
const fr = "🇫🇷";
const gabon = "🇬🇦";
const gb = "🇬🇧";
const uk = "🇬🇧";
const grenada = "🇬🇩";
const georgia = "🇬🇪";
const french_guiana = "🇬🇫";
const guernsey = "🇬🇬";
const ghana = "🇬🇭";
const gibraltar = "🇬🇮";
const greenland = "🇬🇱";
const gambia = "🇬🇲";
const guinea = "🇬🇳";
const guadeloupe = "🇬🇵";
const equatorial_guinea = "🇬🇶";
const greece = "🇬🇷";
const south_georgia_south_sandwich_islands = "🇬🇸";
const guatemala = "🇬🇹";
const guam = "🇬🇺";
const guinea_bissau = "🇬🇼";
const guyana = "🇬🇾";
const hong_kong = "🇭🇰";
const heard_mcdonald_islands = "🇭🇲";
const honduras = "🇭🇳";
const croatia = "🇭🇷";
const haiti = "🇭🇹";
const hungary = "🇭🇺";
const canary_islands = "🇮🇨";
const indonesia = "🇮🇩";
const ireland = "🇮🇪";
const israel = "🇮🇱";
const isle_of_man = "🇮🇲";
const india = "🇮🇳";
const british_indian_ocean_territory = "🇮🇴";
const iraq = "🇮🇶";
const iran = "🇮🇷";
const iceland = "🇮🇸";
const it = "🇮🇹";
const jersey = "🇯🇪";
const jamaica = "🇯🇲";
const jordan = "🇯🇴";
const jp = "🇯🇵";
const kenya = "🇰🇪";
const kyrgyzstan = "🇰🇬";
const cambodia = "🇰🇭";
const kiribati = "🇰🇮";
const comoros = "🇰🇲";
const st_kitts_nevis = "🇰🇳";
const north_korea = "🇰🇵";
const kr = "🇰🇷";
const kuwait = "🇰🇼";
const cayman_islands = "🇰🇾";
const kazakhstan = "🇰🇿";
const laos = "🇱🇦";
const lebanon = "🇱🇧";
const st_lucia = "🇱🇨";
const liechtenstein = "🇱🇮";
const sri_lanka = "🇱🇰";
const liberia = "🇱🇷";
const lesotho = "🇱🇸";
const lithuania = "🇱🇹";
const luxembourg = "🇱🇺";
const latvia = "🇱🇻";
const libya = "🇱🇾";
const morocco = "🇲🇦";
const monaco = "🇲🇨";
const moldova = "🇲🇩";
const montenegro = "🇲🇪";
const st_martin = "🇲🇫";
const madagascar = "🇲🇬";
const marshall_islands = "🇲🇭";
const macedonia = "🇲🇰";
const mali = "🇲🇱";
const myanmar = "🇲🇲";
const mongolia = "🇲🇳";
const macau = "🇲🇴";
const northern_mariana_islands = "🇲🇵";
const martinique = "🇲🇶";
const mauritania = "🇲🇷";
const montserrat = "🇲🇸";
const malta = "🇲🇹";
const mauritius = "🇲🇺";
const maldives = "🇲🇻";
const malawi = "🇲🇼";
const mexico = "🇲🇽";
const malaysia = "🇲🇾";
const mozambique = "🇲🇿";
const namibia = "🇳🇦";
const new_caledonia = "🇳🇨";
const niger = "🇳🇪";
const norfolk_island = "🇳🇫";
const nigeria = "🇳🇬";
const nicaragua = "🇳🇮";
const netherlands = "🇳🇱";
const norway = "🇳🇴";
const nepal = "🇳🇵";
const nauru = "🇳🇷";
const niue = "🇳🇺";
const new_zealand = "🇳🇿";
const oman = "🇴🇲";
const panama = "🇵🇦";
const peru = "🇵🇪";
const french_polynesia = "🇵🇫";
const papua_new_guinea = "🇵🇬";
const philippines = "🇵🇭";
const pakistan = "🇵🇰";
const poland = "🇵🇱";
const st_pierre_miquelon = "🇵🇲";
const pitcairn_islands = "🇵🇳";
const puerto_rico = "🇵🇷";
const palestinian_territories = "🇵🇸";
const portugal = "🇵🇹";
const palau = "🇵🇼";
const paraguay = "🇵🇾";
const qatar = "🇶🇦";
const reunion = "🇷🇪";
const romania = "🇷🇴";
const serbia = "🇷🇸";
const ru = "🇷🇺";
const rwanda = "🇷🇼";
const saudi_arabia = "🇸🇦";
const solomon_islands = "🇸🇧";
const seychelles = "🇸🇨";
const sudan = "🇸🇩";
const sweden = "🇸🇪";
const singapore = "🇸🇬";
const st_helena = "🇸🇭";
const slovenia = "🇸🇮";
const svalbard_jan_mayen = "🇸🇯";
const slovakia = "🇸🇰";
const sierra_leone = "🇸🇱";
const san_marino = "🇸🇲";
const senegal = "🇸🇳";
const somalia = "🇸🇴";
const suriname = "🇸🇷";
const south_sudan = "🇸🇸";
const sao_tome_principe = "🇸🇹";
const el_salvador = "🇸🇻";
const sint_maarten = "🇸🇽";
const syria = "🇸🇾";
const swaziland = "🇸🇿";
const tristan_da_cunha = "🇹🇦";
const turks_caicos_islands = "🇹🇨";
const chad = "🇹🇩";
const french_southern_territories = "🇹🇫";
const togo = "🇹🇬";
const thailand = "🇹🇭";
const tajikistan = "🇹🇯";
const tokelau = "🇹🇰";
const timor_leste = "🇹🇱";
const turkmenistan = "🇹🇲";
const tunisia = "🇹🇳";
const tonga = "🇹🇴";
const tr = "🇹🇷";
const trinidad_tobago = "🇹🇹";
const tuvalu = "🇹🇻";
const taiwan = "🇹🇼";
const tanzania = "🇹🇿";
const ukraine = "🇺🇦";
const uganda = "🇺🇬";
const us_outlying_islands = "🇺🇲";
const united_nations = "🇺🇳";
const us = "🇺🇸";
const uruguay = "🇺🇾";
const uzbekistan = "🇺🇿";
const vatican_city = "🇻🇦";
const st_vincent_grenadines = "🇻🇨";
const venezuela = "🇻🇪";
const british_virgin_islands = "🇻🇬";
const us_virgin_islands = "🇻🇮";
const vietnam = "🇻🇳";
const vanuatu = "🇻🇺";
const wallis_futuna = "🇼🇫";
const samoa = "🇼🇸";
const kosovo = "🇽🇰";
const yemen = "🇾🇪";
const mayotte = "🇾🇹";
const south_africa = "🇿🇦";
const zambia = "🇿🇲";
const zimbabwe = "🇿🇼";
const england = "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
const scotland = "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
const wales = "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
const require$$0 = {
  "100": "💯",
  "1234": "🔢",
  grinning,
  smiley,
  smile,
  grin,
  laughing,
  satisfied,
  sweat_smile,
  rofl,
  joy,
  slightly_smiling_face,
  upside_down_face,
  wink,
  blush,
  innocent,
  smiling_face_with_three_hearts,
  heart_eyes,
  star_struck,
  kissing_heart,
  kissing,
  relaxed,
  kissing_closed_eyes,
  kissing_smiling_eyes,
  smiling_face_with_tear,
  yum,
  stuck_out_tongue,
  stuck_out_tongue_winking_eye,
  zany_face,
  stuck_out_tongue_closed_eyes,
  money_mouth_face,
  hugs,
  hand_over_mouth,
  shushing_face,
  thinking,
  zipper_mouth_face,
  raised_eyebrow,
  neutral_face,
  expressionless,
  no_mouth,
  smirk,
  unamused,
  roll_eyes,
  grimacing,
  lying_face,
  relieved,
  pensive,
  sleepy,
  drooling_face,
  sleeping,
  mask,
  face_with_thermometer,
  face_with_head_bandage,
  nauseated_face,
  vomiting_face,
  sneezing_face,
  hot_face,
  cold_face,
  woozy_face,
  dizzy_face,
  exploding_head,
  cowboy_hat_face,
  partying_face,
  disguised_face,
  sunglasses,
  nerd_face,
  monocle_face,
  confused,
  worried,
  slightly_frowning_face,
  frowning_face,
  open_mouth,
  hushed,
  astonished,
  flushed,
  pleading_face,
  frowning,
  anguished,
  fearful,
  cold_sweat,
  disappointed_relieved,
  cry,
  sob,
  scream,
  confounded,
  persevere,
  disappointed,
  sweat,
  weary,
  tired_face,
  yawning_face,
  triumph,
  rage,
  pout,
  angry,
  cursing_face,
  smiling_imp,
  imp,
  skull,
  skull_and_crossbones,
  hankey,
  poop,
  shit,
  clown_face,
  japanese_ogre,
  japanese_goblin,
  ghost,
  alien,
  space_invader,
  robot,
  smiley_cat,
  smile_cat,
  joy_cat,
  heart_eyes_cat,
  smirk_cat,
  kissing_cat,
  scream_cat,
  crying_cat_face,
  pouting_cat,
  see_no_evil,
  hear_no_evil,
  speak_no_evil,
  kiss,
  love_letter,
  cupid,
  gift_heart,
  sparkling_heart,
  heartpulse,
  heartbeat,
  revolving_hearts,
  two_hearts,
  heart_decoration,
  heavy_heart_exclamation,
  broken_heart,
  heart,
  orange_heart,
  yellow_heart,
  green_heart,
  blue_heart,
  purple_heart,
  brown_heart,
  black_heart,
  white_heart,
  anger,
  boom,
  collision,
  dizzy,
  sweat_drops,
  dash,
  hole,
  bomb,
  speech_balloon,
  eye_speech_bubble,
  left_speech_bubble,
  right_anger_bubble,
  thought_balloon,
  zzz,
  wave,
  raised_back_of_hand,
  raised_hand_with_fingers_splayed,
  hand,
  raised_hand,
  vulcan_salute,
  ok_hand,
  pinched_fingers,
  pinching_hand,
  v,
  crossed_fingers,
  love_you_gesture,
  metal,
  call_me_hand,
  point_left,
  point_right,
  point_up_2,
  middle_finger,
  fu,
  point_down,
  point_up,
  "+1": "👍",
  thumbsup,
  "-1": "👎",
  thumbsdown,
  fist_raised,
  fist,
  fist_oncoming,
  facepunch,
  punch,
  fist_left,
  fist_right,
  clap,
  raised_hands,
  open_hands,
  palms_up_together,
  handshake,
  pray,
  writing_hand,
  nail_care,
  selfie,
  muscle,
  mechanical_arm,
  mechanical_leg,
  leg,
  foot,
  ear,
  ear_with_hearing_aid,
  nose,
  brain,
  anatomical_heart,
  lungs,
  tooth,
  bone,
  eyes,
  eye,
  tongue,
  lips,
  baby,
  child,
  boy,
  girl,
  adult,
  blond_haired_person,
  man,
  bearded_person,
  red_haired_man,
  curly_haired_man,
  white_haired_man,
  bald_man,
  woman,
  red_haired_woman,
  person_red_hair,
  curly_haired_woman,
  person_curly_hair,
  white_haired_woman,
  person_white_hair,
  bald_woman,
  person_bald,
  blond_haired_woman,
  blonde_woman,
  blond_haired_man,
  older_adult,
  older_man,
  older_woman,
  frowning_person,
  frowning_man,
  frowning_woman,
  pouting_face,
  pouting_man,
  pouting_woman,
  no_good,
  no_good_man,
  ng_man,
  no_good_woman,
  ng_woman,
  ok_person,
  ok_man,
  ok_woman,
  tipping_hand_person,
  information_desk_person,
  tipping_hand_man,
  sassy_man,
  tipping_hand_woman,
  sassy_woman,
  raising_hand,
  raising_hand_man,
  raising_hand_woman,
  deaf_person,
  deaf_man,
  deaf_woman,
  bow,
  bowing_man,
  bowing_woman,
  facepalm,
  man_facepalming,
  woman_facepalming,
  shrug,
  man_shrugging,
  woman_shrugging,
  health_worker,
  man_health_worker,
  woman_health_worker,
  student,
  man_student,
  woman_student,
  teacher,
  man_teacher,
  woman_teacher,
  judge,
  man_judge,
  woman_judge,
  farmer,
  man_farmer,
  woman_farmer,
  cook,
  man_cook,
  woman_cook,
  mechanic,
  man_mechanic,
  woman_mechanic,
  factory_worker,
  man_factory_worker,
  woman_factory_worker,
  office_worker,
  man_office_worker,
  woman_office_worker,
  scientist,
  man_scientist,
  woman_scientist,
  technologist,
  man_technologist,
  woman_technologist,
  singer,
  man_singer,
  woman_singer,
  artist,
  man_artist,
  woman_artist,
  pilot,
  man_pilot,
  woman_pilot,
  astronaut,
  man_astronaut,
  woman_astronaut,
  firefighter,
  man_firefighter,
  woman_firefighter,
  police_officer,
  cop,
  policeman,
  policewoman,
  detective,
  male_detective,
  female_detective,
  guard,
  guardsman,
  guardswoman,
  ninja,
  construction_worker,
  construction_worker_man,
  construction_worker_woman,
  prince,
  princess,
  person_with_turban,
  man_with_turban,
  woman_with_turban,
  man_with_gua_pi_mao,
  woman_with_headscarf,
  person_in_tuxedo,
  man_in_tuxedo,
  woman_in_tuxedo,
  person_with_veil,
  man_with_veil,
  woman_with_veil,
  bride_with_veil,
  pregnant_woman,
  breast_feeding,
  woman_feeding_baby,
  man_feeding_baby,
  person_feeding_baby,
  angel,
  santa,
  mrs_claus,
  mx_claus,
  superhero,
  superhero_man,
  superhero_woman,
  supervillain,
  supervillain_man,
  supervillain_woman,
  mage,
  mage_man,
  mage_woman,
  fairy,
  fairy_man,
  fairy_woman,
  vampire,
  vampire_man,
  vampire_woman,
  merperson,
  merman,
  mermaid,
  elf,
  elf_man,
  elf_woman,
  genie,
  genie_man,
  genie_woman,
  zombie,
  zombie_man,
  zombie_woman,
  massage,
  massage_man,
  massage_woman,
  haircut,
  haircut_man,
  haircut_woman,
  walking,
  walking_man,
  walking_woman,
  standing_person,
  standing_man,
  standing_woman,
  kneeling_person,
  kneeling_man,
  kneeling_woman,
  person_with_probing_cane,
  man_with_probing_cane,
  woman_with_probing_cane,
  person_in_motorized_wheelchair,
  man_in_motorized_wheelchair,
  woman_in_motorized_wheelchair,
  person_in_manual_wheelchair,
  man_in_manual_wheelchair,
  woman_in_manual_wheelchair,
  runner,
  running,
  running_man,
  running_woman,
  woman_dancing,
  dancer,
  man_dancing,
  business_suit_levitating,
  dancers,
  dancing_men,
  dancing_women,
  sauna_person,
  sauna_man,
  sauna_woman,
  climbing,
  climbing_man,
  climbing_woman,
  person_fencing,
  horse_racing,
  skier,
  snowboarder,
  golfing,
  golfing_man,
  golfing_woman,
  surfer,
  surfing_man,
  surfing_woman,
  rowboat,
  rowing_man,
  rowing_woman,
  swimmer,
  swimming_man,
  swimming_woman,
  bouncing_ball_person,
  bouncing_ball_man,
  basketball_man,
  bouncing_ball_woman,
  basketball_woman,
  weight_lifting,
  weight_lifting_man,
  weight_lifting_woman,
  bicyclist,
  biking_man,
  biking_woman,
  mountain_bicyclist,
  mountain_biking_man,
  mountain_biking_woman,
  cartwheeling,
  man_cartwheeling,
  woman_cartwheeling,
  wrestling,
  men_wrestling,
  women_wrestling,
  water_polo,
  man_playing_water_polo,
  woman_playing_water_polo,
  handball_person,
  man_playing_handball,
  woman_playing_handball,
  juggling_person,
  man_juggling,
  woman_juggling,
  lotus_position,
  lotus_position_man,
  lotus_position_woman,
  bath,
  sleeping_bed,
  people_holding_hands,
  two_women_holding_hands,
  couple,
  two_men_holding_hands,
  couplekiss,
  couplekiss_man_woman,
  couplekiss_man_man,
  couplekiss_woman_woman,
  couple_with_heart,
  couple_with_heart_woman_man,
  couple_with_heart_man_man,
  couple_with_heart_woman_woman,
  family,
  family_man_woman_boy,
  family_man_woman_girl,
  family_man_woman_girl_boy,
  family_man_woman_boy_boy,
  family_man_woman_girl_girl,
  family_man_man_boy,
  family_man_man_girl,
  family_man_man_girl_boy,
  family_man_man_boy_boy,
  family_man_man_girl_girl,
  family_woman_woman_boy,
  family_woman_woman_girl,
  family_woman_woman_girl_boy,
  family_woman_woman_boy_boy,
  family_woman_woman_girl_girl,
  family_man_boy,
  family_man_boy_boy,
  family_man_girl,
  family_man_girl_boy,
  family_man_girl_girl,
  family_woman_boy,
  family_woman_boy_boy,
  family_woman_girl,
  family_woman_girl_boy,
  family_woman_girl_girl,
  speaking_head,
  bust_in_silhouette,
  busts_in_silhouette,
  people_hugging,
  footprints,
  monkey_face,
  monkey,
  gorilla,
  orangutan,
  dog,
  dog2,
  guide_dog,
  service_dog,
  poodle,
  wolf,
  fox_face,
  raccoon,
  cat,
  cat2,
  black_cat,
  lion,
  tiger,
  tiger2,
  leopard,
  horse,
  racehorse,
  unicorn,
  zebra,
  deer,
  bison,
  cow,
  ox,
  water_buffalo,
  cow2,
  pig,
  pig2,
  boar,
  pig_nose,
  ram,
  sheep,
  goat,
  dromedary_camel,
  camel,
  llama,
  giraffe,
  elephant,
  mammoth,
  rhinoceros,
  hippopotamus,
  mouse,
  mouse2,
  rat,
  hamster,
  rabbit,
  rabbit2,
  chipmunk,
  beaver,
  hedgehog,
  bat,
  bear,
  polar_bear,
  koala,
  panda_face,
  sloth,
  otter,
  skunk,
  kangaroo,
  badger,
  feet,
  paw_prints,
  turkey,
  chicken,
  rooster,
  hatching_chick,
  baby_chick,
  hatched_chick,
  bird,
  penguin,
  dove,
  eagle,
  duck,
  swan,
  owl,
  dodo,
  feather,
  flamingo,
  peacock,
  parrot,
  frog,
  crocodile,
  turtle,
  lizard,
  snake,
  dragon_face,
  dragon,
  sauropod,
  "t-rex": "🦖",
  whale,
  whale2,
  dolphin,
  flipper,
  seal,
  fish,
  tropical_fish,
  blowfish,
  shark,
  octopus,
  shell: shell$1,
  snail,
  butterfly,
  bug,
  ant,
  bee,
  honeybee,
  beetle,
  lady_beetle,
  cricket,
  cockroach,
  spider,
  spider_web,
  scorpion,
  mosquito,
  fly,
  worm,
  microbe,
  bouquet,
  cherry_blossom,
  white_flower,
  rosette,
  rose,
  wilted_flower,
  hibiscus,
  sunflower,
  blossom,
  tulip,
  seedling,
  potted_plant,
  evergreen_tree,
  deciduous_tree,
  palm_tree,
  cactus,
  ear_of_rice,
  herb,
  shamrock,
  four_leaf_clover,
  maple_leaf,
  fallen_leaf,
  leaves,
  grapes,
  melon,
  watermelon,
  tangerine,
  orange,
  mandarin,
  lemon,
  banana,
  pineapple,
  mango,
  apple,
  green_apple,
  pear,
  peach,
  cherries,
  strawberry,
  blueberries,
  kiwi_fruit,
  tomato,
  olive,
  coconut,
  avocado,
  eggplant,
  potato,
  carrot,
  corn,
  hot_pepper,
  bell_pepper,
  cucumber,
  leafy_green,
  broccoli,
  garlic,
  onion,
  mushroom,
  peanuts,
  chestnut,
  bread,
  croissant,
  baguette_bread,
  flatbread,
  pretzel,
  bagel,
  pancakes,
  waffle,
  cheese,
  meat_on_bone,
  poultry_leg,
  cut_of_meat,
  bacon,
  hamburger,
  fries,
  pizza,
  hotdog,
  sandwich,
  taco,
  burrito,
  tamale,
  stuffed_flatbread,
  falafel,
  egg,
  fried_egg,
  shallow_pan_of_food,
  stew,
  fondue,
  bowl_with_spoon,
  green_salad,
  popcorn,
  butter,
  salt,
  canned_food,
  bento,
  rice_cracker,
  rice_ball,
  rice,
  curry,
  ramen,
  spaghetti,
  sweet_potato,
  oden,
  sushi,
  fried_shrimp,
  fish_cake,
  moon_cake,
  dango,
  dumpling,
  fortune_cookie,
  takeout_box,
  crab,
  lobster,
  shrimp,
  squid,
  oyster,
  icecream,
  shaved_ice,
  ice_cream,
  doughnut,
  cookie,
  birthday,
  cake,
  cupcake,
  pie,
  chocolate_bar,
  candy,
  lollipop,
  custard,
  honey_pot,
  baby_bottle,
  milk_glass,
  coffee,
  teapot,
  tea,
  sake,
  champagne,
  wine_glass,
  cocktail,
  tropical_drink,
  beer,
  beers,
  clinking_glasses,
  tumbler_glass,
  cup_with_straw,
  bubble_tea,
  beverage_box,
  mate,
  ice_cube,
  chopsticks,
  plate_with_cutlery,
  fork_and_knife,
  spoon,
  hocho,
  knife,
  amphora,
  earth_africa,
  earth_americas,
  earth_asia,
  globe_with_meridians,
  world_map,
  japan,
  compass,
  mountain_snow,
  mountain,
  volcano,
  mount_fuji,
  camping,
  beach_umbrella,
  desert,
  desert_island,
  national_park,
  stadium,
  classical_building,
  building_construction,
  bricks,
  rock,
  wood,
  hut,
  houses,
  derelict_house,
  house,
  house_with_garden,
  office,
  post_office,
  european_post_office,
  hospital,
  bank,
  hotel,
  love_hotel,
  convenience_store,
  school,
  department_store,
  factory,
  japanese_castle,
  european_castle,
  wedding,
  tokyo_tower,
  statue_of_liberty,
  church,
  mosque,
  hindu_temple,
  synagogue,
  shinto_shrine,
  kaaba,
  fountain,
  tent,
  foggy,
  night_with_stars,
  cityscape,
  sunrise_over_mountains,
  sunrise,
  city_sunset,
  city_sunrise,
  bridge_at_night,
  hotsprings,
  carousel_horse,
  ferris_wheel,
  roller_coaster,
  barber,
  circus_tent,
  steam_locomotive,
  railway_car,
  bullettrain_side,
  bullettrain_front,
  train2,
  metro,
  light_rail,
  station,
  tram,
  monorail,
  mountain_railway,
  train,
  bus,
  oncoming_bus,
  trolleybus,
  minibus,
  ambulance,
  fire_engine,
  police_car,
  oncoming_police_car,
  taxi,
  oncoming_taxi,
  car,
  red_car,
  oncoming_automobile,
  blue_car,
  pickup_truck,
  truck,
  articulated_lorry,
  tractor,
  racing_car,
  motorcycle,
  motor_scooter,
  manual_wheelchair,
  motorized_wheelchair,
  auto_rickshaw,
  bike,
  kick_scooter,
  skateboard,
  roller_skate,
  busstop,
  motorway,
  railway_track,
  oil_drum,
  fuelpump,
  rotating_light,
  traffic_light,
  vertical_traffic_light,
  stop_sign,
  construction,
  anchor,
  boat,
  sailboat,
  canoe,
  speedboat,
  passenger_ship,
  ferry,
  motor_boat,
  ship,
  airplane,
  small_airplane,
  flight_departure,
  flight_arrival,
  parachute,
  seat,
  helicopter,
  suspension_railway,
  mountain_cableway,
  aerial_tramway,
  artificial_satellite,
  rocket,
  flying_saucer,
  bellhop_bell,
  luggage,
  hourglass,
  hourglass_flowing_sand,
  watch,
  alarm_clock,
  stopwatch,
  timer_clock,
  mantelpiece_clock,
  clock12,
  clock1230,
  clock1,
  clock130,
  clock2,
  clock230,
  clock3,
  clock330,
  clock4,
  clock430,
  clock5,
  clock530,
  clock6,
  clock630,
  clock7,
  clock730,
  clock8,
  clock830,
  clock9,
  clock930,
  clock10,
  clock1030,
  clock11,
  clock1130,
  new_moon,
  waxing_crescent_moon,
  first_quarter_moon,
  moon,
  waxing_gibbous_moon,
  full_moon,
  waning_gibbous_moon,
  last_quarter_moon,
  waning_crescent_moon,
  crescent_moon,
  new_moon_with_face,
  first_quarter_moon_with_face,
  last_quarter_moon_with_face,
  thermometer,
  sunny,
  full_moon_with_face,
  sun_with_face,
  ringed_planet,
  star,
  star2,
  stars,
  milky_way,
  cloud,
  partly_sunny,
  cloud_with_lightning_and_rain,
  sun_behind_small_cloud,
  sun_behind_large_cloud,
  sun_behind_rain_cloud,
  cloud_with_rain,
  cloud_with_snow,
  cloud_with_lightning,
  tornado,
  fog,
  wind_face,
  cyclone,
  rainbow,
  closed_umbrella,
  open_umbrella,
  umbrella,
  parasol_on_ground,
  zap,
  snowflake,
  snowman_with_snow,
  snowman,
  comet,
  fire,
  droplet,
  ocean,
  jack_o_lantern,
  christmas_tree,
  fireworks,
  sparkler,
  firecracker,
  sparkles,
  balloon,
  tada,
  confetti_ball,
  tanabata_tree,
  bamboo,
  dolls,
  flags,
  wind_chime,
  rice_scene,
  red_envelope,
  ribbon,
  gift,
  reminder_ribbon,
  tickets,
  ticket,
  medal_military,
  trophy,
  medal_sports,
  "1st_place_medal": "🥇",
  "2nd_place_medal": "🥈",
  "3rd_place_medal": "🥉",
  soccer,
  baseball,
  softball,
  basketball,
  volleyball,
  football,
  rugby_football,
  tennis,
  flying_disc,
  bowling,
  cricket_game,
  field_hockey,
  ice_hockey,
  lacrosse,
  ping_pong,
  badminton,
  boxing_glove,
  martial_arts_uniform,
  goal_net,
  golf,
  ice_skate,
  fishing_pole_and_fish,
  diving_mask,
  running_shirt_with_sash,
  ski,
  sled,
  curling_stone,
  dart: dart$1,
  yo_yo,
  kite,
  "8ball": "🎱",
  crystal_ball,
  magic_wand,
  nazar_amulet,
  video_game,
  joystick,
  slot_machine,
  game_die,
  jigsaw,
  teddy_bear,
  pinata,
  nesting_dolls,
  spades,
  hearts,
  diamonds,
  clubs,
  chess_pawn,
  black_joker,
  mahjong,
  flower_playing_cards,
  performing_arts,
  framed_picture,
  art,
  thread,
  sewing_needle,
  yarn,
  knot,
  eyeglasses,
  dark_sunglasses,
  goggles,
  lab_coat,
  safety_vest,
  necktie,
  shirt,
  tshirt,
  jeans,
  scarf,
  gloves,
  coat,
  socks,
  dress,
  kimono,
  sari,
  one_piece_swimsuit,
  swim_brief,
  shorts,
  bikini,
  womans_clothes,
  purse,
  handbag,
  pouch,
  shopping,
  school_satchel,
  thong_sandal,
  mans_shoe,
  shoe,
  athletic_shoe,
  hiking_boot,
  flat_shoe,
  high_heel,
  sandal,
  ballet_shoes,
  boot,
  crown,
  womans_hat,
  tophat,
  mortar_board,
  billed_cap,
  military_helmet,
  rescue_worker_helmet,
  prayer_beads,
  lipstick,
  ring,
  gem,
  mute,
  speaker,
  sound,
  loud_sound,
  loudspeaker,
  mega,
  postal_horn,
  bell,
  no_bell,
  musical_score,
  musical_note,
  notes,
  studio_microphone,
  level_slider,
  control_knobs,
  microphone,
  headphones,
  radio,
  saxophone,
  accordion,
  guitar,
  musical_keyboard,
  trumpet,
  violin,
  banjo,
  drum,
  long_drum,
  iphone,
  calling,
  phone,
  telephone,
  telephone_receiver,
  pager,
  fax,
  battery,
  electric_plug,
  computer,
  desktop_computer,
  printer,
  keyboard,
  computer_mouse,
  trackball,
  minidisc,
  floppy_disk,
  cd,
  dvd,
  abacus,
  movie_camera,
  film_strip,
  film_projector,
  clapper,
  tv,
  camera,
  camera_flash,
  video_camera,
  vhs,
  mag,
  mag_right,
  candle,
  bulb,
  flashlight,
  izakaya_lantern,
  lantern,
  diya_lamp,
  notebook_with_decorative_cover,
  closed_book,
  book,
  open_book,
  green_book,
  blue_book,
  orange_book,
  books,
  notebook,
  ledger,
  page_with_curl,
  scroll,
  page_facing_up,
  newspaper,
  newspaper_roll,
  bookmark_tabs,
  bookmark,
  label,
  moneybag,
  coin,
  yen,
  dollar,
  euro,
  pound,
  money_with_wings,
  credit_card,
  receipt,
  chart,
  envelope,
  email,
  "e-mail": "📧",
  incoming_envelope,
  envelope_with_arrow,
  outbox_tray,
  inbox_tray,
  "package": "📦",
  mailbox,
  mailbox_closed,
  mailbox_with_mail,
  mailbox_with_no_mail,
  postbox,
  ballot_box,
  pencil2,
  black_nib,
  fountain_pen,
  pen,
  paintbrush,
  crayon,
  memo,
  pencil,
  briefcase,
  file_folder,
  open_file_folder,
  card_index_dividers,
  date,
  calendar,
  spiral_notepad,
  spiral_calendar,
  card_index,
  chart_with_upwards_trend,
  chart_with_downwards_trend,
  bar_chart,
  clipboard,
  pushpin,
  round_pushpin,
  paperclip,
  paperclips,
  straight_ruler,
  triangular_ruler,
  scissors,
  card_file_box,
  file_cabinet,
  wastebasket,
  lock,
  unlock,
  lock_with_ink_pen,
  closed_lock_with_key,
  key,
  old_key,
  hammer,
  axe,
  pick,
  hammer_and_pick,
  hammer_and_wrench,
  dagger,
  crossed_swords,
  gun,
  boomerang,
  bow_and_arrow,
  shield,
  carpentry_saw,
  wrench,
  screwdriver,
  nut_and_bolt,
  gear,
  clamp,
  balance_scale,
  probing_cane,
  link,
  chains,
  hook,
  toolbox,
  magnet,
  ladder,
  alembic,
  test_tube,
  petri_dish,
  dna,
  microscope,
  telescope,
  satellite,
  syringe,
  drop_of_blood,
  pill,
  adhesive_bandage,
  stethoscope,
  door,
  elevator,
  mirror,
  window: window$1,
  bed,
  couch_and_lamp,
  chair,
  toilet,
  plunger,
  shower,
  bathtub,
  mouse_trap,
  razor,
  lotion_bottle,
  safety_pin,
  broom,
  basket,
  roll_of_paper,
  bucket,
  soap,
  toothbrush,
  sponge,
  fire_extinguisher,
  shopping_cart,
  smoking,
  coffin,
  headstone,
  funeral_urn,
  moyai,
  placard,
  atm,
  put_litter_in_its_place,
  potable_water,
  wheelchair,
  mens,
  womens,
  restroom,
  baby_symbol,
  wc,
  passport_control,
  customs,
  baggage_claim,
  left_luggage,
  warning,
  children_crossing,
  no_entry,
  no_entry_sign,
  no_bicycles,
  no_smoking,
  do_not_litter,
  "non-potable_water": "🚱",
  no_pedestrians,
  no_mobile_phones,
  underage,
  radioactive,
  biohazard,
  arrow_up,
  arrow_upper_right,
  arrow_right,
  arrow_lower_right,
  arrow_down,
  arrow_lower_left,
  arrow_left,
  arrow_upper_left,
  arrow_up_down,
  left_right_arrow,
  leftwards_arrow_with_hook,
  arrow_right_hook,
  arrow_heading_up,
  arrow_heading_down,
  arrows_clockwise,
  arrows_counterclockwise,
  back,
  end,
  on,
  soon,
  top,
  place_of_worship,
  atom_symbol,
  om,
  star_of_david,
  wheel_of_dharma,
  yin_yang,
  latin_cross,
  orthodox_cross,
  star_and_crescent,
  peace_symbol,
  menorah,
  six_pointed_star,
  aries,
  taurus,
  gemini,
  cancer,
  leo,
  virgo,
  libra,
  scorpius,
  sagittarius,
  capricorn,
  aquarius,
  pisces,
  ophiuchus,
  twisted_rightwards_arrows,
  repeat: repeat$1,
  repeat_one,
  arrow_forward,
  fast_forward,
  next_track_button,
  play_or_pause_button,
  arrow_backward,
  rewind,
  previous_track_button,
  arrow_up_small,
  arrow_double_up,
  arrow_down_small,
  arrow_double_down,
  pause_button,
  stop_button,
  record_button,
  eject_button,
  cinema,
  low_brightness,
  high_brightness,
  signal_strength,
  vibration_mode,
  mobile_phone_off,
  female_sign,
  male_sign,
  transgender_symbol,
  heavy_multiplication_x,
  heavy_plus_sign,
  heavy_minus_sign,
  heavy_division_sign,
  infinity,
  bangbang,
  interrobang,
  question,
  grey_question,
  grey_exclamation,
  exclamation,
  heavy_exclamation_mark,
  wavy_dash,
  currency_exchange,
  heavy_dollar_sign,
  medical_symbol,
  recycle,
  fleur_de_lis,
  trident,
  name_badge,
  beginner,
  o: o$1,
  white_check_mark,
  ballot_box_with_check,
  heavy_check_mark,
  x,
  negative_squared_cross_mark,
  curly_loop,
  loop,
  part_alternation_mark,
  eight_spoked_asterisk,
  eight_pointed_black_star,
  sparkle,
  copyright,
  registered,
  tm,
  hash,
  asterisk,
  zero,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine,
  keycap_ten,
  capital_abcd,
  abcd,
  symbols,
  abc,
  a: a$1,
  ab,
  b,
  cl,
  cool,
  free,
  information_source,
  id,
  m,
  "new": "🆕",
  ng,
  o2,
  ok,
  parking,
  sos,
  up,
  vs,
  koko,
  sa,
  ideograph_advantage,
  accept,
  congratulations,
  secret,
  u6e80,
  red_circle,
  orange_circle,
  yellow_circle,
  green_circle,
  large_blue_circle,
  purple_circle,
  brown_circle,
  black_circle,
  white_circle,
  red_square,
  orange_square,
  yellow_square,
  green_square,
  blue_square,
  purple_square,
  brown_square,
  black_large_square,
  white_large_square,
  black_medium_square,
  white_medium_square,
  black_medium_small_square,
  white_medium_small_square,
  black_small_square,
  white_small_square,
  large_orange_diamond,
  large_blue_diamond,
  small_orange_diamond,
  small_blue_diamond,
  small_red_triangle,
  small_red_triangle_down,
  diamond_shape_with_a_dot_inside,
  radio_button,
  white_square_button,
  black_square_button,
  checkered_flag,
  triangular_flag_on_post,
  crossed_flags,
  black_flag,
  white_flag,
  rainbow_flag,
  transgender_flag,
  pirate_flag,
  ascension_island,
  andorra,
  united_arab_emirates,
  afghanistan,
  antigua_barbuda,
  anguilla,
  albania,
  armenia,
  angola,
  antarctica,
  argentina,
  american_samoa,
  austria,
  australia,
  aruba,
  aland_islands,
  azerbaijan,
  bosnia_herzegovina,
  barbados,
  bangladesh,
  belgium,
  burkina_faso,
  bulgaria,
  bahrain,
  burundi,
  benin,
  st_barthelemy,
  bermuda,
  brunei,
  bolivia,
  caribbean_netherlands,
  brazil,
  bahamas,
  bhutan,
  bouvet_island,
  botswana,
  belarus,
  belize,
  canada,
  cocos_islands,
  congo_kinshasa,
  central_african_republic,
  congo_brazzaville,
  switzerland,
  cote_divoire,
  cook_islands,
  chile,
  cameroon,
  cn,
  colombia,
  clipperton_island,
  costa_rica,
  cuba,
  cape_verde,
  curacao,
  christmas_island,
  cyprus,
  czech_republic,
  de,
  diego_garcia,
  djibouti,
  denmark,
  dominica,
  dominican_republic,
  algeria,
  ceuta_melilla,
  ecuador,
  estonia,
  egypt,
  western_sahara,
  eritrea,
  es,
  ethiopia,
  eu,
  european_union,
  finland,
  fiji,
  falkland_islands,
  micronesia,
  faroe_islands,
  fr,
  gabon,
  gb,
  uk,
  grenada,
  georgia,
  french_guiana,
  guernsey,
  ghana,
  gibraltar,
  greenland,
  gambia,
  guinea,
  guadeloupe,
  equatorial_guinea,
  greece,
  south_georgia_south_sandwich_islands,
  guatemala,
  guam,
  guinea_bissau,
  guyana,
  hong_kong,
  heard_mcdonald_islands,
  honduras,
  croatia,
  haiti,
  hungary,
  canary_islands,
  indonesia,
  ireland,
  israel,
  isle_of_man,
  india,
  british_indian_ocean_territory,
  iraq,
  iran,
  iceland,
  it,
  jersey,
  jamaica,
  jordan,
  jp,
  kenya,
  kyrgyzstan,
  cambodia,
  kiribati,
  comoros,
  st_kitts_nevis,
  north_korea,
  kr,
  kuwait,
  cayman_islands,
  kazakhstan,
  laos,
  lebanon,
  st_lucia,
  liechtenstein,
  sri_lanka,
  liberia,
  lesotho,
  lithuania,
  luxembourg,
  latvia,
  libya,
  morocco,
  monaco,
  moldova,
  montenegro,
  st_martin,
  madagascar,
  marshall_islands,
  macedonia,
  mali,
  myanmar,
  mongolia,
  macau,
  northern_mariana_islands,
  martinique,
  mauritania,
  montserrat,
  malta,
  mauritius,
  maldives,
  malawi,
  mexico,
  malaysia,
  mozambique,
  namibia,
  new_caledonia,
  niger,
  norfolk_island,
  nigeria,
  nicaragua,
  netherlands,
  norway,
  nepal,
  nauru,
  niue,
  new_zealand,
  oman,
  panama,
  peru,
  french_polynesia,
  papua_new_guinea,
  philippines,
  pakistan,
  poland,
  st_pierre_miquelon,
  pitcairn_islands,
  puerto_rico,
  palestinian_territories,
  portugal,
  palau,
  paraguay,
  qatar,
  reunion,
  romania,
  serbia,
  ru,
  rwanda,
  saudi_arabia,
  solomon_islands,
  seychelles,
  sudan,
  sweden,
  singapore,
  st_helena,
  slovenia,
  svalbard_jan_mayen,
  slovakia,
  sierra_leone,
  san_marino,
  senegal,
  somalia,
  suriname,
  south_sudan,
  sao_tome_principe,
  el_salvador,
  sint_maarten,
  syria,
  swaziland,
  tristan_da_cunha,
  turks_caicos_islands,
  chad,
  french_southern_territories,
  togo,
  thailand,
  tajikistan,
  tokelau,
  timor_leste,
  turkmenistan,
  tunisia,
  tonga,
  tr,
  trinidad_tobago,
  tuvalu,
  taiwan,
  tanzania,
  ukraine,
  uganda,
  us_outlying_islands,
  united_nations,
  us,
  uruguay,
  uzbekistan,
  vatican_city,
  st_vincent_grenadines,
  venezuela,
  british_virgin_islands,
  us_virgin_islands,
  vietnam,
  vanuatu,
  wallis_futuna,
  samoa,
  kosovo,
  yemen,
  mayotte,
  south_africa,
  zambia,
  zimbabwe,
  england,
  scotland,
  wales
};
var shortcuts = {
  angry: [">:(", ">:-("],
  blush: [':")', ':-")'],
  broken_heart: ["</3", "<\\3"],
  // :\ and :-\ not used because of conflict with markdown escaping
  confused: [":/", ":-/"],
  // twemoji shows question
  cry: [":'(", ":'-(", ":,(", ":,-("],
  frowning: [":(", ":-("],
  heart: ["<3"],
  imp: ["]:(", "]:-("],
  innocent: ["o:)", "O:)", "o:-)", "O:-)", "0:)", "0:-)"],
  joy: [":')", ":'-)", ":,)", ":,-)", ":'D", ":'-D", ":,D", ":,-D"],
  kissing: [":*", ":-*"],
  laughing: ["x-)", "X-)"],
  neutral_face: [":|", ":-|"],
  open_mouth: [":o", ":-o", ":O", ":-O"],
  rage: [":@", ":-@"],
  smile: [":D", ":-D"],
  smiley: [":)", ":-)"],
  smiling_imp: ["]:)", "]:-)"],
  sob: [":,'(", ":,'-(", ";(", ";-("],
  stuck_out_tongue: [":P", ":-P"],
  sunglasses: ["8-)", "B-)"],
  sweat: [",:(", ",:-("],
  sweat_smile: [",:)", ",:-)"],
  unamused: [":s", ":-S", ":z", ":-Z", ":$", ":-$"],
  wink: [";)", ";-)"]
};
var render$6 = function emoji_html(tokens, idx2) {
  return tokens[idx2].content;
};
var replace$2 = function create_rule(md2, emojies, shortcuts2, scanRE, replaceRE) {
  var arrayReplaceAt = md2.utils.arrayReplaceAt, ucm = md2.utils.lib.ucmicro, ZPCc = new RegExp([ucm.Z.source, ucm.P.source, ucm.Cc.source].join("|"));
  function splitTextToken(text2, level, Token) {
    var token, last_pos = 0, nodes = [];
    text2.replace(replaceRE, function(match, offset, src) {
      var emoji_name;
      if (shortcuts2.hasOwnProperty(match)) {
        emoji_name = shortcuts2[match];
        if (offset > 0 && !ZPCc.test(src[offset - 1])) {
          return;
        }
        if (offset + match.length < src.length && !ZPCc.test(src[offset + match.length])) {
          return;
        }
      } else {
        emoji_name = match.slice(1, -1);
      }
      if (offset > last_pos) {
        token = new Token("text", "", 0);
        token.content = text2.slice(last_pos, offset);
        nodes.push(token);
      }
      token = new Token("emoji", "", 0);
      token.markup = emoji_name;
      token.content = emojies[emoji_name];
      nodes.push(token);
      last_pos = offset + match.length;
    });
    if (last_pos < text2.length) {
      token = new Token("text", "", 0);
      token.content = text2.slice(last_pos);
      nodes.push(token);
    }
    return nodes;
  }
  return function emoji_replace2(state) {
    var i, j, l2, tokens, token, blockTokens = state.tokens, autolinkLevel = 0;
    for (j = 0, l2 = blockTokens.length; j < l2; j++) {
      if (blockTokens[j].type !== "inline") {
        continue;
      }
      tokens = blockTokens[j].children;
      for (i = tokens.length - 1; i >= 0; i--) {
        token = tokens[i];
        if (token.type === "link_open" || token.type === "link_close") {
          if (token.info === "auto") {
            autolinkLevel -= token.nesting;
          }
        }
        if (token.type === "text" && autolinkLevel === 0 && scanRE.test(token.content)) {
          blockTokens[j].children = tokens = arrayReplaceAt(
            tokens,
            i,
            splitTextToken(token.content, token.level, state.Token)
          );
        }
      }
    }
  };
};
function quoteRE(str2) {
  return str2.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}
var normalize_opts$1 = function normalize_opts(options) {
  var emojies = options.defs, shortcuts2;
  if (options.enabled.length) {
    emojies = Object.keys(emojies).reduce(function(acc, key2) {
      if (options.enabled.indexOf(key2) >= 0) {
        acc[key2] = emojies[key2];
      }
      return acc;
    }, {});
  }
  shortcuts2 = Object.keys(options.shortcuts).reduce(function(acc, key2) {
    if (!emojies[key2]) {
      return acc;
    }
    if (Array.isArray(options.shortcuts[key2])) {
      options.shortcuts[key2].forEach(function(alias) {
        acc[alias] = key2;
      });
      return acc;
    }
    acc[options.shortcuts[key2]] = key2;
    return acc;
  }, {});
  var keys = Object.keys(emojies), names;
  if (keys.length === 0) {
    names = "^$";
  } else {
    names = keys.map(function(name2) {
      return ":" + name2 + ":";
    }).concat(Object.keys(shortcuts2)).sort().reverse().map(function(name2) {
      return quoteRE(name2);
    }).join("|");
  }
  var scanRE = RegExp(names);
  var replaceRE = RegExp(names, "g");
  return {
    defs: emojies,
    shortcuts: shortcuts2,
    scanRE,
    replaceRE
  };
};
var emoji_html2 = render$6;
var emoji_replace = replace$2;
var normalize_opts2 = normalize_opts$1;
var bare = function emoji_plugin(md2, options) {
  var defaults = {
    defs: {},
    shortcuts: {},
    enabled: []
  };
  var opts = normalize_opts2(md2.utils.assign({}, defaults, options || {}));
  md2.renderer.rules.emoji = emoji_html2;
  md2.core.ruler.after(
    "linkify",
    "emoji",
    emoji_replace(md2, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE)
  );
};
var emojies_defs = require$$0;
var emojies_shortcuts = shortcuts;
var bare_emoji_plugin = bare;
var markdownItEmoji = function emoji_plugin2(md2, options) {
  var defaults = {
    defs: emojies_defs,
    shortcuts: emojies_shortcuts,
    enabled: []
  };
  var opts = md2.utils.assign({}, defaults, options || {});
  bare_emoji_plugin(md2, opts);
};
const emojiPlugin = /* @__PURE__ */ getDefaultExportFromCjs(markdownItEmoji);
var e$1 = false, n$1 = { false: "push", true: "unshift", after: "push", before: "unshift" }, t = { isPermalinkSymbol: true };
function r$1(r2, a2, i, l2) {
  var o3;
  if (!e$1) {
    var c2 = "Using deprecated markdown-it-anchor permalink option, see https://github.com/valeriangalliat/markdown-it-anchor#permalinks";
    "object" == typeof process && process && process.emitWarning ? process.emitWarning(c2) : console.warn(c2), e$1 = true;
  }
  var s2 = [Object.assign(new i.Token("link_open", "a", 1), { attrs: [].concat(a2.permalinkClass ? [["class", a2.permalinkClass]] : [], [["href", a2.permalinkHref(r2, i)]], Object.entries(a2.permalinkAttrs(r2, i))) }), Object.assign(new i.Token("html_block", "", 0), { content: a2.permalinkSymbol, meta: t }), new i.Token("link_close", "a", -1)];
  a2.permalinkSpace && i.tokens[l2 + 1].children[n$1[a2.permalinkBefore]](Object.assign(new i.Token("text", "", 0), { content: " " })), (o3 = i.tokens[l2 + 1].children)[n$1[a2.permalinkBefore]].apply(o3, s2);
}
function a(e2) {
  return "#" + e2;
}
function i$2(e2) {
  return {};
}
var l = { class: "header-anchor", symbol: "#", renderHref: a, renderAttrs: i$2 };
function o(e2) {
  function n2(t2) {
    return t2 = Object.assign({}, n2.defaults, t2), function(n3, r2, a2, i) {
      return e2(n3, t2, r2, a2, i);
    };
  }
  return n2.defaults = Object.assign({}, l), n2.renderPermalinkImpl = e2, n2;
}
var c$1 = o(function(e2, r2, a2, i, l2) {
  var o3, c2 = [Object.assign(new i.Token("link_open", "a", 1), { attrs: [].concat(r2.class ? [["class", r2.class]] : [], [["href", r2.renderHref(e2, i)]], r2.ariaHidden ? [["aria-hidden", "true"]] : [], Object.entries(r2.renderAttrs(e2, i))) }), Object.assign(new i.Token("html_inline", "", 0), { content: r2.symbol, meta: t }), new i.Token("link_close", "a", -1)];
  if (r2.space) {
    var s2 = "string" == typeof r2.space ? r2.space : " ";
    i.tokens[l2 + 1].children[n$1[r2.placement]](Object.assign(new i.Token("string" == typeof r2.space ? "html_inline" : "text", "", 0), { content: s2 }));
  }
  (o3 = i.tokens[l2 + 1].children)[n$1[r2.placement]].apply(o3, c2);
});
Object.assign(c$1.defaults, { space: true, placement: "after", ariaHidden: false });
var s = o(c$1.renderPermalinkImpl);
s.defaults = Object.assign({}, c$1.defaults, { ariaHidden: true });
var u = o(function(e2, n2, t2, r2, a2) {
  var i = [Object.assign(new r2.Token("link_open", "a", 1), { attrs: [].concat(n2.class ? [["class", n2.class]] : [], [["href", n2.renderHref(e2, r2)]], Object.entries(n2.renderAttrs(e2, r2))) })].concat(n2.safariReaderFix ? [new r2.Token("span_open", "span", 1)] : [], r2.tokens[a2 + 1].children, n2.safariReaderFix ? [new r2.Token("span_close", "span", -1)] : [], [new r2.Token("link_close", "a", -1)]);
  r2.tokens[a2 + 1] = Object.assign(new r2.Token("inline", "", 0), { children: i });
});
Object.assign(u.defaults, { safariReaderFix: false });
var d$1 = o(function(e2, r2, a2, i, l2) {
  var o3;
  if (!["visually-hidden", "aria-label", "aria-describedby", "aria-labelledby"].includes(r2.style))
    throw new Error("`permalink.linkAfterHeader` called with unknown style option `" + r2.style + "`");
  if (!["aria-describedby", "aria-labelledby"].includes(r2.style) && !r2.assistiveText)
    throw new Error("`permalink.linkAfterHeader` called without the `assistiveText` option in `" + r2.style + "` style");
  if ("visually-hidden" === r2.style && !r2.visuallyHiddenClass)
    throw new Error("`permalink.linkAfterHeader` called without the `visuallyHiddenClass` option in `visually-hidden` style");
  var c2 = i.tokens[l2 + 1].children.filter(function(e3) {
    return "text" === e3.type || "code_inline" === e3.type;
  }).reduce(function(e3, n2) {
    return e3 + n2.content;
  }, ""), s2 = [], u2 = [];
  if (r2.class && u2.push(["class", r2.class]), u2.push(["href", r2.renderHref(e2, i)]), u2.push.apply(u2, Object.entries(r2.renderAttrs(e2, i))), "visually-hidden" === r2.style) {
    if (s2.push(Object.assign(new i.Token("span_open", "span", 1), { attrs: [["class", r2.visuallyHiddenClass]] }), Object.assign(new i.Token("text", "", 0), { content: r2.assistiveText(c2) }), new i.Token("span_close", "span", -1)), r2.space) {
      var d2 = "string" == typeof r2.space ? r2.space : " ";
      s2[n$1[r2.placement]](Object.assign(new i.Token("string" == typeof r2.space ? "html_inline" : "text", "", 0), { content: d2 }));
    }
    s2[n$1[r2.placement]](Object.assign(new i.Token("span_open", "span", 1), { attrs: [["aria-hidden", "true"]] }), Object.assign(new i.Token("html_inline", "", 0), { content: r2.symbol, meta: t }), new i.Token("span_close", "span", -1));
  } else
    s2.push(Object.assign(new i.Token("html_inline", "", 0), { content: r2.symbol, meta: t }));
  "aria-label" === r2.style ? u2.push(["aria-label", r2.assistiveText(c2)]) : ["aria-describedby", "aria-labelledby"].includes(r2.style) && u2.push([r2.style, e2]);
  var f2 = [Object.assign(new i.Token("link_open", "a", 1), { attrs: u2 })].concat(s2, [new i.Token("link_close", "a", -1)]);
  (o3 = i.tokens).splice.apply(o3, [l2 + 3, 0].concat(f2)), r2.wrapper && (i.tokens.splice(l2, 0, Object.assign(new i.Token("html_block", "", 0), { content: r2.wrapper[0] + "\n" })), i.tokens.splice(l2 + 3 + f2.length + 1, 0, Object.assign(new i.Token("html_block", "", 0), { content: r2.wrapper[1] + "\n" })));
});
function f(e2, n2, t2, r2) {
  var a2 = e2, i = r2;
  if (t2 && Object.prototype.hasOwnProperty.call(n2, a2))
    throw new Error("User defined `id` attribute `" + e2 + "` is not unique. Please fix it in your Markdown to continue.");
  for (; Object.prototype.hasOwnProperty.call(n2, a2); )
    a2 = e2 + "-" + i, i += 1;
  return n2[a2] = true, a2;
}
function p(e2, n2) {
  n2 = Object.assign({}, p.defaults, n2), e2.core.ruler.push("anchor", function(e3) {
    for (var t2, a2 = {}, i = e3.tokens, l2 = Array.isArray(n2.level) ? (t2 = n2.level, function(e4) {
      return t2.includes(e4);
    }) : function(e4) {
      return function(n3) {
        return n3 >= e4;
      };
    }(n2.level), o3 = 0; o3 < i.length; o3++) {
      var c2 = i[o3];
      if ("heading_open" === c2.type && l2(Number(c2.tag.substr(1)))) {
        var s2 = n2.getTokensText(i[o3 + 1].children), u2 = c2.attrGet("id");
        u2 = null == u2 ? f(n2.slugify(s2), a2, false, n2.uniqueSlugStartIndex) : f(u2, a2, true, n2.uniqueSlugStartIndex), c2.attrSet("id", u2), false !== n2.tabIndex && c2.attrSet("tabindex", "" + n2.tabIndex), "function" == typeof n2.permalink ? n2.permalink(u2, n2, e3, o3) : (n2.permalink || n2.renderPermalink && n2.renderPermalink !== r$1) && n2.renderPermalink(u2, n2, e3, o3), o3 = i.indexOf(c2), n2.callback && n2.callback(c2, { slug: u2, title: s2 });
      }
    }
  });
}
Object.assign(d$1.defaults, { style: "visually-hidden", space: true, placement: "after", wrapper: null }), p.permalink = { __proto__: null, legacy: r$1, renderHref: a, renderAttrs: i$2, makePermalink: o, linkInsideHeader: c$1, ariaHidden: s, headerLink: u, linkAfterHeader: d$1 }, p.defaults = { level: 1, slugify: function(e2) {
  return encodeURIComponent(String(e2).trim().toLowerCase().replace(/\s+/g, "-"));
}, uniqueSlugStartIndex: 1, tabIndex: "-1", getTokensText: function(e2) {
  return e2.filter(function(e3) {
    return ["text", "code_inline"].includes(e3.type);
  }).map(function(e3) {
    return e3.content;
  }).join("");
}, permalink: false, renderPermalink: r$1, permalinkClass: s.defaults.class, permalinkSpace: s.defaults.space, permalinkSymbol: "¶", permalinkBefore: "before" === s.defaults.placement, permalinkHref: s.defaults.renderHref, permalinkAttrs: s.defaults.renderAttrs }, p.default = p;
function e(e2) {
  return encodeURIComponent(String(e2).trim().toLowerCase().replace(/\s+/g, "-"));
}
function n(e2) {
  return String(e2).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function markdownToc(r2, t2) {
  var l2;
  t2 = Object.assign({}, { placeholder: "(\\$\\{toc\\}|\\[\\[?_?toc_?\\]?\\]|\\$\\<toc(\\{[^}]*\\})\\>)", slugify: e, uniqueSlugStartIndex: 1, containerClass: "table-of-contents", containerId: void 0, listClass: void 0, itemClass: void 0, linkClass: void 0, level: 1, listType: "ol", format: void 0, callback: void 0 }, t2);
  var i = new RegExp("^" + t2.placeholder + "$", "i");
  r2.renderer.rules.tocOpen = function(e2, r3) {
    var l3 = Object.assign({}, t2);
    return e2 && r3 >= 0 && (l3 = Object.assign(l3, e2[r3].inlineOptions)), "<nav" + (l3.containerId ? ' id="' + n(l3.containerId) + '"' : "") + ' class="' + n(l3.containerClass) + '">';
  }, r2.renderer.rules.tocClose = function() {
    return "</nav>";
  }, r2.renderer.rules.tocBody = function(e2, r3) {
    var i2 = Object.assign({}, t2);
    e2 && r3 >= 0 && (i2 = Object.assign(i2, e2[r3].inlineOptions));
    var s2, a2 = {}, c2 = Array.isArray(i2.level) ? (s2 = i2.level, function(e3) {
      return s2.includes(e3);
    }) : function(e3) {
      return function(n2) {
        return n2 >= e3;
      };
    }(i2.level);
    return function e3(r4) {
      var l3 = i2.listClass ? ' class="' + n(i2.listClass) + '"' : "", s3 = i2.itemClass ? ' class="' + n(i2.itemClass) + '"' : "", o3 = i2.linkClass ? ' class="' + n(i2.linkClass) + '"' : "";
      if (0 === r4.c.length)
        return "";
      var u2 = "";
      return (0 === r4.l || c2(r4.l)) && (u2 += "<" + (n(i2.listType) + l3) + ">"), r4.c.forEach(function(r5) {
        c2(r5.l) ? u2 += "<li" + s3 + "><a" + o3 + ' href="#' + function(e4) {
          for (var n2 = e4, r6 = i2.uniqueSlugStartIndex; Object.prototype.hasOwnProperty.call(a2, n2); )
            n2 = e4 + "-" + r6++;
          return a2[n2] = true, n2;
        }(t2.slugify(r5.n)) + '">' + ("function" == typeof i2.format ? i2.format(r5.n, n) : n(r5.n)) + "</a>" + e3(r5) + "</li>" : u2 += e3(r5);
      }), (0 === r4.l || c2(r4.l)) && (u2 += "</" + n(i2.listType) + ">"), u2;
    }(l2);
  }, r2.core.ruler.push("generateTocAst", function(e2) {
    l2 = function(e3) {
      for (var n2 = { l: 0, n: "", c: [] }, r3 = [n2], t3 = 0, l3 = e3.length; t3 < l3; t3++) {
        var i2 = e3[t3];
        if ("heading_open" === i2.type) {
          var s2 = e3[t3 + 1].children.filter(function(e4) {
            return "text" === e4.type || "code_inline" === e4.type;
          }).reduce(function(e4, n3) {
            return e4 + n3.content;
          }, ""), a2 = { l: parseInt(i2.tag.substr(1), 10), n: s2, c: [] };
          if (a2.l > r3[0].l)
            r3[0].c.push(a2), r3.unshift(a2);
          else if (a2.l === r3[0].l)
            r3[1].c.push(a2), r3[0] = a2;
          else {
            for (; a2.l <= r3[0].l; )
              r3.shift();
            r3[0].c.push(a2), r3.unshift(a2);
          }
        }
      }
      return n2;
    }(e2.tokens), "function" == typeof t2.callback && t2.callback(r2.renderer.rules.tocOpen() + r2.renderer.rules.tocBody() + r2.renderer.rules.tocClose(), l2);
  }), r2.block.ruler.before("heading", "toc", function(e2, n2, r3, t3) {
    var l3, s2 = e2.src.slice(e2.bMarks[n2] + e2.tShift[n2], e2.eMarks[n2]).split(" ")[0];
    if (!i.test(s2))
      return false;
    if (t3)
      return true;
    var a2 = i.exec(s2), c2 = {};
    if (null !== a2 && 3 === a2.length)
      try {
        c2 = JSON.parse(a2[2]);
      } catch (e3) {
      }
    return e2.line = n2 + 1, (l3 = e2.push("tocOpen", "nav", 1)).markup = "", l3.map = [n2, e2.line], l3.inlineOptions = c2, (l3 = e2.push("tocBody", "", 0)).markup = "", l3.map = [n2, e2.line], l3.inlineOptions = c2, l3.children = [], (l3 = e2.push("tocClose", "nav", -1)).markup = "", true;
  }, { alt: ["paragraph", "reference", "blockquote"] });
}
var markdownItContainer = function container_plugin(md2, name2, options) {
  function validateDefault(params) {
    return params.trim().split(" ", 2)[0] === name2;
  }
  function renderDefault(tokens, idx2, _options, env, slf) {
    if (tokens[idx2].nesting === 1) {
      tokens[idx2].attrJoin("class", name2);
    }
    return slf.renderToken(tokens, idx2, _options, env, slf);
  }
  options = options || {};
  var min_markers = 3, marker_str = options.marker || ":", marker_char = marker_str.charCodeAt(0), marker_len = marker_str.length, validate = options.validate || validateDefault, render2 = options.render || renderDefault;
  function container(state, startLine, endLine, silent) {
    var pos, nextLine, marker_count, markup, params, token, old_parent, old_line_max, auto_closed = false, start = state.bMarks[startLine] + state.tShift[startLine], max2 = state.eMarks[startLine];
    if (marker_char !== state.src.charCodeAt(start)) {
      return false;
    }
    for (pos = start + 1; pos <= max2; pos++) {
      if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
        break;
      }
    }
    marker_count = Math.floor((pos - start) / marker_len);
    if (marker_count < min_markers) {
      return false;
    }
    pos -= (pos - start) % marker_len;
    markup = state.src.slice(start, pos);
    params = state.src.slice(pos, max2);
    if (!validate(params, markup)) {
      return false;
    }
    if (silent) {
      return true;
    }
    nextLine = startLine;
    for (; ; ) {
      nextLine++;
      if (nextLine >= endLine) {
        break;
      }
      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max2 = state.eMarks[nextLine];
      if (start < max2 && state.sCount[nextLine] < state.blkIndent) {
        break;
      }
      if (marker_char !== state.src.charCodeAt(start)) {
        continue;
      }
      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        continue;
      }
      for (pos = start + 1; pos <= max2; pos++) {
        if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
          break;
        }
      }
      if (Math.floor((pos - start) / marker_len) < marker_count) {
        continue;
      }
      pos -= (pos - start) % marker_len;
      pos = state.skipSpaces(pos);
      if (pos < max2) {
        continue;
      }
      auto_closed = true;
      break;
    }
    old_parent = state.parentType;
    old_line_max = state.lineMax;
    state.parentType = "container";
    state.lineMax = nextLine;
    token = state.push("container_" + name2 + "_open", "div", 1);
    token.markup = markup;
    token.block = true;
    token.info = params;
    token.map = [startLine, nextLine];
    state.md.block.tokenize(state, startLine + 1, nextLine);
    token = state.push("container_" + name2 + "_close", "div", -1);
    token.markup = state.src.slice(start, pos);
    token.block = true;
    state.parentType = old_parent;
    state.lineMax = old_line_max;
    state.line = nextLine + (auto_closed ? 1 : 0);
    return true;
  }
  md2.block.ruler.before("fence", "container_" + name2, container, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  });
  md2.renderer.rules["container_" + name2 + "_open"] = render2;
  md2.renderer.rules["container_" + name2 + "_close"] = render2;
};
const mdItContainer = /* @__PURE__ */ getDefaultExportFromCjs(markdownItContainer);
function getAdaptiveThemeMarker(options) {
  return options.hasSingleTheme ? "" : " vp-adaptive-theme";
}
function extractTitle(info, html = false) {
  if (html) {
    info = info.replace(/<!--[^]*?-->/g, "");
    const result2 = info.match(/data-title="(.*?)"/);
    return result2[1] || "";
  }
  const result = info.match(/\[(.*)\]/);
  return result[1] || extractLang(info) || "txt";
}
function extractLang(info) {
  return info.trim().replace(/:(no-)?line-numbers({| |$).*/, "").replace(/(-vue|{| ).*$/, "").replace(/^vue-html$/, "template");
}
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
function uuid$3(prefix = "") {
  const uuid2 = new Array(36);
  let rnd = 0, r2;
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid2[i] = "-";
    } else if (i === 14) {
      uuid2[i] = "4";
    } else {
      if (rnd <= 2)
        rnd = 33554432 + Math.random() * 16777216 | 0;
      r2 = rnd & 15;
      rnd = rnd >> 4;
      uuid2[i] = CHARS[i === 19 ? r2 & 3 | 8 : r2];
    }
  }
  return prefix + "" + uuid2.join("");
}
const containerPlugin = (md2, options) => {
  md2.use(...createContainer("tip", "TIP", md2)).use(...createContainer("info", "INFO", md2)).use(...createContainer("warning", "WARNING", md2)).use(...createContainer("danger", "DANGER", md2)).use(...createContainer("details", "Details", md2)).use(mdItContainer, "v-pre", {
    render: (tokens, idx2) => tokens[idx2].nesting === 1 ? "<div v-pre>\n" : "</div>\n"
  }).use(mdItContainer, "raw", {
    render: (tokens, idx2) => tokens[idx2].nesting === 1 ? '<div class="vp-raw">\n' : "</div>\n"
  }).use(...createCodeGroup(options));
};
function createContainer(klass, defaultTitle, md2) {
  return [
    mdItContainer,
    klass,
    {
      render(tokens, idx2) {
        const token = tokens[idx2];
        const info = token.info.trim().slice(klass.length).trim();
        if (token.nesting === 1) {
          const title = md2.renderInline(info || defaultTitle);
          if (klass === "details") {
            return `<details class="${klass} custom-block"><summary>${title}</summary>
`;
          }
          return `<div class="${klass} custom-block"><p class="custom-block-title">${title}</p>
`;
        } else {
          return klass === "details" ? "</details>\n" : "</div>\n";
        }
      }
    }
  ];
}
function createCodeGroup(options) {
  return [
    mdItContainer,
    "code-group",
    {
      render(tokens, idx2) {
        if (tokens[idx2].nesting === 1) {
          const name2 = uuid$3();
          let tabs = "";
          let checked = 'checked="checked"';
          for (let i = idx2 + 1; !(tokens[i].nesting === -1 && tokens[i].type === "container_code-group_close"); ++i) {
            const isHtml = tokens[i].type === "html_block";
            if (tokens[i].type === "fence" && tokens[i].tag === "code" || isHtml) {
              const title = extractTitle(
                isHtml ? tokens[i].content : tokens[i].info,
                isHtml
              );
              if (title) {
                const id2 = uuid$3(7);
                tabs += `<input type="radio" name="group-${name2}" id="tab-${id2}" ${checked}><label for="tab-${id2}">${title}</label>`;
                if (checked && !isHtml)
                  tokens[i].info += ` ${ACTIVE_CLASS}`;
                checked = "";
              }
            }
          }
          return `<div class="vp-code-group${getAdaptiveThemeMarker(
            options
          )}"><div class="tabs">${tabs}</div><div class="blocks">
`;
        }
        return "</div></div>\n";
      }
    }
  ];
}
const pluginKeyword$3 = "katex";
const tokenTypeInline$3 = "inline";
const ttContainerOpen$3 = "container_" + pluginKeyword$3 + "_open";
const ttContainerClose$3 = "container_" + pluginKeyword$3 + "_close";
function katexPlugin(md2, config2) {
  md2.use(mdItContainer, pluginKeyword$3, {
    anyClass: true,
    validate: (info) => {
      return info.trim() === pluginKeyword$3;
    },
    render: (tokens, idx2) => {
      const token = tokens[idx2];
      var src = "";
      if (token.type === ttContainerOpen$3) {
        for (var i = idx2 + 1; i < tokens.length; i++) {
          const value = tokens[i];
          if (value === void 0 || value.type === ttContainerClose$3) {
            break;
          }
          src += value.content;
          if (value.block && value.nesting <= 0) {
            src += "\n";
          }
          value.tag = "";
          value.type = tokenTypeInline$3;
          value.children = [];
        }
      }
      if (token.nesting === 1) {
        return `${render$5(src)}`;
      } else {
        return "";
      }
    }
  });
  return md2;
}
function render$5(code2) {
  const html = katex$1.renderToString(code2, {
    throwOnError: false
  });
  return `
     <div class="katex-container">

     ${html}

     </div>
   `;
}
const ketexRender = (code2) => {
  const html = katex$1.renderToString(code2, {
    throwOnError: false
  });
  return html;
};
const pluginKeyword$2 = "mermaid";
const tokenTypeInline$2 = "inline";
const ttContainerOpen$2 = "container_" + pluginKeyword$2 + "_open";
const ttContainerClose$2 = "container_" + pluginKeyword$2 + "_close";
function mermaidPlugin(md2, config2) {
  md2.use(mdItContainer, pluginKeyword$2, {
    anyClass: true,
    validate: (info) => {
      return info.trim() === pluginKeyword$2;
    },
    render: (tokens, idx2) => {
      const token = tokens[idx2];
      var src = "";
      if (token.type === ttContainerOpen$2) {
        for (var i = idx2 + 1; i < tokens.length; i++) {
          const value = tokens[i];
          if (value === void 0 || value.type === ttContainerClose$2) {
            break;
          }
          src += value.content;
          if (value.block && value.nesting <= 0) {
            src += "\n";
          }
          value.tag = "";
          value.type = tokenTypeInline$2;
          value.children = [];
        }
      }
      if (token.nesting === 1) {
        return `<div class="${pluginKeyword$2}-container">${render$4(preProcess(src))}`;
      } else {
        return "</div>";
      }
    }
  });
  return md2;
}
function render$4(code2) {
  return `
   <div class="mermaid">
     ${code2}
   </div>
   `;
}
const mermaidRender = render$4;
function preProcess(source2) {
  return source2.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\n+$/, "").trimStart();
}
const pluginKeyword$1 = "swiper";
const tokenTypeInline$1 = "inline";
const ttContainerOpen$1 = "container_" + pluginKeyword$1 + "_open";
const ttContainerClose$1 = "container_" + pluginKeyword$1 + "_close";
function swiperPlugin(md2, config2) {
  md2.use(mdItContainer, pluginKeyword$1, {
    anyClass: true,
    validate: (info) => {
      return info.trim() === pluginKeyword$1;
    },
    render: (tokens, idx2) => {
      const token = tokens[idx2];
      var src = "";
      if (token.type === ttContainerOpen$1) {
        for (var i = idx2 + 1; i < tokens.length; i++) {
          const value = tokens[i];
          if (value === void 0 || value.type === ttContainerClose$1) {
            break;
          }
          src += value.content;
          if (value.block && value.nesting <= 0) {
            src += "\n";
          }
          value.tag = "";
          value.type = tokenTypeInline$1;
          value.children = [];
        }
      }
      if (token.nesting === 1) {
        return `${render$3(src)}`;
      } else {
        return "";
      }
    }
  });
  return md2;
}
function render$3(code2) {
  return code2;
}
var katex = katex$1;
function isValidDelim(state, pos) {
  var prevChar, nextChar, max2 = state.posMax, can_open = true, can_close = true;
  prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
  nextChar = pos + 1 <= max2 ? state.src.charCodeAt(pos + 1) : -1;
  if (prevChar === 32 || prevChar === 9 || nextChar >= 48 && nextChar <= 57) {
    can_close = false;
  }
  if (nextChar === 32 || nextChar === 9) {
    can_open = false;
  }
  return {
    can_open,
    can_close
  };
}
function math_inline(state, silent) {
  var start, match, token, res, pos;
  if (state.src[state.pos] !== "$") {
    return false;
  }
  res = isValidDelim(state, state.pos);
  if (!res.can_open) {
    if (!silent) {
      state.pending += "$";
    }
    state.pos += 1;
    return true;
  }
  start = state.pos + 1;
  match = start;
  while ((match = state.src.indexOf("$", match)) !== -1) {
    pos = match - 1;
    while (state.src[pos] === "\\") {
      pos -= 1;
    }
    if ((match - pos) % 2 == 1) {
      break;
    }
    match += 1;
  }
  if (match === -1) {
    if (!silent) {
      state.pending += "$";
    }
    state.pos = start;
    return true;
  }
  if (match - start === 0) {
    if (!silent) {
      state.pending += "$$";
    }
    state.pos = start + 1;
    return true;
  }
  res = isValidDelim(state, match);
  if (!res.can_close) {
    if (!silent) {
      state.pending += "$";
    }
    state.pos = start;
    return true;
  }
  if (!silent) {
    token = state.push("math_inline", "math", 0);
    token.markup = "$";
    token.content = state.src.slice(start, match);
  }
  state.pos = match + 1;
  return true;
}
function math_block(state, start, end2, silent) {
  var firstLine, lastLine, next, lastPos, found = false, token, pos = state.bMarks[start] + state.tShift[start], max2 = state.eMarks[start];
  if (pos + 2 > max2) {
    return false;
  }
  if (state.src.slice(pos, pos + 2) !== "$$") {
    return false;
  }
  pos += 2;
  firstLine = state.src.slice(pos, max2);
  if (silent) {
    return true;
  }
  if (firstLine.trim().slice(-2) === "$$") {
    firstLine = firstLine.trim().slice(0, -2);
    found = true;
  }
  for (next = start; !found; ) {
    next++;
    if (next >= end2) {
      break;
    }
    pos = state.bMarks[next] + state.tShift[next];
    max2 = state.eMarks[next];
    if (pos < max2 && state.tShift[next] < state.blkIndent) {
      break;
    }
    if (state.src.slice(pos, max2).trim().slice(-2) === "$$") {
      lastPos = state.src.slice(0, max2).lastIndexOf("$$");
      lastLine = state.src.slice(pos, lastPos);
      found = true;
    }
  }
  state.line = next + 1;
  token = state.push("math_block", "math", 0);
  token.block = true;
  token.content = (firstLine && firstLine.trim() ? firstLine + "\n" : "") + state.getLines(start + 1, next, state.tShift[start], true) + (lastLine && lastLine.trim() ? lastLine : "");
  token.map = [start, state.line];
  token.markup = "$$";
  return true;
}
var markdownItKatex = function math_plugin(md2, options) {
  options = options || {};
  var katexInline = function(latex2) {
    options.displayMode = false;
    try {
      return katex.renderToString(latex2, options);
    } catch (error2) {
      if (options.throwOnError) {
        console.log(error2);
      }
      return latex2;
    }
  };
  var inlineRenderer = function(tokens, idx2) {
    return katexInline(tokens[idx2].content);
  };
  var katexBlock = function(latex2) {
    options.displayMode = true;
    try {
      return "<p>" + katex.renderToString(latex2, options) + "</p>";
    } catch (error2) {
      if (options.throwOnError) {
        console.log(error2);
      }
      return latex2;
    }
  };
  var blockRenderer = function(tokens, idx2) {
    return katexBlock(tokens[idx2].content) + "\n";
  };
  md2.inline.ruler.after("escape", "math_inline", math_inline);
  md2.block.ruler.after("blockquote", "math_block", math_block, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  });
  md2.renderer.rules.math_inline = inlineRenderer;
  md2.renderer.rules.math_block = blockRenderer;
};
const mkkatex = /* @__PURE__ */ getDefaultExportFromCjs(markdownItKatex);
var disableCheckboxes = true;
var useLabelWrapper = false;
var useLabelAfter = false;
var markdownItTaskLists = function(md2, options) {
  if (options) {
    disableCheckboxes = !options.enabled;
    useLabelWrapper = !!options.label;
    useLabelAfter = !!options.labelAfter;
  }
  md2.core.ruler.after("inline", "github-task-lists", function(state) {
    var tokens = state.tokens;
    for (var i = 2; i < tokens.length; i++) {
      if (isTodoItem(tokens, i)) {
        todoify(tokens[i], state.Token);
        attrSet(tokens[i - 2], "class", "task-list-item" + (!disableCheckboxes ? " enabled" : ""));
        attrSet(tokens[parentToken(tokens, i - 2)], "class", "contains-task-list");
      }
    }
  });
};
function attrSet(token, name2, value) {
  var index = token.attrIndex(name2);
  var attr = [name2, value];
  if (index < 0) {
    token.attrPush(attr);
  } else {
    token.attrs[index] = attr;
  }
}
function parentToken(tokens, index) {
  var targetLevel = tokens[index].level - 1;
  for (var i = index - 1; i >= 0; i--) {
    if (tokens[i].level === targetLevel) {
      return i;
    }
  }
  return -1;
}
function isTodoItem(tokens, index) {
  return isInline(tokens[index]) && isParagraph(tokens[index - 1]) && isListItem(tokens[index - 2]) && startsWithTodoMarkdown(tokens[index]);
}
function todoify(token, TokenConstructor) {
  token.children.unshift(makeCheckbox(token, TokenConstructor));
  token.children[1].content = token.children[1].content.slice(3);
  token.content = token.content.slice(3);
  if (useLabelWrapper) {
    if (useLabelAfter) {
      token.children.pop();
      var id2 = "task-item-" + Math.ceil(Math.random() * (1e4 * 1e3) - 1e3);
      token.children[0].content = token.children[0].content.slice(0, -1) + ' id="' + id2 + '">';
      token.children.push(afterLabel(token.content, id2, TokenConstructor));
    } else {
      token.children.unshift(beginLabel(TokenConstructor));
      token.children.push(endLabel(TokenConstructor));
    }
  }
}
function makeCheckbox(token, TokenConstructor) {
  var checkbox = new TokenConstructor("html_inline", "", 0);
  var disabledAttr = disableCheckboxes ? ' disabled="" ' : "";
  if (token.content.indexOf("[ ] ") === 0) {
    checkbox.content = '<input class="task-list-item-checkbox"' + disabledAttr + 'type="checkbox">';
  } else if (token.content.indexOf("[x] ") === 0 || token.content.indexOf("[X] ") === 0) {
    checkbox.content = '<input class="task-list-item-checkbox" checked=""' + disabledAttr + 'type="checkbox">';
  }
  return checkbox;
}
function beginLabel(TokenConstructor) {
  var token = new TokenConstructor("html_inline", "", 0);
  token.content = "<label>";
  return token;
}
function endLabel(TokenConstructor) {
  var token = new TokenConstructor("html_inline", "", 0);
  token.content = "</label>";
  return token;
}
function afterLabel(content, id2, TokenConstructor) {
  var token = new TokenConstructor("html_inline", "", 0);
  token.content = '<label class="task-list-item-label" for="' + id2 + '">' + content + "</label>";
  token.attrs = [{ for: id2 }];
  return token;
}
function isInline(token) {
  return token.type === "inline";
}
function isParagraph(token) {
  return token.type === "paragraph_open";
}
function isListItem(token) {
  return token.type === "list_item_open";
}
function startsWithTodoMarkdown(token) {
  return token.content.indexOf("[ ] ") === 0 || token.content.indexOf("[x] ") === 0 || token.content.indexOf("[X] ") === 0;
}
const taskLists = /* @__PURE__ */ getDefaultExportFromCjs(markdownItTaskLists);
const TAG$1 = "qrcode:";
const RQCODE$1 = "qrcode";
function inline$2(state, startLine, endLine) {
  const pos = state.bMarks[startLine] + state.tShift[startLine];
  const max2 = state.eMarks[startLine];
  const content = state.src.substring(pos, max2);
  if (content.indexOf(TAG$1) === -1 || pos >= max2) {
    return false;
  }
  if (content.indexOf(TAG$1) === 0) {
    const token = state.push(RQCODE$1, "div", -1);
    token.markup = TAG$1;
    token.content = content.replaceAll(TAG$1, "");
    state.line = startLine + 1;
    return true;
  }
  return false;
}
function qrCodePlugin(md2, config2) {
  md2.block.ruler.after("blockquote", TAG$1, inline$2, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  });
  md2.renderer.rules[RQCODE$1] = render$2;
}
function render$2(tokens, idx2) {
  const token = tokens[idx2];
  const { content } = token;
  return `<div class="qrcode-container">${content}</div>`;
}
const TAG = "excel:";
const RQCODE = "excel";
function inline$1(state, startLine, endLine) {
  const pos = state.bMarks[startLine] + state.tShift[startLine];
  const max2 = state.eMarks[startLine];
  const content = state.src.substring(pos, max2);
  if (content.indexOf(TAG) === -1 || pos >= max2) {
    return false;
  }
  if (content.indexOf(TAG) === 0) {
    const token = state.push(RQCODE, "div", -1);
    token.markup = TAG;
    token.content = content.replaceAll(TAG, "");
    state.line = startLine + 1;
    return true;
  }
  return false;
}
function excelPlugin(md2, config2) {
  md2.block.ruler.after("blockquote", TAG, inline$1, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  });
  md2.renderer.rules[RQCODE] = render$1;
}
function render$1(tokens, idx2) {
  const token = tokens[idx2];
  const { content } = token;
  return `<div class="excel-container">${content}</div>`;
}
var deflate;
var hasRequiredDeflate;
function requireDeflate() {
  if (hasRequiredDeflate)
    return deflate;
  hasRequiredDeflate = 1;
  deflate = {
    zip_deflate,
    encode64
  };
  var zip_WSIZE = 32768;
  var zip_STORED_BLOCK = 0;
  var zip_STATIC_TREES = 1;
  var zip_DYN_TREES = 2;
  var zip_DEFAULT_LEVEL = 6;
  var zip_INBUFSIZ = 32768;
  var zip_INBUF_EXTRA = 64;
  var zip_OUTBUFSIZ = 1024 * 8;
  var zip_window_size = 2 * zip_WSIZE;
  var zip_MIN_MATCH = 3;
  var zip_MAX_MATCH = 258;
  var zip_BITS = 16;
  var zip_LIT_BUFSIZE = 8192;
  var zip_HASH_BITS = 13;
  var zip_DIST_BUFSIZE = zip_LIT_BUFSIZE;
  var zip_HASH_SIZE = 1 << zip_HASH_BITS;
  var zip_HASH_MASK = zip_HASH_SIZE - 1;
  var zip_WMASK = zip_WSIZE - 1;
  var zip_NIL = 0;
  var zip_TOO_FAR = 4096;
  var zip_MIN_LOOKAHEAD = zip_MAX_MATCH + zip_MIN_MATCH + 1;
  var zip_MAX_DIST = zip_WSIZE - zip_MIN_LOOKAHEAD;
  var zip_SMALLEST = 1;
  var zip_MAX_BITS = 15;
  var zip_MAX_BL_BITS = 7;
  var zip_LENGTH_CODES = 29;
  var zip_LITERALS = 256;
  var zip_END_BLOCK = 256;
  var zip_L_CODES = zip_LITERALS + 1 + zip_LENGTH_CODES;
  var zip_D_CODES = 30;
  var zip_BL_CODES = 19;
  var zip_REP_3_6 = 16;
  var zip_REPZ_3_10 = 17;
  var zip_REPZ_11_138 = 18;
  var zip_HEAP_SIZE = 2 * zip_L_CODES + 1;
  var zip_H_SHIFT = parseInt((zip_HASH_BITS + zip_MIN_MATCH - 1) / zip_MIN_MATCH);
  var zip_free_queue;
  var zip_qhead, zip_qtail;
  var zip_initflag;
  var zip_outbuf = null;
  var zip_outcnt, zip_outoff;
  var zip_complete;
  var zip_window;
  var zip_d_buf;
  var zip_l_buf;
  var zip_prev;
  var zip_bi_buf;
  var zip_bi_valid;
  var zip_block_start;
  var zip_ins_h;
  var zip_hash_head;
  var zip_prev_match;
  var zip_match_available;
  var zip_match_length;
  var zip_prev_length;
  var zip_strstart;
  var zip_match_start;
  var zip_eofile;
  var zip_lookahead;
  var zip_max_chain_length;
  var zip_max_lazy_match;
  var zip_compr_level;
  var zip_good_match;
  var zip_dyn_ltree;
  var zip_dyn_dtree;
  var zip_static_ltree;
  var zip_static_dtree;
  var zip_bl_tree;
  var zip_l_desc;
  var zip_d_desc;
  var zip_bl_desc;
  var zip_bl_count;
  var zip_heap;
  var zip_heap_len;
  var zip_heap_max;
  var zip_depth;
  var zip_length_code;
  var zip_dist_code;
  var zip_base_length;
  var zip_base_dist;
  var zip_flag_buf;
  var zip_last_lit;
  var zip_last_dist;
  var zip_last_flags;
  var zip_flags;
  var zip_flag_bit;
  var zip_opt_len;
  var zip_static_len;
  var zip_deflate_data;
  var zip_deflate_pos;
  var zip_extra_lbits = new Array(
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    0
  );
  var zip_extra_dbits = new Array(
    0,
    0,
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    8,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    12,
    12,
    13,
    13
  );
  var zip_extra_blbits = new Array(
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    3,
    7
  );
  var zip_bl_order = new Array(
    16,
    17,
    18,
    0,
    8,
    7,
    9,
    6,
    10,
    5,
    11,
    4,
    12,
    3,
    13,
    2,
    14,
    1,
    15
  );
  var zip_configuration_table = new Array(
    new zip_DeflateConfiguration(0, 0, 0, 0),
    new zip_DeflateConfiguration(4, 4, 8, 4),
    new zip_DeflateConfiguration(4, 5, 16, 8),
    new zip_DeflateConfiguration(4, 6, 32, 32),
    new zip_DeflateConfiguration(4, 4, 16, 16),
    new zip_DeflateConfiguration(8, 16, 32, 32),
    new zip_DeflateConfiguration(8, 16, 128, 128),
    new zip_DeflateConfiguration(8, 32, 128, 256),
    new zip_DeflateConfiguration(32, 128, 258, 1024),
    new zip_DeflateConfiguration(32, 258, 258, 4096)
  );
  function zip_DeflateCT() {
    this.fc = 0;
    this.dl = 0;
  }
  function zip_DeflateTreeDesc() {
    this.dyn_tree = null;
    this.static_tree = null;
    this.extra_bits = null;
    this.extra_base = 0;
    this.elems = 0;
    this.max_length = 0;
    this.max_code = 0;
  }
  function zip_DeflateConfiguration(a2, b2, c2, d2) {
    this.good_length = a2;
    this.max_lazy = b2;
    this.nice_length = c2;
    this.max_chain = d2;
  }
  function zip_DeflateBuffer() {
    this.next = null;
    this.len = 0;
    this.ptr = new Array(zip_OUTBUFSIZ);
    this.off = 0;
  }
  function zip_deflate_start(level) {
    var i;
    if (!level) {
      level = zip_DEFAULT_LEVEL;
    } else if (level < 1) {
      level = 1;
    } else if (level > 9) {
      level = 9;
    }
    zip_compr_level = level;
    zip_initflag = false;
    zip_eofile = false;
    if (zip_outbuf != null) {
      return;
    }
    zip_free_queue = zip_qhead = zip_qtail = null;
    zip_outbuf = new Array(zip_OUTBUFSIZ);
    zip_window = new Array(zip_window_size);
    zip_d_buf = new Array(zip_DIST_BUFSIZE);
    zip_l_buf = new Array(zip_INBUFSIZ + zip_INBUF_EXTRA);
    zip_prev = new Array(1 << zip_BITS);
    zip_dyn_ltree = new Array(zip_HEAP_SIZE);
    for (i = 0; i < zip_HEAP_SIZE; i++) {
      zip_dyn_ltree[i] = new zip_DeflateCT();
    }
    zip_dyn_dtree = new Array(2 * zip_D_CODES + 1);
    for (i = 0; i < 2 * zip_D_CODES + 1; i++) {
      zip_dyn_dtree[i] = new zip_DeflateCT();
    }
    zip_static_ltree = new Array(zip_L_CODES + 2);
    for (i = 0; i < zip_L_CODES + 2; i++) {
      zip_static_ltree[i] = new zip_DeflateCT();
    }
    zip_static_dtree = new Array(zip_D_CODES);
    for (i = 0; i < zip_D_CODES; i++) {
      zip_static_dtree[i] = new zip_DeflateCT();
    }
    zip_bl_tree = new Array(2 * zip_BL_CODES + 1);
    for (i = 0; i < 2 * zip_BL_CODES + 1; i++) {
      zip_bl_tree[i] = new zip_DeflateCT();
    }
    zip_l_desc = new zip_DeflateTreeDesc();
    zip_d_desc = new zip_DeflateTreeDesc();
    zip_bl_desc = new zip_DeflateTreeDesc();
    zip_bl_count = new Array(zip_MAX_BITS + 1);
    zip_heap = new Array(2 * zip_L_CODES + 1);
    zip_depth = new Array(2 * zip_L_CODES + 1);
    zip_length_code = new Array(zip_MAX_MATCH - zip_MIN_MATCH + 1);
    zip_dist_code = new Array(512);
    zip_base_length = new Array(zip_LENGTH_CODES);
    zip_base_dist = new Array(zip_D_CODES);
    zip_flag_buf = new Array(parseInt(zip_LIT_BUFSIZE / 8));
  }
  function zip_reuse_queue(p2) {
    p2.next = zip_free_queue;
    zip_free_queue = p2;
  }
  function zip_new_queue() {
    var p2;
    if (zip_free_queue != null) {
      p2 = zip_free_queue;
      zip_free_queue = zip_free_queue.next;
    } else {
      p2 = new zip_DeflateBuffer();
    }
    p2.next = null;
    p2.len = p2.off = 0;
    return p2;
  }
  function zip_head1(i) {
    return zip_prev[zip_WSIZE + i];
  }
  function zip_head2(i, val) {
    return zip_prev[zip_WSIZE + i] = val;
  }
  function zip_put_byte(c2) {
    zip_outbuf[zip_outoff + zip_outcnt++] = c2;
    if (zip_outoff + zip_outcnt == zip_OUTBUFSIZ) {
      zip_qoutbuf();
    }
  }
  function zip_put_short(w) {
    w &= 65535;
    if (zip_outoff + zip_outcnt < zip_OUTBUFSIZ - 2) {
      zip_outbuf[zip_outoff + zip_outcnt++] = w & 255;
      zip_outbuf[zip_outoff + zip_outcnt++] = w >>> 8;
    } else {
      zip_put_byte(w & 255);
      zip_put_byte(w >>> 8);
    }
  }
  function zip_INSERT_STRING() {
    zip_ins_h = (zip_ins_h << zip_H_SHIFT ^ zip_window[zip_strstart + zip_MIN_MATCH - 1] & 255) & zip_HASH_MASK;
    zip_hash_head = zip_head1(zip_ins_h);
    zip_prev[zip_strstart & zip_WMASK] = zip_hash_head;
    zip_head2(zip_ins_h, zip_strstart);
  }
  function zip_SEND_CODE(c2, tree) {
    zip_send_bits(tree[c2].fc, tree[c2].dl);
  }
  function zip_D_CODE(dist) {
    return (dist < 256 ? zip_dist_code[dist] : zip_dist_code[256 + (dist >> 7)]) & 255;
  }
  function zip_SMALLER(tree, n2, m2) {
    return tree[n2].fc < tree[m2].fc || tree[n2].fc == tree[m2].fc && zip_depth[n2] <= zip_depth[m2];
  }
  function zip_read_buff(buff, offset, n2) {
    var i;
    for (i = 0; i < n2 && zip_deflate_pos < zip_deflate_data.length; i++) {
      buff[offset + i] = zip_deflate_data.charCodeAt(zip_deflate_pos++) & 255;
    }
    return i;
  }
  function zip_lm_init() {
    var j;
    for (j = 0; j < zip_HASH_SIZE; j++) {
      zip_prev[zip_WSIZE + j] = 0;
    }
    zip_max_lazy_match = zip_configuration_table[zip_compr_level].max_lazy;
    zip_good_match = zip_configuration_table[zip_compr_level].good_length;
    zip_max_chain_length = zip_configuration_table[zip_compr_level].max_chain;
    zip_strstart = 0;
    zip_block_start = 0;
    zip_lookahead = zip_read_buff(zip_window, 0, 2 * zip_WSIZE);
    if (zip_lookahead <= 0) {
      zip_eofile = true;
      zip_lookahead = 0;
      return;
    }
    zip_eofile = false;
    while (zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile) {
      zip_fill_window();
    }
    zip_ins_h = 0;
    for (j = 0; j < zip_MIN_MATCH - 1; j++) {
      zip_ins_h = (zip_ins_h << zip_H_SHIFT ^ zip_window[j] & 255) & zip_HASH_MASK;
    }
  }
  function zip_longest_match(cur_match) {
    var chain_length = zip_max_chain_length;
    var scanp = zip_strstart;
    var matchp;
    var len;
    var best_len = zip_prev_length;
    var limit = zip_strstart > zip_MAX_DIST ? zip_strstart - zip_MAX_DIST : zip_NIL;
    var strendp = zip_strstart + zip_MAX_MATCH;
    var scan_end1 = zip_window[scanp + best_len - 1];
    var scan_end = zip_window[scanp + best_len];
    if (zip_prev_length >= zip_good_match) {
      chain_length >>= 2;
    }
    do {
      matchp = cur_match;
      if (zip_window[matchp + best_len] != scan_end || zip_window[matchp + best_len - 1] != scan_end1 || zip_window[matchp] != zip_window[scanp] || zip_window[++matchp] != zip_window[scanp + 1]) {
        continue;
      }
      scanp += 2;
      matchp++;
      do {
      } while (zip_window[++scanp] == zip_window[++matchp] && zip_window[++scanp] == zip_window[++matchp] && zip_window[++scanp] == zip_window[++matchp] && zip_window[++scanp] == zip_window[++matchp] && zip_window[++scanp] == zip_window[++matchp] && zip_window[++scanp] == zip_window[++matchp] && zip_window[++scanp] == zip_window[++matchp] && zip_window[++scanp] == zip_window[++matchp] && scanp < strendp);
      len = zip_MAX_MATCH - (strendp - scanp);
      scanp = strendp - zip_MAX_MATCH;
      if (len > best_len) {
        zip_match_start = cur_match;
        best_len = len;
        {
          if (len >= zip_MAX_MATCH)
            break;
        }
        scan_end1 = zip_window[scanp + best_len - 1];
        scan_end = zip_window[scanp + best_len];
      }
    } while ((cur_match = zip_prev[cur_match & zip_WMASK]) > limit && --chain_length != 0);
    return best_len;
  }
  function zip_fill_window() {
    var n2, m2;
    var more = zip_window_size - zip_lookahead - zip_strstart;
    if (more == -1) {
      more--;
    } else if (zip_strstart >= zip_WSIZE + zip_MAX_DIST) {
      for (n2 = 0; n2 < zip_WSIZE; n2++) {
        zip_window[n2] = zip_window[n2 + zip_WSIZE];
      }
      zip_match_start -= zip_WSIZE;
      zip_strstart -= zip_WSIZE;
      zip_block_start -= zip_WSIZE;
      for (n2 = 0; n2 < zip_HASH_SIZE; n2++) {
        m2 = zip_head1(n2);
        zip_head2(n2, m2 >= zip_WSIZE ? m2 - zip_WSIZE : zip_NIL);
      }
      for (n2 = 0; n2 < zip_WSIZE; n2++) {
        m2 = zip_prev[n2];
        zip_prev[n2] = m2 >= zip_WSIZE ? m2 - zip_WSIZE : zip_NIL;
      }
      more += zip_WSIZE;
    }
    if (!zip_eofile) {
      n2 = zip_read_buff(zip_window, zip_strstart + zip_lookahead, more);
      if (n2 <= 0) {
        zip_eofile = true;
      } else {
        zip_lookahead += n2;
      }
    }
  }
  function zip_deflate_fast() {
    while (zip_lookahead != 0 && zip_qhead == null) {
      var flush;
      zip_INSERT_STRING();
      if (zip_hash_head != zip_NIL && zip_strstart - zip_hash_head <= zip_MAX_DIST) {
        zip_match_length = zip_longest_match(zip_hash_head);
        if (zip_match_length > zip_lookahead) {
          zip_match_length = zip_lookahead;
        }
      }
      if (zip_match_length >= zip_MIN_MATCH) {
        flush = zip_ct_tally(
          zip_strstart - zip_match_start,
          zip_match_length - zip_MIN_MATCH
        );
        zip_lookahead -= zip_match_length;
        if (zip_match_length <= zip_max_lazy_match) {
          zip_match_length--;
          do {
            zip_strstart++;
            zip_INSERT_STRING();
          } while (--zip_match_length != 0);
          zip_strstart++;
        } else {
          zip_strstart += zip_match_length;
          zip_match_length = 0;
          zip_ins_h = zip_window[zip_strstart] & 255;
          zip_ins_h = (zip_ins_h << zip_H_SHIFT ^ zip_window[zip_strstart + 1] & 255) & zip_HASH_MASK;
        }
      } else {
        flush = zip_ct_tally(0, zip_window[zip_strstart] & 255);
        zip_lookahead--;
        zip_strstart++;
      }
      if (flush) {
        zip_flush_block(0);
        zip_block_start = zip_strstart;
      }
      while (zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile) {
        zip_fill_window();
      }
    }
  }
  function zip_deflate_better() {
    while (zip_lookahead != 0 && zip_qhead == null) {
      zip_INSERT_STRING();
      zip_prev_length = zip_match_length;
      zip_prev_match = zip_match_start;
      zip_match_length = zip_MIN_MATCH - 1;
      if (zip_hash_head != zip_NIL && zip_prev_length < zip_max_lazy_match && zip_strstart - zip_hash_head <= zip_MAX_DIST) {
        zip_match_length = zip_longest_match(zip_hash_head);
        if (zip_match_length > zip_lookahead) {
          zip_match_length = zip_lookahead;
        }
        if (zip_match_length == zip_MIN_MATCH && zip_strstart - zip_match_start > zip_TOO_FAR) {
          zip_match_length--;
        }
      }
      if (zip_prev_length >= zip_MIN_MATCH && zip_match_length <= zip_prev_length) {
        var flush;
        flush = zip_ct_tally(
          zip_strstart - 1 - zip_prev_match,
          zip_prev_length - zip_MIN_MATCH
        );
        zip_lookahead -= zip_prev_length - 1;
        zip_prev_length -= 2;
        do {
          zip_strstart++;
          zip_INSERT_STRING();
        } while (--zip_prev_length != 0);
        zip_match_available = 0;
        zip_match_length = zip_MIN_MATCH - 1;
        zip_strstart++;
        if (flush) {
          zip_flush_block(0);
          zip_block_start = zip_strstart;
        }
      } else if (zip_match_available != 0) {
        if (zip_ct_tally(0, zip_window[zip_strstart - 1] & 255)) {
          zip_flush_block(0);
          zip_block_start = zip_strstart;
        }
        zip_strstart++;
        zip_lookahead--;
      } else {
        zip_match_available = 1;
        zip_strstart++;
        zip_lookahead--;
      }
      while (zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile) {
        zip_fill_window();
      }
    }
  }
  function zip_init_deflate() {
    if (zip_eofile) {
      return;
    }
    zip_bi_buf = 0;
    zip_bi_valid = 0;
    zip_ct_init();
    zip_lm_init();
    zip_qhead = null;
    zip_outcnt = 0;
    zip_outoff = 0;
    if (zip_compr_level <= 3) {
      zip_prev_length = zip_MIN_MATCH - 1;
      zip_match_length = 0;
    } else {
      zip_match_length = zip_MIN_MATCH - 1;
      zip_match_available = 0;
    }
    zip_complete = false;
  }
  function zip_deflate_internal(buff, off, buff_size) {
    var n2;
    if (!zip_initflag) {
      zip_init_deflate();
      zip_initflag = true;
      if (zip_lookahead == 0) {
        zip_complete = true;
        return 0;
      }
    }
    if ((n2 = zip_qcopy(buff, off, buff_size)) == buff_size) {
      return buff_size;
    }
    if (zip_complete) {
      return n2;
    }
    if (zip_compr_level <= 3) {
      zip_deflate_fast();
    } else {
      zip_deflate_better();
    }
    if (zip_lookahead == 0) {
      if (zip_match_available != 0) {
        zip_ct_tally(0, zip_window[zip_strstart - 1] & 255);
      }
      zip_flush_block(1);
      zip_complete = true;
    }
    return n2 + zip_qcopy(buff, n2 + off, buff_size - n2);
  }
  function zip_qcopy(buff, off, buff_size) {
    var n2, i, j;
    n2 = 0;
    while (zip_qhead != null && n2 < buff_size) {
      i = buff_size - n2;
      if (i > zip_qhead.len) {
        i = zip_qhead.len;
      }
      for (j = 0; j < i; j++) {
        buff[off + n2 + j] = zip_qhead.ptr[zip_qhead.off + j];
      }
      zip_qhead.off += i;
      zip_qhead.len -= i;
      n2 += i;
      if (zip_qhead.len == 0) {
        var p2;
        p2 = zip_qhead;
        zip_qhead = zip_qhead.next;
        zip_reuse_queue(p2);
      }
    }
    if (n2 == buff_size) {
      return n2;
    }
    if (zip_outoff < zip_outcnt) {
      i = buff_size - n2;
      if (i > zip_outcnt - zip_outoff) {
        i = zip_outcnt - zip_outoff;
      }
      for (j = 0; j < i; j++) {
        buff[off + n2 + j] = zip_outbuf[zip_outoff + j];
      }
      zip_outoff += i;
      n2 += i;
      if (zip_outcnt == zip_outoff) {
        zip_outcnt = zip_outoff = 0;
      }
    }
    return n2;
  }
  function zip_ct_init() {
    var n2;
    var bits;
    var length;
    var code2;
    var dist;
    if (zip_static_dtree[0].dl != 0)
      return;
    zip_l_desc.dyn_tree = zip_dyn_ltree;
    zip_l_desc.static_tree = zip_static_ltree;
    zip_l_desc.extra_bits = zip_extra_lbits;
    zip_l_desc.extra_base = zip_LITERALS + 1;
    zip_l_desc.elems = zip_L_CODES;
    zip_l_desc.max_length = zip_MAX_BITS;
    zip_l_desc.max_code = 0;
    zip_d_desc.dyn_tree = zip_dyn_dtree;
    zip_d_desc.static_tree = zip_static_dtree;
    zip_d_desc.extra_bits = zip_extra_dbits;
    zip_d_desc.extra_base = 0;
    zip_d_desc.elems = zip_D_CODES;
    zip_d_desc.max_length = zip_MAX_BITS;
    zip_d_desc.max_code = 0;
    zip_bl_desc.dyn_tree = zip_bl_tree;
    zip_bl_desc.static_tree = null;
    zip_bl_desc.extra_bits = zip_extra_blbits;
    zip_bl_desc.extra_base = 0;
    zip_bl_desc.elems = zip_BL_CODES;
    zip_bl_desc.max_length = zip_MAX_BL_BITS;
    zip_bl_desc.max_code = 0;
    length = 0;
    for (code2 = 0; code2 < zip_LENGTH_CODES - 1; code2++) {
      zip_base_length[code2] = length;
      for (n2 = 0; n2 < 1 << zip_extra_lbits[code2]; n2++) {
        zip_length_code[length++] = code2;
      }
    }
    zip_length_code[length - 1] = code2;
    dist = 0;
    for (code2 = 0; code2 < 16; code2++) {
      zip_base_dist[code2] = dist;
      for (n2 = 0; n2 < 1 << zip_extra_dbits[code2]; n2++) {
        zip_dist_code[dist++] = code2;
      }
    }
    dist >>= 7;
    for (; code2 < zip_D_CODES; code2++) {
      zip_base_dist[code2] = dist << 7;
      for (n2 = 0; n2 < 1 << zip_extra_dbits[code2] - 7; n2++) {
        zip_dist_code[256 + dist++] = code2;
      }
    }
    for (bits = 0; bits <= zip_MAX_BITS; bits++) {
      zip_bl_count[bits] = 0;
    }
    n2 = 0;
    while (n2 <= 143) {
      zip_static_ltree[n2++].dl = 8;
      zip_bl_count[8]++;
    }
    while (n2 <= 255) {
      zip_static_ltree[n2++].dl = 9;
      zip_bl_count[9]++;
    }
    while (n2 <= 279) {
      zip_static_ltree[n2++].dl = 7;
      zip_bl_count[7]++;
    }
    while (n2 <= 287) {
      zip_static_ltree[n2++].dl = 8;
      zip_bl_count[8]++;
    }
    zip_gen_codes(zip_static_ltree, zip_L_CODES + 1);
    for (n2 = 0; n2 < zip_D_CODES; n2++) {
      zip_static_dtree[n2].dl = 5;
      zip_static_dtree[n2].fc = zip_bi_reverse(n2, 5);
    }
    zip_init_block();
  }
  function zip_init_block() {
    var n2;
    for (n2 = 0; n2 < zip_L_CODES; n2++)
      zip_dyn_ltree[n2].fc = 0;
    for (n2 = 0; n2 < zip_D_CODES; n2++)
      zip_dyn_dtree[n2].fc = 0;
    for (n2 = 0; n2 < zip_BL_CODES; n2++)
      zip_bl_tree[n2].fc = 0;
    zip_dyn_ltree[zip_END_BLOCK].fc = 1;
    zip_opt_len = zip_static_len = 0;
    zip_last_lit = zip_last_dist = zip_last_flags = 0;
    zip_flags = 0;
    zip_flag_bit = 1;
  }
  function zip_pqdownheap(tree, k) {
    var v2 = zip_heap[k];
    var j = k << 1;
    while (j <= zip_heap_len) {
      if (j < zip_heap_len && zip_SMALLER(tree, zip_heap[j + 1], zip_heap[j])) {
        j++;
      }
      if (zip_SMALLER(tree, v2, zip_heap[j])) {
        break;
      }
      zip_heap[k] = zip_heap[j];
      k = j;
      j <<= 1;
    }
    zip_heap[k] = v2;
  }
  function zip_gen_bitlen(desc) {
    var tree = desc.dyn_tree;
    var extra = desc.extra_bits;
    var base = desc.extra_base;
    var max_code = desc.max_code;
    var max_length = desc.max_length;
    var stree = desc.static_tree;
    var h2;
    var n2, m2;
    var bits;
    var xbits;
    var f2;
    var overflow = 0;
    for (bits = 0; bits <= zip_MAX_BITS; bits++) {
      zip_bl_count[bits] = 0;
    }
    tree[zip_heap[zip_heap_max]].dl = 0;
    for (h2 = zip_heap_max + 1; h2 < zip_HEAP_SIZE; h2++) {
      n2 = zip_heap[h2];
      bits = tree[tree[n2].dl].dl + 1;
      if (bits > max_length) {
        bits = max_length;
        overflow++;
      }
      tree[n2].dl = bits;
      if (n2 > max_code) {
        continue;
      }
      zip_bl_count[bits]++;
      xbits = 0;
      if (n2 >= base) {
        xbits = extra[n2 - base];
      }
      f2 = tree[n2].fc;
      zip_opt_len += f2 * (bits + xbits);
      if (stree != null) {
        zip_static_len += f2 * (stree[n2].dl + xbits);
      }
    }
    if (overflow == 0) {
      return;
    }
    do {
      bits = max_length - 1;
      while (zip_bl_count[bits] == 0) {
        bits--;
      }
      zip_bl_count[bits]--;
      zip_bl_count[bits + 1] += 2;
      zip_bl_count[max_length]--;
      overflow -= 2;
    } while (overflow > 0);
    for (bits = max_length; bits != 0; bits--) {
      n2 = zip_bl_count[bits];
      while (n2 != 0) {
        m2 = zip_heap[--h2];
        if (m2 > max_code) {
          continue;
        }
        if (tree[m2].dl != bits) {
          zip_opt_len += (bits - tree[m2].dl) * tree[m2].fc;
          tree[m2].fc = bits;
        }
        n2--;
      }
    }
  }
  function zip_gen_codes(tree, max_code) {
    var next_code = new Array(zip_MAX_BITS + 1);
    var code2 = 0;
    var bits;
    var n2;
    for (bits = 1; bits <= zip_MAX_BITS; bits++) {
      code2 = code2 + zip_bl_count[bits - 1] << 1;
      next_code[bits] = code2;
    }
    for (n2 = 0; n2 <= max_code; n2++) {
      var len = tree[n2].dl;
      if (len == 0) {
        continue;
      }
      tree[n2].fc = zip_bi_reverse(next_code[len]++, len);
    }
  }
  function zip_build_tree(desc) {
    var tree = desc.dyn_tree;
    var stree = desc.static_tree;
    var elems = desc.elems;
    var n2, m2;
    var max_code = -1;
    var node = elems;
    zip_heap_len = 0;
    zip_heap_max = zip_HEAP_SIZE;
    for (n2 = 0; n2 < elems; n2++) {
      if (tree[n2].fc != 0) {
        zip_heap[++zip_heap_len] = max_code = n2;
        zip_depth[n2] = 0;
      } else {
        tree[n2].dl = 0;
      }
    }
    while (zip_heap_len < 2) {
      var xnew = zip_heap[++zip_heap_len] = max_code < 2 ? ++max_code : 0;
      tree[xnew].fc = 1;
      zip_depth[xnew] = 0;
      zip_opt_len--;
      if (stree != null) {
        zip_static_len -= stree[xnew].dl;
      }
    }
    desc.max_code = max_code;
    for (n2 = zip_heap_len >> 1; n2 >= 1; n2--) {
      zip_pqdownheap(tree, n2);
    }
    do {
      n2 = zip_heap[zip_SMALLEST];
      zip_heap[zip_SMALLEST] = zip_heap[zip_heap_len--];
      zip_pqdownheap(tree, zip_SMALLEST);
      m2 = zip_heap[zip_SMALLEST];
      zip_heap[--zip_heap_max] = n2;
      zip_heap[--zip_heap_max] = m2;
      tree[node].fc = tree[n2].fc + tree[m2].fc;
      if (zip_depth[n2] > zip_depth[m2] + 1) {
        zip_depth[node] = zip_depth[n2];
      } else {
        zip_depth[node] = zip_depth[m2] + 1;
      }
      tree[n2].dl = tree[m2].dl = node;
      zip_heap[zip_SMALLEST] = node++;
      zip_pqdownheap(tree, zip_SMALLEST);
    } while (zip_heap_len >= 2);
    zip_heap[--zip_heap_max] = zip_heap[zip_SMALLEST];
    zip_gen_bitlen(desc);
    zip_gen_codes(tree, max_code);
  }
  function zip_scan_tree(tree, max_code) {
    var n2;
    var prevlen = -1;
    var curlen;
    var nextlen = tree[0].dl;
    var count = 0;
    var max_count = 7;
    var min_count = 4;
    if (nextlen == 0) {
      max_count = 138;
      min_count = 3;
    }
    tree[max_code + 1].dl = 65535;
    for (n2 = 0; n2 <= max_code; n2++) {
      curlen = nextlen;
      nextlen = tree[n2 + 1].dl;
      if (++count < max_count && curlen == nextlen) {
        continue;
      } else if (count < min_count) {
        zip_bl_tree[curlen].fc += count;
      } else if (curlen != 0) {
        if (curlen != prevlen) {
          zip_bl_tree[curlen].fc++;
        }
        zip_bl_tree[zip_REP_3_6].fc++;
      } else if (count <= 10) {
        zip_bl_tree[zip_REPZ_3_10].fc++;
      } else {
        zip_bl_tree[zip_REPZ_11_138].fc++;
      }
      count = 0;
      prevlen = curlen;
      if (nextlen == 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen == nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }
  function zip_send_tree(tree, max_code) {
    var n2;
    var prevlen = -1;
    var curlen;
    var nextlen = tree[0].dl;
    var count = 0;
    var max_count = 7;
    var min_count = 4;
    if (nextlen == 0) {
      max_count = 138;
      min_count = 3;
    }
    for (n2 = 0; n2 <= max_code; n2++) {
      curlen = nextlen;
      nextlen = tree[n2 + 1].dl;
      if (++count < max_count && curlen == nextlen) {
        continue;
      } else if (count < min_count) {
        do {
          zip_SEND_CODE(curlen, zip_bl_tree);
        } while (--count != 0);
      } else if (curlen != 0) {
        if (curlen != prevlen) {
          zip_SEND_CODE(curlen, zip_bl_tree);
          count--;
        }
        zip_SEND_CODE(zip_REP_3_6, zip_bl_tree);
        zip_send_bits(count - 3, 2);
      } else if (count <= 10) {
        zip_SEND_CODE(zip_REPZ_3_10, zip_bl_tree);
        zip_send_bits(count - 3, 3);
      } else {
        zip_SEND_CODE(zip_REPZ_11_138, zip_bl_tree);
        zip_send_bits(count - 11, 7);
      }
      count = 0;
      prevlen = curlen;
      if (nextlen == 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen == nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }
  function zip_build_bl_tree() {
    var max_blindex;
    zip_scan_tree(zip_dyn_ltree, zip_l_desc.max_code);
    zip_scan_tree(zip_dyn_dtree, zip_d_desc.max_code);
    zip_build_tree(zip_bl_desc);
    for (max_blindex = zip_BL_CODES - 1; max_blindex >= 3; max_blindex--) {
      if (zip_bl_tree[zip_bl_order[max_blindex]].dl != 0)
        break;
    }
    zip_opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
    return max_blindex;
  }
  function zip_send_all_trees(lcodes, dcodes, blcodes) {
    var rank;
    zip_send_bits(lcodes - 257, 5);
    zip_send_bits(dcodes - 1, 5);
    zip_send_bits(blcodes - 4, 4);
    for (rank = 0; rank < blcodes; rank++) {
      zip_send_bits(zip_bl_tree[zip_bl_order[rank]].dl, 3);
    }
    zip_send_tree(zip_dyn_ltree, lcodes - 1);
    zip_send_tree(zip_dyn_dtree, dcodes - 1);
  }
  function zip_flush_block(eof) {
    var opt_lenb, static_lenb;
    var max_blindex;
    var stored_len;
    stored_len = zip_strstart - zip_block_start;
    zip_flag_buf[zip_last_flags] = zip_flags;
    zip_build_tree(zip_l_desc);
    zip_build_tree(zip_d_desc);
    max_blindex = zip_build_bl_tree();
    opt_lenb = zip_opt_len + 3 + 7 >> 3;
    static_lenb = zip_static_len + 3 + 7 >> 3;
    if (static_lenb <= opt_lenb) {
      opt_lenb = static_lenb;
    }
    if (stored_len + 4 <= opt_lenb && zip_block_start >= 0) {
      var i;
      zip_send_bits((zip_STORED_BLOCK << 1) + eof, 3);
      zip_bi_windup();
      zip_put_short(stored_len);
      zip_put_short(~stored_len);
      for (i = 0; i < stored_len; i++) {
        zip_put_byte(zip_window[zip_block_start + i]);
      }
    } else if (static_lenb == opt_lenb) {
      zip_send_bits((zip_STATIC_TREES << 1) + eof, 3);
      zip_compress_block(zip_static_ltree, zip_static_dtree);
    } else {
      zip_send_bits((zip_DYN_TREES << 1) + eof, 3);
      zip_send_all_trees(
        zip_l_desc.max_code + 1,
        zip_d_desc.max_code + 1,
        max_blindex + 1
      );
      zip_compress_block(zip_dyn_ltree, zip_dyn_dtree);
    }
    zip_init_block();
    if (eof != 0) {
      zip_bi_windup();
    }
  }
  function zip_ct_tally(dist, lc) {
    zip_l_buf[zip_last_lit++] = lc;
    if (dist == 0) {
      zip_dyn_ltree[lc].fc++;
    } else {
      dist--;
      zip_dyn_ltree[zip_length_code[lc] + zip_LITERALS + 1].fc++;
      zip_dyn_dtree[zip_D_CODE(dist)].fc++;
      zip_d_buf[zip_last_dist++] = dist;
      zip_flags |= zip_flag_bit;
    }
    zip_flag_bit <<= 1;
    if ((zip_last_lit & 7) == 0) {
      zip_flag_buf[zip_last_flags++] = zip_flags;
      zip_flags = 0;
      zip_flag_bit = 1;
    }
    if (zip_compr_level > 2 && (zip_last_lit & 4095) == 0) {
      var out_length = zip_last_lit * 8;
      var in_length = zip_strstart - zip_block_start;
      var dcode;
      for (dcode = 0; dcode < zip_D_CODES; dcode++) {
        out_length += zip_dyn_dtree[dcode].fc * (5 + zip_extra_dbits[dcode]);
      }
      out_length >>= 3;
      if (zip_last_dist < parseInt(zip_last_lit / 2) && out_length < parseInt(in_length / 2)) {
        return true;
      }
    }
    return zip_last_lit == zip_LIT_BUFSIZE - 1 || zip_last_dist == zip_DIST_BUFSIZE;
  }
  function zip_compress_block(ltree, dtree) {
    var dist;
    var lc;
    var lx = 0;
    var dx = 0;
    var fx = 0;
    var flag = 0;
    var code2;
    var extra;
    if (zip_last_lit != 0) {
      do {
        if ((lx & 7) == 0) {
          flag = zip_flag_buf[fx++];
        }
        lc = zip_l_buf[lx++] & 255;
        if ((flag & 1) == 0) {
          zip_SEND_CODE(lc, ltree);
        } else {
          code2 = zip_length_code[lc];
          zip_SEND_CODE(code2 + zip_LITERALS + 1, ltree);
          extra = zip_extra_lbits[code2];
          if (extra != 0) {
            lc -= zip_base_length[code2];
            zip_send_bits(lc, extra);
          }
          dist = zip_d_buf[dx++];
          code2 = zip_D_CODE(dist);
          zip_SEND_CODE(code2, dtree);
          extra = zip_extra_dbits[code2];
          if (extra != 0) {
            dist -= zip_base_dist[code2];
            zip_send_bits(dist, extra);
          }
        }
        flag >>= 1;
      } while (lx < zip_last_lit);
    }
    zip_SEND_CODE(zip_END_BLOCK, ltree);
  }
  var zip_Buf_size = 16;
  function zip_send_bits(value, length) {
    if (zip_bi_valid > zip_Buf_size - length) {
      zip_bi_buf |= value << zip_bi_valid;
      zip_put_short(zip_bi_buf);
      zip_bi_buf = value >> zip_Buf_size - zip_bi_valid;
      zip_bi_valid += length - zip_Buf_size;
    } else {
      zip_bi_buf |= value << zip_bi_valid;
      zip_bi_valid += length;
    }
  }
  function zip_bi_reverse(code2, len) {
    var res = 0;
    do {
      res |= code2 & 1;
      code2 >>= 1;
      res <<= 1;
    } while (--len > 0);
    return res >> 1;
  }
  function zip_bi_windup() {
    if (zip_bi_valid > 8) {
      zip_put_short(zip_bi_buf);
    } else if (zip_bi_valid > 0) {
      zip_put_byte(zip_bi_buf);
    }
    zip_bi_buf = 0;
    zip_bi_valid = 0;
  }
  function zip_qoutbuf() {
    if (zip_outcnt != 0) {
      var q, i;
      q = zip_new_queue();
      if (zip_qhead == null) {
        zip_qhead = zip_qtail = q;
      } else {
        zip_qtail = zip_qtail.next = q;
      }
      q.len = zip_outcnt - zip_outoff;
      for (i = 0; i < q.len; i++) {
        q.ptr[i] = zip_outbuf[zip_outoff + i];
      }
      zip_outcnt = zip_outoff = 0;
    }
  }
  function zip_deflate(str2, level) {
    var out, buff;
    var i, j;
    zip_deflate_data = str2;
    zip_deflate_pos = 0;
    if (typeof level === "undefined") {
      level = zip_DEFAULT_LEVEL;
    }
    zip_deflate_start(level);
    buff = new Array(1024);
    out = "";
    while ((i = zip_deflate_internal(buff, 0, buff.length)) > 0) {
      for (j = 0; j < i; j++) {
        out += String.fromCharCode(buff[j]);
      }
    }
    zip_deflate_data = null;
    return out;
  }
  function encode64(data) {
    var r2 = "";
    for (var i = 0; i < data.length; i += 3) {
      if (i + 2 == data.length) {
        r2 += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
      } else if (i + 1 == data.length) {
        r2 += append3bytes(data.charCodeAt(i), 0, 0);
      } else {
        r2 += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2));
      }
    }
    return r2;
  }
  function append3bytes(b1, b2, b3) {
    var c1 = b1 >> 2;
    var c2 = (b1 & 3) << 4 | b2 >> 4;
    var c3 = (b2 & 15) << 2 | b3 >> 6;
    var c4 = b3 & 63;
    var r2 = "";
    r2 += encode6bit(c1 & 63);
    r2 += encode6bit(c2 & 63);
    r2 += encode6bit(c3 & 63);
    r2 += encode6bit(c4 & 63);
    return r2;
  }
  function encode6bit(b2) {
    if (b2 < 10) {
      return String.fromCharCode(48 + b2);
    }
    b2 -= 10;
    if (b2 < 26) {
      return String.fromCharCode(65 + b2);
    }
    b2 -= 26;
    if (b2 < 26) {
      return String.fromCharCode(97 + b2);
    }
    b2 -= 26;
    if (b2 == 0) {
      return "-";
    }
    if (b2 == 1) {
      return "_";
    }
    return "?";
  }
  return deflate;
}
var markdownItPlantuml = function umlPlugin(md2, options) {
  function generateSourceDefault(umlCode, pluginOptions) {
    var imageFormat = pluginOptions.imageFormat || "svg";
    var diagramName = pluginOptions.diagramName || "uml";
    var server = pluginOptions.server || "https://www.plantuml.com/plantuml";
    var deflate2 = requireDeflate();
    var zippedCode = deflate2.encode64(
      deflate2.zip_deflate(
        unescape(encodeURIComponent(
          "@start" + diagramName + "\n" + umlCode + "\n@end" + diagramName
        )),
        9
      )
    );
    return server + "/" + imageFormat + "/" + zippedCode;
  }
  options = options || {};
  var openMarker = options.openMarker || "@startuml", openChar = openMarker.charCodeAt(0), closeMarker = options.closeMarker || "@enduml", closeChar = closeMarker.charCodeAt(0), render2 = options.render || md2.renderer.rules.image, generateSource = options.generateSource || generateSourceDefault;
  function uml(state, startLine, endLine, silent) {
    var nextLine, markup, params, token, i, autoClosed = false, start = state.bMarks[startLine] + state.tShift[startLine], max2 = state.eMarks[startLine];
    if (openChar !== state.src.charCodeAt(start)) {
      return false;
    }
    for (i = 0; i < openMarker.length; ++i) {
      if (openMarker[i] !== state.src[start + i]) {
        return false;
      }
    }
    markup = state.src.slice(start, start + i);
    params = state.src.slice(start + i, max2);
    if (silent) {
      return true;
    }
    nextLine = startLine;
    for (; ; ) {
      nextLine++;
      if (nextLine >= endLine) {
        break;
      }
      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max2 = state.eMarks[nextLine];
      if (start < max2 && state.sCount[nextLine] < state.blkIndent) {
        break;
      }
      if (closeChar !== state.src.charCodeAt(start)) {
        continue;
      }
      if (state.sCount[nextLine] > state.sCount[startLine]) {
        continue;
      }
      var closeMarkerMatched = true;
      for (i = 0; i < closeMarker.length; ++i) {
        if (closeMarker[i] !== state.src[start + i]) {
          closeMarkerMatched = false;
          break;
        }
      }
      if (!closeMarkerMatched) {
        continue;
      }
      if (state.skipSpaces(start + i) < max2) {
        continue;
      }
      autoClosed = true;
      break;
    }
    var contents = state.src.split("\n").slice(startLine + 1, nextLine).join("\n");
    var altToken = [];
    var alt = params ? params.slice(1) : "uml diagram";
    state.md.inline.parse(
      alt,
      state.md,
      state.env,
      altToken
    );
    token = state.push("uml_diagram", "img", 0);
    token.attrs = [["src", generateSource(contents, options)], ["alt", ""]];
    token.block = true;
    token.children = altToken;
    token.info = params;
    token.map = [startLine, nextLine];
    token.markup = markup;
    state.line = nextLine + (autoClosed ? 1 : 0);
    return true;
  }
  md2.block.ruler.before("fence", "uml_diagram", uml, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  });
  md2.renderer.rules.uml_diagram = render2;
};
const mdPlantUML = /* @__PURE__ */ getDefaultExportFromCjs(markdownItPlantuml);
const d = (e2) => {
  const t2 = e2.renderer.rules.image;
  e2.renderer.rules.image = (r2, a2, l2, n2, o3) => (r2[a2].attrSet("loading", "lazy"), t2(r2, a2, l2, n2, o3));
};
function deepFreeze(obj) {
  if (obj instanceof Map) {
    obj.clear = obj.delete = obj.set = function() {
      throw new Error("map is read-only");
    };
  } else if (obj instanceof Set) {
    obj.add = obj.clear = obj.delete = function() {
      throw new Error("set is read-only");
    };
  }
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((name2) => {
    const prop = obj[name2];
    const type2 = typeof prop;
    if ((type2 === "object" || type2 === "function") && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });
  return obj;
}
class Response {
  /**
   * @param {CompiledMode} mode
   */
  constructor(mode) {
    if (mode.data === void 0)
      mode.data = {};
    this.data = mode.data;
    this.isMatchIgnored = false;
  }
  ignoreMatch() {
    this.isMatchIgnored = true;
  }
}
function escapeHTML(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
function inherit$1(original, ...objects) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const key2 in original) {
    result[key2] = original[key2];
  }
  objects.forEach(function(obj) {
    for (const key2 in obj) {
      result[key2] = obj[key2];
    }
  });
  return (
    /** @type {T} */
    result
  );
}
const SPAN_CLOSE = "</span>";
const emitsWrappingTags = (node) => {
  return !!node.scope;
};
const scopeToCSSClass = (name2, { prefix }) => {
  if (name2.startsWith("language:")) {
    return name2.replace("language:", "language-");
  }
  if (name2.includes(".")) {
    const pieces = name2.split(".");
    return [
      `${prefix}${pieces.shift()}`,
      ...pieces.map((x2, i) => `${x2}${"_".repeat(i + 1)}`)
    ].join(" ");
  }
  return `${prefix}${name2}`;
};
class HTMLRenderer {
  /**
   * Creates a new HTMLRenderer
   *
   * @param {Tree} parseTree - the parse tree (must support `walk` API)
   * @param {{classPrefix: string}} options
   */
  constructor(parseTree, options) {
    this.buffer = "";
    this.classPrefix = options.classPrefix;
    parseTree.walk(this);
  }
  /**
   * Adds texts to the output stream
   *
   * @param {string} text */
  addText(text2) {
    this.buffer += escapeHTML(text2);
  }
  /**
   * Adds a node open to the output stream (if needed)
   *
   * @param {Node} node */
  openNode(node) {
    if (!emitsWrappingTags(node))
      return;
    const className = scopeToCSSClass(
      node.scope,
      { prefix: this.classPrefix }
    );
    this.span(className);
  }
  /**
   * Adds a node close to the output stream (if needed)
   *
   * @param {Node} node */
  closeNode(node) {
    if (!emitsWrappingTags(node))
      return;
    this.buffer += SPAN_CLOSE;
  }
  /**
   * returns the accumulated buffer
  */
  value() {
    return this.buffer;
  }
  // helpers
  /**
   * Builds a span element
   *
   * @param {string} className */
  span(className) {
    this.buffer += `<span class="${className}">`;
  }
}
const newNode = (opts = {}) => {
  const result = { children: [] };
  Object.assign(result, opts);
  return result;
};
class TokenTree {
  constructor() {
    this.rootNode = newNode();
    this.stack = [this.rootNode];
  }
  get top() {
    return this.stack[this.stack.length - 1];
  }
  get root() {
    return this.rootNode;
  }
  /** @param {Node} node */
  add(node) {
    this.top.children.push(node);
  }
  /** @param {string} scope */
  openNode(scope) {
    const node = newNode({ scope });
    this.add(node);
    this.stack.push(node);
  }
  closeNode() {
    if (this.stack.length > 1) {
      return this.stack.pop();
    }
    return void 0;
  }
  closeAllNodes() {
    while (this.closeNode())
      ;
  }
  toJSON() {
    return JSON.stringify(this.rootNode, null, 4);
  }
  /**
   * @typedef { import("./html_renderer").Renderer } Renderer
   * @param {Renderer} builder
   */
  walk(builder) {
    return this.constructor._walk(builder, this.rootNode);
  }
  /**
   * @param {Renderer} builder
   * @param {Node} node
   */
  static _walk(builder, node) {
    if (typeof node === "string") {
      builder.addText(node);
    } else if (node.children) {
      builder.openNode(node);
      node.children.forEach((child2) => this._walk(builder, child2));
      builder.closeNode(node);
    }
    return builder;
  }
  /**
   * @param {Node} node
   */
  static _collapse(node) {
    if (typeof node === "string")
      return;
    if (!node.children)
      return;
    if (node.children.every((el) => typeof el === "string")) {
      node.children = [node.children.join("")];
    } else {
      node.children.forEach((child2) => {
        TokenTree._collapse(child2);
      });
    }
  }
}
class TokenTreeEmitter extends TokenTree {
  /**
   * @param {*} options
   */
  constructor(options) {
    super();
    this.options = options;
  }
  /**
   * @param {string} text
   */
  addText(text2) {
    if (text2 === "") {
      return;
    }
    this.add(text2);
  }
  /** @param {string} scope */
  startScope(scope) {
    this.openNode(scope);
  }
  endScope() {
    this.closeNode();
  }
  /**
   * @param {Emitter & {root: DataNode}} emitter
   * @param {string} name
   */
  __addSublanguage(emitter, name2) {
    const node = emitter.root;
    if (name2)
      node.scope = `language:${name2}`;
    this.add(node);
  }
  toHTML() {
    const renderer = new HTMLRenderer(this, this.options);
    return renderer.value();
  }
  finalize() {
    this.closeAllNodes();
    return true;
  }
}
function source$1(re) {
  if (!re)
    return null;
  if (typeof re === "string")
    return re;
  return re.source;
}
function lookahead$1(re) {
  return concat$1("(?=", re, ")");
}
function anyNumberOfTimes(re) {
  return concat$1("(?:", re, ")*");
}
function optional(re) {
  return concat$1("(?:", re, ")?");
}
function concat$1(...args) {
  const joined = args.map((x2) => source$1(x2)).join("");
  return joined;
}
function stripOptionsFromArgs$1(args) {
  const opts = args[args.length - 1];
  if (typeof opts === "object" && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}
function either$1(...args) {
  const opts = stripOptionsFromArgs$1(args);
  const joined = "(" + (opts.capture ? "" : "?:") + args.map((x2) => source$1(x2)).join("|") + ")";
  return joined;
}
function countMatchGroups(re) {
  return new RegExp(re.toString() + "|").exec("").length - 1;
}
function startsWith(re, lexeme) {
  const match = re && re.exec(lexeme);
  return match && match.index === 0;
}
const BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
function _rewriteBackreferences(regexps, { joinWith }) {
  let numCaptures = 0;
  return regexps.map((regex) => {
    numCaptures += 1;
    const offset = numCaptures;
    let re = source$1(regex);
    let out = "";
    while (re.length > 0) {
      const match = BACKREF_RE.exec(re);
      if (!match) {
        out += re;
        break;
      }
      out += re.substring(0, match.index);
      re = re.substring(match.index + match[0].length);
      if (match[0][0] === "\\" && match[1]) {
        out += "\\" + String(Number(match[1]) + offset);
      } else {
        out += match[0];
        if (match[0] === "(") {
          numCaptures++;
        }
      }
    }
    return out;
  }).map((re) => `(${re})`).join(joinWith);
}
const MATCH_NOTHING_RE = /\b\B/;
const IDENT_RE$2 = "[a-zA-Z]\\w*";
const UNDERSCORE_IDENT_RE = "[a-zA-Z_]\\w*";
const NUMBER_RE = "\\b\\d+(\\.\\d+)?";
const C_NUMBER_RE = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";
const BINARY_NUMBER_RE = "\\b(0b[01]+)";
const RE_STARTERS_RE = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
const SHEBANG = (opts = {}) => {
  const beginShebang = /^#![ ]*\//;
  if (opts.binary) {
    opts.begin = concat$1(
      beginShebang,
      /.*\b/,
      opts.binary,
      /\b.*/
    );
  }
  return inherit$1({
    scope: "meta",
    begin: beginShebang,
    end: /$/,
    relevance: 0,
    /** @type {ModeCallback} */
    "on:begin": (m2, resp) => {
      if (m2.index !== 0)
        resp.ignoreMatch();
    }
  }, opts);
};
const BACKSLASH_ESCAPE = {
  begin: "\\\\[\\s\\S]",
  relevance: 0
};
const APOS_STRING_MODE = {
  scope: "string",
  begin: "'",
  end: "'",
  illegal: "\\n",
  contains: [BACKSLASH_ESCAPE]
};
const QUOTE_STRING_MODE = {
  scope: "string",
  begin: '"',
  end: '"',
  illegal: "\\n",
  contains: [BACKSLASH_ESCAPE]
};
const PHRASAL_WORDS_MODE = {
  begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
};
const COMMENT = function(begin, end2, modeOptions = {}) {
  const mode = inherit$1(
    {
      scope: "comment",
      begin,
      end: end2,
      contains: []
    },
    modeOptions
  );
  mode.contains.push({
    scope: "doctag",
    // hack to avoid the space from being included. the space is necessary to
    // match here to prevent the plain text rule below from gobbling up doctags
    begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
    end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
    excludeBegin: true,
    relevance: 0
  });
  const ENGLISH_WORD = either$1(
    // list of common 1 and 2 letter words in English
    "I",
    "a",
    "is",
    "so",
    "us",
    "to",
    "at",
    "if",
    "in",
    "it",
    "on",
    // note: this is not an exhaustive list of contractions, just popular ones
    /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
    // contractions - can't we'd they're let's, etc
    /[A-Za-z]+[-][a-z]+/,
    // `no-way`, etc.
    /[A-Za-z][a-z]{2,}/
    // allow capitalized words at beginning of sentences
  );
  mode.contains.push(
    {
      // TODO: how to include ", (, ) without breaking grammars that use these for
      // comment delimiters?
      // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
      // ---
      // this tries to find sequences of 3 english words in a row (without any
      // "programming" type syntax) this gives us a strong signal that we've
      // TRULY found a comment - vs perhaps scanning with the wrong language.
      // It's possible to find something that LOOKS like the start of the
      // comment - but then if there is no readable text - good chance it is a
      // false match and not a comment.
      //
      // for a visual example please see:
      // https://github.com/highlightjs/highlight.js/issues/2827
      begin: concat$1(
        /[ ]+/,
        // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
        "(",
        ENGLISH_WORD,
        /[.]?[:]?([.][ ]|[ ])/,
        "){3}"
      )
      // look for 3 words in a row
    }
  );
  return mode;
};
const C_LINE_COMMENT_MODE = COMMENT("//", "$");
const C_BLOCK_COMMENT_MODE = COMMENT("/\\*", "\\*/");
const HASH_COMMENT_MODE = COMMENT("#", "$");
const NUMBER_MODE = {
  scope: "number",
  begin: NUMBER_RE,
  relevance: 0
};
const C_NUMBER_MODE = {
  scope: "number",
  begin: C_NUMBER_RE,
  relevance: 0
};
const BINARY_NUMBER_MODE = {
  scope: "number",
  begin: BINARY_NUMBER_RE,
  relevance: 0
};
const REGEXP_MODE = {
  scope: "regexp",
  begin: /\/(?=[^/\n]*\/)/,
  end: /\/[gimuy]*/,
  contains: [
    BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [BACKSLASH_ESCAPE]
    }
  ]
};
const TITLE_MODE = {
  scope: "title",
  begin: IDENT_RE$2,
  relevance: 0
};
const UNDERSCORE_TITLE_MODE = {
  scope: "title",
  begin: UNDERSCORE_IDENT_RE,
  relevance: 0
};
const METHOD_GUARD = {
  // excludes method names from keyword processing
  begin: "\\.\\s*" + UNDERSCORE_IDENT_RE,
  relevance: 0
};
const END_SAME_AS_BEGIN = function(mode) {
  return Object.assign(
    mode,
    {
      /** @type {ModeCallback} */
      "on:begin": (m2, resp) => {
        resp.data._beginMatch = m2[1];
      },
      /** @type {ModeCallback} */
      "on:end": (m2, resp) => {
        if (resp.data._beginMatch !== m2[1])
          resp.ignoreMatch();
      }
    }
  );
};
var MODES$3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  APOS_STRING_MODE,
  BACKSLASH_ESCAPE,
  BINARY_NUMBER_MODE,
  BINARY_NUMBER_RE,
  COMMENT,
  C_BLOCK_COMMENT_MODE,
  C_LINE_COMMENT_MODE,
  C_NUMBER_MODE,
  C_NUMBER_RE,
  END_SAME_AS_BEGIN,
  HASH_COMMENT_MODE,
  IDENT_RE: IDENT_RE$2,
  MATCH_NOTHING_RE,
  METHOD_GUARD,
  NUMBER_MODE,
  NUMBER_RE,
  PHRASAL_WORDS_MODE,
  QUOTE_STRING_MODE,
  REGEXP_MODE,
  RE_STARTERS_RE,
  SHEBANG,
  TITLE_MODE,
  UNDERSCORE_IDENT_RE,
  UNDERSCORE_TITLE_MODE
});
function skipIfHasPrecedingDot(match, response) {
  const before = match.input[match.index - 1];
  if (before === ".") {
    response.ignoreMatch();
  }
}
function scopeClassName(mode, _parent) {
  if (mode.className !== void 0) {
    mode.scope = mode.className;
    delete mode.className;
  }
}
function beginKeywords(mode, parent) {
  if (!parent)
    return;
  if (!mode.beginKeywords)
    return;
  mode.begin = "\\b(" + mode.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)";
  mode.__beforeBegin = skipIfHasPrecedingDot;
  mode.keywords = mode.keywords || mode.beginKeywords;
  delete mode.beginKeywords;
  if (mode.relevance === void 0)
    mode.relevance = 0;
}
function compileIllegal(mode, _parent) {
  if (!Array.isArray(mode.illegal))
    return;
  mode.illegal = either$1(...mode.illegal);
}
function compileMatch(mode, _parent) {
  if (!mode.match)
    return;
  if (mode.begin || mode.end)
    throw new Error("begin & end are not supported with match");
  mode.begin = mode.match;
  delete mode.match;
}
function compileRelevance(mode, _parent) {
  if (mode.relevance === void 0)
    mode.relevance = 1;
}
const beforeMatchExt = (mode, parent) => {
  if (!mode.beforeMatch)
    return;
  if (mode.starts)
    throw new Error("beforeMatch cannot be used with starts");
  const originalMode = Object.assign({}, mode);
  Object.keys(mode).forEach((key2) => {
    delete mode[key2];
  });
  mode.keywords = originalMode.keywords;
  mode.begin = concat$1(originalMode.beforeMatch, lookahead$1(originalMode.begin));
  mode.starts = {
    relevance: 0,
    contains: [
      Object.assign(originalMode, { endsParent: true })
    ]
  };
  mode.relevance = 0;
  delete originalMode.beforeMatch;
};
const COMMON_KEYWORDS = [
  "of",
  "and",
  "for",
  "in",
  "not",
  "or",
  "if",
  "then",
  "parent",
  // common variable name
  "list",
  // common variable name
  "value"
  // common variable name
];
const DEFAULT_KEYWORD_SCOPE = "keyword";
function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
  const compiledKeywords = /* @__PURE__ */ Object.create(null);
  if (typeof rawKeywords === "string") {
    compileList2(scopeName, rawKeywords.split(" "));
  } else if (Array.isArray(rawKeywords)) {
    compileList2(scopeName, rawKeywords);
  } else {
    Object.keys(rawKeywords).forEach(function(scopeName2) {
      Object.assign(
        compiledKeywords,
        compileKeywords(rawKeywords[scopeName2], caseInsensitive, scopeName2)
      );
    });
  }
  return compiledKeywords;
  function compileList2(scopeName2, keywordList) {
    if (caseInsensitive) {
      keywordList = keywordList.map((x2) => x2.toLowerCase());
    }
    keywordList.forEach(function(keyword) {
      const pair = keyword.split("|");
      compiledKeywords[pair[0]] = [scopeName2, scoreForKeyword(pair[0], pair[1])];
    });
  }
}
function scoreForKeyword(keyword, providedScore) {
  if (providedScore) {
    return Number(providedScore);
  }
  return commonKeyword(keyword) ? 0 : 1;
}
function commonKeyword(keyword) {
  return COMMON_KEYWORDS.includes(keyword.toLowerCase());
}
const seenDeprecations = {};
const error = (message) => {
  console.error(message);
};
const warn = (message, ...args) => {
  console.log(`WARN: ${message}`, ...args);
};
const deprecated = (version2, message) => {
  if (seenDeprecations[`${version2}/${message}`])
    return;
  console.log(`Deprecated as of ${version2}. ${message}`);
  seenDeprecations[`${version2}/${message}`] = true;
};
const MultiClassError = new Error();
function remapScopeNames(mode, regexes, { key: key2 }) {
  let offset = 0;
  const scopeNames = mode[key2];
  const emit = {};
  const positions = {};
  for (let i = 1; i <= regexes.length; i++) {
    positions[i + offset] = scopeNames[i];
    emit[i + offset] = true;
    offset += countMatchGroups(regexes[i - 1]);
  }
  mode[key2] = positions;
  mode[key2]._emit = emit;
  mode[key2]._multi = true;
}
function beginMultiClass(mode) {
  if (!Array.isArray(mode.begin))
    return;
  if (mode.skip || mode.excludeBegin || mode.returnBegin) {
    error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
    throw MultiClassError;
  }
  if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
    error("beginScope must be object");
    throw MultiClassError;
  }
  remapScopeNames(mode, mode.begin, { key: "beginScope" });
  mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
}
function endMultiClass(mode) {
  if (!Array.isArray(mode.end))
    return;
  if (mode.skip || mode.excludeEnd || mode.returnEnd) {
    error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
    throw MultiClassError;
  }
  if (typeof mode.endScope !== "object" || mode.endScope === null) {
    error("endScope must be object");
    throw MultiClassError;
  }
  remapScopeNames(mode, mode.end, { key: "endScope" });
  mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
}
function scopeSugar(mode) {
  if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
    mode.beginScope = mode.scope;
    delete mode.scope;
  }
}
function MultiClass(mode) {
  scopeSugar(mode);
  if (typeof mode.beginScope === "string") {
    mode.beginScope = { _wrap: mode.beginScope };
  }
  if (typeof mode.endScope === "string") {
    mode.endScope = { _wrap: mode.endScope };
  }
  beginMultiClass(mode);
  endMultiClass(mode);
}
function compileLanguage(language) {
  function langRe(value, globalThis) {
    return new RegExp(
      source$1(value),
      "m" + (language.case_insensitive ? "i" : "") + (language.unicodeRegex ? "u" : "") + (globalThis ? "g" : "")
    );
  }
  class MultiRegex {
    constructor() {
      this.matchIndexes = {};
      this.regexes = [];
      this.matchAt = 1;
      this.position = 0;
    }
    // @ts-ignore
    addRule(re, opts) {
      opts.position = this.position++;
      this.matchIndexes[this.matchAt] = opts;
      this.regexes.push([opts, re]);
      this.matchAt += countMatchGroups(re) + 1;
    }
    compile() {
      if (this.regexes.length === 0) {
        this.exec = () => null;
      }
      const terminators = this.regexes.map((el) => el[1]);
      this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: "|" }), true);
      this.lastIndex = 0;
    }
    /** @param {string} s */
    exec(s2) {
      this.matcherRe.lastIndex = this.lastIndex;
      const match = this.matcherRe.exec(s2);
      if (!match) {
        return null;
      }
      const i = match.findIndex((el, i2) => i2 > 0 && el !== void 0);
      const matchData = this.matchIndexes[i];
      match.splice(0, i);
      return Object.assign(match, matchData);
    }
  }
  class ResumableMultiRegex {
    constructor() {
      this.rules = [];
      this.multiRegexes = [];
      this.count = 0;
      this.lastIndex = 0;
      this.regexIndex = 0;
    }
    // @ts-ignore
    getMatcher(index) {
      if (this.multiRegexes[index])
        return this.multiRegexes[index];
      const matcher = new MultiRegex();
      this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
      matcher.compile();
      this.multiRegexes[index] = matcher;
      return matcher;
    }
    resumingScanAtSamePosition() {
      return this.regexIndex !== 0;
    }
    considerAll() {
      this.regexIndex = 0;
    }
    // @ts-ignore
    addRule(re, opts) {
      this.rules.push([re, opts]);
      if (opts.type === "begin")
        this.count++;
    }
    /** @param {string} s */
    exec(s2) {
      const m2 = this.getMatcher(this.regexIndex);
      m2.lastIndex = this.lastIndex;
      let result = m2.exec(s2);
      if (this.resumingScanAtSamePosition()) {
        if (result && result.index === this.lastIndex)
          ;
        else {
          const m22 = this.getMatcher(0);
          m22.lastIndex = this.lastIndex + 1;
          result = m22.exec(s2);
        }
      }
      if (result) {
        this.regexIndex += result.position + 1;
        if (this.regexIndex === this.count) {
          this.considerAll();
        }
      }
      return result;
    }
  }
  function buildModeRegex(mode) {
    const mm = new ResumableMultiRegex();
    mode.contains.forEach((term) => mm.addRule(term.begin, { rule: term, type: "begin" }));
    if (mode.terminatorEnd) {
      mm.addRule(mode.terminatorEnd, { type: "end" });
    }
    if (mode.illegal) {
      mm.addRule(mode.illegal, { type: "illegal" });
    }
    return mm;
  }
  function compileMode(mode, parent) {
    const cmode = (
      /** @type CompiledMode */
      mode
    );
    if (mode.isCompiled)
      return cmode;
    [
      scopeClassName,
      // do this early so compiler extensions generally don't have to worry about
      // the distinction between match/begin
      compileMatch,
      MultiClass,
      beforeMatchExt
    ].forEach((ext) => ext(mode, parent));
    language.compilerExtensions.forEach((ext) => ext(mode, parent));
    mode.__beforeBegin = null;
    [
      beginKeywords,
      // do this later so compiler extensions that come earlier have access to the
      // raw array if they wanted to perhaps manipulate it, etc.
      compileIllegal,
      // default to 1 relevance if not specified
      compileRelevance
    ].forEach((ext) => ext(mode, parent));
    mode.isCompiled = true;
    let keywordPattern = null;
    if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
      mode.keywords = Object.assign({}, mode.keywords);
      keywordPattern = mode.keywords.$pattern;
      delete mode.keywords.$pattern;
    }
    keywordPattern = keywordPattern || /\w+/;
    if (mode.keywords) {
      mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
    }
    cmode.keywordPatternRe = langRe(keywordPattern, true);
    if (parent) {
      if (!mode.begin)
        mode.begin = /\B|\b/;
      cmode.beginRe = langRe(cmode.begin);
      if (!mode.end && !mode.endsWithParent)
        mode.end = /\B|\b/;
      if (mode.end)
        cmode.endRe = langRe(cmode.end);
      cmode.terminatorEnd = source$1(cmode.end) || "";
      if (mode.endsWithParent && parent.terminatorEnd) {
        cmode.terminatorEnd += (mode.end ? "|" : "") + parent.terminatorEnd;
      }
    }
    if (mode.illegal)
      cmode.illegalRe = langRe(
        /** @type {RegExp | string} */
        mode.illegal
      );
    if (!mode.contains)
      mode.contains = [];
    mode.contains = [].concat(...mode.contains.map(function(c2) {
      return expandOrCloneMode(c2 === "self" ? mode : c2);
    }));
    mode.contains.forEach(function(c2) {
      compileMode(
        /** @type Mode */
        c2,
        cmode
      );
    });
    if (mode.starts) {
      compileMode(mode.starts, parent);
    }
    cmode.matcher = buildModeRegex(cmode);
    return cmode;
  }
  if (!language.compilerExtensions)
    language.compilerExtensions = [];
  if (language.contains && language.contains.includes("self")) {
    throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
  }
  language.classNameAliases = inherit$1(language.classNameAliases || {});
  return compileMode(
    /** @type Mode */
    language
  );
}
function dependencyOnParent(mode) {
  if (!mode)
    return false;
  return mode.endsWithParent || dependencyOnParent(mode.starts);
}
function expandOrCloneMode(mode) {
  if (mode.variants && !mode.cachedVariants) {
    mode.cachedVariants = mode.variants.map(function(variant) {
      return inherit$1(mode, { variants: null }, variant);
    });
  }
  if (mode.cachedVariants) {
    return mode.cachedVariants;
  }
  if (dependencyOnParent(mode)) {
    return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
  }
  if (Object.isFrozen(mode)) {
    return inherit$1(mode);
  }
  return mode;
}
var version = "11.11.1";
class HTMLInjectionError extends Error {
  constructor(reason, html) {
    super(reason);
    this.name = "HTMLInjectionError";
    this.html = html;
  }
}
const escape$1 = escapeHTML;
const inherit = inherit$1;
const NO_MATCH = Symbol("nomatch");
const MAX_KEYWORD_HITS = 7;
const HLJS = function(hljs) {
  const languages = /* @__PURE__ */ Object.create(null);
  const aliases = /* @__PURE__ */ Object.create(null);
  const plugins2 = [];
  let SAFE_MODE = true;
  const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
  const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: "Plain text", contains: [] };
  let options = {
    ignoreUnescapedHTML: false,
    throwUnescapedHTML: false,
    noHighlightRe: /^(no-?highlight)$/i,
    languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
    classPrefix: "hljs-",
    cssSelector: "pre code",
    languages: null,
    // beta configuration options, subject to change, welcome to discuss
    // https://github.com/highlightjs/highlight.js/issues/1086
    __emitter: TokenTreeEmitter
  };
  function shouldNotHighlight(languageName) {
    return options.noHighlightRe.test(languageName);
  }
  function blockLanguage(block2) {
    let classes = block2.className + " ";
    classes += block2.parentNode ? block2.parentNode.className : "";
    const match = options.languageDetectRe.exec(classes);
    if (match) {
      const language = getLanguage(match[1]);
      if (!language) {
        warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
        warn("Falling back to no-highlight mode for this block.", block2);
      }
      return language ? match[1] : "no-highlight";
    }
    return classes.split(/\s+/).find((_class2) => shouldNotHighlight(_class2) || getLanguage(_class2));
  }
  function highlight2(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
    let code2 = "";
    let languageName = "";
    if (typeof optionsOrCode === "object") {
      code2 = codeOrLanguageName;
      ignoreIllegals = optionsOrCode.ignoreIllegals;
      languageName = optionsOrCode.language;
    } else {
      deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
      deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
      languageName = codeOrLanguageName;
      code2 = optionsOrCode;
    }
    if (ignoreIllegals === void 0) {
      ignoreIllegals = true;
    }
    const context = {
      code: code2,
      language: languageName
    };
    fire2("before:highlight", context);
    const result = context.result ? context.result : _highlight(context.language, context.code, ignoreIllegals);
    result.code = context.code;
    fire2("after:highlight", result);
    return result;
  }
  function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
    const keywordHits = /* @__PURE__ */ Object.create(null);
    function keywordData(mode, matchText) {
      return mode.keywords[matchText];
    }
    function processKeywords() {
      if (!top2.keywords) {
        emitter.addText(modeBuffer);
        return;
      }
      let lastIndex = 0;
      top2.keywordPatternRe.lastIndex = 0;
      let match = top2.keywordPatternRe.exec(modeBuffer);
      let buf = "";
      while (match) {
        buf += modeBuffer.substring(lastIndex, match.index);
        const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
        const data = keywordData(top2, word);
        if (data) {
          const [kind, keywordRelevance] = data;
          emitter.addText(buf);
          buf = "";
          keywordHits[word] = (keywordHits[word] || 0) + 1;
          if (keywordHits[word] <= MAX_KEYWORD_HITS)
            relevance += keywordRelevance;
          if (kind.startsWith("_")) {
            buf += match[0];
          } else {
            const cssClass = language.classNameAliases[kind] || kind;
            emitKeyword(match[0], cssClass);
          }
        } else {
          buf += match[0];
        }
        lastIndex = top2.keywordPatternRe.lastIndex;
        match = top2.keywordPatternRe.exec(modeBuffer);
      }
      buf += modeBuffer.substring(lastIndex);
      emitter.addText(buf);
    }
    function processSubLanguage() {
      if (modeBuffer === "")
        return;
      let result2 = null;
      if (typeof top2.subLanguage === "string") {
        if (!languages[top2.subLanguage]) {
          emitter.addText(modeBuffer);
          return;
        }
        result2 = _highlight(top2.subLanguage, modeBuffer, true, continuations[top2.subLanguage]);
        continuations[top2.subLanguage] = /** @type {CompiledMode} */
        result2._top;
      } else {
        result2 = highlightAuto(modeBuffer, top2.subLanguage.length ? top2.subLanguage : null);
      }
      if (top2.relevance > 0) {
        relevance += result2.relevance;
      }
      emitter.__addSublanguage(result2._emitter, result2.language);
    }
    function processBuffer() {
      if (top2.subLanguage != null) {
        processSubLanguage();
      } else {
        processKeywords();
      }
      modeBuffer = "";
    }
    function emitKeyword(keyword, scope) {
      if (keyword === "")
        return;
      emitter.startScope(scope);
      emitter.addText(keyword);
      emitter.endScope();
    }
    function emitMultiClass(scope, match) {
      let i = 1;
      const max2 = match.length - 1;
      while (i <= max2) {
        if (!scope._emit[i]) {
          i++;
          continue;
        }
        const klass = language.classNameAliases[scope[i]] || scope[i];
        const text2 = match[i];
        if (klass) {
          emitKeyword(text2, klass);
        } else {
          modeBuffer = text2;
          processKeywords();
          modeBuffer = "";
        }
        i++;
      }
    }
    function startNewMode(mode, match) {
      if (mode.scope && typeof mode.scope === "string") {
        emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
      }
      if (mode.beginScope) {
        if (mode.beginScope._wrap) {
          emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
          modeBuffer = "";
        } else if (mode.beginScope._multi) {
          emitMultiClass(mode.beginScope, match);
          modeBuffer = "";
        }
      }
      top2 = Object.create(mode, { parent: { value: top2 } });
      return top2;
    }
    function endOfMode(mode, match, matchPlusRemainder) {
      let matched = startsWith(mode.endRe, matchPlusRemainder);
      if (matched) {
        if (mode["on:end"]) {
          const resp = new Response(mode);
          mode["on:end"](match, resp);
          if (resp.isMatchIgnored)
            matched = false;
        }
        if (matched) {
          while (mode.endsParent && mode.parent) {
            mode = mode.parent;
          }
          return mode;
        }
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, match, matchPlusRemainder);
      }
    }
    function doIgnore(lexeme) {
      if (top2.matcher.regexIndex === 0) {
        modeBuffer += lexeme[0];
        return 1;
      } else {
        resumeScanAtSamePosition = true;
        return 0;
      }
    }
    function doBeginMatch(match) {
      const lexeme = match[0];
      const newMode = match.rule;
      const resp = new Response(newMode);
      const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
      for (const cb of beforeCallbacks) {
        if (!cb)
          continue;
        cb(match, resp);
        if (resp.isMatchIgnored)
          return doIgnore(lexeme);
      }
      if (newMode.skip) {
        modeBuffer += lexeme;
      } else {
        if (newMode.excludeBegin) {
          modeBuffer += lexeme;
        }
        processBuffer();
        if (!newMode.returnBegin && !newMode.excludeBegin) {
          modeBuffer = lexeme;
        }
      }
      startNewMode(newMode, match);
      return newMode.returnBegin ? 0 : lexeme.length;
    }
    function doEndMatch(match) {
      const lexeme = match[0];
      const matchPlusRemainder = codeToHighlight.substring(match.index);
      const endMode = endOfMode(top2, match, matchPlusRemainder);
      if (!endMode) {
        return NO_MATCH;
      }
      const origin = top2;
      if (top2.endScope && top2.endScope._wrap) {
        processBuffer();
        emitKeyword(lexeme, top2.endScope._wrap);
      } else if (top2.endScope && top2.endScope._multi) {
        processBuffer();
        emitMultiClass(top2.endScope, match);
      } else if (origin.skip) {
        modeBuffer += lexeme;
      } else {
        if (!(origin.returnEnd || origin.excludeEnd)) {
          modeBuffer += lexeme;
        }
        processBuffer();
        if (origin.excludeEnd) {
          modeBuffer = lexeme;
        }
      }
      do {
        if (top2.scope) {
          emitter.closeNode();
        }
        if (!top2.skip && !top2.subLanguage) {
          relevance += top2.relevance;
        }
        top2 = top2.parent;
      } while (top2 !== endMode.parent);
      if (endMode.starts) {
        startNewMode(endMode.starts, match);
      }
      return origin.returnEnd ? 0 : lexeme.length;
    }
    function processContinuations() {
      const list2 = [];
      for (let current = top2; current !== language; current = current.parent) {
        if (current.scope) {
          list2.unshift(current.scope);
        }
      }
      list2.forEach((item) => emitter.openNode(item));
    }
    let lastMatch = {};
    function processLexeme(textBeforeMatch, match) {
      const lexeme = match && match[0];
      modeBuffer += textBeforeMatch;
      if (lexeme == null) {
        processBuffer();
        return 0;
      }
      if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
        modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
        if (!SAFE_MODE) {
          const err = new Error(`0 width match regex (${languageName})`);
          err.languageName = languageName;
          err.badRule = lastMatch.rule;
          throw err;
        }
        return 1;
      }
      lastMatch = match;
      if (match.type === "begin") {
        return doBeginMatch(match);
      } else if (match.type === "illegal" && !ignoreIllegals) {
        const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top2.scope || "<unnamed>") + '"');
        err.mode = top2;
        throw err;
      } else if (match.type === "end") {
        const processed = doEndMatch(match);
        if (processed !== NO_MATCH) {
          return processed;
        }
      }
      if (match.type === "illegal" && lexeme === "") {
        modeBuffer += "\n";
        return 1;
      }
      if (iterations > 1e5 && iterations > match.index * 3) {
        const err = new Error("potential infinite loop, way more iterations than matches");
        throw err;
      }
      modeBuffer += lexeme;
      return lexeme.length;
    }
    const language = getLanguage(languageName);
    if (!language) {
      error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
      throw new Error('Unknown language: "' + languageName + '"');
    }
    const md2 = compileLanguage(language);
    let result = "";
    let top2 = continuation || md2;
    const continuations = {};
    const emitter = new options.__emitter(options);
    processContinuations();
    let modeBuffer = "";
    let relevance = 0;
    let index = 0;
    let iterations = 0;
    let resumeScanAtSamePosition = false;
    try {
      if (!language.__emitTokens) {
        top2.matcher.considerAll();
        for (; ; ) {
          iterations++;
          if (resumeScanAtSamePosition) {
            resumeScanAtSamePosition = false;
          } else {
            top2.matcher.considerAll();
          }
          top2.matcher.lastIndex = index;
          const match = top2.matcher.exec(codeToHighlight);
          if (!match)
            break;
          const beforeMatch = codeToHighlight.substring(index, match.index);
          const processedCount = processLexeme(beforeMatch, match);
          index = match.index + processedCount;
        }
        processLexeme(codeToHighlight.substring(index));
      } else {
        language.__emitTokens(codeToHighlight, emitter);
      }
      emitter.finalize();
      result = emitter.toHTML();
      return {
        language: languageName,
        value: result,
        relevance,
        illegal: false,
        _emitter: emitter,
        _top: top2
      };
    } catch (err) {
      if (err.message && err.message.includes("Illegal")) {
        return {
          language: languageName,
          value: escape$1(codeToHighlight),
          illegal: true,
          relevance: 0,
          _illegalBy: {
            message: err.message,
            index,
            context: codeToHighlight.slice(index - 100, index + 100),
            mode: err.mode,
            resultSoFar: result
          },
          _emitter: emitter
        };
      } else if (SAFE_MODE) {
        return {
          language: languageName,
          value: escape$1(codeToHighlight),
          illegal: false,
          relevance: 0,
          errorRaised: err,
          _emitter: emitter,
          _top: top2
        };
      } else {
        throw err;
      }
    }
  }
  function justTextHighlightResult(code2) {
    const result = {
      value: escape$1(code2),
      illegal: false,
      relevance: 0,
      _top: PLAINTEXT_LANGUAGE,
      _emitter: new options.__emitter(options)
    };
    result._emitter.addText(code2);
    return result;
  }
  function highlightAuto(code2, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    const plaintext = justTextHighlightResult(code2);
    const results = languageSubset.filter(getLanguage).filter(autoDetection).map(
      (name2) => _highlight(name2, code2, false)
    );
    results.unshift(plaintext);
    const sorted = results.sort((a2, b2) => {
      if (a2.relevance !== b2.relevance)
        return b2.relevance - a2.relevance;
      if (a2.language && b2.language) {
        if (getLanguage(a2.language).supersetOf === b2.language) {
          return 1;
        } else if (getLanguage(b2.language).supersetOf === a2.language) {
          return -1;
        }
      }
      return 0;
    });
    const [best, secondBest] = sorted;
    const result = best;
    result.secondBest = secondBest;
    return result;
  }
  function updateClassName(element, currentLang, resultLang) {
    const language = currentLang && aliases[currentLang] || resultLang;
    element.classList.add("hljs");
    element.classList.add(`language-${language}`);
  }
  function highlightElement(element) {
    let node = null;
    const language = blockLanguage(element);
    if (shouldNotHighlight(language))
      return;
    fire2(
      "before:highlightElement",
      { el: element, language }
    );
    if (element.dataset.highlighted) {
      console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
      return;
    }
    if (element.children.length > 0) {
      if (!options.ignoreUnescapedHTML) {
        console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
        console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
        console.warn("The element with unescaped HTML:");
        console.warn(element);
      }
      if (options.throwUnescapedHTML) {
        const err = new HTMLInjectionError(
          "One of your code blocks includes unescaped HTML.",
          element.innerHTML
        );
        throw err;
      }
    }
    node = element;
    const text2 = node.textContent;
    const result = language ? highlight2(text2, { language, ignoreIllegals: true }) : highlightAuto(text2);
    element.innerHTML = result.value;
    element.dataset.highlighted = "yes";
    updateClassName(element, language, result.language);
    element.result = {
      language: result.language,
      // TODO: remove with version 11.0
      re: result.relevance,
      relevance: result.relevance
    };
    if (result.secondBest) {
      element.secondBest = {
        language: result.secondBest.language,
        relevance: result.secondBest.relevance
      };
    }
    fire2("after:highlightElement", { el: element, result, text: text2 });
  }
  function configure(userOptions) {
    options = inherit(options, userOptions);
  }
  const initHighlighting = () => {
    highlightAll();
    deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
  };
  function initHighlightingOnLoad() {
    highlightAll();
    deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
  }
  let wantsHighlight = false;
  function highlightAll() {
    function boot2() {
      highlightAll();
    }
    if (document.readyState === "loading") {
      if (!wantsHighlight) {
        window.addEventListener("DOMContentLoaded", boot2, false);
      }
      wantsHighlight = true;
      return;
    }
    const blocks = document.querySelectorAll(options.cssSelector);
    blocks.forEach(highlightElement);
  }
  function registerLanguage(languageName, languageDefinition) {
    let lang = null;
    try {
      lang = languageDefinition(hljs);
    } catch (error$1) {
      error("Language definition for '{}' could not be registered.".replace("{}", languageName));
      if (!SAFE_MODE) {
        throw error$1;
      } else {
        error(error$1);
      }
      lang = PLAINTEXT_LANGUAGE;
    }
    if (!lang.name)
      lang.name = languageName;
    languages[languageName] = lang;
    lang.rawDefinition = languageDefinition.bind(null, hljs);
    if (lang.aliases) {
      registerAliases(lang.aliases, { languageName });
    }
  }
  function unregisterLanguage(languageName) {
    delete languages[languageName];
    for (const alias of Object.keys(aliases)) {
      if (aliases[alias] === languageName) {
        delete aliases[alias];
      }
    }
  }
  function listLanguages() {
    return Object.keys(languages);
  }
  function getLanguage(name2) {
    name2 = (name2 || "").toLowerCase();
    return languages[name2] || languages[aliases[name2]];
  }
  function registerAliases(aliasList, { languageName }) {
    if (typeof aliasList === "string") {
      aliasList = [aliasList];
    }
    aliasList.forEach((alias) => {
      aliases[alias.toLowerCase()] = languageName;
    });
  }
  function autoDetection(name2) {
    const lang = getLanguage(name2);
    return lang && !lang.disableAutodetect;
  }
  function upgradePluginAPI(plugin2) {
    if (plugin2["before:highlightBlock"] && !plugin2["before:highlightElement"]) {
      plugin2["before:highlightElement"] = (data) => {
        plugin2["before:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
    if (plugin2["after:highlightBlock"] && !plugin2["after:highlightElement"]) {
      plugin2["after:highlightElement"] = (data) => {
        plugin2["after:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
  }
  function addPlugin(plugin2) {
    upgradePluginAPI(plugin2);
    plugins2.push(plugin2);
  }
  function removePlugin(plugin2) {
    const index = plugins2.indexOf(plugin2);
    if (index !== -1) {
      plugins2.splice(index, 1);
    }
  }
  function fire2(event, args) {
    const cb = event;
    plugins2.forEach(function(plugin2) {
      if (plugin2[cb]) {
        plugin2[cb](args);
      }
    });
  }
  function deprecateHighlightBlock(el) {
    deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
    deprecated("10.7.0", "Please use highlightElement now.");
    return highlightElement(el);
  }
  Object.assign(hljs, {
    highlight: highlight2,
    highlightAuto,
    highlightAll,
    highlightElement,
    // TODO: Remove with v12 API
    highlightBlock: deprecateHighlightBlock,
    configure,
    initHighlighting,
    initHighlightingOnLoad,
    registerLanguage,
    unregisterLanguage,
    listLanguages,
    getLanguage,
    registerAliases,
    autoDetection,
    inherit,
    addPlugin,
    removePlugin
  });
  hljs.debugMode = function() {
    SAFE_MODE = false;
  };
  hljs.safeMode = function() {
    SAFE_MODE = true;
  };
  hljs.versionString = version;
  hljs.regex = {
    concat: concat$1,
    lookahead: lookahead$1,
    either: either$1,
    optional,
    anyNumberOfTimes
  };
  for (const key2 in MODES$3) {
    if (typeof MODES$3[key2] === "object") {
      deepFreeze(MODES$3[key2]);
    }
  }
  Object.assign(hljs, MODES$3);
  return hljs;
};
const highlight = HLJS({});
highlight.newInstance = () => HLJS({});
var core$1 = highlight;
highlight.HighlightJS = highlight;
highlight.default = highlight;
const HighlightJS = /* @__PURE__ */ getDefaultExportFromCjs(core$1);
const IDENT_RE$1 = "[A-Za-z$_][0-9A-Za-z$_]*";
const KEYWORDS$1 = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
];
const LITERALS$1 = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];
const TYPES$1 = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];
const ERROR_TYPES$1 = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];
const BUILT_IN_GLOBALS$1 = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];
const BUILT_IN_VARIABLES$1 = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "globalThis"
  // Node.js
];
const BUILT_INS$1 = [].concat(
  BUILT_IN_GLOBALS$1,
  TYPES$1,
  ERROR_TYPES$1
);
function javascript$1(hljs) {
  const regex = hljs.regex;
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };
  const IDENT_RE$1$1 = IDENT_RE$1;
  const FRAGMENT = {
    begin: "<>",
    end: "</>"
  };
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
      ) {
        response.ignoreMatch();
        return;
      }
      if (nextChar === ">") {
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
      let m2;
      const afterMatch = match.input.substring(afterMatchIndex);
      if (m2 = afterMatch.match(/^\s*=/)) {
        response.ignoreMatch();
        return;
      }
      if (m2 = afterMatch.match(/^\s+extends\s+/)) {
        if (m2.index === 0) {
          response.ignoreMatch();
          return;
        }
      }
    }
  };
  const KEYWORDS$1$1 = {
    $pattern: IDENT_RE$1,
    keyword: KEYWORDS$1,
    literal: LITERALS$1,
    built_in: BUILT_INS$1,
    "variable.language": BUILT_IN_VARIABLES$1
  };
  const decimalDigits2 = "[0-9](_?[0-9])*";
  const frac2 = `\\.(${decimalDigits2})`;
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac2})|\\.)?|(${frac2}))[eE][+-]?(${decimalDigits2})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac2})\\b|\\.)?|(${frac2})\\b` },
      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  };
  const SUBST = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: KEYWORDS$1$1,
    contains: []
    // defined later
  };
  const HTML_TEMPLATE = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "xml"
    }
  };
  const CSS_TEMPLATE = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "css"
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "graphql"
    }
  };
  const TEMPLATE_STRING = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    "\\*/",
    {
      relevance: 0,
      contains: [
        {
          begin: "(?=@[A-Za-z]+)",
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            },
            {
              className: "type",
              begin: "\\{",
              end: "\\}",
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: "variable",
              begin: IDENT_RE$1$1 + "(?=\\s*(-)|$)",
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT2 = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS$1$1,
    contains: [
      "self"
    ].concat(SUBST_INTERNALS)
  });
  const SUBST_AND_COMMENTS = [].concat(COMMENT2, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: KEYWORDS$1$1,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1$1,
    contains: PARAMS_CONTAINS
  };
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1$1,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$1$1, "(", regex.concat(/\./, IDENT_RE$1$1), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1$1
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES$1,
        ...ERROR_TYPES$1
      ]
    }
  };
  const USE_STRICT = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };
  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$1$1,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [PARAMS],
    illegal: /%/
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function noneOf(list2) {
    return regex.concat("(?!", list2.join("|"), ")");
  }
  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS$1,
        "super",
        "import"
      ].map((x2) => `${x2}\\s*\\(`)),
      IDENT_RE$1$1,
      regex.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  };
  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$1$1, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$1$1,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };
  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$1$1,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };
  const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/,
      /\s+/,
      IDENT_RE$1$1,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: KEYWORDS$1$1,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT2,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: "attr",
        match: IDENT_RE$1$1 + regex.lookahead(":"),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      {
        // "value" container
        begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          COMMENT2,
          hljs.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$1$1,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1$1, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + IDENT_RE$1$1,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [PARAMS]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
var decimalDigits$1 = "[0-9](_*[0-9])*";
var frac$1 = `\\.(${decimalDigits$1})`;
var hexDigits$1 = "[0-9a-fA-F](_*[0-9a-fA-F])*";
var NUMERIC$1 = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits$1})((${frac$1})|\\.)?|(${frac$1}))[eE][+-]?(${decimalDigits$1})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits$1})((${frac$1})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac$1})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits$1})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits$1})\\.?|(${hexDigits$1})?\\.(${hexDigits$1}))[pP][+-]?(${decimalDigits$1})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits$1})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function recurRegex(re, substitution, depth) {
  if (depth === -1)
    return "";
  return re.replace(substitution, (_) => {
    return recurRegex(re, substitution, depth - 1);
  });
}
function java(hljs) {
  const regex = hljs.regex;
  const JAVA_IDENT_RE = "[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*";
  const GENERIC_IDENT_RE = JAVA_IDENT_RE + recurRegex("(?:<" + JAVA_IDENT_RE + "~~~(?:\\s*,\\s*" + JAVA_IDENT_RE + "~~~)*>)?", /~~~/g, 2);
  const MAIN_KEYWORDS = [
    "synchronized",
    "abstract",
    "private",
    "var",
    "static",
    "if",
    "const ",
    "for",
    "while",
    "strictfp",
    "finally",
    "protected",
    "import",
    "native",
    "final",
    "void",
    "enum",
    "else",
    "break",
    "transient",
    "catch",
    "instanceof",
    "volatile",
    "case",
    "assert",
    "package",
    "default",
    "public",
    "try",
    "switch",
    "continue",
    "throws",
    "protected",
    "public",
    "private",
    "module",
    "requires",
    "exports",
    "do",
    "sealed",
    "yield",
    "permits",
    "goto",
    "when"
  ];
  const BUILT_INS2 = [
    "super",
    "this"
  ];
  const LITERALS2 = [
    "false",
    "true",
    "null"
  ];
  const TYPES2 = [
    "char",
    "boolean",
    "long",
    "float",
    "int",
    "byte",
    "short",
    "double"
  ];
  const KEYWORDS2 = {
    keyword: MAIN_KEYWORDS,
    literal: LITERALS2,
    type: TYPES2,
    built_in: BUILT_INS2
  };
  const ANNOTATION = {
    className: "meta",
    begin: "@" + JAVA_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: ["self"]
        // allow nested () inside our annotation
      }
    ]
  };
  const PARAMS = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS2,
    relevance: 0,
    contains: [hljs.C_BLOCK_COMMENT_MODE],
    endsParent: true
  };
  return {
    name: "Java",
    aliases: ["jsp"],
    keywords: KEYWORDS2,
    illegal: /<\/|#/,
    contains: [
      hljs.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              // eat up @'s in emails to prevent them to be recognized as doctags
              begin: /\w+@/,
              relevance: 0
            },
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      // relevance boost
      {
        begin: /import java\.[a-z]+\./,
        keywords: "import",
        relevance: 2
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        begin: /"""/,
        end: /"""/,
        className: "string",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        match: [
          /\b(?:class|interface|enum|extends|implements|new)/,
          /\s+/,
          JAVA_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        // Exceptions for hyphenated keywords
        match: /non-sealed/,
        scope: "keyword"
      },
      {
        begin: [
          regex.concat(/(?!else)/, JAVA_IDENT_RE),
          /\s+/,
          JAVA_IDENT_RE,
          /\s+/,
          /=(?!=)/
        ],
        className: {
          1: "type",
          3: "variable",
          5: "operator"
        }
      },
      {
        begin: [
          /record/,
          /\s+/,
          JAVA_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        },
        contains: [
          PARAMS,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new throw return else",
        relevance: 0
      },
      {
        begin: [
          "(?:" + GENERIC_IDENT_RE + "\\s+)",
          hljs.UNDERSCORE_IDENT_RE,
          /\s*(?=\()/
        ],
        className: { 2: "title.function" },
        keywords: KEYWORDS2,
        contains: [
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS2,
            relevance: 0,
            contains: [
              ANNOTATION,
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              NUMERIC$1,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      NUMERIC$1,
      ANNOTATION
    ]
  };
}
function bash(hljs) {
  const regex = hljs.regex;
  const VAR = {};
  const BRACED_VAR = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [VAR]
      }
      // default values
    ]
  };
  Object.assign(VAR, {
    className: "variable",
    variants: [
      { begin: regex.concat(
        /\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        `(?![\\w\\d])(?![$])`
      ) },
      BRACED_VAR
    ]
  });
  const SUBST = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  const COMMENT2 = hljs.inherit(
    hljs.COMMENT(),
    {
      match: [
        /(^|\s)/,
        /#.*$/
      ],
      scope: {
        2: "comment"
      }
    }
  );
  const HERE_DOC = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      hljs.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  };
  const QUOTE_STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      SUBST
    ]
  };
  SUBST.contains.push(QUOTE_STRING);
  const ESCAPED_QUOTE = {
    match: /\\"/
  };
  const APOS_STRING = {
    className: "string",
    begin: /'/,
    end: /'/
  };
  const ESCAPED_APOS = {
    match: /\\'/
  };
  const ARITHMETIC = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      hljs.NUMBER_MODE,
      VAR
    ]
  };
  const SH_LIKE_SHELLS = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh"
  ];
  const KNOWN_SHEBANG = hljs.SHEBANG({
    binary: `(${SH_LIKE_SHELLS.join("|")})`,
    relevance: 10
  });
  const FUNCTION = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: true,
    contains: [hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  };
  const KEYWORDS2 = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "time",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "coproc",
    "function",
    "select"
  ];
  const LITERALS2 = [
    "true",
    "false"
  ];
  const PATH_MODE = { match: /(\/[a-z._-]+)+/ };
  const SHELL_BUILT_INS = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ];
  const BASH_BUILT_INS = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "sudo",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ];
  const ZSH_BUILT_INS = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ];
  const GNU_CORE_UTILS = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];
  return {
    name: "Bash",
    aliases: [
      "sh",
      "zsh"
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: KEYWORDS2,
      literal: LITERALS2,
      built_in: [
        ...SHELL_BUILT_INS,
        ...BASH_BUILT_INS,
        // Shell modifiers
        "set",
        "shopt",
        ...ZSH_BUILT_INS,
        ...GNU_CORE_UTILS
      ]
    },
    contains: [
      KNOWN_SHEBANG,
      // to catch known shells and boost relevancy
      hljs.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      FUNCTION,
      ARITHMETIC,
      COMMENT2,
      HERE_DOC,
      PATH_MODE,
      QUOTE_STRING,
      ESCAPED_QUOTE,
      APOS_STRING,
      ESCAPED_APOS,
      VAR
    ]
  };
}
function c(hljs) {
  const regex = hljs.regex;
  const C_LINE_COMMENT_MODE2 = hljs.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] });
  const DECLTYPE_AUTO_RE = "decltype\\(auto\\)";
  const NAMESPACE_RE = "[a-zA-Z_]\\w*::";
  const TEMPLATE_ARGUMENT_RE = "<[^<>]+>";
  const FUNCTION_TYPE_RE = "(" + DECLTYPE_AUTO_RE + "|" + regex.optional(NAMESPACE_RE) + "[a-zA-Z_]\\w*" + regex.optional(TEMPLATE_ARGUMENT_RE) + ")";
  const TYPES2 = {
    className: "type",
    variants: [
      { begin: "\\b[a-z\\d_]*_t\\b" },
      { match: /\batomic_[a-z]{3,6}\b/ }
    ]
  };
  const CHARACTER_ESCAPES = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)";
  const STRINGS = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + CHARACTER_ESCAPES + "|.)",
        end: "'",
        illegal: "."
      },
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  };
  const NUMBERS = {
    className: "number",
    variants: [
      { match: /\b(0b[01']+)/ },
      { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },
      { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },
      { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }
    ],
    relevance: 0
  };
  const PREPROCESSOR = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef elifdef elifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE2,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };
  const TITLE_MODE2 = {
    className: "title",
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };
  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + "\\s*\\(";
  const C_KEYWORDS = [
    "asm",
    "auto",
    "break",
    "case",
    "continue",
    "default",
    "do",
    "else",
    "enum",
    "extern",
    "for",
    "fortran",
    "goto",
    "if",
    "inline",
    "register",
    "restrict",
    "return",
    "sizeof",
    "typeof",
    "typeof_unqual",
    "struct",
    "switch",
    "typedef",
    "union",
    "volatile",
    "while",
    "_Alignas",
    "_Alignof",
    "_Atomic",
    "_Generic",
    "_Noreturn",
    "_Static_assert",
    "_Thread_local",
    // aliases
    "alignas",
    "alignof",
    "noreturn",
    "static_assert",
    "thread_local",
    // not a C keyword but is, for all intents and purposes, treated exactly like one.
    "_Pragma"
  ];
  const C_TYPES = [
    "float",
    "double",
    "signed",
    "unsigned",
    "int",
    "short",
    "long",
    "char",
    "void",
    "_Bool",
    "_BitInt",
    "_Complex",
    "_Imaginary",
    "_Decimal32",
    "_Decimal64",
    "_Decimal96",
    "_Decimal128",
    "_Decimal64x",
    "_Decimal128x",
    "_Float16",
    "_Float32",
    "_Float64",
    "_Float128",
    "_Float32x",
    "_Float64x",
    "_Float128x",
    // modifiers
    "const",
    "static",
    "constexpr",
    // aliases
    "complex",
    "bool",
    "imaginary"
  ];
  const KEYWORDS2 = {
    keyword: C_KEYWORDS,
    type: C_TYPES,
    literal: "true false NULL",
    // TODO: apply hinting work similar to what was done in cpp.js
    built_in: "std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr"
  };
  const EXPRESSION_CONTAINS = [
    PREPROCESSOR,
    TYPES2,
    C_LINE_COMMENT_MODE2,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    STRINGS
  ];
  const EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: KEYWORDS2,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS2,
        contains: EXPRESSION_CONTAINS.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  };
  const FUNCTION_DECLARATION = {
    begin: "(" + FUNCTION_TYPE_RE + "[\\*&\\s]+)+" + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: KEYWORDS2,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: KEYWORDS2,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [hljs.inherit(TITLE_MODE2, { className: "title.function" })],
        relevance: 0
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS2,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE2,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          TYPES2,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS2,
            relevance: 0,
            contains: [
              "self",
              C_LINE_COMMENT_MODE2,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              TYPES2
            ]
          }
        ]
      },
      TYPES2,
      C_LINE_COMMENT_MODE2,
      hljs.C_BLOCK_COMMENT_MODE,
      PREPROCESSOR
    ]
  };
  return {
    name: "C",
    aliases: ["h"],
    keywords: KEYWORDS2,
    // Until differentiations are added between `c` and `cpp`, `c` will
    // not be auto-detected to avoid auto-detect conflicts between C and C++
    disableAutodetect: true,
    illegal: "</",
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      EXPRESSION_CONTAINS,
      [
        PREPROCESSOR,
        {
          begin: hljs.IDENT_RE + "::",
          keywords: KEYWORDS2
        },
        {
          className: "class",
          beginKeywords: "enum class struct union",
          end: /[{;:<>=]/,
          contains: [
            { beginKeywords: "final class struct" },
            hljs.TITLE_MODE
          ]
        }
      ]
    ),
    exports: {
      preprocessor: PREPROCESSOR,
      strings: STRINGS,
      keywords: KEYWORDS2
    }
  };
}
function cpp(hljs) {
  const regex = hljs.regex;
  const C_LINE_COMMENT_MODE2 = hljs.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] });
  const DECLTYPE_AUTO_RE = "decltype\\(auto\\)";
  const NAMESPACE_RE = "[a-zA-Z_]\\w*::";
  const TEMPLATE_ARGUMENT_RE = "<[^<>]+>";
  const FUNCTION_TYPE_RE = "(?!struct)(" + DECLTYPE_AUTO_RE + "|" + regex.optional(NAMESPACE_RE) + "[a-zA-Z_]\\w*" + regex.optional(TEMPLATE_ARGUMENT_RE) + ")";
  const CPP_PRIMITIVE_TYPES = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  };
  const CHARACTER_ESCAPES = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)";
  const STRINGS = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + CHARACTER_ESCAPES + "|.)",
        end: "'",
        illegal: "."
      },
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  };
  const NUMBERS = {
    className: "number",
    variants: [
      // Floating-point literal.
      {
        begin: "[+-]?(?:(?:[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?|\\.[0-9](?:'?[0-9])*)(?:[Ee][+-]?[0-9](?:'?[0-9])*)?|[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*|0[Xx](?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)[Pp][+-]?[0-9](?:'?[0-9])*)(?:[Ff](?:16|32|64|128)?|(BF|bf)16|[Ll]|)"
      },
      // Integer literal.
      {
        begin: "[+-]?\\b(?:0[Bb][01](?:'?[01])*|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*|0(?:'?[0-7])*|[1-9](?:'?[0-9])*)(?:[Uu](?:LL?|ll?)|[Uu][Zz]?|(?:LL?|ll?)[Uu]?|[Zz][Uu]|)"
        // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
        // literal highlight actually makes it stand out more.
      }
    ],
    relevance: 0
  };
  const PREPROCESSOR = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE2,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };
  const TITLE_MODE2 = {
    className: "title",
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };
  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + "\\s*\\(";
  const RESERVED_KEYWORDS = [
    "alignas",
    "alignof",
    "and",
    "and_eq",
    "asm",
    "atomic_cancel",
    "atomic_commit",
    "atomic_noexcept",
    "auto",
    "bitand",
    "bitor",
    "break",
    "case",
    "catch",
    "class",
    "co_await",
    "co_return",
    "co_yield",
    "compl",
    "concept",
    "const_cast|10",
    "consteval",
    "constexpr",
    "constinit",
    "continue",
    "decltype",
    "default",
    "delete",
    "do",
    "dynamic_cast|10",
    "else",
    "enum",
    "explicit",
    "export",
    "extern",
    "false",
    "final",
    "for",
    "friend",
    "goto",
    "if",
    "import",
    "inline",
    "module",
    "mutable",
    "namespace",
    "new",
    "noexcept",
    "not",
    "not_eq",
    "nullptr",
    "operator",
    "or",
    "or_eq",
    "override",
    "private",
    "protected",
    "public",
    "reflexpr",
    "register",
    "reinterpret_cast|10",
    "requires",
    "return",
    "sizeof",
    "static_assert",
    "static_cast|10",
    "struct",
    "switch",
    "synchronized",
    "template",
    "this",
    "thread_local",
    "throw",
    "transaction_safe",
    "transaction_safe_dynamic",
    "true",
    "try",
    "typedef",
    "typeid",
    "typename",
    "union",
    "using",
    "virtual",
    "volatile",
    "while",
    "xor",
    "xor_eq"
  ];
  const RESERVED_TYPES = [
    "bool",
    "char",
    "char16_t",
    "char32_t",
    "char8_t",
    "double",
    "float",
    "int",
    "long",
    "short",
    "void",
    "wchar_t",
    "unsigned",
    "signed",
    "const",
    "static"
  ];
  const TYPE_HINTS = [
    "any",
    "auto_ptr",
    "barrier",
    "binary_semaphore",
    "bitset",
    "complex",
    "condition_variable",
    "condition_variable_any",
    "counting_semaphore",
    "deque",
    "false_type",
    "flat_map",
    "flat_set",
    "future",
    "imaginary",
    "initializer_list",
    "istringstream",
    "jthread",
    "latch",
    "lock_guard",
    "multimap",
    "multiset",
    "mutex",
    "optional",
    "ostringstream",
    "packaged_task",
    "pair",
    "promise",
    "priority_queue",
    "queue",
    "recursive_mutex",
    "recursive_timed_mutex",
    "scoped_lock",
    "set",
    "shared_future",
    "shared_lock",
    "shared_mutex",
    "shared_timed_mutex",
    "shared_ptr",
    "stack",
    "string_view",
    "stringstream",
    "timed_mutex",
    "thread",
    "true_type",
    "tuple",
    "unique_lock",
    "unique_ptr",
    "unordered_map",
    "unordered_multimap",
    "unordered_multiset",
    "unordered_set",
    "variant",
    "vector",
    "weak_ptr",
    "wstring",
    "wstring_view"
  ];
  const FUNCTION_HINTS = [
    "abort",
    "abs",
    "acos",
    "apply",
    "as_const",
    "asin",
    "atan",
    "atan2",
    "calloc",
    "ceil",
    "cerr",
    "cin",
    "clog",
    "cos",
    "cosh",
    "cout",
    "declval",
    "endl",
    "exchange",
    "exit",
    "exp",
    "fabs",
    "floor",
    "fmod",
    "forward",
    "fprintf",
    "fputs",
    "free",
    "frexp",
    "fscanf",
    "future",
    "invoke",
    "isalnum",
    "isalpha",
    "iscntrl",
    "isdigit",
    "isgraph",
    "islower",
    "isprint",
    "ispunct",
    "isspace",
    "isupper",
    "isxdigit",
    "labs",
    "launder",
    "ldexp",
    "log",
    "log10",
    "make_pair",
    "make_shared",
    "make_shared_for_overwrite",
    "make_tuple",
    "make_unique",
    "malloc",
    "memchr",
    "memcmp",
    "memcpy",
    "memset",
    "modf",
    "move",
    "pow",
    "printf",
    "putchar",
    "puts",
    "realloc",
    "scanf",
    "sin",
    "sinh",
    "snprintf",
    "sprintf",
    "sqrt",
    "sscanf",
    "std",
    "stderr",
    "stdin",
    "stdout",
    "strcat",
    "strchr",
    "strcmp",
    "strcpy",
    "strcspn",
    "strlen",
    "strncat",
    "strncmp",
    "strncpy",
    "strpbrk",
    "strrchr",
    "strspn",
    "strstr",
    "swap",
    "tan",
    "tanh",
    "terminate",
    "to_underlying",
    "tolower",
    "toupper",
    "vfprintf",
    "visit",
    "vprintf",
    "vsprintf"
  ];
  const LITERALS2 = [
    "NULL",
    "false",
    "nullopt",
    "nullptr",
    "true"
  ];
  const BUILT_IN = ["_Pragma"];
  const CPP_KEYWORDS = {
    type: RESERVED_TYPES,
    keyword: RESERVED_KEYWORDS,
    literal: LITERALS2,
    built_in: BUILT_IN,
    _type_hints: TYPE_HINTS
  };
  const FUNCTION_DISPATCH = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: FUNCTION_HINTS
    },
    begin: regex.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      hljs.IDENT_RE,
      regex.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  };
  const EXPRESSION_CONTAINS = [
    FUNCTION_DISPATCH,
    PREPROCESSOR,
    CPP_PRIMITIVE_TYPES,
    C_LINE_COMMENT_MODE2,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    STRINGS
  ];
  const EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: CPP_KEYWORDS,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  };
  const FUNCTION_DECLARATION = {
    className: "function",
    begin: "(" + FUNCTION_TYPE_RE + "[\\*&\\s]+)+" + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: CPP_KEYWORDS,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: CPP_KEYWORDS,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [TITLE_MODE2],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: true,
        contains: [
          STRINGS,
          NUMBERS
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE2,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          CPP_PRIMITIVE_TYPES,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: CPP_KEYWORDS,
            relevance: 0,
            contains: [
              "self",
              C_LINE_COMMENT_MODE2,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              CPP_PRIMITIVE_TYPES
            ]
          }
        ]
      },
      CPP_PRIMITIVE_TYPES,
      C_LINE_COMMENT_MODE2,
      hljs.C_BLOCK_COMMENT_MODE,
      PREPROCESSOR
    ]
  };
  return {
    name: "C++",
    aliases: [
      "cc",
      "c++",
      "h++",
      "hpp",
      "hh",
      "hxx",
      "cxx"
    ],
    keywords: CPP_KEYWORDS,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      FUNCTION_DISPATCH,
      EXPRESSION_CONTAINS,
      [
        PREPROCESSOR,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
          end: ">",
          keywords: CPP_KEYWORDS,
          contains: [
            "self",
            CPP_PRIMITIVE_TYPES
          ]
        },
        {
          begin: hljs.IDENT_RE + "::",
          keywords: CPP_KEYWORDS
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: "keyword",
            3: "title.class"
          }
        }
      ]
    )
  };
}
function csharp(hljs) {
  const BUILT_IN_KEYWORDS = [
    "bool",
    "byte",
    "char",
    "decimal",
    "delegate",
    "double",
    "dynamic",
    "enum",
    "float",
    "int",
    "long",
    "nint",
    "nuint",
    "object",
    "sbyte",
    "short",
    "string",
    "ulong",
    "uint",
    "ushort"
  ];
  const FUNCTION_MODIFIERS = [
    "public",
    "private",
    "protected",
    "static",
    "internal",
    "protected",
    "abstract",
    "async",
    "extern",
    "override",
    "unsafe",
    "virtual",
    "new",
    "sealed",
    "partial"
  ];
  const LITERAL_KEYWORDS = [
    "default",
    "false",
    "null",
    "true"
  ];
  const NORMAL_KEYWORDS = [
    "abstract",
    "as",
    "base",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "do",
    "else",
    "event",
    "explicit",
    "extern",
    "finally",
    "fixed",
    "for",
    "foreach",
    "goto",
    "if",
    "implicit",
    "in",
    "interface",
    "internal",
    "is",
    "lock",
    "namespace",
    "new",
    "operator",
    "out",
    "override",
    "params",
    "private",
    "protected",
    "public",
    "readonly",
    "record",
    "ref",
    "return",
    "scoped",
    "sealed",
    "sizeof",
    "stackalloc",
    "static",
    "struct",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "unchecked",
    "unsafe",
    "using",
    "virtual",
    "void",
    "volatile",
    "while"
  ];
  const CONTEXTUAL_KEYWORDS = [
    "add",
    "alias",
    "and",
    "ascending",
    "args",
    "async",
    "await",
    "by",
    "descending",
    "dynamic",
    "equals",
    "file",
    "from",
    "get",
    "globalThis",
    "group",
    "init",
    "into",
    "join",
    "let",
    "nameof",
    "not",
    "notnull",
    "on",
    "or",
    "orderby",
    "partial",
    "record",
    "remove",
    "required",
    "scoped",
    "select",
    "set",
    "unmanaged",
    "value|0",
    "var",
    "when",
    "where",
    "with",
    "yield"
  ];
  const KEYWORDS2 = {
    keyword: NORMAL_KEYWORDS.concat(CONTEXTUAL_KEYWORDS),
    built_in: BUILT_IN_KEYWORDS,
    literal: LITERAL_KEYWORDS
  };
  const TITLE_MODE2 = hljs.inherit(hljs.TITLE_MODE, { begin: "[a-zA-Z](\\.?\\w)*" });
  const NUMBERS = {
    className: "number",
    variants: [
      { begin: "\\b(0b[01']+)" },
      { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)(u|U|l|L|ul|UL|f|F|b|B)" },
      { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" }
    ],
    relevance: 0
  };
  const RAW_STRING = {
    className: "string",
    begin: /"""("*)(?!")(.|\n)*?"""\1/,
    relevance: 1
  };
  const VERBATIM_STRING = {
    className: "string",
    begin: '@"',
    end: '"',
    contains: [{ begin: '""' }]
  };
  const VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
  const SUBST = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS2
  };
  const SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
  const INTERPOLATED_STRING = {
    className: "string",
    begin: /\$"/,
    end: '"',
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      hljs.BACKSLASH_ESCAPE,
      SUBST_NO_LF
    ]
  };
  const INTERPOLATED_VERBATIM_STRING = {
    className: "string",
    begin: /\$@"/,
    end: '"',
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      SUBST
    ]
  };
  const INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      SUBST_NO_LF
    ]
  });
  SUBST.contains = [
    INTERPOLATED_VERBATIM_STRING,
    INTERPOLATED_STRING,
    VERBATIM_STRING,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    NUMBERS,
    hljs.C_BLOCK_COMMENT_MODE
  ];
  SUBST_NO_LF.contains = [
    INTERPOLATED_VERBATIM_STRING_NO_LF,
    INTERPOLATED_STRING,
    VERBATIM_STRING_NO_LF,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    NUMBERS,
    hljs.inherit(hljs.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
  ];
  const STRING = { variants: [
    RAW_STRING,
    INTERPOLATED_VERBATIM_STRING,
    INTERPOLATED_STRING,
    VERBATIM_STRING,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ] };
  const GENERIC_MODIFIER = {
    begin: "<",
    end: ">",
    contains: [
      { beginKeywords: "in out" },
      TITLE_MODE2
    ]
  };
  const TYPE_IDENT_RE = hljs.IDENT_RE + "(<" + hljs.IDENT_RE + "(\\s*,\\s*" + hljs.IDENT_RE + ")*>)?(\\[\\])?";
  const AT_IDENTIFIER = {
    // prevents expressions like `@class` from incorrect flagging
    // `class` as a keyword
    begin: "@" + hljs.IDENT_RE,
    relevance: 0
  };
  return {
    name: "C#",
    aliases: [
      "cs",
      "c#"
    ],
    keywords: KEYWORDS2,
    illegal: /::/,
    contains: [
      hljs.COMMENT(
        "///",
        "$",
        {
          returnBegin: true,
          contains: [
            {
              className: "doctag",
              variants: [
                {
                  begin: "///",
                  relevance: 0
                },
                { begin: "<!--|-->" },
                {
                  begin: "</?",
                  end: ">"
                }
              ]
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "meta",
        begin: "#",
        end: "$",
        keywords: { keyword: "if else elif endif define undef warning error line region endregion pragma checksum" }
      },
      STRING,
      NUMBERS,
      {
        beginKeywords: "class interface",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:,]/,
        contains: [
          { beginKeywords: "where class" },
          TITLE_MODE2,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE2,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "record",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE2,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // [Attributes("")]
        className: "meta",
        begin: "^\\s*\\[(?=[\\w])",
        excludeBegin: true,
        end: "\\]",
        excludeEnd: true,
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/
          }
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new return throw await else",
        relevance: 0
      },
      {
        className: "function",
        begin: "(" + TYPE_IDENT_RE + "\\s+)+" + hljs.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
        returnBegin: true,
        end: /\s*[{;=]/,
        excludeEnd: true,
        keywords: KEYWORDS2,
        contains: [
          // prevents these from being highlighted `title`
          {
            beginKeywords: FUNCTION_MODIFIERS.join(" "),
            relevance: 0
          },
          {
            begin: hljs.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
            returnBegin: true,
            contains: [
              hljs.TITLE_MODE,
              GENERIC_MODIFIER
            ],
            relevance: 0
          },
          { match: /\(\)/ },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS2,
            relevance: 0,
            contains: [
              STRING,
              NUMBERS,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      AT_IDENTIFIER
    ]
  };
}
const MODES$2 = (hljs) => {
  return {
    IMPORTANT: {
      scope: "meta",
      begin: "!important"
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: "number",
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: "selector-attr",
      begin: /\[/,
      end: /\]/,
      illegal: "$",
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: "number",
      begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};
const HTML_TAGS$2 = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
];
const SVG_TAGS$2 = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
];
const TAGS$2 = [
  ...HTML_TAGS$2,
  ...SVG_TAGS$2
];
const MEDIA_FEATURES$2 = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse();
const PSEUDO_CLASSES$2 = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse();
const PSEUDO_ELEMENTS$2 = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse();
const ATTRIBUTES$2 = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function css(hljs) {
  const regex = hljs.regex;
  const modes = MODES$2(hljs);
  const VENDOR_PREFIX = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ };
  const AT_MODIFIERS = "and or not only";
  const AT_PROPERTY_RE = /@-?\w[\w]*(-\w+)*/;
  const IDENT_RE2 = "[a-zA-Z-][a-zA-Z0-9_-]*";
  const STRINGS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ];
  return {
    name: "CSS",
    case_insensitive: true,
    illegal: /[=|'\$]/,
    keywords: { keyframePosition: "from to" },
    classNameAliases: {
      // for visual continuity with `tag {}` and because we
      // don't have a great class for this?
      keyframePosition: "selector-tag"
    },
    contains: [
      modes.BLOCK_COMMENT,
      VENDOR_PREFIX,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: /#[A-Za-z0-9_-]+/,
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\." + IDENT_RE2,
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        variants: [
          { begin: ":(" + PSEUDO_CLASSES$2.join("|") + ")" },
          { begin: ":(:)?(" + PSEUDO_ELEMENTS$2.join("|") + ")" }
        ]
      },
      // we may actually need this (12/2020)
      // { // pseudo-selector params
      //   begin: /\(/,
      //   end: /\)/,
      //   contains: [ hljs.CSS_NUMBER_MODE ]
      // },
      modes.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + ATTRIBUTES$2.join("|") + ")\\b"
      },
      // attribute values
      {
        begin: /:/,
        end: /[;}{]/,
        contains: [
          modes.BLOCK_COMMENT,
          modes.HEXCOLOR,
          modes.IMPORTANT,
          modes.CSS_NUMBER_MODE,
          ...STRINGS,
          // needed to highlight these as strings and to avoid issues with
          // illegal characters that might be inside urls that would tigger the
          // languages illegal stack
          {
            begin: /(url|data-uri)\(/,
            end: /\)/,
            relevance: 0,
            // from keywords
            keywords: { built_in: "url data-uri" },
            contains: [
              ...STRINGS,
              {
                className: "string",
                // any character other than `)` as in `url()` will be the start
                // of a string, which ends with `)` (from the parent mode)
                begin: /[^)]/,
                endsWithParent: true,
                excludeEnd: true
              }
            ]
          },
          modes.FUNCTION_DISPATCH
        ]
      },
      {
        begin: regex.lookahead(/@/),
        end: "[{;]",
        relevance: 0,
        illegal: /:/,
        // break on Less variables @var: ...
        contains: [
          {
            className: "keyword",
            begin: AT_PROPERTY_RE
          },
          {
            begin: /\s/,
            endsWithParent: true,
            excludeEnd: true,
            relevance: 0,
            keywords: {
              $pattern: /[a-z-]+/,
              keyword: AT_MODIFIERS,
              attribute: MEDIA_FEATURES$2.join(" ")
            },
            contains: [
              {
                begin: /[a-z-]+(?=:)/,
                className: "attribute"
              },
              ...STRINGS,
              modes.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: "selector-tag",
        begin: "\\b(" + TAGS$2.join("|") + ")\\b"
      }
    ]
  };
}
function dart(hljs) {
  const SUBST = {
    className: "subst",
    variants: [{ begin: "\\$[A-Za-z0-9_]+" }]
  };
  const BRACED_SUBST = {
    className: "subst",
    variants: [
      {
        begin: /\$\{/,
        end: /\}/
      }
    ],
    keywords: "true false null this is new super"
  };
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      { match: /\b[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?\b/ },
      { match: /\b0[xX][0-9A-Fa-f][0-9A-Fa-f_]*\b/ }
    ]
  };
  const STRING = {
    className: "string",
    variants: [
      {
        begin: "r'''",
        end: "'''"
      },
      {
        begin: 'r"""',
        end: '"""'
      },
      {
        begin: "r'",
        end: "'",
        illegal: "\\n"
      },
      {
        begin: 'r"',
        end: '"',
        illegal: "\\n"
      },
      {
        begin: "'''",
        end: "'''",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: '"""',
        end: '"""',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: "'",
        end: "'",
        illegal: "\\n",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: '"',
        end: '"',
        illegal: "\\n",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      }
    ]
  };
  BRACED_SUBST.contains = [
    NUMBER,
    STRING
  ];
  const BUILT_IN_TYPES = [
    // dart:core
    "Comparable",
    "DateTime",
    "Duration",
    "Function",
    "Iterable",
    "Iterator",
    "List",
    "Map",
    "Match",
    "Object",
    "Pattern",
    "RegExp",
    "Set",
    "Stopwatch",
    "String",
    "StringBuffer",
    "StringSink",
    "Symbol",
    "Type",
    "Uri",
    "bool",
    "double",
    "int",
    "num",
    // dart:html
    "Element",
    "ElementList"
  ];
  const NULLABLE_BUILT_IN_TYPES = BUILT_IN_TYPES.map((e2) => `${e2}?`);
  const BASIC_KEYWORDS = [
    "abstract",
    "as",
    "assert",
    "async",
    "await",
    "base",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "covariant",
    "default",
    "deferred",
    "do",
    "dynamic",
    "else",
    "enum",
    "export",
    "extends",
    "extension",
    "external",
    "factory",
    "false",
    "final",
    "finally",
    "for",
    "Function",
    "get",
    "hide",
    "if",
    "implements",
    "import",
    "in",
    "interface",
    "is",
    "late",
    "library",
    "mixin",
    "new",
    "null",
    "on",
    "operator",
    "part",
    "required",
    "rethrow",
    "return",
    "sealed",
    "set",
    "show",
    "static",
    "super",
    "switch",
    "sync",
    "this",
    "throw",
    "true",
    "try",
    "typedef",
    "var",
    "void",
    "when",
    "while",
    "with",
    "yield"
  ];
  const KEYWORDS2 = {
    keyword: BASIC_KEYWORDS,
    built_in: BUILT_IN_TYPES.concat(NULLABLE_BUILT_IN_TYPES).concat([
      // dart:core
      "Never",
      "Null",
      "dynamic",
      "print",
      // dart:html
      "document",
      "querySelector",
      "querySelectorAll",
      "window"
    ]),
    $pattern: /[A-Za-z][A-Za-z0-9_]*\??/
  };
  return {
    name: "Dart",
    keywords: KEYWORDS2,
    contains: [
      STRING,
      hljs.COMMENT(
        /\/\*\*(?!\/)/,
        /\*\//,
        {
          subLanguage: "markdown",
          relevance: 0
        }
      ),
      hljs.COMMENT(
        /\/{3,} ?/,
        /$/,
        { contains: [
          {
            subLanguage: "markdown",
            begin: ".",
            end: "$",
            relevance: 0
          }
        ] }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "class",
        beginKeywords: "class interface",
        end: /\{/,
        excludeEnd: true,
        contains: [
          { beginKeywords: "extends implements" },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      NUMBER,
      {
        className: "meta",
        begin: "@[A-Za-z]+"
      },
      {
        begin: "=>"
        // No markup, just a relevance booster
      }
    ]
  };
}
function dos(hljs) {
  const COMMENT2 = hljs.COMMENT(
    /^\s*@?rem\b/,
    /$/,
    { relevance: 10 }
  );
  const LABEL = {
    className: "symbol",
    begin: "^\\s*[A-Za-z._?][A-Za-z0-9_$#@~.?]*(:|\\s+label)",
    relevance: 0
  };
  const KEYWORDS2 = [
    "if",
    "else",
    "goto",
    "for",
    "in",
    "do",
    "call",
    "exit",
    "not",
    "exist",
    "errorlevel",
    "defined",
    "equ",
    "neq",
    "lss",
    "leq",
    "gtr",
    "geq"
  ];
  const BUILT_INS2 = [
    "prn",
    "nul",
    "lpt3",
    "lpt2",
    "lpt1",
    "con",
    "com4",
    "com3",
    "com2",
    "com1",
    "aux",
    "shift",
    "cd",
    "dir",
    "echo",
    "setlocal",
    "endlocal",
    "set",
    "pause",
    "copy",
    "append",
    "assoc",
    "at",
    "attrib",
    "break",
    "cacls",
    "cd",
    "chcp",
    "chdir",
    "chkdsk",
    "chkntfs",
    "cls",
    "cmd",
    "color",
    "comp",
    "compact",
    "convert",
    "date",
    "dir",
    "diskcomp",
    "diskcopy",
    "doskey",
    "erase",
    "fs",
    "find",
    "findstr",
    "format",
    "ftype",
    "graftabl",
    "help",
    "keyb",
    "label",
    "md",
    "mkdir",
    "mode",
    "more",
    "move",
    "path",
    "pause",
    "print",
    "popd",
    "pushd",
    "promt",
    "rd",
    "recover",
    "rem",
    "rename",
    "replace",
    "restore",
    "rmdir",
    "shift",
    "sort",
    "start",
    "subst",
    "time",
    "title",
    "tree",
    "type",
    "ver",
    "verify",
    "vol",
    // winutils
    "ping",
    "net",
    "ipconfig",
    "taskkill",
    "xcopy",
    "ren",
    "del"
  ];
  return {
    name: "Batch file (DOS)",
    aliases: [
      "bat",
      "cmd"
    ],
    case_insensitive: true,
    illegal: /\/\*/,
    keywords: {
      keyword: KEYWORDS2,
      built_in: BUILT_INS2
    },
    contains: [
      {
        className: "variable",
        begin: /%%[^ ]|%[^ ]+?%|![^ ]+?!/
      },
      {
        className: "function",
        begin: LABEL.begin,
        end: "goto:eof",
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: "([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*" }),
          COMMENT2
        ]
      },
      {
        className: "number",
        begin: "\\b\\d+",
        relevance: 0
      },
      COMMENT2
    ]
  };
}
function glsl(hljs) {
  return {
    name: "GLSL",
    keywords: {
      keyword: (
        // Statements
        "break continue discard do else for if return while switch case default attribute binding buffer ccw centroid centroid varying coherent column_major const cw depth_any depth_greater depth_less depth_unchanged early_fragment_tests equal_spacing flat fractional_even_spacing fractional_odd_spacing highp in index inout invariant invocations isolines layout line_strip lines lines_adjacency local_size_x local_size_y local_size_z location lowp max_vertices mediump noperspective offset origin_upper_left out packed patch pixel_center_integer point_mode points precise precision quads r11f_g11f_b10f r16 r16_snorm r16f r16i r16ui r32f r32i r32ui r8 r8_snorm r8i r8ui readonly restrict rg16 rg16_snorm rg16f rg16i rg16ui rg32f rg32i rg32ui rg8 rg8_snorm rg8i rg8ui rgb10_a2 rgb10_a2ui rgba16 rgba16_snorm rgba16f rgba16i rgba16ui rgba32f rgba32i rgba32ui rgba8 rgba8_snorm rgba8i rgba8ui row_major sample shared smooth std140 std430 stream triangle_strip triangles triangles_adjacency uniform varying vertices volatile writeonly"
      ),
      type: "atomic_uint bool bvec2 bvec3 bvec4 dmat2 dmat2x2 dmat2x3 dmat2x4 dmat3 dmat3x2 dmat3x3 dmat3x4 dmat4 dmat4x2 dmat4x3 dmat4x4 double dvec2 dvec3 dvec4 float iimage1D iimage1DArray iimage2D iimage2DArray iimage2DMS iimage2DMSArray iimage2DRect iimage3D iimageBuffer iimageCube iimageCubeArray image1D image1DArray image2D image2DArray image2DMS image2DMSArray image2DRect image3D imageBuffer imageCube imageCubeArray int isampler1D isampler1DArray isampler2D isampler2DArray isampler2DMS isampler2DMSArray isampler2DRect isampler3D isamplerBuffer isamplerCube isamplerCubeArray ivec2 ivec3 ivec4 mat2 mat2x2 mat2x3 mat2x4 mat3 mat3x2 mat3x3 mat3x4 mat4 mat4x2 mat4x3 mat4x4 sampler1D sampler1DArray sampler1DArrayShadow sampler1DShadow sampler2D sampler2DArray sampler2DArrayShadow sampler2DMS sampler2DMSArray sampler2DRect sampler2DRectShadow sampler2DShadow sampler3D samplerBuffer samplerCube samplerCubeArray samplerCubeArrayShadow samplerCubeShadow image1D uimage1DArray uimage2D uimage2DArray uimage2DMS uimage2DMSArray uimage2DRect uimage3D uimageBuffer uimageCube uimageCubeArray uint usampler1D usampler1DArray usampler2D usampler2DArray usampler2DMS usampler2DMSArray usampler2DRect usampler3D samplerBuffer usamplerCube usamplerCubeArray uvec2 uvec3 uvec4 vec2 vec3 vec4 void",
      built_in: (
        // Constants
        "gl_MaxAtomicCounterBindings gl_MaxAtomicCounterBufferSize gl_MaxClipDistances gl_MaxClipPlanes gl_MaxCombinedAtomicCounterBuffers gl_MaxCombinedAtomicCounters gl_MaxCombinedImageUniforms gl_MaxCombinedImageUnitsAndFragmentOutputs gl_MaxCombinedTextureImageUnits gl_MaxComputeAtomicCounterBuffers gl_MaxComputeAtomicCounters gl_MaxComputeImageUniforms gl_MaxComputeTextureImageUnits gl_MaxComputeUniformComponents gl_MaxComputeWorkGroupCount gl_MaxComputeWorkGroupSize gl_MaxDrawBuffers gl_MaxFragmentAtomicCounterBuffers gl_MaxFragmentAtomicCounters gl_MaxFragmentImageUniforms gl_MaxFragmentInputComponents gl_MaxFragmentInputVectors gl_MaxFragmentUniformComponents gl_MaxFragmentUniformVectors gl_MaxGeometryAtomicCounterBuffers gl_MaxGeometryAtomicCounters gl_MaxGeometryImageUniforms gl_MaxGeometryInputComponents gl_MaxGeometryOutputComponents gl_MaxGeometryOutputVertices gl_MaxGeometryTextureImageUnits gl_MaxGeometryTotalOutputComponents gl_MaxGeometryUniformComponents gl_MaxGeometryVaryingComponents gl_MaxImageSamples gl_MaxImageUnits gl_MaxLights gl_MaxPatchVertices gl_MaxProgramTexelOffset gl_MaxTessControlAtomicCounterBuffers gl_MaxTessControlAtomicCounters gl_MaxTessControlImageUniforms gl_MaxTessControlInputComponents gl_MaxTessControlOutputComponents gl_MaxTessControlTextureImageUnits gl_MaxTessControlTotalOutputComponents gl_MaxTessControlUniformComponents gl_MaxTessEvaluationAtomicCounterBuffers gl_MaxTessEvaluationAtomicCounters gl_MaxTessEvaluationImageUniforms gl_MaxTessEvaluationInputComponents gl_MaxTessEvaluationOutputComponents gl_MaxTessEvaluationTextureImageUnits gl_MaxTessEvaluationUniformComponents gl_MaxTessGenLevel gl_MaxTessPatchComponents gl_MaxTextureCoords gl_MaxTextureImageUnits gl_MaxTextureUnits gl_MaxVaryingComponents gl_MaxVaryingFloats gl_MaxVaryingVectors gl_MaxVertexAtomicCounterBuffers gl_MaxVertexAtomicCounters gl_MaxVertexAttribs gl_MaxVertexImageUniforms gl_MaxVertexOutputComponents gl_MaxVertexOutputVectors gl_MaxVertexTextureImageUnits gl_MaxVertexUniformComponents gl_MaxVertexUniformVectors gl_MaxViewports gl_MinProgramTexelOffset gl_BackColor gl_BackLightModelProduct gl_BackLightProduct gl_BackMaterial gl_BackSecondaryColor gl_ClipDistance gl_ClipPlane gl_ClipVertex gl_Color gl_DepthRange gl_EyePlaneQ gl_EyePlaneR gl_EyePlaneS gl_EyePlaneT gl_Fog gl_FogCoord gl_FogFragCoord gl_FragColor gl_FragCoord gl_FragData gl_FragDepth gl_FrontColor gl_FrontFacing gl_FrontLightModelProduct gl_FrontLightProduct gl_FrontMaterial gl_FrontSecondaryColor gl_GlobalInvocationID gl_InstanceID gl_InvocationID gl_Layer gl_LightModel gl_LightSource gl_LocalInvocationID gl_LocalInvocationIndex gl_ModelViewMatrix gl_ModelViewMatrixInverse gl_ModelViewMatrixInverseTranspose gl_ModelViewMatrixTranspose gl_ModelViewProjectionMatrix gl_ModelViewProjectionMatrixInverse gl_ModelViewProjectionMatrixInverseTranspose gl_ModelViewProjectionMatrixTranspose gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 gl_MultiTexCoord3 gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 gl_MultiTexCoord7 gl_Normal gl_NormalMatrix gl_NormalScale gl_NumSamples gl_NumWorkGroups gl_ObjectPlaneQ gl_ObjectPlaneR gl_ObjectPlaneS gl_ObjectPlaneT gl_PatchVerticesIn gl_Point gl_PointCoord gl_PointSize gl_Position gl_PrimitiveID gl_PrimitiveIDIn gl_ProjectionMatrix gl_ProjectionMatrixInverse gl_ProjectionMatrixInverseTranspose gl_ProjectionMatrixTranspose gl_SampleID gl_SampleMask gl_SampleMaskIn gl_SamplePosition gl_SecondaryColor gl_TessCoord gl_TessLevelInner gl_TessLevelOuter gl_TexCoord gl_TextureEnvColor gl_TextureMatrix gl_TextureMatrixInverse gl_TextureMatrixInverseTranspose gl_TextureMatrixTranspose gl_Vertex gl_VertexID gl_ViewportIndex gl_WorkGroupID gl_WorkGroupSize gl_in gl_out EmitStreamVertex EmitVertex EndPrimitive EndStreamPrimitive abs acos acosh all any asin asinh atan atanh atomicAdd atomicAnd atomicCompSwap atomicCounter atomicCounterDecrement atomicCounterIncrement atomicExchange atomicMax atomicMin atomicOr atomicXor barrier bitCount bitfieldExtract bitfieldInsert bitfieldReverse ceil clamp cos cosh cross dFdx dFdy degrees determinant distance dot equal exp exp2 faceforward findLSB findMSB floatBitsToInt floatBitsToUint floor fma fract frexp ftransform fwidth greaterThan greaterThanEqual groupMemoryBarrier imageAtomicAdd imageAtomicAnd imageAtomicCompSwap imageAtomicExchange imageAtomicMax imageAtomicMin imageAtomicOr imageAtomicXor imageLoad imageSize imageStore imulExtended intBitsToFloat interpolateAtCentroid interpolateAtOffset interpolateAtSample inverse inversesqrt isinf isnan ldexp length lessThan lessThanEqual log log2 matrixCompMult max memoryBarrier memoryBarrierAtomicCounter memoryBarrierBuffer memoryBarrierImage memoryBarrierShared min mix mod modf noise1 noise2 noise3 noise4 normalize not notEqual outerProduct packDouble2x32 packHalf2x16 packSnorm2x16 packSnorm4x8 packUnorm2x16 packUnorm4x8 pow radians reflect refract round roundEven shadow1D shadow1DLod shadow1DProj shadow1DProjLod shadow2D shadow2DLod shadow2DProj shadow2DProjLod sign sin sinh smoothstep sqrt step tan tanh texelFetch texelFetchOffset texture texture1D texture1DLod texture1DProj texture1DProjLod texture2D texture2DLod texture2DProj texture2DProjLod texture3D texture3DLod texture3DProj texture3DProjLod textureCube textureCubeLod textureGather textureGatherOffset textureGatherOffsets textureGrad textureGradOffset textureLod textureLodOffset textureOffset textureProj textureProjGrad textureProjGradOffset textureProjLod textureProjLodOffset textureProjOffset textureQueryLevels textureQueryLod textureSize transpose trunc uaddCarry uintBitsToFloat umulExtended unpackDouble2x32 unpackHalf2x16 unpackSnorm2x16 unpackSnorm4x8 unpackUnorm2x16 unpackUnorm4x8 usubBorrow"
      ),
      literal: "true false"
    },
    illegal: '"',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      {
        className: "meta",
        begin: "#",
        end: "$"
      }
    ]
  };
}
function go(hljs) {
  const LITERALS2 = [
    "true",
    "false",
    "iota",
    "nil"
  ];
  const BUILT_INS2 = [
    "append",
    "cap",
    "close",
    "complex",
    "copy",
    "imag",
    "len",
    "make",
    "new",
    "panic",
    "print",
    "println",
    "real",
    "recover",
    "delete"
  ];
  const TYPES2 = [
    "bool",
    "byte",
    "complex64",
    "complex128",
    "error",
    "float32",
    "float64",
    "int8",
    "int16",
    "int32",
    "int64",
    "string",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "int",
    "uint",
    "uintptr",
    "rune"
  ];
  const KWS = [
    "break",
    "case",
    "chan",
    "const",
    "continue",
    "default",
    "defer",
    "else",
    "fallthrough",
    "for",
    "func",
    "go",
    "goto",
    "if",
    "import",
    "interface",
    "map",
    "package",
    "range",
    "return",
    "select",
    "struct",
    "switch",
    "type",
    "var"
  ];
  const KEYWORDS2 = {
    keyword: KWS,
    type: TYPES2,
    literal: LITERALS2,
    built_in: BUILT_INS2
  };
  return {
    name: "Go",
    aliases: ["golang"],
    keywords: KEYWORDS2,
    illegal: "</",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        variants: [
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          {
            begin: "`",
            end: "`"
          }
        ]
      },
      {
        className: "number",
        variants: [
          {
            match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/,
            // hex without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/,
            // hex with a present digit before . (making a digit afterwards optional)
            relevance: 0
          },
          {
            match: /-?\b0[oO](_?[0-7])*i?/,
            // leading 0o octal
            relevance: 0
          },
          {
            match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/,
            // decimal without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/,
            // decimal with a present digit before . (making a digit afterwards optional)
            relevance: 0
          }
        ]
      },
      {
        begin: /:=/
        // relevance booster
      },
      {
        className: "function",
        beginKeywords: "func",
        end: "\\s*(\\{|$)",
        excludeEnd: true,
        contains: [
          hljs.TITLE_MODE,
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS2,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}
function gradle(hljs) {
  const KEYWORDS2 = [
    "task",
    "project",
    "allprojects",
    "subprojects",
    "artifacts",
    "buildscript",
    "configurations",
    "dependencies",
    "repositories",
    "sourceSets",
    "description",
    "delete",
    "from",
    "into",
    "include",
    "exclude",
    "source",
    "classpath",
    "destinationDir",
    "includes",
    "options",
    "sourceCompatibility",
    "targetCompatibility",
    "group",
    "flatDir",
    "doLast",
    "doFirst",
    "flatten",
    "todir",
    "fromdir",
    "ant",
    "def",
    "abstract",
    "break",
    "case",
    "catch",
    "continue",
    "default",
    "do",
    "else",
    "extends",
    "final",
    "finally",
    "for",
    "if",
    "implements",
    "instanceof",
    "native",
    "new",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "switch",
    "synchronized",
    "throw",
    "throws",
    "transient",
    "try",
    "volatile",
    "while",
    "strictfp",
    "package",
    "import",
    "false",
    "null",
    "super",
    "this",
    "true",
    "antlrtask",
    "checkstyle",
    "codenarc",
    "copy",
    "boolean",
    "byte",
    "char",
    "class",
    "double",
    "float",
    "int",
    "interface",
    "long",
    "short",
    "void",
    "compile",
    "runTime",
    "file",
    "fileTree",
    "abs",
    "any",
    "append",
    "asList",
    "asWritable",
    "call",
    "collect",
    "compareTo",
    "count",
    "div",
    "dump",
    "each",
    "eachByte",
    "eachFile",
    "eachLine",
    "every",
    "find",
    "findAll",
    "flatten",
    "getAt",
    "getErr",
    "getIn",
    "getOut",
    "getText",
    "grep",
    "immutable",
    "inject",
    "inspect",
    "intersect",
    "invokeMethods",
    "isCase",
    "join",
    "leftShift",
    "minus",
    "multiply",
    "newInputStream",
    "newOutputStream",
    "newPrintWriter",
    "newReader",
    "newWriter",
    "next",
    "plus",
    "pop",
    "power",
    "previous",
    "print",
    "println",
    "push",
    "putAt",
    "read",
    "readBytes",
    "readLines",
    "reverse",
    "reverseEach",
    "round",
    "size",
    "sort",
    "splitEachLine",
    "step",
    "subMap",
    "times",
    "toInteger",
    "toList",
    "tokenize",
    "upto",
    "waitForOrKill",
    "withPrintWriter",
    "withReader",
    "withStream",
    "withWriter",
    "withWriterAppend",
    "write",
    "writeLine"
  ];
  return {
    name: "Gradle",
    case_insensitive: true,
    keywords: KEYWORDS2,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE,
      hljs.REGEXP_MODE
    ]
  };
}
function graphql(hljs) {
  const regex = hljs.regex;
  const GQL_NAME = /[_A-Za-z][_0-9A-Za-z]*/;
  return {
    name: "GraphQL",
    aliases: ["gql"],
    case_insensitive: true,
    disableAutodetect: false,
    keywords: {
      keyword: [
        "query",
        "mutation",
        "subscription",
        "type",
        "input",
        "schema",
        "directive",
        "interface",
        "union",
        "scalar",
        "fragment",
        "enum",
        "on"
      ],
      literal: [
        "true",
        "false",
        "null"
      ]
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE,
      {
        scope: "punctuation",
        match: /[.]{3}/,
        relevance: 0
      },
      {
        scope: "punctuation",
        begin: /[\!\(\)\:\=\[\]\{\|\}]{1}/,
        relevance: 0
      },
      {
        scope: "variable",
        begin: /\$/,
        end: /\W/,
        excludeEnd: true,
        relevance: 0
      },
      {
        scope: "meta",
        match: /@\w+/,
        excludeEnd: true
      },
      {
        scope: "symbol",
        begin: regex.concat(GQL_NAME, regex.lookahead(/\s*:/)),
        relevance: 0
      }
    ],
    illegal: [
      /[;<']/,
      /BEGIN/
    ]
  };
}
function json$1(hljs) {
  const ATTRIBUTE = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  };
  const PUNCTUATION = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  };
  const LITERALS2 = [
    "true",
    "false",
    "null"
  ];
  const LITERALS_MODE = {
    scope: "literal",
    beginKeywords: LITERALS2.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc"],
    keywords: {
      literal: LITERALS2
    },
    contains: [
      ATTRIBUTE,
      PUNCTUATION,
      hljs.QUOTE_STRING_MODE,
      LITERALS_MODE,
      hljs.C_NUMBER_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}
var decimalDigits = "[0-9](_*[0-9])*";
var frac = `\\.(${decimalDigits})`;
var hexDigits = "[0-9a-fA-F](_*[0-9a-fA-F])*";
var NUMERIC = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))[pP][+-]?(${decimalDigits})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function kotlin(hljs) {
  const KEYWORDS2 = {
    keyword: "abstract as val var vararg get set class object open private protected public noinline crossinline dynamic final enum if else do while for when throw try catch finally import package is in fun override companion reified inline lateinit init interface annotation data sealed internal infix operator out by constructor super tailrec where const inner suspend typealias external expect actual",
    built_in: "Byte Short Char Int Long Boolean Float Double Void Unit Nothing",
    literal: "true false null"
  };
  const KEYWORDS_WITH_LABEL = {
    className: "keyword",
    begin: /\b(break|continue|return|this)\b/,
    starts: { contains: [
      {
        className: "symbol",
        begin: /@\w+/
      }
    ] }
  };
  const LABEL = {
    className: "symbol",
    begin: hljs.UNDERSCORE_IDENT_RE + "@"
  };
  const SUBST = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    contains: [hljs.C_NUMBER_MODE]
  };
  const VARIABLE = {
    className: "variable",
    begin: "\\$" + hljs.UNDERSCORE_IDENT_RE
  };
  const STRING = {
    className: "string",
    variants: [
      {
        begin: '"""',
        end: '"""(?=[^"])',
        contains: [
          VARIABLE,
          SUBST
        ]
      },
      // Can't use built-in modes easily, as we want to use STRING in the meta
      // context as 'meta-string' and there's no syntax to remove explicitly set
      // classNames in built-in modes.
      {
        begin: "'",
        end: "'",
        illegal: /\n/,
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: '"',
        end: '"',
        illegal: /\n/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          VARIABLE,
          SUBST
        ]
      }
    ]
  };
  SUBST.contains.push(STRING);
  const ANNOTATION_USE_SITE = {
    className: "meta",
    begin: "@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*" + hljs.UNDERSCORE_IDENT_RE + ")?"
  };
  const ANNOTATION = {
    className: "meta",
    begin: "@" + hljs.UNDERSCORE_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          hljs.inherit(STRING, { className: "string" }),
          "self"
        ]
      }
    ]
  };
  const KOTLIN_NUMBER_MODE = NUMERIC;
  const KOTLIN_NESTED_COMMENT = hljs.COMMENT(
    "/\\*",
    "\\*/",
    { contains: [hljs.C_BLOCK_COMMENT_MODE] }
  );
  const KOTLIN_PAREN_TYPE = { variants: [
    {
      className: "type",
      begin: hljs.UNDERSCORE_IDENT_RE
    },
    {
      begin: /\(/,
      end: /\)/,
      contains: []
      // defined later
    }
  ] };
  const KOTLIN_PAREN_TYPE2 = KOTLIN_PAREN_TYPE;
  KOTLIN_PAREN_TYPE2.variants[1].contains = [KOTLIN_PAREN_TYPE];
  KOTLIN_PAREN_TYPE.variants[1].contains = [KOTLIN_PAREN_TYPE2];
  return {
    name: "Kotlin",
    aliases: [
      "kt",
      "kts"
    ],
    keywords: KEYWORDS2,
    contains: [
      hljs.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      KOTLIN_NESTED_COMMENT,
      KEYWORDS_WITH_LABEL,
      LABEL,
      ANNOTATION_USE_SITE,
      ANNOTATION,
      {
        className: "function",
        beginKeywords: "fun",
        end: "[(]|$",
        returnBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS2,
        relevance: 5,
        contains: [
          {
            begin: hljs.UNDERSCORE_IDENT_RE + "\\s*\\(",
            returnBegin: true,
            relevance: 0,
            contains: [hljs.UNDERSCORE_TITLE_MODE]
          },
          {
            className: "type",
            begin: /</,
            end: />/,
            keywords: "reified",
            relevance: 0
          },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS2,
            relevance: 0,
            contains: [
              {
                begin: /:/,
                end: /[=,\/]/,
                endsWithParent: true,
                contains: [
                  KOTLIN_PAREN_TYPE,
                  hljs.C_LINE_COMMENT_MODE,
                  KOTLIN_NESTED_COMMENT
                ],
                relevance: 0
              },
              hljs.C_LINE_COMMENT_MODE,
              KOTLIN_NESTED_COMMENT,
              ANNOTATION_USE_SITE,
              ANNOTATION,
              STRING,
              hljs.C_NUMBER_MODE
            ]
          },
          KOTLIN_NESTED_COMMENT
        ]
      },
      {
        begin: [
          /class|interface|trait/,
          /\s+/,
          hljs.UNDERSCORE_IDENT_RE
        ],
        beginScope: {
          3: "title.class"
        },
        keywords: "class interface trait",
        end: /[:\{(]|$/,
        excludeEnd: true,
        illegal: "extends implements",
        contains: [
          { beginKeywords: "public protected internal private constructor" },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: "type",
            begin: /</,
            end: />/,
            excludeBegin: true,
            excludeEnd: true,
            relevance: 0
          },
          {
            className: "type",
            begin: /[,:]\s*/,
            end: /[<\(,){\s]|$/,
            excludeBegin: true,
            returnEnd: true
          },
          ANNOTATION_USE_SITE,
          ANNOTATION
        ]
      },
      STRING,
      {
        className: "meta",
        begin: "^#!/usr/bin/env",
        end: "$",
        illegal: "\n"
      },
      KOTLIN_NUMBER_MODE
    ]
  };
}
function latex(hljs) {
  const regex = hljs.regex;
  const KNOWN_CONTROL_WORDS = regex.either(...[
    "(?:NeedsTeXFormat|RequirePackage|GetIdInfo)",
    "Provides(?:Expl)?(?:Package|Class|File)",
    "(?:DeclareOption|ProcessOptions)",
    "(?:documentclass|usepackage|input|include)",
    "makeat(?:letter|other)",
    "ExplSyntax(?:On|Off)",
    "(?:new|renew|provide)?command",
    "(?:re)newenvironment",
    "(?:New|Renew|Provide|Declare)(?:Expandable)?DocumentCommand",
    "(?:New|Renew|Provide|Declare)DocumentEnvironment",
    "(?:(?:e|g|x)?def|let)",
    "(?:begin|end)",
    "(?:part|chapter|(?:sub){0,2}section|(?:sub)?paragraph)",
    "caption",
    "(?:label|(?:eq|page|name)?ref|(?:paren|foot|super)?cite)",
    "(?:alpha|beta|[Gg]amma|[Dd]elta|(?:var)?epsilon|zeta|eta|[Tt]heta|vartheta)",
    "(?:iota|(?:var)?kappa|[Ll]ambda|mu|nu|[Xx]i|[Pp]i|varpi|(?:var)rho)",
    "(?:[Ss]igma|varsigma|tau|[Uu]psilon|[Pp]hi|varphi|chi|[Pp]si|[Oo]mega)",
    "(?:frac|sum|prod|lim|infty|times|sqrt|leq|geq|left|right|middle|[bB]igg?)",
    "(?:[lr]angle|q?quad|[lcvdi]?dots|d?dot|hat|tilde|bar)"
  ].map((word) => word + "(?![a-zA-Z@:_])"));
  const L3_REGEX = new RegExp([
    // A function \module_function_name:signature or \__module_function_name:signature,
    // where both module and function_name need at least two characters and
    // function_name may contain single underscores.
    "(?:__)?[a-zA-Z]{2,}_[a-zA-Z](?:_?[a-zA-Z])+:[a-zA-Z]*",
    // A variable \scope_module_and_name_type or \scope__module_ane_name_type,
    // where scope is one of l, g or c, type needs at least two characters
    // and module_and_name may contain single underscores.
    "[lgc]__?[a-zA-Z](?:_?[a-zA-Z])*_[a-zA-Z]{2,}",
    // A quark \q_the_name or \q__the_name or
    // scan mark \s_the_name or \s__vthe_name,
    // where variable_name needs at least two characters and
    // may contain single underscores.
    "[qs]__?[a-zA-Z](?:_?[a-zA-Z])+",
    // Other LaTeX3 macro names that are not covered by the three rules above.
    "use(?:_i)?:[a-zA-Z]*",
    "(?:else|fi|or):",
    "(?:if|cs|exp):w",
    "(?:hbox|vbox):n",
    "::[a-zA-Z]_unbraced",
    "::[a-zA-Z:]"
  ].map((pattern) => pattern + "(?![a-zA-Z:_])").join("|"));
  const L2_VARIANTS = [
    { begin: /[a-zA-Z@]+/ },
    // control word
    { begin: /[^a-zA-Z@]?/ }
    // control symbol
  ];
  const DOUBLE_CARET_VARIANTS = [
    { begin: /\^{6}[0-9a-f]{6}/ },
    { begin: /\^{5}[0-9a-f]{5}/ },
    { begin: /\^{4}[0-9a-f]{4}/ },
    { begin: /\^{3}[0-9a-f]{3}/ },
    { begin: /\^{2}[0-9a-f]{2}/ },
    { begin: /\^{2}[\u0000-\u007f]/ }
  ];
  const CONTROL_SEQUENCE = {
    className: "keyword",
    begin: /\\/,
    relevance: 0,
    contains: [
      {
        endsParent: true,
        begin: KNOWN_CONTROL_WORDS
      },
      {
        endsParent: true,
        begin: L3_REGEX
      },
      {
        endsParent: true,
        variants: DOUBLE_CARET_VARIANTS
      },
      {
        endsParent: true,
        relevance: 0,
        variants: L2_VARIANTS
      }
    ]
  };
  const MACRO_PARAM = {
    className: "params",
    relevance: 0,
    begin: /#+\d?/
  };
  const DOUBLE_CARET_CHAR = {
    // relevance: 1
    variants: DOUBLE_CARET_VARIANTS
  };
  const SPECIAL_CATCODE = {
    className: "built_in",
    relevance: 0,
    begin: /[$&^_]/
  };
  const MAGIC_COMMENT = {
    className: "meta",
    begin: /% ?!(T[eE]X|tex|BIB|bib)/,
    end: "$",
    relevance: 10
  };
  const COMMENT2 = hljs.COMMENT(
    "%",
    "$",
    { relevance: 0 }
  );
  const EVERYTHING_BUT_VERBATIM = [
    CONTROL_SEQUENCE,
    MACRO_PARAM,
    DOUBLE_CARET_CHAR,
    SPECIAL_CATCODE,
    MAGIC_COMMENT,
    COMMENT2
  ];
  const BRACE_GROUP_NO_VERBATIM = {
    begin: /\{/,
    end: /\}/,
    relevance: 0,
    contains: [
      "self",
      ...EVERYTHING_BUT_VERBATIM
    ]
  };
  const ARGUMENT_BRACES = hljs.inherit(
    BRACE_GROUP_NO_VERBATIM,
    {
      relevance: 0,
      endsParent: true,
      contains: [
        BRACE_GROUP_NO_VERBATIM,
        ...EVERYTHING_BUT_VERBATIM
      ]
    }
  );
  const ARGUMENT_BRACKETS = {
    begin: /\[/,
    end: /\]/,
    endsParent: true,
    relevance: 0,
    contains: [
      BRACE_GROUP_NO_VERBATIM,
      ...EVERYTHING_BUT_VERBATIM
    ]
  };
  const SPACE_GOBBLER = {
    begin: /\s+/,
    relevance: 0
  };
  const ARGUMENT_M = [ARGUMENT_BRACES];
  const ARGUMENT_O = [ARGUMENT_BRACKETS];
  const ARGUMENT_AND_THEN = function(arg, starts_mode) {
    return {
      contains: [SPACE_GOBBLER],
      starts: {
        relevance: 0,
        contains: arg,
        starts: starts_mode
      }
    };
  };
  const CSNAME = function(csname, starts_mode) {
    return {
      begin: "\\\\" + csname + "(?![a-zA-Z@:_])",
      keywords: {
        $pattern: /\\[a-zA-Z]+/,
        keyword: "\\" + csname
      },
      relevance: 0,
      contains: [SPACE_GOBBLER],
      starts: starts_mode
    };
  };
  const BEGIN_ENV = function(envname, starts_mode) {
    return hljs.inherit(
      {
        begin: "\\\\begin(?=[ 	]*(\\r?\\n[ 	]*)?\\{" + envname + "\\})",
        keywords: {
          $pattern: /\\[a-zA-Z]+/,
          keyword: "\\begin"
        },
        relevance: 0
      },
      ARGUMENT_AND_THEN(ARGUMENT_M, starts_mode)
    );
  };
  const VERBATIM_DELIMITED_EQUAL = (innerName = "string") => {
    return hljs.END_SAME_AS_BEGIN({
      className: innerName,
      begin: /(.|\r?\n)/,
      end: /(.|\r?\n)/,
      excludeBegin: true,
      excludeEnd: true,
      endsParent: true
    });
  };
  const VERBATIM_DELIMITED_ENV = function(envname) {
    return {
      className: "string",
      end: "(?=\\\\end\\{" + envname + "\\})"
    };
  };
  const VERBATIM_DELIMITED_BRACES = (innerName = "string") => {
    return {
      relevance: 0,
      begin: /\{/,
      starts: {
        endsParent: true,
        contains: [
          {
            className: innerName,
            end: /(?=\})/,
            endsParent: true,
            contains: [
              {
                begin: /\{/,
                end: /\}/,
                relevance: 0,
                contains: ["self"]
              }
            ]
          }
        ]
      }
    };
  };
  const VERBATIM = [
    ...[
      "verb",
      "lstinline"
    ].map((csname) => CSNAME(csname, { contains: [VERBATIM_DELIMITED_EQUAL()] })),
    CSNAME("mint", ARGUMENT_AND_THEN(ARGUMENT_M, { contains: [VERBATIM_DELIMITED_EQUAL()] })),
    CSNAME("mintinline", ARGUMENT_AND_THEN(ARGUMENT_M, { contains: [
      VERBATIM_DELIMITED_BRACES(),
      VERBATIM_DELIMITED_EQUAL()
    ] })),
    CSNAME("url", { contains: [
      VERBATIM_DELIMITED_BRACES("link"),
      VERBATIM_DELIMITED_BRACES("link")
    ] }),
    CSNAME("hyperref", { contains: [VERBATIM_DELIMITED_BRACES("link")] }),
    CSNAME("href", ARGUMENT_AND_THEN(ARGUMENT_O, { contains: [VERBATIM_DELIMITED_BRACES("link")] })),
    ...[].concat(...[
      "",
      "\\*"
    ].map((suffix) => [
      BEGIN_ENV("verbatim" + suffix, VERBATIM_DELIMITED_ENV("verbatim" + suffix)),
      BEGIN_ENV("filecontents" + suffix, ARGUMENT_AND_THEN(ARGUMENT_M, VERBATIM_DELIMITED_ENV("filecontents" + suffix))),
      ...[
        "",
        "B",
        "L"
      ].map(
        (prefix) => BEGIN_ENV(prefix + "Verbatim" + suffix, ARGUMENT_AND_THEN(ARGUMENT_O, VERBATIM_DELIMITED_ENV(prefix + "Verbatim" + suffix)))
      )
    ])),
    BEGIN_ENV("minted", ARGUMENT_AND_THEN(ARGUMENT_O, ARGUMENT_AND_THEN(ARGUMENT_M, VERBATIM_DELIMITED_ENV("minted"))))
  ];
  return {
    name: "LaTeX",
    aliases: ["tex"],
    contains: [
      ...VERBATIM,
      ...EVERYTHING_BUT_VERBATIM
    ]
  };
}
const MODES$1 = (hljs) => {
  return {
    IMPORTANT: {
      scope: "meta",
      begin: "!important"
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: "number",
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: "selector-attr",
      begin: /\[/,
      end: /\]/,
      illegal: "$",
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: "number",
      begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};
const HTML_TAGS$1 = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
];
const SVG_TAGS$1 = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
];
const TAGS$1 = [
  ...HTML_TAGS$1,
  ...SVG_TAGS$1
];
const MEDIA_FEATURES$1 = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse();
const PSEUDO_CLASSES$1 = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse();
const PSEUDO_ELEMENTS$1 = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse();
const ATTRIBUTES$1 = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
const PSEUDO_SELECTORS = PSEUDO_CLASSES$1.concat(PSEUDO_ELEMENTS$1).sort().reverse();
function less(hljs) {
  const modes = MODES$1(hljs);
  const PSEUDO_SELECTORS$1 = PSEUDO_SELECTORS;
  const AT_MODIFIERS = "and or not only";
  const IDENT_RE2 = "[\\w-]+";
  const INTERP_IDENT_RE = "(" + IDENT_RE2 + "|@\\{" + IDENT_RE2 + "\\})";
  const RULES = [];
  const VALUE_MODES = [];
  const STRING_MODE = function(c2) {
    return {
      // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
      className: "string",
      begin: "~?" + c2 + ".*?" + c2
    };
  };
  const IDENT_MODE = function(name2, begin, relevance) {
    return {
      className: name2,
      begin,
      relevance
    };
  };
  const AT_KEYWORDS = {
    $pattern: /[a-z-]+/,
    keyword: AT_MODIFIERS,
    attribute: MEDIA_FEATURES$1.join(" ")
  };
  const PARENS_MODE = {
    // used only to properly balance nested parens inside mixin call, def. arg list
    begin: "\\(",
    end: "\\)",
    contains: VALUE_MODES,
    keywords: AT_KEYWORDS,
    relevance: 0
  };
  VALUE_MODES.push(
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING_MODE("'"),
    STRING_MODE('"'),
    modes.CSS_NUMBER_MODE,
    // fixme: it does not include dot for numbers like .5em :(
    {
      begin: "(url|data-uri)\\(",
      starts: {
        className: "string",
        end: "[\\)\\n]",
        excludeEnd: true
      }
    },
    modes.HEXCOLOR,
    PARENS_MODE,
    IDENT_MODE("variable", "@@?" + IDENT_RE2, 10),
    IDENT_MODE("variable", "@\\{" + IDENT_RE2 + "\\}"),
    IDENT_MODE("built_in", "~?`[^`]*?`"),
    // inline javascript (or whatever host language) *multiline* string
    {
      // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
      className: "attribute",
      begin: IDENT_RE2 + "\\s*:",
      end: ":",
      returnBegin: true,
      excludeEnd: true
    },
    modes.IMPORTANT,
    { beginKeywords: "and not" },
    modes.FUNCTION_DISPATCH
  );
  const VALUE_WITH_RULESETS = VALUE_MODES.concat({
    begin: /\{/,
    end: /\}/,
    contains: RULES
  });
  const MIXIN_GUARD_MODE = {
    beginKeywords: "when",
    endsWithParent: true,
    contains: [{ beginKeywords: "and not" }].concat(VALUE_MODES)
    // using this form to override VALUE’s 'function' match
  };
  const RULE_MODE = {
    begin: INTERP_IDENT_RE + "\\s*:",
    returnBegin: true,
    end: /[;}]/,
    relevance: 0,
    contains: [
      { begin: /-(webkit|moz|ms|o)-/ },
      modes.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + ATTRIBUTES$1.join("|") + ")\\b",
        end: /(?=:)/,
        starts: {
          endsWithParent: true,
          illegal: "[<=$]",
          relevance: 0,
          contains: VALUE_MODES
        }
      }
    ]
  };
  const AT_RULE_MODE = {
    className: "keyword",
    begin: "@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",
    starts: {
      end: "[;{}]",
      keywords: AT_KEYWORDS,
      returnEnd: true,
      contains: VALUE_MODES,
      relevance: 0
    }
  };
  const VAR_RULE_MODE = {
    className: "variable",
    variants: [
      // using more strict pattern for higher relevance to increase chances of Less detection.
      // this is *the only* Less specific statement used in most of the sources, so...
      // (we’ll still often loose to the css-parser unless there's '//' comment,
      // simply because 1 variable just can't beat 99 properties :)
      {
        begin: "@" + IDENT_RE2 + "\\s*:",
        relevance: 15
      },
      { begin: "@" + IDENT_RE2 }
    ],
    starts: {
      end: "[;}]",
      returnEnd: true,
      contains: VALUE_WITH_RULESETS
    }
  };
  const SELECTOR_MODE = {
    // first parse unambiguous selectors (i.e. those not starting with tag)
    // then fall into the scary lookahead-discriminator variant.
    // this mode also handles mixin definitions and calls
    variants: [
      {
        begin: "[\\.#:&\\[>]",
        end: "[;{}]"
        // mixin calls end with ';'
      },
      {
        begin: INTERP_IDENT_RE,
        end: /\{/
      }
    ],
    returnBegin: true,
    returnEnd: true,
    illegal: `[<='$"]`,
    relevance: 0,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      MIXIN_GUARD_MODE,
      IDENT_MODE("keyword", "all\\b"),
      IDENT_MODE("variable", "@\\{" + IDENT_RE2 + "\\}"),
      // otherwise it’s identified as tag
      {
        begin: "\\b(" + TAGS$1.join("|") + ")\\b",
        className: "selector-tag"
      },
      modes.CSS_NUMBER_MODE,
      IDENT_MODE("selector-tag", INTERP_IDENT_RE, 0),
      IDENT_MODE("selector-id", "#" + INTERP_IDENT_RE),
      IDENT_MODE("selector-class", "\\." + INTERP_IDENT_RE, 0),
      IDENT_MODE("selector-tag", "&", 0),
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        begin: ":(" + PSEUDO_CLASSES$1.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + PSEUDO_ELEMENTS$1.join("|") + ")"
      },
      {
        begin: /\(/,
        end: /\)/,
        relevance: 0,
        contains: VALUE_WITH_RULESETS
      },
      // argument list of parametric mixins
      { begin: "!important" },
      // eat !important after mixin call or it will be colored as tag
      modes.FUNCTION_DISPATCH
    ]
  };
  const PSEUDO_SELECTOR_MODE = {
    begin: IDENT_RE2 + `:(:)?(${PSEUDO_SELECTORS$1.join("|")})`,
    returnBegin: true,
    contains: [SELECTOR_MODE]
  };
  RULES.push(
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    AT_RULE_MODE,
    VAR_RULE_MODE,
    PSEUDO_SELECTOR_MODE,
    RULE_MODE,
    SELECTOR_MODE,
    MIXIN_GUARD_MODE,
    modes.FUNCTION_DISPATCH
  );
  return {
    name: "Less",
    case_insensitive: true,
    illegal: `[=>'/<($"]`,
    contains: RULES
  };
}
function markdown(hljs) {
  const regex = hljs.regex;
  const INLINE_HTML = {
    begin: /<\/?[A-Za-z_]/,
    end: ">",
    subLanguage: "xml",
    relevance: 0
  };
  const HORIZONTAL_RULE = {
    begin: "^[-\\*]{3,}",
    end: "$"
  };
  const CODE = {
    className: "code",
    variants: [
      // TODO: fix to allow these to work with sublanguage also
      { begin: "(`{3,})[^`](.|\\n)*?\\1`*[ ]*" },
      { begin: "(~{3,})[^~](.|\\n)*?\\1~*[ ]*" },
      // needed to allow markdown as a sublanguage to work
      {
        begin: "```",
        end: "```+[ ]*$"
      },
      {
        begin: "~~~",
        end: "~~~+[ ]*$"
      },
      { begin: "`.+?`" },
      {
        begin: "(?=^( {4}|\\t))",
        // use contains to gobble up multiple lines to allow the block to be whatever size
        // but only have a single open/close tag vs one per line
        contains: [
          {
            begin: "^( {4}|\\t)",
            end: "(\\n)$"
          }
        ],
        relevance: 0
      }
    ]
  };
  const LIST = {
    className: "bullet",
    begin: "^[ 	]*([*+-]|(\\d+\\.))(?=\\s+)",
    end: "\\s+",
    excludeEnd: true
  };
  const LINK_REFERENCE = {
    begin: /^\[[^\n]+\]:/,
    returnBegin: true,
    contains: [
      {
        className: "symbol",
        begin: /\[/,
        end: /\]/,
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: "link",
        begin: /:\s*/,
        end: /$/,
        excludeBegin: true
      }
    ]
  };
  const URL_SCHEME = /[A-Za-z][A-Za-z0-9+.-]*/;
  const LINK = {
    variants: [
      // too much like nested array access in so many languages
      // to have any real relevance
      {
        begin: /\[.+?\]\[.*?\]/,
        relevance: 0
      },
      // popular internet URLs
      {
        begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
        relevance: 2
      },
      {
        begin: regex.concat(/\[.+?\]\(/, URL_SCHEME, /:\/\/.*?\)/),
        relevance: 2
      },
      // relative urls
      {
        begin: /\[.+?\]\([./?&#].*?\)/,
        relevance: 1
      },
      // whatever else, lower relevance (might not be a link at all)
      {
        begin: /\[.*?\]\(.*?\)/,
        relevance: 0
      }
    ],
    returnBegin: true,
    contains: [
      {
        // empty strings for alt or link text
        match: /\[(?=\])/
      },
      {
        className: "string",
        relevance: 0,
        begin: "\\[",
        end: "\\]",
        excludeBegin: true,
        returnEnd: true
      },
      {
        className: "link",
        relevance: 0,
        begin: "\\]\\(",
        end: "\\)",
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: "symbol",
        relevance: 0,
        begin: "\\]\\[",
        end: "\\]",
        excludeBegin: true,
        excludeEnd: true
      }
    ]
  };
  const BOLD = {
    className: "strong",
    contains: [],
    // defined later
    variants: [
      {
        begin: /_{2}(?!\s)/,
        end: /_{2}/
      },
      {
        begin: /\*{2}(?!\s)/,
        end: /\*{2}/
      }
    ]
  };
  const ITALIC = {
    className: "emphasis",
    contains: [],
    // defined later
    variants: [
      {
        begin: /\*(?![*\s])/,
        end: /\*/
      },
      {
        begin: /_(?![_\s])/,
        end: /_/,
        relevance: 0
      }
    ]
  };
  const BOLD_WITHOUT_ITALIC = hljs.inherit(BOLD, { contains: [] });
  const ITALIC_WITHOUT_BOLD = hljs.inherit(ITALIC, { contains: [] });
  BOLD.contains.push(ITALIC_WITHOUT_BOLD);
  ITALIC.contains.push(BOLD_WITHOUT_ITALIC);
  let CONTAINABLE = [
    INLINE_HTML,
    LINK
  ];
  [
    BOLD,
    ITALIC,
    BOLD_WITHOUT_ITALIC,
    ITALIC_WITHOUT_BOLD
  ].forEach((m2) => {
    m2.contains = m2.contains.concat(CONTAINABLE);
  });
  CONTAINABLE = CONTAINABLE.concat(BOLD, ITALIC);
  const HEADER = {
    className: "section",
    variants: [
      {
        begin: "^#{1,6}",
        end: "$",
        contains: CONTAINABLE
      },
      {
        begin: "(?=^.+?\\n[=-]{2,}$)",
        contains: [
          { begin: "^[=-]*$" },
          {
            begin: "^",
            end: "\\n",
            contains: CONTAINABLE
          }
        ]
      }
    ]
  };
  const BLOCKQUOTE = {
    className: "quote",
    begin: "^>\\s+",
    contains: CONTAINABLE,
    end: "$"
  };
  const ENTITY = {
    //https://spec.commonmark.org/0.31.2/#entity-references
    scope: "literal",
    match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
  };
  return {
    name: "Markdown",
    aliases: [
      "md",
      "mkdown",
      "mkd"
    ],
    contains: [
      HEADER,
      INLINE_HTML,
      LIST,
      BOLD,
      ITALIC,
      BLOCKQUOTE,
      CODE,
      HORIZONTAL_RULE,
      LINK,
      LINK_REFERENCE,
      ENTITY
    ]
  };
}
function matlab(hljs) {
  const TRANSPOSE_RE = "('|\\.')+";
  const TRANSPOSE = {
    relevance: 0,
    contains: [{ begin: TRANSPOSE_RE }]
  };
  return {
    name: "Matlab",
    keywords: {
      keyword: "arguments break case catch classdef continue else elseif end enumeration events for function globalThis if methods otherwise parfor persistent properties return spmd switch try while",
      built_in: "sin sind sinh asin asind asinh cos cosd cosh acos acosd acosh tan tand tanh atan atand atan2 atanh sec secd sech asec asecd asech csc cscd csch acsc acscd acsch cot cotd coth acot acotd acoth hypot exp expm1 log log1p log10 log2 pow2 realpow reallog realsqrt sqrt nthroot nextpow2 abs angle complex conj imag real unwrap isreal cplxpair fix floor ceil round mod rem sign airy besselj bessely besselh besseli besselk beta betainc betaln ellipj ellipke erf erfc erfcx erfinv expint gamma gammainc gammaln psi legendre cross dot factor isprime primes gcd lcm rat rats perms nchoosek factorial cart2sph cart2pol pol2cart sph2cart hsv2rgb rgb2hsv zeros ones eye repmat rand randn linspace logspace freqspace meshgrid accumarray size length ndims numel disp isempty isequal isequalwithequalnans cat reshape diag blkdiag tril triu fliplr flipud flipdim rot90 find sub2ind ind2sub bsxfun ndgrid permute ipermute shiftdim circshift squeeze isscalar isvector ans eps realmax realmin pi i|0 inf nan isnan isinf isfinite j|0 why compan gallery hadamard hankel hilb invhilb magic pascal rosser toeplitz vander wilkinson max min nanmax nanmin mean nanmean type table readtable writetable sortrows sort figure plot plot3 scatter scatter3 cellfun legend intersect ismember procrustes hold num2cell "
    },
    illegal: '(//|"|#|/\\*|\\s+/\\w+)',
    contains: [
      {
        className: "function",
        beginKeywords: "function",
        end: "$",
        contains: [
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: "params",
            variants: [
              {
                begin: "\\(",
                end: "\\)"
              },
              {
                begin: "\\[",
                end: "\\]"
              }
            ]
          }
        ]
      },
      {
        className: "built_in",
        begin: /true|false/,
        relevance: 0,
        starts: TRANSPOSE
      },
      {
        begin: "[a-zA-Z][a-zA-Z_0-9]*" + TRANSPOSE_RE,
        relevance: 0
      },
      {
        className: "number",
        begin: hljs.C_NUMBER_RE,
        relevance: 0,
        starts: TRANSPOSE
      },
      {
        className: "string",
        begin: "'",
        end: "'",
        contains: [{ begin: "''" }]
      },
      {
        begin: /\]|\}|\)/,
        relevance: 0,
        starts: TRANSPOSE
      },
      {
        className: "string",
        begin: '"',
        end: '"',
        contains: [{ begin: '""' }],
        starts: TRANSPOSE
      },
      hljs.COMMENT("^\\s*%\\{\\s*$", "^\\s*%\\}\\s*$"),
      hljs.COMMENT("%", "$")
    ]
  };
}
function nginx(hljs) {
  const regex = hljs.regex;
  const VAR = {
    className: "variable",
    variants: [
      { begin: /\$\d+/ },
      { begin: /\$\{\w+\}/ },
      { begin: regex.concat(/[$@]/, hljs.UNDERSCORE_IDENT_RE) }
    ]
  };
  const LITERALS2 = [
    "on",
    "off",
    "yes",
    "no",
    "true",
    "false",
    "none",
    "blocked",
    "debug",
    "info",
    "notice",
    "warn",
    "error",
    "crit",
    "select",
    "break",
    "last",
    "permanent",
    "redirect",
    "kqueue",
    "rtsig",
    "epoll",
    "poll",
    "/dev/poll"
  ];
  const DEFAULT = {
    endsWithParent: true,
    keywords: {
      $pattern: /[a-z_]{2,}|\/dev\/poll/,
      literal: LITERALS2
    },
    relevance: 0,
    illegal: "=>",
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        className: "string",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          VAR
        ],
        variants: [
          {
            begin: /"/,
            end: /"/
          },
          {
            begin: /'/,
            end: /'/
          }
        ]
      },
      // this swallows entire URLs to avoid detecting numbers within
      {
        begin: "([a-z]+):/",
        end: "\\s",
        endsWithParent: true,
        excludeEnd: true,
        contains: [VAR]
      },
      {
        className: "regexp",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          VAR
        ],
        variants: [
          {
            begin: "\\s\\^",
            end: "\\s|\\{|;",
            returnEnd: true
          },
          // regexp locations (~, ~*)
          {
            begin: "~\\*?\\s+",
            end: "\\s|\\{|;",
            returnEnd: true
          },
          // *.example.com
          { begin: "\\*(\\.[a-z\\-]+)+" },
          // sub.example.*
          { begin: "([a-z\\-]+\\.)+\\*" }
        ]
      },
      // IP
      {
        className: "number",
        begin: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"
      },
      // units
      {
        className: "number",
        begin: "\\b\\d+[kKmMgGdshdwy]?\\b",
        relevance: 0
      },
      VAR
    ]
  };
  return {
    name: "Nginx config",
    aliases: ["nginxconf"],
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        beginKeywords: "upstream location",
        end: /;|\{/,
        contains: DEFAULT.contains,
        keywords: { section: "upstream location" }
      },
      {
        className: "section",
        begin: regex.concat(hljs.UNDERSCORE_IDENT_RE + regex.lookahead(/\s+\{/)),
        relevance: 0
      },
      {
        begin: regex.lookahead(hljs.UNDERSCORE_IDENT_RE + "\\s"),
        end: ";|\\{",
        contains: [
          {
            className: "attribute",
            begin: hljs.UNDERSCORE_IDENT_RE,
            starts: DEFAULT
          }
        ],
        relevance: 0
      }
    ],
    illegal: "[^\\s\\}\\{]"
  };
}
function objectivec(hljs) {
  const API_CLASS = {
    className: "built_in",
    begin: "\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"
  };
  const IDENTIFIER_RE = /[a-zA-Z@][a-zA-Z0-9_]*/;
  const TYPES2 = [
    "int",
    "float",
    "char",
    "unsigned",
    "signed",
    "short",
    "long",
    "double",
    "wchar_t",
    "unichar",
    "void",
    "bool",
    "BOOL",
    "id|0",
    "_Bool"
  ];
  const KWS = [
    "while",
    "export",
    "sizeof",
    "typedef",
    "const",
    "struct",
    "for",
    "union",
    "volatile",
    "static",
    "mutable",
    "if",
    "do",
    "return",
    "goto",
    "enum",
    "else",
    "break",
    "extern",
    "asm",
    "case",
    "default",
    "register",
    "explicit",
    "typename",
    "switch",
    "continue",
    "inline",
    "readonly",
    "assign",
    "readwrite",
    "self",
    "@synchronized",
    "id",
    "typeof",
    "nonatomic",
    "IBOutlet",
    "IBAction",
    "strong",
    "weak",
    "copy",
    "in",
    "out",
    "inout",
    "bycopy",
    "byref",
    "oneway",
    "__strong",
    "__weak",
    "__block",
    "__autoreleasing",
    "@private",
    "@protected",
    "@public",
    "@try",
    "@property",
    "@end",
    "@throw",
    "@catch",
    "@finally",
    "@autoreleasepool",
    "@synthesize",
    "@dynamic",
    "@selector",
    "@optional",
    "@required",
    "@encode",
    "@package",
    "@import",
    "@defs",
    "@compatibility_alias",
    "__bridge",
    "__bridge_transfer",
    "__bridge_retained",
    "__bridge_retain",
    "__covariant",
    "__contravariant",
    "__kindof",
    "_Nonnull",
    "_Nullable",
    "_Null_unspecified",
    "__FUNCTION__",
    "__PRETTY_FUNCTION__",
    "__attribute__",
    "getter",
    "setter",
    "retain",
    "unsafe_unretained",
    "nonnull",
    "nullable",
    "null_unspecified",
    "null_resettable",
    "class",
    "instancetype",
    "NS_DESIGNATED_INITIALIZER",
    "NS_UNAVAILABLE",
    "NS_REQUIRES_SUPER",
    "NS_RETURNS_INNER_POINTER",
    "NS_INLINE",
    "NS_AVAILABLE",
    "NS_DEPRECATED",
    "NS_ENUM",
    "NS_OPTIONS",
    "NS_SWIFT_UNAVAILABLE",
    "NS_ASSUME_NONNULL_BEGIN",
    "NS_ASSUME_NONNULL_END",
    "NS_REFINED_FOR_SWIFT",
    "NS_SWIFT_NAME",
    "NS_SWIFT_NOTHROW",
    "NS_DURING",
    "NS_HANDLER",
    "NS_ENDHANDLER",
    "NS_VALUERETURN",
    "NS_VOIDRETURN"
  ];
  const LITERALS2 = [
    "false",
    "true",
    "FALSE",
    "TRUE",
    "nil",
    "YES",
    "NO",
    "NULL"
  ];
  const BUILT_INS2 = [
    "dispatch_once_t",
    "dispatch_queue_t",
    "dispatch_sync",
    "dispatch_async",
    "dispatch_once"
  ];
  const KEYWORDS2 = {
    "variable.language": [
      "this",
      "super"
    ],
    $pattern: IDENTIFIER_RE,
    keyword: KWS,
    literal: LITERALS2,
    built_in: BUILT_INS2,
    type: TYPES2
  };
  const CLASS_KEYWORDS = {
    $pattern: IDENTIFIER_RE,
    keyword: [
      "@interface",
      "@class",
      "@protocol",
      "@implementation"
    ]
  };
  return {
    name: "Objective-C",
    aliases: [
      "mm",
      "objc",
      "obj-c",
      "obj-c++",
      "objective-c++"
    ],
    keywords: KEYWORDS2,
    illegal: "</",
    contains: [
      API_CLASS,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      {
        className: "string",
        variants: [
          {
            begin: '@"',
            end: '"',
            illegal: "\\n",
            contains: [hljs.BACKSLASH_ESCAPE]
          }
        ]
      },
      {
        className: "meta",
        begin: /#\s*[a-z]+\b/,
        end: /$/,
        keywords: { keyword: "if else elif endif define undef warning error line pragma ifdef ifndef include" },
        contains: [
          {
            begin: /\\\n/,
            relevance: 0
          },
          hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" }),
          {
            className: "string",
            begin: /<.*?>/,
            end: /$/,
            illegal: "\\n"
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        className: "class",
        begin: "(" + CLASS_KEYWORDS.keyword.join("|") + ")\\b",
        end: /(\{|$)/,
        excludeEnd: true,
        keywords: CLASS_KEYWORDS,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: "\\." + hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}
function pgsql(hljs) {
  const COMMENT_MODE = hljs.COMMENT("--", "$");
  const UNQUOTED_IDENT = "[a-zA-Z_][a-zA-Z_0-9$]*";
  const DOLLAR_STRING = "\\$([a-zA-Z_]?|[a-zA-Z_][a-zA-Z_0-9]*)\\$";
  const LABEL = "<<\\s*" + UNQUOTED_IDENT + "\\s*>>";
  const SQL_KW = (
    // https://www.postgresql.org/docs/11/static/sql-keywords-appendix.html
    // https://www.postgresql.org/docs/11/static/sql-commands.html
    // SQL commands (starting words)
    "ABORT ALTER ANALYZE BEGIN CALL CHECKPOINT|10 CLOSE CLUSTER COMMENT COMMIT COPY CREATE DEALLOCATE DECLARE DELETE DISCARD DO DROP END EXECUTE EXPLAIN FETCH GRANT IMPORT INSERT LISTEN LOAD LOCK MOVE NOTIFY PREPARE REASSIGN|10 REFRESH REINDEX RELEASE RESET REVOKE ROLLBACK SAVEPOINT SECURITY SELECT SET SHOW START TRUNCATE UNLISTEN|10 UPDATE VACUUM|10 VALUES AGGREGATE COLLATION CONVERSION|10 DATABASE DEFAULT PRIVILEGES DOMAIN TRIGGER EXTENSION FOREIGN WRAPPER|10 TABLE FUNCTION GROUP LANGUAGE LARGE OBJECT MATERIALIZED VIEW OPERATOR CLASS FAMILY POLICY PUBLICATION|10 ROLE RULE SCHEMA SEQUENCE SERVER STATISTICS SUBSCRIPTION SYSTEM TABLESPACE CONFIGURATION DICTIONARY PARSER TEMPLATE TYPE USER MAPPING PREPARED ACCESS METHOD CAST AS TRANSFORM TRANSACTION OWNED TO INTO SESSION AUTHORIZATION INDEX PROCEDURE ASSERTION ALL ANALYSE AND ANY ARRAY ASC ASYMMETRIC|10 BOTH CASE CHECK COLLATE COLUMN CONCURRENTLY|10 CONSTRAINT CROSS DEFERRABLE RANGE DESC DISTINCT ELSE EXCEPT FOR FREEZE|10 FROM FULL HAVING ILIKE IN INITIALLY INNER INTERSECT IS ISNULL JOIN LATERAL LEADING LIKE LIMIT NATURAL NOT NOTNULL NULL OFFSET ON ONLY OR ORDER OUTER OVERLAPS PLACING PRIMARY REFERENCES RETURNING SIMILAR SOME SYMMETRIC TABLESAMPLE THEN TRAILING UNION UNIQUE USING VARIADIC|10 VERBOSE WHEN WHERE WINDOW WITH BY RETURNS INOUT OUT SETOF|10 IF STRICT CURRENT CONTINUE OWNER LOCATION OVER PARTITION WITHIN BETWEEN ESCAPE EXTERNAL INVOKER DEFINER WORK RENAME VERSION CONNECTION CONNECT TABLES TEMP TEMPORARY FUNCTIONS SEQUENCES TYPES SCHEMAS OPTION CASCADE RESTRICT ADD ADMIN EXISTS VALID VALIDATE ENABLE DISABLE REPLICA|10 ALWAYS PASSING COLUMNS PATH REF VALUE OVERRIDING IMMUTABLE STABLE VOLATILE BEFORE AFTER EACH ROW PROCEDURAL ROUTINE NO HANDLER VALIDATOR OPTIONS STORAGE OIDS|10 WITHOUT INHERIT DEPENDS CALLED INPUT LEAKPROOF|10 COST ROWS NOWAIT SEARCH UNTIL ENCRYPTED|10 PASSWORD CONFLICT|10 INSTEAD INHERITS CHARACTERISTICS WRITE CURSOR ALSO STATEMENT SHARE EXCLUSIVE INLINE ISOLATION REPEATABLE READ COMMITTED SERIALIZABLE UNCOMMITTED LOCAL GLOBAL SQL PROCEDURES RECURSIVE SNAPSHOT ROLLUP CUBE TRUSTED|10 INCLUDE FOLLOWING PRECEDING UNBOUNDED RANGE GROUPS UNENCRYPTED|10 SYSID FORMAT DELIMITER HEADER QUOTE ENCODING FILTER OFF FORCE_QUOTE FORCE_NOT_NULL FORCE_NULL COSTS BUFFERS TIMING SUMMARY DISABLE_PAGE_SKIPPING RESTART CYCLE GENERATED IDENTITY DEFERRED IMMEDIATE LEVEL LOGGED UNLOGGED OF NOTHING NONE EXCLUDE ATTRIBUTE USAGE ROUTINES TRUE FALSE NAN INFINITY "
  );
  const ROLE_ATTRS = (
    // only those not in keywrods already
    "SUPERUSER NOSUPERUSER CREATEDB NOCREATEDB CREATEROLE NOCREATEROLE INHERIT NOINHERIT LOGIN NOLOGIN REPLICATION NOREPLICATION BYPASSRLS NOBYPASSRLS "
  );
  const PLPGSQL_KW = "ALIAS BEGIN CONSTANT DECLARE END EXCEPTION RETURN PERFORM|10 RAISE GET DIAGNOSTICS STACKED|10 FOREACH LOOP ELSIF EXIT WHILE REVERSE SLICE DEBUG LOG INFO NOTICE WARNING ASSERT OPEN ";
  const TYPES2 = (
    // https://www.postgresql.org/docs/11/static/datatype.html
    "BIGINT INT8 BIGSERIAL SERIAL8 BIT VARYING VARBIT BOOLEAN BOOL BOX BYTEA CHARACTER CHAR VARCHAR CIDR CIRCLE DATE DOUBLE PRECISION FLOAT8 FLOAT INET INTEGER INT INT4 INTERVAL JSON JSONB LINE LSEG|10 MACADDR MACADDR8 MONEY NUMERIC DEC DECIMAL PATH POINT POLYGON REAL FLOAT4 SMALLINT INT2 SMALLSERIAL|10 SERIAL2|10 SERIAL|10 SERIAL4|10 TEXT TIME ZONE TIMETZ|10 TIMESTAMP TIMESTAMPTZ|10 TSQUERY|10 TSVECTOR|10 TXID_SNAPSHOT|10 UUID XML NATIONAL NCHAR INT4RANGE|10 INT8RANGE|10 NUMRANGE|10 TSRANGE|10 TSTZRANGE|10 DATERANGE|10 ANYELEMENT ANYARRAY ANYNONARRAY ANYENUM ANYRANGE CSTRING INTERNAL RECORD PG_DDL_COMMAND VOID UNKNOWN OPAQUE REFCURSOR NAME OID REGPROC|10 REGPROCEDURE|10 REGOPER|10 REGOPERATOR|10 REGCLASS|10 REGTYPE|10 REGROLE|10 REGNAMESPACE|10 REGCONFIG|10 REGDICTIONARY|10 "
  );
  const TYPES_RE = TYPES2.trim().split(" ").map(function(val) {
    return val.split("|")[0];
  }).join("|");
  const SQL_BI = "CURRENT_TIME CURRENT_TIMESTAMP CURRENT_USER CURRENT_CATALOG|10 CURRENT_DATE LOCALTIME LOCALTIMESTAMP CURRENT_ROLE|10 CURRENT_SCHEMA|10 SESSION_USER PUBLIC ";
  const PLPGSQL_BI = "FOUND NEW OLD TG_NAME|10 TG_WHEN|10 TG_LEVEL|10 TG_OP|10 TG_RELID|10 TG_RELNAME|10 TG_TABLE_NAME|10 TG_TABLE_SCHEMA|10 TG_NARGS|10 TG_ARGV|10 TG_EVENT|10 TG_TAG|10 ROW_COUNT RESULT_OID|10 PG_CONTEXT|10 RETURNED_SQLSTATE COLUMN_NAME CONSTRAINT_NAME PG_DATATYPE_NAME|10 MESSAGE_TEXT TABLE_NAME SCHEMA_NAME PG_EXCEPTION_DETAIL|10 PG_EXCEPTION_HINT|10 PG_EXCEPTION_CONTEXT|10 ";
  const PLPGSQL_EXCEPTIONS = (
    // exceptions https://www.postgresql.org/docs/current/static/errcodes-appendix.html
    "SQLSTATE SQLERRM|10 SUCCESSFUL_COMPLETION WARNING DYNAMIC_RESULT_SETS_RETURNED IMPLICIT_ZERO_BIT_PADDING NULL_VALUE_ELIMINATED_IN_SET_FUNCTION PRIVILEGE_NOT_GRANTED PRIVILEGE_NOT_REVOKED STRING_DATA_RIGHT_TRUNCATION DEPRECATED_FEATURE NO_DATA NO_ADDITIONAL_DYNAMIC_RESULT_SETS_RETURNED SQL_STATEMENT_NOT_YET_COMPLETE CONNECTION_EXCEPTION CONNECTION_DOES_NOT_EXIST CONNECTION_FAILURE SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION TRANSACTION_RESOLUTION_UNKNOWN PROTOCOL_VIOLATION TRIGGERED_ACTION_EXCEPTION FEATURE_NOT_SUPPORTED INVALID_TRANSACTION_INITIATION LOCATOR_EXCEPTION INVALID_LOCATOR_SPECIFICATION INVALID_GRANTOR INVALID_GRANT_OPERATION INVALID_ROLE_SPECIFICATION DIAGNOSTICS_EXCEPTION STACKED_DIAGNOSTICS_ACCESSED_WITHOUT_ACTIVE_HANDLER CASE_NOT_FOUND CARDINALITY_VIOLATION DATA_EXCEPTION ARRAY_SUBSCRIPT_ERROR CHARACTER_NOT_IN_REPERTOIRE DATETIME_FIELD_OVERFLOW DIVISION_BY_ZERO ERROR_IN_ASSIGNMENT ESCAPE_CHARACTER_CONFLICT INDICATOR_OVERFLOW INTERVAL_FIELD_OVERFLOW INVALID_ARGUMENT_FOR_LOGARITHM INVALID_ARGUMENT_FOR_NTILE_FUNCTION INVALID_ARGUMENT_FOR_NTH_VALUE_FUNCTION INVALID_ARGUMENT_FOR_POWER_FUNCTION INVALID_ARGUMENT_FOR_WIDTH_BUCKET_FUNCTION INVALID_CHARACTER_VALUE_FOR_CAST INVALID_DATETIME_FORMAT INVALID_ESCAPE_CHARACTER INVALID_ESCAPE_OCTET INVALID_ESCAPE_SEQUENCE NONSTANDARD_USE_OF_ESCAPE_CHARACTER INVALID_INDICATOR_PARAMETER_VALUE INVALID_PARAMETER_VALUE INVALID_REGULAR_EXPRESSION INVALID_ROW_COUNT_IN_LIMIT_CLAUSE INVALID_ROW_COUNT_IN_RESULT_OFFSET_CLAUSE INVALID_TABLESAMPLE_ARGUMENT INVALID_TABLESAMPLE_REPEAT INVALID_TIME_ZONE_DISPLACEMENT_VALUE INVALID_USE_OF_ESCAPE_CHARACTER MOST_SPECIFIC_TYPE_MISMATCH NULL_VALUE_NOT_ALLOWED NULL_VALUE_NO_INDICATOR_PARAMETER NUMERIC_VALUE_OUT_OF_RANGE SEQUENCE_GENERATOR_LIMIT_EXCEEDED STRING_DATA_LENGTH_MISMATCH STRING_DATA_RIGHT_TRUNCATION SUBSTRING_ERROR TRIM_ERROR UNTERMINATED_C_STRING ZERO_LENGTH_CHARACTER_STRING FLOATING_POINT_EXCEPTION INVALID_TEXT_REPRESENTATION INVALID_BINARY_REPRESENTATION BAD_COPY_FILE_FORMAT UNTRANSLATABLE_CHARACTER NOT_AN_XML_DOCUMENT INVALID_XML_DOCUMENT INVALID_XML_CONTENT INVALID_XML_COMMENT INVALID_XML_PROCESSING_INSTRUCTION INTEGRITY_CONSTRAINT_VIOLATION RESTRICT_VIOLATION NOT_NULL_VIOLATION FOREIGN_KEY_VIOLATION UNIQUE_VIOLATION CHECK_VIOLATION EXCLUSION_VIOLATION INVALID_CURSOR_STATE INVALID_TRANSACTION_STATE ACTIVE_SQL_TRANSACTION BRANCH_TRANSACTION_ALREADY_ACTIVE HELD_CURSOR_REQUIRES_SAME_ISOLATION_LEVEL INAPPROPRIATE_ACCESS_MODE_FOR_BRANCH_TRANSACTION INAPPROPRIATE_ISOLATION_LEVEL_FOR_BRANCH_TRANSACTION NO_ACTIVE_SQL_TRANSACTION_FOR_BRANCH_TRANSACTION READ_ONLY_SQL_TRANSACTION SCHEMA_AND_DATA_STATEMENT_MIXING_NOT_SUPPORTED NO_ACTIVE_SQL_TRANSACTION IN_FAILED_SQL_TRANSACTION IDLE_IN_TRANSACTION_SESSION_TIMEOUT INVALID_SQL_STATEMENT_NAME TRIGGERED_DATA_CHANGE_VIOLATION INVALID_AUTHORIZATION_SPECIFICATION INVALID_PASSWORD DEPENDENT_PRIVILEGE_DESCRIPTORS_STILL_EXIST DEPENDENT_OBJECTS_STILL_EXIST INVALID_TRANSACTION_TERMINATION SQL_ROUTINE_EXCEPTION FUNCTION_EXECUTED_NO_RETURN_STATEMENT MODIFYING_SQL_DATA_NOT_PERMITTED PROHIBITED_SQL_STATEMENT_ATTEMPTED READING_SQL_DATA_NOT_PERMITTED INVALID_CURSOR_NAME EXTERNAL_ROUTINE_EXCEPTION CONTAINING_SQL_NOT_PERMITTED MODIFYING_SQL_DATA_NOT_PERMITTED PROHIBITED_SQL_STATEMENT_ATTEMPTED READING_SQL_DATA_NOT_PERMITTED EXTERNAL_ROUTINE_INVOCATION_EXCEPTION INVALID_SQLSTATE_RETURNED NULL_VALUE_NOT_ALLOWED TRIGGER_PROTOCOL_VIOLATED SRF_PROTOCOL_VIOLATED EVENT_TRIGGER_PROTOCOL_VIOLATED SAVEPOINT_EXCEPTION INVALID_SAVEPOINT_SPECIFICATION INVALID_CATALOG_NAME INVALID_SCHEMA_NAME TRANSACTION_ROLLBACK TRANSACTION_INTEGRITY_CONSTRAINT_VIOLATION SERIALIZATION_FAILURE STATEMENT_COMPLETION_UNKNOWN DEADLOCK_DETECTED SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION SYNTAX_ERROR INSUFFICIENT_PRIVILEGE CANNOT_COERCE GROUPING_ERROR WINDOWING_ERROR INVALID_RECURSION INVALID_FOREIGN_KEY INVALID_NAME NAME_TOO_LONG RESERVED_NAME DATATYPE_MISMATCH INDETERMINATE_DATATYPE COLLATION_MISMATCH INDETERMINATE_COLLATION WRONG_OBJECT_TYPE GENERATED_ALWAYS UNDEFINED_COLUMN UNDEFINED_FUNCTION UNDEFINED_TABLE UNDEFINED_PARAMETER UNDEFINED_OBJECT DUPLICATE_COLUMN DUPLICATE_CURSOR DUPLICATE_DATABASE DUPLICATE_FUNCTION DUPLICATE_PREPARED_STATEMENT DUPLICATE_SCHEMA DUPLICATE_TABLE DUPLICATE_ALIAS DUPLICATE_OBJECT AMBIGUOUS_COLUMN AMBIGUOUS_FUNCTION AMBIGUOUS_PARAMETER AMBIGUOUS_ALIAS INVALID_COLUMN_REFERENCE INVALID_COLUMN_DEFINITION INVALID_CURSOR_DEFINITION INVALID_DATABASE_DEFINITION INVALID_FUNCTION_DEFINITION INVALID_PREPARED_STATEMENT_DEFINITION INVALID_SCHEMA_DEFINITION INVALID_TABLE_DEFINITION INVALID_OBJECT_DEFINITION WITH_CHECK_OPTION_VIOLATION INSUFFICIENT_RESOURCES DISK_FULL OUT_OF_MEMORY TOO_MANY_CONNECTIONS CONFIGURATION_LIMIT_EXCEEDED PROGRAM_LIMIT_EXCEEDED STATEMENT_TOO_COMPLEX TOO_MANY_COLUMNS TOO_MANY_ARGUMENTS OBJECT_NOT_IN_PREREQUISITE_STATE OBJECT_IN_USE CANT_CHANGE_RUNTIME_PARAM LOCK_NOT_AVAILABLE OPERATOR_INTERVENTION QUERY_CANCELED ADMIN_SHUTDOWN CRASH_SHUTDOWN CANNOT_CONNECT_NOW DATABASE_DROPPED SYSTEM_ERROR IO_ERROR UNDEFINED_FILE DUPLICATE_FILE SNAPSHOT_TOO_OLD CONFIG_FILE_ERROR LOCK_FILE_EXISTS FDW_ERROR FDW_COLUMN_NAME_NOT_FOUND FDW_DYNAMIC_PARAMETER_VALUE_NEEDED FDW_FUNCTION_SEQUENCE_ERROR FDW_INCONSISTENT_DESCRIPTOR_INFORMATION FDW_INVALID_ATTRIBUTE_VALUE FDW_INVALID_COLUMN_NAME FDW_INVALID_COLUMN_NUMBER FDW_INVALID_DATA_TYPE FDW_INVALID_DATA_TYPE_DESCRIPTORS FDW_INVALID_DESCRIPTOR_FIELD_IDENTIFIER FDW_INVALID_HANDLE FDW_INVALID_OPTION_INDEX FDW_INVALID_OPTION_NAME FDW_INVALID_STRING_LENGTH_OR_BUFFER_LENGTH FDW_INVALID_STRING_FORMAT FDW_INVALID_USE_OF_NULL_POINTER FDW_TOO_MANY_HANDLES FDW_OUT_OF_MEMORY FDW_NO_SCHEMAS FDW_OPTION_NAME_NOT_FOUND FDW_REPLY_HANDLE FDW_SCHEMA_NOT_FOUND FDW_TABLE_NOT_FOUND FDW_UNABLE_TO_CREATE_EXECUTION FDW_UNABLE_TO_CREATE_REPLY FDW_UNABLE_TO_ESTABLISH_CONNECTION PLPGSQL_ERROR RAISE_EXCEPTION NO_DATA_FOUND TOO_MANY_ROWS ASSERT_FAILURE INTERNAL_ERROR DATA_CORRUPTED INDEX_CORRUPTED "
  );
  const FUNCTIONS = (
    // https://www.postgresql.org/docs/11/static/functions-aggregate.html
    "ARRAY_AGG AVG BIT_AND BIT_OR BOOL_AND BOOL_OR COUNT EVERY JSON_AGG JSONB_AGG JSON_OBJECT_AGG JSONB_OBJECT_AGG MAX MIN MODE STRING_AGG SUM XMLAGG CORR COVAR_POP COVAR_SAMP REGR_AVGX REGR_AVGY REGR_COUNT REGR_INTERCEPT REGR_R2 REGR_SLOPE REGR_SXX REGR_SXY REGR_SYY STDDEV STDDEV_POP STDDEV_SAMP VARIANCE VAR_POP VAR_SAMP PERCENTILE_CONT PERCENTILE_DISC ROW_NUMBER RANK DENSE_RANK PERCENT_RANK CUME_DIST NTILE LAG LEAD FIRST_VALUE LAST_VALUE NTH_VALUE NUM_NONNULLS NUM_NULLS ABS CBRT CEIL CEILING DEGREES DIV EXP FLOOR LN LOG MOD PI POWER RADIANS ROUND SCALE SIGN SQRT TRUNC WIDTH_BUCKET RANDOM SETSEED ACOS ACOSD ASIN ASIND ATAN ATAND ATAN2 ATAN2D COS COSD COT COTD SIN SIND TAN TAND BIT_LENGTH CHAR_LENGTH CHARACTER_LENGTH LOWER OCTET_LENGTH OVERLAY POSITION SUBSTRING TREAT TRIM UPPER ASCII BTRIM CHR CONCAT CONCAT_WS CONVERT CONVERT_FROM CONVERT_TO DECODE ENCODE INITCAP LEFT LENGTH LPAD LTRIM MD5 PARSE_IDENT PG_CLIENT_ENCODING QUOTE_IDENT|10 QUOTE_LITERAL|10 QUOTE_NULLABLE|10 REGEXP_MATCH REGEXP_MATCHES REGEXP_REPLACE REGEXP_SPLIT_TO_ARRAY REGEXP_SPLIT_TO_TABLE REPEAT REPLACE REVERSE RIGHT RPAD RTRIM SPLIT_PART STRPOS SUBSTR TO_ASCII TO_HEX TRANSLATE OCTET_LENGTH GET_BIT GET_BYTE SET_BIT SET_BYTE TO_CHAR TO_DATE TO_NUMBER TO_TIMESTAMP AGE CLOCK_TIMESTAMP|10 DATE_PART DATE_TRUNC ISFINITE JUSTIFY_DAYS JUSTIFY_HOURS JUSTIFY_INTERVAL MAKE_DATE MAKE_INTERVAL|10 MAKE_TIME MAKE_TIMESTAMP|10 MAKE_TIMESTAMPTZ|10 NOW STATEMENT_TIMESTAMP|10 TIMEOFDAY TRANSACTION_TIMESTAMP|10 ENUM_FIRST ENUM_LAST ENUM_RANGE AREA CENTER DIAMETER HEIGHT ISCLOSED ISOPEN NPOINTS PCLOSE POPEN RADIUS WIDTH BOX BOUND_BOX CIRCLE LINE LSEG PATH POLYGON ABBREV BROADCAST HOST HOSTMASK MASKLEN NETMASK NETWORK SET_MASKLEN TEXT INET_SAME_FAMILY INET_MERGE MACADDR8_SET7BIT ARRAY_TO_TSVECTOR GET_CURRENT_TS_CONFIG NUMNODE PLAINTO_TSQUERY PHRASETO_TSQUERY WEBSEARCH_TO_TSQUERY QUERYTREE SETWEIGHT STRIP TO_TSQUERY TO_TSVECTOR JSON_TO_TSVECTOR JSONB_TO_TSVECTOR TS_DELETE TS_FILTER TS_HEADLINE TS_RANK TS_RANK_CD TS_REWRITE TSQUERY_PHRASE TSVECTOR_TO_ARRAY TSVECTOR_UPDATE_TRIGGER TSVECTOR_UPDATE_TRIGGER_COLUMN XMLCOMMENT XMLCONCAT XMLELEMENT XMLFOREST XMLPI XMLROOT XMLEXISTS XML_IS_WELL_FORMED XML_IS_WELL_FORMED_DOCUMENT XML_IS_WELL_FORMED_CONTENT XPATH XPATH_EXISTS XMLTABLE XMLNAMESPACES TABLE_TO_XML TABLE_TO_XMLSCHEMA TABLE_TO_XML_AND_XMLSCHEMA QUERY_TO_XML QUERY_TO_XMLSCHEMA QUERY_TO_XML_AND_XMLSCHEMA CURSOR_TO_XML CURSOR_TO_XMLSCHEMA SCHEMA_TO_XML SCHEMA_TO_XMLSCHEMA SCHEMA_TO_XML_AND_XMLSCHEMA DATABASE_TO_XML DATABASE_TO_XMLSCHEMA DATABASE_TO_XML_AND_XMLSCHEMA XMLATTRIBUTES TO_JSON TO_JSONB ARRAY_TO_JSON ROW_TO_JSON JSON_BUILD_ARRAY JSONB_BUILD_ARRAY JSON_BUILD_OBJECT JSONB_BUILD_OBJECT JSON_OBJECT JSONB_OBJECT JSON_ARRAY_LENGTH JSONB_ARRAY_LENGTH JSON_EACH JSONB_EACH JSON_EACH_TEXT JSONB_EACH_TEXT JSON_EXTRACT_PATH JSONB_EXTRACT_PATH JSON_OBJECT_KEYS JSONB_OBJECT_KEYS JSON_POPULATE_RECORD JSONB_POPULATE_RECORD JSON_POPULATE_RECORDSET JSONB_POPULATE_RECORDSET JSON_ARRAY_ELEMENTS JSONB_ARRAY_ELEMENTS JSON_ARRAY_ELEMENTS_TEXT JSONB_ARRAY_ELEMENTS_TEXT JSON_TYPEOF JSONB_TYPEOF JSON_TO_RECORD JSONB_TO_RECORD JSON_TO_RECORDSET JSONB_TO_RECORDSET JSON_STRIP_NULLS JSONB_STRIP_NULLS JSONB_SET JSONB_INSERT JSONB_PRETTY CURRVAL LASTVAL NEXTVAL SETVAL COALESCE NULLIF GREATEST LEAST ARRAY_APPEND ARRAY_CAT ARRAY_NDIMS ARRAY_DIMS ARRAY_FILL ARRAY_LENGTH ARRAY_LOWER ARRAY_POSITION ARRAY_POSITIONS ARRAY_PREPEND ARRAY_REMOVE ARRAY_REPLACE ARRAY_TO_STRING ARRAY_UPPER CARDINALITY STRING_TO_ARRAY UNNEST ISEMPTY LOWER_INC UPPER_INC LOWER_INF UPPER_INF RANGE_MERGE GENERATE_SERIES GENERATE_SUBSCRIPTS CURRENT_DATABASE CURRENT_QUERY CURRENT_SCHEMA|10 CURRENT_SCHEMAS|10 INET_CLIENT_ADDR INET_CLIENT_PORT INET_SERVER_ADDR INET_SERVER_PORT ROW_SECURITY_ACTIVE FORMAT_TYPE TO_REGCLASS TO_REGPROC TO_REGPROCEDURE TO_REGOPER TO_REGOPERATOR TO_REGTYPE TO_REGNAMESPACE TO_REGROLE COL_DESCRIPTION OBJ_DESCRIPTION SHOBJ_DESCRIPTION TXID_CURRENT TXID_CURRENT_IF_ASSIGNED TXID_CURRENT_SNAPSHOT TXID_SNAPSHOT_XIP TXID_SNAPSHOT_XMAX TXID_SNAPSHOT_XMIN TXID_VISIBLE_IN_SNAPSHOT TXID_STATUS CURRENT_SETTING SET_CONFIG BRIN_SUMMARIZE_NEW_VALUES BRIN_SUMMARIZE_RANGE BRIN_DESUMMARIZE_RANGE GIN_CLEAN_PENDING_LIST SUPPRESS_REDUNDANT_UPDATES_TRIGGER LO_FROM_BYTEA LO_PUT LO_GET LO_CREAT LO_CREATE LO_UNLINK LO_IMPORT LO_EXPORT LOREAD LOWRITE GROUPING CAST "
  );
  const FUNCTIONS_RE = FUNCTIONS.trim().split(" ").map(function(val) {
    return val.split("|")[0];
  }).join("|");
  return {
    name: "PostgreSQL",
    aliases: [
      "postgres",
      "postgresql"
    ],
    supersetOf: "sql",
    case_insensitive: true,
    keywords: {
      keyword: SQL_KW + PLPGSQL_KW + ROLE_ATTRS,
      built_in: SQL_BI + PLPGSQL_BI + PLPGSQL_EXCEPTIONS
    },
    // Forbid some cunstructs from other languages to improve autodetect. In fact
    // "[a-z]:" is legal (as part of array slice), but improbabal.
    illegal: /:==|\W\s*\(\*|(^|\s)\$[a-z]|\{\{|[a-z]:\s*$|\.\.\.|TO:|DO:/,
    contains: [
      // special handling of some words, which are reserved only in some contexts
      {
        className: "keyword",
        variants: [
          { begin: /\bTEXT\s*SEARCH\b/ },
          { begin: /\b(PRIMARY|FOREIGN|FOR(\s+NO)?)\s+KEY\b/ },
          { begin: /\bPARALLEL\s+(UNSAFE|RESTRICTED|SAFE)\b/ },
          { begin: /\bSTORAGE\s+(PLAIN|EXTERNAL|EXTENDED|MAIN)\b/ },
          { begin: /\bMATCH\s+(FULL|PARTIAL|SIMPLE)\b/ },
          { begin: /\bNULLS\s+(FIRST|LAST)\b/ },
          { begin: /\bEVENT\s+TRIGGER\b/ },
          { begin: /\b(MAPPING|OR)\s+REPLACE\b/ },
          { begin: /\b(FROM|TO)\s+(PROGRAM|STDIN|STDOUT)\b/ },
          { begin: /\b(SHARE|EXCLUSIVE)\s+MODE\b/ },
          { begin: /\b(LEFT|RIGHT)\s+(OUTER\s+)?JOIN\b/ },
          { begin: /\b(FETCH|MOVE)\s+(NEXT|PRIOR|FIRST|LAST|ABSOLUTE|RELATIVE|FORWARD|BACKWARD)\b/ },
          { begin: /\bPRESERVE\s+ROWS\b/ },
          { begin: /\bDISCARD\s+PLANS\b/ },
          { begin: /\bREFERENCING\s+(OLD|NEW)\b/ },
          { begin: /\bSKIP\s+LOCKED\b/ },
          { begin: /\bGROUPING\s+SETS\b/ },
          { begin: /\b(BINARY|INSENSITIVE|SCROLL|NO\s+SCROLL)\s+(CURSOR|FOR)\b/ },
          { begin: /\b(WITH|WITHOUT)\s+HOLD\b/ },
          { begin: /\bWITH\s+(CASCADED|LOCAL)\s+CHECK\s+OPTION\b/ },
          { begin: /\bEXCLUDE\s+(TIES|NO\s+OTHERS)\b/ },
          { begin: /\bFORMAT\s+(TEXT|XML|JSON|YAML)\b/ },
          { begin: /\bSET\s+((SESSION|LOCAL)\s+)?NAMES\b/ },
          { begin: /\bIS\s+(NOT\s+)?UNKNOWN\b/ },
          { begin: /\bSECURITY\s+LABEL\b/ },
          { begin: /\bSTANDALONE\s+(YES|NO|NO\s+VALUE)\b/ },
          { begin: /\bWITH\s+(NO\s+)?DATA\b/ },
          { begin: /\b(FOREIGN|SET)\s+DATA\b/ },
          { begin: /\bSET\s+(CATALOG|CONSTRAINTS)\b/ },
          { begin: /\b(WITH|FOR)\s+ORDINALITY\b/ },
          { begin: /\bIS\s+(NOT\s+)?DOCUMENT\b/ },
          { begin: /\bXML\s+OPTION\s+(DOCUMENT|CONTENT)\b/ },
          { begin: /\b(STRIP|PRESERVE)\s+WHITESPACE\b/ },
          { begin: /\bNO\s+(ACTION|MAXVALUE|MINVALUE)\b/ },
          { begin: /\bPARTITION\s+BY\s+(RANGE|LIST|HASH)\b/ },
          { begin: /\bAT\s+TIME\s+ZONE\b/ },
          { begin: /\bGRANTED\s+BY\b/ },
          { begin: /\bRETURN\s+(QUERY|NEXT)\b/ },
          { begin: /\b(ATTACH|DETACH)\s+PARTITION\b/ },
          { begin: /\bFORCE\s+ROW\s+LEVEL\s+SECURITY\b/ },
          { begin: /\b(INCLUDING|EXCLUDING)\s+(COMMENTS|CONSTRAINTS|DEFAULTS|IDENTITY|INDEXES|STATISTICS|STORAGE|ALL)\b/ },
          { begin: /\bAS\s+(ASSIGNMENT|IMPLICIT|PERMISSIVE|RESTRICTIVE|ENUM|RANGE)\b/ }
        ]
      },
      // functions named as keywords, followed by '('
      {
        begin: /\b(FORMAT|FAMILY|VERSION)\s*\(/
        // keywords: { built_in: 'FORMAT FAMILY VERSION' }
      },
      // INCLUDE ( ... ) in index_parameters in CREATE TABLE
      {
        begin: /\bINCLUDE\s*\(/,
        keywords: "INCLUDE"
      },
      // not highlight RANGE if not in frame_clause (not 100% correct, but seems satisfactory)
      { begin: /\bRANGE(?!\s*(BETWEEN|UNBOUNDED|CURRENT|[-0-9]+))/ },
      // disable highlighting in commands CREATE AGGREGATE/COLLATION/DATABASE/OPERTOR/TEXT SEARCH .../TYPE
      // and in PL/pgSQL RAISE ... USING
      { begin: /\b(VERSION|OWNER|TEMPLATE|TABLESPACE|CONNECTION\s+LIMIT|PROCEDURE|RESTRICT|JOIN|PARSER|COPY|START|END|COLLATION|INPUT|ANALYZE|STORAGE|LIKE|DEFAULT|DELIMITER|ENCODING|COLUMN|CONSTRAINT|TABLE|SCHEMA)\s*=/ },
      // PG_smth; HAS_some_PRIVILEGE
      {
        // className: 'built_in',
        begin: /\b(PG_\w+?|HAS_[A-Z_]+_PRIVILEGE)\b/,
        relevance: 10
      },
      // extract
      {
        begin: /\bEXTRACT\s*\(/,
        end: /\bFROM\b/,
        returnEnd: true,
        keywords: {
          // built_in: 'EXTRACT',
          type: "CENTURY DAY DECADE DOW DOY EPOCH HOUR ISODOW ISOYEAR MICROSECONDS MILLENNIUM MILLISECONDS MINUTE MONTH QUARTER SECOND TIMEZONE TIMEZONE_HOUR TIMEZONE_MINUTE WEEK YEAR"
        }
      },
      // xmlelement, xmlpi - special NAME
      {
        begin: /\b(XMLELEMENT|XMLPI)\s*\(\s*NAME/,
        keywords: {
          // built_in: 'XMLELEMENT XMLPI',
          keyword: "NAME"
        }
      },
      // xmlparse, xmlserialize
      {
        begin: /\b(XMLPARSE|XMLSERIALIZE)\s*\(\s*(DOCUMENT|CONTENT)/,
        keywords: {
          // built_in: 'XMLPARSE XMLSERIALIZE',
          keyword: "DOCUMENT CONTENT"
        }
      },
      // Sequences. We actually skip everything between CACHE|INCREMENT|MAXVALUE|MINVALUE and
      // nearest following numeric constant. Without with trick we find a lot of "keywords"
      // in 'avrasm' autodetection test...
      {
        beginKeywords: "CACHE INCREMENT MAXVALUE MINVALUE",
        end: hljs.C_NUMBER_RE,
        returnEnd: true,
        keywords: "BY CACHE INCREMENT MAXVALUE MINVALUE"
      },
      // WITH|WITHOUT TIME ZONE as part of datatype
      {
        className: "type",
        begin: /\b(WITH|WITHOUT)\s+TIME\s+ZONE\b/
      },
      // INTERVAL optional fields
      {
        className: "type",
        begin: /\bINTERVAL\s+(YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)(\s+TO\s+(MONTH|HOUR|MINUTE|SECOND))?\b/
      },
      // Pseudo-types which allowed only as return type
      {
        begin: /\bRETURNS\s+(LANGUAGE_HANDLER|TRIGGER|EVENT_TRIGGER|FDW_HANDLER|INDEX_AM_HANDLER|TSM_HANDLER)\b/,
        keywords: {
          keyword: "RETURNS",
          type: "LANGUAGE_HANDLER TRIGGER EVENT_TRIGGER FDW_HANDLER INDEX_AM_HANDLER TSM_HANDLER"
        }
      },
      // Known functions - only when followed by '('
      {
        begin: "\\b(" + FUNCTIONS_RE + ")\\s*\\("
        // keywords: { built_in: FUNCTIONS }
      },
      // Types
      {
        begin: "\\.(" + TYPES_RE + ")\\b"
        // prevent highlight as type, say, 'oid' in 'pgclass.oid'
      },
      {
        begin: "\\b(" + TYPES_RE + ")\\s+PATH\\b",
        // in XMLTABLE
        keywords: {
          keyword: "PATH",
          // hopefully no one would use PATH type in XMLTABLE...
          type: TYPES2.replace("PATH ", "")
        }
      },
      {
        className: "type",
        begin: "\\b(" + TYPES_RE + ")\\b"
      },
      // Strings, see https://www.postgresql.org/docs/11/static/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS
      {
        className: "string",
        begin: "'",
        end: "'",
        contains: [{ begin: "''" }]
      },
      {
        className: "string",
        begin: "(e|E|u&|U&)'",
        end: "'",
        contains: [{ begin: "\\\\." }],
        relevance: 10
      },
      hljs.END_SAME_AS_BEGIN({
        begin: DOLLAR_STRING,
        end: DOLLAR_STRING,
        contains: [
          {
            // actually we want them all except SQL; listed are those with known implementations
            // and XML + JSON just in case
            subLanguage: [
              "pgsql",
              "perl",
              "python",
              "tcl",
              "r",
              "lua",
              "java",
              "php",
              "ruby",
              "bash",
              "scheme",
              "xml",
              "json"
            ],
            endsWithParent: true
          }
        ]
      }),
      // identifiers in quotes
      {
        begin: '"',
        end: '"',
        contains: [{ begin: '""' }]
      },
      // numbers
      hljs.C_NUMBER_MODE,
      // comments
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE,
      // PL/pgSQL staff
      // %ROWTYPE, %TYPE, $n
      {
        className: "meta",
        variants: [
          {
            // %TYPE, %ROWTYPE
            begin: "%(ROW)?TYPE",
            relevance: 10
          },
          {
            // $n
            begin: "\\$\\d+"
          },
          {
            // #compiler option
            begin: "^#\\w",
            end: "$"
          }
        ]
      },
      // <<labeles>>
      {
        className: "symbol",
        begin: LABEL,
        relevance: 10
      }
    ]
  };
}
function php(hljs) {
  const regex = hljs.regex;
  const NOT_PERL_ETC = /(?![A-Za-z0-9])(?![$])/;
  const IDENT_RE2 = regex.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    NOT_PERL_ETC
  );
  const PASCAL_CASE_CLASS_NAME_RE = regex.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    NOT_PERL_ETC
  );
  const UPCASE_NAME_RE = regex.concat(
    /[A-Z]+/,
    NOT_PERL_ETC
  );
  const VARIABLE = {
    scope: "variable",
    match: "\\$+" + IDENT_RE2
  };
  const PREPROCESSOR = {
    scope: "meta",
    variants: [
      { begin: /<\?php/, relevance: 10 },
      // boost for obvious PHP
      { begin: /<\?=/ },
      // less relevant per PSR-1 which says not to use short-tags
      { begin: /<\?/, relevance: 0.1 },
      { begin: /\?>/ }
      // end php tag
    ]
  };
  const SUBST = {
    scope: "subst",
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  };
  const SINGLE_QUOTED = hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null });
  const DOUBLE_QUOTED = hljs.inherit(hljs.QUOTE_STRING_MODE, {
    illegal: null,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST)
  });
  const HEREDOC = {
    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
    end: /[ \t]*(\w+)\b/,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
    "on:begin": (m2, resp) => {
      resp.data._beginMatch = m2[1] || m2[2];
    },
    "on:end": (m2, resp) => {
      if (resp.data._beginMatch !== m2[1])
        resp.ignoreMatch();
    }
  };
  const NOWDOC = hljs.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*'(\w+)'\n/,
    end: /[ \t]*(\w+)\b/
  });
  const WHITESPACE = "[ 	\n]";
  const STRING = {
    scope: "string",
    variants: [
      DOUBLE_QUOTED,
      SINGLE_QUOTED,
      HEREDOC,
      NOWDOC
    ]
  };
  const NUMBER = {
    scope: "number",
    variants: [
      { begin: `\\b0[bB][01]+(?:_[01]+)*\\b` },
      // Binary w/ underscore support
      { begin: `\\b0[oO][0-7]+(?:_[0-7]+)*\\b` },
      // Octals w/ underscore support
      { begin: `\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b` },
      // Hex w/ underscore support
      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
      { begin: `(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?` }
    ],
    relevance: 0
  };
  const LITERALS2 = [
    "false",
    "null",
    "true"
  ];
  const KWS = [
    // Magic constants:
    // <https://www.php.net/manual/en/language.constants.predefined.php>
    "__CLASS__",
    "__DIR__",
    "__FILE__",
    "__FUNCTION__",
    "__COMPILER_HALT_OFFSET__",
    "__LINE__",
    "__METHOD__",
    "__NAMESPACE__",
    "__TRAIT__",
    // Function that look like language construct or language construct that look like function:
    // List of keywords that may not require parenthesis
    "die",
    "echo",
    "exit",
    "include",
    "include_once",
    "print",
    "require",
    "require_once",
    // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
    // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
    // Other keywords:
    // <https://www.php.net/manual/en/reserved.php>
    // <https://www.php.net/manual/en/language.types.type-juggling.php>
    "array",
    "abstract",
    "and",
    "as",
    "binary",
    "bool",
    "boolean",
    "break",
    "callable",
    "case",
    "catch",
    "class",
    "clone",
    "const",
    "continue",
    "declare",
    "default",
    "do",
    "double",
    "else",
    "elseif",
    "empty",
    "enddeclare",
    "endfor",
    "endforeach",
    "endif",
    "endswitch",
    "endwhile",
    "enum",
    "eval",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "foreach",
    "from",
    "globalThis",
    "goto",
    "if",
    "implements",
    "instanceof",
    "insteadof",
    "int",
    "integer",
    "interface",
    "isset",
    "iterable",
    "list",
    "match|0",
    "mixed",
    "new",
    "never",
    "object",
    "or",
    "private",
    "protected",
    "public",
    "readonly",
    "real",
    "return",
    "string",
    "switch",
    "throw",
    "trait",
    "try",
    "unset",
    "use",
    "var",
    "void",
    "while",
    "xor",
    "yield"
  ];
  const BUILT_INS2 = [
    // Standard PHP library:
    // <https://www.php.net/manual/en/book.spl.php>
    "Error|0",
    "AppendIterator",
    "ArgumentCountError",
    "ArithmeticError",
    "ArrayIterator",
    "ArrayObject",
    "AssertionError",
    "BadFunctionCallException",
    "BadMethodCallException",
    "CachingIterator",
    "CallbackFilterIterator",
    "CompileError",
    "Countable",
    "DirectoryIterator",
    "DivisionByZeroError",
    "DomainException",
    "EmptyIterator",
    "ErrorException",
    "Exception",
    "FilesystemIterator",
    "FilterIterator",
    "GlobIterator",
    "InfiniteIterator",
    "InvalidArgumentException",
    "IteratorIterator",
    "LengthException",
    "LimitIterator",
    "LogicException",
    "MultipleIterator",
    "NoRewindIterator",
    "OutOfBoundsException",
    "OutOfRangeException",
    "OuterIterator",
    "OverflowException",
    "ParentIterator",
    "ParseError",
    "RangeException",
    "RecursiveArrayIterator",
    "RecursiveCachingIterator",
    "RecursiveCallbackFilterIterator",
    "RecursiveDirectoryIterator",
    "RecursiveFilterIterator",
    "RecursiveIterator",
    "RecursiveIteratorIterator",
    "RecursiveRegexIterator",
    "RecursiveTreeIterator",
    "RegexIterator",
    "RuntimeException",
    "SeekableIterator",
    "SplDoublyLinkedList",
    "SplFileInfo",
    "SplFileObject",
    "SplFixedArray",
    "SplHeap",
    "SplMaxHeap",
    "SplMinHeap",
    "SplObjectStorage",
    "SplObserver",
    "SplPriorityQueue",
    "SplQueue",
    "SplStack",
    "SplSubject",
    "SplTempFileObject",
    "TypeError",
    "UnderflowException",
    "UnexpectedValueException",
    "UnhandledMatchError",
    // Reserved interfaces:
    // <https://www.php.net/manual/en/reserved.interfaces.php>
    "ArrayAccess",
    "BackedEnum",
    "Closure",
    "Fiber",
    "Generator",
    "Iterator",
    "IteratorAggregate",
    "Serializable",
    "Stringable",
    "Throwable",
    "Traversable",
    "UnitEnum",
    "WeakReference",
    "WeakMap",
    // Reserved classes:
    // <https://www.php.net/manual/en/reserved.classes.php>
    "Directory",
    "__PHP_Incomplete_Class",
    "parent",
    "php_user_filter",
    "self",
    "static",
    "stdClass"
  ];
  const dualCase = (items) => {
    const result = [];
    items.forEach((item) => {
      result.push(item);
      if (item.toLowerCase() === item) {
        result.push(item.toUpperCase());
      } else {
        result.push(item.toLowerCase());
      }
    });
    return result;
  };
  const KEYWORDS2 = {
    keyword: KWS,
    literal: dualCase(LITERALS2),
    built_in: BUILT_INS2
  };
  const normalizeKeywords = (items) => {
    return items.map((item) => {
      return item.replace(/\|\d+$/, "");
    });
  };
  const CONSTRUCTOR_CALL = { variants: [
    {
      match: [
        /new/,
        regex.concat(WHITESPACE, "+"),
        // to prevent built ins from being confused as the class constructor call
        regex.concat("(?!", normalizeKeywords(BUILT_INS2).join("\\b|"), "\\b)"),
        PASCAL_CASE_CLASS_NAME_RE
      ],
      scope: {
        1: "keyword",
        4: "title.class"
      }
    }
  ] };
  const CONSTANT_REFERENCE = regex.concat(IDENT_RE2, "\\b(?!\\()");
  const LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON = { variants: [
    {
      match: [
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE
      ],
      scope: { 2: "variable.constant" }
    },
    {
      match: [
        /::/,
        /class/
      ],
      scope: { 2: "variable.language" }
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE
      ],
      scope: {
        1: "title.class",
        3: "variable.constant"
      }
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          "::",
          regex.lookahead(/(?!class\b)/)
        )
      ],
      scope: { 1: "title.class" }
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        /::/,
        /class/
      ],
      scope: {
        1: "title.class",
        3: "variable.language"
      }
    }
  ] };
  const NAMED_ARGUMENT = {
    scope: "attr",
    match: regex.concat(IDENT_RE2, regex.lookahead(":"), regex.lookahead(/(?!::)/))
  };
  const PARAMS_MODE = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS2,
    contains: [
      NAMED_ARGUMENT,
      VARIABLE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      NUMBER,
      CONSTRUCTOR_CALL
    ]
  };
  const FUNCTION_INVOKE = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      regex.concat("(?!fn\\b|function\\b|", normalizeKeywords(KWS).join("\\b|"), "|", normalizeKeywords(BUILT_INS2).join("\\b|"), "\\b)"),
      IDENT_RE2,
      regex.concat(WHITESPACE, "*"),
      regex.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke" },
    contains: [PARAMS_MODE]
  };
  PARAMS_MODE.contains.push(FUNCTION_INVOKE);
  const ATTRIBUTE_CONTAINS = [
    NAMED_ARGUMENT,
    LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING,
    NUMBER,
    CONSTRUCTOR_CALL
  ];
  const ATTRIBUTES2 = {
    begin: regex.concat(
      /#\[\s*\\?/,
      regex.either(
        PASCAL_CASE_CLASS_NAME_RE,
        UPCASE_NAME_RE
      )
    ),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: LITERALS2,
      keyword: [
        "new",
        "array"
      ]
    },
    contains: [
      {
        begin: /\[/,
        end: /]/,
        keywords: {
          literal: LITERALS2,
          keyword: [
            "new",
            "array"
          ]
        },
        contains: [
          "self",
          ...ATTRIBUTE_CONTAINS
        ]
      },
      ...ATTRIBUTE_CONTAINS,
      {
        scope: "meta",
        variants: [
          { match: PASCAL_CASE_CLASS_NAME_RE },
          { match: UPCASE_NAME_RE }
        ]
      }
    ]
  };
  return {
    case_insensitive: false,
    keywords: KEYWORDS2,
    contains: [
      ATTRIBUTES2,
      hljs.HASH_COMMENT_MODE,
      hljs.COMMENT("//", "$"),
      hljs.COMMENT(
        "/\\*",
        "\\*/",
        { contains: [
          {
            scope: "doctag",
            match: "@[A-Za-z]+"
          }
        ] }
      ),
      {
        match: /__halt_compiler\(\);/,
        keywords: "__halt_compiler",
        starts: {
          scope: "comment",
          end: hljs.MATCH_NOTHING_RE,
          contains: [
            {
              match: /\?>/,
              scope: "meta",
              endsParent: true
            }
          ]
        }
      },
      PREPROCESSOR,
      {
        scope: "variable.language",
        match: /\$this\b/
      },
      VARIABLE,
      FUNCTION_INVOKE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      {
        match: [
          /const/,
          /\s/,
          IDENT_RE2
        ],
        scope: {
          1: "keyword",
          3: "variable.constant"
        }
      },
      CONSTRUCTOR_CALL,
      {
        scope: "function",
        relevance: 0,
        beginKeywords: "fn function",
        end: /[;{]/,
        excludeEnd: true,
        illegal: "[$%\\[]",
        contains: [
          { beginKeywords: "use" },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            begin: "=>",
            // No markup, just a relevance booster
            endsParent: true
          },
          {
            scope: "params",
            begin: "\\(",
            end: "\\)",
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS2,
            contains: [
              "self",
              ATTRIBUTES2,
              VARIABLE,
              LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
              hljs.C_BLOCK_COMMENT_MODE,
              STRING,
              NUMBER
            ]
          }
        ]
      },
      {
        scope: "class",
        variants: [
          {
            beginKeywords: "enum",
            illegal: /[($"]/
          },
          {
            beginKeywords: "class interface trait",
            illegal: /[:($"]/
          }
        ],
        relevance: 0,
        end: /\{/,
        excludeEnd: true,
        contains: [
          { beginKeywords: "extends implements" },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      // both use and namespace still use "old style" rules (vs multi-match)
      // because the namespace name can include `\` and we still want each
      // element to be treated as its own *individual* title
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: ";",
        illegal: /[.']/,
        contains: [hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, { scope: "title.class" })]
      },
      {
        beginKeywords: "use",
        relevance: 0,
        end: ";",
        contains: [
          // TODO: title.function vs title.class
          {
            match: /\b(as|const|function)\b/,
            scope: "keyword"
          },
          // TODO: could be title.class or title.function
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      STRING,
      NUMBER
    ]
  };
}
function powershell(hljs) {
  const TYPES2 = [
    "string",
    "char",
    "byte",
    "int",
    "long",
    "bool",
    "decimal",
    "single",
    "double",
    "DateTime",
    "xml",
    "array",
    "hashtable",
    "void"
  ];
  const VALID_VERBS = "Add|Clear|Close|Copy|Enter|Exit|Find|Format|Get|Hide|Join|Lock|Move|New|Open|Optimize|Pop|Push|Redo|Remove|Rename|Reset|Resize|Search|Select|Set|Show|Skip|Split|Step|Switch|Undo|Unlock|Watch|Backup|Checkpoint|Compare|Compress|Convert|ConvertFrom|ConvertTo|Dismount|Edit|Expand|Export|Group|Import|Initialize|Limit|Merge|Mount|Out|Publish|Restore|Save|Sync|Unpublish|Update|Approve|Assert|Build|Complete|Confirm|Deny|Deploy|Disable|Enable|Install|Invoke|Register|Request|Restart|Resume|Start|Stop|Submit|Suspend|Uninstall|Unregister|Wait|Debug|Measure|Ping|Repair|Resolve|Test|Trace|Connect|Disconnect|Read|Receive|Send|Write|Block|Grant|Protect|Revoke|Unblock|Unprotect|Use|ForEach|Sort|Tee|Where";
  const COMPARISON_OPERATORS = "-and|-as|-band|-bnot|-bor|-bxor|-casesensitive|-ccontains|-ceq|-cge|-cgt|-cle|-clike|-clt|-cmatch|-cne|-cnotcontains|-cnotlike|-cnotmatch|-contains|-creplace|-csplit|-eq|-exact|-f|-file|-ge|-gt|-icontains|-ieq|-ige|-igt|-ile|-ilike|-ilt|-imatch|-in|-ine|-inotcontains|-inotlike|-inotmatch|-ireplace|-is|-isnot|-isplit|-join|-le|-like|-lt|-match|-ne|-not|-notcontains|-notin|-notlike|-notmatch|-or|-regex|-replace|-shl|-shr|-split|-wildcard|-xor";
  const KEYWORDS2 = {
    $pattern: /-?[A-z\.\-]+\b/,
    keyword: "if else foreach return do while until elseif begin for trap data dynamicparam end break throw param continue finally in switch exit filter try process catch hidden static parameter",
    // "echo" relevance has been set to 0 to avoid auto-detect conflicts with shell transcripts
    built_in: "ac asnp cat cd CFS chdir clc clear clhy cli clp cls clv cnsn compare copy cp cpi cpp curl cvpa dbp del diff dir dnsn ebp echo|0 epal epcsv epsn erase etsn exsn fc fhx fl ft fw gal gbp gc gcb gci gcm gcs gdr gerr ghy gi gin gjb gl gm gmo gp gps gpv group gsn gsnp gsv gtz gu gv gwmi h history icm iex ihy ii ipal ipcsv ipmo ipsn irm ise iwmi iwr kill lp ls man md measure mi mount move mp mv nal ndr ni nmo npssc nsn nv ogv oh popd ps pushd pwd r rbp rcjb rcsn rd rdr ren ri rjb rm rmdir rmo rni rnp rp rsn rsnp rujb rv rvpa rwmi sajb sal saps sasv sbp sc scb select set shcm si sl sleep sls sort sp spjb spps spsv start stz sujb sv swmi tee trcm type wget where wjb write"
    // TODO: 'validate[A-Z]+' can't work in keywords
  };
  const TITLE_NAME_RE = /\w[\w\d]*((-)[\w\d]+)*/;
  const BACKTICK_ESCAPE = {
    begin: "`[\\s\\S]",
    relevance: 0
  };
  const VAR = {
    className: "variable",
    variants: [
      { begin: /\$\B/ },
      {
        className: "keyword",
        begin: /\$this/
      },
      { begin: /\$[\w\d][\w\d_:]*/ }
    ]
  };
  const LITERAL = {
    className: "literal",
    begin: /\$(null|true|false)\b/
  };
  const QUOTE_STRING = {
    className: "string",
    variants: [
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /@"/,
        end: /^"@/
      }
    ],
    contains: [
      BACKTICK_ESCAPE,
      VAR,
      {
        className: "variable",
        begin: /\$[A-z]/,
        end: /[^A-z]/
      }
    ]
  };
  const APOS_STRING = {
    className: "string",
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /@'/,
        end: /^'@/
      }
    ]
  };
  const PS_HELPTAGS = {
    className: "doctag",
    variants: [
      /* no paramater help tags */
      { begin: /\.(synopsis|description|example|inputs|outputs|notes|link|component|role|functionality)/ },
      /* one parameter help tags */
      { begin: /\.(parameter|forwardhelptargetname|forwardhelpcategory|remotehelprunspace|externalhelp)\s+\S+/ }
    ]
  };
  const PS_COMMENT = hljs.inherit(
    hljs.COMMENT(null, null),
    {
      variants: [
        /* single-line comment */
        {
          begin: /#/,
          end: /$/
        },
        /* multi-line comment */
        {
          begin: /<#/,
          end: /#>/
        }
      ],
      contains: [PS_HELPTAGS]
    }
  );
  const CMDLETS = {
    className: "built_in",
    variants: [{ begin: "(".concat(VALID_VERBS, ")+(-)[\\w\\d]+") }]
  };
  const PS_CLASS = {
    className: "class",
    beginKeywords: "class enum",
    end: /\s*[{]/,
    excludeEnd: true,
    relevance: 0,
    contains: [hljs.TITLE_MODE]
  };
  const PS_FUNCTION = {
    className: "function",
    begin: /function\s+/,
    end: /\s*\{|$/,
    excludeEnd: true,
    returnBegin: true,
    relevance: 0,
    contains: [
      {
        begin: "function",
        relevance: 0,
        className: "keyword"
      },
      {
        className: "title",
        begin: TITLE_NAME_RE,
        relevance: 0
      },
      {
        begin: /\(/,
        end: /\)/,
        className: "params",
        relevance: 0,
        contains: [VAR]
      }
      // CMDLETS
    ]
  };
  const PS_USING = {
    begin: /using\s/,
    end: /$/,
    returnBegin: true,
    contains: [
      QUOTE_STRING,
      APOS_STRING,
      {
        className: "keyword",
        begin: /(using|assembly|command|module|namespace|type)/
      }
    ]
  };
  const PS_ARGUMENTS = { variants: [
    // PS literals are pretty verbose so it's a good idea to accent them a bit.
    {
      className: "operator",
      begin: "(".concat(COMPARISON_OPERATORS, ")\\b")
    },
    {
      className: "literal",
      begin: /(-){1,2}[\w\d-]+/,
      relevance: 0
    }
  ] };
  const HASH_SIGNS = {
    className: "selector-tag",
    begin: /@\B/,
    relevance: 0
  };
  const PS_METHODS = {
    className: "function",
    begin: /\[.*\]\s*[\w]+[ ]??\(/,
    end: /$/,
    returnBegin: true,
    relevance: 0,
    contains: [
      {
        className: "keyword",
        begin: "(".concat(
          KEYWORDS2.keyword.toString().replace(
            /\s/g,
            "|"
          ),
          ")\\b"
        ),
        endsParent: true,
        relevance: 0
      },
      hljs.inherit(hljs.TITLE_MODE, { endsParent: true })
    ]
  };
  const GENTLEMANS_SET = [
    // STATIC_MEMBER,
    PS_METHODS,
    PS_COMMENT,
    BACKTICK_ESCAPE,
    hljs.NUMBER_MODE,
    QUOTE_STRING,
    APOS_STRING,
    // PS_NEW_OBJECT_TYPE,
    CMDLETS,
    VAR,
    LITERAL,
    HASH_SIGNS
  ];
  const PS_TYPE = {
    begin: /\[/,
    end: /\]/,
    excludeBegin: true,
    excludeEnd: true,
    relevance: 0,
    contains: [].concat(
      "self",
      GENTLEMANS_SET,
      {
        begin: "(" + TYPES2.join("|") + ")",
        className: "built_in",
        relevance: 0
      },
      {
        className: "type",
        begin: /[\.\w\d]+/,
        relevance: 0
      }
    )
  };
  PS_METHODS.contains.unshift(PS_TYPE);
  return {
    name: "PowerShell",
    aliases: [
      "pwsh",
      "ps",
      "ps1"
    ],
    case_insensitive: true,
    keywords: KEYWORDS2,
    contains: GENTLEMANS_SET.concat(
      PS_CLASS,
      PS_FUNCTION,
      PS_USING,
      PS_ARGUMENTS,
      PS_TYPE
    )
  };
}
function python(hljs) {
  const regex = hljs.regex;
  const IDENT_RE2 = /[\p{XID_Start}_]\p{XID_Continue}*/u;
  const RESERVED_WORDS = [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "case",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "globalThis",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "match",
    "nonlocal|10",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield"
  ];
  const BUILT_INS2 = [
    "__import__",
    "abs",
    "all",
    "any",
    "ascii",
    "bin",
    "bool",
    "breakpoint",
    "bytearray",
    "bytes",
    "callable",
    "chr",
    "classmethod",
    "compile",
    "complex",
    "delattr",
    "dict",
    "dir",
    "divmod",
    "enumerate",
    "eval",
    "exec",
    "filter",
    "float",
    "format",
    "frozenset",
    "getattr",
    "globals",
    "hasattr",
    "hash",
    "help",
    "hex",
    "id",
    "input",
    "int",
    "isinstance",
    "issubclass",
    "iter",
    "len",
    "list",
    "locals",
    "map",
    "max",
    "memoryview",
    "min",
    "next",
    "object",
    "oct",
    "open",
    "ord",
    "pow",
    "print",
    "property",
    "range",
    "repr",
    "reversed",
    "round",
    "set",
    "setattr",
    "slice",
    "sorted",
    "staticmethod",
    "str",
    "sum",
    "super",
    "tuple",
    "type",
    "vars",
    "zip"
  ];
  const LITERALS2 = [
    "__debug__",
    "Ellipsis",
    "False",
    "None",
    "NotImplemented",
    "True"
  ];
  const TYPES2 = [
    "Any",
    "Callable",
    "Coroutine",
    "Dict",
    "List",
    "Literal",
    "Generic",
    "Optional",
    "Sequence",
    "Set",
    "Tuple",
    "Type",
    "Union"
  ];
  const KEYWORDS2 = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: RESERVED_WORDS,
    built_in: BUILT_INS2,
    literal: LITERALS2,
    type: TYPES2
  };
  const PROMPT = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  };
  const SUBST = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS2,
    illegal: /#/
  };
  const LITERAL_BRACKET = {
    begin: /\{\{/,
    relevance: 0
  };
  const STRING = {
    className: "string",
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'/,
        end: /'/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };
  const digitpart = "[0-9](_?[0-9])*";
  const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
  const lookahead2 = `\\b|${RESERVED_WORDS.join("|")}`;
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?(?=${lookahead2})`
      },
      {
        begin: `(${pointfloat})[jJ]?`
      },
      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${lookahead2})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${lookahead2})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${lookahead2})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${lookahead2})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${digitpart})[jJ](?=${lookahead2})`
      }
    ]
  };
  const COMMENT_TYPE = {
    className: "comment",
    begin: regex.lookahead(/# type:/),
    end: /$/,
    keywords: KEYWORDS2,
    contains: [
      {
        // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: true
      }
    ]
  };
  const PARAMS = {
    className: "params",
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: true
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS2,
        contains: [
          "self",
          PROMPT,
          NUMBER,
          STRING,
          hljs.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  SUBST.contains = [
    STRING,
    NUMBER,
    PROMPT
  ];
  return {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: true,
    keywords: KEYWORDS2,
    illegal: /(<\/|\?)|=>/,
    contains: [
      PROMPT,
      NUMBER,
      {
        // very common convention
        scope: "variable.language",
        match: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      { match: /\bor\b/, scope: "keyword" },
      STRING,
      COMMENT_TYPE,
      hljs.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          IDENT_RE2
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [PARAMS]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              IDENT_RE2,
              /\s*/,
              /\(\s*/,
              IDENT_RE2,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              IDENT_RE2
            ]
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited"
        }
      },
      {
        className: "meta",
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          NUMBER,
          PARAMS,
          STRING
        ]
      }
    ]
  };
}
function r(hljs) {
  const regex = hljs.regex;
  const IDENT_RE2 = /(?:(?:[a-zA-Z]|\.[._a-zA-Z])[._a-zA-Z0-9]*)|\.(?!\d)/;
  const NUMBER_TYPES_RE = regex.either(
    // Special case: only hexadecimal binary powers can contain fractions
    /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/,
    // Hexadecimal numbers without fraction and optional binary power
    /0[xX][0-9a-fA-F]+(?:[pP][+-]?\d+)?[Li]?/,
    // Decimal numbers
    /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[Li]?/
  );
  const OPERATORS_RE = /[=!<>:]=|\|\||&&|:::?|<-|<<-|->>|->|\|>|[-+*\/?!$&|:<=>@^~]|\*\*/;
  const PUNCTUATION_RE = regex.either(
    /[()]/,
    /[{}]/,
    /\[\[/,
    /[[\]]/,
    /\\/,
    /,/
  );
  return {
    name: "R",
    keywords: {
      $pattern: IDENT_RE2,
      keyword: "function if in break next repeat else for while",
      literal: "NULL NA TRUE FALSE Inf NaN NA_integer_|10 NA_real_|10 NA_character_|10 NA_complex_|10",
      built_in: (
        // Builtin constants
        "LETTERS letters month.abb month.name pi T F abs acos acosh all any anyNA Arg as.call as.character as.complex as.double as.environment as.integer as.logical as.null.default as.numeric as.raw asin asinh atan atanh attr attributes baseenv browser c call ceiling class Conj cos cosh cospi cummax cummin cumprod cumsum digamma dim dimnames emptyenv exp expression floor forceAndCall gamma gc.time globalenv Im interactive invisible is.array is.atomic is.call is.character is.complex is.double is.environment is.expression is.finite is.function is.infinite is.integer is.language is.list is.logical is.matrix is.na is.name is.nan is.null is.numeric is.object is.pairlist is.raw is.recursive is.single is.symbol lazyLoadDBfetch length lgamma list log max min missing Mod names nargs nzchar oldClass on.exit pos.to.env proc.time prod quote range Re rep retracemem return round seq_along seq_len seq.int sign signif sin sinh sinpi sqrt standardGeneric substitute sum switch tan tanh tanpi tracemem trigamma trunc unclass untracemem UseMethod xtfrm"
      )
    },
    contains: [
      // Roxygen comments
      hljs.COMMENT(
        /#'/,
        /$/,
        { contains: [
          {
            // Handle `@examples` separately to cause all subsequent code
            // until the next `@`-tag on its own line to be kept as-is,
            // preventing highlighting. This code is example R code, so nested
            // doctags shouldn’t be treated as such. See
            // `test/markup/r/roxygen.txt` for an example.
            scope: "doctag",
            match: /@examples/,
            starts: {
              end: regex.lookahead(regex.either(
                // end if another doc comment
                /\n^#'\s*(?=@[a-zA-Z]+)/,
                // or a line with no comment
                /\n^(?!#')/
              )),
              endsParent: true
            }
          },
          {
            // Handle `@param` to highlight the parameter name following
            // after.
            scope: "doctag",
            begin: "@param",
            end: /$/,
            contains: [
              {
                scope: "variable",
                variants: [
                  { match: IDENT_RE2 },
                  { match: /`(?:\\.|[^`\\])+`/ }
                ],
                endsParent: true
              }
            ]
          },
          {
            scope: "doctag",
            match: /@[a-zA-Z]+/
          },
          {
            scope: "keyword",
            match: /\\[a-zA-Z]+/
          }
        ] }
      ),
      hljs.HASH_COMMENT_MODE,
      {
        scope: "string",
        contains: [hljs.BACKSLASH_ESCAPE],
        variants: [
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\(/,
            end: /\)(-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\{/,
            end: /\}(-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\[/,
            end: /\](-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\(/,
            end: /\)(-*)'/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\{/,
            end: /\}(-*)'/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\[/,
            end: /\](-*)'/
          }),
          {
            begin: '"',
            end: '"',
            relevance: 0
          },
          {
            begin: "'",
            end: "'",
            relevance: 0
          }
        ]
      },
      // Matching numbers immediately following punctuation and operators is
      // tricky since we need to look at the character ahead of a number to
      // ensure the number is not part of an identifier, and we cannot use
      // negative look-behind assertions. So instead we explicitly handle all
      // possible combinations of (operator|punctuation), number.
      // TODO: replace with negative look-behind when available
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/ },
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+([pP][+-]?\d+)?[Li]?/ },
      // { begin: /(?<![a-zA-Z0-9._])(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[Li]?/ }
      {
        relevance: 0,
        variants: [
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              OPERATORS_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              /%[^%]*%/,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: "punctuation",
              2: "number"
            },
            match: [
              PUNCTUATION_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: { 2: "number" },
            match: [
              /[^a-zA-Z0-9._]|^/,
              // not part of an identifier, or start of document
              NUMBER_TYPES_RE
            ]
          }
        ]
      },
      // Operators/punctuation when they're not directly followed by numbers
      {
        // Relevance boost for the most common assignment form.
        scope: { 3: "operator" },
        match: [
          IDENT_RE2,
          /\s+/,
          /<-/,
          /\s+/
        ]
      },
      {
        scope: "operator",
        relevance: 0,
        variants: [
          { match: OPERATORS_RE },
          { match: /%[^%]*%/ }
        ]
      },
      {
        scope: "punctuation",
        relevance: 0,
        match: PUNCTUATION_RE
      },
      {
        // Escaped identifier
        begin: "`",
        end: "`",
        contains: [{ begin: /\\./ }]
      }
    ]
  };
}
function ruby(hljs) {
  const regex = hljs.regex;
  const RUBY_METHOD_RE = "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)";
  const CLASS_NAME_RE = regex.either(
    /\b([A-Z]+[a-z0-9]+)+/,
    // ends in caps
    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/
  );
  const CLASS_NAME_WITH_NAMESPACE_RE = regex.concat(CLASS_NAME_RE, /(::\w+)*/);
  const PSEUDO_KWS = [
    "include",
    "extend",
    "prepend",
    "public",
    "private",
    "protected",
    "raise",
    "throw"
  ];
  const RUBY_KEYWORDS = {
    "variable.constant": [
      "__FILE__",
      "__LINE__",
      "__ENCODING__"
    ],
    "variable.language": [
      "self",
      "super"
    ],
    keyword: [
      "alias",
      "and",
      "begin",
      "BEGIN",
      "break",
      "case",
      "class",
      "defined",
      "do",
      "else",
      "elsif",
      "end",
      "END",
      "ensure",
      "for",
      "if",
      "in",
      "module",
      "next",
      "not",
      "or",
      "redo",
      "require",
      "rescue",
      "retry",
      "return",
      "then",
      "undef",
      "unless",
      "until",
      "when",
      "while",
      "yield",
      ...PSEUDO_KWS
    ],
    built_in: [
      "proc",
      "lambda",
      "attr_accessor",
      "attr_reader",
      "attr_writer",
      "define_method",
      "private_constant",
      "module_function"
    ],
    literal: [
      "true",
      "false",
      "nil"
    ]
  };
  const YARDOCTAG = {
    className: "doctag",
    begin: "@[A-Za-z]+"
  };
  const IRB_OBJECT = {
    begin: "#<",
    end: ">"
  };
  const COMMENT_MODES = [
    hljs.COMMENT(
      "#",
      "$",
      { contains: [YARDOCTAG] }
    ),
    hljs.COMMENT(
      "^=begin",
      "^=end",
      {
        contains: [YARDOCTAG],
        relevance: 10
      }
    ),
    hljs.COMMENT("^__END__", hljs.MATCH_NOTHING_RE)
  ];
  const SUBST = {
    className: "subst",
    begin: /#\{/,
    end: /\}/,
    keywords: RUBY_KEYWORDS
  };
  const STRING = {
    className: "string",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ],
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /`/,
        end: /`/
      },
      {
        begin: /%[qQwWx]?\(/,
        end: /\)/
      },
      {
        begin: /%[qQwWx]?\[/,
        end: /\]/
      },
      {
        begin: /%[qQwWx]?\{/,
        end: /\}/
      },
      {
        begin: /%[qQwWx]?</,
        end: />/
      },
      {
        begin: /%[qQwWx]?\//,
        end: /\//
      },
      {
        begin: /%[qQwWx]?%/,
        end: /%/
      },
      {
        begin: /%[qQwWx]?-/,
        end: /-/
      },
      {
        begin: /%[qQwWx]?\|/,
        end: /\|/
      },
      // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
      // where ? is the last character of a preceding identifier, as in: `func?4`
      { begin: /\B\?(\\\d{1,3})/ },
      { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
      { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
      { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
      { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
      { begin: /\B\?\\?\S/ },
      // heredocs
      {
        // this guard makes sure that we have an entire heredoc and not a false
        // positive (auto-detect, etc.)
        begin: regex.concat(
          /<<[-~]?'?/,
          regex.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
        ),
        contains: [
          hljs.END_SAME_AS_BEGIN({
            begin: /(\w+)/,
            end: /(\w+)/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ]
          })
        ]
      }
    ]
  };
  const decimal = "[1-9](_?[0-9])*|0";
  const digits = "[0-9](_?[0-9])*";
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal integer/float, optionally exponential or rational, optionally imaginary
      { begin: `\\b(${decimal})(\\.(${digits}))?([eE][+-]?(${digits})|r)?i?\\b` },
      // explicit decimal/binary/octal/hexadecimal integer,
      // optionally rational and/or imaginary
      { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },
      // 0-prefixed implicit octal integer, optionally rational and/or imaginary
      { begin: "\\b0(_?[0-7])+r?i?\\b" }
    ]
  };
  const PARAMS = {
    variants: [
      {
        match: /\(\)/
      },
      {
        className: "params",
        begin: /\(/,
        end: /(?=\))/,
        excludeBegin: true,
        endsParent: true,
        keywords: RUBY_KEYWORDS
      }
    ]
  };
  const INCLUDE_EXTEND = {
    match: [
      /(include|extend)\s+/,
      CLASS_NAME_WITH_NAMESPACE_RE
    ],
    scope: {
      2: "title.class"
    },
    keywords: RUBY_KEYWORDS
  };
  const CLASS_DEFINITION = {
    variants: [
      {
        match: [
          /class\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE,
          /\s+<\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE
        ]
      },
      {
        match: [
          /\b(class|module)\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE
        ]
      }
    ],
    scope: {
      2: "title.class",
      4: "title.class.inherited"
    },
    keywords: RUBY_KEYWORDS
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  const METHOD_DEFINITION = {
    match: [
      /def/,
      /\s+/,
      RUBY_METHOD_RE
    ],
    scope: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  const OBJECT_CREATION = {
    relevance: 0,
    match: [
      CLASS_NAME_WITH_NAMESPACE_RE,
      /\.new[. (]/
    ],
    scope: {
      1: "title.class"
    }
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: CLASS_NAME_RE,
    scope: "title.class"
  };
  const RUBY_DEFAULT_CONTAINS = [
    STRING,
    CLASS_DEFINITION,
    INCLUDE_EXTEND,
    OBJECT_CREATION,
    UPPER_CASE_CONSTANT,
    CLASS_REFERENCE,
    METHOD_DEFINITION,
    {
      // swallow namespace qualifiers before symbols
      begin: hljs.IDENT_RE + "::"
    },
    {
      className: "symbol",
      begin: hljs.UNDERSCORE_IDENT_RE + "(!|\\?)?:",
      relevance: 0
    },
    {
      className: "symbol",
      begin: ":(?!\\s)",
      contains: [
        STRING,
        { begin: RUBY_METHOD_RE }
      ],
      relevance: 0
    },
    NUMBER,
    {
      // negative-look forward attempts to prevent false matches like:
      // @ident@ or $ident$ that might indicate this is not ruby at all
      className: "variable",
      begin: `(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])`
    },
    {
      className: "params",
      begin: /\|(?!=)/,
      end: /\|/,
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0,
      // this could be a lot of things (in other languages) other than params
      keywords: RUBY_KEYWORDS
    },
    {
      // regexp container
      begin: "(" + hljs.RE_STARTERS_RE + "|unless)\\s*",
      keywords: "unless",
      contains: [
        {
          className: "regexp",
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          illegal: /\n/,
          variants: [
            {
              begin: "/",
              end: "/[a-z]*"
            },
            {
              begin: /%r\{/,
              end: /\}[a-z]*/
            },
            {
              begin: "%r\\(",
              end: "\\)[a-z]*"
            },
            {
              begin: "%r!",
              end: "![a-z]*"
            },
            {
              begin: "%r\\[",
              end: "\\][a-z]*"
            }
          ]
        }
      ].concat(IRB_OBJECT, COMMENT_MODES),
      relevance: 0
    }
  ].concat(IRB_OBJECT, COMMENT_MODES);
  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  PARAMS.contains = RUBY_DEFAULT_CONTAINS;
  const SIMPLE_PROMPT = "[>?]>";
  const DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]";
  const RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>";
  const IRB_DEFAULT = [
    {
      begin: /^\s*=>/,
      starts: {
        end: "$",
        contains: RUBY_DEFAULT_CONTAINS
      }
    },
    {
      className: "meta.prompt",
      begin: "^(" + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + "|" + RVM_PROMPT + ")(?=[ ])",
      starts: {
        end: "$",
        keywords: RUBY_KEYWORDS,
        contains: RUBY_DEFAULT_CONTAINS
      }
    }
  ];
  COMMENT_MODES.unshift(IRB_OBJECT);
  return {
    name: "Ruby",
    aliases: [
      "rb",
      "gemspec",
      "podspec",
      "thor",
      "irb"
    ],
    keywords: RUBY_KEYWORDS,
    illegal: /\/\*/,
    contains: [hljs.SHEBANG({ binary: "ruby" })].concat(IRB_DEFAULT).concat(COMMENT_MODES).concat(RUBY_DEFAULT_CONTAINS)
  };
}
function rust(hljs) {
  const regex = hljs.regex;
  const RAW_IDENTIFIER = /(r#)?/;
  const UNDERSCORE_IDENT_RE2 = regex.concat(RAW_IDENTIFIER, hljs.UNDERSCORE_IDENT_RE);
  const IDENT_RE2 = regex.concat(RAW_IDENTIFIER, hljs.IDENT_RE);
  const FUNCTION_INVOKE = {
    className: "title.function.invoke",
    relevance: 0,
    begin: regex.concat(
      /\b/,
      /(?!let|for|while|if|else|match\b)/,
      IDENT_RE2,
      regex.lookahead(/\s*\(/)
    )
  };
  const NUMBER_SUFFIX = "([ui](8|16|32|64|128|size)|f(32|64))?";
  const KEYWORDS2 = [
    "abstract",
    "as",
    "async",
    "await",
    "become",
    "box",
    "break",
    "const",
    "continue",
    "crate",
    "do",
    "dyn",
    "else",
    "enum",
    "extern",
    "false",
    "final",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "macro",
    "match",
    "mod",
    "move",
    "mut",
    "override",
    "priv",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "try",
    "type",
    "typeof",
    "union",
    "unsafe",
    "unsized",
    "use",
    "virtual",
    "where",
    "while",
    "yield"
  ];
  const LITERALS2 = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ];
  const BUILTINS = [
    // functions
    "drop ",
    // traits
    "Copy",
    "Send",
    "Sized",
    "Sync",
    "Drop",
    "Fn",
    "FnMut",
    "FnOnce",
    "ToOwned",
    "Clone",
    "Debug",
    "PartialEq",
    "PartialOrd",
    "Eq",
    "Ord",
    "AsRef",
    "AsMut",
    "Into",
    "From",
    "Default",
    "Iterator",
    "Extend",
    "IntoIterator",
    "DoubleEndedIterator",
    "ExactSizeIterator",
    "SliceConcatExt",
    "ToString",
    // macros
    "assert!",
    "assert_eq!",
    "bitflags!",
    "bytes!",
    "cfg!",
    "col!",
    "concat!",
    "concat_idents!",
    "debug_assert!",
    "debug_assert_eq!",
    "env!",
    "eprintln!",
    "panic!",
    "file!",
    "format!",
    "format_args!",
    "include_bytes!",
    "include_str!",
    "line!",
    "local_data_key!",
    "module_path!",
    "option_env!",
    "print!",
    "println!",
    "select!",
    "stringify!",
    "try!",
    "unimplemented!",
    "unreachable!",
    "vec!",
    "write!",
    "writeln!",
    "macro_rules!",
    "assert_ne!",
    "debug_assert_ne!"
  ];
  const TYPES2 = [
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "isize",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "usize",
    "f32",
    "f64",
    "str",
    "char",
    "bool",
    "Box",
    "Option",
    "Result",
    "String",
    "Vec"
  ];
  return {
    name: "Rust",
    aliases: ["rs"],
    keywords: {
      $pattern: hljs.IDENT_RE + "!?",
      type: TYPES2,
      keyword: KEYWORDS2,
      literal: LITERALS2,
      built_in: BUILTINS
    },
    illegal: "</",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.COMMENT("/\\*", "\\*/", { contains: ["self"] }),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null
      }),
      {
        className: "symbol",
        // negative lookahead to avoid matching `'`
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*(?!')/
      },
      {
        scope: "string",
        variants: [
          { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
          {
            begin: /b?'/,
            end: /'/,
            contains: [
              {
                scope: "char.escape",
                match: /\\('|\w|x\w{2}|u\w{4}|U\w{8})/
              }
            ]
          }
        ]
      },
      {
        className: "number",
        variants: [
          { begin: "\\b0b([01_]+)" + NUMBER_SUFFIX },
          { begin: "\\b0o([0-7_]+)" + NUMBER_SUFFIX },
          { begin: "\\b0x([A-Fa-f0-9_]+)" + NUMBER_SUFFIX },
          { begin: "\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)" + NUMBER_SUFFIX }
        ],
        relevance: 0
      },
      {
        begin: [
          /fn/,
          /\s+/,
          UNDERSCORE_IDENT_RE2
        ],
        className: {
          1: "keyword",
          3: "title.function"
        }
      },
      {
        className: "meta",
        begin: "#!?\\[",
        end: "\\]",
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/,
            contains: [
              hljs.BACKSLASH_ESCAPE
            ]
          }
        ]
      },
      {
        begin: [
          /let/,
          /\s+/,
          /(?:mut\s+)?/,
          UNDERSCORE_IDENT_RE2
        ],
        className: {
          1: "keyword",
          3: "keyword",
          4: "variable"
        }
      },
      // must come before impl/for rule later
      {
        begin: [
          /for/,
          /\s+/,
          UNDERSCORE_IDENT_RE2,
          /\s+/,
          /in/
        ],
        className: {
          1: "keyword",
          3: "variable",
          5: "keyword"
        }
      },
      {
        begin: [
          /type/,
          /\s+/,
          UNDERSCORE_IDENT_RE2
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: [
          /(?:trait|enum|struct|union|impl|for)/,
          /\s+/,
          UNDERSCORE_IDENT_RE2
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: hljs.IDENT_RE + "::",
        keywords: {
          keyword: "Self",
          built_in: BUILTINS,
          type: TYPES2
        }
      },
      {
        className: "punctuation",
        begin: "->"
      },
      FUNCTION_INVOKE
    ]
  };
}
const MODES = (hljs) => {
  return {
    IMPORTANT: {
      scope: "meta",
      begin: "!important"
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: "number",
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: "selector-attr",
      begin: /\[/,
      end: /\]/,
      illegal: "$",
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: "number",
      begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};
const HTML_TAGS = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
];
const SVG_TAGS = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
];
const TAGS = [
  ...HTML_TAGS,
  ...SVG_TAGS
];
const MEDIA_FEATURES = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse();
const PSEUDO_CLASSES = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse();
const PSEUDO_ELEMENTS = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse();
const ATTRIBUTES = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function scss(hljs) {
  const modes = MODES(hljs);
  const PSEUDO_ELEMENTS$12 = PSEUDO_ELEMENTS;
  const PSEUDO_CLASSES$12 = PSEUDO_CLASSES;
  const AT_IDENTIFIER = "@[a-z-]+";
  const AT_MODIFIERS = "and or not only";
  const IDENT_RE2 = "[a-zA-Z-][a-zA-Z0-9_-]*";
  const VARIABLE = {
    className: "variable",
    begin: "(\\$" + IDENT_RE2 + ")\\b",
    relevance: 0
  };
  return {
    name: "SCSS",
    case_insensitive: true,
    illegal: "[=/|']",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: "#[A-Za-z0-9_-]+",
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\.[A-Za-z0-9_-]+",
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-tag",
        begin: "\\b(" + TAGS.join("|") + ")\\b",
        // was there, before, but why?
        relevance: 0
      },
      {
        className: "selector-pseudo",
        begin: ":(" + PSEUDO_CLASSES$12.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + PSEUDO_ELEMENTS$12.join("|") + ")"
      },
      VARIABLE,
      {
        // pseudo-selector params
        begin: /\(/,
        end: /\)/,
        contains: [modes.CSS_NUMBER_MODE]
      },
      modes.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + ATTRIBUTES.join("|") + ")\\b"
      },
      { begin: "\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b" },
      {
        begin: /:/,
        end: /[;}{]/,
        relevance: 0,
        contains: [
          modes.BLOCK_COMMENT,
          VARIABLE,
          modes.HEXCOLOR,
          modes.CSS_NUMBER_MODE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          modes.IMPORTANT,
          modes.FUNCTION_DISPATCH
        ]
      },
      // matching these here allows us to treat them more like regular CSS
      // rules so everything between the {} gets regular rule highlighting,
      // which is what we want for page and font-face
      {
        begin: "@(page|font-face)",
        keywords: {
          $pattern: AT_IDENTIFIER,
          keyword: "@page @font-face"
        }
      },
      {
        begin: "@",
        end: "[{;]",
        returnBegin: true,
        keywords: {
          $pattern: /[a-z-]+/,
          keyword: AT_MODIFIERS,
          attribute: MEDIA_FEATURES.join(" ")
        },
        contains: [
          {
            begin: AT_IDENTIFIER,
            className: "keyword"
          },
          {
            begin: /[a-z-]+(?=:)/,
            className: "attribute"
          },
          VARIABLE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          modes.HEXCOLOR,
          modes.CSS_NUMBER_MODE
        ]
      },
      modes.FUNCTION_DISPATCH
    ]
  };
}
function shell(hljs) {
  return {
    name: "Shell Session",
    aliases: [
      "console",
      "shellsession"
    ],
    contains: [
      {
        className: "meta.prompt",
        // We cannot add \s (spaces) in the regular expression otherwise it will be too broad and produce unexpected result.
        // For instance, in the following example, it would match "echo /path/to/home >" as a prompt:
        // echo /path/to/home > t.exe
        begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
        starts: {
          end: /[^\\](?=\s*$)/,
          subLanguage: "bash"
        }
      }
    ]
  };
}
function sql(hljs) {
  const regex = hljs.regex;
  const COMMENT_MODE = hljs.COMMENT("--", "$");
  const STRING = {
    scope: "string",
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [{ match: /''/ }]
      }
    ]
  };
  const QUOTED_IDENTIFIER = {
    begin: /"/,
    end: /"/,
    contains: [{ match: /""/ }]
  };
  const LITERALS2 = [
    "true",
    "false",
    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
    // "null",
    "unknown"
  ];
  const MULTI_WORD_TYPES = [
    "double precision",
    "large object",
    "with timezone",
    "without timezone"
  ];
  const TYPES2 = [
    "bigint",
    "binary",
    "blob",
    "boolean",
    "char",
    "character",
    "clob",
    "date",
    "dec",
    "decfloat",
    "decimal",
    "float",
    "int",
    "integer",
    "interval",
    "nchar",
    "nclob",
    "national",
    "numeric",
    "real",
    "row",
    "smallint",
    "time",
    "timestamp",
    "varchar",
    "varying",
    // modifier (character varying)
    "varbinary"
  ];
  const NON_RESERVED_WORDS = [
    "add",
    "asc",
    "collation",
    "desc",
    "final",
    "first",
    "last",
    "view"
  ];
  const RESERVED_WORDS = [
    "abs",
    "acos",
    "all",
    "allocate",
    "alter",
    "and",
    "any",
    "are",
    "array",
    "array_agg",
    "array_max_cardinality",
    "as",
    "asensitive",
    "asin",
    "asymmetric",
    "at",
    "atan",
    "atomic",
    "authorization",
    "avg",
    "begin",
    "begin_frame",
    "begin_partition",
    "between",
    "bigint",
    "binary",
    "blob",
    "boolean",
    "both",
    "by",
    "call",
    "called",
    "cardinality",
    "cascaded",
    "case",
    "cast",
    "ceil",
    "ceiling",
    "char",
    "char_length",
    "character",
    "character_length",
    "check",
    "classifier",
    "clob",
    "close",
    "coalesce",
    "collate",
    "collect",
    "column",
    "commit",
    "condition",
    "connect",
    "constraint",
    "contains",
    "convert",
    "copy",
    "corr",
    "corresponding",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "create",
    "cross",
    "cube",
    "cume_dist",
    "current",
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_row",
    "current_schema",
    "current_time",
    "current_timestamp",
    "current_path",
    "current_role",
    "current_transform_group_for_type",
    "current_user",
    "cursor",
    "cycle",
    "date",
    "day",
    "deallocate",
    "dec",
    "decimal",
    "decfloat",
    "declare",
    "default",
    "define",
    "delete",
    "dense_rank",
    "deref",
    "describe",
    "deterministic",
    "disconnect",
    "distinct",
    "double",
    "drop",
    "dynamic",
    "each",
    "element",
    "else",
    "empty",
    "end",
    "end_frame",
    "end_partition",
    "end-exec",
    "equals",
    "escape",
    "every",
    "except",
    "exec",
    "execute",
    "exists",
    "exp",
    "external",
    "extract",
    "false",
    "fetch",
    "filter",
    "first_value",
    "float",
    "floor",
    "for",
    "foreign",
    "frame_row",
    "free",
    "from",
    "full",
    "function",
    "fusion",
    "get",
    "globalThis",
    "grant",
    "group",
    "grouping",
    "groups",
    "having",
    "hold",
    "hour",
    "identity",
    "in",
    "indicator",
    "initial",
    "inner",
    "inout",
    "insensitive",
    "insert",
    "int",
    "integer",
    "intersect",
    "intersection",
    "interval",
    "into",
    "is",
    "join",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "language",
    "large",
    "last_value",
    "lateral",
    "lead",
    "leading",
    "left",
    "like",
    "like_regex",
    "listagg",
    "ln",
    "local",
    "localtime",
    "localtimestamp",
    "log",
    "log10",
    "lower",
    "match",
    "match_number",
    "match_recognize",
    "matches",
    "max",
    "member",
    "merge",
    "method",
    "min",
    "minute",
    "mod",
    "modifies",
    "module",
    "month",
    "multiset",
    "national",
    "natural",
    "nchar",
    "nclob",
    "new",
    "no",
    "none",
    "normalize",
    "not",
    "nth_value",
    "ntile",
    "null",
    "nullif",
    "numeric",
    "octet_length",
    "occurrences_regex",
    "of",
    "offset",
    "old",
    "omit",
    "on",
    "one",
    "only",
    "open",
    "or",
    "order",
    "out",
    "outer",
    "over",
    "overlaps",
    "overlay",
    "parameter",
    "partition",
    "pattern",
    "per",
    "percent",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "period",
    "portion",
    "position",
    "position_regex",
    "power",
    "precedes",
    "precision",
    "prepare",
    "primary",
    "procedure",
    "ptf",
    "range",
    "rank",
    "reads",
    "real",
    "recursive",
    "ref",
    "references",
    "referencing",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "release",
    "result",
    "return",
    "returns",
    "revoke",
    "right",
    "rollback",
    "rollup",
    "row",
    "row_number",
    "rows",
    "running",
    "savepoint",
    "scope",
    "scroll",
    "search",
    "second",
    "seek",
    "select",
    "sensitive",
    "session_user",
    "set",
    "show",
    "similar",
    "sin",
    "sinh",
    "skip",
    "smallint",
    "some",
    "specific",
    "specifictype",
    "sql",
    "sqlexception",
    "sqlstate",
    "sqlwarning",
    "sqrt",
    "start",
    "static",
    "stddev_pop",
    "stddev_samp",
    "submultiset",
    "subset",
    "substring",
    "substring_regex",
    "succeeds",
    "sum",
    "symmetric",
    "system",
    "system_time",
    "system_user",
    "table",
    "tablesample",
    "tan",
    "tanh",
    "then",
    "time",
    "timestamp",
    "timezone_hour",
    "timezone_minute",
    "to",
    "trailing",
    "translate",
    "translate_regex",
    "translation",
    "treat",
    "trigger",
    "trim",
    "trim_array",
    "true",
    "truncate",
    "uescape",
    "union",
    "unique",
    "unknown",
    "unnest",
    "update",
    "upper",
    "user",
    "using",
    "value",
    "values",
    "value_of",
    "var_pop",
    "var_samp",
    "varbinary",
    "varchar",
    "varying",
    "versioning",
    "when",
    "whenever",
    "where",
    "width_bucket",
    "window",
    "with",
    "within",
    "without",
    "year"
  ];
  const RESERVED_FUNCTIONS = [
    "abs",
    "acos",
    "array_agg",
    "asin",
    "atan",
    "avg",
    "cast",
    "ceil",
    "ceiling",
    "coalesce",
    "corr",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "cume_dist",
    "dense_rank",
    "deref",
    "element",
    "exp",
    "extract",
    "first_value",
    "floor",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "last_value",
    "lead",
    "listagg",
    "ln",
    "log",
    "log10",
    "lower",
    "max",
    "min",
    "mod",
    "nth_value",
    "ntile",
    "nullif",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "position",
    "position_regex",
    "power",
    "rank",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "row_number",
    "sin",
    "sinh",
    "sqrt",
    "stddev_pop",
    "stddev_samp",
    "substring",
    "substring_regex",
    "sum",
    "tan",
    "tanh",
    "translate",
    "translate_regex",
    "treat",
    "trim",
    "trim_array",
    "unnest",
    "upper",
    "value_of",
    "var_pop",
    "var_samp",
    "width_bucket"
  ];
  const POSSIBLE_WITHOUT_PARENS = [
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_schema",
    "current_transform_group_for_type",
    "current_user",
    "session_user",
    "system_time",
    "system_user",
    "current_time",
    "localtime",
    "current_timestamp",
    "localtimestamp"
  ];
  const COMBOS = [
    "create table",
    "insert into",
    "primary key",
    "foreign key",
    "not null",
    "alter table",
    "add constraint",
    "grouping sets",
    "on overflow",
    "character set",
    "respect nulls",
    "ignore nulls",
    "nulls first",
    "nulls last",
    "depth first",
    "breadth first"
  ];
  const FUNCTIONS = RESERVED_FUNCTIONS;
  const KEYWORDS2 = [
    ...RESERVED_WORDS,
    ...NON_RESERVED_WORDS
  ].filter((keyword) => {
    return !RESERVED_FUNCTIONS.includes(keyword);
  });
  const VARIABLE = {
    scope: "variable",
    match: /@[a-z0-9][a-z0-9_]*/
  };
  const OPERATOR = {
    scope: "operator",
    match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0
  };
  const FUNCTION_CALL = {
    match: regex.concat(/\b/, regex.either(...FUNCTIONS), /\s*\(/),
    relevance: 0,
    keywords: { built_in: FUNCTIONS }
  };
  function kws_to_regex(list2) {
    return regex.concat(
      /\b/,
      regex.either(...list2.map((kw) => {
        return kw.replace(/\s+/, "\\s+");
      })),
      /\b/
    );
  }
  const MULTI_WORD_KEYWORDS = {
    scope: "keyword",
    match: kws_to_regex(COMBOS),
    relevance: 0
  };
  function reduceRelevancy(list2, {
    exceptions,
    when
  } = {}) {
    const qualifyFn = when;
    exceptions = exceptions || [];
    return list2.map((item) => {
      if (item.match(/\|\d+$/) || exceptions.includes(item)) {
        return item;
      } else if (qualifyFn(item)) {
        return `${item}|0`;
      } else {
        return item;
      }
    });
  }
  return {
    name: "SQL",
    case_insensitive: true,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword: reduceRelevancy(KEYWORDS2, { when: (x2) => x2.length < 3 }),
      literal: LITERALS2,
      type: TYPES2,
      built_in: POSSIBLE_WITHOUT_PARENS
    },
    contains: [
      {
        scope: "type",
        match: kws_to_regex(MULTI_WORD_TYPES)
      },
      MULTI_WORD_KEYWORDS,
      FUNCTION_CALL,
      VARIABLE,
      STRING,
      QUOTED_IDENTIFIER,
      hljs.C_NUMBER_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE,
      OPERATOR
    ]
  };
}
function source(re) {
  if (!re)
    return null;
  if (typeof re === "string")
    return re;
  return re.source;
}
function lookahead(re) {
  return concat("(?=", re, ")");
}
function concat(...args) {
  const joined = args.map((x2) => source(x2)).join("");
  return joined;
}
function stripOptionsFromArgs(args) {
  const opts = args[args.length - 1];
  if (typeof opts === "object" && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}
function either(...args) {
  const opts = stripOptionsFromArgs(args);
  const joined = "(" + (opts.capture ? "" : "?:") + args.map((x2) => source(x2)).join("|") + ")";
  return joined;
}
const keywordWrapper = (keyword) => concat(
  /\b/,
  keyword,
  /\w$/.test(keyword) ? /\b/ : /\B/
);
const dotKeywords = [
  "Protocol",
  // contextual
  "Type"
  // contextual
].map(keywordWrapper);
const optionalDotKeywords = [
  "init",
  "self"
].map(keywordWrapper);
const keywordTypes = [
  "Any",
  "Self"
];
const keywords = [
  // strings below will be fed into the regular `keywords` engine while regex
  // will result in additional modes being created to scan for those keywords to
  // avoid conflicts with other rules
  "actor",
  "any",
  // contextual
  "associatedtype",
  "async",
  "await",
  /as\?/,
  // operator
  /as!/,
  // operator
  "as",
  // operator
  "borrowing",
  // contextual
  "break",
  "case",
  "catch",
  "class",
  "consume",
  // contextual
  "consuming",
  // contextual
  "continue",
  "convenience",
  // contextual
  "copy",
  // contextual
  "default",
  "defer",
  "deinit",
  "didSet",
  // contextual
  "distributed",
  "do",
  "dynamic",
  // contextual
  "each",
  "else",
  "enum",
  "extension",
  "fallthrough",
  /fileprivate\(set\)/,
  "fileprivate",
  "final",
  // contextual
  "for",
  "func",
  "get",
  // contextual
  "guard",
  "if",
  "import",
  "indirect",
  // contextual
  "infix",
  // contextual
  /init\?/,
  /init!/,
  "inout",
  /internal\(set\)/,
  "internal",
  "in",
  "is",
  // operator
  "isolated",
  // contextual
  "nonisolated",
  // contextual
  "lazy",
  // contextual
  "let",
  "macro",
  "mutating",
  // contextual
  "nonmutating",
  // contextual
  /open\(set\)/,
  // contextual
  "open",
  // contextual
  "operator",
  "optional",
  // contextual
  "override",
  // contextual
  "package",
  "postfix",
  // contextual
  "precedencegroup",
  "prefix",
  // contextual
  /private\(set\)/,
  "private",
  "protocol",
  /public\(set\)/,
  "public",
  "repeat",
  "required",
  // contextual
  "rethrows",
  "return",
  "set",
  // contextual
  "some",
  // contextual
  "static",
  "struct",
  "subscript",
  "super",
  "switch",
  "throws",
  "throw",
  /try\?/,
  // operator
  /try!/,
  // operator
  "try",
  // operator
  "typealias",
  /unowned\(safe\)/,
  // contextual
  /unowned\(unsafe\)/,
  // contextual
  "unowned",
  // contextual
  "var",
  "weak",
  // contextual
  "where",
  "while",
  "willSet"
  // contextual
];
const literals = [
  "false",
  "nil",
  "true"
];
const precedencegroupKeywords = [
  "assignment",
  "associativity",
  "higherThan",
  "left",
  "lowerThan",
  "none",
  "right"
];
const numberSignKeywords = [
  "#colorLiteral",
  "#column",
  "#dsohandle",
  "#else",
  "#elseif",
  "#endif",
  "#error",
  "#file",
  "#fileID",
  "#fileLiteral",
  "#filePath",
  "#function",
  "#if",
  "#imageLiteral",
  "#keyPath",
  "#line",
  "#selector",
  "#sourceLocation",
  "#warning"
];
const builtIns = [
  "abs",
  "all",
  "any",
  "assert",
  "assertionFailure",
  "debugPrint",
  "dump",
  "fatalError",
  "getVaList",
  "isKnownUniquelyReferenced",
  "max",
  "min",
  "numericCast",
  "pointwiseMax",
  "pointwiseMin",
  "precondition",
  "preconditionFailure",
  "print",
  "readLine",
  "repeatElement",
  "sequence",
  "stride",
  "swap",
  "swift_unboxFromSwiftValueWithType",
  "transcode",
  "type",
  "unsafeBitCast",
  "unsafeDowncast",
  "withExtendedLifetime",
  "withUnsafeMutablePointer",
  "withUnsafePointer",
  "withVaList",
  "withoutActuallyEscaping",
  "zip"
];
const operatorHead = either(
  /[/=\-+!*%<>&|^~?]/,
  /[\u00A1-\u00A7]/,
  /[\u00A9\u00AB]/,
  /[\u00AC\u00AE]/,
  /[\u00B0\u00B1]/,
  /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
  /[\u2016-\u2017]/,
  /[\u2020-\u2027]/,
  /[\u2030-\u203E]/,
  /[\u2041-\u2053]/,
  /[\u2055-\u205E]/,
  /[\u2190-\u23FF]/,
  /[\u2500-\u2775]/,
  /[\u2794-\u2BFF]/,
  /[\u2E00-\u2E7F]/,
  /[\u3001-\u3003]/,
  /[\u3008-\u3020]/,
  /[\u3030]/
);
const operatorCharacter = either(
  operatorHead,
  /[\u0300-\u036F]/,
  /[\u1DC0-\u1DFF]/,
  /[\u20D0-\u20FF]/,
  /[\uFE00-\uFE0F]/,
  /[\uFE20-\uFE2F]/
  // TODO: The following characters are also allowed, but the regex isn't supported yet.
  // /[\u{E0100}-\u{E01EF}]/u
);
const operator = concat(operatorHead, operatorCharacter, "*");
const identifierHead = either(
  /[a-zA-Z_]/,
  /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
  /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
  /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
  /[\u1E00-\u1FFF]/,
  /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
  /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
  /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
  /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
  /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
  /[\uFE47-\uFEFE\uFF00-\uFFFD]/
  // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
  // The following characters are also allowed, but the regexes aren't supported yet.
  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
);
const identifierCharacter = either(
  identifierHead,
  /\d/,
  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
);
const identifier = concat(identifierHead, identifierCharacter, "*");
const typeIdentifier = concat(/[A-Z]/, identifierCharacter, "*");
const keywordAttributes = [
  "attached",
  "autoclosure",
  concat(/convention\(/, either("swift", "block", "c"), /\)/),
  "discardableResult",
  "dynamicCallable",
  "dynamicMemberLookup",
  "escaping",
  "freestanding",
  "frozen",
  "GKInspectable",
  "IBAction",
  "IBDesignable",
  "IBInspectable",
  "IBOutlet",
  "IBSegueAction",
  "inlinable",
  "main",
  "nonobjc",
  "NSApplicationMain",
  "NSCopying",
  "NSManaged",
  concat(/objc\(/, identifier, /\)/),
  "objc",
  "objcMembers",
  "propertyWrapper",
  "requires_stored_property_inits",
  "resultBuilder",
  "Sendable",
  "testable",
  "UIApplicationMain",
  "unchecked",
  "unknown",
  "usableFromInline",
  "warn_unqualified_access"
];
const availabilityKeywords = [
  "iOS",
  "iOSApplicationExtension",
  "macOS",
  "macOSApplicationExtension",
  "macCatalyst",
  "macCatalystApplicationExtension",
  "watchOS",
  "watchOSApplicationExtension",
  "tvOS",
  "tvOSApplicationExtension",
  "swift"
];
function swift(hljs) {
  const WHITESPACE = {
    match: /\s+/,
    relevance: 0
  };
  const BLOCK_COMMENT = hljs.COMMENT(
    "/\\*",
    "\\*/",
    { contains: ["self"] }
  );
  const COMMENTS = [
    hljs.C_LINE_COMMENT_MODE,
    BLOCK_COMMENT
  ];
  const DOT_KEYWORD = {
    match: [
      /\./,
      either(...dotKeywords, ...optionalDotKeywords)
    ],
    className: { 2: "keyword" }
  };
  const KEYWORD_GUARD = {
    // Consume .keyword to prevent highlighting properties and methods as keywords.
    match: concat(/\./, either(...keywords)),
    relevance: 0
  };
  const PLAIN_KEYWORDS = keywords.filter((kw) => typeof kw === "string").concat(["_|0"]);
  const REGEX_KEYWORDS = keywords.filter((kw) => typeof kw !== "string").concat(keywordTypes).map(keywordWrapper);
  const KEYWORD = { variants: [
    {
      className: "keyword",
      match: either(...REGEX_KEYWORDS, ...optionalDotKeywords)
    }
  ] };
  const KEYWORDS2 = {
    $pattern: either(
      /\b\w+/,
      // regular keywords
      /#\w+/
      // number keywords
    ),
    keyword: PLAIN_KEYWORDS.concat(numberSignKeywords),
    literal: literals
  };
  const KEYWORD_MODES = [
    DOT_KEYWORD,
    KEYWORD_GUARD,
    KEYWORD
  ];
  const BUILT_IN_GUARD = {
    // Consume .built_in to prevent highlighting properties and methods.
    match: concat(/\./, either(...builtIns)),
    relevance: 0
  };
  const BUILT_IN = {
    className: "built_in",
    match: concat(/\b/, either(...builtIns), /(?=\()/)
  };
  const BUILT_INS2 = [
    BUILT_IN_GUARD,
    BUILT_IN
  ];
  const OPERATOR_GUARD = {
    // Prevent -> from being highlighting as an operator.
    match: /->/,
    relevance: 0
  };
  const OPERATOR = {
    className: "operator",
    relevance: 0,
    variants: [
      { match: operator },
      {
        // dot-operator: only operators that start with a dot are allowed to use dots as
        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
        // characters that may also include dots.
        match: `\\.(\\.|${operatorCharacter})+`
      }
    ]
  };
  const OPERATORS = [
    OPERATOR_GUARD,
    OPERATOR
  ];
  const decimalDigits2 = "([0-9]_*)+";
  const hexDigits2 = "([0-9a-fA-F]_*)+";
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${decimalDigits2})(\\.(${decimalDigits2}))?([eE][+-]?(${decimalDigits2}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0x(${hexDigits2})(\\.(${hexDigits2}))?([pP][+-]?(${decimalDigits2}))?\\b` },
      // octal-literal
      { match: /\b0o([0-7]_*)+\b/ },
      // binary-literal
      { match: /\b0b([01]_*)+\b/ }
    ]
  };
  const ESCAPED_CHARACTER = (rawDelimiter = "") => ({
    className: "subst",
    variants: [
      { match: concat(/\\/, rawDelimiter, /[0\\tnr"']/) },
      { match: concat(/\\/, rawDelimiter, /u\{[0-9a-fA-F]{1,8}\}/) }
    ]
  });
  const ESCAPED_NEWLINE = (rawDelimiter = "") => ({
    className: "subst",
    match: concat(/\\/, rawDelimiter, /[\t ]*(?:[\r\n]|\r\n)/)
  });
  const INTERPOLATION = (rawDelimiter = "") => ({
    className: "subst",
    label: "interpol",
    begin: concat(/\\/, rawDelimiter, /\(/),
    end: /\)/
  });
  const MULTILINE_STRING = (rawDelimiter = "") => ({
    begin: concat(rawDelimiter, /"""/),
    end: concat(/"""/, rawDelimiter),
    contains: [
      ESCAPED_CHARACTER(rawDelimiter),
      ESCAPED_NEWLINE(rawDelimiter),
      INTERPOLATION(rawDelimiter)
    ]
  });
  const SINGLE_LINE_STRING = (rawDelimiter = "") => ({
    begin: concat(rawDelimiter, /"/),
    end: concat(/"/, rawDelimiter),
    contains: [
      ESCAPED_CHARACTER(rawDelimiter),
      INTERPOLATION(rawDelimiter)
    ]
  });
  const STRING = {
    className: "string",
    variants: [
      MULTILINE_STRING(),
      MULTILINE_STRING("#"),
      MULTILINE_STRING("##"),
      MULTILINE_STRING("###"),
      SINGLE_LINE_STRING(),
      SINGLE_LINE_STRING("#"),
      SINGLE_LINE_STRING("##"),
      SINGLE_LINE_STRING("###")
    ]
  };
  const REGEXP_CONTENTS = [
    hljs.BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [hljs.BACKSLASH_ESCAPE]
    }
  ];
  const BARE_REGEXP_LITERAL = {
    begin: /\/[^\s](?=[^/\n]*\/)/,
    end: /\//,
    contains: REGEXP_CONTENTS
  };
  const EXTENDED_REGEXP_LITERAL = (rawDelimiter) => {
    const begin = concat(rawDelimiter, /\//);
    const end2 = concat(/\//, rawDelimiter);
    return {
      begin,
      end: end2,
      contains: [
        ...REGEXP_CONTENTS,
        {
          scope: "comment",
          begin: `#(?!.*${end2})`,
          end: /$/
        }
      ]
    };
  };
  const REGEXP = {
    scope: "regexp",
    variants: [
      EXTENDED_REGEXP_LITERAL("###"),
      EXTENDED_REGEXP_LITERAL("##"),
      EXTENDED_REGEXP_LITERAL("#"),
      BARE_REGEXP_LITERAL
    ]
  };
  const QUOTED_IDENTIFIER = { match: concat(/`/, identifier, /`/) };
  const IMPLICIT_PARAMETER = {
    className: "variable",
    match: /\$\d+/
  };
  const PROPERTY_WRAPPER_PROJECTION = {
    className: "variable",
    match: `\\$${identifierCharacter}+`
  };
  const IDENTIFIERS = [
    QUOTED_IDENTIFIER,
    IMPLICIT_PARAMETER,
    PROPERTY_WRAPPER_PROJECTION
  ];
  const AVAILABLE_ATTRIBUTE = {
    match: /(@|#(un)?)available/,
    scope: "keyword",
    starts: { contains: [
      {
        begin: /\(/,
        end: /\)/,
        keywords: availabilityKeywords,
        contains: [
          ...OPERATORS,
          NUMBER,
          STRING
        ]
      }
    ] }
  };
  const KEYWORD_ATTRIBUTE = {
    scope: "keyword",
    match: concat(/@/, either(...keywordAttributes), lookahead(either(/\(/, /\s+/)))
  };
  const USER_DEFINED_ATTRIBUTE = {
    scope: "meta",
    match: concat(/@/, identifier)
  };
  const ATTRIBUTES2 = [
    AVAILABLE_ATTRIBUTE,
    KEYWORD_ATTRIBUTE,
    USER_DEFINED_ATTRIBUTE
  ];
  const TYPE = {
    match: lookahead(/\b[A-Z]/),
    relevance: 0,
    contains: [
      {
        // Common Apple frameworks, for relevance boost
        className: "type",
        match: concat(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, identifierCharacter, "+")
      },
      {
        // Type identifier
        className: "type",
        match: typeIdentifier,
        relevance: 0
      },
      {
        // Optional type
        match: /[?!]+/,
        relevance: 0
      },
      {
        // Variadic parameter
        match: /\.\.\./,
        relevance: 0
      },
      {
        // Protocol composition
        match: concat(/\s+&\s+/, lookahead(typeIdentifier)),
        relevance: 0
      }
    ]
  };
  const GENERIC_ARGUMENTS = {
    begin: /</,
    end: />/,
    keywords: KEYWORDS2,
    contains: [
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...ATTRIBUTES2,
      OPERATOR_GUARD,
      TYPE
    ]
  };
  TYPE.contains.push(GENERIC_ARGUMENTS);
  const TUPLE_ELEMENT_NAME = {
    match: concat(identifier, /\s*:/),
    keywords: "_|0",
    relevance: 0
  };
  const TUPLE = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    keywords: KEYWORDS2,
    contains: [
      "self",
      TUPLE_ELEMENT_NAME,
      ...COMMENTS,
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS2,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES2,
      TYPE
    ]
  };
  const GENERIC_PARAMETERS = {
    begin: /</,
    end: />/,
    keywords: "repeat each",
    contains: [
      ...COMMENTS,
      TYPE
    ]
  };
  const FUNCTION_PARAMETER_NAME = {
    begin: either(
      lookahead(concat(identifier, /\s*:/)),
      lookahead(concat(identifier, /\s+/, identifier, /\s*:/))
    ),
    end: /:/,
    relevance: 0,
    contains: [
      {
        className: "keyword",
        match: /\b_\b/
      },
      {
        className: "params",
        match: identifier
      }
    ]
  };
  const FUNCTION_PARAMETERS = {
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS2,
    contains: [
      FUNCTION_PARAMETER_NAME,
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...ATTRIBUTES2,
      TYPE,
      TUPLE
    ],
    endsParent: true,
    illegal: /["']/
  };
  const FUNCTION_OR_MACRO = {
    match: [
      /(func|macro)/,
      /\s+/,
      either(QUOTED_IDENTIFIER.match, identifier, operator)
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      GENERIC_PARAMETERS,
      FUNCTION_PARAMETERS,
      WHITESPACE
    ],
    illegal: [
      /\[/,
      /%/
    ]
  };
  const INIT_SUBSCRIPT = {
    match: [
      /\b(?:subscript|init[?!]?)/,
      /\s*(?=[<(])/
    ],
    className: { 1: "keyword" },
    contains: [
      GENERIC_PARAMETERS,
      FUNCTION_PARAMETERS,
      WHITESPACE
    ],
    illegal: /\[|%/
  };
  const OPERATOR_DECLARATION = {
    match: [
      /operator/,
      /\s+/,
      operator
    ],
    className: {
      1: "keyword",
      3: "title"
    }
  };
  const PRECEDENCEGROUP = {
    begin: [
      /precedencegroup/,
      /\s+/,
      typeIdentifier
    ],
    className: {
      1: "keyword",
      3: "title"
    },
    contains: [TYPE],
    keywords: [
      ...precedencegroupKeywords,
      ...literals
    ],
    end: /}/
  };
  const CLASS_FUNC_DECLARATION = {
    match: [
      /class\b/,
      /\s+/,
      /func\b/,
      /\s+/,
      /\b[A-Za-z_][A-Za-z0-9_]*\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword",
      5: "title.function"
    }
  };
  const CLASS_VAR_DECLARATION = {
    match: [
      /class\b/,
      /\s+/,
      /var\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword"
    }
  };
  const TYPE_DECLARATION = {
    begin: [
      /(struct|protocol|class|extension|enum|actor)/,
      /\s+/,
      identifier,
      /\s*/
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    },
    keywords: KEYWORDS2,
    contains: [
      GENERIC_PARAMETERS,
      ...KEYWORD_MODES,
      {
        begin: /:/,
        end: /\{/,
        keywords: KEYWORDS2,
        contains: [
          {
            scope: "title.class.inherited",
            match: typeIdentifier
          },
          ...KEYWORD_MODES
        ],
        relevance: 0
      }
    ]
  };
  for (const variant of STRING.variants) {
    const interpolation = variant.contains.find((mode) => mode.label === "interpol");
    interpolation.keywords = KEYWORDS2;
    const submodes = [
      ...KEYWORD_MODES,
      ...BUILT_INS2,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS
    ];
    interpolation.contains = [
      ...submodes,
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          "self",
          ...submodes
        ]
      }
    ];
  }
  return {
    name: "Swift",
    keywords: KEYWORDS2,
    contains: [
      ...COMMENTS,
      FUNCTION_OR_MACRO,
      INIT_SUBSCRIPT,
      CLASS_FUNC_DECLARATION,
      CLASS_VAR_DECLARATION,
      TYPE_DECLARATION,
      OPERATOR_DECLARATION,
      PRECEDENCEGROUP,
      {
        beginKeywords: "import",
        end: /$/,
        contains: [...COMMENTS],
        relevance: 0
      },
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS2,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES2,
      TYPE,
      TUPLE
    ]
  };
}
const IDENT_RE = "[A-Za-z$_][0-9A-Za-z$_]*";
const KEYWORDS = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
];
const LITERALS = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];
const TYPES = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];
const ERROR_TYPES = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];
const BUILT_IN_GLOBALS = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];
const BUILT_IN_VARIABLES = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "globalThis"
  // Node.js
];
const BUILT_INS = [].concat(
  BUILT_IN_GLOBALS,
  TYPES,
  ERROR_TYPES
);
function javascript(hljs) {
  const regex = hljs.regex;
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };
  const IDENT_RE$12 = IDENT_RE;
  const FRAGMENT = {
    begin: "<>",
    end: "</>"
  };
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
      ) {
        response.ignoreMatch();
        return;
      }
      if (nextChar === ">") {
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
      let m2;
      const afterMatch = match.input.substring(afterMatchIndex);
      if (m2 = afterMatch.match(/^\s*=/)) {
        response.ignoreMatch();
        return;
      }
      if (m2 = afterMatch.match(/^\s+extends\s+/)) {
        if (m2.index === 0) {
          response.ignoreMatch();
          return;
        }
      }
    }
  };
  const KEYWORDS$12 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_INS,
    "variable.language": BUILT_IN_VARIABLES
  };
  const decimalDigits2 = "[0-9](_?[0-9])*";
  const frac2 = `\\.(${decimalDigits2})`;
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac2})|\\.)?|(${frac2}))[eE][+-]?(${decimalDigits2})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac2})\\b|\\.)?|(${frac2})\\b` },
      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  };
  const SUBST = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: KEYWORDS$12,
    contains: []
    // defined later
  };
  const HTML_TEMPLATE = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "xml"
    }
  };
  const CSS_TEMPLATE = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "css"
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "graphql"
    }
  };
  const TEMPLATE_STRING = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    "\\*/",
    {
      relevance: 0,
      contains: [
        {
          begin: "(?=@[A-Za-z]+)",
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            },
            {
              className: "type",
              begin: "\\{",
              end: "\\}",
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: "variable",
              begin: IDENT_RE$12 + "(?=\\s*(-)|$)",
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT2 = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS$12,
    contains: [
      "self"
    ].concat(SUBST_INTERNALS)
  });
  const SUBST_AND_COMMENTS = [].concat(COMMENT2, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: KEYWORDS$12,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$12,
    contains: PARAMS_CONTAINS
  };
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$12,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$12, "(", regex.concat(/\./, IDENT_RE$12), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$12
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES,
        ...ERROR_TYPES
      ]
    }
  };
  const USE_STRICT = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };
  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$12,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [PARAMS],
    illegal: /%/
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function noneOf(list2) {
    return regex.concat("(?!", list2.join("|"), ")");
  }
  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS,
        "super",
        "import"
      ].map((x2) => `${x2}\\s*\\(`)),
      IDENT_RE$12,
      regex.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  };
  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$12, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$12,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };
  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$12,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };
  const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/,
      /\s+/,
      IDENT_RE$12,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: KEYWORDS$12,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT2,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: "attr",
        match: IDENT_RE$12 + regex.lookahead(":"),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      {
        // "value" container
        begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          COMMENT2,
          hljs.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$12,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$12, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + IDENT_RE$12,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [PARAMS]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function typescript(hljs) {
  const regex = hljs.regex;
  const tsLanguage = javascript(hljs);
  const IDENT_RE$12 = IDENT_RE;
  const TYPES2 = [
    "any",
    "void",
    "number",
    "boolean",
    "string",
    "object",
    "never",
    "symbol",
    "bigint",
    "unknown"
  ];
  const NAMESPACE = {
    begin: [
      /namespace/,
      /\s+/,
      hljs.IDENT_RE
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    }
  };
  const INTERFACE = {
    beginKeywords: "interface",
    end: /\{/,
    excludeEnd: true,
    keywords: {
      keyword: "interface extends",
      built_in: TYPES2
    },
    contains: [tsLanguage.exports.CLASS_REFERENCE]
  };
  const USE_STRICT = {
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  };
  const TS_SPECIFIC_KEYWORDS = [
    "type",
    // "namespace",
    "interface",
    "public",
    "private",
    "protected",
    "implements",
    "declare",
    "abstract",
    "readonly",
    "enum",
    "override",
    "satisfies"
  ];
  const KEYWORDS$12 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS.concat(TS_SPECIFIC_KEYWORDS),
    literal: LITERALS,
    built_in: BUILT_INS.concat(TYPES2),
    "variable.language": BUILT_IN_VARIABLES
  };
  const DECORATOR = {
    className: "meta",
    begin: "@" + IDENT_RE$12
  };
  const swapMode = (mode, label2, replacement) => {
    const indx = mode.contains.findIndex((m2) => m2.label === label2);
    if (indx === -1) {
      throw new Error("can not find mode to replace");
    }
    mode.contains.splice(indx, 1, replacement);
  };
  Object.assign(tsLanguage.keywords, KEYWORDS$12);
  tsLanguage.exports.PARAMS_CONTAINS.push(DECORATOR);
  const ATTRIBUTE_HIGHLIGHT = tsLanguage.contains.find((c2) => c2.scope === "attr");
  const OPTIONAL_KEY_OR_ARGUMENT = Object.assign(
    {},
    ATTRIBUTE_HIGHLIGHT,
    { match: regex.concat(IDENT_RE$12, regex.lookahead(/\s*\?:/)) }
  );
  tsLanguage.exports.PARAMS_CONTAINS.push([
    tsLanguage.exports.CLASS_REFERENCE,
    // class reference for highlighting the params types
    ATTRIBUTE_HIGHLIGHT,
    // highlight the params key
    OPTIONAL_KEY_OR_ARGUMENT
    // Added for optional property assignment highlighting
  ]);
  tsLanguage.contains = tsLanguage.contains.concat([
    DECORATOR,
    NAMESPACE,
    INTERFACE,
    OPTIONAL_KEY_OR_ARGUMENT
    // Added for optional property assignment highlighting
  ]);
  swapMode(tsLanguage, "shebang", hljs.SHEBANG());
  swapMode(tsLanguage, "use_strict", USE_STRICT);
  const functionDeclaration = tsLanguage.contains.find((m2) => m2.label === "func.def");
  functionDeclaration.relevance = 0;
  Object.assign(tsLanguage, {
    name: "TypeScript",
    aliases: [
      "ts",
      "tsx",
      "mts",
      "cts"
    ]
  });
  return tsLanguage;
}
function vim(hljs) {
  return {
    name: "Vim Script",
    keywords: {
      $pattern: /[!#@\w]+/,
      keyword: (
        // express version except: ! & * < = > !! # @ @@
        "N|0 P|0 X|0 a|0 ab abc abo al am an|0 ar arga argd arge argdo argg argl argu as au aug aun b|0 bN ba bad bd be bel bf bl bm bn bo bp br brea breaka breakd breakl bro bufdo buffers bun bw c|0 cN cNf ca cabc caddb cad caddf cal cat cb cc ccl cd ce cex cf cfir cgetb cgete cg changes chd che checkt cl cla clo cm cmapc cme cn cnew cnf cno cnorea cnoreme co col colo com comc comp con conf cope cp cpf cq cr cs cst cu cuna cunme cw delm deb debugg delc delf dif diffg diffo diffp diffpu diffs diffthis dig di dl dell dj dli do doautoa dp dr ds dsp e|0 ea ec echoe echoh echom echon el elsei em en endfo endf endt endw ene ex exe exi exu f|0 files filet fin fina fini fir fix fo foldc foldd folddoc foldo for fu go gr grepa gu gv ha helpf helpg helpt hi hid his ia iabc if ij il im imapc ime ino inorea inoreme int is isp iu iuna iunme j|0 ju k|0 keepa kee keepj lN lNf l|0 lad laddb laddf la lan lat lb lc lch lcl lcs le lefta let lex lf lfir lgetb lgete lg lgr lgrepa lh ll lla lli lmak lm lmapc lne lnew lnf ln loadk lo loc lockv lol lope lp lpf lr ls lt lu lua luad luaf lv lvimgrepa lw m|0 ma mak map mapc marks mat me menut mes mk mks mksp mkv mkvie mod mz mzf nbc nb nbs new nm nmapc nme nn nnoreme noa no noh norea noreme norm nu nun nunme ol o|0 om omapc ome on ono onoreme opt ou ounme ow p|0 profd prof pro promptr pc ped pe perld po popu pp pre prev ps pt ptN ptf ptj ptl ptn ptp ptr pts pu pw py3 python3 py3d py3f py pyd pyf quita qa rec red redi redr redraws reg res ret retu rew ri rightb rub rubyd rubyf rund ru rv sN san sa sal sav sb sbN sba sbf sbl sbm sbn sbp sbr scrip scripte scs se setf setg setl sf sfir sh sim sig sil sl sla sm smap smapc sme sn sni sno snor snoreme sor so spelld spe spelli spellr spellu spellw sp spr sre st sta startg startr star stopi stj sts sun sunm sunme sus sv sw sy synti sync tN tabN tabc tabdo tabe tabf tabfir tabl tabm tabnew tabn tabo tabp tabr tabs tab ta tags tc tcld tclf te tf th tj tl tm tn to tp tr try ts tu u|0 undoj undol una unh unl unlo unm unme uns up ve verb vert vim vimgrepa vi viu vie vm vmapc vme vne vn vnoreme vs vu vunme windo w|0 wN wa wh wi winc winp wn wp wq wqa ws wu wv x|0 xa xmapc xm xme xn xnoreme xu xunme y|0 z|0 ~ Next Print append abbreviate abclear aboveleft all amenu anoremenu args argadd argdelete argedit argglobal arglocal argument ascii autocmd augroup aunmenu buffer bNext ball badd bdelete behave belowright bfirst blast bmodified bnext botright bprevious brewind break breakadd breakdel breaklist browse bunload bwipeout change cNext cNfile cabbrev cabclear caddbuffer caddexpr caddfile call catch cbuffer cclose center cexpr cfile cfirst cgetbuffer cgetexpr cgetfile chdir checkpath checktime clist clast close cmap cmapclear cmenu cnext cnewer cnfile cnoremap cnoreabbrev cnoremenu copy colder colorscheme command comclear compiler continue confirm copen cprevious cpfile cquit crewind cscope cstag cunmap cunabbrev cunmenu cwindow delete delmarks debug debuggreedy delcommand delfunction diffupdate diffget diffoff diffpatch diffput diffsplit digraphs display deletel djump dlist doautocmd doautoall deletep drop dsearch dsplit edit earlier echo echoerr echohl echomsg else elseif emenu endif endfor endfunction endtry endwhile enew execute exit exusage file filetype find finally finish first fixdel fold foldclose folddoopen folddoclosed foldopen function globalThis goto grep grepadd gui gvim hardcopy help helpfind helpgrep helptags highlight hide history insert iabbrev iabclear ijump ilist imap imapclear imenu inoremap inoreabbrev inoremenu intro isearch isplit iunmap iunabbrev iunmenu join jumps keepalt keepmarks keepjumps lNext lNfile list laddexpr laddbuffer laddfile last language later lbuffer lcd lchdir lclose lcscope left leftabove lexpr lfile lfirst lgetbuffer lgetexpr lgetfile lgrep lgrepadd lhelpgrep llast llist lmake lmap lmapclear lnext lnewer lnfile lnoremap loadkeymap loadview lockmarks lockvar lolder lopen lprevious lpfile lrewind ltag lunmap luado luafile lvimgrep lvimgrepadd lwindow move mark make mapclear match menu menutranslate messages mkexrc mksession mkspell mkvimrc mkview mode mzscheme mzfile nbclose nbkey nbsart next nmap nmapclear nmenu nnoremap nnoremenu noautocmd noremap nohlsearch noreabbrev noremenu normal number nunmap nunmenu oldfiles open omap omapclear omenu only onoremap onoremenu options ounmap ounmenu ownsyntax print profdel profile promptfind promptrepl pclose pedit perl perldo pop popup ppop preserve previous psearch ptag ptNext ptfirst ptjump ptlast ptnext ptprevious ptrewind ptselect put pwd py3do py3file python pydo pyfile quit quitall qall read recover redo redir redraw redrawstatus registers resize retab return rewind right rightbelow ruby rubydo rubyfile rundo runtime rviminfo substitute sNext sandbox sargument sall saveas sbuffer sbNext sball sbfirst sblast sbmodified sbnext sbprevious sbrewind scriptnames scriptencoding scscope set setfiletype setglobal setlocal sfind sfirst shell simalt sign silent sleep slast smagic smapclear smenu snext sniff snomagic snoremap snoremenu sort source spelldump spellgood spellinfo spellrepall spellundo spellwrong split sprevious srewind stop stag startgreplace startreplace startinsert stopinsert stjump stselect sunhide sunmap sunmenu suspend sview swapname syntax syntime syncbind tNext tabNext tabclose tabedit tabfind tabfirst tablast tabmove tabnext tabonly tabprevious tabrewind tag tcl tcldo tclfile tearoff tfirst throw tjump tlast tmenu tnext topleft tprevious trewind tselect tunmenu undo undojoin undolist unabbreviate unhide unlet unlockvar unmap unmenu unsilent update vglobal version verbose vertical vimgrep vimgrepadd visual viusage view vmap vmapclear vmenu vnew vnoremap vnoremenu vsplit vunmap vunmenu write wNext wall while winsize wincmd winpos wnext wprevious wqall wsverb wundo wviminfo xit xall xmapclear xmap xmenu xnoremap xnoremenu xunmap xunmenu yank"
      ),
      built_in: (
        // built in func
        "synIDtrans atan2 range matcharg did_filetype asin feedkeys xor argv complete_check add getwinposx getqflist getwinposy screencol clearmatches empty extend getcmdpos mzeval garbagecollect setreg ceil sqrt diff_hlID inputsecret get getfperm getpid filewritable shiftwidth max sinh isdirectory synID system inputrestore winline atan visualmode inputlist tabpagewinnr round getregtype mapcheck hasmapto histdel argidx findfile sha256 exists toupper getcmdline taglist string getmatches bufnr strftime winwidth bufexists strtrans tabpagebuflist setcmdpos remote_read printf setloclist getpos getline bufwinnr float2nr len getcmdtype diff_filler luaeval resolve libcallnr foldclosedend reverse filter has_key bufname str2float strlen setline getcharmod setbufvar index searchpos shellescape undofile foldclosed setqflist buflisted strchars str2nr virtcol floor remove undotree remote_expr winheight gettabwinvar reltime cursor tabpagenr finddir localtime acos getloclist search tanh matchend rename gettabvar strdisplaywidth type abs py3eval setwinvar tolower wildmenumode log10 spellsuggest bufloaded synconcealed nextnonblank server2client complete settabwinvar executable input wincol setmatches getftype hlID inputsave searchpair or screenrow line settabvar histadd deepcopy strpart remote_peek and eval getftime submatch screenchar winsaveview matchadd mkdir screenattr getfontname libcall reltimestr getfsize winnr invert pow getbufline byte2line soundfold repeat fnameescape tagfiles sin strwidth spellbadword trunc maparg log lispindent hostname setpos globpath remote_foreground getchar synIDattr fnamemodify cscope_connection stridx winbufnr indent min complete_add nr2char searchpairpos inputdialog values matchlist items hlexists strridx browsedir expand fmod pathshorten line2byte argc count getwinvar glob foldtextresult getreg foreground cosh matchdelete has char2nr simplify histget searchdecl iconv winrestcmd pumvisible writefile foldlevel haslocaldir keys cos matchstr foldtext histnr tan tempname getcwd byteidx getbufvar islocked escape eventhandler remote_send serverlist winrestview synstack pyeval prevnonblank readfile cindent filereadable changenr exp"
      )
    },
    illegal: /;/,
    contains: [
      hljs.NUMBER_MODE,
      {
        className: "string",
        begin: "'",
        end: "'",
        illegal: "\\n"
      },
      /*
            A double quote can start either a string or a line comment. Strings are
            ended before the end of a line by another double quote and can contain
            escaped double-quotes and post-escaped line breaks.
      
            Also, any double quote at the beginning of a line is a comment but we
            don't handle that properly at the moment: any double quote inside will
            turn them into a string. Handling it properly will require a smarter
            parser.
            */
      {
        className: "string",
        begin: /"(\\"|\n\\|[^"\n])*"/
      },
      hljs.COMMENT('"', "$"),
      {
        className: "variable",
        begin: /[bwtglsav]:[\w\d_]+/
      },
      {
        begin: [
          /\b(?:function|function!)/,
          /\s+/,
          hljs.IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title"
        },
        end: "$",
        relevance: 0,
        contains: [
          {
            className: "params",
            begin: "\\(",
            end: "\\)"
          }
        ]
      },
      {
        className: "symbol",
        begin: /<[\w-]+>/
      }
    ]
  };
}
function wasm(hljs) {
  hljs.regex;
  const BLOCK_COMMENT = hljs.COMMENT(/\(;/, /;\)/);
  BLOCK_COMMENT.contains.push("self");
  const LINE_COMMENT = hljs.COMMENT(/;;/, /$/);
  const KWS = [
    "anyfunc",
    "block",
    "br",
    "br_if",
    "br_table",
    "call",
    "call_indirect",
    "data",
    "drop",
    "elem",
    "else",
    "end",
    "export",
    "func",
    "globalThis.get",
    "globalThis.set",
    "local.get",
    "local.set",
    "local.tee",
    "get_global",
    "get_local",
    "globalThis",
    "if",
    "import",
    "local",
    "loop",
    "memory",
    "memory.grow",
    "memory.size",
    "module",
    "mut",
    "nop",
    "offset",
    "param",
    "result",
    "return",
    "select",
    "set_global",
    "set_local",
    "start",
    "table",
    "tee_local",
    "then",
    "type",
    "unreachable"
  ];
  const FUNCTION_REFERENCE = {
    begin: [
      /(?:func|call|call_indirect)/,
      /\s+/,
      /\$[^\s)]+/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    }
  };
  const ARGUMENT = {
    className: "variable",
    begin: /\$[\w_]+/
  };
  const PARENS = {
    match: /(\((?!;)|\))+/,
    className: "punctuation",
    relevance: 0
  };
  const NUMBER = {
    className: "number",
    relevance: 0,
    // borrowed from Prism, TODO: split out into variants
    match: /[+-]?\b(?:\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?|0x[\da-fA-F](?:_?[\da-fA-F])*(?:\.[\da-fA-F](?:_?[\da-fA-D])*)?(?:[pP][+-]?\d(?:_?\d)*)?)\b|\binf\b|\bnan(?::0x[\da-fA-F](?:_?[\da-fA-D])*)?\b/
  };
  const TYPE = {
    // look-ahead prevents us from gobbling up opcodes
    match: /(i32|i64|f32|f64)(?!\.)/,
    className: "type"
  };
  const MATH_OPERATIONS = {
    className: "keyword",
    // borrowed from Prism, TODO: split out into variants
    match: /\b(f32|f64|i32|i64)(?:\.(?:abs|add|and|ceil|clz|const|convert_[su]\/i(?:32|64)|copysign|ctz|demote\/f64|div(?:_[su])?|eqz?|extend_[su]\/i32|floor|ge(?:_[su])?|gt(?:_[su])?|le(?:_[su])?|load(?:(?:8|16|32)_[su])?|lt(?:_[su])?|max|min|mul|nearest|neg?|or|popcnt|promote\/f32|reinterpret\/[fi](?:32|64)|rem_[su]|rot[lr]|shl|shr_[su]|store(?:8|16|32)?|sqrt|sub|trunc(?:_[su]\/f(?:32|64))?|wrap\/i64|xor))\b/
  };
  const OFFSET_ALIGN = {
    match: [
      /(?:offset|align)/,
      /\s*/,
      /=/
    ],
    className: {
      1: "keyword",
      3: "operator"
    }
  };
  return {
    name: "WebAssembly",
    keywords: {
      $pattern: /[\w.]+/,
      keyword: KWS
    },
    contains: [
      LINE_COMMENT,
      BLOCK_COMMENT,
      OFFSET_ALIGN,
      ARGUMENT,
      PARENS,
      FUNCTION_REFERENCE,
      hljs.QUOTE_STRING_MODE,
      TYPE,
      MATH_OPERATIONS,
      NUMBER
    ]
  };
}
function xml(hljs) {
  const regex = hljs.regex;
  const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
  const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
  const XML_ENTITIES = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  };
  const XML_META_KEYWORDS = {
    begin: /\s/,
    contains: [
      {
        className: "keyword",
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  };
  const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
    begin: /\(/,
    end: /\)/
  });
  const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: "string" });
  const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" });
  const TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: "attr",
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: "string",
            endsParent: true,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [XML_ENTITIES]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [XML_ENTITIES]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: "HTML, XML",
    aliases: [
      "html",
      "xhtml",
      "rss",
      "atom",
      "xjb",
      "xsd",
      "xsl",
      "plist",
      "wsf",
      "svg"
    ],
    case_insensitive: true,
    unicodeRegex: true,
    contains: [
      {
        className: "meta",
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          XML_META_KEYWORDS,
          QUOTE_META_STRING_MODE,
          APOS_META_STRING_MODE,
          XML_META_PAR_KEYWORDS,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: "meta",
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  XML_META_KEYWORDS,
                  XML_META_PAR_KEYWORDS,
                  QUOTE_META_STRING_MODE,
                  APOS_META_STRING_MODE
                ]
              }
            ]
          }
        ]
      },
      hljs.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      XML_ENTITIES,
      // xml processing instructions
      {
        className: "meta",
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              QUOTE_META_STRING_MODE
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/
          }
        ]
      },
      {
        className: "tag",
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: "style" },
        contains: [TAG_INTERNALS],
        starts: {
          end: /<\/style>/,
          returnEnd: true,
          subLanguage: [
            "css",
            "xml"
          ]
        }
      },
      {
        className: "tag",
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: "script" },
        contains: [TAG_INTERNALS],
        starts: {
          end: /<\/script>/,
          returnEnd: true,
          subLanguage: [
            "javascript",
            "handlebars",
            "xml"
          ]
        }
      },
      // we need this for now for jSX
      {
        className: "tag",
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: "tag",
        begin: regex.concat(
          /</,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            // <tag/>
            // <tag>
            // <tag ...
            regex.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: TAG_NAME_RE,
            relevance: 0,
            starts: TAG_INTERNALS
          }
        ]
      },
      // close tag
      {
        className: "tag",
        begin: regex.concat(
          /<\//,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            />/
          ))
        ),
        contains: [
          {
            className: "name",
            begin: TAG_NAME_RE,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: true
          }
        ]
      }
    ]
  };
}
const pluginKeyword = "flowchart";
const tokenTypeInline = "inline";
const ttContainerOpen = "container_" + pluginKeyword + "_open";
const ttContainerClose = "container_" + pluginKeyword + "_close";
function flowChartPlugin(md2, config2) {
  md2.use(mdItContainer, pluginKeyword, {
    anyClass: true,
    validate: (info) => {
      return info.trim() === pluginKeyword;
    },
    render: (tokens, idx2) => {
      const token = tokens[idx2];
      var src = "";
      if (token.type === ttContainerOpen) {
        for (var i = idx2 + 1; i < tokens.length; i++) {
          const value = tokens[i];
          if (value === void 0 || value.type === ttContainerClose) {
            break;
          }
          src += value.content;
          if (value.block && value.nesting <= 0) {
            src += "\n";
          }
          value.tag = "";
          value.type = tokenTypeInline;
          value.children = [];
        }
      }
      if (token.nesting === 1) {
        return `${render(src)}`;
      } else {
        return "";
      }
    }
  });
  return md2;
}
function render(code2) {
  return `<div class="flowchart-container">
       <div class="flowchart-code" style="display:none;">${code2}</div>
       <div class="flowchart"></div>
    </div>`;
}
HighlightJS.registerLanguage("javascript", javascript$1);
HighlightJS.registerLanguage("java", java);
HighlightJS.registerLanguage("bash", bash);
HighlightJS.registerLanguage("c", c);
HighlightJS.registerLanguage("cpp", cpp);
HighlightJS.registerLanguage("csharp", csharp);
HighlightJS.registerLanguage("css", css);
HighlightJS.registerLanguage("dart", dart);
HighlightJS.registerLanguage("dos", dos);
HighlightJS.registerLanguage("glsl", glsl);
HighlightJS.registerLanguage("go", go);
HighlightJS.registerLanguage("gradle", gradle);
HighlightJS.registerLanguage("graphql", graphql);
HighlightJS.registerLanguage("json", json$1);
HighlightJS.registerLanguage("kotlin", kotlin);
HighlightJS.registerLanguage("latex", latex);
HighlightJS.registerLanguage("less", less);
HighlightJS.registerLanguage("markdown", markdown);
HighlightJS.registerLanguage("matlab", matlab);
HighlightJS.registerLanguage("nginx", nginx);
HighlightJS.registerLanguage("objectivec", objectivec);
HighlightJS.registerLanguage("pgsql", pgsql);
HighlightJS.registerLanguage("php", php);
HighlightJS.registerLanguage("powershell", powershell);
HighlightJS.registerLanguage("python", python);
HighlightJS.registerLanguage("r", r);
HighlightJS.registerLanguage("ruby", ruby);
HighlightJS.registerLanguage("rust", rust);
HighlightJS.registerLanguage("scss", scss);
HighlightJS.registerLanguage("shell", shell);
HighlightJS.registerLanguage("sql", sql);
HighlightJS.registerLanguage("swift", swift);
HighlightJS.registerLanguage("typescript", typescript);
HighlightJS.registerLanguage("vim", vim);
HighlightJS.registerLanguage("wasm", wasm);
HighlightJS.registerLanguage("xml", xml);
const HTML_ESCAPE_TEST_RE$1 = /[&<>"]/;
const HTML_ESCAPE_REPLACE_RE$1 = /[&<>"]/g;
const HTML_REPLACEMENTS$1 = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function replaceUnsafeChar$1(ch) {
  return HTML_REPLACEMENTS$1[ch];
}
function escapeHtml$2(str2) {
  if (HTML_ESCAPE_TEST_RE$1.test(str2)) {
    return str2.replace(HTML_ESCAPE_REPLACE_RE$1, replaceUnsafeChar$1);
  }
  return str2;
}
function renderAttrs(token) {
  let i, l2, result;
  if (token.type === "heading_open") {
    token.attrs = token.attrs || [];
    if (token.map) {
      const [lineNumber] = token.map;
      token.attrs.push(["linenumber", lineNumber + 1]);
    }
  }
  if (!token.attrs) {
    return "";
  }
  result = "";
  for (i = 0, l2 = token.attrs.length; i < l2; i++) {
    result += " " + escapeHtml$2(token.attrs[i][0]) + '="' + escapeHtml$2(token.attrs[i][1]) + '"';
  }
  return result;
}
function installPlugins(md2) {
  md2.use(emojiPlugin, {});
  md2.use(p, { level: 1, permalink: true, permalinkBefore: true, permalinkSymbol: "#" });
  md2.use(markdownToc, {});
  containerPlugin(md2, { hasSingleTheme: false });
  katexPlugin(md2);
  mermaidPlugin(md2);
  swiperPlugin(md2);
  flowChartPlugin(md2);
  md2.use(mkkatex);
  md2.use(taskLists);
  md2.use(qrCodePlugin);
  md2.use(excelPlugin);
  md2.use(mdPlantUML);
  md2.use(d);
  md2.renderer.renderAttrs = renderAttrs;
}
function createMarkdown() {
  const md2 = MarkdownIt({
    html: true,
    highlight: function(str2, lang) {
      lang = lang || "";
      lang = lang.toLowerCase();
      if (lang === "ketex") {
        return ketexRender(str2);
      } else if (lang === "mermaid") {
        return mermaidRender(str2);
      }
      const shikiHighlighter2 = getShikiHighlighter();
      if (shikiHighlighter2 && shikiHighlighter2.codeToHtml) {
        return shikiHighlighter2.codeToHtml(str2, { lang });
      }
      if (lang && HighlightJS && HighlightJS.getLanguage(lang)) {
        try {
          return HighlightJS.highlight(str2, { language: lang }).value;
        } catch (__) {
        }
      }
      return str2;
    }
  });
  installPlugins(md2);
  return md2;
}
const OPTIONS$2 = {
  icon: "icon-zitijiacu",
  title: "加粗",
  className: "",
  position: "left"
};
class ToolIcon {
  constructor(options) {
    options = Object.assign({}, OPTIONS$2, options);
    this.options = options;
    const { icon, title, position } = options;
    const dom = createDom("i");
    const className = options.className || "";
    let clazzName = `item iconfont ${icon}`;
    if (position === "right") {
      clazzName += " icon-right";
    }
    if (position === "left") {
      clazzName += " icon-left";
    }
    if (className) {
      clazzName = `${className} ${clazzName}`;
    }
    dom.className = clazzName;
    dom.title = title;
    dom.parent = this;
    this.dom = dom;
    this.mdEditor = null;
  }
  isEnable() {
    return this.options.enable !== false;
  }
  getDom() {
    return this.dom;
  }
  on(event, handler) {
    on$1(this.dom, event, (e2) => {
      e2 = extend$1({}, e2, { target: this });
      handler.call(this, e2);
    });
    return this;
  }
  getEditor() {
    return this.mdEditor;
  }
  getMDEditor() {
    return this.getEditor();
  }
  addTo(mdEditor) {
    if (this.mdEditor) {
      return this;
    }
    this.mdEditor = mdEditor;
    this.mdEditor.toolsDom.appendChild(this.dom);
    return this;
  }
  remove() {
    if (this.mdEditor) {
      this.mdEditor.toolsDom.removeChild(this.dom);
      this.mdEditor = null;
    }
  }
  show() {
    domShow(this.getDom());
    return this;
  }
  hide() {
    domHide(this.getDom());
    return this;
  }
  isVisible() {
    return getDomDisplay(this.getDom()) !== "none";
  }
}
const min = Math.min;
const max = Math.max;
const round = Math.round;
const createCoords = (v2) => ({
  x: v2,
  y: v2
});
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
const yAxisSides = /* @__PURE__ */ new Set(["top", "bottom"]);
function getSideAxis(placement) {
  return yAxisSides.has(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x: x2,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x2,
    right: x2 + width,
    bottom: y + height,
    x: x2,
    y
  };
}
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x: x2,
    y,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x: x2,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
const computePosition$1 = async (reference, floating, config2) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config2;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x: x2,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    var _platform$detectOverf;
    const {
      name: name2,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x: x2,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: {
        ...platform2,
        detectOverflow: (_platform$detectOverf = platform2.detectOverflow) != null ? _platform$detectOverf : detectOverflow
      },
      elements: {
        reference,
        floating
      }
    });
    x2 = nextX != null ? nextX : x2;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name2]: {
        ...middlewareData[name2],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x: x2,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x: x2,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement$1(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
const invalidOverflowDisplayValues = /* @__PURE__ */ new Set(["inline", "contents"]);
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle$1(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
}
const tableElements = /* @__PURE__ */ new Set(["table", "td", "th"]);
function isTableElement(element) {
  return tableElements.has(getNodeName(element));
}
const topLayerSelectors = [":popover-open", ":modal"];
function isTopLayer(element) {
  return topLayerSelectors.some((selector) => {
    try {
      return element.matches(selector);
    } catch (_e) {
      return false;
    }
  });
}
const transformProperties = ["transform", "translate", "scale", "rotate", "perspective"];
const willChangeValues = ["transform", "translate", "scale", "rotate", "perspective", "filter"];
const containValues = ["paint", "layout", "strict", "content"];
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css2 = isElement$1(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;
  return transformProperties.some((value) => css2[value] ? css2[value] !== "none" : false) || (css2.containerType ? css2.containerType !== "normal" : false) || !webkit && (css2.backdropFilter ? css2.backdropFilter !== "none" : false) || !webkit && (css2.filter ? css2.filter !== "none" : false) || willChangeValues.some((value) => (css2.willChange || "").includes(value)) || containValues.some((value) => (css2.contain || "").includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports)
    return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
const lastTraversableNodeNames = /* @__PURE__ */ new Set(["html", "body", "#document"]);
function isLastTraversableNode(node) {
  return lastTraversableNodeNames.has(getNodeName(node));
}
function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement$1(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list2, traverseIframes) {
  var _node$ownerDocument2;
  if (list2 === void 0) {
    list2 = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list2.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list2.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}
function getCssDimensions(element) {
  const css2 = getComputedStyle$1(element);
  let width = parseFloat(css2.width) || 0;
  let height = parseFloat(css2.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement$1(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x2 = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;
  if (!x2 || !Number.isFinite(x2)) {
    x2 = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x: x2,
    y
  };
}
const noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement$1(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x2 = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement$1(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css2 = getComputedStyle$1(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css2.paddingLeft)) * iframeScale.x;
      const top2 = iframeRect.top + (currentIFrame.clientTop + parseFloat(css2.paddingTop)) * iframeScale.y;
      x2 *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x2 += left;
      y += top2;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x: x2,
    y
  });
}
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll2) {
  const htmlRect = documentElement.getBoundingClientRect();
  const x2 = htmlRect.left + scroll2.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
  const y = htmlRect.top + scroll2.scrollTop;
  return {
    x: x2,
    y
  };
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll2 = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll2 = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll2) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll2.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll2.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}
function getClientRects(element) {
  return Array.from(element.getClientRects());
}
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll2 = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x2 = -scroll2.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll2.scrollTop;
  if (getComputedStyle$1(body).direction === "rtl") {
    x2 += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x: x2,
    y
  };
}
const SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x2 = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x2 = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  const windowScrollbarX = getWindowScrollBarX(html);
  if (windowScrollbarX <= 0) {
    const doc2 = html.ownerDocument;
    const body = doc2.body;
    const bodyStyles = getComputedStyle(body);
    const bodyMarginInline = doc2.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
    const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
    if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) {
      width -= clippingStableScrollbarWidth;
    }
  } else if (windowScrollbarX <= SCROLLBAR_MAX) {
    width += windowScrollbarX;
  }
  return {
    width,
    height,
    x: x2,
    y
  };
}
const absoluteOrFixed = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top2 = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x2 = left * scale.x;
  const y = top2 * scale.y;
  return {
    width,
    height,
    x: x2,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement$1(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement$1(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle$1(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache2) {
  const cachedResult = cache2.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el) => isElement$1(el) && getNodeName(el) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle$1(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement$1(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle$1(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && absoluteOrFixed.has(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache2.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}
function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll2 = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  function setLeftRTLScrollbarOffset() {
    offsets.x = getWindowScrollBarX(documentElement);
  }
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll2 = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      setLeftRTLScrollbarOffset();
    }
  }
  if (isFixed && !isOffsetParentAnElement && documentElement) {
    setLeftRTLScrollbarOffset();
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll2) : createCoords(0);
  const x2 = rect.left + scroll2.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll2.scrollTop - offsets.y - htmlOffset.y;
  return {
    x: x2,
    y,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element) {
  return getComputedStyle$1(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle$1(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement$1(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}
const getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element) {
  return getComputedStyle$1(element).direction === "rtl";
}
const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement: isElement$1,
  isRTL
};
const computePosition = (reference, floating, options) => {
  const cache2 = /* @__PURE__ */ new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache2
  };
  return computePosition$1(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};
function fadeOut(element, cb) {
  if (element.style.opacity && element.style.opacity > 0.05) {
    element.style.opacity = element.style.opacity - 0.05;
  } else if (element.style.opacity && element.style.opacity <= 0.1) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
      if (cb)
        cb();
    }
  } else {
    element.style.opacity = 0.9;
  }
  setTimeout(
    () => fadeOut.apply(this, [element, cb]),
    1e3 / 30
  );
}
const LIB_NAME = "mini-toastr";
const ERROR = "error";
const WARN = "warn";
const SUCCESS = "success";
const INFO = "info";
const CONTAINER_CLASS = LIB_NAME;
const NOTIFICATION_CLASS = `${LIB_NAME}__notification`;
const TITLE_CLASS = `${LIB_NAME}-notification__title`;
const ICON_CLASS = `${LIB_NAME}-notification__icon`;
const MESSAGE_CLASS = `${LIB_NAME}-notification__message`;
const ERROR_CLASS = `-${ERROR}`;
const WARN_CLASS = `-${WARN}`;
const SUCCESS_CLASS = `-${SUCCESS}`;
const INFO_CLASS = `-${INFO}`;
const DEFAULT_TIMEOUT = 3e3;
const EMPTY_STRING = "";
function flatten$1(obj, into, prefix) {
  into = into || {};
  prefix = prefix || EMPTY_STRING;
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      const prop = obj[k];
      if (prop && typeof prop === "object" && !(prop instanceof Date || prop instanceof RegExp)) {
        flatten$1(prop, into, prefix + k + " ");
      } else {
        if (into[prefix] && typeof into[prefix] === "object") {
          into[prefix][k] = prop;
        } else {
          into[prefix] = {};
          into[prefix][k] = prop;
        }
      }
    }
  }
  return into;
}
function makeCss(obj) {
  const flat = flatten$1(obj);
  let str2 = JSON.stringify(flat, null, 2);
  str2 = str2.replace(/"([^"]*)": {/g, "$1 {").replace(/"([^"]*)"/g, "$1").replace(/(\w*-?\w*): ([\w\d .#]*),?/g, "$1: $2;").replace(/},/g, "}\n").replace(/ &([.:])/g, "$1");
  str2 = str2.substr(1, str2.lastIndexOf("}") - 1);
  return str2;
}
function appendStyles(css2) {
  let head = document.head || document.getElementsByTagName("head")[0];
  let styleElem = makeNode("style");
  styleElem.id = `${LIB_NAME}-styles`;
  styleElem.type = "text/css";
  if (styleElem.styleSheet) {
    styleElem.styleSheet.cssText = css2;
  } else {
    styleElem.appendChild(document.createTextNode(css2));
  }
  head.appendChild(styleElem);
}
const config$3 = {
  types: { ERROR, WARN, SUCCESS, INFO },
  animation: fadeOut,
  timeout: DEFAULT_TIMEOUT,
  icons: {},
  appendTarget: document.body,
  node: makeNode(),
  allowHtml: false,
  style: {
    [`.${CONTAINER_CLASS}`]: {
      position: "fixed",
      "z-index": 99999,
      right: "12px",
      top: "12px"
    },
    [`.${NOTIFICATION_CLASS}`]: {
      cursor: "pointer",
      padding: "12px 18px",
      margin: "0 0 6px 0",
      "background-color": "#000",
      opacity: 0.8,
      color: "#fff",
      "border-radius": "3px",
      "box-shadow": "#3c3b3b 0 0 12px",
      width: "300px",
      [`&.${ERROR_CLASS}`]: {
        "background-color": "#D5122B"
      },
      [`&.${WARN_CLASS}`]: {
        "background-color": "#F5AA1E"
      },
      [`&.${SUCCESS_CLASS}`]: {
        "background-color": "#7AC13E"
      },
      [`&.${INFO_CLASS}`]: {
        "background-color": "#4196E1"
      },
      "&:hover": {
        opacity: 1,
        "box-shadow": "#000 0 0 12px"
      }
    },
    [`.${TITLE_CLASS}`]: {
      "font-weight": "500"
    },
    [`.${MESSAGE_CLASS}`]: {
      display: "inline-block",
      "vertical-align": "middle",
      width: "240px",
      padding: "0 12px"
    }
  }
};
function makeNode(type2 = "div") {
  return document.createElement(type2);
}
function createIcon(node, type2, config2) {
  const iconNode = makeNode(config2.icons[type2].nodeType);
  const attrs = config2.icons[type2].attrs;
  for (const k in attrs) {
    if (attrs.hasOwnProperty(k)) {
      iconNode.setAttribute(k, attrs[k]);
    }
  }
  node.appendChild(iconNode);
}
function addElem(node, text2, className, config2) {
  const elem = makeNode();
  elem.className = className;
  if (config2.allowHtml) {
    elem.innerHTML = text2;
  } else {
    elem.appendChild(document.createTextNode(text2));
  }
  node.appendChild(elem);
}
function getTypeClass(type2) {
  if (type2 === SUCCESS)
    return SUCCESS_CLASS;
  if (type2 === WARN)
    return WARN_CLASS;
  if (type2 === ERROR)
    return ERROR_CLASS;
  if (type2 === INFO)
    return INFO_CLASS;
  return EMPTY_STRING;
}
const miniToastr = {
  config: config$3,
  isInitialised: false,
  showMessage(message, title, type2, timeout, cb, overrideConf) {
    const config2 = {};
    Object.assign(config2, this.config);
    Object.assign(config2, overrideConf);
    const notificationElem = makeNode();
    notificationElem.className = `${NOTIFICATION_CLASS} ${getTypeClass(type2)}`;
    notificationElem.onclick = function() {
      config2.animation(notificationElem, null);
    };
    if (title)
      addElem(notificationElem, title, TITLE_CLASS, config2);
    if (config2.icons[type2])
      createIcon(notificationElem, type2, config2);
    if (message)
      addElem(notificationElem, message, MESSAGE_CLASS, config2);
    config2.node.insertBefore(notificationElem, config2.node.firstChild);
    setTimeout(
      () => config2.animation(notificationElem, cb),
      timeout || config2.timeout
    );
    if (cb)
      cb();
    return this;
  },
  init(aConfig) {
    const newConfig = {};
    Object.assign(newConfig, config$3);
    Object.assign(newConfig, aConfig);
    this.config = newConfig;
    const cssStr = makeCss(newConfig.style);
    appendStyles(cssStr);
    newConfig.node.id = CONTAINER_CLASS;
    newConfig.node.className = CONTAINER_CLASS;
    newConfig.appendTarget.appendChild(newConfig.node);
    Object.keys(newConfig.types).forEach(
      (v2) => {
        this[newConfig.types[v2]] = (function(message, title, timeout, cb, config2) {
          this.showMessage(message, title, newConfig.types[v2], timeout, cb, config2);
          return this;
        }).bind(this);
      }
    );
    this.isInitialised = true;
    return this;
  },
  setIcon(type2, nodeType = "i", attrs = []) {
    attrs.class = attrs.class ? attrs.class + " " + ICON_CLASS : ICON_CLASS;
    this.config.icons[type2] = { nodeType, attrs };
  }
};
let miniToastrInit = false;
function initToastr() {
  if (!miniToastrInit) {
    miniToastr.init({
      appendTarget: document.body
    });
    miniToastrInit = true;
  }
}
function getToastr() {
  return miniToastr;
}
const FULLSCREENCLASS = "mdeditor-fullscreen";
function checkFullScreen(mdEditor) {
  const container = mdEditor.getContainer();
  container.oldStyle = container.oldStyle || {};
  const oldStyle = container.oldStyle;
  const classList = container.classList;
  if (classList.contains(FULLSCREENCLASS)) {
    classList.remove(FULLSCREENCLASS);
    mdEditor.fullScreen = false;
    for (const key2 in oldStyle) {
      container.style[key2] = oldStyle[key2];
    }
    mdEditor.fire("closefullscreen", { fullScreen: mdEditor.fullScreen });
  } else {
    classList.add(FULLSCREENCLASS);
    container.oldStyle = {
      width: container.style.width,
      height: container.style.height
    };
    mdEditor.fullScreen = true;
    domSizeByWindow(container);
    mdEditor.fire("openfullscreen", { fullScreen: mdEditor.fullScreen });
  }
}
function mitt(n2) {
  return { all: n2 = n2 || /* @__PURE__ */ new Map(), on: function(t2, e2) {
    var i = n2.get(t2);
    i ? i.push(e2) : n2.set(t2, [e2]);
  }, off: function(t2, e2) {
    var i = n2.get(t2);
    i && (e2 ? i.splice(i.indexOf(e2) >>> 0, 1) : n2.set(t2, []));
  }, emit: function(t2, e2) {
    var i = n2.get(t2);
    i && i.slice().map(function(n3) {
      n3(e2);
    }), (i = n2.get("*")) && i.slice().map(function(n3) {
      n3(t2, e2);
    });
  } };
}
function dragEvent(event) {
  event.stopPropagation();
  event.preventDefault();
}
const DRAGEVENTS = ["dragstart", "dragenter", "dragend", "dragleave", "dragover"];
let uid$1 = 0;
const uuid$2 = () => {
  uid$1++;
  return uid$1;
};
function mergeArray(array1, array2) {
  for (let i = 0, len = array2.length; i < len; i++) {
    array1.push(array2[i]);
  }
  return array1;
}
function setFilePath(fileEntry, parentFileEntry) {
  const folder = parentFileEntry ? parentFileEntry.path : "/";
  if (fileEntry.isFile) {
    fileEntry.path = `${folder}${fileEntry.name}`;
  } else if (fileEntry.isDirectory) {
    fileEntry.path = `${folder}${fileEntry.name}/`;
  }
}
function readFileItems(fileItems, callback) {
  let dirs = [];
  const files = [];
  for (let i = 0, len = fileItems.length; i < len; i++) {
    const item = fileItems[i];
    const fileEntry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : item;
    fileEntry.id = uuid$2();
    files.push(fileEntry);
    if (fileEntry.isDirectory) {
      dirs.push(fileEntry);
    }
    setFilePath(fileEntry);
  }
  let fileEntryList = [], isReading = false, idx2 = 0;
  const readFiles = () => {
    idx2 = 0;
    const readFile = () => {
      if (idx2 < files.length) {
        const fileEntry = files[idx2];
        if (fileEntry.isDirectory) {
          idx2++;
          readFile();
        } else {
          fileEntry.file((file) => {
            file.path = fileEntry.path || "/";
            file.parentName = fileEntry.parentName;
            file.id = fileEntry.id;
            file.pid = fileEntry.pid;
            file.isDirectory = !!file.isDirectory;
            files[idx2] = file;
            idx2++;
            readFile();
          });
        }
      } else {
        callback(files);
      }
    };
    readFile();
  };
  const read = () => {
    if (idx2 < dirs.length) {
      const dirEntry = dirs[idx2];
      const dirRender = dirEntry.createReader();
      const readDir = () => {
        dirRender.readEntries((results) => {
          if (results.length) {
            results.forEach((fileEntry) => {
              fileEntry.id = uuid$2();
              fileEntry.pid = dirEntry.id;
              fileEntry.parentName = dirEntry.name;
              setFilePath(fileEntry, dirEntry);
            });
            mergeArray(fileEntryList, results);
            readDir();
          } else {
            idx2++;
            read();
          }
        });
      };
      readDir();
    } else {
      const tempDirs = [];
      fileEntryList.forEach((fileEntry) => {
        files.push(fileEntry);
        if (fileEntry.isDirectory) {
          tempDirs.push(fileEntry);
        }
      });
      dirs = tempDirs;
      isReading = false;
    }
  };
  const id2 = setInterval(() => {
    if (dirs.length === 0) {
      clearInterval(id2);
      readFiles();
    } else if (!isReading) {
      isReading = true;
      fileEntryList = [];
      idx2 = 0;
      read();
    }
  }, 1);
}
class FileDND {
  constructor(ele) {
    if (!ele || !(ele instanceof HTMLElement)) {
      console.error("ele is error,It should be HTMLElement instance");
      return;
    }
    this.ele = ele;
    this.files = [];
    this._bindEvents = false;
    this.emitter = mitt();
  }
  dnd(callback) {
    if (!this.ele) {
      console.error("not find ele");
      return;
    }
    if (!callback) {
      console.error("callback is null");
      return;
    }
    if (!this._bindEvents) {
      DRAGEVENTS.forEach((eventName) => {
        this.ele.addEventListener(eventName, dragEvent);
      });
      const dropEvent = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const df = event.dataTransfer;
        const items = df.items;
        this.emitter.emit("readstart", this);
        readFileItems(items, (files) => {
          const callback2 = this.dndBackCall.bind(this);
          this.files = files;
          callback2(files.filter((file) => {
            return file instanceof File;
          }));
          this.emitter.emit("readend", this);
        });
      };
      this.dropEvent = dropEvent;
      this._bindEvents = true;
      this.ele.addEventListener("drop", dropEvent);
    }
    this.dndBackCall = callback;
  }
  dispose() {
    if (this._bindEvents) {
      DRAGEVENTS.forEach((eventName) => {
        this.ele.removeEventListener(eventName, dragEvent);
      });
      this.ele.removeEventListener("drop", this.dropEvent);
    }
    this.ele = null;
    this.files = null;
    this.emitter.all.clear();
    return this;
  }
  toTree() {
    const files = this.files;
    const fileMap = {};
    files.forEach((file) => {
      const { id: id2, path, name: name2, parentName } = file;
      if (!fileMap[id2]) {
        fileMap[id2] = {
          id: id2,
          name: name2,
          label: name2,
          path,
          parentName,
          children: [],
          isDirectory: file.isDirectory
        };
      }
    });
    files.forEach((file) => {
      const { pid, id: id2 } = file;
      if (fileMap[pid]) {
        fileMap[pid].children.push(fileMap[id2]);
      }
    });
    for (const id2 in fileMap) {
      const children = fileMap[id2].children;
      const dirs = [], files2 = [];
      children.forEach((child2) => {
        if (child2.isDirectory) {
          dirs.push(child2);
        } else {
          files2.push(child2);
        }
      });
      fileMap[id2].children = mergeArray(dirs, files2);
    }
    return Object.values(fileMap).filter((d2) => {
      return !d2.parentName;
    });
  }
  toFolderTree() {
    const nodes = this.toTree() || [];
    let text2 = "";
    const loopNode = (node, level = 1) => {
      const { name: name2 } = node;
      let prefix = "├─ ";
      if (level > 1) {
        const array = [];
        while (array.length < level - 1) {
          array.push("| ");
        }
        prefix = array.join("").toString() + prefix;
      }
      text2 += `${prefix}${name2} 
`;
      const children = node.children;
      if (children && children.length) {
        level++;
        children.forEach((child2) => {
          loopNode(child2, level);
        });
      }
    };
    return nodes.map((node) => {
      text2 = "";
      loopNode(node);
      return text2;
    }).join("").toString();
  }
  clear() {
    this.files = [];
    return this;
  }
  on(eventName, handler) {
    this.emitter.on(eventName, handler);
    return this;
  }
  off(eventName, handler) {
    this.emitter.off(eventName, handler);
    return this;
  }
}
const INFOBOX = `
::: info

This is an info box.

:::

`;
const TIPBOX = `
::: tip

This is a tip.

:::

`;
const WARNBOX = `
::: warning

This is a warning.

:::

`;
const DANGERBOX = `
::: danger

This is a dangerous warning.

:::

`;
const MERMAID = `
::: mermaid

flowchart LR
    A[Hard] -->|Text| B(Round)
    B --> C{Decision}
    C -->|One| D[Result 1]
    C -->|Two| E[Result 2]
:::

`;
const KATEX = `
$\\sqrt{3x-1}+(1+x)^2$

`;
const JSCODE = `
function add(a,b){
    return a + b;
}
console.log(add(1,2));
`;
const TSCODE = `
function add(a:number,b:number):number{
    return a + b;
}
console.log(add(1,2));
`;
const CODEGROUP = `::: code-group

\`\`\`js [add.js]${JSCODE}\`\`\`

\`\`\`ts [add.ts]${TSCODE}\`\`\`
:::`;
const SWIPER = `
::: swiper


<div class="swiper">
  <!-- Additional required wrapper -->
  <div class="swiper-wrapper">

    <!-- Slides -->
    <div class="swiper-slide">
       <img src="//mdpress.glicon.design/p/files/2023-09-19/_97Umejwi3DfuOlGYg7iE.jpg"/>
    </div>
    <div class="swiper-slide">
      <img src="//mdpress.glicon.design/p/files/2023-09-19/Viaaga99bu_9v4OGJ-Idk.jpg"/>
   </div>
    <div class="swiper-slide">
      <img src="//mdpress.glicon.design/p/files/2023-09-19/ttkWmxXd0mjrhQp1k195D.jpg"/>
   </div>
    <div class="swiper-slide">
      <img src="//mdpress.glicon.design/p/files/2023-09-19/GmZdx5wpsgF-wcl1AO2ec.jpg"/>
   </div>
    <div class="swiper-slide">
      <img src="//mdpress.glicon.design/p/files/2023-09-19/87hQUHXwwa77rhPaWQORV.jpg"/>
   </div>
  </div>
  <!-- If we need pagination -->
  <div class="swiper-pagination"></div>

  <!-- If we need navigation buttons -->
  <!--<div class="swiper-button-prev"></div>-->
  <!--<div class="swiper-button-next"></div>-->

  <!-- If we need scrollbar -->
  <!-- <div class="swiper-scrollbar"></div> -->
</div>
:::
`;
const TASKLIST = `
- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media
`;
const FLOWCHART = `
::: flowchart

st=>start: Start:>http://www.google.com[blank]
e=>end:>http://www.google.com
op1=>operation: My Operation
sub1=>subroutine: My Subroutine
cond=>condition: Yes
or No?:>http://www.google.com
io=>inputoutput: catch something...
para=>parallel: parallel tasks

st->op1->cond
cond(yes)->io->e
cond(no)->para
para(path1, bottom)->sub1(right)->op1
para(path2, top)->op1

::: 
`;
function getEditors(iconDom) {
  const mdEditor = iconDom.getMDEditor();
  return [mdEditor, mdEditor.getEditor()];
}
const validateSelect = (result) => {
  if (result && result.length) {
    return true;
  }
  return false;
};
const hTitle = function(mdEditor, text2) {
  const result = mdEditor.getCurrentRange();
  if (!validateSelect(result)) {
    return;
  }
  const editor = mdEditor.getEditor();
  const [range2] = result;
  editor.executeEdits("", [
    {
      range: range2,
      text: text2
    }
  ]);
};
const tableClick = function(mdEditor, text2) {
  const result = mdEditor.getCurrentRange();
  if (!validateSelect(result)) {
    return;
  }
  const editor = mdEditor.getEditor();
  const [range2] = result;
  editor.executeEdits("", [
    {
      range: range2,
      text: text2
    }
  ]);
};
const codeClick = function(mdEditor, text2) {
  const result = mdEditor.getCurrentRange();
  if (!validateSelect(result)) {
    return;
  }
  const editor = mdEditor.getEditor();
  const [range2] = result;
  editor.executeEdits("", [
    {
      range: range2,
      text: text2
    }
  ]);
};
const containerClick = function(mdEditor, text2) {
  const result = mdEditor.getCurrentRange();
  if (!validateSelect(result)) {
    return;
  }
  const editor = mdEditor.getEditor();
  const [range2] = result;
  editor.executeEdits("", [
    {
      range: range2,
      text: text2
    }
  ]);
};
function updateDomPosition(themeIconDom, themeDom) {
  computePosition(themeIconDom, themeDom, {
    placement: "bottom"
  }).then(({ x: x2, y }) => {
    Object.assign(themeDom.style, {
      left: `${x2}px`,
      top: `${y}px`
    });
  });
}
function rangeEqual(range1, range2) {
  return range1.endColumn === range2.endColumn && range1.startColumn === range2.startColumn && range1.startLineNumber === range2.startLineNumber && range1.endLineNumber === range2.endLineNumber;
}
const ICONS = [
  {
    name: "icon-zitijiacu",
    title: "加粗",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getSelectRange();
      if (!validateSelect(result)) {
        return;
      }
      const [starRange, endRange] = result;
      if (rangeEqual(starRange, endRange)) {
        return;
      }
      editor.executeEdits("", [
        {
          range: starRange,
          text: "**"
        },
        {
          range: endRange,
          text: "**"
        }
      ]);
    }
  },
  {
    name: "icon-strikethrough",
    title: "删除线",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getSelectRange();
      if (!validateSelect(result)) {
        return;
      }
      const [starRange, endRange] = result;
      if (rangeEqual(starRange, endRange)) {
        return;
      }
      editor.executeEdits("", [
        {
          range: starRange,
          text: "~~"
        },
        {
          range: endRange,
          text: "~~"
        }
      ]);
    }
  },
  {
    name: "icon-italic",
    title: "斜体",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getSelectRange();
      if (!validateSelect(result)) {
        return;
      }
      const [starRange, endRange] = result;
      if (rangeEqual(starRange, endRange)) {
        return;
      }
      editor.executeEdits("", [
        {
          range: starRange,
          text: "*"
        },
        {
          range: endRange,
          text: "*"
        }
      ]);
    }
  },
  {
    name: "icon-yinyong",
    title: "引用",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "> hello\n"
        }
      ]);
    }
  },
  {
    name: "icon-daxie",
    title: "大写",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getSelectText();
      if (!validateSelect(result)) {
        return;
      }
      const [range2, text2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: text2.toUpperCase()
        }
      ]);
    }
  },
  {
    name: "icon-xiaoxie",
    title: "小写",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getSelectText();
      if (!validateSelect(result)) {
        return;
      }
      const [range2, text2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: text2.toLowerCase()
        }
      ]);
    }
  },
  {
    name: "icon-h11",
    title: "标题1",
    enable: false,
    click: function() {
      hTitle(this.getMDEditor(), "# ");
    }
  },
  {
    name: "icon-h",
    title: "标题2",
    enable: false,
    click: function() {
      hTitle(this.getMDEditor(), "## ");
    }
  },
  {
    name: "icon-h3",
    title: "标题3",
    enable: false,
    click: function() {
      hTitle(this.getMDEditor(), "### ");
    }
  },
  {
    name: "icon-h2",
    title: "标题4",
    enable: false,
    click: function() {
      hTitle(this.getMDEditor(), "#### ");
    }
  },
  // {
  //     name: 'icon-h1',
  //     title: '标题5'
  // },
  // {
  //     name: 'icon-h6',
  //     title: '标题6'
  // },
  {
    name: "icon-31liebiao",
    title: "无序列表",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "- item1  \n- item2  "
        }
      ]);
    }
  },
  {
    name: "icon-orderedList",
    title: "有序列表",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "1.  \n2. "
        }
      ]);
    }
  },
  {
    name: "icon-wodezhuanti",
    title: "任务列表",
    // enable: false,
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: TASKLIST
        }
      ]);
    }
  },
  {
    name: "icon-hr",
    title: "横线",
    // enable: false,
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "------------\n"
        }
      ]);
    }
  },
  {
    name: "icon-lianjie",
    title: "插入链接",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "[mdpress-editor](https://github.com/deyihu/mdpress-editor)"
        }
      ]);
    }
  },
  {
    name: "icon-tupiantianjia",
    title: "插入图片",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "![image](https://markdown.com.cn/hero.png)"
        }
      ]);
    }
  },
  {
    name: "icon-wangyelianjie",
    title: "插入iframe",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: '<iframe src="https://markdown.com.cn/cheat-sheet.html#%E6%80%BB%E8%A7%88"></iframe>'
        }
      ]);
    }
  },
  {
    name: "icon-biaodanzujian-biaoge",
    title: "表格",
    click: function() {
      const [mdEditor] = getEditors(this);
      const miniToastr2 = getToastr();
      if (mdEditor.dialog) {
        miniToastr2.warn("检测到你已经打开了一个对话框请关闭当前的才可以使用", "警告", 3e3);
        return;
      }
      const dialog = createDialog();
      mdEditor.dom.appendChild(dialog);
      dialog.show();
      mdEditor.dialog = dialog;
      const cancelBtn = dialog.querySelector("#table-btn-cancel");
      const confirmBtn = dialog.querySelector("#table-btn-confirm");
      on$1(cancelBtn, "click", () => {
        dialog.close();
        mdEditor.dialog = null;
        mdEditor.dom.removeChild(dialog);
      });
      on$1(confirmBtn, "click", () => {
        const rowsDom = dialog.querySelector("#table-rows");
        const colsDom = dialog.querySelector("#table-cols");
        let rows = rowsDom.value, cols = colsDom.value;
        rows = Math.abs(rows);
        cols = Math.abs(cols);
        if (rows === 0 || cols === 0) {
          miniToastr2.warn("表格行数或者列数为0", "警告", 3e3);
          return;
        }
        const text2 = getTableMdText(rows, cols);
        tableClick(mdEditor, text2);
        dialog.close();
        mdEditor.dialog = null;
      });
    }
  },
  {
    name: "icon-code",
    title: "插入代码",
    click: function() {
      codeClick(this.getMDEditor(), "```\n\n```\n");
    }
  },
  {
    name: "icon-js",
    title: "插入js code",
    click: function() {
      codeClick(this.getMDEditor(), "```js" + JSCODE + "```\n");
    }
  },
  {
    name: "icon-Artboard",
    title: "插入ts code",
    click: function() {
      codeClick(this.getMDEditor(), "```ts" + TSCODE + "```\n");
    }
  },
  {
    name: "icon-bootstrap_tabs",
    title: "插入代码组",
    click: function() {
      containerClick(this.getMDEditor(), CODEGROUP);
    }
  },
  {
    name: "icon-badge",
    title: "插入Badge",
    click: function() {
      containerClick(this.getMDEditor(), '<span class="VPBadge tip">^1.9.0</span>');
    }
  },
  {
    name: "icon-093info",
    title: "信息容器",
    click: function() {
      containerClick(this.getMDEditor(), INFOBOX);
    }
  },
  {
    name: "icon-yiwancheng",
    title: "提示容器",
    click: function() {
      containerClick(this.getMDEditor(), TIPBOX);
    }
  },
  {
    name: "icon-jinggao",
    title: "警告容器",
    click: function() {
      containerClick(this.getMDEditor(), WARNBOX);
    }
  },
  {
    name: "icon-cuowukongxin",
    title: "危险容器",
    click: function() {
      containerClick(this.getMDEditor(), DANGERBOX);
    }
  },
  {
    name: "icon-xuekegongshiku_Char-rm-uk",
    title: "Katex",
    click: function() {
      containerClick(this.getMDEditor(), KATEX);
    }
  },
  {
    name: "icon-liuchengtu",
    title: "mermaid",
    click: function() {
      containerClick(this.getMDEditor(), MERMAID);
    }
  },
  {
    name: "icon-flowChart",
    title: "flowchart",
    click: function() {
      containerClick(this.getMDEditor(), FLOWCHART);
    }
  },
  {
    name: "icon-swiper",
    title: "swiper",
    click: function() {
      containerClick(this.getMDEditor(), SWIPER);
    }
  },
  {
    name: "icon-excel",
    title: "excel",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "\nexcel:https://sheetjs.com/pres.numbers\n"
        }
      ]);
    }
  },
  {
    name: "icon-erweima",
    title: "二维码",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "\nqrcode:https://developer.mozilla.org/zh-CN/\n"
        }
      ]);
    }
  },
  {
    name: "icon-shijian",
    title: "时间",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: dayjs().format("YYYY-MM-DD HH:mm:ss")
        }
      ]);
    }
  },
  {
    name: "icon-emoji",
    title: "github emoji",
    click: function() {
      const mdEditor = this.getMDEditor();
      const emojiDom = mdEditor.emojiDom;
      const iconDom = this.getDom();
      const display = checkDomDisplay(emojiDom);
      setTimeout(() => {
        setDomDisplay(emojiDom, display);
        updateDomPosition(iconDom, emojiDom);
      }, 32);
    }
  },
  {
    name: "icon-mulu",
    title: "(toc)table of content",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "\n[[toc]]\n"
        }
      ]);
    }
  },
  {
    name: "icon-naotu",
    title: "markmap",
    enable: false,
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "\n[[markmap]]\n"
        }
      ]);
    }
  },
  {
    name: "icon-daoruwenjian",
    title: "include a markdown file",
    click: function() {
      const [mdEditor, editor] = getEditors(this);
      const result = mdEditor.getCurrentRange();
      if (!validateSelect(result)) {
        return;
      }
      const [range2] = result;
      editor.executeEdits("", [
        {
          range: range2,
          text: "\ninclude://mdpress.glicon.design/p/files/2023-09-03/t83dlckX52cWiNtzBHkOL.md\n"
        }
      ]);
    }
  },
  {
    name: "icon-m-geshihuawenzi",
    title: "格式化文档",
    enable: false,
    click: function() {
    }
  },
  {
    name: "icon-icon-48-mulushu",
    title: "文件夹目录树",
    // enable: false,
    click: function() {
      const [mdEditor] = getEditors(this);
      const miniToastr2 = getToastr();
      if (mdEditor.dialog) {
        miniToastr2.warn("检测到你已经打开了一个对话框请关闭当前的才可以使用", "警告", 3e3);
        return;
      }
      const dialog = createFolderTreeDialog();
      mdEditor.dom.appendChild(dialog);
      dialog.show();
      mdEditor.dialog = dialog;
      const cancelBtn = dialog.querySelector("#table-btn-cancel");
      let fileDND;
      const close = () => {
        dialog.close();
        mdEditor.dialog = null;
        mdEditor.dom.removeChild(dialog);
        fileDND && fileDND.dispose();
      };
      on$1(cancelBtn, "click", close);
      const fileContainer = dialog.querySelector(".file-dnd-container");
      if (fileContainer) {
        fileDND = new FileDND(fileContainer);
        fileDND.dnd((files) => {
          const text2 = fileDND.toFolderTree();
          codeClick(this.getMDEditor(), "```\n" + text2 + "```\n");
          close();
        });
      }
    }
  }
];
function checkDomDisplay(dom) {
  let display = getDomDisplay(dom);
  if (display === "none") {
    display = "block";
  } else if (display === "block") {
    display = "none";
  } else {
    display = "block";
  }
  return display;
}
const ICONS_RIGHT = [
  {
    name: "icon-mulu1",
    title: "目录",
    position: "right",
    click: function() {
      const mdEditor = this.getMDEditor();
      mdEditor.tocOpen = !mdEditor.tocOpen;
      mdEditor._checkTocState();
    }
  },
  {
    name: "icon-pifuzhuti-xianxing",
    title: "主题",
    position: "right",
    click: function() {
      const mdEditor = this.getMDEditor();
      const themeDom = mdEditor.themeDom;
      const iconDom = this.getDom();
      const display = checkDomDisplay(themeDom);
      setTimeout(() => {
        setDomDisplay(themeDom, display);
        updateDomPosition(iconDom, themeDom);
      }, 32);
    }
  },
  {
    name: "icon-pos_nav_icon_implements",
    title: "export file",
    position: "right",
    click: function() {
      const mdEditor = this.getMDEditor();
      const exportFileDom = mdEditor.exportFileDom;
      const iconDom = this.getDom();
      const display = checkDomDisplay(exportFileDom);
      setTimeout(() => {
        setDomDisplay(exportFileDom, display);
        updateDomPosition(iconDom, exportFileDom);
      }, 32);
    }
  },
  {
    name: "icon-yulan",
    title: "预览",
    position: "right",
    click: function() {
      const mdEditor = this.getMDEditor();
      mdEditor.preview = !mdEditor.preview;
      mdEditor._checkPreviewState();
    }
  },
  {
    name: "icon-quanping",
    title: "全屏",
    position: "right",
    click: function() {
      const mdEditor = this.getMDEditor();
      checkFullScreen(mdEditor);
    }
  },
  {
    name: "icon-heisemoshi",
    title: "暗黑模式",
    position: "right",
    click: function() {
      const mdEditor = this.getMDEditor();
      mdEditor.dark = !mdEditor.dark;
      mdEditor._checkDark();
    }
  },
  {
    name: "icon-github",
    title: "github",
    position: "right",
    click: function() {
      window.open("https://github.com/deyihu/mdpress-editor");
    }
  }
];
function createDefaultIcons(mdEditor) {
  const icons = ICONS.concat(ICONS_RIGHT.reverse()).map((d2) => {
    return new ToolIcon(Object.assign(d2, { icon: d2.name }));
  });
  icons.forEach((icon) => {
    if (!icon.isEnable()) {
      return;
    }
    if (icon.options.click) {
      icon.on("click", icon.options.click);
    } else {
      console.warn(`not find click event for icon:${icon.options.title}`);
    }
    icon.addTo(mdEditor);
  });
}
const Eventable = (Base2) => class extends Base2 {
  /**
   * Register a handler function to be called whenever this event is fired.
   *
   * @param {String} eventsOn                  - event types to register, seperated by space if more than one.
   * @param {Function} handler                 - handler function to be called
   * @param {Object} [context=null]            - the context of the handler
   * @return {Any} this
   * @function Eventable.on
   * @example
   * foo.on('mousedown mousemove mouseup', onMouseEvent, foo);
   */
  on(eventsOn, handler, context) {
    if (!eventsOn) {
      return this;
    }
    if (!isString(eventsOn)) {
      return this._switch("on", eventsOn, handler);
    }
    if (!handler) {
      return this;
    }
    if (!this._eventMap) {
      this._eventMap = {};
    }
    const eventTypes = eventsOn.toLowerCase().split(" ");
    let evtType;
    if (!context) {
      context = this;
    }
    let handlerChain;
    for (let ii = 0, ll = eventTypes.length; ii < ll; ii++) {
      evtType = eventTypes[ii];
      handlerChain = this._eventMap[evtType];
      if (!handlerChain) {
        handlerChain = [];
        this._eventMap[evtType] = handlerChain;
      }
      const l2 = handlerChain.length;
      if (l2 > 0) {
        for (let i = 0; i < l2; i++) {
          if (handler === handlerChain[i].handler && handlerChain[i].context === context) {
            console.warn(this, `find '${eventsOn}' handler:`, handler, " The old listener function will be removed");
            return this;
          }
        }
      }
      handlerChain.push({
        handler,
        context
      });
    }
    return this;
  }
  /**
   * Alias for [on]{@link Eventable.on}
   *
   * @param {String} eventTypes     - event types to register, seperated by space if more than one.
   * @param {Function} handler                 - handler function to be called
   * @param {Object} [context=null]            - the context of the handler
   * @return {} this
   * @function Eventable.addEventListener
   */
  addEventListener() {
    return this.on.apply(this, arguments);
  }
  /**
   * Same as on, except the listener will only get fired once and then removed.
   *
   * @param {String} eventTypes                - event types to register, seperated by space if more than one.
   * @param {Function} handler                 - listener handler
   * @param {Object} [context=null]            - the context of the handler
   * @return {} this
   * @example
   * foo.once('mousedown mousemove mouseup', onMouseEvent, foo);
   * @function Eventable.once
   */
  once(eventTypes, handler, context) {
    if (!isString(eventTypes)) {
      const once = {};
      for (const p2 in eventTypes) {
        if (eventTypes.hasOwnProperty(p2)) {
          once[p2] = this._wrapOnceHandler(p2, eventTypes[p2], context);
        }
      }
      return this._switch("on", once);
    }
    const evetTypes = eventTypes.split(" ");
    for (let i = 0, l2 = evetTypes.length; i < l2; i++) {
      this.on(evetTypes[i], this._wrapOnceHandler(evetTypes[i], handler, context));
    }
    return this;
  }
  /**
   * Unregister the event handler for the specified event types.
   *
   * @param {String} eventsOff                - event types to unregister, seperated by space if more than one.
   * @param {Function} handler                - listener handler
   * @param {Object} [context=null]           - the context of the handler
   * @return {} this
   * @example
   * foo.off('mousedown mousemove mouseup', onMouseEvent, foo);
   * @function Eventable.off
   */
  off(eventsOff, handler, context) {
    if (!this._eventMap || !eventsOff) {
      return this;
    }
    if (!isString(eventsOff)) {
      return this._switch("off", eventsOff, handler);
    }
    if (!handler) {
      return this;
    }
    const eventTypes = eventsOff.split(" ");
    let eventType, listeners, wrapKey;
    if (!context) {
      context = this;
    }
    for (let j = 0, jl = eventTypes.length; j < jl; j++) {
      eventType = eventTypes[j].toLowerCase();
      wrapKey = "Z__" + eventType;
      listeners = this._eventMap[eventType];
      if (!listeners) {
        return this;
      }
      for (let i = listeners.length - 1; i >= 0; i--) {
        const listener = listeners[i];
        if ((handler === listener.handler || handler === listener.handler[wrapKey]) && listener.context === context) {
          delete listener.handler[wrapKey];
          listeners.splice(i, 1);
        }
      }
      if (!listeners.length) {
        delete this._eventMap[eventType];
      }
    }
    return this;
  }
  /**
   * Alias for [off]{@link Eventable.off}
   *
   * @param {String} eventTypes    - event types to unregister, seperated by space if more than one.
   * @param {Function} handler                - listener handler
   * @param {Object} [context=null]           - the context of the handler
   * @return {} this
   * @function Eventable.removeEventListener
   */
  removeEventListener() {
    return this.off.apply(this, arguments);
  }
  /**
   * Returns listener's count registered for the event type.
   *
   * @param {String} eventType        - an event type
   * @param {Function} [hanlder=null] - listener function
   * @param {Object} [context=null]   - the context of the handler
   * @return {Number}
   * @function Eventable.listens
   */
  listens(eventType, handler, context) {
    if (!this._eventMap || !isString(eventType)) {
      return 0;
    }
    const handlerChain = this._eventMap[eventType.toLowerCase()];
    if (!handlerChain || !handlerChain.length) {
      return 0;
    }
    if (!handler) {
      return handlerChain.length;
    }
    for (let i = 0, len = handlerChain.length; i < len; i++) {
      if (handler === handlerChain[i].handler && (isNil(context) || handlerChain[i].context === context)) {
        return 1;
      }
    }
    return 0;
  }
  /**
   * Get all the listening event types
   *
   * @returns {String[]} events
   * @function Eventable.getListeningEvents
   */
  getListeningEvents() {
    if (!this._eventMap) {
      return [];
    }
    return Object.keys(this._eventMap);
  }
  /**
   * Copy all the event listener to the target object
   * @param {Object} target - target object to copy to.
   * @return {} this
   * @function Eventable.copyEventListeners
   */
  copyEventListeners(target) {
    const eventMap = target._eventMap;
    if (!eventMap) {
      return this;
    }
    let handlerChain;
    for (const eventType in eventMap) {
      handlerChain = eventMap[eventType];
      for (let i = 0, len = handlerChain.length; i < len; i++) {
        this.on(eventType, handlerChain[i].handler, handlerChain[i].context);
      }
    }
    return this;
  }
  /**
   * Fire an event, causing all handlers for that event name to run.
   *
   * @param  {String} eventType - an event type to fire
   * @param  {Object} param     - parameters for the listener function.
   * @return {} this
   * @function Eventable.fire
   */
  fire() {
    if (this._eventParent) {
      return this._eventParent.fire.apply(this._eventParent, arguments);
    }
    return this._fire.apply(this, arguments);
  }
  _wrapOnceHandler(evtType, handler, context) {
    const me = this;
    const key2 = "Z__" + evtType;
    let called = false;
    const fn = function onceHandler() {
      if (called) {
        return;
      }
      delete fn[key2];
      called = true;
      if (context) {
        handler.apply(context, arguments);
      } else {
        handler.apply(this, arguments);
      }
      me.off(evtType, onceHandler, this);
    };
    fn[key2] = handler;
    return fn;
  }
  _switch(to, eventKeys, context) {
    for (const p2 in eventKeys) {
      if (eventKeys.hasOwnProperty(p2)) {
        this[to](p2, eventKeys[p2], context);
      }
    }
    return this;
  }
  _clearListeners(eventType) {
    if (!this._eventMap || !isString(eventType)) {
      return;
    }
    const handlerChain = this._eventMap[eventType.toLowerCase()];
    if (!handlerChain) {
      return;
    }
    this._eventMap[eventType] = null;
  }
  _clearAllListeners() {
    this._eventMap = null;
  }
  /**
   * Set a event parent to handle all the events
   * @param {Any} parent - event parent
   * @return {Any} this
   * @private
   * @function Eventable._setEventParent
   */
  _setEventParent(parent) {
    this._eventParent = parent;
    return this;
  }
  _setEventTarget(target) {
    this._eventTarget = target;
    return this;
  }
  _fire(eventType, param) {
    if (!this._eventMap) {
      return this;
    }
    const handlerChain = this._eventMap[eventType.toLowerCase()];
    if (!handlerChain) {
      return this;
    }
    if (!param) {
      param = {};
    }
    param["type"] = eventType;
    param["target"] = this._eventTarget || this;
    const queue = handlerChain.slice(0);
    let context, bubble, passed;
    for (let i = 0, len = queue.length; i < len; i++) {
      if (!queue[i]) {
        continue;
      }
      context = queue[i].context;
      bubble = true;
      passed = extend$1({}, param);
      if (context) {
        bubble = queue[i].handler.call(context, passed);
      } else {
        bubble = queue[i].handler(passed);
      }
      if (bubble === false) {
        if (param["domEvent"]) {
          stopPropagation(param["domEvent"]);
        }
      }
    }
    return this;
  }
};
function checkIframe(dom) {
  const iframes = dom.querySelectorAll("iframe");
  if (!iframes.length) {
    return;
  }
  iframes.forEach((iframe) => {
    if (iframe.dataset.linked) {
      return;
    }
    const parentNode = iframe.parentNode;
    const link2 = createLinkEle(iframe.src);
    parentNode.insertBefore(link2, iframe);
    iframe.dataset.linked = true;
  });
}
function createLinkEle(url) {
  const a2 = createDom("a");
  a2.href = url;
  a2.target = "_blank";
  a2.textContent = "Open in New Tab";
  return a2;
}
const OPTIONS$1 = {
  requestCount: 5
};
function getHost(url) {
  if (typeof document !== "undefined") {
    const a2 = document.createElement("a");
    a2.href = url;
    return a2.host;
  }
  const urlArray = url.split("//");
  if (urlArray.length < 2) {
    return null;
  }
  let host = urlArray[1];
  host = host.substring(0, host.indexOf("/"));
  return host;
}
let uid = 0;
function uuid$1() {
  uid++;
  return uid;
}
class FetchScheduler {
  constructor(options) {
    options = Object.assign({}, OPTIONS$1, options);
    this.options = options;
    this.hosts = {};
  }
  _checkHost(host) {
    if (!this.hosts[host]) {
      this.hosts[host] = {
        waitQueue: [],
        runingQueue: [],
        requestCount: 0
      };
    }
    return this;
  }
  _removePromise(promise) {
    const { host } = promise;
    if (!this.hosts[host]) {
      return this;
    }
    const { waitQueue, runingQueue } = this.hosts[host];
    let index = waitQueue.indexOf(promise);
    if (index > -1) {
      waitQueue.splice(index, 1);
    }
    index = runingQueue.indexOf(promise);
    if (index > -1) {
      runingQueue.splice(index, 1);
    }
    if (waitQueue.length === 0) {
      return this;
    }
    const p2 = waitQueue[0];
    waitQueue.splice(0, 1);
    runingQueue.push(p2);
    p2.start();
    p2.isRuning = true;
    return this;
  }
  _createPromise(url, host, options) {
    const controller = new AbortController();
    const signal = controller.signal;
    options.signal = signal;
    const uid2 = uuid$1();
    let tResolve, tReject;
    const start = () => {
      fetch(url, options).then((res) => {
        promise.isRuning = false;
        if (this.hosts[host]) {
          this.hosts[host].requestCount++;
        }
        this._removePromise(promise);
        if (tResolve && res.ok) {
          tResolve(res);
        } else if (tReject) {
          tReject(res);
        }
      }).catch((err) => {
        promise.isRuning = false;
        this._removePromise(promise);
        if (tReject) {
          tReject(err);
        }
      });
    };
    const cancel = () => {
      if (promise.isRuning) {
        controller.abort();
      }
      this._removePromise(promise);
    };
    const promise = new Promise((resolve, reject) => {
      tResolve = resolve;
      tReject = reject;
    });
    promise.cancel = cancel;
    promise.start = start;
    promise.remove = cancel;
    promise.uid = uid2;
    promise.host = host;
    return promise;
  }
  createFetch(url, options = {}) {
    const host = getHost(url);
    if (!host) {
      console.error("not find host from", url);
      return this;
    }
    this._checkHost(host);
    const promise = this._createPromise(url, host, options);
    const { waitQueue, runingQueue } = this.hosts[host];
    if (runingQueue.length < this.options.requestCount) {
      runingQueue.push(promise);
      promise.start();
      promise.isRuning = true;
      return promise;
    }
    waitQueue.push(promise);
    return promise;
  }
  removeFetch(promise) {
    return this._removePromise(promise);
  }
  getCurrentInfo() {
    const hosts = this.hosts;
    const result = [];
    for (const host in hosts) {
      const info = {
        host,
        waitCount: hosts[host].waitQueue.length,
        requestCount: hosts[host].requestCount
      };
      result.push(info);
    }
    return result;
  }
}
const fetchScheduler = new FetchScheduler({
  requestCount: 6
  // Concurrent number of fetch requests
});
const INCLUDE_FLAG = "include:";
function checkInclude(text2, callback) {
  if (text2.indexOf(INCLUDE_FLAG) === -1) {
    callback(text2, false);
    return;
  }
  const array = text2.split(INCLUDE_FLAG);
  const texts = [];
  for (let i = 1, len = array.length; i < len; i++) {
    const line = array[i];
    let url = "";
    for (let j = 0, len1 = line.length; j < len1; j++) {
      const char = line[j];
      if (char === " " || char === "\n" || char === "\r") {
        texts.push({
          start: 0,
          end: j,
          url,
          line
        });
        break;
      }
      url += char;
    }
  }
  let idx2 = 0;
  const end2 = () => {
    idx2++;
    if (idx2 === texts.length) {
      texts.forEach((singleText) => {
        const { text: text3, end: end3, url } = singleText;
        if (!text3) {
          singleText.line = `<p style="color:red">fetch snip file error,url:${url}</p>` + singleText.line.substring(end3, Infinity);
        } else {
          singleText.line = `${text3}
` + singleText.line.substring(end3, Infinity);
        }
      });
      let value = array[0];
      texts.forEach((singleText) => {
        value += singleText.line;
      });
      callback(value, true);
    }
  };
  texts.forEach((singleText) => {
    const promise = fetchScheduler.createFetch(singleText.url, {
      // ...
    });
    promise.then((res) => res.text()).then((text3) => {
      singleText.text = text3;
      end2();
    }).catch((err) => {
      console.error(err);
      end2();
    });
  });
}
function getTitleDom(dom, title, lineNumber) {
  lineNumber += "";
  const nodes = dom.children;
  for (let i = 0, len = nodes.length; i < len; i++) {
    const node = nodes[i];
    if (node.dataset.lineNumber === lineNumber) {
      return {
        node
      };
    }
  }
  title = trimTitle(title);
  title = title.replaceAll(" ", "-");
  title = title.toLowerCase();
  title = encodeURIComponent(title);
  for (let i = 0, len = nodes.length; i < len; i++) {
    const node = nodes[i];
    if (node.id === title) {
      return {
        node
      };
    }
  }
}
function calScroll(editor, dom) {
  const ranges = editor.getVisibleRanges();
  if (!ranges.length) {
    return;
  }
  const range2 = ranges[0];
  const model = editor.getModel();
  const { startLineNumber } = range2;
  let lineNumber = startLineNumber;
  let title;
  let offsetLines = 0;
  const headContents = formatHeadContents(dom);
  while (lineNumber >= 1) {
    let content = model.getLineContent(lineNumber);
    if (isTitle(content, headContents)) {
      title = content;
      break;
    }
    content = content.trim();
    if (content !== "") {
      offsetLines++;
    }
    lineNumber--;
  }
  if (!title) {
    return;
  }
  const result = getTitleDom(dom, title, lineNumber);
  if (!result) {
    return;
  }
  const lineCount = model.getLineCount();
  lineNumber = startLineNumber;
  let nextTitle, nextNode, nextOffsetLines = 0;
  while (lineNumber <= lineCount) {
    let content = model.getLineContent(lineNumber);
    if (isTitle(content, headContents)) {
      nextTitle = content;
      break;
    }
    content = content.trim();
    if (content !== "") {
      nextOffsetLines++;
    }
    lineNumber++;
  }
  if (nextTitle) {
    const result2 = getTitleDom(dom, nextTitle, lineNumber);
    if (result2) {
      nextNode = result2.node;
    }
  }
  const { node } = result;
  let lineHeight = 22;
  if (nextNode) {
    const raws = nextOffsetLines + offsetLines;
    if (raws > 10) {
      const offsetHeight = nextNode.offsetTop - node.offsetTop;
      lineHeight = offsetHeight / raws;
    }
  }
  const top2 = node.offsetTop || 0;
  const scrollTop = top2 + offsetLines * lineHeight - 40;
  return scrollTop;
}
function removePreBgColor(dom) {
  const pres = dom.querySelectorAll("pre");
  pres.forEach((pre) => {
    pre.style.removeProperty("background-color");
  });
}
const themes = [
  "vitepress",
  "v-green",
  "simplicity-green",
  "vuepress",
  "github",
  "github-dark",
  "serene-rose",
  "awesome-green",
  "channing-cyan",
  "chocolate",
  "condensed-night-purple",
  "nico",
  "rude-crab",
  "fancy",
  "jzman",
  "cyanosis",
  "devui-blue",
  "geek-black",
  "mk-cute",
  "scrolls",
  "smart-blue",
  "z-blue",
  "arknights",
  "Chinese-red",
  "greenwillow"
];
function checkLinks(dom) {
  const links2 = dom.querySelectorAll("a");
  links2.forEach((link2) => {
    const href = link2.getAttribute("href") || "";
    if (href.indexOf("http:") > -1 || href.indexOf("https://") > -1 || href.indexOf("//") > -1) {
      link2.setAttribute("target", "_blank");
    }
  });
}
function checkCodeGroup(dom) {
  const codeGroups = dom.querySelectorAll(".vp-code-group");
  const domActive = (dom2, active = true) => {
    if (!dom2) {
      return;
    }
    if (active) {
      dom2.classList.add(ACTIVE_CLASS);
    } else {
      dom2.classList.remove(ACTIVE_CLASS);
    }
  };
  codeGroups.forEach((codeGroup) => {
    const inited = codeGroup.inited;
    if (inited) {
      return;
    }
    codeGroup.inited = true;
    const tabsDom = codeGroup.querySelector(".tabs");
    const blocksDom = codeGroup.querySelector(".blocks");
    const radios = tabsDom.querySelectorAll("input[type=radio]");
    const pres = blocksDom.querySelectorAll("pre");
    domActive(pres[0]);
    radios.forEach((radio2, index) => {
      on$1(radio2, "click", () => {
        pres.forEach((pre2) => {
          domActive(pre2, false);
        });
        const pre = pres[index];
        domActive(pre);
      });
    });
  });
}
function initMermaid(dom) {
  const mermaid2 = getMermaid();
  if (!mermaid2) {
    getToastr().error("not find mermaid,please registerMermaid");
    return;
  }
  mermaid2.initialize({ startOnLoad: false });
  const els = dom.querySelectorAll(".mermaid");
  const notInit = [];
  for (let i = 0, len = els.length; i < len; i++) {
    const dataset = els[i].dataset;
    if (!dataset.processed) {
      notInit.push(1);
    }
  }
  if (notInit.length) {
    mermaid2.run({
      nodes: els
    });
  }
}
var textarea;
function decodeEntity(name2) {
  textarea = textarea || document.createElement("textarea");
  textarea.innerHTML = "&" + name2 + ";";
  return textarea.value;
}
var hasOwn = Object.prototype.hasOwnProperty;
function has(object, key2) {
  return object ? hasOwn.call(object, key2) : false;
}
function assign(obj) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function(source2) {
    if (!source2) {
      return;
    }
    if (typeof source2 !== "object") {
      throw new TypeError(source2 + "must be object");
    }
    Object.keys(source2).forEach(function(key2) {
      obj[key2] = source2[key2];
    });
  });
  return obj;
}
var UNESCAPE_MD_RE = /\\([\\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;
function unescapeMd(str2) {
  if (str2.indexOf("\\") < 0) {
    return str2;
  }
  return str2.replace(UNESCAPE_MD_RE, "$1");
}
function isValidEntityCode(c2) {
  if (c2 >= 55296 && c2 <= 57343) {
    return false;
  }
  if (c2 >= 64976 && c2 <= 65007) {
    return false;
  }
  if ((c2 & 65535) === 65535 || (c2 & 65535) === 65534) {
    return false;
  }
  if (c2 >= 0 && c2 <= 8) {
    return false;
  }
  if (c2 === 11) {
    return false;
  }
  if (c2 >= 14 && c2 <= 31) {
    return false;
  }
  if (c2 >= 127 && c2 <= 159) {
    return false;
  }
  if (c2 > 1114111) {
    return false;
  }
  return true;
}
function fromCodePoint(c2) {
  if (c2 > 65535) {
    c2 -= 65536;
    var surrogate1 = 55296 + (c2 >> 10), surrogate2 = 56320 + (c2 & 1023);
    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c2);
}
var NAMED_ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;
function replaceEntityPattern(match, name2) {
  var code2 = 0;
  var decoded = decodeEntity(name2);
  if (name2 !== decoded) {
    return decoded;
  } else if (name2.charCodeAt(0) === 35 && DIGITAL_ENTITY_TEST_RE.test(name2)) {
    code2 = name2[1].toLowerCase() === "x" ? parseInt(name2.slice(2), 16) : parseInt(name2.slice(1), 10);
    if (isValidEntityCode(code2)) {
      return fromCodePoint(code2);
    }
  }
  return match;
}
function replaceEntities(str2) {
  if (str2.indexOf("&") < 0) {
    return str2;
  }
  return str2.replace(NAMED_ENTITY_RE, replaceEntityPattern);
}
var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}
function escapeHtml$1(str2) {
  if (HTML_ESCAPE_TEST_RE.test(str2)) {
    return str2.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str2;
}
var rules = {};
rules.blockquote_open = function() {
  return "<blockquote>\n";
};
rules.blockquote_close = function(tokens, idx2) {
  return "</blockquote>" + getBreak(tokens, idx2);
};
rules.code = function(tokens, idx2) {
  if (tokens[idx2].block) {
    return "<pre><code>" + escapeHtml$1(tokens[idx2].content) + "</code></pre>" + getBreak(tokens, idx2);
  }
  return "<code>" + escapeHtml$1(tokens[idx2].content) + "</code>";
};
rules.fence = function(tokens, idx2, options, env, instance) {
  var token = tokens[idx2];
  var langClass = "";
  var langPrefix = options.langPrefix;
  var langName = "", fences2, fenceName;
  var highlighted;
  if (token.params) {
    fences2 = token.params.split(/\s+/g);
    fenceName = fences2.join(" ");
    if (has(instance.rules.fence_custom, fences2[0])) {
      return instance.rules.fence_custom[fences2[0]](tokens, idx2, options, env, instance);
    }
    langName = escapeHtml$1(replaceEntities(unescapeMd(fenceName)));
    langClass = ' class="' + langPrefix + langName + '"';
  }
  if (options.highlight) {
    highlighted = options.highlight.apply(options.highlight, [token.content].concat(fences2)) || escapeHtml$1(token.content);
  } else {
    highlighted = escapeHtml$1(token.content);
  }
  return "<pre><code" + langClass + ">" + highlighted + "</code></pre>" + getBreak(tokens, idx2);
};
rules.fence_custom = {};
rules.heading_open = function(tokens, idx2) {
  return "<h" + tokens[idx2].hLevel + ">";
};
rules.heading_close = function(tokens, idx2) {
  return "</h" + tokens[idx2].hLevel + ">\n";
};
rules.hr = function(tokens, idx2, options) {
  return (options.xhtmlOut ? "<hr />" : "<hr>") + getBreak(tokens, idx2);
};
rules.bullet_list_open = function() {
  return "<ul>\n";
};
rules.bullet_list_close = function(tokens, idx2) {
  return "</ul>" + getBreak(tokens, idx2);
};
rules.list_item_open = function() {
  return "<li>";
};
rules.list_item_close = function() {
  return "</li>\n";
};
rules.ordered_list_open = function(tokens, idx2) {
  var token = tokens[idx2];
  var order = token.order > 1 ? ' start="' + token.order + '"' : "";
  return "<ol" + order + ">\n";
};
rules.ordered_list_close = function(tokens, idx2) {
  return "</ol>" + getBreak(tokens, idx2);
};
rules.paragraph_open = function(tokens, idx2) {
  return tokens[idx2].tight ? "" : "<p>";
};
rules.paragraph_close = function(tokens, idx2) {
  var addBreak = !(tokens[idx2].tight && idx2 && tokens[idx2 - 1].type === "inline" && !tokens[idx2 - 1].content);
  return (tokens[idx2].tight ? "" : "</p>") + (addBreak ? getBreak(tokens, idx2) : "");
};
rules.link_open = function(tokens, idx2, options) {
  var title = tokens[idx2].title ? ' title="' + escapeHtml$1(replaceEntities(tokens[idx2].title)) + '"' : "";
  var target = options.linkTarget ? ' target="' + options.linkTarget + '"' : "";
  return '<a href="' + escapeHtml$1(tokens[idx2].href) + '"' + title + target + ">";
};
rules.link_close = function() {
  return "</a>";
};
rules.image = function(tokens, idx2, options) {
  var src = ' src="' + escapeHtml$1(tokens[idx2].src) + '"';
  var title = tokens[idx2].title ? ' title="' + escapeHtml$1(replaceEntities(tokens[idx2].title)) + '"' : "";
  var alt = ' alt="' + (tokens[idx2].alt ? escapeHtml$1(replaceEntities(unescapeMd(tokens[idx2].alt))) : "") + '"';
  var suffix = options.xhtmlOut ? " /" : "";
  return "<img" + src + alt + title + suffix + ">";
};
rules.table_open = function() {
  return "<table>\n";
};
rules.table_close = function() {
  return "</table>\n";
};
rules.thead_open = function() {
  return "<thead>\n";
};
rules.thead_close = function() {
  return "</thead>\n";
};
rules.tbody_open = function() {
  return "<tbody>\n";
};
rules.tbody_close = function() {
  return "</tbody>\n";
};
rules.tr_open = function() {
  return "<tr>";
};
rules.tr_close = function() {
  return "</tr>\n";
};
rules.th_open = function(tokens, idx2) {
  var token = tokens[idx2];
  return "<th" + (token.align ? ' style="text-align:' + token.align + '"' : "") + ">";
};
rules.th_close = function() {
  return "</th>";
};
rules.td_open = function(tokens, idx2) {
  var token = tokens[idx2];
  return "<td" + (token.align ? ' style="text-align:' + token.align + '"' : "") + ">";
};
rules.td_close = function() {
  return "</td>";
};
rules.strong_open = function() {
  return "<strong>";
};
rules.strong_close = function() {
  return "</strong>";
};
rules.em_open = function() {
  return "<em>";
};
rules.em_close = function() {
  return "</em>";
};
rules.del_open = function() {
  return "<del>";
};
rules.del_close = function() {
  return "</del>";
};
rules.ins_open = function() {
  return "<ins>";
};
rules.ins_close = function() {
  return "</ins>";
};
rules.mark_open = function() {
  return "<mark>";
};
rules.mark_close = function() {
  return "</mark>";
};
rules.sub = function(tokens, idx2) {
  return "<sub>" + escapeHtml$1(tokens[idx2].content) + "</sub>";
};
rules.sup = function(tokens, idx2) {
  return "<sup>" + escapeHtml$1(tokens[idx2].content) + "</sup>";
};
rules.hardbreak = function(tokens, idx2, options) {
  return options.xhtmlOut ? "<br />\n" : "<br>\n";
};
rules.softbreak = function(tokens, idx2, options) {
  return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
};
rules.text = function(tokens, idx2) {
  return escapeHtml$1(tokens[idx2].content);
};
rules.htmlblock = function(tokens, idx2) {
  return tokens[idx2].content;
};
rules.htmltag = function(tokens, idx2) {
  return tokens[idx2].content;
};
rules.abbr_open = function(tokens, idx2) {
  return '<abbr title="' + escapeHtml$1(replaceEntities(tokens[idx2].title)) + '">';
};
rules.abbr_close = function() {
  return "</abbr>";
};
rules.footnote_ref = function(tokens, idx2) {
  var n2 = Number(tokens[idx2].id + 1).toString();
  var id2 = "fnref" + n2;
  if (tokens[idx2].subId > 0) {
    id2 += ":" + tokens[idx2].subId;
  }
  return '<sup class="footnote-ref"><a href="#fn' + n2 + '" id="' + id2 + '">[' + n2 + "]</a></sup>";
};
rules.footnote_block_open = function(tokens, idx2, options) {
  var hr2 = options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n';
  return hr2 + '<section class="footnotes">\n<ol class="footnotes-list">\n';
};
rules.footnote_block_close = function() {
  return "</ol>\n</section>\n";
};
rules.footnote_open = function(tokens, idx2) {
  var id2 = Number(tokens[idx2].id + 1).toString();
  return '<li id="fn' + id2 + '"  class="footnote-item">';
};
rules.footnote_close = function() {
  return "</li>\n";
};
rules.footnote_anchor = function(tokens, idx2) {
  var n2 = Number(tokens[idx2].id + 1).toString();
  var id2 = "fnref" + n2;
  if (tokens[idx2].subId > 0) {
    id2 += ":" + tokens[idx2].subId;
  }
  return ' <a href="#' + id2 + '" class="footnote-backref">↩</a>';
};
rules.dl_open = function() {
  return "<dl>\n";
};
rules.dt_open = function() {
  return "<dt>";
};
rules.dd_open = function() {
  return "<dd>";
};
rules.dl_close = function() {
  return "</dl>\n";
};
rules.dt_close = function() {
  return "</dt>\n";
};
rules.dd_close = function() {
  return "</dd>\n";
};
function nextToken(tokens, idx2) {
  if (++idx2 >= tokens.length - 2) {
    return idx2;
  }
  if (tokens[idx2].type === "paragraph_open" && tokens[idx2].tight && (tokens[idx2 + 1].type === "inline" && tokens[idx2 + 1].content.length === 0) && (tokens[idx2 + 2].type === "paragraph_close" && tokens[idx2 + 2].tight)) {
    return nextToken(tokens, idx2 + 2);
  }
  return idx2;
}
var getBreak = rules.getBreak = function getBreak2(tokens, idx2) {
  idx2 = nextToken(tokens, idx2);
  if (idx2 < tokens.length && tokens[idx2].type === "list_item_close") {
    return "";
  }
  return "\n";
};
function Renderer() {
  this.rules = assign({}, rules);
  this.getBreak = rules.getBreak;
}
Renderer.prototype.renderInline = function(tokens, options, env) {
  var _rules2 = this.rules;
  var len = tokens.length, i = 0;
  var result = "";
  while (len--) {
    result += _rules2[tokens[i].type](tokens, i++, options, env, this);
  }
  return result;
};
Renderer.prototype.render = function(tokens, options, env) {
  var _rules2 = this.rules;
  var len = tokens.length, i = -1;
  var result = "";
  while (++i < len) {
    if (tokens[i].type === "inline") {
      result += this.renderInline(tokens[i].children, options, env);
    } else {
      result += _rules2[tokens[i].type](tokens, i, options, env, this);
    }
  }
  return result;
};
function Ruler() {
  this.__rules__ = [];
  this.__cache__ = null;
}
Ruler.prototype.__find__ = function(name2) {
  var len = this.__rules__.length;
  var i = -1;
  while (len--) {
    if (this.__rules__[++i].name === name2) {
      return i;
    }
  }
  return -1;
};
Ruler.prototype.__compile__ = function() {
  var self = this;
  var chains2 = [""];
  self.__rules__.forEach(function(rule) {
    if (!rule.enabled) {
      return;
    }
    rule.alt.forEach(function(altName) {
      if (chains2.indexOf(altName) < 0) {
        chains2.push(altName);
      }
    });
  });
  self.__cache__ = {};
  chains2.forEach(function(chain) {
    self.__cache__[chain] = [];
    self.__rules__.forEach(function(rule) {
      if (!rule.enabled) {
        return;
      }
      if (chain && rule.alt.indexOf(chain) < 0) {
        return;
      }
      self.__cache__[chain].push(rule.fn);
    });
  });
};
Ruler.prototype.at = function(name2, fn, options) {
  var idx2 = this.__find__(name2);
  var opt = options || {};
  if (idx2 === -1) {
    throw new Error("Parser rule not found: " + name2);
  }
  this.__rules__[idx2].fn = fn;
  this.__rules__[idx2].alt = opt.alt || [];
  this.__cache__ = null;
};
Ruler.prototype.before = function(beforeName, ruleName, fn, options) {
  var idx2 = this.__find__(beforeName);
  var opt = options || {};
  if (idx2 === -1) {
    throw new Error("Parser rule not found: " + beforeName);
  }
  this.__rules__.splice(idx2, 0, {
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.after = function(afterName, ruleName, fn, options) {
  var idx2 = this.__find__(afterName);
  var opt = options || {};
  if (idx2 === -1) {
    throw new Error("Parser rule not found: " + afterName);
  }
  this.__rules__.splice(idx2 + 1, 0, {
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.push = function(ruleName, fn, options) {
  var opt = options || {};
  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.enable = function(list2, strict) {
  list2 = !Array.isArray(list2) ? [list2] : list2;
  if (strict) {
    this.__rules__.forEach(function(rule) {
      rule.enabled = false;
    });
  }
  list2.forEach(function(name2) {
    var idx2 = this.__find__(name2);
    if (idx2 < 0) {
      throw new Error("Rules manager: invalid rule name " + name2);
    }
    this.__rules__[idx2].enabled = true;
  }, this);
  this.__cache__ = null;
};
Ruler.prototype.disable = function(list2) {
  list2 = !Array.isArray(list2) ? [list2] : list2;
  list2.forEach(function(name2) {
    var idx2 = this.__find__(name2);
    if (idx2 < 0) {
      throw new Error("Rules manager: invalid rule name " + name2);
    }
    this.__rules__[idx2].enabled = false;
  }, this);
  this.__cache__ = null;
};
Ruler.prototype.getRules = function(chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }
  return this.__cache__[chainName] || [];
};
function block(state) {
  if (state.inlineMode) {
    state.tokens.push({
      type: "inline",
      content: state.src.replace(/\n/g, " ").trim(),
      level: 0,
      lines: [0, 1],
      children: []
    });
  } else {
    state.block.parse(state.src, state.options, state.env, state.tokens);
  }
}
function StateInline(src, parserInline, options, env, outTokens) {
  this.src = src;
  this.env = env;
  this.options = options;
  this.parser = parserInline;
  this.tokens = outTokens;
  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = "";
  this.pendingLevel = 0;
  this.cache = [];
  this.isInLabel = false;
  this.linkLevel = 0;
  this.linkContent = "";
  this.labelUnmatchedScopes = 0;
}
StateInline.prototype.pushPending = function() {
  this.tokens.push({
    type: "text",
    content: this.pending,
    level: this.pendingLevel
  });
  this.pending = "";
};
StateInline.prototype.push = function(token) {
  if (this.pending) {
    this.pushPending();
  }
  this.tokens.push(token);
  this.pendingLevel = this.level;
};
StateInline.prototype.cacheSet = function(key2, val) {
  for (var i = this.cache.length; i <= key2; i++) {
    this.cache.push(0);
  }
  this.cache[key2] = val;
};
StateInline.prototype.cacheGet = function(key2) {
  return key2 < this.cache.length ? this.cache[key2] : 0;
};
function parseLinkLabel(state, start) {
  var level, found, marker, labelEnd = -1, max2 = state.posMax, oldPos = state.pos, oldFlag = state.isInLabel;
  if (state.isInLabel) {
    return -1;
  }
  if (state.labelUnmatchedScopes) {
    state.labelUnmatchedScopes--;
    return -1;
  }
  state.pos = start + 1;
  state.isInLabel = true;
  level = 1;
  while (state.pos < max2) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 91) {
      level++;
    } else if (marker === 93) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }
    state.parser.skipToken(state);
  }
  if (found) {
    labelEnd = state.pos;
    state.labelUnmatchedScopes = 0;
  } else {
    state.labelUnmatchedScopes = level - 1;
  }
  state.pos = oldPos;
  state.isInLabel = oldFlag;
  return labelEnd;
}
function parseAbbr(str2, parserInline, options, env) {
  var state, labelEnd, pos, max2, label2, title;
  if (str2.charCodeAt(0) !== 42) {
    return -1;
  }
  if (str2.charCodeAt(1) !== 91) {
    return -1;
  }
  if (str2.indexOf("]:") === -1) {
    return -1;
  }
  state = new StateInline(str2, parserInline, options, env, []);
  labelEnd = parseLinkLabel(state, 1);
  if (labelEnd < 0 || str2.charCodeAt(labelEnd + 1) !== 58) {
    return -1;
  }
  max2 = state.posMax;
  for (pos = labelEnd + 2; pos < max2; pos++) {
    if (state.src.charCodeAt(pos) === 10) {
      break;
    }
  }
  label2 = str2.slice(2, labelEnd);
  title = str2.slice(labelEnd + 2, pos).trim();
  if (title.length === 0) {
    return -1;
  }
  if (!env.abbreviations) {
    env.abbreviations = {};
  }
  if (typeof env.abbreviations[":" + label2] === "undefined") {
    env.abbreviations[":" + label2] = title;
  }
  return pos;
}
function abbr(state) {
  var tokens = state.tokens, i, l2, content, pos;
  if (state.inlineMode) {
    return;
  }
  for (i = 1, l2 = tokens.length - 1; i < l2; i++) {
    if (tokens[i - 1].type === "paragraph_open" && tokens[i].type === "inline" && tokens[i + 1].type === "paragraph_close") {
      content = tokens[i].content;
      while (content.length) {
        pos = parseAbbr(content, state.inline, state.options, state.env);
        if (pos < 0) {
          break;
        }
        content = content.slice(pos).trim();
      }
      tokens[i].content = content;
      if (!content.length) {
        tokens[i - 1].tight = true;
        tokens[i + 1].tight = true;
      }
    }
  }
}
function normalizeLink(url) {
  var normalized = replaceEntities(url);
  try {
    normalized = decodeURI(normalized);
  } catch (err) {
  }
  return encodeURI(normalized);
}
function parseLinkDestination(state, pos) {
  var code2, level, link2, start = pos, max2 = state.posMax;
  if (state.src.charCodeAt(pos) === 60) {
    pos++;
    while (pos < max2) {
      code2 = state.src.charCodeAt(pos);
      if (code2 === 10) {
        return false;
      }
      if (code2 === 62) {
        link2 = normalizeLink(unescapeMd(state.src.slice(start + 1, pos)));
        if (!state.parser.validateLink(link2)) {
          return false;
        }
        state.pos = pos + 1;
        state.linkContent = link2;
        return true;
      }
      if (code2 === 92 && pos + 1 < max2) {
        pos += 2;
        continue;
      }
      pos++;
    }
    return false;
  }
  level = 0;
  while (pos < max2) {
    code2 = state.src.charCodeAt(pos);
    if (code2 === 32) {
      break;
    }
    if (code2 < 32 || code2 === 127) {
      break;
    }
    if (code2 === 92 && pos + 1 < max2) {
      pos += 2;
      continue;
    }
    if (code2 === 40) {
      level++;
      if (level > 1) {
        break;
      }
    }
    if (code2 === 41) {
      level--;
      if (level < 0) {
        break;
      }
    }
    pos++;
  }
  if (start === pos) {
    return false;
  }
  link2 = unescapeMd(state.src.slice(start, pos));
  if (!state.parser.validateLink(link2)) {
    return false;
  }
  state.linkContent = link2;
  state.pos = pos;
  return true;
}
function parseLinkTitle(state, pos) {
  var code2, start = pos, max2 = state.posMax, marker = state.src.charCodeAt(pos);
  if (marker !== 34 && marker !== 39 && marker !== 40) {
    return false;
  }
  pos++;
  if (marker === 40) {
    marker = 41;
  }
  while (pos < max2) {
    code2 = state.src.charCodeAt(pos);
    if (code2 === marker) {
      state.pos = pos + 1;
      state.linkContent = unescapeMd(state.src.slice(start + 1, pos));
      return true;
    }
    if (code2 === 92 && pos + 1 < max2) {
      pos += 2;
      continue;
    }
    pos++;
  }
  return false;
}
function normalizeReference(str2) {
  return str2.trim().replace(/\s+/g, " ").toUpperCase();
}
function parseReference(str2, parser, options, env) {
  var state, labelEnd, pos, max2, code2, start, href, title, label2;
  if (str2.charCodeAt(0) !== 91) {
    return -1;
  }
  if (str2.indexOf("]:") === -1) {
    return -1;
  }
  state = new StateInline(str2, parser, options, env, []);
  labelEnd = parseLinkLabel(state, 0);
  if (labelEnd < 0 || str2.charCodeAt(labelEnd + 1) !== 58) {
    return -1;
  }
  max2 = state.posMax;
  for (pos = labelEnd + 2; pos < max2; pos++) {
    code2 = state.src.charCodeAt(pos);
    if (code2 !== 32 && code2 !== 10) {
      break;
    }
  }
  if (!parseLinkDestination(state, pos)) {
    return -1;
  }
  href = state.linkContent;
  pos = state.pos;
  start = pos;
  for (pos = pos + 1; pos < max2; pos++) {
    code2 = state.src.charCodeAt(pos);
    if (code2 !== 32 && code2 !== 10) {
      break;
    }
  }
  if (pos < max2 && start !== pos && parseLinkTitle(state, pos)) {
    title = state.linkContent;
    pos = state.pos;
  } else {
    title = "";
    pos = start;
  }
  while (pos < max2 && state.src.charCodeAt(pos) === 32) {
    pos++;
  }
  if (pos < max2 && state.src.charCodeAt(pos) !== 10) {
    return -1;
  }
  label2 = normalizeReference(str2.slice(1, labelEnd));
  if (typeof env.references[label2] === "undefined") {
    env.references[label2] = { title, href };
  }
  return pos;
}
function references(state) {
  var tokens = state.tokens, i, l2, content, pos;
  state.env.references = state.env.references || {};
  if (state.inlineMode) {
    return;
  }
  for (i = 1, l2 = tokens.length - 1; i < l2; i++) {
    if (tokens[i].type === "inline" && tokens[i - 1].type === "paragraph_open" && tokens[i + 1].type === "paragraph_close") {
      content = tokens[i].content;
      while (content.length) {
        pos = parseReference(content, state.inline, state.options, state.env);
        if (pos < 0) {
          break;
        }
        content = content.slice(pos).trim();
      }
      tokens[i].content = content;
      if (!content.length) {
        tokens[i - 1].tight = true;
        tokens[i + 1].tight = true;
      }
    }
  }
}
function inline(state) {
  var tokens = state.tokens, tok, i, l2;
  for (i = 0, l2 = tokens.length; i < l2; i++) {
    tok = tokens[i];
    if (tok.type === "inline") {
      state.inline.parse(tok.content, state.options, state.env, tok.children);
    }
  }
}
function footnote_block(state) {
  var i, l2, j, t2, lastParagraph, list2, tokens, current, currentLabel, level = 0, insideRef = false, refTokens = {};
  if (!state.env.footnotes) {
    return;
  }
  state.tokens = state.tokens.filter(function(tok) {
    if (tok.type === "footnote_reference_open") {
      insideRef = true;
      current = [];
      currentLabel = tok.label;
      return false;
    }
    if (tok.type === "footnote_reference_close") {
      insideRef = false;
      refTokens[":" + currentLabel] = current;
      return false;
    }
    if (insideRef) {
      current.push(tok);
    }
    return !insideRef;
  });
  if (!state.env.footnotes.list) {
    return;
  }
  list2 = state.env.footnotes.list;
  state.tokens.push({
    type: "footnote_block_open",
    level: level++
  });
  for (i = 0, l2 = list2.length; i < l2; i++) {
    state.tokens.push({
      type: "footnote_open",
      id: i,
      level: level++
    });
    if (list2[i].tokens) {
      tokens = [];
      tokens.push({
        type: "paragraph_open",
        tight: false,
        level: level++
      });
      tokens.push({
        type: "inline",
        content: "",
        level,
        children: list2[i].tokens
      });
      tokens.push({
        type: "paragraph_close",
        tight: false,
        level: --level
      });
    } else if (list2[i].label) {
      tokens = refTokens[":" + list2[i].label];
    }
    state.tokens = state.tokens.concat(tokens);
    if (state.tokens[state.tokens.length - 1].type === "paragraph_close") {
      lastParagraph = state.tokens.pop();
    } else {
      lastParagraph = null;
    }
    t2 = list2[i].count > 0 ? list2[i].count : 1;
    for (j = 0; j < t2; j++) {
      state.tokens.push({
        type: "footnote_anchor",
        id: i,
        subId: j,
        level
      });
    }
    if (lastParagraph) {
      state.tokens.push(lastParagraph);
    }
    state.tokens.push({
      type: "footnote_close",
      level: --level
    });
  }
  state.tokens.push({
    type: "footnote_block_close",
    level: --level
  });
}
var PUNCT_CHARS = ` 
()[]'".,!?-`;
function regEscape(s2) {
  return s2.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1");
}
function abbr2(state) {
  var i, j, l2, tokens, token, text2, nodes, pos, level, reg, m2, regText, blockTokens = state.tokens;
  if (!state.env.abbreviations) {
    return;
  }
  if (!state.env.abbrRegExp) {
    regText = "(^|[" + PUNCT_CHARS.split("").map(regEscape).join("") + "])(" + Object.keys(state.env.abbreviations).map(function(x2) {
      return x2.substr(1);
    }).sort(function(a2, b2) {
      return b2.length - a2.length;
    }).map(regEscape).join("|") + ")($|[" + PUNCT_CHARS.split("").map(regEscape).join("") + "])";
    state.env.abbrRegExp = new RegExp(regText, "g");
  }
  reg = state.env.abbrRegExp;
  for (j = 0, l2 = blockTokens.length; j < l2; j++) {
    if (blockTokens[j].type !== "inline") {
      continue;
    }
    tokens = blockTokens[j].children;
    for (i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];
      if (token.type !== "text") {
        continue;
      }
      pos = 0;
      text2 = token.content;
      reg.lastIndex = 0;
      level = token.level;
      nodes = [];
      while (m2 = reg.exec(text2)) {
        if (reg.lastIndex > pos) {
          nodes.push({
            type: "text",
            content: text2.slice(pos, m2.index + m2[1].length),
            level
          });
        }
        nodes.push({
          type: "abbr_open",
          title: state.env.abbreviations[":" + m2[2]],
          level: level++
        });
        nodes.push({
          type: "text",
          content: m2[2],
          level
        });
        nodes.push({
          type: "abbr_close",
          level: --level
        });
        pos = reg.lastIndex - m2[3].length;
      }
      if (!nodes.length) {
        continue;
      }
      if (pos < text2.length) {
        nodes.push({
          type: "text",
          content: text2.slice(pos),
          level
        });
      }
      blockTokens[j].children = tokens = [].concat(tokens.slice(0, i), nodes, tokens.slice(i + 1));
    }
  }
}
var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
var SCOPED_ABBR = {
  "c": "©",
  "r": "®",
  "p": "§",
  "tm": "™"
};
function replaceScopedAbbr(str2) {
  if (str2.indexOf("(") < 0) {
    return str2;
  }
  return str2.replace(SCOPED_ABBR_RE, function(match, name2) {
    return SCOPED_ABBR[name2.toLowerCase()];
  });
}
function replace(state) {
  var i, token, text2, inlineTokens, blkIdx;
  if (!state.options.typographer) {
    return;
  }
  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline") {
      continue;
    }
    inlineTokens = state.tokens[blkIdx].children;
    for (i = inlineTokens.length - 1; i >= 0; i--) {
      token = inlineTokens[i];
      if (token.type === "text") {
        text2 = token.content;
        text2 = replaceScopedAbbr(text2);
        if (RARE_RE.test(text2)) {
          text2 = text2.replace(/\+-/g, "±").replace(/\.{2,}/g, "…").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---([^-]|$)/mg, "$1—$2").replace(/(^|\s)--(\s|$)/mg, "$1–$2").replace(/(^|[^-\s])--([^-\s]|$)/mg, "$1–$2");
        }
        token.content = text2;
      }
    }
  }
}
var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var PUNCT_RE = /[-\s()\[\]]/;
var APOSTROPHE = "’";
function isLetter(str2, pos) {
  if (pos < 0 || pos >= str2.length) {
    return false;
  }
  return !PUNCT_RE.test(str2[pos]);
}
function replaceAt(str2, index, ch) {
  return str2.substr(0, index) + ch + str2.substr(index + 1);
}
function smartquotes(state) {
  var i, token, text2, t2, pos, max2, thisLevel, lastSpace, nextSpace, item, canOpen, canClose, j, isSingle, blkIdx, tokens, stack;
  if (!state.options.typographer) {
    return;
  }
  stack = [];
  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline") {
      continue;
    }
    tokens = state.tokens[blkIdx].children;
    stack.length = 0;
    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];
      if (token.type !== "text" || QUOTE_TEST_RE.test(token.text)) {
        continue;
      }
      thisLevel = tokens[i].level;
      for (j = stack.length - 1; j >= 0; j--) {
        if (stack[j].level <= thisLevel) {
          break;
        }
      }
      stack.length = j + 1;
      text2 = token.content;
      pos = 0;
      max2 = text2.length;
      OUTER:
        while (pos < max2) {
          QUOTE_RE.lastIndex = pos;
          t2 = QUOTE_RE.exec(text2);
          if (!t2) {
            break;
          }
          lastSpace = !isLetter(text2, t2.index - 1);
          pos = t2.index + 1;
          isSingle = t2[0] === "'";
          nextSpace = !isLetter(text2, pos);
          if (!nextSpace && !lastSpace) {
            if (isSingle) {
              token.content = replaceAt(token.content, t2.index, APOSTROPHE);
            }
            continue;
          }
          canOpen = !nextSpace;
          canClose = !lastSpace;
          if (canClose) {
            for (j = stack.length - 1; j >= 0; j--) {
              item = stack[j];
              if (stack[j].level < thisLevel) {
                break;
              }
              if (item.single === isSingle && stack[j].level === thisLevel) {
                item = stack[j];
                if (isSingle) {
                  tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, state.options.quotes[2]);
                  token.content = replaceAt(token.content, t2.index, state.options.quotes[3]);
                } else {
                  tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, state.options.quotes[0]);
                  token.content = replaceAt(token.content, t2.index, state.options.quotes[1]);
                }
                stack.length = j;
                continue OUTER;
              }
            }
          }
          if (canOpen) {
            stack.push({
              token: i,
              pos: t2.index,
              single: isSingle,
              level: thisLevel
            });
          } else if (canClose && isSingle) {
            token.content = replaceAt(token.content, t2.index, APOSTROPHE);
          }
        }
    }
  }
}
var _rules = [
  ["block", block],
  ["abbr", abbr],
  ["references", references],
  ["inline", inline],
  ["footnote_tail", footnote_block],
  ["abbr2", abbr2],
  ["replacements", replace],
  ["smartquotes", smartquotes]
];
function Core() {
  this.options = {};
  this.ruler = new Ruler();
  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}
Core.prototype.process = function(state) {
  var i, l2, rules2;
  rules2 = this.ruler.getRules("");
  for (i = 0, l2 = rules2.length; i < l2; i++) {
    rules2[i](state);
  }
};
function StateBlock(src, parser, options, env, tokens) {
  var ch, s2, start, pos, len, indent, indent_found;
  this.src = src;
  this.parser = parser;
  this.options = options;
  this.env = env;
  this.tokens = tokens;
  this.bMarks = [];
  this.eMarks = [];
  this.tShift = [];
  this.blkIndent = 0;
  this.line = 0;
  this.lineMax = 0;
  this.tight = false;
  this.parentType = "root";
  this.ddIndent = -1;
  this.level = 0;
  this.result = "";
  s2 = this.src;
  indent = 0;
  indent_found = false;
  for (start = pos = indent = 0, len = s2.length; pos < len; pos++) {
    ch = s2.charCodeAt(pos);
    if (!indent_found) {
      if (ch === 32) {
        indent++;
        continue;
      } else {
        indent_found = true;
      }
    }
    if (ch === 10 || pos === len - 1) {
      if (ch !== 10) {
        pos++;
      }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);
      indent_found = false;
      indent = 0;
      start = pos + 1;
    }
  }
  this.bMarks.push(s2.length);
  this.eMarks.push(s2.length);
  this.tShift.push(0);
  this.lineMax = this.bMarks.length - 1;
}
StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};
StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (var max2 = this.lineMax; from < max2; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};
StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  for (var max2 = this.src.length; pos < max2; pos++) {
    if (this.src.charCodeAt(pos) !== 32) {
      break;
    }
  }
  return pos;
};
StateBlock.prototype.skipChars = function skipChars(pos, code2) {
  for (var max2 = this.src.length; pos < max2; pos++) {
    if (this.src.charCodeAt(pos) !== code2) {
      break;
    }
  }
  return pos;
};
StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code2, min2) {
  if (pos <= min2) {
    return pos;
  }
  while (pos > min2) {
    if (code2 !== this.src.charCodeAt(--pos)) {
      return pos + 1;
    }
  }
  return pos;
};
StateBlock.prototype.getLines = function getLines(begin, end2, indent, keepLastLF) {
  var i, first, last, queue, shift, line = begin;
  if (begin >= end2) {
    return "";
  }
  if (line + 1 === end2) {
    first = this.bMarks[line] + Math.min(this.tShift[line], indent);
    last = keepLastLF ? this.eMarks[line] + 1 : this.eMarks[line];
    return this.src.slice(first, last);
  }
  queue = new Array(end2 - begin);
  for (i = 0; line < end2; line++, i++) {
    shift = this.tShift[line];
    if (shift > indent) {
      shift = indent;
    }
    if (shift < 0) {
      shift = 0;
    }
    first = this.bMarks[line] + shift;
    if (line + 1 < end2 || keepLastLF) {
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }
    queue[i] = this.src.slice(first, last);
  }
  return queue.join("");
};
function code(state, startLine, endLine) {
  var nextLine, last;
  if (state.tShift[startLine] - state.blkIndent < 4) {
    return false;
  }
  last = nextLine = startLine + 1;
  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.tShift[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }
  state.line = nextLine;
  state.tokens.push({
    type: "code",
    content: state.getLines(startLine, last, 4 + state.blkIndent, true),
    block: true,
    lines: [startLine, state.line],
    level: state.level
  });
  return true;
}
function fences(state, startLine, endLine, silent) {
  var marker, len, params, nextLine, mem, haveEndMarker = false, pos = state.bMarks[startLine] + state.tShift[startLine], max2 = state.eMarks[startLine];
  if (pos + 3 > max2) {
    return false;
  }
  marker = state.src.charCodeAt(pos);
  if (marker !== 126 && marker !== 96) {
    return false;
  }
  mem = pos;
  pos = state.skipChars(pos, marker);
  len = pos - mem;
  if (len < 3) {
    return false;
  }
  params = state.src.slice(pos, max2).trim();
  if (params.indexOf("`") >= 0) {
    return false;
  }
  if (silent) {
    return true;
  }
  nextLine = startLine;
  for (; ; ) {
    nextLine++;
    if (nextLine >= endLine) {
      break;
    }
    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max2 = state.eMarks[nextLine];
    if (pos < max2 && state.tShift[nextLine] < state.blkIndent) {
      break;
    }
    if (state.src.charCodeAt(pos) !== marker) {
      continue;
    }
    if (state.tShift[nextLine] - state.blkIndent >= 4) {
      continue;
    }
    pos = state.skipChars(pos, marker);
    if (pos - mem < len) {
      continue;
    }
    pos = state.skipSpaces(pos);
    if (pos < max2) {
      continue;
    }
    haveEndMarker = true;
    break;
  }
  len = state.tShift[startLine];
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  state.tokens.push({
    type: "fence",
    params,
    content: state.getLines(startLine + 1, nextLine, len, true),
    lines: [startLine, state.line],
    level: state.level
  });
  return true;
}
function blockquote(state, startLine, endLine, silent) {
  var nextLine, lastLineEmpty, oldTShift, oldBMarks, oldIndent, oldParentType, lines, terminatorRules, i, l2, terminate, pos = state.bMarks[startLine] + state.tShift[startLine], max2 = state.eMarks[startLine];
  if (pos > max2) {
    return false;
  }
  if (state.src.charCodeAt(pos++) !== 62) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  if (silent) {
    return true;
  }
  if (state.src.charCodeAt(pos) === 32) {
    pos++;
  }
  oldIndent = state.blkIndent;
  state.blkIndent = 0;
  oldBMarks = [state.bMarks[startLine]];
  state.bMarks[startLine] = pos;
  pos = pos < max2 ? state.skipSpaces(pos) : pos;
  lastLineEmpty = pos >= max2;
  oldTShift = [state.tShift[startLine]];
  state.tShift[startLine] = pos - state.bMarks[startLine];
  terminatorRules = state.parser.ruler.getRules("blockquote");
  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max2 = state.eMarks[nextLine];
    if (pos >= max2) {
      break;
    }
    if (state.src.charCodeAt(pos++) === 62) {
      if (state.src.charCodeAt(pos) === 32) {
        pos++;
      }
      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;
      pos = pos < max2 ? state.skipSpaces(pos) : pos;
      lastLineEmpty = pos >= max2;
      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }
    if (lastLineEmpty) {
      break;
    }
    terminate = false;
    for (i = 0, l2 = terminatorRules.length; i < l2; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
    oldBMarks.push(state.bMarks[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    state.tShift[nextLine] = -1337;
  }
  oldParentType = state.parentType;
  state.parentType = "blockquote";
  state.tokens.push({
    type: "blockquote_open",
    lines: lines = [startLine, 0],
    level: state.level++
  });
  state.parser.tokenize(state, startLine, nextLine);
  state.tokens.push({
    type: "blockquote_close",
    level: --state.level
  });
  state.parentType = oldParentType;
  lines[1] = state.line;
  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
  }
  state.blkIndent = oldIndent;
  return true;
}
function hr(state, startLine, endLine, silent) {
  var marker, cnt, ch, pos = state.bMarks[startLine], max2 = state.eMarks[startLine];
  pos += state.tShift[startLine];
  if (pos > max2) {
    return false;
  }
  marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 95) {
    return false;
  }
  cnt = 1;
  while (pos < max2) {
    ch = state.src.charCodeAt(pos++);
    if (ch !== marker && ch !== 32) {
      return false;
    }
    if (ch === marker) {
      cnt++;
    }
  }
  if (cnt < 3) {
    return false;
  }
  if (silent) {
    return true;
  }
  state.line = startLine + 1;
  state.tokens.push({
    type: "hr",
    lines: [startLine, state.line],
    level: state.level
  });
  return true;
}
function skipBulletListMarker(state, startLine) {
  var marker, pos, max2;
  pos = state.bMarks[startLine] + state.tShift[startLine];
  max2 = state.eMarks[startLine];
  if (pos >= max2) {
    return -1;
  }
  marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 43) {
    return -1;
  }
  if (pos < max2 && state.src.charCodeAt(pos) !== 32) {
    return -1;
  }
  return pos;
}
function skipOrderedListMarker(state, startLine) {
  var ch, pos = state.bMarks[startLine] + state.tShift[startLine], max2 = state.eMarks[startLine];
  if (pos + 1 >= max2) {
    return -1;
  }
  ch = state.src.charCodeAt(pos++);
  if (ch < 48 || ch > 57) {
    return -1;
  }
  for (; ; ) {
    if (pos >= max2) {
      return -1;
    }
    ch = state.src.charCodeAt(pos++);
    if (ch >= 48 && ch <= 57) {
      continue;
    }
    if (ch === 41 || ch === 46) {
      break;
    }
    return -1;
  }
  if (pos < max2 && state.src.charCodeAt(pos) !== 32) {
    return -1;
  }
  return pos;
}
function markTightParagraphs(state, idx2) {
  var i, l2, level = state.level + 2;
  for (i = idx2 + 2, l2 = state.tokens.length - 2; i < l2; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === "paragraph_open") {
      state.tokens[i + 2].tight = true;
      state.tokens[i].tight = true;
      i += 2;
    }
  }
}
function list(state, startLine, endLine, silent) {
  var nextLine, indent, oldTShift, oldIndent, oldTight, oldParentType, start, posAfterMarker, max2, indentAfterMarker, markerValue, markerCharCode, isOrdered, contentStart, listTokIdx, prevEmptyEnd, listLines, itemLines, tight = true, terminatorRules, i, l2, terminate;
  if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
    isOrdered = true;
  } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
    isOrdered = false;
  } else {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
  if (silent) {
    return true;
  }
  listTokIdx = state.tokens.length;
  if (isOrdered) {
    start = state.bMarks[startLine] + state.tShift[startLine];
    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));
    state.tokens.push({
      type: "ordered_list_open",
      order: markerValue,
      lines: listLines = [startLine, 0],
      level: state.level++
    });
  } else {
    state.tokens.push({
      type: "bullet_list_open",
      lines: listLines = [startLine, 0],
      level: state.level++
    });
  }
  nextLine = startLine;
  prevEmptyEnd = false;
  terminatorRules = state.parser.ruler.getRules("list");
  while (nextLine < endLine) {
    contentStart = state.skipSpaces(posAfterMarker);
    max2 = state.eMarks[nextLine];
    if (contentStart >= max2) {
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = contentStart - posAfterMarker;
    }
    if (indentAfterMarker > 4) {
      indentAfterMarker = 1;
    }
    if (indentAfterMarker < 1) {
      indentAfterMarker = 1;
    }
    indent = posAfterMarker - state.bMarks[nextLine] + indentAfterMarker;
    state.tokens.push({
      type: "list_item_open",
      lines: itemLines = [startLine, 0],
      level: state.level++
    });
    oldIndent = state.blkIndent;
    oldTight = state.tight;
    oldTShift = state.tShift[startLine];
    oldParentType = state.parentType;
    state.tShift[startLine] = contentStart - state.bMarks[startLine];
    state.blkIndent = indent;
    state.tight = true;
    state.parentType = "list";
    state.parser.tokenize(state, startLine, endLine, true);
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    prevEmptyEnd = state.line - startLine > 1 && state.isEmpty(state.line - 1);
    state.blkIndent = oldIndent;
    state.tShift[startLine] = oldTShift;
    state.tight = oldTight;
    state.parentType = oldParentType;
    state.tokens.push({
      type: "list_item_close",
      level: --state.level
    });
    nextLine = startLine = state.line;
    itemLines[1] = nextLine;
    contentStart = state.bMarks[startLine];
    if (nextLine >= endLine) {
      break;
    }
    if (state.isEmpty(nextLine)) {
      break;
    }
    if (state.tShift[nextLine] < state.blkIndent) {
      break;
    }
    terminate = false;
    for (i = 0, l2 = terminatorRules.length; i < l2; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
    }
    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
      break;
    }
  }
  state.tokens.push({
    type: isOrdered ? "ordered_list_close" : "bullet_list_close",
    level: --state.level
  });
  listLines[1] = nextLine;
  state.line = nextLine;
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }
  return true;
}
function footnote(state, startLine, endLine, silent) {
  var oldBMark, oldTShift, oldParentType, pos, label2, start = state.bMarks[startLine] + state.tShift[startLine], max2 = state.eMarks[startLine];
  if (start + 4 > max2) {
    return false;
  }
  if (state.src.charCodeAt(start) !== 91) {
    return false;
  }
  if (state.src.charCodeAt(start + 1) !== 94) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  for (pos = start + 2; pos < max2; pos++) {
    if (state.src.charCodeAt(pos) === 32) {
      return false;
    }
    if (state.src.charCodeAt(pos) === 93) {
      break;
    }
  }
  if (pos === start + 2) {
    return false;
  }
  if (pos + 1 >= max2 || state.src.charCodeAt(++pos) !== 58) {
    return false;
  }
  if (silent) {
    return true;
  }
  pos++;
  if (!state.env.footnotes) {
    state.env.footnotes = {};
  }
  if (!state.env.footnotes.refs) {
    state.env.footnotes.refs = {};
  }
  label2 = state.src.slice(start + 2, pos - 2);
  state.env.footnotes.refs[":" + label2] = -1;
  state.tokens.push({
    type: "footnote_reference_open",
    label: label2,
    level: state.level++
  });
  oldBMark = state.bMarks[startLine];
  oldTShift = state.tShift[startLine];
  oldParentType = state.parentType;
  state.tShift[startLine] = state.skipSpaces(pos) - pos;
  state.bMarks[startLine] = pos;
  state.blkIndent += 4;
  state.parentType = "footnote";
  if (state.tShift[startLine] < state.blkIndent) {
    state.tShift[startLine] += state.blkIndent;
    state.bMarks[startLine] -= state.blkIndent;
  }
  state.parser.tokenize(state, startLine, endLine, true);
  state.parentType = oldParentType;
  state.blkIndent -= 4;
  state.tShift[startLine] = oldTShift;
  state.bMarks[startLine] = oldBMark;
  state.tokens.push({
    type: "footnote_reference_close",
    level: --state.level
  });
  return true;
}
function heading(state, startLine, endLine, silent) {
  var ch, level, tmp, pos = state.bMarks[startLine] + state.tShift[startLine], max2 = state.eMarks[startLine];
  if (pos >= max2) {
    return false;
  }
  ch = state.src.charCodeAt(pos);
  if (ch !== 35 || pos >= max2) {
    return false;
  }
  level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 35 && pos < max2 && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }
  if (level > 6 || pos < max2 && ch !== 32) {
    return false;
  }
  if (silent) {
    return true;
  }
  max2 = state.skipCharsBack(max2, 32, pos);
  tmp = state.skipCharsBack(max2, 35, pos);
  if (tmp > pos && state.src.charCodeAt(tmp - 1) === 32) {
    max2 = tmp;
  }
  state.line = startLine + 1;
  state.tokens.push({
    type: "heading_open",
    hLevel: level,
    lines: [startLine, state.line],
    level: state.level
  });
  if (pos < max2) {
    state.tokens.push({
      type: "inline",
      content: state.src.slice(pos, max2).trim(),
      level: state.level + 1,
      lines: [startLine, state.line],
      children: []
    });
  }
  state.tokens.push({ type: "heading_close", hLevel: level, level: state.level });
  return true;
}
function lheading(state, startLine, endLine) {
  var marker, pos, max2, next = startLine + 1;
  if (next >= endLine) {
    return false;
  }
  if (state.tShift[next] < state.blkIndent) {
    return false;
  }
  if (state.tShift[next] - state.blkIndent > 3) {
    return false;
  }
  pos = state.bMarks[next] + state.tShift[next];
  max2 = state.eMarks[next];
  if (pos >= max2) {
    return false;
  }
  marker = state.src.charCodeAt(pos);
  if (marker !== 45 && marker !== 61) {
    return false;
  }
  pos = state.skipChars(pos, marker);
  pos = state.skipSpaces(pos);
  if (pos < max2) {
    return false;
  }
  pos = state.bMarks[startLine] + state.tShift[startLine];
  state.line = next + 1;
  state.tokens.push({
    type: "heading_open",
    hLevel: marker === 61 ? 1 : 2,
    lines: [startLine, state.line],
    level: state.level
  });
  state.tokens.push({
    type: "inline",
    content: state.src.slice(pos, state.eMarks[startLine]).trim(),
    level: state.level + 1,
    lines: [startLine, state.line - 1],
    children: []
  });
  state.tokens.push({
    type: "heading_close",
    hLevel: marker === 61 ? 1 : 2,
    level: state.level
  });
  return true;
}
var html_blocks = {};
[
  "article",
  "aside",
  "button",
  "blockquote",
  "body",
  "canvas",
  "caption",
  "col",
  "colgroup",
  "dd",
  "div",
  "dl",
  "dt",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "iframe",
  "li",
  "map",
  "object",
  "ol",
  "output",
  "p",
  "pre",
  "progress",
  "script",
  "section",
  "style",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "tr",
  "thead",
  "ul",
  "video"
].forEach(function(name2) {
  html_blocks[name2] = true;
});
var HTML_TAG_OPEN_RE = /^<([a-zA-Z]{1,15})[\s\/>]/;
var HTML_TAG_CLOSE_RE = /^<\/([a-zA-Z]{1,15})[\s>]/;
function isLetter$1(ch) {
  var lc = ch | 32;
  return lc >= 97 && lc <= 122;
}
function htmlblock(state, startLine, endLine, silent) {
  var ch, match, nextLine, pos = state.bMarks[startLine], max2 = state.eMarks[startLine], shift = state.tShift[startLine];
  pos += shift;
  if (!state.options.html) {
    return false;
  }
  if (shift > 3 || pos + 2 >= max2) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 60) {
    return false;
  }
  ch = state.src.charCodeAt(pos + 1);
  if (ch === 33 || ch === 63) {
    if (silent) {
      return true;
    }
  } else if (ch === 47 || isLetter$1(ch)) {
    if (ch === 47) {
      match = state.src.slice(pos, max2).match(HTML_TAG_CLOSE_RE);
      if (!match) {
        return false;
      }
    } else {
      match = state.src.slice(pos, max2).match(HTML_TAG_OPEN_RE);
      if (!match) {
        return false;
      }
    }
    if (html_blocks[match[1].toLowerCase()] !== true) {
      return false;
    }
    if (silent) {
      return true;
    }
  } else {
    return false;
  }
  nextLine = startLine + 1;
  while (nextLine < state.lineMax && !state.isEmpty(nextLine)) {
    nextLine++;
  }
  state.line = nextLine;
  state.tokens.push({
    type: "htmlblock",
    level: state.level,
    lines: [startLine, state.line],
    content: state.getLines(startLine, nextLine, 0, true)
  });
  return true;
}
function getLine$1(state, line) {
  var pos = state.bMarks[line] + state.blkIndent, max2 = state.eMarks[line];
  return state.src.substr(pos, max2 - pos);
}
function table(state, startLine, endLine, silent) {
  var ch, lineText, pos, i, nextLine, rows, cell, aligns, t2, tableLines, tbodyLines;
  if (startLine + 2 > endLine) {
    return false;
  }
  nextLine = startLine + 1;
  if (state.tShift[nextLine] < state.blkIndent) {
    return false;
  }
  pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) {
    return false;
  }
  ch = state.src.charCodeAt(pos);
  if (ch !== 124 && ch !== 45 && ch !== 58) {
    return false;
  }
  lineText = getLine$1(state, startLine + 1);
  if (!/^[-:| ]+$/.test(lineText)) {
    return false;
  }
  rows = lineText.split("|");
  if (rows <= 2) {
    return false;
  }
  aligns = [];
  for (i = 0; i < rows.length; i++) {
    t2 = rows[i].trim();
    if (!t2) {
      if (i === 0 || i === rows.length - 1) {
        continue;
      } else {
        return false;
      }
    }
    if (!/^:?-+:?$/.test(t2)) {
      return false;
    }
    if (t2.charCodeAt(t2.length - 1) === 58) {
      aligns.push(t2.charCodeAt(0) === 58 ? "center" : "right");
    } else if (t2.charCodeAt(0) === 58) {
      aligns.push("left");
    } else {
      aligns.push("");
    }
  }
  lineText = getLine$1(state, startLine).trim();
  if (lineText.indexOf("|") === -1) {
    return false;
  }
  rows = lineText.replace(/^\||\|$/g, "").split("|");
  if (aligns.length !== rows.length) {
    return false;
  }
  if (silent) {
    return true;
  }
  state.tokens.push({
    type: "table_open",
    lines: tableLines = [startLine, 0],
    level: state.level++
  });
  state.tokens.push({
    type: "thead_open",
    lines: [startLine, startLine + 1],
    level: state.level++
  });
  state.tokens.push({
    type: "tr_open",
    lines: [startLine, startLine + 1],
    level: state.level++
  });
  for (i = 0; i < rows.length; i++) {
    state.tokens.push({
      type: "th_open",
      align: aligns[i],
      lines: [startLine, startLine + 1],
      level: state.level++
    });
    state.tokens.push({
      type: "inline",
      content: rows[i].trim(),
      lines: [startLine, startLine + 1],
      level: state.level,
      children: []
    });
    state.tokens.push({ type: "th_close", level: --state.level });
  }
  state.tokens.push({ type: "tr_close", level: --state.level });
  state.tokens.push({ type: "thead_close", level: --state.level });
  state.tokens.push({
    type: "tbody_open",
    lines: tbodyLines = [startLine + 2, 0],
    level: state.level++
  });
  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.tShift[nextLine] < state.blkIndent) {
      break;
    }
    lineText = getLine$1(state, nextLine).trim();
    if (lineText.indexOf("|") === -1) {
      break;
    }
    rows = lineText.replace(/^\||\|$/g, "").split("|");
    state.tokens.push({ type: "tr_open", level: state.level++ });
    for (i = 0; i < rows.length; i++) {
      state.tokens.push({ type: "td_open", align: aligns[i], level: state.level++ });
      cell = rows[i].substring(
        rows[i].charCodeAt(0) === 124 ? 1 : 0,
        rows[i].charCodeAt(rows[i].length - 1) === 124 ? rows[i].length - 1 : rows[i].length
      ).trim();
      state.tokens.push({
        type: "inline",
        content: cell,
        level: state.level,
        children: []
      });
      state.tokens.push({ type: "td_close", level: --state.level });
    }
    state.tokens.push({ type: "tr_close", level: --state.level });
  }
  state.tokens.push({ type: "tbody_close", level: --state.level });
  state.tokens.push({ type: "table_close", level: --state.level });
  tableLines[1] = tbodyLines[1] = nextLine;
  state.line = nextLine;
  return true;
}
function skipMarker(state, line) {
  var pos, marker, start = state.bMarks[line] + state.tShift[line], max2 = state.eMarks[line];
  if (start >= max2) {
    return -1;
  }
  marker = state.src.charCodeAt(start++);
  if (marker !== 126 && marker !== 58) {
    return -1;
  }
  pos = state.skipSpaces(start);
  if (start === pos) {
    return -1;
  }
  if (pos >= max2) {
    return -1;
  }
  return pos;
}
function markTightParagraphs$1(state, idx2) {
  var i, l2, level = state.level + 2;
  for (i = idx2 + 2, l2 = state.tokens.length - 2; i < l2; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === "paragraph_open") {
      state.tokens[i + 2].tight = true;
      state.tokens[i].tight = true;
      i += 2;
    }
  }
}
function deflist(state, startLine, endLine, silent) {
  var contentStart, ddLine, dtLine, itemLines, listLines, listTokIdx, nextLine, oldIndent, oldDDIndent, oldParentType, oldTShift, oldTight, prevEmptyEnd, tight;
  if (silent) {
    if (state.ddIndent < 0) {
      return false;
    }
    return skipMarker(state, startLine) >= 0;
  }
  nextLine = startLine + 1;
  if (state.isEmpty(nextLine)) {
    if (++nextLine > endLine) {
      return false;
    }
  }
  if (state.tShift[nextLine] < state.blkIndent) {
    return false;
  }
  contentStart = skipMarker(state, nextLine);
  if (contentStart < 0) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  listTokIdx = state.tokens.length;
  state.tokens.push({
    type: "dl_open",
    lines: listLines = [startLine, 0],
    level: state.level++
  });
  dtLine = startLine;
  ddLine = nextLine;
  OUTER:
    for (; ; ) {
      tight = true;
      prevEmptyEnd = false;
      state.tokens.push({
        type: "dt_open",
        lines: [dtLine, dtLine],
        level: state.level++
      });
      state.tokens.push({
        type: "inline",
        content: state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim(),
        level: state.level + 1,
        lines: [dtLine, dtLine],
        children: []
      });
      state.tokens.push({
        type: "dt_close",
        level: --state.level
      });
      for (; ; ) {
        state.tokens.push({
          type: "dd_open",
          lines: itemLines = [nextLine, 0],
          level: state.level++
        });
        oldTight = state.tight;
        oldDDIndent = state.ddIndent;
        oldIndent = state.blkIndent;
        oldTShift = state.tShift[ddLine];
        oldParentType = state.parentType;
        state.blkIndent = state.ddIndent = state.tShift[ddLine] + 2;
        state.tShift[ddLine] = contentStart - state.bMarks[ddLine];
        state.tight = true;
        state.parentType = "deflist";
        state.parser.tokenize(state, ddLine, endLine, true);
        if (!state.tight || prevEmptyEnd) {
          tight = false;
        }
        prevEmptyEnd = state.line - ddLine > 1 && state.isEmpty(state.line - 1);
        state.tShift[ddLine] = oldTShift;
        state.tight = oldTight;
        state.parentType = oldParentType;
        state.blkIndent = oldIndent;
        state.ddIndent = oldDDIndent;
        state.tokens.push({
          type: "dd_close",
          level: --state.level
        });
        itemLines[1] = nextLine = state.line;
        if (nextLine >= endLine) {
          break OUTER;
        }
        if (state.tShift[nextLine] < state.blkIndent) {
          break OUTER;
        }
        contentStart = skipMarker(state, nextLine);
        if (contentStart < 0) {
          break;
        }
        ddLine = nextLine;
      }
      if (nextLine >= endLine) {
        break;
      }
      dtLine = nextLine;
      if (state.isEmpty(dtLine)) {
        break;
      }
      if (state.tShift[dtLine] < state.blkIndent) {
        break;
      }
      ddLine = dtLine + 1;
      if (ddLine >= endLine) {
        break;
      }
      if (state.isEmpty(ddLine)) {
        ddLine++;
      }
      if (ddLine >= endLine) {
        break;
      }
      if (state.tShift[ddLine] < state.blkIndent) {
        break;
      }
      contentStart = skipMarker(state, ddLine);
      if (contentStart < 0) {
        break;
      }
    }
  state.tokens.push({
    type: "dl_close",
    level: --state.level
  });
  listLines[1] = nextLine;
  state.line = nextLine;
  if (tight) {
    markTightParagraphs$1(state, listTokIdx);
  }
  return true;
}
function paragraph(state, startLine) {
  var endLine, content, terminate, i, l2, nextLine = startLine + 1, terminatorRules;
  endLine = state.lineMax;
  if (nextLine < endLine && !state.isEmpty(nextLine)) {
    terminatorRules = state.parser.ruler.getRules("paragraph");
    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      if (state.tShift[nextLine] - state.blkIndent > 3) {
        continue;
      }
      terminate = false;
      for (i = 0, l2 = terminatorRules.length; i < l2; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) {
        break;
      }
    }
  }
  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
  state.line = nextLine;
  if (content.length) {
    state.tokens.push({
      type: "paragraph_open",
      tight: false,
      lines: [startLine, state.line],
      level: state.level
    });
    state.tokens.push({
      type: "inline",
      content,
      level: state.level + 1,
      lines: [startLine, state.line],
      children: []
    });
    state.tokens.push({
      type: "paragraph_close",
      tight: false,
      level: state.level
    });
  }
  return true;
}
var _rules$1 = [
  ["code", code],
  ["fences", fences, ["paragraph", "blockquote", "list"]],
  ["blockquote", blockquote, ["paragraph", "blockquote", "list"]],
  ["hr", hr, ["paragraph", "blockquote", "list"]],
  ["list", list, ["paragraph", "blockquote"]],
  ["footnote", footnote, ["paragraph"]],
  ["heading", heading, ["paragraph", "blockquote"]],
  ["lheading", lheading],
  ["htmlblock", htmlblock, ["paragraph", "blockquote"]],
  ["table", table, ["paragraph"]],
  ["deflist", deflist, ["paragraph"]],
  ["paragraph", paragraph]
];
function ParserBlock() {
  this.ruler = new Ruler();
  for (var i = 0; i < _rules$1.length; i++) {
    this.ruler.push(_rules$1[i][0], _rules$1[i][1], {
      alt: (_rules$1[i][2] || []).slice()
    });
  }
}
ParserBlock.prototype.tokenize = function(state, startLine, endLine) {
  var rules2 = this.ruler.getRules("");
  var len = rules2.length;
  var line = startLine;
  var hasEmptyLines = false;
  var ok2, i;
  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) {
      break;
    }
    if (state.tShift[line] < state.blkIndent) {
      break;
    }
    for (i = 0; i < len; i++) {
      ok2 = rules2[i](state, line, endLine, false);
      if (ok2) {
        break;
      }
    }
    state.tight = !hasEmptyLines;
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }
    line = state.line;
    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;
      if (line < endLine && state.parentType === "list" && state.isEmpty(line)) {
        break;
      }
      state.line = line;
    }
  }
};
var TABS_SCAN_RE = /[\n\t]/g;
var NEWLINES_RE = /\r[\n\u0085]|[\u2424\u2028\u0085]/g;
var SPACES_RE = /\u00a0/g;
ParserBlock.prototype.parse = function(str2, options, env, outTokens) {
  var state, lineStart = 0, lastTabPos = 0;
  if (!str2) {
    return [];
  }
  str2 = str2.replace(SPACES_RE, " ");
  str2 = str2.replace(NEWLINES_RE, "\n");
  if (str2.indexOf("	") >= 0) {
    str2 = str2.replace(TABS_SCAN_RE, function(match, offset) {
      var result;
      if (str2.charCodeAt(offset) === 10) {
        lineStart = offset + 1;
        lastTabPos = 0;
        return match;
      }
      result = "    ".slice((offset - lineStart - lastTabPos) % 4);
      lastTabPos = offset - lineStart + 1;
      return result;
    });
  }
  state = new StateBlock(str2, this, options, env, outTokens);
  this.tokenize(state, state.line, state.lineMax);
};
function isTerminatorChar(ch) {
  switch (ch) {
    case 10:
    case 92:
    case 96:
    case 42:
    case 95:
    case 94:
    case 91:
    case 93:
    case 33:
    case 38:
    case 60:
    case 62:
    case 123:
    case 125:
    case 36:
    case 37:
    case 64:
    case 126:
    case 43:
    case 61:
    case 58:
      return true;
    default:
      return false;
  }
}
function text(state, silent) {
  var pos = state.pos;
  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }
  if (pos === state.pos) {
    return false;
  }
  if (!silent) {
    state.pending += state.src.slice(state.pos, pos);
  }
  state.pos = pos;
  return true;
}
function newline(state, silent) {
  var pmax, max2, pos = state.pos;
  if (state.src.charCodeAt(pos) !== 10) {
    return false;
  }
  pmax = state.pending.length - 1;
  max2 = state.posMax;
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) {
        for (var i = pmax - 2; i >= 0; i--) {
          if (state.pending.charCodeAt(i) !== 32) {
            state.pending = state.pending.substring(0, i + 1);
            break;
          }
        }
        state.push({
          type: "hardbreak",
          level: state.level
        });
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push({
          type: "softbreak",
          level: state.level
        });
      }
    } else {
      state.push({
        type: "softbreak",
        level: state.level
      });
    }
  }
  pos++;
  while (pos < max2 && state.src.charCodeAt(pos) === 32) {
    pos++;
  }
  state.pos = pos;
  return true;
}
var ESCAPED = [];
for (var i$1 = 0; i$1 < 256; i$1++) {
  ESCAPED.push(0);
}
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(ch) {
  ESCAPED[ch.charCodeAt(0)] = 1;
});
function escape(state, silent) {
  var ch, pos = state.pos, max2 = state.posMax;
  if (state.src.charCodeAt(pos) !== 92) {
    return false;
  }
  pos++;
  if (pos < max2) {
    ch = state.src.charCodeAt(pos);
    if (ch < 256 && ESCAPED[ch] !== 0) {
      if (!silent) {
        state.pending += state.src[pos];
      }
      state.pos += 2;
      return true;
    }
    if (ch === 10) {
      if (!silent) {
        state.push({
          type: "hardbreak",
          level: state.level
        });
      }
      pos++;
      while (pos < max2 && state.src.charCodeAt(pos) === 32) {
        pos++;
      }
      state.pos = pos;
      return true;
    }
  }
  if (!silent) {
    state.pending += "\\";
  }
  state.pos++;
  return true;
}
function backticks(state, silent) {
  var start, max2, marker, matchStart, matchEnd, pos = state.pos, ch = state.src.charCodeAt(pos);
  if (ch !== 96) {
    return false;
  }
  start = pos;
  pos++;
  max2 = state.posMax;
  while (pos < max2 && state.src.charCodeAt(pos) === 96) {
    pos++;
  }
  marker = state.src.slice(start, pos);
  matchStart = matchEnd = pos;
  while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1) {
    matchEnd = matchStart + 1;
    while (matchEnd < max2 && state.src.charCodeAt(matchEnd) === 96) {
      matchEnd++;
    }
    if (matchEnd - matchStart === marker.length) {
      if (!silent) {
        state.push({
          type: "code",
          content: state.src.slice(pos, matchStart).replace(/[ \n]+/g, " ").trim(),
          block: false,
          level: state.level
        });
      }
      state.pos = matchEnd;
      return true;
    }
  }
  if (!silent) {
    state.pending += marker;
  }
  state.pos += marker.length;
  return true;
}
function del(state, silent) {
  var found, pos, stack, max2 = state.posMax, start = state.pos, lastChar, nextChar;
  if (state.src.charCodeAt(start) !== 126) {
    return false;
  }
  if (silent) {
    return false;
  }
  if (start + 4 >= max2) {
    return false;
  }
  if (state.src.charCodeAt(start + 1) !== 126) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);
  if (lastChar === 126) {
    return false;
  }
  if (nextChar === 126) {
    return false;
  }
  if (nextChar === 32 || nextChar === 10) {
    return false;
  }
  pos = start + 2;
  while (pos < max2 && state.src.charCodeAt(pos) === 126) {
    pos++;
  }
  if (pos > start + 3) {
    state.pos += pos - start;
    if (!silent) {
      state.pending += state.src.slice(start, pos);
    }
    return true;
  }
  state.pos = start + 2;
  stack = 1;
  while (state.pos + 1 < max2) {
    if (state.src.charCodeAt(state.pos) === 126) {
      if (state.src.charCodeAt(state.pos + 1) === 126) {
        lastChar = state.src.charCodeAt(state.pos - 1);
        nextChar = state.pos + 2 < max2 ? state.src.charCodeAt(state.pos + 2) : -1;
        if (nextChar !== 126 && lastChar !== 126) {
          if (lastChar !== 32 && lastChar !== 10) {
            stack--;
          } else if (nextChar !== 32 && nextChar !== 10) {
            stack++;
          }
          if (stack <= 0) {
            found = true;
            break;
          }
        }
      }
    }
    state.parser.skipToken(state);
  }
  if (!found) {
    state.pos = start;
    return false;
  }
  state.posMax = state.pos;
  state.pos = start + 2;
  if (!silent) {
    state.push({ type: "del_open", level: state.level++ });
    state.parser.tokenize(state);
    state.push({ type: "del_close", level: --state.level });
  }
  state.pos = state.posMax + 2;
  state.posMax = max2;
  return true;
}
function ins(state, silent) {
  var found, pos, stack, max2 = state.posMax, start = state.pos, lastChar, nextChar;
  if (state.src.charCodeAt(start) !== 43) {
    return false;
  }
  if (silent) {
    return false;
  }
  if (start + 4 >= max2) {
    return false;
  }
  if (state.src.charCodeAt(start + 1) !== 43) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);
  if (lastChar === 43) {
    return false;
  }
  if (nextChar === 43) {
    return false;
  }
  if (nextChar === 32 || nextChar === 10) {
    return false;
  }
  pos = start + 2;
  while (pos < max2 && state.src.charCodeAt(pos) === 43) {
    pos++;
  }
  if (pos !== start + 2) {
    state.pos += pos - start;
    if (!silent) {
      state.pending += state.src.slice(start, pos);
    }
    return true;
  }
  state.pos = start + 2;
  stack = 1;
  while (state.pos + 1 < max2) {
    if (state.src.charCodeAt(state.pos) === 43) {
      if (state.src.charCodeAt(state.pos + 1) === 43) {
        lastChar = state.src.charCodeAt(state.pos - 1);
        nextChar = state.pos + 2 < max2 ? state.src.charCodeAt(state.pos + 2) : -1;
        if (nextChar !== 43 && lastChar !== 43) {
          if (lastChar !== 32 && lastChar !== 10) {
            stack--;
          } else if (nextChar !== 32 && nextChar !== 10) {
            stack++;
          }
          if (stack <= 0) {
            found = true;
            break;
          }
        }
      }
    }
    state.parser.skipToken(state);
  }
  if (!found) {
    state.pos = start;
    return false;
  }
  state.posMax = state.pos;
  state.pos = start + 2;
  if (!silent) {
    state.push({ type: "ins_open", level: state.level++ });
    state.parser.tokenize(state);
    state.push({ type: "ins_close", level: --state.level });
  }
  state.pos = state.posMax + 2;
  state.posMax = max2;
  return true;
}
function mark(state, silent) {
  var found, pos, stack, max2 = state.posMax, start = state.pos, lastChar, nextChar;
  if (state.src.charCodeAt(start) !== 61) {
    return false;
  }
  if (silent) {
    return false;
  }
  if (start + 4 >= max2) {
    return false;
  }
  if (state.src.charCodeAt(start + 1) !== 61) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);
  if (lastChar === 61) {
    return false;
  }
  if (nextChar === 61) {
    return false;
  }
  if (nextChar === 32 || nextChar === 10) {
    return false;
  }
  pos = start + 2;
  while (pos < max2 && state.src.charCodeAt(pos) === 61) {
    pos++;
  }
  if (pos !== start + 2) {
    state.pos += pos - start;
    if (!silent) {
      state.pending += state.src.slice(start, pos);
    }
    return true;
  }
  state.pos = start + 2;
  stack = 1;
  while (state.pos + 1 < max2) {
    if (state.src.charCodeAt(state.pos) === 61) {
      if (state.src.charCodeAt(state.pos + 1) === 61) {
        lastChar = state.src.charCodeAt(state.pos - 1);
        nextChar = state.pos + 2 < max2 ? state.src.charCodeAt(state.pos + 2) : -1;
        if (nextChar !== 61 && lastChar !== 61) {
          if (lastChar !== 32 && lastChar !== 10) {
            stack--;
          } else if (nextChar !== 32 && nextChar !== 10) {
            stack++;
          }
          if (stack <= 0) {
            found = true;
            break;
          }
        }
      }
    }
    state.parser.skipToken(state);
  }
  if (!found) {
    state.pos = start;
    return false;
  }
  state.posMax = state.pos;
  state.pos = start + 2;
  if (!silent) {
    state.push({ type: "mark_open", level: state.level++ });
    state.parser.tokenize(state);
    state.push({ type: "mark_close", level: --state.level });
  }
  state.pos = state.posMax + 2;
  state.posMax = max2;
  return true;
}
function isAlphaNum(code2) {
  return code2 >= 48 && code2 <= 57 || code2 >= 65 && code2 <= 90 || code2 >= 97 && code2 <= 122;
}
function scanDelims(state, start) {
  var pos = start, lastChar, nextChar, count, can_open = true, can_close = true, max2 = state.posMax, marker = state.src.charCodeAt(start);
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  while (pos < max2 && state.src.charCodeAt(pos) === marker) {
    pos++;
  }
  if (pos >= max2) {
    can_open = false;
  }
  count = pos - start;
  if (count >= 4) {
    can_open = can_close = false;
  } else {
    nextChar = pos < max2 ? state.src.charCodeAt(pos) : -1;
    if (nextChar === 32 || nextChar === 10) {
      can_open = false;
    }
    if (lastChar === 32 || lastChar === 10) {
      can_close = false;
    }
    if (marker === 95) {
      if (isAlphaNum(lastChar)) {
        can_open = false;
      }
      if (isAlphaNum(nextChar)) {
        can_close = false;
      }
    }
  }
  return {
    can_open,
    can_close,
    delims: count
  };
}
function emphasis(state, silent) {
  var startCount, count, found, oldCount, newCount, stack, res, max2 = state.posMax, start = state.pos, marker = state.src.charCodeAt(start);
  if (marker !== 95 && marker !== 42) {
    return false;
  }
  if (silent) {
    return false;
  }
  res = scanDelims(state, start);
  startCount = res.delims;
  if (!res.can_open) {
    state.pos += startCount;
    if (!silent) {
      state.pending += state.src.slice(start, state.pos);
    }
    return true;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  state.pos = start + startCount;
  stack = [startCount];
  while (state.pos < max2) {
    if (state.src.charCodeAt(state.pos) === marker) {
      res = scanDelims(state, state.pos);
      count = res.delims;
      if (res.can_close) {
        oldCount = stack.pop();
        newCount = count;
        while (oldCount !== newCount) {
          if (newCount < oldCount) {
            stack.push(oldCount - newCount);
            break;
          }
          newCount -= oldCount;
          if (stack.length === 0) {
            break;
          }
          state.pos += oldCount;
          oldCount = stack.pop();
        }
        if (stack.length === 0) {
          startCount = oldCount;
          found = true;
          break;
        }
        state.pos += count;
        continue;
      }
      if (res.can_open) {
        stack.push(count);
      }
      state.pos += count;
      continue;
    }
    state.parser.skipToken(state);
  }
  if (!found) {
    state.pos = start;
    return false;
  }
  state.posMax = state.pos;
  state.pos = start + startCount;
  if (!silent) {
    if (startCount === 2 || startCount === 3) {
      state.push({ type: "strong_open", level: state.level++ });
    }
    if (startCount === 1 || startCount === 3) {
      state.push({ type: "em_open", level: state.level++ });
    }
    state.parser.tokenize(state);
    if (startCount === 1 || startCount === 3) {
      state.push({ type: "em_close", level: --state.level });
    }
    if (startCount === 2 || startCount === 3) {
      state.push({ type: "strong_close", level: --state.level });
    }
  }
  state.pos = state.posMax + startCount;
  state.posMax = max2;
  return true;
}
var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;
function sub(state, silent) {
  var found, content, max2 = state.posMax, start = state.pos;
  if (state.src.charCodeAt(start) !== 126) {
    return false;
  }
  if (silent) {
    return false;
  }
  if (start + 2 >= max2) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  state.pos = start + 1;
  while (state.pos < max2) {
    if (state.src.charCodeAt(state.pos) === 126) {
      found = true;
      break;
    }
    state.parser.skipToken(state);
  }
  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }
  content = state.src.slice(start + 1, state.pos);
  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  }
  state.posMax = state.pos;
  state.pos = start + 1;
  if (!silent) {
    state.push({
      type: "sub",
      level: state.level,
      content: content.replace(UNESCAPE_RE, "$1")
    });
  }
  state.pos = state.posMax + 1;
  state.posMax = max2;
  return true;
}
var UNESCAPE_RE$1 = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;
function sup(state, silent) {
  var found, content, max2 = state.posMax, start = state.pos;
  if (state.src.charCodeAt(start) !== 94) {
    return false;
  }
  if (silent) {
    return false;
  }
  if (start + 2 >= max2) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  state.pos = start + 1;
  while (state.pos < max2) {
    if (state.src.charCodeAt(state.pos) === 94) {
      found = true;
      break;
    }
    state.parser.skipToken(state);
  }
  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }
  content = state.src.slice(start + 1, state.pos);
  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  }
  state.posMax = state.pos;
  state.pos = start + 1;
  if (!silent) {
    state.push({
      type: "sup",
      level: state.level,
      content: content.replace(UNESCAPE_RE$1, "$1")
    });
  }
  state.pos = state.posMax + 1;
  state.posMax = max2;
  return true;
}
function links(state, silent) {
  var labelStart, labelEnd, label2, href, title, pos, ref, code2, isImage = false, oldPos = state.pos, max2 = state.posMax, start = state.pos, marker = state.src.charCodeAt(start);
  if (marker === 33) {
    isImage = true;
    marker = state.src.charCodeAt(++start);
  }
  if (marker !== 91) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  labelStart = start + 1;
  labelEnd = parseLinkLabel(state, start);
  if (labelEnd < 0) {
    return false;
  }
  pos = labelEnd + 1;
  if (pos < max2 && state.src.charCodeAt(pos) === 40) {
    pos++;
    for (; pos < max2; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (code2 !== 32 && code2 !== 10) {
        break;
      }
    }
    if (pos >= max2) {
      return false;
    }
    start = pos;
    if (parseLinkDestination(state, pos)) {
      href = state.linkContent;
      pos = state.pos;
    } else {
      href = "";
    }
    start = pos;
    for (; pos < max2; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (code2 !== 32 && code2 !== 10) {
        break;
      }
    }
    if (pos < max2 && start !== pos && parseLinkTitle(state, pos)) {
      title = state.linkContent;
      pos = state.pos;
      for (; pos < max2; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (code2 !== 32 && code2 !== 10) {
          break;
        }
      }
    } else {
      title = "";
    }
    if (pos >= max2 || state.src.charCodeAt(pos) !== 41) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    if (state.linkLevel > 0) {
      return false;
    }
    for (; pos < max2; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (code2 !== 32 && code2 !== 10) {
        break;
      }
    }
    if (pos < max2 && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = parseLinkLabel(state, pos);
      if (pos >= 0) {
        label2 = state.src.slice(start, pos++);
      } else {
        pos = start - 1;
      }
    }
    if (!label2) {
      if (typeof label2 === "undefined") {
        pos = labelEnd + 1;
      }
      label2 = state.src.slice(labelStart, labelEnd);
    }
    ref = state.env.references[normalizeReference(label2)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;
    if (isImage) {
      state.push({
        type: "image",
        src: href,
        title,
        alt: state.src.substr(labelStart, labelEnd - labelStart),
        level: state.level
      });
    } else {
      state.push({
        type: "link_open",
        href,
        title,
        level: state.level++
      });
      state.linkLevel++;
      state.parser.tokenize(state);
      state.linkLevel--;
      state.push({ type: "link_close", level: --state.level });
    }
  }
  state.pos = pos;
  state.posMax = max2;
  return true;
}
function footnote_inline(state, silent) {
  var labelStart, labelEnd, footnoteId, oldLength, max2 = state.posMax, start = state.pos;
  if (start + 2 >= max2) {
    return false;
  }
  if (state.src.charCodeAt(start) !== 94) {
    return false;
  }
  if (state.src.charCodeAt(start + 1) !== 91) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  labelStart = start + 2;
  labelEnd = parseLinkLabel(state, start + 1);
  if (labelEnd < 0) {
    return false;
  }
  if (!silent) {
    if (!state.env.footnotes) {
      state.env.footnotes = {};
    }
    if (!state.env.footnotes.list) {
      state.env.footnotes.list = [];
    }
    footnoteId = state.env.footnotes.list.length;
    state.pos = labelStart;
    state.posMax = labelEnd;
    state.push({
      type: "footnote_ref",
      id: footnoteId,
      level: state.level
    });
    state.linkLevel++;
    oldLength = state.tokens.length;
    state.parser.tokenize(state);
    state.env.footnotes.list[footnoteId] = { tokens: state.tokens.splice(oldLength) };
    state.linkLevel--;
  }
  state.pos = labelEnd + 1;
  state.posMax = max2;
  return true;
}
function footnote_ref(state, silent) {
  var label2, pos, footnoteId, footnoteSubId, max2 = state.posMax, start = state.pos;
  if (start + 3 > max2) {
    return false;
  }
  if (!state.env.footnotes || !state.env.footnotes.refs) {
    return false;
  }
  if (state.src.charCodeAt(start) !== 91) {
    return false;
  }
  if (state.src.charCodeAt(start + 1) !== 94) {
    return false;
  }
  if (state.level >= state.options.maxNesting) {
    return false;
  }
  for (pos = start + 2; pos < max2; pos++) {
    if (state.src.charCodeAt(pos) === 32) {
      return false;
    }
    if (state.src.charCodeAt(pos) === 10) {
      return false;
    }
    if (state.src.charCodeAt(pos) === 93) {
      break;
    }
  }
  if (pos === start + 2) {
    return false;
  }
  if (pos >= max2) {
    return false;
  }
  pos++;
  label2 = state.src.slice(start + 2, pos - 1);
  if (typeof state.env.footnotes.refs[":" + label2] === "undefined") {
    return false;
  }
  if (!silent) {
    if (!state.env.footnotes.list) {
      state.env.footnotes.list = [];
    }
    if (state.env.footnotes.refs[":" + label2] < 0) {
      footnoteId = state.env.footnotes.list.length;
      state.env.footnotes.list[footnoteId] = { label: label2, count: 0 };
      state.env.footnotes.refs[":" + label2] = footnoteId;
    } else {
      footnoteId = state.env.footnotes.refs[":" + label2];
    }
    footnoteSubId = state.env.footnotes.list[footnoteId].count;
    state.env.footnotes.list[footnoteId].count++;
    state.push({
      type: "footnote_ref",
      id: footnoteId,
      subId: footnoteSubId,
      level: state.level
    });
  }
  state.pos = pos;
  state.posMax = max2;
  return true;
}
var url_schemas = [
  "coap",
  "doi",
  "javascript",
  "aaa",
  "aaas",
  "about",
  "acap",
  "cap",
  "cid",
  "crid",
  "data",
  "dav",
  "dict",
  "dns",
  "file",
  "ftp",
  "geo",
  "go",
  "gopher",
  "h323",
  "http",
  "https",
  "iax",
  "icap",
  "im",
  "imap",
  "info",
  "ipp",
  "iris",
  "iris.beep",
  "iris.xpc",
  "iris.xpcs",
  "iris.lwz",
  "ldap",
  "mailto",
  "mid",
  "msrp",
  "msrps",
  "mtqp",
  "mupdate",
  "news",
  "nfs",
  "ni",
  "nih",
  "nntp",
  "opaquelocktoken",
  "pop",
  "pres",
  "rtsp",
  "service",
  "session",
  "shttp",
  "sieve",
  "sip",
  "sips",
  "sms",
  "snmp",
  "soap.beep",
  "soap.beeps",
  "tag",
  "tel",
  "telnet",
  "tftp",
  "thismessage",
  "tn3270",
  "tip",
  "tv",
  "urn",
  "vemmi",
  "ws",
  "wss",
  "xcon",
  "xcon-userid",
  "xmlrpc.beep",
  "xmlrpc.beeps",
  "xmpp",
  "z39.50r",
  "z39.50s",
  "adiumxtra",
  "afp",
  "afs",
  "aim",
  "apt",
  "attachment",
  "aw",
  "beshare",
  "bitcoin",
  "bolo",
  "callto",
  "chrome",
  "chrome-extension",
  "com-eventbrite-attendee",
  "content",
  "cvs",
  "dlna-playsingle",
  "dlna-playcontainer",
  "dtn",
  "dvb",
  "ed2k",
  "facetime",
  "feed",
  "finger",
  "fish",
  "gg",
  "git",
  "gizmoproject",
  "gtalk",
  "hcp",
  "icon",
  "ipn",
  "irc",
  "irc6",
  "ircs",
  "itms",
  "jar",
  "jms",
  "keyparc",
  "lastfm",
  "ldaps",
  "magnet",
  "maps",
  "market",
  "message",
  "mms",
  "ms-help",
  "msnim",
  "mumble",
  "mvn",
  "notes",
  "oid",
  "palm",
  "paparazzi",
  "platform",
  "proxy",
  "psyc",
  "query",
  "res",
  "resource",
  "rmi",
  "rsync",
  "rtmp",
  "secondlife",
  "sftp",
  "sgn",
  "skype",
  "smb",
  "soldat",
  "spotify",
  "ssh",
  "steam",
  "svn",
  "teamspeak",
  "things",
  "udp",
  "unreal",
  "ut2004",
  "ventrilo",
  "view-source",
  "webcal",
  "wtai",
  "wyciwyg",
  "xfire",
  "xri",
  "ymsgr"
];
var EMAIL_RE = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
var AUTOLINK_RE = /^<([a-zA-Z.\-]{1,25}):([^<>\x00-\x20]*)>/;
function autolink(state, silent) {
  var tail, linkMatch, emailMatch, url, fullUrl, pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60) {
    return false;
  }
  tail = state.src.slice(pos);
  if (tail.indexOf(">") < 0) {
    return false;
  }
  linkMatch = tail.match(AUTOLINK_RE);
  if (linkMatch) {
    if (url_schemas.indexOf(linkMatch[1].toLowerCase()) < 0) {
      return false;
    }
    url = linkMatch[0].slice(1, -1);
    fullUrl = normalizeLink(url);
    if (!state.parser.validateLink(url)) {
      return false;
    }
    if (!silent) {
      state.push({
        type: "link_open",
        href: fullUrl,
        level: state.level
      });
      state.push({
        type: "text",
        content: url,
        level: state.level + 1
      });
      state.push({ type: "link_close", level: state.level });
    }
    state.pos += linkMatch[0].length;
    return true;
  }
  emailMatch = tail.match(EMAIL_RE);
  if (emailMatch) {
    url = emailMatch[0].slice(1, -1);
    fullUrl = normalizeLink("mailto:" + url);
    if (!state.parser.validateLink(fullUrl)) {
      return false;
    }
    if (!silent) {
      state.push({
        type: "link_open",
        href: fullUrl,
        level: state.level
      });
      state.push({
        type: "text",
        content: url,
        level: state.level + 1
      });
      state.push({ type: "link_close", level: state.level });
    }
    state.pos += emailMatch[0].length;
    return true;
  }
  return false;
}
function replace$1(regex, options) {
  regex = regex.source;
  options = options || "";
  return function self(name2, val) {
    if (!name2) {
      return new RegExp(regex, options);
    }
    val = val.source || val;
    regex = regex.replace(name2, val);
    return self;
  };
}
var attr_name = /[a-zA-Z_:][a-zA-Z0-9:._-]*/;
var unquoted = /[^"'=<>`\x00-\x20]+/;
var single_quoted = /'[^']*'/;
var double_quoted = /"[^"]*"/;
var attr_value = replace$1(/(?:unquoted|single_quoted|double_quoted)/)("unquoted", unquoted)("single_quoted", single_quoted)("double_quoted", double_quoted)();
var attribute = replace$1(/(?:\s+attr_name(?:\s*=\s*attr_value)?)/)("attr_name", attr_name)("attr_value", attr_value)();
var open_tag = replace$1(/<[A-Za-z][A-Za-z0-9]*attribute*\s*\/?>/)("attribute", attribute)();
var close_tag = /<\/[A-Za-z][A-Za-z0-9]*\s*>/;
var comment = /<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->/;
var processing = /<[?].*?[?]>/;
var declaration = /<![A-Z]+\s+[^>]*>/;
var cdata = /<!\[CDATA\[[\s\S]*?\]\]>/;
var HTML_TAG_RE = replace$1(/^(?:open_tag|close_tag|comment|processing|declaration|cdata)/)("open_tag", open_tag)("close_tag", close_tag)("comment", comment)("processing", processing)("declaration", declaration)("cdata", cdata)();
function isLetter$2(ch) {
  var lc = ch | 32;
  return lc >= 97 && lc <= 122;
}
function htmltag(state, silent) {
  var ch, match, max2, pos = state.pos;
  if (!state.options.html) {
    return false;
  }
  max2 = state.posMax;
  if (state.src.charCodeAt(pos) !== 60 || pos + 2 >= max2) {
    return false;
  }
  ch = state.src.charCodeAt(pos + 1);
  if (ch !== 33 && ch !== 63 && ch !== 47 && !isLetter$2(ch)) {
    return false;
  }
  match = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match) {
    return false;
  }
  if (!silent) {
    state.push({
      type: "htmltag",
      content: state.src.slice(pos, pos + match[0].length),
      level: state.level
    });
  }
  state.pos += match[0].length;
  return true;
}
var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
function entity(state, silent) {
  var ch, code2, match, pos = state.pos, max2 = state.posMax;
  if (state.src.charCodeAt(pos) !== 38) {
    return false;
  }
  if (pos + 1 < max2) {
    ch = state.src.charCodeAt(pos + 1);
    if (ch === 35) {
      match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          code2 = match[1][0].toLowerCase() === "x" ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          state.pending += isValidEntityCode(code2) ? fromCodePoint(code2) : fromCodePoint(65533);
        }
        state.pos += match[0].length;
        return true;
      }
    } else {
      match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        var decoded = decodeEntity(match[1]);
        if (match[1] !== decoded) {
          if (!silent) {
            state.pending += decoded;
          }
          state.pos += match[0].length;
          return true;
        }
      }
    }
  }
  if (!silent) {
    state.pending += "&";
  }
  state.pos++;
  return true;
}
var _rules$2 = [
  ["text", text],
  ["newline", newline],
  ["escape", escape],
  ["backticks", backticks],
  ["del", del],
  ["ins", ins],
  ["mark", mark],
  ["emphasis", emphasis],
  ["sub", sub],
  ["sup", sup],
  ["links", links],
  ["footnote_inline", footnote_inline],
  ["footnote_ref", footnote_ref],
  ["autolink", autolink],
  ["htmltag", htmltag],
  ["entity", entity]
];
function ParserInline() {
  this.ruler = new Ruler();
  for (var i = 0; i < _rules$2.length; i++) {
    this.ruler.push(_rules$2[i][0], _rules$2[i][1]);
  }
  this.validateLink = validateLink;
}
ParserInline.prototype.skipToken = function(state) {
  var rules2 = this.ruler.getRules("");
  var len = rules2.length;
  var pos = state.pos;
  var i, cached_pos;
  if ((cached_pos = state.cacheGet(pos)) > 0) {
    state.pos = cached_pos;
    return;
  }
  for (i = 0; i < len; i++) {
    if (rules2[i](state, true)) {
      state.cacheSet(pos, state.pos);
      return;
    }
  }
  state.pos++;
  state.cacheSet(pos, state.pos);
};
ParserInline.prototype.tokenize = function(state) {
  var rules2 = this.ruler.getRules("");
  var len = rules2.length;
  var end2 = state.posMax;
  var ok2, i;
  while (state.pos < end2) {
    for (i = 0; i < len; i++) {
      ok2 = rules2[i](state, false);
      if (ok2) {
        break;
      }
    }
    if (ok2) {
      if (state.pos >= end2) {
        break;
      }
      continue;
    }
    state.pending += state.src[state.pos++];
  }
  if (state.pending) {
    state.pushPending();
  }
};
ParserInline.prototype.parse = function(str2, options, env, outTokens) {
  var state = new StateInline(str2, this, options, env, outTokens);
  this.tokenize(state);
};
function validateLink(url) {
  var BAD_PROTOCOLS = ["vbscript", "javascript", "file", "data"];
  var str2 = url.trim().toLowerCase();
  str2 = replaceEntities(str2);
  if (str2.indexOf(":") !== -1 && BAD_PROTOCOLS.indexOf(str2.split(":")[0]) !== -1) {
    return false;
  }
  return true;
}
var defaultConfig = {
  options: {
    html: false,
    // Enable HTML tags in source
    xhtmlOut: false,
    // Use '/' to close single tags (<br />)
    breaks: false,
    // Convert '\n' in paragraphs into <br>
    langPrefix: "language-",
    // CSS language prefix for fenced blocks
    linkTarget: "",
    // set target to open link in
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: "“”‘’",
    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    maxNesting: 20
    // Internal protection, recursion limit
  },
  components: {
    core: {
      rules: [
        "block",
        "inline",
        "references",
        "replacements",
        "smartquotes",
        "references",
        "abbr2",
        "footnote_tail"
      ]
    },
    block: {
      rules: [
        "blockquote",
        "code",
        "fences",
        "footnote",
        "heading",
        "hr",
        "htmlblock",
        "lheading",
        "list",
        "paragraph",
        "table"
      ]
    },
    inline: {
      rules: [
        "autolink",
        "backticks",
        "del",
        "emphasis",
        "entity",
        "escape",
        "footnote_ref",
        "htmltag",
        "links",
        "newline",
        "text"
      ]
    }
  }
};
var fullConfig = {
  options: {
    html: false,
    // Enable HTML tags in source
    xhtmlOut: false,
    // Use '/' to close single tags (<br />)
    breaks: false,
    // Convert '\n' in paragraphs into <br>
    langPrefix: "language-",
    // CSS language prefix for fenced blocks
    linkTarget: "",
    // set target to open link in
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: "“”‘’",
    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    maxNesting: 20
    // Internal protection, recursion limit
  },
  components: {
    // Don't restrict core/block/inline rules
    core: {},
    block: {},
    inline: {}
  }
};
var commonmarkConfig = {
  options: {
    html: true,
    // Enable HTML tags in source
    xhtmlOut: true,
    // Use '/' to close single tags (<br />)
    breaks: false,
    // Convert '\n' in paragraphs into <br>
    langPrefix: "language-",
    // CSS language prefix for fenced blocks
    linkTarget: "",
    // set target to open link in
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: "“”‘’",
    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    maxNesting: 20
    // Internal protection, recursion limit
  },
  components: {
    core: {
      rules: [
        "block",
        "inline",
        "references",
        "abbr2"
      ]
    },
    block: {
      rules: [
        "blockquote",
        "code",
        "fences",
        "heading",
        "hr",
        "htmlblock",
        "lheading",
        "list",
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "autolink",
        "backticks",
        "emphasis",
        "entity",
        "escape",
        "htmltag",
        "links",
        "newline",
        "text"
      ]
    }
  }
};
var config$2 = {
  "default": defaultConfig,
  "full": fullConfig,
  "commonmark": commonmarkConfig
};
function StateCore(instance, str2, env) {
  this.src = str2;
  this.env = env;
  this.options = instance.options;
  this.tokens = [];
  this.inlineMode = false;
  this.inline = instance.inline;
  this.block = instance.block;
  this.renderer = instance.renderer;
  this.typographer = instance.typographer;
}
function Remarkable(preset, options) {
  if (typeof preset !== "string") {
    options = preset;
    preset = "default";
  }
  if (options && options.linkify != null) {
    console.warn(
      "linkify option is removed. Use linkify plugin instead:\n\nimport Remarkable from 'remarkable';\nimport linkify from 'remarkable/linkify';\nnew Remarkable().use(linkify)\n"
    );
  }
  this.inline = new ParserInline();
  this.block = new ParserBlock();
  this.core = new Core();
  this.renderer = new Renderer();
  this.ruler = new Ruler();
  this.options = {};
  this.configure(config$2[preset]);
  this.set(options || {});
}
Remarkable.prototype.set = function(options) {
  assign(this.options, options);
};
Remarkable.prototype.configure = function(presets) {
  var self = this;
  if (!presets) {
    throw new Error("Wrong `remarkable` preset, check name/content");
  }
  if (presets.options) {
    self.set(presets.options);
  }
  if (presets.components) {
    Object.keys(presets.components).forEach(function(name2) {
      if (presets.components[name2].rules) {
        self[name2].ruler.enable(presets.components[name2].rules, true);
      }
    });
  }
};
Remarkable.prototype.use = function(plugin2, options) {
  plugin2(this, options);
  return this;
};
Remarkable.prototype.parse = function(str2, env) {
  var state = new StateCore(this, str2, env);
  this.core.process(state);
  return state.tokens;
};
Remarkable.prototype.render = function(str2, env) {
  env = env || {};
  return this.renderer.render(this.parse(str2, env), this.options, env);
};
Remarkable.prototype.parseInline = function(str2, env) {
  var state = new StateCore(this, str2, env);
  state.inlineMode = true;
  this.core.process(state);
  return state.tokens;
};
Remarkable.prototype.renderInline = function(str2, env) {
  env = env || {};
  return this.renderer.render(this.parseInline(str2, env), this.options, env);
};
const testPath = "npm2url/dist/index.cjs";
const defaultProviders = {
  jsdelivr: (path) => `https://cdn.jsdelivr.net/npm/${path}`,
  unpkg: (path) => `https://unpkg.com/${path}`
};
async function checkUrl(url, signal) {
  const res = await fetch(url, {
    signal
  });
  if (!res.ok) {
    throw res;
  }
  await res.text();
}
class UrlBuilder {
  constructor() {
    this.providers = { ...defaultProviders };
    this.provider = "jsdelivr";
  }
  /**
   * Get the fastest provider name.
   * If none of the providers returns a valid response within `timeout`, an error will be thrown.
   */
  async getFastestProvider(timeout = 5e3, path = testPath) {
    const controller = new AbortController();
    let timer = 0;
    try {
      return await new Promise((resolve, reject) => {
        Promise.all(
          Object.entries(this.providers).map(async ([name2, factory2]) => {
            try {
              await checkUrl(factory2(path), controller.signal);
              resolve(name2);
            } catch {
            }
          })
        ).then(() => reject(new Error("All providers failed")));
        timer = setTimeout(reject, timeout, new Error("Timed out"));
      });
    } finally {
      controller.abort();
      clearTimeout(timer);
    }
  }
  /**
   * Set the current provider to the fastest provider found by `getFastestProvider`.
   */
  async findFastestProvider(timeout, path) {
    this.provider = await this.getFastestProvider(timeout, path);
    return this.provider;
  }
  setProvider(name2, factory2) {
    if (factory2) {
      this.providers[name2] = factory2;
    } else {
      delete this.providers[name2];
    }
  }
  getFullUrl(path, provider = this.provider) {
    if (path.includes("://")) {
      return path;
    }
    const factory2 = this.providers[provider];
    if (!factory2) {
      throw new Error(`Provider ${provider} not found`);
    }
    return factory2(path);
  }
}
class Hook {
  constructor() {
    this.listeners = [];
  }
  tap(fn) {
    this.listeners.push(fn);
    return () => this.revoke(fn);
  }
  revoke(fn) {
    const i = this.listeners.indexOf(fn);
    if (i >= 0)
      this.listeners.splice(i, 1);
  }
  revokeAll() {
    this.listeners.splice(0);
  }
  call(...args) {
    for (const fn of this.listeners) {
      fn(...args);
    }
  }
}
const escapeChars = {
  "&": "&amp;",
  "<": "&lt;",
  '"': "&quot;"
};
function escapeHtml(html) {
  return html.replace(/[&<"]/g, (m2) => escapeChars[m2]);
}
function escapeScript(content) {
  return content.replace(/<(\/script>)/g, "\\x3c$2");
}
function htmlOpen(tagName, attrs) {
  const attrStr = attrs ? Object.entries(attrs).map(([key2, value]) => {
    if (value == null || value === false)
      return;
    key2 = ` ${escapeHtml(key2)}`;
    if (value === true)
      return key2;
    return `${key2}="${escapeHtml(value)}"`;
  }).filter(Boolean).join("") : "";
  return `<${tagName}${attrStr}>`;
}
function htmlClose(tagName) {
  return `</${tagName}>`;
}
function wrapHtml(tagName, content, attrs) {
  if (content == null)
    return htmlOpen(tagName, attrs);
  return htmlOpen(tagName, attrs) + (content || "") + htmlClose(tagName);
}
function buildCode(fn, args) {
  const params = args.map((arg) => {
    if (typeof arg === "function")
      return arg.toString();
    return JSON.stringify(arg ?? null);
  }).join(",");
  return `(${fn.toString()})(${params})`;
}
function persistJS(items, context) {
  return items.map((item) => {
    if (item.type === "script") {
      const { textContent, ...rest } = item.data;
      return wrapHtml(
        "script",
        textContent || "",
        rest
      );
    }
    if (item.type === "iife") {
      const { fn, getParams } = item.data;
      return wrapHtml(
        "script",
        escapeScript(buildCode(fn, (getParams == null ? void 0 : getParams(context)) || []))
      );
    }
    return "";
  });
}
function persistCSS(items) {
  return items.map((item) => {
    if (item.type === "stylesheet") {
      return wrapHtml("link", null, {
        rel: "stylesheet",
        ...item.data
      });
    }
    return wrapHtml("style", item.data);
  });
}
Math.random().toString(36).slice(2, 8);
function noop() {
}
function wrapFunction(fn, wrapper) {
  return (...args) => wrapper(fn, ...args);
}
function defer() {
  const obj = {};
  obj.promise = new Promise((resolve, reject) => {
    obj.resolve = resolve;
    obj.reject = reject;
  });
  return obj;
}
function memoize(fn) {
  const cache2 = {};
  return function memoized(...args) {
    const key2 = `${args[0]}`;
    let data = cache2[key2];
    if (!data) {
      data = {
        value: fn(...args)
      };
      cache2[key2] = data;
    }
    return data.value;
  };
}
/*! @gera2ld/jsx-dom v2.2.2 | ISC License */
const VTYPE_ELEMENT = 1;
const VTYPE_FUNCTION = 2;
const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";
const NS_ATTRS = {
  show: XLINK_NS,
  actuate: XLINK_NS,
  href: XLINK_NS
};
const isLeaf = (c2) => typeof c2 === "string" || typeof c2 === "number";
const isElement = (c2) => (c2 == null ? void 0 : c2.vtype) === VTYPE_ELEMENT;
const isRenderFunction = (c2) => (c2 == null ? void 0 : c2.vtype) === VTYPE_FUNCTION;
function h(type2, props, ...children) {
  props = Object.assign({}, props, {
    children: children.length === 1 ? children[0] : children
  });
  return jsx(type2, props);
}
function jsx(type2, props) {
  let vtype;
  if (typeof type2 === "string")
    vtype = VTYPE_ELEMENT;
  else if (typeof type2 === "function")
    vtype = VTYPE_FUNCTION;
  else
    throw new Error("Invalid VNode type");
  return {
    vtype,
    type: type2,
    props
  };
}
function Fragment(props) {
  return props.children;
}
const DEFAULT_ENV = {
  isSvg: false
};
function insertDom(parent, nodes) {
  if (!Array.isArray(nodes))
    nodes = [nodes];
  nodes = nodes.filter(Boolean);
  if (nodes.length)
    parent.append(...nodes);
}
function mountAttributes(domElement, props, env) {
  for (const key2 in props) {
    if (key2 === "key" || key2 === "children" || key2 === "ref")
      continue;
    if (key2 === "dangerouslySetInnerHTML") {
      domElement.innerHTML = props[key2].__html;
    } else if (key2 === "innerHTML" || key2 === "textContent" || key2 === "innerText" || key2 === "value" && ["textarea", "select"].includes(domElement.tagName)) {
      const value = props[key2];
      if (value != null)
        domElement[key2] = value;
    } else if (key2.startsWith("on")) {
      domElement[key2.toLowerCase()] = props[key2];
    } else {
      setDOMAttribute(domElement, key2, props[key2], env.isSvg);
    }
  }
}
const attrMap = {
  className: "class",
  labelFor: "for"
};
function setDOMAttribute(el, attr, value, isSVG) {
  attr = attrMap[attr] || attr;
  if (value === true) {
    el.setAttribute(attr, "");
  } else if (value === false) {
    el.removeAttribute(attr);
  } else {
    const namespace = isSVG ? NS_ATTRS[attr] : void 0;
    if (namespace !== void 0) {
      el.setAttributeNS(namespace, attr, value);
    } else {
      el.setAttribute(attr, value);
    }
  }
}
function flatten(arr) {
  return arr.reduce((prev, item) => prev.concat(item), []);
}
function mountChildren(children, env) {
  return Array.isArray(children) ? flatten(children.map((child2) => mountChildren(child2, env))) : mount(children, env);
}
function mount(vnode, env = DEFAULT_ENV) {
  if (vnode == null || typeof vnode === "boolean") {
    return null;
  }
  if (vnode instanceof Node) {
    return vnode;
  }
  if (isRenderFunction(vnode)) {
    const {
      type: type2,
      props
    } = vnode;
    if (type2 === Fragment) {
      const node = document.createDocumentFragment();
      if (props.children) {
        const children = mountChildren(props.children, env);
        insertDom(node, children);
      }
      return node;
    }
    const childVNode = type2(props);
    return mount(childVNode, env);
  }
  if (isLeaf(vnode)) {
    return document.createTextNode(`${vnode}`);
  }
  if (isElement(vnode)) {
    let node;
    const {
      type: type2,
      props
    } = vnode;
    if (!env.isSvg && type2 === "svg") {
      env = Object.assign({}, env, {
        isSvg: true
      });
    }
    if (!env.isSvg) {
      node = document.createElement(type2);
    } else {
      node = document.createElementNS(SVG_NS, type2);
    }
    mountAttributes(node, props, env);
    if (props.children) {
      let childEnv = env;
      if (env.isSvg && type2 === "foreignObject") {
        childEnv = Object.assign({}, childEnv, {
          isSvg: false
        });
      }
      const children = mountChildren(props.children, childEnv);
      if (children != null)
        insertDom(node, children);
    }
    const {
      ref
    } = props;
    if (typeof ref === "function")
      ref(node);
    return node;
  }
  throw new Error("mount: Invalid Vnode!");
}
function mountDom(vnode) {
  return mount(vnode);
}
function hm(...args) {
  return mountDom(h(...args));
}
const memoizedPreloadJS = memoize((url) => {
  document.head.append(
    hm("link", {
      rel: "preload",
      as: "script",
      href: url
    })
  );
});
const jsCache = {};
async function loadJSItem(item, context) {
  var _a;
  const src = item.type === "script" && ((_a = item.data) == null ? void 0 : _a.src) || "";
  item.loaded || (item.loaded = jsCache[src]);
  if (!item.loaded) {
    const deferred = defer();
    item.loaded = deferred.promise;
    if (item.type === "script") {
      document.head.append(
        hm("script", {
          ...item.data,
          onLoad: () => deferred.resolve(),
          onError: deferred.reject
        })
      );
      if (!src) {
        deferred.resolve();
      } else {
        jsCache[src] = item.loaded;
      }
    }
    if (item.type === "iife") {
      const { fn, getParams } = item.data;
      fn(...(getParams == null ? void 0 : getParams(context)) || []);
      deferred.resolve();
    }
  }
  await item.loaded;
}
async function loadJS(items, context) {
  items.forEach((item) => {
    var _a;
    if (item.type === "script" && ((_a = item.data) == null ? void 0 : _a.src)) {
      memoizedPreloadJS(item.data.src);
    }
  });
  context = {
    getMarkmap: () => window.markmap,
    ...context
  };
  for (const item of items) {
    await loadJSItem(item, context);
  }
}
function buildJSItem(path) {
  return {
    type: "script",
    data: {
      src: path
    }
  };
}
function buildCSSItem(path) {
  return {
    type: "stylesheet",
    data: {
      href: path
    }
  };
}
const rkatex = (md2, options) => {
  const backslash = "\\";
  const dollar2 = "$";
  const opts = options || {};
  const delimiter = opts.delimiter || dollar2;
  if (delimiter.length !== 1) {
    throw new Error("invalid delimiter");
  }
  const katex2 = katex$1;
  const renderKatex = (source2, displayMode) => katex2.renderToString(
    source2,
    {
      displayMode,
      throwOnError: false
    }
  );
  const parseBlockKatex = (state, startLine, endLine) => {
    let haveEndMarker = false;
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max2 = state.eMarks[startLine];
    if (pos + 1 > max2) {
      return false;
    }
    const marker = state.src.charAt(pos);
    if (marker !== delimiter) {
      return false;
    }
    let mem = pos;
    pos = state.skipChars(pos, marker);
    let len = pos - mem;
    if (len !== 2) {
      return false;
    }
    let nextLine = startLine;
    for (; ; ) {
      ++nextLine;
      if (nextLine >= endLine) {
        break;
      }
      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max2 = state.eMarks[nextLine];
      if (pos < max2 && state.tShift[nextLine] < state.blkIndent) {
        break;
      }
      if (state.src.charAt(pos) !== delimiter) {
        continue;
      }
      if (state.tShift[nextLine] - state.blkIndent >= 4) {
        continue;
      }
      pos = state.skipChars(pos, marker);
      if (pos - mem < len) {
        continue;
      }
      pos = state.skipSpaces(pos);
      if (pos < max2) {
        continue;
      }
      haveEndMarker = true;
      break;
    }
    len = state.tShift[startLine];
    state.line = nextLine + (haveEndMarker ? 1 : 0);
    const content = state.getLines(startLine + 1, nextLine, len, true).replace(/[ \n]+/g, " ").trim();
    state.tokens.push({
      type: "katex",
      params: null,
      content,
      lines: [startLine, state.line],
      level: state.level,
      block: true
    });
    return true;
  };
  const parseInlineKatex = (state, silent) => {
    const start = state.pos;
    const max2 = state.posMax;
    let pos = start;
    if (state.src.charAt(pos) !== delimiter) {
      return false;
    }
    ++pos;
    while (pos < max2 && state.src.charAt(pos) === delimiter) {
      ++pos;
    }
    const marker = state.src.slice(start, pos);
    if (marker.length > 2) {
      return false;
    }
    const spanStart = pos;
    let escapedDepth = 0;
    while (pos < max2) {
      const char = state.src.charAt(pos);
      if (char === "{" && (pos == 0 || state.src.charAt(pos - 1) != backslash)) {
        escapedDepth += 1;
      } else if (char === "}" && (pos == 0 || state.src.charAt(pos - 1) != backslash)) {
        escapedDepth -= 1;
        if (escapedDepth < 0) {
          return false;
        }
      } else if (char === delimiter && escapedDepth === 0) {
        const matchStart = pos;
        let matchEnd = pos + 1;
        while (matchEnd < max2 && state.src.charAt(matchEnd) === delimiter) {
          ++matchEnd;
        }
        if (matchEnd - matchStart === marker.length) {
          if (!silent) {
            const content = state.src.slice(spanStart, matchStart).replace(/[ \n]+/g, " ").trim();
            state.push({ type: "katex", content, block: marker.length > 1, level: state.level });
          }
          state.pos = matchEnd;
          return true;
        }
      }
      pos += 1;
    }
    if (!silent) {
      state.pending += marker;
    }
    state.pos += marker.length;
    return true;
  };
  md2.inline.ruler.push("katex", parseInlineKatex, options);
  md2.block.ruler.push("katex", parseBlockKatex, options);
  md2.renderer.rules.katex = (tokens, idx2) => renderKatex(tokens[idx2].content, tokens[idx2].block);
  md2.renderer.rules.katex.delimiter = delimiter;
};
var remarkableKatex = rkatex;
const remarkableKatex$1 = /* @__PURE__ */ getDefaultExportFromCjs(remarkableKatex);
/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray$1(sequence) {
  if (Array.isArray(sequence))
    return sequence;
  else if (isNothing(sequence))
    return [];
  return [sequence];
}
function extend(target, source2) {
  var index, length, key2, sourceKeys;
  if (source2) {
    sourceKeys = Object.keys(source2);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key2 = sourceKeys[index];
      target[key2] = source2[key2];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray$1;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark)
    return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark2) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark2;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "→") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max2) {
  return common.repeat(" ", max2 - string.length) + string;
}
function makeSnippet(mark2, options) {
  options = Object.create(options || null);
  if (!mark2.buffer)
    return null;
  if (!options.maxLength)
    options.maxLength = 79;
  if (typeof options.indent !== "number")
    options.indent = 1;
  if (typeof options.linesBefore !== "number")
    options.linesBefore = 3;
  if (typeof options.linesAfter !== "number")
    options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark2.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark2.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0)
    foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark2.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0)
      break;
    line = getLine(
      mark2.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark2.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark2.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark2.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark2.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark2.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length)
      break;
    line = getLine(
      mark2.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark2.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark2.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name2) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name2) === -1) {
      throw new exception('Unknown option "' + name2 + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name2) {
  var result = [];
  schema2[name2].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit)
      implicit = implicit.concat(definition.implicit);
    if (definition.explicit)
      explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null)
    return true;
  var max2 = data.length;
  return max2 === 1 && data === "~" || max2 === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null)
    return false;
  var max2 = data.length;
  return max2 === 4 && (data === "true" || data === "True" || data === "TRUE") || max2 === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c2) {
  return 48 <= c2 && c2 <= 57 || 65 <= c2 && c2 <= 70 || 97 <= c2 && c2 <= 102;
}
function isOctCode(c2) {
  return 48 <= c2 && c2 <= 55;
}
function isDecCode(c2) {
  return 48 <= c2 && c2 <= 57;
}
function resolveYamlInteger(data) {
  if (data === null)
    return false;
  var max2 = data.length, index = 0, hasDigits = false, ch;
  if (!max2)
    return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max2)
      return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max2; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (ch !== "0" && ch !== "1")
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max2; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isHexCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max2; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isOctCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_")
    return false;
  for (; index < max2; index++) {
    ch = data[index];
    if (ch === "_")
      continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_")
    return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-")
      sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0")
    return 0;
  if (ch === "0") {
    if (value[1] === "b")
      return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x")
      return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o")
      return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null)
    return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null)
    return false;
  if (YAML_DATE_REGEXP.exec(data) !== null)
    return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
    return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date2;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null)
    match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null)
    throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-")
      delta = -delta;
  }
  date2 = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta)
    date2.setTime(date2.getTime() - delta);
  return date2;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null)
    return false;
  var code2, idx2, bitlen = 0, max2 = data.length, map2 = BASE64_MAP;
  for (idx2 = 0; idx2 < max2; idx2++) {
    code2 = map2.indexOf(data.charAt(idx2));
    if (code2 > 64)
      continue;
    if (code2 < 0)
      return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx2, tailbits, input = data.replace(/[\r\n=]/g, ""), max2 = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx2 = 0; idx2 < max2; idx2++) {
    if (idx2 % 4 === 0 && idx2) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx2));
  }
  tailbits = max2 % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx2, tail, max2 = object.length, map2 = BASE64_MAP;
  for (idx2 = 0; idx2 < max2; idx2++) {
    if (idx2 % 3 === 0 && idx2) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx2];
  }
  tail = max2 % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null)
    return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]")
      return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey)
          pairHasKey = true;
        else
          return false;
      }
    }
    if (!pairHasKey)
      return false;
    if (objectKeys.indexOf(pairKey) === -1)
      objectKeys.push(pairKey);
    else
      return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null)
    return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]")
      return false;
    keys = Object.keys(pair);
    if (keys.length !== 1)
      return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null)
    return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null)
    return true;
  var key2, object = data;
  for (key2 in object) {
    if (_hasOwnProperty$2.call(object, key2)) {
      if (object[key2] !== null)
        return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c2) {
  return c2 === 10 || c2 === 13;
}
function is_WHITE_SPACE(c2) {
  return c2 === 9 || c2 === 32;
}
function is_WS_OR_EOL(c2) {
  return c2 === 9 || c2 === 32 || c2 === 10 || c2 === 13;
}
function is_FLOW_INDICATOR(c2) {
  return c2 === 44 || c2 === 91 || c2 === 93 || c2 === 123 || c2 === 125;
}
function fromHexCode(c2) {
  var lc;
  if (48 <= c2 && c2 <= 57) {
    return c2 - 48;
  }
  lc = c2 | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c2) {
  if (c2 === 120) {
    return 2;
  }
  if (c2 === 117) {
    return 4;
  }
  if (c2 === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c2) {
  if (48 <= c2 && c2 <= 57) {
    return c2 - 48;
  }
  return -1;
}
function simpleEscapeSequence(c2) {
  return c2 === 48 ? "\0" : c2 === 97 ? "\x07" : c2 === 98 ? "\b" : c2 === 116 ? "	" : c2 === 9 ? "	" : c2 === 110 ? "\n" : c2 === 118 ? "\v" : c2 === 102 ? "\f" : c2 === 114 ? "\r" : c2 === 101 ? "\x1B" : c2 === 32 ? " " : c2 === 34 ? '"' : c2 === 47 ? "/" : c2 === 92 ? "\\" : c2 === 78 ? "" : c2 === 95 ? " " : c2 === 76 ? "\u2028" : c2 === 80 ? "\u2029" : "";
}
function charFromCodepoint(c2) {
  if (c2 <= 65535) {
    return String.fromCharCode(c2);
  }
  return String.fromCharCode(
    (c2 - 65536 >> 10) + 55296,
    (c2 - 65536 & 1023) + 56320
  );
}
function setProperty(object, key2, value) {
  if (key2 === "__proto__") {
    Object.defineProperty(object, key2, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key2] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark2 = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark2.snippet = snippet(mark2);
  return new exception(message, mark2);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name2, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name2, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end2, checkJson) {
  var _position, _length, _character, _result;
  if (start < end2) {
    _result = state.input.slice(start, end2);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source2, overridableKeys) {
  var sourceKeys, key2, index, quantity;
  if (!common.isObject(source2)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source2);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key2 = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key2)) {
      setProperty(destination, key2, source2[key2]);
      overridableKeys[key2] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33)
    return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38)
    return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42)
    return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch))
        break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0)
      readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null)
    return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1, QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n")
      result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c2) {
  return c2 === CHAR_SPACE || c2 === CHAR_TAB;
}
function isPrintable(c2) {
  return 32 <= c2 && c2 <= 126 || 161 <= c2 && c2 <= 55295 && c2 !== 8232 && c2 !== 8233 || 57344 <= c2 && c2 <= 65533 && c2 !== CHAR_BOM || 65536 <= c2 && c2 <= 1114111;
}
function isNsCharOrWhitespace(c2) {
  return isPrintable(c2) && c2 !== CHAR_BOM && c2 !== CHAR_CARRIAGE_RETURN && c2 !== CHAR_LINE_FEED;
}
function isPlainSafe(c2, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c2);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c2);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c2 !== CHAR_COMMA && c2 !== CHAR_LEFT_SQUARE_BRACKET && c2 !== CHAR_RIGHT_SQUARE_BRACKET && c2 !== CHAR_LEFT_CURLY_BRACKET && c2 !== CHAR_RIGHT_CURLY_BRACKET) && c2 !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c2 === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c2) {
  return isPrintable(c2) && c2 !== CHAR_BOM && !isWhitespace(c2) && c2 !== CHAR_MINUS && c2 !== CHAR_QUESTION && c2 !== CHAR_COLON && c2 !== CHAR_COMMA && c2 !== CHAR_LEFT_SQUARE_BRACKET && c2 !== CHAR_RIGHT_SQUARE_BRACKET && c2 !== CHAR_LEFT_CURLY_BRACKET && c2 !== CHAR_RIGHT_CURLY_BRACKET && c2 !== CHAR_SHARP && c2 !== CHAR_AMPERSAND && c2 !== CHAR_ASTERISK && c2 !== CHAR_EXCLAMATION && c2 !== CHAR_VERTICAL_LINE && c2 !== CHAR_EQUALS && c2 !== CHAR_GREATER_THAN && c2 !== CHAR_SINGLE_QUOTE && c2 !== CHAR_DOUBLE_QUOTE && c2 !== CHAR_PERCENT && c2 !== CHAR_COMMERCIAL_AT && c2 !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c2) {
  return !isWhitespace(c2) && c2 !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  }();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ")
    return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end2, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end2 = curr > start ? curr : next;
      result += "\n" + line.slice(start, end2);
      start = end2 + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 65536)
        result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "")
        _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "")
      pairBuffer += ", ";
    if (state.condenseFlow)
      pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024)
      pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block2, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block2;
  var tagStr;
  if (block2) {
    block2 = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block2 && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block2 && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid)
        return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs)
    getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true))
    return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var Type = type;
var Schema = schema;
var FAILSAFE_SCHEMA = failsafe;
var JSON_SCHEMA = json;
var CORE_SCHEMA = core;
var DEFAULT_SCHEMA = _default;
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var YAMLException = exception;
var types = {
  binary,
  float,
  map,
  null: _null,
  pairs,
  set,
  timestamp,
  bool,
  int,
  merge,
  omap,
  seq,
  str
};
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");
var jsYaml = {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
  safeLoad,
  safeLoadAll,
  safeDump
};
const template = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta http-equiv="X-UA-Compatible" content="ie=edge">\n<title>Markmap</title>\n<style>\n* {\n  margin: 0;\n  padding: 0;\n}\n#mindmap {\n  display: block;\n  width: 100vw;\n  height: 100vh;\n}\n</style>\n<!--CSS-->\n</head>\n<body>\n<svg id="mindmap"></svg>\n<!--JS-->\n</body>\n</html>\n';
const baseJsPaths = [
  `d3@${"7.8.5"}/dist/d3.min.js`,
  `markmap-view@${"0.15.8"}/dist/browser/index.js`
];
const name$3 = "katex";
const preloadScripts$1 = [
  `katex@${"0.16.8"}/dist/katex.min.js`
].map((path) => buildJSItem(path));
const webfontloader = buildJSItem(
  `webfontloader@${"1.6.28"}/webfontloader.js`
);
webfontloader.data.defer = true;
const styles$1 = [`katex@${"0.16.8"}/dist/katex.min.css`].map(
  (path) => buildCSSItem(path)
);
const config$1 = {
  versions: {
    katex: "0.16.8",
    webfontloader: "1.6.28"
  },
  preloadScripts: preloadScripts$1,
  scripts: [
    {
      type: "iife",
      data: {
        fn: (getMarkmap) => {
          window.WebFontConfig = {
            custom: {
              families: [
                "KaTeX_AMS",
                "KaTeX_Caligraphic:n4,n7",
                "KaTeX_Fraktur:n4,n7",
                "KaTeX_Main:n4,n7,i4,i7",
                "KaTeX_Math:i4,i7",
                "KaTeX_Script",
                "KaTeX_SansSerif:n4,n7,i4",
                "KaTeX_Size1",
                "KaTeX_Size2",
                "KaTeX_Size3",
                "KaTeX_Size4",
                "KaTeX_Typewriter"
              ]
            },
            active: () => {
              getMarkmap().refreshHook.call();
            }
          };
        },
        getParams({ getMarkmap }) {
          return [getMarkmap];
        }
      }
    },
    webfontloader
  ],
  styles: styles$1
};
function addDefaultVersions(paths, name2, version2) {
  return paths.map((path) => {
    if (typeof path === "string" && !path.includes("://")) {
      if (!path.startsWith("npm:")) {
        path = `npm:${path}`;
      }
      const prefixLength = 4 + name2.length;
      if (path.startsWith(`npm:${name2}/`)) {
        path = `${path.slice(0, prefixLength)}@${version2}${path.slice(
          prefixLength
        )}`;
      }
    }
    return path;
  });
}
function patchJSItem(urlBuilder, item) {
  if (item.type === "script" && item.data.src) {
    return {
      ...item,
      data: {
        ...item.data,
        src: urlBuilder.getFullUrl(item.data.src)
      }
    };
  }
  return item;
}
function patchCSSItem(urlBuilder, item) {
  if (item.type === "stylesheet" && item.data.href) {
    return {
      ...item,
      data: {
        ...item.data,
        href: urlBuilder.getFullUrl(item.data.href)
      }
    };
  }
  return item;
}
function createTransformHooks(transformer2) {
  return {
    transformer: transformer2,
    parser: new Hook(),
    beforeParse: new Hook(),
    afterParse: new Hook(),
    htmltag: new Hook(),
    retransform: new Hook()
  };
}
function definePlugin(plugin2) {
  return plugin2;
}
const plugin$1 = definePlugin({
  name: name$3,
  config: config$1,
  transform(transformHooks) {
    var _a, _b, _c, _d;
    let loading;
    const preloadScripts2 = ((_b = (_a = plugin$1.config) == null ? void 0 : _a.preloadScripts) == null ? void 0 : _b.map(
      (item) => patchJSItem(transformHooks.transformer.urlBuilder, item)
    )) || [];
    const autoload = () => {
      loading || (loading = loadJS(preloadScripts2));
      return loading;
    };
    const renderKatex = (source2, displayMode) => {
      const { katex: katex2 } = window;
      if (katex2) {
        return katex2.renderToString(source2, {
          displayMode,
          throwOnError: false
        });
      }
      autoload().then(() => {
        transformHooks.retransform.call();
      });
      return source2;
    };
    let enableFeature = noop;
    transformHooks.parser.tap((md2) => {
      md2.use(remarkableKatex$1);
      md2.renderer.rules.katex = (tokens, idx2) => {
        enableFeature();
        const result = renderKatex(tokens[idx2].content, !!tokens[idx2].block);
        return result;
      };
    });
    transformHooks.beforeParse.tap((_, context) => {
      enableFeature = () => {
        context.features[name$3] = true;
      };
    });
    transformHooks.afterParse.tap((_, context) => {
      var _a2;
      const markmap = (_a2 = context.frontmatter) == null ? void 0 : _a2.markmap;
      if (markmap) {
        ["extraJs", "extraCss"].forEach((key2) => {
          var _a3, _b2;
          const value = markmap[key2];
          if (value) {
            markmap[key2] = addDefaultVersions(
              value,
              name$3,
              ((_b2 = (_a3 = plugin$1.config) == null ? void 0 : _a3.versions) == null ? void 0 : _b2.katex) || ""
            );
          }
        });
      }
    });
    return {
      styles: (_c = plugin$1.config) == null ? void 0 : _c.styles,
      scripts: (_d = plugin$1.config) == null ? void 0 : _d.scripts
    };
  }
});
const name$2 = "frontmatter";
const frontmatter = definePlugin({
  name: name$2,
  transform(transformHooks) {
    transformHooks.beforeParse.tap((md2, context) => {
      const { content } = context;
      if (!/^---\r?\n/.test(content))
        return;
      const match = /\n---\r?\n/.exec(content);
      if (!match)
        return;
      const raw = content.slice(4, match.index);
      let frontmatter2;
      try {
        frontmatter2 = jsYaml.load(raw);
        if (frontmatter2 == null ? void 0 : frontmatter2.markmap) {
          frontmatter2.markmap = normalizeMarkmapJsonOptions(
            frontmatter2.markmap
          );
        }
      } catch {
        return;
      }
      context.frontmatter = frontmatter2;
      context.content = content.slice(match.index + match[0].length);
      context.contentLineOffset = content.slice(0, match.index).split("\n").length + 1;
    });
    return {};
  }
});
function normalizeMarkmapJsonOptions(options) {
  if (!options)
    return;
  ["color", "extraJs", "extraCss"].forEach((key2) => {
    if (options[key2] != null)
      options[key2] = normalizeStringArray(options[key2]);
  });
  ["duration", "maxWidth", "initialExpandLevel"].forEach((key2) => {
    if (options[key2] != null)
      options[key2] = normalizeNumber(options[key2]);
  });
  return options;
}
function normalizeStringArray(value) {
  let result;
  if (typeof value === "string")
    result = [value];
  else if (Array.isArray(value))
    result = value.filter((item) => item && typeof item === "string");
  return (result == null ? void 0 : result.length) ? result : void 0;
}
function normalizeNumber(value) {
  if (isNaN(+value))
    return;
  return +value;
}
const name$1 = "npmUrl";
const npmUrl = definePlugin({
  name: name$1,
  transform(transformHooks) {
    transformHooks.afterParse.tap((_, context) => {
      const { frontmatter: frontmatter2 } = context;
      const markmap = frontmatter2 == null ? void 0 : frontmatter2.markmap;
      if (markmap) {
        ["extraJs", "extraCss"].forEach((key2) => {
          const value = markmap[key2];
          if (value) {
            markmap[key2] = value.map((path) => {
              if (path.startsWith("npm:")) {
                return transformHooks.transformer.urlBuilder.getFullUrl(
                  path.slice(4)
                );
              }
              return path;
            });
          }
        });
      }
    });
    return {};
  }
});
const name = "hljs";
const preloadScripts = [
  `@highlightjs/cdn-assets@${"11.8.0"}/highlight.min.js`
].map((path) => buildJSItem(path));
const styles = [
  `@highlightjs/cdn-assets@${"11.8.0"}/styles/default.min.css`
  // `highlight.js@${process.env.HLJS_VERSION}/styles/default.css`,
].map((path) => buildCSSItem(path));
const config = {
  versions: {
    hljs: "11.8.0"
  },
  preloadScripts,
  styles
};
const plugin = definePlugin({
  name,
  config,
  transform(transformHooks) {
    var _a, _b, _c;
    let loading;
    const preloadScripts2 = ((_b = (_a = plugin.config) == null ? void 0 : _a.preloadScripts) == null ? void 0 : _b.map(
      (item) => patchJSItem(transformHooks.transformer.urlBuilder, item)
    )) || [];
    const autoload = () => {
      loading || (loading = loadJS(preloadScripts2));
      return loading;
    };
    let enableFeature = noop;
    transformHooks.parser.tap((md2) => {
      md2.set({
        highlight: (str2, language) => {
          enableFeature();
          const { hljs } = window;
          if (hljs) {
            return hljs.highlightAuto(str2, language ? [language] : void 0).value;
          }
          autoload().then(() => {
            transformHooks.retransform.call();
          });
          return str2;
        }
      });
    });
    transformHooks.beforeParse.tap((_, context) => {
      enableFeature = () => {
        context.features[name] = true;
      };
    });
    return {
      styles: (_c = plugin.config) == null ? void 0 : _c.styles
    };
  }
});
const plugins = [frontmatter, plugin$1, plugin, npmUrl];
function cleanNode(node) {
  var _a, _b;
  if (node.type === "heading") {
    node.children = node.children.filter((item) => item.type !== "paragraph");
  } else if (node.type === "list_item") {
    node.children = node.children.filter((item) => {
      if (["paragraph", "fence"].includes(item.type)) {
        if (!node.content) {
          node.content = item.content;
          node.payload = {
            ...node.payload,
            ...item.payload
          };
        }
        return false;
      }
      return true;
    });
    if (((_a = node.payload) == null ? void 0 : _a.index) != null) {
      node.content = `${node.payload.index}. ${node.content}`;
    }
  } else if (node.type === "ordered_list") {
    let index = ((_b = node.payload) == null ? void 0 : _b.startIndex) ?? 1;
    node.children.forEach((item) => {
      if (item.type === "list_item") {
        item.payload = {
          ...item.payload,
          index
        };
        index += 1;
      }
    });
  }
  if (node.children.length > 0) {
    node.children.forEach((child2) => cleanNode(child2));
    if (node.children.length === 1 && !node.children[0].content) {
      node.children = node.children[0].children;
    }
  }
}
function resetDepth(node, depth = 0) {
  node.depth = depth;
  node.children.forEach((child2) => {
    resetDepth(child2, depth + 1);
  });
}
class Transformer {
  constructor(plugins$1 = plugins) {
    this.assetsMap = {};
    this.urlBuilder = new UrlBuilder();
    this.hooks = createTransformHooks(this);
    this.plugins = plugins$1.map(
      (plugin2) => typeof plugin2 === "function" ? plugin2() : plugin2
    );
    const assetsMap = {};
    for (const { name: name2, transform } of this.plugins) {
      assetsMap[name2] = transform(this.hooks);
    }
    this.assetsMap = assetsMap;
    const md2 = new Remarkable("full", {
      html: true,
      breaks: true,
      maxNesting: Infinity
    });
    md2.renderer.rules.htmltag = wrapFunction(
      md2.renderer.rules.htmltag,
      (render2, ...args) => {
        const result = render2(...args);
        this.hooks.htmltag.call({ args, result });
        return result;
      }
    );
    this.md = md2;
    this.hooks.parser.call(md2);
  }
  buildTree(tokens) {
    const { md: md2 } = this;
    const root = {
      type: "root",
      depth: 0,
      content: "",
      children: [],
      payload: {}
    };
    const stack = [root];
    let depth = 0;
    for (const token of tokens) {
      const payload = {};
      if (token.lines) {
        payload.lines = token.lines;
      }
      let current = stack[stack.length - 1];
      if (token.type.endsWith("_open")) {
        const type2 = token.type.slice(0, -5);
        if (type2 === "heading") {
          depth = token.hLevel;
          while ((current == null ? void 0 : current.depth) >= depth) {
            stack.pop();
            current = stack[stack.length - 1];
          }
        } else {
          depth = Math.max(depth, (current == null ? void 0 : current.depth) || 0) + 1;
          if (type2 === "ordered_list") {
            payload.startIndex = token.order;
          }
        }
        const item = {
          type: type2,
          depth,
          payload,
          content: "",
          children: []
        };
        current.children.push(item);
        stack.push(item);
      } else if (!current) {
        continue;
      } else if (token.type === `${current.type}_close`) {
        if (current.type === "heading") {
          depth = current.depth;
        } else {
          stack.pop();
          depth = 0;
        }
      } else if (token.type === "inline") {
        const revoke = this.hooks.htmltag.tap((ctx) => {
          var _a;
          const comment2 = (_a = ctx.result) == null ? void 0 : _a.match(/^<!--([\s\S]*?)-->$/);
          const data = comment2 == null ? void 0 : comment2[1].trim().split(" ");
          if ((data == null ? void 0 : data[0]) === "fold") {
            current.payload = {
              ...current.payload,
              fold: ["all", "recursively"].includes(data[1]) ? 2 : 1
            };
            ctx.result = "";
          }
        });
        const text2 = md2.renderer.render([token], md2.options, {});
        revoke();
        current.content = `${current.content || ""}${text2}`;
      } else if (token.type === "fence") {
        const result = md2.renderer.render([token], md2.options, {});
        current.children.push({
          type: token.type,
          depth: depth + 1,
          content: result,
          children: [],
          payload
        });
      } else
        ;
    }
    return root;
  }
  transform(content) {
    var _a;
    const context = {
      content,
      features: {},
      contentLineOffset: 0
    };
    this.hooks.beforeParse.call(this.md, context);
    const tokens = this.md.parse(context.content, {});
    this.hooks.afterParse.call(this.md, context);
    let root = this.buildTree(tokens);
    cleanNode(root);
    if (((_a = root.children) == null ? void 0 : _a.length) === 1)
      root = root.children[0];
    resetDepth(root);
    return { ...context, root };
  }
  /**
   * Get all assets from enabled plugins or filter them by plugin names as keys.
   */
  getAssets(keys) {
    const styles2 = [];
    const scripts = [];
    keys ?? (keys = this.plugins.map((plugin2) => plugin2.name));
    for (const assets of keys.map((key2) => this.assetsMap[key2])) {
      if (assets) {
        if (assets.styles)
          styles2.push(...assets.styles);
        if (assets.scripts)
          scripts.push(...assets.scripts);
      }
    }
    return {
      styles: styles2.map((item) => patchCSSItem(this.urlBuilder, item)),
      scripts: scripts.map((item) => patchJSItem(this.urlBuilder, item))
    };
  }
  /**
   * Get used assets by features object returned by `transform`.
   */
  getUsedAssets(features) {
    const keys = this.plugins.map((plugin2) => plugin2.name).filter((name2) => features[name2]);
    return this.getAssets(keys);
  }
  fillTemplate(root, assets, extra) {
    extra = {
      ...extra
    };
    extra.baseJs ?? (extra.baseJs = baseJsPaths.map((path) => this.urlBuilder.getFullUrl(path)).map((path) => buildJSItem(path)));
    const { scripts, styles: styles2 } = assets;
    const cssList = [...styles2 ? persistCSS(styles2) : []];
    const context = {
      getMarkmap: () => window.markmap,
      getOptions: extra.getOptions,
      jsonOptions: extra.jsonOptions,
      root
    };
    const jsList = [
      ...persistJS(
        [
          ...extra.baseJs,
          ...scripts || [],
          {
            type: "iife",
            data: {
              fn: (getMarkmap, getOptions, root2, jsonOptions) => {
                const markmap = getMarkmap();
                window.mm = markmap.Markmap.create(
                  "svg#mindmap",
                  (getOptions || markmap.deriveOptions)(jsonOptions),
                  root2
                );
              },
              getParams: ({ getMarkmap, getOptions, root: root2, jsonOptions }) => {
                return [getMarkmap, getOptions, root2, jsonOptions];
              }
            }
          }
        ],
        context
      )
    ];
    const html = template.replace("<!--CSS-->", () => cssList.join("")).replace("<!--JS-->", () => jsList.join(""));
    return html;
  }
}
const transformer = new Transformer();
function fromatMarkMapJSON(text2) {
  const { root, features } = transformer.transform(text2);
  return JSON.stringify({
    root,
    features
  });
}
function initSwiper(dom, mdEditor) {
  if (mdEditor.swipers) {
    mdEditor.swipers.forEach((swiper) => {
      swiper.destroy();
    });
  }
  const els = dom.querySelectorAll(".swiper");
  if (!els.length) {
    return [];
  }
  const Swiper = getSwiper();
  if (!Swiper) {
    const message = "not find swiper,please registerSwiper";
    console.error(message);
    getToastr().error(message);
    return [];
  }
  const swipers = [];
  els.forEach((el) => {
    if (el.dataset.inited) {
      return;
    }
    const swiper = new Swiper(el, {
      speed: 400,
      spaceBetween: 100,
      pagination: {
        enable: true,
        el: ".swiper-pagination"
      }
    });
    swipers.push(swiper);
  });
  mdEditor.swipers = swipers;
}
function makeToc(contentElement, tocSelector, options) {
  if (options == null) {
    options = {};
  }
  if (contentElement == null) {
    throw new Error("need to provide a selector where to scan for headers");
  }
  if (typeof contentElement === "string") {
    contentElement = document.querySelectorAll(contentElement + " > *");
  } else {
    contentElement = contentElement.children;
  }
  var allChildren = Array.prototype.slice.call(contentElement);
  var min2 = 6;
  var headers = allChildren.filter(function(item) {
    var classesList = item.className.split(" ");
    if (classesList.indexOf("toc-ignore") != -1) {
      return false;
    }
    if ((options.ignore || []).indexOf(getText(item)) != -1) {
      return false;
    }
    var splitted = item.nodeName.split("");
    var headingNumber = parseInt(splitted[1]);
    if (splitted[0] === "H" && headingNumber >= 1 && headingNumber <= (options.max || 6)) {
      min2 = Math.min(min2, headingNumber);
      return true;
    }
  });
  var hierarchy = createHierarchy(headers, min2);
  var toc = parseNodes(hierarchy.nodes);
  var container = document.querySelector(tocSelector);
  setText(container, "");
  container.appendChild(toc);
}
function createHierarchy(headers, minLevel) {
  var hierarchy = { nodes: [] };
  window.hierarchy = hierarchy;
  var previousNode = { parent: hierarchy };
  var level = minLevel;
  var init = false;
  headers.forEach(function(header) {
    var headingNumber = parseInt(header.nodeName.substr(1));
    var object = {
      title: getText(header),
      link: window.location.pathname + "#" + header.id,
      originLevel: headingNumber,
      nodes: []
    };
    if (headingNumber === level) {
      object.parent = previousNode.parent;
    } else if (headingNumber - level >= 1) {
      if (init === false) {
        var missingParent = {
          parent: previousNode.parent,
          title: "",
          link: "",
          originLevel: NaN,
          nodes: []
        };
        previousNode.parent.nodes.push(missingParent);
        previousNode = missingParent;
      }
      object.parent = previousNode;
      level++;
    } else if (level - headingNumber >= 1) {
      var ref = previousNode.parent;
      while (level - headingNumber >= 1) {
        ref = ref.parent;
        level--;
      }
      object.parent = ref;
    } else {
      console.error("unkown toc path");
    }
    object.parent.nodes.push(object);
    previousNode = object;
    init = true;
  });
  return hierarchy;
}
function parseNodes(nodes) {
  var ul = document.createElement("UL");
  for (var i = 0; i < nodes.length; i++) {
    ul.appendChild(parseNode(nodes[i]));
  }
  return ul;
}
function parseNode(node) {
  var li = document.createElement("LI");
  var a2 = document.createElement("A");
  setText(a2, node.title);
  a2.href = "javascript:void(0)";
  li.appendChild(a2);
  if (node.nodes) {
    li.appendChild(parseNodes(node.nodes));
  }
  return li;
}
function getText(elem) {
  if (elem.textContent != null) {
    return elem.textContent;
  } else {
    elem.innerText;
  }
}
function setText(elem, value) {
  if (elem.textContent != null) {
    elem.textContent = value;
  } else {
    elem.innerText = value;
  }
}
function initQRCode(dom) {
  const els = dom.querySelectorAll(".qrcode-container");
  if (!els.length) {
    return [];
  }
  const QRCode = getQRCode();
  if (!QRCode) {
    const message = "not find QRCode,please registerQRCode";
    console.error(message);
    getToastr().error(message);
    return [];
  }
  const swipers = [];
  els.forEach((el) => {
    if (el.dataset.inited) {
      return;
    }
    const text2 = el.textContent;
    el.innerHTML = "";
    const qrcode = new QRCode(el, {
      text: text2,
      width: 128,
      height: 128,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    swipers.push(qrcode);
  });
  return swipers;
}
const TEMPLATE$1 = `
<!DOCTYPE html>
<html>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title></title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.5/viewer.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/10.2.0/swiper-bundle.min.css">
  <link rel="stylesheet" href="https://microget-1300406971.cos.ap-shanghai.myqcloud.com/mdpress-editor/index.css">

  <script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/10.2.0/swiper-bundle.min.js"><\/script>
  <style>
   {style}
  </style>

  <body>
      {html}
    <script>
        const ACTIVE_CLASS = 'active';

        const on = (target, event, hanlder) => {
            target.addEventListener(event, hanlder);
        };

        function checkCodeGroup(dom) {
            const codeGroups = dom.querySelectorAll('.vp-code-group');
            const domActive = (dom, active = true) => {
                if (!dom) {
                    return;
                }
                if (active) {
                    dom.classList.add(ACTIVE_CLASS);
                } else {
                    dom.classList.remove(ACTIVE_CLASS);
                }
            };
            codeGroups.forEach(codeGroup => {
                const tabsDom = codeGroup.querySelector('.tabs');
                const blocksDom = codeGroup.querySelector('.blocks');
                const radios = tabsDom.querySelectorAll('input[type=radio]');
                const pres = blocksDom.querySelectorAll('pre');
                domActive(pres[0]);
                radios.forEach((radio, index) => {
                    on(radio, 'click', () => {
                        pres.forEach(pre => {
                            domActive(pre, false);
                        });
                        const pre = pres[index];
                        domActive(pre);
                    });
                });
            });
        }

        function initSwiper(dom) {
            const els = dom.querySelectorAll('.swiper');
            if (!els.length) {
                return [];
            }
            const Swiper = window.Swiper;
            if (!Swiper) {
                const message = 'not find swiper,please registerSwiper';
                console.error(message);
                return [];
            }
            const swipers = [];
            // console.log(Swiper);
            els.forEach(el => {
                if (el.dataset.inited) {
                    return;
                }
                const swiper = new Swiper(el, {
                    speed: 400,
                    spaceBetween: 100,
                    pagination: {
                        enable: true,
                        el: '.swiper-pagination'
                    }
                });
                swipers.push(swiper);
            });
            return swipers;
        }
        

        const dom= document.querySelector('.markdown-body');
        checkCodeGroup(dom);
        initSwiper(dom);

    <\/script>

  </body>
</html>
`;
function exportHTML(html, styleText) {
  return TEMPLATE$1.replaceAll("{html}", html).replaceAll("{style}", styleText);
}
var print = { exports: {} };
(function(module, exports) {
  (function webpackUniversalModuleDefinition(root, factory2) {
    module.exports = factory2();
  })(window, function() {
    return (
      /******/
      function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
          if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
          }
          var module2 = installedModules[moduleId] = {
            /******/
            i: moduleId,
            /******/
            l: false,
            /******/
            exports: {}
            /******/
          };
          modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
          module2.l = true;
          return module2.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function(exports2, name2, getter) {
          if (!__webpack_require__.o(exports2, name2)) {
            Object.defineProperty(exports2, name2, { enumerable: true, get: getter });
          }
        };
        __webpack_require__.r = function(exports2) {
          if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
          }
          Object.defineProperty(exports2, "__esModule", { value: true });
        };
        __webpack_require__.t = function(value, mode) {
          if (mode & 1)
            value = __webpack_require__(value);
          if (mode & 8)
            return value;
          if (mode & 4 && typeof value === "object" && value && value.__esModule)
            return value;
          var ns = /* @__PURE__ */ Object.create(null);
          __webpack_require__.r(ns);
          Object.defineProperty(ns, "default", { enumerable: true, value });
          if (mode & 2 && typeof value != "string")
            for (var key2 in value)
              __webpack_require__.d(ns, key2, (function(key3) {
                return value[key3];
              }).bind(null, key2));
          return ns;
        };
        __webpack_require__.n = function(module2) {
          var getter = module2 && module2.__esModule ? (
            /******/
            function getDefault() {
              return module2["default"];
            }
          ) : (
            /******/
            function getModuleExports() {
              return module2;
            }
          );
          __webpack_require__.d(getter, "a", getter);
          return getter;
        };
        __webpack_require__.o = function(object, property) {
          return Object.prototype.hasOwnProperty.call(object, property);
        };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = 0);
      }({
        /***/
        "./src/index.js": (
          /*!**********************!*\
            !*** ./src/index.js ***!
            \**********************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__(
              /*! ./sass/index.scss */
              "./src/sass/index.scss"
            );
            var _js_init__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
              /*! ./js/init */
              "./src/js/init.js"
            );
            var printJS2 = _js_init__WEBPACK_IMPORTED_MODULE_1__["default"].init;
            if (typeof window !== "undefined") {
              window.printJS = printJS2;
            }
            __webpack_exports__["default"] = printJS2;
          }
        ),
        /***/
        "./src/js/browser.js": (
          /*!***************************!*\
            !*** ./src/js/browser.js ***!
            \***************************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var Browser = {
              // Firefox 1.0+
              isFirefox: function isFirefox() {
                return typeof InstallTrigger !== "undefined";
              },
              // Internet Explorer 6-11
              isIE: function isIE() {
                return navigator.userAgent.indexOf("MSIE") !== -1 || !!document.documentMode;
              },
              // Edge 20+
              isEdge: function isEdge() {
                return !Browser.isIE() && !!window.StyleMedia;
              },
              // Chrome 1+
              isChrome: function isChrome() {
                var context = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : window;
                return !!context.chrome;
              },
              // At least Safari 3+: "[object HTMLElementConstructor]"
              isSafari: function isSafari() {
                return Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0 || navigator.userAgent.toLowerCase().indexOf("safari") !== -1;
              },
              // IOS Chrome
              isIOSChrome: function isIOSChrome() {
                return navigator.userAgent.toLowerCase().indexOf("crios") !== -1;
              }
            };
            __webpack_exports__["default"] = Browser;
          }
        ),
        /***/
        "./src/js/functions.js": (
          /*!*****************************!*\
            !*** ./src/js/functions.js ***!
            \*****************************/
          /*! exports provided: addWrapper, capitalizePrint, collectStyles, addHeader, cleanUp, isRawHTML */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, "addWrapper", function() {
              return addWrapper;
            });
            __webpack_require__.d(__webpack_exports__, "capitalizePrint", function() {
              return capitalizePrint;
            });
            __webpack_require__.d(__webpack_exports__, "collectStyles", function() {
              return collectStyles;
            });
            __webpack_require__.d(__webpack_exports__, "addHeader", function() {
              return addHeader;
            });
            __webpack_require__.d(__webpack_exports__, "cleanUp", function() {
              return cleanUp;
            });
            __webpack_require__.d(__webpack_exports__, "isRawHTML", function() {
              return isRawHTML;
            });
            var _modal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
              /*! ./modal */
              "./src/js/modal.js"
            );
            var _browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
              /*! ./browser */
              "./src/js/browser.js"
            );
            function _typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                _typeof = function _typeof2(obj2) {
                  return typeof obj2;
                };
              } else {
                _typeof = function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                };
              }
              return _typeof(obj);
            }
            function addWrapper(htmlData, params) {
              var bodyStyle = "font-family:" + params.font + " !important; font-size: " + params.font_size + " !important; width:100%;";
              return '<div style="' + bodyStyle + '">' + htmlData + "</div>";
            }
            function capitalizePrint(obj) {
              return obj.charAt(0).toUpperCase() + obj.slice(1);
            }
            function collectStyles(element, params) {
              var win = document.defaultView || window;
              var elementStyle = "";
              var styles2 = win.getComputedStyle(element, "");
              for (var key2 = 0; key2 < styles2.length; key2++) {
                if (params.targetStyles.indexOf("*") !== -1 || params.targetStyle.indexOf(styles2[key2]) !== -1 || targetStylesMatch(params.targetStyles, styles2[key2])) {
                  if (styles2.getPropertyValue(styles2[key2]))
                    elementStyle += styles2[key2] + ":" + styles2.getPropertyValue(styles2[key2]) + ";";
                }
              }
              elementStyle += "max-width: " + params.maxWidth + "px !important; font-size: " + params.font_size + " !important;";
              return elementStyle;
            }
            function targetStylesMatch(styles2, value) {
              for (var i = 0; i < styles2.length; i++) {
                if (_typeof(value) === "object" && value.indexOf(styles2[i]) !== -1)
                  return true;
              }
              return false;
            }
            function addHeader(printElement, params) {
              var headerContainer = document.createElement("div");
              if (isRawHTML(params.header)) {
                headerContainer.innerHTML = params.header;
              } else {
                var headerElement = document.createElement("h1");
                var headerNode = document.createTextNode(params.header);
                headerElement.appendChild(headerNode);
                headerElement.setAttribute("style", params.headerStyle);
                headerContainer.appendChild(headerElement);
              }
              printElement.insertBefore(headerContainer, printElement.childNodes[0]);
            }
            function cleanUp(params) {
              if (params.showModal)
                _modal__WEBPACK_IMPORTED_MODULE_0__["default"].close();
              if (params.onLoadingEnd)
                params.onLoadingEnd();
              if (params.showModal || params.onLoadingStart)
                window.URL.revokeObjectURL(params.printable);
              var event = "mouseover";
              if (_browser__WEBPACK_IMPORTED_MODULE_1__["default"].isChrome() || _browser__WEBPACK_IMPORTED_MODULE_1__["default"].isFirefox()) {
                event = "focus";
              }
              var handler = function handler2() {
                window.removeEventListener(event, handler2);
                params.onPrintDialogClose();
                var iframe = document.getElementById(params.frameId);
                if (iframe) {
                  iframe.remove();
                }
              };
              window.addEventListener(event, handler);
            }
            function isRawHTML(raw) {
              var regexHtml = new RegExp("<([A-Za-z][A-Za-z0-9]*)\\b[^>]*>(.*?)</\\1>");
              return regexHtml.test(raw);
            }
          }
        ),
        /***/
        "./src/js/html.js": (
          /*!************************!*\
            !*** ./src/js/html.js ***!
            \************************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
              /*! ./functions */
              "./src/js/functions.js"
            );
            var _print__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
              /*! ./print */
              "./src/js/print.js"
            );
            function _typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                _typeof = function _typeof2(obj2) {
                  return typeof obj2;
                };
              } else {
                _typeof = function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                };
              }
              return _typeof(obj);
            }
            __webpack_exports__["default"] = {
              print: function print2(params, printFrame) {
                var printElement = isHtmlElement(params.printable) ? params.printable : document.getElementById(params.printable);
                if (!printElement) {
                  window.console.error("Invalid HTML element id: " + params.printable);
                  return;
                }
                params.printableElement = cloneElement(printElement, params);
                if (params.header) {
                  Object(_functions__WEBPACK_IMPORTED_MODULE_0__["addHeader"])(params.printableElement, params);
                }
                _print__WEBPACK_IMPORTED_MODULE_1__["default"].send(params, printFrame);
              }
            };
            function cloneElement(element, params) {
              var clone = element.cloneNode();
              var childNodesArray = Array.prototype.slice.call(element.childNodes);
              for (var i = 0; i < childNodesArray.length; i++) {
                if (params.ignoreElements.indexOf(childNodesArray[i].id) !== -1) {
                  continue;
                }
                var clonedChild = cloneElement(childNodesArray[i], params);
                clone.appendChild(clonedChild);
              }
              if (params.scanStyles && element.nodeType === 1) {
                clone.setAttribute("style", Object(_functions__WEBPACK_IMPORTED_MODULE_0__["collectStyles"])(element, params));
              }
              switch (element.tagName) {
                case "SELECT":
                  clone.value = element.value;
                  break;
                case "CANVAS":
                  clone.getContext("2d").drawImage(element, 0, 0);
                  break;
              }
              return clone;
            }
            function isHtmlElement(printable) {
              return _typeof(printable) === "object" && printable && (printable instanceof HTMLElement || printable.nodeType === 1);
            }
          }
        ),
        /***/
        "./src/js/image.js": (
          /*!*************************!*\
            !*** ./src/js/image.js ***!
            \*************************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
              /*! ./functions */
              "./src/js/functions.js"
            );
            var _print__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
              /*! ./print */
              "./src/js/print.js"
            );
            var _browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
              /*! ./browser */
              "./src/js/browser.js"
            );
            __webpack_exports__["default"] = {
              print: function print2(params, printFrame) {
                if (params.printable.constructor !== Array) {
                  params.printable = [params.printable];
                }
                params.printableElement = document.createElement("div");
                params.printable.forEach(function(src) {
                  var img = document.createElement("img");
                  img.setAttribute("style", params.imageStyle);
                  img.src = src;
                  if (_browser__WEBPACK_IMPORTED_MODULE_2__["default"].isFirefox()) {
                    var fullyQualifiedSrc = img.src;
                    img.src = fullyQualifiedSrc;
                  }
                  var imageWrapper = document.createElement("div");
                  imageWrapper.appendChild(img);
                  params.printableElement.appendChild(imageWrapper);
                });
                if (params.header)
                  Object(_functions__WEBPACK_IMPORTED_MODULE_0__["addHeader"])(params.printableElement, params);
                _print__WEBPACK_IMPORTED_MODULE_1__["default"].send(params, printFrame);
              }
            };
          }
        ),
        /***/
        "./src/js/init.js": (
          /*!************************!*\
            !*** ./src/js/init.js ***!
            \************************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var _browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
              /*! ./browser */
              "./src/js/browser.js"
            );
            var _modal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
              /*! ./modal */
              "./src/js/modal.js"
            );
            var _pdf__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
              /*! ./pdf */
              "./src/js/pdf.js"
            );
            var _html__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
              /*! ./html */
              "./src/js/html.js"
            );
            var _raw_html__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
              /*! ./raw-html */
              "./src/js/raw-html.js"
            );
            var _image__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
              /*! ./image */
              "./src/js/image.js"
            );
            var _json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(
              /*! ./json */
              "./src/js/json.js"
            );
            function _typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                _typeof = function _typeof2(obj2) {
                  return typeof obj2;
                };
              } else {
                _typeof = function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                };
              }
              return _typeof(obj);
            }
            var printTypes = ["pdf", "html", "image", "json", "raw-html"];
            __webpack_exports__["default"] = {
              init: function init() {
                var params = {
                  printable: null,
                  fallbackPrintable: null,
                  type: "pdf",
                  header: null,
                  headerStyle: "font-weight: 300;",
                  maxWidth: 800,
                  properties: null,
                  gridHeaderStyle: "font-weight: bold; padding: 5px; border: 1px solid #dddddd;",
                  gridStyle: "border: 1px solid lightgray; margin-bottom: -1px;",
                  showModal: false,
                  onError: function onError(error2) {
                    throw error2;
                  },
                  onLoadingStart: null,
                  onLoadingEnd: null,
                  onPrintDialogClose: function onPrintDialogClose() {
                  },
                  onIncompatibleBrowser: function onIncompatibleBrowser() {
                  },
                  modalMessage: "Retrieving Document...",
                  frameId: "printJS",
                  printableElement: null,
                  documentTitle: "Document",
                  targetStyle: ["clear", "display", "width", "min-width", "height", "min-height", "max-height"],
                  targetStyles: ["border", "box", "break", "text-decoration"],
                  ignoreElements: [],
                  repeatTableHeader: true,
                  css: null,
                  style: null,
                  scanStyles: true,
                  base64: false,
                  // Deprecated
                  onPdfOpen: null,
                  font: "TimesNewRoman",
                  font_size: "12pt",
                  honorMarginPadding: true,
                  honorColor: false,
                  imageStyle: "max-width: 100%;"
                };
                var args = arguments[0];
                if (args === void 0) {
                  throw new Error("printJS expects at least 1 attribute.");
                }
                switch (_typeof(args)) {
                  case "string":
                    params.printable = encodeURI(args);
                    params.fallbackPrintable = params.printable;
                    params.type = arguments[1] || params.type;
                    break;
                  case "object":
                    params.printable = args.printable;
                    params.fallbackPrintable = typeof args.fallbackPrintable !== "undefined" ? args.fallbackPrintable : params.printable;
                    params.fallbackPrintable = params.base64 ? "data:application/pdf;base64,".concat(params.fallbackPrintable) : params.fallbackPrintable;
                    for (var k in params) {
                      if (k === "printable" || k === "fallbackPrintable")
                        continue;
                      params[k] = typeof args[k] !== "undefined" ? args[k] : params[k];
                    }
                    break;
                  default:
                    throw new Error('Unexpected argument type! Expected "string" or "object", got ' + _typeof(args));
                }
                if (!params.printable)
                  throw new Error("Missing printable information.");
                if (!params.type || typeof params.type !== "string" || printTypes.indexOf(params.type.toLowerCase()) === -1) {
                  throw new Error("Invalid print type. Available types are: pdf, html, image and json.");
                }
                if (params.showModal)
                  _modal__WEBPACK_IMPORTED_MODULE_1__["default"].show(params);
                if (params.onLoadingStart)
                  params.onLoadingStart();
                var usedFrame = document.getElementById(params.frameId);
                if (usedFrame)
                  usedFrame.parentNode.removeChild(usedFrame);
                var printFrame = document.createElement("iframe");
                if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isFirefox()) {
                  printFrame.setAttribute("style", "width: 1px; height: 100px; position: fixed; left: 0; top: 0; opacity: 0; border-width: 0; margin: 0; padding: 0");
                } else {
                  printFrame.setAttribute("style", "visibility: hidden; height: 0; width: 0; position: absolute; border: 0");
                }
                printFrame.setAttribute("id", params.frameId);
                if (params.type !== "pdf") {
                  printFrame.srcdoc = "<html><head><title>" + params.documentTitle + "</title>";
                  if (params.css) {
                    if (!Array.isArray(params.css))
                      params.css = [params.css];
                    params.css.forEach(function(file) {
                      printFrame.srcdoc += '<link rel="stylesheet" href="' + file + '">';
                    });
                  }
                  printFrame.srcdoc += "</head><body></body></html>";
                }
                switch (params.type) {
                  case "pdf":
                    if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isIE()) {
                      try {
                        console.info("Print.js doesn't support PDF printing in Internet Explorer.");
                        var win = window.open(params.fallbackPrintable, "_blank");
                        win.focus();
                        params.onIncompatibleBrowser();
                      } catch (error2) {
                        params.onError(error2);
                      } finally {
                        if (params.showModal)
                          _modal__WEBPACK_IMPORTED_MODULE_1__["default"].close();
                        if (params.onLoadingEnd)
                          params.onLoadingEnd();
                      }
                    } else {
                      _pdf__WEBPACK_IMPORTED_MODULE_2__["default"].print(params, printFrame);
                    }
                    break;
                  case "image":
                    _image__WEBPACK_IMPORTED_MODULE_5__["default"].print(params, printFrame);
                    break;
                  case "html":
                    _html__WEBPACK_IMPORTED_MODULE_3__["default"].print(params, printFrame);
                    break;
                  case "raw-html":
                    _raw_html__WEBPACK_IMPORTED_MODULE_4__["default"].print(params, printFrame);
                    break;
                  case "json":
                    _json__WEBPACK_IMPORTED_MODULE_6__["default"].print(params, printFrame);
                    break;
                }
              }
            };
          }
        ),
        /***/
        "./src/js/json.js": (
          /*!************************!*\
            !*** ./src/js/json.js ***!
            \************************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
              /*! ./functions */
              "./src/js/functions.js"
            );
            var _print__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
              /*! ./print */
              "./src/js/print.js"
            );
            function _typeof(obj) {
              "@babel/helpers - typeof";
              if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                _typeof = function _typeof2(obj2) {
                  return typeof obj2;
                };
              } else {
                _typeof = function _typeof2(obj2) {
                  return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                };
              }
              return _typeof(obj);
            }
            __webpack_exports__["default"] = {
              print: function print2(params, printFrame) {
                if (_typeof(params.printable) !== "object") {
                  throw new Error("Invalid javascript data object (JSON).");
                }
                if (typeof params.repeatTableHeader !== "boolean") {
                  throw new Error("Invalid value for repeatTableHeader attribute (JSON).");
                }
                if (!params.properties || !Array.isArray(params.properties)) {
                  throw new Error("Invalid properties array for your JSON data.");
                }
                params.properties = params.properties.map(function(property) {
                  return {
                    field: _typeof(property) === "object" ? property.field : property,
                    displayName: _typeof(property) === "object" ? property.displayName : property,
                    columnSize: _typeof(property) === "object" && property.columnSize ? property.columnSize + ";" : 100 / params.properties.length + "%;"
                  };
                });
                params.printableElement = document.createElement("div");
                if (params.header) {
                  Object(_functions__WEBPACK_IMPORTED_MODULE_0__["addHeader"])(params.printableElement, params);
                }
                params.printableElement.innerHTML += jsonToHTML(params);
                _print__WEBPACK_IMPORTED_MODULE_1__["default"].send(params, printFrame);
              }
            };
            function jsonToHTML(params) {
              var data = params.printable;
              var properties = params.properties;
              var htmlData = '<table style="border-collapse: collapse; width: 100%;">';
              if (params.repeatTableHeader) {
                htmlData += "<thead>";
              }
              htmlData += "<tr>";
              for (var a2 = 0; a2 < properties.length; a2++) {
                htmlData += '<th style="width:' + properties[a2].columnSize + ";" + params.gridHeaderStyle + '">' + Object(_functions__WEBPACK_IMPORTED_MODULE_0__["capitalizePrint"])(properties[a2].displayName) + "</th>";
              }
              htmlData += "</tr>";
              if (params.repeatTableHeader) {
                htmlData += "</thead>";
              }
              htmlData += "<tbody>";
              for (var i = 0; i < data.length; i++) {
                htmlData += "<tr>";
                for (var n2 = 0; n2 < properties.length; n2++) {
                  var stringData = data[i];
                  var property = properties[n2].field.split(".");
                  if (property.length > 1) {
                    for (var p2 = 0; p2 < property.length; p2++) {
                      stringData = stringData[property[p2]];
                    }
                  } else {
                    stringData = stringData[properties[n2].field];
                  }
                  htmlData += '<td style="width:' + properties[n2].columnSize + params.gridStyle + '">' + stringData + "</td>";
                }
                htmlData += "</tr>";
              }
              htmlData += "</tbody></table>";
              return htmlData;
            }
          }
        ),
        /***/
        "./src/js/modal.js": (
          /*!*************************!*\
            !*** ./src/js/modal.js ***!
            \*************************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var Modal = {
              show: function show(params) {
                var modalStyle = "font-family:sans-serif; display:table; text-align:center; font-weight:300; font-size:30px; left:0; top:0;position:fixed; z-index: 9990;color: #0460B5; width: 100%; height: 100%; background-color:rgba(255,255,255,.9);transition: opacity .3s ease;";
                var printModal = document.createElement("div");
                printModal.setAttribute("style", modalStyle);
                printModal.setAttribute("id", "printJS-Modal");
                var contentDiv = document.createElement("div");
                contentDiv.setAttribute("style", "display:table-cell; vertical-align:middle; padding-bottom:100px;");
                var closeButton = document.createElement("div");
                closeButton.setAttribute("class", "printClose");
                closeButton.setAttribute("id", "printClose");
                contentDiv.appendChild(closeButton);
                var spinner = document.createElement("span");
                spinner.setAttribute("class", "printSpinner");
                contentDiv.appendChild(spinner);
                var messageNode = document.createTextNode(params.modalMessage);
                contentDiv.appendChild(messageNode);
                printModal.appendChild(contentDiv);
                document.getElementsByTagName("body")[0].appendChild(printModal);
                document.getElementById("printClose").addEventListener("click", function() {
                  Modal.close();
                });
              },
              close: function close() {
                var printModal = document.getElementById("printJS-Modal");
                if (printModal) {
                  printModal.parentNode.removeChild(printModal);
                }
              }
            };
            __webpack_exports__["default"] = Modal;
          }
        ),
        /***/
        "./src/js/pdf.js": (
          /*!***********************!*\
            !*** ./src/js/pdf.js ***!
            \***********************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var _print__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
              /*! ./print */
              "./src/js/print.js"
            );
            var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
              /*! ./functions */
              "./src/js/functions.js"
            );
            __webpack_exports__["default"] = {
              print: function print2(params, printFrame) {
                if (params.base64) {
                  var bytesArray = Uint8Array.from(atob(params.printable), function(c2) {
                    return c2.charCodeAt(0);
                  });
                  createBlobAndPrint(params, printFrame, bytesArray);
                  return;
                }
                params.printable = /^(blob|http|\/\/)/i.test(params.printable) ? params.printable : window.location.origin + (params.printable.charAt(0) !== "/" ? "/" + params.printable : params.printable);
                var req = new window.XMLHttpRequest();
                req.responseType = "arraybuffer";
                req.addEventListener("error", function() {
                  Object(_functions__WEBPACK_IMPORTED_MODULE_1__["cleanUp"])(params);
                  params.onError(req.statusText, req);
                });
                req.addEventListener("load", function() {
                  if ([200, 201].indexOf(req.status) === -1) {
                    Object(_functions__WEBPACK_IMPORTED_MODULE_1__["cleanUp"])(params);
                    params.onError(req.statusText, req);
                    return;
                  }
                  createBlobAndPrint(params, printFrame, req.response);
                });
                req.open("GET", params.printable, true);
                req.send();
              }
            };
            function createBlobAndPrint(params, printFrame, data) {
              var localPdf = new window.Blob([data], {
                type: "application/pdf"
              });
              localPdf = window.URL.createObjectURL(localPdf);
              printFrame.setAttribute("src", localPdf);
              _print__WEBPACK_IMPORTED_MODULE_0__["default"].send(params, printFrame);
            }
          }
        ),
        /***/
        "./src/js/print.js": (
          /*!*************************!*\
            !*** ./src/js/print.js ***!
            \*************************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var _browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
              /*! ./browser */
              "./src/js/browser.js"
            );
            var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
              /*! ./functions */
              "./src/js/functions.js"
            );
            var Print = {
              send: function send(params, printFrame) {
                document.getElementsByTagName("body")[0].appendChild(printFrame);
                var iframeElement = document.getElementById(params.frameId);
                iframeElement.onload = function() {
                  if (params.type === "pdf") {
                    if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isFirefox()) {
                      setTimeout(function() {
                        return performPrint(iframeElement, params);
                      }, 1e3);
                    } else {
                      performPrint(iframeElement, params);
                    }
                    return;
                  }
                  var printDocument = iframeElement.contentWindow || iframeElement.contentDocument;
                  if (printDocument.document)
                    printDocument = printDocument.document;
                  printDocument.body.appendChild(params.printableElement);
                  if (params.type !== "pdf" && params.style) {
                    var style = document.createElement("style");
                    style.innerHTML = params.style;
                    printDocument.head.appendChild(style);
                  }
                  var images = printDocument.getElementsByTagName("img");
                  if (images.length > 0) {
                    loadIframeImages(Array.from(images)).then(function() {
                      return performPrint(iframeElement, params);
                    });
                  } else {
                    performPrint(iframeElement, params);
                  }
                };
              }
            };
            function performPrint(iframeElement, params) {
              try {
                iframeElement.focus();
                if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isEdge() || _browser__WEBPACK_IMPORTED_MODULE_0__["default"].isIE()) {
                  try {
                    iframeElement.contentWindow.document.execCommand("print", false, null);
                  } catch (e2) {
                    iframeElement.contentWindow.print();
                  }
                } else {
                  iframeElement.contentWindow.print();
                }
              } catch (error2) {
                params.onError(error2);
              } finally {
                if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isFirefox()) {
                  iframeElement.style.visibility = "hidden";
                  iframeElement.style.left = "-1px";
                }
                Object(_functions__WEBPACK_IMPORTED_MODULE_1__["cleanUp"])(params);
              }
            }
            function loadIframeImages(images) {
              var promises = images.map(function(image) {
                if (image.src && image.src !== window.location.href) {
                  return loadIframeImage(image);
                }
              });
              return Promise.all(promises);
            }
            function loadIframeImage(image) {
              return new Promise(function(resolve) {
                var pollImage = function pollImage2() {
                  !image || typeof image.naturalWidth === "undefined" || image.naturalWidth === 0 || !image.complete ? setTimeout(pollImage2, 500) : resolve();
                };
                pollImage();
              });
            }
            __webpack_exports__["default"] = Print;
          }
        ),
        /***/
        "./src/js/raw-html.js": (
          /*!****************************!*\
            !*** ./src/js/raw-html.js ***!
            \****************************/
          /*! exports provided: default */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var _print__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
              /*! ./print */
              "./src/js/print.js"
            );
            __webpack_exports__["default"] = {
              print: function print2(params, printFrame) {
                params.printableElement = document.createElement("div");
                params.printableElement.setAttribute("style", "width:100%");
                params.printableElement.innerHTML = params.printable;
                _print__WEBPACK_IMPORTED_MODULE_0__["default"].send(params, printFrame);
              }
            };
          }
        ),
        /***/
        "./src/sass/index.scss": (
          /*!*****************************!*\
            !*** ./src/sass/index.scss ***!
            \*****************************/
          /*! no static exports found */
          /***/
          function(module2, exports2, __webpack_require__) {
          }
        ),
        /***/
        0: (
          /*!****************************!*\
            !*** multi ./src/index.js ***!
            \****************************/
          /*! no static exports found */
          /***/
          function(module2, exports2, __webpack_require__) {
            module2.exports = __webpack_require__(
              /*! ./src/index.js */
              "./src/index.js"
            );
          }
        )
        /******/
      })["default"]
    );
  });
})(print);
var printExports = print.exports;
const printJS = /* @__PURE__ */ getDefaultExportFromCjs(printExports);
function resolveUrl(url, baseUrl) {
  if (url.match(/^[a-z]+:\/\//i)) {
    return url;
  }
  if (url.match(/^\/\//)) {
    return window.location.protocol + url;
  }
  if (url.match(/^[a-z]+:/i)) {
    return url;
  }
  const doc2 = document.implementation.createHTMLDocument();
  const base = doc2.createElement("base");
  const a2 = doc2.createElement("a");
  doc2.head.appendChild(base);
  doc2.body.appendChild(a2);
  if (baseUrl) {
    base.href = baseUrl;
  }
  a2.href = url;
  return a2.href;
}
const uuid = (() => {
  let counter = 0;
  const random = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => {
    counter += 1;
    return `u${random()}${counter}`;
  };
})();
function toArray(arrayLike) {
  const arr = [];
  for (let i = 0, l2 = arrayLike.length; i < l2; i++) {
    arr.push(arrayLike[i]);
  }
  return arr;
}
let styleProps = null;
function getStyleProperties(options = {}) {
  if (styleProps) {
    return styleProps;
  }
  if (options.includeStyleProperties) {
    styleProps = options.includeStyleProperties;
    return styleProps;
  }
  styleProps = toArray(window.getComputedStyle(document.documentElement));
  return styleProps;
}
function px(node, styleProperty) {
  const win = node.ownerDocument.defaultView || window;
  const val = win.getComputedStyle(node).getPropertyValue(styleProperty);
  return val ? parseFloat(val.replace("px", "")) : 0;
}
function getNodeWidth(node) {
  const leftBorder = px(node, "border-left-width");
  const rightBorder = px(node, "border-right-width");
  return node.clientWidth + leftBorder + rightBorder;
}
function getNodeHeight(node) {
  const topBorder = px(node, "border-top-width");
  const bottomBorder = px(node, "border-bottom-width");
  return node.clientHeight + topBorder + bottomBorder;
}
function getImageSize(targetNode, options = {}) {
  const width = options.width || getNodeWidth(targetNode);
  const height = options.height || getNodeHeight(targetNode);
  return { width, height };
}
function getPixelRatio() {
  let ratio;
  let FINAL_PROCESS;
  try {
    FINAL_PROCESS = process;
  } catch (e2) {
  }
  const val = FINAL_PROCESS && FINAL_PROCESS.env ? FINAL_PROCESS.env.devicePixelRatio : null;
  if (val) {
    ratio = parseInt(val, 10);
    if (Number.isNaN(ratio)) {
      ratio = 1;
    }
  }
  return ratio || window.devicePixelRatio || 1;
}
const canvasDimensionLimit = 16384;
function checkCanvasDimensions(canvas) {
  if (canvas.width > canvasDimensionLimit || canvas.height > canvasDimensionLimit) {
    if (canvas.width > canvasDimensionLimit && canvas.height > canvasDimensionLimit) {
      if (canvas.width > canvas.height) {
        canvas.height *= canvasDimensionLimit / canvas.width;
        canvas.width = canvasDimensionLimit;
      } else {
        canvas.width *= canvasDimensionLimit / canvas.height;
        canvas.height = canvasDimensionLimit;
      }
    } else if (canvas.width > canvasDimensionLimit) {
      canvas.height *= canvasDimensionLimit / canvas.width;
      canvas.width = canvasDimensionLimit;
    } else {
      canvas.width *= canvasDimensionLimit / canvas.height;
      canvas.height = canvasDimensionLimit;
    }
  }
}
function canvasToBlob(canvas, options = {}) {
  if (canvas.toBlob) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, options.type ? options.type : "image/png", options.quality ? options.quality : 1);
    });
  }
  return new Promise((resolve) => {
    const binaryString = window.atob(canvas.toDataURL(options.type ? options.type : void 0, options.quality ? options.quality : void 0).split(",")[1]);
    const len = binaryString.length;
    const binaryArray = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      binaryArray[i] = binaryString.charCodeAt(i);
    }
    resolve(new Blob([binaryArray], {
      type: options.type ? options.type : "image/png"
    }));
  });
}
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      img.decode().then(() => {
        requestAnimationFrame(() => resolve(img));
      });
    };
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = url;
  });
}
async function svgToDataURL(svg) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(svg)).then(encodeURIComponent).then((html) => `data:image/svg+xml;charset=utf-8,${html}`);
}
async function nodeToDataURL(node, width, height) {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  const foreignObject = document.createElementNS(xmlns, "foreignObject");
  svg.setAttribute("width", `${width}`);
  svg.setAttribute("height", `${height}`);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  foreignObject.setAttribute("width", "100%");
  foreignObject.setAttribute("height", "100%");
  foreignObject.setAttribute("x", "0");
  foreignObject.setAttribute("y", "0");
  foreignObject.setAttribute("externalResourcesRequired", "true");
  svg.appendChild(foreignObject);
  foreignObject.appendChild(node);
  return svgToDataURL(svg);
}
const isInstanceOfElement = (node, instance) => {
  if (node instanceof instance)
    return true;
  const nodePrototype = Object.getPrototypeOf(node);
  if (nodePrototype === null)
    return false;
  return nodePrototype.constructor.name === instance.name || isInstanceOfElement(nodePrototype, instance);
};
function formatCSSText(style) {
  const content = style.getPropertyValue("content");
  return `${style.cssText} content: '${content.replace(/'|"/g, "")}';`;
}
function formatCSSProperties(style, options) {
  return getStyleProperties(options).map((name2) => {
    const value = style.getPropertyValue(name2);
    const priority = style.getPropertyPriority(name2);
    return `${name2}: ${value}${priority ? " !important" : ""};`;
  }).join(" ");
}
function getPseudoElementStyle(className, pseudo, style, options) {
  const selector = `.${className}:${pseudo}`;
  const cssText = style.cssText ? formatCSSText(style) : formatCSSProperties(style, options);
  return document.createTextNode(`${selector}{${cssText}}`);
}
function clonePseudoElement(nativeNode, clonedNode, pseudo, options) {
  const style = window.getComputedStyle(nativeNode, pseudo);
  const content = style.getPropertyValue("content");
  if (content === "" || content === "none") {
    return;
  }
  const className = uuid();
  try {
    clonedNode.className = `${clonedNode.className} ${className}`;
  } catch (err) {
    return;
  }
  const styleElement = document.createElement("style");
  styleElement.appendChild(getPseudoElementStyle(className, pseudo, style, options));
  clonedNode.appendChild(styleElement);
}
function clonePseudoElements(nativeNode, clonedNode, options) {
  clonePseudoElement(nativeNode, clonedNode, ":before", options);
  clonePseudoElement(nativeNode, clonedNode, ":after", options);
}
const WOFF = "application/font-woff";
const JPEG = "image/jpeg";
const mimes = {
  woff: WOFF,
  woff2: WOFF,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: JPEG,
  jpeg: JPEG,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function getExtension(url) {
  const match = /\.([^./]*?)$/g.exec(url);
  return match ? match[1] : "";
}
function getMimeType(url) {
  const extension = getExtension(url).toLowerCase();
  return mimes[extension] || "";
}
function getContentFromDataUrl(dataURL) {
  return dataURL.split(/,/)[1];
}
function isDataUrl(url) {
  return url.search(/^(data:)/) !== -1;
}
function makeDataUrl(content, mimeType) {
  return `data:${mimeType};base64,${content}`;
}
async function fetchAsDataURL(url, init, process2) {
  const res = await fetch(url, init);
  if (res.status === 404) {
    throw new Error(`Resource "${res.url}" not found`);
  }
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      try {
        resolve(process2({ res, result: reader.result }));
      } catch (error2) {
        reject(error2);
      }
    };
    reader.readAsDataURL(blob);
  });
}
const cache = {};
function getCacheKey(url, contentType, includeQueryParams) {
  let key2 = url.replace(/\?.*/, "");
  if (includeQueryParams) {
    key2 = url;
  }
  if (/ttf|otf|eot|woff2?/i.test(key2)) {
    key2 = key2.replace(/.*\//, "");
  }
  return contentType ? `[${contentType}]${key2}` : key2;
}
async function resourceToDataURL(resourceUrl, contentType, options) {
  const cacheKey = getCacheKey(resourceUrl, contentType, options.includeQueryParams);
  if (cache[cacheKey] != null) {
    return cache[cacheKey];
  }
  if (options.cacheBust) {
    resourceUrl += (/\?/.test(resourceUrl) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime();
  }
  let dataURL;
  try {
    const content = await fetchAsDataURL(resourceUrl, options.fetchRequestInit, ({ res, result }) => {
      if (!contentType) {
        contentType = res.headers.get("Content-Type") || "";
      }
      return getContentFromDataUrl(result);
    });
    dataURL = makeDataUrl(content, contentType);
  } catch (error2) {
    dataURL = options.imagePlaceholder || "";
    let msg = `Failed to fetch resource: ${resourceUrl}`;
    if (error2) {
      msg = typeof error2 === "string" ? error2 : error2.message;
    }
    if (msg) {
      console.warn(msg);
    }
  }
  cache[cacheKey] = dataURL;
  return dataURL;
}
async function cloneCanvasElement(canvas) {
  const dataURL = canvas.toDataURL();
  if (dataURL === "data:,") {
    return canvas.cloneNode(false);
  }
  return createImage(dataURL);
}
async function cloneVideoElement(video, options) {
  if (video.currentSrc) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL2 = canvas.toDataURL();
    return createImage(dataURL2);
  }
  const poster = video.poster;
  const contentType = getMimeType(poster);
  const dataURL = await resourceToDataURL(poster, contentType, options);
  return createImage(dataURL);
}
async function cloneIFrameElement(iframe, options) {
  var _a;
  try {
    if ((_a = iframe === null || iframe === void 0 ? void 0 : iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.body) {
      return await cloneNode(iframe.contentDocument.body, options, true);
    }
  } catch (_b) {
  }
  return iframe.cloneNode(false);
}
async function cloneSingleNode(node, options) {
  if (isInstanceOfElement(node, HTMLCanvasElement)) {
    return cloneCanvasElement(node);
  }
  if (isInstanceOfElement(node, HTMLVideoElement)) {
    return cloneVideoElement(node, options);
  }
  if (isInstanceOfElement(node, HTMLIFrameElement)) {
    return cloneIFrameElement(node, options);
  }
  return node.cloneNode(isSVGElement(node));
}
const isSlotElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SLOT";
const isSVGElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SVG";
async function cloneChildren(nativeNode, clonedNode, options) {
  var _a, _b;
  if (isSVGElement(clonedNode)) {
    return clonedNode;
  }
  let children = [];
  if (isSlotElement(nativeNode) && nativeNode.assignedNodes) {
    children = toArray(nativeNode.assignedNodes());
  } else if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && ((_a = nativeNode.contentDocument) === null || _a === void 0 ? void 0 : _a.body)) {
    children = toArray(nativeNode.contentDocument.body.childNodes);
  } else {
    children = toArray(((_b = nativeNode.shadowRoot) !== null && _b !== void 0 ? _b : nativeNode).childNodes);
  }
  if (children.length === 0 || isInstanceOfElement(nativeNode, HTMLVideoElement)) {
    return clonedNode;
  }
  await children.reduce((deferred, child2) => deferred.then(() => cloneNode(child2, options)).then((clonedChild) => {
    if (clonedChild) {
      clonedNode.appendChild(clonedChild);
    }
  }), Promise.resolve());
  return clonedNode;
}
function cloneCSSStyle(nativeNode, clonedNode, options) {
  const targetStyle = clonedNode.style;
  if (!targetStyle) {
    return;
  }
  const sourceStyle = window.getComputedStyle(nativeNode);
  if (sourceStyle.cssText) {
    targetStyle.cssText = sourceStyle.cssText;
    targetStyle.transformOrigin = sourceStyle.transformOrigin;
  } else {
    getStyleProperties(options).forEach((name2) => {
      let value = sourceStyle.getPropertyValue(name2);
      if (name2 === "font-size" && value.endsWith("px")) {
        const reducedFont = Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
        value = `${reducedFont}px`;
      }
      if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && name2 === "display" && value === "inline") {
        value = "block";
      }
      if (name2 === "d" && clonedNode.getAttribute("d")) {
        value = `path(${clonedNode.getAttribute("d")})`;
      }
      targetStyle.setProperty(name2, value, sourceStyle.getPropertyPriority(name2));
    });
  }
}
function cloneInputValue(nativeNode, clonedNode) {
  if (isInstanceOfElement(nativeNode, HTMLTextAreaElement)) {
    clonedNode.innerHTML = nativeNode.value;
  }
  if (isInstanceOfElement(nativeNode, HTMLInputElement)) {
    clonedNode.setAttribute("value", nativeNode.value);
  }
}
function cloneSelectValue(nativeNode, clonedNode) {
  if (isInstanceOfElement(nativeNode, HTMLSelectElement)) {
    const clonedSelect = clonedNode;
    const selectedOption = Array.from(clonedSelect.children).find((child2) => nativeNode.value === child2.getAttribute("value"));
    if (selectedOption) {
      selectedOption.setAttribute("selected", "");
    }
  }
}
function decorate(nativeNode, clonedNode, options) {
  if (isInstanceOfElement(clonedNode, Element)) {
    cloneCSSStyle(nativeNode, clonedNode, options);
    clonePseudoElements(nativeNode, clonedNode, options);
    cloneInputValue(nativeNode, clonedNode);
    cloneSelectValue(nativeNode, clonedNode);
  }
  return clonedNode;
}
async function ensureSVGSymbols(clone, options) {
  const uses = clone.querySelectorAll ? clone.querySelectorAll("use") : [];
  if (uses.length === 0) {
    return clone;
  }
  const processedDefs = {};
  for (let i = 0; i < uses.length; i++) {
    const use = uses[i];
    const id2 = use.getAttribute("xlink:href");
    if (id2) {
      const exist = clone.querySelector(id2);
      const definition = document.querySelector(id2);
      if (!exist && definition && !processedDefs[id2]) {
        processedDefs[id2] = await cloneNode(definition, options, true);
      }
    }
  }
  const nodes = Object.values(processedDefs);
  if (nodes.length) {
    const ns = "http://www.w3.org/1999/xhtml";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("xmlns", ns);
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.overflow = "hidden";
    svg.style.display = "none";
    const defs = document.createElementNS(ns, "defs");
    svg.appendChild(defs);
    for (let i = 0; i < nodes.length; i++) {
      defs.appendChild(nodes[i]);
    }
    clone.appendChild(svg);
  }
  return clone;
}
async function cloneNode(node, options, isRoot) {
  if (!isRoot && options.filter && !options.filter(node)) {
    return null;
  }
  return Promise.resolve(node).then((clonedNode) => cloneSingleNode(clonedNode, options)).then((clonedNode) => cloneChildren(node, clonedNode, options)).then((clonedNode) => decorate(node, clonedNode, options)).then((clonedNode) => ensureSVGSymbols(clonedNode, options));
}
const URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
const URL_WITH_FORMAT_REGEX = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
const FONT_SRC_REGEX = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function toRegex(url) {
  const escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${escaped})(['"]?\\))`, "g");
}
function parseURLs(cssText) {
  const urls = [];
  cssText.replace(URL_REGEX, (raw, quotation, url) => {
    urls.push(url);
    return raw;
  });
  return urls.filter((url) => !isDataUrl(url));
}
async function embed(cssText, resourceURL, baseURL, options, getContentFromUrl) {
  try {
    const resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;
    const contentType = getMimeType(resourceURL);
    let dataURL;
    if (getContentFromUrl) {
      const content = await getContentFromUrl(resolvedURL);
      dataURL = makeDataUrl(content, contentType);
    } else {
      dataURL = await resourceToDataURL(resolvedURL, contentType, options);
    }
    return cssText.replace(toRegex(resourceURL), `$1${dataURL}$3`);
  } catch (error2) {
  }
  return cssText;
}
function filterPreferredFontFormat(str2, { preferredFontFormat }) {
  return !preferredFontFormat ? str2 : str2.replace(FONT_SRC_REGEX, (match) => {
    while (true) {
      const [src, , format] = URL_WITH_FORMAT_REGEX.exec(match) || [];
      if (!format) {
        return "";
      }
      if (format === preferredFontFormat) {
        return `src: ${src};`;
      }
    }
  });
}
function shouldEmbed(url) {
  return url.search(URL_REGEX) !== -1;
}
async function embedResources(cssText, baseUrl, options) {
  if (!shouldEmbed(cssText)) {
    return cssText;
  }
  const filteredCSSText = filterPreferredFontFormat(cssText, options);
  const urls = parseURLs(filteredCSSText);
  return urls.reduce((deferred, url) => deferred.then((css2) => embed(css2, url, baseUrl, options)), Promise.resolve(filteredCSSText));
}
async function embedProp(propName, node, options) {
  var _a;
  const propValue = (_a = node.style) === null || _a === void 0 ? void 0 : _a.getPropertyValue(propName);
  if (propValue) {
    const cssString = await embedResources(propValue, null, options);
    node.style.setProperty(propName, cssString, node.style.getPropertyPriority(propName));
    return true;
  }
  return false;
}
async function embedBackground(clonedNode, options) {
  await embedProp("background", clonedNode, options) || await embedProp("background-image", clonedNode, options);
  await embedProp("mask", clonedNode, options) || await embedProp("-webkit-mask", clonedNode, options) || await embedProp("mask-image", clonedNode, options) || await embedProp("-webkit-mask-image", clonedNode, options);
}
async function embedImageNode(clonedNode, options) {
  const isImageElement = isInstanceOfElement(clonedNode, HTMLImageElement);
  if (!(isImageElement && !isDataUrl(clonedNode.src)) && !(isInstanceOfElement(clonedNode, SVGImageElement) && !isDataUrl(clonedNode.href.baseVal))) {
    return;
  }
  const url = isImageElement ? clonedNode.src : clonedNode.href.baseVal;
  const dataURL = await resourceToDataURL(url, getMimeType(url), options);
  await new Promise((resolve, reject) => {
    clonedNode.onload = resolve;
    clonedNode.onerror = options.onImageErrorHandler ? (...attributes) => {
      try {
        resolve(options.onImageErrorHandler(...attributes));
      } catch (error2) {
        reject(error2);
      }
    } : reject;
    const image = clonedNode;
    if (image.decode) {
      image.decode = resolve;
    }
    if (image.loading === "lazy") {
      image.loading = "eager";
    }
    if (isImageElement) {
      clonedNode.srcset = "";
      clonedNode.src = dataURL;
    } else {
      clonedNode.href.baseVal = dataURL;
    }
  });
}
async function embedChildren(clonedNode, options) {
  const children = toArray(clonedNode.childNodes);
  const deferreds = children.map((child2) => embedImages(child2, options));
  await Promise.all(deferreds).then(() => clonedNode);
}
async function embedImages(clonedNode, options) {
  if (isInstanceOfElement(clonedNode, Element)) {
    await embedBackground(clonedNode, options);
    await embedImageNode(clonedNode, options);
    await embedChildren(clonedNode, options);
  }
}
function applyStyle(node, options) {
  const { style } = node;
  if (options.backgroundColor) {
    style.backgroundColor = options.backgroundColor;
  }
  if (options.width) {
    style.width = `${options.width}px`;
  }
  if (options.height) {
    style.height = `${options.height}px`;
  }
  const manual = options.style;
  if (manual != null) {
    Object.keys(manual).forEach((key2) => {
      style[key2] = manual[key2];
    });
  }
  return node;
}
const cssFetchCache = {};
async function fetchCSS(url) {
  let cache2 = cssFetchCache[url];
  if (cache2 != null) {
    return cache2;
  }
  const res = await fetch(url);
  const cssText = await res.text();
  cache2 = { url, cssText };
  cssFetchCache[url] = cache2;
  return cache2;
}
async function embedFonts(data, options) {
  let cssText = data.cssText;
  const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
  const fontLocs = cssText.match(/url\([^)]+\)/g) || [];
  const loadFonts = fontLocs.map(async (loc) => {
    let url = loc.replace(regexUrl, "$1");
    if (!url.startsWith("https://")) {
      url = new URL(url, data.url).href;
    }
    return fetchAsDataURL(url, options.fetchRequestInit, ({ result }) => {
      cssText = cssText.replace(loc, `url(${result})`);
      return [loc, result];
    });
  });
  return Promise.all(loadFonts).then(() => cssText);
}
function parseCSS(source2) {
  if (source2 == null) {
    return [];
  }
  const result = [];
  const commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
  let cssText = source2.replace(commentsRegex, "");
  const keyframesRegex = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  while (true) {
    const matches = keyframesRegex.exec(cssText);
    if (matches === null) {
      break;
    }
    result.push(matches[0]);
  }
  cssText = cssText.replace(keyframesRegex, "");
  const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
  const combinedCSSRegex = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})";
  const unifiedRegex = new RegExp(combinedCSSRegex, "gi");
  while (true) {
    let matches = importRegex.exec(cssText);
    if (matches === null) {
      matches = unifiedRegex.exec(cssText);
      if (matches === null) {
        break;
      } else {
        importRegex.lastIndex = unifiedRegex.lastIndex;
      }
    } else {
      unifiedRegex.lastIndex = importRegex.lastIndex;
    }
    result.push(matches[0]);
  }
  return result;
}
async function getCSSRules(styleSheets, options) {
  const ret = [];
  const deferreds = [];
  styleSheets.forEach((sheet) => {
    if ("cssRules" in sheet) {
      try {
        toArray(sheet.cssRules || []).forEach((item, index) => {
          if (item.type === CSSRule.IMPORT_RULE) {
            let importIndex = index + 1;
            const url = item.href;
            const deferred = fetchCSS(url).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
              try {
                sheet.insertRule(rule, rule.startsWith("@import") ? importIndex += 1 : sheet.cssRules.length);
              } catch (error2) {
                console.error("Error inserting rule from remote css", {
                  rule,
                  error: error2
                });
              }
            })).catch((e2) => {
              console.error("Error loading remote css", e2.toString());
            });
            deferreds.push(deferred);
          }
        });
      } catch (e2) {
        const inline2 = styleSheets.find((a2) => a2.href == null) || document.styleSheets[0];
        if (sheet.href != null) {
          deferreds.push(fetchCSS(sheet.href).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
            inline2.insertRule(rule, inline2.cssRules.length);
          })).catch((err) => {
            console.error("Error loading remote stylesheet", err);
          }));
        }
        console.error("Error inlining remote css file", e2);
      }
    }
  });
  return Promise.all(deferreds).then(() => {
    styleSheets.forEach((sheet) => {
      if ("cssRules" in sheet) {
        try {
          toArray(sheet.cssRules || []).forEach((item) => {
            ret.push(item);
          });
        } catch (e2) {
          console.error(`Error while reading CSS rules from ${sheet.href}`, e2);
        }
      }
    });
    return ret;
  });
}
function getWebFontRules(cssRules) {
  return cssRules.filter((rule) => rule.type === CSSRule.FONT_FACE_RULE).filter((rule) => shouldEmbed(rule.style.getPropertyValue("src")));
}
async function parseWebFontRules(node, options) {
  if (node.ownerDocument == null) {
    throw new Error("Provided element is not within a Document");
  }
  const styleSheets = toArray(node.ownerDocument.styleSheets);
  const cssRules = await getCSSRules(styleSheets, options);
  return getWebFontRules(cssRules);
}
function normalizeFontFamily(font) {
  return font.trim().replace(/["']/g, "");
}
function getUsedFonts(node) {
  const fonts = /* @__PURE__ */ new Set();
  function traverse(node2) {
    const fontFamily = node2.style.fontFamily || getComputedStyle(node2).fontFamily;
    fontFamily.split(",").forEach((font) => {
      fonts.add(normalizeFontFamily(font));
    });
    Array.from(node2.children).forEach((child2) => {
      if (child2 instanceof HTMLElement) {
        traverse(child2);
      }
    });
  }
  traverse(node);
  return fonts;
}
async function getWebFontCSS(node, options) {
  const rules2 = await parseWebFontRules(node, options);
  const usedFonts = getUsedFonts(node);
  const cssTexts = await Promise.all(rules2.filter((rule) => usedFonts.has(normalizeFontFamily(rule.style.fontFamily))).map((rule) => {
    const baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
    return embedResources(rule.cssText, baseUrl, options);
  }));
  return cssTexts.join("\n");
}
async function embedWebFonts(clonedNode, options) {
  const cssText = options.fontEmbedCSS != null ? options.fontEmbedCSS : options.skipFonts ? null : await getWebFontCSS(clonedNode, options);
  if (cssText) {
    const styleNode = document.createElement("style");
    const sytleContent = document.createTextNode(cssText);
    styleNode.appendChild(sytleContent);
    if (clonedNode.firstChild) {
      clonedNode.insertBefore(styleNode, clonedNode.firstChild);
    } else {
      clonedNode.appendChild(styleNode);
    }
  }
}
async function toSvg(node, options = {}) {
  const { width, height } = getImageSize(node, options);
  const clonedNode = await cloneNode(node, options, true);
  await embedWebFonts(clonedNode, options);
  await embedImages(clonedNode, options);
  applyStyle(clonedNode, options);
  const datauri = await nodeToDataURL(clonedNode, width, height);
  return datauri;
}
async function toCanvas(node, options = {}) {
  const { width, height } = getImageSize(node, options);
  const svg = await toSvg(node, options);
  const img = await createImage(svg);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const ratio = options.pixelRatio || getPixelRatio();
  const canvasWidth = options.canvasWidth || width;
  const canvasHeight = options.canvasHeight || height;
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
  if (!options.skipAutoScale) {
    checkCanvasDimensions(canvas);
  }
  canvas.style.width = `${canvasWidth}`;
  canvas.style.height = `${canvasHeight}`;
  if (options.backgroundColor) {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}
async function toBlob(node, options = {}) {
  const canvas = await toCanvas(node, options);
  const blob = await canvasToBlob(canvas);
  return blob;
}
function initExcel(dom, editor) {
  const els = dom.querySelectorAll(".excel-container");
  if (!els.length) {
    return [];
  }
  const XLSX = getXLSX();
  if (!XLSX) {
    const message = "not find XLSX,please registerXLSX";
    console.error(message);
    getToastr().error(message);
    return [];
  }
  const x_spreadsheet = getX_spreadsheet();
  if (!x_spreadsheet) {
    const message = "not find x_spreadsheet,please registerX_spreadsheet";
    console.error(message);
    getToastr().error(message);
    return [];
  }
  els.forEach((el) => {
    if (el.dataset.inited) {
      return;
    }
    const text2 = el.textContent;
    el.innerHTML = "";
    const promise = fetchScheduler.createFetch(text2, {
      // ...
    });
    promise.then((res) => res.arrayBuffer()).then((arrayBuffer) => {
      const wb = XLSX.read(arrayBuffer);
      const json2 = stox(wb, XLSX);
      new x_spreadsheet(el).loadData(json2).change((data) => {
      });
    }).catch((err) => {
      console.error(err);
    });
  });
}
/*! xlsxspread.js (C) SheetJS LLC -- https://sheetjs.com/ */
function stox(wb, XLSX) {
  const out = [];
  wb.SheetNames.forEach(function(name2) {
    const o3 = { name: name2, rows: {} };
    const ws = wb.Sheets[name2];
    if (!ws || !ws["!ref"])
      return;
    const range2 = XLSX.utils.decode_range(ws["!ref"]);
    range2.s = { r: 0, c: 0 };
    const aoa = XLSX.utils.sheet_to_json(ws, {
      raw: false,
      header: 1,
      range: range2
    });
    aoa.forEach(function(r2, i) {
      const cells = {};
      r2.forEach(function(c2, j) {
        cells[j] = { text: c2 };
        const cellRef = XLSX.utils.encode_cell({ r: i, c: j });
        if (ws[cellRef] != null && ws[cellRef].f != null) {
          cells[j].text = "=" + ws[cellRef].f;
        }
      });
      o3.rows[i] = { cells };
    });
    o3.merges = [];
    (ws["!merges"] || []).forEach(function(merge2, i) {
      if (o3.rows[merge2.s.r] == null) {
        o3.rows[merge2.s.r] = { cells: {} };
      }
      if (o3.rows[merge2.s.r].cells[merge2.s.c] == null) {
        o3.rows[merge2.s.r].cells[merge2.s.c] = {};
      }
      o3.rows[merge2.s.r].cells[merge2.s.c].merge = [
        merge2.e.r - merge2.s.r,
        merge2.e.c - merge2.s.c
      ];
      o3.merges[i] = XLSX.utils.encode_range(merge2);
    });
    out.push(o3);
  });
  return out;
}
const TEMPLATE = `
<!DOCTYPE html>
<html>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title></title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.5/viewer.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/10.2.0/swiper-bundle.min.css">
  <link rel="stylesheet" href="https://microget-1300406971.cos.ap-shanghai.myqcloud.com/mdpress-editor/index.css">

  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/6.0.0/d3.min.js"><\/script>
  <script
    src="https://microget-1300406971.cos.ap-shanghai.myqcloud.com/glicon/lib/markmap-view/markmap-view.min.js"><\/script>
  <style>
  html,body{
    width:100%;
    height:100%;
    padding:0px;
    margin:0px;
  }
   #markmap{
    width:100%;
    height:100%;
   }
  </style>

  <body>
      <svg id="markmap"></svg>
        <script>
        const data={data};
        markmap.Markmap.create(document.getElementById('markmap'), null, data.root);

        <\/script>

  </body>
</html>
`;
function exportMarkMapHTML(data) {
  return TEMPLATE.replaceAll("{data}", data);
}
const IFRAME_TAG = "<iframe";
function lazyLoad(html, mdEditor) {
  if (html.indexOf(IFRAME_TAG) > -1) {
    const seg = html.split(IFRAME_TAG);
    html = seg.join(`${IFRAME_TAG} loading="lazy" `).toString();
  }
  return html;
}
function setHeadLineNumber(dom, editor) {
  const model = editor.getModel();
  const lineCount = model.getLineCount();
  const headLines = [];
  const headContents = formatHeadContents(dom);
  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    const content = model.getLineContent(lineNumber);
    if (isTitle(content, headContents)) {
      headLines.push({
        lineNumber,
        content
      });
    }
  }
  const children = dom.children || [];
  const heads = [];
  Array.prototype.forEach.call(children, (element) => {
    if (isHeadTag(element.tagName)) {
      heads.push(element);
    }
  });
  for (let i = 0, len = heads.length; i < len; i++) {
    const head = heads[i];
    let content = head.textContent;
    content = trimTitle(content);
    for (let j = i, len1 = headLines.length; j < len1; j++) {
      const { lineNumber } = headLines[j];
      let title = headLines[j].content;
      title = trimTitle(title);
      if (content === title) {
        head.dataset.lineNumber = lineNumber;
        break;
      }
    }
  }
}
function initFlowChart(dom, mdEditor) {
  if (mdEditor.flowcharts) {
    mdEditor.flowcharts.forEach((flowchart2) => {
      flowchart2.clean();
    });
  }
  const els = dom.querySelectorAll(".flowchart-container");
  if (!els.length) {
    return [];
  }
  const flowchart = getFlowChart();
  if (!flowchart) {
    const message = "not find flowchart,please registerFlowChart";
    console.error(message);
    getToastr().error(message);
    return [];
  }
  mdEditor.flowcharts = [];
  els.forEach((el) => {
    if (el.dataset.inited) {
      return;
    }
    const code2 = el.children[0].textContent;
    const diagram = flowchart.parse(code2);
    diagram.drawSVG(el.children[1]);
    mdEditor.flowcharts.push(diagram);
  });
}
const THEME_ID = "mdeditor_theme_style";
const THEMECACHE = /* @__PURE__ */ new Map();
const md = createMarkdown();
const exportFilesData = [
  {
    icon: "icon-file-markdown1",
    label: "导出Markdown",
    type: "markdown"
  },
  {
    icon: "icon-html",
    label: "导出HTML",
    type: "html"
  },
  {
    icon: "icon-tupiantianjia",
    label: "导出图片",
    type: "png"
  },
  {
    icon: "icon-naotu",
    label: "导出markmap",
    type: "markmap"
  },
  {
    icon: "icon-dayin",
    label: "打印",
    type: "print"
  }
];
function hideDomByDisplay(dom) {
  dom = dom.target || dom;
  if (!(dom instanceof HTMLElement)) {
    console.error(dom, "is not HTMLElement");
    return;
  }
  const display = getDomDisplay(dom);
  if (display === "block") {
    domHide(dom);
  }
}
function createFloatPanel() {
  const dom = createDom("div");
  dom.className = "mdeditor-float-container";
  return dom;
}
function createLiElement() {
  const li = createDom("div");
  li.className = "mdeditor-theme-select-item";
  return li;
}
function getVSCodePasteData(items) {
  let editorDataItem, codeItem;
  items.forEach((item) => {
    const { type: type2 } = item;
    if (type2 === "vscode-editor-data") {
      editorDataItem = item;
    }
    if (type2 === "text/plain") {
      codeItem = item;
    }
  });
  if (!editorDataItem || !codeItem || !editorDataItem.text || !codeItem.text) {
    return;
  }
  const text2 = editorDataItem.text;
  if (!text2) {
    return;
  }
  let json2;
  try {
    json2 = JSON.parse(text2);
  } catch (error2) {
    return;
  }
  if (!json2 || !json2.mode) {
    return;
  }
  return {
    language: json2.mode,
    text: codeItem.text
  };
}
const OPTIONS = {
  debug: false,
  preview: true,
  dark: false,
  theme: "vitepress",
  themeURL: "./../theme/",
  themeCache: true,
  tocOpen: false,
  emojiURL: "https://cdn.jsdelivr.net/npm/@emoji-mart/data",
  iconfontURL: "//at.alicdn.com/t/c/font_4227162_4oipkq7kqoo.css",
  monacoOptions: {
    language: "markdown",
    value: "",
    automaticLayout: true
  },
  prettierOptions: {
    tabWidth: 4
  },
  updatePreviewDuration: 500,
  autoParseVSCodePasteData: false
};
function Base() {
}
class MDEditor extends Eventable(Base) {
  constructor(dom, options) {
    initToastr();
    super();
    dom = getDom(dom);
    if (!dom || !(dom instanceof HTMLElement)) {
      const message = "dom is not HTMLElement";
      console.error(message, dom);
      getToastr().error(message);
      return;
    }
    dom.classList.add("mdeditor-container");
    options = Object.assign({}, OPTIONS, options);
    this.dom = dom;
    this.editorDom = null;
    this.previewDom = null;
    this.tocOpen = false;
    this.toolsDom = null;
    this.dialog = null;
    this.options = options;
    this.preview = this.options.preview;
    this.tocOpen = this.options.tocOpen;
    this.dark = this.options.dark;
    this.fullScreen = false;
    this.editorUpdateValues = [];
    this.themeName = "";
    this.clickOutSide = create();
    this.themeHistroy = [];
    this._initIconFont();
    this._initDoms();
    this._initTheme();
    this._initExportFile();
    this._initEmoji();
    this._initTools();
    this.setTheme(options.theme);
    this._checkDark();
    setTimeout(() => {
      this._checkPreviewState();
      this._checkTocState();
    }, 16);
    this.frameId = null;
    let time = now();
    const loop2 = () => {
      if (now() - time > this.options.updatePreviewDuration) {
        this.updatePreview();
        time = now();
      }
      this.frameId = requestAnimationFrame(loop2);
    };
    this.frameId = requestAnimationFrame(loop2);
    on$1(window, "resize", () => {
      if (!this.fullScreen) {
        return;
      }
      domSizeByWindow(this.getContainer());
    });
    this.pasteItems = [];
  }
  _initIconFont() {
    const id2 = "mdpress-iconfont";
    if (document && document.head && this.options.iconfontURL) {
      const style = document.head.querySelector(`#${id2}`);
      if (!style) {
        const style2 = createDom("link");
        style2.rel = "stylesheet";
        style2.href = this.options.iconfontURL;
        style2.id = id2;
        document.head.appendChild(style2);
      }
    }
  }
  _initDoms() {
    const monaco2 = getMonaco();
    const miniToastr2 = getToastr();
    if (!monaco2) {
      const message = "not find monaco editor namespace";
      console.error(message);
      miniToastr2.error(message);
      return;
    }
    const { monacoOptions } = this.options;
    const editorDom = this.editorDom = createDom("div");
    editorDom.className = "mdeditor-editor";
    const previewDom = this.previewDom = createDom("div");
    previewDom.className = "mdeditor-preview vp-doc markdown-body";
    previewDom.id = domId();
    const editorContainer = this.editorContainer = createDom("div");
    editorContainer.className = "mdeditor-editor-container";
    editorContainer.appendChild(editorDom);
    editorContainer.appendChild(previewDom);
    editorContainer.addEventListener("paste", (e2) => {
      if (e2.clipboardData) {
        this.pasteItems = Array.prototype.map.call(e2.clipboardData.items, (item) => {
          return {
            type: item.type,
            kind: item.kind,
            data: item
          };
        });
        this.pasteItems.forEach((item) => {
          item.data.getAsString((text2) => {
            item.text = text2;
          });
        });
      }
      this.fire("paste", extend$1({}, e2, { target: this }));
    }, true);
    const tocDom = this.tocDom = createDom("div");
    tocDom.className = "mdeditor-toc";
    const mainDom = this.mainDom = createDom("div");
    mainDom.className = "mdeditor-main";
    mainDom.appendChild(editorContainer);
    mainDom.appendChild(tocDom);
    const toolsDom = this.toolsDom = createDom("div");
    toolsDom.className = "mdeditor-tools";
    this.dom.appendChild(toolsDom);
    this.dom.appendChild(mainDom);
    const scrollTopDom = createDom("div");
    scrollTopDom.className = "mdeditor-scrolltop editor-scrolltop";
    scrollTopDom.innerHTML = '<i class="iconfont icon-huidaodingbu"></i>';
    this.dom.appendChild(scrollTopDom);
    on$1(scrollTopDom, "click", () => {
      this.editor.setScrollTop(0, 0);
    });
    this.editor = monaco2.editor.create(this.editorDom, Object.assign({}, OPTIONS.monacoOptions, monacoOptions));
    this.editor.onDidChangeModelContent(() => {
      const value = this.getValue();
      this.editorUpdateValues.push(value);
    });
    this.editor.onDidScrollChange((e2) => {
      this._scrollEvent = e2;
      this._syncScroll();
    });
    this.editor.onDidPaste((e2) => {
      if (!this.options.autoParseVSCodePasteData) {
        return;
      }
      const result = getVSCodePasteData(this.pasteItems);
      if (!e2.range || !result || result.language === "markdown") {
        return;
      }
      this.editor.popUndoStop();
      this.editor.executeEdits("", [
        {
          range: e2.range,
          text: "```" + result.language + "\n" + result.text + "\n```\n"
        }
      ]);
    });
    this.editor.addAction({
      id: "",
      // 菜单项 id
      label: "Format Code",
      // 菜单项名称
      keybindings: [monaco2.KeyMod.Shift | monaco2.KeyMod.Alt | monaco2.KeyCode.KeyF],
      contextMenuGroupId: "9_cutcopypaste",
      // 所属菜单的分组
      run: () => {
        const prettier = getPrettier();
        if (!prettier) {
          const message = "not find prettier";
          console.warn(message);
          miniToastr2.warn(message);
          return;
        }
        if (!prettier.prettierPlugins) {
          const message = "not find prettier plugins";
          console.warn(message);
          miniToastr2.warn(message);
          return;
        }
        prettier.format(this.getValue(), Object.assign({}, this.options.prettierOptions, {
          parser: "markdown",
          plugins: prettier.prettierPlugins
        })).then((text2) => {
          const [range2] = this.getWholeRange();
          this.editor.executeEdits("", [
            {
              range: range2,
              text: text2
            }
          ]);
          setTimeout(() => {
            this._syncScroll();
          }, 1e3);
        });
      }
    });
  }
  _initTools() {
    createDefaultIcons(this);
  }
  _initTheme() {
    const themeDom = createFloatPanel();
    this.themeDom = themeDom;
    this.mainDom.appendChild(themeDom);
    const lis = themes.map((name2) => {
      const li = createLiElement();
      li.dataset.theme = name2;
      li.innerHTML = `<i class="iconfont icon-31liebiao"></i>&nbsp;&nbsp;${name2}`;
      themeDom.appendChild(li);
      return li;
    });
    lis.forEach((li) => {
      on$1(li, "click", (e2) => {
        const theme = e2.target.dataset.theme;
        this._activeThemeItem(e2.target);
        this.setTheme(theme);
      });
    });
    this.clickOutSide.addDom(this.themeDom);
    on$1(themeDom, "clickoutside", hideDomByDisplay);
  }
  _initExportFile() {
    const exportFileDom = createFloatPanel();
    this.exportFileDom = exportFileDom;
    this.mainDom.appendChild(exportFileDom);
    const lis = exportFilesData.map((d2) => {
      const li = createLiElement();
      li.dataset.type = d2.type;
      li.innerHTML = `<i class="iconfont ${d2.icon}"></i>&nbsp;&nbsp;${d2.label}`;
      exportFileDom.appendChild(li);
      return li;
    });
    lis.forEach((li) => {
      on$1(li, "click", (e2) => {
        const theme = e2.target.dataset.type;
        this._exportFile(theme);
      });
    });
    this.clickOutSide.addDom(this.exportFileDom);
    on$1(exportFileDom, "clickoutside", hideDomByDisplay);
  }
  _initEmoji() {
    const emojiDom = createFloatPanel();
    this.emojiDom = emojiDom;
    const onEmojiSelect = (data) => {
      const native = data.native;
      const [range2] = this.getCurrentRange();
      this.editor.executeEdits("", [
        {
          range: range2,
          text: `${native}
`
        }
      ]);
    };
    const pickerOptions = {
      onEmojiSelect,
      data: async () => {
        const response = await fetch(this.options.emojiURL);
        return response.json();
      }
    };
    const picker = new Picker(pickerOptions);
    emojiDom.appendChild(picker);
    this.mainDom.appendChild(emojiDom);
    this.clickOutSide.addDom(this.emojiDom);
    on$1(emojiDom, "clickoutside", hideDomByDisplay);
  }
  _exportFile(type2) {
    const previewDom = this.previewDom;
    let text2, fileType;
    if (type2 === "markdown") {
      text2 = this.editor.getValue();
      fileType = "md";
    } else if (type2 === "html") {
      text2 = exportHTML(previewDom.outerHTML, this.styleText);
      fileType = type2;
    } else if (type2 === "png") {
      fileType = type2;
      showLoading();
      const rect = previewDom.getBoundingClientRect();
      const { scrollHeight } = this.previewDom;
      const { height } = rect;
      const { innerHeight } = window;
      const h2 = Math.max(height, scrollHeight, innerHeight) + 10;
      const w = rect.width + 10;
      toBlob(previewDom, { width: w, height: h2 }).then((blob2) => {
        saveAs(blob2, `${now()}.${fileType}`);
        hideLoading();
      }).catch((err) => {
        console.error(err);
        getToastr().error(err);
        hideLoading();
      });
      return;
    } else if (type2 === "print") {
      printJS(this.previewDom.id, "html");
    } else if (type2 === "markmap") {
      const markmap = fromatMarkMapJSON(this.mdText);
      text2 = exportMarkMapHTML(markmap);
      fileType = "html";
    }
    if (!text2) {
      return;
    }
    const blob = new Blob([text2], { type: `text/${text2};charset=utf-8` });
    saveAs(blob, `${now()}.${fileType}`);
  }
  _checkPreviewState() {
    const { preview } = this;
    if (preview) {
      this.editorDom.style.width = "50%";
      domShow(this.previewDom);
    } else {
      this.editorDom.style.width = "100%";
      domHide(this.previewDom);
    }
    this.fire(preview ? "openpreview" : "closepreview", { preview });
  }
  _checkTocState() {
    const { tocOpen } = this;
    let width = 300;
    if (!tocOpen) {
      width = 0;
    }
    this.editorContainer.style.width = `calc(100% - ${width}px)`;
    this.tocDom.style.width = `${width}px`;
    width > 0 ? domShow(this.tocDom) : domHide(this.tocDom);
    if (width > 0) {
      this._initTocData();
    }
    this.fire(tocOpen ? "opentoc" : "closetoc", { tocOpen });
  }
  _initTocData() {
    if (!this.tocOpen) {
      return this;
    }
    makeToc(this.previewDom, ".mdeditor-toc");
    const aLinks = this.tocDom.querySelectorAll("a");
    aLinks.forEach((dom) => {
      dom.id = dom.id || domId();
      dom.textContent = trimTitle(dom.textContent);
    });
    const findDomPosition = (a2, currentTitle) => {
      const result = [];
      aLinks.forEach((dom) => {
        let title = dom.textContent;
        title = trimTitle(title);
        if (title === currentTitle) {
          result.push(dom);
        }
      });
      const index = result.indexOf(a2);
      return Math.max(index, 0) + 1;
    };
    const model = this.editor.getModel();
    const lineCount = model.getLineCount();
    const headContents = formatHeadContents(this.previewDom);
    const findTitleRow = (a2) => {
      let title = a2.textContent;
      title = trimTitle(title);
      const index = findDomPosition(a2, title);
      let idx2 = 0;
      for (let lineNum = 1; lineNum <= lineCount; lineNum++) {
        let content = model.getLineContent(lineNum);
        if (isTitle(content, headContents)) {
          content = trimTitle(content);
          if (content.indexOf(title) === 0) {
            idx2++;
            if (idx2 === index) {
              return lineNum;
            }
          }
        }
      }
    };
    const linkClick = (e2) => {
      const a2 = e2.target;
      if (!a2.id) {
        return;
      }
      const row = findTitleRow(a2);
      if (row) {
        const top2 = this.editor.getTopForLineNumber(row);
        this.editor.setScrollTop(top2);
      }
    };
    aLinks.forEach((a2) => {
      on$1(a2, "click", linkClick);
    });
  }
  setValue(value) {
    if (!this.editor) {
      console.error("not find editor");
      return this;
    }
    this.editor.setValue(value);
    return this;
  }
  getValue() {
    if (!this.editor) {
      console.error("not find editor");
      return this;
    }
    return this.editor.getValue();
  }
  updatePreview() {
    if (!this.preview) {
      return this;
    }
    const len = this.editorUpdateValues.length;
    if (len === 0) {
      return this;
    }
    const value = this.editorUpdateValues[len - 1];
    checkInclude(value, (text2) => {
      this.mdText = text2;
      let html = md.render(text2);
      html = lazyLoad(html);
      const dom = this.previewDom;
      if (dom.childNodes.length === 0) {
        dom.innerHTML = html;
      } else {
        const tempDom = document.createElement("div");
        tempDom.className = this.previewDom.className;
        tempDom.id = this.previewDom.id;
        tempDom.innerHTML = html;
        morphdom(this.previewDom, tempDom);
      }
      this.editorUpdateValues = [];
      checkCodeGroup(dom);
      checkLinks(dom);
      checkIframe(dom);
      initMermaid(dom);
      removePreBgColor(dom);
      initQRCode(dom);
      initSwiper(dom, this);
      initFlowChart(dom, this);
      if (this.imageViewer) {
        this.imageViewer.destroy();
      }
      this.imageViewer = new Viewer(dom);
      initExcel(dom);
      setHeadLineNumber(dom, this.editor);
      this._initTocData();
      this._syncScroll();
    });
  }
  _syncScroll() {
    if (!this._scrollEvent || !this.preview) {
      return this;
    }
    const { scrollHeight, scrollTop } = this._scrollEvent;
    const previewDom = this.previewDom;
    let top2 = 0;
    if (scrollTop > 10) {
      top2 = calScroll(this.editor, previewDom);
      if (!top2) {
        const previewHeight = Math.max(previewDom.scrollHeight, scrollHeight);
        top2 = scrollTop / scrollHeight * previewHeight;
      }
    }
    previewDom.scroll({
      top: top2,
      left: 0,
      behavior: "smooth"
    });
  }
  // https://github.com/microsoft/monaco-editor/issues/639
  getSelectText() {
    const range2 = this.editor.getSelection();
    const text2 = this.editor.getModel().getValueInRange(range2);
    if (!text2) {
      return;
    }
    return [range2, text2];
  }
  // https://github.com/microsoft/monaco-editor/issues/172
  getSelectRange() {
    const select = this.editor.getSelection();
    if (!select) {
      return;
    }
    const { startLineNumber, endLineNumber, startColumn, endColumn } = select;
    const starRange = {
      startLineNumber,
      endLineNumber: startLineNumber,
      startColumn,
      endColumn: startColumn
    };
    const endRange = {
      startLineNumber: endLineNumber,
      endLineNumber,
      startColumn: endColumn,
      endColumn
    };
    return [starRange, endRange];
  }
  // https://blog.csdn.net/Anchor_CHEN/article/details/127223203
  getCurrentRange() {
    const position = this.editor.getPosition();
    const range2 = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: position.column,
      endColumn: position.column
    };
    return [range2];
  }
  getWholeRange() {
    const model = this.editor.getModel();
    const linesNumber = model.getLineCount();
    const range2 = {
      startLineNumber: 1,
      endLineNumber: linesNumber,
      startColumn: 1,
      endColumn: 1e5
    };
    return [range2];
  }
  isPreview() {
    return this.preview;
  }
  isFullScreen() {
    return this.fullScreen;
  }
  isToc() {
    return this.tocOpen;
  }
  getContainer() {
    return this.dom;
  }
  getEditor() {
    return this.editor;
  }
  _activeThemeItem(item) {
    const items = this.themeDom.querySelectorAll(".mdeditor-theme-select-item");
    if (typeof item === "string") {
      for (let i = 0, len = items.length; i < len; i++) {
        if (items[i].dataset.theme === item) {
          item = items[i];
          break;
        }
      }
    }
    if (!item || typeof item === "string") {
      return;
    }
    items.forEach((item2) => {
      item2.classList.remove(ACTIVE_CLASS);
    });
    item.classList.add(ACTIVE_CLASS);
  }
  setTheme(theme) {
    if (theme === this.themeName) {
      console.warn(`'${theme}' equal current theme '${this.themeName}'`);
      return this;
    }
    if (themes.indexOf(theme) === -1) {
      getToastr().error(`'${theme}' theme not exist`);
      return this;
    }
    this.themeName = theme;
    this.themeHistroy.push(theme);
    const themeChange = (text2) => {
      if (theme !== this.themeName) {
        console.warn(`'${theme}' theme ignored,the new '${this.themeName}' will fetch`);
        return this;
      }
      const children = document.head.children;
      let styleLink;
      for (let i = 0, len = children.length; i < len; i++) {
        if (children[i].id === THEME_ID) {
          styleLink = children[i];
        }
      }
      if (styleLink) {
        document.head.removeChild(styleLink);
      }
      this.styleText = text2;
      const style = createDom("style");
      style.id = THEME_ID;
      style.type = "text/css";
      style.innerHTML = text2;
      document.head.appendChild(style);
      this._activeThemeItem(theme);
      this.fire("themechange", { theme, value: text2 });
      if (this.dark && theme.indexOf("dark") === -1) {
        console.warn(`current model is dark,the '${theme}' theme is mismatching`);
      }
    };
    const themeCache = this.options.themeCache;
    if (THEMECACHE.get(theme) && themeCache) {
      themeChange(THEMECACHE.get(theme));
    } else {
      const url = `${this.options.themeURL}${theme}.css?t=${now()}`;
      const promise = fetchScheduler.createFetch(url, {
        // ...
      });
      promise.then((res) => res.text()).then((text2) => {
        if (themeCache) {
          THEMECACHE.set(theme, text2);
        }
        themeChange(text2);
      }).catch((err) => {
        console.error(`not fetch theme：'${theme}' from:${url}`);
        console.error(err);
      });
    }
    return this;
  }
  getTheme() {
    return this.themeName;
  }
  getIcons() {
    return Array.prototype.map.call(this.toolsDom.children, (c2) => {
      return c2.parent;
    });
  }
  openPreview() {
    if (this.isPreview()) {
      return this;
    }
    this.preview = true;
    this._checkPreviewState();
    return this;
  }
  closePreview() {
    if (!this.isPreview()) {
      return this;
    }
    this.preview = false;
    this._checkPreviewState();
    return this;
  }
  openFullScreen() {
    if (this.isFullScreen()) {
      return this;
    }
    checkFullScreen(this);
    return this;
  }
  closeFullScreen() {
    if (!this.isFullScreen()) {
      return this;
    }
    checkFullScreen(this);
    return this;
  }
  openToc() {
    if (this.isToc()) {
      return this;
    }
    this.tocOpen = true;
    this._checkTocState();
    return this;
  }
  closeToc() {
    if (!this.isToc()) {
      return this;
    }
    this.tocOpen = false;
    this._checkTocState();
    return this;
  }
  _checkDark() {
    const iconDoms = Array.prototype.map.call(this.toolsDom.children, (dom) => {
      return dom;
    });
    const doms = [this.toolsDom, this.editorDom, this.tocDom, this.exportFileDom, this.themeDom];
    const DARKCLASS = "mdeditor-dark";
    const TOOLCLASS = "mdeditor-panel-dark";
    const dark = this.dark;
    doms.forEach((dom) => {
      if (dark) {
        dom.classList.add(DARKCLASS);
        dom.classList.add(TOOLCLASS);
      } else {
        dom.classList.remove(DARKCLASS);
        dom.classList.remove(TOOLCLASS);
      }
    });
    iconDoms.forEach((dom) => {
      if (dark) {
        dom.classList.add(DARKCLASS);
      } else {
        dom.classList.remove(DARKCLASS);
      }
    });
    this.editor.updateOptions({
      theme: dark ? "vs-dark" : "vs"
    });
    let previewTheme = "vitepress";
    for (let len = this.themeHistroy.length, i = len - 1; i >= 0; i--) {
      if (this.themeHistroy[i].indexOf("dark") === -1) {
        previewTheme = this.themeHistroy[i];
        break;
      }
    }
    this.setTheme(dark ? "github-dark" : previewTheme);
    this.fire(dark ? "opendark" : "closedark", { dark });
  }
  openDark() {
    this.dark = true;
    return this.checkDark();
  }
  closeDark() {
    this.dark = false;
    return this.checkDark();
  }
  isDark() {
    return this.dark;
  }
}
function getMarkdownIt() {
  return md;
}
export {
  MDEditor,
  ToolIcon,
  getMarkdownIt,
  hideLoading,
  registerFlowChart,
  registerHightLight,
  registerMarkMap,
  registerMermaid,
  registerMonaco,
  registerPrettier,
  registerQRCode,
  registerShikiHighlighter,
  registerSwiper,
  registerXLSX,
  registerX_spreadsheet,
  showLoading,
  themes
};
