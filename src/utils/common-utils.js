
import { 
  uuid, 
  isFunction, 
  isNumber, 
  isFireFox, 
  isEmail, 
  setToken, 
  getToken, 
  removeToken, 
  getHost, 
  wrapUrl, 
  getURLParams 
} from './index';

// Re-export common utilities
export { 
  uuid, 
  isFunction, 
  isNumber, 
  isFireFox, 
  isEmail, 
  setToken, 
  getToken, 
  removeToken, 
  getHost, 
  wrapUrl, 
  getURLParams 
};

// --- SVG Utilities ---

export const getAttribute = (t, e) => t.getAttribute(e);
export const isSVG = (t) => t instanceof SVGElement;

export const svgToBase64 = (t) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(t)))}`;

export const svgToCanvasBase64 = (t, callback, r) => {
  const img = new Image();
  img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(t)))}`;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL('image/png');
    if (callback) callback(dataURL);
  };
};

export const getSVGDomNode = (t) => {
  const div = document.createElement('div');
  div.innerHTML = t;
  return div.firstElementChild;
};

export const readSVGS = (files, callback) => {
  let count = 0;
  const results = {};
  files.forEach((file) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      const name = file.name.split('.')[0];
      results[name] = e.target.result;
      count++;
      if (count === files.length && callback) {
        callback(results);
      }
    };
  });
};

export const getCanvasColorBBOX = (canvas) => {
  const { width, height } = canvas;
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[4 * (y * width + x) + 3] !== 0) {
        if (minX > x) minX = x;
        if (maxX < x) maxX = x;
        if (minY > y) minY = y;
        if (maxY < y) maxY = y;
      }
    }
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

export const parseSVGDefs = (svgContent) => {
  const div = document.createElement('div');
  div.innerHTML = svgContent;
  return div.querySelector('defs') || null;
};

export const getSVGColor = (node) => node.getAttribute('fill') || node.getAttribute('stroke') || 'black';

export const getSVGTextNodes = (node) => {
  const texts = [];
  node.querySelectorAll('text').forEach((t) => texts.push(t));
  return texts;
};

export const filterTextNodes = (nodes) => {
  const result = [];
  nodes.forEach((node) => {
    const content = node.textContent;
    if (content && content.trim() !== '') {
      result.push(node);
    }
  });
  return result;
};

export const getTransFormValues = (node) => {
  const result = { x: 0, y: 0, scale: 1, rotate: 0 };
  const transform = node.getAttribute('transform');
  if (!transform) return result;

  const translateMatch = transform.match(/translate\(([^,]+),([^)]+)\)/);
  if (translateMatch) {
    result.x = parseFloat(translateMatch[1]);
    result.y = parseFloat(translateMatch[2]);
  }

  const scaleMatch = transform.match(/scale\(([^)]+)\)/);
  if (scaleMatch) {
    result.scale = parseFloat(scaleMatch[1]);
  }

  const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
  if (rotateMatch) {
    result.rotate = parseFloat(rotateMatch[1]);
  }

  return result;
};

export const getNodeMatrix = (node) => node.getCTM();

export const getTextAttributes = (node) => {
  const style = window.getComputedStyle(node);
  return {
    fill: style.fill,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textAnchor: style.textAnchor,
    dominantBaseline: style.dominantBaseline,
    opacity: style.opacity,
  };
};

export const nodeIsNotDisplay = (node) => {
  const style = window.getComputedStyle(node);
  return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
};

export const nodeIsInMask = (node) => {
  let curr = node;
  while (curr && curr.tagName !== 'svg') {
    if (curr.tagName === 'mask') return true;
    curr = curr.parentNode;
  }
  return false;
};

export const nodeIsInDefs = (node) => {
  let curr = node;
  while (curr && curr.tagName !== 'svg') {
    if (curr.tagName === 'defs') return true;
    curr = curr.parentNode;
  }
  return false;
};

export const pathBBOX = (path) => {
  const bbox = path.getBBox();
  return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
};

