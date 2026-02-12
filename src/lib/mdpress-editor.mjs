/*!
 * mdpress-editor v0.33.0
  */
console.log('mdpress-editor v0.33.0')

import { saveAs } from 'file-saver';
import MarkdownIt from 'markdown-it';
import katex$1 from 'katex';
import dayjs from 'dayjs';
import Viewer from 'viewerjs';
import { Transformer } from 'markmap-lib';
import { Picker } from 'emoji-mart';

const ACTIVE_CLASS = 'active';

/**
 * Merges the properties of sources into destination object.
 * @param  {Object} dest   - object to extend
 * @param  {...Object} src - sources
 * @return {Object}
 * @memberOf Util
 */
function extend(dest) { // (Object[, Object, ...]) ->
    for (let i = 1; i < arguments.length; i++) {
        const src = arguments[i];
        for (const k in src) {
            dest[k] = src[k];
        }
    }
    return dest;
}

/**
 * Whether the object is null or undefined.
 * @param  {Object}  obj - object
 * @return {Boolean}
 * @memberOf Util
 */
function isNil(obj) {
    return obj == null;
}

/**
 * Check whether the object is a string
 * @param {Object} obj
 * @return {Boolean}
 * @memberOf Util
 */
function isString(obj) {
    if (isNil(obj)) {
        return false;
    }
    return typeof obj === 'string' || (obj.constructor !== null && obj.constructor === String);
}

/**
 * Stop browser event propagation
 * @param  {Event} e - browser event.
 * @memberOf DomUtil
 */
function stopPropagation(e) {
    e._cancelBubble = true;
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
    return this;
}

function getDom(id) {
    if (id instanceof HTMLElement) {
        return id;
    }
    if (id.indexOf('#') > -1 || id.indexOf('.') > -1) {
        return document.querySelector(id);
    }
    return document.getElementById(id);
}

function createDom(tagName) {
    return document.createElement(tagName);
}

const on$1 = (target, event, hanlder) => {
    target.addEventListener(event, hanlder);
};

function createDialog() {
    const dialog = createDom('dialog');
    dialog.className = 'mdeditor-dialog';
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
    const dialog = createDom('dialog');
    dialog.className = 'mdeditor-dialog';
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
    let rowsText = '', row = [];
    for (let j = 1; j <= rows; j++) {
        row = [];
        for (let i = 1; i <= cols; i++) {
            if (j === 1) {
                head.push(`列${i}  `);
                headLine.push('-----');
            }
            row.push('     ');
        }
        row = row.join(' | ');
        row = `| ${row.toString()} |\n`;
        rowsText += row;
    }
    head = head.join(' | ');
    head = `| ${head.toString()} |\n`;
    headLine = headLine.join(' | ');
    headLine = `| ${headLine.toString()} |\n`;
    return `${head}${headLine}${rowsText}`;
}

// export function getFolderTreeText(nodes) {

//     // let level = 1;
//     let text = '';
//     const loopNode = (node, level = 1) => {
//         const { name } = node;
//         let prefix = '├─ ';
//         if (level > 1) {
//             const array = [];
//             while (array.length < level - 1) {
//                 array.push('| ');
//             }
//             prefix = array.join('').toString() + prefix;
//         }
//         text += `${prefix}${name} \n`;
//         const children = node.children;
//         if (children && children.length) {
//             level++;
//             children.forEach(child => {
//                 loopNode(child, level);
//             });
//         }
//     };
//     return nodes.map(node => {
//         text = '';
//         loopNode(node);
//         return text;
//     }).join('').toString();
// }

function getDomDisplay(dom) {
    return dom.style.display;
}

function setDomDisplay(dom, display) {
    dom.style.display = display;
}

function domShow(dom) {
    dom.style.display = 'block';
}

function domHide(dom) {
    dom.style.display = 'none';
}

function now() {
    return new Date().getTime();
}

function domSizeByWindow(dom) {
    const { innerWidth, innerHeight } = window;
    dom.style.width = `${innerWidth}px`;
    dom.style.height = `${innerHeight}px`;
}

const LOADING_ID = 'mdeditor-loading-container';
function showLoading() {
    const dom = document.getElementById(LOADING_ID);
    if (dom) {
        return;
    }
    const div = createDom('div');
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
    if (title[0] === '#') {
        title = trimTitle(title);
        return headContents.indexOf(title) > -1;
    }
}

function trimTitle(title) {
    title = title.replaceAll('#', '');
    title = title.trim();
    return title;
}

let idx = 1;
function domId() {
    return `dom-${idx++}`;
}

const HEADTAGS = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6'
];

function isHeadTag(tag) {
    tag = tag.toLowerCase();
    return HEADTAGS.indexOf(tag) > -1;
}

function formatHeadContents(dom) {
    const children = dom.children || [];
    const contents = [];
    Array.prototype.forEach.call(children, element => {
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
function registerMermaid(mermaid) {
    mermaidJS = mermaid;
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
            console.error(container, 'is not dom');
            return this;
        }
        this.container = container;
        this.inited = true;
        this._containerClick = this.containerClick.bind(this);
        this.container.addEventListener('click', this._containerClick);
        this._loop = this.loop.bind(this);
        this._frameId = requestAnimationFrame(this._loop);
    }

    loop() {
        if (this._containerClickEvents.length) {
            const len = this._containerClickEvents.length;
            const event = this._containerClickEvents[len - 1];
            const { clientX, clientY } = event;
            this.doms.forEach(dom => {
                if (!dom.getBoundingClientRect) {
                    return;
                }
                const rect = dom.getBoundingClientRect();
                const { left, top, right, bottom } = rect;
                const inRect = clientX >= left && clientX <= right && clientY >= top && clientY <= bottom;
                if (inRect) {
                    const event = new Event('clickinside');
                    dom.dispatchEvent(event);
                }
                if (!inRect) {
                    // domHide(dom);
                    const event = new Event('clickoutside');
                    dom.dispatchEvent(event);
                }
            });
        }
        this._containerClickEvents = [];
        this._frameId = requestAnimationFrame(this._loop);
    }

    containerClick(e) {
        this._containerClickEvents.push(e);
    }

    addDom(dom) {
        if (!checkDom(dom)) {
            console.error(dom, 'is not dom');
            return this;
        }
        if (!this.inited) {
            console.error('not init');
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
            console.error(dom, 'is not dom');
            return this;
        }
        if (!this.inited) {
            console.error('not init');
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
        this.container.removeEventListener('click', this._containerClick);
        this.doms = null;
        this.container = null;
        this.inited = false;
        this._loop = null;
        this._containerClick = null;
        this._containerClickEvents = null;
        return this;
    }
}function create(container) {
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

    // document-fragments dont have attributes so lets not do anything
    if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
      return;
    }

    // update attributes on original DOM element
    for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
        attr = toNodeAttrs[i];
        attrName = attr.name;
        attrNamespaceURI = attr.namespaceURI;
        attrValue = attr.value;

        if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);

            if (fromValue !== attrValue) {
                if (attr.prefix === 'xmlns'){
                    attrName = attr.name; // It's not allowed to set an attribute with the XMLNS namespace without specifying the `xmlns` prefix
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

    // Remove any extra attributes found on the original DOM element that
    // weren't found on the target element.
    var fromNodeAttrs = fromNode.attributes;

    for (var d = fromNodeAttrs.length - 1; d >= 0; d--) {
        attr = fromNodeAttrs[d];
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

var range; // Create a range object for efficently rendering strings to elements.
var NS_XHTML = 'http://www.w3.org/1999/xhtml';

var doc = typeof document === 'undefined' ? undefined : document;
var HAS_TEMPLATE_SUPPORT = !!doc && 'content' in doc.createElement('template');
var HAS_RANGE_SUPPORT = !!doc && doc.createRange && 'createContextualFragment' in doc.createRange();

function createFragmentFromTemplate(str) {
    var template = doc.createElement('template');
    template.innerHTML = str;
    return template.content.childNodes[0];
}

function createFragmentFromRange(str) {
    if (!range) {
        range = doc.createRange();
        range.selectNode(doc.body);
    }

    var fragment = range.createContextualFragment(str);
    return fragment.childNodes[0];
}

function createFragmentFromWrap(str) {
    var fragment = doc.createElement('body');
    fragment.innerHTML = str;
    return fragment.childNodes[0];
}

/**
 * This is about the same
 * var html = new DOMParser().parseFromString(str, 'text/html');
 * return html.body.firstChild;
 *
 * @method toElement
 * @param {String} str
 */
function toElement(str) {
    str = str.trim();
    if (HAS_TEMPLATE_SUPPORT) {
      // avoid restrictions on content for things like `<tr><th>Hi</th></tr>` which
      // createContextualFragment doesn't support
      // <template> support not available in IE
      return createFragmentFromTemplate(str);
    } else if (HAS_RANGE_SUPPORT) {
      return createFragmentFromRange(str);
    }

    return createFragmentFromWrap(str);
}

/**
 * Returns true if two node's names are the same.
 *
 * NOTE: We don't bother checking `namespaceURI` because you will never find two HTML elements with the same
 *       nodeName and different namespace URIs.
 *
 * @param {Element} a
 * @param {Element} b The target element
 * @return {boolean}
 */
function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;
    var fromCodeStart, toCodeStart;

    if (fromNodeName === toNodeName) {
        return true;
    }

    fromCodeStart = fromNodeName.charCodeAt(0);
    toCodeStart = toNodeName.charCodeAt(0);

    // If the target element is a virtual DOM node or SVG node then we may
    // need to normalize the tag name before comparing. Normal HTML elements that are
    // in the "http://www.w3.org/1999/xhtml"
    // are converted to upper case
    if (fromCodeStart <= 90 && toCodeStart >= 97) { // from is upper and to is lower
        return fromNodeName === toNodeName.toUpperCase();
    } else if (toCodeStart <= 90 && fromCodeStart >= 97) { // to is upper and from is lower
        return toNodeName === fromNodeName.toUpperCase();
    } else {
        return false;
    }
}

/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {Element}
 */
function createElementNS(name, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML ?
        doc.createElement(name) :
        doc.createElementNS(namespaceURI, name);
}

/**
 * Copies the children of one DOM element to another DOM element
 */
function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
        var nextChild = curChild.nextSibling;
        toEl.appendChild(curChild);
        curChild = nextChild;
    }
    return toEl;
}

function syncBooleanAttrProp(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
        fromEl[name] = toEl[name];
        if (fromEl[name]) {
            fromEl.setAttribute(name, '');
        } else {
            fromEl.removeAttribute(name);
        }
    }
}

var specialElHandlers = {
    OPTION: function(fromEl, toEl) {
        var parentNode = fromEl.parentNode;
        if (parentNode) {
            var parentName = parentNode.nodeName.toUpperCase();
            if (parentName === 'OPTGROUP') {
                parentNode = parentNode.parentNode;
                parentName = parentNode && parentNode.nodeName.toUpperCase();
            }
            if (parentName === 'SELECT' && !parentNode.hasAttribute('multiple')) {
                if (fromEl.hasAttribute('selected') && !toEl.selected) {
                    // Workaround for MS Edge bug where the 'selected' attribute can only be
                    // removed if set to a non-empty value:
                    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12087679/
                    fromEl.setAttribute('selected', 'selected');
                    fromEl.removeAttribute('selected');
                }
                // We have to reset select element's selectedIndex to -1, otherwise setting
                // fromEl.selected using the syncBooleanAttrProp below has no effect.
                // The correct selectedIndex will be set in the SELECT special handler below.
                parentNode.selectedIndex = -1;
            }
        }
        syncBooleanAttrProp(fromEl, toEl, 'selected');
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'checked');
        syncBooleanAttrProp(fromEl, toEl, 'disabled');

        if (fromEl.value !== toEl.value) {
            fromEl.value = toEl.value;
        }

        if (!toEl.hasAttribute('value')) {
            fromEl.removeAttribute('value');
        }
    },

    TEXTAREA: function(fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value !== newValue) {
            fromEl.value = newValue;
        }

        var firstChild = fromEl.firstChild;
        if (firstChild) {
            // Needed for IE. Apparently IE sets the placeholder as the
            // node value and vise versa. This ignores an empty update.
            var oldValue = firstChild.nodeValue;

            if (oldValue == newValue || (!newValue && oldValue == fromEl.placeholder)) {
                return;
            }

            firstChild.nodeValue = newValue;
        }
    },
    SELECT: function(fromEl, toEl) {
        if (!toEl.hasAttribute('multiple')) {
            var selectedIndex = -1;
            var i = 0;
            // We have to loop through children of fromEl, not toEl since nodes can be moved
            // from toEl to fromEl directly when morphing.
            // At the time this special handler is invoked, all children have already been morphed
            // and appended to / removed from fromEl, so using fromEl here is safe and correct.
            var curChild = fromEl.firstChild;
            var optgroup;
            var nodeName;
            while(curChild) {
                nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
                if (nodeName === 'OPTGROUP') {
                    optgroup = curChild;
                    curChild = optgroup.firstChild;
                    // handle empty optgroups
                    if (!curChild) {
                        curChild = optgroup.nextSibling;
                        optgroup = null;
                    }
                } else {
                    if (nodeName === 'OPTION') {
                        if (curChild.hasAttribute('selected')) {
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

function noop() {}

function defaultGetNodeKey(node) {
  if (node) {
    return (node.getAttribute && node.getAttribute('id')) || node.id;
  }
}

function morphdomFactory(morphAttrs) {

  return function morphdom(fromNode, toNode, options) {
    if (!options) {
      options = {};
    }

    if (typeof toNode === 'string') {
      if (fromNode.nodeName === '#document' || fromNode.nodeName === 'HTML') {
        var toNodeHtml = toNode;
        toNode = doc.createElement('html');
        toNode.innerHTML = toNodeHtml;
      } else if (fromNode.nodeName === 'BODY') {
        var toNodeBody = toNode;
        toNode = doc.createElement('html');
        toNode.innerHTML = toNodeBody;
        // Extract the body element from the created HTML structure
        var bodyElement = toNode.querySelector('body');
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
    var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
    var onNodeAdded = options.onNodeAdded || noop;
    var onBeforeElUpdated = options.onBeforeElUpdated || noop;
    var onElUpdated = options.onElUpdated || noop;
    var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
    var onNodeDiscarded = options.onNodeDiscarded || noop;
    var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
    var skipFromChildren = options.skipFromChildren || noop;
    var addChild = options.addChild || function(parent, child){ return parent.appendChild(child); };
    var childrenOnly = options.childrenOnly === true;

    // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
    var fromNodesLookup = Object.create(null);
    var keyedRemovalList = [];

    function addKeyedRemoval(key) {
      keyedRemovalList.push(key);
    }

    function walkDiscardedChildNodes(node, skipKeyedNodes) {
      if (node.nodeType === ELEMENT_NODE) {
        var curChild = node.firstChild;
        while (curChild) {

          var key = undefined;

          if (skipKeyedNodes && (key = getNodeKey(curChild))) {
            // If we are skipping keyed nodes then we add the key
            // to a list so that it can be handled at the very end.
            addKeyedRemoval(key);
          } else {
            // Only report the node as discarded if it is not keyed. We do this because
            // at the end we loop through all keyed elements that were unmatched
            // and then discard them in one final pass.
            onNodeDiscarded(curChild);
            if (curChild.firstChild) {
              walkDiscardedChildNodes(curChild, skipKeyedNodes);
            }
          }

          curChild = curChild.nextSibling;
        }
      }
    }

    /**
    * Removes a DOM node out of the original DOM
    *
    * @param  {Node} node The node to remove
    * @param  {Node} parentNode The nodes parent
    * @param  {Boolean} skipKeyedNodes If true then elements with keys will be skipped and not discarded.
    * @return {undefined}
    */
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

    // // TreeWalker implementation is no faster, but keeping this around in case this changes in the future
    // function indexTree(root) {
    //     var treeWalker = document.createTreeWalker(
    //         root,
    //         NodeFilter.SHOW_ELEMENT);
    //
    //     var el;
    //     while((el = treeWalker.nextNode())) {
    //         var key = getNodeKey(el);
    //         if (key) {
    //             fromNodesLookup[key] = el;
    //         }
    //     }
    // }

    // // NodeIterator implementation is no faster, but keeping this around in case this changes in the future
    //
    // function indexTree(node) {
    //     var nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
    //     var el;
    //     while((el = nodeIterator.nextNode())) {
    //         var key = getNodeKey(el);
    //         if (key) {
    //             fromNodesLookup[key] = el;
    //         }
    //     }
    // }

    function indexTree(node) {
      if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
        var curChild = node.firstChild;
        while (curChild) {
          var key = getNodeKey(curChild);
          if (key) {
            fromNodesLookup[key] = curChild;
          }

          // Walk recursively
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

        var key = getNodeKey(curChild);
        if (key) {
          var unmatchedFromEl = fromNodesLookup[key];
          // if we find a duplicate #id node in cache, replace `el` with cache value
          // and morph it to the child node.
          if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
            curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
            morphEl(unmatchedFromEl, curChild);
          } else {
            handleNodeAdded(curChild);
          }
        } else {
          // recursively call for curChild and it's children to see if we find something in
          // fromNodesLookup
          handleNodeAdded(curChild);
        }

        curChild = nextSibling;
      }
    }

    function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
      // We have processed all of the "to nodes". If curFromNodeChild is
      // non-null then we still have some from nodes left over that need
      // to be removed
      while (curFromNodeChild) {
        var fromNextSibling = curFromNodeChild.nextSibling;
        if ((curFromNodeKey = getNodeKey(curFromNodeChild))) {
          // Since the node is keyed it might be matched up later so we defer
          // the actual removal to later
          addKeyedRemoval(curFromNodeKey);
        } else {
          // NOTE: we skip nested keyed nodes from being removed since there is
          //       still a chance they will be matched up later
          removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
        }
        curFromNodeChild = fromNextSibling;
      }
    }

    function morphEl(fromEl, toEl, childrenOnly) {
      var toElKey = getNodeKey(toEl);

      if (toElKey) {
        // If an element with an ID is being morphed then it will be in the final
        // DOM so clear it out of the saved elements collection
        delete fromNodesLookup[toElKey];
      }

      if (!childrenOnly) {
        // optional
        var beforeUpdateResult = onBeforeElUpdated(fromEl, toEl);
        if (beforeUpdateResult === false) {
          return;
        } else if (beforeUpdateResult instanceof HTMLElement) {
          fromEl = beforeUpdateResult;
          // reindex the new fromEl in case it's not in the same
          // tree as the original fromEl
          // (Phoenix LiveView sometimes returns a cloned tree,
          //  but keyed lookups would still point to the original tree)
          indexTree(fromEl);
        }

        // update attributes on original DOM element first
        morphAttrs(fromEl, toEl);
        // optional
        onElUpdated(fromEl);

        if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
          return;
        }
      }

      if (fromEl.nodeName !== 'TEXTAREA') {
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

      // walk the children
      outer: while (curToNodeChild) {
        toNextSibling = curToNodeChild.nextSibling;
        curToNodeKey = getNodeKey(curToNodeChild);

        // walk the fromNode children all the way through
        while (!skipFrom && curFromNodeChild) {
          fromNextSibling = curFromNodeChild.nextSibling;

          if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
            curToNodeChild = toNextSibling;
            curFromNodeChild = fromNextSibling;
            continue outer;
          }

          curFromNodeKey = getNodeKey(curFromNodeChild);

          var curFromNodeType = curFromNodeChild.nodeType;

          // this means if the curFromNodeChild doesnt have a match with the curToNodeChild
          var isCompatible = undefined;

          if (curFromNodeType === curToNodeChild.nodeType) {
            if (curFromNodeType === ELEMENT_NODE) {
              // Both nodes being compared are Element nodes

              if (curToNodeKey) {
                // The target node has a key so we want to match it up with the correct element
                // in the original DOM tree
                if (curToNodeKey !== curFromNodeKey) {
                  // The current element in the original DOM tree does not have a matching key so
                  // let's check our lookup to see if there is a matching element in the original
                  // DOM tree
                  if ((matchingFromEl = fromNodesLookup[curToNodeKey])) {
                    if (fromNextSibling === matchingFromEl) {
                      // Special case for single element removals. To avoid removing the original
                      // DOM node out of the tree (since that can break CSS transitions, etc.),
                      // we will instead discard the current node and wait until the next
                      // iteration to properly match up the keyed target element with its matching
                      // element in the original tree
                      isCompatible = false;
                    } else {
                      // We found a matching keyed element somewhere in the original DOM tree.
                      // Let's move the original DOM node into the current position and morph
                      // it.

                      // NOTE: We use insertBefore instead of replaceChild because we want to go through
                      // the `removeNode()` function for the node that is being discarded so that
                      // all lifecycle hooks are correctly invoked
                      fromEl.insertBefore(matchingFromEl, curFromNodeChild);

                      // fromNextSibling = curFromNodeChild.nextSibling;

                      if (curFromNodeKey) {
                        // Since the node is keyed it might be matched up later so we defer
                        // the actual removal to later
                        addKeyedRemoval(curFromNodeKey);
                      } else {
                        // NOTE: we skip nested keyed nodes from being removed since there is
                        //       still a chance they will be matched up later
                        removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                      }

                      curFromNodeChild = matchingFromEl;
                      curFromNodeKey = getNodeKey(curFromNodeChild);
                    }
                  } else {
                    // The nodes are not compatible since the "to" node has a key and there
                    // is no matching keyed node in the source tree
                    isCompatible = false;
                  }
                }
              } else if (curFromNodeKey) {
                // The original has a key
                isCompatible = false;
              }

              isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
              if (isCompatible) {
                // We found compatible DOM elements so transform
                // the current "from" node to match the current
                // target DOM node.
                // MORPH
                morphEl(curFromNodeChild, curToNodeChild);
              }

            } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
              // Both nodes being compared are Text or Comment nodes
              isCompatible = true;
              // Simply update nodeValue on the original node to
              // change the text value
              if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
              }

            }
          }

          if (isCompatible) {
            // Advance both the "to" child and the "from" child since we found a match
            // Nothing else to do as we already recursively called morphChildren above
            curToNodeChild = toNextSibling;
            curFromNodeChild = fromNextSibling;
            continue outer;
          }

          // No compatible match so remove the old node from the DOM and continue trying to find a
          // match in the original DOM. However, we only do this if the from node is not keyed
          // since it is possible that a keyed node might match up with a node somewhere else in the
          // target tree and we don't want to discard it just yet since it still might find a
          // home in the final DOM tree. After everything is done we will remove any keyed nodes
          // that didn't find a home
          if (curFromNodeKey) {
            // Since the node is keyed it might be matched up later so we defer
            // the actual removal to later
            addKeyedRemoval(curFromNodeKey);
          } else {
            // NOTE: we skip nested keyed nodes from being removed since there is
            //       still a chance they will be matched up later
            removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
          }

          curFromNodeChild = fromNextSibling;
        } // END: while(curFromNodeChild) {}

        // If we got this far then we did not find a candidate match for
        // our "to node" and we exhausted all of the children "from"
        // nodes. Therefore, we will just append the current "to" node
        // to the end
        if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
          // MORPH
          if(!skipFrom){ addChild(fromEl, matchingFromEl); }
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
    } // END: morphChildren(...)

    var morphedNode = fromNode;
    var morphedNodeType = morphedNode.nodeType;
    var toNodeType = toNode.nodeType;

    if (!childrenOnly) {
      // Handle the case where we are given two DOM nodes that are not
      // compatible (e.g. <div> --> <span> or <div> --> TEXT)
      if (morphedNodeType === ELEMENT_NODE) {
        if (toNodeType === ELEMENT_NODE) {
          if (!compareNodeNames(fromNode, toNode)) {
            onNodeDiscarded(fromNode);
            morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
          }
        } else {
          // Going from an element node to a text node
          morphedNode = toNode;
        }
      } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) { // Text or comment node
        if (toNodeType === morphedNodeType) {
          if (morphedNode.nodeValue !== toNode.nodeValue) {
            morphedNode.nodeValue = toNode.nodeValue;
          }

          return morphedNode;
        } else {
          // Text node to something else
          morphedNode = toNode;
        }
      }
    }

    if (morphedNode === toNode) {
      // The "to node" was not compatible with the "from node" so we had to
      // toss out the "from node" and use the "to node"
      onNodeDiscarded(fromNode);
    } else {
      if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
        return;
      }

      morphEl(morphedNode, toNode, childrenOnly);

      // We now need to loop over any keyed nodes that might need to be
      // removed. We only do the removal if we know that the keyed node
      // never found a match. When a keyed node is matched up we remove
      // it out of fromNodesLookup and we use fromNodesLookup to determine
      // if a keyed node has been matched up or not
      if (keyedRemovalList) {
        for (var i=0, len=keyedRemovalList.length; i<len; i++) {
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
      // If we had to swap out the from node with a new node because the old
      // node was not compatible with the target node then we need to
      // replace the old DOM node in the original DOM tree. This is only
      // possible if the original DOM node was part of a DOM tree which
      // we know is the case if it has a parent node.
      fromNode.parentNode.replaceChild(morphedNode, fromNode);
    }

    return morphedNode;
  };
}

var morphdom = morphdomFactory(morphAttrs);

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var grinning = "😀";
var smiley = "😃";
var smile = "😄";
var grin = "😁";
var laughing = "😆";
var satisfied = "😆";
var sweat_smile = "😅";
var rofl = "🤣";
var joy = "😂";
var slightly_smiling_face = "🙂";
var upside_down_face = "🙃";
var wink = "😉";
var blush = "😊";
var innocent = "😇";
var smiling_face_with_three_hearts = "🥰";
var heart_eyes = "😍";
var star_struck = "🤩";
var kissing_heart = "😘";
var kissing = "😗";
var relaxed = "☺️";
var kissing_closed_eyes = "😚";
var kissing_smiling_eyes = "😙";
var smiling_face_with_tear = "🥲";
var yum = "😋";
var stuck_out_tongue = "😛";
var stuck_out_tongue_winking_eye = "😜";
var zany_face = "🤪";
var stuck_out_tongue_closed_eyes = "😝";
var money_mouth_face = "🤑";
var hugs = "🤗";
var hand_over_mouth = "🤭";
var shushing_face = "🤫";
var thinking = "🤔";
var zipper_mouth_face = "🤐";
var raised_eyebrow = "🤨";
var neutral_face = "😐";
var expressionless = "😑";
var no_mouth = "😶";
var smirk = "😏";
var unamused = "😒";
var roll_eyes = "🙄";
var grimacing = "😬";
var lying_face = "🤥";
var relieved = "😌";
var pensive = "😔";
var sleepy = "😪";
var drooling_face = "🤤";
var sleeping = "😴";
var mask = "😷";
var face_with_thermometer = "🤒";
var face_with_head_bandage = "🤕";
var nauseated_face = "🤢";
var vomiting_face = "🤮";
var sneezing_face = "🤧";
var hot_face = "🥵";
var cold_face = "🥶";
var woozy_face = "🥴";
var dizzy_face = "😵";
var exploding_head = "🤯";
var cowboy_hat_face = "🤠";
var partying_face = "🥳";
var disguised_face = "🥸";
var sunglasses = "😎";
var nerd_face = "🤓";
var monocle_face = "🧐";
var confused = "😕";
var worried = "😟";
var slightly_frowning_face = "🙁";
var frowning_face = "☹️";
var open_mouth = "😮";
var hushed = "😯";
var astonished = "😲";
var flushed = "😳";
var pleading_face = "🥺";
var frowning = "😦";
var anguished = "😧";
var fearful = "😨";
var cold_sweat = "😰";
var disappointed_relieved = "😥";
var cry = "😢";
var sob = "😭";
var scream = "😱";
var confounded = "😖";
var persevere = "😣";
var disappointed = "😞";
var sweat = "😓";
var weary = "😩";
var tired_face = "😫";
var yawning_face = "🥱";
var triumph = "😤";
var rage = "😡";
var pout = "😡";
var angry = "😠";
var cursing_face = "🤬";
var smiling_imp = "😈";
var imp = "👿";
var skull = "💀";
var skull_and_crossbones = "☠️";
var hankey = "💩";
var poop = "💩";
var shit = "💩";
var clown_face = "🤡";
var japanese_ogre = "👹";
var japanese_goblin = "👺";
var ghost = "👻";
var alien = "👽";
var space_invader = "👾";
var robot = "🤖";
var smiley_cat = "😺";
var smile_cat = "😸";
var joy_cat = "😹";
var heart_eyes_cat = "😻";
var smirk_cat = "😼";
var kissing_cat = "😽";
var scream_cat = "🙀";
var crying_cat_face = "😿";
var pouting_cat = "😾";
var see_no_evil = "🙈";
var hear_no_evil = "🙉";
var speak_no_evil = "🙊";
var kiss = "💋";
var love_letter = "💌";
var cupid = "💘";
var gift_heart = "💝";
var sparkling_heart = "💖";
var heartpulse = "💗";
var heartbeat = "💓";
var revolving_hearts = "💞";
var two_hearts = "💕";
var heart_decoration = "💟";
var heavy_heart_exclamation = "❣️";
var broken_heart = "💔";
var heart = "❤️";
var orange_heart = "🧡";
var yellow_heart = "💛";
var green_heart = "💚";
var blue_heart = "💙";
var purple_heart = "💜";
var brown_heart = "🤎";
var black_heart = "🖤";
var white_heart = "🤍";
var anger = "💢";
var boom = "💥";
var collision = "💥";
var dizzy = "💫";
var sweat_drops = "💦";
var dash = "💨";
var hole = "🕳️";
var bomb = "💣";
var speech_balloon = "💬";
var eye_speech_bubble = "👁️‍🗨️";
var left_speech_bubble = "🗨️";
var right_anger_bubble = "🗯️";
var thought_balloon = "💭";
var zzz = "💤";
var wave = "👋";
var raised_back_of_hand = "🤚";
var raised_hand_with_fingers_splayed = "🖐️";
var hand = "✋";
var raised_hand = "✋";
var vulcan_salute = "🖖";
var ok_hand = "👌";
var pinched_fingers = "🤌";
var pinching_hand = "🤏";
var v = "✌️";
var crossed_fingers = "🤞";
var love_you_gesture = "🤟";
var metal = "🤘";
var call_me_hand = "🤙";
var point_left = "👈";
var point_right = "👉";
var point_up_2 = "👆";
var middle_finger = "🖕";
var fu = "🖕";
var point_down = "👇";
var point_up = "☝️";
var thumbsup = "👍";
var thumbsdown = "👎";
var fist_raised = "✊";
var fist = "✊";
var fist_oncoming = "👊";
var facepunch = "👊";
var punch = "👊";
var fist_left = "🤛";
var fist_right = "🤜";
var clap = "👏";
var raised_hands = "🙌";
var open_hands = "👐";
var palms_up_together = "🤲";
var handshake = "🤝";
var pray = "🙏";
var writing_hand = "✍️";
var nail_care = "💅";
var selfie = "🤳";
var muscle = "💪";
var mechanical_arm = "🦾";
var mechanical_leg = "🦿";
var leg = "🦵";
var foot = "🦶";
var ear = "👂";
var ear_with_hearing_aid = "🦻";
var nose = "👃";
var brain = "🧠";
var anatomical_heart = "🫀";
var lungs = "🫁";
var tooth = "🦷";
var bone = "🦴";
var eyes = "👀";
var eye = "👁️";
var tongue = "👅";
var lips = "👄";
var baby = "👶";
var child = "🧒";
var boy = "👦";
var girl = "👧";
var adult = "🧑";
var blond_haired_person = "👱";
var man = "👨";
var bearded_person = "🧔";
var red_haired_man = "👨‍🦰";
var curly_haired_man = "👨‍🦱";
var white_haired_man = "👨‍🦳";
var bald_man = "👨‍🦲";
var woman = "👩";
var red_haired_woman = "👩‍🦰";
var person_red_hair = "🧑‍🦰";
var curly_haired_woman = "👩‍🦱";
var person_curly_hair = "🧑‍🦱";
var white_haired_woman = "👩‍🦳";
var person_white_hair = "🧑‍🦳";
var bald_woman = "👩‍🦲";
var person_bald = "🧑‍🦲";
var blond_haired_woman = "👱‍♀️";
var blonde_woman = "👱‍♀️";
var blond_haired_man = "👱‍♂️";
var older_adult = "🧓";
var older_man = "👴";
var older_woman = "👵";
var frowning_person = "🙍";
var frowning_man = "🙍‍♂️";
var frowning_woman = "🙍‍♀️";
var pouting_face = "🙎";
var pouting_man = "🙎‍♂️";
var pouting_woman = "🙎‍♀️";
var no_good = "🙅";
var no_good_man = "🙅‍♂️";
var ng_man = "🙅‍♂️";
var no_good_woman = "🙅‍♀️";
var ng_woman = "🙅‍♀️";
var ok_person = "🙆";
var ok_man = "🙆‍♂️";
var ok_woman = "🙆‍♀️";
var tipping_hand_person = "💁";
var information_desk_person = "💁";
var tipping_hand_man = "💁‍♂️";
var sassy_man = "💁‍♂️";
var tipping_hand_woman = "💁‍♀️";
var sassy_woman = "💁‍♀️";
var raising_hand = "🙋";
var raising_hand_man = "🙋‍♂️";
var raising_hand_woman = "🙋‍♀️";
var deaf_person = "🧏";
var deaf_man = "🧏‍♂️";
var deaf_woman = "🧏‍♀️";
var bow = "🙇";
var bowing_man = "🙇‍♂️";
var bowing_woman = "🙇‍♀️";
var facepalm = "🤦";
var man_facepalming = "🤦‍♂️";
var woman_facepalming = "🤦‍♀️";
var shrug = "🤷";
var man_shrugging = "🤷‍♂️";
var woman_shrugging = "🤷‍♀️";
var health_worker = "🧑‍⚕️";
var man_health_worker = "👨‍⚕️";
var woman_health_worker = "👩‍⚕️";
var student = "🧑‍🎓";
var man_student = "👨‍🎓";
var woman_student = "👩‍🎓";
var teacher = "🧑‍🏫";
var man_teacher = "👨‍🏫";
var woman_teacher = "👩‍🏫";
var judge = "🧑‍⚖️";
var man_judge = "👨‍⚖️";
var woman_judge = "👩‍⚖️";
var farmer = "🧑‍🌾";
var man_farmer = "👨‍🌾";
var woman_farmer = "👩‍🌾";
var cook = "🧑‍🍳";
var man_cook = "👨‍🍳";
var woman_cook = "👩‍🍳";
var mechanic = "🧑‍🔧";
var man_mechanic = "👨‍🔧";
var woman_mechanic = "👩‍🔧";
var factory_worker = "🧑‍🏭";
var man_factory_worker = "👨‍🏭";
var woman_factory_worker = "👩‍🏭";
var office_worker = "🧑‍💼";
var man_office_worker = "👨‍💼";
var woman_office_worker = "👩‍💼";
var scientist = "🧑‍🔬";
var man_scientist = "👨‍🔬";
var woman_scientist = "👩‍🔬";
var technologist = "🧑‍💻";
var man_technologist = "👨‍💻";
var woman_technologist = "👩‍💻";
var singer = "🧑‍🎤";
var man_singer = "👨‍🎤";
var woman_singer = "👩‍🎤";
var artist = "🧑‍🎨";
var man_artist = "👨‍🎨";
var woman_artist = "👩‍🎨";
var pilot = "🧑‍✈️";
var man_pilot = "👨‍✈️";
var woman_pilot = "👩‍✈️";
var astronaut = "🧑‍🚀";
var man_astronaut = "👨‍🚀";
var woman_astronaut = "👩‍🚀";
var firefighter = "🧑‍🚒";
var man_firefighter = "👨‍🚒";
var woman_firefighter = "👩‍🚒";
var police_officer = "👮";
var cop = "👮";
var policeman = "👮‍♂️";
var policewoman = "👮‍♀️";
var detective = "🕵️";
var male_detective = "🕵️‍♂️";
var female_detective = "🕵️‍♀️";
var guard = "💂";
var guardsman = "💂‍♂️";
var guardswoman = "💂‍♀️";
var ninja = "🥷";
var construction_worker = "👷";
var construction_worker_man = "👷‍♂️";
var construction_worker_woman = "👷‍♀️";
var prince = "🤴";
var princess = "👸";
var person_with_turban = "👳";
var man_with_turban = "👳‍♂️";
var woman_with_turban = "👳‍♀️";
var man_with_gua_pi_mao = "👲";
var woman_with_headscarf = "🧕";
var person_in_tuxedo = "🤵";
var man_in_tuxedo = "🤵‍♂️";
var woman_in_tuxedo = "🤵‍♀️";
var person_with_veil = "👰";
var man_with_veil = "👰‍♂️";
var woman_with_veil = "👰‍♀️";
var bride_with_veil = "👰‍♀️";
var pregnant_woman = "🤰";
var breast_feeding = "🤱";
var woman_feeding_baby = "👩‍🍼";
var man_feeding_baby = "👨‍🍼";
var person_feeding_baby = "🧑‍🍼";
var angel = "👼";
var santa = "🎅";
var mrs_claus = "🤶";
var mx_claus = "🧑‍🎄";
var superhero = "🦸";
var superhero_man = "🦸‍♂️";
var superhero_woman = "🦸‍♀️";
var supervillain = "🦹";
var supervillain_man = "🦹‍♂️";
var supervillain_woman = "🦹‍♀️";
var mage = "🧙";
var mage_man = "🧙‍♂️";
var mage_woman = "🧙‍♀️";
var fairy = "🧚";
var fairy_man = "🧚‍♂️";
var fairy_woman = "🧚‍♀️";
var vampire = "🧛";
var vampire_man = "🧛‍♂️";
var vampire_woman = "🧛‍♀️";
var merperson = "🧜";
var merman = "🧜‍♂️";
var mermaid = "🧜‍♀️";
var elf = "🧝";
var elf_man = "🧝‍♂️";
var elf_woman = "🧝‍♀️";
var genie = "🧞";
var genie_man = "🧞‍♂️";
var genie_woman = "🧞‍♀️";
var zombie = "🧟";
var zombie_man = "🧟‍♂️";
var zombie_woman = "🧟‍♀️";
var massage = "💆";
var massage_man = "💆‍♂️";
var massage_woman = "💆‍♀️";
var haircut = "💇";
var haircut_man = "💇‍♂️";
var haircut_woman = "💇‍♀️";
var walking = "🚶";
var walking_man = "🚶‍♂️";
var walking_woman = "🚶‍♀️";
var standing_person = "🧍";
var standing_man = "🧍‍♂️";
var standing_woman = "🧍‍♀️";
var kneeling_person = "🧎";
var kneeling_man = "🧎‍♂️";
var kneeling_woman = "🧎‍♀️";
var person_with_probing_cane = "🧑‍🦯";
var man_with_probing_cane = "👨‍🦯";
var woman_with_probing_cane = "👩‍🦯";
var person_in_motorized_wheelchair = "🧑‍🦼";
var man_in_motorized_wheelchair = "👨‍🦼";
var woman_in_motorized_wheelchair = "👩‍🦼";
var person_in_manual_wheelchair = "🧑‍🦽";
var man_in_manual_wheelchair = "👨‍🦽";
var woman_in_manual_wheelchair = "👩‍🦽";
var runner = "🏃";
var running = "🏃";
var running_man = "🏃‍♂️";
var running_woman = "🏃‍♀️";
var woman_dancing = "💃";
var dancer = "💃";
var man_dancing = "🕺";
var business_suit_levitating = "🕴️";
var dancers = "👯";
var dancing_men = "👯‍♂️";
var dancing_women = "👯‍♀️";
var sauna_person = "🧖";
var sauna_man = "🧖‍♂️";
var sauna_woman = "🧖‍♀️";
var climbing = "🧗";
var climbing_man = "🧗‍♂️";
var climbing_woman = "🧗‍♀️";
var person_fencing = "🤺";
var horse_racing = "🏇";
var skier = "⛷️";
var snowboarder = "🏂";
var golfing = "🏌️";
var golfing_man = "🏌️‍♂️";
var golfing_woman = "🏌️‍♀️";
var surfer = "🏄";
var surfing_man = "🏄‍♂️";
var surfing_woman = "🏄‍♀️";
var rowboat = "🚣";
var rowing_man = "🚣‍♂️";
var rowing_woman = "🚣‍♀️";
var swimmer = "🏊";
var swimming_man = "🏊‍♂️";
var swimming_woman = "🏊‍♀️";
var bouncing_ball_person = "⛹️";
var bouncing_ball_man = "⛹️‍♂️";
var basketball_man = "⛹️‍♂️";
var bouncing_ball_woman = "⛹️‍♀️";
var basketball_woman = "⛹️‍♀️";
var weight_lifting = "🏋️";
var weight_lifting_man = "🏋️‍♂️";
var weight_lifting_woman = "🏋️‍♀️";
var bicyclist = "🚴";
var biking_man = "🚴‍♂️";
var biking_woman = "🚴‍♀️";
var mountain_bicyclist = "🚵";
var mountain_biking_man = "🚵‍♂️";
var mountain_biking_woman = "🚵‍♀️";
var cartwheeling = "🤸";
var man_cartwheeling = "🤸‍♂️";
var woman_cartwheeling = "🤸‍♀️";
var wrestling = "🤼";
var men_wrestling = "🤼‍♂️";
var women_wrestling = "🤼‍♀️";
var water_polo = "🤽";
var man_playing_water_polo = "🤽‍♂️";
var woman_playing_water_polo = "🤽‍♀️";
var handball_person = "🤾";
var man_playing_handball = "🤾‍♂️";
var woman_playing_handball = "🤾‍♀️";
var juggling_person = "🤹";
var man_juggling = "🤹‍♂️";
var woman_juggling = "🤹‍♀️";
var lotus_position = "🧘";
var lotus_position_man = "🧘‍♂️";
var lotus_position_woman = "🧘‍♀️";
var bath = "🛀";
var sleeping_bed = "🛌";
var people_holding_hands = "🧑‍🤝‍🧑";
var two_women_holding_hands = "👭";
var couple = "👫";
var two_men_holding_hands = "👬";
var couplekiss = "💏";
var couplekiss_man_woman = "👩‍❤️‍💋‍👨";
var couplekiss_man_man = "👨‍❤️‍💋‍👨";
var couplekiss_woman_woman = "👩‍❤️‍💋‍👩";
var couple_with_heart = "💑";
var couple_with_heart_woman_man = "👩‍❤️‍👨";
var couple_with_heart_man_man = "👨‍❤️‍👨";
var couple_with_heart_woman_woman = "👩‍❤️‍👩";
var family = "👪";
var family_man_woman_boy = "👨‍👩‍👦";
var family_man_woman_girl = "👨‍👩‍👧";
var family_man_woman_girl_boy = "👨‍👩‍👧‍👦";
var family_man_woman_boy_boy = "👨‍👩‍👦‍👦";
var family_man_woman_girl_girl = "👨‍👩‍👧‍👧";
var family_man_man_boy = "👨‍👨‍👦";
var family_man_man_girl = "👨‍👨‍👧";
var family_man_man_girl_boy = "👨‍👨‍👧‍👦";
var family_man_man_boy_boy = "👨‍👨‍👦‍👦";
var family_man_man_girl_girl = "👨‍👨‍👧‍👧";
var family_woman_woman_boy = "👩‍👩‍👦";
var family_woman_woman_girl = "👩‍👩‍👧";
var family_woman_woman_girl_boy = "👩‍👩‍👧‍👦";
var family_woman_woman_boy_boy = "👩‍👩‍👦‍👦";
var family_woman_woman_girl_girl = "👩‍👩‍👧‍👧";
var family_man_boy = "👨‍👦";
var family_man_boy_boy = "👨‍👦‍👦";
var family_man_girl = "👨‍👧";
var family_man_girl_boy = "👨‍👧‍👦";
var family_man_girl_girl = "👨‍👧‍👧";
var family_woman_boy = "👩‍👦";
var family_woman_boy_boy = "👩‍👦‍👦";
var family_woman_girl = "👩‍👧";
var family_woman_girl_boy = "👩‍👧‍👦";
var family_woman_girl_girl = "👩‍👧‍👧";
var speaking_head = "🗣️";
var bust_in_silhouette = "👤";
var busts_in_silhouette = "👥";
var people_hugging = "🫂";
var footprints = "👣";
var monkey_face = "🐵";
var monkey = "🐒";
var gorilla = "🦍";
var orangutan = "🦧";
var dog = "🐶";
var dog2 = "🐕";
var guide_dog = "🦮";
var service_dog = "🐕‍🦺";
var poodle = "🐩";
var wolf = "🐺";
var fox_face = "🦊";
var raccoon = "🦝";
var cat = "🐱";
var cat2 = "🐈";
var black_cat = "🐈‍⬛";
var lion = "🦁";
var tiger = "🐯";
var tiger2 = "🐅";
var leopard = "🐆";
var horse = "🐴";
var racehorse = "🐎";
var unicorn = "🦄";
var zebra = "🦓";
var deer = "🦌";
var bison = "🦬";
var cow = "🐮";
var ox = "🐂";
var water_buffalo = "🐃";
var cow2 = "🐄";
var pig = "🐷";
var pig2 = "🐖";
var boar = "🐗";
var pig_nose = "🐽";
var ram = "🐏";
var sheep = "🐑";
var goat = "🐐";
var dromedary_camel = "🐪";
var camel = "🐫";
var llama = "🦙";
var giraffe = "🦒";
var elephant = "🐘";
var mammoth = "🦣";
var rhinoceros = "🦏";
var hippopotamus = "🦛";
var mouse = "🐭";
var mouse2 = "🐁";
var rat = "🐀";
var hamster = "🐹";
var rabbit = "🐰";
var rabbit2 = "🐇";
var chipmunk = "🐿️";
var beaver = "🦫";
var hedgehog = "🦔";
var bat = "🦇";
var bear = "🐻";
var polar_bear = "🐻‍❄️";
var koala = "🐨";
var panda_face = "🐼";
var sloth = "🦥";
var otter = "🦦";
var skunk = "🦨";
var kangaroo = "🦘";
var badger = "🦡";
var feet = "🐾";
var paw_prints = "🐾";
var turkey = "🦃";
var chicken = "🐔";
var rooster = "🐓";
var hatching_chick = "🐣";
var baby_chick = "🐤";
var hatched_chick = "🐥";
var bird = "🐦";
var penguin = "🐧";
var dove = "🕊️";
var eagle = "🦅";
var duck = "🦆";
var swan = "🦢";
var owl = "🦉";
var dodo = "🦤";
var feather = "🪶";
var flamingo = "🦩";
var peacock = "🦚";
var parrot = "🦜";
var frog = "🐸";
var crocodile = "🐊";
var turtle = "🐢";
var lizard = "🦎";
var snake = "🐍";
var dragon_face = "🐲";
var dragon = "🐉";
var sauropod = "🦕";
var whale = "🐳";
var whale2 = "🐋";
var dolphin = "🐬";
var flipper = "🐬";
var seal = "🦭";
var fish = "🐟";
var tropical_fish = "🐠";
var blowfish = "🐡";
var shark = "🦈";
var octopus = "🐙";
var shell$1 = "🐚";
var snail = "🐌";
var butterfly = "🦋";
var bug = "🐛";
var ant = "🐜";
var bee = "🐝";
var honeybee = "🐝";
var beetle = "🪲";
var lady_beetle = "🐞";
var cricket = "🦗";
var cockroach = "🪳";
var spider = "🕷️";
var spider_web = "🕸️";
var scorpion = "🦂";
var mosquito = "🦟";
var fly = "🪰";
var worm = "🪱";
var microbe = "🦠";
var bouquet = "💐";
var cherry_blossom = "🌸";
var white_flower = "💮";
var rosette = "🏵️";
var rose = "🌹";
var wilted_flower = "🥀";
var hibiscus = "🌺";
var sunflower = "🌻";
var blossom = "🌼";
var tulip = "🌷";
var seedling = "🌱";
var potted_plant = "🪴";
var evergreen_tree = "🌲";
var deciduous_tree = "🌳";
var palm_tree = "🌴";
var cactus = "🌵";
var ear_of_rice = "🌾";
var herb = "🌿";
var shamrock = "☘️";
var four_leaf_clover = "🍀";
var maple_leaf = "🍁";
var fallen_leaf = "🍂";
var leaves = "🍃";
var grapes = "🍇";
var melon = "🍈";
var watermelon = "🍉";
var tangerine = "🍊";
var orange = "🍊";
var mandarin = "🍊";
var lemon = "🍋";
var banana = "🍌";
var pineapple = "🍍";
var mango = "🥭";
var apple = "🍎";
var green_apple = "🍏";
var pear = "🍐";
var peach = "🍑";
var cherries = "🍒";
var strawberry = "🍓";
var blueberries = "🫐";
var kiwi_fruit = "🥝";
var tomato = "🍅";
var olive = "🫒";
var coconut = "🥥";
var avocado = "🥑";
var eggplant = "🍆";
var potato = "🥔";
var carrot = "🥕";
var corn = "🌽";
var hot_pepper = "🌶️";
var bell_pepper = "🫑";
var cucumber = "🥒";
var leafy_green = "🥬";
var broccoli = "🥦";
var garlic = "🧄";
var onion = "🧅";
var mushroom = "🍄";
var peanuts = "🥜";
var chestnut = "🌰";
var bread = "🍞";
var croissant = "🥐";
var baguette_bread = "🥖";
var flatbread = "🫓";
var pretzel = "🥨";
var bagel = "🥯";
var pancakes = "🥞";
var waffle = "🧇";
var cheese = "🧀";
var meat_on_bone = "🍖";
var poultry_leg = "🍗";
var cut_of_meat = "🥩";
var bacon = "🥓";
var hamburger = "🍔";
var fries = "🍟";
var pizza = "🍕";
var hotdog = "🌭";
var sandwich = "🥪";
var taco = "🌮";
var burrito = "🌯";
var tamale = "🫔";
var stuffed_flatbread = "🥙";
var falafel = "🧆";
var egg = "🥚";
var fried_egg = "🍳";
var shallow_pan_of_food = "🥘";
var stew = "🍲";
var fondue = "🫕";
var bowl_with_spoon = "🥣";
var green_salad = "🥗";
var popcorn = "🍿";
var butter = "🧈";
var salt = "🧂";
var canned_food = "🥫";
var bento = "🍱";
var rice_cracker = "🍘";
var rice_ball = "🍙";
var rice = "🍚";
var curry = "🍛";
var ramen = "🍜";
var spaghetti = "🍝";
var sweet_potato = "🍠";
var oden = "🍢";
var sushi = "🍣";
var fried_shrimp = "🍤";
var fish_cake = "🍥";
var moon_cake = "🥮";
var dango = "🍡";
var dumpling = "🥟";
var fortune_cookie = "🥠";
var takeout_box = "🥡";
var crab = "🦀";
var lobster = "🦞";
var shrimp = "🦐";
var squid = "🦑";
var oyster = "🦪";
var icecream = "🍦";
var shaved_ice = "🍧";
var ice_cream = "🍨";
var doughnut = "🍩";
var cookie = "🍪";
var birthday = "🎂";
var cake = "🍰";
var cupcake = "🧁";
var pie = "🥧";
var chocolate_bar = "🍫";
var candy = "🍬";
var lollipop = "🍭";
var custard = "🍮";
var honey_pot = "🍯";
var baby_bottle = "🍼";
var milk_glass = "🥛";
var coffee = "☕";
var teapot = "🫖";
var tea = "🍵";
var sake = "🍶";
var champagne = "🍾";
var wine_glass = "🍷";
var cocktail = "🍸";
var tropical_drink = "🍹";
var beer = "🍺";
var beers = "🍻";
var clinking_glasses = "🥂";
var tumbler_glass = "🥃";
var cup_with_straw = "🥤";
var bubble_tea = "🧋";
var beverage_box = "🧃";
var mate = "🧉";
var ice_cube = "🧊";
var chopsticks = "🥢";
var plate_with_cutlery = "🍽️";
var fork_and_knife = "🍴";
var spoon = "🥄";
var hocho = "🔪";
var knife = "🔪";
var amphora = "🏺";
var earth_africa = "🌍";
var earth_americas = "🌎";
var earth_asia = "🌏";
var globe_with_meridians = "🌐";
var world_map = "🗺️";
var japan = "🗾";
var compass = "🧭";
var mountain_snow = "🏔️";
var mountain = "⛰️";
var volcano = "🌋";
var mount_fuji = "🗻";
var camping = "🏕️";
var beach_umbrella = "🏖️";
var desert = "🏜️";
var desert_island = "🏝️";
var national_park = "🏞️";
var stadium = "🏟️";
var classical_building = "🏛️";
var building_construction = "🏗️";
var bricks = "🧱";
var rock = "🪨";
var wood = "🪵";
var hut = "🛖";
var houses = "🏘️";
var derelict_house = "🏚️";
var house = "🏠";
var house_with_garden = "🏡";
var office = "🏢";
var post_office = "🏣";
var european_post_office = "🏤";
var hospital = "🏥";
var bank = "🏦";
var hotel = "🏨";
var love_hotel = "🏩";
var convenience_store = "🏪";
var school = "🏫";
var department_store = "🏬";
var factory = "🏭";
var japanese_castle = "🏯";
var european_castle = "🏰";
var wedding = "💒";
var tokyo_tower = "🗼";
var statue_of_liberty = "🗽";
var church = "⛪";
var mosque = "🕌";
var hindu_temple = "🛕";
var synagogue = "🕍";
var shinto_shrine = "⛩️";
var kaaba = "🕋";
var fountain = "⛲";
var tent = "⛺";
var foggy = "🌁";
var night_with_stars = "🌃";
var cityscape = "🏙️";
var sunrise_over_mountains = "🌄";
var sunrise = "🌅";
var city_sunset = "🌆";
var city_sunrise = "🌇";
var bridge_at_night = "🌉";
var hotsprings = "♨️";
var carousel_horse = "🎠";
var ferris_wheel = "🎡";
var roller_coaster = "🎢";
var barber = "💈";
var circus_tent = "🎪";
var steam_locomotive = "🚂";
var railway_car = "🚃";
var bullettrain_side = "🚄";
var bullettrain_front = "🚅";
var train2 = "🚆";
var metro = "🚇";
var light_rail = "🚈";
var station = "🚉";
var tram = "🚊";
var monorail = "🚝";
var mountain_railway = "🚞";
var train = "🚋";
var bus = "🚌";
var oncoming_bus = "🚍";
var trolleybus = "🚎";
var minibus = "🚐";
var ambulance = "🚑";
var fire_engine = "🚒";
var police_car = "🚓";
var oncoming_police_car = "🚔";
var taxi = "🚕";
var oncoming_taxi = "🚖";
var car = "🚗";
var red_car = "🚗";
var oncoming_automobile = "🚘";
var blue_car = "🚙";
var pickup_truck = "🛻";
var truck = "🚚";
var articulated_lorry = "🚛";
var tractor = "🚜";
var racing_car = "🏎️";
var motorcycle = "🏍️";
var motor_scooter = "🛵";
var manual_wheelchair = "🦽";
var motorized_wheelchair = "🦼";
var auto_rickshaw = "🛺";
var bike = "🚲";
var kick_scooter = "🛴";
var skateboard = "🛹";
var roller_skate = "🛼";
var busstop = "🚏";
var motorway = "🛣️";
var railway_track = "🛤️";
var oil_drum = "🛢️";
var fuelpump = "⛽";
var rotating_light = "🚨";
var traffic_light = "🚥";
var vertical_traffic_light = "🚦";
var stop_sign = "🛑";
var construction = "🚧";
var anchor = "⚓";
var boat = "⛵";
var sailboat = "⛵";
var canoe = "🛶";
var speedboat = "🚤";
var passenger_ship = "🛳️";
var ferry = "⛴️";
var motor_boat = "🛥️";
var ship = "🚢";
var airplane = "✈️";
var small_airplane = "🛩️";
var flight_departure = "🛫";
var flight_arrival = "🛬";
var parachute = "🪂";
var seat = "💺";
var helicopter = "🚁";
var suspension_railway = "🚟";
var mountain_cableway = "🚠";
var aerial_tramway = "🚡";
var artificial_satellite = "🛰️";
var rocket = "🚀";
var flying_saucer = "🛸";
var bellhop_bell = "🛎️";
var luggage = "🧳";
var hourglass = "⌛";
var hourglass_flowing_sand = "⏳";
var watch = "⌚";
var alarm_clock = "⏰";
var stopwatch = "⏱️";
var timer_clock = "⏲️";
var mantelpiece_clock = "🕰️";
var clock12 = "🕛";
var clock1230 = "🕧";
var clock1 = "🕐";
var clock130 = "🕜";
var clock2 = "🕑";
var clock230 = "🕝";
var clock3 = "🕒";
var clock330 = "🕞";
var clock4 = "🕓";
var clock430 = "🕟";
var clock5 = "🕔";
var clock530 = "🕠";
var clock6 = "🕕";
var clock630 = "🕡";
var clock7 = "🕖";
var clock730 = "🕢";
var clock8 = "🕗";
var clock830 = "🕣";
var clock9 = "🕘";
var clock930 = "🕤";
var clock10 = "🕙";
var clock1030 = "🕥";
var clock11 = "🕚";
var clock1130 = "🕦";
var new_moon = "🌑";
var waxing_crescent_moon = "🌒";
var first_quarter_moon = "🌓";
var moon = "🌔";
var waxing_gibbous_moon = "🌔";
var full_moon = "🌕";
var waning_gibbous_moon = "🌖";
var last_quarter_moon = "🌗";
var waning_crescent_moon = "🌘";
var crescent_moon = "🌙";
var new_moon_with_face = "🌚";
var first_quarter_moon_with_face = "🌛";
var last_quarter_moon_with_face = "🌜";
var thermometer = "🌡️";
var sunny = "☀️";
var full_moon_with_face = "🌝";
var sun_with_face = "🌞";
var ringed_planet = "🪐";
var star = "⭐";
var star2 = "🌟";
var stars = "🌠";
var milky_way = "🌌";
var cloud = "☁️";
var partly_sunny = "⛅";
var cloud_with_lightning_and_rain = "⛈️";
var sun_behind_small_cloud = "🌤️";
var sun_behind_large_cloud = "🌥️";
var sun_behind_rain_cloud = "🌦️";
var cloud_with_rain = "🌧️";
var cloud_with_snow = "🌨️";
var cloud_with_lightning = "🌩️";
var tornado = "🌪️";
var fog = "🌫️";
var wind_face = "🌬️";
var cyclone = "🌀";
var rainbow = "🌈";
var closed_umbrella = "🌂";
var open_umbrella = "☂️";
var umbrella = "☔";
var parasol_on_ground = "⛱️";
var zap = "⚡";
var snowflake = "❄️";
var snowman_with_snow = "☃️";
var snowman = "⛄";
var comet = "☄️";
var fire = "🔥";
var droplet = "💧";
var ocean = "🌊";
var jack_o_lantern = "🎃";
var christmas_tree = "🎄";
var fireworks = "🎆";
var sparkler = "🎇";
var firecracker = "🧨";
var sparkles = "✨";
var balloon = "🎈";
var tada = "🎉";
var confetti_ball = "🎊";
var tanabata_tree = "🎋";
var bamboo = "🎍";
var dolls = "🎎";
var flags = "🎏";
var wind_chime = "🎐";
var rice_scene = "🎑";
var red_envelope = "🧧";
var ribbon = "🎀";
var gift = "🎁";
var reminder_ribbon = "🎗️";
var tickets = "🎟️";
var ticket = "🎫";
var medal_military = "🎖️";
var trophy = "🏆";
var medal_sports = "🏅";
var soccer = "⚽";
var baseball = "⚾";
var softball = "🥎";
var basketball = "🏀";
var volleyball = "🏐";
var football = "🏈";
var rugby_football = "🏉";
var tennis = "🎾";
var flying_disc = "🥏";
var bowling = "🎳";
var cricket_game = "🏏";
var field_hockey = "🏑";
var ice_hockey = "🏒";
var lacrosse = "🥍";
var ping_pong = "🏓";
var badminton = "🏸";
var boxing_glove = "🥊";
var martial_arts_uniform = "🥋";
var goal_net = "🥅";
var golf = "⛳";
var ice_skate = "⛸️";
var fishing_pole_and_fish = "🎣";
var diving_mask = "🤿";
var running_shirt_with_sash = "🎽";
var ski = "🎿";
var sled = "🛷";
var curling_stone = "🥌";
var dart$1 = "🎯";
var yo_yo = "🪀";
var kite = "🪁";
var crystal_ball = "🔮";
var magic_wand = "🪄";
var nazar_amulet = "🧿";
var video_game = "🎮";
var joystick = "🕹️";
var slot_machine = "🎰";
var game_die = "🎲";
var jigsaw = "🧩";
var teddy_bear = "🧸";
var pinata = "🪅";
var nesting_dolls = "🪆";
var spades = "♠️";
var hearts = "♥️";
var diamonds = "♦️";
var clubs = "♣️";
var chess_pawn = "♟️";
var black_joker = "🃏";
var mahjong = "🀄";
var flower_playing_cards = "🎴";
var performing_arts = "🎭";
var framed_picture = "🖼️";
var art = "🎨";
var thread = "🧵";
var sewing_needle = "🪡";
var yarn = "🧶";
var knot = "🪢";
var eyeglasses = "👓";
var dark_sunglasses = "🕶️";
var goggles = "🥽";
var lab_coat = "🥼";
var safety_vest = "🦺";
var necktie = "👔";
var shirt = "👕";
var tshirt = "👕";
var jeans = "👖";
var scarf = "🧣";
var gloves = "🧤";
var coat = "🧥";
var socks = "🧦";
var dress = "👗";
var kimono = "👘";
var sari = "🥻";
var one_piece_swimsuit = "🩱";
var swim_brief = "🩲";
var shorts = "🩳";
var bikini = "👙";
var womans_clothes = "👚";
var purse = "👛";
var handbag = "👜";
var pouch = "👝";
var shopping = "🛍️";
var school_satchel = "🎒";
var thong_sandal = "🩴";
var mans_shoe = "👞";
var shoe = "👞";
var athletic_shoe = "👟";
var hiking_boot = "🥾";
var flat_shoe = "🥿";
var high_heel = "👠";
var sandal = "👡";
var ballet_shoes = "🩰";
var boot = "👢";
var crown = "👑";
var womans_hat = "👒";
var tophat = "🎩";
var mortar_board = "🎓";
var billed_cap = "🧢";
var military_helmet = "🪖";
var rescue_worker_helmet = "⛑️";
var prayer_beads = "📿";
var lipstick = "💄";
var ring = "💍";
var gem = "💎";
var mute = "🔇";
var speaker = "🔈";
var sound = "🔉";
var loud_sound = "🔊";
var loudspeaker = "📢";
var mega = "📣";
var postal_horn = "📯";
var bell = "🔔";
var no_bell = "🔕";
var musical_score = "🎼";
var musical_note = "🎵";
var notes = "🎶";
var studio_microphone = "🎙️";
var level_slider = "🎚️";
var control_knobs = "🎛️";
var microphone = "🎤";
var headphones = "🎧";
var radio = "📻";
var saxophone = "🎷";
var accordion = "🪗";
var guitar = "🎸";
var musical_keyboard = "🎹";
var trumpet = "🎺";
var violin = "🎻";
var banjo = "🪕";
var drum = "🥁";
var long_drum = "🪘";
var iphone = "📱";
var calling = "📲";
var phone = "☎️";
var telephone = "☎️";
var telephone_receiver = "📞";
var pager = "📟";
var fax = "📠";
var battery = "🔋";
var electric_plug = "🔌";
var computer = "💻";
var desktop_computer = "🖥️";
var printer = "🖨️";
var keyboard = "⌨️";
var computer_mouse = "🖱️";
var trackball = "🖲️";
var minidisc = "💽";
var floppy_disk = "💾";
var cd = "💿";
var dvd = "📀";
var abacus = "🧮";
var movie_camera = "🎥";
var film_strip = "🎞️";
var film_projector = "📽️";
var clapper = "🎬";
var tv = "📺";
var camera = "📷";
var camera_flash = "📸";
var video_camera = "📹";
var vhs = "📼";
var mag = "🔍";
var mag_right = "🔎";
var candle = "🕯️";
var bulb = "💡";
var flashlight = "🔦";
var izakaya_lantern = "🏮";
var lantern = "🏮";
var diya_lamp = "🪔";
var notebook_with_decorative_cover = "📔";
var closed_book = "📕";
var book = "📖";
var open_book = "📖";
var green_book = "📗";
var blue_book = "📘";
var orange_book = "📙";
var books = "📚";
var notebook = "📓";
var ledger = "📒";
var page_with_curl = "📃";
var scroll = "📜";
var page_facing_up = "📄";
var newspaper = "📰";
var newspaper_roll = "🗞️";
var bookmark_tabs = "📑";
var bookmark = "🔖";
var label = "🏷️";
var moneybag = "💰";
var coin = "🪙";
var yen = "💴";
var dollar = "💵";
var euro = "💶";
var pound = "💷";
var money_with_wings = "💸";
var credit_card = "💳";
var receipt = "🧾";
var chart = "💹";
var envelope = "✉️";
var email = "📧";
var incoming_envelope = "📨";
var envelope_with_arrow = "📩";
var outbox_tray = "📤";
var inbox_tray = "📥";
var mailbox = "📫";
var mailbox_closed = "📪";
var mailbox_with_mail = "📬";
var mailbox_with_no_mail = "📭";
var postbox = "📮";
var ballot_box = "🗳️";
var pencil2 = "✏️";
var black_nib = "✒️";
var fountain_pen = "🖋️";
var pen = "🖊️";
var paintbrush = "🖌️";
var crayon = "🖍️";
var memo = "📝";
var pencil = "📝";
var briefcase = "💼";
var file_folder = "📁";
var open_file_folder = "📂";
var card_index_dividers = "🗂️";
var date = "📅";
var calendar = "📆";
var spiral_notepad = "🗒️";
var spiral_calendar = "🗓️";
var card_index = "📇";
var chart_with_upwards_trend = "📈";
var chart_with_downwards_trend = "📉";
var bar_chart = "📊";
var clipboard = "📋";
var pushpin = "📌";
var round_pushpin = "📍";
var paperclip = "📎";
var paperclips = "🖇️";
var straight_ruler = "📏";
var triangular_ruler = "📐";
var scissors = "✂️";
var card_file_box = "🗃️";
var file_cabinet = "🗄️";
var wastebasket = "🗑️";
var lock = "🔒";
var unlock = "🔓";
var lock_with_ink_pen = "🔏";
var closed_lock_with_key = "🔐";
var key = "🔑";
var old_key = "🗝️";
var hammer = "🔨";
var axe = "🪓";
var pick = "⛏️";
var hammer_and_pick = "⚒️";
var hammer_and_wrench = "🛠️";
var dagger = "🗡️";
var crossed_swords = "⚔️";
var gun = "🔫";
var boomerang = "🪃";
var bow_and_arrow = "🏹";
var shield = "🛡️";
var carpentry_saw = "🪚";
var wrench = "🔧";
var screwdriver = "🪛";
var nut_and_bolt = "🔩";
var gear = "⚙️";
var clamp = "🗜️";
var balance_scale = "⚖️";
var probing_cane = "🦯";
var link = "🔗";
var chains = "⛓️";
var hook = "🪝";
var toolbox = "🧰";
var magnet = "🧲";
var ladder = "🪜";
var alembic = "⚗️";
var test_tube = "🧪";
var petri_dish = "🧫";
var dna = "🧬";
var microscope = "🔬";
var telescope = "🔭";
var satellite = "📡";
var syringe = "💉";
var drop_of_blood = "🩸";
var pill = "💊";
var adhesive_bandage = "🩹";
var stethoscope = "🩺";
var door = "🚪";
var elevator = "🛗";
var mirror = "🪞";
var window$1 = "🪟";
var bed = "🛏️";
var couch_and_lamp = "🛋️";
var chair = "🪑";
var toilet = "🚽";
var plunger = "🪠";
var shower = "🚿";
var bathtub = "🛁";
var mouse_trap = "🪤";
var razor = "🪒";
var lotion_bottle = "🧴";
var safety_pin = "🧷";
var broom = "🧹";
var basket = "🧺";
var roll_of_paper = "🧻";
var bucket = "🪣";
var soap = "🧼";
var toothbrush = "🪥";
var sponge = "🧽";
var fire_extinguisher = "🧯";
var shopping_cart = "🛒";
var smoking = "🚬";
var coffin = "⚰️";
var headstone = "🪦";
var funeral_urn = "⚱️";
var moyai = "🗿";
var placard = "🪧";
var atm = "🏧";
var put_litter_in_its_place = "🚮";
var potable_water = "🚰";
var wheelchair = "♿";
var mens = "🚹";
var womens = "🚺";
var restroom = "🚻";
var baby_symbol = "🚼";
var wc = "🚾";
var passport_control = "🛂";
var customs = "🛃";
var baggage_claim = "🛄";
var left_luggage = "🛅";
var warning = "⚠️";
var children_crossing = "🚸";
var no_entry = "⛔";
var no_entry_sign = "🚫";
var no_bicycles = "🚳";
var no_smoking = "🚭";
var do_not_litter = "🚯";
var no_pedestrians = "🚷";
var no_mobile_phones = "📵";
var underage = "🔞";
var radioactive = "☢️";
var biohazard = "☣️";
var arrow_up = "⬆️";
var arrow_upper_right = "↗️";
var arrow_right = "➡️";
var arrow_lower_right = "↘️";
var arrow_down = "⬇️";
var arrow_lower_left = "↙️";
var arrow_left = "⬅️";
var arrow_upper_left = "↖️";
var arrow_up_down = "↕️";
var left_right_arrow = "↔️";
var leftwards_arrow_with_hook = "↩️";
var arrow_right_hook = "↪️";
var arrow_heading_up = "⤴️";
var arrow_heading_down = "⤵️";
var arrows_clockwise = "🔃";
var arrows_counterclockwise = "🔄";
var back = "🔙";
var end = "🔚";
var on = "🔛";
var soon = "🔜";
var top = "🔝";
var place_of_worship = "🛐";
var atom_symbol = "⚛️";
var om = "🕉️";
var star_of_david = "✡️";
var wheel_of_dharma = "☸️";
var yin_yang = "☯️";
var latin_cross = "✝️";
var orthodox_cross = "☦️";
var star_and_crescent = "☪️";
var peace_symbol = "☮️";
var menorah = "🕎";
var six_pointed_star = "🔯";
var aries = "♈";
var taurus = "♉";
var gemini = "♊";
var cancer = "♋";
var leo = "♌";
var virgo = "♍";
var libra = "♎";
var scorpius = "♏";
var sagittarius = "♐";
var capricorn = "♑";
var aquarius = "♒";
var pisces = "♓";
var ophiuchus = "⛎";
var twisted_rightwards_arrows = "🔀";
var repeat = "🔁";
var repeat_one = "🔂";
var arrow_forward = "▶️";
var fast_forward = "⏩";
var next_track_button = "⏭️";
var play_or_pause_button = "⏯️";
var arrow_backward = "◀️";
var rewind = "⏪";
var previous_track_button = "⏮️";
var arrow_up_small = "🔼";
var arrow_double_up = "⏫";
var arrow_down_small = "🔽";
var arrow_double_down = "⏬";
var pause_button = "⏸️";
var stop_button = "⏹️";
var record_button = "⏺️";
var eject_button = "⏏️";
var cinema = "🎦";
var low_brightness = "🔅";
var high_brightness = "🔆";
var signal_strength = "📶";
var vibration_mode = "📳";
var mobile_phone_off = "📴";
var female_sign = "♀️";
var male_sign = "♂️";
var transgender_symbol = "⚧️";
var heavy_multiplication_x = "✖️";
var heavy_plus_sign = "➕";
var heavy_minus_sign = "➖";
var heavy_division_sign = "➗";
var infinity = "♾️";
var bangbang = "‼️";
var interrobang = "⁉️";
var question = "❓";
var grey_question = "❔";
var grey_exclamation = "❕";
var exclamation = "❗";
var heavy_exclamation_mark = "❗";
var wavy_dash = "〰️";
var currency_exchange = "💱";
var heavy_dollar_sign = "💲";
var medical_symbol = "⚕️";
var recycle = "♻️";
var fleur_de_lis = "⚜️";
var trident = "🔱";
var name_badge = "📛";
var beginner = "🔰";
var o$1 = "⭕";
var white_check_mark = "✅";
var ballot_box_with_check = "☑️";
var heavy_check_mark = "✔️";
var x = "❌";
var negative_squared_cross_mark = "❎";
var curly_loop = "➰";
var loop = "➿";
var part_alternation_mark = "〽️";
var eight_spoked_asterisk = "✳️";
var eight_pointed_black_star = "✴️";
var sparkle = "❇️";
var copyright = "©️";
var registered = "®️";
var tm = "™️";
var hash = "#️⃣";
var asterisk = "*️⃣";
var zero = "0️⃣";
var one = "1️⃣";
var two = "2️⃣";
var three = "3️⃣";
var four = "4️⃣";
var five = "5️⃣";
var six = "6️⃣";
var seven = "7️⃣";
var eight = "8️⃣";
var nine = "9️⃣";
var keycap_ten = "🔟";
var capital_abcd = "🔠";
var abcd = "🔡";
var symbols = "🔣";
var abc = "🔤";
var a$1 = "🅰️";
var ab = "🆎";
var b = "🅱️";
var cl = "🆑";
var cool = "🆒";
var free = "🆓";
var information_source = "ℹ️";
var id = "🆔";
var m = "Ⓜ️";
var ng = "🆖";
var o2 = "🅾️";
var ok = "🆗";
var parking = "🅿️";
var sos = "🆘";
var up = "🆙";
var vs = "🆚";
var koko = "🈁";
var sa = "🈂️";
var ideograph_advantage = "🉐";
var accept = "🉑";
var congratulations = "㊗️";
var secret = "㊙️";
var u6e80 = "🈵";
var red_circle = "🔴";
var orange_circle = "🟠";
var yellow_circle = "🟡";
var green_circle = "🟢";
var large_blue_circle = "🔵";
var purple_circle = "🟣";
var brown_circle = "🟤";
var black_circle = "⚫";
var white_circle = "⚪";
var red_square = "🟥";
var orange_square = "🟧";
var yellow_square = "🟨";
var green_square = "🟩";
var blue_square = "🟦";
var purple_square = "🟪";
var brown_square = "🟫";
var black_large_square = "⬛";
var white_large_square = "⬜";
var black_medium_square = "◼️";
var white_medium_square = "◻️";
var black_medium_small_square = "◾";
var white_medium_small_square = "◽";
var black_small_square = "▪️";
var white_small_square = "▫️";
var large_orange_diamond = "🔶";
var large_blue_diamond = "🔷";
var small_orange_diamond = "🔸";
var small_blue_diamond = "🔹";
var small_red_triangle = "🔺";
var small_red_triangle_down = "🔻";
var diamond_shape_with_a_dot_inside = "💠";
var radio_button = "🔘";
var white_square_button = "🔳";
var black_square_button = "🔲";
var checkered_flag = "🏁";
var triangular_flag_on_post = "🚩";
var crossed_flags = "🎌";
var black_flag = "🏴";
var white_flag = "🏳️";
var rainbow_flag = "🏳️‍🌈";
var transgender_flag = "🏳️‍⚧️";
var pirate_flag = "🏴‍☠️";
var ascension_island = "🇦🇨";
var andorra = "🇦🇩";
var united_arab_emirates = "🇦🇪";
var afghanistan = "🇦🇫";
var antigua_barbuda = "🇦🇬";
var anguilla = "🇦🇮";
var albania = "🇦🇱";
var armenia = "🇦🇲";
var angola = "🇦🇴";
var antarctica = "🇦🇶";
var argentina = "🇦🇷";
var american_samoa = "🇦🇸";
var austria = "🇦🇹";
var australia = "🇦🇺";
var aruba = "🇦🇼";
var aland_islands = "🇦🇽";
var azerbaijan = "🇦🇿";
var bosnia_herzegovina = "🇧🇦";
var barbados = "🇧🇧";
var bangladesh = "🇧🇩";
var belgium = "🇧🇪";
var burkina_faso = "🇧🇫";
var bulgaria = "🇧🇬";
var bahrain = "🇧🇭";
var burundi = "🇧🇮";
var benin = "🇧🇯";
var st_barthelemy = "🇧🇱";
var bermuda = "🇧🇲";
var brunei = "🇧🇳";
var bolivia = "🇧🇴";
var caribbean_netherlands = "🇧🇶";
var brazil = "🇧🇷";
var bahamas = "🇧🇸";
var bhutan = "🇧🇹";
var bouvet_island = "🇧🇻";
var botswana = "🇧🇼";
var belarus = "🇧🇾";
var belize = "🇧🇿";
var canada = "🇨🇦";
var cocos_islands = "🇨🇨";
var congo_kinshasa = "🇨🇩";
var central_african_republic = "🇨🇫";
var congo_brazzaville = "🇨🇬";
var switzerland = "🇨🇭";
var cote_divoire = "🇨🇮";
var cook_islands = "🇨🇰";
var chile = "🇨🇱";
var cameroon = "🇨🇲";
var cn = "🇨🇳";
var colombia = "🇨🇴";
var clipperton_island = "🇨🇵";
var costa_rica = "🇨🇷";
var cuba = "🇨🇺";
var cape_verde = "🇨🇻";
var curacao = "🇨🇼";
var christmas_island = "🇨🇽";
var cyprus = "🇨🇾";
var czech_republic = "🇨🇿";
var de = "🇩🇪";
var diego_garcia = "🇩🇬";
var djibouti = "🇩🇯";
var denmark = "🇩🇰";
var dominica = "🇩🇲";
var dominican_republic = "🇩🇴";
var algeria = "🇩🇿";
var ceuta_melilla = "🇪🇦";
var ecuador = "🇪🇨";
var estonia = "🇪🇪";
var egypt = "🇪🇬";
var western_sahara = "🇪🇭";
var eritrea = "🇪🇷";
var es = "🇪🇸";
var ethiopia = "🇪🇹";
var eu = "🇪🇺";
var european_union = "🇪🇺";
var finland = "🇫🇮";
var fiji = "🇫🇯";
var falkland_islands = "🇫🇰";
var micronesia = "🇫🇲";
var faroe_islands = "🇫🇴";
var fr = "🇫🇷";
var gabon = "🇬🇦";
var gb = "🇬🇧";
var uk = "🇬🇧";
var grenada = "🇬🇩";
var georgia = "🇬🇪";
var french_guiana = "🇬🇫";
var guernsey = "🇬🇬";
var ghana = "🇬🇭";
var gibraltar = "🇬🇮";
var greenland = "🇬🇱";
var gambia = "🇬🇲";
var guinea = "🇬🇳";
var guadeloupe = "🇬🇵";
var equatorial_guinea = "🇬🇶";
var greece = "🇬🇷";
var south_georgia_south_sandwich_islands = "🇬🇸";
var guatemala = "🇬🇹";
var guam = "🇬🇺";
var guinea_bissau = "🇬🇼";
var guyana = "🇬🇾";
var hong_kong = "🇭🇰";
var heard_mcdonald_islands = "🇭🇲";
var honduras = "🇭🇳";
var croatia = "🇭🇷";
var haiti = "🇭🇹";
var hungary = "🇭🇺";
var canary_islands = "🇮🇨";
var indonesia = "🇮🇩";
var ireland = "🇮🇪";
var israel = "🇮🇱";
var isle_of_man = "🇮🇲";
var india = "🇮🇳";
var british_indian_ocean_territory = "🇮🇴";
var iraq = "🇮🇶";
var iran = "🇮🇷";
var iceland = "🇮🇸";
var it = "🇮🇹";
var jersey = "🇯🇪";
var jamaica = "🇯🇲";
var jordan = "🇯🇴";
var jp = "🇯🇵";
var kenya = "🇰🇪";
var kyrgyzstan = "🇰🇬";
var cambodia = "🇰🇭";
var kiribati = "🇰🇮";
var comoros = "🇰🇲";
var st_kitts_nevis = "🇰🇳";
var north_korea = "🇰🇵";
var kr = "🇰🇷";
var kuwait = "🇰🇼";
var cayman_islands = "🇰🇾";
var kazakhstan = "🇰🇿";
var laos = "🇱🇦";
var lebanon = "🇱🇧";
var st_lucia = "🇱🇨";
var liechtenstein = "🇱🇮";
var sri_lanka = "🇱🇰";
var liberia = "🇱🇷";
var lesotho = "🇱🇸";
var lithuania = "🇱🇹";
var luxembourg = "🇱🇺";
var latvia = "🇱🇻";
var libya = "🇱🇾";
var morocco = "🇲🇦";
var monaco = "🇲🇨";
var moldova = "🇲🇩";
var montenegro = "🇲🇪";
var st_martin = "🇲🇫";
var madagascar = "🇲🇬";
var marshall_islands = "🇲🇭";
var macedonia = "🇲🇰";
var mali = "🇲🇱";
var myanmar = "🇲🇲";
var mongolia = "🇲🇳";
var macau = "🇲🇴";
var northern_mariana_islands = "🇲🇵";
var martinique = "🇲🇶";
var mauritania = "🇲🇷";
var montserrat = "🇲🇸";
var malta = "🇲🇹";
var mauritius = "🇲🇺";
var maldives = "🇲🇻";
var malawi = "🇲🇼";
var mexico = "🇲🇽";
var malaysia = "🇲🇾";
var mozambique = "🇲🇿";
var namibia = "🇳🇦";
var new_caledonia = "🇳🇨";
var niger = "🇳🇪";
var norfolk_island = "🇳🇫";
var nigeria = "🇳🇬";
var nicaragua = "🇳🇮";
var netherlands = "🇳🇱";
var norway = "🇳🇴";
var nepal = "🇳🇵";
var nauru = "🇳🇷";
var niue = "🇳🇺";
var new_zealand = "🇳🇿";
var oman = "🇴🇲";
var panama = "🇵🇦";
var peru = "🇵🇪";
var french_polynesia = "🇵🇫";
var papua_new_guinea = "🇵🇬";
var philippines = "🇵🇭";
var pakistan = "🇵🇰";
var poland = "🇵🇱";
var st_pierre_miquelon = "🇵🇲";
var pitcairn_islands = "🇵🇳";
var puerto_rico = "🇵🇷";
var palestinian_territories = "🇵🇸";
var portugal = "🇵🇹";
var palau = "🇵🇼";
var paraguay = "🇵🇾";
var qatar = "🇶🇦";
var reunion = "🇷🇪";
var romania = "🇷🇴";
var serbia = "🇷🇸";
var ru = "🇷🇺";
var rwanda = "🇷🇼";
var saudi_arabia = "🇸🇦";
var solomon_islands = "🇸🇧";
var seychelles = "🇸🇨";
var sudan = "🇸🇩";
var sweden = "🇸🇪";
var singapore = "🇸🇬";
var st_helena = "🇸🇭";
var slovenia = "🇸🇮";
var svalbard_jan_mayen = "🇸🇯";
var slovakia = "🇸🇰";
var sierra_leone = "🇸🇱";
var san_marino = "🇸🇲";
var senegal = "🇸🇳";
var somalia = "🇸🇴";
var suriname = "🇸🇷";
var south_sudan = "🇸🇸";
var sao_tome_principe = "🇸🇹";
var el_salvador = "🇸🇻";
var sint_maarten = "🇸🇽";
var syria = "🇸🇾";
var swaziland = "🇸🇿";
var tristan_da_cunha = "🇹🇦";
var turks_caicos_islands = "🇹🇨";
var chad = "🇹🇩";
var french_southern_territories = "🇹🇫";
var togo = "🇹🇬";
var thailand = "🇹🇭";
var tajikistan = "🇹🇯";
var tokelau = "🇹🇰";
var timor_leste = "🇹🇱";
var turkmenistan = "🇹🇲";
var tunisia = "🇹🇳";
var tonga = "🇹🇴";
var tr = "🇹🇷";
var trinidad_tobago = "🇹🇹";
var tuvalu = "🇹🇻";
var taiwan = "🇹🇼";
var tanzania = "🇹🇿";
var ukraine = "🇺🇦";
var uganda = "🇺🇬";
var us_outlying_islands = "🇺🇲";
var united_nations = "🇺🇳";
var us = "🇺🇸";
var uruguay = "🇺🇾";
var uzbekistan = "🇺🇿";
var vatican_city = "🇻🇦";
var st_vincent_grenadines = "🇻🇨";
var venezuela = "🇻🇪";
var british_virgin_islands = "🇻🇬";
var us_virgin_islands = "🇻🇮";
var vietnam = "🇻🇳";
var vanuatu = "🇻🇺";
var wallis_futuna = "🇼🇫";
var samoa = "🇼🇸";
var kosovo = "🇽🇰";
var yemen = "🇾🇪";
var mayotte = "🇾🇹";
var south_africa = "🇿🇦";
var zambia = "🇿🇲";
var zimbabwe = "🇿🇼";
var england = "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
var scotland = "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
var wales = "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
var require$$0 = {
	"100": "💯",
	"1234": "🔢",
	grinning: grinning,
	smiley: smiley,
	smile: smile,
	grin: grin,
	laughing: laughing,
	satisfied: satisfied,
	sweat_smile: sweat_smile,
	rofl: rofl,
	joy: joy,
	slightly_smiling_face: slightly_smiling_face,
	upside_down_face: upside_down_face,
	wink: wink,
	blush: blush,
	innocent: innocent,
	smiling_face_with_three_hearts: smiling_face_with_three_hearts,
	heart_eyes: heart_eyes,
	star_struck: star_struck,
	kissing_heart: kissing_heart,
	kissing: kissing,
	relaxed: relaxed,
	kissing_closed_eyes: kissing_closed_eyes,
	kissing_smiling_eyes: kissing_smiling_eyes,
	smiling_face_with_tear: smiling_face_with_tear,
	yum: yum,
	stuck_out_tongue: stuck_out_tongue,
	stuck_out_tongue_winking_eye: stuck_out_tongue_winking_eye,
	zany_face: zany_face,
	stuck_out_tongue_closed_eyes: stuck_out_tongue_closed_eyes,
	money_mouth_face: money_mouth_face,
	hugs: hugs,
	hand_over_mouth: hand_over_mouth,
	shushing_face: shushing_face,
	thinking: thinking,
	zipper_mouth_face: zipper_mouth_face,
	raised_eyebrow: raised_eyebrow,
	neutral_face: neutral_face,
	expressionless: expressionless,
	no_mouth: no_mouth,
	smirk: smirk,
	unamused: unamused,
	roll_eyes: roll_eyes,
	grimacing: grimacing,
	lying_face: lying_face,
	relieved: relieved,
	pensive: pensive,
	sleepy: sleepy,
	drooling_face: drooling_face,
	sleeping: sleeping,
	mask: mask,
	face_with_thermometer: face_with_thermometer,
	face_with_head_bandage: face_with_head_bandage,
	nauseated_face: nauseated_face,
	vomiting_face: vomiting_face,
	sneezing_face: sneezing_face,
	hot_face: hot_face,
	cold_face: cold_face,
	woozy_face: woozy_face,
	dizzy_face: dizzy_face,
	exploding_head: exploding_head,
	cowboy_hat_face: cowboy_hat_face,
	partying_face: partying_face,
	disguised_face: disguised_face,
	sunglasses: sunglasses,
	nerd_face: nerd_face,
	monocle_face: monocle_face,
	confused: confused,
	worried: worried,
	slightly_frowning_face: slightly_frowning_face,
	frowning_face: frowning_face,
	open_mouth: open_mouth,
	hushed: hushed,
	astonished: astonished,
	flushed: flushed,
	pleading_face: pleading_face,
	frowning: frowning,
	anguished: anguished,
	fearful: fearful,
	cold_sweat: cold_sweat,
	disappointed_relieved: disappointed_relieved,
	cry: cry,
	sob: sob,
	scream: scream,
	confounded: confounded,
	persevere: persevere,
	disappointed: disappointed,
	sweat: sweat,
	weary: weary,
	tired_face: tired_face,
	yawning_face: yawning_face,
	triumph: triumph,
	rage: rage,
	pout: pout,
	angry: angry,
	cursing_face: cursing_face,
	smiling_imp: smiling_imp,
	imp: imp,
	skull: skull,
	skull_and_crossbones: skull_and_crossbones,
	hankey: hankey,
	poop: poop,
	shit: shit,
	clown_face: clown_face,
	japanese_ogre: japanese_ogre,
	japanese_goblin: japanese_goblin,
	ghost: ghost,
	alien: alien,
	space_invader: space_invader,
	robot: robot,
	smiley_cat: smiley_cat,
	smile_cat: smile_cat,
	joy_cat: joy_cat,
	heart_eyes_cat: heart_eyes_cat,
	smirk_cat: smirk_cat,
	kissing_cat: kissing_cat,
	scream_cat: scream_cat,
	crying_cat_face: crying_cat_face,
	pouting_cat: pouting_cat,
	see_no_evil: see_no_evil,
	hear_no_evil: hear_no_evil,
	speak_no_evil: speak_no_evil,
	kiss: kiss,
	love_letter: love_letter,
	cupid: cupid,
	gift_heart: gift_heart,
	sparkling_heart: sparkling_heart,
	heartpulse: heartpulse,
	heartbeat: heartbeat,
	revolving_hearts: revolving_hearts,
	two_hearts: two_hearts,
	heart_decoration: heart_decoration,
	heavy_heart_exclamation: heavy_heart_exclamation,
	broken_heart: broken_heart,
	heart: heart,
	orange_heart: orange_heart,
	yellow_heart: yellow_heart,
	green_heart: green_heart,
	blue_heart: blue_heart,
	purple_heart: purple_heart,
	brown_heart: brown_heart,
	black_heart: black_heart,
	white_heart: white_heart,
	anger: anger,
	boom: boom,
	collision: collision,
	dizzy: dizzy,
	sweat_drops: sweat_drops,
	dash: dash,
	hole: hole,
	bomb: bomb,
	speech_balloon: speech_balloon,
	eye_speech_bubble: eye_speech_bubble,
	left_speech_bubble: left_speech_bubble,
	right_anger_bubble: right_anger_bubble,
	thought_balloon: thought_balloon,
	zzz: zzz,
	wave: wave,
	raised_back_of_hand: raised_back_of_hand,
	raised_hand_with_fingers_splayed: raised_hand_with_fingers_splayed,
	hand: hand,
	raised_hand: raised_hand,
	vulcan_salute: vulcan_salute,
	ok_hand: ok_hand,
	pinched_fingers: pinched_fingers,
	pinching_hand: pinching_hand,
	v: v,
	crossed_fingers: crossed_fingers,
	love_you_gesture: love_you_gesture,
	metal: metal,
	call_me_hand: call_me_hand,
	point_left: point_left,
	point_right: point_right,
	point_up_2: point_up_2,
	middle_finger: middle_finger,
	fu: fu,
	point_down: point_down,
	point_up: point_up,
	"+1": "👍",
	thumbsup: thumbsup,
	"-1": "👎",
	thumbsdown: thumbsdown,
	fist_raised: fist_raised,
	fist: fist,
	fist_oncoming: fist_oncoming,
	facepunch: facepunch,
	punch: punch,
	fist_left: fist_left,
	fist_right: fist_right,
	clap: clap,
	raised_hands: raised_hands,
	open_hands: open_hands,
	palms_up_together: palms_up_together,
	handshake: handshake,
	pray: pray,
	writing_hand: writing_hand,
	nail_care: nail_care,
	selfie: selfie,
	muscle: muscle,
	mechanical_arm: mechanical_arm,
	mechanical_leg: mechanical_leg,
	leg: leg,
	foot: foot,
	ear: ear,
	ear_with_hearing_aid: ear_with_hearing_aid,
	nose: nose,
	brain: brain,
	anatomical_heart: anatomical_heart,
	lungs: lungs,
	tooth: tooth,
	bone: bone,
	eyes: eyes,
	eye: eye,
	tongue: tongue,
	lips: lips,
	baby: baby,
	child: child,
	boy: boy,
	girl: girl,
	adult: adult,
	blond_haired_person: blond_haired_person,
	man: man,
	bearded_person: bearded_person,
	red_haired_man: red_haired_man,
	curly_haired_man: curly_haired_man,
	white_haired_man: white_haired_man,
	bald_man: bald_man,
	woman: woman,
	red_haired_woman: red_haired_woman,
	person_red_hair: person_red_hair,
	curly_haired_woman: curly_haired_woman,
	person_curly_hair: person_curly_hair,
	white_haired_woman: white_haired_woman,
	person_white_hair: person_white_hair,
	bald_woman: bald_woman,
	person_bald: person_bald,
	blond_haired_woman: blond_haired_woman,
	blonde_woman: blonde_woman,
	blond_haired_man: blond_haired_man,
	older_adult: older_adult,
	older_man: older_man,
	older_woman: older_woman,
	frowning_person: frowning_person,
	frowning_man: frowning_man,
	frowning_woman: frowning_woman,
	pouting_face: pouting_face,
	pouting_man: pouting_man,
	pouting_woman: pouting_woman,
	no_good: no_good,
	no_good_man: no_good_man,
	ng_man: ng_man,
	no_good_woman: no_good_woman,
	ng_woman: ng_woman,
	ok_person: ok_person,
	ok_man: ok_man,
	ok_woman: ok_woman,
	tipping_hand_person: tipping_hand_person,
	information_desk_person: information_desk_person,
	tipping_hand_man: tipping_hand_man,
	sassy_man: sassy_man,
	tipping_hand_woman: tipping_hand_woman,
	sassy_woman: sassy_woman,
	raising_hand: raising_hand,
	raising_hand_man: raising_hand_man,
	raising_hand_woman: raising_hand_woman,
	deaf_person: deaf_person,
	deaf_man: deaf_man,
	deaf_woman: deaf_woman,
	bow: bow,
	bowing_man: bowing_man,
	bowing_woman: bowing_woman,
	facepalm: facepalm,
	man_facepalming: man_facepalming,
	woman_facepalming: woman_facepalming,
	shrug: shrug,
	man_shrugging: man_shrugging,
	woman_shrugging: woman_shrugging,
	health_worker: health_worker,
	man_health_worker: man_health_worker,
	woman_health_worker: woman_health_worker,
	student: student,
	man_student: man_student,
	woman_student: woman_student,
	teacher: teacher,
	man_teacher: man_teacher,
	woman_teacher: woman_teacher,
	judge: judge,
	man_judge: man_judge,
	woman_judge: woman_judge,
	farmer: farmer,
	man_farmer: man_farmer,
	woman_farmer: woman_farmer,
	cook: cook,
	man_cook: man_cook,
	woman_cook: woman_cook,
	mechanic: mechanic,
	man_mechanic: man_mechanic,
	woman_mechanic: woman_mechanic,
	factory_worker: factory_worker,
	man_factory_worker: man_factory_worker,
	woman_factory_worker: woman_factory_worker,
	office_worker: office_worker,
	man_office_worker: man_office_worker,
	woman_office_worker: woman_office_worker,
	scientist: scientist,
	man_scientist: man_scientist,
	woman_scientist: woman_scientist,
	technologist: technologist,
	man_technologist: man_technologist,
	woman_technologist: woman_technologist,
	singer: singer,
	man_singer: man_singer,
	woman_singer: woman_singer,
	artist: artist,
	man_artist: man_artist,
	woman_artist: woman_artist,
	pilot: pilot,
	man_pilot: man_pilot,
	woman_pilot: woman_pilot,
	astronaut: astronaut,
	man_astronaut: man_astronaut,
	woman_astronaut: woman_astronaut,
	firefighter: firefighter,
	man_firefighter: man_firefighter,
	woman_firefighter: woman_firefighter,
	police_officer: police_officer,
	cop: cop,
	policeman: policeman,
	policewoman: policewoman,
	detective: detective,
	male_detective: male_detective,
	female_detective: female_detective,
	guard: guard,
	guardsman: guardsman,
	guardswoman: guardswoman,
	ninja: ninja,
	construction_worker: construction_worker,
	construction_worker_man: construction_worker_man,
	construction_worker_woman: construction_worker_woman,
	prince: prince,
	princess: princess,
	person_with_turban: person_with_turban,
	man_with_turban: man_with_turban,
	woman_with_turban: woman_with_turban,
	man_with_gua_pi_mao: man_with_gua_pi_mao,
	woman_with_headscarf: woman_with_headscarf,
	person_in_tuxedo: person_in_tuxedo,
	man_in_tuxedo: man_in_tuxedo,
	woman_in_tuxedo: woman_in_tuxedo,
	person_with_veil: person_with_veil,
	man_with_veil: man_with_veil,
	woman_with_veil: woman_with_veil,
	bride_with_veil: bride_with_veil,
	pregnant_woman: pregnant_woman,
	breast_feeding: breast_feeding,
	woman_feeding_baby: woman_feeding_baby,
	man_feeding_baby: man_feeding_baby,
	person_feeding_baby: person_feeding_baby,
	angel: angel,
	santa: santa,
	mrs_claus: mrs_claus,
	mx_claus: mx_claus,
	superhero: superhero,
	superhero_man: superhero_man,
	superhero_woman: superhero_woman,
	supervillain: supervillain,
	supervillain_man: supervillain_man,
	supervillain_woman: supervillain_woman,
	mage: mage,
	mage_man: mage_man,
	mage_woman: mage_woman,
	fairy: fairy,
	fairy_man: fairy_man,
	fairy_woman: fairy_woman,
	vampire: vampire,
	vampire_man: vampire_man,
	vampire_woman: vampire_woman,
	merperson: merperson,
	merman: merman,
	mermaid: mermaid,
	elf: elf,
	elf_man: elf_man,
	elf_woman: elf_woman,
	genie: genie,
	genie_man: genie_man,
	genie_woman: genie_woman,
	zombie: zombie,
	zombie_man: zombie_man,
	zombie_woman: zombie_woman,
	massage: massage,
	massage_man: massage_man,
	massage_woman: massage_woman,
	haircut: haircut,
	haircut_man: haircut_man,
	haircut_woman: haircut_woman,
	walking: walking,
	walking_man: walking_man,
	walking_woman: walking_woman,
	standing_person: standing_person,
	standing_man: standing_man,
	standing_woman: standing_woman,
	kneeling_person: kneeling_person,
	kneeling_man: kneeling_man,
	kneeling_woman: kneeling_woman,
	person_with_probing_cane: person_with_probing_cane,
	man_with_probing_cane: man_with_probing_cane,
	woman_with_probing_cane: woman_with_probing_cane,
	person_in_motorized_wheelchair: person_in_motorized_wheelchair,
	man_in_motorized_wheelchair: man_in_motorized_wheelchair,
	woman_in_motorized_wheelchair: woman_in_motorized_wheelchair,
	person_in_manual_wheelchair: person_in_manual_wheelchair,
	man_in_manual_wheelchair: man_in_manual_wheelchair,
	woman_in_manual_wheelchair: woman_in_manual_wheelchair,
	runner: runner,
	running: running,
	running_man: running_man,
	running_woman: running_woman,
	woman_dancing: woman_dancing,
	dancer: dancer,
	man_dancing: man_dancing,
	business_suit_levitating: business_suit_levitating,
	dancers: dancers,
	dancing_men: dancing_men,
	dancing_women: dancing_women,
	sauna_person: sauna_person,
	sauna_man: sauna_man,
	sauna_woman: sauna_woman,
	climbing: climbing,
	climbing_man: climbing_man,
	climbing_woman: climbing_woman,
	person_fencing: person_fencing,
	horse_racing: horse_racing,
	skier: skier,
	snowboarder: snowboarder,
	golfing: golfing,
	golfing_man: golfing_man,
	golfing_woman: golfing_woman,
	surfer: surfer,
	surfing_man: surfing_man,
	surfing_woman: surfing_woman,
	rowboat: rowboat,
	rowing_man: rowing_man,
	rowing_woman: rowing_woman,
	swimmer: swimmer,
	swimming_man: swimming_man,
	swimming_woman: swimming_woman,
	bouncing_ball_person: bouncing_ball_person,
	bouncing_ball_man: bouncing_ball_man,
	basketball_man: basketball_man,
	bouncing_ball_woman: bouncing_ball_woman,
	basketball_woman: basketball_woman,
	weight_lifting: weight_lifting,
	weight_lifting_man: weight_lifting_man,
	weight_lifting_woman: weight_lifting_woman,
	bicyclist: bicyclist,
	biking_man: biking_man,
	biking_woman: biking_woman,
	mountain_bicyclist: mountain_bicyclist,
	mountain_biking_man: mountain_biking_man,
	mountain_biking_woman: mountain_biking_woman,
	cartwheeling: cartwheeling,
	man_cartwheeling: man_cartwheeling,
	woman_cartwheeling: woman_cartwheeling,
	wrestling: wrestling,
	men_wrestling: men_wrestling,
	women_wrestling: women_wrestling,
	water_polo: water_polo,
	man_playing_water_polo: man_playing_water_polo,
	woman_playing_water_polo: woman_playing_water_polo,
	handball_person: handball_person,
	man_playing_handball: man_playing_handball,
	woman_playing_handball: woman_playing_handball,
	juggling_person: juggling_person,
	man_juggling: man_juggling,
	woman_juggling: woman_juggling,
	lotus_position: lotus_position,
	lotus_position_man: lotus_position_man,
	lotus_position_woman: lotus_position_woman,
	bath: bath,
	sleeping_bed: sleeping_bed,
	people_holding_hands: people_holding_hands,
	two_women_holding_hands: two_women_holding_hands,
	couple: couple,
	two_men_holding_hands: two_men_holding_hands,
	couplekiss: couplekiss,
	couplekiss_man_woman: couplekiss_man_woman,
	couplekiss_man_man: couplekiss_man_man,
	couplekiss_woman_woman: couplekiss_woman_woman,
	couple_with_heart: couple_with_heart,
	couple_with_heart_woman_man: couple_with_heart_woman_man,
	couple_with_heart_man_man: couple_with_heart_man_man,
	couple_with_heart_woman_woman: couple_with_heart_woman_woman,
	family: family,
	family_man_woman_boy: family_man_woman_boy,
	family_man_woman_girl: family_man_woman_girl,
	family_man_woman_girl_boy: family_man_woman_girl_boy,
	family_man_woman_boy_boy: family_man_woman_boy_boy,
	family_man_woman_girl_girl: family_man_woman_girl_girl,
	family_man_man_boy: family_man_man_boy,
	family_man_man_girl: family_man_man_girl,
	family_man_man_girl_boy: family_man_man_girl_boy,
	family_man_man_boy_boy: family_man_man_boy_boy,
	family_man_man_girl_girl: family_man_man_girl_girl,
	family_woman_woman_boy: family_woman_woman_boy,
	family_woman_woman_girl: family_woman_woman_girl,
	family_woman_woman_girl_boy: family_woman_woman_girl_boy,
	family_woman_woman_boy_boy: family_woman_woman_boy_boy,
	family_woman_woman_girl_girl: family_woman_woman_girl_girl,
	family_man_boy: family_man_boy,
	family_man_boy_boy: family_man_boy_boy,
	family_man_girl: family_man_girl,
	family_man_girl_boy: family_man_girl_boy,
	family_man_girl_girl: family_man_girl_girl,
	family_woman_boy: family_woman_boy,
	family_woman_boy_boy: family_woman_boy_boy,
	family_woman_girl: family_woman_girl,
	family_woman_girl_boy: family_woman_girl_boy,
	family_woman_girl_girl: family_woman_girl_girl,
	speaking_head: speaking_head,
	bust_in_silhouette: bust_in_silhouette,
	busts_in_silhouette: busts_in_silhouette,
	people_hugging: people_hugging,
	footprints: footprints,
	monkey_face: monkey_face,
	monkey: monkey,
	gorilla: gorilla,
	orangutan: orangutan,
	dog: dog,
	dog2: dog2,
	guide_dog: guide_dog,
	service_dog: service_dog,
	poodle: poodle,
	wolf: wolf,
	fox_face: fox_face,
	raccoon: raccoon,
	cat: cat,
	cat2: cat2,
	black_cat: black_cat,
	lion: lion,
	tiger: tiger,
	tiger2: tiger2,
	leopard: leopard,
	horse: horse,
	racehorse: racehorse,
	unicorn: unicorn,
	zebra: zebra,
	deer: deer,
	bison: bison,
	cow: cow,
	ox: ox,
	water_buffalo: water_buffalo,
	cow2: cow2,
	pig: pig,
	pig2: pig2,
	boar: boar,
	pig_nose: pig_nose,
	ram: ram,
	sheep: sheep,
	goat: goat,
	dromedary_camel: dromedary_camel,
	camel: camel,
	llama: llama,
	giraffe: giraffe,
	elephant: elephant,
	mammoth: mammoth,
	rhinoceros: rhinoceros,
	hippopotamus: hippopotamus,
	mouse: mouse,
	mouse2: mouse2,
	rat: rat,
	hamster: hamster,
	rabbit: rabbit,
	rabbit2: rabbit2,
	chipmunk: chipmunk,
	beaver: beaver,
	hedgehog: hedgehog,
	bat: bat,
	bear: bear,
	polar_bear: polar_bear,
	koala: koala,
	panda_face: panda_face,
	sloth: sloth,
	otter: otter,
	skunk: skunk,
	kangaroo: kangaroo,
	badger: badger,
	feet: feet,
	paw_prints: paw_prints,
	turkey: turkey,
	chicken: chicken,
	rooster: rooster,
	hatching_chick: hatching_chick,
	baby_chick: baby_chick,
	hatched_chick: hatched_chick,
	bird: bird,
	penguin: penguin,
	dove: dove,
	eagle: eagle,
	duck: duck,
	swan: swan,
	owl: owl,
	dodo: dodo,
	feather: feather,
	flamingo: flamingo,
	peacock: peacock,
	parrot: parrot,
	frog: frog,
	crocodile: crocodile,
	turtle: turtle,
	lizard: lizard,
	snake: snake,
	dragon_face: dragon_face,
	dragon: dragon,
	sauropod: sauropod,
	"t-rex": "🦖",
	whale: whale,
	whale2: whale2,
	dolphin: dolphin,
	flipper: flipper,
	seal: seal,
	fish: fish,
	tropical_fish: tropical_fish,
	blowfish: blowfish,
	shark: shark,
	octopus: octopus,
	shell: shell$1,
	snail: snail,
	butterfly: butterfly,
	bug: bug,
	ant: ant,
	bee: bee,
	honeybee: honeybee,
	beetle: beetle,
	lady_beetle: lady_beetle,
	cricket: cricket,
	cockroach: cockroach,
	spider: spider,
	spider_web: spider_web,
	scorpion: scorpion,
	mosquito: mosquito,
	fly: fly,
	worm: worm,
	microbe: microbe,
	bouquet: bouquet,
	cherry_blossom: cherry_blossom,
	white_flower: white_flower,
	rosette: rosette,
	rose: rose,
	wilted_flower: wilted_flower,
	hibiscus: hibiscus,
	sunflower: sunflower,
	blossom: blossom,
	tulip: tulip,
	seedling: seedling,
	potted_plant: potted_plant,
	evergreen_tree: evergreen_tree,
	deciduous_tree: deciduous_tree,
	palm_tree: palm_tree,
	cactus: cactus,
	ear_of_rice: ear_of_rice,
	herb: herb,
	shamrock: shamrock,
	four_leaf_clover: four_leaf_clover,
	maple_leaf: maple_leaf,
	fallen_leaf: fallen_leaf,
	leaves: leaves,
	grapes: grapes,
	melon: melon,
	watermelon: watermelon,
	tangerine: tangerine,
	orange: orange,
	mandarin: mandarin,
	lemon: lemon,
	banana: banana,
	pineapple: pineapple,
	mango: mango,
	apple: apple,
	green_apple: green_apple,
	pear: pear,
	peach: peach,
	cherries: cherries,
	strawberry: strawberry,
	blueberries: blueberries,
	kiwi_fruit: kiwi_fruit,
	tomato: tomato,
	olive: olive,
	coconut: coconut,
	avocado: avocado,
	eggplant: eggplant,
	potato: potato,
	carrot: carrot,
	corn: corn,
	hot_pepper: hot_pepper,
	bell_pepper: bell_pepper,
	cucumber: cucumber,
	leafy_green: leafy_green,
	broccoli: broccoli,
	garlic: garlic,
	onion: onion,
	mushroom: mushroom,
	peanuts: peanuts,
	chestnut: chestnut,
	bread: bread,
	croissant: croissant,
	baguette_bread: baguette_bread,
	flatbread: flatbread,
	pretzel: pretzel,
	bagel: bagel,
	pancakes: pancakes,
	waffle: waffle,
	cheese: cheese,
	meat_on_bone: meat_on_bone,
	poultry_leg: poultry_leg,
	cut_of_meat: cut_of_meat,
	bacon: bacon,
	hamburger: hamburger,
	fries: fries,
	pizza: pizza,
	hotdog: hotdog,
	sandwich: sandwich,
	taco: taco,
	burrito: burrito,
	tamale: tamale,
	stuffed_flatbread: stuffed_flatbread,
	falafel: falafel,
	egg: egg,
	fried_egg: fried_egg,
	shallow_pan_of_food: shallow_pan_of_food,
	stew: stew,
	fondue: fondue,
	bowl_with_spoon: bowl_with_spoon,
	green_salad: green_salad,
	popcorn: popcorn,
	butter: butter,
	salt: salt,
	canned_food: canned_food,
	bento: bento,
	rice_cracker: rice_cracker,
	rice_ball: rice_ball,
	rice: rice,
	curry: curry,
	ramen: ramen,
	spaghetti: spaghetti,
	sweet_potato: sweet_potato,
	oden: oden,
	sushi: sushi,
	fried_shrimp: fried_shrimp,
	fish_cake: fish_cake,
	moon_cake: moon_cake,
	dango: dango,
	dumpling: dumpling,
	fortune_cookie: fortune_cookie,
	takeout_box: takeout_box,
	crab: crab,
	lobster: lobster,
	shrimp: shrimp,
	squid: squid,
	oyster: oyster,
	icecream: icecream,
	shaved_ice: shaved_ice,
	ice_cream: ice_cream,
	doughnut: doughnut,
	cookie: cookie,
	birthday: birthday,
	cake: cake,
	cupcake: cupcake,
	pie: pie,
	chocolate_bar: chocolate_bar,
	candy: candy,
	lollipop: lollipop,
	custard: custard,
	honey_pot: honey_pot,
	baby_bottle: baby_bottle,
	milk_glass: milk_glass,
	coffee: coffee,
	teapot: teapot,
	tea: tea,
	sake: sake,
	champagne: champagne,
	wine_glass: wine_glass,
	cocktail: cocktail,
	tropical_drink: tropical_drink,
	beer: beer,
	beers: beers,
	clinking_glasses: clinking_glasses,
	tumbler_glass: tumbler_glass,
	cup_with_straw: cup_with_straw,
	bubble_tea: bubble_tea,
	beverage_box: beverage_box,
	mate: mate,
	ice_cube: ice_cube,
	chopsticks: chopsticks,
	plate_with_cutlery: plate_with_cutlery,
	fork_and_knife: fork_and_knife,
	spoon: spoon,
	hocho: hocho,
	knife: knife,
	amphora: amphora,
	earth_africa: earth_africa,
	earth_americas: earth_americas,
	earth_asia: earth_asia,
	globe_with_meridians: globe_with_meridians,
	world_map: world_map,
	japan: japan,
	compass: compass,
	mountain_snow: mountain_snow,
	mountain: mountain,
	volcano: volcano,
	mount_fuji: mount_fuji,
	camping: camping,
	beach_umbrella: beach_umbrella,
	desert: desert,
	desert_island: desert_island,
	national_park: national_park,
	stadium: stadium,
	classical_building: classical_building,
	building_construction: building_construction,
	bricks: bricks,
	rock: rock,
	wood: wood,
	hut: hut,
	houses: houses,
	derelict_house: derelict_house,
	house: house,
	house_with_garden: house_with_garden,
	office: office,
	post_office: post_office,
	european_post_office: european_post_office,
	hospital: hospital,
	bank: bank,
	hotel: hotel,
	love_hotel: love_hotel,
	convenience_store: convenience_store,
	school: school,
	department_store: department_store,
	factory: factory,
	japanese_castle: japanese_castle,
	european_castle: european_castle,
	wedding: wedding,
	tokyo_tower: tokyo_tower,
	statue_of_liberty: statue_of_liberty,
	church: church,
	mosque: mosque,
	hindu_temple: hindu_temple,
	synagogue: synagogue,
	shinto_shrine: shinto_shrine,
	kaaba: kaaba,
	fountain: fountain,
	tent: tent,
	foggy: foggy,
	night_with_stars: night_with_stars,
	cityscape: cityscape,
	sunrise_over_mountains: sunrise_over_mountains,
	sunrise: sunrise,
	city_sunset: city_sunset,
	city_sunrise: city_sunrise,
	bridge_at_night: bridge_at_night,
	hotsprings: hotsprings,
	carousel_horse: carousel_horse,
	ferris_wheel: ferris_wheel,
	roller_coaster: roller_coaster,
	barber: barber,
	circus_tent: circus_tent,
	steam_locomotive: steam_locomotive,
	railway_car: railway_car,
	bullettrain_side: bullettrain_side,
	bullettrain_front: bullettrain_front,
	train2: train2,
	metro: metro,
	light_rail: light_rail,
	station: station,
	tram: tram,
	monorail: monorail,
	mountain_railway: mountain_railway,
	train: train,
	bus: bus,
	oncoming_bus: oncoming_bus,
	trolleybus: trolleybus,
	minibus: minibus,
	ambulance: ambulance,
	fire_engine: fire_engine,
	police_car: police_car,
	oncoming_police_car: oncoming_police_car,
	taxi: taxi,
	oncoming_taxi: oncoming_taxi,
	car: car,
	red_car: red_car,
	oncoming_automobile: oncoming_automobile,
	blue_car: blue_car,
	pickup_truck: pickup_truck,
	truck: truck,
	articulated_lorry: articulated_lorry,
	tractor: tractor,
	racing_car: racing_car,
	motorcycle: motorcycle,
	motor_scooter: motor_scooter,
	manual_wheelchair: manual_wheelchair,
	motorized_wheelchair: motorized_wheelchair,
	auto_rickshaw: auto_rickshaw,
	bike: bike,
	kick_scooter: kick_scooter,
	skateboard: skateboard,
	roller_skate: roller_skate,
	busstop: busstop,
	motorway: motorway,
	railway_track: railway_track,
	oil_drum: oil_drum,
	fuelpump: fuelpump,
	rotating_light: rotating_light,
	traffic_light: traffic_light,
	vertical_traffic_light: vertical_traffic_light,
	stop_sign: stop_sign,
	construction: construction,
	anchor: anchor,
	boat: boat,
	sailboat: sailboat,
	canoe: canoe,
	speedboat: speedboat,
	passenger_ship: passenger_ship,
	ferry: ferry,
	motor_boat: motor_boat,
	ship: ship,
	airplane: airplane,
	small_airplane: small_airplane,
	flight_departure: flight_departure,
	flight_arrival: flight_arrival,
	parachute: parachute,
	seat: seat,
	helicopter: helicopter,
	suspension_railway: suspension_railway,
	mountain_cableway: mountain_cableway,
	aerial_tramway: aerial_tramway,
	artificial_satellite: artificial_satellite,
	rocket: rocket,
	flying_saucer: flying_saucer,
	bellhop_bell: bellhop_bell,
	luggage: luggage,
	hourglass: hourglass,
	hourglass_flowing_sand: hourglass_flowing_sand,
	watch: watch,
	alarm_clock: alarm_clock,
	stopwatch: stopwatch,
	timer_clock: timer_clock,
	mantelpiece_clock: mantelpiece_clock,
	clock12: clock12,
	clock1230: clock1230,
	clock1: clock1,
	clock130: clock130,
	clock2: clock2,
	clock230: clock230,
	clock3: clock3,
	clock330: clock330,
	clock4: clock4,
	clock430: clock430,
	clock5: clock5,
	clock530: clock530,
	clock6: clock6,
	clock630: clock630,
	clock7: clock7,
	clock730: clock730,
	clock8: clock8,
	clock830: clock830,
	clock9: clock9,
	clock930: clock930,
	clock10: clock10,
	clock1030: clock1030,
	clock11: clock11,
	clock1130: clock1130,
	new_moon: new_moon,
	waxing_crescent_moon: waxing_crescent_moon,
	first_quarter_moon: first_quarter_moon,
	moon: moon,
	waxing_gibbous_moon: waxing_gibbous_moon,
	full_moon: full_moon,
	waning_gibbous_moon: waning_gibbous_moon,
	last_quarter_moon: last_quarter_moon,
	waning_crescent_moon: waning_crescent_moon,
	crescent_moon: crescent_moon,
	new_moon_with_face: new_moon_with_face,
	first_quarter_moon_with_face: first_quarter_moon_with_face,
	last_quarter_moon_with_face: last_quarter_moon_with_face,
	thermometer: thermometer,
	sunny: sunny,
	full_moon_with_face: full_moon_with_face,
	sun_with_face: sun_with_face,
	ringed_planet: ringed_planet,
	star: star,
	star2: star2,
	stars: stars,
	milky_way: milky_way,
	cloud: cloud,
	partly_sunny: partly_sunny,
	cloud_with_lightning_and_rain: cloud_with_lightning_and_rain,
	sun_behind_small_cloud: sun_behind_small_cloud,
	sun_behind_large_cloud: sun_behind_large_cloud,
	sun_behind_rain_cloud: sun_behind_rain_cloud,
	cloud_with_rain: cloud_with_rain,
	cloud_with_snow: cloud_with_snow,
	cloud_with_lightning: cloud_with_lightning,
	tornado: tornado,
	fog: fog,
	wind_face: wind_face,
	cyclone: cyclone,
	rainbow: rainbow,
	closed_umbrella: closed_umbrella,
	open_umbrella: open_umbrella,
	umbrella: umbrella,
	parasol_on_ground: parasol_on_ground,
	zap: zap,
	snowflake: snowflake,
	snowman_with_snow: snowman_with_snow,
	snowman: snowman,
	comet: comet,
	fire: fire,
	droplet: droplet,
	ocean: ocean,
	jack_o_lantern: jack_o_lantern,
	christmas_tree: christmas_tree,
	fireworks: fireworks,
	sparkler: sparkler,
	firecracker: firecracker,
	sparkles: sparkles,
	balloon: balloon,
	tada: tada,
	confetti_ball: confetti_ball,
	tanabata_tree: tanabata_tree,
	bamboo: bamboo,
	dolls: dolls,
	flags: flags,
	wind_chime: wind_chime,
	rice_scene: rice_scene,
	red_envelope: red_envelope,
	ribbon: ribbon,
	gift: gift,
	reminder_ribbon: reminder_ribbon,
	tickets: tickets,
	ticket: ticket,
	medal_military: medal_military,
	trophy: trophy,
	medal_sports: medal_sports,
	"1st_place_medal": "🥇",
	"2nd_place_medal": "🥈",
	"3rd_place_medal": "🥉",
	soccer: soccer,
	baseball: baseball,
	softball: softball,
	basketball: basketball,
	volleyball: volleyball,
	football: football,
	rugby_football: rugby_football,
	tennis: tennis,
	flying_disc: flying_disc,
	bowling: bowling,
	cricket_game: cricket_game,
	field_hockey: field_hockey,
	ice_hockey: ice_hockey,
	lacrosse: lacrosse,
	ping_pong: ping_pong,
	badminton: badminton,
	boxing_glove: boxing_glove,
	martial_arts_uniform: martial_arts_uniform,
	goal_net: goal_net,
	golf: golf,
	ice_skate: ice_skate,
	fishing_pole_and_fish: fishing_pole_and_fish,
	diving_mask: diving_mask,
	running_shirt_with_sash: running_shirt_with_sash,
	ski: ski,
	sled: sled,
	curling_stone: curling_stone,
	dart: dart$1,
	yo_yo: yo_yo,
	kite: kite,
	"8ball": "🎱",
	crystal_ball: crystal_ball,
	magic_wand: magic_wand,
	nazar_amulet: nazar_amulet,
	video_game: video_game,
	joystick: joystick,
	slot_machine: slot_machine,
	game_die: game_die,
	jigsaw: jigsaw,
	teddy_bear: teddy_bear,
	pinata: pinata,
	nesting_dolls: nesting_dolls,
	spades: spades,
	hearts: hearts,
	diamonds: diamonds,
	clubs: clubs,
	chess_pawn: chess_pawn,
	black_joker: black_joker,
	mahjong: mahjong,
	flower_playing_cards: flower_playing_cards,
	performing_arts: performing_arts,
	framed_picture: framed_picture,
	art: art,
	thread: thread,
	sewing_needle: sewing_needle,
	yarn: yarn,
	knot: knot,
	eyeglasses: eyeglasses,
	dark_sunglasses: dark_sunglasses,
	goggles: goggles,
	lab_coat: lab_coat,
	safety_vest: safety_vest,
	necktie: necktie,
	shirt: shirt,
	tshirt: tshirt,
	jeans: jeans,
	scarf: scarf,
	gloves: gloves,
	coat: coat,
	socks: socks,
	dress: dress,
	kimono: kimono,
	sari: sari,
	one_piece_swimsuit: one_piece_swimsuit,
	swim_brief: swim_brief,
	shorts: shorts,
	bikini: bikini,
	womans_clothes: womans_clothes,
	purse: purse,
	handbag: handbag,
	pouch: pouch,
	shopping: shopping,
	school_satchel: school_satchel,
	thong_sandal: thong_sandal,
	mans_shoe: mans_shoe,
	shoe: shoe,
	athletic_shoe: athletic_shoe,
	hiking_boot: hiking_boot,
	flat_shoe: flat_shoe,
	high_heel: high_heel,
	sandal: sandal,
	ballet_shoes: ballet_shoes,
	boot: boot,
	crown: crown,
	womans_hat: womans_hat,
	tophat: tophat,
	mortar_board: mortar_board,
	billed_cap: billed_cap,
	military_helmet: military_helmet,
	rescue_worker_helmet: rescue_worker_helmet,
	prayer_beads: prayer_beads,
	lipstick: lipstick,
	ring: ring,
	gem: gem,
	mute: mute,
	speaker: speaker,
	sound: sound,
	loud_sound: loud_sound,
	loudspeaker: loudspeaker,
	mega: mega,
	postal_horn: postal_horn,
	bell: bell,
	no_bell: no_bell,
	musical_score: musical_score,
	musical_note: musical_note,
	notes: notes,
	studio_microphone: studio_microphone,
	level_slider: level_slider,
	control_knobs: control_knobs,
	microphone: microphone,
	headphones: headphones,
	radio: radio,
	saxophone: saxophone,
	accordion: accordion,
	guitar: guitar,
	musical_keyboard: musical_keyboard,
	trumpet: trumpet,
	violin: violin,
	banjo: banjo,
	drum: drum,
	long_drum: long_drum,
	iphone: iphone,
	calling: calling,
	phone: phone,
	telephone: telephone,
	telephone_receiver: telephone_receiver,
	pager: pager,
	fax: fax,
	battery: battery,
	electric_plug: electric_plug,
	computer: computer,
	desktop_computer: desktop_computer,
	printer: printer,
	keyboard: keyboard,
	computer_mouse: computer_mouse,
	trackball: trackball,
	minidisc: minidisc,
	floppy_disk: floppy_disk,
	cd: cd,
	dvd: dvd,
	abacus: abacus,
	movie_camera: movie_camera,
	film_strip: film_strip,
	film_projector: film_projector,
	clapper: clapper,
	tv: tv,
	camera: camera,
	camera_flash: camera_flash,
	video_camera: video_camera,
	vhs: vhs,
	mag: mag,
	mag_right: mag_right,
	candle: candle,
	bulb: bulb,
	flashlight: flashlight,
	izakaya_lantern: izakaya_lantern,
	lantern: lantern,
	diya_lamp: diya_lamp,
	notebook_with_decorative_cover: notebook_with_decorative_cover,
	closed_book: closed_book,
	book: book,
	open_book: open_book,
	green_book: green_book,
	blue_book: blue_book,
	orange_book: orange_book,
	books: books,
	notebook: notebook,
	ledger: ledger,
	page_with_curl: page_with_curl,
	scroll: scroll,
	page_facing_up: page_facing_up,
	newspaper: newspaper,
	newspaper_roll: newspaper_roll,
	bookmark_tabs: bookmark_tabs,
	bookmark: bookmark,
	label: label,
	moneybag: moneybag,
	coin: coin,
	yen: yen,
	dollar: dollar,
	euro: euro,
	pound: pound,
	money_with_wings: money_with_wings,
	credit_card: credit_card,
	receipt: receipt,
	chart: chart,
	envelope: envelope,
	email: email,
	"e-mail": "📧",
	incoming_envelope: incoming_envelope,
	envelope_with_arrow: envelope_with_arrow,
	outbox_tray: outbox_tray,
	inbox_tray: inbox_tray,
	"package": "📦",
	mailbox: mailbox,
	mailbox_closed: mailbox_closed,
	mailbox_with_mail: mailbox_with_mail,
	mailbox_with_no_mail: mailbox_with_no_mail,
	postbox: postbox,
	ballot_box: ballot_box,
	pencil2: pencil2,
	black_nib: black_nib,
	fountain_pen: fountain_pen,
	pen: pen,
	paintbrush: paintbrush,
	crayon: crayon,
	memo: memo,
	pencil: pencil,
	briefcase: briefcase,
	file_folder: file_folder,
	open_file_folder: open_file_folder,
	card_index_dividers: card_index_dividers,
	date: date,
	calendar: calendar,
	spiral_notepad: spiral_notepad,
	spiral_calendar: spiral_calendar,
	card_index: card_index,
	chart_with_upwards_trend: chart_with_upwards_trend,
	chart_with_downwards_trend: chart_with_downwards_trend,
	bar_chart: bar_chart,
	clipboard: clipboard,
	pushpin: pushpin,
	round_pushpin: round_pushpin,
	paperclip: paperclip,
	paperclips: paperclips,
	straight_ruler: straight_ruler,
	triangular_ruler: triangular_ruler,
	scissors: scissors,
	card_file_box: card_file_box,
	file_cabinet: file_cabinet,
	wastebasket: wastebasket,
	lock: lock,
	unlock: unlock,
	lock_with_ink_pen: lock_with_ink_pen,
	closed_lock_with_key: closed_lock_with_key,
	key: key,
	old_key: old_key,
	hammer: hammer,
	axe: axe,
	pick: pick,
	hammer_and_pick: hammer_and_pick,
	hammer_and_wrench: hammer_and_wrench,
	dagger: dagger,
	crossed_swords: crossed_swords,
	gun: gun,
	boomerang: boomerang,
	bow_and_arrow: bow_and_arrow,
	shield: shield,
	carpentry_saw: carpentry_saw,
	wrench: wrench,
	screwdriver: screwdriver,
	nut_and_bolt: nut_and_bolt,
	gear: gear,
	clamp: clamp,
	balance_scale: balance_scale,
	probing_cane: probing_cane,
	link: link,
	chains: chains,
	hook: hook,
	toolbox: toolbox,
	magnet: magnet,
	ladder: ladder,
	alembic: alembic,
	test_tube: test_tube,
	petri_dish: petri_dish,
	dna: dna,
	microscope: microscope,
	telescope: telescope,
	satellite: satellite,
	syringe: syringe,
	drop_of_blood: drop_of_blood,
	pill: pill,
	adhesive_bandage: adhesive_bandage,
	stethoscope: stethoscope,
	door: door,
	elevator: elevator,
	mirror: mirror,
	window: window$1,
	bed: bed,
	couch_and_lamp: couch_and_lamp,
	chair: chair,
	toilet: toilet,
	plunger: plunger,
	shower: shower,
	bathtub: bathtub,
	mouse_trap: mouse_trap,
	razor: razor,
	lotion_bottle: lotion_bottle,
	safety_pin: safety_pin,
	broom: broom,
	basket: basket,
	roll_of_paper: roll_of_paper,
	bucket: bucket,
	soap: soap,
	toothbrush: toothbrush,
	sponge: sponge,
	fire_extinguisher: fire_extinguisher,
	shopping_cart: shopping_cart,
	smoking: smoking,
	coffin: coffin,
	headstone: headstone,
	funeral_urn: funeral_urn,
	moyai: moyai,
	placard: placard,
	atm: atm,
	put_litter_in_its_place: put_litter_in_its_place,
	potable_water: potable_water,
	wheelchair: wheelchair,
	mens: mens,
	womens: womens,
	restroom: restroom,
	baby_symbol: baby_symbol,
	wc: wc,
	passport_control: passport_control,
	customs: customs,
	baggage_claim: baggage_claim,
	left_luggage: left_luggage,
	warning: warning,
	children_crossing: children_crossing,
	no_entry: no_entry,
	no_entry_sign: no_entry_sign,
	no_bicycles: no_bicycles,
	no_smoking: no_smoking,
	do_not_litter: do_not_litter,
	"non-potable_water": "🚱",
	no_pedestrians: no_pedestrians,
	no_mobile_phones: no_mobile_phones,
	underage: underage,
	radioactive: radioactive,
	biohazard: biohazard,
	arrow_up: arrow_up,
	arrow_upper_right: arrow_upper_right,
	arrow_right: arrow_right,
	arrow_lower_right: arrow_lower_right,
	arrow_down: arrow_down,
	arrow_lower_left: arrow_lower_left,
	arrow_left: arrow_left,
	arrow_upper_left: arrow_upper_left,
	arrow_up_down: arrow_up_down,
	left_right_arrow: left_right_arrow,
	leftwards_arrow_with_hook: leftwards_arrow_with_hook,
	arrow_right_hook: arrow_right_hook,
	arrow_heading_up: arrow_heading_up,
	arrow_heading_down: arrow_heading_down,
	arrows_clockwise: arrows_clockwise,
	arrows_counterclockwise: arrows_counterclockwise,
	back: back,
	end: end,
	on: on,
	soon: soon,
	top: top,
	place_of_worship: place_of_worship,
	atom_symbol: atom_symbol,
	om: om,
	star_of_david: star_of_david,
	wheel_of_dharma: wheel_of_dharma,
	yin_yang: yin_yang,
	latin_cross: latin_cross,
	orthodox_cross: orthodox_cross,
	star_and_crescent: star_and_crescent,
	peace_symbol: peace_symbol,
	menorah: menorah,
	six_pointed_star: six_pointed_star,
	aries: aries,
	taurus: taurus,
	gemini: gemini,
	cancer: cancer,
	leo: leo,
	virgo: virgo,
	libra: libra,
	scorpius: scorpius,
	sagittarius: sagittarius,
	capricorn: capricorn,
	aquarius: aquarius,
	pisces: pisces,
	ophiuchus: ophiuchus,
	twisted_rightwards_arrows: twisted_rightwards_arrows,
	repeat: repeat,
	repeat_one: repeat_one,
	arrow_forward: arrow_forward,
	fast_forward: fast_forward,
	next_track_button: next_track_button,
	play_or_pause_button: play_or_pause_button,
	arrow_backward: arrow_backward,
	rewind: rewind,
	previous_track_button: previous_track_button,
	arrow_up_small: arrow_up_small,
	arrow_double_up: arrow_double_up,
	arrow_down_small: arrow_down_small,
	arrow_double_down: arrow_double_down,
	pause_button: pause_button,
	stop_button: stop_button,
	record_button: record_button,
	eject_button: eject_button,
	cinema: cinema,
	low_brightness: low_brightness,
	high_brightness: high_brightness,
	signal_strength: signal_strength,
	vibration_mode: vibration_mode,
	mobile_phone_off: mobile_phone_off,
	female_sign: female_sign,
	male_sign: male_sign,
	transgender_symbol: transgender_symbol,
	heavy_multiplication_x: heavy_multiplication_x,
	heavy_plus_sign: heavy_plus_sign,
	heavy_minus_sign: heavy_minus_sign,
	heavy_division_sign: heavy_division_sign,
	infinity: infinity,
	bangbang: bangbang,
	interrobang: interrobang,
	question: question,
	grey_question: grey_question,
	grey_exclamation: grey_exclamation,
	exclamation: exclamation,
	heavy_exclamation_mark: heavy_exclamation_mark,
	wavy_dash: wavy_dash,
	currency_exchange: currency_exchange,
	heavy_dollar_sign: heavy_dollar_sign,
	medical_symbol: medical_symbol,
	recycle: recycle,
	fleur_de_lis: fleur_de_lis,
	trident: trident,
	name_badge: name_badge,
	beginner: beginner,
	o: o$1,
	white_check_mark: white_check_mark,
	ballot_box_with_check: ballot_box_with_check,
	heavy_check_mark: heavy_check_mark,
	x: x,
	negative_squared_cross_mark: negative_squared_cross_mark,
	curly_loop: curly_loop,
	loop: loop,
	part_alternation_mark: part_alternation_mark,
	eight_spoked_asterisk: eight_spoked_asterisk,
	eight_pointed_black_star: eight_pointed_black_star,
	sparkle: sparkle,
	copyright: copyright,
	registered: registered,
	tm: tm,
	hash: hash,
	asterisk: asterisk,
	zero: zero,
	one: one,
	two: two,
	three: three,
	four: four,
	five: five,
	six: six,
	seven: seven,
	eight: eight,
	nine: nine,
	keycap_ten: keycap_ten,
	capital_abcd: capital_abcd,
	abcd: abcd,
	symbols: symbols,
	abc: abc,
	a: a$1,
	ab: ab,
	b: b,
	cl: cl,
	cool: cool,
	free: free,
	information_source: information_source,
	id: id,
	m: m,
	"new": "🆕",
	ng: ng,
	o2: o2,
	ok: ok,
	parking: parking,
	sos: sos,
	up: up,
	vs: vs,
	koko: koko,
	sa: sa,
	ideograph_advantage: ideograph_advantage,
	accept: accept,
	congratulations: congratulations,
	secret: secret,
	u6e80: u6e80,
	red_circle: red_circle,
	orange_circle: orange_circle,
	yellow_circle: yellow_circle,
	green_circle: green_circle,
	large_blue_circle: large_blue_circle,
	purple_circle: purple_circle,
	brown_circle: brown_circle,
	black_circle: black_circle,
	white_circle: white_circle,
	red_square: red_square,
	orange_square: orange_square,
	yellow_square: yellow_square,
	green_square: green_square,
	blue_square: blue_square,
	purple_square: purple_square,
	brown_square: brown_square,
	black_large_square: black_large_square,
	white_large_square: white_large_square,
	black_medium_square: black_medium_square,
	white_medium_square: white_medium_square,
	black_medium_small_square: black_medium_small_square,
	white_medium_small_square: white_medium_small_square,
	black_small_square: black_small_square,
	white_small_square: white_small_square,
	large_orange_diamond: large_orange_diamond,
	large_blue_diamond: large_blue_diamond,
	small_orange_diamond: small_orange_diamond,
	small_blue_diamond: small_blue_diamond,
	small_red_triangle: small_red_triangle,
	small_red_triangle_down: small_red_triangle_down,
	diamond_shape_with_a_dot_inside: diamond_shape_with_a_dot_inside,
	radio_button: radio_button,
	white_square_button: white_square_button,
	black_square_button: black_square_button,
	checkered_flag: checkered_flag,
	triangular_flag_on_post: triangular_flag_on_post,
	crossed_flags: crossed_flags,
	black_flag: black_flag,
	white_flag: white_flag,
	rainbow_flag: rainbow_flag,
	transgender_flag: transgender_flag,
	pirate_flag: pirate_flag,
	ascension_island: ascension_island,
	andorra: andorra,
	united_arab_emirates: united_arab_emirates,
	afghanistan: afghanistan,
	antigua_barbuda: antigua_barbuda,
	anguilla: anguilla,
	albania: albania,
	armenia: armenia,
	angola: angola,
	antarctica: antarctica,
	argentina: argentina,
	american_samoa: american_samoa,
	austria: austria,
	australia: australia,
	aruba: aruba,
	aland_islands: aland_islands,
	azerbaijan: azerbaijan,
	bosnia_herzegovina: bosnia_herzegovina,
	barbados: barbados,
	bangladesh: bangladesh,
	belgium: belgium,
	burkina_faso: burkina_faso,
	bulgaria: bulgaria,
	bahrain: bahrain,
	burundi: burundi,
	benin: benin,
	st_barthelemy: st_barthelemy,
	bermuda: bermuda,
	brunei: brunei,
	bolivia: bolivia,
	caribbean_netherlands: caribbean_netherlands,
	brazil: brazil,
	bahamas: bahamas,
	bhutan: bhutan,
	bouvet_island: bouvet_island,
	botswana: botswana,
	belarus: belarus,
	belize: belize,
	canada: canada,
	cocos_islands: cocos_islands,
	congo_kinshasa: congo_kinshasa,
	central_african_republic: central_african_republic,
	congo_brazzaville: congo_brazzaville,
	switzerland: switzerland,
	cote_divoire: cote_divoire,
	cook_islands: cook_islands,
	chile: chile,
	cameroon: cameroon,
	cn: cn,
	colombia: colombia,
	clipperton_island: clipperton_island,
	costa_rica: costa_rica,
	cuba: cuba,
	cape_verde: cape_verde,
	curacao: curacao,
	christmas_island: christmas_island,
	cyprus: cyprus,
	czech_republic: czech_republic,
	de: de,
	diego_garcia: diego_garcia,
	djibouti: djibouti,
	denmark: denmark,
	dominica: dominica,
	dominican_republic: dominican_republic,
	algeria: algeria,
	ceuta_melilla: ceuta_melilla,
	ecuador: ecuador,
	estonia: estonia,
	egypt: egypt,
	western_sahara: western_sahara,
	eritrea: eritrea,
	es: es,
	ethiopia: ethiopia,
	eu: eu,
	european_union: european_union,
	finland: finland,
	fiji: fiji,
	falkland_islands: falkland_islands,
	micronesia: micronesia,
	faroe_islands: faroe_islands,
	fr: fr,
	gabon: gabon,
	gb: gb,
	uk: uk,
	grenada: grenada,
	georgia: georgia,
	french_guiana: french_guiana,
	guernsey: guernsey,
	ghana: ghana,
	gibraltar: gibraltar,
	greenland: greenland,
	gambia: gambia,
	guinea: guinea,
	guadeloupe: guadeloupe,
	equatorial_guinea: equatorial_guinea,
	greece: greece,
	south_georgia_south_sandwich_islands: south_georgia_south_sandwich_islands,
	guatemala: guatemala,
	guam: guam,
	guinea_bissau: guinea_bissau,
	guyana: guyana,
	hong_kong: hong_kong,
	heard_mcdonald_islands: heard_mcdonald_islands,
	honduras: honduras,
	croatia: croatia,
	haiti: haiti,
	hungary: hungary,
	canary_islands: canary_islands,
	indonesia: indonesia,
	ireland: ireland,
	israel: israel,
	isle_of_man: isle_of_man,
	india: india,
	british_indian_ocean_territory: british_indian_ocean_territory,
	iraq: iraq,
	iran: iran,
	iceland: iceland,
	it: it,
	jersey: jersey,
	jamaica: jamaica,
	jordan: jordan,
	jp: jp,
	kenya: kenya,
	kyrgyzstan: kyrgyzstan,
	cambodia: cambodia,
	kiribati: kiribati,
	comoros: comoros,
	st_kitts_nevis: st_kitts_nevis,
	north_korea: north_korea,
	kr: kr,
	kuwait: kuwait,
	cayman_islands: cayman_islands,
	kazakhstan: kazakhstan,
	laos: laos,
	lebanon: lebanon,
	st_lucia: st_lucia,
	liechtenstein: liechtenstein,
	sri_lanka: sri_lanka,
	liberia: liberia,
	lesotho: lesotho,
	lithuania: lithuania,
	luxembourg: luxembourg,
	latvia: latvia,
	libya: libya,
	morocco: morocco,
	monaco: monaco,
	moldova: moldova,
	montenegro: montenegro,
	st_martin: st_martin,
	madagascar: madagascar,
	marshall_islands: marshall_islands,
	macedonia: macedonia,
	mali: mali,
	myanmar: myanmar,
	mongolia: mongolia,
	macau: macau,
	northern_mariana_islands: northern_mariana_islands,
	martinique: martinique,
	mauritania: mauritania,
	montserrat: montserrat,
	malta: malta,
	mauritius: mauritius,
	maldives: maldives,
	malawi: malawi,
	mexico: mexico,
	malaysia: malaysia,
	mozambique: mozambique,
	namibia: namibia,
	new_caledonia: new_caledonia,
	niger: niger,
	norfolk_island: norfolk_island,
	nigeria: nigeria,
	nicaragua: nicaragua,
	netherlands: netherlands,
	norway: norway,
	nepal: nepal,
	nauru: nauru,
	niue: niue,
	new_zealand: new_zealand,
	oman: oman,
	panama: panama,
	peru: peru,
	french_polynesia: french_polynesia,
	papua_new_guinea: papua_new_guinea,
	philippines: philippines,
	pakistan: pakistan,
	poland: poland,
	st_pierre_miquelon: st_pierre_miquelon,
	pitcairn_islands: pitcairn_islands,
	puerto_rico: puerto_rico,
	palestinian_territories: palestinian_territories,
	portugal: portugal,
	palau: palau,
	paraguay: paraguay,
	qatar: qatar,
	reunion: reunion,
	romania: romania,
	serbia: serbia,
	ru: ru,
	rwanda: rwanda,
	saudi_arabia: saudi_arabia,
	solomon_islands: solomon_islands,
	seychelles: seychelles,
	sudan: sudan,
	sweden: sweden,
	singapore: singapore,
	st_helena: st_helena,
	slovenia: slovenia,
	svalbard_jan_mayen: svalbard_jan_mayen,
	slovakia: slovakia,
	sierra_leone: sierra_leone,
	san_marino: san_marino,
	senegal: senegal,
	somalia: somalia,
	suriname: suriname,
	south_sudan: south_sudan,
	sao_tome_principe: sao_tome_principe,
	el_salvador: el_salvador,
	sint_maarten: sint_maarten,
	syria: syria,
	swaziland: swaziland,
	tristan_da_cunha: tristan_da_cunha,
	turks_caicos_islands: turks_caicos_islands,
	chad: chad,
	french_southern_territories: french_southern_territories,
	togo: togo,
	thailand: thailand,
	tajikistan: tajikistan,
	tokelau: tokelau,
	timor_leste: timor_leste,
	turkmenistan: turkmenistan,
	tunisia: tunisia,
	tonga: tonga,
	tr: tr,
	trinidad_tobago: trinidad_tobago,
	tuvalu: tuvalu,
	taiwan: taiwan,
	tanzania: tanzania,
	ukraine: ukraine,
	uganda: uganda,
	us_outlying_islands: us_outlying_islands,
	united_nations: united_nations,
	us: us,
	uruguay: uruguay,
	uzbekistan: uzbekistan,
	vatican_city: vatican_city,
	st_vincent_grenadines: st_vincent_grenadines,
	venezuela: venezuela,
	british_virgin_islands: british_virgin_islands,
	us_virgin_islands: us_virgin_islands,
	vietnam: vietnam,
	vanuatu: vanuatu,
	wallis_futuna: wallis_futuna,
	samoa: samoa,
	kosovo: kosovo,
	yemen: yemen,
	mayotte: mayotte,
	south_africa: south_africa,
	zambia: zambia,
	zimbabwe: zimbabwe,
	england: england,
	scotland: scotland,
	wales: wales
};

var shortcuts = {
  angry:            [ '>:(', '>:-(' ],
  blush:            [ ':")', ':-")' ],
  broken_heart:     [ '</3', '<\\3' ],
  // :\ and :-\ not used because of conflict with markdown escaping
  confused:         [ ':/', ':-/' ], // twemoji shows question
  cry:              [ ":'(", ":'-(", ':,(', ':,-(' ],
  frowning:         [ ':(', ':-(' ],
  heart:            [ '<3' ],
  imp:              [ ']:(', ']:-(' ],
  innocent:         [ 'o:)', 'O:)', 'o:-)', 'O:-)', '0:)', '0:-)' ],
  joy:              [ ":')", ":'-)", ':,)', ':,-)', ":'D", ":'-D", ':,D', ':,-D' ],
  kissing:          [ ':*', ':-*' ],
  laughing:         [ 'x-)', 'X-)' ],
  neutral_face:     [ ':|', ':-|' ],
  open_mouth:       [ ':o', ':-o', ':O', ':-O' ],
  rage:             [ ':@', ':-@' ],
  smile:            [ ':D', ':-D' ],
  smiley:           [ ':)', ':-)' ],
  smiling_imp:      [ ']:)', ']:-)' ],
  sob:              [ ":,'(", ":,'-(", ';(', ';-(' ],
  stuck_out_tongue: [ ':P', ':-P' ],
  sunglasses:       [ '8-)', 'B-)' ],
  sweat:            [ ',:(', ',:-(' ],
  sweat_smile:      [ ',:)', ',:-)' ],
  unamused:         [ ':s', ':-S', ':z', ':-Z', ':$', ':-$' ],
  wink:             [ ';)', ';-)' ]
};

var render$6 = function emoji_html(tokens, idx /*, options, env */) {
  return tokens[idx].content;
};

var replace = function create_rule(md, emojies, shortcuts, scanRE, replaceRE) {
  var arrayReplaceAt = md.utils.arrayReplaceAt,
      ucm = md.utils.lib.ucmicro,
      ZPCc = new RegExp([ ucm.Z.source, ucm.P.source, ucm.Cc.source ].join('|'));

  function splitTextToken(text, level, Token) {
    var token, last_pos = 0, nodes = [];

    text.replace(replaceRE, function (match, offset, src) {
      var emoji_name;
      // Validate emoji name
      if (shortcuts.hasOwnProperty(match)) {
        // replace shortcut with full name
        emoji_name = shortcuts[match];

        // Don't allow letters before any shortcut (as in no ":/" in http://)
        if (offset > 0 && !ZPCc.test(src[offset - 1])) {
          return;
        }

        // Don't allow letters after any shortcut
        if (offset + match.length < src.length && !ZPCc.test(src[offset + match.length])) {
          return;
        }
      } else {
        emoji_name = match.slice(1, -1);
      }

      // Add new tokens to pending list
      if (offset > last_pos) {
        token         = new Token('text', '', 0);
        token.content = text.slice(last_pos, offset);
        nodes.push(token);
      }

      token         = new Token('emoji', '', 0);
      token.markup  = emoji_name;
      token.content = emojies[emoji_name];
      nodes.push(token);

      last_pos = offset + match.length;
    });

    if (last_pos < text.length) {
      token         = new Token('text', '', 0);
      token.content = text.slice(last_pos);
      nodes.push(token);
    }

    return nodes;
  }

  return function emoji_replace(state) {
    var i, j, l, tokens, token,
        blockTokens = state.tokens,
        autolinkLevel = 0;

    for (j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== 'inline') { continue; }
      tokens = blockTokens[j].children;

      // We scan from the end, to keep position when new tags added.
      // Use reversed logic in links start/end match
      for (i = tokens.length - 1; i >= 0; i--) {
        token = tokens[i];

        if (token.type === 'link_open' || token.type === 'link_close') {
          if (token.info === 'auto') { autolinkLevel -= token.nesting; }
        }

        if (token.type === 'text' && autolinkLevel === 0 && scanRE.test(token.content)) {
          // replace current node
          blockTokens[j].children = tokens = arrayReplaceAt(
            tokens, i, splitTextToken(token.content, token.level, state.Token)
          );
        }
      }
    }
  };
};

function quoteRE(str) {
  return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
}


var normalize_opts$1 = function normalize_opts(options) {
  var emojies = options.defs,
      shortcuts;

  // Filter emojies by whitelist, if needed
  if (options.enabled.length) {
    emojies = Object.keys(emojies).reduce(function (acc, key) {
      if (options.enabled.indexOf(key) >= 0) {
        acc[key] = emojies[key];
      }
      return acc;
    }, {});
  }

  // Flatten shortcuts to simple object: { alias: emoji_name }
  shortcuts = Object.keys(options.shortcuts).reduce(function (acc, key) {
    // Skip aliases for filtered emojies, to reduce regexp
    if (!emojies[key]) { return acc; }

    if (Array.isArray(options.shortcuts[key])) {
      options.shortcuts[key].forEach(function (alias) {
        acc[alias] = key;
      });
      return acc;
    }

    acc[options.shortcuts[key]] = key;
    return acc;
  }, {});

  var keys = Object.keys(emojies),
      names;

  // If no definitions are given, return empty regex to avoid replacements with 'undefined'.
  if (keys.length === 0) {
    names = '^$';
  } else {
    // Compile regexp
    names = keys
      .map(function (name) { return ':' + name + ':'; })
      .concat(Object.keys(shortcuts))
      .sort()
      .reverse()
      .map(function (name) { return quoteRE(name); })
      .join('|');
  }
  var scanRE = RegExp(names);
  var replaceRE = RegExp(names, 'g');

  return {
    defs: emojies,
    shortcuts: shortcuts,
    scanRE: scanRE,
    replaceRE: replaceRE
  };
};

var emoji_html        = render$6;
var emoji_replace     = replace;
var normalize_opts    = normalize_opts$1;


var bare = function emoji_plugin(md, options) {
  var defaults = {
    defs: {},
    shortcuts: {},
    enabled: []
  };

  var opts = normalize_opts(md.utils.assign({}, defaults, options || {}));

  md.renderer.rules.emoji = emoji_html;

  md.core.ruler.after(
    'linkify',
    'emoji',
    emoji_replace(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE)
  );
};

var emojies_defs      = require$$0;
var emojies_shortcuts = shortcuts;
var bare_emoji_plugin = bare;


var markdownItEmoji = function emoji_plugin(md, options) {
  var defaults = {
    defs: emojies_defs,
    shortcuts: emojies_shortcuts,
    enabled: []
  };

  var opts = md.utils.assign({}, defaults, options || {});

  bare_emoji_plugin(md, opts);
};

var emojiPlugin = /*@__PURE__*/getDefaultExportFromCjs(markdownItEmoji);

var e$1=!1,n$1={false:"push",true:"unshift",after:"push",before:"unshift"},t={isPermalinkSymbol:!0};function r$1(r,a,i,l){var o;if(!e$1){var c="Using deprecated markdown-it-anchor permalink option, see https://github.com/valeriangalliat/markdown-it-anchor#permalinks";"object"==typeof process&&process&&process.emitWarning?process.emitWarning(c):console.warn(c),e$1=!0;}var s=[Object.assign(new i.Token("link_open","a",1),{attrs:[].concat(a.permalinkClass?[["class",a.permalinkClass]]:[],[["href",a.permalinkHref(r,i)]],Object.entries(a.permalinkAttrs(r,i)))}),Object.assign(new i.Token("html_block","",0),{content:a.permalinkSymbol,meta:t}),new i.Token("link_close","a",-1)];a.permalinkSpace&&i.tokens[l+1].children[n$1[a.permalinkBefore]](Object.assign(new i.Token("text","",0),{content:" "})),(o=i.tokens[l+1].children)[n$1[a.permalinkBefore]].apply(o,s);}function a(e){return "#"+e}function i(e){return {}}var l={class:"header-anchor",symbol:"#",renderHref:a,renderAttrs:i};function o(e){function n(t){return t=Object.assign({},n.defaults,t),function(n,r,a,i){return e(n,t,r,a,i)}}return n.defaults=Object.assign({},l),n.renderPermalinkImpl=e,n}var c$1=o(function(e,r,a,i,l){var o,c=[Object.assign(new i.Token("link_open","a",1),{attrs:[].concat(r.class?[["class",r.class]]:[],[["href",r.renderHref(e,i)]],r.ariaHidden?[["aria-hidden","true"]]:[],Object.entries(r.renderAttrs(e,i)))}),Object.assign(new i.Token("html_inline","",0),{content:r.symbol,meta:t}),new i.Token("link_close","a",-1)];if(r.space){var s="string"==typeof r.space?r.space:" ";i.tokens[l+1].children[n$1[r.placement]](Object.assign(new i.Token("string"==typeof r.space?"html_inline":"text","",0),{content:s}));}(o=i.tokens[l+1].children)[n$1[r.placement]].apply(o,c);});Object.assign(c$1.defaults,{space:!0,placement:"after",ariaHidden:!1});var s=o(c$1.renderPermalinkImpl);s.defaults=Object.assign({},c$1.defaults,{ariaHidden:!0});var u=o(function(e,n,t,r,a){var i=[Object.assign(new r.Token("link_open","a",1),{attrs:[].concat(n.class?[["class",n.class]]:[],[["href",n.renderHref(e,r)]],Object.entries(n.renderAttrs(e,r)))})].concat(n.safariReaderFix?[new r.Token("span_open","span",1)]:[],r.tokens[a+1].children,n.safariReaderFix?[new r.Token("span_close","span",-1)]:[],[new r.Token("link_close","a",-1)]);r.tokens[a+1]=Object.assign(new r.Token("inline","",0),{children:i});});Object.assign(u.defaults,{safariReaderFix:!1});var d$1=o(function(e,r,a,i,l){var o;if(!["visually-hidden","aria-label","aria-describedby","aria-labelledby"].includes(r.style))throw new Error("`permalink.linkAfterHeader` called with unknown style option `"+r.style+"`");if(!["aria-describedby","aria-labelledby"].includes(r.style)&&!r.assistiveText)throw new Error("`permalink.linkAfterHeader` called without the `assistiveText` option in `"+r.style+"` style");if("visually-hidden"===r.style&&!r.visuallyHiddenClass)throw new Error("`permalink.linkAfterHeader` called without the `visuallyHiddenClass` option in `visually-hidden` style");var c=i.tokens[l+1].children.filter(function(e){return "text"===e.type||"code_inline"===e.type}).reduce(function(e,n){return e+n.content},""),s=[],u=[];if(r.class&&u.push(["class",r.class]),u.push(["href",r.renderHref(e,i)]),u.push.apply(u,Object.entries(r.renderAttrs(e,i))),"visually-hidden"===r.style){if(s.push(Object.assign(new i.Token("span_open","span",1),{attrs:[["class",r.visuallyHiddenClass]]}),Object.assign(new i.Token("text","",0),{content:r.assistiveText(c)}),new i.Token("span_close","span",-1)),r.space){var d="string"==typeof r.space?r.space:" ";s[n$1[r.placement]](Object.assign(new i.Token("string"==typeof r.space?"html_inline":"text","",0),{content:d}));}s[n$1[r.placement]](Object.assign(new i.Token("span_open","span",1),{attrs:[["aria-hidden","true"]]}),Object.assign(new i.Token("html_inline","",0),{content:r.symbol,meta:t}),new i.Token("span_close","span",-1));}else s.push(Object.assign(new i.Token("html_inline","",0),{content:r.symbol,meta:t}));"aria-label"===r.style?u.push(["aria-label",r.assistiveText(c)]):["aria-describedby","aria-labelledby"].includes(r.style)&&u.push([r.style,e]);var f=[Object.assign(new i.Token("link_open","a",1),{attrs:u})].concat(s,[new i.Token("link_close","a",-1)]);(o=i.tokens).splice.apply(o,[l+3,0].concat(f)),r.wrapper&&(i.tokens.splice(l,0,Object.assign(new i.Token("html_block","",0),{content:r.wrapper[0]+"\n"})),i.tokens.splice(l+3+f.length+1,0,Object.assign(new i.Token("html_block","",0),{content:r.wrapper[1]+"\n"})));});function f(e,n,t,r){var a=e,i=r;if(t&&Object.prototype.hasOwnProperty.call(n,a))throw new Error("User defined `id` attribute `"+e+"` is not unique. Please fix it in your Markdown to continue.");for(;Object.prototype.hasOwnProperty.call(n,a);)a=e+"-"+i,i+=1;return n[a]=!0,a}function p(e,n){n=Object.assign({},p.defaults,n),e.core.ruler.push("anchor",function(e){for(var t,a={},i=e.tokens,l=Array.isArray(n.level)?(t=n.level,function(e){return t.includes(e)}):function(e){return function(n){return n>=e}}(n.level),o=0;o<i.length;o++){var c=i[o];if("heading_open"===c.type&&l(Number(c.tag.substr(1)))){var s=n.getTokensText(i[o+1].children),u=c.attrGet("id");u=null==u?f(n.slugify(s),a,!1,n.uniqueSlugStartIndex):f(u,a,!0,n.uniqueSlugStartIndex),c.attrSet("id",u),!1!==n.tabIndex&&c.attrSet("tabindex",""+n.tabIndex),"function"==typeof n.permalink?n.permalink(u,n,e,o):(n.permalink||n.renderPermalink&&n.renderPermalink!==r$1)&&n.renderPermalink(u,n,e,o),o=i.indexOf(c),n.callback&&n.callback(c,{slug:u,title:s});}}});}Object.assign(d$1.defaults,{style:"visually-hidden",space:!0,placement:"after",wrapper:null}),p.permalink={__proto__:null,legacy:r$1,renderHref:a,renderAttrs:i,makePermalink:o,linkInsideHeader:c$1,ariaHidden:s,headerLink:u,linkAfterHeader:d$1},p.defaults={level:1,slugify:function(e){return encodeURIComponent(String(e).trim().toLowerCase().replace(/\s+/g,"-"))},uniqueSlugStartIndex:1,tabIndex:"-1",getTokensText:function(e){return e.filter(function(e){return ["text","code_inline"].includes(e.type)}).map(function(e){return e.content}).join("")},permalink:!1,renderPermalink:r$1,permalinkClass:s.defaults.class,permalinkSpace:s.defaults.space,permalinkSymbol:"¶",permalinkBefore:"before"===s.defaults.placement,permalinkHref:s.defaults.renderHref,permalinkAttrs:s.defaults.renderAttrs},p.default=p;

function e(e){return encodeURIComponent(String(e).trim().toLowerCase().replace(/\s+/g,"-"))}function n(e){return String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function markdownToc(r,t){var l;t=Object.assign({},{placeholder:"(\\$\\{toc\\}|\\[\\[?_?toc_?\\]?\\]|\\$\\<toc(\\{[^}]*\\})\\>)",slugify:e,uniqueSlugStartIndex:1,containerClass:"table-of-contents",containerId:void 0,listClass:void 0,itemClass:void 0,linkClass:void 0,level:1,listType:"ol",format:void 0,callback:void 0},t);var i=new RegExp("^"+t.placeholder+"$","i");r.renderer.rules.tocOpen=function(e,r){var l=Object.assign({},t);return e&&r>=0&&(l=Object.assign(l,e[r].inlineOptions)),"<nav"+(l.containerId?' id="'+n(l.containerId)+'"':"")+' class="'+n(l.containerClass)+'">'},r.renderer.rules.tocClose=function(){return "</nav>"},r.renderer.rules.tocBody=function(e,r){var i=Object.assign({},t);e&&r>=0&&(i=Object.assign(i,e[r].inlineOptions));var s,a={},c=Array.isArray(i.level)?(s=i.level,function(e){return s.includes(e)}):function(e){return function(n){return n>=e}}(i.level);return function e(r){var l=i.listClass?' class="'+n(i.listClass)+'"':"",s=i.itemClass?' class="'+n(i.itemClass)+'"':"",o=i.linkClass?' class="'+n(i.linkClass)+'"':"";if(0===r.c.length)return "";var u="";return (0===r.l||c(r.l))&&(u+="<"+(n(i.listType)+l)+">"),r.c.forEach(function(r){c(r.l)?u+="<li"+s+"><a"+o+' href="#'+function(e){for(var n=e,r=i.uniqueSlugStartIndex;Object.prototype.hasOwnProperty.call(a,n);)n=e+"-"+r++;return a[n]=!0,n}(t.slugify(r.n))+'">'+("function"==typeof i.format?i.format(r.n,n):n(r.n))+"</a>"+e(r)+"</li>":u+=e(r);}),(0===r.l||c(r.l))&&(u+="</"+n(i.listType)+">"),u}(l)},r.core.ruler.push("generateTocAst",function(e){l=function(e){for(var n={l:0,n:"",c:[]},r=[n],t=0,l=e.length;t<l;t++){var i=e[t];if("heading_open"===i.type){var s=e[t+1].children.filter(function(e){return "text"===e.type||"code_inline"===e.type}).reduce(function(e,n){return e+n.content},""),a={l:parseInt(i.tag.substr(1),10),n:s,c:[]};if(a.l>r[0].l)r[0].c.push(a),r.unshift(a);else if(a.l===r[0].l)r[1].c.push(a),r[0]=a;else {for(;a.l<=r[0].l;)r.shift();r[0].c.push(a),r.unshift(a);}}}return n}(e.tokens),"function"==typeof t.callback&&t.callback(r.renderer.rules.tocOpen()+r.renderer.rules.tocBody()+r.renderer.rules.tocClose(),l);}),r.block.ruler.before("heading","toc",function(e,n,r,t){var l,s=e.src.slice(e.bMarks[n]+e.tShift[n],e.eMarks[n]).split(" ")[0];if(!i.test(s))return !1;if(t)return !0;var a=i.exec(s),c={};if(null!==a&&3===a.length)try{c=JSON.parse(a[2]);}catch(e){}return e.line=n+1,(l=e.push("tocOpen","nav",1)).markup="",l.map=[n,e.line],l.inlineOptions=c,(l=e.push("tocBody","",0)).markup="",l.map=[n,e.line],l.inlineOptions=c,l.children=[],(l=e.push("tocClose","nav",-1)).markup="",!0},{alt:["paragraph","reference","blockquote"]});}

var markdownItContainer = function container_plugin(md, name, options) {

  // Second param may be useful if you decide
  // to increase minimal allowed marker length
  function validateDefault(params/*, markup*/) {
    return params.trim().split(' ', 2)[0] === name;
  }

  function renderDefault(tokens, idx, _options, env, slf) {

    // add a class to the opening tag
    if (tokens[idx].nesting === 1) {
      tokens[idx].attrJoin('class', name);
    }

    return slf.renderToken(tokens, idx, _options, env, slf);
  }

  options = options || {};

  var min_markers = 3,
      marker_str  = options.marker || ':',
      marker_char = marker_str.charCodeAt(0),
      marker_len  = marker_str.length,
      validate    = options.validate || validateDefault,
      render      = options.render || renderDefault;

  function container(state, startLine, endLine, silent) {
    var pos, nextLine, marker_count, markup, params, token,
        old_parent, old_line_max,
        auto_closed = false,
        start = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    //
    if (marker_char !== state.src.charCodeAt(start)) { return false; }

    // Check out the rest of the marker string
    //
    for (pos = start + 1; pos <= max; pos++) {
      if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
        break;
      }
    }

    marker_count = Math.floor((pos - start) / marker_len);
    if (marker_count < min_markers) { return false; }
    pos -= (pos - start) % marker_len;

    markup = state.src.slice(start, pos);
    params = state.src.slice(pos, max);
    if (!validate(params, markup)) { return false; }

    // Since start is found, we can report success here in validation mode
    //
    if (silent) { return true; }

    // Search for the end of the block
    //
    nextLine = startLine;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (start < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }

      if (marker_char !== state.src.charCodeAt(start)) { continue; }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue;
      }

      for (pos = start + 1; pos <= max; pos++) {
        if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
          break;
        }
      }

      // closing code fence must be at least as long as the opening one
      if (Math.floor((pos - start) / marker_len) < marker_count) { continue; }

      // make sure tail has spaces only
      pos -= (pos - start) % marker_len;
      pos = state.skipSpaces(pos);

      if (pos < max) { continue; }

      // found!
      auto_closed = true;
      break;
    }

    old_parent = state.parentType;
    old_line_max = state.lineMax;
    state.parentType = 'container';

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    token        = state.push('container_' + name + '_open', 'div', 1);
    token.markup = markup;
    token.block  = true;
    token.info   = params;
    token.map    = [ startLine, nextLine ];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token        = state.push('container_' + name + '_close', 'div', -1);
    token.markup = state.src.slice(start, pos);
    token.block  = true;

    state.parentType = old_parent;
    state.lineMax = old_line_max;
    state.line = nextLine + (auto_closed ? 1 : 0);

    return true;
  }

  md.block.ruler.before('fence', 'container_' + name, container, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
  });
  md.renderer.rules['container_' + name + '_open'] = render;
  md.renderer.rules['container_' + name + '_close'] = render;
};

var mdItContainer = /*@__PURE__*/getDefaultExportFromCjs(markdownItContainer);

// import type MarkdownIt from 'markdown-it'


function getAdaptiveThemeMarker(options) {
    return options.hasSingleTheme ? '' : ' vp-adaptive-theme';
}

function extractTitle(info, html = false) {
    if (html) {
        info = info.replace(/<!--[^]*?-->/g, '');
        const result = info.match(/data-title="(.*?)"/);
        return result[1] || '';
        // return (
        //     info.replace(/<!--[^]*?-->/g, '').match(/data-title="(.*?)"/)?.[1] || ''
        // )
    }
    const result = info.match(/\[(.*)\]/);
    return result[1] || extractLang(info) || 'txt';
    // return info.match(/\[(.*)\]/)?.[1] || extractLang(info) || 'txt'
}

function extractLang(info) {
    return info
        .trim()
        .replace(/:(no-)?line-numbers({| |$).*/, '')
        .replace(/(-vue|{| ).*$/, '')
        .replace(/^vue-html$/, 'template');
}

// import MarkdownIt from 'markdown-it';
// import { RenderRule } from 'markdown-it/lib/renderer';
// import Token from 'markdown-it/lib/token';

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
function uuid$3(prefix = '') {
    // return `ID${globalId++}`;
    const uuid = new Array(36);

    let rnd = 0,
        r;
    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            uuid[i] = '-';
        } else if (i === 14) {
            uuid[i] = '4';
        } else {
            if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = CHARS[(i === 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return prefix + '' + uuid.join('');
}

const containerPlugin = (md, options) => {
    md.use(...createContainer('tip', 'TIP', md))
        .use(...createContainer('info', 'INFO', md))
        .use(...createContainer('warning', 'WARNING', md))
        .use(...createContainer('danger', 'DANGER', md))
        .use(...createContainer('details', 'Details', md))
        // explicitly escape Vue syntax
        .use(mdItContainer, 'v-pre', {
            render: (tokens, idx) =>
                tokens[idx].nesting === 1 ? '<div v-pre>\n' : '</div>\n'
        })
        .use(mdItContainer, 'raw', {
            render: (tokens, idx) =>
                tokens[idx].nesting === 1 ? '<div class="vp-raw">\n' : '</div>\n'
        })
        .use(...createCodeGroup(options));
};

function createContainer(klass, defaultTitle, md) {
    return [
        mdItContainer,
        klass,
        {
            render(tokens, idx) {
                const token = tokens[idx];
                const info = token.info.trim().slice(klass.length).trim();
                if (token.nesting === 1) {
                    const title = md.renderInline(info || defaultTitle);
                    if (klass === 'details') {
                        return `<details class="${klass} custom-block"><summary>${title}</summary>\n`;
                    }
                    return `<div class="${klass} custom-block"><p class="custom-block-title">${title}</p>\n`;
                } else {
                    return klass === 'details' ? '</details>\n' : '</div>\n';
                }
            }
        }
    ];
}

function createCodeGroup(options) {
    return [
        mdItContainer,
        'code-group',
        {
            render(tokens, idx) {
                if (tokens[idx].nesting === 1) {
                    const name = uuid$3();
                    let tabs = '';
                    let checked = 'checked="checked"';

                    for (
                        let i = idx + 1;
                        !(
                            tokens[i].nesting === -1 &&
                            tokens[i].type === 'container_code-group_close'
                        );
                        ++i
                    ) {
                        const isHtml = tokens[i].type === 'html_block';

                        if (
                            (tokens[i].type === 'fence' && tokens[i].tag === 'code') ||
                            isHtml
                        ) {
                            const title = extractTitle(
                                isHtml ? tokens[i].content : tokens[i].info,
                                isHtml
                            );

                            if (title) {
                                const id = uuid$3(7);
                                tabs += `<input type="radio" name="group-${name}" id="tab-${id}" ${checked}><label for="tab-${id}">${title}</label>`;

                                if (checked && !isHtml) tokens[i].info += ` ${ACTIVE_CLASS}`;
                                checked = '';
                            }
                        }
                    }

                    return `<div class="vp-code-group${getAdaptiveThemeMarker(
                        options
                    )}"><div class="tabs">${tabs}</div><div class="blocks">\n`;
                }
                return '</div></div>\n';
            }
        }
    ];
}

const pluginKeyword$3 = 'katex';
const tokenTypeInline$3 = 'inline';
const ttContainerOpen$3 = 'container_' + pluginKeyword$3 + '_open';
const ttContainerClose$3 = 'container_' + pluginKeyword$3 + '_close';

function katexPlugin(md, config) {
    md.use(mdItContainer, pluginKeyword$3, {
        anyClass: true,
        validate: (info) => {
            return info.trim() === pluginKeyword$3;
        },

        render: (tokens, idx) => {
            const token = tokens[idx];

            // eslint-disable-next-line no-var
            var src = '';
            if (token.type === ttContainerOpen$3) {
                // eslint-disable-next-line no-var
                for (var i = idx + 1; i < tokens.length; i++) {
                    const value = tokens[i];
                    if (value === undefined || value.type === ttContainerClose$3) {
                        break;
                    }
                    src += value.content;
                    if (value.block && value.nesting <= 0) {
                        src += '\n';
                    }
                    // Clear these out so markdown-it doesn't try to render them
                    value.tag = '';
                    value.type = tokenTypeInline$3;
                    // Code can be triggered multiple times, even if tokens are not updated (eg. on editor losing and regaining focus). Content must be preserved, so src can be realculated in such instances.
                    value.children = [];
                }
            }

            if (token.nesting === 1) {
                return `${render$5(src)}`;
            } else {
                return '';
            }
        }
    });

    // const highlight = md.options.highlight;
    // md.options.highlight = (code, lang) => {
    //     const reg = new RegExp('\\b(' + config.languageIds().map(escapeRegExp).join('|') + ')\\b', 'i');
    //     if (lang && reg.test(lang)) {
    //         return `<pre style="all:unset;"><div class="${pluginKeyword}">${preProcess(code)}</div></pre>`;
    //     }
    //     return highlight(code, lang);
    // };
    return md;
}

function render$5(code) {
    const html = katex$1.renderToString(code, {
        throwOnError: false
    });
    return `
     <div class="katex-container">

     ${html}

     </div>
   `;
}

const ketexRender = (code) => {
    const html = katex$1.renderToString(code, {
        throwOnError: false
    });
    return html;
};

// import mermaid from 'mermaid';
const pluginKeyword$2 = 'mermaid';
const tokenTypeInline$2 = 'inline';
const ttContainerOpen$2 = 'container_' + pluginKeyword$2 + '_open';
const ttContainerClose$2 = 'container_' + pluginKeyword$2 + '_close';

function mermaidPlugin(md, config) {
    md.use(mdItContainer, pluginKeyword$2, {
        anyClass: true,
        validate: (info) => {
            return info.trim() === pluginKeyword$2;
        },

        render: (tokens, idx) => {
            const token = tokens[idx];

            // eslint-disable-next-line no-var
            var src = '';
            if (token.type === ttContainerOpen$2) {
                // eslint-disable-next-line no-var
                for (var i = idx + 1; i < tokens.length; i++) {
                    const value = tokens[i];
                    if (value === undefined || value.type === ttContainerClose$2) {
                        break;
                    }
                    src += value.content;
                    if (value.block && value.nesting <= 0) {
                        src += '\n';
                    }
                    // Clear these out so markdown-it doesn't try to render them
                    value.tag = '';
                    value.type = tokenTypeInline$2;
                    // Code can be triggered multiple times, even if tokens are not updated (eg. on editor losing and regaining focus). Content must be preserved, so src can be realculated in such instances.
                    // value.content = '';
                    value.children = [];
                }
            }

            if (token.nesting === 1) {
                return `<div class="${pluginKeyword$2}-container">${render$4(preProcess(src))}`;
            } else {
                return '</div>';
            }
        }
    });

    // const highlight = md.options.highlight;
    // md.options.highlight = (code, lang) => {
    //     const reg = new RegExp('\\b(' + config.languageIds().map(escapeRegExp).join('|') + ')\\b', 'i');
    //     if (lang && reg.test(lang)) {
    //         return `<pre style="all:unset;"><div class="${pluginKeyword}">${preProcess(code)}</div></pre>`;
    //     }
    //     return highlight(code, lang);
    // };
    return md;
}

function render$4(code) {
    return `
   <div class="mermaid">
     ${code}
   </div>
   `;
}

const mermaidRender = render$4;

function preProcess(source) {
    return source
        // eslint-disable-next-line no-useless-escape
        .replace(/\</g, '&lt;')
        // eslint-disable-next-line no-useless-escape
        .replace(/\>/g, '&gt;')
        .replace(/\n+$/, '')
        .trimStart();
}

// function escapeRegExp(string) {
//     return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

const pluginKeyword$1 = 'swiper';
const tokenTypeInline$1 = 'inline';
const ttContainerOpen$1 = 'container_' + pluginKeyword$1 + '_open';
const ttContainerClose$1 = 'container_' + pluginKeyword$1 + '_close';

function swiperPlugin(md, config) {
    md.use(mdItContainer, pluginKeyword$1, {
        anyClass: true,
        validate: (info) => {
            return info.trim() === pluginKeyword$1;
        },

        render: (tokens, idx) => {
            const token = tokens[idx];

            // eslint-disable-next-line no-var
            var src = '';
            if (token.type === ttContainerOpen$1) {
                // eslint-disable-next-line no-var
                for (var i = idx + 1; i < tokens.length; i++) {
                    const value = tokens[i];
                    if (value === undefined || value.type === ttContainerClose$1) {
                        break;
                    }
                    src += value.content;
                    if (value.block && value.nesting <= 0) {
                        src += '\n';
                    }
                    // Clear these out so markdown-it doesn't try to render them
                    value.tag = '';
                    value.type = tokenTypeInline$1;
                    // Code can be triggered multiple times, even if tokens are not updated (eg. on editor losing and regaining focus). Content must be preserved, so src can be realculated in such instances.
                    value.children = [];
                }
            }

            if (token.nesting === 1) {
                return `${render$3(src)}`;
            } else {
                return '';
            }
        }
    });

    // const highlight = md.options.highlight;
    // md.options.highlight = (code, lang) => {
    //     const reg = new RegExp('\\b(' + config.languageIds().map(escapeRegExp).join('|') + ')\\b', 'i');
    //     if (lang && reg.test(lang)) {
    //         return `<pre style="all:unset;"><div class="${pluginKeyword}">${preProcess(code)}</div></pre>`;
    //     }
    //     return highlight(code, lang);
    // };
    return md;
}

function render$3(code) {
    return code;
}

/* Process inline math */

var katex = katex$1;

// Test if potential opening or closing delimieter
// Assumes that there is a "$" at state.src[pos]
function isValidDelim(state, pos) {
    var prevChar, nextChar,
        max = state.posMax,
        can_open = true,
        can_close = true;

    prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
    nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;

    // Check non-whitespace conditions for opening and closing, and
    // check that closing delimeter isn't followed by a number
    if (prevChar === 0x20/* " " */ || prevChar === 0x09/* \t */ ||
            (nextChar >= 0x30/* "0" */ && nextChar <= 0x39/* "9" */)) {
        can_close = false;
    }
    if (nextChar === 0x20/* " " */ || nextChar === 0x09/* \t */) {
        can_open = false;
    }

    return {
        can_open: can_open,
        can_close: can_close
    };
}

function math_inline(state, silent) {
    var start, match, token, res, pos;

    if (state.src[state.pos] !== "$") { return false; }

    res = isValidDelim(state, state.pos);
    if (!res.can_open) {
        if (!silent) { state.pending += "$"; }
        state.pos += 1;
        return true;
    }

    // First check for and bypass all properly escaped delimieters
    // This loop will assume that the first leading backtick can not
    // be the first character in state.src, which is known since
    // we have found an opening delimieter already.
    start = state.pos + 1;
    match = start;
    while ( (match = state.src.indexOf("$", match)) !== -1) {
        // Found potential $, look for escapes, pos will point to
        // first non escape when complete
        pos = match - 1;
        while (state.src[pos] === "\\") { pos -= 1; }

        // Even number of escapes, potential closing delimiter found
        if ( ((match - pos) % 2) == 1 ) { break; }
        match += 1;
    }

    // No closing delimter found.  Consume $ and continue.
    if (match === -1) {
        if (!silent) { state.pending += "$"; }
        state.pos = start;
        return true;
    }

    // Check if we have empty content, ie: $$.  Do not parse.
    if (match - start === 0) {
        if (!silent) { state.pending += "$$"; }
        state.pos = start + 1;
        return true;
    }

    // Check for valid closing delimiter
    res = isValidDelim(state, match);
    if (!res.can_close) {
        if (!silent) { state.pending += "$"; }
        state.pos = start;
        return true;
    }

    if (!silent) {
        token         = state.push('math_inline', 'math', 0);
        token.markup  = "$";
        token.content = state.src.slice(start, match);
    }

    state.pos = match + 1;
    return true;
}

function math_block(state, start, end, silent){
    var firstLine, lastLine, next, lastPos, found = false, token,
        pos = state.bMarks[start] + state.tShift[start],
        max = state.eMarks[start];

    if(pos + 2 > max){ return false; }
    if(state.src.slice(pos,pos+2)!=='$$'){ return false; }

    pos += 2;
    firstLine = state.src.slice(pos,max);

    if(silent){ return true; }
    if(firstLine.trim().slice(-2)==='$$'){
        // Single line expression
        firstLine = firstLine.trim().slice(0, -2);
        found = true;
    }

    for(next = start; !found; ){

        next++;

        if(next >= end){ break; }

        pos = state.bMarks[next]+state.tShift[next];
        max = state.eMarks[next];

        if(pos < max && state.tShift[next] < state.blkIndent){
            // non-empty line with negative indent should stop the list:
            break;
        }

        if(state.src.slice(pos,max).trim().slice(-2)==='$$'){
            lastPos = state.src.slice(0,max).lastIndexOf('$$');
            lastLine = state.src.slice(pos,lastPos);
            found = true;
        }

    }

    state.line = next + 1;

    token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = (firstLine && firstLine.trim() ? firstLine + '\n' : '')
    + state.getLines(start + 1, next, state.tShift[start], true)
    + (lastLine && lastLine.trim() ? lastLine : '');
    token.map = [ start, state.line ];
    token.markup = '$$';
    return true;
}

var markdownItKatex = function math_plugin(md, options) {
    // Default options

    options = options || {};

    // set KaTeX as the renderer for markdown-it-simplemath
    var katexInline = function(latex){
        options.displayMode = false;
        try{
            return katex.renderToString(latex, options);
        }
        catch(error){
            if(options.throwOnError){ console.log(error); }
            return latex;
        }
    };

    var inlineRenderer = function(tokens, idx){
        return katexInline(tokens[idx].content);
    };

    var katexBlock = function(latex){
        options.displayMode = true;
        try{
            return "<p>" + katex.renderToString(latex, options) + "</p>";
        }
        catch(error){
            if(options.throwOnError){ console.log(error); }
            return latex;
        }
    };

    var blockRenderer = function(tokens, idx){
        return  katexBlock(tokens[idx].content) + '\n';
    };

    md.inline.ruler.after('escape', 'math_inline', math_inline);
    md.block.ruler.after('blockquote', 'math_block', math_block, {
        alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
    });
    md.renderer.rules.math_inline = inlineRenderer;
    md.renderer.rules.math_block = blockRenderer;
};

var mkkatex = /*@__PURE__*/getDefaultExportFromCjs(markdownItKatex);

// Markdown-it plugin to render GitHub-style task lists; see
//
// https://github.com/blog/1375-task-lists-in-gfm-issues-pulls-comments
// https://github.com/blog/1825-task-lists-in-all-markdown-documents

var disableCheckboxes = true;
var useLabelWrapper = false;
var useLabelAfter = false;

var markdownItTaskLists = function(md, options) {
	if (options) {
		disableCheckboxes = !options.enabled;
		useLabelWrapper = !!options.label;
		useLabelAfter = !!options.labelAfter;
	}

	md.core.ruler.after('inline', 'github-task-lists', function(state) {
		var tokens = state.tokens;
		for (var i = 2; i < tokens.length; i++) {
			if (isTodoItem(tokens, i)) {
				todoify(tokens[i], state.Token);
				attrSet(tokens[i-2], 'class', 'task-list-item' + (!disableCheckboxes ? ' enabled' : ''));
				attrSet(tokens[parentToken(tokens, i-2)], 'class', 'contains-task-list');
			}
		}
	});
};

function attrSet(token, name, value) {
	var index = token.attrIndex(name);
	var attr = [name, value];

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
	return isInline(tokens[index]) &&
	       isParagraph(tokens[index - 1]) &&
	       isListItem(tokens[index - 2]) &&
	       startsWithTodoMarkdown(tokens[index]);
}

function todoify(token, TokenConstructor) {
	token.children.unshift(makeCheckbox(token, TokenConstructor));
	token.children[1].content = token.children[1].content.slice(3);
	token.content = token.content.slice(3);

	if (useLabelWrapper) {
		if (useLabelAfter) {
			token.children.pop();

			// Use large random number as id property of the checkbox.
			var id = 'task-item-' + Math.ceil(Math.random() * (10000 * 1000) - 1000);
			token.children[0].content = token.children[0].content.slice(0, -1) + ' id="' + id + '">';
			token.children.push(afterLabel(token.content, id, TokenConstructor));
		} else {
			token.children.unshift(beginLabel(TokenConstructor));
			token.children.push(endLabel(TokenConstructor));
		}
	}
}

function makeCheckbox(token, TokenConstructor) {
	var checkbox = new TokenConstructor('html_inline', '', 0);
	var disabledAttr = disableCheckboxes ? ' disabled="" ' : '';
	if (token.content.indexOf('[ ] ') === 0) {
		checkbox.content = '<input class="task-list-item-checkbox"' + disabledAttr + 'type="checkbox">';
	} else if (token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0) {
		checkbox.content = '<input class="task-list-item-checkbox" checked=""' + disabledAttr + 'type="checkbox">';
	}
	return checkbox;
}

// these next two functions are kind of hacky; probably should really be a
// true block-level token with .tag=='label'
function beginLabel(TokenConstructor) {
	var token = new TokenConstructor('html_inline', '', 0);
	token.content = '<label>';
	return token;
}

function endLabel(TokenConstructor) {
	var token = new TokenConstructor('html_inline', '', 0);
	token.content = '</label>';
	return token;
}

function afterLabel(content, id, TokenConstructor) {
	var token = new TokenConstructor('html_inline', '', 0);
	token.content = '<label class="task-list-item-label" for="' + id + '">' + content + '</label>';
	token.attrs = [{for: id}];
	return token;
}

function isInline(token) { return token.type === 'inline'; }
function isParagraph(token) { return token.type === 'paragraph_open'; }
function isListItem(token) { return token.type === 'list_item_open'; }

function startsWithTodoMarkdown(token) {
	// leading whitespace in a list item is already trimmed off by markdown-it
	return token.content.indexOf('[ ] ') === 0 || token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0;
}

var taskLists = /*@__PURE__*/getDefaultExportFromCjs(markdownItTaskLists);

const TAG$1 = 'qrcode:';
const RQCODE$1 = 'qrcode';
function inline$1(state, startLine, endLine) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const content = state.src.substring(pos, max);

    if (content.indexOf(TAG$1) === -1 || pos >= max) {
        return false;
    }

    if (content.indexOf(TAG$1) === 0) {
        const token = state.push(RQCODE$1, 'div', -1);
        token.markup = TAG$1;
        token.content = content.replaceAll(TAG$1, '');

        // token = state.push('inline', 'p', 1);
        // token.content = content.replaceAll(TAG, '');
        // token.map = [startLine, state.line];
        // token.children = [];

        // token = state.push(RQCODE + '_close', 'div', -1);
        // token.markup = TAG;

        state.line = startLine + 1;
        return true;
    }
    return false;
}
function qrCodePlugin(md, config) {
    md.block.ruler.after('blockquote', TAG$1, inline$1, {
        alt: ['paragraph', 'reference', 'blockquote', 'list']
    });
    md.renderer.rules[RQCODE$1] = render$2;
}

function render$2(tokens, idx) {
    const token = tokens[idx];
    const { content } = token;
    return `<div class="qrcode-container">${content}</div>`;
}

const TAG = 'excel:';
const RQCODE = 'excel';
function inline(state, startLine, endLine) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const content = state.src.substring(pos, max);

    if (content.indexOf(TAG) === -1 || pos >= max) {
        return false;
    }

    if (content.indexOf(TAG) === 0) {
        const token = state.push(RQCODE, 'div', -1);
        token.markup = TAG;
        token.content = content.replaceAll(TAG, '');

        // token = state.push('inline', 'p', 1);
        // token.content = content.replaceAll(TAG, '');
        // token.map = [startLine, state.line];
        // token.children = [];

        // token = state.push(RQCODE + '_close', 'div', -1);
        // token.markup = TAG;

        state.line = startLine + 1;
        return true;
    }
    return false;
}
function excelPlugin(md, config) {
    md.block.ruler.after('blockquote', TAG, inline, {
        alt: ['paragraph', 'reference', 'blockquote', 'list']
    });
    md.renderer.rules[RQCODE] = render$1;
}

function render$1(tokens, idx) {
    const token = tokens[idx];
    const { content } = token;
    return `<div class="excel-container">${content}</div>`;
}

var deflate;
var hasRequiredDeflate;

function requireDeflate () {
	if (hasRequiredDeflate) return deflate;
	hasRequiredDeflate = 1;

	// Added to original:
	deflate = {
	  zip_deflate: zip_deflate,
	  encode64: encode64
	};

	// Original[some parts modified to avoid errors]:

	/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
	 * Version: 1.0.1
	 * LastModified: Dec 25 1999
	 */

	/* Interface:
	 * data = zip_deflate(src);
	 */

	/* constant parameters */
	var zip_WSIZE = 32768;		// Sliding Window size
	var zip_STORED_BLOCK = 0;
	var zip_STATIC_TREES = 1;
	var zip_DYN_TREES    = 2;

	/* for deflate */
	var zip_DEFAULT_LEVEL = 6;
	var zip_INBUFSIZ = 32768;	// Input buffer size
	var zip_INBUF_EXTRA = 64;	// Extra buffer
	var zip_OUTBUFSIZ = 1024 * 8;
	var zip_window_size = 2 * zip_WSIZE;
	var zip_MIN_MATCH = 3;
	var zip_MAX_MATCH = 258;
	var zip_BITS = 16;
	// for SMALL_MEM
	var zip_LIT_BUFSIZE = 0x2000;
	var zip_HASH_BITS = 13;
	// for MEDIUM_MEM
	// var zip_LIT_BUFSIZE = 0x4000;
	// var zip_HASH_BITS = 14;
	// for BIG_MEM
	// var zip_LIT_BUFSIZE = 0x8000;
	// var zip_HASH_BITS = 15;
	// if (zip_LIT_BUFSIZE > zip_INBUFSIZ) { alert('error: zip_INBUFSIZ is too small'); }
	// if ((zip_WSIZE << 1) > (1 << zip_BITS)) { alert('error: zip_WSIZE is too large'); }
	// if (zip_HASH_BITS > zip_BITS - 1) { alert('error: zip_HASH_BITS is too large'); }
	// if (zip_HASH_BITS < 8 || zip_MAX_MATCH != 258) { alert('error: Code too clever'); }
	var zip_DIST_BUFSIZE = zip_LIT_BUFSIZE;
	var zip_HASH_SIZE = 1 << zip_HASH_BITS;
	var zip_HASH_MASK = zip_HASH_SIZE - 1;
	var zip_WMASK = zip_WSIZE - 1;
	var zip_NIL = 0; // Tail of hash chains
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
	var zip_H_SHIFT = parseInt((zip_HASH_BITS + zip_MIN_MATCH - 1) /
	  zip_MIN_MATCH);

	/* variables */
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

	/* constant tables */
	var zip_extra_lbits = new Array(
	  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0);
	var zip_extra_dbits = new Array(
	  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13);
	var zip_extra_blbits = new Array(
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7);
	var zip_bl_order = new Array(
	  16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15);
	var zip_configuration_table = new Array(
	  new zip_DeflateConfiguration(0,    0,   0,    0),
	  new zip_DeflateConfiguration(4,    4,   8,    4),
	  new zip_DeflateConfiguration(4,    5,  16,    8),
	  new zip_DeflateConfiguration(4,    6,  32,   32),
	  new zip_DeflateConfiguration(4,    4,  16,   16),
	  new zip_DeflateConfiguration(8,   16,  32,   32),
	  new zip_DeflateConfiguration(8,   16, 128,  128),
	  new zip_DeflateConfiguration(8,   32, 128,  256),
	  new zip_DeflateConfiguration(32, 128, 258, 1024),
	  new zip_DeflateConfiguration(32, 258, 258, 4096));

	/* objects (deflate) */

	function zip_DeflateCT() {
	  this.fc = 0; // frequency count or bit string
	  this.dl = 0; // father node in Huffman tree or length of bit string
	}

	function zip_DeflateTreeDesc() {
	  this.dyn_tree = null;	// the dynamic tree
	  this.static_tree = null;	// corresponding static tree or NULL
	  this.extra_bits = null;	// extra bits for each code or NULL
	  this.extra_base = 0;	// base index for extra_bits
	  this.elems = 0;		// max number of elements in the tree
	  this.max_length = 0;	// max bit length for the codes
	  this.max_code = 0;		// largest code with non zero frequency
	}

	/* Values for max_lazy_match, good_match and max_chain_length, depending on
	 * the desired pack level (0..9). The values given below have been tuned to
	 * exclude worst case performance for pathological files. Better values may be
	 * found for specific files.
	 */
	function zip_DeflateConfiguration(a, b, c, d) {
	  this.good_length = a; // reduce lazy search above this match length
	  this.max_lazy = b;    // do not perform lazy search above this match length
	  this.nice_length = c; // quit search above this match length
	  this.max_chain = d;
	}

	function zip_DeflateBuffer() {
	  this.next = null;
	  this.len = 0;
	  this.ptr = new Array(zip_OUTBUFSIZ);
	  this.off = 0;
	}

	/* routines (deflate) */

	function zip_deflate_start(level) {
	  var i;

	  if (!level) { level = zip_DEFAULT_LEVEL; } else if (level < 1) { level = 1; } else if (level > 9) { level = 9; }

	  zip_compr_level = level;
	  zip_initflag = false;
	  zip_eofile = false;
	  if (zip_outbuf != null) { return; }

	  zip_free_queue = zip_qhead = zip_qtail = null;
	  zip_outbuf = new Array(zip_OUTBUFSIZ);
	  zip_window = new Array(zip_window_size);
	  zip_d_buf = new Array(zip_DIST_BUFSIZE);
	  zip_l_buf = new Array(zip_INBUFSIZ + zip_INBUF_EXTRA);
	  zip_prev = new Array(1 << zip_BITS);
	  zip_dyn_ltree = new Array(zip_HEAP_SIZE);
	  for (i = 0; i < zip_HEAP_SIZE; i++) { zip_dyn_ltree[i] = new zip_DeflateCT(); }
	  zip_dyn_dtree = new Array(2 * zip_D_CODES + 1);
	  for (i = 0; i < 2 * zip_D_CODES + 1; i++) { zip_dyn_dtree[i] = new zip_DeflateCT(); }
	  zip_static_ltree = new Array(zip_L_CODES + 2);
	  for (i = 0; i < zip_L_CODES + 2; i++) { zip_static_ltree[i] = new zip_DeflateCT(); }
	  zip_static_dtree = new Array(zip_D_CODES);
	  for (i = 0; i < zip_D_CODES; i++) { zip_static_dtree[i] = new zip_DeflateCT(); }
	  zip_bl_tree = new Array(2 * zip_BL_CODES + 1);
	  for (i = 0; i < 2 * zip_BL_CODES + 1; i++) { zip_bl_tree[i] = new zip_DeflateCT(); }
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

	function zip_reuse_queue(p) {
	  p.next = zip_free_queue;
	  zip_free_queue = p;
	}

	function zip_new_queue() {
	  var p;

	  if (zip_free_queue != null) {
	    p = zip_free_queue;
	    zip_free_queue = zip_free_queue.next;
	  } else { p = new zip_DeflateBuffer(); }
	  p.next = null;
	  p.len = p.off = 0;

	  return p;
	}

	function zip_head1(i) {
	  return zip_prev[zip_WSIZE + i];
	}

	function zip_head2(i, val) {
	  return zip_prev[zip_WSIZE + i] = val;
	}

	/* put_byte is used for the compressed output, put_ubyte for the
	 * uncompressed output. However unlzw() uses window for its
	 * suffix table instead of its output buffer, so it does not use put_ubyte
	 * (to be cleaned up).
	 */
	function zip_put_byte(c) {
	  zip_outbuf[zip_outoff + zip_outcnt++] = c;
	  if (zip_outoff + zip_outcnt == zip_OUTBUFSIZ) { zip_qoutbuf(); }
	}

	/* Output a 16 bit value, lsb first */
	function zip_put_short(w) {
	  w &= 0xffff;
	  if (zip_outoff + zip_outcnt < zip_OUTBUFSIZ - 2) {
	    zip_outbuf[zip_outoff + zip_outcnt++] = (w & 0xff);
	    zip_outbuf[zip_outoff + zip_outcnt++] = (w >>> 8);
	  } else {
	    zip_put_byte(w & 0xff);
	    zip_put_byte(w >>> 8);
	  }
	}

	/* ==========================================================================
	 * Insert string s in the dictionary and set match_head to the previous head
	 * of the hash chain (the most recent string with same hash key). Return
	 * the previous length of the hash chain.
	 * IN  assertion: all calls to to INSERT_STRING are made with consecutive
	 *    input characters and the first MIN_MATCH bytes of s are valid
	 *    (except for the last MIN_MATCH-1 bytes of the input file).
	 */
	function zip_INSERT_STRING() {
	  zip_ins_h = ((zip_ins_h << zip_H_SHIFT)
	    ^ (zip_window[zip_strstart + zip_MIN_MATCH - 1] & 0xff))
	    & zip_HASH_MASK;
	  zip_hash_head = zip_head1(zip_ins_h);
	  zip_prev[zip_strstart & zip_WMASK] = zip_hash_head;
	  zip_head2(zip_ins_h, zip_strstart);
	}

	/* Send a code of the given tree. c and tree must not have side effects */
	function zip_SEND_CODE(c, tree) {
	  zip_send_bits(tree[c].fc, tree[c].dl);
	}

	/* Mapping from a distance to a distance code. dist is the distance - 1 and
	 * must not have side effects. dist_code[256] and dist_code[257] are never
	 * used.
	 */
	function zip_D_CODE(dist) {
	  return (dist < 256 ? zip_dist_code[dist]
	    : zip_dist_code[256 + (dist >> 7)]) & 0xff;
	}

	/* ==========================================================================
	 * Compares to subtrees, using the tree depth as tie breaker when
	 * the subtrees have equal frequency. This minimizes the worst case length.
	 */
	function zip_SMALLER(tree, n, m) {
	  return tree[n].fc < tree[m].fc ||
	    (tree[n].fc == tree[m].fc && zip_depth[n] <= zip_depth[m]);
	}

	/* ==========================================================================
	 * read string data
	 */
	function zip_read_buff(buff, offset, n) {
	  var i;
	  for (i = 0; i < n && zip_deflate_pos < zip_deflate_data.length; i++) {
	    buff[offset + i] =
	      zip_deflate_data.charCodeAt(zip_deflate_pos++) & 0xff;
	  }
	  return i;
	}

	/* ==========================================================================
	 * Initialize the "longest match" routines for a new file
	 */
	function zip_lm_init() {
	  var j;

	  /* Initialize the hash table. */
	  for (j = 0; j < zip_HASH_SIZE; j++)
	  //	zip_head2(j, zip_NIL);
	  { zip_prev[zip_WSIZE + j] = 0; }
	  /* prev will be initialized on the fly */

	  /* Set the default configuration parameters:
	  */
	  zip_max_lazy_match = zip_configuration_table[zip_compr_level].max_lazy;
	  zip_good_match     = zip_configuration_table[zip_compr_level].good_length;
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
	  /* Make sure that we always have enough lookahead. This is important
	   * if input comes from a device such as a tty.
	   */
	  while (zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile) { zip_fill_window(); }

	  /* If lookahead < MIN_MATCH, ins_h is garbage, but this is
	   * not important since only literal bytes will be emitted.
	   */
	  zip_ins_h = 0;
	  for (j = 0; j < zip_MIN_MATCH - 1; j++) {
	    //      UPDATE_HASH(ins_h, window[j]);
	    zip_ins_h = ((zip_ins_h << zip_H_SHIFT) ^ (zip_window[j] & 0xff)) & zip_HASH_MASK;
	  }
	}

	/* ==========================================================================
	 * Set match_start to the longest match starting at the given string and
	 * return its length. Matches shorter or equal to prev_length are discarded,
	 * in which case the result is equal to prev_length and match_start is
	 * garbage.
	 * IN assertions: cur_match is the head of the hash chain for the current
	 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
	 */
	function zip_longest_match(cur_match) {
	  var chain_length = zip_max_chain_length; // max hash chain length
	  var scanp = zip_strstart; // current string
	  var matchp;		// matched string
	  var len;		// length of current match
	  var best_len = zip_prev_length;	// best match length so far

	  /* Stop when cur_match becomes <= limit. To simplify the code,
	   * we prevent matches with the string of window index 0.
	   */
	  var limit = (zip_strstart > zip_MAX_DIST ? zip_strstart - zip_MAX_DIST : zip_NIL);

	  var strendp = zip_strstart + zip_MAX_MATCH;
	  var scan_end1 = zip_window[scanp + best_len - 1];
	  var scan_end  = zip_window[scanp + best_len];

	  /* Do not waste too much time if we already have a good match: */
	  if (zip_prev_length >= zip_good_match) { chain_length >>= 2; }

	  //  Assert(encoder->strstart <= window_size-MIN_LOOKAHEAD, "insufficient lookahead");

	  do {
	    //    Assert(cur_match < encoder->strstart, "no future");
	    matchp = cur_match;

	    /* Skip to next match if the match length cannot increase
	     * or if the match length is less than 2:
	     */
	    if (zip_window[matchp + best_len]	!= scan_end  ||
	      zip_window[matchp + best_len - 1]	!= scan_end1 ||
	      zip_window[matchp]			!= zip_window[scanp] ||
	      zip_window[++matchp]			!= zip_window[scanp + 1]) {
	      continue;
	    }

	    /* The check at best_len-1 can be removed because it will be made
	     * again later. (This heuristic is not always a win.)
	     * It is not necessary to compare scan[2] and match[2] since they
	     * are always equal when the other bytes match, given that
	     * the hash keys are equal and that HASH_BITS >= 8.
	     */
	    scanp += 2;
	    matchp++;

	    /* We check for insufficient lookahead only every 8th comparison;
	     * the 256th check will be made at strstart+258.
	     */
	    do {
	    } while (zip_window[++scanp] == zip_window[++matchp] &&
	      zip_window[++scanp] == zip_window[++matchp] &&
	      zip_window[++scanp] == zip_window[++matchp] &&
	      zip_window[++scanp] == zip_window[++matchp] &&
	      zip_window[++scanp] == zip_window[++matchp] &&
	      zip_window[++scanp] == zip_window[++matchp] &&
	      zip_window[++scanp] == zip_window[++matchp] &&
	      zip_window[++scanp] == zip_window[++matchp] &&
	      scanp < strendp);

	    len = zip_MAX_MATCH - (strendp - scanp);
	    scanp = strendp - zip_MAX_MATCH;

	    if (len > best_len) {
	      zip_match_start = cur_match;
	      best_len = len;
	      {
	        if (len >= zip_MAX_MATCH) break;
	      }

	      scan_end1  = zip_window[scanp + best_len - 1];
	      scan_end   = zip_window[scanp + best_len];
	    }
	  } while ((cur_match = zip_prev[cur_match & zip_WMASK]) > limit
	    && --chain_length != 0);

	  return best_len;
	}

	/* ==========================================================================
	 * Fill the window when the lookahead becomes insufficient.
	 * Updates strstart and lookahead, and sets eofile if end of input file.
	 * IN assertion: lookahead < MIN_LOOKAHEAD && strstart + lookahead > 0
	 * OUT assertions: at least one byte has been read, or eofile is set;
	 *    file reads are performed for at least two bytes (required for the
	 *    translate_eol option).
	 */
	function zip_fill_window() {
	  var n, m;

	  // Amount of free space at the end of the window.
	  var more = zip_window_size - zip_lookahead - zip_strstart;

	  /* If the window is almost full and there is insufficient lookahead,
	   * move the upper half to the lower one to make room in the upper half.
	   */
	  if (more == -1) {
	    /* Very unlikely, but possible on 16 bit machine if strstart == 0
	     * and lookahead == 1 (input done one byte at time)
	     */
	    more--;
	  } else if (zip_strstart >= zip_WSIZE + zip_MAX_DIST) {
	    /* By the IN assertion, the window is not empty so we can't confuse
	     * more == 0 with more == 64K on a 16 bit machine.
	     */
	    //	Assert(window_size == (ulg)2*WSIZE, "no sliding with BIG_MEM");

	    //	System.arraycopy(window, WSIZE, window, 0, WSIZE);
	    for (n = 0; n < zip_WSIZE; n++) { zip_window[n] = zip_window[n + zip_WSIZE]; }

	    zip_match_start -= zip_WSIZE;
	    zip_strstart    -= zip_WSIZE; /* we now have strstart >= MAX_DIST: */
	    zip_block_start -= zip_WSIZE;

	    for (n = 0; n < zip_HASH_SIZE; n++) {
	      m = zip_head1(n);
	      zip_head2(n, m >= zip_WSIZE ? m - zip_WSIZE : zip_NIL);
	    }
	    for (n = 0; n < zip_WSIZE; n++) {
	      /* If n is not on any hash chain, prev[n] is garbage but
	       * its value will never be used.
	       */
	      m = zip_prev[n];
	      zip_prev[n] = (m >= zip_WSIZE ? m - zip_WSIZE : zip_NIL);
	    }
	    more += zip_WSIZE;
	  }
	  // At this point, more >= 2
	  if (!zip_eofile) {
	    n = zip_read_buff(zip_window, zip_strstart + zip_lookahead, more);
	    if (n <= 0) { zip_eofile = true; } else { zip_lookahead += n; }
	  }
	}

	/* ==========================================================================
	 * Processes a new input file and return its compressed length. This
	 * function does not perform lazy evaluationof matches and inserts
	 * new strings in the dictionary only for unmatched strings or for short
	 * matches. It is used only for the fast compression options.
	 */
	function zip_deflate_fast() {
	  while (zip_lookahead != 0 && zip_qhead == null) {
	    var flush; // set if current block must be flushed

	    /* Insert the string window[strstart .. strstart+2] in the
	     * dictionary, and set hash_head to the head of the hash chain:
	     */
	    zip_INSERT_STRING();

	    /* Find the longest match, discarding those <= prev_length.
	     * At this point we have always match_length < MIN_MATCH
	     */
	    if (zip_hash_head != zip_NIL &&
	      zip_strstart - zip_hash_head <= zip_MAX_DIST) {
	      /* To simplify the code, we prevent matches with the string
	       * of window index 0 (in particular we have to avoid a match
	       * of the string with itself at the start of the input file).
	       */
	      zip_match_length = zip_longest_match(zip_hash_head);
	      /* longest_match() sets match_start */
	      if (zip_match_length > zip_lookahead) { zip_match_length = zip_lookahead; }
	    }
	    if (zip_match_length >= zip_MIN_MATCH) {
	      //	    check_match(strstart, match_start, match_length);

	      flush = zip_ct_tally(zip_strstart - zip_match_start,
	        zip_match_length - zip_MIN_MATCH);
	      zip_lookahead -= zip_match_length;

	      /* Insert new strings in the hash table only if the match length
	       * is not too large. This saves time but degrades compression.
	       */
	      if (zip_match_length <= zip_max_lazy_match) {
	        zip_match_length--; // string at strstart already in hash table
	        do {
	          zip_strstart++;
	          zip_INSERT_STRING();
	          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
	           * always MIN_MATCH bytes ahead. If lookahead < MIN_MATCH
	           * these bytes are garbage, but it does not matter since
	           * the next lookahead bytes will be emitted as literals.
	           */
	        } while (--zip_match_length != 0);
	        zip_strstart++;
	      } else {
	        zip_strstart += zip_match_length;
	        zip_match_length = 0;
	        zip_ins_h = zip_window[zip_strstart] & 0xff;
	        //		UPDATE_HASH(ins_h, window[strstart + 1]);
	        zip_ins_h = ((zip_ins_h << zip_H_SHIFT) ^ (zip_window[zip_strstart + 1] & 0xff)) & zip_HASH_MASK;

	        //#if MIN_MATCH != 3
	        //		Call UPDATE_HASH() MIN_MATCH-3 more times
	        //#endif

	      }
	    } else {
	      /* No match, output a literal byte */
	      flush = zip_ct_tally(0, zip_window[zip_strstart] & 0xff);
	      zip_lookahead--;
	      zip_strstart++;
	    }
	    if (flush) {
	      zip_flush_block(0);
	      zip_block_start = zip_strstart;
	    }

	    /* Make sure that we always have enough lookahead, except
	     * at the end of the input file. We need MAX_MATCH bytes
	     * for the next match, plus MIN_MATCH bytes to insert the
	     * string following the next match.
	     */
	    while (zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile) { zip_fill_window(); }
	  }
	}

	function zip_deflate_better() {
	  /* Process the input block. */
	  while (zip_lookahead != 0 && zip_qhead == null) {
	    /* Insert the string window[strstart .. strstart+2] in the
	     * dictionary, and set hash_head to the head of the hash chain:
	     */
	    zip_INSERT_STRING();

	    /* Find the longest match, discarding those <= prev_length.
	    */
	    zip_prev_length = zip_match_length;
	    zip_prev_match = zip_match_start;
	    zip_match_length = zip_MIN_MATCH - 1;

	    if (zip_hash_head != zip_NIL &&
	      zip_prev_length < zip_max_lazy_match &&
	      zip_strstart - zip_hash_head <= zip_MAX_DIST) {
	      /* To simplify the code, we prevent matches with the string
	       * of window index 0 (in particular we have to avoid a match
	       * of the string with itself at the start of the input file).
	       */
	      zip_match_length = zip_longest_match(zip_hash_head);
	      /* longest_match() sets match_start */
	      if (zip_match_length > zip_lookahead) { zip_match_length = zip_lookahead; }

	      /* Ignore a length 3 match if it is too distant: */
	      if (zip_match_length == zip_MIN_MATCH &&
	        zip_strstart - zip_match_start > zip_TOO_FAR) {
	        /* If prev_match is also MIN_MATCH, match_start is garbage
	         * but we will ignore the current match anyway.
	         */
	        zip_match_length--;
	      }
	    }
	    /* If there was a match at the previous step and the current
	     * match is not better, output the previous match:
	     */
	    if (zip_prev_length >= zip_MIN_MATCH &&
	      zip_match_length <= zip_prev_length) {
	      var flush; // set if current block must be flushed

	      //	    check_match(strstart - 1, prev_match, prev_length);
	      flush = zip_ct_tally(zip_strstart - 1 - zip_prev_match,
	        zip_prev_length - zip_MIN_MATCH);

	      /* Insert in hash table all strings up to the end of the match.
	       * strstart-1 and strstart are already inserted.
	       */
	      zip_lookahead -= zip_prev_length - 1;
	      zip_prev_length -= 2;
	      do {
	        zip_strstart++;
	        zip_INSERT_STRING();
	        /* strstart never exceeds WSIZE-MAX_MATCH, so there are
	         * always MIN_MATCH bytes ahead. If lookahead < MIN_MATCH
	         * these bytes are garbage, but it does not matter since the
	         * next lookahead bytes will always be emitted as literals.
	         */
	      } while (--zip_prev_length != 0);
	      zip_match_available = 0;
	      zip_match_length = zip_MIN_MATCH - 1;
	      zip_strstart++;
	      if (flush) {
	        zip_flush_block(0);
	        zip_block_start = zip_strstart;
	      }
	    } else if (zip_match_available != 0) {
	      /* If there was no match at the previous position, output a
	       * single literal. If there was a match but the current match
	       * is longer, truncate the previous match to a single literal.
	       */
	      if (zip_ct_tally(0, zip_window[zip_strstart - 1] & 0xff)) {
	        zip_flush_block(0);
	        zip_block_start = zip_strstart;
	      }
	      zip_strstart++;
	      zip_lookahead--;
	    } else {
	      /* There is no previous match to compare with, wait for
	       * the next step to decide.
	       */
	      zip_match_available = 1;
	      zip_strstart++;
	      zip_lookahead--;
	    }

	    /* Make sure that we always have enough lookahead, except
	     * at the end of the input file. We need MAX_MATCH bytes
	     * for the next match, plus MIN_MATCH bytes to insert the
	     * string following the next match.
	     */
	    while (zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile) { zip_fill_window(); }
	  }
	}

	function zip_init_deflate() {
	  if (zip_eofile) { return; }
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

	/* ==========================================================================
	 * Same as above, but achieves better compression. We use a lazy
	 * evaluation for matches: a match is finally adopted only if there is
	 * no better match at the next window position.
	 */
	function zip_deflate_internal(buff, off, buff_size) {
	  var n;

	  if (!zip_initflag) {
	    zip_init_deflate();
	    zip_initflag = true;
	    if (zip_lookahead == 0) { // empty
	      zip_complete = true;
	      return 0;
	    }
	  }

	  if ((n = zip_qcopy(buff, off, buff_size)) == buff_size) { return buff_size; }

	  if (zip_complete) { return n; }

	  if (zip_compr_level <= 3) // optimized for speed
	  { zip_deflate_fast(); } else { zip_deflate_better(); }
	  if (zip_lookahead == 0) {
	    if (zip_match_available != 0) { zip_ct_tally(0, zip_window[zip_strstart - 1] & 0xff); }
	    zip_flush_block(1);
	    zip_complete = true;
	  }
	  return n + zip_qcopy(buff, n + off, buff_size - n);
	}

	function zip_qcopy(buff, off, buff_size) {
	  var n, i, j;

	  n = 0;
	  while (zip_qhead != null && n < buff_size) {
	    i = buff_size - n;
	    if (i > zip_qhead.len) { i = zip_qhead.len; }
	    //      System.arraycopy(qhead.ptr, qhead.off, buff, off + n, i);
	    for (j = 0; j < i; j++) { buff[off + n + j] = zip_qhead.ptr[zip_qhead.off + j]; }

	    zip_qhead.off += i;
	    zip_qhead.len -= i;
	    n += i;
	    if (zip_qhead.len == 0) {
	      var p;
	      p = zip_qhead;
	      zip_qhead = zip_qhead.next;
	      zip_reuse_queue(p);
	    }
	  }

	  if (n == buff_size) { return n; }

	  if (zip_outoff < zip_outcnt) {
	    i = buff_size - n;
	    if (i > zip_outcnt - zip_outoff) { i = zip_outcnt - zip_outoff; }
	    // System.arraycopy(outbuf, outoff, buff, off + n, i);
	    for (j = 0; j < i; j++) { buff[off + n + j] = zip_outbuf[zip_outoff + j]; }
	    zip_outoff += i;
	    n += i;
	    if (zip_outcnt == zip_outoff) { zip_outcnt = zip_outoff = 0; }
	  }
	  return n;
	}

	/* ==========================================================================
	 * Allocate the match buffer, initialize the various tables and save the
	 * location of the internal file attribute (ascii/binary) and method
	 * (DEFLATE/STORE).
	 */
	function zip_ct_init() {
	  var n;	// iterates over tree elements
	  var bits;	// bit counter
	  var length;	// length value
	  var code;	// code value
	  var dist;	// distance index

	  if (zip_static_dtree[0].dl != 0) return; // ct_init already called

	  zip_l_desc.dyn_tree		= zip_dyn_ltree;
	  zip_l_desc.static_tree	= zip_static_ltree;
	  zip_l_desc.extra_bits	= zip_extra_lbits;
	  zip_l_desc.extra_base	= zip_LITERALS + 1;
	  zip_l_desc.elems		= zip_L_CODES;
	  zip_l_desc.max_length	= zip_MAX_BITS;
	  zip_l_desc.max_code		= 0;

	  zip_d_desc.dyn_tree		= zip_dyn_dtree;
	  zip_d_desc.static_tree	= zip_static_dtree;
	  zip_d_desc.extra_bits	= zip_extra_dbits;
	  zip_d_desc.extra_base	= 0;
	  zip_d_desc.elems		= zip_D_CODES;
	  zip_d_desc.max_length	= zip_MAX_BITS;
	  zip_d_desc.max_code		= 0;

	  zip_bl_desc.dyn_tree	= zip_bl_tree;
	  zip_bl_desc.static_tree	= null;
	  zip_bl_desc.extra_bits	= zip_extra_blbits;
	  zip_bl_desc.extra_base	= 0;
	  zip_bl_desc.elems		= zip_BL_CODES;
	  zip_bl_desc.max_length	= zip_MAX_BL_BITS;
	  zip_bl_desc.max_code	= 0;

	  // Initialize the mapping length (0..255) -> length code (0..28)
	  length = 0;
	  for (code = 0; code < zip_LENGTH_CODES - 1; code++) {
	    zip_base_length[code] = length;
	    for (n = 0; n < (1 << zip_extra_lbits[code]); n++) { zip_length_code[length++] = code; }
	  }
	  // Assert (length == 256, "ct_init: length != 256");

	  /* Note that the length 255 (match length 258) can be represented
	   * in two different ways: code 284 + 5 bits or code 285, so we
	   * overwrite length_code[255] to use the best encoding:
	   */
	  zip_length_code[length - 1] = code;

	  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
	  dist = 0;
	  for (code = 0; code < 16; code++) {
	    zip_base_dist[code] = dist;
	    for (n = 0; n < (1 << zip_extra_dbits[code]); n++) {
	      zip_dist_code[dist++] = code;
	    }
	  }
	  // Assert (dist == 256, "ct_init: dist != 256");
	  dist >>= 7; // from now on, all distances are divided by 128
	  for (; code < zip_D_CODES; code++) {
	    zip_base_dist[code] = dist << 7;
	    for (n = 0; n < (1 << (zip_extra_dbits[code] - 7)); n++) { zip_dist_code[256 + dist++] = code; }
	  }
	  // Assert (dist == 256, "ct_init: 256+dist != 512");

	  // Construct the codes of the static literal tree
	  for (bits = 0; bits <= zip_MAX_BITS; bits++) { zip_bl_count[bits] = 0; }
	  n = 0;
	  while (n <= 143) { zip_static_ltree[n++].dl = 8; zip_bl_count[8]++; }
	  while (n <= 255) { zip_static_ltree[n++].dl = 9; zip_bl_count[9]++; }
	  while (n <= 279) { zip_static_ltree[n++].dl = 7; zip_bl_count[7]++; }
	  while (n <= 287) { zip_static_ltree[n++].dl = 8; zip_bl_count[8]++; }
	  /* Codes 286 and 287 do not exist, but we must include them in the
	   * tree construction to get a canonical Huffman tree (longest code
	   * all ones)
	   */
	  zip_gen_codes(zip_static_ltree, zip_L_CODES + 1);

	  /* The static distance tree is trivial: */
	  for (n = 0; n < zip_D_CODES; n++) {
	    zip_static_dtree[n].dl = 5;
	    zip_static_dtree[n].fc = zip_bi_reverse(n, 5);
	  }

	  // Initialize the first block of the first file:
	  zip_init_block();
	}

	/* ==========================================================================
	 * Initialize a new block.
	 */
	function zip_init_block() {
	  var n; // iterates over tree elements

	  // Initialize the trees.
	  for (n = 0; n < zip_L_CODES;  n++) zip_dyn_ltree[n].fc = 0;
	  for (n = 0; n < zip_D_CODES;  n++) zip_dyn_dtree[n].fc = 0;
	  for (n = 0; n < zip_BL_CODES; n++) zip_bl_tree[n].fc = 0;

	  zip_dyn_ltree[zip_END_BLOCK].fc = 1;
	  zip_opt_len = zip_static_len = 0;
	  zip_last_lit = zip_last_dist = zip_last_flags = 0;
	  zip_flags = 0;
	  zip_flag_bit = 1;
	}

	/* ==========================================================================
	 * Restore the heap property by moving down the tree starting at node k,
	 * exchanging a node with the smallest of its two sons if necessary, stopping
	 * when the heap property is re-established (each father smaller than its
	 * two sons).
	 */
	function zip_pqdownheap(
	  tree,	// the tree to restore
	  k) {	// node to move down
	  var v = zip_heap[k];
	  var j = k << 1;	// left son of k

	  while (j <= zip_heap_len) {
	    // Set j to the smallest of the two sons:
	    if (j < zip_heap_len &&
	      zip_SMALLER(tree, zip_heap[j + 1], zip_heap[j])) { j++; }

	    // Exit if v is smaller than both sons
	    if (zip_SMALLER(tree, v, zip_heap[j])) { break; }

	    // Exchange v with the smallest son
	    zip_heap[k] = zip_heap[j];
	    k = j;

	    // And continue down the tree, setting j to the left son of k
	    j <<= 1;
	  }
	  zip_heap[k] = v;
	}

	/* ==========================================================================
	 * Compute the optimal bit lengths for a tree and update the total bit length
	 * for the current block.
	 * IN assertion: the fields freq and dad are set, heap[heap_max] and
	 *    above are the tree nodes sorted by increasing frequency.
	 * OUT assertions: the field len is set to the optimal bit length, the
	 *     array bl_count contains the frequencies for each bit length.
	 *     The length opt_len is updated; static_len is also updated if stree is
	 *     not null.
	 */
	function zip_gen_bitlen(desc) { // the tree descriptor
	  var tree		= desc.dyn_tree;
	  var extra		= desc.extra_bits;
	  var base		= desc.extra_base;
	  var max_code	= desc.max_code;
	  var max_length	= desc.max_length;
	  var stree		= desc.static_tree;
	  var h;		// heap index
	  var n, m;		// iterate over the tree elements
	  var bits;		// bit length
	  var xbits;		// extra bits
	  var f;		// frequency
	  var overflow = 0;	// number of elements with bit length too large

	  for (bits = 0; bits <= zip_MAX_BITS; bits++) { zip_bl_count[bits] = 0; }

	  /* In a first pass, compute the optimal bit lengths (which may
	   * overflow in the case of the bit length tree).
	   */
	  tree[zip_heap[zip_heap_max]].dl = 0; // root of the heap

	  for (h = zip_heap_max + 1; h < zip_HEAP_SIZE; h++) {
	    n = zip_heap[h];
	    bits = tree[tree[n].dl].dl + 1;
	    if (bits > max_length) {
	      bits = max_length;
	      overflow++;
	    }
	    tree[n].dl = bits;
	    // We overwrite tree[n].dl which is no longer needed

	    if (n > max_code) { continue; } // not a leaf node

	    zip_bl_count[bits]++;
	    xbits = 0;
	    if (n >= base) { xbits = extra[n - base]; }
	    f = tree[n].fc;
	    zip_opt_len += f * (bits + xbits);
	    if (stree != null) { zip_static_len += f * (stree[n].dl + xbits); }
	  }
	  if (overflow == 0) { return; }

	  // This happens for example on obj2 and pic of the Calgary corpus

	  // Find the first bit length which could increase:
	  do {
	    bits = max_length - 1;
	    while (zip_bl_count[bits] == 0) { bits--; }
	    zip_bl_count[bits]--;		// move one leaf down the tree
	    zip_bl_count[bits + 1] += 2;	// move one overflow item as its brother
	    zip_bl_count[max_length]--;
	    /* The brother of the overflow item also moves one step up,
	     * but this does not affect bl_count[max_length]
	     */
	    overflow -= 2;
	  } while (overflow > 0);

	  /* Now recompute all bit lengths, scanning in increasing frequency.
	   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
	   * lengths instead of fixing only the wrong ones. This idea is taken
	   * from 'ar' written by Haruhiko Okumura.)
	   */
	  for (bits = max_length; bits != 0; bits--) {
	    n = zip_bl_count[bits];
	    while (n != 0) {
	      m = zip_heap[--h];
	      if (m > max_code) { continue; }
	      if (tree[m].dl != bits) {
	        zip_opt_len += (bits - tree[m].dl) * tree[m].fc;
	        tree[m].fc = bits;
	      }
	      n--;
	    }
	  }
	}

	/* ==========================================================================
	 * Generate the codes for a given tree and bit counts (which need not be
	 * optimal).
	 * IN assertion: the array bl_count contains the bit length statistics for
	 * the given tree and the field len is set for all tree elements.
	 * OUT assertion: the field code is set for all tree elements of non
	 *     zero code length.
	 */
	function zip_gen_codes(tree,	// the tree to decorate
	  max_code) {	// largest code with non zero frequency
	  var next_code = new Array(zip_MAX_BITS + 1); // next code value for each bit length
	  var code = 0;		// running code value
	  var bits;			// bit index
	  var n;			// code index

	  /* The distribution counts are first used to generate the code values
	   * without bit reversal.
	   */
	  for (bits = 1; bits <= zip_MAX_BITS; bits++) {
	    code = ((code + zip_bl_count[bits - 1]) << 1);
	    next_code[bits] = code;
	  }

	  /* Check that the bit counts in bl_count are consistent. The last code
	   * must be all ones.
	   */
	  //    Assert (code + encoder->bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
	  //	    "inconsistent bit counts");
	  //    Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

	  for (n = 0; n <= max_code; n++) {
	    var len = tree[n].dl;
	    if (len == 0) { continue; }
	    // Now reverse the bits
	    tree[n].fc = zip_bi_reverse(next_code[len]++, len);

	    //      Tracec(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
	    //	  n, (isgraph(n) ? n : ' '), len, tree[n].fc, next_code[len]-1));
	  }
	}

	/* ==========================================================================
	 * Construct one Huffman tree and assigns the code bit strings and lengths.
	 * Update the total bit length for the current block.
	 * IN assertion: the field freq is set for all tree elements.
	 * OUT assertions: the fields len and code are set to the optimal bit length
	 *     and corresponding code. The length opt_len is updated; static_len is
	 *     also updated if stree is not null. The field max_code is set.
	 */
	function zip_build_tree(desc) { // the tree descriptor
	  var tree	= desc.dyn_tree;
	  var stree	= desc.static_tree;
	  var elems	= desc.elems;
	  var n, m;		// iterate over heap elements
	  var max_code = -1;	// largest code with non zero frequency
	  var node = elems;	// next internal node of the tree

	  /* Construct the initial heap, with least frequent element in
	   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
	   * heap[0] is not used.
	   */
	  zip_heap_len = 0;
	  zip_heap_max = zip_HEAP_SIZE;

	  for (n = 0; n < elems; n++) {
	    if (tree[n].fc != 0) {
	      zip_heap[++zip_heap_len] = max_code = n;
	      zip_depth[n] = 0;
	    } else { tree[n].dl = 0; }
	  }

	  /* The pkzip format requires that at least one distance code exists,
	   * and that at least one bit should be sent even if there is only one
	   * possible code. So to avoid special checks later on we force at least
	   * two codes of non zero frequency.
	   */
	  while (zip_heap_len < 2) {
	    var xnew = zip_heap[++zip_heap_len] = (max_code < 2 ? ++max_code : 0);
	    tree[xnew].fc = 1;
	    zip_depth[xnew] = 0;
	    zip_opt_len--;
	    if (stree != null) { zip_static_len -= stree[xnew].dl; }
	    // new is 0 or 1 so it does not have extra bits
	  }
	  desc.max_code = max_code;

	  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
	   * establish sub-heaps of increasing lengths:
	   */
	  for (n = zip_heap_len >> 1; n >= 1; n--) { zip_pqdownheap(tree, n); }

	  /* Construct the Huffman tree by repeatedly combining the least two
	   * frequent nodes.
	   */
	  do {
	    n = zip_heap[zip_SMALLEST];
	    zip_heap[zip_SMALLEST] = zip_heap[zip_heap_len--];
	    zip_pqdownheap(tree, zip_SMALLEST);

	    m = zip_heap[zip_SMALLEST];  // m = node of next least frequency

	    // keep the nodes sorted by frequency
	    zip_heap[--zip_heap_max] = n;
	    zip_heap[--zip_heap_max] = m;

	    // Create a new node father of n and m
	    tree[node].fc = tree[n].fc + tree[m].fc;
	    //	depth[node] = (char)(MAX(depth[n], depth[m]) + 1);
	    if (zip_depth[n] > zip_depth[m] + 1) { zip_depth[node] = zip_depth[n]; } else { zip_depth[node] = zip_depth[m] + 1; }
	    tree[n].dl = tree[m].dl = node;

	    // and insert the new node in the heap
	    zip_heap[zip_SMALLEST] = node++;
	    zip_pqdownheap(tree, zip_SMALLEST);

	  } while (zip_heap_len >= 2);

	  zip_heap[--zip_heap_max] = zip_heap[zip_SMALLEST];

	  /* At this point, the fields freq and dad are set. We can now
	   * generate the bit lengths.
	   */
	  zip_gen_bitlen(desc);

	  // The field len is now set, we can generate the bit codes
	  zip_gen_codes(tree, max_code);
	}

	/* ==========================================================================
	 * Scan a literal or distance tree to determine the frequencies of the codes
	 * in the bit length tree. Updates opt_len to take into account the repeat
	 * counts. (The contribution of the bit length codes will be added later
	 * during the construction of bl_tree.)
	 */
	function zip_scan_tree(tree, // the tree to be scanned
	  max_code) {  // and its largest code of non zero frequency
	  var n;			// iterates over all tree elements
	  var prevlen = -1;		// last emitted length
	  var curlen;			// length of current code
	  var nextlen = tree[0].dl;	// length of next code
	  var count = 0;		// repeat count of the current code
	  var max_count = 7;		// max repeat count
	  var min_count = 4;		// min repeat count

	  if (nextlen == 0) {
	    max_count = 138;
	    min_count = 3;
	  }
	  tree[max_code + 1].dl = 0xffff; // guard

	  for (n = 0; n <= max_code; n++) {
	    curlen = nextlen;
	    nextlen = tree[n + 1].dl;
	    if (++count < max_count && curlen == nextlen) { continue; } else if (count < min_count) { zip_bl_tree[curlen].fc += count; } else if (curlen != 0) {
	      if (curlen != prevlen) { zip_bl_tree[curlen].fc++; }
	      zip_bl_tree[zip_REP_3_6].fc++;
	    } else if (count <= 10) { zip_bl_tree[zip_REPZ_3_10].fc++; } else { zip_bl_tree[zip_REPZ_11_138].fc++; }
	    count = 0; prevlen = curlen;
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

	/* ==========================================================================
	 * Send a literal or distance tree in compressed form, using the codes in
	 * bl_tree.
	 */
	function zip_send_tree(tree, // the tree to be scanned
	  max_code) { // and its largest code of non zero frequency
	  var n;			// iterates over all tree elements
	  var prevlen = -1;		// last emitted length
	  var curlen;			// length of current code
	  var nextlen = tree[0].dl;	// length of next code
	  var count = 0;		// repeat count of the current code
	  var max_count = 7;		// max repeat count
	  var min_count = 4;		// min repeat count

	  /* tree[max_code+1].dl = -1; */  /* guard already set */
	  if (nextlen == 0) {
	    max_count = 138;
	    min_count = 3;
	  }

	  for (n = 0; n <= max_code; n++) {
	    curlen = nextlen;
	    nextlen = tree[n + 1].dl;
	    if (++count < max_count && curlen == nextlen) {
	      continue;
	    } else if (count < min_count) {
	      do { zip_SEND_CODE(curlen, zip_bl_tree); } while (--count != 0);
	    } else if (curlen != 0) {
	      if (curlen != prevlen) {
	        zip_SEND_CODE(curlen, zip_bl_tree);
	        count--;
	      }
	      // Assert(count >= 3 && count <= 6, " 3_6?");
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

	/* ==========================================================================
	 * Construct the Huffman tree for the bit lengths and return the index in
	 * bl_order of the last bit length code to send.
	 */
	function zip_build_bl_tree() {
	  var max_blindex;  // index of last bit length code of non zero freq

	  // Determine the bit length frequencies for literal and distance trees
	  zip_scan_tree(zip_dyn_ltree, zip_l_desc.max_code);
	  zip_scan_tree(zip_dyn_dtree, zip_d_desc.max_code);

	  // Build the bit length tree:
	  zip_build_tree(zip_bl_desc);
	  /* opt_len now includes the length of the tree representations, except
	   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
	   */

	  /* Determine the number of bit length codes to send. The pkzip format
	   * requires that at least 4 bit length codes be sent. (appnote.txt says
	   * 3 but the actual value used is 4.)
	   */
	  for (max_blindex = zip_BL_CODES - 1; max_blindex >= 3; max_blindex--) {
	    if (zip_bl_tree[zip_bl_order[max_blindex]].dl != 0) break;
	  }
	  /* Update opt_len to include the bit length tree and counts */
	  zip_opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
	  //    Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
	  //	    encoder->opt_len, encoder->static_len));

	  return max_blindex;
	}

	/* ==========================================================================
	 * Send the header for a block using dynamic Huffman trees: the counts, the
	 * lengths of the bit length codes, the literal tree and the distance tree.
	 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
	 */
	function zip_send_all_trees(lcodes, dcodes, blcodes) { // number of codes for each tree
	  var rank; // index in bl_order

	  //    Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
	  //    Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
	  //	    "too many codes");
	  //    Tracev((stderr, "\nbl counts: "));
	  zip_send_bits(lcodes - 257, 5); // not +255 as stated in appnote.txt
	  zip_send_bits(dcodes - 1,   5);
	  zip_send_bits(blcodes - 4,  4); // not -3 as stated in appnote.txt
	  for (rank = 0; rank < blcodes; rank++) {
	    //      Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
	    zip_send_bits(zip_bl_tree[zip_bl_order[rank]].dl, 3);
	  }

	  // send the literal tree
	  zip_send_tree(zip_dyn_ltree, lcodes - 1);

	  // send the distance tree
	  zip_send_tree(zip_dyn_dtree, dcodes - 1);
	}

	/* ==========================================================================
	 * Determine the best encoding for the current block: dynamic trees, static
	 * trees or store, and output the encoded block to the zip file.
	 */
	function zip_flush_block(eof) { // true if this is the last block for a file
	  var opt_lenb, static_lenb; // opt_len and static_len in bytes
	  var max_blindex;	// index of last bit length code of non zero freq
	  var stored_len;	// length of input block

	  stored_len = zip_strstart - zip_block_start;
	  zip_flag_buf[zip_last_flags] = zip_flags; // Save the flags for the last 8 items

	  // Construct the literal and distance trees
	  zip_build_tree(zip_l_desc);
	  //    Tracev((stderr, "\nlit data: dyn %ld, stat %ld",
	  //	    encoder->opt_len, encoder->static_len));

	  zip_build_tree(zip_d_desc);
	  //    Tracev((stderr, "\ndist data: dyn %ld, stat %ld",
	  //	    encoder->opt_len, encoder->static_len));
	  /* At this point, opt_len and static_len are the total bit lengths of
	   * the compressed block data, excluding the tree representations.
	   */

	  /* Build the bit length tree for the above two trees, and get the index
	   * in bl_order of the last bit length code to send.
	   */
	  max_blindex = zip_build_bl_tree();

	  // Determine the best encoding. Compute first the block length in bytes
	  opt_lenb	= (zip_opt_len   + 3 + 7) >> 3;
	  static_lenb = (zip_static_len + 3 + 7) >> 3;

	  //    Trace((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u dist %u ",
	  //	   opt_lenb, encoder->opt_len,
	  //	   static_lenb, encoder->static_len, stored_len,
	  //	   encoder->last_lit, encoder->last_dist));

	  if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }
	  if (stored_len + 4 <= opt_lenb // 4: two words for the lengths
	    && zip_block_start >= 0) {
	    var i;

	    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
	     * Otherwise we can't have processed more than WSIZE input bytes since
	     * the last block flush, because compression would have been
	     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
	     * transform a block into a stored block.
	     */
	    zip_send_bits((zip_STORED_BLOCK << 1) + eof, 3);  /* send block type */
	    zip_bi_windup();		 /* align on byte boundary */
	    zip_put_short(stored_len);
	    zip_put_short(~stored_len);

	    // copy block
	    /*
	      p = &window[block_start];
	      for(i = 0; i < stored_len; i++)
	  put_byte(p[i]);
	  */
	    for (i = 0; i < stored_len; i++) { zip_put_byte(zip_window[zip_block_start + i]); }

	  } else if (static_lenb == opt_lenb) {
	    zip_send_bits((zip_STATIC_TREES << 1) + eof, 3);
	    zip_compress_block(zip_static_ltree, zip_static_dtree);
	  } else {
	    zip_send_bits((zip_DYN_TREES << 1) + eof, 3);
	    zip_send_all_trees(zip_l_desc.max_code + 1,
	      zip_d_desc.max_code + 1,
	      max_blindex + 1);
	    zip_compress_block(zip_dyn_ltree, zip_dyn_dtree);
	  }

	  zip_init_block();

	  if (eof != 0) { zip_bi_windup(); }
	}

	/* ==========================================================================
	 * Save the match info and tally the frequency counts. Return true if
	 * the current block must be flushed.
	 */
	function zip_ct_tally(
	  dist, // distance of matched string
	  lc) { // match length-MIN_MATCH or unmatched char (if dist==0)
	  zip_l_buf[zip_last_lit++] = lc;
	  if (dist == 0) {
	    // lc is the unmatched char
	    zip_dyn_ltree[lc].fc++;
	  } else {
	    // Here, lc is the match length - MIN_MATCH
	    dist--;		    // dist = match distance - 1
	    //      Assert((ush)dist < (ush)MAX_DIST &&
	    //	     (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
	    //	     (ush)D_CODE(dist) < (ush)D_CODES,  "ct_tally: bad match");

	    zip_dyn_ltree[zip_length_code[lc] + zip_LITERALS + 1].fc++;
	    zip_dyn_dtree[zip_D_CODE(dist)].fc++;

	    zip_d_buf[zip_last_dist++] = dist;
	    zip_flags |= zip_flag_bit;
	  }
	  zip_flag_bit <<= 1;

	  // Output the flags if they fill a byte
	  if ((zip_last_lit & 7) == 0) {
	    zip_flag_buf[zip_last_flags++] = zip_flags;
	    zip_flags = 0;
	    zip_flag_bit = 1;
	  }
	  // Try to guess if it is profitable to stop the current block here
	  if (zip_compr_level > 2 && (zip_last_lit & 0xfff) == 0) {
	    // Compute an upper bound for the compressed length
	    var out_length = zip_last_lit * 8;
	    var in_length = zip_strstart - zip_block_start;
	    var dcode;

	    for (dcode = 0; dcode < zip_D_CODES; dcode++) {
	      out_length += zip_dyn_dtree[dcode].fc * (5 + zip_extra_dbits[dcode]);
	    }
	    out_length >>= 3;
	    //      Trace((stderr,"\nlast_lit %u, last_dist %u, in %ld, out ~%ld(%ld%%) ",
	    //	     encoder->last_lit, encoder->last_dist, in_length, out_length,
	    //	     100L - out_length*100L/in_length));
	    if (zip_last_dist < parseInt(zip_last_lit / 2) &&
	      out_length < parseInt(in_length / 2)) { return true; }
	  }
	  return (zip_last_lit == zip_LIT_BUFSIZE - 1 ||
	    zip_last_dist == zip_DIST_BUFSIZE);
	  /* We avoid equality with LIT_BUFSIZE because of wraparound at 64K
	   * on 16 bit machines and because stored blocks are restricted to
	   * 64K-1 bytes.
	   */
	}

	/* ==========================================================================
	 * Send the block data compressed using the given Huffman trees
	 */
	function zip_compress_block(
	  ltree,	// literal tree
	  dtree) {	// distance tree
	  var dist;		// distance of matched string
	  var lc;		// match length or unmatched char (if dist == 0)
	  var lx = 0;		// running index in l_buf
	  var dx = 0;		// running index in d_buf
	  var fx = 0;		// running index in flag_buf
	  var flag = 0;	// current flags
	  var code;		// the code to send
	  var extra;		// number of extra bits to send

	  if (zip_last_lit != 0) {
	    do {
	      if ((lx & 7) == 0) { flag = zip_flag_buf[fx++]; }
	      lc = zip_l_buf[lx++] & 0xff;
	      if ((flag & 1) == 0) {
	        zip_SEND_CODE(lc, ltree); /* send a literal byte */
	      //	Tracecv(isgraph(lc), (stderr," '%c' ", lc));
	      } else {
	      // Here, lc is the match length - MIN_MATCH
	        code = zip_length_code[lc];
	        zip_SEND_CODE(code + zip_LITERALS + 1, ltree); // send the length code
	        extra = zip_extra_lbits[code];
	        if (extra != 0) {
	          lc -= zip_base_length[code];
	          zip_send_bits(lc, extra); // send the extra length bits
	        }
	        dist = zip_d_buf[dx++];
	        // Here, dist is the match distance - 1
	        code = zip_D_CODE(dist);
	        //	Assert (code < D_CODES, "bad d_code");

	        zip_SEND_CODE(code, dtree);	  // send the distance code
	        extra = zip_extra_dbits[code];
	        if (extra != 0) {
	          dist -= zip_base_dist[code];
	          zip_send_bits(dist, extra);   // send the extra distance bits
	        }
	      } // literal or match pair ?
	      flag >>= 1;
	    } while (lx < zip_last_lit);
	  }

	  zip_SEND_CODE(zip_END_BLOCK, ltree);
	}

	/* ==========================================================================
	 * Send a value on a given number of bits.
	 * IN assertion: length <= 16 and value fits in length bits.
	 */
	var zip_Buf_size = 16; // bit size of bi_buf
	function zip_send_bits(
	  value,	// value to send
	  length) {	// number of bits
	  /* If not enough room in bi_buf, use (valid) bits from bi_buf and
	   * (16 - bi_valid) bits from value, leaving (width - (16-bi_valid))
	   * unused bits in value.
	   */
	  if (zip_bi_valid > zip_Buf_size - length) {
	    zip_bi_buf |= (value << zip_bi_valid);
	    zip_put_short(zip_bi_buf);
	    zip_bi_buf = (value >> (zip_Buf_size - zip_bi_valid));
	    zip_bi_valid += length - zip_Buf_size;
	  } else {
	    zip_bi_buf |= value << zip_bi_valid;
	    zip_bi_valid += length;
	  }
	}

	/* ==========================================================================
	 * Reverse the first len bits of a code, using straightforward code (a faster
	 * method would use a table)
	 * IN assertion: 1 <= len <= 15
	 */
	function zip_bi_reverse(
	  code,	// the value to invert
	  len) {	// its bit length
	  var res = 0;
	  do {
	    res |= code & 1;
	    code >>= 1;
	    res <<= 1;
	  } while (--len > 0);
	  return res >> 1;
	}

	/* ==========================================================================
	 * Write out any remaining bits in an incomplete byte.
	 */
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
	    if (zip_qhead == null) { zip_qhead = zip_qtail = q; } else { zip_qtail = zip_qtail.next = q; }
	    q.len = zip_outcnt - zip_outoff;
	    //      System.arraycopy(zip_outbuf, zip_outoff, q.ptr, 0, q.len);
	    for (i = 0; i < q.len; i++) { q.ptr[i] = zip_outbuf[zip_outoff + i]; }
	    zip_outcnt = zip_outoff = 0;
	  }
	}

	function zip_deflate(str, level) {
	  var out, buff;
	  var i, j;

	  zip_deflate_data = str;
	  zip_deflate_pos = 0;
	  if (typeof level === 'undefined') { level = zip_DEFAULT_LEVEL; }
	  zip_deflate_start(level);

	  buff = new Array(1024);
	  out = '';
	  while ((i = zip_deflate_internal(buff, 0, buff.length)) > 0) {
	    for (j = 0; j < i; j++) { out += String.fromCharCode(buff[j]); }
	  }
	  zip_deflate_data = null; // G.C.
	  return out;
	}

	function encode64(data) {
	  var r = '';
	  for (var i = 0; i < data.length; i += 3) {
	    if (i + 2 == data.length) {
	      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
	    } else if (i + 1 == data.length) {
	      r += append3bytes(data.charCodeAt(i), 0, 0);
	    } else {
	      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2));
	    }
	  }
	  return r;
	}

	function append3bytes(b1, b2, b3) {
	  var c1 = b1 >> 2;
	  var c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
	  var c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
	  var c4 = b3 & 0x3F;
	  var r = '';
	  r += encode6bit(c1 & 0x3F);
	  r += encode6bit(c2 & 0x3F);
	  r += encode6bit(c3 & 0x3F);
	  r += encode6bit(c4 & 0x3F);
	  return r;
	}

	function encode6bit(b) {
	  if (b < 10) {
	    return String.fromCharCode(48 + b);
	  }
	  b -= 10;
	  if (b < 26) {
	    return String.fromCharCode(65 + b);
	  }
	  b -= 26;
	  if (b < 26) {
	    return String.fromCharCode(97 + b);
	  }
	  b -= 26;
	  if (b == 0) {
	    return '-';
	  }
	  if (b == 1) {
	    return '_';
	  }
	  return '?';
	}
	return deflate;
}

var markdownItPlantuml = function umlPlugin(md, options) {

  function generateSourceDefault(umlCode, pluginOptions) {
    var imageFormat = pluginOptions.imageFormat || 'svg';
    var diagramName = pluginOptions.diagramName || 'uml';
    var server = pluginOptions.server || 'https://www.plantuml.com/plantuml';
    var deflate = requireDeflate();
    var zippedCode = deflate.encode64(
      deflate.zip_deflate(
        unescape(encodeURIComponent(
          '@start' + diagramName + '\n' + umlCode + '\n@end' + diagramName)),
        9
      )
    );

    return server + '/' + imageFormat + '/' + zippedCode;
  }

  options = options || {};

  var openMarker = options.openMarker || '@startuml',
      openChar = openMarker.charCodeAt(0),
      closeMarker = options.closeMarker || '@enduml',
      closeChar = closeMarker.charCodeAt(0),
      render = options.render || md.renderer.rules.image,
      generateSource = options.generateSource || generateSourceDefault;

  function uml(state, startLine, endLine, silent) {
    var nextLine, markup, params, token, i,
        autoClosed = false,
        start = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-uml blocks
    //
    if (openChar !== state.src.charCodeAt(start)) { return false; }

    // Check out the rest of the marker string
    //
    for (i = 0; i < openMarker.length; ++i) {
      if (openMarker[i] !== state.src[start + i]) { return false; }
    }

    markup = state.src.slice(start, start + i);
    params = state.src.slice(start + i, max);

    // Since start is found, we can report success here in validation mode
    //
    if (silent) { return true; }

    // Search for the end of the block
    //
    nextLine = startLine;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (start < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }

      if (closeChar !== state.src.charCodeAt(start)) {
        // didn't find the closing fence
        continue;
      }

      if (state.sCount[nextLine] > state.sCount[startLine]) {
        // closing fence should not be indented with respect of opening fence
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

      // make sure tail has spaces only
      if (state.skipSpaces(start + i) < max) {
        continue;
      }

      // found!
      autoClosed = true;
      break;
    }

    var contents = state.src
      .split('\n')
      .slice(startLine + 1, nextLine)
      .join('\n');

    // We generate a token list for the alt property, to mimic what the image parser does.
    var altToken = [];
    // Remove leading space if any.
    var alt = params ? params.slice(1) : 'uml diagram';
    state.md.inline.parse(
      alt,
      state.md,
      state.env,
      altToken
    );

    token = state.push('uml_diagram', 'img', 0);
    // alt is constructed from children. No point in populating it here.
    token.attrs = [ [ 'src', generateSource(contents, options) ], [ 'alt', '' ] ];
    token.block = true;
    token.children = altToken;
    token.info = params;
    token.map = [ startLine, nextLine ];
    token.markup = markup;

    state.line = nextLine + (autoClosed ? 1 : 0);

    return true;
  }

  md.block.ruler.before('fence', 'uml_diagram', uml, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
  });
  md.renderer.rules.uml_diagram = render;
};

var mdPlantUML = /*@__PURE__*/getDefaultExportFromCjs(markdownItPlantuml);

const d=e=>{const t=e.renderer.rules.image;e.renderer.rules.image=(r,a,l,n,o)=>(r[a].attrSet("loading","lazy"),t(r,a,l,n,o));};

/* eslint-disable no-multi-assign */

function deepFreeze(obj) {
  if (obj instanceof Map) {
    obj.clear =
      obj.delete =
      obj.set =
        function () {
          throw new Error('map is read-only');
        };
  } else if (obj instanceof Set) {
    obj.add =
      obj.clear =
      obj.delete =
        function () {
          throw new Error('set is read-only');
        };
  }

  // Freeze self
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((name) => {
    const prop = obj[name];
    const type = typeof prop;

    // Freeze prop if it is an object or function and also not already frozen
    if ((type === 'object' || type === 'function') && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });

  return obj;
}

/** @typedef {import('highlight.js').CallbackResponse} CallbackResponse */
/** @typedef {import('highlight.js').CompiledMode} CompiledMode */
/** @implements CallbackResponse */

class Response {
  /**
   * @param {CompiledMode} mode
   */
  constructor(mode) {
    // eslint-disable-next-line no-undefined
    if (mode.data === undefined) mode.data = {};

    this.data = mode.data;
    this.isMatchIgnored = false;
  }

  ignoreMatch() {
    this.isMatchIgnored = true;
  }
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHTML(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * performs a shallow merge of multiple objects into one
 *
 * @template T
 * @param {T} original
 * @param {Record<string,any>[]} objects
 * @returns {T} a single new object
 */
function inherit$1(original, ...objects) {
  /** @type Record<string,any> */
  const result = Object.create(null);

  for (const key in original) {
    result[key] = original[key];
  }
  objects.forEach(function(obj) {
    for (const key in obj) {
      result[key] = obj[key];
    }
  });
  return /** @type {T} */ (result);
}

/**
 * @typedef {object} Renderer
 * @property {(text: string) => void} addText
 * @property {(node: Node) => void} openNode
 * @property {(node: Node) => void} closeNode
 * @property {() => string} value
 */

/** @typedef {{scope?: string, language?: string, sublanguage?: boolean}} Node */
/** @typedef {{walk: (r: Renderer) => void}} Tree */
/** */

const SPAN_CLOSE = '</span>';

/**
 * Determines if a node needs to be wrapped in <span>
 *
 * @param {Node} node */
const emitsWrappingTags = (node) => {
  // rarely we can have a sublanguage where language is undefined
  // TODO: track down why
  return !!node.scope;
};

/**
 *
 * @param {string} name
 * @param {{prefix:string}} options
 */
const scopeToCSSClass = (name, { prefix }) => {
  // sub-language
  if (name.startsWith("language:")) {
    return name.replace("language:", "language-");
  }
  // tiered scope: comment.line
  if (name.includes(".")) {
    const pieces = name.split(".");
    return [
      `${prefix}${pieces.shift()}`,
      ...(pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`))
    ].join(" ");
  }
  // simple scope
  return `${prefix}${name}`;
};

/** @type {Renderer} */
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
  addText(text) {
    this.buffer += escapeHTML(text);
  }

  /**
   * Adds a node open to the output stream (if needed)
   *
   * @param {Node} node */
  openNode(node) {
    if (!emitsWrappingTags(node)) return;

    const className = scopeToCSSClass(node.scope,
      { prefix: this.classPrefix });
    this.span(className);
  }

  /**
   * Adds a node close to the output stream (if needed)
   *
   * @param {Node} node */
  closeNode(node) {
    if (!emitsWrappingTags(node)) return;

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

/** @typedef {{scope?: string, language?: string, children: Node[]} | string} Node */
/** @typedef {{scope?: string, language?: string, children: Node[]} } DataNode */
/** @typedef {import('highlight.js').Emitter} Emitter */
/**  */

/** @returns {DataNode} */
const newNode = (opts = {}) => {
  /** @type DataNode */
  const result = { children: [] };
  Object.assign(result, opts);
  return result;
};

class TokenTree {
  constructor() {
    /** @type DataNode */
    this.rootNode = newNode();
    this.stack = [this.rootNode];
  }

  get top() {
    return this.stack[this.stack.length - 1];
  }

  get root() { return this.rootNode; }

  /** @param {Node} node */
  add(node) {
    this.top.children.push(node);
  }

  /** @param {string} scope */
  openNode(scope) {
    /** @type Node */
    const node = newNode({ scope });
    this.add(node);
    this.stack.push(node);
  }

  closeNode() {
    if (this.stack.length > 1) {
      return this.stack.pop();
    }
    // eslint-disable-next-line no-undefined
    return undefined;
  }

  closeAllNodes() {
    while (this.closeNode());
  }

  toJSON() {
    return JSON.stringify(this.rootNode, null, 4);
  }

  /**
   * @typedef { import("./html_renderer").Renderer } Renderer
   * @param {Renderer} builder
   */
  walk(builder) {
    // this does not
    return this.constructor._walk(builder, this.rootNode);
    // this works
    // return TokenTree._walk(builder, this.rootNode);
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
      node.children.forEach((child) => this._walk(builder, child));
      builder.closeNode(node);
    }
    return builder;
  }

  /**
   * @param {Node} node
   */
  static _collapse(node) {
    if (typeof node === "string") return;
    if (!node.children) return;

    if (node.children.every(el => typeof el === "string")) {
      // node.text = node.children.join("");
      // delete node.children;
      node.children = [node.children.join("")];
    } else {
      node.children.forEach((child) => {
        TokenTree._collapse(child);
      });
    }
  }
}

/**
  Currently this is all private API, but this is the minimal API necessary
  that an Emitter must implement to fully support the parser.

  Minimal interface:

  - addText(text)
  - __addSublanguage(emitter, subLanguageName)
  - startScope(scope)
  - endScope()
  - finalize()
  - toHTML()

*/

/**
 * @implements {Emitter}
 */
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
  addText(text) {
    if (text === "") { return; }

    this.add(text);
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
  __addSublanguage(emitter, name) {
    /** @type DataNode */
    const node = emitter.root;
    if (name) node.scope = `language:${name}`;

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

/**
 * @param {string} value
 * @returns {RegExp}
 * */

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function source$1(re) {
  if (!re) return null;
  if (typeof re === "string") return re;

  return re.source;
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function lookahead$1(re) {
  return concat$1('(?=', re, ')');
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function anyNumberOfTimes(re) {
  return concat$1('(?:', re, ')*');
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function optional(re) {
  return concat$1('(?:', re, ')?');
}

/**
 * @param {...(RegExp | string) } args
 * @returns {string}
 */
function concat$1(...args) {
  const joined = args.map((x) => source$1(x)).join("");
  return joined;
}

/**
 * @param { Array<string | RegExp | Object> } args
 * @returns {object}
 */
function stripOptionsFromArgs$1(args) {
  const opts = args[args.length - 1];

  if (typeof opts === 'object' && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}

/** @typedef { {capture?: boolean} } RegexEitherOptions */

/**
 * Any of the passed expresssions may match
 *
 * Creates a huge this | this | that | that match
 * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
 * @returns {string}
 */
function either$1(...args) {
  /** @type { object & {capture?: boolean} }  */
  const opts = stripOptionsFromArgs$1(args);
  const joined = '('
    + (opts.capture ? "" : "?:")
    + args.map((x) => source$1(x)).join("|") + ")";
  return joined;
}

/**
 * @param {RegExp | string} re
 * @returns {number}
 */
function countMatchGroups(re) {
  return (new RegExp(re.toString() + '|')).exec('').length - 1;
}

/**
 * Does lexeme start with a regular expression match at the beginning
 * @param {RegExp} re
 * @param {string} lexeme
 */
function startsWith(re, lexeme) {
  const match = re && re.exec(lexeme);
  return match && match.index === 0;
}

// BACKREF_RE matches an open parenthesis or backreference. To avoid
// an incorrect parse, it additionally matches the following:
// - [...] elements, where the meaning of parentheses and escapes change
// - other escape sequences, so we do not misparse escape sequences as
//   interesting elements
// - non-matching or lookahead parentheses, which do not capture. These
//   follow the '(' with a '?'.
const BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;

// **INTERNAL** Not intended for outside usage
// join logically computes regexps.join(separator), but fixes the
// backreferences so they continue to match.
// it also places each individual regular expression into it's own
// match group, keeping track of the sequencing of those match groups
// is currently an exercise for the caller. :-)
/**
 * @param {(string | RegExp)[]} regexps
 * @param {{joinWith: string}} opts
 * @returns {string}
 */
function _rewriteBackreferences(regexps, { joinWith }) {
  let numCaptures = 0;

  return regexps.map((regex) => {
    numCaptures += 1;
    const offset = numCaptures;
    let re = source$1(regex);
    let out = '';

    while (re.length > 0) {
      const match = BACKREF_RE.exec(re);
      if (!match) {
        out += re;
        break;
      }
      out += re.substring(0, match.index);
      re = re.substring(match.index + match[0].length);
      if (match[0][0] === '\\' && match[1]) {
        // Adjust the backreference.
        out += '\\' + String(Number(match[1]) + offset);
      } else {
        out += match[0];
        if (match[0] === '(') {
          numCaptures++;
        }
      }
    }
    return out;
  }).map(re => `(${re})`).join(joinWith);
}

/** @typedef {import('highlight.js').Mode} Mode */
/** @typedef {import('highlight.js').ModeCallback} ModeCallback */

// Common regexps
const MATCH_NOTHING_RE = /\b\B/;
const IDENT_RE$2 = '[a-zA-Z]\\w*';
const UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
const NUMBER_RE = '\\b\\d+(\\.\\d+)?';
const C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
const BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
const RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

/**
* @param { Partial<Mode> & {binary?: string | RegExp} } opts
*/
const SHEBANG = (opts = {}) => {
  const beginShebang = /^#![ ]*\//;
  if (opts.binary) {
    opts.begin = concat$1(
      beginShebang,
      /.*\b/,
      opts.binary,
      /\b.*/);
  }
  return inherit$1({
    scope: 'meta',
    begin: beginShebang,
    end: /$/,
    relevance: 0,
    /** @type {ModeCallback} */
    "on:begin": (m, resp) => {
      if (m.index !== 0) resp.ignoreMatch();
    }
  }, opts);
};

// Common modes
const BACKSLASH_ESCAPE = {
  begin: '\\\\[\\s\\S]', relevance: 0
};
const APOS_STRING_MODE = {
  scope: 'string',
  begin: '\'',
  end: '\'',
  illegal: '\\n',
  contains: [BACKSLASH_ESCAPE]
};
const QUOTE_STRING_MODE = {
  scope: 'string',
  begin: '"',
  end: '"',
  illegal: '\\n',
  contains: [BACKSLASH_ESCAPE]
};
const PHRASAL_WORDS_MODE = {
  begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
};
/**
 * Creates a comment mode
 *
 * @param {string | RegExp} begin
 * @param {string | RegExp} end
 * @param {Mode | {}} [modeOptions]
 * @returns {Partial<Mode>}
 */
const COMMENT = function(begin, end, modeOptions = {}) {
  const mode = inherit$1(
    {
      scope: 'comment',
      begin,
      end,
      contains: []
    },
    modeOptions
  );
  mode.contains.push({
    scope: 'doctag',
    // hack to avoid the space from being included. the space is necessary to
    // match here to prevent the plain text rule below from gobbling up doctags
    begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
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
    /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, // contractions - can't we'd they're let's, etc
    /[A-Za-z]+[-][a-z]+/, // `no-way`, etc.
    /[A-Za-z][a-z]{2,}/ // allow capitalized words at beginning of sentences
  );
  // looking like plain text, more likely to be a comment
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
        /[ ]+/, // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
        '(',
        ENGLISH_WORD,
        /[.]?[:]?([.][ ]|[ ])/,
        '){3}') // look for 3 words in a row
    }
  );
  return mode;
};
const C_LINE_COMMENT_MODE = COMMENT('//', '$');
const C_BLOCK_COMMENT_MODE = COMMENT('/\\*', '\\*/');
const HASH_COMMENT_MODE = COMMENT('#', '$');
const NUMBER_MODE = {
  scope: 'number',
  begin: NUMBER_RE,
  relevance: 0
};
const C_NUMBER_MODE = {
  scope: 'number',
  begin: C_NUMBER_RE,
  relevance: 0
};
const BINARY_NUMBER_MODE = {
  scope: 'number',
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
  scope: 'title',
  begin: IDENT_RE$2,
  relevance: 0
};
const UNDERSCORE_TITLE_MODE = {
  scope: 'title',
  begin: UNDERSCORE_IDENT_RE,
  relevance: 0
};
const METHOD_GUARD = {
  // excludes method names from keyword processing
  begin: '\\.\\s*' + UNDERSCORE_IDENT_RE,
  relevance: 0
};

/**
 * Adds end same as begin mechanics to a mode
 *
 * Your mode must include at least a single () match group as that first match
 * group is what is used for comparison
 * @param {Partial<Mode>} mode
 */
const END_SAME_AS_BEGIN = function(mode) {
  return Object.assign(mode,
    {
      /** @type {ModeCallback} */
      'on:begin': (m, resp) => { resp.data._beginMatch = m[1]; },
      /** @type {ModeCallback} */
      'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); }
    });
};

var MODES$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  APOS_STRING_MODE: APOS_STRING_MODE,
  BACKSLASH_ESCAPE: BACKSLASH_ESCAPE,
  BINARY_NUMBER_MODE: BINARY_NUMBER_MODE,
  BINARY_NUMBER_RE: BINARY_NUMBER_RE,
  COMMENT: COMMENT,
  C_BLOCK_COMMENT_MODE: C_BLOCK_COMMENT_MODE,
  C_LINE_COMMENT_MODE: C_LINE_COMMENT_MODE,
  C_NUMBER_MODE: C_NUMBER_MODE,
  C_NUMBER_RE: C_NUMBER_RE,
  END_SAME_AS_BEGIN: END_SAME_AS_BEGIN,
  HASH_COMMENT_MODE: HASH_COMMENT_MODE,
  IDENT_RE: IDENT_RE$2,
  MATCH_NOTHING_RE: MATCH_NOTHING_RE,
  METHOD_GUARD: METHOD_GUARD,
  NUMBER_MODE: NUMBER_MODE,
  NUMBER_RE: NUMBER_RE,
  PHRASAL_WORDS_MODE: PHRASAL_WORDS_MODE,
  QUOTE_STRING_MODE: QUOTE_STRING_MODE,
  REGEXP_MODE: REGEXP_MODE,
  RE_STARTERS_RE: RE_STARTERS_RE,
  SHEBANG: SHEBANG,
  TITLE_MODE: TITLE_MODE,
  UNDERSCORE_IDENT_RE: UNDERSCORE_IDENT_RE,
  UNDERSCORE_TITLE_MODE: UNDERSCORE_TITLE_MODE
});

/**
@typedef {import('highlight.js').CallbackResponse} CallbackResponse
@typedef {import('highlight.js').CompilerExt} CompilerExt
*/

// Grammar extensions / plugins
// See: https://github.com/highlightjs/highlight.js/issues/2833

// Grammar extensions allow "syntactic sugar" to be added to the grammar modes
// without requiring any underlying changes to the compiler internals.

// `compileMatch` being the perfect small example of now allowing a grammar
// author to write `match` when they desire to match a single expression rather
// than being forced to use `begin`.  The extension then just moves `match` into
// `begin` when it runs.  Ie, no features have been added, but we've just made
// the experience of writing (and reading grammars) a little bit nicer.

// ------

// TODO: We need negative look-behind support to do this properly
/**
 * Skip a match if it has a preceding dot
 *
 * This is used for `beginKeywords` to prevent matching expressions such as
 * `bob.keyword.do()`. The mode compiler automatically wires this up as a
 * special _internal_ 'on:begin' callback for modes with `beginKeywords`
 * @param {RegExpMatchArray} match
 * @param {CallbackResponse} response
 */
function skipIfHasPrecedingDot(match, response) {
  const before = match.input[match.index - 1];
  if (before === ".") {
    response.ignoreMatch();
  }
}

/**
 *
 * @type {CompilerExt}
 */
function scopeClassName(mode, _parent) {
  // eslint-disable-next-line no-undefined
  if (mode.className !== undefined) {
    mode.scope = mode.className;
    delete mode.className;
  }
}

/**
 * `beginKeywords` syntactic sugar
 * @type {CompilerExt}
 */
function beginKeywords(mode, parent) {
  if (!parent) return;
  if (!mode.beginKeywords) return;

  // for languages with keywords that include non-word characters checking for
  // a word boundary is not sufficient, so instead we check for a word boundary
  // or whitespace - this does no harm in any case since our keyword engine
  // doesn't allow spaces in keywords anyways and we still check for the boundary
  // first
  mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)';
  mode.__beforeBegin = skipIfHasPrecedingDot;
  mode.keywords = mode.keywords || mode.beginKeywords;
  delete mode.beginKeywords;

  // prevents double relevance, the keywords themselves provide
  // relevance, the mode doesn't need to double it
  // eslint-disable-next-line no-undefined
  if (mode.relevance === undefined) mode.relevance = 0;
}

/**
 * Allow `illegal` to contain an array of illegal values
 * @type {CompilerExt}
 */
function compileIllegal(mode, _parent) {
  if (!Array.isArray(mode.illegal)) return;

  mode.illegal = either$1(...mode.illegal);
}

/**
 * `match` to match a single expression for readability
 * @type {CompilerExt}
 */
function compileMatch(mode, _parent) {
  if (!mode.match) return;
  if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");

  mode.begin = mode.match;
  delete mode.match;
}

/**
 * provides the default 1 relevance to all modes
 * @type {CompilerExt}
 */
function compileRelevance(mode, _parent) {
  // eslint-disable-next-line no-undefined
  if (mode.relevance === undefined) mode.relevance = 1;
}

// allow beforeMatch to act as a "qualifier" for the match
// the full match begin must be [beforeMatch][begin]
const beforeMatchExt = (mode, parent) => {
  if (!mode.beforeMatch) return;
  // starts conflicts with endsParent which we need to make sure the child
  // rule is not matched multiple times
  if (mode.starts) throw new Error("beforeMatch cannot be used with starts");

  const originalMode = Object.assign({}, mode);
  Object.keys(mode).forEach((key) => { delete mode[key]; });

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

// keywords that should have no default relevance value
const COMMON_KEYWORDS = [
  'of',
  'and',
  'for',
  'in',
  'not',
  'or',
  'if',
  'then',
  'parent', // common variable name
  'list', // common variable name
  'value' // common variable name
];

const DEFAULT_KEYWORD_SCOPE = "keyword";

/**
 * Given raw keywords from a language definition, compile them.
 *
 * @param {string | Record<string,string|string[]> | Array<string>} rawKeywords
 * @param {boolean} caseInsensitive
 */
function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
  /** @type {import("highlight.js/private").KeywordDict} */
  const compiledKeywords = Object.create(null);

  // input can be a string of keywords, an array of keywords, or a object with
  // named keys representing scopeName (which can then point to a string or array)
  if (typeof rawKeywords === 'string') {
    compileList(scopeName, rawKeywords.split(" "));
  } else if (Array.isArray(rawKeywords)) {
    compileList(scopeName, rawKeywords);
  } else {
    Object.keys(rawKeywords).forEach(function(scopeName) {
      // collapse all our objects back into the parent object
      Object.assign(
        compiledKeywords,
        compileKeywords(rawKeywords[scopeName], caseInsensitive, scopeName)
      );
    });
  }
  return compiledKeywords;

  // ---

  /**
   * Compiles an individual list of keywords
   *
   * Ex: "for if when while|5"
   *
   * @param {string} scopeName
   * @param {Array<string>} keywordList
   */
  function compileList(scopeName, keywordList) {
    if (caseInsensitive) {
      keywordList = keywordList.map(x => x.toLowerCase());
    }
    keywordList.forEach(function(keyword) {
      const pair = keyword.split('|');
      compiledKeywords[pair[0]] = [scopeName, scoreForKeyword(pair[0], pair[1])];
    });
  }
}

/**
 * Returns the proper score for a given keyword
 *
 * Also takes into account comment keywords, which will be scored 0 UNLESS
 * another score has been manually assigned.
 * @param {string} keyword
 * @param {string} [providedScore]
 */
function scoreForKeyword(keyword, providedScore) {
  // manual scores always win over common keywords
  // so you can force a score of 1 if you really insist
  if (providedScore) {
    return Number(providedScore);
  }

  return commonKeyword(keyword) ? 0 : 1;
}

/**
 * Determines if a given keyword is common or not
 *
 * @param {string} keyword */
function commonKeyword(keyword) {
  return COMMON_KEYWORDS.includes(keyword.toLowerCase());
}

/*

For the reasoning behind this please see:
https://github.com/highlightjs/highlight.js/issues/2880#issuecomment-747275419

*/

/**
 * @type {Record<string, boolean>}
 */
const seenDeprecations = {};

/**
 * @param {string} message
 */
const error = (message) => {
  console.error(message);
};

/**
 * @param {string} message
 * @param {any} args
 */
const warn = (message, ...args) => {
  console.log(`WARN: ${message}`, ...args);
};

/**
 * @param {string} version
 * @param {string} message
 */
const deprecated = (version, message) => {
  if (seenDeprecations[`${version}/${message}`]) return;

  console.log(`Deprecated as of ${version}. ${message}`);
  seenDeprecations[`${version}/${message}`] = true;
};

/* eslint-disable no-throw-literal */

/**
@typedef {import('highlight.js').CompiledMode} CompiledMode
*/

const MultiClassError = new Error();

/**
 * Renumbers labeled scope names to account for additional inner match
 * groups that otherwise would break everything.
 *
 * Lets say we 3 match scopes:
 *
 *   { 1 => ..., 2 => ..., 3 => ... }
 *
 * So what we need is a clean match like this:
 *
 *   (a)(b)(c) => [ "a", "b", "c" ]
 *
 * But this falls apart with inner match groups:
 *
 * (a)(((b)))(c) => ["a", "b", "b", "b", "c" ]
 *
 * Our scopes are now "out of alignment" and we're repeating `b` 3 times.
 * What needs to happen is the numbers are remapped:
 *
 *   { 1 => ..., 2 => ..., 5 => ... }
 *
 * We also need to know that the ONLY groups that should be output
 * are 1, 2, and 5.  This function handles this behavior.
 *
 * @param {CompiledMode} mode
 * @param {Array<RegExp | string>} regexes
 * @param {{key: "beginScope"|"endScope"}} opts
 */
function remapScopeNames(mode, regexes, { key }) {
  let offset = 0;
  const scopeNames = mode[key];
  /** @type Record<number,boolean> */
  const emit = {};
  /** @type Record<number,string> */
  const positions = {};

  for (let i = 1; i <= regexes.length; i++) {
    positions[i + offset] = scopeNames[i];
    emit[i + offset] = true;
    offset += countMatchGroups(regexes[i - 1]);
  }
  // we use _emit to keep track of which match groups are "top-level" to avoid double
  // output from inside match groups
  mode[key] = positions;
  mode[key]._emit = emit;
  mode[key]._multi = true;
}

/**
 * @param {CompiledMode} mode
 */
function beginMultiClass(mode) {
  if (!Array.isArray(mode.begin)) return;

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

/**
 * @param {CompiledMode} mode
 */
function endMultiClass(mode) {
  if (!Array.isArray(mode.end)) return;

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

/**
 * this exists only to allow `scope: {}` to be used beside `match:`
 * Otherwise `beginScope` would necessary and that would look weird

  {
    match: [ /def/, /\w+/ ]
    scope: { 1: "keyword" , 2: "title" }
  }

 * @param {CompiledMode} mode
 */
function scopeSugar(mode) {
  if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
    mode.beginScope = mode.scope;
    delete mode.scope;
  }
}

/**
 * @param {CompiledMode} mode
 */
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

/**
@typedef {import('highlight.js').Mode} Mode
@typedef {import('highlight.js').CompiledMode} CompiledMode
@typedef {import('highlight.js').Language} Language
@typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
@typedef {import('highlight.js').CompiledLanguage} CompiledLanguage
*/

// compilation

/**
 * Compiles a language definition result
 *
 * Given the raw result of a language definition (Language), compiles this so
 * that it is ready for highlighting code.
 * @param {Language} language
 * @returns {CompiledLanguage}
 */
function compileLanguage(language) {
  /**
   * Builds a regex with the case sensitivity of the current language
   *
   * @param {RegExp | string} value
   * @param {boolean} [global]
   */
  function langRe(value, global) {
    return new RegExp(
      source$1(value),
      'm'
      + (language.case_insensitive ? 'i' : '')
      + (language.unicodeRegex ? 'u' : '')
      + (global ? 'g' : '')
    );
  }

  /**
    Stores multiple regular expressions and allows you to quickly search for
    them all in a string simultaneously - returning the first match.  It does
    this by creating a huge (a|b|c) regex - each individual item wrapped with ()
    and joined by `|` - using match groups to track position.  When a match is
    found checking which position in the array has content allows us to figure
    out which of the original regexes / match groups triggered the match.

    The match object itself (the result of `Regex.exec`) is returned but also
    enhanced by merging in any meta-data that was registered with the regex.
    This is how we keep track of which mode matched, and what type of rule
    (`illegal`, `begin`, end, etc).
  */
  class MultiRegex {
    constructor() {
      this.matchIndexes = {};
      // @ts-ignore
      this.regexes = [];
      this.matchAt = 1;
      this.position = 0;
    }

    // @ts-ignore
    addRule(re, opts) {
      opts.position = this.position++;
      // @ts-ignore
      this.matchIndexes[this.matchAt] = opts;
      this.regexes.push([opts, re]);
      this.matchAt += countMatchGroups(re) + 1;
    }

    compile() {
      if (this.regexes.length === 0) {
        // avoids the need to check length every time exec is called
        // @ts-ignore
        this.exec = () => null;
      }
      const terminators = this.regexes.map(el => el[1]);
      this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: '|' }), true);
      this.lastIndex = 0;
    }

    /** @param {string} s */
    exec(s) {
      this.matcherRe.lastIndex = this.lastIndex;
      const match = this.matcherRe.exec(s);
      if (!match) { return null; }

      // eslint-disable-next-line no-undefined
      const i = match.findIndex((el, i) => i > 0 && el !== undefined);
      // @ts-ignore
      const matchData = this.matchIndexes[i];
      // trim off any earlier non-relevant match groups (ie, the other regex
      // match groups that make up the multi-matcher)
      match.splice(0, i);

      return Object.assign(match, matchData);
    }
  }

  /*
    Created to solve the key deficiently with MultiRegex - there is no way to
    test for multiple matches at a single location.  Why would we need to do
    that?  In the future a more dynamic engine will allow certain matches to be
    ignored.  An example: if we matched say the 3rd regex in a large group but
    decided to ignore it - we'd need to started testing again at the 4th
    regex... but MultiRegex itself gives us no real way to do that.

    So what this class creates MultiRegexs on the fly for whatever search
    position they are needed.

    NOTE: These additional MultiRegex objects are created dynamically.  For most
    grammars most of the time we will never actually need anything more than the
    first MultiRegex - so this shouldn't have too much overhead.

    Say this is our search group, and we match regex3, but wish to ignore it.

      regex1 | regex2 | regex3 | regex4 | regex5    ' ie, startAt = 0

    What we need is a new MultiRegex that only includes the remaining
    possibilities:

      regex4 | regex5                               ' ie, startAt = 3

    This class wraps all that complexity up in a simple API... `startAt` decides
    where in the array of expressions to start doing the matching. It
    auto-increments, so if a match is found at position 2, then startAt will be
    set to 3.  If the end is reached startAt will return to 0.

    MOST of the time the parser will be setting startAt manually to 0.
  */
  class ResumableMultiRegex {
    constructor() {
      // @ts-ignore
      this.rules = [];
      // @ts-ignore
      this.multiRegexes = [];
      this.count = 0;

      this.lastIndex = 0;
      this.regexIndex = 0;
    }

    // @ts-ignore
    getMatcher(index) {
      if (this.multiRegexes[index]) return this.multiRegexes[index];

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
      if (opts.type === "begin") this.count++;
    }

    /** @param {string} s */
    exec(s) {
      const m = this.getMatcher(this.regexIndex);
      m.lastIndex = this.lastIndex;
      let result = m.exec(s);

      // The following is because we have no easy way to say "resume scanning at the
      // existing position but also skip the current rule ONLY". What happens is
      // all prior rules are also skipped which can result in matching the wrong
      // thing. Example of matching "booger":

      // our matcher is [string, "booger", number]
      //
      // ....booger....

      // if "booger" is ignored then we'd really need a regex to scan from the
      // SAME position for only: [string, number] but ignoring "booger" (if it
      // was the first match), a simple resume would scan ahead who knows how
      // far looking only for "number", ignoring potential string matches (or
      // future "booger" matches that might be valid.)

      // So what we do: We execute two matchers, one resuming at the same
      // position, but the second full matcher starting at the position after:

      //     /--- resume first regex match here (for [number])
      //     |/---- full match here for [string, "booger", number]
      //     vv
      // ....booger....

      // Which ever results in a match first is then used. So this 3-4 step
      // process essentially allows us to say "match at this position, excluding
      // a prior rule that was ignored".
      //
      // 1. Match "booger" first, ignore. Also proves that [string] does non match.
      // 2. Resume matching for [number]
      // 3. Match at index + 1 for [string, "booger", number]
      // 4. If #2 and #3 result in matches, which came first?
      if (this.resumingScanAtSamePosition()) {
        if (result && result.index === this.lastIndex) ; else { // use the second matcher result
          const m2 = this.getMatcher(0);
          m2.lastIndex = this.lastIndex + 1;
          result = m2.exec(s);
        }
      }

      if (result) {
        this.regexIndex += result.position + 1;
        if (this.regexIndex === this.count) {
          // wrap-around to considering all matches again
          this.considerAll();
        }
      }

      return result;
    }
  }

  /**
   * Given a mode, builds a huge ResumableMultiRegex that can be used to walk
   * the content and find matches.
   *
   * @param {CompiledMode} mode
   * @returns {ResumableMultiRegex}
   */
  function buildModeRegex(mode) {
    const mm = new ResumableMultiRegex();

    mode.contains.forEach(term => mm.addRule(term.begin, { rule: term, type: "begin" }));

    if (mode.terminatorEnd) {
      mm.addRule(mode.terminatorEnd, { type: "end" });
    }
    if (mode.illegal) {
      mm.addRule(mode.illegal, { type: "illegal" });
    }

    return mm;
  }

  /** skip vs abort vs ignore
   *
   * @skip   - The mode is still entered and exited normally (and contains rules apply),
   *           but all content is held and added to the parent buffer rather than being
   *           output when the mode ends.  Mostly used with `sublanguage` to build up
   *           a single large buffer than can be parsed by sublanguage.
   *
   *             - The mode begin ands ends normally.
   *             - Content matched is added to the parent mode buffer.
   *             - The parser cursor is moved forward normally.
   *
   * @abort  - A hack placeholder until we have ignore.  Aborts the mode (as if it
   *           never matched) but DOES NOT continue to match subsequent `contains`
   *           modes.  Abort is bad/suboptimal because it can result in modes
   *           farther down not getting applied because an earlier rule eats the
   *           content but then aborts.
   *
   *             - The mode does not begin.
   *             - Content matched by `begin` is added to the mode buffer.
   *             - The parser cursor is moved forward accordingly.
   *
   * @ignore - Ignores the mode (as if it never matched) and continues to match any
   *           subsequent `contains` modes.  Ignore isn't technically possible with
   *           the current parser implementation.
   *
   *             - The mode does not begin.
   *             - Content matched by `begin` is ignored.
   *             - The parser cursor is not moved forward.
   */

  /**
   * Compiles an individual mode
   *
   * This can raise an error if the mode contains certain detectable known logic
   * issues.
   * @param {Mode} mode
   * @param {CompiledMode | null} [parent]
   * @returns {CompiledMode | never}
   */
  function compileMode(mode, parent) {
    const cmode = /** @type CompiledMode */ (mode);
    if (mode.isCompiled) return cmode;

    [
      scopeClassName,
      // do this early so compiler extensions generally don't have to worry about
      // the distinction between match/begin
      compileMatch,
      MultiClass,
      beforeMatchExt
    ].forEach(ext => ext(mode, parent));

    language.compilerExtensions.forEach(ext => ext(mode, parent));

    // __beforeBegin is considered private API, internal use only
    mode.__beforeBegin = null;

    [
      beginKeywords,
      // do this later so compiler extensions that come earlier have access to the
      // raw array if they wanted to perhaps manipulate it, etc.
      compileIllegal,
      // default to 1 relevance if not specified
      compileRelevance
    ].forEach(ext => ext(mode, parent));

    mode.isCompiled = true;

    let keywordPattern = null;
    if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
      // we need a copy because keywords might be compiled multiple times
      // so we can't go deleting $pattern from the original on the first
      // pass
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
      if (!mode.begin) mode.begin = /\B|\b/;
      cmode.beginRe = langRe(cmode.begin);
      if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
      if (mode.end) cmode.endRe = langRe(cmode.end);
      cmode.terminatorEnd = source$1(cmode.end) || '';
      if (mode.endsWithParent && parent.terminatorEnd) {
        cmode.terminatorEnd += (mode.end ? '|' : '') + parent.terminatorEnd;
      }
    }
    if (mode.illegal) cmode.illegalRe = langRe(/** @type {RegExp | string} */ (mode.illegal));
    if (!mode.contains) mode.contains = [];

    mode.contains = [].concat(...mode.contains.map(function(c) {
      return expandOrCloneMode(c === 'self' ? mode : c);
    }));
    mode.contains.forEach(function(c) { compileMode(/** @type Mode */ (c), cmode); });

    if (mode.starts) {
      compileMode(mode.starts, parent);
    }

    cmode.matcher = buildModeRegex(cmode);
    return cmode;
  }

  if (!language.compilerExtensions) language.compilerExtensions = [];

  // self is not valid at the top-level
  if (language.contains && language.contains.includes('self')) {
    throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
  }

  // we need a null object, which inherit will guarantee
  language.classNameAliases = inherit$1(language.classNameAliases || {});

  return compileMode(/** @type Mode */ (language));
}

/**
 * Determines if a mode has a dependency on it's parent or not
 *
 * If a mode does have a parent dependency then often we need to clone it if
 * it's used in multiple places so that each copy points to the correct parent,
 * where-as modes without a parent can often safely be re-used at the bottom of
 * a mode chain.
 *
 * @param {Mode | null} mode
 * @returns {boolean} - is there a dependency on the parent?
 * */
function dependencyOnParent(mode) {
  if (!mode) return false;

  return mode.endsWithParent || dependencyOnParent(mode.starts);
}

/**
 * Expands a mode or clones it if necessary
 *
 * This is necessary for modes with parental dependenceis (see notes on
 * `dependencyOnParent`) and for nodes that have `variants` - which must then be
 * exploded into their own individual modes at compile time.
 *
 * @param {Mode} mode
 * @returns {Mode | Mode[]}
 * */
function expandOrCloneMode(mode) {
  if (mode.variants && !mode.cachedVariants) {
    mode.cachedVariants = mode.variants.map(function(variant) {
      return inherit$1(mode, { variants: null }, variant);
    });
  }

  // EXPAND
  // if we have variants then essentially "replace" the mode with the variants
  // this happens in compileMode, where this function is called from
  if (mode.cachedVariants) {
    return mode.cachedVariants;
  }

  // CLONE
  // if we have dependencies on parents then we need a unique
  // instance of ourselves, so we can be reused with many
  // different parents without issue
  if (dependencyOnParent(mode)) {
    return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
  }

  if (Object.isFrozen(mode)) {
    return inherit$1(mode);
  }

  // no special dependency issues, just return ourselves
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

/*
Syntax highlighting with language autodetection.
https://highlightjs.org/
*/



/**
@typedef {import('highlight.js').Mode} Mode
@typedef {import('highlight.js').CompiledMode} CompiledMode
@typedef {import('highlight.js').CompiledScope} CompiledScope
@typedef {import('highlight.js').Language} Language
@typedef {import('highlight.js').HLJSApi} HLJSApi
@typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
@typedef {import('highlight.js').PluginEvent} PluginEvent
@typedef {import('highlight.js').HLJSOptions} HLJSOptions
@typedef {import('highlight.js').LanguageFn} LanguageFn
@typedef {import('highlight.js').HighlightedHTMLElement} HighlightedHTMLElement
@typedef {import('highlight.js').BeforeHighlightContext} BeforeHighlightContext
@typedef {import('highlight.js/private').MatchType} MatchType
@typedef {import('highlight.js/private').KeywordData} KeywordData
@typedef {import('highlight.js/private').EnhancedMatch} EnhancedMatch
@typedef {import('highlight.js/private').AnnotatedError} AnnotatedError
@typedef {import('highlight.js').AutoHighlightResult} AutoHighlightResult
@typedef {import('highlight.js').HighlightOptions} HighlightOptions
@typedef {import('highlight.js').HighlightResult} HighlightResult
*/


const escape = escapeHTML;
const inherit = inherit$1;
const NO_MATCH = Symbol("nomatch");
const MAX_KEYWORD_HITS = 7;

/**
 * @param {any} hljs - object that is extended (legacy)
 * @returns {HLJSApi}
 */
const HLJS = function(hljs) {
  // Global internal variables used within the highlight.js library.
  /** @type {Record<string, Language>} */
  const languages = Object.create(null);
  /** @type {Record<string, string>} */
  const aliases = Object.create(null);
  /** @type {HLJSPlugin[]} */
  const plugins = [];

  // safe/production mode - swallows more errors, tries to keep running
  // even if a single syntax or parse hits a fatal error
  let SAFE_MODE = true;
  const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
  /** @type {Language} */
  const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: 'Plain text', contains: [] };

  // Global options used when within external APIs. This is modified when
  // calling the `hljs.configure` function.
  /** @type HLJSOptions */
  let options = {
    ignoreUnescapedHTML: false,
    throwUnescapedHTML: false,
    noHighlightRe: /^(no-?highlight)$/i,
    languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
    classPrefix: 'hljs-',
    cssSelector: 'pre code',
    languages: null,
    // beta configuration options, subject to change, welcome to discuss
    // https://github.com/highlightjs/highlight.js/issues/1086
    __emitter: TokenTreeEmitter
  };

  /* Utility functions */

  /**
   * Tests a language name to see if highlighting should be skipped
   * @param {string} languageName
   */
  function shouldNotHighlight(languageName) {
    return options.noHighlightRe.test(languageName);
  }

  /**
   * @param {HighlightedHTMLElement} block - the HTML element to determine language for
   */
  function blockLanguage(block) {
    let classes = block.className + ' ';

    classes += block.parentNode ? block.parentNode.className : '';

    // language-* takes precedence over non-prefixed class names.
    const match = options.languageDetectRe.exec(classes);
    if (match) {
      const language = getLanguage(match[1]);
      if (!language) {
        warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
        warn("Falling back to no-highlight mode for this block.", block);
      }
      return language ? match[1] : 'no-highlight';
    }

    return classes
      .split(/\s+/)
      .find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
  }

  /**
   * Core highlighting function.
   *
   * OLD API
   * highlight(lang, code, ignoreIllegals, continuation)
   *
   * NEW API
   * highlight(code, {lang, ignoreIllegals})
   *
   * @param {string} codeOrLanguageName - the language to use for highlighting
   * @param {string | HighlightOptions} optionsOrCode - the code to highlight
   * @param {boolean} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
   *
   * @returns {HighlightResult} Result - an object that represents the result
   * @property {string} language - the language name
   * @property {number} relevance - the relevance score
   * @property {string} value - the highlighted HTML code
   * @property {string} code - the original raw code
   * @property {CompiledMode} top - top of the current mode stack
   * @property {boolean} illegal - indicates whether any illegal matches were found
  */
  function highlight(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
    let code = "";
    let languageName = "";
    if (typeof optionsOrCode === "object") {
      code = codeOrLanguageName;
      ignoreIllegals = optionsOrCode.ignoreIllegals;
      languageName = optionsOrCode.language;
    } else {
      // old API
      deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
      deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
      languageName = codeOrLanguageName;
      code = optionsOrCode;
    }

    // https://github.com/highlightjs/highlight.js/issues/3149
    // eslint-disable-next-line no-undefined
    if (ignoreIllegals === undefined) { ignoreIllegals = true; }

    /** @type {BeforeHighlightContext} */
    const context = {
      code,
      language: languageName
    };
    // the plugin can change the desired language or the code to be highlighted
    // just be changing the object it was passed
    fire("before:highlight", context);

    // a before plugin can usurp the result completely by providing it's own
    // in which case we don't even need to call highlight
    const result = context.result
      ? context.result
      : _highlight(context.language, context.code, ignoreIllegals);

    result.code = context.code;
    // the plugin can change anything in result to suite it
    fire("after:highlight", result);

    return result;
  }

  /**
   * private highlight that's used internally and does not fire callbacks
   *
   * @param {string} languageName - the language to use for highlighting
   * @param {string} codeToHighlight - the code to highlight
   * @param {boolean?} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
   * @param {CompiledMode?} [continuation] - current continuation mode, if any
   * @returns {HighlightResult} - result of the highlight operation
  */
  function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
    const keywordHits = Object.create(null);

    /**
     * Return keyword data if a match is a keyword
     * @param {CompiledMode} mode - current mode
     * @param {string} matchText - the textual match
     * @returns {KeywordData | false}
     */
    function keywordData(mode, matchText) {
      return mode.keywords[matchText];
    }

    function processKeywords() {
      if (!top.keywords) {
        emitter.addText(modeBuffer);
        return;
      }

      let lastIndex = 0;
      top.keywordPatternRe.lastIndex = 0;
      let match = top.keywordPatternRe.exec(modeBuffer);
      let buf = "";

      while (match) {
        buf += modeBuffer.substring(lastIndex, match.index);
        const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
        const data = keywordData(top, word);
        if (data) {
          const [kind, keywordRelevance] = data;
          emitter.addText(buf);
          buf = "";

          keywordHits[word] = (keywordHits[word] || 0) + 1;
          if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
          if (kind.startsWith("_")) {
            // _ implied for relevance only, do not highlight
            // by applying a class name
            buf += match[0];
          } else {
            const cssClass = language.classNameAliases[kind] || kind;
            emitKeyword(match[0], cssClass);
          }
        } else {
          buf += match[0];
        }
        lastIndex = top.keywordPatternRe.lastIndex;
        match = top.keywordPatternRe.exec(modeBuffer);
      }
      buf += modeBuffer.substring(lastIndex);
      emitter.addText(buf);
    }

    function processSubLanguage() {
      if (modeBuffer === "") return;
      /** @type HighlightResult */
      let result = null;

      if (typeof top.subLanguage === 'string') {
        if (!languages[top.subLanguage]) {
          emitter.addText(modeBuffer);
          return;
        }
        result = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
        continuations[top.subLanguage] = /** @type {CompiledMode} */ (result._top);
      } else {
        result = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
      }

      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Use case in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      emitter.__addSublanguage(result._emitter, result.language);
    }

    function processBuffer() {
      if (top.subLanguage != null) {
        processSubLanguage();
      } else {
        processKeywords();
      }
      modeBuffer = '';
    }

    /**
     * @param {string} text
     * @param {string} scope
     */
    function emitKeyword(keyword, scope) {
      if (keyword === "") return;

      emitter.startScope(scope);
      emitter.addText(keyword);
      emitter.endScope();
    }

    /**
     * @param {CompiledScope} scope
     * @param {RegExpMatchArray} match
     */
    function emitMultiClass(scope, match) {
      let i = 1;
      const max = match.length - 1;
      while (i <= max) {
        if (!scope._emit[i]) { i++; continue; }
        const klass = language.classNameAliases[scope[i]] || scope[i];
        const text = match[i];
        if (klass) {
          emitKeyword(text, klass);
        } else {
          modeBuffer = text;
          processKeywords();
          modeBuffer = "";
        }
        i++;
      }
    }

    /**
     * @param {CompiledMode} mode - new mode to start
     * @param {RegExpMatchArray} match
     */
    function startNewMode(mode, match) {
      if (mode.scope && typeof mode.scope === "string") {
        emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
      }
      if (mode.beginScope) {
        // beginScope just wraps the begin match itself in a scope
        if (mode.beginScope._wrap) {
          emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
          modeBuffer = "";
        } else if (mode.beginScope._multi) {
          // at this point modeBuffer should just be the match
          emitMultiClass(mode.beginScope, match);
          modeBuffer = "";
        }
      }

      top = Object.create(mode, { parent: { value: top } });
      return top;
    }

    /**
     * @param {CompiledMode } mode - the mode to potentially end
     * @param {RegExpMatchArray} match - the latest match
     * @param {string} matchPlusRemainder - match plus remainder of content
     * @returns {CompiledMode | void} - the next mode, or if void continue on in current mode
     */
    function endOfMode(mode, match, matchPlusRemainder) {
      let matched = startsWith(mode.endRe, matchPlusRemainder);

      if (matched) {
        if (mode["on:end"]) {
          const resp = new Response(mode);
          mode["on:end"](match, resp);
          if (resp.isMatchIgnored) matched = false;
        }

        if (matched) {
          while (mode.endsParent && mode.parent) {
            mode = mode.parent;
          }
          return mode;
        }
      }
      // even if on:end fires an `ignore` it's still possible
      // that we might trigger the end node because of a parent mode
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, match, matchPlusRemainder);
      }
    }

    /**
     * Handle matching but then ignoring a sequence of text
     *
     * @param {string} lexeme - string containing full match text
     */
    function doIgnore(lexeme) {
      if (top.matcher.regexIndex === 0) {
        // no more regexes to potentially match here, so we move the cursor forward one
        // space
        modeBuffer += lexeme[0];
        return 1;
      } else {
        // no need to move the cursor, we still have additional regexes to try and
        // match at this very spot
        resumeScanAtSamePosition = true;
        return 0;
      }
    }

    /**
     * Handle the start of a new potential mode match
     *
     * @param {EnhancedMatch} match - the current match
     * @returns {number} how far to advance the parse cursor
     */
    function doBeginMatch(match) {
      const lexeme = match[0];
      const newMode = match.rule;

      const resp = new Response(newMode);
      // first internal before callbacks, then the public ones
      const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
      for (const cb of beforeCallbacks) {
        if (!cb) continue;
        cb(match, resp);
        if (resp.isMatchIgnored) return doIgnore(lexeme);
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

    /**
     * Handle the potential end of mode
     *
     * @param {RegExpMatchArray} match - the current match
     */
    function doEndMatch(match) {
      const lexeme = match[0];
      const matchPlusRemainder = codeToHighlight.substring(match.index);

      const endMode = endOfMode(top, match, matchPlusRemainder);
      if (!endMode) { return NO_MATCH; }

      const origin = top;
      if (top.endScope && top.endScope._wrap) {
        processBuffer();
        emitKeyword(lexeme, top.endScope._wrap);
      } else if (top.endScope && top.endScope._multi) {
        processBuffer();
        emitMultiClass(top.endScope, match);
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
        if (top.scope) {
          emitter.closeNode();
        }
        if (!top.skip && !top.subLanguage) {
          relevance += top.relevance;
        }
        top = top.parent;
      } while (top !== endMode.parent);
      if (endMode.starts) {
        startNewMode(endMode.starts, match);
      }
      return origin.returnEnd ? 0 : lexeme.length;
    }

    function processContinuations() {
      const list = [];
      for (let current = top; current !== language; current = current.parent) {
        if (current.scope) {
          list.unshift(current.scope);
        }
      }
      list.forEach(item => emitter.openNode(item));
    }

    /** @type {{type?: MatchType, index?: number, rule?: Mode}}} */
    let lastMatch = {};

    /**
     *  Process an individual match
     *
     * @param {string} textBeforeMatch - text preceding the match (since the last match)
     * @param {EnhancedMatch} [match] - the match itself
     */
    function processLexeme(textBeforeMatch, match) {
      const lexeme = match && match[0];

      // add non-matched text to the current mode buffer
      modeBuffer += textBeforeMatch;

      if (lexeme == null) {
        processBuffer();
        return 0;
      }

      // we've found a 0 width match and we're stuck, so we need to advance
      // this happens when we have badly behaved rules that have optional matchers to the degree that
      // sometimes they can end up matching nothing at all
      // Ref: https://github.com/highlightjs/highlight.js/issues/2140
      if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
        // spit the "skipped" character that our regex choked on back into the output sequence
        modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
        if (!SAFE_MODE) {
          /** @type {AnnotatedError} */
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
        // illegal match, we do not continue processing
        /** @type {AnnotatedError} */
        const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || '<unnamed>') + '"');
        err.mode = top;
        throw err;
      } else if (match.type === "end") {
        const processed = doEndMatch(match);
        if (processed !== NO_MATCH) {
          return processed;
        }
      }

      // edge case for when illegal matches $ (end of line) which is technically
      // a 0 width match but not a begin/end match so it's not caught by the
      // first handler (when ignoreIllegals is true)
      if (match.type === "illegal" && lexeme === "") {
        // advance so we aren't stuck in an infinite loop
        modeBuffer += "\n";
        return 1;
      }

      // infinite loops are BAD, this is a last ditch catch all. if we have a
      // decent number of iterations yet our index (cursor position in our
      // parsing) still 3x behind our index then something is very wrong
      // so we bail
      if (iterations > 100000 && iterations > match.index * 3) {
        const err = new Error('potential infinite loop, way more iterations than matches');
        throw err;
      }

      /*
      Why might be find ourselves here?  An potential end match that was
      triggered but could not be completed.  IE, `doEndMatch` returned NO_MATCH.
      (this could be because a callback requests the match be ignored, etc)

      This causes no real harm other than stopping a few times too many.
      */

      modeBuffer += lexeme;
      return lexeme.length;
    }

    const language = getLanguage(languageName);
    if (!language) {
      error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
      throw new Error('Unknown language: "' + languageName + '"');
    }

    const md = compileLanguage(language);
    let result = '';
    /** @type {CompiledMode} */
    let top = continuation || md;
    /** @type Record<string,CompiledMode> */
    const continuations = {}; // keep continuations for sub-languages
    const emitter = new options.__emitter(options);
    processContinuations();
    let modeBuffer = '';
    let relevance = 0;
    let index = 0;
    let iterations = 0;
    let resumeScanAtSamePosition = false;

    try {
      if (!language.__emitTokens) {
        top.matcher.considerAll();

        for (;;) {
          iterations++;
          if (resumeScanAtSamePosition) {
            // only regexes not matched previously will now be
            // considered for a potential match
            resumeScanAtSamePosition = false;
          } else {
            top.matcher.considerAll();
          }
          top.matcher.lastIndex = index;

          const match = top.matcher.exec(codeToHighlight);
          // console.log("match", match[0], match.rule && match.rule.begin)

          if (!match) break;

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
        _top: top
      };
    } catch (err) {
      if (err.message && err.message.includes('Illegal')) {
        return {
          language: languageName,
          value: escape(codeToHighlight),
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
          value: escape(codeToHighlight),
          illegal: false,
          relevance: 0,
          errorRaised: err,
          _emitter: emitter,
          _top: top
        };
      } else {
        throw err;
      }
    }
  }

  /**
   * returns a valid highlight result, without actually doing any actual work,
   * auto highlight starts with this and it's possible for small snippets that
   * auto-detection may not find a better match
   * @param {string} code
   * @returns {HighlightResult}
   */
  function justTextHighlightResult(code) {
    const result = {
      value: escape(code),
      illegal: false,
      relevance: 0,
      _top: PLAINTEXT_LANGUAGE,
      _emitter: new options.__emitter(options)
    };
    result._emitter.addText(code);
    return result;
  }

  /**
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - secondBest (object with the same structure for second-best heuristically
    detected language, may be absent)

    @param {string} code
    @param {Array<string>} [languageSubset]
    @returns {AutoHighlightResult}
  */
  function highlightAuto(code, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    const plaintext = justTextHighlightResult(code);

    const results = languageSubset.filter(getLanguage).filter(autoDetection).map(name =>
      _highlight(name, code, false)
    );
    results.unshift(plaintext); // plaintext is always an option

    const sorted = results.sort((a, b) => {
      // sort base on relevance
      if (a.relevance !== b.relevance) return b.relevance - a.relevance;

      // always award the tie to the base language
      // ie if C++ and Arduino are tied, it's more likely to be C++
      if (a.language && b.language) {
        if (getLanguage(a.language).supersetOf === b.language) {
          return 1;
        } else if (getLanguage(b.language).supersetOf === a.language) {
          return -1;
        }
      }

      // otherwise say they are equal, which has the effect of sorting on
      // relevance while preserving the original ordering - which is how ties
      // have historically been settled, ie the language that comes first always
      // wins in the case of a tie
      return 0;
    });

    const [best, secondBest] = sorted;

    /** @type {AutoHighlightResult} */
    const result = best;
    result.secondBest = secondBest;

    return result;
  }

  /**
   * Builds new class name for block given the language name
   *
   * @param {HTMLElement} element
   * @param {string} [currentLang]
   * @param {string} [resultLang]
   */
  function updateClassName(element, currentLang, resultLang) {
    const language = (currentLang && aliases[currentLang]) || resultLang;

    element.classList.add("hljs");
    element.classList.add(`language-${language}`);
  }

  /**
   * Applies highlighting to a DOM node containing code.
   *
   * @param {HighlightedHTMLElement} element - the HTML element to highlight
  */
  function highlightElement(element) {
    /** @type HTMLElement */
    let node = null;
    const language = blockLanguage(element);

    if (shouldNotHighlight(language)) return;

    fire("before:highlightElement",
      { el: element, language });

    if (element.dataset.highlighted) {
      console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
      return;
    }

    // we should be all text, no child nodes (unescaped HTML) - this is possibly
    // an HTML injection attack - it's likely too late if this is already in
    // production (the code has likely already done its damage by the time
    // we're seeing it)... but we yell loudly about this so that hopefully it's
    // more likely to be caught in development before making it to production
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
    const text = node.textContent;
    const result = language ? highlight(text, { language, ignoreIllegals: true }) : highlightAuto(text);

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

    fire("after:highlightElement", { el: element, result, text });
  }

  /**
   * Updates highlight.js global options with the passed options
   *
   * @param {Partial<HLJSOptions>} userOptions
   */
  function configure(userOptions) {
    options = inherit(options, userOptions);
  }

  // TODO: remove v12, deprecated
  const initHighlighting = () => {
    highlightAll();
    deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
  };

  // TODO: remove v12, deprecated
  function initHighlightingOnLoad() {
    highlightAll();
    deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
  }

  let wantsHighlight = false;

  /**
   * auto-highlights all pre>code elements on the page
   */
  function highlightAll() {
    function boot() {
      // if a highlight was requested before DOM was loaded, do now
      highlightAll();
    }

    // if we are called too early in the loading process
    if (document.readyState === "loading") {
      // make sure the event listener is only added once
      if (!wantsHighlight) {
        window.addEventListener('DOMContentLoaded', boot, false);
      }
      wantsHighlight = true;
      return;
    }

    const blocks = document.querySelectorAll(options.cssSelector);
    blocks.forEach(highlightElement);
  }

  /**
   * Register a language grammar module
   *
   * @param {string} languageName
   * @param {LanguageFn} languageDefinition
   */
  function registerLanguage(languageName, languageDefinition) {
    let lang = null;
    try {
      lang = languageDefinition(hljs);
    } catch (error$1) {
      error("Language definition for '{}' could not be registered.".replace("{}", languageName));
      // hard or soft error
      if (!SAFE_MODE) { throw error$1; } else { error(error$1); }
      // languages that have serious errors are replaced with essentially a
      // "plaintext" stand-in so that the code blocks will still get normal
      // css classes applied to them - and one bad language won't break the
      // entire highlighter
      lang = PLAINTEXT_LANGUAGE;
    }
    // give it a temporary name if it doesn't have one in the meta-data
    if (!lang.name) lang.name = languageName;
    languages[languageName] = lang;
    lang.rawDefinition = languageDefinition.bind(null, hljs);

    if (lang.aliases) {
      registerAliases(lang.aliases, { languageName });
    }
  }

  /**
   * Remove a language grammar module
   *
   * @param {string} languageName
   */
  function unregisterLanguage(languageName) {
    delete languages[languageName];
    for (const alias of Object.keys(aliases)) {
      if (aliases[alias] === languageName) {
        delete aliases[alias];
      }
    }
  }

  /**
   * @returns {string[]} List of language internal names
   */
  function listLanguages() {
    return Object.keys(languages);
  }

  /**
   * @param {string} name - name of the language to retrieve
   * @returns {Language | undefined}
   */
  function getLanguage(name) {
    name = (name || '').toLowerCase();
    return languages[name] || languages[aliases[name]];
  }

  /**
   *
   * @param {string|string[]} aliasList - single alias or list of aliases
   * @param {{languageName: string}} opts
   */
  function registerAliases(aliasList, { languageName }) {
    if (typeof aliasList === 'string') {
      aliasList = [aliasList];
    }
    aliasList.forEach(alias => { aliases[alias.toLowerCase()] = languageName; });
  }

  /**
   * Determines if a given language has auto-detection enabled
   * @param {string} name - name of the language
   */
  function autoDetection(name) {
    const lang = getLanguage(name);
    return lang && !lang.disableAutodetect;
  }

  /**
   * Upgrades the old highlightBlock plugins to the new
   * highlightElement API
   * @param {HLJSPlugin} plugin
   */
  function upgradePluginAPI(plugin) {
    // TODO: remove with v12
    if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
      plugin["before:highlightElement"] = (data) => {
        plugin["before:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
    if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
      plugin["after:highlightElement"] = (data) => {
        plugin["after:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
  }

  /**
   * @param {HLJSPlugin} plugin
   */
  function addPlugin(plugin) {
    upgradePluginAPI(plugin);
    plugins.push(plugin);
  }

  /**
   * @param {HLJSPlugin} plugin
   */
  function removePlugin(plugin) {
    const index = plugins.indexOf(plugin);
    if (index !== -1) {
      plugins.splice(index, 1);
    }
  }

  /**
   *
   * @param {PluginEvent} event
   * @param {any} args
   */
  function fire(event, args) {
    const cb = event;
    plugins.forEach(function(plugin) {
      if (plugin[cb]) {
        plugin[cb](args);
      }
    });
  }

  /**
   * DEPRECATED
   * @param {HighlightedHTMLElement} el
   */
  function deprecateHighlightBlock(el) {
    deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
    deprecated("10.7.0", "Please use highlightElement now.");

    return highlightElement(el);
  }

  /* Interface definition */
  Object.assign(hljs, {
    highlight,
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

  hljs.debugMode = function() { SAFE_MODE = false; };
  hljs.safeMode = function() { SAFE_MODE = true; };
  hljs.versionString = version;

  hljs.regex = {
    concat: concat$1,
    lookahead: lookahead$1,
    either: either$1,
    optional: optional,
    anyNumberOfTimes: anyNumberOfTimes
  };

  for (const key in MODES$3) {
    // @ts-ignore
    if (typeof MODES$3[key] === "object") {
      // @ts-ignore
      deepFreeze(MODES$3[key]);
    }
  }

  // merge all the modes/regexes into our main object
  Object.assign(hljs, MODES$3);

  return hljs;
};

// Other names for the variable may break build script
const highlight = HLJS({});

// returns a new instance of the highlighter to be used for extensions
// check https://github.com/wooorm/lowlight/issues/47
highlight.newInstance = () => HLJS({});

var core = highlight;
highlight.HighlightJS = highlight;
highlight.default = highlight;

var HighlightJS = /*@__PURE__*/getDefaultExportFromCjs(core);

const IDENT_RE$1 = '[A-Za-z$_][0-9A-Za-z$_]*';
const KEYWORDS$1 = [
  "as", // for exports
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

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
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
  "global" // Node.js
];

const BUILT_INS$1 = [].concat(
  BUILT_IN_GLOBALS$1,
  TYPES$1,
  ERROR_TYPES$1
);

/*
Language: JavaScript
Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
Category: common, scripting, web
Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
*/


/** @type LanguageFn */
function javascript$1(hljs) {
  const regex = hljs.regex;
  /**
   * Takes a string like "<Booger" and checks to see
   * if we can find a matching "</Booger" later in the
   * content.
   * @param {RegExpMatchArray} match
   * @param {{after:number}} param1
   */
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };

  const IDENT_RE$1$1 = IDENT_RE$1;
  const FRAGMENT = {
    begin: '<>',
    end: '</>'
  };
  // to avoid some special cases inside isTrulyOpeningTag
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
        nextChar === "<" ||
        // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
        ) {
        response.ignoreMatch();
        return;
      }

      // `<something>`
      // Quite possibly a tag, lets look for a matching closing tag...
      if (nextChar === ">") {
        // if we cannot find a matching closing tag, then we
        // will ignore it
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }

      // `<blah />` (self-closing)
      // handled by simpleSelfClosing rule

      let m;
      const afterMatch = match.input.substring(afterMatchIndex);

      // some more template typing stuff
      //  <T = any>(key?: string) => Modify<
      if ((m = afterMatch.match(/^\s*=/))) {
        response.ignoreMatch();
        return;
      }

      // `<From extends string>`
      // technically this could be HTML, but it smells like a type
      // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
      if ((m = afterMatch.match(/^\s+extends\s+/))) {
        if (m.index === 0) {
          response.ignoreMatch();
          // eslint-disable-next-line no-useless-return
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

  // https://tc39.es/ecma262/#sec-literals-numeric-literals
  const decimalDigits = '[0-9](_?[0-9])*';
  const frac = `\\.(${decimalDigits})`;
  // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
  // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: 'number',
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
        `[eE][+-]?(${decimalDigits})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },

      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },

      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" },
    ],
    relevance: 0
  };

  const SUBST = {
    className: 'subst',
    begin: '\\$\\{',
    end: '\\}',
    keywords: KEYWORDS$1$1,
    contains: [] // defined later
  };
  const HTML_TEMPLATE = {
    begin: '\.?html`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'xml'
    }
  };
  const CSS_TEMPLATE = {
    begin: '\.?css`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'css'
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: '\.?gql`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'graphql'
    }
  };
  const TEMPLATE_STRING = {
    className: 'string',
    begin: '`',
    end: '`',
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    '\\*/',
    {
      relevance: 0,
      contains: [
        {
          begin: '(?=@[A-Za-z]+)',
          relevance: 0,
          contains: [
            {
              className: 'doctag',
              begin: '@[A-Za-z]+'
            },
            {
              className: 'type',
              begin: '\\{',
              end: '\\}',
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: 'variable',
              begin: IDENT_RE$1$1 + '(?=\\s*(-)|$)',
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
  const COMMENT = {
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
    NUMBER,
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS
    .concat({
      // we need to pair up {} inside our subst to prevent
      // it from ending too early by matching another }
      begin: /\{/,
      end: /\}/,
      keywords: KEYWORDS$1$1,
      contains: [
        "self"
      ].concat(SUBST_INTERNALS)
    });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
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
    className: 'params',
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/, // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1$1,
    contains: PARAMS_CONTAINS
  };

  // ES6 classes
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
      },

    ]
  };

  const CLASS_REFERENCE = {
    relevance: 0,
    match:
    regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/,
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
    className: 'meta',
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
    contains: [ PARAMS ],
    illegal: /%/
  };

  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };

  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }

  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS$1,
        "super",
        "import"
      ].map(x => `${x}\\s*\\(`)),
      IDENT_RE$1$1, regex.lookahead(/\s*\(/)),
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
      { // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };

  const FUNC_LEAD_IN_RE = '(\\(' +
    '[^()]*(\\(' +
    '[^()]*(\\(' +
    '[^()]*' +
    '\\)[^()]*)*' +
    '\\)[^()]*)*' +
    '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';

  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/, /\s+/,
      IDENT_RE$1$1, /\s*/,
      /=\s*/,
      /(async\s*)?/, // async is optional
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
    name: 'JavaScript',
    aliases: ['js', 'jsx', 'mjs', 'cjs'],
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
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: 'attr',
        match: IDENT_RE$1$1 + regex.lookahead(':'),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: 'function',
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: '\\s*=>',
            contains: [
              {
                className: 'params',
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
          { // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          { // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                'on:begin': XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: 'xml',
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ['self']
              }
            ]
          }
        ],
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
        begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
          '\\(' + // first parens
          '[^()]*(\\(' +
            '[^()]*(\\(' +
              '[^()]*' +
            '\\)[^()]*)*' +
          '\\)[^()]*)*' +
          '\\)\\s*\\{', // end parens
        returnBegin:true,
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
        match: '\\$' + IDENT_RE$1$1,
        relevance: 0
      },
      {
        match: [ /\bconstructor(?=\s*\()/ ],
        className: { 1: "title.function" },
        contains: [ PARAMS ]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}

// https://docs.oracle.com/javase/specs/jls/se15/html/jls-3.html#jls-3.10
var decimalDigits$1 = '[0-9](_*[0-9])*';
var frac$1 = `\\.(${decimalDigits$1})`;
var hexDigits$1 = '[0-9a-fA-F](_*[0-9a-fA-F])*';
var NUMERIC$1 = {
  className: 'number',
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits$1})((${frac$1})|\\.)?|(${frac$1}))` +
      `[eE][+-]?(${decimalDigits$1})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits$1})((${frac$1})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac$1})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits$1})[fFdD]\\b` },

    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits$1})\\.?|(${hexDigits$1})?\\.(${hexDigits$1}))` +
      `[pP][+-]?(${decimalDigits$1})[fFdD]?\\b` },

    // DecimalIntegerLiteral
    { begin: '\\b(0|[1-9](_*[0-9])*)[lL]?\\b' },

    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits$1})[lL]?\\b` },

    // OctalIntegerLiteral
    { begin: '\\b0(_*[0-7])*[lL]?\\b' },

    // BinaryIntegerLiteral
    { begin: '\\b0[bB][01](_*[01])*[lL]?\\b' },
  ],
  relevance: 0
};

/*
Language: Java
Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
Category: common, enterprise
Website: https://www.java.com/
*/


/**
 * Allows recursive regex expressions to a given depth
 *
 * ie: recurRegex("(abc~~~)", /~~~/g, 2) becomes:
 * (abc(abc(abc)))
 *
 * @param {string} re
 * @param {RegExp} substitution (should be a g mode regex)
 * @param {number} depth
 * @returns {string}``
 */
function recurRegex(re, substitution, depth) {
  if (depth === -1) return "";

  return re.replace(substitution, _ => {
    return recurRegex(re, substitution, depth - 1);
  });
}

/** @type LanguageFn */
function java(hljs) {
  const regex = hljs.regex;
  const JAVA_IDENT_RE = '[\u00C0-\u02B8a-zA-Z_$][\u00C0-\u02B8a-zA-Z_$0-9]*';
  const GENERIC_IDENT_RE = JAVA_IDENT_RE
    + recurRegex('(?:<' + JAVA_IDENT_RE + '~~~(?:\\s*,\\s*' + JAVA_IDENT_RE + '~~~)*>)?', /~~~/g, 2);
  const MAIN_KEYWORDS = [
    'synchronized',
    'abstract',
    'private',
    'var',
    'static',
    'if',
    'const ',
    'for',
    'while',
    'strictfp',
    'finally',
    'protected',
    'import',
    'native',
    'final',
    'void',
    'enum',
    'else',
    'break',
    'transient',
    'catch',
    'instanceof',
    'volatile',
    'case',
    'assert',
    'package',
    'default',
    'public',
    'try',
    'switch',
    'continue',
    'throws',
    'protected',
    'public',
    'private',
    'module',
    'requires',
    'exports',
    'do',
    'sealed',
    'yield',
    'permits',
    'goto',
    'when'
  ];

  const BUILT_INS = [
    'super',
    'this'
  ];

  const LITERALS = [
    'false',
    'true',
    'null'
  ];

  const TYPES = [
    'char',
    'boolean',
    'long',
    'float',
    'int',
    'byte',
    'short',
    'double'
  ];

  const KEYWORDS = {
    keyword: MAIN_KEYWORDS,
    literal: LITERALS,
    type: TYPES,
    built_in: BUILT_INS
  };

  const ANNOTATION = {
    className: 'meta',
    begin: '@' + JAVA_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [ "self" ] // allow nested () inside our annotation
      }
    ]
  };
  const PARAMS = {
    className: 'params',
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS,
    relevance: 0,
    contains: [ hljs.C_BLOCK_COMMENT_MODE ],
    endsParent: true
  };

  return {
    name: 'Java',
    aliases: [ 'jsp' ],
    keywords: KEYWORDS,
    illegal: /<\/|#/,
    contains: [
      hljs.COMMENT(
        '/\\*\\*',
        '\\*/',
        {
          relevance: 0,
          contains: [
            {
              // eat up @'s in emails to prevent them to be recognized as doctags
              begin: /\w+@/,
              relevance: 0
            },
            {
              className: 'doctag',
              begin: '@[A-Za-z]+'
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
        contains: [ hljs.BACKSLASH_ESCAPE ]
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
        beginKeywords: 'new throw return else',
        relevance: 0
      },
      {
        begin: [
          '(?:' + GENERIC_IDENT_RE + '\\s+)',
          hljs.UNDERSCORE_IDENT_RE,
          /\s*(?=\()/
        ],
        className: { 2: "title.function" },
        keywords: KEYWORDS,
        contains: [
          {
            className: 'params',
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS,
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

/*
Language: Bash
Author: vah <vahtenberg@gmail.com>
Contributrors: Benjamin Pannell <contact@sierrasoftworks.com>
Website: https://www.gnu.org/software/bash/
Category: common, scripting
*/

/** @type LanguageFn */
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
        contains: [ VAR ]
      } // default values
    ]
  };
  Object.assign(VAR, {
    className: 'variable',
    variants: [
      { begin: regex.concat(/\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        `(?![\\w\\d])(?![$])`) },
      BRACED_VAR
    ]
  });

  const SUBST = {
    className: 'subst',
    begin: /\$\(/,
    end: /\)/,
    contains: [ hljs.BACKSLASH_ESCAPE ]
  };
  const COMMENT = hljs.inherit(
    hljs.COMMENT(),
    {
      match: [
        /(^|\s)/,
        /#.*$/
      ],
      scope: {
        2: 'comment'
      }
    }
  );
  const HERE_DOC = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      hljs.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: 'string'
      })
    ] }
  };
  const QUOTE_STRING = {
    className: 'string',
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
    className: 'string',
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
    "scsh",
  ];
  const KNOWN_SHEBANG = hljs.SHEBANG({
    binary: `(${SH_LIKE_SHELLS.join("|")})`,
    relevance: 10
  });
  const FUNCTION = {
    className: 'function',
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: true,
    contains: [ hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ }) ],
    relevance: 0
  };

  const KEYWORDS = [
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

  const LITERALS = [
    "true",
    "false"
  ];

  // to consume paths to prevent keyword matches inside them
  const PATH_MODE = { match: /(\/[a-z._-]+)+/ };

  // http://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
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
    name: 'Bash',
    aliases: [
      'sh',
      'zsh'
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: KEYWORDS,
      literal: LITERALS,
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
      KNOWN_SHEBANG, // to catch known shells and boost relevancy
      hljs.SHEBANG(), // to catch unknown shells but still highlight the shebang
      FUNCTION,
      ARITHMETIC,
      COMMENT,
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

/*
Language: C
Category: common, system
Website: https://en.wikipedia.org/wiki/C_(programming_language)
*/

/** @type LanguageFn */
function c(hljs) {
  const regex = hljs.regex;
  // added for historic reasons because `hljs.C_LINE_COMMENT_MODE` does
  // not include such support nor can we be sure all the grammars depending
  // on it would desire this behavior
  const C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$', { contains: [ { begin: /\\\n/ } ] });
  const DECLTYPE_AUTO_RE = 'decltype\\(auto\\)';
  const NAMESPACE_RE = '[a-zA-Z_]\\w*::';
  const TEMPLATE_ARGUMENT_RE = '<[^<>]+>';
  const FUNCTION_TYPE_RE = '('
    + DECLTYPE_AUTO_RE + '|'
    + regex.optional(NAMESPACE_RE)
    + '[a-zA-Z_]\\w*' + regex.optional(TEMPLATE_ARGUMENT_RE)
  + ')';


  const TYPES = {
    className: 'type',
    variants: [
      { begin: '\\b[a-z\\d_]*_t\\b' },
      { match: /\batomic_[a-z]{3,6}\b/ }
    ]

  };

  // https://en.cppreference.com/w/cpp/language/escape
  // \\ \x \xFF \u2837 \u00323747 \374
  const CHARACTER_ESCAPES = '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)';
  const STRINGS = {
    className: 'string',
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: '\\n',
        contains: [ hljs.BACKSLASH_ESCAPE ]
      },
      {
        begin: '(u8?|U|L)?\'(' + CHARACTER_ESCAPES + "|.)",
        end: '\'',
        illegal: '.'
      },
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  };

  const NUMBERS = {
    className: 'number',
    variants: [
      { match: /\b(0b[01']+)/ },  
      { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },  
      { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },  
      { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }  
  ],
    relevance: 0
  };  
  
  const PREPROCESSOR = {
    className: 'meta',
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword:
        'if else elif endif define undef warning error line '
        + 'pragma _Pragma ifdef ifndef elifdef elifndef include' },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: 'string' }),
      {
        className: 'string',
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };

  const TITLE_MODE = {
    className: 'title',
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };

  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';

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

  const KEYWORDS = {
    keyword: C_KEYWORDS,
    type: C_TYPES,
    literal: 'true false NULL',
    // TODO: apply hinting work similar to what was done in cpp.js
    built_in: 'std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream '
      + 'auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set '
      + 'unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos '
      + 'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp '
      + 'fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper '
      + 'isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow '
      + 'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp '
      + 'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan '
      + 'vfprintf vprintf vsprintf endl initializer_list unique_ptr',
  };

  const EXPRESSION_CONTAINS = [
    PREPROCESSOR,
    TYPES,
    C_LINE_COMMENT_MODE,
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
        beginKeywords: 'new throw return else',
        end: /;/
      }
    ],
    keywords: KEYWORDS,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat([ 'self' ]),
        relevance: 0
      }
    ]),
    relevance: 0
  };

  const FUNCTION_DECLARATION = {
    begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+)+' + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: KEYWORDS,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      { // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: KEYWORDS,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [ hljs.inherit(TITLE_MODE, { className: "title.function" }) ],
        relevance: 0
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: 'params',
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          TYPES,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS,
            relevance: 0,
            contains: [
              'self',
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              TYPES
            ]
          }
        ]
      },
      TYPES,
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      PREPROCESSOR
    ]
  };

  return {
    name: "C",
    aliases: [ 'h' ],
    keywords: KEYWORDS,
    // Until differentiations are added between `c` and `cpp`, `c` will
    // not be auto-detected to avoid auto-detect conflicts between C and C++
    disableAutodetect: true,
    illegal: '</',
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      EXPRESSION_CONTAINS,
      [
        PREPROCESSOR,
        {
          begin: hljs.IDENT_RE + '::',
          keywords: KEYWORDS
        },
        {
          className: 'class',
          beginKeywords: 'enum class struct union',
          end: /[{;:<>=]/,
          contains: [
            { beginKeywords: "final class struct" },
            hljs.TITLE_MODE
          ]
        }
      ]),
    exports: {
      preprocessor: PREPROCESSOR,
      strings: STRINGS,
      keywords: KEYWORDS
    }
  };
}

/*
Language: C++
Category: common, system
Website: https://isocpp.org
*/

/** @type LanguageFn */
function cpp(hljs) {
  const regex = hljs.regex;
  // added for historic reasons because `hljs.C_LINE_COMMENT_MODE` does
  // not include such support nor can we be sure all the grammars depending
  // on it would desire this behavior
  const C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$', { contains: [ { begin: /\\\n/ } ] });
  const DECLTYPE_AUTO_RE = 'decltype\\(auto\\)';
  const NAMESPACE_RE = '[a-zA-Z_]\\w*::';
  const TEMPLATE_ARGUMENT_RE = '<[^<>]+>';
  const FUNCTION_TYPE_RE = '(?!struct)('
    + DECLTYPE_AUTO_RE + '|'
    + regex.optional(NAMESPACE_RE)
    + '[a-zA-Z_]\\w*' + regex.optional(TEMPLATE_ARGUMENT_RE)
  + ')';

  const CPP_PRIMITIVE_TYPES = {
    className: 'type',
    begin: '\\b[a-z\\d_]*_t\\b'
  };

  // https://en.cppreference.com/w/cpp/language/escape
  // \\ \x \xFF \u2837 \u00323747 \374
  const CHARACTER_ESCAPES = '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)';
  const STRINGS = {
    className: 'string',
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: '\\n',
        contains: [ hljs.BACKSLASH_ESCAPE ]
      },
      {
        begin: '(u8?|U|L)?\'(' + CHARACTER_ESCAPES + '|.)',
        end: '\'',
        illegal: '.'
      },
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  };

  const NUMBERS = {
    className: 'number',
    variants: [
      // Floating-point literal.
      { begin:
        "[+-]?(?:" // Leading sign.
          // Decimal.
          + "(?:"
            +"[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?"
            + "|\\.[0-9](?:'?[0-9])*"
          + ")(?:[Ee][+-]?[0-9](?:'?[0-9])*)?"
          + "|[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*"
          // Hexadecimal.
          + "|0[Xx](?:"
            +"[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?"
            + "|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*"
          + ")[Pp][+-]?[0-9](?:'?[0-9])*"
        + ")(?:" // Literal suffixes.
          + "[Ff](?:16|32|64|128)?"
          + "|(BF|bf)16"
          + "|[Ll]"
          + "|" // Literal suffix is optional.
        + ")"
      },
      // Integer literal.
      { begin:
        "[+-]?\\b(?:" // Leading sign.
          + "0[Bb][01](?:'?[01])*" // Binary.
          + "|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*" // Hexadecimal.
          + "|0(?:'?[0-7])*" // Octal or just a lone zero.
          + "|[1-9](?:'?[0-9])*" // Decimal.
        + ")(?:" // Literal suffixes.
          + "[Uu](?:LL?|ll?)"
          + "|[Uu][Zz]?"
          + "|(?:LL?|ll?)[Uu]?"
          + "|[Zz][Uu]"
          + "|" // Literal suffix is optional.
        + ")"
        // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
        // literal highlight actually makes it stand out more.
      }
    ],
    relevance: 0
  };

  const PREPROCESSOR = {
    className: 'meta',
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword:
        'if else elif endif define undef warning error line '
        + 'pragma _Pragma ifdef ifndef include' },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: 'string' }),
      {
        className: 'string',
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };

  const TITLE_MODE = {
    className: 'title',
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };

  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';

  // https://en.cppreference.com/w/cpp/keyword
  const RESERVED_KEYWORDS = [
    'alignas',
    'alignof',
    'and',
    'and_eq',
    'asm',
    'atomic_cancel',
    'atomic_commit',
    'atomic_noexcept',
    'auto',
    'bitand',
    'bitor',
    'break',
    'case',
    'catch',
    'class',
    'co_await',
    'co_return',
    'co_yield',
    'compl',
    'concept',
    'const_cast|10',
    'consteval',
    'constexpr',
    'constinit',
    'continue',
    'decltype',
    'default',
    'delete',
    'do',
    'dynamic_cast|10',
    'else',
    'enum',
    'explicit',
    'export',
    'extern',
    'false',
    'final',
    'for',
    'friend',
    'goto',
    'if',
    'import',
    'inline',
    'module',
    'mutable',
    'namespace',
    'new',
    'noexcept',
    'not',
    'not_eq',
    'nullptr',
    'operator',
    'or',
    'or_eq',
    'override',
    'private',
    'protected',
    'public',
    'reflexpr',
    'register',
    'reinterpret_cast|10',
    'requires',
    'return',
    'sizeof',
    'static_assert',
    'static_cast|10',
    'struct',
    'switch',
    'synchronized',
    'template',
    'this',
    'thread_local',
    'throw',
    'transaction_safe',
    'transaction_safe_dynamic',
    'true',
    'try',
    'typedef',
    'typeid',
    'typename',
    'union',
    'using',
    'virtual',
    'volatile',
    'while',
    'xor',
    'xor_eq'
  ];

  // https://en.cppreference.com/w/cpp/keyword
  const RESERVED_TYPES = [
    'bool',
    'char',
    'char16_t',
    'char32_t',
    'char8_t',
    'double',
    'float',
    'int',
    'long',
    'short',
    'void',
    'wchar_t',
    'unsigned',
    'signed',
    'const',
    'static'
  ];

  const TYPE_HINTS = [
    'any',
    'auto_ptr',
    'barrier',
    'binary_semaphore',
    'bitset',
    'complex',
    'condition_variable',
    'condition_variable_any',
    'counting_semaphore',
    'deque',
    'false_type',
    'flat_map',
    'flat_set',
    'future',
    'imaginary',
    'initializer_list',
    'istringstream',
    'jthread',
    'latch',
    'lock_guard',
    'multimap',
    'multiset',
    'mutex',
    'optional',
    'ostringstream',
    'packaged_task',
    'pair',
    'promise',
    'priority_queue',
    'queue',
    'recursive_mutex',
    'recursive_timed_mutex',
    'scoped_lock',
    'set',
    'shared_future',
    'shared_lock',
    'shared_mutex',
    'shared_timed_mutex',
    'shared_ptr',
    'stack',
    'string_view',
    'stringstream',
    'timed_mutex',
    'thread',
    'true_type',
    'tuple',
    'unique_lock',
    'unique_ptr',
    'unordered_map',
    'unordered_multimap',
    'unordered_multiset',
    'unordered_set',
    'variant',
    'vector',
    'weak_ptr',
    'wstring',
    'wstring_view'
  ];

  const FUNCTION_HINTS = [
    'abort',
    'abs',
    'acos',
    'apply',
    'as_const',
    'asin',
    'atan',
    'atan2',
    'calloc',
    'ceil',
    'cerr',
    'cin',
    'clog',
    'cos',
    'cosh',
    'cout',
    'declval',
    'endl',
    'exchange',
    'exit',
    'exp',
    'fabs',
    'floor',
    'fmod',
    'forward',
    'fprintf',
    'fputs',
    'free',
    'frexp',
    'fscanf',
    'future',
    'invoke',
    'isalnum',
    'isalpha',
    'iscntrl',
    'isdigit',
    'isgraph',
    'islower',
    'isprint',
    'ispunct',
    'isspace',
    'isupper',
    'isxdigit',
    'labs',
    'launder',
    'ldexp',
    'log',
    'log10',
    'make_pair',
    'make_shared',
    'make_shared_for_overwrite',
    'make_tuple',
    'make_unique',
    'malloc',
    'memchr',
    'memcmp',
    'memcpy',
    'memset',
    'modf',
    'move',
    'pow',
    'printf',
    'putchar',
    'puts',
    'realloc',
    'scanf',
    'sin',
    'sinh',
    'snprintf',
    'sprintf',
    'sqrt',
    'sscanf',
    'std',
    'stderr',
    'stdin',
    'stdout',
    'strcat',
    'strchr',
    'strcmp',
    'strcpy',
    'strcspn',
    'strlen',
    'strncat',
    'strncmp',
    'strncpy',
    'strpbrk',
    'strrchr',
    'strspn',
    'strstr',
    'swap',
    'tan',
    'tanh',
    'terminate',
    'to_underlying',
    'tolower',
    'toupper',
    'vfprintf',
    'visit',
    'vprintf',
    'vsprintf'
  ];

  const LITERALS = [
    'NULL',
    'false',
    'nullopt',
    'nullptr',
    'true'
  ];

  // https://en.cppreference.com/w/cpp/keyword
  const BUILT_IN = [ '_Pragma' ];

  const CPP_KEYWORDS = {
    type: RESERVED_TYPES,
    keyword: RESERVED_KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_IN,
    _type_hints: TYPE_HINTS
  };

  const FUNCTION_DISPATCH = {
    className: 'function.dispatch',
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: FUNCTION_HINTS },
    begin: regex.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      hljs.IDENT_RE,
      regex.lookahead(/(<[^<>]+>|)\s*\(/))
  };

  const EXPRESSION_CONTAINS = [
    FUNCTION_DISPATCH,
    PREPROCESSOR,
    CPP_PRIMITIVE_TYPES,
    C_LINE_COMMENT_MODE,
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
        beginKeywords: 'new throw return else',
        end: /;/
      }
    ],
    keywords: CPP_KEYWORDS,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat([ 'self' ]),
        relevance: 0
      }
    ]),
    relevance: 0
  };

  const FUNCTION_DECLARATION = {
    className: 'function',
    begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+)+' + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: CPP_KEYWORDS,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      { // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: CPP_KEYWORDS,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [ TITLE_MODE ],
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
        className: 'params',
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE,
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
              'self',
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              CPP_PRIMITIVE_TYPES
            ]
          }
        ]
      },
      CPP_PRIMITIVE_TYPES,
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      PREPROCESSOR
    ]
  };

  return {
    name: 'C++',
    aliases: [
      'cc',
      'c++',
      'h++',
      'hpp',
      'hh',
      'hxx',
      'cxx'
    ],
    keywords: CPP_KEYWORDS,
    illegal: '</',
    classNameAliases: { 'function.dispatch': 'built_in' },
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      FUNCTION_DISPATCH,
      EXPRESSION_CONTAINS,
      [
        PREPROCESSOR,
        { // containers: ie, `vector <int> rooms (9);`
          begin: '\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)',
          end: '>',
          keywords: CPP_KEYWORDS,
          contains: [
            'self',
            CPP_PRIMITIVE_TYPES
          ]
        },
        {
          begin: hljs.IDENT_RE + '::',
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
            1: 'keyword',
            3: 'title.class'
          }
        }
      ])
  };
}

/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
Contributor: Nicolas LLOBERA <nllobera@gmail.com>, Pieter Vantorre <pietervantorre@gmail.com>, David Pine <david.pine@microsoft.com>
Website: https://docs.microsoft.com/dotnet/csharp/
Category: common
*/

/** @type LanguageFn */
function csharp(hljs) {
  const BUILT_IN_KEYWORDS = [
    'bool',
    'byte',
    'char',
    'decimal',
    'delegate',
    'double',
    'dynamic',
    'enum',
    'float',
    'int',
    'long',
    'nint',
    'nuint',
    'object',
    'sbyte',
    'short',
    'string',
    'ulong',
    'uint',
    'ushort'
  ];
  const FUNCTION_MODIFIERS = [
    'public',
    'private',
    'protected',
    'static',
    'internal',
    'protected',
    'abstract',
    'async',
    'extern',
    'override',
    'unsafe',
    'virtual',
    'new',
    'sealed',
    'partial'
  ];
  const LITERAL_KEYWORDS = [
    'default',
    'false',
    'null',
    'true'
  ];
  const NORMAL_KEYWORDS = [
    'abstract',
    'as',
    'base',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'do',
    'else',
    'event',
    'explicit',
    'extern',
    'finally',
    'fixed',
    'for',
    'foreach',
    'goto',
    'if',
    'implicit',
    'in',
    'interface',
    'internal',
    'is',
    'lock',
    'namespace',
    'new',
    'operator',
    'out',
    'override',
    'params',
    'private',
    'protected',
    'public',
    'readonly',
    'record',
    'ref',
    'return',
    'scoped',
    'sealed',
    'sizeof',
    'stackalloc',
    'static',
    'struct',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'unchecked',
    'unsafe',
    'using',
    'virtual',
    'void',
    'volatile',
    'while'
  ];
  const CONTEXTUAL_KEYWORDS = [
    'add',
    'alias',
    'and',
    'ascending',
    'args',
    'async',
    'await',
    'by',
    'descending',
    'dynamic',
    'equals',
    'file',
    'from',
    'get',
    'global',
    'group',
    'init',
    'into',
    'join',
    'let',
    'nameof',
    'not',
    'notnull',
    'on',
    'or',
    'orderby',
    'partial',
    'record',
    'remove',
    'required',
    'scoped',
    'select',
    'set',
    'unmanaged',
    'value|0',
    'var',
    'when',
    'where',
    'with',
    'yield'
  ];

  const KEYWORDS = {
    keyword: NORMAL_KEYWORDS.concat(CONTEXTUAL_KEYWORDS),
    built_in: BUILT_IN_KEYWORDS,
    literal: LITERAL_KEYWORDS
  };
  const TITLE_MODE = hljs.inherit(hljs.TITLE_MODE, { begin: '[a-zA-Z](\\.?\\w)*' });
  const NUMBERS = {
    className: 'number',
    variants: [
      { begin: '\\b(0b[01\']+)' },
      { begin: '(-?)\\b([\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)(u|U|l|L|ul|UL|f|F|b|B)' },
      { begin: '(-?)(\\b0[xX][a-fA-F0-9\']+|(\\b[\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)([eE][-+]?[\\d\']+)?)' }
    ],
    relevance: 0
  };
  const RAW_STRING = {
    className: 'string',
    begin: /"""("*)(?!")(.|\n)*?"""\1/,
    relevance: 1
  };
  const VERBATIM_STRING = {
    className: 'string',
    begin: '@"',
    end: '"',
    contains: [ { begin: '""' } ]
  };
  const VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
  const SUBST = {
    className: 'subst',
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS
  };
  const SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
  const INTERPOLATED_STRING = {
    className: 'string',
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
    className: 'string',
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
      TITLE_MODE
    ]
  };
  const TYPE_IDENT_RE = hljs.IDENT_RE + '(<' + hljs.IDENT_RE + '(\\s*,\\s*' + hljs.IDENT_RE + ')*>)?(\\[\\])?';
  const AT_IDENTIFIER = {
    // prevents expressions like `@class` from incorrect flagging
    // `class` as a keyword
    begin: "@" + hljs.IDENT_RE,
    relevance: 0
  };

  return {
    name: 'C#',
    aliases: [
      'cs',
      'c#'
    ],
    keywords: KEYWORDS,
    illegal: /::/,
    contains: [
      hljs.COMMENT(
        '///',
        '$',
        {
          returnBegin: true,
          contains: [
            {
              className: 'doctag',
              variants: [
                {
                  begin: '///',
                  relevance: 0
                },
                { begin: '<!--|-->' },
                {
                  begin: '</?',
                  end: '>'
                }
              ]
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'meta',
        begin: '#',
        end: '$',
        keywords: { keyword: 'if else elif endif define undef warning error line region endregion pragma checksum' }
      },
      STRING,
      NUMBERS,
      {
        beginKeywords: 'class interface',
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:,]/,
        contains: [
          { beginKeywords: "where class" },
          TITLE_MODE,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: 'namespace',
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: 'record',
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // [Attributes("")]
        className: 'meta',
        begin: '^\\s*\\[(?=[\\w])',
        excludeBegin: true,
        end: '\\]',
        excludeEnd: true,
        contains: [
          {
            className: 'string',
            begin: /"/,
            end: /"/
          }
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: 'new return throw await else',
        relevance: 0
      },
      {
        className: 'function',
        begin: '(' + TYPE_IDENT_RE + '\\s+)+' + hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
        returnBegin: true,
        end: /\s*[{;=]/,
        excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          // prevents these from being highlighted `title`
          {
            beginKeywords: FUNCTION_MODIFIERS.join(" "),
            relevance: 0
          },
          {
            begin: hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
            returnBegin: true,
            contains: [
              hljs.TITLE_MODE,
              GENERIC_MODIFIER
            ],
            relevance: 0
          },
          { match: /\(\)/ },
          {
            className: 'params',
            begin: /\(/,
            end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS,
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
      scope: 'meta',
      begin: '!important'
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: 'number',
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: 'selector-attr',
      begin: /\[/,
      end: /\]/,
      illegal: '$',
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: 'number',
      begin: hljs.NUMBER_RE + '(' +
        '%|em|ex|ch|rem' +
        '|vw|vh|vmin|vmax' +
        '|cm|mm|in|pt|pc|px' +
        '|deg|grad|rad|turn' +
        '|s|ms' +
        '|Hz|kHz' +
        '|dpi|dpcm|dppx' +
        ')?',
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};

const HTML_TAGS$2 = [
  'a',
  'abbr',
  'address',
  'article',
  'aside',
  'audio',
  'b',
  'blockquote',
  'body',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'dd',
  'del',
  'details',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'mark',
  'menu',
  'nav',
  'object',
  'ol',
  'optgroup',
  'option',
  'p',
  'picture',
  'q',
  'quote',
  'samp',
  'section',
  'select',
  'source',
  'span',
  'strong',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'ul',
  'var',
  'video'
];

const SVG_TAGS$2 = [
  'defs',
  'g',
  'marker',
  'mask',
  'pattern',
  'svg',
  'switch',
  'symbol',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feFlood',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMorphology',
  'feOffset',
  'feSpecularLighting',
  'feTile',
  'feTurbulence',
  'linearGradient',
  'radialGradient',
  'stop',
  'circle',
  'ellipse',
  'image',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
  'use',
  'textPath',
  'tspan',
  'foreignObject',
  'clipPath'
];

const TAGS$2 = [
  ...HTML_TAGS$2,
  ...SVG_TAGS$2,
];

// Sorting, then reversing makes sure longer attributes/elements like
// `font-weight` are matched fully instead of getting false positives on say `font`

const MEDIA_FEATURES$2 = [
  'any-hover',
  'any-pointer',
  'aspect-ratio',
  'color',
  'color-gamut',
  'color-index',
  'device-aspect-ratio',
  'device-height',
  'device-width',
  'display-mode',
  'forced-colors',
  'grid',
  'height',
  'hover',
  'inverted-colors',
  'monochrome',
  'orientation',
  'overflow-block',
  'overflow-inline',
  'pointer',
  'prefers-color-scheme',
  'prefers-contrast',
  'prefers-reduced-motion',
  'prefers-reduced-transparency',
  'resolution',
  'scan',
  'scripting',
  'update',
  'width',
  // TODO: find a better solution?
  'min-width',
  'max-width',
  'min-height',
  'max-height'
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
const PSEUDO_CLASSES$2 = [
  'active',
  'any-link',
  'blank',
  'checked',
  'current',
  'default',
  'defined',
  'dir', // dir()
  'disabled',
  'drop',
  'empty',
  'enabled',
  'first',
  'first-child',
  'first-of-type',
  'fullscreen',
  'future',
  'focus',
  'focus-visible',
  'focus-within',
  'has', // has()
  'host', // host or host()
  'host-context', // host-context()
  'hover',
  'indeterminate',
  'in-range',
  'invalid',
  'is', // is()
  'lang', // lang()
  'last-child',
  'last-of-type',
  'left',
  'link',
  'local-link',
  'not', // not()
  'nth-child', // nth-child()
  'nth-col', // nth-col()
  'nth-last-child', // nth-last-child()
  'nth-last-col', // nth-last-col()
  'nth-last-of-type', //nth-last-of-type()
  'nth-of-type', //nth-of-type()
  'only-child',
  'only-of-type',
  'optional',
  'out-of-range',
  'past',
  'placeholder-shown',
  'read-only',
  'read-write',
  'required',
  'right',
  'root',
  'scope',
  'target',
  'target-within',
  'user-invalid',
  'valid',
  'visited',
  'where' // where()
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
const PSEUDO_ELEMENTS$2 = [
  'after',
  'backdrop',
  'before',
  'cue',
  'cue-region',
  'first-letter',
  'first-line',
  'grammar-error',
  'marker',
  'part',
  'placeholder',
  'selection',
  'slotted',
  'spelling-error'
].sort().reverse();

const ATTRIBUTES$2 = [
  'accent-color',
  'align-content',
  'align-items',
  'align-self',
  'alignment-baseline',
  'all',
  'anchor-name',
  'animation',
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-range',
  'animation-range-end',
  'animation-range-start',
  'animation-timeline',
  'animation-timing-function',
  'appearance',
  'aspect-ratio',
  'backdrop-filter',
  'backface-visibility',
  'background',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-position-x',
  'background-position-y',
  'background-repeat',
  'background-size',
  'baseline-shift',
  'block-size',
  'border',
  'border-block',
  'border-block-color',
  'border-block-end',
  'border-block-end-color',
  'border-block-end-style',
  'border-block-end-width',
  'border-block-start',
  'border-block-start-color',
  'border-block-start-style',
  'border-block-start-width',
  'border-block-style',
  'border-block-width',
  'border-bottom',
  'border-bottom-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-style',
  'border-bottom-width',
  'border-collapse',
  'border-color',
  'border-end-end-radius',
  'border-end-start-radius',
  'border-image',
  'border-image-outset',
  'border-image-repeat',
  'border-image-slice',
  'border-image-source',
  'border-image-width',
  'border-inline',
  'border-inline-color',
  'border-inline-end',
  'border-inline-end-color',
  'border-inline-end-style',
  'border-inline-end-width',
  'border-inline-start',
  'border-inline-start-color',
  'border-inline-start-style',
  'border-inline-start-width',
  'border-inline-style',
  'border-inline-width',
  'border-left',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-radius',
  'border-right',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-spacing',
  'border-start-end-radius',
  'border-start-start-radius',
  'border-style',
  'border-top',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'border-width',
  'bottom',
  'box-align',
  'box-decoration-break',
  'box-direction',
  'box-flex',
  'box-flex-group',
  'box-lines',
  'box-ordinal-group',
  'box-orient',
  'box-pack',
  'box-shadow',
  'box-sizing',
  'break-after',
  'break-before',
  'break-inside',
  'caption-side',
  'caret-color',
  'clear',
  'clip',
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-profile',
  'color-rendering',
  'color-scheme',
  'column-count',
  'column-fill',
  'column-gap',
  'column-rule',
  'column-rule-color',
  'column-rule-style',
  'column-rule-width',
  'column-span',
  'column-width',
  'columns',
  'contain',
  'contain-intrinsic-block-size',
  'contain-intrinsic-height',
  'contain-intrinsic-inline-size',
  'contain-intrinsic-size',
  'contain-intrinsic-width',
  'container',
  'container-name',
  'container-type',
  'content',
  'content-visibility',
  'counter-increment',
  'counter-reset',
  'counter-set',
  'cue',
  'cue-after',
  'cue-before',
  'cursor',
  'cx',
  'cy',
  'direction',
  'display',
  'dominant-baseline',
  'empty-cells',
  'enable-background',
  'field-sizing',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'float',
  'flood-color',
  'flood-opacity',
  'flow',
  'font',
  'font-display',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-optical-sizing',
  'font-palette',
  'font-size',
  'font-size-adjust',
  'font-smooth',
  'font-smoothing',
  'font-stretch',
  'font-style',
  'font-synthesis',
  'font-synthesis-position',
  'font-synthesis-small-caps',
  'font-synthesis-style',
  'font-synthesis-weight',
  'font-variant',
  'font-variant-alternates',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-emoji',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-variation-settings',
  'font-weight',
  'forced-color-adjust',
  'gap',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-gap',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'hanging-punctuation',
  'height',
  'hyphenate-character',
  'hyphenate-limit-chars',
  'hyphens',
  'icon',
  'image-orientation',
  'image-rendering',
  'image-resolution',
  'ime-mode',
  'initial-letter',
  'initial-letter-align',
  'inline-size',
  'inset',
  'inset-area',
  'inset-block',
  'inset-block-end',
  'inset-block-start',
  'inset-inline',
  'inset-inline-end',
  'inset-inline-start',
  'isolation',
  'justify-content',
  'justify-items',
  'justify-self',
  'kerning',
  'left',
  'letter-spacing',
  'lighting-color',
  'line-break',
  'line-height',
  'line-height-step',
  'list-style',
  'list-style-image',
  'list-style-position',
  'list-style-type',
  'margin',
  'margin-block',
  'margin-block-end',
  'margin-block-start',
  'margin-bottom',
  'margin-inline',
  'margin-inline-end',
  'margin-inline-start',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-trim',
  'marker',
  'marker-end',
  'marker-mid',
  'marker-start',
  'marks',
  'mask',
  'mask-border',
  'mask-border-mode',
  'mask-border-outset',
  'mask-border-repeat',
  'mask-border-slice',
  'mask-border-source',
  'mask-border-width',
  'mask-clip',
  'mask-composite',
  'mask-image',
  'mask-mode',
  'mask-origin',
  'mask-position',
  'mask-repeat',
  'mask-size',
  'mask-type',
  'masonry-auto-flow',
  'math-depth',
  'math-shift',
  'math-style',
  'max-block-size',
  'max-height',
  'max-inline-size',
  'max-width',
  'min-block-size',
  'min-height',
  'min-inline-size',
  'min-width',
  'mix-blend-mode',
  'nav-down',
  'nav-index',
  'nav-left',
  'nav-right',
  'nav-up',
  'none',
  'normal',
  'object-fit',
  'object-position',
  'offset',
  'offset-anchor',
  'offset-distance',
  'offset-path',
  'offset-position',
  'offset-rotate',
  'opacity',
  'order',
  'orphans',
  'outline',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  'overflow',
  'overflow-anchor',
  'overflow-block',
  'overflow-clip-margin',
  'overflow-inline',
  'overflow-wrap',
  'overflow-x',
  'overflow-y',
  'overlay',
  'overscroll-behavior',
  'overscroll-behavior-block',
  'overscroll-behavior-inline',
  'overscroll-behavior-x',
  'overscroll-behavior-y',
  'padding',
  'padding-block',
  'padding-block-end',
  'padding-block-start',
  'padding-bottom',
  'padding-inline',
  'padding-inline-end',
  'padding-inline-start',
  'padding-left',
  'padding-right',
  'padding-top',
  'page',
  'page-break-after',
  'page-break-before',
  'page-break-inside',
  'paint-order',
  'pause',
  'pause-after',
  'pause-before',
  'perspective',
  'perspective-origin',
  'place-content',
  'place-items',
  'place-self',
  'pointer-events',
  'position',
  'position-anchor',
  'position-visibility',
  'print-color-adjust',
  'quotes',
  'r',
  'resize',
  'rest',
  'rest-after',
  'rest-before',
  'right',
  'rotate',
  'row-gap',
  'ruby-align',
  'ruby-position',
  'scale',
  'scroll-behavior',
  'scroll-margin',
  'scroll-margin-block',
  'scroll-margin-block-end',
  'scroll-margin-block-start',
  'scroll-margin-bottom',
  'scroll-margin-inline',
  'scroll-margin-inline-end',
  'scroll-margin-inline-start',
  'scroll-margin-left',
  'scroll-margin-right',
  'scroll-margin-top',
  'scroll-padding',
  'scroll-padding-block',
  'scroll-padding-block-end',
  'scroll-padding-block-start',
  'scroll-padding-bottom',
  'scroll-padding-inline',
  'scroll-padding-inline-end',
  'scroll-padding-inline-start',
  'scroll-padding-left',
  'scroll-padding-right',
  'scroll-padding-top',
  'scroll-snap-align',
  'scroll-snap-stop',
  'scroll-snap-type',
  'scroll-timeline',
  'scroll-timeline-axis',
  'scroll-timeline-name',
  'scrollbar-color',
  'scrollbar-gutter',
  'scrollbar-width',
  'shape-image-threshold',
  'shape-margin',
  'shape-outside',
  'shape-rendering',
  'speak',
  'speak-as',
  'src', // @font-face
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'tab-size',
  'table-layout',
  'text-align',
  'text-align-all',
  'text-align-last',
  'text-anchor',
  'text-combine-upright',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-skip',
  'text-decoration-skip-ink',
  'text-decoration-style',
  'text-decoration-thickness',
  'text-emphasis',
  'text-emphasis-color',
  'text-emphasis-position',
  'text-emphasis-style',
  'text-indent',
  'text-justify',
  'text-orientation',
  'text-overflow',
  'text-rendering',
  'text-shadow',
  'text-size-adjust',
  'text-transform',
  'text-underline-offset',
  'text-underline-position',
  'text-wrap',
  'text-wrap-mode',
  'text-wrap-style',
  'timeline-scope',
  'top',
  'touch-action',
  'transform',
  'transform-box',
  'transform-origin',
  'transform-style',
  'transition',
  'transition-behavior',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'translate',
  'unicode-bidi',
  'user-modify',
  'user-select',
  'vector-effect',
  'vertical-align',
  'view-timeline',
  'view-timeline-axis',
  'view-timeline-inset',
  'view-timeline-name',
  'view-transition-name',
  'visibility',
  'voice-balance',
  'voice-duration',
  'voice-family',
  'voice-pitch',
  'voice-range',
  'voice-rate',
  'voice-stress',
  'voice-volume',
  'white-space',
  'white-space-collapse',
  'widows',
  'width',
  'will-change',
  'word-break',
  'word-spacing',
  'word-wrap',
  'writing-mode',
  'x',
  'y',
  'z-index',
  'zoom'
].sort().reverse();

/*
Language: CSS
Category: common, css, web
Website: https://developer.mozilla.org/en-US/docs/Web/CSS
*/


/** @type LanguageFn */
function css(hljs) {
  const regex = hljs.regex;
  const modes = MODES$2(hljs);
  const VENDOR_PREFIX = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ };
  const AT_MODIFIERS = "and or not only";
  const AT_PROPERTY_RE = /@-?\w[\w]*(-\w+)*/; // @-webkit-keyframes
  const IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  const STRINGS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ];

  return {
    name: 'CSS',
    case_insensitive: true,
    illegal: /[=|'\$]/,
    keywords: { keyframePosition: "from to" },
    classNameAliases: {
      // for visual continuity with `tag {}` and because we
      // don't have a great class for this?
      keyframePosition: "selector-tag" },
    contains: [
      modes.BLOCK_COMMENT,
      VENDOR_PREFIX,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: 'selector-id',
        begin: /#[A-Za-z0-9_-]+/,
        relevance: 0
      },
      {
        className: 'selector-class',
        begin: '\\.' + IDENT_RE,
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: 'selector-pseudo',
        variants: [
          { begin: ':(' + PSEUDO_CLASSES$2.join('|') + ')' },
          { begin: ':(:)?(' + PSEUDO_ELEMENTS$2.join('|') + ')' }
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
        className: 'attribute',
        begin: '\\b(' + ATTRIBUTES$2.join('|') + ')\\b'
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
            relevance: 0, // from keywords
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
        end: '[{;]',
        relevance: 0,
        illegal: /:/, // break on Less variables @var: ...
        contains: [
          {
            className: 'keyword',
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
        className: 'selector-tag',
        begin: '\\b(' + TAGS$2.join('|') + ')\\b'
      }
    ]
  };
}

/*
Language: Dart
Requires: markdown.js
Author: Maxim Dikun <dikmax@gmail.com>
Description: Dart a modern, object-oriented language developed by Google. For more information see https://www.dartlang.org/
Website: https://dart.dev
Category: scripting
*/

/** @type LanguageFn */
function dart(hljs) {
  const SUBST = {
    className: 'subst',
    variants: [ { begin: '\\$[A-Za-z0-9_]+' } ]
  };

  const BRACED_SUBST = {
    className: 'subst',
    variants: [
      {
        begin: /\$\{/,
        end: /\}/
      }
    ],
    keywords: 'true false null this is new super'
  };

  const NUMBER = {
    className: 'number',
    relevance: 0,
    variants: [
      { match: /\b[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?\b/ },
      { match: /\b0[xX][0-9A-Fa-f][0-9A-Fa-f_]*\b/ }
    ]
  };

  const STRING = {
    className: 'string',
    variants: [
      {
        begin: 'r\'\'\'',
        end: '\'\'\''
      },
      {
        begin: 'r"""',
        end: '"""'
      },
      {
        begin: 'r\'',
        end: '\'',
        illegal: '\\n'
      },
      {
        begin: 'r"',
        end: '"',
        illegal: '\\n'
      },
      {
        begin: '\'\'\'',
        end: '\'\'\'',
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
        begin: '\'',
        end: '\'',
        illegal: '\\n',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: '"',
        end: '"',
        illegal: '\\n',
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
    'Comparable',
    'DateTime',
    'Duration',
    'Function',
    'Iterable',
    'Iterator',
    'List',
    'Map',
    'Match',
    'Object',
    'Pattern',
    'RegExp',
    'Set',
    'Stopwatch',
    'String',
    'StringBuffer',
    'StringSink',
    'Symbol',
    'Type',
    'Uri',
    'bool',
    'double',
    'int',
    'num',
    // dart:html
    'Element',
    'ElementList'
  ];
  const NULLABLE_BUILT_IN_TYPES = BUILT_IN_TYPES.map((e) => `${e}?`);

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

  const KEYWORDS = {
    keyword: BASIC_KEYWORDS,
    built_in:
      BUILT_IN_TYPES
        .concat(NULLABLE_BUILT_IN_TYPES)
        .concat([
          // dart:core
          'Never',
          'Null',
          'dynamic',
          'print',
          // dart:html
          'document',
          'querySelector',
          'querySelectorAll',
          'window'
        ]),
    $pattern: /[A-Za-z][A-Za-z0-9_]*\??/
  };

  return {
    name: 'Dart',
    keywords: KEYWORDS,
    contains: [
      STRING,
      hljs.COMMENT(
        /\/\*\*(?!\/)/,
        /\*\//,
        {
          subLanguage: 'markdown',
          relevance: 0
        }
      ),
      hljs.COMMENT(
        /\/{3,} ?/,
        /$/, { contains: [
          {
            subLanguage: 'markdown',
            begin: '.',
            end: '$',
            relevance: 0
          }
        ] }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'class',
        beginKeywords: 'class interface',
        end: /\{/,
        excludeEnd: true,
        contains: [
          { beginKeywords: 'extends implements' },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      NUMBER,
      {
        className: 'meta',
        begin: '@[A-Za-z]+'
      },
      { begin: '=>' // No markup, just a relevance booster
      }
    ]
  };
}

/*
Language: Batch file (DOS)
Author: Alexander Makarov <sam@rmcreative.ru>
Contributors: Anton Kochkov <anton.kochkov@gmail.com>
Website: https://en.wikipedia.org/wiki/Batch_file
Category: scripting
*/

/** @type LanguageFn */
function dos(hljs) {
  const COMMENT = hljs.COMMENT(
    /^\s*@?rem\b/, /$/,
    { relevance: 10 }
  );
  const LABEL = {
    className: 'symbol',
    begin: '^\\s*[A-Za-z._?][A-Za-z0-9_$#@~.?]*(:|\\s+label)',
    relevance: 0
  };
  const KEYWORDS = [
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
  const BUILT_INS = [
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
    name: 'Batch file (DOS)',
    aliases: [
      'bat',
      'cmd'
    ],
    case_insensitive: true,
    illegal: /\/\*/,
    keywords: {
      keyword: KEYWORDS,
      built_in: BUILT_INS
    },
    contains: [
      {
        className: 'variable',
        begin: /%%[^ ]|%[^ ]+?%|![^ ]+?!/
      },
      {
        className: 'function',
        begin: LABEL.begin,
        end: 'goto:eof',
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: '([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*' }),
          COMMENT
        ]
      },
      {
        className: 'number',
        begin: '\\b\\d+',
        relevance: 0
      },
      COMMENT
    ]
  };
}

/*
Language: GLSL
Description: OpenGL Shading Language
Author: Sergey Tikhomirov <sergey@tikhomirov.io>
Website: https://en.wikipedia.org/wiki/OpenGL_Shading_Language
Category: graphics
*/

function glsl(hljs) {
  return {
    name: 'GLSL',
    keywords: {
      keyword:
        // Statements
        'break continue discard do else for if return while switch case default '
        // Qualifiers
        + 'attribute binding buffer ccw centroid centroid varying coherent column_major const cw '
        + 'depth_any depth_greater depth_less depth_unchanged early_fragment_tests equal_spacing '
        + 'flat fractional_even_spacing fractional_odd_spacing highp in index inout invariant '
        + 'invocations isolines layout line_strip lines lines_adjacency local_size_x local_size_y '
        + 'local_size_z location lowp max_vertices mediump noperspective offset origin_upper_left '
        + 'out packed patch pixel_center_integer point_mode points precise precision quads r11f_g11f_b10f '
        + 'r16 r16_snorm r16f r16i r16ui r32f r32i r32ui r8 r8_snorm r8i r8ui readonly restrict '
        + 'rg16 rg16_snorm rg16f rg16i rg16ui rg32f rg32i rg32ui rg8 rg8_snorm rg8i rg8ui rgb10_a2 '
        + 'rgb10_a2ui rgba16 rgba16_snorm rgba16f rgba16i rgba16ui rgba32f rgba32i rgba32ui rgba8 '
        + 'rgba8_snorm rgba8i rgba8ui row_major sample shared smooth std140 std430 stream triangle_strip '
        + 'triangles triangles_adjacency uniform varying vertices volatile writeonly',
      type:
        'atomic_uint bool bvec2 bvec3 bvec4 dmat2 dmat2x2 dmat2x3 dmat2x4 dmat3 dmat3x2 dmat3x3 '
        + 'dmat3x4 dmat4 dmat4x2 dmat4x3 dmat4x4 double dvec2 dvec3 dvec4 float iimage1D iimage1DArray '
        + 'iimage2D iimage2DArray iimage2DMS iimage2DMSArray iimage2DRect iimage3D iimageBuffer '
        + 'iimageCube iimageCubeArray image1D image1DArray image2D image2DArray image2DMS image2DMSArray '
        + 'image2DRect image3D imageBuffer imageCube imageCubeArray int isampler1D isampler1DArray '
        + 'isampler2D isampler2DArray isampler2DMS isampler2DMSArray isampler2DRect isampler3D '
        + 'isamplerBuffer isamplerCube isamplerCubeArray ivec2 ivec3 ivec4 mat2 mat2x2 mat2x3 '
        + 'mat2x4 mat3 mat3x2 mat3x3 mat3x4 mat4 mat4x2 mat4x3 mat4x4 sampler1D sampler1DArray '
        + 'sampler1DArrayShadow sampler1DShadow sampler2D sampler2DArray sampler2DArrayShadow '
        + 'sampler2DMS sampler2DMSArray sampler2DRect sampler2DRectShadow sampler2DShadow sampler3D '
        + 'samplerBuffer samplerCube samplerCubeArray samplerCubeArrayShadow samplerCubeShadow '
        + 'image1D uimage1DArray uimage2D uimage2DArray uimage2DMS uimage2DMSArray uimage2DRect '
        + 'uimage3D uimageBuffer uimageCube uimageCubeArray uint usampler1D usampler1DArray '
        + 'usampler2D usampler2DArray usampler2DMS usampler2DMSArray usampler2DRect usampler3D '
        + 'samplerBuffer usamplerCube usamplerCubeArray uvec2 uvec3 uvec4 vec2 vec3 vec4 void',
      built_in:
        // Constants
        'gl_MaxAtomicCounterBindings gl_MaxAtomicCounterBufferSize gl_MaxClipDistances gl_MaxClipPlanes '
        + 'gl_MaxCombinedAtomicCounterBuffers gl_MaxCombinedAtomicCounters gl_MaxCombinedImageUniforms '
        + 'gl_MaxCombinedImageUnitsAndFragmentOutputs gl_MaxCombinedTextureImageUnits gl_MaxComputeAtomicCounterBuffers '
        + 'gl_MaxComputeAtomicCounters gl_MaxComputeImageUniforms gl_MaxComputeTextureImageUnits '
        + 'gl_MaxComputeUniformComponents gl_MaxComputeWorkGroupCount gl_MaxComputeWorkGroupSize '
        + 'gl_MaxDrawBuffers gl_MaxFragmentAtomicCounterBuffers gl_MaxFragmentAtomicCounters '
        + 'gl_MaxFragmentImageUniforms gl_MaxFragmentInputComponents gl_MaxFragmentInputVectors '
        + 'gl_MaxFragmentUniformComponents gl_MaxFragmentUniformVectors gl_MaxGeometryAtomicCounterBuffers '
        + 'gl_MaxGeometryAtomicCounters gl_MaxGeometryImageUniforms gl_MaxGeometryInputComponents '
        + 'gl_MaxGeometryOutputComponents gl_MaxGeometryOutputVertices gl_MaxGeometryTextureImageUnits '
        + 'gl_MaxGeometryTotalOutputComponents gl_MaxGeometryUniformComponents gl_MaxGeometryVaryingComponents '
        + 'gl_MaxImageSamples gl_MaxImageUnits gl_MaxLights gl_MaxPatchVertices gl_MaxProgramTexelOffset '
        + 'gl_MaxTessControlAtomicCounterBuffers gl_MaxTessControlAtomicCounters gl_MaxTessControlImageUniforms '
        + 'gl_MaxTessControlInputComponents gl_MaxTessControlOutputComponents gl_MaxTessControlTextureImageUnits '
        + 'gl_MaxTessControlTotalOutputComponents gl_MaxTessControlUniformComponents '
        + 'gl_MaxTessEvaluationAtomicCounterBuffers gl_MaxTessEvaluationAtomicCounters '
        + 'gl_MaxTessEvaluationImageUniforms gl_MaxTessEvaluationInputComponents gl_MaxTessEvaluationOutputComponents '
        + 'gl_MaxTessEvaluationTextureImageUnits gl_MaxTessEvaluationUniformComponents '
        + 'gl_MaxTessGenLevel gl_MaxTessPatchComponents gl_MaxTextureCoords gl_MaxTextureImageUnits '
        + 'gl_MaxTextureUnits gl_MaxVaryingComponents gl_MaxVaryingFloats gl_MaxVaryingVectors '
        + 'gl_MaxVertexAtomicCounterBuffers gl_MaxVertexAtomicCounters gl_MaxVertexAttribs gl_MaxVertexImageUniforms '
        + 'gl_MaxVertexOutputComponents gl_MaxVertexOutputVectors gl_MaxVertexTextureImageUnits '
        + 'gl_MaxVertexUniformComponents gl_MaxVertexUniformVectors gl_MaxViewports gl_MinProgramTexelOffset '
        // Variables
        + 'gl_BackColor gl_BackLightModelProduct gl_BackLightProduct gl_BackMaterial '
        + 'gl_BackSecondaryColor gl_ClipDistance gl_ClipPlane gl_ClipVertex gl_Color '
        + 'gl_DepthRange gl_EyePlaneQ gl_EyePlaneR gl_EyePlaneS gl_EyePlaneT gl_Fog gl_FogCoord '
        + 'gl_FogFragCoord gl_FragColor gl_FragCoord gl_FragData gl_FragDepth gl_FrontColor '
        + 'gl_FrontFacing gl_FrontLightModelProduct gl_FrontLightProduct gl_FrontMaterial '
        + 'gl_FrontSecondaryColor gl_GlobalInvocationID gl_InstanceID gl_InvocationID gl_Layer gl_LightModel '
        + 'gl_LightSource gl_LocalInvocationID gl_LocalInvocationIndex gl_ModelViewMatrix '
        + 'gl_ModelViewMatrixInverse gl_ModelViewMatrixInverseTranspose gl_ModelViewMatrixTranspose '
        + 'gl_ModelViewProjectionMatrix gl_ModelViewProjectionMatrixInverse gl_ModelViewProjectionMatrixInverseTranspose '
        + 'gl_ModelViewProjectionMatrixTranspose gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 '
        + 'gl_MultiTexCoord3 gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 gl_MultiTexCoord7 '
        + 'gl_Normal gl_NormalMatrix gl_NormalScale gl_NumSamples gl_NumWorkGroups gl_ObjectPlaneQ '
        + 'gl_ObjectPlaneR gl_ObjectPlaneS gl_ObjectPlaneT gl_PatchVerticesIn gl_Point gl_PointCoord '
        + 'gl_PointSize gl_Position gl_PrimitiveID gl_PrimitiveIDIn gl_ProjectionMatrix gl_ProjectionMatrixInverse '
        + 'gl_ProjectionMatrixInverseTranspose gl_ProjectionMatrixTranspose gl_SampleID gl_SampleMask '
        + 'gl_SampleMaskIn gl_SamplePosition gl_SecondaryColor gl_TessCoord gl_TessLevelInner gl_TessLevelOuter '
        + 'gl_TexCoord gl_TextureEnvColor gl_TextureMatrix gl_TextureMatrixInverse gl_TextureMatrixInverseTranspose '
        + 'gl_TextureMatrixTranspose gl_Vertex gl_VertexID gl_ViewportIndex gl_WorkGroupID gl_WorkGroupSize gl_in gl_out '
        // Functions
        + 'EmitStreamVertex EmitVertex EndPrimitive EndStreamPrimitive abs acos acosh all any asin '
        + 'asinh atan atanh atomicAdd atomicAnd atomicCompSwap atomicCounter atomicCounterDecrement '
        + 'atomicCounterIncrement atomicExchange atomicMax atomicMin atomicOr atomicXor barrier '
        + 'bitCount bitfieldExtract bitfieldInsert bitfieldReverse ceil clamp cos cosh cross '
        + 'dFdx dFdy degrees determinant distance dot equal exp exp2 faceforward findLSB findMSB '
        + 'floatBitsToInt floatBitsToUint floor fma fract frexp ftransform fwidth greaterThan '
        + 'greaterThanEqual groupMemoryBarrier imageAtomicAdd imageAtomicAnd imageAtomicCompSwap '
        + 'imageAtomicExchange imageAtomicMax imageAtomicMin imageAtomicOr imageAtomicXor imageLoad '
        + 'imageSize imageStore imulExtended intBitsToFloat interpolateAtCentroid interpolateAtOffset '
        + 'interpolateAtSample inverse inversesqrt isinf isnan ldexp length lessThan lessThanEqual log '
        + 'log2 matrixCompMult max memoryBarrier memoryBarrierAtomicCounter memoryBarrierBuffer '
        + 'memoryBarrierImage memoryBarrierShared min mix mod modf noise1 noise2 noise3 noise4 '
        + 'normalize not notEqual outerProduct packDouble2x32 packHalf2x16 packSnorm2x16 packSnorm4x8 '
        + 'packUnorm2x16 packUnorm4x8 pow radians reflect refract round roundEven shadow1D shadow1DLod '
        + 'shadow1DProj shadow1DProjLod shadow2D shadow2DLod shadow2DProj shadow2DProjLod sign sin sinh '
        + 'smoothstep sqrt step tan tanh texelFetch texelFetchOffset texture texture1D texture1DLod '
        + 'texture1DProj texture1DProjLod texture2D texture2DLod texture2DProj texture2DProjLod '
        + 'texture3D texture3DLod texture3DProj texture3DProjLod textureCube textureCubeLod '
        + 'textureGather textureGatherOffset textureGatherOffsets textureGrad textureGradOffset '
        + 'textureLod textureLodOffset textureOffset textureProj textureProjGrad textureProjGradOffset '
        + 'textureProjLod textureProjLodOffset textureProjOffset textureQueryLevels textureQueryLod '
        + 'textureSize transpose trunc uaddCarry uintBitsToFloat umulExtended unpackDouble2x32 '
        + 'unpackHalf2x16 unpackSnorm2x16 unpackSnorm4x8 unpackUnorm2x16 unpackUnorm4x8 usubBorrow',
      literal: 'true false'
    },
    illegal: '"',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      {
        className: 'meta',
        begin: '#',
        end: '$'
      }
    ]
  };
}

/*
Language: Go
Author: Stephan Kountso aka StepLg <steplg@gmail.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>
Description: Google go language (golang). For info about language
Website: http://golang.org/
Category: common, system
*/

function go(hljs) {
  const LITERALS = [
    "true",
    "false",
    "iota",
    "nil"
  ];
  const BUILT_INS = [
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
  const TYPES = [
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
    "var",
  ];
  const KEYWORDS = {
    keyword: KWS,
    type: TYPES,
    literal: LITERALS,
    built_in: BUILT_INS
  };
  return {
    name: 'Go',
    aliases: [ 'golang' ],
    keywords: KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'string',
        variants: [
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          {
            begin: '`',
            end: '`'
          }
        ]
      },
      {
        className: 'number',
        variants: [
          {
            match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/, // hex without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/, // hex with a present digit before . (making a digit afterwards optional)
            relevance: 0
          },
          {
            match: /-?\b0[oO](_?[0-7])*i?/, // leading 0o octal
            relevance: 0
          },
          {
            match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/, // decimal without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/, // decimal with a present digit before . (making a digit afterwards optional)
            relevance: 0
          }
        ]
      },
      { begin: /:=/ // relevance booster
      },
      {
        className: 'function',
        beginKeywords: 'func',
        end: '\\s*(\\{|$)',
        excludeEnd: true,
        contains: [
          hljs.TITLE_MODE,
          {
            className: 'params',
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}

/*
Language: Gradle
Description: Gradle is an open-source build automation tool focused on flexibility and performance.
Website: https://gradle.org
Author: Damian Mee <mee.damian@gmail.com>
Category: build-system
*/

function gradle(hljs) {
  const KEYWORDS = [
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
    name: 'Gradle',
    case_insensitive: true,
    keywords: KEYWORDS,
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

/*
 Language: GraphQL
 Author: John Foster (GH jf990), and others
 Description: GraphQL is a query language for APIs
 Category: web, common
*/

/** @type LanguageFn */
function graphql(hljs) {
  const regex = hljs.regex;
  const GQL_NAME = /[_A-Za-z][_0-9A-Za-z]*/;
  return {
    name: "GraphQL",
    aliases: [ "gql" ],
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

/*
Language: JSON
Description: JSON (JavaScript Object Notation) is a lightweight data-interchange format.
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Website: http://www.json.org
Category: common, protocols, web
*/

function json(hljs) {
  const ATTRIBUTE = {
    className: 'attr',
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  };
  const PUNCTUATION = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  };
  const LITERALS = [
    "true",
    "false",
    "null"
  ];
  // NOTE: normally we would rely on `keywords` for this but using a mode here allows us
  // - to use the very tight `illegal: \S` rule later to flag any other character
  // - as illegal indicating that despite looking like JSON we do not truly have
  // - JSON and thus improve false-positively greatly since JSON will try and claim
  // - all sorts of JSON looking stuff
  const LITERALS_MODE = {
    scope: "literal",
    beginKeywords: LITERALS.join(" "),
  };

  return {
    name: 'JSON',
    aliases: ['jsonc'],
    keywords:{
      literal: LITERALS,
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
    illegal: '\\S'
  };
}

// https://docs.oracle.com/javase/specs/jls/se15/html/jls-3.html#jls-3.10
var decimalDigits = '[0-9](_*[0-9])*';
var frac = `\\.(${decimalDigits})`;
var hexDigits = '[0-9a-fA-F](_*[0-9a-fA-F])*';
var NUMERIC = {
  className: 'number',
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))` +
      `[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits})[fFdD]\\b` },

    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))` +
      `[pP][+-]?(${decimalDigits})[fFdD]?\\b` },

    // DecimalIntegerLiteral
    { begin: '\\b(0|[1-9](_*[0-9])*)[lL]?\\b' },

    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },

    // OctalIntegerLiteral
    { begin: '\\b0(_*[0-7])*[lL]?\\b' },

    // BinaryIntegerLiteral
    { begin: '\\b0[bB][01](_*[01])*[lL]?\\b' },
  ],
  relevance: 0
};

/*
 Language: Kotlin
 Description: Kotlin is an OSS statically typed programming language that targets the JVM, Android, JavaScript and Native.
 Author: Sergey Mashkov <cy6erGn0m@gmail.com>
 Website: https://kotlinlang.org
 Category: common
 */


function kotlin(hljs) {
  const KEYWORDS = {
    keyword:
      'abstract as val var vararg get set class object open private protected public noinline '
      + 'crossinline dynamic final enum if else do while for when throw try catch finally '
      + 'import package is in fun override companion reified inline lateinit init '
      + 'interface annotation data sealed internal infix operator out by constructor super '
      + 'tailrec where const inner suspend typealias external expect actual',
    built_in:
      'Byte Short Char Int Long Boolean Float Double Void Unit Nothing',
    literal:
      'true false null'
  };
  const KEYWORDS_WITH_LABEL = {
    className: 'keyword',
    begin: /\b(break|continue|return|this)\b/,
    starts: { contains: [
      {
        className: 'symbol',
        begin: /@\w+/
      }
    ] }
  };
  const LABEL = {
    className: 'symbol',
    begin: hljs.UNDERSCORE_IDENT_RE + '@'
  };

  // for string templates
  const SUBST = {
    className: 'subst',
    begin: /\$\{/,
    end: /\}/,
    contains: [ hljs.C_NUMBER_MODE ]
  };
  const VARIABLE = {
    className: 'variable',
    begin: '\\$' + hljs.UNDERSCORE_IDENT_RE
  };
  const STRING = {
    className: 'string',
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
        begin: '\'',
        end: '\'',
        illegal: /\n/,
        contains: [ hljs.BACKSLASH_ESCAPE ]
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
    className: 'meta',
    begin: '@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*' + hljs.UNDERSCORE_IDENT_RE + ')?'
  };
  const ANNOTATION = {
    className: 'meta',
    begin: '@' + hljs.UNDERSCORE_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          hljs.inherit(STRING, { className: 'string' }),
          "self"
        ]
      }
    ]
  };

  // https://kotlinlang.org/docs/reference/whatsnew11.html#underscores-in-numeric-literals
  // According to the doc above, the number mode of kotlin is the same as java 8,
  // so the code below is copied from java.js
  const KOTLIN_NUMBER_MODE = NUMERIC;
  const KOTLIN_NESTED_COMMENT = hljs.COMMENT(
    '/\\*', '\\*/',
    { contains: [ hljs.C_BLOCK_COMMENT_MODE ] }
  );
  const KOTLIN_PAREN_TYPE = { variants: [
    {
      className: 'type',
      begin: hljs.UNDERSCORE_IDENT_RE
    },
    {
      begin: /\(/,
      end: /\)/,
      contains: [] // defined later
    }
  ] };
  const KOTLIN_PAREN_TYPE2 = KOTLIN_PAREN_TYPE;
  KOTLIN_PAREN_TYPE2.variants[1].contains = [ KOTLIN_PAREN_TYPE ];
  KOTLIN_PAREN_TYPE.variants[1].contains = [ KOTLIN_PAREN_TYPE2 ];

  return {
    name: 'Kotlin',
    aliases: [
      'kt',
      'kts'
    ],
    keywords: KEYWORDS,
    contains: [
      hljs.COMMENT(
        '/\\*\\*',
        '\\*/',
        {
          relevance: 0,
          contains: [
            {
              className: 'doctag',
              begin: '@[A-Za-z]+'
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
        className: 'function',
        beginKeywords: 'fun',
        end: '[(]|$',
        returnBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS,
        relevance: 5,
        contains: [
          {
            begin: hljs.UNDERSCORE_IDENT_RE + '\\s*\\(',
            returnBegin: true,
            relevance: 0,
            contains: [ hljs.UNDERSCORE_TITLE_MODE ]
          },
          {
            className: 'type',
            begin: /</,
            end: />/,
            keywords: 'reified',
            relevance: 0
          },
          {
            className: 'params',
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS,
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
        keywords: 'class interface trait',
        end: /[:\{(]|$/,
        excludeEnd: true,
        illegal: 'extends implements',
        contains: [
          { beginKeywords: 'public protected internal private constructor' },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: 'type',
            begin: /</,
            end: />/,
            excludeBegin: true,
            excludeEnd: true,
            relevance: 0
          },
          {
            className: 'type',
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
        className: 'meta',
        begin: "^#!/usr/bin/env",
        end: '$',
        illegal: '\n'
      },
      KOTLIN_NUMBER_MODE
    ]
  };
}

/*
Language: LaTeX
Author: Benedikt Wilde <bwilde@posteo.de>
Website: https://www.latex-project.org
Category: markup
*/

/** @type LanguageFn */
function latex(hljs) {
  const regex = hljs.regex;
  const KNOWN_CONTROL_WORDS = regex.either(...[
    '(?:NeedsTeXFormat|RequirePackage|GetIdInfo)',
    'Provides(?:Expl)?(?:Package|Class|File)',
    '(?:DeclareOption|ProcessOptions)',
    '(?:documentclass|usepackage|input|include)',
    'makeat(?:letter|other)',
    'ExplSyntax(?:On|Off)',
    '(?:new|renew|provide)?command',
    '(?:re)newenvironment',
    '(?:New|Renew|Provide|Declare)(?:Expandable)?DocumentCommand',
    '(?:New|Renew|Provide|Declare)DocumentEnvironment',
    '(?:(?:e|g|x)?def|let)',
    '(?:begin|end)',
    '(?:part|chapter|(?:sub){0,2}section|(?:sub)?paragraph)',
    'caption',
    '(?:label|(?:eq|page|name)?ref|(?:paren|foot|super)?cite)',
    '(?:alpha|beta|[Gg]amma|[Dd]elta|(?:var)?epsilon|zeta|eta|[Tt]heta|vartheta)',
    '(?:iota|(?:var)?kappa|[Ll]ambda|mu|nu|[Xx]i|[Pp]i|varpi|(?:var)rho)',
    '(?:[Ss]igma|varsigma|tau|[Uu]psilon|[Pp]hi|varphi|chi|[Pp]si|[Oo]mega)',
    '(?:frac|sum|prod|lim|infty|times|sqrt|leq|geq|left|right|middle|[bB]igg?)',
    '(?:[lr]angle|q?quad|[lcvdi]?dots|d?dot|hat|tilde|bar)'
  ].map(word => word + '(?![a-zA-Z@:_])'));
  const L3_REGEX = new RegExp([
    // A function \module_function_name:signature or \__module_function_name:signature,
    // where both module and function_name need at least two characters and
    // function_name may contain single underscores.
    '(?:__)?[a-zA-Z]{2,}_[a-zA-Z](?:_?[a-zA-Z])+:[a-zA-Z]*',
    // A variable \scope_module_and_name_type or \scope__module_ane_name_type,
    // where scope is one of l, g or c, type needs at least two characters
    // and module_and_name may contain single underscores.
    '[lgc]__?[a-zA-Z](?:_?[a-zA-Z])*_[a-zA-Z]{2,}',
    // A quark \q_the_name or \q__the_name or
    // scan mark \s_the_name or \s__vthe_name,
    // where variable_name needs at least two characters and
    // may contain single underscores.
    '[qs]__?[a-zA-Z](?:_?[a-zA-Z])+',
    // Other LaTeX3 macro names that are not covered by the three rules above.
    'use(?:_i)?:[a-zA-Z]*',
    '(?:else|fi|or):',
    '(?:if|cs|exp):w',
    '(?:hbox|vbox):n',
    '::[a-zA-Z]_unbraced',
    '::[a-zA-Z:]'
  ].map(pattern => pattern + '(?![a-zA-Z:_])').join('|'));
  const L2_VARIANTS = [
    { begin: /[a-zA-Z@]+/ }, // control word
    { begin: /[^a-zA-Z@]?/ } // control symbol
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
    className: 'keyword',
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
    className: 'params',
    relevance: 0,
    begin: /#+\d?/
  };
  const DOUBLE_CARET_CHAR = {
    // relevance: 1
    variants: DOUBLE_CARET_VARIANTS };
  const SPECIAL_CATCODE = {
    className: 'built_in',
    relevance: 0,
    begin: /[$&^_]/
  };
  const MAGIC_COMMENT = {
    className: 'meta',
    begin: /% ?!(T[eE]X|tex|BIB|bib)/,
    end: '$',
    relevance: 10
  };
  const COMMENT = hljs.COMMENT(
    '%',
    '$',
    { relevance: 0 }
  );
  const EVERYTHING_BUT_VERBATIM = [
    CONTROL_SEQUENCE,
    MACRO_PARAM,
    DOUBLE_CARET_CHAR,
    SPECIAL_CATCODE,
    MAGIC_COMMENT,
    COMMENT
  ];
  const BRACE_GROUP_NO_VERBATIM = {
    begin: /\{/,
    end: /\}/,
    relevance: 0,
    contains: [
      'self',
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
  const ARGUMENT_M = [ ARGUMENT_BRACES ];
  const ARGUMENT_O = [ ARGUMENT_BRACKETS ];
  const ARGUMENT_AND_THEN = function(arg, starts_mode) {
    return {
      contains: [ SPACE_GOBBLER ],
      starts: {
        relevance: 0,
        contains: arg,
        starts: starts_mode
      }
    };
  };
  const CSNAME = function(csname, starts_mode) {
    return {
      begin: '\\\\' + csname + '(?![a-zA-Z@:_])',
      keywords: {
        $pattern: /\\[a-zA-Z]+/,
        keyword: '\\' + csname
      },
      relevance: 0,
      contains: [ SPACE_GOBBLER ],
      starts: starts_mode
    };
  };
  const BEGIN_ENV = function(envname, starts_mode) {
    return hljs.inherit(
      {
        begin: '\\\\begin(?=[ \t]*(\\r?\\n[ \t]*)?\\{' + envname + '\\})',
        keywords: {
          $pattern: /\\[a-zA-Z]+/,
          keyword: '\\begin'
        },
        relevance: 0,
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
      className: 'string',
      end: '(?=\\\\end\\{' + envname + '\\})'
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
                contains: [ "self" ]
              }
            ],
          }
        ]
      }
    };
  };
  const VERBATIM = [
    ...[
      'verb',
      'lstinline'
    ].map(csname => CSNAME(csname, { contains: [ VERBATIM_DELIMITED_EQUAL() ] })),
    CSNAME('mint', ARGUMENT_AND_THEN(ARGUMENT_M, { contains: [ VERBATIM_DELIMITED_EQUAL() ] })),
    CSNAME('mintinline', ARGUMENT_AND_THEN(ARGUMENT_M, { contains: [
      VERBATIM_DELIMITED_BRACES(),
      VERBATIM_DELIMITED_EQUAL()
    ] })),
    CSNAME('url', { contains: [
      VERBATIM_DELIMITED_BRACES("link"),
      VERBATIM_DELIMITED_BRACES("link")
    ] }),
    CSNAME('hyperref', { contains: [ VERBATIM_DELIMITED_BRACES("link") ] }),
    CSNAME('href', ARGUMENT_AND_THEN(ARGUMENT_O, { contains: [ VERBATIM_DELIMITED_BRACES("link") ] })),
    ...[].concat(...[
      '',
      '\\*'
    ].map(suffix => [
      BEGIN_ENV('verbatim' + suffix, VERBATIM_DELIMITED_ENV('verbatim' + suffix)),
      BEGIN_ENV('filecontents' + suffix, ARGUMENT_AND_THEN(ARGUMENT_M, VERBATIM_DELIMITED_ENV('filecontents' + suffix))),
      ...[
        '',
        'B',
        'L'
      ].map(prefix =>
        BEGIN_ENV(prefix + 'Verbatim' + suffix, ARGUMENT_AND_THEN(ARGUMENT_O, VERBATIM_DELIMITED_ENV(prefix + 'Verbatim' + suffix)))
      )
    ])),
    BEGIN_ENV('minted', ARGUMENT_AND_THEN(ARGUMENT_O, ARGUMENT_AND_THEN(ARGUMENT_M, VERBATIM_DELIMITED_ENV('minted')))),
  ];

  return {
    name: 'LaTeX',
    aliases: [ 'tex' ],
    contains: [
      ...VERBATIM,
      ...EVERYTHING_BUT_VERBATIM
    ]
  };
}

const MODES$1 = (hljs) => {
  return {
    IMPORTANT: {
      scope: 'meta',
      begin: '!important'
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: 'number',
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: 'selector-attr',
      begin: /\[/,
      end: /\]/,
      illegal: '$',
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: 'number',
      begin: hljs.NUMBER_RE + '(' +
        '%|em|ex|ch|rem' +
        '|vw|vh|vmin|vmax' +
        '|cm|mm|in|pt|pc|px' +
        '|deg|grad|rad|turn' +
        '|s|ms' +
        '|Hz|kHz' +
        '|dpi|dpcm|dppx' +
        ')?',
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};

const HTML_TAGS$1 = [
  'a',
  'abbr',
  'address',
  'article',
  'aside',
  'audio',
  'b',
  'blockquote',
  'body',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'dd',
  'del',
  'details',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'mark',
  'menu',
  'nav',
  'object',
  'ol',
  'optgroup',
  'option',
  'p',
  'picture',
  'q',
  'quote',
  'samp',
  'section',
  'select',
  'source',
  'span',
  'strong',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'ul',
  'var',
  'video'
];

const SVG_TAGS$1 = [
  'defs',
  'g',
  'marker',
  'mask',
  'pattern',
  'svg',
  'switch',
  'symbol',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feFlood',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMorphology',
  'feOffset',
  'feSpecularLighting',
  'feTile',
  'feTurbulence',
  'linearGradient',
  'radialGradient',
  'stop',
  'circle',
  'ellipse',
  'image',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
  'use',
  'textPath',
  'tspan',
  'foreignObject',
  'clipPath'
];

const TAGS$1 = [
  ...HTML_TAGS$1,
  ...SVG_TAGS$1,
];

// Sorting, then reversing makes sure longer attributes/elements like
// `font-weight` are matched fully instead of getting false positives on say `font`

const MEDIA_FEATURES$1 = [
  'any-hover',
  'any-pointer',
  'aspect-ratio',
  'color',
  'color-gamut',
  'color-index',
  'device-aspect-ratio',
  'device-height',
  'device-width',
  'display-mode',
  'forced-colors',
  'grid',
  'height',
  'hover',
  'inverted-colors',
  'monochrome',
  'orientation',
  'overflow-block',
  'overflow-inline',
  'pointer',
  'prefers-color-scheme',
  'prefers-contrast',
  'prefers-reduced-motion',
  'prefers-reduced-transparency',
  'resolution',
  'scan',
  'scripting',
  'update',
  'width',
  // TODO: find a better solution?
  'min-width',
  'max-width',
  'min-height',
  'max-height'
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
const PSEUDO_CLASSES$1 = [
  'active',
  'any-link',
  'blank',
  'checked',
  'current',
  'default',
  'defined',
  'dir', // dir()
  'disabled',
  'drop',
  'empty',
  'enabled',
  'first',
  'first-child',
  'first-of-type',
  'fullscreen',
  'future',
  'focus',
  'focus-visible',
  'focus-within',
  'has', // has()
  'host', // host or host()
  'host-context', // host-context()
  'hover',
  'indeterminate',
  'in-range',
  'invalid',
  'is', // is()
  'lang', // lang()
  'last-child',
  'last-of-type',
  'left',
  'link',
  'local-link',
  'not', // not()
  'nth-child', // nth-child()
  'nth-col', // nth-col()
  'nth-last-child', // nth-last-child()
  'nth-last-col', // nth-last-col()
  'nth-last-of-type', //nth-last-of-type()
  'nth-of-type', //nth-of-type()
  'only-child',
  'only-of-type',
  'optional',
  'out-of-range',
  'past',
  'placeholder-shown',
  'read-only',
  'read-write',
  'required',
  'right',
  'root',
  'scope',
  'target',
  'target-within',
  'user-invalid',
  'valid',
  'visited',
  'where' // where()
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
const PSEUDO_ELEMENTS$1 = [
  'after',
  'backdrop',
  'before',
  'cue',
  'cue-region',
  'first-letter',
  'first-line',
  'grammar-error',
  'marker',
  'part',
  'placeholder',
  'selection',
  'slotted',
  'spelling-error'
].sort().reverse();

const ATTRIBUTES$1 = [
  'accent-color',
  'align-content',
  'align-items',
  'align-self',
  'alignment-baseline',
  'all',
  'anchor-name',
  'animation',
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-range',
  'animation-range-end',
  'animation-range-start',
  'animation-timeline',
  'animation-timing-function',
  'appearance',
  'aspect-ratio',
  'backdrop-filter',
  'backface-visibility',
  'background',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-position-x',
  'background-position-y',
  'background-repeat',
  'background-size',
  'baseline-shift',
  'block-size',
  'border',
  'border-block',
  'border-block-color',
  'border-block-end',
  'border-block-end-color',
  'border-block-end-style',
  'border-block-end-width',
  'border-block-start',
  'border-block-start-color',
  'border-block-start-style',
  'border-block-start-width',
  'border-block-style',
  'border-block-width',
  'border-bottom',
  'border-bottom-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-style',
  'border-bottom-width',
  'border-collapse',
  'border-color',
  'border-end-end-radius',
  'border-end-start-radius',
  'border-image',
  'border-image-outset',
  'border-image-repeat',
  'border-image-slice',
  'border-image-source',
  'border-image-width',
  'border-inline',
  'border-inline-color',
  'border-inline-end',
  'border-inline-end-color',
  'border-inline-end-style',
  'border-inline-end-width',
  'border-inline-start',
  'border-inline-start-color',
  'border-inline-start-style',
  'border-inline-start-width',
  'border-inline-style',
  'border-inline-width',
  'border-left',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-radius',
  'border-right',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-spacing',
  'border-start-end-radius',
  'border-start-start-radius',
  'border-style',
  'border-top',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'border-width',
  'bottom',
  'box-align',
  'box-decoration-break',
  'box-direction',
  'box-flex',
  'box-flex-group',
  'box-lines',
  'box-ordinal-group',
  'box-orient',
  'box-pack',
  'box-shadow',
  'box-sizing',
  'break-after',
  'break-before',
  'break-inside',
  'caption-side',
  'caret-color',
  'clear',
  'clip',
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-profile',
  'color-rendering',
  'color-scheme',
  'column-count',
  'column-fill',
  'column-gap',
  'column-rule',
  'column-rule-color',
  'column-rule-style',
  'column-rule-width',
  'column-span',
  'column-width',
  'columns',
  'contain',
  'contain-intrinsic-block-size',
  'contain-intrinsic-height',
  'contain-intrinsic-inline-size',
  'contain-intrinsic-size',
  'contain-intrinsic-width',
  'container',
  'container-name',
  'container-type',
  'content',
  'content-visibility',
  'counter-increment',
  'counter-reset',
  'counter-set',
  'cue',
  'cue-after',
  'cue-before',
  'cursor',
  'cx',
  'cy',
  'direction',
  'display',
  'dominant-baseline',
  'empty-cells',
  'enable-background',
  'field-sizing',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'float',
  'flood-color',
  'flood-opacity',
  'flow',
  'font',
  'font-display',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-optical-sizing',
  'font-palette',
  'font-size',
  'font-size-adjust',
  'font-smooth',
  'font-smoothing',
  'font-stretch',
  'font-style',
  'font-synthesis',
  'font-synthesis-position',
  'font-synthesis-small-caps',
  'font-synthesis-style',
  'font-synthesis-weight',
  'font-variant',
  'font-variant-alternates',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-emoji',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-variation-settings',
  'font-weight',
  'forced-color-adjust',
  'gap',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-gap',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'hanging-punctuation',
  'height',
  'hyphenate-character',
  'hyphenate-limit-chars',
  'hyphens',
  'icon',
  'image-orientation',
  'image-rendering',
  'image-resolution',
  'ime-mode',
  'initial-letter',
  'initial-letter-align',
  'inline-size',
  'inset',
  'inset-area',
  'inset-block',
  'inset-block-end',
  'inset-block-start',
  'inset-inline',
  'inset-inline-end',
  'inset-inline-start',
  'isolation',
  'justify-content',
  'justify-items',
  'justify-self',
  'kerning',
  'left',
  'letter-spacing',
  'lighting-color',
  'line-break',
  'line-height',
  'line-height-step',
  'list-style',
  'list-style-image',
  'list-style-position',
  'list-style-type',
  'margin',
  'margin-block',
  'margin-block-end',
  'margin-block-start',
  'margin-bottom',
  'margin-inline',
  'margin-inline-end',
  'margin-inline-start',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-trim',
  'marker',
  'marker-end',
  'marker-mid',
  'marker-start',
  'marks',
  'mask',
  'mask-border',
  'mask-border-mode',
  'mask-border-outset',
  'mask-border-repeat',
  'mask-border-slice',
  'mask-border-source',
  'mask-border-width',
  'mask-clip',
  'mask-composite',
  'mask-image',
  'mask-mode',
  'mask-origin',
  'mask-position',
  'mask-repeat',
  'mask-size',
  'mask-type',
  'masonry-auto-flow',
  'math-depth',
  'math-shift',
  'math-style',
  'max-block-size',
  'max-height',
  'max-inline-size',
  'max-width',
  'min-block-size',
  'min-height',
  'min-inline-size',
  'min-width',
  'mix-blend-mode',
  'nav-down',
  'nav-index',
  'nav-left',
  'nav-right',
  'nav-up',
  'none',
  'normal',
  'object-fit',
  'object-position',
  'offset',
  'offset-anchor',
  'offset-distance',
  'offset-path',
  'offset-position',
  'offset-rotate',
  'opacity',
  'order',
  'orphans',
  'outline',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  'overflow',
  'overflow-anchor',
  'overflow-block',
  'overflow-clip-margin',
  'overflow-inline',
  'overflow-wrap',
  'overflow-x',
  'overflow-y',
  'overlay',
  'overscroll-behavior',
  'overscroll-behavior-block',
  'overscroll-behavior-inline',
  'overscroll-behavior-x',
  'overscroll-behavior-y',
  'padding',
  'padding-block',
  'padding-block-end',
  'padding-block-start',
  'padding-bottom',
  'padding-inline',
  'padding-inline-end',
  'padding-inline-start',
  'padding-left',
  'padding-right',
  'padding-top',
  'page',
  'page-break-after',
  'page-break-before',
  'page-break-inside',
  'paint-order',
  'pause',
  'pause-after',
  'pause-before',
  'perspective',
  'perspective-origin',
  'place-content',
  'place-items',
  'place-self',
  'pointer-events',
  'position',
  'position-anchor',
  'position-visibility',
  'print-color-adjust',
  'quotes',
  'r',
  'resize',
  'rest',
  'rest-after',
  'rest-before',
  'right',
  'rotate',
  'row-gap',
  'ruby-align',
  'ruby-position',
  'scale',
  'scroll-behavior',
  'scroll-margin',
  'scroll-margin-block',
  'scroll-margin-block-end',
  'scroll-margin-block-start',
  'scroll-margin-bottom',
  'scroll-margin-inline',
  'scroll-margin-inline-end',
  'scroll-margin-inline-start',
  'scroll-margin-left',
  'scroll-margin-right',
  'scroll-margin-top',
  'scroll-padding',
  'scroll-padding-block',
  'scroll-padding-block-end',
  'scroll-padding-block-start',
  'scroll-padding-bottom',
  'scroll-padding-inline',
  'scroll-padding-inline-end',
  'scroll-padding-inline-start',
  'scroll-padding-left',
  'scroll-padding-right',
  'scroll-padding-top',
  'scroll-snap-align',
  'scroll-snap-stop',
  'scroll-snap-type',
  'scroll-timeline',
  'scroll-timeline-axis',
  'scroll-timeline-name',
  'scrollbar-color',
  'scrollbar-gutter',
  'scrollbar-width',
  'shape-image-threshold',
  'shape-margin',
  'shape-outside',
  'shape-rendering',
  'speak',
  'speak-as',
  'src', // @font-face
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'tab-size',
  'table-layout',
  'text-align',
  'text-align-all',
  'text-align-last',
  'text-anchor',
  'text-combine-upright',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-skip',
  'text-decoration-skip-ink',
  'text-decoration-style',
  'text-decoration-thickness',
  'text-emphasis',
  'text-emphasis-color',
  'text-emphasis-position',
  'text-emphasis-style',
  'text-indent',
  'text-justify',
  'text-orientation',
  'text-overflow',
  'text-rendering',
  'text-shadow',
  'text-size-adjust',
  'text-transform',
  'text-underline-offset',
  'text-underline-position',
  'text-wrap',
  'text-wrap-mode',
  'text-wrap-style',
  'timeline-scope',
  'top',
  'touch-action',
  'transform',
  'transform-box',
  'transform-origin',
  'transform-style',
  'transition',
  'transition-behavior',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'translate',
  'unicode-bidi',
  'user-modify',
  'user-select',
  'vector-effect',
  'vertical-align',
  'view-timeline',
  'view-timeline-axis',
  'view-timeline-inset',
  'view-timeline-name',
  'view-transition-name',
  'visibility',
  'voice-balance',
  'voice-duration',
  'voice-family',
  'voice-pitch',
  'voice-range',
  'voice-rate',
  'voice-stress',
  'voice-volume',
  'white-space',
  'white-space-collapse',
  'widows',
  'width',
  'will-change',
  'word-break',
  'word-spacing',
  'word-wrap',
  'writing-mode',
  'x',
  'y',
  'z-index',
  'zoom'
].sort().reverse();

// some grammars use them all as a single group
const PSEUDO_SELECTORS = PSEUDO_CLASSES$1.concat(PSEUDO_ELEMENTS$1).sort().reverse();

/*
Language: Less
Description: It's CSS, with just a little more.
Author:   Max Mikhailov <seven.phases.max@gmail.com>
Website: http://lesscss.org
Category: common, css, web
*/


/** @type LanguageFn */
function less(hljs) {
  const modes = MODES$1(hljs);
  const PSEUDO_SELECTORS$1 = PSEUDO_SELECTORS;

  const AT_MODIFIERS = "and or not only";
  const IDENT_RE = '[\\w-]+'; // yes, Less identifiers may begin with a digit
  const INTERP_IDENT_RE = '(' + IDENT_RE + '|@\\{' + IDENT_RE + '\\})';

  /* Generic Modes */

  const RULES = []; const VALUE_MODES = []; // forward def. for recursive modes

  const STRING_MODE = function(c) {
    return {
    // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
      className: 'string',
      begin: '~?' + c + '.*?' + c
    };
  };

  const IDENT_MODE = function(name, begin, relevance) {
    return {
      className: name,
      begin: begin,
      relevance: relevance
    };
  };

  const AT_KEYWORDS = {
    $pattern: /[a-z-]+/,
    keyword: AT_MODIFIERS,
    attribute: MEDIA_FEATURES$1.join(" ")
  };

  const PARENS_MODE = {
    // used only to properly balance nested parens inside mixin call, def. arg list
    begin: '\\(',
    end: '\\)',
    contains: VALUE_MODES,
    keywords: AT_KEYWORDS,
    relevance: 0
  };

  // generic Less highlighter (used almost everywhere except selectors):
  VALUE_MODES.push(
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING_MODE("'"),
    STRING_MODE('"'),
    modes.CSS_NUMBER_MODE, // fixme: it does not include dot for numbers like .5em :(
    {
      begin: '(url|data-uri)\\(',
      starts: {
        className: 'string',
        end: '[\\)\\n]',
        excludeEnd: true
      }
    },
    modes.HEXCOLOR,
    PARENS_MODE,
    IDENT_MODE('variable', '@@?' + IDENT_RE, 10),
    IDENT_MODE('variable', '@\\{' + IDENT_RE + '\\}'),
    IDENT_MODE('built_in', '~?`[^`]*?`'), // inline javascript (or whatever host language) *multiline* string
    { // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
      className: 'attribute',
      begin: IDENT_RE + '\\s*:',
      end: ':',
      returnBegin: true,
      excludeEnd: true
    },
    modes.IMPORTANT,
    { beginKeywords: 'and not' },
    modes.FUNCTION_DISPATCH
  );

  const VALUE_WITH_RULESETS = VALUE_MODES.concat({
    begin: /\{/,
    end: /\}/,
    contains: RULES
  });

  const MIXIN_GUARD_MODE = {
    beginKeywords: 'when',
    endsWithParent: true,
    contains: [ { beginKeywords: 'and not' } ].concat(VALUE_MODES) // using this form to override VALUE’s 'function' match
  };

  /* Rule-Level Modes */

  const RULE_MODE = {
    begin: INTERP_IDENT_RE + '\\s*:',
    returnBegin: true,
    end: /[;}]/,
    relevance: 0,
    contains: [
      { begin: /-(webkit|moz|ms|o)-/ },
      modes.CSS_VARIABLE,
      {
        className: 'attribute',
        begin: '\\b(' + ATTRIBUTES$1.join('|') + ')\\b',
        end: /(?=:)/,
        starts: {
          endsWithParent: true,
          illegal: '[<=$]',
          relevance: 0,
          contains: VALUE_MODES
        }
      }
    ]
  };

  const AT_RULE_MODE = {
    className: 'keyword',
    begin: '@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b',
    starts: {
      end: '[;{}]',
      keywords: AT_KEYWORDS,
      returnEnd: true,
      contains: VALUE_MODES,
      relevance: 0
    }
  };

  // variable definitions and calls
  const VAR_RULE_MODE = {
    className: 'variable',
    variants: [
      // using more strict pattern for higher relevance to increase chances of Less detection.
      // this is *the only* Less specific statement used in most of the sources, so...
      // (we’ll still often loose to the css-parser unless there's '//' comment,
      // simply because 1 variable just can't beat 99 properties :)
      {
        begin: '@' + IDENT_RE + '\\s*:',
        relevance: 15
      },
      { begin: '@' + IDENT_RE }
    ],
    starts: {
      end: '[;}]',
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
        begin: '[\\.#:&\\[>]',
        end: '[;{}]' // mixin calls end with ';'
      },
      {
        begin: INTERP_IDENT_RE,
        end: /\{/
      }
    ],
    returnBegin: true,
    returnEnd: true,
    illegal: '[<=\'$"]',
    relevance: 0,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      MIXIN_GUARD_MODE,
      IDENT_MODE('keyword', 'all\\b'),
      IDENT_MODE('variable', '@\\{' + IDENT_RE + '\\}'), // otherwise it’s identified as tag
      
      {
        begin: '\\b(' + TAGS$1.join('|') + ')\\b',
        className: 'selector-tag'
      },
      modes.CSS_NUMBER_MODE,
      IDENT_MODE('selector-tag', INTERP_IDENT_RE, 0),
      IDENT_MODE('selector-id', '#' + INTERP_IDENT_RE),
      IDENT_MODE('selector-class', '\\.' + INTERP_IDENT_RE, 0),
      IDENT_MODE('selector-tag', '&', 0),
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: 'selector-pseudo',
        begin: ':(' + PSEUDO_CLASSES$1.join('|') + ')'
      },
      {
        className: 'selector-pseudo',
        begin: ':(:)?(' + PSEUDO_ELEMENTS$1.join('|') + ')'
      },
      {
        begin: /\(/,
        end: /\)/,
        relevance: 0,
        contains: VALUE_WITH_RULESETS
      }, // argument list of parametric mixins
      { begin: '!important' }, // eat !important after mixin call or it will be colored as tag
      modes.FUNCTION_DISPATCH
    ]
  };

  const PSEUDO_SELECTOR_MODE = {
    begin: IDENT_RE + ':(:)?' + `(${PSEUDO_SELECTORS$1.join('|')})`,
    returnBegin: true,
    contains: [ SELECTOR_MODE ]
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
    name: 'Less',
    case_insensitive: true,
    illegal: '[=>\'/<($"]',
    contains: RULES
  };
}

/*
Language: Markdown
Requires: xml.js
Author: John Crepezzi <john.crepezzi@gmail.com>
Website: https://daringfireball.net/projects/markdown/
Category: common, markup
*/

function markdown(hljs) {
  const regex = hljs.regex;
  const INLINE_HTML = {
    begin: /<\/?[A-Za-z_]/,
    end: '>',
    subLanguage: 'xml',
    relevance: 0
  };
  const HORIZONTAL_RULE = {
    begin: '^[-\\*]{3,}',
    end: '$'
  };
  const CODE = {
    className: 'code',
    variants: [
      // TODO: fix to allow these to work with sublanguage also
      { begin: '(`{3,})[^`](.|\\n)*?\\1`*[ ]*' },
      { begin: '(~{3,})[^~](.|\\n)*?\\1~*[ ]*' },
      // needed to allow markdown as a sublanguage to work
      {
        begin: '```',
        end: '```+[ ]*$'
      },
      {
        begin: '~~~',
        end: '~~~+[ ]*$'
      },
      { begin: '`.+?`' },
      {
        begin: '(?=^( {4}|\\t))',
        // use contains to gobble up multiple lines to allow the block to be whatever size
        // but only have a single open/close tag vs one per line
        contains: [
          {
            begin: '^( {4}|\\t)',
            end: '(\\n)$'
          }
        ],
        relevance: 0
      }
    ]
  };
  const LIST = {
    className: 'bullet',
    begin: '^[ \t]*([*+-]|(\\d+\\.))(?=\\s+)',
    end: '\\s+',
    excludeEnd: true
  };
  const LINK_REFERENCE = {
    begin: /^\[[^\n]+\]:/,
    returnBegin: true,
    contains: [
      {
        className: 'symbol',
        begin: /\[/,
        end: /\]/,
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: 'link',
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
        match: /\[(?=\])/ },
      {
        className: 'string',
        relevance: 0,
        begin: '\\[',
        end: '\\]',
        excludeBegin: true,
        returnEnd: true
      },
      {
        className: 'link',
        relevance: 0,
        begin: '\\]\\(',
        end: '\\)',
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: 'symbol',
        relevance: 0,
        begin: '\\]\\[',
        end: '\\]',
        excludeBegin: true,
        excludeEnd: true
      }
    ]
  };
  const BOLD = {
    className: 'strong',
    contains: [], // defined later
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
    className: 'emphasis',
    contains: [], // defined later
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

  // 3 level deep nesting is not allowed because it would create confusion
  // in cases like `***testing***` because where we don't know if the last
  // `***` is starting a new bold/italic or finishing the last one
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
  ].forEach(m => {
    m.contains = m.contains.concat(CONTAINABLE);
  });

  CONTAINABLE = CONTAINABLE.concat(BOLD, ITALIC);

  const HEADER = {
    className: 'section',
    variants: [
      {
        begin: '^#{1,6}',
        end: '$',
        contains: CONTAINABLE
      },
      {
        begin: '(?=^.+?\\n[=-]{2,}$)',
        contains: [
          { begin: '^[=-]*$' },
          {
            begin: '^',
            end: "\\n",
            contains: CONTAINABLE
          }
        ]
      }
    ]
  };

  const BLOCKQUOTE = {
    className: 'quote',
    begin: '^>\\s+',
    contains: CONTAINABLE,
    end: '$'
  };

  const ENTITY = {
    //https://spec.commonmark.org/0.31.2/#entity-references
    scope: 'literal',
    match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
  };

  return {
    name: 'Markdown',
    aliases: [
      'md',
      'mkdown',
      'mkd'
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

/*
Language: Matlab
Author: Denis Bardadym <bardadymchik@gmail.com>
Contributors: Eugene Nizhibitsky <nizhibitsky@ya.ru>, Egor Rogov <e.rogov@postgrespro.ru>
Website: https://www.mathworks.com/products/matlab.html
Category: scientific
*/

/*
  Formal syntax is not published, helpful link:
  https://github.com/kornilova-l/matlab-IntelliJ-plugin/blob/master/src/main/grammar/Matlab.bnf
*/
function matlab(hljs) {
  const TRANSPOSE_RE = '(\'|\\.\')+';
  const TRANSPOSE = {
    relevance: 0,
    contains: [ { begin: TRANSPOSE_RE } ]
  };

  return {
    name: 'Matlab',
    keywords: {
      keyword:
        'arguments break case catch classdef continue else elseif end enumeration events for function '
        + 'global if methods otherwise parfor persistent properties return spmd switch try while',
      built_in:
        'sin sind sinh asin asind asinh cos cosd cosh acos acosd acosh tan tand tanh atan '
        + 'atand atan2 atanh sec secd sech asec asecd asech csc cscd csch acsc acscd acsch cot '
        + 'cotd coth acot acotd acoth hypot exp expm1 log log1p log10 log2 pow2 realpow reallog '
        + 'realsqrt sqrt nthroot nextpow2 abs angle complex conj imag real unwrap isreal '
        + 'cplxpair fix floor ceil round mod rem sign airy besselj bessely besselh besseli '
        + 'besselk beta betainc betaln ellipj ellipke erf erfc erfcx erfinv expint gamma '
        + 'gammainc gammaln psi legendre cross dot factor isprime primes gcd lcm rat rats perms '
        + 'nchoosek factorial cart2sph cart2pol pol2cart sph2cart hsv2rgb rgb2hsv zeros ones '
        + 'eye repmat rand randn linspace logspace freqspace meshgrid accumarray size length '
        + 'ndims numel disp isempty isequal isequalwithequalnans cat reshape diag blkdiag tril '
        + 'triu fliplr flipud flipdim rot90 find sub2ind ind2sub bsxfun ndgrid permute ipermute '
        + 'shiftdim circshift squeeze isscalar isvector ans eps realmax realmin pi i|0 inf nan '
        + 'isnan isinf isfinite j|0 why compan gallery hadamard hankel hilb invhilb magic pascal '
        + 'rosser toeplitz vander wilkinson max min nanmax nanmin mean nanmean type table '
        + 'readtable writetable sortrows sort figure plot plot3 scatter scatter3 cellfun '
        + 'legend intersect ismember procrustes hold num2cell '
    },
    illegal: '(//|"|#|/\\*|\\s+/\\w+)',
    contains: [
      {
        className: 'function',
        beginKeywords: 'function',
        end: '$',
        contains: [
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: 'params',
            variants: [
              {
                begin: '\\(',
                end: '\\)'
              },
              {
                begin: '\\[',
                end: '\\]'
              }
            ]
          }
        ]
      },
      {
        className: 'built_in',
        begin: /true|false/,
        relevance: 0,
        starts: TRANSPOSE
      },
      {
        begin: '[a-zA-Z][a-zA-Z_0-9]*' + TRANSPOSE_RE,
        relevance: 0
      },
      {
        className: 'number',
        begin: hljs.C_NUMBER_RE,
        relevance: 0,
        starts: TRANSPOSE
      },
      {
        className: 'string',
        begin: '\'',
        end: '\'',
        contains: [ { begin: '\'\'' } ]
      },
      {
        begin: /\]|\}|\)/,
        relevance: 0,
        starts: TRANSPOSE
      },
      {
        className: 'string',
        begin: '"',
        end: '"',
        contains: [ { begin: '""' } ],
        starts: TRANSPOSE
      },
      hljs.COMMENT('^\\s*%\\{\\s*$', '^\\s*%\\}\\s*$'),
      hljs.COMMENT('%', '$')
    ]
  };
}

/*
Language: Nginx config
Author: Peter Leonov <gojpeg@yandex.ru>
Contributors: Ivan Sagalaev <maniac@softwaremaniacs.org>
Category: config, web
Website: https://www.nginx.com
*/

/** @type LanguageFn */
function nginx(hljs) {
  const regex = hljs.regex;
  const VAR = {
    className: 'variable',
    variants: [
      { begin: /\$\d+/ },
      { begin: /\$\{\w+\}/ },
      { begin: regex.concat(/[$@]/, hljs.UNDERSCORE_IDENT_RE) }
    ]
  };
  const LITERALS = [
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
      literal: LITERALS
    },
    relevance: 0,
    illegal: '=>',
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        className: 'string',
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
        begin: '([a-z]+):/',
        end: '\\s',
        endsWithParent: true,
        excludeEnd: true,
        contains: [ VAR ]
      },
      {
        className: 'regexp',
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
        className: 'number',
        begin: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b'
      },
      // units
      {
        className: 'number',
        begin: '\\b\\d+[kKmMgGdshdwy]?\\b',
        relevance: 0
      },
      VAR
    ]
  };

  return {
    name: 'Nginx config',
    aliases: [ 'nginxconf' ],
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        beginKeywords: "upstream location",
        end: /;|\{/,
        contains: DEFAULT.contains,
        keywords: { section: "upstream location" }
      },
      {
        className: 'section',
        begin: regex.concat(hljs.UNDERSCORE_IDENT_RE + regex.lookahead(/\s+\{/)),
        relevance: 0
      },
      {
        begin: regex.lookahead(hljs.UNDERSCORE_IDENT_RE + '\\s'),
        end: ';|\\{',
        contains: [
          {
            className: 'attribute',
            begin: hljs.UNDERSCORE_IDENT_RE,
            starts: DEFAULT
          }
        ],
        relevance: 0
      }
    ],
    illegal: '[^\\s\\}\\{]'
  };
}

/*
Language: Objective-C
Author: Valerii Hiora <valerii.hiora@gmail.com>
Contributors: Angel G. Olloqui <angelgarcia.mail@gmail.com>, Matt Diephouse <matt@diephouse.com>, Andrew Farmer <ahfarmer@gmail.com>, Minh Nguyễn <mxn@1ec5.org>
Website: https://developer.apple.com/documentation/objectivec
Category: common
*/

function objectivec(hljs) {
  const API_CLASS = {
    className: 'built_in',
    begin: '\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+'
  };
  const IDENTIFIER_RE = /[a-zA-Z@][a-zA-Z0-9_]*/;
  const TYPES = [
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
  const LITERALS = [
    "false",
    "true",
    "FALSE",
    "TRUE",
    "nil",
    "YES",
    "NO",
    "NULL"
  ];
  const BUILT_INS = [
    "dispatch_once_t",
    "dispatch_queue_t",
    "dispatch_sync",
    "dispatch_async",
    "dispatch_once"
  ];
  const KEYWORDS = {
    "variable.language": [
      "this",
      "super"
    ],
    $pattern: IDENTIFIER_RE,
    keyword: KWS,
    literal: LITERALS,
    built_in: BUILT_INS,
    type: TYPES
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
    name: 'Objective-C',
    aliases: [
      'mm',
      'objc',
      'obj-c',
      'obj-c++',
      'objective-c++'
    ],
    keywords: KEYWORDS,
    illegal: '</',
    contains: [
      API_CLASS,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      {
        className: 'string',
        variants: [
          {
            begin: '@"',
            end: '"',
            illegal: '\\n',
            contains: [ hljs.BACKSLASH_ESCAPE ]
          }
        ]
      },
      {
        className: 'meta',
        begin: /#\s*[a-z]+\b/,
        end: /$/,
        keywords: { keyword:
            'if else elif endif define undef warning error line '
            + 'pragma ifdef ifndef include' },
        contains: [
          {
            begin: /\\\n/,
            relevance: 0
          },
          hljs.inherit(hljs.QUOTE_STRING_MODE, { className: 'string' }),
          {
            className: 'string',
            begin: /<.*?>/,
            end: /$/,
            illegal: '\\n'
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        className: 'class',
        begin: '(' + CLASS_KEYWORDS.keyword.join('|') + ')\\b',
        end: /(\{|$)/,
        excludeEnd: true,
        keywords: CLASS_KEYWORDS,
        contains: [ hljs.UNDERSCORE_TITLE_MODE ]
      },
      {
        begin: '\\.' + hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}

/*
Language: PostgreSQL and PL/pgSQL
Author: Egor Rogov (e.rogov@postgrespro.ru)
Website: https://www.postgresql.org/docs/11/sql.html
Description:
    This language incorporates both PostgreSQL SQL dialect and PL/pgSQL language.
    It is based on PostgreSQL version 11. Some notes:
    - Text in double-dollar-strings is _always_ interpreted as some programming code. Text
      in ordinary quotes is _never_ interpreted that way and highlighted just as a string.
    - There are quite a bit "special cases". That's because many keywords are not strictly
      they are keywords in some contexts and ordinary identifiers in others. Only some
      of such cases are handled; you still can get some of your identifiers highlighted
      wrong way.
    - Function names deliberately are not highlighted. There is no way to tell function
      call from other constructs, hence we can't highlight _all_ function names. And
      some names highlighted while others not looks ugly.
Category: database
*/

function pgsql(hljs) {
  const COMMENT_MODE = hljs.COMMENT('--', '$');
  const UNQUOTED_IDENT = '[a-zA-Z_][a-zA-Z_0-9$]*';
  const DOLLAR_STRING = '\\$([a-zA-Z_]?|[a-zA-Z_][a-zA-Z_0-9]*)\\$';
  const LABEL = '<<\\s*' + UNQUOTED_IDENT + '\\s*>>';

  const SQL_KW =
    // https://www.postgresql.org/docs/11/static/sql-keywords-appendix.html
    // https://www.postgresql.org/docs/11/static/sql-commands.html
    // SQL commands (starting words)
    'ABORT ALTER ANALYZE BEGIN CALL CHECKPOINT|10 CLOSE CLUSTER COMMENT COMMIT COPY CREATE DEALLOCATE DECLARE '
    + 'DELETE DISCARD DO DROP END EXECUTE EXPLAIN FETCH GRANT IMPORT INSERT LISTEN LOAD LOCK MOVE NOTIFY '
    + 'PREPARE REASSIGN|10 REFRESH REINDEX RELEASE RESET REVOKE ROLLBACK SAVEPOINT SECURITY SELECT SET SHOW '
    + 'START TRUNCATE UNLISTEN|10 UPDATE VACUUM|10 VALUES '
    // SQL commands (others)
    + 'AGGREGATE COLLATION CONVERSION|10 DATABASE DEFAULT PRIVILEGES DOMAIN TRIGGER EXTENSION FOREIGN '
    + 'WRAPPER|10 TABLE FUNCTION GROUP LANGUAGE LARGE OBJECT MATERIALIZED VIEW OPERATOR CLASS '
    + 'FAMILY POLICY PUBLICATION|10 ROLE RULE SCHEMA SEQUENCE SERVER STATISTICS SUBSCRIPTION SYSTEM '
    + 'TABLESPACE CONFIGURATION DICTIONARY PARSER TEMPLATE TYPE USER MAPPING PREPARED ACCESS '
    + 'METHOD CAST AS TRANSFORM TRANSACTION OWNED TO INTO SESSION AUTHORIZATION '
    + 'INDEX PROCEDURE ASSERTION '
    // additional reserved key words
    + 'ALL ANALYSE AND ANY ARRAY ASC ASYMMETRIC|10 BOTH CASE CHECK '
    + 'COLLATE COLUMN CONCURRENTLY|10 CONSTRAINT CROSS '
    + 'DEFERRABLE RANGE '
    + 'DESC DISTINCT ELSE EXCEPT FOR FREEZE|10 FROM FULL HAVING '
    + 'ILIKE IN INITIALLY INNER INTERSECT IS ISNULL JOIN LATERAL LEADING LIKE LIMIT '
    + 'NATURAL NOT NOTNULL NULL OFFSET ON ONLY OR ORDER OUTER OVERLAPS PLACING PRIMARY '
    + 'REFERENCES RETURNING SIMILAR SOME SYMMETRIC TABLESAMPLE THEN '
    + 'TRAILING UNION UNIQUE USING VARIADIC|10 VERBOSE WHEN WHERE WINDOW WITH '
    // some of non-reserved (which are used in clauses or as PL/pgSQL keyword)
    + 'BY RETURNS INOUT OUT SETOF|10 IF STRICT CURRENT CONTINUE OWNER LOCATION OVER PARTITION WITHIN '
    + 'BETWEEN ESCAPE EXTERNAL INVOKER DEFINER WORK RENAME VERSION CONNECTION CONNECT '
    + 'TABLES TEMP TEMPORARY FUNCTIONS SEQUENCES TYPES SCHEMAS OPTION CASCADE RESTRICT ADD ADMIN '
    + 'EXISTS VALID VALIDATE ENABLE DISABLE REPLICA|10 ALWAYS PASSING COLUMNS PATH '
    + 'REF VALUE OVERRIDING IMMUTABLE STABLE VOLATILE BEFORE AFTER EACH ROW PROCEDURAL '
    + 'ROUTINE NO HANDLER VALIDATOR OPTIONS STORAGE OIDS|10 WITHOUT INHERIT DEPENDS CALLED '
    + 'INPUT LEAKPROOF|10 COST ROWS NOWAIT SEARCH UNTIL ENCRYPTED|10 PASSWORD CONFLICT|10 '
    + 'INSTEAD INHERITS CHARACTERISTICS WRITE CURSOR ALSO STATEMENT SHARE EXCLUSIVE INLINE '
    + 'ISOLATION REPEATABLE READ COMMITTED SERIALIZABLE UNCOMMITTED LOCAL GLOBAL SQL PROCEDURES '
    + 'RECURSIVE SNAPSHOT ROLLUP CUBE TRUSTED|10 INCLUDE FOLLOWING PRECEDING UNBOUNDED RANGE GROUPS '
    + 'UNENCRYPTED|10 SYSID FORMAT DELIMITER HEADER QUOTE ENCODING FILTER OFF '
    // some parameters of VACUUM/ANALYZE/EXPLAIN
    + 'FORCE_QUOTE FORCE_NOT_NULL FORCE_NULL COSTS BUFFERS TIMING SUMMARY DISABLE_PAGE_SKIPPING '
    //
    + 'RESTART CYCLE GENERATED IDENTITY DEFERRED IMMEDIATE LEVEL LOGGED UNLOGGED '
    + 'OF NOTHING NONE EXCLUDE ATTRIBUTE '
    // from GRANT (not keywords actually)
    + 'USAGE ROUTINES '
    // actually literals, but look better this way (due to IS TRUE, IS FALSE, ISNULL etc)
    + 'TRUE FALSE NAN INFINITY ';

  const ROLE_ATTRS = // only those not in keywrods already
    'SUPERUSER NOSUPERUSER CREATEDB NOCREATEDB CREATEROLE NOCREATEROLE INHERIT NOINHERIT '
    + 'LOGIN NOLOGIN REPLICATION NOREPLICATION BYPASSRLS NOBYPASSRLS ';

  const PLPGSQL_KW =
    'ALIAS BEGIN CONSTANT DECLARE END EXCEPTION RETURN PERFORM|10 RAISE GET DIAGNOSTICS '
    + 'STACKED|10 FOREACH LOOP ELSIF EXIT WHILE REVERSE SLICE DEBUG LOG INFO NOTICE WARNING ASSERT '
    + 'OPEN ';

  const TYPES =
    // https://www.postgresql.org/docs/11/static/datatype.html
    'BIGINT INT8 BIGSERIAL SERIAL8 BIT VARYING VARBIT BOOLEAN BOOL BOX BYTEA CHARACTER CHAR VARCHAR '
    + 'CIDR CIRCLE DATE DOUBLE PRECISION FLOAT8 FLOAT INET INTEGER INT INT4 INTERVAL JSON JSONB LINE LSEG|10 '
    + 'MACADDR MACADDR8 MONEY NUMERIC DEC DECIMAL PATH POINT POLYGON REAL FLOAT4 SMALLINT INT2 '
    + 'SMALLSERIAL|10 SERIAL2|10 SERIAL|10 SERIAL4|10 TEXT TIME ZONE TIMETZ|10 TIMESTAMP TIMESTAMPTZ|10 TSQUERY|10 TSVECTOR|10 '
    + 'TXID_SNAPSHOT|10 UUID XML NATIONAL NCHAR '
    + 'INT4RANGE|10 INT8RANGE|10 NUMRANGE|10 TSRANGE|10 TSTZRANGE|10 DATERANGE|10 '
    // pseudotypes
    + 'ANYELEMENT ANYARRAY ANYNONARRAY ANYENUM ANYRANGE CSTRING INTERNAL '
    + 'RECORD PG_DDL_COMMAND VOID UNKNOWN OPAQUE REFCURSOR '
    // spec. type
    + 'NAME '
    // OID-types
    + 'OID REGPROC|10 REGPROCEDURE|10 REGOPER|10 REGOPERATOR|10 REGCLASS|10 REGTYPE|10 REGROLE|10 '
    + 'REGNAMESPACE|10 REGCONFIG|10 REGDICTIONARY|10 ';// +

  const TYPES_RE =
    TYPES.trim()
      .split(' ')
      .map(function(val) { return val.split('|')[0]; })
      .join('|');

  const SQL_BI =
    'CURRENT_TIME CURRENT_TIMESTAMP CURRENT_USER CURRENT_CATALOG|10 CURRENT_DATE LOCALTIME LOCALTIMESTAMP '
    + 'CURRENT_ROLE|10 CURRENT_SCHEMA|10 SESSION_USER PUBLIC ';

  const PLPGSQL_BI =
    'FOUND NEW OLD TG_NAME|10 TG_WHEN|10 TG_LEVEL|10 TG_OP|10 TG_RELID|10 TG_RELNAME|10 '
    + 'TG_TABLE_NAME|10 TG_TABLE_SCHEMA|10 TG_NARGS|10 TG_ARGV|10 TG_EVENT|10 TG_TAG|10 '
    // get diagnostics
    + 'ROW_COUNT RESULT_OID|10 PG_CONTEXT|10 RETURNED_SQLSTATE COLUMN_NAME CONSTRAINT_NAME '
    + 'PG_DATATYPE_NAME|10 MESSAGE_TEXT TABLE_NAME SCHEMA_NAME PG_EXCEPTION_DETAIL|10 '
    + 'PG_EXCEPTION_HINT|10 PG_EXCEPTION_CONTEXT|10 ';

  const PLPGSQL_EXCEPTIONS =
    // exceptions https://www.postgresql.org/docs/current/static/errcodes-appendix.html
    'SQLSTATE SQLERRM|10 '
    + 'SUCCESSFUL_COMPLETION WARNING DYNAMIC_RESULT_SETS_RETURNED IMPLICIT_ZERO_BIT_PADDING '
    + 'NULL_VALUE_ELIMINATED_IN_SET_FUNCTION PRIVILEGE_NOT_GRANTED PRIVILEGE_NOT_REVOKED '
    + 'STRING_DATA_RIGHT_TRUNCATION DEPRECATED_FEATURE NO_DATA NO_ADDITIONAL_DYNAMIC_RESULT_SETS_RETURNED '
    + 'SQL_STATEMENT_NOT_YET_COMPLETE CONNECTION_EXCEPTION CONNECTION_DOES_NOT_EXIST CONNECTION_FAILURE '
    + 'SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION '
    + 'TRANSACTION_RESOLUTION_UNKNOWN PROTOCOL_VIOLATION TRIGGERED_ACTION_EXCEPTION FEATURE_NOT_SUPPORTED '
    + 'INVALID_TRANSACTION_INITIATION LOCATOR_EXCEPTION INVALID_LOCATOR_SPECIFICATION INVALID_GRANTOR '
    + 'INVALID_GRANT_OPERATION INVALID_ROLE_SPECIFICATION DIAGNOSTICS_EXCEPTION '
    + 'STACKED_DIAGNOSTICS_ACCESSED_WITHOUT_ACTIVE_HANDLER CASE_NOT_FOUND CARDINALITY_VIOLATION '
    + 'DATA_EXCEPTION ARRAY_SUBSCRIPT_ERROR CHARACTER_NOT_IN_REPERTOIRE DATETIME_FIELD_OVERFLOW '
    + 'DIVISION_BY_ZERO ERROR_IN_ASSIGNMENT ESCAPE_CHARACTER_CONFLICT INDICATOR_OVERFLOW '
    + 'INTERVAL_FIELD_OVERFLOW INVALID_ARGUMENT_FOR_LOGARITHM INVALID_ARGUMENT_FOR_NTILE_FUNCTION '
    + 'INVALID_ARGUMENT_FOR_NTH_VALUE_FUNCTION INVALID_ARGUMENT_FOR_POWER_FUNCTION '
    + 'INVALID_ARGUMENT_FOR_WIDTH_BUCKET_FUNCTION INVALID_CHARACTER_VALUE_FOR_CAST '
    + 'INVALID_DATETIME_FORMAT INVALID_ESCAPE_CHARACTER INVALID_ESCAPE_OCTET INVALID_ESCAPE_SEQUENCE '
    + 'NONSTANDARD_USE_OF_ESCAPE_CHARACTER INVALID_INDICATOR_PARAMETER_VALUE INVALID_PARAMETER_VALUE '
    + 'INVALID_REGULAR_EXPRESSION INVALID_ROW_COUNT_IN_LIMIT_CLAUSE '
    + 'INVALID_ROW_COUNT_IN_RESULT_OFFSET_CLAUSE INVALID_TABLESAMPLE_ARGUMENT INVALID_TABLESAMPLE_REPEAT '
    + 'INVALID_TIME_ZONE_DISPLACEMENT_VALUE INVALID_USE_OF_ESCAPE_CHARACTER MOST_SPECIFIC_TYPE_MISMATCH '
    + 'NULL_VALUE_NOT_ALLOWED NULL_VALUE_NO_INDICATOR_PARAMETER NUMERIC_VALUE_OUT_OF_RANGE '
    + 'SEQUENCE_GENERATOR_LIMIT_EXCEEDED STRING_DATA_LENGTH_MISMATCH STRING_DATA_RIGHT_TRUNCATION '
    + 'SUBSTRING_ERROR TRIM_ERROR UNTERMINATED_C_STRING ZERO_LENGTH_CHARACTER_STRING '
    + 'FLOATING_POINT_EXCEPTION INVALID_TEXT_REPRESENTATION INVALID_BINARY_REPRESENTATION '
    + 'BAD_COPY_FILE_FORMAT UNTRANSLATABLE_CHARACTER NOT_AN_XML_DOCUMENT INVALID_XML_DOCUMENT '
    + 'INVALID_XML_CONTENT INVALID_XML_COMMENT INVALID_XML_PROCESSING_INSTRUCTION '
    + 'INTEGRITY_CONSTRAINT_VIOLATION RESTRICT_VIOLATION NOT_NULL_VIOLATION FOREIGN_KEY_VIOLATION '
    + 'UNIQUE_VIOLATION CHECK_VIOLATION EXCLUSION_VIOLATION INVALID_CURSOR_STATE '
    + 'INVALID_TRANSACTION_STATE ACTIVE_SQL_TRANSACTION BRANCH_TRANSACTION_ALREADY_ACTIVE '
    + 'HELD_CURSOR_REQUIRES_SAME_ISOLATION_LEVEL INAPPROPRIATE_ACCESS_MODE_FOR_BRANCH_TRANSACTION '
    + 'INAPPROPRIATE_ISOLATION_LEVEL_FOR_BRANCH_TRANSACTION '
    + 'NO_ACTIVE_SQL_TRANSACTION_FOR_BRANCH_TRANSACTION READ_ONLY_SQL_TRANSACTION '
    + 'SCHEMA_AND_DATA_STATEMENT_MIXING_NOT_SUPPORTED NO_ACTIVE_SQL_TRANSACTION '
    + 'IN_FAILED_SQL_TRANSACTION IDLE_IN_TRANSACTION_SESSION_TIMEOUT INVALID_SQL_STATEMENT_NAME '
    + 'TRIGGERED_DATA_CHANGE_VIOLATION INVALID_AUTHORIZATION_SPECIFICATION INVALID_PASSWORD '
    + 'DEPENDENT_PRIVILEGE_DESCRIPTORS_STILL_EXIST DEPENDENT_OBJECTS_STILL_EXIST '
    + 'INVALID_TRANSACTION_TERMINATION SQL_ROUTINE_EXCEPTION FUNCTION_EXECUTED_NO_RETURN_STATEMENT '
    + 'MODIFYING_SQL_DATA_NOT_PERMITTED PROHIBITED_SQL_STATEMENT_ATTEMPTED '
    + 'READING_SQL_DATA_NOT_PERMITTED INVALID_CURSOR_NAME EXTERNAL_ROUTINE_EXCEPTION '
    + 'CONTAINING_SQL_NOT_PERMITTED MODIFYING_SQL_DATA_NOT_PERMITTED '
    + 'PROHIBITED_SQL_STATEMENT_ATTEMPTED READING_SQL_DATA_NOT_PERMITTED '
    + 'EXTERNAL_ROUTINE_INVOCATION_EXCEPTION INVALID_SQLSTATE_RETURNED NULL_VALUE_NOT_ALLOWED '
    + 'TRIGGER_PROTOCOL_VIOLATED SRF_PROTOCOL_VIOLATED EVENT_TRIGGER_PROTOCOL_VIOLATED '
    + 'SAVEPOINT_EXCEPTION INVALID_SAVEPOINT_SPECIFICATION INVALID_CATALOG_NAME '
    + 'INVALID_SCHEMA_NAME TRANSACTION_ROLLBACK TRANSACTION_INTEGRITY_CONSTRAINT_VIOLATION '
    + 'SERIALIZATION_FAILURE STATEMENT_COMPLETION_UNKNOWN DEADLOCK_DETECTED '
    + 'SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION SYNTAX_ERROR INSUFFICIENT_PRIVILEGE CANNOT_COERCE '
    + 'GROUPING_ERROR WINDOWING_ERROR INVALID_RECURSION INVALID_FOREIGN_KEY INVALID_NAME '
    + 'NAME_TOO_LONG RESERVED_NAME DATATYPE_MISMATCH INDETERMINATE_DATATYPE COLLATION_MISMATCH '
    + 'INDETERMINATE_COLLATION WRONG_OBJECT_TYPE GENERATED_ALWAYS UNDEFINED_COLUMN '
    + 'UNDEFINED_FUNCTION UNDEFINED_TABLE UNDEFINED_PARAMETER UNDEFINED_OBJECT '
    + 'DUPLICATE_COLUMN DUPLICATE_CURSOR DUPLICATE_DATABASE DUPLICATE_FUNCTION '
    + 'DUPLICATE_PREPARED_STATEMENT DUPLICATE_SCHEMA DUPLICATE_TABLE DUPLICATE_ALIAS '
    + 'DUPLICATE_OBJECT AMBIGUOUS_COLUMN AMBIGUOUS_FUNCTION AMBIGUOUS_PARAMETER AMBIGUOUS_ALIAS '
    + 'INVALID_COLUMN_REFERENCE INVALID_COLUMN_DEFINITION INVALID_CURSOR_DEFINITION '
    + 'INVALID_DATABASE_DEFINITION INVALID_FUNCTION_DEFINITION '
    + 'INVALID_PREPARED_STATEMENT_DEFINITION INVALID_SCHEMA_DEFINITION INVALID_TABLE_DEFINITION '
    + 'INVALID_OBJECT_DEFINITION WITH_CHECK_OPTION_VIOLATION INSUFFICIENT_RESOURCES DISK_FULL '
    + 'OUT_OF_MEMORY TOO_MANY_CONNECTIONS CONFIGURATION_LIMIT_EXCEEDED PROGRAM_LIMIT_EXCEEDED '
    + 'STATEMENT_TOO_COMPLEX TOO_MANY_COLUMNS TOO_MANY_ARGUMENTS OBJECT_NOT_IN_PREREQUISITE_STATE '
    + 'OBJECT_IN_USE CANT_CHANGE_RUNTIME_PARAM LOCK_NOT_AVAILABLE OPERATOR_INTERVENTION '
    + 'QUERY_CANCELED ADMIN_SHUTDOWN CRASH_SHUTDOWN CANNOT_CONNECT_NOW DATABASE_DROPPED '
    + 'SYSTEM_ERROR IO_ERROR UNDEFINED_FILE DUPLICATE_FILE SNAPSHOT_TOO_OLD CONFIG_FILE_ERROR '
    + 'LOCK_FILE_EXISTS FDW_ERROR FDW_COLUMN_NAME_NOT_FOUND FDW_DYNAMIC_PARAMETER_VALUE_NEEDED '
    + 'FDW_FUNCTION_SEQUENCE_ERROR FDW_INCONSISTENT_DESCRIPTOR_INFORMATION '
    + 'FDW_INVALID_ATTRIBUTE_VALUE FDW_INVALID_COLUMN_NAME FDW_INVALID_COLUMN_NUMBER '
    + 'FDW_INVALID_DATA_TYPE FDW_INVALID_DATA_TYPE_DESCRIPTORS '
    + 'FDW_INVALID_DESCRIPTOR_FIELD_IDENTIFIER FDW_INVALID_HANDLE FDW_INVALID_OPTION_INDEX '
    + 'FDW_INVALID_OPTION_NAME FDW_INVALID_STRING_LENGTH_OR_BUFFER_LENGTH '
    + 'FDW_INVALID_STRING_FORMAT FDW_INVALID_USE_OF_NULL_POINTER FDW_TOO_MANY_HANDLES '
    + 'FDW_OUT_OF_MEMORY FDW_NO_SCHEMAS FDW_OPTION_NAME_NOT_FOUND FDW_REPLY_HANDLE '
    + 'FDW_SCHEMA_NOT_FOUND FDW_TABLE_NOT_FOUND FDW_UNABLE_TO_CREATE_EXECUTION '
    + 'FDW_UNABLE_TO_CREATE_REPLY FDW_UNABLE_TO_ESTABLISH_CONNECTION PLPGSQL_ERROR '
    + 'RAISE_EXCEPTION NO_DATA_FOUND TOO_MANY_ROWS ASSERT_FAILURE INTERNAL_ERROR DATA_CORRUPTED '
    + 'INDEX_CORRUPTED ';

  const FUNCTIONS =
    // https://www.postgresql.org/docs/11/static/functions-aggregate.html
    'ARRAY_AGG AVG BIT_AND BIT_OR BOOL_AND BOOL_OR COUNT EVERY JSON_AGG JSONB_AGG JSON_OBJECT_AGG '
    + 'JSONB_OBJECT_AGG MAX MIN MODE STRING_AGG SUM XMLAGG '
    + 'CORR COVAR_POP COVAR_SAMP REGR_AVGX REGR_AVGY REGR_COUNT REGR_INTERCEPT REGR_R2 REGR_SLOPE '
    + 'REGR_SXX REGR_SXY REGR_SYY STDDEV STDDEV_POP STDDEV_SAMP VARIANCE VAR_POP VAR_SAMP '
    + 'PERCENTILE_CONT PERCENTILE_DISC '
    // https://www.postgresql.org/docs/11/static/functions-window.html
    + 'ROW_NUMBER RANK DENSE_RANK PERCENT_RANK CUME_DIST NTILE LAG LEAD FIRST_VALUE LAST_VALUE NTH_VALUE '
    // https://www.postgresql.org/docs/11/static/functions-comparison.html
    + 'NUM_NONNULLS NUM_NULLS '
    // https://www.postgresql.org/docs/11/static/functions-math.html
    + 'ABS CBRT CEIL CEILING DEGREES DIV EXP FLOOR LN LOG MOD PI POWER RADIANS ROUND SCALE SIGN SQRT '
    + 'TRUNC WIDTH_BUCKET '
    + 'RANDOM SETSEED '
    + 'ACOS ACOSD ASIN ASIND ATAN ATAND ATAN2 ATAN2D COS COSD COT COTD SIN SIND TAN TAND '
    // https://www.postgresql.org/docs/11/static/functions-string.html
    + 'BIT_LENGTH CHAR_LENGTH CHARACTER_LENGTH LOWER OCTET_LENGTH OVERLAY POSITION SUBSTRING TREAT TRIM UPPER '
    + 'ASCII BTRIM CHR CONCAT CONCAT_WS CONVERT CONVERT_FROM CONVERT_TO DECODE ENCODE INITCAP '
    + 'LEFT LENGTH LPAD LTRIM MD5 PARSE_IDENT PG_CLIENT_ENCODING QUOTE_IDENT|10 QUOTE_LITERAL|10 '
    + 'QUOTE_NULLABLE|10 REGEXP_MATCH REGEXP_MATCHES REGEXP_REPLACE REGEXP_SPLIT_TO_ARRAY '
    + 'REGEXP_SPLIT_TO_TABLE REPEAT REPLACE REVERSE RIGHT RPAD RTRIM SPLIT_PART STRPOS SUBSTR '
    + 'TO_ASCII TO_HEX TRANSLATE '
    // https://www.postgresql.org/docs/11/static/functions-binarystring.html
    + 'OCTET_LENGTH GET_BIT GET_BYTE SET_BIT SET_BYTE '
    // https://www.postgresql.org/docs/11/static/functions-formatting.html
    + 'TO_CHAR TO_DATE TO_NUMBER TO_TIMESTAMP '
    // https://www.postgresql.org/docs/11/static/functions-datetime.html
    + 'AGE CLOCK_TIMESTAMP|10 DATE_PART DATE_TRUNC ISFINITE JUSTIFY_DAYS JUSTIFY_HOURS JUSTIFY_INTERVAL '
    + 'MAKE_DATE MAKE_INTERVAL|10 MAKE_TIME MAKE_TIMESTAMP|10 MAKE_TIMESTAMPTZ|10 NOW STATEMENT_TIMESTAMP|10 '
    + 'TIMEOFDAY TRANSACTION_TIMESTAMP|10 '
    // https://www.postgresql.org/docs/11/static/functions-enum.html
    + 'ENUM_FIRST ENUM_LAST ENUM_RANGE '
    // https://www.postgresql.org/docs/11/static/functions-geometry.html
    + 'AREA CENTER DIAMETER HEIGHT ISCLOSED ISOPEN NPOINTS PCLOSE POPEN RADIUS WIDTH '
    + 'BOX BOUND_BOX CIRCLE LINE LSEG PATH POLYGON '
    // https://www.postgresql.org/docs/11/static/functions-net.html
    + 'ABBREV BROADCAST HOST HOSTMASK MASKLEN NETMASK NETWORK SET_MASKLEN TEXT INET_SAME_FAMILY '
    + 'INET_MERGE MACADDR8_SET7BIT '
    // https://www.postgresql.org/docs/11/static/functions-textsearch.html
    + 'ARRAY_TO_TSVECTOR GET_CURRENT_TS_CONFIG NUMNODE PLAINTO_TSQUERY PHRASETO_TSQUERY WEBSEARCH_TO_TSQUERY '
    + 'QUERYTREE SETWEIGHT STRIP TO_TSQUERY TO_TSVECTOR JSON_TO_TSVECTOR JSONB_TO_TSVECTOR TS_DELETE '
    + 'TS_FILTER TS_HEADLINE TS_RANK TS_RANK_CD TS_REWRITE TSQUERY_PHRASE TSVECTOR_TO_ARRAY '
    + 'TSVECTOR_UPDATE_TRIGGER TSVECTOR_UPDATE_TRIGGER_COLUMN '
    // https://www.postgresql.org/docs/11/static/functions-xml.html
    + 'XMLCOMMENT XMLCONCAT XMLELEMENT XMLFOREST XMLPI XMLROOT '
    + 'XMLEXISTS XML_IS_WELL_FORMED XML_IS_WELL_FORMED_DOCUMENT XML_IS_WELL_FORMED_CONTENT '
    + 'XPATH XPATH_EXISTS XMLTABLE XMLNAMESPACES '
    + 'TABLE_TO_XML TABLE_TO_XMLSCHEMA TABLE_TO_XML_AND_XMLSCHEMA '
    + 'QUERY_TO_XML QUERY_TO_XMLSCHEMA QUERY_TO_XML_AND_XMLSCHEMA '
    + 'CURSOR_TO_XML CURSOR_TO_XMLSCHEMA '
    + 'SCHEMA_TO_XML SCHEMA_TO_XMLSCHEMA SCHEMA_TO_XML_AND_XMLSCHEMA '
    + 'DATABASE_TO_XML DATABASE_TO_XMLSCHEMA DATABASE_TO_XML_AND_XMLSCHEMA '
    + 'XMLATTRIBUTES '
    // https://www.postgresql.org/docs/11/static/functions-json.html
    + 'TO_JSON TO_JSONB ARRAY_TO_JSON ROW_TO_JSON JSON_BUILD_ARRAY JSONB_BUILD_ARRAY JSON_BUILD_OBJECT '
    + 'JSONB_BUILD_OBJECT JSON_OBJECT JSONB_OBJECT JSON_ARRAY_LENGTH JSONB_ARRAY_LENGTH JSON_EACH '
    + 'JSONB_EACH JSON_EACH_TEXT JSONB_EACH_TEXT JSON_EXTRACT_PATH JSONB_EXTRACT_PATH '
    + 'JSON_OBJECT_KEYS JSONB_OBJECT_KEYS JSON_POPULATE_RECORD JSONB_POPULATE_RECORD JSON_POPULATE_RECORDSET '
    + 'JSONB_POPULATE_RECORDSET JSON_ARRAY_ELEMENTS JSONB_ARRAY_ELEMENTS JSON_ARRAY_ELEMENTS_TEXT '
    + 'JSONB_ARRAY_ELEMENTS_TEXT JSON_TYPEOF JSONB_TYPEOF JSON_TO_RECORD JSONB_TO_RECORD JSON_TO_RECORDSET '
    + 'JSONB_TO_RECORDSET JSON_STRIP_NULLS JSONB_STRIP_NULLS JSONB_SET JSONB_INSERT JSONB_PRETTY '
    // https://www.postgresql.org/docs/11/static/functions-sequence.html
    + 'CURRVAL LASTVAL NEXTVAL SETVAL '
    // https://www.postgresql.org/docs/11/static/functions-conditional.html
    + 'COALESCE NULLIF GREATEST LEAST '
    // https://www.postgresql.org/docs/11/static/functions-array.html
    + 'ARRAY_APPEND ARRAY_CAT ARRAY_NDIMS ARRAY_DIMS ARRAY_FILL ARRAY_LENGTH ARRAY_LOWER ARRAY_POSITION '
    + 'ARRAY_POSITIONS ARRAY_PREPEND ARRAY_REMOVE ARRAY_REPLACE ARRAY_TO_STRING ARRAY_UPPER CARDINALITY '
    + 'STRING_TO_ARRAY UNNEST '
    // https://www.postgresql.org/docs/11/static/functions-range.html
    + 'ISEMPTY LOWER_INC UPPER_INC LOWER_INF UPPER_INF RANGE_MERGE '
    // https://www.postgresql.org/docs/11/static/functions-srf.html
    + 'GENERATE_SERIES GENERATE_SUBSCRIPTS '
    // https://www.postgresql.org/docs/11/static/functions-info.html
    + 'CURRENT_DATABASE CURRENT_QUERY CURRENT_SCHEMA|10 CURRENT_SCHEMAS|10 INET_CLIENT_ADDR INET_CLIENT_PORT '
    + 'INET_SERVER_ADDR INET_SERVER_PORT ROW_SECURITY_ACTIVE FORMAT_TYPE '
    + 'TO_REGCLASS TO_REGPROC TO_REGPROCEDURE TO_REGOPER TO_REGOPERATOR TO_REGTYPE TO_REGNAMESPACE TO_REGROLE '
    + 'COL_DESCRIPTION OBJ_DESCRIPTION SHOBJ_DESCRIPTION '
    + 'TXID_CURRENT TXID_CURRENT_IF_ASSIGNED TXID_CURRENT_SNAPSHOT TXID_SNAPSHOT_XIP TXID_SNAPSHOT_XMAX '
    + 'TXID_SNAPSHOT_XMIN TXID_VISIBLE_IN_SNAPSHOT TXID_STATUS '
    // https://www.postgresql.org/docs/11/static/functions-admin.html
    + 'CURRENT_SETTING SET_CONFIG BRIN_SUMMARIZE_NEW_VALUES BRIN_SUMMARIZE_RANGE BRIN_DESUMMARIZE_RANGE '
    + 'GIN_CLEAN_PENDING_LIST '
    // https://www.postgresql.org/docs/11/static/functions-trigger.html
    + 'SUPPRESS_REDUNDANT_UPDATES_TRIGGER '
    // ihttps://www.postgresql.org/docs/devel/static/lo-funcs.html
    + 'LO_FROM_BYTEA LO_PUT LO_GET LO_CREAT LO_CREATE LO_UNLINK LO_IMPORT LO_EXPORT LOREAD LOWRITE '
    //
    + 'GROUPING CAST ';

  const FUNCTIONS_RE =
      FUNCTIONS.trim()
        .split(' ')
        .map(function(val) { return val.split('|')[0]; })
        .join('|');

  return {
    name: 'PostgreSQL',
    aliases: [
      'postgres',
      'postgresql'
    ],
    supersetOf: "sql",
    case_insensitive: true,
    keywords: {
      keyword:
            SQL_KW + PLPGSQL_KW + ROLE_ATTRS,
      built_in:
            SQL_BI + PLPGSQL_BI + PLPGSQL_EXCEPTIONS
    },
    // Forbid some cunstructs from other languages to improve autodetect. In fact
    // "[a-z]:" is legal (as part of array slice), but improbabal.
    illegal: /:==|\W\s*\(\*|(^|\s)\$[a-z]|\{\{|[a-z]:\s*$|\.\.\.|TO:|DO:/,
    contains: [
      // special handling of some words, which are reserved only in some contexts
      {
        className: 'keyword',
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
      { begin: /\b(FORMAT|FAMILY|VERSION)\s*\(/
        // keywords: { built_in: 'FORMAT FAMILY VERSION' }
      },
      // INCLUDE ( ... ) in index_parameters in CREATE TABLE
      {
        begin: /\bINCLUDE\s*\(/,
        keywords: 'INCLUDE'
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
          type: 'CENTURY DAY DECADE DOW DOY EPOCH HOUR ISODOW ISOYEAR MICROSECONDS '
                        + 'MILLENNIUM MILLISECONDS MINUTE MONTH QUARTER SECOND TIMEZONE TIMEZONE_HOUR '
                        + 'TIMEZONE_MINUTE WEEK YEAR' }
      },
      // xmlelement, xmlpi - special NAME
      {
        begin: /\b(XMLELEMENT|XMLPI)\s*\(\s*NAME/,
        keywords: {
          // built_in: 'XMLELEMENT XMLPI',
          keyword: 'NAME' }
      },
      // xmlparse, xmlserialize
      {
        begin: /\b(XMLPARSE|XMLSERIALIZE)\s*\(\s*(DOCUMENT|CONTENT)/,
        keywords: {
          // built_in: 'XMLPARSE XMLSERIALIZE',
          keyword: 'DOCUMENT CONTENT' }
      },
      // Sequences. We actually skip everything between CACHE|INCREMENT|MAXVALUE|MINVALUE and
      // nearest following numeric constant. Without with trick we find a lot of "keywords"
      // in 'avrasm' autodetection test...
      {
        beginKeywords: 'CACHE INCREMENT MAXVALUE MINVALUE',
        end: hljs.C_NUMBER_RE,
        returnEnd: true,
        keywords: 'BY CACHE INCREMENT MAXVALUE MINVALUE'
      },
      // WITH|WITHOUT TIME ZONE as part of datatype
      {
        className: 'type',
        begin: /\b(WITH|WITHOUT)\s+TIME\s+ZONE\b/
      },
      // INTERVAL optional fields
      {
        className: 'type',
        begin: /\bINTERVAL\s+(YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)(\s+TO\s+(MONTH|HOUR|MINUTE|SECOND))?\b/
      },
      // Pseudo-types which allowed only as return type
      {
        begin: /\bRETURNS\s+(LANGUAGE_HANDLER|TRIGGER|EVENT_TRIGGER|FDW_HANDLER|INDEX_AM_HANDLER|TSM_HANDLER)\b/,
        keywords: {
          keyword: 'RETURNS',
          type: 'LANGUAGE_HANDLER TRIGGER EVENT_TRIGGER FDW_HANDLER INDEX_AM_HANDLER TSM_HANDLER'
        }
      },
      // Known functions - only when followed by '('
      { begin: '\\b(' + FUNCTIONS_RE + ')\\s*\\('
        // keywords: { built_in: FUNCTIONS }
      },
      // Types
      { begin: '\\.(' + TYPES_RE + ')\\b' // prevent highlight as type, say, 'oid' in 'pgclass.oid'
      },
      {
        begin: '\\b(' + TYPES_RE + ')\\s+PATH\\b', // in XMLTABLE
        keywords: {
          keyword: 'PATH', // hopefully no one would use PATH type in XMLTABLE...
          type: TYPES.replace('PATH ', '')
        }
      },
      {
        className: 'type',
        begin: '\\b(' + TYPES_RE + ')\\b'
      },
      // Strings, see https://www.postgresql.org/docs/11/static/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS
      {
        className: 'string',
        begin: '\'',
        end: '\'',
        contains: [ { begin: '\'\'' } ]
      },
      {
        className: 'string',
        begin: '(e|E|u&|U&)\'',
        end: '\'',
        contains: [ { begin: '\\\\.' } ],
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
              'pgsql',
              'perl',
              'python',
              'tcl',
              'r',
              'lua',
              'java',
              'php',
              'ruby',
              'bash',
              'scheme',
              'xml',
              'json'
            ],
            endsWithParent: true
          }
        ]
      }),
      // identifiers in quotes
      {
        begin: '"',
        end: '"',
        contains: [ { begin: '""' } ]
      },
      // numbers
      hljs.C_NUMBER_MODE,
      // comments
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE,
      // PL/pgSQL staff
      // %ROWTYPE, %TYPE, $n
      {
        className: 'meta',
        variants: [
          { // %TYPE, %ROWTYPE
            begin: '%(ROW)?TYPE',
            relevance: 10
          },
          { // $n
            begin: '\\$\\d+' },
          { // #compiler option
            begin: '^#\\w',
            end: '$'
          }
        ]
      },
      // <<labeles>>
      {
        className: 'symbol',
        begin: LABEL,
        relevance: 10
      }
    ]
  };
}

/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
Website: https://www.php.net
Category: common
*/

/**
 * @param {HLJSApi} hljs
 * @returns {LanguageDetail}
 * */
function php(hljs) {
  const regex = hljs.regex;
  // negative look-ahead tries to avoid matching patterns that are not
  // Perl at all like $ident$, @ident@, etc.
  const NOT_PERL_ETC = /(?![A-Za-z0-9])(?![$])/;
  const IDENT_RE = regex.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    NOT_PERL_ETC);
  // Will not detect camelCase classes
  const PASCAL_CASE_CLASS_NAME_RE = regex.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    NOT_PERL_ETC);
  const UPCASE_NAME_RE = regex.concat(
    /[A-Z]+/,
    NOT_PERL_ETC);
  const VARIABLE = {
    scope: 'variable',
    match: '\\$+' + IDENT_RE,
  };
  const PREPROCESSOR = {
    scope: "meta",
    variants: [
      { begin: /<\?php/, relevance: 10 }, // boost for obvious PHP
      { begin: /<\?=/ },
      // less relevant per PSR-1 which says not to use short-tags
      { begin: /<\?/, relevance: 0.1 },
      { begin: /\?>/ } // end php tag
    ]
  };
  const SUBST = {
    scope: 'subst',
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  };
  const SINGLE_QUOTED = hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null, });
  const DOUBLE_QUOTED = hljs.inherit(hljs.QUOTE_STRING_MODE, {
    illegal: null,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
  });

  const HEREDOC = {
    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
    end: /[ \t]*(\w+)\b/,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
    'on:begin': (m, resp) => { resp.data._beginMatch = m[1] || m[2]; },
    'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); },
  };

  const NOWDOC = hljs.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*'(\w+)'\n/,
    end: /[ \t]*(\w+)\b/,
  });
  // list of valid whitespaces because non-breaking space might be part of a IDENT_RE
  const WHITESPACE = '[ \t\n]';
  const STRING = {
    scope: 'string',
    variants: [
      DOUBLE_QUOTED,
      SINGLE_QUOTED,
      HEREDOC,
      NOWDOC
    ]
  };
  const NUMBER = {
    scope: 'number',
    variants: [
      { begin: `\\b0[bB][01]+(?:_[01]+)*\\b` }, // Binary w/ underscore support
      { begin: `\\b0[oO][0-7]+(?:_[0-7]+)*\\b` }, // Octals w/ underscore support
      { begin: `\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b` }, // Hex w/ underscore support
      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
      { begin: `(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?` }
    ],
    relevance: 0
  };
  const LITERALS = [
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
    "global",
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

  const BUILT_INS = [
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

  /** Dual-case keywords
   *
   * ["then","FILE"] =>
   *     ["then", "THEN", "FILE", "file"]
   *
   * @param {string[]} items */
  const dualCase = (items) => {
    /** @type string[] */
    const result = [];
    items.forEach(item => {
      result.push(item);
      if (item.toLowerCase() === item) {
        result.push(item.toUpperCase());
      } else {
        result.push(item.toLowerCase());
      }
    });
    return result;
  };

  const KEYWORDS = {
    keyword: KWS,
    literal: dualCase(LITERALS),
    built_in: BUILT_INS,
  };

  /**
   * @param {string[]} items */
  const normalizeKeywords = (items) => {
    return items.map(item => {
      return item.replace(/\|\d+$/, "");
    });
  };

  const CONSTRUCTOR_CALL = { variants: [
    {
      match: [
        /new/,
        regex.concat(WHITESPACE, "+"),
        // to prevent built ins from being confused as the class constructor call
        regex.concat("(?!", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
        PASCAL_CASE_CLASS_NAME_RE,
      ],
      scope: {
        1: "keyword",
        4: "title.class",
      },
    }
  ] };

  const CONSTANT_REFERENCE = regex.concat(IDENT_RE, "\\b(?!\\()");

  const LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON = { variants: [
    {
      match: [
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE,
      ],
      scope: { 2: "variable.constant", },
    },
    {
      match: [
        /::/,
        /class/,
      ],
      scope: { 2: "variable.language", },
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE,
      ],
      scope: {
        1: "title.class",
        3: "variable.constant",
      },
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          "::",
          regex.lookahead(/(?!class\b)/)
        ),
      ],
      scope: { 1: "title.class", },
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        /::/,
        /class/,
      ],
      scope: {
        1: "title.class",
        3: "variable.language",
      },
    }
  ] };

  const NAMED_ARGUMENT = {
    scope: 'attr',
    match: regex.concat(IDENT_RE, regex.lookahead(':'), regex.lookahead(/(?!::)/)),
  };
  const PARAMS_MODE = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS,
    contains: [
      NAMED_ARGUMENT,
      VARIABLE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      NUMBER,
      CONSTRUCTOR_CALL,
    ],
  };
  const FUNCTION_INVOKE = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      regex.concat("(?!fn\\b|function\\b|", normalizeKeywords(KWS).join("\\b|"), "|", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
      IDENT_RE,
      regex.concat(WHITESPACE, "*"),
      regex.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke", },
    contains: [ PARAMS_MODE ]
  };
  PARAMS_MODE.contains.push(FUNCTION_INVOKE);

  const ATTRIBUTE_CONTAINS = [
    NAMED_ARGUMENT,
    LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING,
    NUMBER,
    CONSTRUCTOR_CALL,
  ];

  const ATTRIBUTES = {
    begin: regex.concat(/#\[\s*\\?/,
      regex.either(
        PASCAL_CASE_CLASS_NAME_RE,
        UPCASE_NAME_RE
      )
    ),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: LITERALS,
      keyword: [
        'new',
        'array',
      ]
    },
    contains: [
      {
        begin: /\[/,
        end: /]/,
        keywords: {
          literal: LITERALS,
          keyword: [
            'new',
            'array',
          ]
        },
        contains: [
          'self',
          ...ATTRIBUTE_CONTAINS,
        ]
      },
      ...ATTRIBUTE_CONTAINS,
      {
        scope: 'meta',
        variants: [
          { match: PASCAL_CASE_CLASS_NAME_RE },
          { match: UPCASE_NAME_RE }
        ]
      }
    ]
  };

  return {
    case_insensitive: false,
    keywords: KEYWORDS,
    contains: [
      ATTRIBUTES,
      hljs.HASH_COMMENT_MODE,
      hljs.COMMENT('//', '$'),
      hljs.COMMENT(
        '/\\*',
        '\\*/',
        { contains: [
          {
            scope: 'doctag',
            match: '@[A-Za-z]+'
          }
        ] }
      ),
      {
        match: /__halt_compiler\(\);/,
        keywords: '__halt_compiler',
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
        scope: 'variable.language',
        match: /\$this\b/
      },
      VARIABLE,
      FUNCTION_INVOKE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      {
        match: [
          /const/,
          /\s/,
          IDENT_RE,
        ],
        scope: {
          1: "keyword",
          3: "variable.constant",
        },
      },
      CONSTRUCTOR_CALL,
      {
        scope: 'function',
        relevance: 0,
        beginKeywords: 'fn function',
        end: /[;{]/,
        excludeEnd: true,
        illegal: '[$%\\[]',
        contains: [
          { beginKeywords: 'use', },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            begin: '=>', // No markup, just a relevance booster
            endsParent: true
          },
          {
            scope: 'params',
            begin: '\\(',
            end: '\\)',
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS,
            contains: [
              'self',
              ATTRIBUTES,
              VARIABLE,
              LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
              hljs.C_BLOCK_COMMENT_MODE,
              STRING,
              NUMBER
            ]
          },
        ]
      },
      {
        scope: 'class',
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
          { beginKeywords: 'extends implements' },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      // both use and namespace still use "old style" rules (vs multi-match)
      // because the namespace name can include `\` and we still want each
      // element to be treated as its own *individual* title
      {
        beginKeywords: 'namespace',
        relevance: 0,
        end: ';',
        illegal: /[.']/,
        contains: [ hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, { scope: "title.class" }) ]
      },
      {
        beginKeywords: 'use',
        relevance: 0,
        end: ';',
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
      NUMBER,
    ]
  };
}

/*
Language: PowerShell
Description: PowerShell is a task-based command-line shell and scripting language built on .NET.
Author: David Mohundro <david@mohundro.com>
Contributors: Nicholas Blumhardt <nblumhardt@nblumhardt.com>, Victor Zhou <OiCMudkips@users.noreply.github.com>, Nicolas Le Gall <contact@nlegall.fr>
Website: https://docs.microsoft.com/en-us/powershell/
Category: scripting
*/

function powershell(hljs) {
  const TYPES = [
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

  // https://docs.microsoft.com/en-us/powershell/scripting/developer/cmdlet/approved-verbs-for-windows-powershell-commands
  const VALID_VERBS =
    'Add|Clear|Close|Copy|Enter|Exit|Find|Format|Get|Hide|Join|Lock|'
    + 'Move|New|Open|Optimize|Pop|Push|Redo|Remove|Rename|Reset|Resize|'
    + 'Search|Select|Set|Show|Skip|Split|Step|Switch|Undo|Unlock|'
    + 'Watch|Backup|Checkpoint|Compare|Compress|Convert|ConvertFrom|'
    + 'ConvertTo|Dismount|Edit|Expand|Export|Group|Import|Initialize|'
    + 'Limit|Merge|Mount|Out|Publish|Restore|Save|Sync|Unpublish|Update|'
    + 'Approve|Assert|Build|Complete|Confirm|Deny|Deploy|Disable|Enable|Install|Invoke|'
    + 'Register|Request|Restart|Resume|Start|Stop|Submit|Suspend|Uninstall|'
    + 'Unregister|Wait|Debug|Measure|Ping|Repair|Resolve|Test|Trace|Connect|'
    + 'Disconnect|Read|Receive|Send|Write|Block|Grant|Protect|Revoke|Unblock|'
    + 'Unprotect|Use|ForEach|Sort|Tee|Where';

  const COMPARISON_OPERATORS =
    '-and|-as|-band|-bnot|-bor|-bxor|-casesensitive|-ccontains|-ceq|-cge|-cgt|'
    + '-cle|-clike|-clt|-cmatch|-cne|-cnotcontains|-cnotlike|-cnotmatch|-contains|'
    + '-creplace|-csplit|-eq|-exact|-f|-file|-ge|-gt|-icontains|-ieq|-ige|-igt|'
    + '-ile|-ilike|-ilt|-imatch|-in|-ine|-inotcontains|-inotlike|-inotmatch|'
    + '-ireplace|-is|-isnot|-isplit|-join|-le|-like|-lt|-match|-ne|-not|'
    + '-notcontains|-notin|-notlike|-notmatch|-or|-regex|-replace|-shl|-shr|'
    + '-split|-wildcard|-xor';

  const KEYWORDS = {
    $pattern: /-?[A-z\.\-]+\b/,
    keyword:
      'if else foreach return do while until elseif begin for trap data dynamicparam '
      + 'end break throw param continue finally in switch exit filter try process catch '
      + 'hidden static parameter',
    // "echo" relevance has been set to 0 to avoid auto-detect conflicts with shell transcripts
    built_in:
      'ac asnp cat cd CFS chdir clc clear clhy cli clp cls clv cnsn compare copy cp '
      + 'cpi cpp curl cvpa dbp del diff dir dnsn ebp echo|0 epal epcsv epsn erase etsn exsn fc fhx '
      + 'fl ft fw gal gbp gc gcb gci gcm gcs gdr gerr ghy gi gin gjb gl gm gmo gp gps gpv group '
      + 'gsn gsnp gsv gtz gu gv gwmi h history icm iex ihy ii ipal ipcsv ipmo ipsn irm ise iwmi '
      + 'iwr kill lp ls man md measure mi mount move mp mv nal ndr ni nmo npssc nsn nv ogv oh '
      + 'popd ps pushd pwd r rbp rcjb rcsn rd rdr ren ri rjb rm rmdir rmo rni rnp rp rsn rsnp '
      + 'rujb rv rvpa rwmi sajb sal saps sasv sbp sc scb select set shcm si sl sleep sls sort sp '
      + 'spjb spps spsv start stz sujb sv swmi tee trcm type wget where wjb write'
    // TODO: 'validate[A-Z]+' can't work in keywords
  };

  const TITLE_NAME_RE = /\w[\w\d]*((-)[\w\d]+)*/;

  const BACKTICK_ESCAPE = {
    begin: '`[\\s\\S]',
    relevance: 0
  };

  const VAR = {
    className: 'variable',
    variants: [
      { begin: /\$\B/ },
      {
        className: 'keyword',
        begin: /\$this/
      },
      { begin: /\$[\w\d][\w\d_:]*/ }
    ]
  };

  const LITERAL = {
    className: 'literal',
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
        className: 'variable',
        begin: /\$[A-z]/,
        end: /[^A-z]/
      }
    ]
  };

  const APOS_STRING = {
    className: 'string',
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
      contains: [ PS_HELPTAGS ]
    }
  );

  const CMDLETS = {
    className: 'built_in',
    variants: [ { begin: '('.concat(VALID_VERBS, ')+(-)[\\w\\d]+') } ]
  };

  const PS_CLASS = {
    className: 'class',
    beginKeywords: 'class enum',
    end: /\s*[{]/,
    excludeEnd: true,
    relevance: 0,
    contains: [ hljs.TITLE_MODE ]
  };

  const PS_FUNCTION = {
    className: 'function',
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
        contains: [ VAR ]
      }
      // CMDLETS
    ]
  };

  // Using statment, plus type, plus assembly name.
  const PS_USING = {
    begin: /using\s/,
    end: /$/,
    returnBegin: true,
    contains: [
      QUOTE_STRING,
      APOS_STRING,
      {
        className: 'keyword',
        begin: /(using|assembly|command|module|namespace|type)/
      }
    ]
  };

  // Comperison operators & function named parameters.
  const PS_ARGUMENTS = { variants: [
    // PS literals are pretty verbose so it's a good idea to accent them a bit.
    {
      className: 'operator',
      begin: '('.concat(COMPARISON_OPERATORS, ')\\b')
    },
    {
      className: 'literal',
      begin: /(-){1,2}[\w\d-]+/,
      relevance: 0
    }
  ] };

  const HASH_SIGNS = {
    className: 'selector-tag',
    begin: /@\B/,
    relevance: 0
  };

  // It's a very general rule so I'll narrow it a bit with some strict boundaries
  // to avoid any possible false-positive collisions!
  const PS_METHODS = {
    className: 'function',
    begin: /\[.*\]\s*[\w]+[ ]??\(/,
    end: /$/,
    returnBegin: true,
    relevance: 0,
    contains: [
      {
        className: 'keyword',
        begin: '('.concat(
          KEYWORDS.keyword.toString().replace(/\s/g, '|'
          ), ')\\b'),
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
      'self',
      GENTLEMANS_SET,
      {
        begin: "(" + TYPES.join("|") + ")",
        className: "built_in",
        relevance: 0
      },
      {
        className: 'type',
        begin: /[\.\w\d]+/,
        relevance: 0
      }
    )
  };

  PS_METHODS.contains.unshift(PS_TYPE);

  return {
    name: 'PowerShell',
    aliases: [
      "pwsh",
      "ps",
      "ps1"
    ],
    case_insensitive: true,
    keywords: KEYWORDS,
    contains: GENTLEMANS_SET.concat(
      PS_CLASS,
      PS_FUNCTION,
      PS_USING,
      PS_ARGUMENTS,
      PS_TYPE
    )
  };
}

/*
Language: Python
Description: Python is an interpreted, object-oriented, high-level programming language with dynamic semantics.
Website: https://www.python.org
Category: common
*/

function python(hljs) {
  const regex = hljs.regex;
  const IDENT_RE = /[\p{XID_Start}_]\p{XID_Continue}*/u;
  const RESERVED_WORDS = [
    'and',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'case',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'match',
    'nonlocal|10',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'try',
    'while',
    'with',
    'yield'
  ];

  const BUILT_INS = [
    '__import__',
    'abs',
    'all',
    'any',
    'ascii',
    'bin',
    'bool',
    'breakpoint',
    'bytearray',
    'bytes',
    'callable',
    'chr',
    'classmethod',
    'compile',
    'complex',
    'delattr',
    'dict',
    'dir',
    'divmod',
    'enumerate',
    'eval',
    'exec',
    'filter',
    'float',
    'format',
    'frozenset',
    'getattr',
    'globals',
    'hasattr',
    'hash',
    'help',
    'hex',
    'id',
    'input',
    'int',
    'isinstance',
    'issubclass',
    'iter',
    'len',
    'list',
    'locals',
    'map',
    'max',
    'memoryview',
    'min',
    'next',
    'object',
    'oct',
    'open',
    'ord',
    'pow',
    'print',
    'property',
    'range',
    'repr',
    'reversed',
    'round',
    'set',
    'setattr',
    'slice',
    'sorted',
    'staticmethod',
    'str',
    'sum',
    'super',
    'tuple',
    'type',
    'vars',
    'zip'
  ];

  const LITERALS = [
    '__debug__',
    'Ellipsis',
    'False',
    'None',
    'NotImplemented',
    'True'
  ];

  // https://docs.python.org/3/library/typing.html
  // TODO: Could these be supplemented by a CamelCase matcher in certain
  // contexts, leaving these remaining only for relevance hinting?
  const TYPES = [
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

  const KEYWORDS = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: RESERVED_WORDS,
    built_in: BUILT_INS,
    literal: LITERALS,
    type: TYPES
  };

  const PROMPT = {
    className: 'meta',
    begin: /^(>>>|\.\.\.) /
  };

  const SUBST = {
    className: 'subst',
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS,
    illegal: /#/
  };

  const LITERAL_BRACKET = {
    begin: /\{\{/,
    relevance: 0
  };

  const STRING = {
    className: 'string',
    contains: [ hljs.BACKSLASH_ESCAPE ],
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

  // https://docs.python.org/3.9/reference/lexical_analysis.html#numeric-literals
  const digitpart = '[0-9](_?[0-9])*';
  const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
  // Whitespace after a number (or any lexical token) is needed only if its absence
  // would change the tokenization
  // https://docs.python.org/3.9/reference/lexical_analysis.html#whitespace-between-tokens
  // We deviate slightly, requiring a word boundary or a keyword
  // to avoid accidentally recognizing *prefixes* (e.g., `0` in `0x41` or `08` or `0__1`)
  const lookahead = `\\b|${RESERVED_WORDS.join('|')}`;
  const NUMBER = {
    className: 'number',
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
        begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?(?=${lookahead})`
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
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${lookahead})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${lookahead})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${lookahead})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${lookahead})`
      },

      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${digitpart})[jJ](?=${lookahead})`
      }
    ]
  };
  const COMMENT_TYPE = {
    className: "comment",
    begin: regex.lookahead(/# type:/),
    end: /$/,
    keywords: KEYWORDS,
    contains: [
      { // prevent keywords from coloring `type`
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
    className: 'params',
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
        keywords: KEYWORDS,
        contains: [
          'self',
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
    name: 'Python',
    aliases: [
      'py',
      'gyp',
      'ipython'
    ],
    unicodeRegex: true,
    keywords: KEYWORDS,
    illegal: /(<\/|\?)|=>/,
    contains: [
      PROMPT,
      NUMBER,
      {
        // very common convention
        scope: 'variable.language',
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
          /\bdef/, /\s+/,
          IDENT_RE,
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [ PARAMS ]
      },
      {
        variants: [
          {
            match: [
              /\bclass/, /\s+/,
              IDENT_RE, /\s*/,
              /\(\s*/, IDENT_RE,/\s*\)/
            ],
          },
          {
            match: [
              /\bclass/, /\s+/,
              IDENT_RE
            ],
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited",
        }
      },
      {
        className: 'meta',
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

/*
Language: R
Description: R is a free software environment for statistical computing and graphics.
Author: Joe Cheng <joe@rstudio.org>
Contributors: Konrad Rudolph <konrad.rudolph@gmail.com>
Website: https://www.r-project.org
Category: common,scientific
*/

/** @type LanguageFn */
function r(hljs) {
  const regex = hljs.regex;
  // Identifiers in R cannot start with `_`, but they can start with `.` if it
  // is not immediately followed by a digit.
  // R also supports quoted identifiers, which are near-arbitrary sequences
  // delimited by backticks (`…`), which may contain escape sequences. These are
  // handled in a separate mode. See `test/markup/r/names.txt` for examples.
  // FIXME: Support Unicode identifiers.
  const IDENT_RE = /(?:(?:[a-zA-Z]|\.[._a-zA-Z])[._a-zA-Z0-9]*)|\.(?!\d)/;
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
    name: 'R',

    keywords: {
      $pattern: IDENT_RE,
      keyword:
        'function if in break next repeat else for while',
      literal:
        'NULL NA TRUE FALSE Inf NaN NA_integer_|10 NA_real_|10 '
        + 'NA_character_|10 NA_complex_|10',
      built_in:
        // Builtin constants
        'LETTERS letters month.abb month.name pi T F '
        // Primitive functions
        // These are all the functions in `base` that are implemented as a
        // `.Primitive`, minus those functions that are also keywords.
        + 'abs acos acosh all any anyNA Arg as.call as.character '
        + 'as.complex as.double as.environment as.integer as.logical '
        + 'as.null.default as.numeric as.raw asin asinh atan atanh attr '
        + 'attributes baseenv browser c call ceiling class Conj cos cosh '
        + 'cospi cummax cummin cumprod cumsum digamma dim dimnames '
        + 'emptyenv exp expression floor forceAndCall gamma gc.time '
        + 'globalenv Im interactive invisible is.array is.atomic is.call '
        + 'is.character is.complex is.double is.environment is.expression '
        + 'is.finite is.function is.infinite is.integer is.language '
        + 'is.list is.logical is.matrix is.na is.name is.nan is.null '
        + 'is.numeric is.object is.pairlist is.raw is.recursive is.single '
        + 'is.symbol lazyLoadDBfetch length lgamma list log max min '
        + 'missing Mod names nargs nzchar oldClass on.exit pos.to.env '
        + 'proc.time prod quote range Re rep retracemem return round '
        + 'seq_along seq_len seq.int sign signif sin sinh sinpi sqrt '
        + 'standardGeneric substitute sum switch tan tanh tanpi tracemem '
        + 'trigamma trunc unclass untracemem UseMethod xtfrm',
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
            scope: 'doctag',
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
            scope: 'doctag',
            begin: '@param',
            end: /$/,
            contains: [
              {
                scope: 'variable',
                variants: [
                  { match: IDENT_RE },
                  { match: /`(?:\\.|[^`\\])+`/ }
                ],
                endsParent: true
              }
            ]
          },
          {
            scope: 'doctag',
            match: /@[a-zA-Z]+/
          },
          {
            scope: 'keyword',
            match: /\\[a-zA-Z]+/
          }
        ] }
      ),

      hljs.HASH_COMMENT_MODE,

      {
        scope: 'string',
        contains: [ hljs.BACKSLASH_ESCAPE ],
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
        ],
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
              1: 'operator',
              2: 'number'
            },
            match: [
              OPERATORS_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: 'operator',
              2: 'number'
            },
            match: [
              /%[^%]*%/,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: 'punctuation',
              2: 'number'
            },
            match: [
              PUNCTUATION_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: { 2: 'number' },
            match: [
              /[^a-zA-Z0-9._]|^/, // not part of an identifier, or start of document
              NUMBER_TYPES_RE
            ]
          }
        ]
      },

      // Operators/punctuation when they're not directly followed by numbers
      {
        // Relevance boost for the most common assignment form.
        scope: { 3: 'operator' },
        match: [
          IDENT_RE,
          /\s+/,
          /<-/,
          /\s+/
        ]
      },

      {
        scope: 'operator',
        relevance: 0,
        variants: [
          { match: OPERATORS_RE },
          { match: /%[^%]*%/ }
        ]
      },

      {
        scope: 'punctuation',
        relevance: 0,
        match: PUNCTUATION_RE
      },

      {
        // Escaped identifier
        begin: '`',
        end: '`',
        contains: [ { begin: /\\./ } ]
      }
    ]
  };
}

/*
Language: Ruby
Description: Ruby is a dynamic, open source programming language with a focus on simplicity and productivity.
Website: https://www.ruby-lang.org/
Author: Anton Kovalyov <anton@kovalyov.net>
Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>, Pascal Hurni <phi@ruby-reactive.org>, Cedric Sohrauer <sohrauer@googlemail.com>
Category: common, scripting
*/

function ruby(hljs) {
  const regex = hljs.regex;
  const RUBY_METHOD_RE = '([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)';
  // TODO: move concepts like CAMEL_CASE into `modes.js`
  const CLASS_NAME_RE = regex.either(
    /\b([A-Z]+[a-z0-9]+)+/,
    // ends in caps
    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/,
  )
  ;
  const CLASS_NAME_WITH_NAMESPACE_RE = regex.concat(CLASS_NAME_RE, /(::\w+)*/);
  // very popular ruby built-ins that one might even assume
  // are actual keywords (despite that not being the case)
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
      "super",
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
    className: 'doctag',
    begin: '@[A-Za-z]+'
  };
  const IRB_OBJECT = {
    begin: '#<',
    end: '>'
  };
  const COMMENT_MODES = [
    hljs.COMMENT(
      '#',
      '$',
      { contains: [ YARDOCTAG ] }
    ),
    hljs.COMMENT(
      '^=begin',
      '^=end',
      {
        contains: [ YARDOCTAG ],
        relevance: 10
      }
    ),
    hljs.COMMENT('^__END__', hljs.MATCH_NOTHING_RE)
  ];
  const SUBST = {
    className: 'subst',
    begin: /#\{/,
    end: /\}/,
    keywords: RUBY_KEYWORDS
  };
  const STRING = {
    className: 'string',
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

  // Ruby syntax is underdocumented, but this grammar seems to be accurate
  // as of version 2.7.2 (confirmed with (irb and `Ripper.sexp(...)`)
  // https://docs.ruby-lang.org/en/2.7.0/doc/syntax/literals_rdoc.html#label-Numbers
  const decimal = '[1-9](_?[0-9])*|0';
  const digits = '[0-9](_?[0-9])*';
  const NUMBER = {
    className: 'number',
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
        match: /\(\)/,
      },
      {
        className: 'params',
        begin: /\(/,
        end: /(?=\))/,
        excludeBegin: true,
        endsParent: true,
        keywords: RUBY_KEYWORDS,
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
      /def/, /\s+/,
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

  // CamelCase
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
      begin: hljs.IDENT_RE + '::' },
    {
      className: 'symbol',
      begin: hljs.UNDERSCORE_IDENT_RE + '(!|\\?)?:',
      relevance: 0
    },
    {
      className: 'symbol',
      begin: ':(?!\\s)',
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
      begin: '(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])' + `(?![A-Za-z])(?![@$?'])`
    },
    {
      className: 'params',
      begin: /\|(?!=)/,
      end: /\|/,
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0, // this could be a lot of things (in other languages) other than params
      keywords: RUBY_KEYWORDS
    },
    { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + '|unless)\\s*',
      keywords: 'unless',
      contains: [
        {
          className: 'regexp',
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          illegal: /\n/,
          variants: [
            {
              begin: '/',
              end: '/[a-z]*'
            },
            {
              begin: /%r\{/,
              end: /\}[a-z]*/
            },
            {
              begin: '%r\\(',
              end: '\\)[a-z]*'
            },
            {
              begin: '%r!',
              end: '![a-z]*'
            },
            {
              begin: '%r\\[',
              end: '\\][a-z]*'
            }
          ]
        }
      ].concat(IRB_OBJECT, COMMENT_MODES),
      relevance: 0
    }
  ].concat(IRB_OBJECT, COMMENT_MODES);

  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  PARAMS.contains = RUBY_DEFAULT_CONTAINS;

  // >>
  // ?>
  const SIMPLE_PROMPT = "[>?]>";
  // irb(main):001:0>
  const DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]";
  const RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>";

  const IRB_DEFAULT = [
    {
      begin: /^\s*=>/,
      starts: {
        end: '$',
        contains: RUBY_DEFAULT_CONTAINS
      }
    },
    {
      className: 'meta.prompt',
      begin: '^(' + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + '|' + RVM_PROMPT + ')(?=[ ])',
      starts: {
        end: '$',
        keywords: RUBY_KEYWORDS,
        contains: RUBY_DEFAULT_CONTAINS
      }
    }
  ];

  COMMENT_MODES.unshift(IRB_OBJECT);

  return {
    name: 'Ruby',
    aliases: [
      'rb',
      'gemspec',
      'podspec',
      'thor',
      'irb'
    ],
    keywords: RUBY_KEYWORDS,
    illegal: /\/\*/,
    contains: [ hljs.SHEBANG({ binary: "ruby" }) ]
      .concat(IRB_DEFAULT)
      .concat(COMMENT_MODES)
      .concat(RUBY_DEFAULT_CONTAINS)
  };
}

/*
Language: Rust
Author: Andrey Vlasovskikh <andrey.vlasovskikh@gmail.com>
Contributors: Roman Shmatov <romanshmatov@gmail.com>, Kasper Andersen <kma_untrusted@protonmail.com>
Website: https://www.rust-lang.org
Category: common, system
*/

/** @type LanguageFn */

function rust(hljs) {
  const regex = hljs.regex;
  // ============================================
  // Added to support the r# keyword, which is a raw identifier in Rust.
  const RAW_IDENTIFIER = /(r#)?/;
  const UNDERSCORE_IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.UNDERSCORE_IDENT_RE);
  const IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.IDENT_RE);
  // ============================================
  const FUNCTION_INVOKE = {
    className: "title.function.invoke",
    relevance: 0,
    begin: regex.concat(
      /\b/,
      /(?!let|for|while|if|else|match\b)/,
      IDENT_RE,
      regex.lookahead(/\s*\(/))
  };
  const NUMBER_SUFFIX = '([ui](8|16|32|64|128|size)|f(32|64))\?';
  const KEYWORDS = [
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
  const LITERALS = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ];
  const BUILTINS = [
    // functions
    'drop ',
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
  const TYPES = [
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
    name: 'Rust',
    aliases: [ 'rs' ],
    keywords: {
      $pattern: hljs.IDENT_RE + '!?',
      type: TYPES,
      keyword: KEYWORDS,
      literal: LITERALS,
      built_in: BUILTINS
    },
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.COMMENT('/\\*', '\\*/', { contains: [ 'self' ] }),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null
      }),
      {
        className: 'symbol',
        // negative lookahead to avoid matching `'`
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*(?!')/
      },
      {
        scope: 'string',
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
        className: 'number',
        variants: [
          { begin: '\\b0b([01_]+)' + NUMBER_SUFFIX },
          { begin: '\\b0o([0-7_]+)' + NUMBER_SUFFIX },
          { begin: '\\b0x([A-Fa-f0-9_]+)' + NUMBER_SUFFIX },
          { begin: '\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)'
                   + NUMBER_SUFFIX }
        ],
        relevance: 0
      },
      {
        begin: [
          /fn/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.function"
        }
      },
      {
        className: 'meta',
        begin: '#!?\\[',
        end: '\\]',
        contains: [
          {
            className: 'string',
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
          UNDERSCORE_IDENT_RE
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
          UNDERSCORE_IDENT_RE,
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
          UNDERSCORE_IDENT_RE
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
          UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: hljs.IDENT_RE + '::',
        keywords: {
          keyword: "Self",
          built_in: BUILTINS,
          type: TYPES
        }
      },
      {
        className: "punctuation",
        begin: '->'
      },
      FUNCTION_INVOKE
    ]
  };
}

const MODES = (hljs) => {
  return {
    IMPORTANT: {
      scope: 'meta',
      begin: '!important'
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: 'number',
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: 'selector-attr',
      begin: /\[/,
      end: /\]/,
      illegal: '$',
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: 'number',
      begin: hljs.NUMBER_RE + '(' +
        '%|em|ex|ch|rem' +
        '|vw|vh|vmin|vmax' +
        '|cm|mm|in|pt|pc|px' +
        '|deg|grad|rad|turn' +
        '|s|ms' +
        '|Hz|kHz' +
        '|dpi|dpcm|dppx' +
        ')?',
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};

const HTML_TAGS = [
  'a',
  'abbr',
  'address',
  'article',
  'aside',
  'audio',
  'b',
  'blockquote',
  'body',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'dd',
  'del',
  'details',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'mark',
  'menu',
  'nav',
  'object',
  'ol',
  'optgroup',
  'option',
  'p',
  'picture',
  'q',
  'quote',
  'samp',
  'section',
  'select',
  'source',
  'span',
  'strong',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'ul',
  'var',
  'video'
];

const SVG_TAGS = [
  'defs',
  'g',
  'marker',
  'mask',
  'pattern',
  'svg',
  'switch',
  'symbol',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feFlood',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMorphology',
  'feOffset',
  'feSpecularLighting',
  'feTile',
  'feTurbulence',
  'linearGradient',
  'radialGradient',
  'stop',
  'circle',
  'ellipse',
  'image',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
  'use',
  'textPath',
  'tspan',
  'foreignObject',
  'clipPath'
];

const TAGS = [
  ...HTML_TAGS,
  ...SVG_TAGS,
];

// Sorting, then reversing makes sure longer attributes/elements like
// `font-weight` are matched fully instead of getting false positives on say `font`

const MEDIA_FEATURES = [
  'any-hover',
  'any-pointer',
  'aspect-ratio',
  'color',
  'color-gamut',
  'color-index',
  'device-aspect-ratio',
  'device-height',
  'device-width',
  'display-mode',
  'forced-colors',
  'grid',
  'height',
  'hover',
  'inverted-colors',
  'monochrome',
  'orientation',
  'overflow-block',
  'overflow-inline',
  'pointer',
  'prefers-color-scheme',
  'prefers-contrast',
  'prefers-reduced-motion',
  'prefers-reduced-transparency',
  'resolution',
  'scan',
  'scripting',
  'update',
  'width',
  // TODO: find a better solution?
  'min-width',
  'max-width',
  'min-height',
  'max-height'
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
const PSEUDO_CLASSES = [
  'active',
  'any-link',
  'blank',
  'checked',
  'current',
  'default',
  'defined',
  'dir', // dir()
  'disabled',
  'drop',
  'empty',
  'enabled',
  'first',
  'first-child',
  'first-of-type',
  'fullscreen',
  'future',
  'focus',
  'focus-visible',
  'focus-within',
  'has', // has()
  'host', // host or host()
  'host-context', // host-context()
  'hover',
  'indeterminate',
  'in-range',
  'invalid',
  'is', // is()
  'lang', // lang()
  'last-child',
  'last-of-type',
  'left',
  'link',
  'local-link',
  'not', // not()
  'nth-child', // nth-child()
  'nth-col', // nth-col()
  'nth-last-child', // nth-last-child()
  'nth-last-col', // nth-last-col()
  'nth-last-of-type', //nth-last-of-type()
  'nth-of-type', //nth-of-type()
  'only-child',
  'only-of-type',
  'optional',
  'out-of-range',
  'past',
  'placeholder-shown',
  'read-only',
  'read-write',
  'required',
  'right',
  'root',
  'scope',
  'target',
  'target-within',
  'user-invalid',
  'valid',
  'visited',
  'where' // where()
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
const PSEUDO_ELEMENTS = [
  'after',
  'backdrop',
  'before',
  'cue',
  'cue-region',
  'first-letter',
  'first-line',
  'grammar-error',
  'marker',
  'part',
  'placeholder',
  'selection',
  'slotted',
  'spelling-error'
].sort().reverse();

const ATTRIBUTES = [
  'accent-color',
  'align-content',
  'align-items',
  'align-self',
  'alignment-baseline',
  'all',
  'anchor-name',
  'animation',
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-range',
  'animation-range-end',
  'animation-range-start',
  'animation-timeline',
  'animation-timing-function',
  'appearance',
  'aspect-ratio',
  'backdrop-filter',
  'backface-visibility',
  'background',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-position-x',
  'background-position-y',
  'background-repeat',
  'background-size',
  'baseline-shift',
  'block-size',
  'border',
  'border-block',
  'border-block-color',
  'border-block-end',
  'border-block-end-color',
  'border-block-end-style',
  'border-block-end-width',
  'border-block-start',
  'border-block-start-color',
  'border-block-start-style',
  'border-block-start-width',
  'border-block-style',
  'border-block-width',
  'border-bottom',
  'border-bottom-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-style',
  'border-bottom-width',
  'border-collapse',
  'border-color',
  'border-end-end-radius',
  'border-end-start-radius',
  'border-image',
  'border-image-outset',
  'border-image-repeat',
  'border-image-slice',
  'border-image-source',
  'border-image-width',
  'border-inline',
  'border-inline-color',
  'border-inline-end',
  'border-inline-end-color',
  'border-inline-end-style',
  'border-inline-end-width',
  'border-inline-start',
  'border-inline-start-color',
  'border-inline-start-style',
  'border-inline-start-width',
  'border-inline-style',
  'border-inline-width',
  'border-left',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-radius',
  'border-right',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-spacing',
  'border-start-end-radius',
  'border-start-start-radius',
  'border-style',
  'border-top',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'border-width',
  'bottom',
  'box-align',
  'box-decoration-break',
  'box-direction',
  'box-flex',
  'box-flex-group',
  'box-lines',
  'box-ordinal-group',
  'box-orient',
  'box-pack',
  'box-shadow',
  'box-sizing',
  'break-after',
  'break-before',
  'break-inside',
  'caption-side',
  'caret-color',
  'clear',
  'clip',
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-profile',
  'color-rendering',
  'color-scheme',
  'column-count',
  'column-fill',
  'column-gap',
  'column-rule',
  'column-rule-color',
  'column-rule-style',
  'column-rule-width',
  'column-span',
  'column-width',
  'columns',
  'contain',
  'contain-intrinsic-block-size',
  'contain-intrinsic-height',
  'contain-intrinsic-inline-size',
  'contain-intrinsic-size',
  'contain-intrinsic-width',
  'container',
  'container-name',
  'container-type',
  'content',
  'content-visibility',
  'counter-increment',
  'counter-reset',
  'counter-set',
  'cue',
  'cue-after',
  'cue-before',
  'cursor',
  'cx',
  'cy',
  'direction',
  'display',
  'dominant-baseline',
  'empty-cells',
  'enable-background',
  'field-sizing',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'float',
  'flood-color',
  'flood-opacity',
  'flow',
  'font',
  'font-display',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-optical-sizing',
  'font-palette',
  'font-size',
  'font-size-adjust',
  'font-smooth',
  'font-smoothing',
  'font-stretch',
  'font-style',
  'font-synthesis',
  'font-synthesis-position',
  'font-synthesis-small-caps',
  'font-synthesis-style',
  'font-synthesis-weight',
  'font-variant',
  'font-variant-alternates',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-emoji',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-variation-settings',
  'font-weight',
  'forced-color-adjust',
  'gap',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-gap',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'hanging-punctuation',
  'height',
  'hyphenate-character',
  'hyphenate-limit-chars',
  'hyphens',
  'icon',
  'image-orientation',
  'image-rendering',
  'image-resolution',
  'ime-mode',
  'initial-letter',
  'initial-letter-align',
  'inline-size',
  'inset',
  'inset-area',
  'inset-block',
  'inset-block-end',
  'inset-block-start',
  'inset-inline',
  'inset-inline-end',
  'inset-inline-start',
  'isolation',
  'justify-content',
  'justify-items',
  'justify-self',
  'kerning',
  'left',
  'letter-spacing',
  'lighting-color',
  'line-break',
  'line-height',
  'line-height-step',
  'list-style',
  'list-style-image',
  'list-style-position',
  'list-style-type',
  'margin',
  'margin-block',
  'margin-block-end',
  'margin-block-start',
  'margin-bottom',
  'margin-inline',
  'margin-inline-end',
  'margin-inline-start',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-trim',
  'marker',
  'marker-end',
  'marker-mid',
  'marker-start',
  'marks',
  'mask',
  'mask-border',
  'mask-border-mode',
  'mask-border-outset',
  'mask-border-repeat',
  'mask-border-slice',
  'mask-border-source',
  'mask-border-width',
  'mask-clip',
  'mask-composite',
  'mask-image',
  'mask-mode',
  'mask-origin',
  'mask-position',
  'mask-repeat',
  'mask-size',
  'mask-type',
  'masonry-auto-flow',
  'math-depth',
  'math-shift',
  'math-style',
  'max-block-size',
  'max-height',
  'max-inline-size',
  'max-width',
  'min-block-size',
  'min-height',
  'min-inline-size',
  'min-width',
  'mix-blend-mode',
  'nav-down',
  'nav-index',
  'nav-left',
  'nav-right',
  'nav-up',
  'none',
  'normal',
  'object-fit',
  'object-position',
  'offset',
  'offset-anchor',
  'offset-distance',
  'offset-path',
  'offset-position',
  'offset-rotate',
  'opacity',
  'order',
  'orphans',
  'outline',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  'overflow',
  'overflow-anchor',
  'overflow-block',
  'overflow-clip-margin',
  'overflow-inline',
  'overflow-wrap',
  'overflow-x',
  'overflow-y',
  'overlay',
  'overscroll-behavior',
  'overscroll-behavior-block',
  'overscroll-behavior-inline',
  'overscroll-behavior-x',
  'overscroll-behavior-y',
  'padding',
  'padding-block',
  'padding-block-end',
  'padding-block-start',
  'padding-bottom',
  'padding-inline',
  'padding-inline-end',
  'padding-inline-start',
  'padding-left',
  'padding-right',
  'padding-top',
  'page',
  'page-break-after',
  'page-break-before',
  'page-break-inside',
  'paint-order',
  'pause',
  'pause-after',
  'pause-before',
  'perspective',
  'perspective-origin',
  'place-content',
  'place-items',
  'place-self',
  'pointer-events',
  'position',
  'position-anchor',
  'position-visibility',
  'print-color-adjust',
  'quotes',
  'r',
  'resize',
  'rest',
  'rest-after',
  'rest-before',
  'right',
  'rotate',
  'row-gap',
  'ruby-align',
  'ruby-position',
  'scale',
  'scroll-behavior',
  'scroll-margin',
  'scroll-margin-block',
  'scroll-margin-block-end',
  'scroll-margin-block-start',
  'scroll-margin-bottom',
  'scroll-margin-inline',
  'scroll-margin-inline-end',
  'scroll-margin-inline-start',
  'scroll-margin-left',
  'scroll-margin-right',
  'scroll-margin-top',
  'scroll-padding',
  'scroll-padding-block',
  'scroll-padding-block-end',
  'scroll-padding-block-start',
  'scroll-padding-bottom',
  'scroll-padding-inline',
  'scroll-padding-inline-end',
  'scroll-padding-inline-start',
  'scroll-padding-left',
  'scroll-padding-right',
  'scroll-padding-top',
  'scroll-snap-align',
  'scroll-snap-stop',
  'scroll-snap-type',
  'scroll-timeline',
  'scroll-timeline-axis',
  'scroll-timeline-name',
  'scrollbar-color',
  'scrollbar-gutter',
  'scrollbar-width',
  'shape-image-threshold',
  'shape-margin',
  'shape-outside',
  'shape-rendering',
  'speak',
  'speak-as',
  'src', // @font-face
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'tab-size',
  'table-layout',
  'text-align',
  'text-align-all',
  'text-align-last',
  'text-anchor',
  'text-combine-upright',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-skip',
  'text-decoration-skip-ink',
  'text-decoration-style',
  'text-decoration-thickness',
  'text-emphasis',
  'text-emphasis-color',
  'text-emphasis-position',
  'text-emphasis-style',
  'text-indent',
  'text-justify',
  'text-orientation',
  'text-overflow',
  'text-rendering',
  'text-shadow',
  'text-size-adjust',
  'text-transform',
  'text-underline-offset',
  'text-underline-position',
  'text-wrap',
  'text-wrap-mode',
  'text-wrap-style',
  'timeline-scope',
  'top',
  'touch-action',
  'transform',
  'transform-box',
  'transform-origin',
  'transform-style',
  'transition',
  'transition-behavior',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'translate',
  'unicode-bidi',
  'user-modify',
  'user-select',
  'vector-effect',
  'vertical-align',
  'view-timeline',
  'view-timeline-axis',
  'view-timeline-inset',
  'view-timeline-name',
  'view-transition-name',
  'visibility',
  'voice-balance',
  'voice-duration',
  'voice-family',
  'voice-pitch',
  'voice-range',
  'voice-rate',
  'voice-stress',
  'voice-volume',
  'white-space',
  'white-space-collapse',
  'widows',
  'width',
  'will-change',
  'word-break',
  'word-spacing',
  'word-wrap',
  'writing-mode',
  'x',
  'y',
  'z-index',
  'zoom'
].sort().reverse();

/*
Language: SCSS
Description: Scss is an extension of the syntax of CSS.
Author: Kurt Emch <kurt@kurtemch.com>
Website: https://sass-lang.com
Category: common, css, web
*/


/** @type LanguageFn */
function scss(hljs) {
  const modes = MODES(hljs);
  const PSEUDO_ELEMENTS$1 = PSEUDO_ELEMENTS;
  const PSEUDO_CLASSES$1 = PSEUDO_CLASSES;

  const AT_IDENTIFIER = '@[a-z-]+'; // @font-face
  const AT_MODIFIERS = "and or not only";
  const IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  const VARIABLE = {
    className: 'variable',
    begin: '(\\$' + IDENT_RE + ')\\b',
    relevance: 0
  };

  return {
    name: 'SCSS',
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: 'selector-id',
        begin: '#[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'selector-class',
        begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: 'selector-tag',
        begin: '\\b(' + TAGS.join('|') + ')\\b',
        // was there, before, but why?
        relevance: 0
      },
      {
        className: 'selector-pseudo',
        begin: ':(' + PSEUDO_CLASSES$1.join('|') + ')'
      },
      {
        className: 'selector-pseudo',
        begin: ':(:)?(' + PSEUDO_ELEMENTS$1.join('|') + ')'
      },
      VARIABLE,
      { // pseudo-selector params
        begin: /\(/,
        end: /\)/,
        contains: [ modes.CSS_NUMBER_MODE ]
      },
      modes.CSS_VARIABLE,
      {
        className: 'attribute',
        begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b'
      },
      { begin: '\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b' },
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
        begin: '@(page|font-face)',
        keywords: {
          $pattern: AT_IDENTIFIER,
          keyword: '@page @font-face'
        }
      },
      {
        begin: '@',
        end: '[{;]',
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

/*
Language: Shell Session
Requires: bash.js
Author: TSUYUSATO Kitsune <make.just.on@gmail.com>
Category: common
Audit: 2020
*/

/** @type LanguageFn */
function shell(hljs) {
  return {
    name: 'Shell Session',
    aliases: [
      'console',
      'shellsession'
    ],
    contains: [
      {
        className: 'meta.prompt',
        // We cannot add \s (spaces) in the regular expression otherwise it will be too broad and produce unexpected result.
        // For instance, in the following example, it would match "echo /path/to/home >" as a prompt:
        // echo /path/to/home > t.exe
        begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
        starts: {
          end: /[^\\](?=\s*$)/,
          subLanguage: 'bash'
        }
      }
    ]
  };
}

/*
 Language: SQL
 Website: https://en.wikipedia.org/wiki/SQL
 Category: common, database
 */

/*

Goals:

SQL is intended to highlight basic/common SQL keywords and expressions

- If pretty much every single SQL server includes supports, then it's a canidate.
- It is NOT intended to include tons of vendor specific keywords (Oracle, MySQL,
  PostgreSQL) although the list of data types is purposely a bit more expansive.
- For more specific SQL grammars please see:
  - PostgreSQL and PL/pgSQL - core
  - T-SQL - https://github.com/highlightjs/highlightjs-tsql
  - sql_more (core)

 */

function sql(hljs) {
  const regex = hljs.regex;
  const COMMENT_MODE = hljs.COMMENT('--', '$');
  const STRING = {
    scope: 'string',
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [ { match: /''/ } ]
      }
    ]
  };
  const QUOTED_IDENTIFIER = {
    begin: /"/,
    end: /"/,
    contains: [ { match: /""/ } ]
  };

  const LITERALS = [
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

  const TYPES = [
    'bigint',
    'binary',
    'blob',
    'boolean',
    'char',
    'character',
    'clob',
    'date',
    'dec',
    'decfloat',
    'decimal',
    'float',
    'int',
    'integer',
    'interval',
    'nchar',
    'nclob',
    'national',
    'numeric',
    'real',
    'row',
    'smallint',
    'time',
    'timestamp',
    'varchar',
    'varying', // modifier (character varying)
    'varbinary'
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

  // https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html#reserved-word
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
    "global",
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
    "year",
  ];

  // these are reserved words we have identified to be functions
  // and should only be highlighted in a dispatch-like context
  // ie, array_agg(...), etc.
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
    "width_bucket",
  ];

  // these functions can
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

  // those exist to boost relevance making these very
  // "SQL like" keyword combos worth +1 extra relevance
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

  const KEYWORDS = [
    ...RESERVED_WORDS,
    ...NON_RESERVED_WORDS
  ].filter((keyword) => {
    return !RESERVED_FUNCTIONS.includes(keyword);
  });

  const VARIABLE = {
    scope: "variable",
    match: /@[a-z0-9][a-z0-9_]*/,
  };

  const OPERATOR = {
    scope: "operator",
    match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0,
  };

  const FUNCTION_CALL = {
    match: regex.concat(/\b/, regex.either(...FUNCTIONS), /\s*\(/),
    relevance: 0,
    keywords: { built_in: FUNCTIONS }
  };

  // turns a multi-word keyword combo into a regex that doesn't
  // care about extra whitespace etc.
  // input: "START QUERY"
  // output: /\bSTART\s+QUERY\b/
  function kws_to_regex(list) {
    return regex.concat(
      /\b/,
      regex.either(...list.map((kw) => {
        return kw.replace(/\s+/, "\\s+")
      })),
      /\b/
    )
  }

  const MULTI_WORD_KEYWORDS = {
    scope: "keyword",
    match: kws_to_regex(COMBOS),
    relevance: 0,
  };

  // keywords with less than 3 letters are reduced in relevancy
  function reduceRelevancy(list, {
    exceptions, when
  } = {}) {
    const qualifyFn = when;
    exceptions = exceptions || [];
    return list.map((item) => {
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
    name: 'SQL',
    case_insensitive: true,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword:
        reduceRelevancy(KEYWORDS, { when: (x) => x.length < 3 }),
      literal: LITERALS,
      type: TYPES,
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

/**
 * @param {string} value
 * @returns {RegExp}
 * */

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function source(re) {
  if (!re) return null;
  if (typeof re === "string") return re;

  return re.source;
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function lookahead(re) {
  return concat('(?=', re, ')');
}

/**
 * @param {...(RegExp | string) } args
 * @returns {string}
 */
function concat(...args) {
  const joined = args.map((x) => source(x)).join("");
  return joined;
}

/**
 * @param { Array<string | RegExp | Object> } args
 * @returns {object}
 */
function stripOptionsFromArgs(args) {
  const opts = args[args.length - 1];

  if (typeof opts === 'object' && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}

/** @typedef { {capture?: boolean} } RegexEitherOptions */

/**
 * Any of the passed expresssions may match
 *
 * Creates a huge this | this | that | that match
 * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
 * @returns {string}
 */
function either(...args) {
  /** @type { object & {capture?: boolean} }  */
  const opts = stripOptionsFromArgs(args);
  const joined = '('
    + (opts.capture ? "" : "?:")
    + args.map((x) => source(x)).join("|") + ")";
  return joined;
}

const keywordWrapper = keyword => concat(
  /\b/,
  keyword,
  /\w$/.test(keyword) ? /\b/ : /\B/
);

// Keywords that require a leading dot.
const dotKeywords = [
  'Protocol', // contextual
  'Type' // contextual
].map(keywordWrapper);

// Keywords that may have a leading dot.
const optionalDotKeywords = [
  'init',
  'self'
].map(keywordWrapper);

// should register as keyword, not type
const keywordTypes = [
  'Any',
  'Self'
];

// Regular keywords and literals.
const keywords = [
  // strings below will be fed into the regular `keywords` engine while regex
  // will result in additional modes being created to scan for those keywords to
  // avoid conflicts with other rules
  'actor',
  'any', // contextual
  'associatedtype',
  'async',
  'await',
  /as\?/, // operator
  /as!/, // operator
  'as', // operator
  'borrowing', // contextual
  'break',
  'case',
  'catch',
  'class',
  'consume', // contextual
  'consuming', // contextual
  'continue',
  'convenience', // contextual
  'copy', // contextual
  'default',
  'defer',
  'deinit',
  'didSet', // contextual
  'distributed',
  'do',
  'dynamic', // contextual
  'each',
  'else',
  'enum',
  'extension',
  'fallthrough',
  /fileprivate\(set\)/,
  'fileprivate',
  'final', // contextual
  'for',
  'func',
  'get', // contextual
  'guard',
  'if',
  'import',
  'indirect', // contextual
  'infix', // contextual
  /init\?/,
  /init!/,
  'inout',
  /internal\(set\)/,
  'internal',
  'in',
  'is', // operator
  'isolated', // contextual
  'nonisolated', // contextual
  'lazy', // contextual
  'let',
  'macro',
  'mutating', // contextual
  'nonmutating', // contextual
  /open\(set\)/, // contextual
  'open', // contextual
  'operator',
  'optional', // contextual
  'override', // contextual
  'package',
  'postfix', // contextual
  'precedencegroup',
  'prefix', // contextual
  /private\(set\)/,
  'private',
  'protocol',
  /public\(set\)/,
  'public',
  'repeat',
  'required', // contextual
  'rethrows',
  'return',
  'set', // contextual
  'some', // contextual
  'static',
  'struct',
  'subscript',
  'super',
  'switch',
  'throws',
  'throw',
  /try\?/, // operator
  /try!/, // operator
  'try', // operator
  'typealias',
  /unowned\(safe\)/, // contextual
  /unowned\(unsafe\)/, // contextual
  'unowned', // contextual
  'var',
  'weak', // contextual
  'where',
  'while',
  'willSet' // contextual
];

// NOTE: Contextual keywords are reserved only in specific contexts.
// Ideally, these should be matched using modes to avoid false positives.

// Literals.
const literals = [
  'false',
  'nil',
  'true'
];

// Keywords used in precedence groups.
const precedencegroupKeywords = [
  'assignment',
  'associativity',
  'higherThan',
  'left',
  'lowerThan',
  'none',
  'right'
];

// Keywords that start with a number sign (#).
// #(un)available is handled separately.
const numberSignKeywords = [
  '#colorLiteral',
  '#column',
  '#dsohandle',
  '#else',
  '#elseif',
  '#endif',
  '#error',
  '#file',
  '#fileID',
  '#fileLiteral',
  '#filePath',
  '#function',
  '#if',
  '#imageLiteral',
  '#keyPath',
  '#line',
  '#selector',
  '#sourceLocation',
  '#warning'
];

// Global functions in the Standard Library.
const builtIns = [
  'abs',
  'all',
  'any',
  'assert',
  'assertionFailure',
  'debugPrint',
  'dump',
  'fatalError',
  'getVaList',
  'isKnownUniquelyReferenced',
  'max',
  'min',
  'numericCast',
  'pointwiseMax',
  'pointwiseMin',
  'precondition',
  'preconditionFailure',
  'print',
  'readLine',
  'repeatElement',
  'sequence',
  'stride',
  'swap',
  'swift_unboxFromSwiftValueWithType',
  'transcode',
  'type',
  'unsafeBitCast',
  'unsafeDowncast',
  'withExtendedLifetime',
  'withUnsafeMutablePointer',
  'withUnsafePointer',
  'withVaList',
  'withoutActuallyEscaping',
  'zip'
];

// Valid first characters for operators.
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

// Valid characters for operators.
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

// Valid operator.
const operator = concat(operatorHead, operatorCharacter, '*');

// Valid first characters for identifiers.
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
  /[\uFE47-\uFEFE\uFF00-\uFFFD]/ // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
  // The following characters are also allowed, but the regexes aren't supported yet.
  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
);

// Valid characters for identifiers.
const identifierCharacter = either(
  identifierHead,
  /\d/,
  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
);

// Valid identifier.
const identifier = concat(identifierHead, identifierCharacter, '*');

// Valid type identifier.
const typeIdentifier = concat(/[A-Z]/, identifierCharacter, '*');

// Built-in attributes, which are highlighted as keywords.
// @available is handled separately.
// https://docs.swift.org/swift-book/documentation/the-swift-programming-language/attributes
const keywordAttributes = [
  'attached',
  'autoclosure',
  concat(/convention\(/, either('swift', 'block', 'c'), /\)/),
  'discardableResult',
  'dynamicCallable',
  'dynamicMemberLookup',
  'escaping',
  'freestanding',
  'frozen',
  'GKInspectable',
  'IBAction',
  'IBDesignable',
  'IBInspectable',
  'IBOutlet',
  'IBSegueAction',
  'inlinable',
  'main',
  'nonobjc',
  'NSApplicationMain',
  'NSCopying',
  'NSManaged',
  concat(/objc\(/, identifier, /\)/),
  'objc',
  'objcMembers',
  'propertyWrapper',
  'requires_stored_property_inits',
  'resultBuilder',
  'Sendable',
  'testable',
  'UIApplicationMain',
  'unchecked',
  'unknown',
  'usableFromInline',
  'warn_unqualified_access'
];

// Contextual keywords used in @available and #(un)available.
const availabilityKeywords = [
  'iOS',
  'iOSApplicationExtension',
  'macOS',
  'macOSApplicationExtension',
  'macCatalyst',
  'macCatalystApplicationExtension',
  'watchOS',
  'watchOSApplicationExtension',
  'tvOS',
  'tvOSApplicationExtension',
  'swift'
];

/*
Language: Swift
Description: Swift is a general-purpose programming language built using a modern approach to safety, performance, and software design patterns.
Author: Steven Van Impe <steven.vanimpe@icloud.com>
Contributors: Chris Eidhof <chris@eidhof.nl>, Nate Cook <natecook@gmail.com>, Alexander Lichter <manniL@gmx.net>, Richard Gibson <gibson042@github>
Website: https://swift.org
Category: common, system
*/


/** @type LanguageFn */
function swift(hljs) {
  const WHITESPACE = {
    match: /\s+/,
    relevance: 0
  };
  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID411
  const BLOCK_COMMENT = hljs.COMMENT(
    '/\\*',
    '\\*/',
    { contains: [ 'self' ] }
  );
  const COMMENTS = [
    hljs.C_LINE_COMMENT_MODE,
    BLOCK_COMMENT
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID413
  // https://docs.swift.org/swift-book/ReferenceManual/zzSummaryOfTheGrammar.html
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
  const PLAIN_KEYWORDS = keywords
    .filter(kw => typeof kw === 'string')
    .concat([ "_|0" ]); // seems common, so 0 relevance
  const REGEX_KEYWORDS = keywords
    .filter(kw => typeof kw !== 'string') // find regex
    .concat(keywordTypes)
    .map(keywordWrapper);
  const KEYWORD = { variants: [
    {
      className: 'keyword',
      match: either(...REGEX_KEYWORDS, ...optionalDotKeywords)
    }
  ] };
  // find all the regular keywords
  const KEYWORDS = {
    $pattern: either(
      /\b\w+/, // regular keywords
      /#\w+/ // number keywords
    ),
    keyword: PLAIN_KEYWORDS
      .concat(numberSignKeywords),
    literal: literals
  };
  const KEYWORD_MODES = [
    DOT_KEYWORD,
    KEYWORD_GUARD,
    KEYWORD
  ];

  // https://github.com/apple/swift/tree/main/stdlib/public/core
  const BUILT_IN_GUARD = {
    // Consume .built_in to prevent highlighting properties and methods.
    match: concat(/\./, either(...builtIns)),
    relevance: 0
  };
  const BUILT_IN = {
    className: 'built_in',
    match: concat(/\b/, either(...builtIns), /(?=\()/)
  };
  const BUILT_INS = [
    BUILT_IN_GUARD,
    BUILT_IN
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID418
  const OPERATOR_GUARD = {
    // Prevent -> from being highlighting as an operator.
    match: /->/,
    relevance: 0
  };
  const OPERATOR = {
    className: 'operator',
    relevance: 0,
    variants: [
      { match: operator },
      {
        // dot-operator: only operators that start with a dot are allowed to use dots as
        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
        // characters that may also include dots.
        match: `\\.(\\.|${operatorCharacter})+` }
    ]
  };
  const OPERATORS = [
    OPERATOR_GUARD,
    OPERATOR
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#grammar_numeric-literal
  // TODO: Update for leading `-` after lookbehind is supported everywhere
  const decimalDigits = '([0-9]_*)+';
  const hexDigits = '([0-9a-fA-F]_*)+';
  const NUMBER = {
    className: 'number',
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${decimalDigits})(\\.(${decimalDigits}))?` + `([eE][+-]?(${decimalDigits}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0x(${hexDigits})(\\.(${hexDigits}))?` + `([pP][+-]?(${decimalDigits}))?\\b` },
      // octal-literal
      { match: /\b0o([0-7]_*)+\b/ },
      // binary-literal
      { match: /\b0b([01]_*)+\b/ }
    ]
  };

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#grammar_string-literal
  const ESCAPED_CHARACTER = (rawDelimiter = "") => ({
    className: 'subst',
    variants: [
      { match: concat(/\\/, rawDelimiter, /[0\\tnr"']/) },
      { match: concat(/\\/, rawDelimiter, /u\{[0-9a-fA-F]{1,8}\}/) }
    ]
  });
  const ESCAPED_NEWLINE = (rawDelimiter = "") => ({
    className: 'subst',
    match: concat(/\\/, rawDelimiter, /[\t ]*(?:[\r\n]|\r\n)/)
  });
  const INTERPOLATION = (rawDelimiter = "") => ({
    className: 'subst',
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
    className: 'string',
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
      contains: [ hljs.BACKSLASH_ESCAPE ]
    }
  ];

  const BARE_REGEXP_LITERAL = {
    begin: /\/[^\s](?=[^/\n]*\/)/,
    end: /\//,
    contains: REGEXP_CONTENTS
  };

  const EXTENDED_REGEXP_LITERAL = (rawDelimiter) => {
    const begin = concat(rawDelimiter, /\//);
    const end = concat(/\//, rawDelimiter);
    return {
      begin,
      end,
      contains: [
        ...REGEXP_CONTENTS,
        {
          scope: "comment",
          begin: `#(?!.*${end})`,
          end: /$/,
        },
      ],
    };
  };

  // https://docs.swift.org/swift-book/documentation/the-swift-programming-language/lexicalstructure/#Regular-Expression-Literals
  const REGEXP = {
    scope: "regexp",
    variants: [
      EXTENDED_REGEXP_LITERAL('###'),
      EXTENDED_REGEXP_LITERAL('##'),
      EXTENDED_REGEXP_LITERAL('#'),
      BARE_REGEXP_LITERAL
    ]
  };

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID412
  const QUOTED_IDENTIFIER = { match: concat(/`/, identifier, /`/) };
  const IMPLICIT_PARAMETER = {
    className: 'variable',
    match: /\$\d+/
  };
  const PROPERTY_WRAPPER_PROJECTION = {
    className: 'variable',
    match: `\\$${identifierCharacter}+`
  };
  const IDENTIFIERS = [
    QUOTED_IDENTIFIER,
    IMPLICIT_PARAMETER,
    PROPERTY_WRAPPER_PROJECTION
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/Attributes.html
  const AVAILABLE_ATTRIBUTE = {
    match: /(@|#(un)?)available/,
    scope: 'keyword',
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
    scope: 'keyword',
    match: concat(/@/, either(...keywordAttributes), lookahead(either(/\(/, /\s+/))),
  };

  const USER_DEFINED_ATTRIBUTE = {
    scope: 'meta',
    match: concat(/@/, identifier)
  };

  const ATTRIBUTES = [
    AVAILABLE_ATTRIBUTE,
    KEYWORD_ATTRIBUTE,
    USER_DEFINED_ATTRIBUTE
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/Types.html
  const TYPE = {
    match: lookahead(/\b[A-Z]/),
    relevance: 0,
    contains: [
      { // Common Apple frameworks, for relevance boost
        className: 'type',
        match: concat(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, identifierCharacter, '+')
      },
      { // Type identifier
        className: 'type',
        match: typeIdentifier,
        relevance: 0
      },
      { // Optional type
        match: /[?!]+/,
        relevance: 0
      },
      { // Variadic parameter
        match: /\.\.\./,
        relevance: 0
      },
      { // Protocol composition
        match: concat(/\s+&\s+/, lookahead(typeIdentifier)),
        relevance: 0
      }
    ]
  };
  const GENERIC_ARGUMENTS = {
    begin: /</,
    end: />/,
    keywords: KEYWORDS,
    contains: [
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...ATTRIBUTES,
      OPERATOR_GUARD,
      TYPE
    ]
  };
  TYPE.contains.push(GENERIC_ARGUMENTS);

  // https://docs.swift.org/swift-book/ReferenceManual/Expressions.html#ID552
  // Prevents element names from being highlighted as keywords.
  const TUPLE_ELEMENT_NAME = {
    match: concat(identifier, /\s*:/),
    keywords: "_|0",
    relevance: 0
  };
  // Matches tuples as well as the parameter list of a function type.
  const TUPLE = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    keywords: KEYWORDS,
    contains: [
      'self',
      TUPLE_ELEMENT_NAME,
      ...COMMENTS,
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES,
      TYPE
    ]
  };

  const GENERIC_PARAMETERS = {
    begin: /</,
    end: />/,
    keywords: 'repeat each',
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
        className: 'keyword',
        match: /\b_\b/
      },
      {
        className: 'params',
        match: identifier
      }
    ]
  };
  const FUNCTION_PARAMETERS = {
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS,
    contains: [
      FUNCTION_PARAMETER_NAME,
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...ATTRIBUTES,
      TYPE,
      TUPLE
    ],
    endsParent: true,
    illegal: /["']/
  };
  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID362
  // https://docs.swift.org/swift-book/documentation/the-swift-programming-language/declarations/#Macro-Declaration
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

  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID375
  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID379
  const INIT_SUBSCRIPT = {
    match: [
      /\b(?:subscript|init[?!]?)/,
      /\s*(?=[<(])/,
    ],
    className: { 1: "keyword" },
    contains: [
      GENERIC_PARAMETERS,
      FUNCTION_PARAMETERS,
      WHITESPACE
    ],
    illegal: /\[|%/
  };
  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID380
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

  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID550
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
    contains: [ TYPE ],
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
      /var\b/, 
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
      /\s*/,
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    },
    keywords: KEYWORDS,
    contains: [
      GENERIC_PARAMETERS,
      ...KEYWORD_MODES,
      {
        begin: /:/,
        end: /\{/,
        keywords: KEYWORDS,
        contains: [
          {
            scope: "title.class.inherited",
            match: typeIdentifier,
          },
          ...KEYWORD_MODES,
        ],
        relevance: 0,
      },
    ]
  };

  // Add supported submodes to string interpolation.
  for (const variant of STRING.variants) {
    const interpolation = variant.contains.find(mode => mode.label === "interpol");
    // TODO: Interpolation can contain any expression, so there's room for improvement here.
    interpolation.keywords = KEYWORDS;
    const submodes = [
      ...KEYWORD_MODES,
      ...BUILT_INS,
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
          'self',
          ...submodes
        ]
      }
    ];
  }

  return {
    name: 'Swift',
    keywords: KEYWORDS,
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
        beginKeywords: 'import',
        end: /$/,
        contains: [ ...COMMENTS ],
        relevance: 0
      },
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES,
      TYPE,
      TUPLE
    ]
  };
}

const IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
const KEYWORDS = [
  "as", // for exports
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

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
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
  "global" // Node.js
];

const BUILT_INS = [].concat(
  BUILT_IN_GLOBALS,
  TYPES,
  ERROR_TYPES
);

/*
Language: JavaScript
Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
Category: common, scripting, web
Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
*/


/** @type LanguageFn */
function javascript(hljs) {
  const regex = hljs.regex;
  /**
   * Takes a string like "<Booger" and checks to see
   * if we can find a matching "</Booger" later in the
   * content.
   * @param {RegExpMatchArray} match
   * @param {{after:number}} param1
   */
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };

  const IDENT_RE$1 = IDENT_RE;
  const FRAGMENT = {
    begin: '<>',
    end: '</>'
  };
  // to avoid some special cases inside isTrulyOpeningTag
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
        nextChar === "<" ||
        // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
        ) {
        response.ignoreMatch();
        return;
      }

      // `<something>`
      // Quite possibly a tag, lets look for a matching closing tag...
      if (nextChar === ">") {
        // if we cannot find a matching closing tag, then we
        // will ignore it
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }

      // `<blah />` (self-closing)
      // handled by simpleSelfClosing rule

      let m;
      const afterMatch = match.input.substring(afterMatchIndex);

      // some more template typing stuff
      //  <T = any>(key?: string) => Modify<
      if ((m = afterMatch.match(/^\s*=/))) {
        response.ignoreMatch();
        return;
      }

      // `<From extends string>`
      // technically this could be HTML, but it smells like a type
      // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
      if ((m = afterMatch.match(/^\s+extends\s+/))) {
        if (m.index === 0) {
          response.ignoreMatch();
          // eslint-disable-next-line no-useless-return
          return;
        }
      }
    }
  };
  const KEYWORDS$1 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_INS,
    "variable.language": BUILT_IN_VARIABLES
  };

  // https://tc39.es/ecma262/#sec-literals-numeric-literals
  const decimalDigits = '[0-9](_?[0-9])*';
  const frac = `\\.(${decimalDigits})`;
  // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
  // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: 'number',
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
        `[eE][+-]?(${decimalDigits})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },

      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },

      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" },
    ],
    relevance: 0
  };

  const SUBST = {
    className: 'subst',
    begin: '\\$\\{',
    end: '\\}',
    keywords: KEYWORDS$1,
    contains: [] // defined later
  };
  const HTML_TEMPLATE = {
    begin: '\.?html`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'xml'
    }
  };
  const CSS_TEMPLATE = {
    begin: '\.?css`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'css'
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: '\.?gql`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'graphql'
    }
  };
  const TEMPLATE_STRING = {
    className: 'string',
    begin: '`',
    end: '`',
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    '\\*/',
    {
      relevance: 0,
      contains: [
        {
          begin: '(?=@[A-Za-z]+)',
          relevance: 0,
          contains: [
            {
              className: 'doctag',
              begin: '@[A-Za-z]+'
            },
            {
              className: 'type',
              begin: '\\{',
              end: '\\}',
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: 'variable',
              begin: IDENT_RE$1 + '(?=\\s*(-)|$)',
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
  const COMMENT = {
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
    NUMBER,
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS
    .concat({
      // we need to pair up {} inside our subst to prevent
      // it from ending too early by matching another }
      begin: /\{/,
      end: /\}/,
      keywords: KEYWORDS$1,
      contains: [
        "self"
      ].concat(SUBST_INTERNALS)
    });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: KEYWORDS$1,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: 'params',
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/, // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1,
    contains: PARAMS_CONTAINS
  };

  // ES6 classes
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
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
          IDENT_RE$1
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      },

    ]
  };

  const CLASS_REFERENCE = {
    relevance: 0,
    match:
    regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/,
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
    className: 'meta',
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };

  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$1,
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
    contains: [ PARAMS ],
    illegal: /%/
  };

  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };

  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }

  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS,
        "super",
        "import"
      ].map(x => `${x}\\s*\\(`)),
      IDENT_RE$1, regex.lookahead(/\s*\(/)),
    className: "title.function",
    relevance: 0
  };

  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$1,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };

  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$1,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      { // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };

  const FUNC_LEAD_IN_RE = '(\\(' +
    '[^()]*(\\(' +
    '[^()]*(\\(' +
    '[^()]*' +
    '\\)[^()]*)*' +
    '\\)[^()]*)*' +
    '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';

  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/, /\s+/,
      IDENT_RE$1, /\s*/,
      /=\s*/,
      /(async\s*)?/, // async is optional
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
    name: 'JavaScript',
    aliases: ['js', 'jsx', 'mjs', 'cjs'],
    keywords: KEYWORDS$1,
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
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: 'attr',
        match: IDENT_RE$1 + regex.lookahead(':'),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: 'function',
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: '\\s*=>',
            contains: [
              {
                className: 'params',
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
                    keywords: KEYWORDS$1,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          { // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          { // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                'on:begin': XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: 'xml',
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ['self']
              }
            ]
          }
        ],
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
        begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
          '\\(' + // first parens
          '[^()]*(\\(' +
            '[^()]*(\\(' +
              '[^()]*' +
            '\\)[^()]*)*' +
          '\\)[^()]*)*' +
          '\\)\\s*\\{', // end parens
        returnBegin:true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
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
        match: '\\$' + IDENT_RE$1,
        relevance: 0
      },
      {
        match: [ /\bconstructor(?=\s*\()/ ],
        className: { 1: "title.function" },
        contains: [ PARAMS ]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}

/*
Language: TypeScript
Author: Panu Horsmalahti <panu.horsmalahti@iki.fi>
Contributors: Ike Ku <dempfi@yahoo.com>
Description: TypeScript is a strict superset of JavaScript
Website: https://www.typescriptlang.org
Category: common, scripting
*/


/** @type LanguageFn */
function typescript(hljs) {
  const regex = hljs.regex;
  const tsLanguage = javascript(hljs);

  const IDENT_RE$1 = IDENT_RE;
  const TYPES = [
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
    beginKeywords: 'interface',
    end: /\{/,
    excludeEnd: true,
    keywords: {
      keyword: 'interface extends',
      built_in: TYPES
    },
    contains: [ tsLanguage.exports.CLASS_REFERENCE ]
  };
  const USE_STRICT = {
    className: 'meta',
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
  /*
    namespace is a TS keyword but it's fine to use it as a variable name too.
    const message = 'foo';
    const namespace = 'bar';
  */
  const KEYWORDS$1 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS.concat(TS_SPECIFIC_KEYWORDS),
    literal: LITERALS,
    built_in: BUILT_INS.concat(TYPES),
    "variable.language": BUILT_IN_VARIABLES
  };

  const DECORATOR = {
    className: 'meta',
    begin: '@' + IDENT_RE$1,
  };

  const swapMode = (mode, label, replacement) => {
    const indx = mode.contains.findIndex(m => m.label === label);
    if (indx === -1) { throw new Error("can not find mode to replace"); }

    mode.contains.splice(indx, 1, replacement);
  };


  // this should update anywhere keywords is used since
  // it will be the same actual JS object
  Object.assign(tsLanguage.keywords, KEYWORDS$1);

  tsLanguage.exports.PARAMS_CONTAINS.push(DECORATOR);

  // highlight the function params
  const ATTRIBUTE_HIGHLIGHT = tsLanguage.contains.find(c => c.scope === "attr");

  // take default attr rule and extend it to support optionals
  const OPTIONAL_KEY_OR_ARGUMENT = Object.assign({},
    ATTRIBUTE_HIGHLIGHT,
    { match: regex.concat(IDENT_RE$1, regex.lookahead(/\s*\?:/)) }
  );
  tsLanguage.exports.PARAMS_CONTAINS.push([
    tsLanguage.exports.CLASS_REFERENCE, // class reference for highlighting the params types
    ATTRIBUTE_HIGHLIGHT, // highlight the params key
    OPTIONAL_KEY_OR_ARGUMENT, // Added for optional property assignment highlighting
  ]);

  // Add the optional property assignment highlighting for objects or classes
  tsLanguage.contains = tsLanguage.contains.concat([
    DECORATOR,
    NAMESPACE,
    INTERFACE,
    OPTIONAL_KEY_OR_ARGUMENT, // Added for optional property assignment highlighting
  ]);

  // TS gets a simpler shebang rule than JS
  swapMode(tsLanguage, "shebang", hljs.SHEBANG());
  // JS use strict rule purposely excludes `asm` which makes no sense
  swapMode(tsLanguage, "use_strict", USE_STRICT);

  const functionDeclaration = tsLanguage.contains.find(m => m.label === "func.def");
  functionDeclaration.relevance = 0; // () => {} is more typical in TypeScript

  Object.assign(tsLanguage, {
    name: 'TypeScript',
    aliases: [
      'ts',
      'tsx',
      'mts',
      'cts'
    ]
  });

  return tsLanguage;
}

/*
Language: Vim Script
Author: Jun Yang <yangjvn@126.com>
Description: full keyword and built-in from http://vimdoc.sourceforge.net/htmldoc/
Website: https://www.vim.org
Category: scripting
*/

function vim(hljs) {
  return {
    name: 'Vim Script',
    keywords: {
      $pattern: /[!#@\w]+/,
      keyword:
        // express version except: ! & * < = > !! # @ @@
        'N|0 P|0 X|0 a|0 ab abc abo al am an|0 ar arga argd arge argdo argg argl argu as au aug aun b|0 bN ba bad bd be bel bf bl bm bn bo bp br brea breaka breakd breakl bro bufdo buffers bun bw c|0 cN cNf ca cabc caddb cad caddf cal cat cb cc ccl cd ce cex cf cfir cgetb cgete cg changes chd che checkt cl cla clo cm cmapc cme cn cnew cnf cno cnorea cnoreme co col colo com comc comp con conf cope '
        + 'cp cpf cq cr cs cst cu cuna cunme cw delm deb debugg delc delf dif diffg diffo diffp diffpu diffs diffthis dig di dl dell dj dli do doautoa dp dr ds dsp e|0 ea ec echoe echoh echom echon el elsei em en endfo endf endt endw ene ex exe exi exu f|0 files filet fin fina fini fir fix fo foldc foldd folddoc foldo for fu go gr grepa gu gv ha helpf helpg helpt hi hid his ia iabc if ij il im imapc '
        + 'ime ino inorea inoreme int is isp iu iuna iunme j|0 ju k|0 keepa kee keepj lN lNf l|0 lad laddb laddf la lan lat lb lc lch lcl lcs le lefta let lex lf lfir lgetb lgete lg lgr lgrepa lh ll lla lli lmak lm lmapc lne lnew lnf ln loadk lo loc lockv lol lope lp lpf lr ls lt lu lua luad luaf lv lvimgrepa lw m|0 ma mak map mapc marks mat me menut mes mk mks mksp mkv mkvie mod mz mzf nbc nb nbs new nm nmapc nme nn nnoreme noa no noh norea noreme norm nu nun nunme ol o|0 om omapc ome on ono onoreme opt ou ounme ow p|0 '
        + 'profd prof pro promptr pc ped pe perld po popu pp pre prev ps pt ptN ptf ptj ptl ptn ptp ptr pts pu pw py3 python3 py3d py3f py pyd pyf quita qa rec red redi redr redraws reg res ret retu rew ri rightb rub rubyd rubyf rund ru rv sN san sa sal sav sb sbN sba sbf sbl sbm sbn sbp sbr scrip scripte scs se setf setg setl sf sfir sh sim sig sil sl sla sm smap smapc sme sn sni sno snor snoreme sor '
        + 'so spelld spe spelli spellr spellu spellw sp spr sre st sta startg startr star stopi stj sts sun sunm sunme sus sv sw sy synti sync tN tabN tabc tabdo tabe tabf tabfir tabl tabm tabnew '
        + 'tabn tabo tabp tabr tabs tab ta tags tc tcld tclf te tf th tj tl tm tn to tp tr try ts tu u|0 undoj undol una unh unl unlo unm unme uns up ve verb vert vim vimgrepa vi viu vie vm vmapc vme vne vn vnoreme vs vu vunme windo w|0 wN wa wh wi winc winp wn wp wq wqa ws wu wv x|0 xa xmapc xm xme xn xnoreme xu xunme y|0 z|0 ~ '
        // full version
        + 'Next Print append abbreviate abclear aboveleft all amenu anoremenu args argadd argdelete argedit argglobal arglocal argument ascii autocmd augroup aunmenu buffer bNext ball badd bdelete behave belowright bfirst blast bmodified bnext botright bprevious brewind break breakadd breakdel breaklist browse bunload '
        + 'bwipeout change cNext cNfile cabbrev cabclear caddbuffer caddexpr caddfile call catch cbuffer cclose center cexpr cfile cfirst cgetbuffer cgetexpr cgetfile chdir checkpath checktime clist clast close cmap cmapclear cmenu cnext cnewer cnfile cnoremap cnoreabbrev cnoremenu copy colder colorscheme command comclear compiler continue confirm copen cprevious cpfile cquit crewind cscope cstag cunmap '
        + 'cunabbrev cunmenu cwindow delete delmarks debug debuggreedy delcommand delfunction diffupdate diffget diffoff diffpatch diffput diffsplit digraphs display deletel djump dlist doautocmd doautoall deletep drop dsearch dsplit edit earlier echo echoerr echohl echomsg else elseif emenu endif endfor '
        + 'endfunction endtry endwhile enew execute exit exusage file filetype find finally finish first fixdel fold foldclose folddoopen folddoclosed foldopen function global goto grep grepadd gui gvim hardcopy help helpfind helpgrep helptags highlight hide history insert iabbrev iabclear ijump ilist imap '
        + 'imapclear imenu inoremap inoreabbrev inoremenu intro isearch isplit iunmap iunabbrev iunmenu join jumps keepalt keepmarks keepjumps lNext lNfile list laddexpr laddbuffer laddfile last language later lbuffer lcd lchdir lclose lcscope left leftabove lexpr lfile lfirst lgetbuffer lgetexpr lgetfile lgrep lgrepadd lhelpgrep llast llist lmake lmap lmapclear lnext lnewer lnfile lnoremap loadkeymap loadview '
        + 'lockmarks lockvar lolder lopen lprevious lpfile lrewind ltag lunmap luado luafile lvimgrep lvimgrepadd lwindow move mark make mapclear match menu menutranslate messages mkexrc mksession mkspell mkvimrc mkview mode mzscheme mzfile nbclose nbkey nbsart next nmap nmapclear nmenu nnoremap '
        + 'nnoremenu noautocmd noremap nohlsearch noreabbrev noremenu normal number nunmap nunmenu oldfiles open omap omapclear omenu only onoremap onoremenu options ounmap ounmenu ownsyntax print profdel profile promptfind promptrepl pclose pedit perl perldo pop popup ppop preserve previous psearch ptag ptNext '
        + 'ptfirst ptjump ptlast ptnext ptprevious ptrewind ptselect put pwd py3do py3file python pydo pyfile quit quitall qall read recover redo redir redraw redrawstatus registers resize retab return rewind right rightbelow ruby rubydo rubyfile rundo runtime rviminfo substitute sNext sandbox sargument sall saveas sbuffer sbNext sball sbfirst sblast sbmodified sbnext sbprevious sbrewind scriptnames scriptencoding '
        + 'scscope set setfiletype setglobal setlocal sfind sfirst shell simalt sign silent sleep slast smagic smapclear smenu snext sniff snomagic snoremap snoremenu sort source spelldump spellgood spellinfo spellrepall spellundo spellwrong split sprevious srewind stop stag startgreplace startreplace '
        + 'startinsert stopinsert stjump stselect sunhide sunmap sunmenu suspend sview swapname syntax syntime syncbind tNext tabNext tabclose tabedit tabfind tabfirst tablast tabmove tabnext tabonly tabprevious tabrewind tag tcl tcldo tclfile tearoff tfirst throw tjump tlast tmenu tnext topleft tprevious ' + 'trewind tselect tunmenu undo undojoin undolist unabbreviate unhide unlet unlockvar unmap unmenu unsilent update vglobal version verbose vertical vimgrep vimgrepadd visual viusage view vmap vmapclear vmenu vnew '
        + 'vnoremap vnoremenu vsplit vunmap vunmenu write wNext wall while winsize wincmd winpos wnext wprevious wqall wsverb wundo wviminfo xit xall xmapclear xmap xmenu xnoremap xnoremenu xunmap xunmenu yank',
      built_in: // built in func
        'synIDtrans atan2 range matcharg did_filetype asin feedkeys xor argv '
        + 'complete_check add getwinposx getqflist getwinposy screencol '
        + 'clearmatches empty extend getcmdpos mzeval garbagecollect setreg '
        + 'ceil sqrt diff_hlID inputsecret get getfperm getpid filewritable '
        + 'shiftwidth max sinh isdirectory synID system inputrestore winline '
        + 'atan visualmode inputlist tabpagewinnr round getregtype mapcheck '
        + 'hasmapto histdel argidx findfile sha256 exists toupper getcmdline '
        + 'taglist string getmatches bufnr strftime winwidth bufexists '
        + 'strtrans tabpagebuflist setcmdpos remote_read printf setloclist '
        + 'getpos getline bufwinnr float2nr len getcmdtype diff_filler luaeval '
        + 'resolve libcallnr foldclosedend reverse filter has_key bufname '
        + 'str2float strlen setline getcharmod setbufvar index searchpos '
        + 'shellescape undofile foldclosed setqflist buflisted strchars str2nr '
        + 'virtcol floor remove undotree remote_expr winheight gettabwinvar '
        + 'reltime cursor tabpagenr finddir localtime acos getloclist search '
        + 'tanh matchend rename gettabvar strdisplaywidth type abs py3eval '
        + 'setwinvar tolower wildmenumode log10 spellsuggest bufloaded '
        + 'synconcealed nextnonblank server2client complete settabwinvar '
        + 'executable input wincol setmatches getftype hlID inputsave '
        + 'searchpair or screenrow line settabvar histadd deepcopy strpart '
        + 'remote_peek and eval getftime submatch screenchar winsaveview '
        + 'matchadd mkdir screenattr getfontname libcall reltimestr getfsize '
        + 'winnr invert pow getbufline byte2line soundfold repeat fnameescape '
        + 'tagfiles sin strwidth spellbadword trunc maparg log lispindent '
        + 'hostname setpos globpath remote_foreground getchar synIDattr '
        + 'fnamemodify cscope_connection stridx winbufnr indent min '
        + 'complete_add nr2char searchpairpos inputdialog values matchlist '
        + 'items hlexists strridx browsedir expand fmod pathshorten line2byte '
        + 'argc count getwinvar glob foldtextresult getreg foreground cosh '
        + 'matchdelete has char2nr simplify histget searchdecl iconv '
        + 'winrestcmd pumvisible writefile foldlevel haslocaldir keys cos '
        + 'matchstr foldtext histnr tan tempname getcwd byteidx getbufvar '
        + 'islocked escape eventhandler remote_send serverlist winrestview '
        + 'synstack pyeval prevnonblank readfile cindent filereadable changenr '
        + 'exp'
    },
    illegal: /;/,
    contains: [
      hljs.NUMBER_MODE,
      {
        className: 'string',
        begin: '\'',
        end: '\'',
        illegal: '\\n'
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
        className: 'string',
        begin: /"(\\"|\n\\|[^"\n])*"/
      },
      hljs.COMMENT('"', '$'),

      {
        className: 'variable',
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
        end: '$',
        relevance: 0,
        contains: [
          {
            className: 'params',
            begin: '\\(',
            end: '\\)'
          }
        ]
      },
      {
        className: 'symbol',
        begin: /<[\w-]+>/
      }
    ]
  };
}

/*
Language: WebAssembly
Website: https://webassembly.org
Description:  Wasm is designed as a portable compilation target for programming languages, enabling deployment on the web for client and server applications.
Category: web, common
Audit: 2020
*/

/** @type LanguageFn */
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
    "global.get",
    "global.set",
    "local.get",
    "local.set",
    "local.tee",
    "get_global",
    "get_local",
    "global",
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
    name: 'WebAssembly',
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

/*
Language: HTML, XML
Website: https://www.w3.org/XML/
Category: common, web
Audit: 2020
*/

/** @type LanguageFn */
function xml(hljs) {
  const regex = hljs.regex;
  // XML names can have the following additional letters: https://www.w3.org/TR/xml/#NT-NameChar
  // OTHER_NAME_CHARS = /[:\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]/;
  // Element names start with NAME_START_CHAR followed by optional other Unicode letters, ASCII digits, hyphens, underscores, and periods
  // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);;
  // const XML_IDENT_RE = /[A-Z_a-z:\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]+/;
  // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);
  // however, to cater for performance and more Unicode support rely simply on the Unicode letter class
  const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
  const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
  const XML_ENTITIES = {
    className: 'symbol',
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  };
  const XML_META_KEYWORDS = {
    begin: /\s/,
    contains: [
      {
        className: 'keyword',
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  };
  const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
    begin: /\(/,
    end: /\)/
  });
  const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: 'string' });
  const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: 'string' });
  const TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: 'attr',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: 'string',
            endsParent: true,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [ XML_ENTITIES ]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [ XML_ENTITIES ]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: 'HTML, XML',
    aliases: [
      'html',
      'xhtml',
      'rss',
      'atom',
      'xjb',
      'xsd',
      'xsl',
      'plist',
      'wsf',
      'svg'
    ],
    case_insensitive: true,
    unicodeRegex: true,
    contains: [
      {
        className: 'meta',
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
                className: 'meta',
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
        className: 'meta',
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
            begin: /<\?[a-z][a-z0-9]+/,
          }
        ]

      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: 'style' },
        contains: [ TAG_INTERNALS ],
        starts: {
          end: /<\/style>/,
          returnEnd: true,
          subLanguage: [
            'css',
            'xml'
          ]
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: 'script' },
        contains: [ TAG_INTERNALS ],
        starts: {
          end: /<\/script>/,
          returnEnd: true,
          subLanguage: [
            'javascript',
            'handlebars',
            'xml'
          ]
        }
      },
      // we need this for now for jSX
      {
        className: 'tag',
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: 'tag',
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
            className: 'name',
            begin: TAG_NAME_RE,
            relevance: 0,
            starts: TAG_INTERNALS
          }
        ]
      },
      // close tag
      {
        className: 'tag',
        begin: regex.concat(
          /<\//,
          regex.lookahead(regex.concat(
            TAG_NAME_RE, />/
          ))
        ),
        contains: [
          {
            className: 'name',
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

const pluginKeyword = 'flowchart';
const tokenTypeInline = 'inline';
const ttContainerOpen = 'container_' + pluginKeyword + '_open';
const ttContainerClose = 'container_' + pluginKeyword + '_close';

function flowChartPlugin(md, config) {
    md.use(mdItContainer, pluginKeyword, {
        anyClass: true,
        validate: (info) => {
            return info.trim() === pluginKeyword;
        },

        render: (tokens, idx) => {
            const token = tokens[idx];

            // eslint-disable-next-line no-var
            var src = '';
            if (token.type === ttContainerOpen) {
                // eslint-disable-next-line no-var
                for (var i = idx + 1; i < tokens.length; i++) {
                    const value = tokens[i];
                    if (value === undefined || value.type === ttContainerClose) {
                        break;
                    }
                    src += value.content;
                    if (value.block && value.nesting <= 0) {
                        src += '\n';
                    }
                    // Clear these out so markdown-it doesn't try to render them
                    value.tag = '';
                    value.type = tokenTypeInline;
                    // Code can be triggered multiple times, even if tokens are not updated (eg. on editor losing and regaining focus). Content must be preserved, so src can be realculated in such instances.
                    value.children = [];
                }
            }

            if (token.nesting === 1) {
                return `${render(src)}`;
            } else {
                return '';
            }
        }
    });

    // const highlight = md.options.highlight;
    // md.options.highlight = (code, lang) => {
    //     const reg = new RegExp('\\b(' + config.languageIds().map(escapeRegExp).join('|') + ')\\b', 'i');
    //     if (lang && reg.test(lang)) {
    //         return `<pre style="all:unset;"><div class="${pluginKeyword}">${preProcess(code)}</div></pre>`;
    //     }
    //     return highlight(code, lang);
    // };
    return md;
}

function render(code) {
    return `<div class="flowchart-container">
       <div class="flowchart-code" style="display:none;">${code}</div>
       <div class="flowchart"></div>
    </div>`;
}

HighlightJS.registerLanguage('javascript', javascript$1);
HighlightJS.registerLanguage('java', java);
HighlightJS.registerLanguage('bash', bash);
HighlightJS.registerLanguage('c', c);
HighlightJS.registerLanguage('cpp', cpp);
HighlightJS.registerLanguage('csharp', csharp);
HighlightJS.registerLanguage('css', css);
HighlightJS.registerLanguage('dart', dart);
HighlightJS.registerLanguage('dos', dos);
HighlightJS.registerLanguage('glsl', glsl);
HighlightJS.registerLanguage('go', go);
HighlightJS.registerLanguage('gradle', gradle);
HighlightJS.registerLanguage('graphql', graphql);
HighlightJS.registerLanguage('json', json);
HighlightJS.registerLanguage('kotlin', kotlin);
HighlightJS.registerLanguage('latex', latex);
HighlightJS.registerLanguage('less', less);
HighlightJS.registerLanguage('markdown', markdown);
HighlightJS.registerLanguage('matlab', matlab);
HighlightJS.registerLanguage('nginx', nginx);
HighlightJS.registerLanguage('objectivec', objectivec);
HighlightJS.registerLanguage('pgsql', pgsql);
HighlightJS.registerLanguage('php', php);
HighlightJS.registerLanguage('powershell', powershell);
HighlightJS.registerLanguage('python', python);
HighlightJS.registerLanguage('r', r);
HighlightJS.registerLanguage('ruby', ruby);
HighlightJS.registerLanguage('rust', rust);
HighlightJS.registerLanguage('scss', scss);
HighlightJS.registerLanguage('shell', shell);
HighlightJS.registerLanguage('sql', sql);
HighlightJS.registerLanguage('swift', swift);
HighlightJS.registerLanguage('typescript', typescript);
HighlightJS.registerLanguage('vim', vim);
HighlightJS.registerLanguage('wasm', wasm);
HighlightJS.registerLanguage('xml', xml);

const HTML_ESCAPE_TEST_RE = /[&<>"]/;
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
const HTML_REPLACEMENTS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
};

function replaceUnsafeChar(ch) {
    return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
    if (HTML_ESCAPE_TEST_RE.test(str)) {
        return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
    }
    return str;
}

function renderAttrs(token) {
    let i, l, result;
    if (token.type === 'heading_open') {
        token.attrs = token.attrs || [];
        if (token.map) {
            const [lineNumber] = token.map;
            token.attrs.push(['linenumber', lineNumber + 1]);
        }
    }

    if (!token.attrs) { return ''; }

    result = '';

    for (i = 0, l = token.attrs.length; i < l; i++) {
        result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
    }

    return result;
}

function installPlugins(md) {
    md.use(emojiPlugin, {});
    md.use(p, { level: 1, permalink: true, permalinkBefore: true, permalinkSymbol: '#' });
    md.use(markdownToc, {});
    containerPlugin(md, { hasSingleTheme: false });
    katexPlugin(md);
    mermaidPlugin(md);
    swiperPlugin(md);
    flowChartPlugin(md);
    md.use(mkkatex);
    md.use(taskLists);
    md.use(qrCodePlugin);
    md.use(excelPlugin);
    md.use(mdPlantUML);
    md.use(d);
    md.renderer.renderAttrs = renderAttrs;
}

function createMarkdown() {
    const md = MarkdownIt({
        html: true,
        highlight: function (str, lang) {
            lang = lang || '';
            lang = lang.toLowerCase();
            if (lang === 'ketex') {
                return ketexRender(str);
            } else if (lang === 'mermaid') {
                return mermaidRender(str);
            }
            // console.log(str);
            const shikiHighlighter = getShikiHighlighter();
            if (shikiHighlighter && shikiHighlighter.codeToHtml) {
                return shikiHighlighter.codeToHtml(str, { lang });
            }
            // const hljs = getHightLight();
            if (lang && HighlightJS && HighlightJS.getLanguage(lang)) {
                try {
                    return HighlightJS.highlight(str, { language: lang }).value;
                } catch (__) { }
            }

            return str; // use external default escaping
        }
    });
    installPlugins(md);
    return md;
}

const OPTIONS$2 = {
    icon: 'icon-zitijiacu',
    title: '加粗',
    className: '',
    position: 'left'
};

class ToolIcon {
    constructor(options) {
        options = Object.assign({}, OPTIONS$2, options);
        this.options = options;
        const { icon, title, position } = options;
        const dom = createDom('i');
        const className = options.className || '';
        let clazzName = `item iconfont ${icon}`;
        if (position === 'right') {
            clazzName += ' icon-right';
        }
        if (position === 'left') {
            clazzName += ' icon-left';
        }
        if (className) {
            clazzName = `${className} ${clazzName}`;
        }
        dom.className = clazzName;
        dom.title = title;
        dom.parent = this;
        // dom.getEditor = () => {
        //     return this.getEditor();
        // };
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
        on$1(this.dom, event, (e) => {
            e = extend({}, e, { target: this });
            handler.call(this, e);
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
        return getDomDisplay(this.getDom()) !== 'none';
    }
}

/**
 * Custom positioning reference element.
 * @see https://floating-ui.com/docs/virtual-elements
 */

const min = Math.min;
const max = Math.max;
const round = Math.round;
const createCoords = v => ({
  x: v,
  y: v
});
function evaluate(value, param) {
  return typeof value === 'function' ? value(param) : value;
}
function getSide(placement) {
  return placement.split('-')[0];
}
function getAlignment(placement) {
  return placement.split('-')[1];
}
function getOppositeAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}
function getAxisLength(axis) {
  return axis === 'y' ? 'height' : 'width';
}
const yAxisSides = /*#__PURE__*/new Set(['top', 'bottom']);
function getSideAxis(placement) {
  return yAxisSides.has(getSide(placement)) ? 'y' : 'x';
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
  return typeof padding !== 'number' ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
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
  const isVertical = sideAxis === 'y';
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case 'top':
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case 'bottom':
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case 'right':
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case 'left':
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
    case 'start':
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case 'end':
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}

/**
 * Resolves with an object of overflow side offsets that determine how much the
 * element is overflowing a given clipping boundary on each side.
 * - positive = overflowing the boundary by that number of pixels
 * - negative = how many pixels left before it will overflow
 * - 0 = lies flush with the boundary
 * @see https://floating-ui.com/docs/detectOverflow
 */
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = 'clippingAncestors',
    rootBoundary = 'viewport',
    elementContext = 'floating',
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === 'floating' ? 'reference' : 'floating';
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform.getClippingRect({
    element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === 'floating' ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
  const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
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

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 *
 * This export does not have any `platform` interface logic. You will need to
 * write one for the platform you are using Floating UI with.
 */
const computePosition$1 = async (reference, floating, config) => {
  const {
    placement = 'bottom',
    strategy = 'absolute',
    middleware = [],
    platform
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
  let rects = await platform.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    var _platform$detectOverf;
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: {
        ...platform,
        detectOverflow: (_platform$detectOverf = platform.detectOverflow) != null ? _platform$detectOverf : detectOverflow
      },
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === 'object') {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};

function hasWindow() {
  return typeof window !== 'undefined';
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || '').toLowerCase();
  }
  // Mocked nodes in testing environments may not be instances of Node. By
  // returning `#document` an infinite loop won't occur.
  // https://github.com/floating-ui/floating-ui/issues/2317
  return '#document';
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
function isElement(value) {
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
  if (!hasWindow() || typeof ShadowRoot === 'undefined') {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
const invalidOverflowDisplayValues = /*#__PURE__*/new Set(['inline', 'contents']);
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle$1(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
}
const tableElements = /*#__PURE__*/new Set(['table', 'td', 'th']);
function isTableElement(element) {
  return tableElements.has(getNodeName(element));
}
const topLayerSelectors = [':popover-open', ':modal'];
function isTopLayer(element) {
  return topLayerSelectors.some(selector => {
    try {
      return element.matches(selector);
    } catch (_e) {
      return false;
    }
  });
}
const transformProperties = ['transform', 'translate', 'scale', 'rotate', 'perspective'];
const willChangeValues = ['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter'];
const containValues = ['paint', 'layout', 'strict', 'content'];
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  // https://drafts.csswg.org/css-transforms-2/#individual-transforms
  return transformProperties.some(value => css[value] ? css[value] !== 'none' : false) || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || willChangeValues.some(value => (css.willChange || '').includes(value)) || containValues.some(value => (css.contain || '').includes(value));
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
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('-webkit-backdrop-filter', 'none');
}
const lastTraversableNodeNames = /*#__PURE__*/new Set(['html', 'body', '#document']);
function isLastTraversableNode(node) {
  return lastTraversableNodeNames.has(getNodeName(node));
}
function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
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
  if (getNodeName(node) === 'html') {
    return node;
  }
  const result =
  // Step into the shadow DOM of the parent of a slotted node.
  node.assignedSlot ||
  // DOM Element detected.
  node.parentNode ||
  // ShadowRoot detected.
  isShadowRoot(node) && node.host ||
  // Fallback.
  getDocumentElement(node);
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
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

function getCssDimensions(element) {
  const css = getComputedStyle$1(element);
  // In testing environments, the `width` and `height` properties are empty
  // strings for SVG elements, returning NaN. Fallback to `0` in this case.
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
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
  return !isElement(element) ? element.contextElement : element;
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
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;

  // 0, NaN, or Infinity should always fallback to 1.

  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}

const noOffsets = /*#__PURE__*/createCoords(0);
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
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle$1(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}

// If <html> has a CSS width greater than the viewport, then this will be
// incorrect for RTL.
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}

function getHTMLOffset(documentElement, scroll) {
  const htmlRect = documentElement.getBoundingClientRect();
  const x = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
  const y = htmlRect.top + scroll.scrollTop;
  return {
    x,
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
  const isFixed = strategy === 'fixed';
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}

function getClientRects(element) {
  return Array.from(element.getClientRects());
}

// Gets the entire size of the scrollable document area, even extending outside
// of the `<html>` and `<body>` rect bounds if horizontally scrollable.
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle$1(body).direction === 'rtl') {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}

// Safety check: ensure the scrollbar space is reasonable in case this
// calculation is affected by unusual styles.
// Most scrollbars leave 15-18px of space.
const SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  const windowScrollbarX = getWindowScrollBarX(html);
  // <html> `overflow: hidden` + `scrollbar-gutter: stable` reduces the
  // visual width of the <html> but this is not considered in the size
  // of `html.clientWidth`.
  if (windowScrollbarX <= 0) {
    const doc = html.ownerDocument;
    const body = doc.body;
    const bodyStyles = getComputedStyle(body);
    const bodyMarginInline = doc.compatMode === 'CSS1Compat' ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
    const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
    if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) {
      width -= clippingStableScrollbarWidth;
    }
  } else if (windowScrollbarX <= SCROLLBAR_MAX) {
    // If the <body> scrollbar is on the left, the width needs to be extended
    // by the scrollbar amount so there isn't extra space on the right.
    width += windowScrollbarX;
  }
  return {
    width,
    height,
    x,
    y
  };
}

const absoluteOrFixed = /*#__PURE__*/new Set(['absolute', 'fixed']);
// Returns the inner client rect, subtracting scrollbars if present.
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === 'viewport') {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === 'document') {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
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
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle$1(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
}

// A "clipping ancestor" is an `overflow` element with the characteristic of
// clipping (or hiding) child elements. This returns all clipping ancestors
// of the given element up the tree.
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle$1(element).position === 'fixed';
  let currentNode = elementIsFixed ? getParentNode(element) : element;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle$1(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && absoluteOrFixed.has(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      // Drop non-containing blocks.
      result = result.filter(ancestor => ancestor !== currentNode);
    } else {
      // Record last containing block for next iteration.
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}

// Gets the maximum area that the element is visible in due to any number of
// clipping ancestors.
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === 'clippingAncestors' ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
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
  const isFixed = strategy === 'fixed';
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);

  // If the <body> scrollbar appears on the left (e.g. RTL systems). Use
  // Firefox with layout.scrollbar.side = 3 in about:config to test this.
  function setLeftRTLScrollbarOffset() {
    offsets.x = getWindowScrollBarX(documentElement);
  }
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
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
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}

function isStaticPositioned(element) {
  return getComputedStyle$1(element).position === 'static';
}

function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle$1(element).position === 'fixed') {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;

  // Firefox returns the <html> element as the offsetParent if it's non-static,
  // while Chrome and Safari return the <body> element. The <body> element must
  // be used to perform the correct calculations even if the <html> element is
  // non-static.
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
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

const getElementRects = async function (data) {
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
  return getComputedStyle$1(element).direction === 'rtl';
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
  isElement,
  isRTL
};

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 */
const computePosition = (reference, floating, options) => {
  // This caches the expensive `getClippingElementAncestors` function so that
  // multiple lifecycle resets re-use the same result. It only lives for a
  // single call. If other functions become expensive, we can add them as well.
  const cache = new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition$1(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

function fadeOut (element, cb) {
  if (element.style.opacity && element.style.opacity > 0.05) {
    element.style.opacity = element.style.opacity - 0.05;
  } else if (element.style.opacity && element.style.opacity <= 0.1) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
      if (cb) cb();
    }
  } else {
    element.style.opacity = 0.9;
  }
  setTimeout(() => fadeOut.apply(this, [element, cb]), 1000 / 30
  );
}

const LIB_NAME = 'mini-toastr';

const ERROR = 'error';
const WARN = 'warn';
const SUCCESS = 'success';
const INFO = 'info';
const CONTAINER_CLASS = LIB_NAME;
const NOTIFICATION_CLASS = `${LIB_NAME}__notification`;
const TITLE_CLASS = `${LIB_NAME}-notification__title`;
const ICON_CLASS = `${LIB_NAME}-notification__icon`;
const MESSAGE_CLASS = `${LIB_NAME}-notification__message`;
const ERROR_CLASS = `-${ERROR}`;
const WARN_CLASS = `-${WARN}`;
const SUCCESS_CLASS = `-${SUCCESS}`;
const INFO_CLASS = `-${INFO}`;
const DEFAULT_TIMEOUT = 3000;

const EMPTY_STRING = '';

function flatten (obj, into, prefix) {
  into = into || {};
  prefix = prefix || EMPTY_STRING;

  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      const prop = obj[k];
      if (prop && typeof prop === 'object' && !(prop instanceof Date || prop instanceof RegExp)) {
        flatten(prop, into, prefix + k + ' ');
      } else {
        if (into[prefix] && typeof into[prefix] === 'object') {
          into[prefix][k] = prop;
        } else {
          into[prefix] = {};
          into[prefix][k] = prop;
        }
      }
    }
  }

  return into
}

function makeCss (obj) {
  const flat = flatten(obj);
  let str = JSON.stringify(flat, null, 2);
  str = str.replace(/"([^"]*)": {/g, '$1 {')
    .replace(/"([^"]*)"/g, '$1')
    .replace(/(\w*-?\w*): ([\w\d .#]*),?/g, '$1: $2;')
    .replace(/},/g, '}\n')
    .replace(/ &([.:])/g, '$1');

  str = str.substr(1, str.lastIndexOf('}') - 1);

  return str
}

function appendStyles (css) {
  let head = document.head || document.getElementsByTagName('head')[0];
  let styleElem = makeNode('style');
  styleElem.id = `${LIB_NAME}-styles`;
  styleElem.type = 'text/css';

  if (styleElem.styleSheet) {
    styleElem.styleSheet.cssText = css;
  } else {
    styleElem.appendChild(document.createTextNode(css));
  }

  head.appendChild(styleElem);
}

const config = {
  types: {ERROR, WARN, SUCCESS, INFO},
  animation: fadeOut,
  timeout: DEFAULT_TIMEOUT,
  icons: {},
  appendTarget: document.body,
  node: makeNode(),
  allowHtml: false,
  style: {
    [`.${CONTAINER_CLASS}`]: {
      position: 'fixed',
      'z-index': 99999,
      right: '12px',
      top: '12px'
    },
    [`.${NOTIFICATION_CLASS}`]: {
      cursor: 'pointer',
      padding: '12px 18px',
      margin: '0 0 6px 0',
      'background-color': '#000',
      opacity: 0.8,
      color: '#fff',
      'border-radius': '3px',
      'box-shadow': '#3c3b3b 0 0 12px',
      width: '300px',
      [`&.${ERROR_CLASS}`]: {
        'background-color': '#D5122B'
      },
      [`&.${WARN_CLASS}`]: {
        'background-color': '#F5AA1E'
      },
      [`&.${SUCCESS_CLASS}`]: {
        'background-color': '#7AC13E'
      },
      [`&.${INFO_CLASS}`]: {
        'background-color': '#4196E1'
      },
      '&:hover': {
        opacity: 1,
        'box-shadow': '#000 0 0 12px'
      }
    },
    [`.${TITLE_CLASS}`]: {
      'font-weight': '500'
    },
    [`.${MESSAGE_CLASS}`]: {
      display: 'inline-block',
      'vertical-align': 'middle',
      width: '240px',
      padding: '0 12px'
    }
  }
};

function makeNode (type = 'div') {
  return document.createElement(type)
}

function createIcon (node, type, config) {
  const iconNode = makeNode(config.icons[type].nodeType);
  const attrs = config.icons[type].attrs;

  for (const k in attrs) {
    if (attrs.hasOwnProperty(k)) {
      iconNode.setAttribute(k, attrs[k]);
    }
  }

  node.appendChild(iconNode);
}

function addElem (node, text, className, config) {
  const elem = makeNode();
  elem.className = className;
  if (config.allowHtml) {
    elem.innerHTML = text;
  } else {
    elem.appendChild(document.createTextNode(text));
  }
  node.appendChild(elem);
}

function getTypeClass (type) {
  if (type === SUCCESS) return SUCCESS_CLASS
  if (type === WARN) return WARN_CLASS
  if (type === ERROR) return ERROR_CLASS
  if (type === INFO) return INFO_CLASS

  return EMPTY_STRING
}

const miniToastr = {
  config,
  isInitialised: false,
  showMessage (message, title, type, timeout, cb, overrideConf) {
    const config = {};
    Object.assign(config, this.config);
    Object.assign(config, overrideConf);

    const notificationElem = makeNode();
    notificationElem.className = `${NOTIFICATION_CLASS} ${getTypeClass(type)}`;

    notificationElem.onclick = function () {
      config.animation(notificationElem, null);
    };

    if (title) addElem(notificationElem, title, TITLE_CLASS, config);
    if (config.icons[type]) createIcon(notificationElem, type, config);
    if (message) addElem(notificationElem, message, MESSAGE_CLASS, config);

    config.node.insertBefore(notificationElem, config.node.firstChild);
    setTimeout(() => config.animation(notificationElem, cb), timeout || config.timeout
    );

    if (cb) cb();
    return this
  },
  init (aConfig) {
    const newConfig = {};
    Object.assign(newConfig, config);
    Object.assign(newConfig, aConfig);
    this.config = newConfig;

    const cssStr = makeCss(newConfig.style);
    appendStyles(cssStr);

    newConfig.node.id = CONTAINER_CLASS;
    newConfig.node.className = CONTAINER_CLASS;
    newConfig.appendTarget.appendChild(newConfig.node);

    Object.keys(newConfig.types).forEach(v => {
      this[newConfig.types[v]] = function (message, title, timeout, cb, config) {
        this.showMessage(message, title, newConfig.types[v], timeout, cb, config);
        return this
      }.bind(this);
    }
    );

    this.isInitialised = true;

    return this
  },
  setIcon (type, nodeType = 'i', attrs = []) {
    attrs.class = attrs.class ? attrs.class + ' ' + ICON_CLASS : ICON_CLASS;

    this.config.icons[type] = {nodeType, attrs};
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

const FULLSCREENCLASS = 'mdeditor-fullscreen';

function checkFullScreen(mdEditor) {
    const container = mdEditor.getContainer();
    container.oldStyle = container.oldStyle || {};
    const oldStyle = container.oldStyle;
    const classList = container.classList;
    if (classList.contains(FULLSCREENCLASS)) {
        classList.remove(FULLSCREENCLASS);
        mdEditor.fullScreen = false;
        for (const key in oldStyle) {
            container.style[key] = oldStyle[key];
        }
        mdEditor.fire('closefullscreen', { fullScreen: mdEditor.fullScreen });
    } else {
        classList.add(FULLSCREENCLASS);
        container.oldStyle = {
            width: container.style.width,
            height: container.style.height
        };
        mdEditor.fullScreen = true;
        domSizeByWindow(container);
        mdEditor.fire('openfullscreen', { fullScreen: mdEditor.fullScreen });
    }
}

function mitt(n){return {all:n=n||new Map,on:function(t,e){var i=n.get(t);i?i.push(e):n.set(t,[e]);},off:function(t,e){var i=n.get(t);i&&(e?i.splice(i.indexOf(e)>>>0,1):n.set(t,[]));},emit:function(t,e){var i=n.get(t);i&&i.slice().map(function(n){n(e);}),(i=n.get("*"))&&i.slice().map(function(n){n(t,e);});}}}

function dragEvent(event) {
    event.stopPropagation();
    event.preventDefault();
}
const DRAGEVENTS = ['dragstart', 'dragenter', 'dragend', 'dragleave', 'dragover'];

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
    const folder = parentFileEntry ? parentFileEntry.path : '/';
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
    let fileEntryList = [], isReading = false, idx = 0;
    const readFiles = () => {
        idx = 0;
        const readFile = () => {
            if (idx < files.length) {
                const fileEntry = files[idx];
                if (fileEntry.isDirectory) {
                    idx++;
                    readFile();
                } else {
                    fileEntry.file((file) => {
                        file.path = fileEntry.path || '/';
                        file.parentName = fileEntry.parentName;
                        file.id = fileEntry.id;
                        file.pid = fileEntry.pid;
                        file.isDirectory = !!file.isDirectory;
                        files[idx] = file;
                        idx++;
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
        if (idx < dirs.length) {
            const dirEntry = dirs[idx];
            const dirRender = dirEntry.createReader();
            const readDir = () => {
                dirRender.readEntries((results) => {
                    if (results.length) {
                        results.forEach(fileEntry => {
                            fileEntry.id = uuid$2();
                            fileEntry.pid = dirEntry.id;
                            fileEntry.parentName = dirEntry.name;
                            setFilePath(fileEntry, dirEntry);
                        });
                        mergeArray(fileEntryList, results);
                        readDir();
                    } else {
                        idx++;
                        read();
                    }
                });
            };
            readDir();
        } else {
            const tempDirs = [];
            fileEntryList.forEach(fileEntry => {
                files.push(fileEntry);
                if (fileEntry.isDirectory) {
                    tempDirs.push(fileEntry);
                }
            });
            dirs = tempDirs;
            isReading = false;
        }
    };

    const id = setInterval(() => {
        if (dirs.length === 0) {
            clearInterval(id);
            readFiles();
        } else if (!isReading) {
            isReading = true;
            fileEntryList = [];
            idx = 0;
            read();
        }
    }, 1);
}

class FileDND {
    constructor(ele) {
        if (!ele || !(ele instanceof HTMLElement)) {
            console.error('ele is error,It should be HTMLElement instance');
            return;
        }
        this.ele = ele;
        this.files = [];
        this._bindEvents = false;
        this.emitter = mitt();
    }

    dnd(callback) {
        if (!this.ele) {
            console.error('not find ele');
            return;
        }
        if (!callback) {
            console.error('callback is null');
            return;
        }
        if (!this._bindEvents) {
            DRAGEVENTS.forEach(eventName => {
                this.ele.addEventListener(eventName, dragEvent);
            });
            const dropEvent = (event) => {
                event.stopPropagation();
                event.preventDefault();
                const df = event.dataTransfer;
                const items = df.items;
                this.emitter.emit('readstart', this);
                readFileItems(items, (files) => {
                    const callback = this.dndBackCall.bind(this);
                    this.files = files;
                    callback(files.filter(file => {
                        return file instanceof File;
                    }));
                    this.emitter.emit('readend', this);
                });
            };
            this.dropEvent = dropEvent;
            this._bindEvents = true;
            this.ele.addEventListener('drop', dropEvent);
        }
        this.dndBackCall = callback;
    }

    dispose() {
        if (this._bindEvents) {
            DRAGEVENTS.forEach(eventName => {
                this.ele.removeEventListener(eventName, dragEvent);
            });
            this.ele.removeEventListener('drop', this.dropEvent);
        }
        this.ele = null;
        this.files = null;
        this.emitter.all.clear();
        return this;
    }

    toTree() {
        const files = this.files;
        const fileMap = {};
        files.forEach(file => {
            const { id, path, name, parentName } = file;
            if (!fileMap[id]) {
                fileMap[id] = {
                    id,
                    name,
                    label: name,
                    path,
                    parentName: parentName,
                    children: [],
                    isDirectory: file.isDirectory
                };
            }
        });
        files.forEach(file => {
            const { pid, id } = file;
            if (fileMap[pid]) {
                fileMap[pid].children.push(fileMap[id]);
            }
        });
        // sort children Folder first, file later
        for (const id in fileMap) {
            const children = fileMap[id].children;
            const dirs = [], files = [];
            children.forEach(child => {
                if (child.isDirectory) {
                    dirs.push(child);
                } else {
                    files.push(child);
                }
            });
            fileMap[id].children = mergeArray(dirs, files);
        }
        return Object.values(fileMap).filter(d => {
            return !d.parentName;
        });

    }

    toFolderTree() {
        const nodes = this.toTree() || [];
        let text = '';
        const loopNode = (node, level = 1) => {
            const { name } = node;
            let prefix = '├─ ';
            if (level > 1) {
                const array = [];
                while (array.length < level - 1) {
                    array.push('| ');
                }
                prefix = array.join('').toString() + prefix;
            }
            text += `${prefix}${name} \n`;
            const children = node.children;
            if (children && children.length) {
                level++;
                children.forEach(child => {
                    loopNode(child, level);
                });
            }
        };
        return nodes.map(node => {
            text = '';
            loopNode(node);
            return text;
        }).join('').toString();
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
::: info\n
This is an info box.

:::\n
`;
const TIPBOX = `
::: tip\n
This is a tip.

:::\n
`;
const WARNBOX = `
::: warning\n
This is a warning.

:::\n
`;
const DANGERBOX = `
::: danger\n
This is a dangerous warning.

:::\n
`;

const MERMAID = `
::: mermaid\n
flowchart LR
    A[Hard] -->|Text| B(Round)
    B --> C{Decision}
    C -->|One| D[Result 1]
    C -->|Two| E[Result 2]
:::\n
`;

const KATEX = `
$\\sqrt{3x-1}+(1+x)^2$\n
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

const CODEGROUP = '::: code-group\n\n' +
    '```js [add.js]' +
    `${JSCODE}` +
    '```\n\n' +
    '```ts [add.ts]' +
    `${TSCODE}` +
    '```\n' +
    ':::';

const SWIPER = `
::: swiper\n

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
:::\n`;

const TASKLIST = `
- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media
`;

const FLOWCHART = `
::: flowchart\n
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

const hTitle = function (mdEditor, text) {
    const result = mdEditor.getCurrentRange();
    if (!validateSelect(result)) {
        return;
    }
    const editor = mdEditor.getEditor();
    const [range] = result;
    editor.executeEdits('', [
        {
            range,
            text
        }
    ]);
};

const tableClick = function (mdEditor, text) {
    const result = mdEditor.getCurrentRange();
    if (!validateSelect(result)) {
        return;
    }
    const editor = mdEditor.getEditor();
    const [range] = result;
    editor.executeEdits('', [
        {
            range,
            text
        }
    ]);
};

const codeClick = function (mdEditor, text) {
    const result = mdEditor.getCurrentRange();
    if (!validateSelect(result)) {
        return;
    }
    const editor = mdEditor.getEditor();
    const [range] = result;
    editor.executeEdits('', [
        {
            range,
            text
        }
    ]);
};

// ====
const containerClick = function (mdEditor, text) {
    const result = mdEditor.getCurrentRange();
    if (!validateSelect(result)) {
        return;
    }
    const editor = mdEditor.getEditor();
    const [range] = result;
    editor.executeEdits('', [
        {
            range,
            text
        }
    ]);
};

function updateDomPosition(themeIconDom, themeDom) {
    computePosition(themeIconDom, themeDom, {
        placement: 'bottom'
    }).then(({ x, y }) => {
        Object.assign(themeDom.style, {
            left: `${x}px`,
            top: `${y}px`
        });
    });
}

function rangeEqual(range1, range2) {
    return range1.endColumn === range2.endColumn &&
        range1.startColumn === range2.startColumn &&
        range1.startLineNumber === range2.startLineNumber &&
        range1.endLineNumber === range2.endLineNumber;
}

const ICONS = [
    {
        name: 'icon-zitijiacu',
        title: '加粗',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getSelectRange();
            if (!validateSelect(result)) {
                return;
            }
            const [starRange, endRange] = result;
            if (rangeEqual(starRange, endRange)) {
                return;
            }
            editor.executeEdits('', [
                {
                    range: starRange,
                    text: '**'
                },
                {
                    range: endRange,
                    text: '**'
                }
            ]);
        }
    },
    {
        name: 'icon-strikethrough',
        title: '删除线',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getSelectRange();
            if (!validateSelect(result)) {
                return;
            }
            const [starRange, endRange] = result;
            if (rangeEqual(starRange, endRange)) {
                return;
            }
            editor.executeEdits('', [
                {
                    range: starRange,
                    text: '~~'
                },
                {
                    range: endRange,
                    text: '~~'
                }
            ]);
        }
    },
    {
        name: 'icon-italic',
        title: '斜体',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getSelectRange();
            if (!validateSelect(result)) {
                return;
            }
            const [starRange, endRange] = result;
            if (rangeEqual(starRange, endRange)) {
                return;
            }
            editor.executeEdits('', [
                {
                    range: starRange,
                    text: '*'
                },
                {
                    range: endRange,
                    text: '*'
                }
            ]);
        }
    },
    {
        name: 'icon-yinyong',
        title: '引用',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '> hello\n'
                }
            ]);
        }
    },
    {
        name: 'icon-daxie',
        title: '大写',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getSelectText();
            if (!validateSelect(result)) {
                return;
            }
            const [range, text] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: text.toUpperCase()
                }
            ]);
        }
    },
    {
        name: 'icon-xiaoxie',
        title: '小写',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getSelectText();
            if (!validateSelect(result)) {
                return;
            }
            const [range, text] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: text.toLowerCase()
                }
            ]);
        }
    },
    {
        name: 'icon-h11',
        title: '标题1',
        enable: false,
        click: function () {
            hTitle(this.getMDEditor(), '# ');
        }
    },
    {
        name: 'icon-h',
        title: '标题2',
        enable: false,
        click: function () {
            hTitle(this.getMDEditor(), '## ');
        }
    },
    {
        name: 'icon-h3',
        title: '标题3',
        enable: false,
        click: function () {
            hTitle(this.getMDEditor(), '### ');
        }
    },
    {
        name: 'icon-h2',
        title: '标题4',
        enable: false,
        click: function () {
            hTitle(this.getMDEditor(), '#### ');
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
        name: 'icon-31liebiao',
        title: '无序列表',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '- item1  \n- item2  '
                }
            ]);
        }
    },
    {
        name: 'icon-orderedList',
        title: '有序列表',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '1.  \n2. '
                }
            ]);
        }
    },
    {
        name: 'icon-wodezhuanti',
        title: '任务列表',
        // enable: false,
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: TASKLIST
                }
            ]);
        }
    },
    {
        name: 'icon-hr',
        title: '横线',
        // enable: false,
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '------------\n'
                }
            ]);
        }
    },
    {
        name: 'icon-lianjie',
        title: '插入链接',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '[mdpress-editor](https://github.com/deyihu/mdpress-editor)'
                }
            ]);
        }
    },
    {
        name: 'icon-tupiantianjia',
        title: '插入图片',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '![image](https://markdown.com.cn/hero.png)'
                }
            ]);
        }
    },
    {
        name: 'icon-wangyelianjie',
        title: '插入iframe',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '<iframe src="https://markdown.com.cn/cheat-sheet.html#%E6%80%BB%E8%A7%88"></iframe>'
                }
            ]);
        }
    },
    {
        name: 'icon-biaodanzujian-biaoge',
        title: '表格',
        click: function () {
            const [mdEditor] = getEditors(this);
            const miniToastr = getToastr();
            if (mdEditor.dialog) {
                miniToastr.warn('检测到你已经打开了一个对话框请关闭当前的才可以使用', '警告', 3000);
                return;
            }
            const dialog = createDialog();
            mdEditor.dom.appendChild(dialog);
            dialog.show();
            mdEditor.dialog = dialog;
            const cancelBtn = dialog.querySelector('#table-btn-cancel');
            const confirmBtn = dialog.querySelector('#table-btn-confirm');
            on$1(cancelBtn, 'click', () => {
                dialog.close();
                mdEditor.dialog = null;
                mdEditor.dom.removeChild(dialog);
            });
            on$1(confirmBtn, 'click', () => {
                const rowsDom = dialog.querySelector('#table-rows');
                const colsDom = dialog.querySelector('#table-cols');
                let rows = rowsDom.value, cols = colsDom.value;
                rows = Math.abs(rows);
                cols = Math.abs(cols);
                if (rows === 0 || cols === 0) {
                    miniToastr.warn('表格行数或者列数为0', '警告', 3000);
                    return;
                }
                const text = getTableMdText(rows, cols);
                tableClick(mdEditor, text);
                dialog.close();
                mdEditor.dialog = null;

            });
        }
    },
    {
        name: 'icon-code',
        title: '插入代码',
        click: function () {
            codeClick(this.getMDEditor(), '```\n\n```\n');
        }
    },
    {
        name: 'icon-js',
        title: '插入js code',
        click: function () {
            codeClick(this.getMDEditor(), '```js' + JSCODE + '```\n');
        }
    },
    {
        name: 'icon-Artboard',
        title: '插入ts code',
        click: function () {
            codeClick(this.getMDEditor(), '```ts' + TSCODE + '```\n');
        }
    },
    {
        name: 'icon-bootstrap_tabs',
        title: '插入代码组',
        click: function () {
            containerClick(this.getMDEditor(), CODEGROUP);
        }
    },
    {
        name: 'icon-badge',
        title: '插入Badge',
        click: function () {
            containerClick(this.getMDEditor(), '<span class="VPBadge tip">^1.9.0</span>');
        }
    },
    {
        name: 'icon-093info',
        title: '信息容器',
        click: function () {
            containerClick(this.getMDEditor(), INFOBOX);
        }
    },
    {
        name: 'icon-yiwancheng',
        title: '提示容器',
        click: function () {
            containerClick(this.getMDEditor(), TIPBOX);
        }
    },
    {
        name: 'icon-jinggao',
        title: '警告容器',
        click: function () {
            containerClick(this.getMDEditor(), WARNBOX);
        }
    },
    {
        name: 'icon-cuowukongxin',
        title: '危险容器',
        click: function () {
            containerClick(this.getMDEditor(), DANGERBOX);
        }
    },
    {
        name: 'icon-xuekegongshiku_Char-rm-uk',
        title: 'Katex',
        click: function () {
            containerClick(this.getMDEditor(), KATEX);
        }
    },
    {
        name: 'icon-liuchengtu',
        title: 'mermaid',
        click: function () {
            containerClick(this.getMDEditor(), MERMAID);
        }
    },
    {
        name: 'icon-flowChart',
        title: 'flowchart',
        click: function () {
            containerClick(this.getMDEditor(), FLOWCHART);
        }
    },
    {
        name: 'icon-swiper',
        title: 'swiper',
        click: function () {
            containerClick(this.getMDEditor(), SWIPER);
        }
    },
    {
        name: 'icon-excel',
        title: 'excel',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '\nexcel:https://sheetjs.com/pres.numbers\n'
                }
            ]);
        }
    },
    {
        name: 'icon-erweima',
        title: '二维码',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '\nqrcode:https://developer.mozilla.org/zh-CN/\n'
                }
            ]);
        }
    },
    {
        name: 'icon-shijian',
        title: '时间',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: dayjs().format('YYYY-MM-DD HH:mm:ss')
                }
            ]);
        }
    },
    {
        name: 'icon-emoji',
        title: 'github emoji',
        click: function () {
            // const [mdEditor, editor] = getEditors(this);
            // const result = mdEditor.getCurrentRange();
            // if (!validateSelect(result)) {
            //     return;
            // }
            // const [range] = result;
            // editor.executeEdits('', [
            //     {
            //         range,
            //         text: ':tada: :dog: :cat: '
            //     }
            // ]);
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
        name: 'icon-mulu',
        title: '(toc)table of content',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '\n[[toc]]\n'
                }
            ]);
        }
    },
    {
        name: 'icon-naotu',
        title: 'markmap',
        enable: false,
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '\n[[markmap]]\n'
                }
            ]);
        }
    },
    {
        name: 'icon-daoruwenjian',
        title: 'include a markdown file',
        click: function () {
            const [mdEditor, editor] = getEditors(this);
            const result = mdEditor.getCurrentRange();
            if (!validateSelect(result)) {
                return;
            }
            const [range] = result;
            editor.executeEdits('', [
                {
                    range,
                    text: '\ninclude://mdpress.glicon.design/p/files/2023-09-03/t83dlckX52cWiNtzBHkOL.md\n'
                }
            ]);
        }
    },
    {
        name: 'icon-m-geshihuawenzi',
        title: '格式化文档',
        enable: false,
        click: function () {
            // editor.getAction('editor.action.formatDocument').run();
        }
    },
    {
        name: 'icon-icon-48-mulushu',
        title: '文件夹目录树',
        // enable: false,
        click: function () {
            const [mdEditor] = getEditors(this);
            const miniToastr = getToastr();
            if (mdEditor.dialog) {
                miniToastr.warn('检测到你已经打开了一个对话框请关闭当前的才可以使用', '警告', 3000);
                return;
            }
            const dialog = createFolderTreeDialog();
            mdEditor.dom.appendChild(dialog);
            dialog.show();
            mdEditor.dialog = dialog;
            const cancelBtn = dialog.querySelector('#table-btn-cancel');
            // const confirmBtn = dialog.querySelector('#table-btn-confirm');
            let fileDND;

            const close = () => {
                dialog.close();
                mdEditor.dialog = null;
                mdEditor.dom.removeChild(dialog);
                fileDND && fileDND.dispose();
            };
            on$1(cancelBtn, 'click', close);
            const fileContainer = dialog.querySelector('.file-dnd-container');
            if (fileContainer) {
                fileDND = new FileDND(fileContainer);
                fileDND.dnd((files) => {
                    // const tree = fileDND.toTree();
                    const text = fileDND.toFolderTree();
                    codeClick(this.getMDEditor(), '```\n' + text + '```\n');
                    close();
                });
            }
        }
    }

];

function checkDomDisplay(dom) {
    let display = getDomDisplay(dom);
    if (display === 'none') {
        display = 'block';
    } else if (display === 'block') {
        display = 'none';
    } else {
        display = 'block';
    }
    return display;
}

const ICONS_RIGHT = [
    {
        name: 'icon-mulu1',
        title: '目录',
        position: 'right',
        click: function () {
            const mdEditor = this.getMDEditor();
            mdEditor.tocOpen = !mdEditor.tocOpen;
            mdEditor._checkTocState();
        }
    },
    {
        name: 'icon-pifuzhuti-xianxing',
        title: '主题',
        position: 'right',
        click: function () {
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
        name: 'icon-pos_nav_icon_implements',
        title: 'export file',
        position: 'right',
        click: function () {
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
        name: 'icon-yulan',
        title: '预览',
        position: 'right',
        click: function () {
            const mdEditor = this.getMDEditor();
            mdEditor.preview = !mdEditor.preview;
            mdEditor._checkPreviewState();
        }
    },
    {
        name: 'icon-quanping',
        title: '全屏',
        position: 'right',
        click: function () {
            const mdEditor = this.getMDEditor();
            checkFullScreen(mdEditor);
        }
    },
    {
        name: 'icon-heisemoshi',
        title: '暗黑模式',
        position: 'right',
        click: function () {
            const mdEditor = this.getMDEditor();
            mdEditor.dark = !mdEditor.dark;
            mdEditor._checkDark();
        }
    },
    {
        name: 'icon-github',
        title: 'github',
        position: 'right',
        click: function () {
            window.open('https://github.com/deyihu/mdpress-editor');
        }
    }
];

function createDefaultIcons(mdEditor) {
    const icons = ICONS.concat(ICONS_RIGHT.reverse()).map(d => {
        return new ToolIcon(Object.assign(d, { icon: d.name }));
    });
    icons.forEach(icon => {
        if (!icon.isEnable()) {
            return;
        }
        if (icon.options.click) {
            icon.on('click', icon.options.click);
        } else {
            console.warn(`not find click event for icon:${icon.options.title}`);
        }
        icon.addTo(mdEditor);
    });
}

// import { stopPropagation } from './util';
/**
 * This provides methods used for event handling. It's a mixin and not meant to be used directly.
 * @mixin Eventable
 */

const Eventable = Base =>

    class extends Base {
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
                return this._switch('on', eventsOn, handler);
            }
            if (!handler) {
                return this;
            }
            if (!this._eventMap) {
                this._eventMap = {};
            }
            const eventTypes = eventsOn.toLowerCase().split(' ');
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
                const l = handlerChain.length;
                if (l > 0) {
                    for (let i = 0; i < l; i++) {
                        if (handler === handlerChain[i].handler && handlerChain[i].context === context) {

                            console.warn(this, `find '${eventsOn}' handler:`, handler, ' The old listener function will be removed');

                            return this;
                        }
                    }
                }
                handlerChain.push({
                    handler: handler,
                    context: context
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
                for (const p in eventTypes) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (eventTypes.hasOwnProperty(p)) {
                        once[p] = this._wrapOnceHandler(p, eventTypes[p], context);
                    }
                }
                return this._switch('on', once);
            }
            const evetTypes = eventTypes.split(' ');
            for (let i = 0, l = evetTypes.length; i < l; i++) {
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
                return this._switch('off', eventsOff, handler);
            }
            if (!handler) {
                return this;
            }
            const eventTypes = eventsOff.split(' ');
            let eventType, listeners, wrapKey;
            if (!context) {
                context = this;
            }
            for (let j = 0, jl = eventTypes.length; j < jl; j++) {
                eventType = eventTypes[j].toLowerCase();
                wrapKey = 'Z__' + eventType;
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
                if (handler === handlerChain[i].handler &&
                    (isNil(context) || handlerChain[i].context === context)) {
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
            const key = 'Z__' + evtType;
            let called = false;
            const fn = function onceHandler() {
                if (called) {
                    return;
                }
                delete fn[key];
                called = true;
                if (context) {
                    handler.apply(context, arguments);
                } else {
                    handler.apply(this, arguments);
                }
                me.off(evtType, onceHandler, this);
            };
            fn[key] = handler;
            return fn;
        }

        _switch(to, eventKeys, context) {
            for (const p in eventKeys) {
                // eslint-disable-next-line no-prototype-builtins
                if (eventKeys.hasOwnProperty(p)) {
                    this[to](p, eventKeys[p], context);
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
            param['type'] = eventType;
            param['target'] = this._eventTarget || this;
            // in case of deleting a listener in a execution, copy the handlerChain to execute.
            const queue = handlerChain.slice(0);
            let context, bubble, passed;
            for (let i = 0, len = queue.length; i < len; i++) {
                if (!queue[i]) {
                    continue;
                }
                context = queue[i].context;
                bubble = true;
                passed = extend({}, param);
                if (context) {
                    bubble = queue[i].handler.call(context, passed);
                } else {
                    bubble = queue[i].handler(passed);
                }
                // stops the event propagation if the handler returns false.
                if (bubble === false) {
                    if (param['domEvent']) {
                        stopPropagation(param['domEvent']);
                    }
                }
            }
            return this;
        }
    };

function checkIframe(dom) {
    const iframes = dom.querySelectorAll('iframe');
    if (!iframes.length) {
        return;
    }
    iframes.forEach(iframe => {
        if (iframe.dataset.linked) {
            return;
        }
        const parentNode = iframe.parentNode;
        const link = createLinkEle(iframe.src);
        parentNode.insertBefore(link, iframe);
        iframe.dataset.linked = true;
    });
}

function createLinkEle(url) {
    const a = createDom('a');
    a.href = url;
    a.target = '_blank';
    a.textContent = 'Open in New Tab';
    return a;
}

const OPTIONS$1 = {
    requestCount: 5
};

function getHost(url) {
    if (typeof document !== 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        return a.host;
    }
    const urlArray = url.split('//');
    if (urlArray.length < 2) {
        return null;
    }
    let host = urlArray[1];
    host = host.substring(0, host.indexOf('/'));
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
        const p = waitQueue[0];
        waitQueue.splice(0, 1);
        runingQueue.push(p);
        p.start();
        p.isRuning = true;
        return this;
    }

    _createPromise(url, host, options) {
        const controller = new AbortController();
        const signal = controller.signal;
        options.signal = signal;
        const uid = uuid$1();

        let tResolve, tReject;
        const start = () => {
            fetch(url, options).then(res => {
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
            }).catch(err => {
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
        promise.uid = uid;
        promise.host = host;
        return promise;
    }

    createFetch(url, options = {}) {
        const host = getHost(url);
        if (!host) {
            console.error('not find host from', url);
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
    requestCount: 6 // Concurrent number of fetch requests
});

const INCLUDE_FLAG = 'include:';
function checkInclude(text, callback) {
    if (text.indexOf(INCLUDE_FLAG) === -1) {
        callback(text, false);
        return;
    }
    const array = text.split(INCLUDE_FLAG);
    const texts = [];
    for (let i = 1, len = array.length; i < len; i++) {
        const line = array[i];
        let url = '';
        for (let j = 0, len1 = line.length; j < len1; j++) {
            const char = line[j];
            if (char === ' ' || char === '\n' || char === '\r') {
                texts.push({
                    start: 0,
                    end: j,
                    url: url,
                    line
                });
                break;
            }
            url += char;
        }
    }
    let idx = 0;
    const end = () => {
        idx++;
        if (idx === texts.length) {
            texts.forEach(singleText => {
                const { text, end, url } = singleText;
                if (!text) {
                    singleText.line = `<p style="color:red">fetch snip file error,url:${url}</p>` + singleText.line.substring(end, Infinity);
                } else {
                    singleText.line = `${text}\n` + singleText.line.substring(end, Infinity);
                }
            });
            let value = array[0];
            texts.forEach(singleText => {
                value += singleText.line;
            });
            callback(value, true);
        }
    };
    texts.forEach(singleText => {
        const promise = fetchScheduler.createFetch(singleText.url, {
            // ...
        });
        promise.then(res => res.text()).then(text => {
            singleText.text = text;
            end();
        }).catch(err => {
            console.error(err);
            end();
        });
    });
    // callback(text);
}

function getTitleDom(dom, title, lineNumber) {
    lineNumber += '';
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
    title = title.replaceAll(' ', '-');
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

// function getCurrentTitleDoms(dom, lineNum) {
//     console.log(lineNum);
//     const nodes = dom.children;
//     let preNode, nextNode, offsetLines = 0, startLine, endLine;
//     for (let i = 0, len = nodes.length; i < len; i++) {
//         const node = nodes[i];
//         const tag = node.tagName;
//         if (!isHeadTag(tag)) {
//             continue;
//         }
//         let lineNumber = node.getAttribute('linenumber');
//         lineNumber = parseInt(lineNumber);
//         if (lineNumber <= lineNum) {
//             preNode = node;
//             offsetLines = lineNum - lineNumber;
//             startLine = lineNumber;
//         }
//         if (lineNumber > lineNum) {
//             nextNode = node;
//             endLine = lineNumber;
//             break;
//         }
//     }
//     return {
//         preNode, nextNode, offsetLines, startLine, endLine
//     };
// }

// export function calScroll(editor, dom) {
//     const ranges = editor.getVisibleRanges();
//     if (!ranges.length) {
//         return;
//     }
//     const range = ranges[0];
//     // const model = editor.getModel();
//     const { startLineNumber } = range;
//     const { preNode, nextNode, offsetLines, startLine, endLine } = getCurrentTitleDoms(dom, startLineNumber);
//     if (!preNode) {
//         return;
//     }
//     console.log(preNode.id, nextNode.id);
//     const node = preNode;
//     let lineHeight = 22;
//     if (nextNode) {
//         const raws = endLine - startLine;
//         if (raws > 10) {
//             const offsetHeight = nextNode.offsetTop - node.offsetTop;
//             lineHeight = offsetHeight / raws;
//         }

//     }
//     // console.log(title);
//     // console.log(node);
//     const top = node.offsetTop || 0;
//     const scrollTop = top + offsetLines * lineHeight - 40;
//     return scrollTop;

// }

function calScroll(editor, dom) {
    const ranges = editor.getVisibleRanges();
    if (!ranges.length) {
        return;
    }
    const range = ranges[0];
    const model = editor.getModel();
    const { startLineNumber } = range;
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
        if (content !== '') {
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
        if (content !== '') {
            nextOffsetLines++;
        }
        lineNumber++;
    }
    if (nextTitle) {
        const result = getTitleDom(dom, nextTitle, lineNumber);
        if (result) {
            nextNode = result.node;
        }
    }
    const { node } = result;
    // const { preNode, nextNode, offsetLines, startLine, endLine } = getCurrentTitleDoms(dom, startLineNumber);
    // if (!preNode) {
    //     return;
    // }
    // console.log(preNode.id, nextNode.id);
    // const node = preNode;
    let lineHeight = 22;
    if (nextNode) {
        const raws = nextOffsetLines + offsetLines;
        if (raws > 10) {
            const offsetHeight = nextNode.offsetTop - node.offsetTop;
            lineHeight = offsetHeight / raws;
        }

    }
    // console.log(title);
    // console.log(node);
    const top = node.offsetTop || 0;
    const scrollTop = top + offsetLines * lineHeight - 40;
    return scrollTop;
}

function removePreBgColor(dom) {
    const pres = dom.querySelectorAll('pre');
    pres.forEach(pre => {
        pre.style.removeProperty('background-color');
    });
}

const themes = [
    'vitepress',
    'v-green',
    'simplicity-green',
    'vuepress',
    'github',
    'github-dark',
    'serene-rose',
    'awesome-green',
    'channing-cyan',
    'chocolate',
    'condensed-night-purple',
    'nico',
    'rude-crab',
    'fancy',
    'jzman',
    'cyanosis',
    'devui-blue',
    'geek-black',
    'mk-cute',
    'scrolls',
    'smart-blue',
    'z-blue',
    'arknights',
    'Chinese-red',
    'greenwillow'
];

function checkLinks(dom) {
    const links = dom.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.indexOf('http:') > -1 || href.indexOf('https://') > -1 || href.indexOf('//') > -1) {
            link.setAttribute('target', '_blank');
        }
    });
}

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
        const inited = codeGroup.inited;
        if (inited) {
            return;
        }
        codeGroup.inited = true;
        const tabsDom = codeGroup.querySelector('.tabs');
        const blocksDom = codeGroup.querySelector('.blocks');
        const radios = tabsDom.querySelectorAll('input[type=radio]');
        const pres = blocksDom.querySelectorAll('pre');
        domActive(pres[0]);
        radios.forEach((radio, index) => {
            on$1(radio, 'click', () => {
                pres.forEach(pre => {
                    domActive(pre, false);
                });
                const pre = pres[index];
                domActive(pre);
            });
        });
    });
}

function initMermaid(dom) {
    const mermaid = getMermaid();
    if (!mermaid) {
        getToastr().error('not find mermaid,please registerMermaid');
        return;
    }
    mermaid.initialize({ startOnLoad: false });
    const els = dom.querySelectorAll('.mermaid');
    const notInit = [];
    for (let i = 0, len = els.length; i < len; i++) {
        const dataset = els[i].dataset;
        if (!dataset.processed) {
            notInit.push(1);
        }
    }
    if (notInit.length) {
        mermaid.run({
            nodes: els
        });
    }
}

const transformer = new Transformer();

function fromatMarkMapJSON(text) {
    const { root, features } = transformer.transform(text);
    return JSON.stringify({
        root,
        features
    });
}

function initSwiper(dom, mdEditor) {
    if (mdEditor.swipers) {
        mdEditor.swipers.forEach(swiper => {
            swiper.destroy();
        });
    }
    const els = dom.querySelectorAll('.swiper');
    if (!els.length) {
        return [];
    }
    const Swiper = getSwiper();
    if (!Swiper) {
        const message = 'not find swiper,please registerSwiper';
        console.error(message);
        getToastr().error(message);
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
    mdEditor.swipers = swipers;
}

/* eslint-disable no-var */
// https://github.com/timaschew/auto-toc.js/blob/master/index.js
function makeToc(contentElement, tocSelector, options) {
    if (options == null) {
        options = {};
    }
    if (contentElement == null) {
        throw new Error('need to provide a selector where to scan for headers');
    }
    // if (tocSelector == null) {
    //     throw new Error('need to provide a selector where inject the TOC');
    // }
    if (typeof contentElement === 'string') {
        contentElement = document.querySelectorAll(contentElement + ' > *');
    } else {
        contentElement = contentElement.children;
    }
    var allChildren = Array.prototype.slice.call(contentElement);
    var min = 6;
    var headers = allChildren.filter(function (item) {
        var classesList = item.className.split(' ');
        // eslint-disable-next-line eqeqeq
        if (classesList.indexOf('toc-ignore') != -1) {
            return false;
        }
        // eslint-disable-next-line eqeqeq
        if ((options.ignore || []).indexOf(getText(item)) != -1) {
            return false;
        }
        var splitted = item.nodeName.split('');
        var headingNumber = parseInt(splitted[1]);
        if (splitted[0] === 'H' && headingNumber >= 1 && headingNumber <= (options.max || 6)) {
            min = Math.min(min, headingNumber);
            return true;
        }
    });
    var hierarchy = createHierarchy(headers, min);
    var toc = parseNodes(hierarchy.nodes);
    var container = document.querySelector(tocSelector);
    setText(container, '');
    container.appendChild(toc);
}

function createHierarchy(headers, minLevel) {
    var hierarchy = { nodes: [] };
    window.hierarchy = hierarchy;
    var previousNode = { parent: hierarchy };
    var level = minLevel;
    var init = false;
    headers.forEach(function (header) {
        var headingNumber = parseInt(header.nodeName.substr(1));
        var object = {
            title: getText(header),
            link: window.location.pathname + '#' + header.id,
            originLevel: headingNumber,
            nodes: []
        };
        if (headingNumber === level) {
            object.parent = previousNode.parent;
            // keep level
        } else if (headingNumber - level >= 1) {
            // go one step deeper, regardless how much
            // the difference between headingNumber and level is
            if (init === false) {
                var missingParent = {
                    parent: previousNode.parent,
                    title: '',
                    link: '',
                    originLevel: NaN,
                    nodes: []
                };
                previousNode.parent.nodes.push(missingParent);
                previousNode = missingParent;
            }
            object.parent = previousNode;
            level++;
        } else if (level - headingNumber >= 1) {
            // go one or more step up again
            var ref = previousNode.parent;
            while (level - headingNumber >= 1) {
                ref = ref.parent;
                level--;
            }
            object.parent = ref;
        } else {
            console.error('unkown toc path');
        }
        object.parent.nodes.push(object);
        previousNode = object;
        init = true;
    });
    return hierarchy;
}

function parseNodes(nodes) {
    var ul = document.createElement('UL');
    for (var i = 0; i < nodes.length; i++) {
        ul.appendChild(parseNode(nodes[i]));
    }
    return ul;
}

function parseNode(node) {
    var li = document.createElement('LI');
    var a = document.createElement('A');
    setText(a, node.title);
    // a.href = node.link;
    a.href = 'javascript:void(0)';
    li.appendChild(a);
    if (node.nodes) {
        li.appendChild(parseNodes(node.nodes));
    }
    return li;
}

function getText(elem) {
    if (elem.textContent != null) {
        return elem.textContent;
    } else {
        // eslint-disable-next-line no-unused-expressions
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

// module.exports = makeToc;
// module.exports.update = function () {
//     var element = document.querySelector('[data-toc]');
//     if (element != null) {
//         var options = {};
//         var ignore = (element.attributes.getNamedItem('data-toc-ignore') || {}).value
//         var max = (element.attributes.getNamedItem('data-toc-max') || {}).value
//         if (ignore != null) {
//             options.ignore = ignore;
//         }
//         if (max != null) {
//             options.max = parseInt(max);
//         }
//         makeToc(element.parentNode, '[data-toc]', options);
//     }
// };
// window.addEventListener('load', module.exports.update);

function initQRCode(dom) {
    const els = dom.querySelectorAll('.qrcode-container');
    if (!els.length) {
        return [];
    }
    const QRCode = getQRCode();
    if (!QRCode) {
        const message = 'not find QRCode,please registerQRCode';
        console.error(message);
        getToastr().error(message);
        return [];
    }
    const swipers = [];
    // console.log(Swiper);
    els.forEach(el => {
        if (el.dataset.inited) {
            return;
        }
        const text = el.textContent;
        el.innerHTML = '';
        // console.log(text);
        const qrcode = new QRCode(el, {
            text,
            width: 128,
            height: 128,
            colorDark: '#000000',
            colorLight: '#ffffff',
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

  <script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/10.2.0/swiper-bundle.min.js"></script>
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

    </script>

  </body>
</html>
`;
function exportHTML(html, styleText) {
    return TEMPLATE$1.replaceAll('{html}', html).replaceAll('{style}', styleText);
}

var print = {exports: {}};

(function (module, exports) {
	(function webpackUniversalModuleDefinition(root, factory) {
		module.exports = factory();
	})(window, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId]) {
	/******/ 			return installedModules[moduleId].exports;
	/******/ 		}
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			i: moduleId,
	/******/ 			l: false,
	/******/ 			exports: {}
	/******/ 		};
	/******/
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	/******/
	/******/ 		// Flag the module as loaded
	/******/ 		module.l = true;
	/******/
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/
	/******/
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	/******/
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	/******/
	/******/ 	// define getter function for harmony exports
	/******/ 	__webpack_require__.d = function(exports, name, getter) {
	/******/ 		if(!__webpack_require__.o(exports, name)) {
	/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
	/******/ 		}
	/******/ 	};
	/******/
	/******/ 	// define __esModule on exports
	/******/ 	__webpack_require__.r = function(exports) {
	/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
	/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	/******/ 		}
	/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
	/******/ 	};
	/******/
	/******/ 	// create a fake namespace object
	/******/ 	// mode & 1: value is a module id, require it
	/******/ 	// mode & 2: merge all properties of value into the ns
	/******/ 	// mode & 4: return value when already ns object
	/******/ 	// mode & 8|1: behave like require
	/******/ 	__webpack_require__.t = function(value, mode) {
	/******/ 		if(mode & 1) value = __webpack_require__(value);
	/******/ 		if(mode & 8) return value;
	/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
	/******/ 		var ns = Object.create(null);
	/******/ 		__webpack_require__.r(ns);
	/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
	/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
	/******/ 		return ns;
	/******/ 	};
	/******/
	/******/ 	// getDefaultExport function for compatibility with non-harmony modules
	/******/ 	__webpack_require__.n = function(module) {
	/******/ 		var getter = module && module.__esModule ?
	/******/ 			function getDefault() { return module['default']; } :
	/******/ 			function getModuleExports() { return module; };
	/******/ 		__webpack_require__.d(getter, 'a', getter);
	/******/ 		return getter;
	/******/ 	};
	/******/
	/******/ 	// Object.prototype.hasOwnProperty.call
	/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
	/******/
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	/******/
	/******/
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(__webpack_require__.s = 0);
	/******/ })
	/************************************************************************/
	/******/ ({

	/***/ "./src/index.js":
	/*!**********************!*\
	  !*** ./src/index.js ***!
	  \**********************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	/* harmony import */ __webpack_require__(/*! ./sass/index.scss */ "./src/sass/index.scss");
	/* harmony import */ var _js_init__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./js/init */ "./src/js/init.js");


	var printJS = _js_init__WEBPACK_IMPORTED_MODULE_1__["default"].init;

	if (typeof window !== 'undefined') {
	  window.printJS = printJS;
	}

	/* harmony default export */ __webpack_exports__["default"] = (printJS);

	/***/ }),

	/***/ "./src/js/browser.js":
	/*!***************************!*\
	  !*** ./src/js/browser.js ***!
	  \***************************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	var Browser = {
	  // Firefox 1.0+
	  isFirefox: function isFirefox() {
	    return typeof InstallTrigger !== 'undefined';
	  },
	  // Internet Explorer 6-11
	  isIE: function isIE() {
	    return navigator.userAgent.indexOf('MSIE') !== -1 || !!document.documentMode;
	  },
	  // Edge 20+
	  isEdge: function isEdge() {
	    return !Browser.isIE() && !!window.StyleMedia;
	  },
	  // Chrome 1+
	  isChrome: function isChrome() {
	    var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;
	    return !!context.chrome;
	  },
	  // At least Safari 3+: "[object HTMLElementConstructor]"
	  isSafari: function isSafari() {
	    return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || navigator.userAgent.toLowerCase().indexOf('safari') !== -1;
	  },
	  // IOS Chrome
	  isIOSChrome: function isIOSChrome() {
	    return navigator.userAgent.toLowerCase().indexOf('crios') !== -1;
	  }
	};
	/* harmony default export */ __webpack_exports__["default"] = (Browser);

	/***/ }),

	/***/ "./src/js/functions.js":
	/*!*****************************!*\
	  !*** ./src/js/functions.js ***!
	  \*****************************/
	/*! exports provided: addWrapper, capitalizePrint, collectStyles, addHeader, cleanUp, isRawHTML */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addWrapper", function() { return addWrapper; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "capitalizePrint", function() { return capitalizePrint; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collectStyles", function() { return collectStyles; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addHeader", function() { return addHeader; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanUp", function() { return cleanUp; });
	/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isRawHTML", function() { return isRawHTML; });
	/* harmony import */ var _modal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modal */ "./src/js/modal.js");
	/* harmony import */ var _browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./browser */ "./src/js/browser.js");
	function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }



	function addWrapper(htmlData, params) {
	  var bodyStyle = 'font-family:' + params.font + ' !important; font-size: ' + params.font_size + ' !important; width:100%;';
	  return '<div style="' + bodyStyle + '">' + htmlData + '</div>';
	}
	function capitalizePrint(obj) {
	  return obj.charAt(0).toUpperCase() + obj.slice(1);
	}
	function collectStyles(element, params) {
	  var win = document.defaultView || window; // String variable to hold styling for each element

	  var elementStyle = ''; // Loop over computed styles

	  var styles = win.getComputedStyle(element, '');

	  for (var key = 0; key < styles.length; key++) {
	    // Check if style should be processed
	    if (params.targetStyles.indexOf('*') !== -1 || params.targetStyle.indexOf(styles[key]) !== -1 || targetStylesMatch(params.targetStyles, styles[key])) {
	      if (styles.getPropertyValue(styles[key])) elementStyle += styles[key] + ':' + styles.getPropertyValue(styles[key]) + ';';
	    }
	  } // Print friendly defaults (deprecated)


	  elementStyle += 'max-width: ' + params.maxWidth + 'px !important; font-size: ' + params.font_size + ' !important;';
	  return elementStyle;
	}

	function targetStylesMatch(styles, value) {
	  for (var i = 0; i < styles.length; i++) {
	    if (_typeof(value) === 'object' && value.indexOf(styles[i]) !== -1) return true;
	  }

	  return false;
	}

	function addHeader(printElement, params) {
	  // Create the header container div
	  var headerContainer = document.createElement('div'); // Check if the header is text or raw html

	  if (isRawHTML(params.header)) {
	    headerContainer.innerHTML = params.header;
	  } else {
	    // Create header element
	    var headerElement = document.createElement('h1'); // Create header text node

	    var headerNode = document.createTextNode(params.header); // Build and style

	    headerElement.appendChild(headerNode);
	    headerElement.setAttribute('style', params.headerStyle);
	    headerContainer.appendChild(headerElement);
	  }

	  printElement.insertBefore(headerContainer, printElement.childNodes[0]);
	}
	function cleanUp(params) {
	  // If we are showing a feedback message to user, remove it
	  if (params.showModal) _modal__WEBPACK_IMPORTED_MODULE_0__["default"].close(); // Check for a finished loading hook function

	  if (params.onLoadingEnd) params.onLoadingEnd(); // If preloading pdf files, clean blob url

	  if (params.showModal || params.onLoadingStart) window.URL.revokeObjectURL(params.printable); // Run onPrintDialogClose callback

	  var event = 'mouseover';

	  if (_browser__WEBPACK_IMPORTED_MODULE_1__["default"].isChrome() || _browser__WEBPACK_IMPORTED_MODULE_1__["default"].isFirefox()) {
	    // Ps.: Firefox will require an extra click in the document to fire the focus event.
	    event = 'focus';
	  }

	  var handler = function handler() {
	    // Make sure the event only happens once.
	    window.removeEventListener(event, handler);
	    params.onPrintDialogClose(); // Remove iframe from the DOM

	    var iframe = document.getElementById(params.frameId);

	    if (iframe) {
	      iframe.remove();
	    }
	  };

	  window.addEventListener(event, handler);
	}
	function isRawHTML(raw) {
	  var regexHtml = new RegExp('<([A-Za-z][A-Za-z0-9]*)\\b[^>]*>(.*?)</\\1>');
	  return regexHtml.test(raw);
	}

	/***/ }),

	/***/ "./src/js/html.js":
	/*!************************!*\
	  !*** ./src/js/html.js ***!
	  \************************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions */ "./src/js/functions.js");
	/* harmony import */ var _print__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./print */ "./src/js/print.js");
	function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }



	/* harmony default export */ __webpack_exports__["default"] = ({
	  print: function print(params, printFrame) {
	    // Get the DOM printable element
	    var printElement = isHtmlElement(params.printable) ? params.printable : document.getElementById(params.printable); // Check if the element exists

	    if (!printElement) {
	      window.console.error('Invalid HTML element id: ' + params.printable);
	      return;
	    } // Clone the target element including its children (if available)


	    params.printableElement = cloneElement(printElement, params); // Add header

	    if (params.header) {
	      Object(_functions__WEBPACK_IMPORTED_MODULE_0__["addHeader"])(params.printableElement, params);
	    } // Print html element contents


	    _print__WEBPACK_IMPORTED_MODULE_1__["default"].send(params, printFrame);
	  }
	});

	function cloneElement(element, params) {
	  // Clone the main node (if not already inside the recursion process)
	  var clone = element.cloneNode(); // Loop over and process the children elements / nodes (including text nodes)

	  var childNodesArray = Array.prototype.slice.call(element.childNodes);

	  for (var i = 0; i < childNodesArray.length; i++) {
	    // Check if we are skipping the current element
	    if (params.ignoreElements.indexOf(childNodesArray[i].id) !== -1) {
	      continue;
	    } // Clone the child element


	    var clonedChild = cloneElement(childNodesArray[i], params); // Attach the cloned child to the cloned parent node

	    clone.appendChild(clonedChild);
	  } // Get all styling for print element (for nodes of type element only)


	  if (params.scanStyles && element.nodeType === 1) {
	    clone.setAttribute('style', Object(_functions__WEBPACK_IMPORTED_MODULE_0__["collectStyles"])(element, params));
	  } // Check if the element needs any state processing (copy user input data)


	  switch (element.tagName) {
	    case 'SELECT':
	      // Copy the current selection value to its clone
	      clone.value = element.value;
	      break;

	    case 'CANVAS':
	      // Copy the canvas content to its clone
	      clone.getContext('2d').drawImage(element, 0, 0);
	      break;
	  }

	  return clone;
	}

	function isHtmlElement(printable) {
	  // Check if element is instance of HTMLElement or has nodeType === 1 (for elements in iframe)
	  return _typeof(printable) === 'object' && printable && (printable instanceof HTMLElement || printable.nodeType === 1);
	}

	/***/ }),

	/***/ "./src/js/image.js":
	/*!*************************!*\
	  !*** ./src/js/image.js ***!
	  \*************************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions */ "./src/js/functions.js");
	/* harmony import */ var _print__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./print */ "./src/js/print.js");
	/* harmony import */ var _browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./browser */ "./src/js/browser.js");



	/* harmony default export */ __webpack_exports__["default"] = ({
	  print: function print(params, printFrame) {
	    // Check if we are printing one image or multiple images
	    if (params.printable.constructor !== Array) {
	      // Create array with one image
	      params.printable = [params.printable];
	    } // Create printable element (container)


	    params.printableElement = document.createElement('div'); // Create all image elements and append them to the printable container

	    params.printable.forEach(function (src) {
	      // Create the image element
	      var img = document.createElement('img');
	      img.setAttribute('style', params.imageStyle); // Set image src with the file url

	      img.src = src; // The following block is for Firefox, which for some reason requires the image's src to be fully qualified in
	      // order to print it

	      if (_browser__WEBPACK_IMPORTED_MODULE_2__["default"].isFirefox()) {
	        var fullyQualifiedSrc = img.src;
	        img.src = fullyQualifiedSrc;
	      } // Create the image wrapper


	      var imageWrapper = document.createElement('div'); // Append image to the wrapper element

	      imageWrapper.appendChild(img); // Append wrapper to the printable element

	      params.printableElement.appendChild(imageWrapper);
	    }); // Check if we are adding a print header

	    if (params.header) Object(_functions__WEBPACK_IMPORTED_MODULE_0__["addHeader"])(params.printableElement, params); // Print image

	    _print__WEBPACK_IMPORTED_MODULE_1__["default"].send(params, printFrame);
	  }
	});

	/***/ }),

	/***/ "./src/js/init.js":
	/*!************************!*\
	  !*** ./src/js/init.js ***!
	  \************************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	/* harmony import */ var _browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./browser */ "./src/js/browser.js");
	/* harmony import */ var _modal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modal */ "./src/js/modal.js");
	/* harmony import */ var _pdf__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pdf */ "./src/js/pdf.js");
	/* harmony import */ var _html__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./html */ "./src/js/html.js");
	/* harmony import */ var _raw_html__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./raw-html */ "./src/js/raw-html.js");
	/* harmony import */ var _image__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./image */ "./src/js/image.js");
	/* harmony import */ var _json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./json */ "./src/js/json.js");


	function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }








	var printTypes = ['pdf', 'html', 'image', 'json', 'raw-html'];
	/* harmony default export */ __webpack_exports__["default"] = ({
	  init: function init() {
	    var params = {
	      printable: null,
	      fallbackPrintable: null,
	      type: 'pdf',
	      header: null,
	      headerStyle: 'font-weight: 300;',
	      maxWidth: 800,
	      properties: null,
	      gridHeaderStyle: 'font-weight: bold; padding: 5px; border: 1px solid #dddddd;',
	      gridStyle: 'border: 1px solid lightgray; margin-bottom: -1px;',
	      showModal: false,
	      onError: function onError(error) {
	        throw error;
	      },
	      onLoadingStart: null,
	      onLoadingEnd: null,
	      onPrintDialogClose: function onPrintDialogClose() {},
	      onIncompatibleBrowser: function onIncompatibleBrowser() {},
	      modalMessage: 'Retrieving Document...',
	      frameId: 'printJS',
	      printableElement: null,
	      documentTitle: 'Document',
	      targetStyle: ['clear', 'display', 'width', 'min-width', 'height', 'min-height', 'max-height'],
	      targetStyles: ['border', 'box', 'break', 'text-decoration'],
	      ignoreElements: [],
	      repeatTableHeader: true,
	      css: null,
	      style: null,
	      scanStyles: true,
	      base64: false,
	      // Deprecated
	      onPdfOpen: null,
	      font: 'TimesNewRoman',
	      font_size: '12pt',
	      honorMarginPadding: true,
	      honorColor: false,
	      imageStyle: 'max-width: 100%;'
	    }; // Check if a printable document or object was supplied

	    var args = arguments[0];

	    if (args === undefined) {
	      throw new Error('printJS expects at least 1 attribute.');
	    } // Process parameters


	    switch (_typeof(args)) {
	      case 'string':
	        params.printable = encodeURI(args);
	        params.fallbackPrintable = params.printable;
	        params.type = arguments[1] || params.type;
	        break;

	      case 'object':
	        params.printable = args.printable;
	        params.fallbackPrintable = typeof args.fallbackPrintable !== 'undefined' ? args.fallbackPrintable : params.printable;
	        params.fallbackPrintable = params.base64 ? "data:application/pdf;base64,".concat(params.fallbackPrintable) : params.fallbackPrintable;

	        for (var k in params) {
	          if (k === 'printable' || k === 'fallbackPrintable') continue;
	          params[k] = typeof args[k] !== 'undefined' ? args[k] : params[k];
	        }

	        break;

	      default:
	        throw new Error('Unexpected argument type! Expected "string" or "object", got ' + _typeof(args));
	    } // Validate printable


	    if (!params.printable) throw new Error('Missing printable information.'); // Validate type

	    if (!params.type || typeof params.type !== 'string' || printTypes.indexOf(params.type.toLowerCase()) === -1) {
	      throw new Error('Invalid print type. Available types are: pdf, html, image and json.');
	    } // Check if we are showing a feedback message to the user (useful for large files)


	    if (params.showModal) _modal__WEBPACK_IMPORTED_MODULE_1__["default"].show(params); // Check for a print start hook function

	    if (params.onLoadingStart) params.onLoadingStart(); // To prevent duplication and issues, remove any used printFrame from the DOM

	    var usedFrame = document.getElementById(params.frameId);
	    if (usedFrame) usedFrame.parentNode.removeChild(usedFrame); // Create a new iframe for the print job

	    var printFrame = document.createElement('iframe');

	    if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isFirefox()) {
	      // Set the iframe to be is visible on the page (guaranteed by fixed position) but hidden using opacity 0, because
	      // this works in Firefox. The height needs to be sufficient for some part of the document other than the PDF
	      // viewer's toolbar to be visible in the page
	      printFrame.setAttribute('style', 'width: 1px; height: 100px; position: fixed; left: 0; top: 0; opacity: 0; border-width: 0; margin: 0; padding: 0');
	    } else {
	      // Hide the iframe in other browsers
	      printFrame.setAttribute('style', 'visibility: hidden; height: 0; width: 0; position: absolute; border: 0');
	    } // Set iframe element id


	    printFrame.setAttribute('id', params.frameId); // For non pdf printing, pass an html document string to srcdoc (force onload callback)

	    if (params.type !== 'pdf') {
	      printFrame.srcdoc = '<html><head><title>' + params.documentTitle + '</title>'; // Attach css files

	      if (params.css) {
	        // Add support for single file
	        if (!Array.isArray(params.css)) params.css = [params.css]; // Create link tags for each css file

	        params.css.forEach(function (file) {
	          printFrame.srcdoc += '<link rel="stylesheet" href="' + file + '">';
	        });
	      }

	      printFrame.srcdoc += '</head><body></body></html>';
	    } // Check printable type


	    switch (params.type) {
	      case 'pdf':
	        // Check browser support for pdf and if not supported we will just open the pdf file instead
	        if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isIE()) {
	          try {
	            console.info('Print.js doesn\'t support PDF printing in Internet Explorer.');
	            var win = window.open(params.fallbackPrintable, '_blank');
	            win.focus();
	            params.onIncompatibleBrowser();
	          } catch (error) {
	            params.onError(error);
	          } finally {
	            // Make sure there is no loading modal opened
	            if (params.showModal) _modal__WEBPACK_IMPORTED_MODULE_1__["default"].close();
	            if (params.onLoadingEnd) params.onLoadingEnd();
	          }
	        } else {
	          _pdf__WEBPACK_IMPORTED_MODULE_2__["default"].print(params, printFrame);
	        }

	        break;

	      case 'image':
	        _image__WEBPACK_IMPORTED_MODULE_5__["default"].print(params, printFrame);
	        break;

	      case 'html':
	        _html__WEBPACK_IMPORTED_MODULE_3__["default"].print(params, printFrame);
	        break;

	      case 'raw-html':
	        _raw_html__WEBPACK_IMPORTED_MODULE_4__["default"].print(params, printFrame);
	        break;

	      case 'json':
	        _json__WEBPACK_IMPORTED_MODULE_6__["default"].print(params, printFrame);
	        break;
	    }
	  }
	});

	/***/ }),

	/***/ "./src/js/json.js":
	/*!************************!*\
	  !*** ./src/js/json.js ***!
	  \************************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions */ "./src/js/functions.js");
	/* harmony import */ var _print__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./print */ "./src/js/print.js");
	function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }



	/* harmony default export */ __webpack_exports__["default"] = ({
	  print: function print(params, printFrame) {
	    // Check if we received proper data
	    if (_typeof(params.printable) !== 'object') {
	      throw new Error('Invalid javascript data object (JSON).');
	    } // Validate repeatTableHeader


	    if (typeof params.repeatTableHeader !== 'boolean') {
	      throw new Error('Invalid value for repeatTableHeader attribute (JSON).');
	    } // Validate properties


	    if (!params.properties || !Array.isArray(params.properties)) {
	      throw new Error('Invalid properties array for your JSON data.');
	    } // We will format the property objects to keep the JSON api compatible with older releases


	    params.properties = params.properties.map(function (property) {
	      return {
	        field: _typeof(property) === 'object' ? property.field : property,
	        displayName: _typeof(property) === 'object' ? property.displayName : property,
	        columnSize: _typeof(property) === 'object' && property.columnSize ? property.columnSize + ';' : 100 / params.properties.length + '%;'
	      };
	    }); // Create a print container element

	    params.printableElement = document.createElement('div'); // Check if we are adding a print header

	    if (params.header) {
	      Object(_functions__WEBPACK_IMPORTED_MODULE_0__["addHeader"])(params.printableElement, params);
	    } // Build the printable html data


	    params.printableElement.innerHTML += jsonToHTML(params); // Print the json data

	    _print__WEBPACK_IMPORTED_MODULE_1__["default"].send(params, printFrame);
	  }
	});

	function jsonToHTML(params) {
	  // Get the row and column data
	  var data = params.printable;
	  var properties = params.properties; // Create a html table

	  var htmlData = '<table style="border-collapse: collapse; width: 100%;">'; // Check if the header should be repeated

	  if (params.repeatTableHeader) {
	    htmlData += '<thead>';
	  } // Add the table header row


	  htmlData += '<tr>'; // Add the table header columns

	  for (var a = 0; a < properties.length; a++) {
	    htmlData += '<th style="width:' + properties[a].columnSize + ';' + params.gridHeaderStyle + '">' + Object(_functions__WEBPACK_IMPORTED_MODULE_0__["capitalizePrint"])(properties[a].displayName) + '</th>';
	  } // Add the closing tag for the table header row


	  htmlData += '</tr>'; // If the table header is marked as repeated, add the closing tag

	  if (params.repeatTableHeader) {
	    htmlData += '</thead>';
	  } // Create the table body


	  htmlData += '<tbody>'; // Add the table data rows

	  for (var i = 0; i < data.length; i++) {
	    // Add the row starting tag
	    htmlData += '<tr>'; // Print selected properties only

	    for (var n = 0; n < properties.length; n++) {
	      var stringData = data[i]; // Support nested objects

	      var property = properties[n].field.split('.');

	      if (property.length > 1) {
	        for (var p = 0; p < property.length; p++) {
	          stringData = stringData[property[p]];
	        }
	      } else {
	        stringData = stringData[properties[n].field];
	      } // Add the row contents and styles


	      htmlData += '<td style="width:' + properties[n].columnSize + params.gridStyle + '">' + stringData + '</td>';
	    } // Add the row closing tag


	    htmlData += '</tr>';
	  } // Add the table and body closing tags


	  htmlData += '</tbody></table>';
	  return htmlData;
	}

	/***/ }),

	/***/ "./src/js/modal.js":
	/*!*************************!*\
	  !*** ./src/js/modal.js ***!
	  \*************************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	var Modal = {
	  show: function show(params) {
	    // Build modal
	    var modalStyle = 'font-family:sans-serif; ' + 'display:table; ' + 'text-align:center; ' + 'font-weight:300; ' + 'font-size:30px; ' + 'left:0; top:0;' + 'position:fixed; ' + 'z-index: 9990;' + 'color: #0460B5; ' + 'width: 100%; ' + 'height: 100%; ' + 'background-color:rgba(255,255,255,.9);' + 'transition: opacity .3s ease;'; // Create wrapper

	    var printModal = document.createElement('div');
	    printModal.setAttribute('style', modalStyle);
	    printModal.setAttribute('id', 'printJS-Modal'); // Create content div

	    var contentDiv = document.createElement('div');
	    contentDiv.setAttribute('style', 'display:table-cell; vertical-align:middle; padding-bottom:100px;'); // Add close button (requires print.css)

	    var closeButton = document.createElement('div');
	    closeButton.setAttribute('class', 'printClose');
	    closeButton.setAttribute('id', 'printClose');
	    contentDiv.appendChild(closeButton); // Add spinner (requires print.css)

	    var spinner = document.createElement('span');
	    spinner.setAttribute('class', 'printSpinner');
	    contentDiv.appendChild(spinner); // Add message

	    var messageNode = document.createTextNode(params.modalMessage);
	    contentDiv.appendChild(messageNode); // Add contentDiv to printModal

	    printModal.appendChild(contentDiv); // Append print modal element to document body

	    document.getElementsByTagName('body')[0].appendChild(printModal); // Add event listener to close button

	    document.getElementById('printClose').addEventListener('click', function () {
	      Modal.close();
	    });
	  },
	  close: function close() {
	    var printModal = document.getElementById('printJS-Modal');

	    if (printModal) {
	      printModal.parentNode.removeChild(printModal);
	    }
	  }
	};
	/* harmony default export */ __webpack_exports__["default"] = (Modal);

	/***/ }),

	/***/ "./src/js/pdf.js":
	/*!***********************!*\
	  !*** ./src/js/pdf.js ***!
	  \***********************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	/* harmony import */ var _print__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./print */ "./src/js/print.js");
	/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./functions */ "./src/js/functions.js");


	/* harmony default export */ __webpack_exports__["default"] = ({
	  print: function print(params, printFrame) {
	    // Check if we have base64 data
	    if (params.base64) {
	      var bytesArray = Uint8Array.from(atob(params.printable), function (c) {
	        return c.charCodeAt(0);
	      });
	      createBlobAndPrint(params, printFrame, bytesArray);
	      return;
	    } // Format pdf url


	    params.printable = /^(blob|http|\/\/)/i.test(params.printable) ? params.printable : window.location.origin + (params.printable.charAt(0) !== '/' ? '/' + params.printable : params.printable); // Get the file through a http request (Preload)

	    var req = new window.XMLHttpRequest();
	    req.responseType = 'arraybuffer';
	    req.addEventListener('error', function () {
	      Object(_functions__WEBPACK_IMPORTED_MODULE_1__["cleanUp"])(params);
	      params.onError(req.statusText, req); // Since we don't have a pdf document available, we will stop the print job
	    });
	    req.addEventListener('load', function () {
	      // Check for errors
	      if ([200, 201].indexOf(req.status) === -1) {
	        Object(_functions__WEBPACK_IMPORTED_MODULE_1__["cleanUp"])(params);
	        params.onError(req.statusText, req); // Since we don't have a pdf document available, we will stop the print job

	        return;
	      } // Print requested document


	      createBlobAndPrint(params, printFrame, req.response);
	    });
	    req.open('GET', params.printable, true);
	    req.send();
	  }
	});

	function createBlobAndPrint(params, printFrame, data) {
	  // Pass response or base64 data to a blob and create a local object url
	  var localPdf = new window.Blob([data], {
	    type: 'application/pdf'
	  });
	  localPdf = window.URL.createObjectURL(localPdf); // Set iframe src with pdf document url

	  printFrame.setAttribute('src', localPdf);
	  _print__WEBPACK_IMPORTED_MODULE_0__["default"].send(params, printFrame);
	}

	/***/ }),

	/***/ "./src/js/print.js":
	/*!*************************!*\
	  !*** ./src/js/print.js ***!
	  \*************************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	/* harmony import */ var _browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./browser */ "./src/js/browser.js");
	/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./functions */ "./src/js/functions.js");


	var Print = {
	  send: function send(params, printFrame) {
	    // Append iframe element to document body
	    document.getElementsByTagName('body')[0].appendChild(printFrame); // Get iframe element

	    var iframeElement = document.getElementById(params.frameId); // Wait for iframe to load all content

	    iframeElement.onload = function () {
	      if (params.type === 'pdf') {
	        // Add a delay for Firefox. In my tests, 1000ms was sufficient but 100ms was not
	        if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isFirefox()) {
	          setTimeout(function () {
	            return performPrint(iframeElement, params);
	          }, 1000);
	        } else {
	          performPrint(iframeElement, params);
	        }

	        return;
	      } // Get iframe element document


	      var printDocument = iframeElement.contentWindow || iframeElement.contentDocument;
	      if (printDocument.document) printDocument = printDocument.document; // Append printable element to the iframe body

	      printDocument.body.appendChild(params.printableElement); // Add custom style

	      if (params.type !== 'pdf' && params.style) {
	        // Create style element
	        var style = document.createElement('style');
	        style.innerHTML = params.style; // Append style element to iframe's head

	        printDocument.head.appendChild(style);
	      } // If printing images, wait for them to load inside the iframe


	      var images = printDocument.getElementsByTagName('img');

	      if (images.length > 0) {
	        loadIframeImages(Array.from(images)).then(function () {
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
	    iframeElement.focus(); // If Edge or IE, try catch with execCommand

	    if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isEdge() || _browser__WEBPACK_IMPORTED_MODULE_0__["default"].isIE()) {
	      try {
	        iframeElement.contentWindow.document.execCommand('print', false, null);
	      } catch (e) {
	        iframeElement.contentWindow.print();
	      }
	    } else {
	      // Other browsers
	      iframeElement.contentWindow.print();
	    }
	  } catch (error) {
	    params.onError(error);
	  } finally {
	    if (_browser__WEBPACK_IMPORTED_MODULE_0__["default"].isFirefox()) {
	      // Move the iframe element off-screen and make it invisible
	      iframeElement.style.visibility = 'hidden';
	      iframeElement.style.left = '-1px';
	    }

	    Object(_functions__WEBPACK_IMPORTED_MODULE_1__["cleanUp"])(params);
	  }
	}

	function loadIframeImages(images) {
	  var promises = images.map(function (image) {
	    if (image.src && image.src !== window.location.href) {
	      return loadIframeImage(image);
	    }
	  });
	  return Promise.all(promises);
	}

	function loadIframeImage(image) {
	  return new Promise(function (resolve) {
	    var pollImage = function pollImage() {
	      !image || typeof image.naturalWidth === 'undefined' || image.naturalWidth === 0 || !image.complete ? setTimeout(pollImage, 500) : resolve();
	    };

	    pollImage();
	  });
	}

	/* harmony default export */ __webpack_exports__["default"] = (Print);

	/***/ }),

	/***/ "./src/js/raw-html.js":
	/*!****************************!*\
	  !*** ./src/js/raw-html.js ***!
	  \****************************/
	/*! exports provided: default */
	/***/ (function(module, __webpack_exports__, __webpack_require__) {
	__webpack_require__.r(__webpack_exports__);
	/* harmony import */ var _print__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./print */ "./src/js/print.js");

	/* harmony default export */ __webpack_exports__["default"] = ({
	  print: function print(params, printFrame) {
	    // Create printable element (container)
	    params.printableElement = document.createElement('div');
	    params.printableElement.setAttribute('style', 'width:100%'); // Set our raw html as the printable element inner html content

	    params.printableElement.innerHTML = params.printable; // Print html contents

	    _print__WEBPACK_IMPORTED_MODULE_0__["default"].send(params, printFrame);
	  }
	});

	/***/ }),

	/***/ "./src/sass/index.scss":
	/*!*****************************!*\
	  !*** ./src/sass/index.scss ***!
	  \*****************************/
	/*! no static exports found */
	/***/ (function(module, exports, __webpack_require__) {

	// extracted by mini-css-extract-plugin

	/***/ }),

	/***/ 0:
	/*!****************************!*\
	  !*** multi ./src/index.js ***!
	  \****************************/
	/*! no static exports found */
	/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(/*! ./src/index.js */"./src/index.js");


	/***/ })

	/******/ })["default"];
	});
	
} (print));

var printExports = print.exports;
var printJS = /*@__PURE__*/getDefaultExportFromCjs(printExports);

function resolveUrl(url, baseUrl) {
    // url is absolute already
    if (url.match(/^[a-z]+:\/\//i)) {
        return url;
    }
    // url is absolute already, without protocol
    if (url.match(/^\/\//)) {
        return window.location.protocol + url;
    }
    // dataURI, mailto:, tel:, etc.
    if (url.match(/^[a-z]+:/i)) {
        return url;
    }
    const doc = document.implementation.createHTMLDocument();
    const base = doc.createElement('base');
    const a = doc.createElement('a');
    doc.head.appendChild(base);
    doc.body.appendChild(a);
    if (baseUrl) {
        base.href = baseUrl;
    }
    a.href = url;
    return a.href;
}
const uuid = (() => {
    // generate uuid for className of pseudo elements.
    // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
    let counter = 0;
    // ref: http://stackoverflow.com/a/6248722/2519373
    const random = () => 
    // eslint-disable-next-line no-bitwise
    `0000${((Math.random() * 36 ** 4) << 0).toString(36)}`.slice(-4);
    return () => {
        counter += 1;
        return `u${random()}${counter}`;
    };
})();
function toArray(arrayLike) {
    const arr = [];
    for (let i = 0, l = arrayLike.length; i < l; i++) {
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
    return val ? parseFloat(val.replace('px', '')) : 0;
}
function getNodeWidth(node) {
    const leftBorder = px(node, 'border-left-width');
    const rightBorder = px(node, 'border-right-width');
    return node.clientWidth + leftBorder + rightBorder;
}
function getNodeHeight(node) {
    const topBorder = px(node, 'border-top-width');
    const bottomBorder = px(node, 'border-bottom-width');
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
    }
    catch (e) {
        // pass
    }
    const val = FINAL_PROCESS && FINAL_PROCESS.env
        ? FINAL_PROCESS.env.devicePixelRatio
        : null;
    if (val) {
        ratio = parseInt(val, 10);
        if (Number.isNaN(ratio)) {
            ratio = 1;
        }
    }
    return ratio || window.devicePixelRatio || 1;
}
// @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size
const canvasDimensionLimit = 16384;
function checkCanvasDimensions(canvas) {
    if (canvas.width > canvasDimensionLimit ||
        canvas.height > canvasDimensionLimit) {
        if (canvas.width > canvasDimensionLimit &&
            canvas.height > canvasDimensionLimit) {
            if (canvas.width > canvas.height) {
                canvas.height *= canvasDimensionLimit / canvas.width;
                canvas.width = canvasDimensionLimit;
            }
            else {
                canvas.width *= canvasDimensionLimit / canvas.height;
                canvas.height = canvasDimensionLimit;
            }
        }
        else if (canvas.width > canvasDimensionLimit) {
            canvas.height *= canvasDimensionLimit / canvas.width;
            canvas.width = canvasDimensionLimit;
        }
        else {
            canvas.width *= canvasDimensionLimit / canvas.height;
            canvas.height = canvasDimensionLimit;
        }
    }
}
function canvasToBlob(canvas, options = {}) {
    if (canvas.toBlob) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, options.type ? options.type : 'image/png', options.quality ? options.quality : 1);
        });
    }
    return new Promise((resolve) => {
        const binaryString = window.atob(canvas
            .toDataURL(options.type ? options.type : undefined, options.quality ? options.quality : undefined)
            .split(',')[1]);
        const len = binaryString.length;
        const binaryArray = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) {
            binaryArray[i] = binaryString.charCodeAt(i);
        }
        resolve(new Blob([binaryArray], {
            type: options.type ? options.type : 'image/png',
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
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.src = url;
    });
}
async function svgToDataURL(svg) {
    return Promise.resolve()
        .then(() => new XMLSerializer().serializeToString(svg))
        .then(encodeURIComponent)
        .then((html) => `data:image/svg+xml;charset=utf-8,${html}`);
}
async function nodeToDataURL(node, width, height) {
    const xmlns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(xmlns, 'svg');
    const foreignObject = document.createElementNS(xmlns, 'foreignObject');
    svg.setAttribute('width', `${width}`);
    svg.setAttribute('height', `${height}`);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');
    foreignObject.setAttribute('x', '0');
    foreignObject.setAttribute('y', '0');
    foreignObject.setAttribute('externalResourcesRequired', 'true');
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
    return (nodePrototype.constructor.name === instance.name ||
        isInstanceOfElement(nodePrototype, instance));
};

function formatCSSText(style) {
    const content = style.getPropertyValue('content');
    return `${style.cssText} content: '${content.replace(/'|"/g, '')}';`;
}
function formatCSSProperties(style, options) {
    return getStyleProperties(options)
        .map((name) => {
        const value = style.getPropertyValue(name);
        const priority = style.getPropertyPriority(name);
        return `${name}: ${value}${priority ? ' !important' : ''};`;
    })
        .join(' ');
}
function getPseudoElementStyle(className, pseudo, style, options) {
    const selector = `.${className}:${pseudo}`;
    const cssText = style.cssText
        ? formatCSSText(style)
        : formatCSSProperties(style, options);
    return document.createTextNode(`${selector}{${cssText}}`);
}
function clonePseudoElement(nativeNode, clonedNode, pseudo, options) {
    const style = window.getComputedStyle(nativeNode, pseudo);
    const content = style.getPropertyValue('content');
    if (content === '' || content === 'none') {
        return;
    }
    const className = uuid();
    try {
        clonedNode.className = `${clonedNode.className} ${className}`;
    }
    catch (err) {
        return;
    }
    const styleElement = document.createElement('style');
    styleElement.appendChild(getPseudoElementStyle(className, pseudo, style, options));
    clonedNode.appendChild(styleElement);
}
function clonePseudoElements(nativeNode, clonedNode, options) {
    clonePseudoElement(nativeNode, clonedNode, ':before', options);
    clonePseudoElement(nativeNode, clonedNode, ':after', options);
}

const WOFF = 'application/font-woff';
const JPEG = 'image/jpeg';
const mimes = {
    woff: WOFF,
    woff2: WOFF,
    ttf: 'application/font-truetype',
    eot: 'application/vnd.ms-fontobject',
    png: 'image/png',
    jpg: JPEG,
    jpeg: JPEG,
    gif: 'image/gif',
    tiff: 'image/tiff',
    svg: 'image/svg+xml',
    webp: 'image/webp',
};
function getExtension(url) {
    const match = /\.([^./]*?)$/g.exec(url);
    return match ? match[1] : '';
}
function getMimeType(url) {
    const extension = getExtension(url).toLowerCase();
    return mimes[extension] || '';
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
async function fetchAsDataURL(url, init, process) {
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
                resolve(process({ res, result: reader.result }));
            }
            catch (error) {
                reject(error);
            }
        };
        reader.readAsDataURL(blob);
    });
}
const cache = {};
function getCacheKey(url, contentType, includeQueryParams) {
    let key = url.replace(/\?.*/, '');
    if (includeQueryParams) {
        key = url;
    }
    // font resource
    if (/ttf|otf|eot|woff2?/i.test(key)) {
        key = key.replace(/.*\//, '');
    }
    return contentType ? `[${contentType}]${key}` : key;
}
async function resourceToDataURL(resourceUrl, contentType, options) {
    const cacheKey = getCacheKey(resourceUrl, contentType, options.includeQueryParams);
    if (cache[cacheKey] != null) {
        return cache[cacheKey];
    }
    // ref: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
    if (options.cacheBust) {
        // eslint-disable-next-line no-param-reassign
        resourceUrl += (/\?/.test(resourceUrl) ? '&' : '?') + new Date().getTime();
    }
    let dataURL;
    try {
        const content = await fetchAsDataURL(resourceUrl, options.fetchRequestInit, ({ res, result }) => {
            if (!contentType) {
                // eslint-disable-next-line no-param-reassign
                contentType = res.headers.get('Content-Type') || '';
            }
            return getContentFromDataUrl(result);
        });
        dataURL = makeDataUrl(content, contentType);
    }
    catch (error) {
        dataURL = options.imagePlaceholder || '';
        let msg = `Failed to fetch resource: ${resourceUrl}`;
        if (error) {
            msg = typeof error === 'string' ? error : error.message;
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
    if (dataURL === 'data:,') {
        return canvas.cloneNode(false);
    }
    return createImage(dataURL);
}
async function cloneVideoElement(video, options) {
    if (video.currentSrc) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL();
        return createImage(dataURL);
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
            return (await cloneNode(iframe.contentDocument.body, options, true));
        }
    }
    catch (_b) {
        // Failed to clone iframe
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
const isSlotElement = (node) => node.tagName != null && node.tagName.toUpperCase() === 'SLOT';
const isSVGElement = (node) => node.tagName != null && node.tagName.toUpperCase() === 'SVG';
async function cloneChildren(nativeNode, clonedNode, options) {
    var _a, _b;
    if (isSVGElement(clonedNode)) {
        return clonedNode;
    }
    let children = [];
    if (isSlotElement(nativeNode) && nativeNode.assignedNodes) {
        children = toArray(nativeNode.assignedNodes());
    }
    else if (isInstanceOfElement(nativeNode, HTMLIFrameElement) &&
        ((_a = nativeNode.contentDocument) === null || _a === void 0 ? void 0 : _a.body)) {
        children = toArray(nativeNode.contentDocument.body.childNodes);
    }
    else {
        children = toArray(((_b = nativeNode.shadowRoot) !== null && _b !== void 0 ? _b : nativeNode).childNodes);
    }
    if (children.length === 0 ||
        isInstanceOfElement(nativeNode, HTMLVideoElement)) {
        return clonedNode;
    }
    await children.reduce((deferred, child) => deferred
        .then(() => cloneNode(child, options))
        .then((clonedChild) => {
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
    }
    else {
        getStyleProperties(options).forEach((name) => {
            let value = sourceStyle.getPropertyValue(name);
            if (name === 'font-size' && value.endsWith('px')) {
                const reducedFont = Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
                value = `${reducedFont}px`;
            }
            if (isInstanceOfElement(nativeNode, HTMLIFrameElement) &&
                name === 'display' &&
                value === 'inline') {
                value = 'block';
            }
            if (name === 'd' && clonedNode.getAttribute('d')) {
                value = `path(${clonedNode.getAttribute('d')})`;
            }
            targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
        });
    }
}
function cloneInputValue(nativeNode, clonedNode) {
    if (isInstanceOfElement(nativeNode, HTMLTextAreaElement)) {
        clonedNode.innerHTML = nativeNode.value;
    }
    if (isInstanceOfElement(nativeNode, HTMLInputElement)) {
        clonedNode.setAttribute('value', nativeNode.value);
    }
}
function cloneSelectValue(nativeNode, clonedNode) {
    if (isInstanceOfElement(nativeNode, HTMLSelectElement)) {
        const clonedSelect = clonedNode;
        const selectedOption = Array.from(clonedSelect.children).find((child) => nativeNode.value === child.getAttribute('value'));
        if (selectedOption) {
            selectedOption.setAttribute('selected', '');
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
    const uses = clone.querySelectorAll ? clone.querySelectorAll('use') : [];
    if (uses.length === 0) {
        return clone;
    }
    const processedDefs = {};
    for (let i = 0; i < uses.length; i++) {
        const use = uses[i];
        const id = use.getAttribute('xlink:href');
        if (id) {
            const exist = clone.querySelector(id);
            const definition = document.querySelector(id);
            if (!exist && definition && !processedDefs[id]) {
                // eslint-disable-next-line no-await-in-loop
                processedDefs[id] = (await cloneNode(definition, options, true));
            }
        }
    }
    const nodes = Object.values(processedDefs);
    if (nodes.length) {
        const ns = 'http://www.w3.org/1999/xhtml';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('xmlns', ns);
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.style.overflow = 'hidden';
        svg.style.display = 'none';
        const defs = document.createElementNS(ns, 'defs');
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
    return Promise.resolve(node)
        .then((clonedNode) => cloneSingleNode(clonedNode, options))
        .then((clonedNode) => cloneChildren(node, clonedNode, options))
        .then((clonedNode) => decorate(node, clonedNode, options))
        .then((clonedNode) => ensureSVGSymbols(clonedNode, options));
}

const URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
const URL_WITH_FORMAT_REGEX = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
const FONT_SRC_REGEX = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function toRegex(url) {
    // eslint-disable-next-line no-useless-escape
    const escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
    return new RegExp(`(url\\(['"]?)(${escaped})(['"]?\\))`, 'g');
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
        }
        else {
            dataURL = await resourceToDataURL(resolvedURL, contentType, options);
        }
        return cssText.replace(toRegex(resourceURL), `$1${dataURL}$3`);
    }
    catch (error) {
        // pass
    }
    return cssText;
}
function filterPreferredFontFormat(str, { preferredFontFormat }) {
    return !preferredFontFormat
        ? str
        : str.replace(FONT_SRC_REGEX, (match) => {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const [src, , format] = URL_WITH_FORMAT_REGEX.exec(match) || [];
                if (!format) {
                    return '';
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
    return urls.reduce((deferred, url) => deferred.then((css) => embed(css, url, baseUrl, options)), Promise.resolve(filteredCSSText));
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
    (await embedProp('background', clonedNode, options)) ||
        (await embedProp('background-image', clonedNode, options));
    (await embedProp('mask', clonedNode, options)) ||
        (await embedProp('-webkit-mask', clonedNode, options)) ||
        (await embedProp('mask-image', clonedNode, options)) ||
        (await embedProp('-webkit-mask-image', clonedNode, options));
}
async function embedImageNode(clonedNode, options) {
    const isImageElement = isInstanceOfElement(clonedNode, HTMLImageElement);
    if (!(isImageElement && !isDataUrl(clonedNode.src)) &&
        !(isInstanceOfElement(clonedNode, SVGImageElement) &&
            !isDataUrl(clonedNode.href.baseVal))) {
        return;
    }
    const url = isImageElement ? clonedNode.src : clonedNode.href.baseVal;
    const dataURL = await resourceToDataURL(url, getMimeType(url), options);
    await new Promise((resolve, reject) => {
        clonedNode.onload = resolve;
        clonedNode.onerror = options.onImageErrorHandler
            ? (...attributes) => {
                try {
                    resolve(options.onImageErrorHandler(...attributes));
                }
                catch (error) {
                    reject(error);
                }
            }
            : reject;
        const image = clonedNode;
        if (image.decode) {
            image.decode = resolve;
        }
        if (image.loading === 'lazy') {
            image.loading = 'eager';
        }
        if (isImageElement) {
            clonedNode.srcset = '';
            clonedNode.src = dataURL;
        }
        else {
            clonedNode.href.baseVal = dataURL;
        }
    });
}
async function embedChildren(clonedNode, options) {
    const children = toArray(clonedNode.childNodes);
    const deferreds = children.map((child) => embedImages(child, options));
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
        Object.keys(manual).forEach((key) => {
            style[key] = manual[key];
        });
    }
    return node;
}

const cssFetchCache = {};
async function fetchCSS(url) {
    let cache = cssFetchCache[url];
    if (cache != null) {
        return cache;
    }
    const res = await fetch(url);
    const cssText = await res.text();
    cache = { url, cssText };
    cssFetchCache[url] = cache;
    return cache;
}
async function embedFonts(data, options) {
    let cssText = data.cssText;
    const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
    const fontLocs = cssText.match(/url\([^)]+\)/g) || [];
    const loadFonts = fontLocs.map(async (loc) => {
        let url = loc.replace(regexUrl, '$1');
        if (!url.startsWith('https://')) {
            url = new URL(url, data.url).href;
        }
        return fetchAsDataURL(url, options.fetchRequestInit, ({ result }) => {
            cssText = cssText.replace(loc, `url(${result})`);
            return [loc, result];
        });
    });
    return Promise.all(loadFonts).then(() => cssText);
}
function parseCSS(source) {
    if (source == null) {
        return [];
    }
    const result = [];
    const commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
    // strip out comments
    let cssText = source.replace(commentsRegex, '');
    // eslint-disable-next-line prefer-regex-literals
    const keyframesRegex = new RegExp('((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})', 'gi');
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const matches = keyframesRegex.exec(cssText);
        if (matches === null) {
            break;
        }
        result.push(matches[0]);
    }
    cssText = cssText.replace(keyframesRegex, '');
    const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
    // to match css & media queries together
    const combinedCSSRegex = '((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]' +
        '*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})';
    // unified regex
    const unifiedRegex = new RegExp(combinedCSSRegex, 'gi');
    // eslint-disable-next-line no-constant-condition
    while (true) {
        let matches = importRegex.exec(cssText);
        if (matches === null) {
            matches = unifiedRegex.exec(cssText);
            if (matches === null) {
                break;
            }
            else {
                importRegex.lastIndex = unifiedRegex.lastIndex;
            }
        }
        else {
            unifiedRegex.lastIndex = importRegex.lastIndex;
        }
        result.push(matches[0]);
    }
    return result;
}
async function getCSSRules(styleSheets, options) {
    const ret = [];
    const deferreds = [];
    // First loop inlines imports
    styleSheets.forEach((sheet) => {
        if ('cssRules' in sheet) {
            try {
                toArray(sheet.cssRules || []).forEach((item, index) => {
                    if (item.type === CSSRule.IMPORT_RULE) {
                        let importIndex = index + 1;
                        const url = item.href;
                        const deferred = fetchCSS(url)
                            .then((metadata) => embedFonts(metadata, options))
                            .then((cssText) => parseCSS(cssText).forEach((rule) => {
                            try {
                                sheet.insertRule(rule, rule.startsWith('@import')
                                    ? (importIndex += 1)
                                    : sheet.cssRules.length);
                            }
                            catch (error) {
                                console.error('Error inserting rule from remote css', {
                                    rule,
                                    error,
                                });
                            }
                        }))
                            .catch((e) => {
                            console.error('Error loading remote css', e.toString());
                        });
                        deferreds.push(deferred);
                    }
                });
            }
            catch (e) {
                const inline = styleSheets.find((a) => a.href == null) || document.styleSheets[0];
                if (sheet.href != null) {
                    deferreds.push(fetchCSS(sheet.href)
                        .then((metadata) => embedFonts(metadata, options))
                        .then((cssText) => parseCSS(cssText).forEach((rule) => {
                        inline.insertRule(rule, inline.cssRules.length);
                    }))
                        .catch((err) => {
                        console.error('Error loading remote stylesheet', err);
                    }));
                }
                console.error('Error inlining remote css file', e);
            }
        }
    });
    return Promise.all(deferreds).then(() => {
        // Second loop parses rules
        styleSheets.forEach((sheet) => {
            if ('cssRules' in sheet) {
                try {
                    toArray(sheet.cssRules || []).forEach((item) => {
                        ret.push(item);
                    });
                }
                catch (e) {
                    console.error(`Error while reading CSS rules from ${sheet.href}`, e);
                }
            }
        });
        return ret;
    });
}
function getWebFontRules(cssRules) {
    return cssRules
        .filter((rule) => rule.type === CSSRule.FONT_FACE_RULE)
        .filter((rule) => shouldEmbed(rule.style.getPropertyValue('src')));
}
async function parseWebFontRules(node, options) {
    if (node.ownerDocument == null) {
        throw new Error('Provided element is not within a Document');
    }
    const styleSheets = toArray(node.ownerDocument.styleSheets);
    const cssRules = await getCSSRules(styleSheets, options);
    return getWebFontRules(cssRules);
}
function normalizeFontFamily(font) {
    return font.trim().replace(/["']/g, '');
}
function getUsedFonts(node) {
    const fonts = new Set();
    function traverse(node) {
        const fontFamily = node.style.fontFamily || getComputedStyle(node).fontFamily;
        fontFamily.split(',').forEach((font) => {
            fonts.add(normalizeFontFamily(font));
        });
        Array.from(node.children).forEach((child) => {
            if (child instanceof HTMLElement) {
                traverse(child);
            }
        });
    }
    traverse(node);
    return fonts;
}
async function getWebFontCSS(node, options) {
    const rules = await parseWebFontRules(node, options);
    const usedFonts = getUsedFonts(node);
    const cssTexts = await Promise.all(rules
        .filter((rule) => usedFonts.has(normalizeFontFamily(rule.style.fontFamily)))
        .map((rule) => {
        const baseUrl = rule.parentStyleSheet
            ? rule.parentStyleSheet.href
            : null;
        return embedResources(rule.cssText, baseUrl, options);
    }));
    return cssTexts.join('\n');
}
async function embedWebFonts(clonedNode, options) {
    const cssText = options.fontEmbedCSS != null
        ? options.fontEmbedCSS
        : options.skipFonts
            ? null
            : await getWebFontCSS(clonedNode, options);
    if (cssText) {
        const styleNode = document.createElement('style');
        const sytleContent = document.createTextNode(cssText);
        styleNode.appendChild(sytleContent);
        if (clonedNode.firstChild) {
            clonedNode.insertBefore(styleNode, clonedNode.firstChild);
        }
        else {
            clonedNode.appendChild(styleNode);
        }
    }
}

async function toSvg(node, options = {}) {
    const { width, height } = getImageSize(node, options);
    const clonedNode = (await cloneNode(node, options, true));
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
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
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
    const els = dom.querySelectorAll('.excel-container');
    if (!els.length) {
        return [];
    }
    const XLSX = getXLSX();
    if (!XLSX) {
        const message = 'not find XLSX,please registerXLSX';
        console.error(message);
        getToastr().error(message);
        return [];
    }
    const x_spreadsheet = getX_spreadsheet();
    if (!x_spreadsheet) {
        const message = 'not find x_spreadsheet,please registerX_spreadsheet';
        console.error(message);
        getToastr().error(message);
        return [];
    }
    // const spSheets = [];
    // console.log(Swiper);
    els.forEach(el => {
        if (el.dataset.inited) {
            return;
        }
        const text = el.textContent;
        el.innerHTML = '';
        const promise = fetchScheduler.createFetch(text, {
            // ...
        });
        promise.then(res => res.arrayBuffer()).then(arrayBuffer => {
            const wb = XLSX.read(arrayBuffer);
            const json = stox(wb, XLSX);

            // console.log(json);
            // eslint-disable-next-line no-unused-vars
            new x_spreadsheet(el)
                .loadData(json) // load data
                .change(data => {
                    // save data to db
                });

        }).catch(err => {
            console.error(err);
        });
    });
    // return swipers;
}

/*! xlsxspread.js (C) SheetJS LLC -- https://sheetjs.com/ */
/* eslint-env browser */
/* exported stox, xtos */
/**
 * Converts data from SheetJS to x-spreadsheet
 *
 * @param  {Object} wb SheetJS workbook object
 *
 * @returns {Object[]} An x-spreadsheet data
 */
function stox(wb, XLSX) {
    const out = [];
    wb.SheetNames.forEach(function (name) {
        const o = { name: name, rows: {} };
        const ws = wb.Sheets[name];
        if (!ws || !ws['!ref']) return;
        const range = XLSX.utils.decode_range(ws['!ref']);
        // sheet_to_json will lost empty row and col at begin as default
        range.s = { r: 0, c: 0 };
        const aoa = XLSX.utils.sheet_to_json(ws, {
            raw: false,
            header: 1,
            range: range
        });

        aoa.forEach(function (r, i) {
            const cells = {};
            r.forEach(function (c, j) {
                cells[j] = { text: c };

                const cellRef = XLSX.utils.encode_cell({ r: i, c: j });

                if (ws[cellRef] != null && ws[cellRef].f != null) {
                    cells[j].text = '=' + ws[cellRef].f;
                }
            });
            o.rows[i] = { cells: cells };
        });

        o.merges = [];
        (ws['!merges'] || []).forEach(function (merge, i) {
            // Needed to support merged cells with empty content
            if (o.rows[merge.s.r] == null) {
                o.rows[merge.s.r] = { cells: {} };
            }
            if (o.rows[merge.s.r].cells[merge.s.c] == null) {
                o.rows[merge.s.r].cells[merge.s.c] = {};
            }

            o.rows[merge.s.r].cells[merge.s.c].merge = [
                merge.e.r - merge.s.r,
                merge.e.c - merge.s.c
            ];

            o.merges[i] = XLSX.utils.encode_range(merge);
        });

        out.push(o);
    });

    return out;
}

/**
 * Converts data from x-spreadsheet to SheetJS
 *
 * @param  {Object[]} sdata An x-spreadsheet data object
 *
 * @returns {Object} A SheetJS workbook object
 */
// function xtos(sdata) {
//     var out = XLSX.utils.book_new();
//     sdata.forEach(function (xws) {
//         var ws = {};
//         var rowobj = xws.rows;
//         var minCoord = { r: 0, c: 0 }, maxCoord = { r: 0, c: 0 };
//         for (var ri = 0; ri < rowobj.len; ++ri) {
//             var row = rowobj[ri];
//             if (!row) continue;

//             Object.keys(row.cells).forEach(function (k) {
//                 var idx = +k;
//                 if (isNaN(idx)) return;

//                 var lastRef = XLSX.utils.encode_cell({ r: ri, c: idx });
//                 if (ri > maxCoord.r) maxCoord.r = ri;
//                 if (idx > maxCoord.c) maxCoord.c = idx;

//                 var cellText = row.cells[k].text, type = 's';
//                 if (!cellText) {
//                     cellText = '';
//                     type = 'z';
//                 } else if (!isNaN(Number(cellText))) {
//                     cellText = Number(cellText);
//                     type = 'n';
//                 } else if (cellText.toLowerCase() === 'true' || cellText.toLowerCase() === 'false') {
//                     cellText = Boolean(cellText);
//                     type = 'b';
//                 }

//                 ws[lastRef] = { v: cellText, t: type };

//                 if (type == 's' && cellText[0] == '=') {
//                     ws[lastRef].f = cellText.slice(1);
//                 }

//                 if (row.cells[k].merge != null) {
//                     if (ws['!merges'] == null) ws['!merges'] = [];

//                     ws['!merges'].push({
//                         s: { r: ri, c: idx },
//                         e: {
//                             r: ri + row.cells[k].merge[0],
//                             c: idx + row.cells[k].merge[1]
//                         }
//                     });
//                 }
//             });
//         }
//         ws['!ref'] = minCoord ? XLSX.utils.encode_range({
//             s: minCoord,
//             e: maxCoord
//         }) : 'A1';

//         XLSX.utils.book_append_sheet(out, ws, xws.name);
//     });

//     return out;
// }

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

  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/6.0.0/d3.min.js"></script>
  <script
    src="https://microget-1300406971.cos.ap-shanghai.myqcloud.com/glicon/lib/markmap-view/markmap-view.min.js"></script>
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

        </script>

  </body>
</html>
`;
function exportMarkMapHTML(data) {
    return TEMPLATE.replaceAll('{data}', data);
}

// const IMG_TAG = '<img';
const IFRAME_TAG = '<iframe';

function lazyLoad(html, mdEditor) {
    // if (html.indexOf(IMG_TAG) > -1) {
    //     const seg = html.split(IMG_TAG);
    //     html = seg.join(`${IMG_TAG} loading="lazy" `).toString();
    // }
    if (html.indexOf(IFRAME_TAG) > -1) {
        const seg = html.split(IFRAME_TAG);
        html = seg.join(`${IFRAME_TAG} loading="lazy" `).toString();
    }

    return html;
    // if (mdEditor.intersectionObservers) {
    //     mdEditor.intersectionObservers.forEach(intersectionObserver => {
    //         intersectionObserver.disconnect()();
    //     });
    // }
    // mdEditor.intersectionObservers = [];
    // if (typeof IntersectionObserver === 'undefined') {
    //     return;
    // }
    // const imgs = dom.querySelectorAll('img');
    // const iframes = dom.querySelectorAll('iframe');
    // const lazyDoms = [];
    // const forEach = (doms) => {
    //     Array.prototype.forEach.call(doms, (dom) => {
    //         // dom.dataset.src = dom.src;
    //         // dom.src = '';
    //         // lazyDoms.push(dom);
    //         dom.setAttribute('loading', 'lazy');
    //     });
    // };
    // forEach(imgs);
    // forEach(iframes);
    // lazyDoms.forEach(element => {
    //     const intersectionObserver = new IntersectionObserver((entries) => {
    //         // 如果 intersectionRatio 为 0，则目标在视野外，
    //         // 我们不需要做任何事情。
    //         if (entries[0].intersectionRatio <= 0) return;
    //         const element = entries[0].target;
    //         const src = element.dataset.src;
    //         if (src) {
    //             element.src = src;
    //         }

    //     });
    //     // 开始监听
    //     intersectionObserver.observe(element);
    //     mdEditor.intersectionObservers.push(intersectionObserver);
    // });

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
    Array.prototype.forEach.call(children, element => {
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
        mdEditor.flowcharts.forEach(flowchart => {
            flowchart.clean();
        });
    }
    const els = dom.querySelectorAll('.flowchart-container');
    if (!els.length) {
        return [];
    }
    const flowchart = getFlowChart();
    if (!flowchart) {
        const message = 'not find flowchart,please registerFlowChart';
        console.error(message);
        getToastr().error(message);
        return [];
    }
    mdEditor.flowcharts = [];
    els.forEach(el => {
        if (el.dataset.inited) {
            return;
        }
        const code = el.children[0].textContent;
        const diagram = flowchart.parse(code);
        diagram.drawSVG(el.children[1]);
        mdEditor.flowcharts.push(diagram);
    });
}

// import html2canvas from 'html2canvas';
// import { domDiff } from './diff';

const THEME_ID = 'mdeditor_theme_style';
const THEMECACHE = new Map();
const md = createMarkdown();

const exportFilesData = [
    {
        icon: 'icon-file-markdown1',
        label: '导出Markdown',
        type: 'markdown'
    },
    {
        icon: 'icon-html',
        label: '导出HTML',
        type: 'html'
    },
    {
        icon: 'icon-tupiantianjia',
        label: '导出图片',
        type: 'png'
    },
    {
        icon: 'icon-naotu',
        label: '导出markmap',
        type: 'markmap'
    },
    {
        icon: 'icon-dayin',
        label: '打印',
        type: 'print'
    }
];

function hideDomByDisplay(dom) {
    dom = dom.target || dom;
    if (!(dom instanceof HTMLElement)) {
        console.error(dom, 'is not HTMLElement');
        return;
    }
    const display = getDomDisplay(dom);
    if (display === 'block') {
        domHide(dom);
    }
}

function createFloatPanel() {
    const dom = createDom('div');
    dom.className = 'mdeditor-float-container';
    return dom;
}

function createLiElement() {
    const li = createDom('div');
    li.className = 'mdeditor-theme-select-item';
    return li;
}

function getVSCodePasteData(items) {
    let editorDataItem, codeItem;
    items.forEach(item => {
        const { type } = item;
        if (type === 'vscode-editor-data') {
            editorDataItem = item;
        }
        if (type === 'text/plain') {
            codeItem = item;
        }
    });
    if (!editorDataItem || !codeItem || !editorDataItem.text || !codeItem.text) {
        return;
    }
    const text = editorDataItem.text;
    if (!text) {
        return;
    }
    let json;
    try {
        json = JSON.parse(text);
    } catch (error) {
        return;
    }
    if (!json || !json.mode) {
        return;
    }

    return {
        language: json.mode,
        text: codeItem.text
    };

}

const OPTIONS = {
    debug: false,
    preview: true,
    dark: false,
    theme: 'vitepress',
    themeURL: './../theme/',
    themeCache: true,
    tocOpen: false,
    emojiURL: 'https://cdn.jsdelivr.net/npm/@emoji-mart/data',
    iconfontURL: '//at.alicdn.com/t/c/font_4227162_4oipkq7kqoo.css',
    monacoOptions: {
        language: 'markdown',
        value: '',
        automaticLayout: true
    },
    prettierOptions: {
        tabWidth: 4
    },
    updatePreviewDuration: 500,
    autoParseVSCodePasteData: false
};

/**
 * a Class for Eventable
 */
function Base() {

}

class MDEditor extends Eventable(Base) {
    constructor(dom, options) {
        initToastr();
        super();
        dom = getDom(dom);
        if (!dom || !(dom instanceof HTMLElement)) {
            const message = 'dom is not HTMLElement';
            console.error(message, dom);
            getToastr().error(message);
            return;
        }
        dom.classList.add('mdeditor-container');
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
        this.themeName = '';
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
        const loop = () => {
            if (now() - time > this.options.updatePreviewDuration) {
                this.updatePreview();
                time = now();
            }
            this.frameId = requestAnimationFrame(loop);
        };

        this.frameId = requestAnimationFrame(loop);
        on$1(window, 'resize', () => {
            if (!this.fullScreen) {
                return;
            }
            domSizeByWindow(this.getContainer());
        });
        this.pasteItems = [];

    }

    _initIconFont() {
        const id = 'mdpress-iconfont';
        if (document && document.head && this.options.iconfontURL) {
            const style = document.head.querySelector(`#${id}`);
            if (!style) {
                const style = createDom('link');
                style.rel = 'stylesheet';
                style.href = this.options.iconfontURL;
                style.id = id;
                document.head.appendChild(style);
            }
        }
    }

    _initDoms() {
        const monaco = getMonaco();
        const miniToastr = getToastr();
        if (!monaco) {
            const message = 'not find monaco editor namespace';
            console.error(message);
            miniToastr.error(message);
            return;
        }
        const { monacoOptions } = this.options;

        const editorDom = this.editorDom = createDom('div');
        editorDom.className = 'mdeditor-editor';

        const previewDom = this.previewDom = createDom('div');
        previewDom.className = 'mdeditor-preview vp-doc markdown-body';
        previewDom.id = domId();

        const editorContainer = this.editorContainer = createDom('div');
        editorContainer.className = 'mdeditor-editor-container';
        editorContainer.appendChild(editorDom);
        editorContainer.appendChild(previewDom);
        editorContainer.addEventListener('paste', e => {
            if (e.clipboardData) {
                this.pasteItems = Array.prototype.map.call(e.clipboardData.items, (item) => {
                    return {
                        type: item.type,
                        kind: item.kind,
                        data: item
                    };
                });
                this.pasteItems.forEach((item) => {
                    item.data.getAsString((text) => {
                        item.text = text;
                    });
                });
            }
            this.fire('paste', extend({}, e, { target: this }));
        }, true);

        const tocDom = this.tocDom = createDom('div');
        tocDom.className = 'mdeditor-toc';

        const mainDom = this.mainDom = createDom('div');
        mainDom.className = 'mdeditor-main';
        mainDom.appendChild(editorContainer);
        mainDom.appendChild(tocDom);

        const toolsDom = this.toolsDom = createDom('div');
        toolsDom.className = 'mdeditor-tools';
        this.dom.appendChild(toolsDom);
        this.dom.appendChild(mainDom);

        const scrollTopDom = createDom('div');
        scrollTopDom.className = 'mdeditor-scrolltop editor-scrolltop';
        scrollTopDom.innerHTML = '<i class="iconfont icon-huidaodingbu"></i>';
        this.dom.appendChild(scrollTopDom);
        on$1(scrollTopDom, 'click', () => {
            this.editor.setScrollTop(0, 0);
        });
        // mainDom.appendChild(editorDom);
        // mainDom.appendChild(previewDom);

        this.editor = monaco.editor.create(this.editorDom, Object.assign({}, OPTIONS.monacoOptions, monacoOptions));
        this.editor.onDidChangeModelContent(() => {
            const value = this.getValue();
            this.editorUpdateValues.push(value);
        });
        this.editor.onDidScrollChange((e) => {
            this._scrollEvent = e;
            this._syncScroll();
        });
        this.editor.onDidPaste((e) => {
            if (!this.options.autoParseVSCodePasteData) {
                return;
            }
            const result = getVSCodePasteData(this.pasteItems);
            if (!e.range || !result || result.language === 'markdown') {
                return;
            }
            this.editor.popUndoStop();
            this.editor.executeEdits('', [
                {
                    range: e.range,
                    text: '```' + result.language + '\n' + result.text + '\n```\n'
                }
            ]);
        });
        this.editor.addAction({
            id: '', // 菜单项 id
            label: 'Format Code', // 菜单项名称
            keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
            contextMenuGroupId: '9_cutcopypaste', // 所属菜单的分组
            run: () => {
                const prettier = getPrettier();
                if (!prettier) {
                    const message = 'not find prettier';
                    console.warn(message);
                    miniToastr.warn(message);
                    return;
                }
                if (!prettier.prettierPlugins) {
                    const message = 'not find prettier plugins';
                    console.warn(message);
                    miniToastr.warn(message);
                    return;
                }
                prettier.format(this.getValue(), Object.assign({}, this.options.prettierOptions, {
                    parser: 'markdown',
                    plugins: prettier.prettierPlugins
                })).then(text => {
                    const [range] = this.getWholeRange();
                    this.editor.executeEdits('', [
                        {
                            range,
                            text
                        }
                    ]);
                    setTimeout(() => {
                        this._syncScroll();
                    }, 1000);
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
        const lis = themes.map(name => {
            const li = createLiElement();
            li.dataset.theme = name;
            li.innerHTML = `<i class="iconfont icon-31liebiao"></i>&nbsp;&nbsp;${name}`;
            themeDom.appendChild(li);
            return li;
        });
        lis.forEach(li => {
            on$1(li, 'click', e => {
                const theme = e.target.dataset.theme;
                this._activeThemeItem(e.target);
                this.setTheme(theme);
            });
        });
        this.clickOutSide.addDom(this.themeDom);
        on$1(themeDom, 'clickoutside', hideDomByDisplay);
    }

    _initExportFile() {
        const exportFileDom = createFloatPanel();
        this.exportFileDom = exportFileDom;
        this.mainDom.appendChild(exportFileDom);
        const lis = exportFilesData.map(d => {
            const li = createLiElement();
            li.dataset.type = d.type;
            li.innerHTML = `<i class="iconfont ${d.icon}"></i>&nbsp;&nbsp;${d.label}`;
            exportFileDom.appendChild(li);
            return li;
        });
        lis.forEach(li => {
            on$1(li, 'click', e => {
                const theme = e.target.dataset.type;
                this._exportFile(theme);
            });
        });
        this.clickOutSide.addDom(this.exportFileDom);
        on$1(exportFileDom, 'clickoutside', hideDomByDisplay);
    }

    _initEmoji() {
        const emojiDom = createFloatPanel();
        this.emojiDom = emojiDom;
        const onEmojiSelect = (data) => {
            // console.log(data);
            const native = data.native;
            const [range] = this.getCurrentRange();
            this.editor.executeEdits('', [
                {
                    range,
                    text: `${native}\n`
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
        on$1(emojiDom, 'clickoutside', hideDomByDisplay);
    }

    _exportFile(type) {
        const previewDom = this.previewDom;
        // const children = this.previewDom.children;
        // const scrollTopDom = children[children.length - 1];
        // const addScroll = () => {
        //     previewDom.appendChild(scrollTopDom);
        // };

        // const removeScroll = () => {
        //     previewDom.removeChild(scrollTopDom);
        // };
        let text, fileType;
        if (type === 'markdown') {
            text = this.editor.getValue();
            fileType = 'md';
        } else if (type === 'html') {
            // removeScroll();
            text = exportHTML(previewDom.outerHTML, this.styleText);
            fileType = type;
            // addScroll();
        } else if (type === 'png') {
            fileType = type;
            showLoading();
            // removeScroll();
            // let w = 0;
            // Array.prototype.forEach.call(children, element => {
            //     const rect = element.getBoundingClientRect();
            //     w = Math.max(rect.width, w);
            // });
            const rect = previewDom.getBoundingClientRect();
            const { scrollHeight } = this.previewDom;
            const { height } = rect;
            const { innerHeight } = window;
            // const w = Math.max(width, scrollWidth, innerWidth);
            const h = Math.max(height, scrollHeight, innerHeight) + 10;
            const w = rect.width + 10;
            toBlob(previewDom, { width: w, height: h }).then(blob => {
                saveAs(blob, `${now()}.${fileType}`);
                hideLoading();
                // addScroll();
            }).catch(err => {
                console.error(err);
                getToastr().error(err);
                hideLoading();
                // addScroll();
            });
            return;
        } else if (type === 'print') {
            printJS(this.previewDom.id, 'html');
        } else if (type === 'markmap') {
            const markmap = fromatMarkMapJSON(this.mdText);
            text = exportMarkMapHTML(markmap);
            fileType = 'html';
        }
        if (!text) {
            return;
        }
        const blob = new Blob([text], { type: `text/${text};charset=utf-8` });
        saveAs(blob, `${now()}.${fileType}`);
    }

    _checkPreviewState() {
        const { preview } = this;
        if (preview) {
            this.editorDom.style.width = '50%';
            domShow(this.previewDom);
        } else {
            this.editorDom.style.width = '100%';
            domHide(this.previewDom);
        }
        this.fire(preview ? 'openpreview' : 'closepreview', { preview });
    }

    _checkTocState() {
        const { tocOpen } = this;
        let width = 300;
        if (!tocOpen) {
            width = 0;
        }
        this.editorContainer.style.width = `calc(100% - ${width}px)`;
        this.tocDom.style.width = `${width}px`;
        (width > 0 ? domShow(this.tocDom) : domHide(this.tocDom));
        if (width > 0) {
            this._initTocData();
        }
        this.fire(tocOpen ? 'opentoc' : 'closetoc', { tocOpen });
    }

    _initTocData() {
        if (!this.tocOpen) {
            return this;
        }
        makeToc(this.previewDom, '.mdeditor-toc');
        const aLinks = this.tocDom.querySelectorAll('a');
        aLinks.forEach(dom => {
            dom.id = dom.id || domId();
            dom.textContent = trimTitle(dom.textContent);
        });
        const findDomPosition = (a, currentTitle) => {
            const result = [];
            aLinks.forEach(dom => {
                let title = dom.textContent;
                title = trimTitle(title);
                if (title === currentTitle) {
                    result.push(dom);
                }
            });
            const index = result.indexOf(a);
            return Math.max(index, 0) + 1;
        };
        const model = this.editor.getModel();
        const lineCount = model.getLineCount();
        const headContents = formatHeadContents(this.previewDom);
        const findTitleRow = (a) => {
            let title = a.textContent;
            title = trimTitle(title);
            const index = findDomPosition(a, title);
            let idx = 0;
            for (let lineNum = 1; lineNum <= lineCount; lineNum++) {
                let content = model.getLineContent(lineNum);
                if (isTitle(content, headContents)) {
                    content = trimTitle(content);
                    if (content.indexOf(title) === 0) {
                        idx++;
                        if (idx === index) {
                            return lineNum;
                        }
                    }
                }
            }
        };

        const linkClick = (e) => {
            const a = e.target;
            if (!a.id) {
                return;
            }
            const row = findTitleRow(a);
            if (row) {
                const top = this.editor.getTopForLineNumber(row);
                this.editor.setScrollTop(top);
            }
        };
        aLinks.forEach(a => {
            on$1(a, 'click', linkClick);
        });
    }

    setValue(value) {
        if (!this.editor) {
            console.error('not find editor');
            return this;
        }
        this.editor.setValue(value);
        return this;
    }

    getValue() {
        if (!this.editor) {
            console.error('not find editor');
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
        checkInclude(value, (text) => {
            this.mdText = text;
            let html = md.render(text);
            html = lazyLoad(html);
            const dom = this.previewDom;

            if (dom.childNodes.length === 0) {
                dom.innerHTML = html;
            } else {
                const tempDom = document.createElement('div');
                tempDom.className = this.previewDom.className;
                tempDom.id = this.previewDom.id;
                tempDom.innerHTML = html;
                morphdom(this.previewDom, tempDom);
                // domDiff(dom, tempDom, this);
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
            // scrollTop(dom, this);
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
        let top = 0;
        if (scrollTop > 10) {
            top = calScroll(this.editor, previewDom);
            if (!top) {
                const previewHeight = Math.max(previewDom.scrollHeight, scrollHeight);
                top = scrollTop / scrollHeight * previewHeight;
            }
        }
        previewDom.scroll({
            top,
            left: 0,
            behavior: 'smooth'
        });
    }

    // https://github.com/microsoft/monaco-editor/issues/639
    getSelectText() {
        const range = this.editor.getSelection();
        const text = this.editor.getModel().getValueInRange(range);
        if (!text) {
            return;
        }
        return [range, text];
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
        // const model = this.editor.getModel();
        return [starRange, endRange];
    }

    // https://blog.csdn.net/Anchor_CHEN/article/details/127223203
    getCurrentRange() {
        const position = this.editor.getPosition();
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
        };
        return [range];
    }

    getWholeRange() {
        const model = this.editor.getModel();
        const linesNumber = model.getLineCount();
        const range = {
            startLineNumber: 1,
            endLineNumber: linesNumber,
            startColumn: 1,
            endColumn: 100000
        };
        return [range];

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
        const items = this.themeDom.querySelectorAll('.mdeditor-theme-select-item');
        if (typeof item === 'string') {
            for (let i = 0, len = items.length; i < len; i++) {
                if (items[i].dataset.theme === item) {
                    item = items[i];
                    break;
                }
            }
        }
        if (!item || typeof item === 'string') {
            return;
        }
        items.forEach(item => {
            item.classList.remove(ACTIVE_CLASS);
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
        const themeChange = (text) => {
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
            this.styleText = text;
            const style = createDom('style');
            style.id = THEME_ID;
            style.type = 'text/css';
            style.innerHTML = text;
            document.head.appendChild(style);
            this._activeThemeItem(theme);
            this.fire('themechange', { theme, value: text });
            if (this.dark && theme.indexOf('dark') === -1) {
                console.warn(`current model is dark,the '${theme}' theme is mismatching`);
            }
        };
        const themeCache = this.options.themeCache;
        if (THEMECACHE.get(theme) && themeCache) {
            themeChange(THEMECACHE.get(theme));
        } else {
            const url = `${this.options.themeURL}${theme}.css?t=${now()}`;
            // get theme style
            const promise = fetchScheduler.createFetch(url, {
                // ...
            });
            promise.then(res => res.text()).then(text => {
                if (themeCache) {
                    THEMECACHE.set(theme, text);
                }
                themeChange(text);
            }).catch(err => {
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
        return Array.prototype.map.call(this.toolsDom.children, c => {
            return c.parent;
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
        const DARKCLASS = 'mdeditor-dark';
        const TOOLCLASS = 'mdeditor-panel-dark';
        const dark = this.dark;
        doms.forEach(dom => {
            if (dark) {
                dom.classList.add(DARKCLASS);
                dom.classList.add(TOOLCLASS);
            } else {
                dom.classList.remove(DARKCLASS);
                dom.classList.remove(TOOLCLASS);
            }
        });
        iconDoms.forEach(dom => {
            if (dark) {
                dom.classList.add(DARKCLASS);
            } else {
                dom.classList.remove(DARKCLASS);
            }
        });

        this.editor.updateOptions({
            theme: dark ? 'vs-dark' : 'vs'
        });
        let previewTheme = 'vitepress';
        for (let len = this.themeHistroy.length, i = len - 1; i >= 0; i--) {
            if (this.themeHistroy[i].indexOf('dark') === -1) {
                previewTheme = this.themeHistroy[i];
                break;
            }
        }
        this.setTheme(dark ? 'github-dark' : previewTheme);
        this.fire(dark ? 'opendark' : 'closedark', { dark });
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

export { MDEditor, ToolIcon, getMarkdownIt, hideLoading, registerFlowChart, registerHightLight, registerMarkMap, registerMermaid, registerMonaco, registerPrettier, registerQRCode, registerShikiHighlighter, registerSwiper, registerXLSX, registerX_spreadsheet, showLoading, themes };
