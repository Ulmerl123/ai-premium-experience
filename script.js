/**
 * AETHER OS / LIQUID GLASS APPSUITE - CORE CONTROLLER
 * Architecture: Reactive Event-Driven Controller with Web Audio Synthesizer,
 * VisionOS Dynamic Magnification Physics, Real-Time Chart.js Telemetry Engine,
 * Accessible Glass Modal Management, and Simulated AI Inference Streaming.
 */

(function () {
    "use strict";

    /* ==========================================================================
       1. GLOBAL STATE & CONSTANTS
       ========================================================================== */

    const STATE = {
        theme: "dark",
        soundEnabled: true,
        commandPaletteOpen: false,
        activeModal: null,
        simulatedInferenceActive: true,
        telemetryTimer: null,
        inferenceTimer: null,
        mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 },
        metrics: {
            tokensPerSec: 148.6,
            latencyMs: 14.2,
            vramUsageGB: 18.4,
            vramTotalGB: 24.0,
            activeRequests: 412,
            uptimeSeconds: 84920
        },
        charts: {
            latencyChart: null,
            throughputChart: null
        }
    };

    const COMMAND_ITEMS = [
        { id: "nav-dash", title: "Navigate: Real-time Telemetry", category: "Navigation", icon: "fa-gauge-high", action: () => scrollToSection("dashboard") },
        { id: "nav-ai", title: "Navigate: Neural Model Playground", category: "Navigation", icon: "fa-brain", action: () => scrollToSection("playground") },
        { id: "nav-infra", title: "Navigate: Vision Infrastructure", category: "Navigation", icon: "fa-server", action: () => scrollToSection("infrastructure") },
        { id: "nav-docs", title: "Navigate: Architecture Docs", category: "Navigation", icon: "fa-book-bookmark", action: () => scrollToSection("documentation") },
        { id: "act-stream-pause", title: "AI Core: Toggle Inference Stream", category: "Actions", icon: "fa-wave-square", action: () => toggleInferenceStream() },
        { id: "act-flush-cache", title: "System: Invalidate KV Token Cache", category: "Actions", icon: "fa-broom", action: () => triggerKVFlush() },
        { id: "act-sound-toggle", title: "Audio: Toggle Synthesized Haptics", category: "Preferences", icon: "fa-volume-high", action: () => toggleAudioHaptics() },
        { id: "act-cluster-reset", title: "Cluster: Rebalance Tensor Nodes", category: "DevOps", icon: "fa-arrows-rotate", action: () => simulateClusterRebalance() },
        { id: "act-export-telemetry", title: "Telemetry: Snapshot CSV Export", category: "Export", icon: "fa-file-arrow-down", action: () => exportTelemetryCSV() }
    ];

    /* ==========================================================================
       2. PROCEDURAL WEB AUDIO SYNTHESIZER (Apple/VisionOS Haptics)
       ========================================================================== */

    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.initialized = false;
        }

        init() {
            if (this.initialized) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                    this.initialized = true;
                }
            } catch (e) {
                console.warn("[SoundEngine] Audio context unavailable:", e);
            }
        }

        playGlassClick(freq = 1200, decay = 0.04) {
            if (!STATE.soundEnabled || !this.initialized || !this.ctx) return;
            try {
                if (this.ctx.state === "suspended") {
                    this.ctx.resume();
                }
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + decay);

                gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + decay);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + decay);
            } catch (err) {
                // Ignore silent audio drops
            }
        }

        playSuccessTone() {
            if (!STATE.soundEnabled || !this.initialized || !this.ctx) return;
            try {
                if (this.ctx.state === "suspended") this.ctx.resume();
                const now = this.ctx.currentTime;
                [880, 1320, 1760].forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

                    gain.gain.setValueAtTime(0.04, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.18);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 0.18);
                });
            } catch (err) {}
        }
    }

    const sound = new SoundEngine();

    /* ==========================================================================
       3. AMBIENT LIQUID CANVAS: REFRACTIVE MESH ORBS
       ========================================================================== */

    class LiquidMeshCanvas {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext("2d");
            this.width = (this.canvas.width = window.innerWidth);
            this.height = (this.canvas.height = window.innerHeight);

            this.orbs = [
                { x: this.width * 0.2, y: this.height * 0.3, r: 380, vx: 0.4, vy: 0.3, color: "rgba(102, 126, 234, 0.28)" },
                { x: this.width * 0.8, y: this.height * 0.4, r: 440, vx: -0.3, vy: 0.5, color: "rgba(118, 75, 162, 0.22)" },
                { x: this.width * 0.5, y: this.height * 0.8, r: 420, vx: 0.2, vy: -0.4, color: "rgba(79, 172, 254, 0.18)" },
                { x: this.width * 0.7, y: this.height * 0.1, r: 300, vx: -0.5, vy: -0.2, color: "rgba(0, 242, 254, 0.14)" }
            ];

            this.bindEvents();
            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
        }

        bindEvents() {
            window.addEventListener("resize", () => {
                this.width = this.canvas.width = window.innerWidth;
                this.height = this.canvas.height = window.innerHeight;
            }, { passive: true });
        }

        animate() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Interpolate target mouse
            STATE.mouse.x += (STATE.mouse.targetX - STATE.mouse.x) * 0.05;
            STATE.mouse.y += (STATE.mouse.targetY - STATE.mouse.y) * 0.05;

            for (let i = 0; i < this.orbs.length; i++) {
                const orb = this.orbs[i];
                orb.x += orb.vx;
                orb.y += orb.vy;

                if (orb.x - orb.r < 0 || orb.x + orb.r > this.width) orb.vx *= -1;
                if (orb.y - orb.r < 0 || orb.y + orb.r > this.height) orb.vy *= -1;

                // Gentle gravitational pull to interactive pointer
                const dx = STATE.mouse.x - orb.x;
                const dy = STATE.mouse.y - orb.y;
                orb.x += dx * 0.0008;
                orb.y += dy * 0.0008;

                const grad = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
                grad.addColorStop(0, orb.color);
                grad.addColorStop(1, "rgba(0, 0, 0, 0)");

                this.ctx.save();
                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }

            requestAnimationFrame(this.animate);
        }
    }

    /* ==========================================================================
       4. VISIONOS DOCK MAGNIFICATION PHYSICS
       ========================================================================== */

    class VisionDock {
        constructor(dockSelector) {
            this.dock = document.querySelector(dockSelector);
            if (!this.dock) return;
            this.items = Array.from(this.dock.querySelectorAll(".glass-dock-item"));
            this.maxDistance = 140;
            this.baseScale = 1.0;
            this.maxScale = 1.55;
            this.baseMargin = 4;
            this.maxMargin = 16;

            this.bindEvents();
        }

        bindEvents() {
            this.dock.addEventListener("mousemove", (e) => this.onMouseMove(e));
            this.dock.addEventListener("mouseleave", () => this.resetItems());
        }

        onMouseMove(e) {
            const mouseX = e.clientX;

            this.items.forEach((item) => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const distance = Math.abs(mouseX - itemCenterX);

                if (distance < this.maxDistance) {
                    const norm = distance / this.maxDistance;
                    const scaleFactor = Math.cos(norm * (Math.PI / 2));
                    const scale = this.baseScale + (this.maxScale - this.baseScale) * scaleFactor;
                    const margin = this.baseMargin + (this.maxMargin - this.baseMargin) * scaleFactor;

                    item.style.transform = `scale(${scale.toFixed(3)}) translateY(-${((scale - 1) * 14).toFixed(1)}px)`;
                    item.style.marginLeft = `${margin.toFixed(1)}px`;
                    item.style.marginRight = `${margin.toFixed(1)}px`;
                    item.style.zIndex = Math.round(scale * 10).toString();
                } else {
                    item.style.transform = `scale(1) translateY(0)`;
                    item.style.marginLeft = `${this.baseMargin}px`;
                    item.style.marginRight = `${this.baseMargin}px`;
                    item.style.zIndex = "1";
                }
            });
        }

        resetItems() {
            this.items.forEach((item) => {
                item.style.transform = `scale(1) translateY(0)`;
                item.style.marginLeft = `${this.baseMargin}px`;
                item.style.marginRight = `${this.baseMargin}px`;
                item.style.zIndex = "1";
            });
        }
    }

    /* ==========================================================================
       5. SPECULAR LIGHT REFLECTION TRACKER (Cards & Glass Panels)
       ========================================================================== */

    function initGlassSpecularTracking() {
        const glassElements = document.querySelectorAll(".liquid-glass-card, .vision-panel, .glass-interactive");

        window.addEventListener("pointermove", (e) => {
            STATE.mouse.targetX = e.clientX;
            STATE.mouse.targetY = e.clientY;

            glassElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (
                    e.clientX >= rect.left - 100 &&
                    e.clientX <= rect.right + 100 &&
                    e.clientY >= rect.top - 100 &&
                    e.clientY <= rect.bottom + 100
                ) {
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    el.style.setProperty("--mouse-x", `${x}px`);
                    el.style.setProperty("--mouse-y", `${y}px`);
                    el.style.setProperty("--specular-opacity", "1");
                } else {
                    el.style.setProperty("--specular-opacity", "0");
                }
            });
        }, { passive: true });
    }

    /* ==========================================================================
       6. VISIONOS TOAST SYSTEM
       ========================================================================== */

    class ToastManager {
        constructor() {
            this.container = document.getElementById("toast-container");
            if (!this.container) {
                this.container = document.createElement("div");
                this.container.id = "toast-container";
                this.container.className = "toast-container";
                document.body.appendChild(this.container);
            }
        }

        /**
         * Trigger a glass notification banner
         * @param {string} title 
         * @param {string} message 
         * @param {"info"|"success"|"warning"|"error"} type 
         * @param {number} duration 
         */
        show(title, message, type = "info", duration = 4000) {
            sound.playGlassClick(1400, 0.05);

            const toast = document.createElement("div");
            toast.className = `glass-toast glass-toast-${type}`;

            const iconMap = {
                info: "fa-circle-info text-cyan-400",
                success: "fa-circle-check text-emerald-400",
                warning: "fa-triangle-exclamation text-amber-400",
                error: "fa-circle-xmark text-rose-400"
            };

            toast.innerHTML = `
                <div class="toast-glow"></div>
                <div class="toast-content flex items-start gap-3 z-10 relative">
                    <i class="fa-solid ${iconMap[type] || iconMap.info} text-lg mt-0.5"></i>
                    <div class="flex-1 pr-2">
                        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-200">${title}</h4>
                        <p class="text-xs text-slate-400 mt-0.5 leading-relaxed">${message}</p>
                    </div>
                    <button class="toast-close text-slate-400 hover:text-white transition-colors" aria-label="Dismiss">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>
                <div class="toast-progress-bar"></div>
            `;

            const progressBar = toast.querySelector(".toast-progress-bar");
            if (progressBar) {
                progressBar.style.animationDuration = `${duration}ms`;
            }

            const closeBtn = toast.querySelector(".toast-close");
            closeBtn.addEventListener("click", () => this.dismiss(toast));

            this.container.appendChild(toast);

            // Auto dismiss
            const timer = setTimeout(() => {
                this.dismiss(toast);
            }, duration);

            toast._timer = timer;
        }

        dismiss(toast) {
            if (!toast || toast.classList.contains("toast-closing")) return;
            clearTimeout(toast._timer);
            toast.classList.add("toast-closing");
            toast.addEventListener("animationend", () => {
                toast.remove();
            }, { once: true });
        }
    }

    const toastManager = new ToastManager();

    /* ==========================================================================
       7. GLOBAL COMMAND PALETTE (CMD / CTRL + K)
       ========================================================================== */

    class CommandPalette {
        constructor() {
            this.modal = document.getElementById("command-palette-modal");
            this.input = document.getElementById("cmd-search-input");
            this.resultsContainer = document.getElementById("cmd-results-list");
            this.backdrop = document.getElementById("cmd-modal-backdrop");
            this.selectedIndex = 0;
            this.filteredItems = [...COMMAND_ITEMS];

            if (!this.modal || !this.input || !this.resultsContainer) return;

            this.bindEvents();
            this.render();
        }

        bindEvents() {
            window.addEventListener("keydown", (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                    e.preventDefault();
                    this.toggle();
                } else if (e.key === "Escape" && STATE.commandPaletteOpen) {
                    e.preventDefault();
                    this.close();
                }
            });

            if (this.backdrop) {
                this.backdrop.addEventListener("click", () => this.close());
            }

            this.input.addEventListener("input", (e) => {
                const query = e.target.value.toLowerCase().trim();
                this.filteredItems = COMMAND_ITEMS.filter((item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.category.toLowerCase().includes(query)
                );
                this.selectedIndex = 0;
                this.render();
            });

            this.input.addEventListener("keydown", (e) => {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    this.selectedIndex = (this.selectedIndex + 1) % Math.max(1, this.filteredItems.length);
                    this.renderHighlight();
                    sound.playGlassClick(800, 0.02);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    this.selectedIndex = (this.selectedIndex - 1 + this.filteredItems.length) % Math.max(1, this.filteredItems.length);
                    this.renderHighlight();
                    sound.playGlassClick(800, 0.02);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    const selected = this.filteredItems[this.selectedIndex];
                    if (selected) {
                        this.execute(selected);
                    }
                }
            });

            // Trigger buttons in UI
            document.querySelectorAll("[data-open-cmd]").forEach((el) => {
                el.addEventListener("click", () => this.open());
            });
        }

        open() {
            sound.init();
            sound.playGlassClick(1200, 0.04);
            STATE.commandPaletteOpen = true;
            this.modal.classList.remove("hidden");
            this.modal.classList.add("flex");
            this.input.value = "";
            this.filteredItems = [...COMMAND_ITEMS];
            this.selectedIndex = 0;
            this.render();
            setTimeout(() => this.input.focus(), 50);
            document.body.style.overflow = "hidden";
        }

        close() {
            if (!STATE.commandPaletteOpen) return;
            sound.playGlassClick(600, 0.03);
            STATE.commandPaletteOpen = false;
            this.modal.classList.add("hidden");
            this.modal.classList.remove("flex");
            document.body.style.overflow = "";
        }

        toggle() {
            if (STATE.commandPaletteOpen) this.close();
            else this.open();
        }

        execute(item) {
            this.close();
            sound.playSuccessTone();
            item.action();
        }

        renderHighlight() {
            const elements = this.resultsContainer.querySelectorAll(".cmd-item");
            elements.forEach((el, idx) => {
                if (idx === this.selectedIndex) {
                    el.classList.add("cmd-item-active");
                    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
                } else {
                    el.classList.remove("cmd-item-active");
                }
            });
        }

        render() {
            this.resultsContainer.innerHTML = "";
            if (this.filteredItems.length === 0) {
                this.resultsContainer.innerHTML = `
                    <div class="p-8 text-center text-slate-400">
                        <i class="fa-solid fa-satellite-dish text-2xl mb-2 opacity-50"></i>
                        <p class="text-sm">No matching neural command found</p>
                    </div>
                `;
                return;
            }

            this.filteredItems.forEach((item, idx) => {
                const el = document.createElement("div");
                el.className = `cmd-item flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    idx === this.selectedIndex ? "cmd-item-active" : ""
                }`;
                el.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                            <i class="fa-solid ${item.icon}"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-100">${item.title}</p>
                            <span class="text-[10px] uppercase tracking-wider text-slate-400">${item.category}</span>
                        </div>
                    </div>
                    <div class="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-300">↵</kbd> Select
                    </div>
                `;

                el.addEventListener("mouseenter", () => {
                    this.selectedIndex = idx;
                    this.renderHighlight();
                });

                el.addEventListener("click", () => {
                    this.execute(item);
                });

                this.resultsContainer.appendChild(el);
            });
        }
    }

    /* ==========================================================================
       8. ACCESSIBLE GLASS MODAL MANAGER
       ========================================================================== */

    class ModalManager {
        constructor() {
            this.modals = document.querySelectorAll(".glass-modal");
            this.bindEvents();
        }

        bindEvents() {
            document.querySelectorAll("[data-modal-target]").forEach((trigger) => {
                trigger.addEventListener("click", (e) => {
                    e.preventDefault();
                    const targetId = trigger.getAttribute("data-modal-target");
                    this.openModal(targetId);
                });
            });

            document.querySelectorAll(".glass-modal-close").forEach((closeBtn) => {
                closeBtn.addEventListener("click", () => {
                    this.closeActiveModal();
                });
            });

            this.modals.forEach((modal) => {
                modal.addEventListener("click", (e) => {
                    if (e.target === modal || e.target.classList.contains("modal-overlay")) {
                        this.closeActiveModal();
                    }
                });
            });

            window.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && STATE.activeModal) {
                    this.closeActiveModal();
                }
            });
        }

        openModal(modalId) {
            sound.init();
            sound.playGlassClick(1500, 0.05);
            const modal = document.getElementById(modalId);
            if (!modal) return;

            modal.classList.remove("hidden");
            modal.classList.add("flex");
            STATE.activeModal = modal;
            document.body.style.overflow = "hidden";

            // Trap focus
            const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length) focusable[0].focus();
        }

        closeActiveModal() {
            if (!STATE.activeModal) return;
            sound.playGlassClick(700, 0.03);
            STATE.activeModal.classList.add("hidden");
            STATE.activeModal.classList.remove("flex");
            STATE.activeModal = null;
            document.body.style.overflow = "";
        }
    }

    /* ==========================================================================
       9. REAL-TIME CHART.JS TELEMETRY ENGINE
       ========================================================================== */

    function initTelemetryCharts() {
        if (typeof Chart === "undefined") {
            console.warn("[Telemetry] Chart.js not detected on page.");
            return;
        }

        // Global Chart Defaults for VisionOS Glass Look
        Chart.defaults.color = "rgba(148, 163, 184, 0.7)";
        Chart.defaults.font.family = "SF Pro Display, Inter, -apple-system, sans-serif";

        // Chart 1: Latency & Jitter Monitor (Line Spline)
        const latencyCanvas = document.getElementById("latencyTelemetryChart");
        if (latencyCanvas) {
            const ctx = latencyCanvas.getContext("2d");
            const grad = ctx.createLinearGradient(0, 0, 0, 240);
            grad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
            grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");

            const labels = Array.from({ length: 20 }, (_, i) => `${(20 - i) * 2}s ago`);
            const initialData = Array.from({ length: 20 }, () => 12 + Math.random() * 5);

            STATE.charts.latencyChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Inference Latency (ms)",
                            data: initialData,
                            borderColor: "#38bdf8",
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            backgroundColor: grad,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: "#38bdf8",
                            pointHoverBorderColor: "#ffffff",
                            pointHoverBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: "rgba(15, 23, 42, 0.85)",
                            titleFont: { size: 11, weight: "bold" },
                            bodyFont: { size: 12 },
                            padding: 10,
                            borderColor: "rgba(255, 255, 255, 0.15)",
                            borderWidth: 1,
                            backdropFilter: "blur(12px)"
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { maxTicksLimit: 6, font: { size: 10 } }
                        },
                        y: {
                            min: 5,
                            max: 30,
                            grid: { color: "rgba(255, 255, 255, 0.05)" },
                            ticks: { font: { size: 10 } }
                        }
                    }
                }
            });
        }

        // Chart 2: Throughput Tokens/sec (Stepped Area / Bar)
        const throughputCanvas = document.getElementById("throughputTelemetryChart");
        if (throughputCanvas) {
            const ctx = throughputCanvas.getContext("2d");
            const gradBar = ctx.createLinearGradient(0, 0, 0, 200);
            gradBar.addColorStop(0, "rgba(168, 85, 247, 0.65)");
            gradBar.addColorStop(1, "rgba(168, 85, 247, 0.1)");

            const labels = Array.from({ length: 15 }, (_, i) => `T-${15 - i}`);
            const initialData = Array.from({ length: 15 }, () => 140 + Math.random() * 25);

            STATE.charts.throughputChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Tokens/sec",
                            data: initialData,
                            backgroundColor: gradBar,
                            borderColor: "#a855f7",
                            borderWidth: 1,
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: "rgba(15, 23, 42, 0.85)",
                            padding: 10,
                            borderColor: "rgba(255, 255, 255, 0.15)",
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                        y: {
                            min: 100,
                            max: 200,
                            grid: { color: "rgba(255, 255, 255, 0.05)" },
                            ticks: { font: { size: 10 } }
                        }
                    }
                }
            });
        }

        // Periodic Dynamic Updates
        STATE.telemetryTimer = setInterval(tickTelemetryData, 1200);
    }

    function tickTelemetryData() {
        if (!STATE.simulatedInferenceActive) return;

        // Compute simulated jitter
        const newLatency = 12 + Math.random() * 6 + (Math.sin(Date.now() / 2000) * 2);
        const newThroughput = 145 + Math.random() * 20;

        // Update DOM Metric Counters
        const latencyElem = document.getElementById("metric-latency-val");
        if (latencyElem) latencyElem.innerText = `${newLatency.toFixed(1)} ms`;

        const throughputElem = document.getElementById("metric-throughput-val");
        if (throughputElem) throughputElem.innerText = `${newThroughput.toFixed(0)} t/s`;

        const reqElem = document.getElementById("metric-requests-val");
        if (reqElem) {
            const reqDelta = Math.floor(Math.random() * 7) - 3;
            STATE.metrics.activeRequests = Math.max(380, STATE.metrics.activeRequests + reqDelta);
            reqElem.innerText = STATE.metrics.activeRequests.toLocaleString();
        }

        // Update Charts
        if (STATE.charts.latencyChart) {
            const data = STATE.charts.latencyChart.data.datasets[0].data;
            data.shift();
            data.push(newLatency);
            STATE.charts.latencyChart.update("none");
        }

        if (STATE.charts.throughputChart) {
            const data = STATE.charts.throughputChart.data.datasets[0].data;
            data.shift();
            data.push(newThroughput);
            STATE.charts.throughputChart.update("none");
        }
    }

    /* ==========================================================================
       10. AI COPILOT LIVE INFERENCE SIMULATOR
       ========================================================================== */

    class