export const bboxContains = (outer, inner) => {
  return (
    outer.x <= inner.x &&
    outer.y <= inner.y &&
    outer.x + outer.width >= inner.x + inner.width &&
    outer.y + outer.height >= inner.y + inner.height
  );
};

export const pointInRing = (point, ring) => {
  let inside = false;
  let j = ring.length - 1;
  for (let i = 0; i < ring.length; j = i++) {
    const xi = ring[i].x, yi = ring[i].y;
    const xj = ring[j].x, yj = ring[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export const isLeft = (p0, p1, p2) => {
  return (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y);
};

export const ringInRing = (innerRing, outerRing) => {
  for (let i = 0; i < innerRing.length; i++) {
    if (!pointInRing(innerRing[i], outerRing)) return false;
  }
  return true;
};

export const mergeTextPaths = (paths) => {
  const mergedGroups = [];
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    if (!path.merged) {
      const group = [path];
      for (let j = i + 1; j < paths.length; j++) {
        const other = paths[j];
        // Assuming window.isSameTextPath is defined elsewhere or intended to be global
        if (!other.merged && window.isSameTextPath && window.isSameTextPath(path, other)) {
          group.push(other);
          other.merged = true;
        }
      }
      mergedGroups.push(group);
    }
  }
  return mergedGroups;
};

export const findHoles = (polygons) => {
  const holes = [];
  const outers = [];
  
  for (let i = 0; i < polygons.length; i++) {
    const poly = polygons[i];
    let isHole = false;
    for (let j = 0; j < polygons.length; j++) {
      if (i !== j) {
        const other = polygons[j];
        if (ringInRing(poly, other)) {
          poly.hole = true;
          poly.parent = other;
          holes.push(poly);
          isHole = true;
          break;
        }
      }
    }
    if (!isHole) {
      outers.push(poly);
    }
  }
  return { holes, outers };
};

export const setSVGNodesPrivateid = (nodes) => {
  let id = 0;
  nodes.forEach((node) => {
    node._privateid = id++;
  });
};

export const getAnimationNodes = (root) => {
  const nodes = [];
  root.querySelectorAll('animate,animateTransform,animateMotion').forEach((node) => {
    nodes.push(node);
  });
  return nodes;
};

export const parseAnimation = (node) => {
  return {
    attributeName: node.getAttribute('attributeName'),
    from: node.getAttribute('from'),
    to: node.getAttribute('to'),
    dur: node.getAttribute('dur'),
    repeatCount: node.getAttribute('repeatCount'),
    fill: node.getAttribute('fill'),
    calcMode: node.getAttribute('calcMode'),
    values: node.getAttribute('values'),
    keyTimes: node.getAttribute('keyTimes'),
    keySplines: node.getAttribute('keySplines'),
    transformType: node.getAttribute('type'),
  };
};

export const filterLink = (nodes) => {
  const result = [];
  nodes.forEach((node) => {
    if (node.tagName !== 'a') {
      result.push(node);
    }
  });
  return result;
};

// --- Geometry Utilities (Depend on THREE) ---

export const geometryMinMaxZ = (t) => {
  let minZ = Infinity;
  let maxZ = -Infinity;
  const array = t.getAttribute('position').array;
  array.forEach((val, idx) => {
    if ((idx + 1) % 3 === 0) {
      if (minZ > val) minZ = val;
      if (maxZ < val) maxZ = val;
    }
  });
  return { minZ, maxZ };
};

export const fixGeometryZ = (t) => {
  const { minZ, maxZ } = geometryMinMaxZ(t);
  const mid = (minZ + maxZ) / 2;
  t.translate(0, 0, -mid);
};

export const centerGeometryZ = (t) => {
  const { minZ, maxZ } = geometryMinMaxZ(t);
  const mid = (maxZ - minZ) / 2;
  t.translate(0, 0, mid);
};

export const getCirclePoints = (cx, cy, r, count) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = ((2 * Math.PI) / count) * i;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push({ x, y });
  }
  return points;
};

