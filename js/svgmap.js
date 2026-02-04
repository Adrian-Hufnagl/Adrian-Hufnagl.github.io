/**
 * Custom high-performance SVG world map (Mercator).
 *
 * Base map SVG source (CC BY-SA 3.0):
 * - "Mercator Projection.svg" by Geordie Bosanko (2011)
 * - https://commons.wikimedia.org/wiki/File:Mercator_Projection.svg
 *
 * Markers are expected in the same shape as `cities.features` from `js/map.js`:
 * - geometry.coordinates: [lon, lat]
 * - properties: { name, color, radius }
 */
(function () {
  "use strict";

  const DEBUG = /(?:\?|&)svgdebug=1(?:&|$)/.test(window.location.search || "");

  const BASE_VIEWBOX = {
    x: 0,
    y: 0,
    width: 1652.4702,
    height: 1220.6385,
  };

  const MAX_MERCATOR_LAT = 85.05112878;

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function mercatorProject(lonDeg, latDeg) {
    const lon = clamp(lonDeg, -180, 180);
    const lat = clamp(latDeg, -MAX_MERCATOR_LAT, MAX_MERCATOR_LAT);
    const xNorm = (lon + 180) / 360;
    const latRad = (lat * Math.PI) / 180;
    const yNorm =
      (1 - Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / Math.PI) / 2;

    return {
      x: xNorm * BASE_VIEWBOX.width,
      y: yNorm * BASE_VIEWBOX.height,
    };
  }

  function parseMaybeLocaleNumber(value) {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return Number.NaN;
    return Number.parseFloat(value.replace(",", "."));
  }

  function createSvgEl(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function setAttrs(el, attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, String(v));
    }
  }

  function buildLandPathData(geojson) {
    if (!geojson || geojson.type !== "FeatureCollection") return "";
    const features = Array.isArray(geojson.features) ? geojson.features : [];

    let d = "";

    for (const f of features) {
      const props = f && f.properties ? f.properties : null;
      // Keep Antarctica excluded like your AMCharts map.
      if (props && props.id === "AQ") continue;

      const geom = f && f.geometry ? f.geometry : null;
      if (!geom) continue;

      const type = geom.type;
      const coords = geom.coordinates;
      if (!coords) continue;

      const writeRing = (ring) => {
        if (!Array.isArray(ring) || ring.length < 2) return;
        const p0 = ring[0];
        if (!p0 || p0.length < 2) return;
        const m0 = mercatorProject(p0[0], p0[1]);
        d += `M${m0.x.toFixed(2)},${m0.y.toFixed(2)}`;
        for (let i = 1; i < ring.length; i++) {
          const p = ring[i];
          if (!p || p.length < 2) continue;
          const m = mercatorProject(p[0], p[1]);
          d += `L${m.x.toFixed(2)},${m.y.toFixed(2)}`;
        }
        d += "Z";
      };

      if (type === "Polygon") {
        // coords: [ [ring], [hole], ... ]
        for (const ring of coords) writeRing(ring);
      } else if (type === "MultiPolygon") {
        // coords: [ [ [ring], ... ], ... ]
        for (const poly of coords) {
          if (!Array.isArray(poly)) continue;
          for (const ring of poly) writeRing(ring);
        }
      }
    }

    return d;
  }

  function buildLandPathDataAsync(geojson, onDone) {
    if (!geojson || geojson.type !== "FeatureCollection") {
      onDone("");
      return;
    }
    const features = Array.isArray(geojson.features) ? geojson.features : [];

    let idx = 0;
    const parts = [];

    const step = () => {
      const start = performance.now();
      while (idx < features.length && performance.now() - start < 10) {
        const f = features[idx++];
        const props = f && f.properties ? f.properties : null;
        if (props && props.id === "AQ") continue;
        const geom = f && f.geometry ? f.geometry : null;
        if (!geom) continue;
        const type = geom.type;
        const coords = geom.coordinates;
        if (!coords) continue;

        const writeRing = (ring) => {
          if (!Array.isArray(ring) || ring.length < 2) return;
          const p0 = ring[0];
          if (!p0 || p0.length < 2) return;
          const m0 = mercatorProject(p0[0], p0[1]);
          parts.push("M", String(m0.x), ",", String(m0.y));
          for (let i = 1; i < ring.length; i++) {
            const p = ring[i];
            if (!p || p.length < 2) continue;
            const m = mercatorProject(p[0], p[1]);
            parts.push("L", String(m.x), ",", String(m.y));
          }
          parts.push("Z");
        };

        if (type === "Polygon") {
          for (const ring of coords) writeRing(ring);
        } else if (type === "MultiPolygon") {
          for (const poly of coords) {
            if (!Array.isArray(poly)) continue;
            for (const ring of poly) writeRing(ring);
          }
        }
      }

      if (idx < features.length) {
        requestAnimationFrame(step);
      } else {
        onDone(parts.join(""));
      }
    };

    requestAnimationFrame(step);
  }

  class SvgMercatorMap {
    constructor(container) {
      this.container = container;
      this.svg = createSvgEl("svg");
      this.viewport = createSvgEl("g");
      this.baseLayer = createSvgEl("g");
      this.markerLayer = createSvgEl("g");
      this.selectionLayer = createSvgEl("g");
      this.statusLayer = DEBUG ? createSvgEl("g") : null;
      this._statusText = DEBUG ? createSvgEl("text") : null;
      this._tooltip = null;

      this._rafPending = false;
      this._scale = 1;
      this._tx = 0;
      this._ty = 0;
      this._minScale = 1;
      this._maxScale = 24;

      // Wheel zoom state (rAF-throttled for smoothness)
      this._wheelAccumPx = 0;
      this._wheelLastPoint = null; // {x,y}
      this._wheelRaf = null;

      this._pointerActive = false;
      this._pointerId = null;
      this._dragStart = { x: 0, y: 0, tx: 0, ty: 0 };
      this._didDrag = false;

      this._selectedIndex = null;
      this._markerElsByIndex = new Map();
      this._markers = [];

      this._landEl = null;
      this._interactionDepth = 0;
      this._interactionIdleTimer = null;
      this._gestureState = null;

      this._initDom();
      this._attachEvents();
      this._applyTransform(true);
    }

    _initDom() {
      setAttrs(this.svg, {
        viewBox: `${BASE_VIEWBOX.x} ${BASE_VIEWBOX.y} ${BASE_VIEWBOX.width} ${BASE_VIEWBOX.height}`,
        role: "img",
      });

      const ocean = createSvgEl("rect");
      setAttrs(ocean, {
        x: BASE_VIEWBOX.x,
        y: BASE_VIEWBOX.y,
        width: BASE_VIEWBOX.width,
        height: BASE_VIEWBOX.height,
        fill: "#ffffff",
      });
      this.svg.appendChild(ocean);

      this.svg.appendChild(this.viewport);
      this.viewport.appendChild(this.baseLayer);
      this.viewport.appendChild(this.markerLayer);
      this.viewport.appendChild(this.selectionLayer);

      // Status overlay (outside viewport so it doesn't scale)
      if (DEBUG && this._statusText && this.statusLayer) {
        setAttrs(this._statusText, {
          x: 10,
          y: 18,
          fill: "rgba(31, 42, 47, 0.6)",
          "font-size": 14,
          "font-family":
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        });
        this._statusText.textContent = "SVG map ready";
        this.statusLayer.appendChild(this._statusText);
        this.svg.appendChild(this.statusLayer);
      }

      // Base map: render land polygons ourselves (Mercator) so we fully control styling
      // and avoid baked-in "small territory" dots from some blank map SVG assets.
      const land = createSvgEl("path");
      setAttrs(land, {
        d: "",
        fill: "#c6c6c6",
        stroke: "#ffffff",
        "stroke-width": 1,
        "vector-effect": "non-scaling-stroke",
        "pointer-events": "none",
      });
      this.baseLayer.appendChild(land);
      this._landEl = land;

      if (window.am5geodata_worldLow) {
        // Build path asynchronously to avoid blocking page load.
        buildLandPathDataAsync(window.am5geodata_worldLow, (d) => {
          if (d) land.setAttribute("d", d);
        });
      } else {
        // Fallback to a static asset if amCharts geodata is unavailable.
        const baseImg = createSvgEl("image");
        setAttrs(baseImg, {
          href: "img/mercator_projection.svg",
          x: BASE_VIEWBOX.x,
          y: BASE_VIEWBOX.y,
          width: BASE_VIEWBOX.width,
          height: BASE_VIEWBOX.height,
          preserveAspectRatio: "none",
          opacity: "0.88",
          "pointer-events": "none",
        });
        this.baseLayer.appendChild(baseImg);
      }

      // Subtle border (outside viewport so it doesn't scale).
      const border = createSvgEl("rect");
      setAttrs(border, {
        x: BASE_VIEWBOX.x + 0.5,
        y: BASE_VIEWBOX.y + 0.5,
        width: BASE_VIEWBOX.width - 1,
        height: BASE_VIEWBOX.height - 1,
        fill: "none",
        stroke: "rgba(31, 42, 47, 0.14)",
        "vector-effect": "non-scaling-stroke",
      });
      this.svg.appendChild(border);

      this.container.innerHTML = "";
      this.container.appendChild(this.svg);

      // Tooltip element (HTML, outside SVG for crisp text and easy styling)
      const tip = document.createElement("div");
      tip.className = "svgmap-tooltip";
      tip.style.cssText =
        "position:absolute;pointer-events:none;background:rgba(31,42,47,0.92);" +
        "color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;" +
        "font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;" +
        "white-space:nowrap;opacity:0;transition:opacity 0.12s;z-index:10;";
      this.container.style.position = "relative";
      this.container.appendChild(tip);
      this._tooltip = tip;
    }

    _clientToSvgPoint(clientX, clientY) {
      const pt = this.svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = this.svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const local = pt.matrixTransform(ctm.inverse());
      return { x: local.x, y: local.y };
    }

    _clampTransform() {
      const viewW = BASE_VIEWBOX.width;
      const viewH = BASE_VIEWBOX.height;
      const scaledW = BASE_VIEWBOX.width * this._scale;
      const scaledH = BASE_VIEWBOX.height * this._scale;

      if (scaledW <= viewW) {
        this._tx = (viewW - scaledW) / 2;
      } else {
        this._tx = clamp(this._tx, viewW - scaledW, 0);
      }

      if (scaledH <= viewH) {
        this._ty = (viewH - scaledH) / 2;
      } else {
        this._ty = clamp(this._ty, viewH - scaledH, 0);
      }
    }

    _applyTransform(force) {
      if (!force) {
        if (this._rafPending) return;
        this._rafPending = true;
        requestAnimationFrame(() => {
          this._rafPending = false;
          this._clampTransform();
          this.viewport.setAttribute(
            "transform",
            `matrix(${this._scale} 0 0 ${this._scale} ${this._tx} ${this._ty})`
          );
        });
        return;
      }

      this._clampTransform();
      this.viewport.setAttribute(
        "transform",
        `matrix(${this._scale} 0 0 ${this._scale} ${this._tx} ${this._ty})`
      );
    }

    _wheelDeltaPixels(e) {
      // Normalize delta across devices and deltaMode (pixel/line/page).
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16; // lines -> px (typical)
      if (e.deltaMode === 2) dy *= BASE_VIEWBOX.height; // pages -> px-ish
      return dy;
    }

    _setInteracting(on) {
      if (on) {
        this._interactionDepth++;
        if (this._interactionDepth === 1) {
          // Reduce expensive stroke work while zooming/pinching.
          if (this._landEl) {
            this._landEl.setAttribute("stroke-opacity", "0.0");
          }
        }
        if (this._interactionIdleTimer) {
          clearTimeout(this._interactionIdleTimer);
          this._interactionIdleTimer = null;
        }
        this._interactionIdleTimer = setTimeout(() => {
          this._setInteracting(false);
        }, 120);
        return;
      }

      if (this._interactionDepth > 0) this._interactionDepth--;
      if (this._interactionDepth === 0) {
        if (this._landEl) {
          this._landEl.setAttribute("stroke-opacity", "1");
        }
      }
    }

    _attachEvents() {
      // Hover tooltip + selection (delegated)
      let hoverTimer = null;
      
      this.markerLayer.addEventListener("mouseover", (e) => {
        const t = e.target;
        if (!t || typeof t.getAttribute !== "function") return;
        const name = t.getAttribute("data-name");
        const idxStr = t.getAttribute("data-i");
        if (!name) return;
        
        // Show tooltip immediately
        this._tooltip.textContent = name;
        this._tooltip.style.opacity = "1";
        
        // Select station after short delay (so quick mouse movements don't spam)
        if (hoverTimer) clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          const idx = Number(idxStr);
          if (Number.isFinite(idx)) {
            this._handleMarkerClick(idx, name);
          }
        }, 300);
      });

      this.markerLayer.addEventListener("mouseout", (e) => {
        const t = e.target;
        if (!t || typeof t.getAttribute !== "function") return;
        if (t.getAttribute("data-name") !== null) {
          this._tooltip.style.opacity = "0";
          if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
          }
        }
      });

      this.svg.addEventListener("mousemove", (e) => {
        if (this._tooltip.style.opacity === "0") return;
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left + 12;
        const y = e.clientY - rect.top + 12;
        this._tooltip.style.left = x + "px";
        this._tooltip.style.top = y + "px";
      });

      // Wheel zoom
      this.svg.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          this._setInteracting(true);
          const p = this._clientToSvgPoint(e.clientX, e.clientY);
          this._wheelAccumPx += this._wheelDeltaPixels(e);
          this._wheelLastPoint = p;

          // Trackpad pinch in Chromium usually comes as ctrlKey+wheel.
          // Apply immediately for responsiveness (no extra frame of perceived delay).
          if (e.ctrlKey) {
            const deltaPx = this._wheelAccumPx;
            this._wheelAccumPx = 0;
            const worldX = (p.x - this._tx) / this._scale;
            const worldY = (p.y - this._ty) / this._scale;
            const zoomIntensity = 0.0017; // slightly gentler for pinch
            const zoom = Math.exp(-deltaPx * zoomIntensity);
            const nextScale = clamp(
              this._scale * zoom,
              this._minScale,
              this._maxScale
            );
            this._scale = nextScale;
            this._tx = p.x - worldX * this._scale;
            this._ty = p.y - worldY * this._scale;
            this._applyTransform(true);
            return;
          }

          if (this._wheelRaf) return;
          this._wheelRaf = requestAnimationFrame(() => {
            this._wheelRaf = null;
            if (!this._wheelLastPoint) return;

            const point = this._wheelLastPoint;
            const deltaPx = this._wheelAccumPx;
            this._wheelAccumPx = 0;

            const worldX = (point.x - this._tx) / this._scale;
            const worldY = (point.y - this._ty) / this._scale;

            // Continuous zoom; tuned to feel snappy but stable.
            const zoomIntensity = 0.002;
            const zoom = Math.exp(-deltaPx * zoomIntensity);

            const nextScale = clamp(this._scale * zoom, this._minScale, this._maxScale);
            this._scale = nextScale;
            this._tx = point.x - worldX * this._scale;
            this._ty = point.y - worldY * this._scale;
            this._applyTransform(false);
          });
        },
        { passive: false }
      );

      // Safari trackpad pinch often dispatches gesture events instead of ctrl+wheel.
      // These are non-standard but widely supported on macOS Safari.
      this.svg.addEventListener(
        "gesturestart",
        (e) => {
          e.preventDefault();
          this._setInteracting(true);
          const p = this._clientToSvgPoint(e.clientX, e.clientY);
          const worldX = (p.x - this._tx) / this._scale;
          const worldY = (p.y - this._ty) / this._scale;
          this._gestureState = {
            baseScale: this._scale,
            point: p,
            worldX,
            worldY,
          };
        },
        { passive: false }
      );

      this.svg.addEventListener(
        "gesturechange",
        (e) => {
          if (!this._gestureState) return;
          e.preventDefault();
          this._setInteracting(true);
          const { baseScale, point, worldX, worldY } = this._gestureState;
          const nextScale = clamp(
            baseScale * e.scale,
            this._minScale,
            this._maxScale
          );
          this._scale = nextScale;
          this._tx = point.x - worldX * this._scale;
          this._ty = point.y - worldY * this._scale;
          this._applyTransform(true);
        },
        { passive: false }
      );

      this.svg.addEventListener(
        "gestureend",
        (e) => {
          e.preventDefault();
          this._setInteracting(false);
          this._gestureState = null;
        },
        { passive: false }
      );

      // Drag pan
      this.svg.addEventListener("pointerdown", (e) => {
        // Only primary button for mouse.
        if (e.pointerType === "mouse" && e.button !== 0) return;
        this._pointerActive = true;
        this._pointerId = e.pointerId;
        this._didDrag = false;
        this.svg.setPointerCapture(e.pointerId);

        const p = this._clientToSvgPoint(e.clientX, e.clientY);
        this._dragStart = { x: p.x, y: p.y, tx: this._tx, ty: this._ty, clientX: e.clientX, clientY: e.clientY };
      });

      this.svg.addEventListener("pointermove", (e) => {
        if (!this._pointerActive) return;
        if (this._pointerId !== e.pointerId) return;
        
        // Check if we moved enough to consider it a drag (not a click)
        const dx = e.clientX - this._dragStart.clientX;
        const dy = e.clientY - this._dragStart.clientY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          this._didDrag = true;
        }
        
        const p = this._clientToSvgPoint(e.clientX, e.clientY);
        this._tx = this._dragStart.tx + (p.x - this._dragStart.x);
        this._ty = this._dragStart.ty + (p.y - this._dragStart.y);
        this._applyTransform(false);
      });

      this.svg.addEventListener("pointerup", (e) => {
        if (this._pointerId !== e.pointerId) return;
        
        // If we didn't drag, check if we clicked on a marker
        if (!this._didDrag) {
          const t = e.target;
          if (t && typeof t.getAttribute === "function") {
            const idxStr = t.getAttribute("data-i");
            if (idxStr !== null) {
              const idx = Number(idxStr);
              if (Number.isFinite(idx)) {
                this._handleMarkerClick(idx, t.getAttribute("data-name") || "");
              }
            }
          }
        }
        
        this._pointerActive = false;
        this._pointerId = null;
      });
      
      this.svg.addEventListener("pointercancel", (e) => {
        if (this._pointerId !== e.pointerId) return;
        this._pointerActive = false;
        this._pointerId = null;
      });
      
      this.svg.addEventListener("pointerleave", (e) => {
        if (this._pointerId !== e.pointerId) return;
        this._pointerActive = false;
        this._pointerId = null;
      });
    }
    
    _handleMarkerClick(idx, name) {
      this.setSelected(idx);

      const list = document.getElementById("climate-list");
      if (list && name) {
        for (const child of list.children) {
          // innerText includes name + icon + country, so use startsWith
          const label = (child.innerText || "").trim();
          if (label.startsWith(name)) {
            child.scrollIntoView({ behavior: "smooth", block: "nearest" });
            // Trigger the onclick handler directly (more reliable than .click())
            if (typeof window.createDiagram === "function") {
              window.createDiagram({ currentTarget: child, target: child });
            } else {
              child.click();
            }
            return;
          }
        }
      }

      if (typeof window.selectPin === "function") {
        window.selectPin(idx);
      }
    }

    setMarkers(features) {
      this._markers = Array.isArray(features) ? features : [];
      this._markerElsByIndex.clear();
      this.markerLayer.innerHTML = "";

      const frag = document.createDocumentFragment();
      let renderedCount = 0;

      for (let i = 0; i < this._markers.length; i++) {
        const f = this._markers[i];
        const coords = f && f.geometry && f.geometry.coordinates;
        if (!coords || coords.length < 2) continue;

        const lon = parseMaybeLocaleNumber(coords[0]);
        const lat = parseMaybeLocaleNumber(coords[1]);
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

        const p = mercatorProject(lon, lat);
        const name = (f.properties && f.properties.name) || "";
        const color =
          f.properties && f.properties.color ? f.properties.color : "#111";
        const rRaw =
          f.properties && Number.isFinite(f.properties.radius)
            ? f.properties.radius
            : 2;
        // Slightly boost radius so markers remain visible on a full-world view.
        const r = Math.max(2.4, rRaw + 0.5);

        const halo = createSvgEl("circle");
        setAttrs(halo, {
          cx: p.x,
          cy: p.y,
          r: r + 1.4,
          fill: "none",
          stroke: "rgba(255,255,255,0.9)",
          "stroke-width": 2.2,
          "vector-effect": "non-scaling-stroke",
          "pointer-events": "none",
        });

        const core = createSvgEl("circle");
        setAttrs(core, {
          cx: p.x,
          cy: p.y,
          r: r,
          fill: color,
          stroke: "rgba(0,0,0,0.55)",
          "stroke-width": 0.9,
          "vector-effect": "non-scaling-stroke",
          opacity: 0.98,
          "data-i": i,
          "data-name": name,
        });
        core.style.cursor = "pointer";

        // Store the core circle for selection ring anchoring.
        this._markerElsByIndex.set(i, core);
        frag.appendChild(halo);
        frag.appendChild(core);
        renderedCount++;
      }

      this.markerLayer.appendChild(frag);
      this._renderSelection();

      if (DEBUG && this._statusText) {
        this._statusText.textContent = `SVG markers: ${this._markers.length} received, ${renderedCount} rendered`;
      }
    }

    setSelected(indexOrNull) {
      if (indexOrNull === null || indexOrNull === undefined) {
        this._selectedIndex = null;
      } else {
        const idx = Number(indexOrNull);
        this._selectedIndex = Number.isFinite(idx) ? idx : null;
      }
      this._renderSelection();
    }

    _renderSelection() {
      this.selectionLayer.innerHTML = "";
      if (this._selectedIndex === null) return;
      const base = this._markerElsByIndex.get(this._selectedIndex);
      if (!base) return;

      const cx = base.getAttribute("cx");
      const cy = base.getAttribute("cy");

      const ring = createSvgEl("circle");
      setAttrs(ring, {
        cx,
        cy,
        r: 10,
        fill: "none",
        stroke: "#111",
        "stroke-width": 1.2,
        "vector-effect": "non-scaling-stroke",
        opacity: 0.65,
      });
      this.selectionLayer.appendChild(ring);
    }

    resetView() {
      this._scale = 1;
      this._tx = 0;
      this._ty = 0;
      this._applyTransform(true);
    }
  }

  function init() {
    const container = document.getElementById("svgmap");
    if (!container) return;
    const map = new SvgMercatorMap(container);

    // Expose a tiny API for `js/map.js` to sync markers/selection.
    window.svgMap = {
      setMarkers: (features) => map.setMarkers(features),
      setSelected: (idx) => map.setSelected(idx),
      resetView: () => map.resetView(),
    };

    // Initial render if markers already exist.
    try {
      if (window.cities && Array.isArray(window.cities.features)) {
        map.setMarkers(window.cities.features);
      }
    } catch (_) {
      // ignore
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

