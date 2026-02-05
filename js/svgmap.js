/**
 * Custom high-performance SVG world map (Equirectangular / Plate Carrée).
 * Supports infinite horizontal panning (spinning like a globe).
 *
 * Markers are expected in the same shape as `cities.features` from `js/map.js`:
 * - geometry.coordinates: [lon, lat]
 * - properties: { name, color, radius }
 */
(function () {
  "use strict";

  const DEBUG = /(?:\?|&)svgdebug=1(?:&|$)/.test(window.location.search || "");

  // Equirectangular world map dimensions from viewBox
  // Using the BlankMap-World-Equirectangular.svg from Wikimedia Commons
  // ViewBox cropped to actual content bounds to eliminate margins
  const MAP_WIDTH = 2724;
  const MAP_HEIGHT = 1458;

  const BASE_VIEWBOX = {
    x: 0,
    y: 0,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  };

  // Actual map content bounds within the SVG (analyzed from path data)
  // These are absolute SVG coordinates where geographic content maps to
  const CONTENT_X_MIN = -35.54;
  const CONTENT_X_MAX = 2583.27;
  const CONTENT_Y_MIN = 70.24; // Top of map (corresponds to +90° lat)
  const CONTENT_Y_MAX = 1457.56; // Bottom of map (corresponds to -90° lat)
  const CONTENT_WIDTH = CONTENT_X_MAX - CONTENT_X_MIN; // ~2721.73
  const CONTENT_HEIGHT = CONTENT_Y_MAX - CONTENT_Y_MIN; // ~1345.32

  // Geographic bounds
  const LON_MIN = -180;
  const LON_MAX = 180;
  const LON_RANGE = LON_MAX - LON_MIN; // 360

  const LAT_MIN = -90;
  const LAT_MAX = 90;
  const LAT_RANGE = LAT_MAX - LAT_MIN; // 180

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  /**
   * Equirectangular projection - linear mapping adjusted for actual map bounds
   * Maps lon/lat to the actual map content area within the SVG
   */
  function equirectangularProject(lonDeg, latDeg) {
    // Normalize longitude to [-180, 180]
    let lon = ((lonDeg + 180) % 360) - 180;
    if (lon < -180) lon += 360;

    // Clamp latitude to valid range
    const lat = clamp(latDeg, LAT_MIN, LAT_MAX);

    // Linear projection mapped to content bounds
    const xNorm = (lon - LON_MIN) / LON_RANGE;
    const yNorm = (LAT_MAX - lat) / LAT_RANGE;

    return {
      x: CONTENT_X_MIN + xNorm * CONTENT_WIDTH,
      y: CONTENT_Y_MIN + yNorm * CONTENT_HEIGHT,
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

  class SvgWorldMap {
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
      this._tx = 0; // Horizontal translation (can be any value for wrapping)
      this._ty = 0;
      this._minScale = 1;
      this._maxScale = 24;

      // Wheel zoom state
      this._wheelAccumPx = 0;
      this._wheelLastPoint = null;
      this._wheelRaf = null;

      this._pointerActive = false;
      this._pointerId = null;
      this._dragStart = { x: 0, y: 0, tx: 0, ty: 0 };
      this._didDrag = false;

      this._selectedIndex = null;
      this._markerElsByIndex = new Map();
      this._markers = [];

      this._mapImages = [];
      this._markerGroups = [];
      this._selectionGroups = [];

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
        style: "overflow: hidden;",
      });

      // Ocean background (extends for wrapping) - matches SVG ocean color
      const ocean = createSvgEl("rect");
      setAttrs(ocean, {
        x: -MAP_WIDTH * 2,
        y: BASE_VIEWBOX.y,
        width: MAP_WIDTH * 5,
        height: MAP_HEIGHT,
        fill: "#ffffff",
      });
      this.svg.appendChild(ocean);

      this.svg.appendChild(this.viewport);
      this.viewport.appendChild(this.baseLayer);
      this.viewport.appendChild(this.markerLayer);
      this.viewport.appendChild(this.selectionLayer);

      // Status overlay
      if (DEBUG && this._statusText && this.statusLayer) {
        setAttrs(this._statusText, {
          x: 10,
          y: 30,
          fill: "rgba(31, 42, 47, 0.6)",
          "font-size": 24,
          "font-family":
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        });
        this._statusText.textContent = "SVG map ready";
        this.statusLayer.appendChild(this._statusText);
        this.svg.appendChild(this.statusLayer);
      }

      // Create 3 copies of the map for seamless horizontal wrapping
      // (left copy, center, right copy)
      for (let i = -1; i <= 1; i++) {
        const baseImg = createSvgEl("image");
        setAttrs(baseImg, {
          href: "img/world_equirectangular.svg",
          x: i * MAP_WIDTH,
          y: BASE_VIEWBOX.y,
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          preserveAspectRatio: "none",
          opacity: "0.92",
          "pointer-events": "none",
        });
        this.baseLayer.appendChild(baseImg);
        this._mapImages.push(baseImg);
      }

      // Create marker groups for each copy
      for (let i = -1; i <= 1; i++) {
        const group = createSvgEl("g");
        setAttrs(group, { transform: `translate(${i * MAP_WIDTH}, 0)` });
        this.markerLayer.appendChild(group);
        this._markerGroups.push(group);

        const selGroup = createSvgEl("g");
        setAttrs(selGroup, { transform: `translate(${i * MAP_WIDTH}, 0)` });
        this.selectionLayer.appendChild(selGroup);
        this._selectionGroups.push(selGroup);
      }

      // Clip path to hide content outside the viewbox
      const defs = createSvgEl("defs");
      const clipPath = createSvgEl("clipPath");
      clipPath.id = "map-clip";
      const clipRect = createSvgEl("rect");
      setAttrs(clipRect, {
        x: BASE_VIEWBOX.x,
        y: BASE_VIEWBOX.y,
        width: BASE_VIEWBOX.width,
        height: BASE_VIEWBOX.height,
      });
      clipPath.appendChild(clipRect);
      defs.appendChild(clipPath);
      this.svg.insertBefore(defs, this.svg.firstChild);

      // Apply clip to the svg
      this.svg.style.clipPath = "url(#map-clip)";

      // Border
      const border = createSvgEl("rect");
      setAttrs(border, {
        x: BASE_VIEWBOX.x + 0.5,
        y: BASE_VIEWBOX.y + 0.5,
        width: BASE_VIEWBOX.width - 1,
        height: BASE_VIEWBOX.height - 1,
        fill: "none",
      });
      this.svg.appendChild(border);

      this.container.innerHTML = "";
      this.container.appendChild(this.svg);

      // Tooltip
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

    _normalizeHorizontalTranslation() {
      // Wrap tx to keep it within a reasonable range for rendering
      const scaledWidth = MAP_WIDTH * this._scale;
      if (scaledWidth > 0) {
        // Normalize to keep the map roughly centered
        while (this._tx > scaledWidth) this._tx -= scaledWidth;
        while (this._tx < -scaledWidth) this._tx += scaledWidth;
      }
    }

    _clampTransform() {
      const viewH = BASE_VIEWBOX.height;
      const scaledH = MAP_HEIGHT * this._scale;

      // Horizontal: allow free movement (infinite wrapping)
      this._normalizeHorizontalTranslation();

      // Vertical: clamp to prevent going off the map
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
            `matrix(${this._scale} 0 0 ${this._scale} ${this._tx} ${this._ty})`,
          );
          this._updateMarkerSizes();
        });
        return;
      }

      this._clampTransform();
      this.viewport.setAttribute(
        "transform",
        `matrix(${this._scale} 0 0 ${this._scale} ${this._tx} ${this._ty})`,
      );
      this._updateMarkerSizes();
    }

    _updateMarkerSizes() {
      // Scale markers inversely to zoom: bigger when zoomed out, smaller when zoomed in
      // Use sqrt for a more subtle effect
      const scaleFactor = 1 / Math.sqrt(this._scale);

      for (const group of this._markerGroups) {
        const circles = group.querySelectorAll("circle[data-base-r]");
        for (const circle of circles) {
          const baseR = parseFloat(circle.getAttribute("data-base-r"));
          if (Number.isFinite(baseR)) {
            circle.setAttribute("r", baseR * scaleFactor);
          }
        }
      }

      // Also update selection circles
      this._renderSelection();
    }

    _wheelDeltaPixels(e) {
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      if (e.deltaMode === 2) dy *= BASE_VIEWBOX.height;
      return dy;
    }

    _setInteracting(on) {
      if (on) {
        this._interactionDepth++;
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
    }

    _attachEvents() {
      this.markerLayer.addEventListener("mouseover", (e) => {
        const t = e.target;
        if (!t || typeof t.getAttribute !== "function") return;
        const name = t.getAttribute("data-name");
        if (name === null) return;

        // Show tooltip
        if (name) {
          this._tooltip.textContent = name;
          this._tooltip.style.opacity = "1";
        }

        // Expand marker on hover - scale relative to current size
        const baseR = t.getAttribute("data-base-r");
        if (baseR) {
          const cx = t.getAttribute("cx");
          const cy = t.getAttribute("cy");
          t.style.transformOrigin = `${cx}px ${cy}px`;
          t.style.transform = "scale(2.5)";
          t.style.opacity = "1";
        }
      });

      this.markerLayer.addEventListener("mouseout", (e) => {
        const t = e.target;
        if (!t || typeof t.getAttribute !== "function") return;
        if (t.getAttribute("data-name") !== null) {
          this._tooltip.style.opacity = "0";
          // Reset marker size
          t.style.transform = "scale(1)";
          t.style.opacity = "0.7";
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

          if (e.ctrlKey) {
            const deltaPx = this._wheelAccumPx;
            this._wheelAccumPx = 0;
            const worldX = (p.x - this._tx) / this._scale;
            const worldY = (p.y - this._ty) / this._scale;
            const zoomIntensity = 0.0017;
            const zoom = Math.exp(-deltaPx * zoomIntensity);
            const nextScale = clamp(
              this._scale * zoom,
              this._minScale,
              this._maxScale,
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

            const zoomIntensity = 0.002;
            const zoom = Math.exp(-deltaPx * zoomIntensity);

            const nextScale = clamp(
              this._scale * zoom,
              this._minScale,
              this._maxScale,
            );
            this._scale = nextScale;
            this._tx = point.x - worldX * this._scale;
            this._ty = point.y - worldY * this._scale;
            this._applyTransform(false);
          });
        },
        { passive: false },
      );

      // Safari gesture events
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
        { passive: false },
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
            this._maxScale,
          );
          this._scale = nextScale;
          this._tx = point.x - worldX * this._scale;
          this._ty = point.y - worldY * this._scale;
          this._applyTransform(true);
        },
        { passive: false },
      );

      this.svg.addEventListener(
        "gestureend",
        (e) => {
          e.preventDefault();
          this._setInteracting(false);
          this._gestureState = null;
        },
        { passive: false },
      );

      // Drag pan
      this.svg.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        this._pointerActive = true;
        this._pointerId = e.pointerId;
        this._didDrag = false;
        this._pointerDownTarget = e.target; // Store the original target
        this.svg.setPointerCapture(e.pointerId);

        const p = this._clientToSvgPoint(e.clientX, e.clientY);
        this._dragStart = {
          x: p.x,
          y: p.y,
          tx: this._tx,
          ty: this._ty,
          clientX: e.clientX,
          clientY: e.clientY,
        };
      });

      this.svg.addEventListener("pointermove", (e) => {
        if (!this._pointerActive) return;
        if (this._pointerId !== e.pointerId) return;

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

        if (!this._didDrag) {
          const t = this._pointerDownTarget; // Use the stored target
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
        this._pointerDownTarget = null;
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
          const label = (child.innerText || "").trim();
          if (label.startsWith(name)) {
            child.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

      // Clear all marker groups
      for (const group of this._markerGroups) {
        group.innerHTML = "";
      }

      let renderedCount = 0;

      for (let i = 0; i < this._markers.length; i++) {
        const f = this._markers[i];
        const coords = f && f.geometry && f.geometry.coordinates;
        if (!coords || coords.length < 2) continue;

        const lon = parseMaybeLocaleNumber(coords[0]);
        const lat = parseMaybeLocaleNumber(coords[1]);
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

        const p = equirectangularProject(lon, lat);
        const name = (f.properties && f.properties.name) || "";
        const color =
          f.properties && f.properties.color ? f.properties.color : "#111";
        // Scale radius for the larger coordinate system (viewBox ~2753×1538)
        const rRaw =
          f.properties && Number.isFinite(f.properties.radius)
            ? f.properties.radius
            : 2;
        const r = Math.max(6, (rRaw + 1) * 1.5);

        // Add marker to all 3 groups for seamless wrapping
        for (const group of this._markerGroups) {
          const core = createSvgEl("circle");
          setAttrs(core, {
            cx: p.x,
            cy: p.y,
            r: r,
            fill: color,
            opacity: 0.7,
            "data-i": i,
            "data-name": name,
            "data-base-r": r,
          });
          const border = createSvgEl("circle");
          setAttrs(border, {
            cx: p.x,
            cy: p.y,
            r: r + 2,
            fill: "rgba(150,150,150,1)",
            opacity: 1,
            "data-base-r": r + 2,
          });
          core.style.cursor = "pointer";
          core.style.transition = "transform 0.15s ease-out";

          group.appendChild(border);
          group.appendChild(core);
          // Store reference to center group's marker
          if (group === this._markerGroups[1]) {
            this._markerElsByIndex.set(i, core);
          }
        }
        renderedCount++;
      }

      // Apply initial size scaling based on current zoom level
      this._updateMarkerSizes();

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
      // Clear all selection groups
      for (const group of this._selectionGroups) {
        group.innerHTML = "";
      }

      if (this._selectedIndex === null) return;
      const base = this._markerElsByIndex.get(this._selectedIndex);
      if (!base) return;

      const cx = base.getAttribute("cx");
      const cy = base.getAttribute("cy");
      const baseR = parseFloat(base.getAttribute("data-base-r")) || 6;

      // Scale selection circles inversely to zoom like markers
      const scaleFactor = 1 / Math.sqrt(this._scale);
      const scaledR = baseR * scaleFactor;

      // Add filled selection circle behind the marker
      for (const group of this._selectionGroups) {
        const highlight = createSvgEl("circle");
        setAttrs(highlight, {
          cx,
          cy,
          r: scaledR + 10 * scaleFactor,
          fill: "rgba(240, 238, 242, 1)",
          "pointer-events": "none",
        });
        const highlight2 = createSvgEl("circle");
        setAttrs(highlight2, {
          cx,
          cy,
          r: scaledR + 6 * scaleFactor,
          fill: "rgba(42, 40, 44, 1)",
          "pointer-events": "none",
        });
        group.appendChild(highlight);
        group.appendChild(highlight2);
      }
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
    const map = new SvgWorldMap(container);

    window.svgMap = {
      setMarkers: (features) => map.setMarkers(features),
      setSelected: (idx) => map.setSelected(idx),
      resetView: () => map.resetView(),
    };

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