export const createBufferGeometry = (points) => {
  const THREE = window.THREE; 
  if (!THREE) return null;
  
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  points.forEach((p) => {
    positions.push(p.x, p.y, p.z);
    normals.push(p.nx, p.ny, p.nz);
    uvs.push(p.u, p.v);
    indices.push(p.index);
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
};

export const alignGeometry = (obj1, obj2) => {
  const THREE = window.THREE;
  if (!THREE) return;

  const box1 = new THREE.Box3().setFromObject(obj1);
  const w1 = box1.max.x - box1.min.x;
  const h1 = box1.max.y - box1.min.y;
  const d1 = box1.max.z - box1.min.z;
  
  const box2 = new THREE.Box3().setFromObject(obj2);
  const w2 = box2.max.x - box2.min.x;
  const h2 = box2.max.y - box2.min.y;
  const d2 = box2.max.z - box2.min.z;

  const scaleX = w2 / w1;
  const scaleY = h2 / h1;
  const scaleZ = d2 / d1;
  const scale = Math.min(scaleX, scaleY, scaleZ);

  obj1.scale.set(scale, scale, scale);
  obj1.position.set(0, 0, 0);
  obj2.position.set(0, 0, 0);

  const finalBox = new THREE.Box3().setFromObject(obj1);
  const cx = finalBox.min.x + (finalBox.max.x - finalBox.min.x) / 2;
  const cy = finalBox.min.y + (finalBox.max.y - finalBox.min.y) / 2;
  const cz = finalBox.min.z + (finalBox.max.z - finalBox.min.z) / 2;

  obj1.position.set(-cx, -cy, -cz);
};

export const setCanvasSize = (canvas, width, height) => {
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width;
  canvas.height = height;
};

export const clearCanvas = (canvas) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// --- Window Assignments for Compatibility ---

window.uuid = uuid;
window.isFunction = isFunction;
window.isNumber = isNumber;
window.isFireFox = isFireFox;
window.isEmail = isEmail;
window.getHost = getHost;
window.wrapUrl = wrapUrl;
window.getURLParams = getURLParams;
window.setToken = setToken;
window.getToken = getToken;
window.removeToken = removeToken;
window.getAttribute = getAttribute;
window.isSVG = isSVG;
window.svgToBase64 = svgToBase64;
window.svgToCanvasBase64 = svgToCanvasBase64;
window.getSVGDomNode = getSVGDomNode;
window.readSVGS = readSVGS;
window.getCanvasColorBBOX = getCanvasColorBBOX;
window.geometryMinMaxZ = geometryMinMaxZ;
window.fixGeometryZ = fixGeometryZ;
window.centerGeometryZ = centerGeometryZ;
window.getCirclePoints = getCirclePoints;
window.createBufferGeometry = createBufferGeometry;
window.alignGeometry = alignGeometry;
window.setCanvasSize = setCanvasSize;
window.clearCanvas = clearCanvas;
window.parseSVGDefs = parseSVGDefs;
window.getSVGColor = getSVGColor;
window.getSVGTextNodes = getSVGTextNodes;
window.filterTextNodes = filterTextNodes;
window.getTransFormValues = getTransFormValues;
window.getNodeMatrix = getNodeMatrix;
window.getTextAttributes = getTextAttributes;
window.nodeIsNotDisplay = nodeIsNotDisplay;
window.nodeIsInMask = nodeIsInMask;
window.nodeIsInDefs = nodeIsInDefs;
window.pathBBOX = pathBBOX;
window.bboxContains = bboxContains;
window.pointInRing = pointInRing;
window.isLeft = isLeft;
window.ringInRing = ringInRing;
window.mergeTextPaths = mergeTextPaths;
window.findHoles = findHoles;
window.setSVGNodesPrivateid = setSVGNodesPrivateid;
window.getAnimationNodes = getAnimationNodes;
window.parseAnimation = parseAnimation;
window.filterLink = filterLink;
