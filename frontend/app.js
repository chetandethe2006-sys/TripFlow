// --- MOCK DATA & STATE ---
let state = {
    currentUser: (() => { try { return JSON.parse(localStorage.getItem('tf_user')); } catch (e) { localStorage.removeItem('tf_user'); return null; } })() || null,
    trips: JSON.parse(localStorage.getItem('tf_trips')) || [
        { id: "TRP1024", customer: "Acme Logistics Corp", customerEmail: "logistics@acme.com", customerPhone: "+1 (555) 234-5678", pickup: "Warehouse A, Chicago, IL", destination: "Distribution Hub, Dallas, TX", goods: "Industrial Steel Pipes", quantity: "12 Pallets", pickupDate: "2026-06-01", expectedDelivery: "2026-06-04", driverId: "DRV-01", driverName: "Amit Sharma", vehicleNumber: "IL-04-AB-9876", status: "In Transit", notes: "Handle with care.", date: "2026-06-01" },
        { id: "TRP1023", customer: "Global Retailers Inc", customerEmail: "supply@globalretail.com", customerPhone: "+1 (555) 876-5432", pickup: "Port Terminal 4, Miami, FL", destination: "Retail Center, Atlanta, GA", goods: "Consumer Electronics", quantity: "25 Cartons", pickupDate: "2026-05-28", expectedDelivery: "2026-05-30", driverId: "DRV-02", driverName: "Rajesh Kumar", vehicleNumber: "FL-08-XY-4321", status: "Delivered", notes: "Direct handover.", date: "2026-05-28" },
        { id: "TRP1025", customer: "Apex Agro Foods", customerEmail: "orders@apexagro.com", customerPhone: "+1 (555) 345-6789", pickup: "Cold Storage 2, Omaha, NE", destination: "Supermarket Chain, Denver, CO", goods: "Frozen Produce", quantity: "8 Tons", pickupDate: "2026-06-03", expectedDelivery: "2026-06-06", driverId: "DRV-03", driverName: "Suresh Patel", vehicleNumber: "NE-12-ZZ-5566", status: "Driver Assigned", notes: "Maintain temp.", date: "2026-06-02" }
    ],
    drivers: [
        { id: "DRV-01", name: "Amit Sharma", phone: "+1 (555) 111-2233", license: "DL-99887766", availability: "On Trip", completedTrips: 48 },
        { id: "DRV-02", name: "Rajesh Kumar", phone: "+1 (555) 222-3344", license: "DL-44332211", availability: "Available", completedTrips: 62 },
        { id: "DRV-03", name: "Suresh Patel", phone: "+1 (555) 333-4455", license: "DL-55667788", availability: "On Trip", completedTrips: 31 }
    ],
    vehicles: [
        { id: "VEH-101", number: "IL-04-AB-9876", type: "Heavy Truck (20T)", driver: "Amit Sharma", capacity: "20,000 kg", availability: "On Trip" },
        { id: "VEH-102", number: "FL-08-XY-4321", type: "Medium Container", driver: "Rajesh Kumar", capacity: "12,000 kg", availability: "Available" },
        { id: "VEH-103", number: "NE-12-ZZ-5566", type: "Refrigerated Van", driver: "Suresh Patel", capacity: "8,000 kg", availability: "On Trip" }
    ],
    customers: [
        { id: "CUS-01", name: "Acme Logistics Corp", phone: "+1 (555) 234-5678", email: "logistics@acme.com", totalTrips: 14, status: "Active" },
        { id: "CUS-02", name: "Global Retailers Inc", phone: "+1 (555) 876-5432", email: "supply@globalretail.com", totalTrips: 28, status: "Active" },
        { id: "CUS-03", name: "Apex Agro Foods", phone: "+1 (555) 345-6789", email: "orders@apexagro.com", totalTrips: 9, status: "Active" }
    ],
    notifications: JSON.parse(localStorage.getItem('tf_notifs')) || [
        { id: "NOT-1", text: "Trip #TRP1024 status changed to In Transit.", time: "10 mins ago", read: false },
        { id: "NOT-2", text: "Driver Rajesh Kumar completed Trip #TRP1018.", time: "2 hours ago", read: false }
    ],
    currentRoute: 'dashboard',
    selectedTripId: null,
    showLogin: false
};

function saveState() {
    localStorage.setItem('tf_user', JSON.stringify(state.currentUser));
    localStorage.setItem('tf_trips', JSON.stringify(state.trips));
    localStorage.setItem('tf_notifs', JSON.stringify(state.notifications));
}

function navigate(route, tripId = null) {
    state.currentRoute = route;
    if (tripId) state.selectedTripId = tripId;
    render();
}
window.navigate = navigate;

function renderBadge(status) {
    const styles = {
        'Created':         'bg-blue-500/15 text-blue-400 border-blue-500/20',
        'Driver Assigned': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
        'Picked Up':       'bg-amber-500/15 text-amber-400 border-amber-500/20',
        'In Transit':      'bg-purple-500/15 text-purple-400 border-purple-500/20',
        'Delivered':       'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        'Cancelled':       'bg-rose-500/15 text-rose-400 border-rose-500/20',
        'Available':       'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        'On Trip':         'bg-amber-500/15 text-amber-400 border-amber-500/20',
        'Active':          'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
    };
    const cls = styles[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/20';
    return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}"><span class="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>${status}</span>`;
}

async function loadTripsFromBackend() {
    try {
        const trips = await getTrips();

        state.trips = trips;

        render();

        console.log("Trips loaded from backend:", trips);
    } catch (error) {
        console.error("Failed to load trips from backend:", error);
    }
}

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!state.currentUser) {
        if (state.showLogin) {
            app.innerHTML = renderLogin();
        } else {
            app.innerHTML = renderLandingPage();
            initScrollAnimation();
        }
        return;
    }

    app.innerHTML = `
        <div class="flex h-screen overflow-hidden">
            ${renderSidebar()}
            <div class="flex-1 flex flex-col overflow-hidden">
                ${renderNavbar()}
                <main class="flex-1 overflow-y-auto p-6 bg-[#090D16]">
                    ${renderPageContent()}
                </main>
            </div>
        </div>
    `;
}

window.goToLogin = function () {
    state.showLogin = true;
    render();
};

window.goToLanding = function () {
    state.showLogin = false;
    render();
};

const frameCount = 240;
const currentFrame = index => (
    `assets/truck-frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
);

const animationImages = new Array(frameCount + 1).fill(null);
let _animLoaderStarted = false; // guard: only one background load queue ever

function initScrollAnimation() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const loadingScreen = document.getElementById("loading-frames");
    const scrollText = document.getElementById("scroll-text");
    const animationSection = document.getElementById("animation-section");

    // Cached draw parameters — computed once from real image size, only refreshed on resize.
    // This removes getBoundingClientRect() from the hot draw path entirely.
    let drawParams = null;

    function cacheDrawParams(img) {
        const dpr = window.devicePixelRatio || 1;
        const cssRect = canvas.getBoundingClientRect();
        const tw = Math.round(cssRect.width * dpr);
        const th = Math.round(cssRect.height * dpr);
        if (canvas.width !== tw || canvas.height !== th) {
            canvas.width = tw;
            canvas.height = th;
        }
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        drawParams = {
            dx: Math.round((canvas.width - img.width * ratio) / 2),
            dy: Math.round((canvas.height - img.height * ratio) / 2),
            dw: Math.round(img.width * ratio),
            dh: Math.round(img.height * ratio),
            iw: img.width,
            ih: img.height,
        };
    }

    // Draw using pre-cached params — zero layout reads, only GPU composite work
    let currentDrawnFrame = -1;

    function drawFrame(img) {
        if (!img || !drawParams) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, drawParams.iw, drawParams.ih,
            drawParams.dx, drawParams.dy, drawParams.dw, drawParams.dh);
    }

    // Single-frame loader with dedup check
    function loadFrame(index) {
        return new Promise((resolve) => {
            if (animationImages[index]) { resolve(animationImages[index]); return; }
            const img = new Image();
            img.onload = () => { animationImages[index] = img; resolve(img); };
            img.onerror = () => resolve(null);
            img.src = currentFrame(index);
        });
    }

    // Parallel batch: load a range of frames at once (BATCH_SIZE concurrent requests)
    const BATCH_SIZE = 6;
    function loadRange(start, end) {
        const indices = [];
        for (let i = start; i <= Math.min(end, frameCount); i++) {
            if (!animationImages[i]) indices.push(i);
        }
        return Promise.all(indices.map(i => loadFrame(i)));
    }

    function startProgressiveLoad() {
        if (_animLoaderStarted) return;
        _animLoaderStarted = true;
        // Phase 1: preload frames 2–30 in parallel (covers the first scroll zone)
        loadRange(2, 30).then(() => {
            // Phase 2: load rest in rolling batches of BATCH_SIZE
            let next = 31;
            function loadBatch() {
                if (next > frameCount) return;
                const end = Math.min(next + BATCH_SIZE - 1, frameCount);
                loadRange(next, end).then(loadBatch);
                next = end + 1;
            }
            loadBatch();
        });
    }

    // Bootstrap: show frame 1 first, then begin background loading
    loadFrame(1).then((img) => {
        if (!img) return;
        cacheDrawParams(img);
        drawFrame(img);
        currentDrawnFrame = 1;

        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => { if (loadingScreen) loadingScreen.style.display = 'none'; }, 500);
        }

        startProgressiveLoad();
    });

    // Scroll handler: compute frame index (cheap math) in scroll event,
    // defer all canvas work to a single RAF per vsync via ticking guard
    let ticking = false;
    let pendingFrameIndex = -1;

    const handleScroll = () => {
        if (!animationSection) return;
        const rect = animationSection.getBoundingClientRect();
        const scrollDistance = -rect.top;
        const maxScroll = rect.height - window.innerHeight;

        if (scrollDistance >= 0 && scrollDistance <= maxScroll) {
            const fraction = scrollDistance / maxScroll;
            const raw = Math.floor(fraction * frameCount) + 1;
            pendingFrameIndex = Math.min(frameCount, Math.max(1, raw));

            if (scrollText) {
                if (fraction < 0.1) scrollText.textContent = "Warehouse A, Chicago, IL";
                else if (fraction < 0.5) scrollText.textContent = "In Transit...";
                else if (fraction < 0.9) scrollText.textContent = "Approaching Destination";
                else scrollText.textContent = "Distribution Hub, Dallas, TX";
            }
        }

        if (!ticking) {
            window.requestAnimationFrame(() => {
                const fi = pendingFrameIndex;
                if (fi !== -1 && fi !== currentDrawnFrame) {
                    const img = animationImages[fi];
                    if (img) {
                        drawFrame(img);
                        currentDrawnFrame = fi;
                    }
                    // If frame not yet loaded: keep whatever is on canvas — no clear, no flicker
                }
                ticking = false;
            });
            ticking = true;
        }
    };

    // Resize: invalidate cached params and redraw current frame
    const handleResize = () => {
        if (currentDrawnFrame !== -1 && animationImages[currentDrawnFrame]) {
            cacheDrawParams(animationImages[currentDrawnFrame]);
            drawFrame(animationImages[currentDrawnFrame]);
        }
    };

    if (window._scrollListener) window.removeEventListener('scroll', window._scrollListener);
    if (window._resizeListener) window.removeEventListener('resize', window._resizeListener);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window._scrollListener = handleScroll;
    window._resizeListener = handleResize;
}

function renderLandingPage() {
    return `
        <!-- SECTION 1: PREMIUM STICKY NAVBAR -->
        <nav class="sticky top-0 z-50 w-full backdrop-blur-md bg-[#090D16]/90 border-b border-white/10 transition-all duration-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <!-- Brand Logo -->
                <a class="flex items-center gap-3 group focus:outline-none" href="#">
                    <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                        <svg class="w-4 h-4 fill-current" viewbox="0 0 24 24">
                            <path d="M4 4h16v4H14v12h-4V8H4V4z"></path>
                        </svg>
                    </div>
                    <div class="flex items-center tracking-tight">
                        <span class="text-white text-lg font-bold">Trip</span>
                        <span class="text-primary text-lg font-black">Flow</span>
                    </div>
                </a>
                <!-- Navigation Links -->
                <div class="hidden md:flex items-center gap-8">
                    <a class="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#features">Features</a>
                    <a class="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#workflow">Workflow</a>
                </div>
                <!-- Action Button -->
                <div class="flex items-center gap-3">
                    <button onclick="goToLogin()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:bg-opacity-90 active:scale-95 transition-all">
                        <span class="material-symbols-outlined text-[18px]">lock</span>
                        <span>Sign In</span>
                    </button>
                </div>
            </div>
        </nav>
        
        <div class="bg-[#090D16] text-white">
            <!-- Hero Text Section (Normal scroll) -->
            <section class="relative pt-24 pb-12 px-6 max-w-7xl mx-auto text-center z-20">
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-5 text-white">
                    Manage Every Trip. <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary">Deliver with Confidence.</span>
                </h1>
                <p class="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto mb-8">
                    Manage vehicles, assign drivers, organize shipments and track delivery progress — all in one place.
                </p>
                <!-- Hero Buttons -->
                <div class="flex flex-wrap items-center justify-center gap-4">
                    <a class="px-6 py-3.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-2" href="#features">
                        <span>Get Started</span>
                        <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                    <button onclick="goToLogin()" class="px-6 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">login</span>
                        <span>Sign In</span>
                    </button>
                </div>
                <p class="mt-8 text-xs font-mono text-slate-400 flex items-center justify-center gap-1.5">
                    <span class="material-symbols-outlined text-xs animate-bounce text-primary">arrow_downward</span>
                    Scroll to track a live journey
                </p>
            </section>

            <!-- Animation Section (Sticky 300vh) -->
            <section id="animation-section" class="relative h-[300vh]">
                <!-- Sticky container that holds ONLY the truck viewport layout -->
                <div class="sticky top-16 h-[calc(100vh-64px)] flex flex-col justify-center overflow-hidden">
                    <!-- Atmospheric Ambient Highlights -->
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-primary/20 blur-[130px] rounded-full pointer-events-none"></div>

                    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center max-h-full">
                        <!-- Dedicated Truck Animation Viewport -->
                        <div class="haul-viewport relative w-full h-full max-h-[75vh] rounded-2xl border border-white/15 bg-[#0F172A]/80 shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col">
                            <div class="absolute inset-0 hud-grid opacity-70 pointer-events-none"></div>
                            
                            <div class="relative z-20 flex flex-wrap items-center justify-between border-b border-white/10 bg-black/40 px-6 py-3.5 shrink-0">
                                <div class="flex items-center gap-3">
                                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span class="font-mono text-xs text-white tracking-widest uppercase">TRIP SIMULATION</span>
                                </div>
                            </div>

                            <div class="relative flex-1 flex items-center justify-center p-4 sm:p-6 min-h-0">
                                <div class="absolute inset-x-0 bottom-0 h-40 flex justify-center overflow-hidden pointer-events-none opacity-40">
                                    <div class="w-1 bg-gradient-to-t from-primary/80 to-transparent transform -skew-x-12 mx-24"></div>
                                    <div class="w-1 bg-dashed bg-gradient-to-t from-white/70 to-transparent mx-2"></div>
                                    <div class="w-1 bg-gradient-to-t from-primary/80 to-transparent transform skew-x-12 mx-24"></div>
                                </div>
                                
                                <div id="loading-frames" class="absolute inset-0 flex items-center justify-center bg-[#0F172A]/90 z-30 transition-opacity duration-500">
                                    <div class="flex flex-col items-center">
                                        <div class="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin mb-4"></div>
                                        <p class="text-slate-400 font-medium">Loading Animation...</p>
                                    </div>
                                </div>

                                <div class="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-center h-full">
                                    <canvas id="hero-canvas" class="w-full h-auto max-h-full aspect-video object-contain drop-shadow-[0_20px_45px_rgba(236,91,19,0.25)]"></canvas>
                                </div>
                            </div>

                            <div class="relative z-20 flex justify-center items-center p-4 bg-white/10 border-t border-white/10 shrink-0">
                                <div class="flex flex-col items-center text-center">
                                    <span class="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Current Location</span>
                                    <span id="scroll-text" class="text-lg sm:text-xl font-bold text-white truncate">Warehouse A, Chicago, IL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- SECTION 3: FEATURES -->
        <section class="py-24 bg-[#F7F4EE] border-b border-[#E8E3DA] text-slate-900" id="features">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Section Header -->
                <div class="max-w-3xl mb-16 text-center mx-auto">
                    <div class="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-3 justify-center">
                        <span class="w-2 h-2 rounded-full bg-primary"></span>
                        Core Features
                    </div>
                    <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Everything you need to manage your fleet
                    </h2>
                    <p class="mt-3 text-slate-600 text-base sm:text-lg">
                        Simple, effective tools to organize trips, assign drivers, and track your shipments.
                    </p>
                </div>
                <!-- 2x2 Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    
                    <!-- Feature 1: Vehicle Management -->
                    <div class="bg-white rounded-2xl p-8 border border-[#E8E3DA] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div class="w-12 h-12 rounded-xl bg-orange-100 text-primary flex items-center justify-center mb-6">
                            <span class="material-symbols-outlined text-2xl">local_shipping</span>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-2">Vehicle Management</h3>
                        <p class="text-slate-600 text-sm">
                            Keep track of all your vehicles in one place. Monitor availability, capacity, and current assignments to maximize your fleet's efficiency.
                        </p>
                    </div>

                    <!-- Feature 2: Driver Management -->
                    <div class="bg-white rounded-2xl p-8 border border-[#E8E3DA] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                            <span class="material-symbols-outlined text-2xl">person</span>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-2">Driver Management</h3>
                        <p class="text-slate-600 text-sm">
                            Organize your driver roster, verify licenses, and assign drivers to specific trips based on their availability.
                        </p>
                    </div>

                    <!-- Feature 3: Shipment Tracking -->
                    <div class="bg-white rounded-2xl p-8 border border-[#E8E3DA] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                            <span class="material-symbols-outlined text-2xl">share_location</span>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-2">Shipment Tracking</h3>
                        <p class="text-slate-600 text-sm">
                            Follow the journey of your shipments from origin to destination. Keep customers informed with up-to-date delivery statuses.
                        </p>
                    </div>

                    <!-- Feature 4: Trip Management -->
                    <div class="bg-white rounded-2xl p-8 border border-[#E8E3DA] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                            <span class="material-symbols-outlined text-2xl">route</span>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-2">Trip Management</h3>
                        <p class="text-slate-600 text-sm">
                            Create new trips, assign a driver and a vehicle, and log all important details such as cargo type, pickup date, and notes.
                        </p>
                    </div>

                </div>
            </div>
        </section>

        <!-- SECTION 4: SHIPMENT WORKFLOW -->
        <section class="py-24 bg-white border-b border-slate-200 text-slate-900" id="workflow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-2xl mx-auto mb-16">
                    <span class="text-xs font-mono font-bold uppercase tracking-widest text-primary">Shipment Workflow</span>
                    <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                        Track Every Step of the Journey
                    </h2>
                    <p class="text-slate-600 text-sm sm:text-base mt-2">
                        Monitor the status of your shipments from pickup to final delivery.
                    </p>
                </div>
                <div class="relative">
                    <div class="hidden lg:block absolute top-7 left-12 right-12 h-1 bg-slate-100 z-0">
                        <div class="w-1/2 h-full bg-gradient-to-r from-emerald-500 via-primary to-primary"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                        <div class="p-5 rounded-2xl bg-[#FAF8F5] border border-slate-200 flex flex-col">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                    <span class="material-symbols-outlined text-lg">check</span>
                                </div>
                                <span class="text-[11px] font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">PASSED</span>
                            </div>
                            <h4 class="text-base font-bold text-slate-900">1. Goods Received</h4>
                            <p class="text-xs text-slate-600 mt-1 font-medium">Warehouse or Origin Point</p>
                        </div>
                        <div class="p-5 rounded-2xl bg-[#FAF8F5] border border-slate-200 flex flex-col">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                    <span class="material-symbols-outlined text-lg">check</span>
                                </div>
                                <span class="text-[11px] font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">PASSED</span>
                            </div>
                            <h4 class="text-base font-bold text-slate-900">2. Loading Completed</h4>
                            <p class="text-xs text-slate-600 mt-1 font-medium">Vehicle assigned & loaded</p>
                        </div>
                        <div class="p-5 rounded-2xl bg-white border-2 border-primary shadow-lg shadow-primary/10 flex flex-col relative overflow-hidden">
                            <div class="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">CURRENT</div>
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md animate-pulse">
                                    <span class="material-symbols-outlined text-lg">navigation</span>
                                </div>
                            </div>
                            <h4 class="text-base font-bold text-slate-900">3. In Transit</h4>
                            <p class="text-xs text-slate-600 mt-1 font-medium">On the road to destination</p>
                        </div>
                        <div class="p-5 rounded-2xl bg-[#FAF8F5] border border-slate-200 flex flex-col opacity-75">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">4</div>
                                <span class="text-[11px] font-mono text-slate-600">UPCOMING</span>
                            </div>
                            <h4 class="text-base font-bold text-slate-800">4. Reached Destination</h4>
                            <p class="text-xs text-slate-600 mt-1 font-medium">Arrived at delivery point</p>
                        </div>
                        <div class="p-5 rounded-2xl bg-[#FAF8F5] border border-slate-200 flex flex-col opacity-75">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">5</div>
                                <span class="text-[11px] font-mono text-slate-600">PENDING</span>
                            </div>
                            <h4 class="text-base font-bold text-slate-800">5. Delivered</h4>
                            <p class="text-xs text-slate-600 mt-1 font-medium">Goods handed over</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECTION 5: CTA & FOOTER -->
        <section class="bg-[#090D16] text-white pt-16 pb-12 border-t border-white/10">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="rounded-2xl bg-gradient-to-r from-slate-900 to-[#1A1F2C] border border-white/10 p-8 sm:p-12 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div class="max-w-xl text-center lg:text-left">
                        <h3 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                            Ready to manage your fleet?
                        </h3>
                        <p class="text-slate-400 text-sm sm:text-base mt-2">
                            Get started with TripFlow today to organize your transport operations.
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center justify-center gap-4 shrink-0">
                        <button onclick="goToLogin()" class="px-6 py-3.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-primary/30 transition-all">
                            Sign In
                        </button>
                    </div>
                </div>
                <div class="flex justify-between items-center pb-8 border-b border-white/10">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">TF</div>
                        <span class="text-white text-base font-bold">TripFlow</span>
                    </div>
                    <div class="flex gap-6 text-sm text-slate-400">
                        <a href="#features" class="hover:text-white transition-colors">Features</a>
                        <a href="#workflow" class="hover:text-white transition-colors">Workflow</a>
                        <a href="#" onclick="goToLogin()" class="hover:text-white transition-colors">Sign In</a>
                    </div>
                </div>
                <div class="pt-8 text-center text-xs text-slate-500">
                    <div>© 2026 TripFlow Technologies Inc. All rights reserved.</div>
                </div>
            </div>
        </section>
    `;
}

function renderLogin() {
    return `
        <div class="min-h-screen bg-[#090D16] flex items-center justify-center p-6 relative animate-fadeIn overflow-hidden">
            <!-- Subtle Background Grid & Gradients -->
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>
            <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <!-- Back to Home -->
            <button onclick="goToLanding()" class="absolute top-6 left-6 md:top-8 md:left-8 text-slate-400 hover:text-white flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all z-20 backdrop-blur-sm">
                <span class="material-symbols-outlined" style="font-size:18px">arrow_back</span>
                Back to Home
            </button>

            <!-- Login Container -->
            <div class="w-full max-w-md bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 transform transition-all">
                <!-- Inner glow top edge -->
                <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                <div class="relative z-10">
                    <!-- Brand Header -->
                    <div class="flex flex-col items-center mb-10">
                        <div class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-[0_0_30px_rgba(236,91,19,0.3)] mb-5">
                            <svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M4 4h16v4H14v12h-4V8H4V4z"/></svg>
                        </div>
                        <div class="flex items-center tracking-tight text-3xl mb-2">
                            <span class="text-white font-bold">Trip</span>
                            <span class="text-primary font-black">Flow</span>
                        </div>
                        <p class="text-sm text-slate-400 font-medium">Select your role to continue</p>
                    </div>

                    <!-- Role Options -->
                    <div class="space-y-4">
                        <button onclick="loginAs('owner')" class="group w-full flex items-center justify-between p-4 bg-[#090D16]/50 hover:bg-primary/10 border border-white/5 hover:border-primary/40 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:shadow-[0_0_20px_rgba(236,91,19,0.1)] hover:-translate-y-0.5">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    <span class="material-symbols-outlined" style="font-size:24px">admin_panel_settings</span>
                                </div>
                                <div class="text-left">
                                    <p class="text-white font-bold text-base group-hover:text-primary transition-colors">Login as Owner</p>
                                    <p class="text-slate-500 text-xs mt-0.5">Manage fleet, routes & operations</p>
                                </div>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:translate-x-1 transition-all">
                                <span class="material-symbols-outlined text-slate-400 group-hover:text-primary" style="font-size:18px">arrow_forward</span>
                            </div>
                        </button>
                        
                        <button onclick="loginAs('driver', 'DRV-01', 'Amit Sharma')" class="group w-full flex items-center justify-between p-4 bg-[#090D16]/50 hover:bg-primary/10 border border-white/5 hover:border-primary/40 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:shadow-[0_0_20px_rgba(236,91,19,0.1)] hover:-translate-y-0.5">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    <span class="material-symbols-outlined" style="font-size:24px">directions_car</span>
                                </div>
                                <div class="text-left">
                                    <p class="text-white font-bold text-base group-hover:text-primary transition-colors">Login as Driver</p>
                                    <p class="text-slate-500 text-xs mt-0.5">View your assigned trips & tasks</p>
                                </div>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:translate-x-1 transition-all">
                                <span class="material-symbols-outlined text-slate-400 group-hover:text-primary" style="font-size:18px">arrow_forward</span>
                            </div>
                        </button>
                    </div>

                    <div class="mt-8 text-center pt-6 border-t border-white/5">
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <span class="material-symbols-outlined" style="font-size:14px">lock</span>
                            Secure Access Required
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.loginAs = function (role, id = 'OWNER', name = 'Admin Owner') {
    state.currentUser = { role, id, name };
    saveState();
    state.currentRoute = role === 'owner' ? 'dashboard' : 'driver_dashboard';
    render();
}

function renderSidebar() {
    const isOwner = state.currentUser.role === 'owner';
    const unread = state.notifications.filter(n => !n.read).length;

    const ownerLinks = [
        { route: 'dashboard',     label: 'Dashboard',       icon: '<span class="material-symbols-outlined" style="font-size:18px">dashboard</span>' },
        { route: 'trips',         label: 'Trips',           icon: '<span class="material-symbols-outlined" style="font-size:18px">local_shipping</span>' },
        { route: 'drivers',       label: 'Drivers',         icon: '<span class="material-symbols-outlined" style="font-size:18px">group</span>' },
        { route: 'vehicles',      label: 'Vehicles',        icon: '<span class="material-symbols-outlined" style="font-size:18px">directions_car</span>' },
        { route: 'customers',     label: 'Customers',       icon: '<span class="material-symbols-outlined" style="font-size:18px">business</span>' },
        { route: 'notifications', label: 'Notifications',   icon: '<span class="material-symbols-outlined" style="font-size:18px">notifications</span>', badge: unread },
        { route: 'settings',      label: 'Settings',        icon: '<span class="material-symbols-outlined" style="font-size:18px">settings</span>' }
    ];

    const driverLinks = [
        { route: 'driver_dashboard', label: 'My Assigned Trips', icon: '<span class="material-symbols-outlined" style="font-size:18px">route</span>' },
        { route: 'notifications',    label: 'Notifications',     icon: '<span class="material-symbols-outlined" style="font-size:18px">notifications</span>', badge: unread }
    ];

    const links = isOwner ? ownerLinks : driverLinks;

    return `
        <aside class="w-64 bg-[#090D16] text-slate-300 flex flex-col border-r border-white/10 shrink-0">
            <div class="h-16 flex items-center px-5 gap-3 border-b border-white/10">
                <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 shrink-0">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M4 4h16v4H14v12h-4V8H4V4z"/></svg>
                </div>
                <div class="flex items-center tracking-tight">
                    <span class="text-white text-lg font-bold">Trip</span>
                    <span class="text-primary text-lg font-black">Flow</span>
                </div>
            </div>
            <div class="px-5 py-3 border-b border-white/10">
                <p class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">${state.currentUser.role}</p>
                <p class="text-sm font-semibold text-white mt-0.5 truncate">${state.currentUser.name}</p>
            </div>
            <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                ${links.map(l => `
                    <button onclick="navigate('${l.route}')" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${state.currentRoute === l.route ? 'bg-primary/15 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
                        <div class="flex items-center gap-3">
                            ${l.icon}
                            <span>${l.label}</span>
                        </div>
                        ${l.badge > 0 ? `<span class="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">${l.badge}</span>` : ''}
                    </button>
                `).join('')}
            </nav>
            <div class="p-3 border-t border-white/10">
                <button onclick="logout()" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                    <span class="material-symbols-outlined" style="font-size:18px">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    `;
}

window.logout = function () {
    state.currentUser = null;
    localStorage.removeItem('tf_user');
    state.showLogin = false;
    render();
}

function renderNavbar() {
    const unreadCount = state.notifications.filter(n => !n.read).length;
    return `
        <header class="h-16 bg-[#090D16] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
            <div class="relative w-72">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 select-none pointer-events-none" style="font-size:18px">search</span>
                <input type="text" placeholder="Search trips, drivers..." class="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all">
            </div>
            <div class="flex items-center gap-2">
                <button onclick="navigate('notifications')" class="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <span class="material-symbols-outlined" style="font-size:20px">notifications</span>
                    ${unreadCount > 0 ? `<span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>` : ''}
                </button>
                <div class="flex items-center gap-3 pl-3 border-l border-white/10 ml-1">
                    <div class="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-sm shrink-0">
                        ${state.currentUser.name.charAt(0)}
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-white leading-none">${state.currentUser.name}</p>
                        <p class="text-xs text-slate-500 capitalize mt-0.5">${state.currentUser.role}</p>
                    </div>
                </div>
            </div>
        </header>
    `;
}

function renderPageContent() {
    switch (state.currentRoute) {
        case 'dashboard': return renderOwnerDashboard();
        case 'trips': return renderTripsList();
        case 'create_trip': return renderCreateTrip();
        case 'trip_details': return renderTripDetails();
        case 'drivers': return renderDrivers();
        case 'vehicles': return renderVehicles();
        case 'customers': return renderCustomers();
        case 'notifications': return renderNotifications();
        case 'settings': return renderSettings();
        case 'driver_dashboard': return renderDriverDashboard();
        default: return renderOwnerDashboard();
    }
}

function renderOwnerDashboard() {
    const total     = state.trips.length;
    const active    = state.trips.filter(t => ['Driver Assigned', 'Picked Up', 'In Transit'].includes(t.status)).length;
    const delivered = state.trips.filter(t => t.status === 'Delivered').length;
    const pending   = state.trips.filter(t => t.status === 'Created').length;

    const statCards = [
        { label: 'Total Trips',  value: total,     icon: 'route',          color: 'text-primary',     bg: 'bg-primary/10'     },
        { label: 'Active Trips', value: active,    icon: 'local_shipping', color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
        { label: 'Delivered',    value: delivered, icon: 'task_alt',       color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Pending',      value: pending,   icon: 'schedule',       color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
    ];

    const recentTrips = state.trips.slice(0, 5);

    return `
        <div class="space-y-5 animate-fadeIn">

            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-xl font-bold text-white">Owner Dashboard</h1>
                    <p class="text-sm text-slate-400 mt-0.5">Operations and transport overview</p>
                </div>
                <button onclick="navigate('create_trip')" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:bg-orange-500 active:scale-95 transition-all">
                    <span class="material-symbols-outlined" style="font-size:18px">add</span>
                    Create Trip
                </button>
            </div>

            <!-- Stat Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                ${statCards.map(s => `
                    <div class="bg-[#0F172A] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-white/20 transition-colors">
                        <div class="w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined ${s.color}" style="font-size:20px">${s.icon}</span>
                        </div>
                        <div class="min-w-0">
                            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">${s.label}</p>
                            <p class="text-3xl font-black text-white leading-none mt-1">${s.value}</p>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Recent Trips -->
            <div class="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary" style="font-size:18px">receipt_long</span>
                        <h3 class="font-bold text-white text-sm">Recent Trips</h3>
                    </div>
                    <button onclick="navigate('trips')" class="flex items-center gap-1 text-xs text-primary font-semibold hover:text-orange-400 transition-colors">
                        View All
                        <span class="material-symbols-outlined" style="font-size:14px">arrow_forward</span>
                    </button>
                </div>

                ${recentTrips.length === 0 ? `
                    <div class="py-14 flex flex-col items-center justify-center text-center">
                        <span class="material-symbols-outlined text-slate-600" style="font-size:40px">local_shipping</span>
                        <p class="text-slate-400 text-sm mt-3 font-medium">No trips yet</p>
                        <p class="text-slate-600 text-xs mt-1">Create your first trip to get started</p>
                        <button onclick="navigate('create_trip')" class="mt-4 px-4 py-2 rounded-xl bg-primary/15 text-primary text-xs font-bold hover:bg-primary/25 transition-colors">
                            + Create Trip
                        </button>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b border-white/5">
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trip ID</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Destination</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Driver</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                ${recentTrips.map(t => `
                                    <tr class="hover:bg-white/5 transition-colors">
                                        <td class="py-3.5 px-5">
                                            <span class="text-primary font-mono text-xs font-bold">${t.id}</span>
                                        </td>
                                        <td class="py-3.5 px-5">
                                            <span class="text-sm text-white font-medium">${t.customer}</span>
                                        </td>
                                        <td class="py-3.5 px-5 hidden md:table-cell">
                                            <span class="text-sm text-slate-400">${t.destination}</span>
                                        </td>
                                        <td class="py-3.5 px-5 hidden lg:table-cell">
                                            <span class="text-sm text-slate-400">${t.driverName}</span>
                                        </td>
                                        <td class="py-3.5 px-5">${renderBadge(t.status)}</td>
                                        <td class="py-3.5 px-5 text-right">
                                            <button onclick="navigate('trip_details', '${t.id}')" class="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold px-3 py-1.5 rounded-lg transition-all">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderTripsList() {
    return `
        <div class="space-y-5 animate-fadeIn pb-12">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-xl font-bold text-white">Trip Management</h1>
                    <p class="text-sm text-slate-400 mt-0.5">All transport schedules and dispatches</p>
                </div>
                <button onclick="navigate('create_trip')" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:bg-orange-500 active:scale-95 transition-all">
                    <span class="material-symbols-outlined" style="font-size:18px">add</span>
                    Create Trip
                </button>
            </div>

            <!-- Trips Table Container -->
            <div class="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                ${state.trips.length === 0 ? `
                    <div class="py-16 flex flex-col items-center justify-center text-center">
                        <span class="material-symbols-outlined text-slate-600 mb-4" style="font-size:48px">local_shipping</span>
                        <h3 class="text-lg font-bold text-white mb-1">No trips found</h3>
                        <p class="text-slate-400 text-sm mb-6">You don't have any trips yet. Create one to get started.</p>
                        <button onclick="navigate('create_trip')" class="px-5 py-2.5 rounded-xl bg-primary/15 text-primary text-sm font-bold hover:bg-primary/25 transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined" style="font-size:18px">add</span>
                            Create Trip
                        </button>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b border-white/5">
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trip ID</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Pickup</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Destination</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Driver</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th class="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                ${state.trips.map(t => `
                                    <tr class="hover:bg-white/5 transition-colors">
                                        <td class="py-3.5 px-5">
                                            <span class="text-primary font-mono text-xs font-bold">${t.id}</span>
                                        </td>
                                        <td class="py-3.5 px-5">
                                            <span class="text-sm text-white font-medium">${t.customer}</span>
                                        </td>
                                        <td class="py-3.5 px-5 hidden md:table-cell">
                                            <span class="text-sm text-slate-400">${t.pickup}</span>
                                        </td>
                                        <td class="py-3.5 px-5 hidden md:table-cell">
                                            <span class="text-sm text-slate-400">${t.destination}</span>
                                        </td>
                                        <td class="py-3.5 px-5 hidden lg:table-cell">
                                            <span class="text-sm text-slate-400">${t.driverName}</span>
                                        </td>
                                        <td class="py-3.5 px-5">${renderBadge(t.status)}</td>
                                        <td class="py-3.5 px-5 text-right">
                                            <button onclick="navigate('trip_details', '${t.id}')" class="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold px-3 py-1.5 rounded-lg transition-all">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderCreateTrip() {
    return `
        <div class="max-w-3xl mx-auto space-y-5 animate-fadeIn pb-12">
            <!-- Header -->
            <div class="flex items-center gap-4">
                <button onclick="navigate('trips')" class="w-10 h-10 flex items-center justify-center bg-[#0F172A] border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-xl transition-all">
                    <span class="material-symbols-outlined" style="font-size:20px">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-xl font-bold text-white">Create New Trip</h1>
                    <p class="text-sm text-slate-400 mt-0.5">Enter details to dispatch a new shipment</p>
                </div>
            </div>

            <!-- Form Container -->
            <form onsubmit="handleCreateTrip(event)" class="bg-[#0F172A] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Customer Name *</label>
                        <input type="text" id="cust" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Email *</label>
                        <input type="email" id="email" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Pickup Location *</label>
                        <input type="text" id="pickup" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Destination *</label>
                        <input type="text" id="dest" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Goods *</label>
                        <input type="text" id="goods" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quantity *</label>
                        <input type="text" id="qty" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Assign Driver</label>
                        <div class="relative">
                            <select id="driver" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all [&>option]:bg-[#0F172A]">
                                ${state.drivers.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                            </select>
                            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style="font-size:18px">expand_more</span>
                        </div>
                    </div>
                </div>
                
                <div class="pt-4">
                    <button type="submit" class="w-full py-3 bg-primary hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined" style="font-size:20px">check_circle</span>
                        Submit Trip
                    </button>
                </div>
            </form>
        </div>
    `;
}

window.handleCreateTrip = async function (e) {
    e.preventDefault();

    const id = 'TRP' + Math.floor(1000 + Math.random() * 9000);

    const driverId = document.getElementById('driver').value;
    const driverObj = state.drivers.find(d => d.id === driverId);

    const newTrip = {
        id: id,
        customer: document.getElementById('cust').value,
        customerEmail: document.getElementById('email').value,
        pickup: document.getElementById('pickup').value,
        destination: document.getElementById('dest').value,
        goods: document.getElementById('goods').value,
        quantity: document.getElementById('qty').value,
        driverId: driverId,
        driverName: driverObj ? driverObj.name : 'Unassigned',
        vehicleNumber: 'IL-04-AB-9876',
        status: 'Driver Assigned',
        date: new Date().toISOString().split('T')[0]
    };

    try {
        const createdTrip = await createTrip(newTrip);

        console.log("Trip created in backend:", createdTrip);

        await loadTripsFromBackend();

        navigate('trips');

    } catch (error) {
        console.error("Failed to create trip:", error);
        alert("Failed to create trip.");
    }
};

function renderTripDetails() {
    const trip = state.trips.find(t => t.id === state.selectedTripId);
    if (!trip) return `
        <div class="flex flex-col items-center justify-center h-[60vh] text-center">
            <span class="material-symbols-outlined text-slate-600 text-6xl mb-4">search_off</span>
            <h2 class="text-xl font-bold text-white">Trip Not Found</h2>
            <p class="text-slate-400 mt-2">The trip you are looking for does not exist.</p>
            <button onclick="navigate('trips')" class="mt-6 px-4 py-2 bg-primary hover:bg-orange-500 transition-colors text-white rounded-xl font-bold">Go Back</button>
        </div>
    `;

    const steps = ['Created', 'Driver Assigned', 'Picked Up', 'In Transit', 'Delivered'];
    const currentStepIndex = steps.indexOf(trip.status);

    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
            
            <!-- Header Bar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="navigate('trips')" class="w-10 h-10 flex items-center justify-center bg-[#0F172A] border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-xl transition-all shadow-sm">
                        <span class="material-symbols-outlined" style="font-size:20px">arrow_back</span>
                    </button>
                    <div>
                        <div class="flex items-center gap-3">
                            <h1 class="text-2xl font-bold text-white font-mono tracking-tight">${trip.id}</h1>
                            ${renderBadge(trip.status)}
                        </div>
                        <p class="text-sm text-slate-400 mt-0.5">Created on ${trip.date || 'Unknown'}</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-3">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Update Status:</span>
                    <div class="relative">
                        <select onchange="updateStatus('${trip.id}', this.value)" class="w-48 px-4 py-2.5 bg-[#0F172A] border border-white/10 rounded-xl text-sm font-bold text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer [&>option]:bg-[#090D16] hover:border-white/20 shadow-sm">
                            ${steps.map(s => `<option value="${s}" ${trip.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                        <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" style="font-size:18px">arrow_drop_down</span>
                    </div>
                </div>
            </div>

            <!-- Progress Tracker -->
            <div class="bg-[#0F172A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg overflow-hidden relative">
                <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
                <h3 class="text-sm font-bold text-white mb-6 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary" style="font-size:18px">timeline</span>
                    Trip Progress
                </h3>
                <div class="relative flex justify-between items-center z-10 px-2 sm:px-6">
                    <!-- Connecting line -->
                    <div class="absolute left-0 right-0 mx-4 sm:mx-10 top-1/2 -translate-y-1/2 h-1 bg-white/5 rounded-full"></div>
                    <div class="absolute left-0 mx-4 sm:mx-10 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(236,91,19,0.5)]" style="width: calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 32px)"></div>
                    
                    ${steps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return `
                            <div class="relative flex flex-col items-center group">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${isCompleted ? 'bg-primary shadow-[0_0_15px_rgba(236,91,19,0.4)]' : 'bg-[#090D16] border-2 border-white/10'}">
                                    ${isCompleted ? `<span class="material-symbols-outlined text-white" style="font-size:16px">check</span>` : `<span class="w-2 h-2 rounded-full bg-white/20"></span>`}
                                </div>
                                <span class="absolute top-10 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center w-20 sm:w-24 ${isCurrent ? 'text-primary' : (isCompleted ? 'text-white' : 'text-slate-500')}">${step}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="h-8"></div><!-- Spacer for absolute text -->
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Route & Logistics -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Route -->
                    <div class="bg-[#0F172A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg">
                        <div class="flex items-center gap-2 mb-6">
                            <span class="material-symbols-outlined text-primary" style="font-size:20px">route</span>
                            <h3 class="text-lg font-bold text-white">Route Details</h3>
                        </div>
                        
                        <div class="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10 before:rounded-full">
                            <!-- Pickup -->
                            <div class="relative">
                                <div class="absolute -left-[37px] top-1 w-5 h-5 rounded-full border-[4px] border-[#0F172A] bg-primary z-10 shadow-[0_0_10px_rgba(236,91,19,0.5)]"></div>
                                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pickup Location</p>
                                <p class="text-base font-bold text-white">${trip.pickup || 'Not specified'}</p>
                                ${trip.pickupDate ? `<p class="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><span class="material-symbols-outlined" style="font-size:14px">calendar_today</span>${trip.pickupDate}</p>` : ''}
                            </div>
                            
                            <!-- Destination -->
                            <div class="relative">
                                <div class="absolute -left-[37px] top-1 w-5 h-5 rounded-full border-[4px] border-[#0F172A] bg-emerald-500 z-10"></div>
                                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Destination</p>
                                <p class="text-base font-bold text-white">${trip.destination || 'Not specified'}</p>
                                ${trip.expectedDelivery ? `<p class="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><span class="material-symbols-outlined" style="font-size:14px">event_available</span>Expected: ${trip.expectedDelivery}</p>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Cargo -->
                    <div class="bg-[#0F172A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg">
                        <div class="flex items-center gap-2 mb-6">
                            <span class="material-symbols-outlined text-primary" style="font-size:20px">inventory_2</span>
                            <h3 class="text-lg font-bold text-white">Cargo Information</h3>
                        </div>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Goods</p>
                                <p class="text-sm font-semibold text-white">${trip.goods || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity</p>
                                <p class="text-sm font-semibold text-white">${trip.quantity || 'N/A'}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes & Instructions</p>
                                <p class="text-sm text-slate-300 bg-[#090D16]/50 p-4 rounded-xl border border-white/5 leading-relaxed">${trip.notes || 'No additional notes provided for this shipment.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Related Entities -->
                <div class="space-y-6">
                    <!-- Customer -->
                    <div class="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-lg">
                        <div class="flex items-center gap-2 mb-5">
                            <span class="material-symbols-outlined text-primary" style="font-size:20px">domain</span>
                            <h3 class="text-base font-bold text-white">Customer</h3>
                        </div>
                        <div class="flex items-center gap-3 mb-5">
                            <div class="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                                ${(trip.customer || 'C').charAt(0)}
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white">${trip.customer || 'Unknown'}</p>
                                <p class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Client</p>
                            </div>
                        </div>
                        <div class="space-y-3 pt-4 border-t border-white/5">
                            <div class="flex items-center gap-3 text-slate-300 hover:text-white transition-colors cursor-pointer">
                                <span class="material-symbols-outlined text-slate-500" style="font-size:16px">mail</span>
                                <span class="text-xs font-medium">${trip.customerEmail || 'No email provided'}</span>
                            </div>
                            <div class="flex items-center gap-3 text-slate-300 hover:text-white transition-colors cursor-pointer">
                                <span class="material-symbols-outlined text-slate-500" style="font-size:16px">call</span>
                                <span class="text-xs font-medium">${trip.customerPhone || 'No phone provided'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Driver -->
                    <div class="bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-lg">
                        <div class="flex items-center gap-2 mb-5">
                            <span class="material-symbols-outlined text-primary" style="font-size:20px">badge</span>
                            <h3 class="text-base font-bold text-white">Assigned Driver</h3>
                        </div>
                        <div class="flex items-center gap-3 mb-5">
                            <div class="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                                ${(trip.driverName || 'U').charAt(0)}
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white">${trip.driverName || 'Unassigned'}</p>
                                <p class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">${trip.driverId || 'Pending'}</p>
                            </div>
                        </div>
                        <div class="pt-4 border-t border-white/5 flex items-center gap-3 text-slate-300">
                            <span class="material-symbols-outlined text-slate-500" style="font-size:16px">local_shipping</span>
                            <span class="text-xs font-medium">${trip.vehicleNumber || 'Vehicle pending assignment'}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}

async function updateStatus(tripId, newStatus) {
    try {
        const trip = await getTripById(tripId);

        if (!trip) {
            alert("Trip not found.");
            return;
        }

        trip.status = newStatus;

        const updatedTrip = await updateTrip(tripId, trip);

        console.log("Trip status updated in backend:", updatedTrip);

        await loadTripsFromBackend();

        render();

    } catch (error) {
        console.error("Failed to update trip status:", error);
        alert("Failed to update trip status.");
    }
}

function renderDriverDashboard() {
    const myTrips = state.trips.filter(t => t.driverName === state.currentUser.name);
    
    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
            
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Driver Portal</h1>
                    <p class="text-sm text-slate-400 mt-1">Manage your assigned trips and update transport status</p>
                </div>
                <div class="flex items-center gap-3 bg-[#0F172A] border border-white/10 px-4 py-2.5 rounded-xl shadow-lg">
                    <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-black text-white shadow-lg shadow-primary/30">
                        ${state.currentUser.name.charAt(0)}
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Driver</p>
                        <p class="text-sm font-bold text-white leading-none mt-0.5">${state.currentUser.name}</p>
                    </div>
                </div>
            </div>

            <!-- Assigned Trips Section -->
            <div class="space-y-5">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary" style="font-size:20px">route</span>
                    <h2 class="text-lg font-bold text-white">Your Assigned Trips</h2>
                    <span class="ml-2 bg-white/10 text-slate-300 text-xs px-2 py-0.5 rounded-full font-bold border border-white/5">
                        ${myTrips.length}
                    </span>
                </div>

                ${myTrips.length === 0 ? `
                    <div class="bg-[#0F172A] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
                        <div class="w-20 h-20 bg-[#090D16] rounded-full flex items-center justify-center text-slate-600 mb-5 border border-white/5 shadow-inner">
                            <span class="material-symbols-outlined" style="font-size:40px">beach_access</span>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">No active trips</h3>
                        <p class="text-slate-400 text-sm max-w-sm">You currently have no assigned trips. Take a break or check back later when dispatch assigns a new route.</p>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 gap-6">
                        ${myTrips.map(t => `
                            <div class="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl hover:border-white/20 hover:shadow-2xl transition-all relative overflow-hidden group">
                                
                                <!-- Decorative Accent -->
                                <div class="absolute top-0 left-0 w-2 h-full bg-primary/80 group-hover:bg-primary transition-colors"></div>
                                <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-opacity group-hover:opacity-100 opacity-70"></div>

                                <div class="relative z-10 flex flex-col lg:flex-row gap-8">
                                    
                                    <!-- Trip Info Left -->
                                    <div class="flex-1 space-y-6">
                                        <div class="flex flex-wrap justify-between items-start gap-4">
                                            <div>
                                                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                    <span class="material-symbols-outlined" style="font-size:14px">receipt_long</span>
                                                    Trip ID
                                                </p>
                                                <h3 class="font-black text-xl text-white font-mono tracking-tight">${t.id}</h3>
                                            </div>
                                            <div>${renderBadge(t.status)}</div>
                                        </div>
                                        
                                        <!-- Route Visualization Timeline -->
                                        <div class="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[3px] before:bg-white/5 before:rounded-full">
                                            
                                            <!-- Pickup -->
                                            <div class="relative">
                                                <div class="absolute -left-[29px] top-1 w-4 h-4 rounded-full border-[4px] border-[#0F172A] bg-primary z-10 shadow-[0_0_12px_rgba(236,91,19,0.5)]"></div>
                                                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Pickup Location</p>
                                                <p class="text-sm font-bold text-white">${t.pickup}</p>
                                            </div>
                                            
                                            <!-- Destination -->
                                            <div class="relative">
                                                <div class="absolute -left-[29px] top-1 w-4 h-4 rounded-full border-[4px] border-[#0F172A] bg-emerald-500 z-10"></div>
                                                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Destination</p>
                                                <p class="text-sm font-bold text-white">${t.destination}</p>
                                            </div>

                                        </div>
                                    </div>
                                    
                                    <!-- Action Right -->
                                    <div class="lg:w-64 shrink-0 flex flex-col justify-end border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8 mt-4 lg:mt-0">
                                        <div class="space-y-3">
                                            <label class="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                <span class="material-symbols-outlined text-primary" style="font-size:16px">update</span>
                                                Update Status
                                            </label>
                                            <div class="relative">
                                                <select onchange="updateStatus('${t.id}', this.value)" class="w-full px-4 py-3 bg-[#090D16] border border-white/10 rounded-xl text-sm font-bold text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer [&>option]:bg-[#090D16] hover:bg-white/5">
                                                    <option value="Driver Assigned" ${t.status === 'Driver Assigned' ? 'selected' : ''}>Driver Assigned</option>
                                                    <option value="Picked Up" ${t.status === 'Picked Up' ? 'selected' : ''}>Picked Up</option>
                                                    <option value="In Transit" ${t.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
                                                    <option value="Delivered" ${t.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                                </select>
                                                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" style="font-size:20px">arrow_drop_down</span>
                                            </div>
                                            <p class="text-[10px] text-slate-500 font-medium text-center mt-2 flex items-center justify-center gap-1">
                                                <span class="material-symbols-outlined" style="font-size:12px">sync</span>
                                                Syncs directly with dispatch
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderDrivers() {
    return `
        <div class="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Fleet Drivers</h1>
                    <p class="text-sm text-slate-400 mt-1">Manage your driver roster and current availability</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${state.drivers.map(d => `
                    <div class="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 hover:-translate-y-1 transition-all group relative overflow-hidden">
                        
                        <!-- Top glow -->
                        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                        
                        <div class="flex items-start justify-between mb-6 relative z-10">
                            <div class="flex items-center gap-4">
                                <div class="w-14 h-14 rounded-2xl bg-[#090D16] border border-white/5 flex items-center justify-center shadow-inner">
                                    <span class="text-xl font-black text-slate-300 group-hover:text-primary transition-colors">${d.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <h3 class="font-bold text-lg text-white group-hover:text-primary transition-colors">${d.name}</h3>
                                    <p class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">${d.id}</p>
                                </div>
                            </div>
                            ${renderBadge(d.availability)}
                        </div>
                        
                        <div class="pt-4 border-t border-white/5 relative z-10">
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-slate-600" style="font-size:14px">call</span>
                                    Phone
                                </span>
                                <span class="text-sm font-semibold text-white">${d.phone}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
function renderVehicles() {
    return `
        <div class="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Fleet Vehicles</h1>
                    <p class="text-sm text-slate-400 mt-1">Monitor transport inventory and deployment status</p>
                </div>
            </div>
            
            ${state.vehicles.length === 0 ? `
                <div class="bg-[#0F172A] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center shadow-xl">
                    <span class="material-symbols-outlined text-slate-600 text-6xl mb-4">no_crash</span>
                    <h3 class="text-xl font-bold text-white mb-2">No Vehicles Found</h3>
                    <p class="text-slate-400 text-sm">Your fleet currently has no registered vehicles.</p>
                </div>
            ` : `
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    ${state.vehicles.map(v => `
                        <div class="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full">
                            
                            <!-- Ambient glow -->
                            <div class="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                            
                            <!-- Card Header -->
                            <div class="flex items-start justify-between mb-6 relative z-10">
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="material-symbols-outlined text-primary" style="font-size:20px">local_shipping</span>
                                        <h3 class="font-bold text-lg text-white tracking-tight">${v.number}</h3>
                                    </div>
                                    <p class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">${v.id}</p>
                                </div>
                                ${renderBadge(v.availability)}
                            </div>
                            
                            <!-- Card Body -->
                            <div class="space-y-4 flex-grow relative z-10">
                                <!-- Type -->
                                <div class="bg-[#090D16] rounded-xl p-4 border border-white/5">
                                    <p class="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Vehicle Type</p>
                                    <p class="text-sm font-semibold text-white">${v.type}</p>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <!-- Capacity -->
                                    <div class="bg-[#090D16] rounded-xl p-4 border border-white/5">
                                        <p class="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                                            <span class="material-symbols-outlined text-slate-400" style="font-size:14px">weight</span>
                                            Capacity
                                        </p>
                                        <p class="text-sm font-semibold text-white">${v.capacity}</p>
                                    </div>
                                    
                                    <!-- Assigned Driver -->
                                    <div class="bg-[#090D16] rounded-xl p-4 border border-white/5">
                                        <p class="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                                            <span class="material-symbols-outlined text-slate-400" style="font-size:14px">badge</span>
                                            Driver
                                        </p>
                                        <p class="text-sm font-semibold text-white truncate" title="${v.driver}">${v.driver || 'Unassigned'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function renderCustomers() {
    return `
        <div class="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Customers</h1>
                    <p class="text-sm text-slate-400 mt-1">Manage client relationships and contact records</p>
                </div>
            </div>
            
            ${state.customers.length === 0 ? `
                <div class="bg-[#0F172A] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center shadow-xl">
                    <span class="material-symbols-outlined text-slate-600 text-6xl mb-4">group_off</span>
                    <h3 class="text-xl font-bold text-white mb-2">No Customers Found</h3>
                    <p class="text-slate-400 text-sm">You have not added any clients yet.</p>
                </div>
            ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${state.customers.map(c => `
                        <div class="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl hover:border-white/20 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full">
                            
                            <!-- Ambient glow -->
                            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                            
                            <div class="flex items-start justify-between mb-6 relative z-10">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                                        <span class="text-lg font-black text-blue-400">${c.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-lg text-white truncate max-w-[150px]" title="${c.name}">${c.name}</h3>
                                        <p class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">${c.id}</p>
                                    </div>
                                </div>
                                ${renderBadge(c.status)}
                            </div>
                            
                            <div class="space-y-4 flex-grow relative z-10">
                                <div class="bg-[#090D16] rounded-xl p-4 border border-white/5 space-y-3">
                                    <div class="flex items-center gap-3 text-slate-300">
                                        <span class="material-symbols-outlined text-slate-500" style="font-size:16px">mail</span>
                                        <span class="text-xs font-medium truncate" title="${c.email}">${c.email}</span>
                                    </div>
                                    <div class="flex items-center gap-3 text-slate-300">
                                        <span class="material-symbols-outlined text-slate-500" style="font-size:16px">call</span>
                                        <span class="text-xs font-medium">${c.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}
function renderNotifications() {
    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Notifications</h1>
                    <p class="text-sm text-slate-400 mt-1">Updates and alerts regarding your trips and fleet</p>
                </div>
            </div>

            ${state.notifications.length === 0 ? `
                <div class="bg-[#0F172A] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center shadow-xl">
                    <div class="w-16 h-16 rounded-2xl bg-[#090D16] border border-white/5 flex items-center justify-center text-slate-600 mb-5 shadow-inner">
                        <span class="material-symbols-outlined" style="font-size:32px">notifications_off</span>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                    <p class="text-slate-400 text-sm">You have no new notifications at this time.</p>
                </div>
            ` : `
                <div class="bg-[#0F172A] border border-white/10 rounded-3xl shadow-xl overflow-hidden relative">
                    <!-- Ambient glow top right -->
                    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none"></div>

                    <div class="divide-y divide-white/5 relative z-10">
                        ${state.notifications.map(n => `
                            <div class="p-6 transition-colors hover:bg-white/5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                <div class="flex items-start gap-4">
                                    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.read ? 'bg-[#090D16] text-slate-500 border border-white/5' : 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(236,91,19,0.2)]'}">
                                        <span class="material-symbols-outlined" style="font-size:20px">
                                            ${n.text.toLowerCase().includes('status') ? 'timeline' : n.text.toLowerCase().includes('completed') ? 'check_circle' : 'notifications'}
                                        </span>
                                    </div>
                                    <div>
                                        <p class="text-sm ${n.read ? 'text-slate-400' : 'text-white font-bold'}">${n.text}</p>
                                        <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <span class="material-symbols-outlined" style="font-size:12px">schedule</span>
                                            ${n.time}
                                        </p>
                                    </div>
                                </div>
                                
                                ${!n.read ? `
                                    <div class="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center mt-2 sm:mt-0">
                                        <span class="inline-block w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(236,91,19,0.8)]"></span>
                                        <span class="text-[9px] uppercase font-bold text-primary tracking-wider mt-2 sm:block hidden">New</span>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `}
        </div>
    `;
}
function renderSettings() {
    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Settings</h1>
                    <p class="text-sm text-slate-400 mt-1">Platform configuration and company details</p>
                </div>
            </div>

            <div class="bg-[#0F172A] border border-white/10 rounded-3xl shadow-xl overflow-hidden relative">
                <!-- Ambient glow top right -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div class="p-8 sm:p-10 relative z-10 space-y-10">
                    
                    <!-- Company Info Section -->
                    <section>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20">
                                <span class="material-symbols-outlined" style="font-size:20px">corporate_fare</span>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white tracking-tight">Company Details</h3>
                                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Entity</p>
                            </div>
                        </div>

                        <div class="bg-[#090D16] rounded-2xl p-6 border border-white/5 space-y-6">
                            <div>
                                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Name</p>
                                <p class="text-lg font-bold text-white">TripFlow Logistics Ltd.</p>
                            </div>
                            
                            <div class="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3">
                                <span class="material-symbols-outlined text-primary shrink-0" style="font-size:20px">info</span>
                                <div>
                                    <h4 class="text-sm font-bold text-primary">Configuration locked</h4>
                                    <p class="text-xs text-primary/80 mt-1">Company configuration and advanced administrative settings are currently managed via the backend database. A self-service portal is planned for a future release.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <!-- Current Session Details -->
                    <section>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                <span class="material-symbols-outlined" style="font-size:20px">shield_person</span>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white tracking-tight">Active Session</h3>
                                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Login Data</p>
                            </div>
                        </div>

                        <div class="bg-[#090D16] rounded-2xl p-6 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <span class="material-symbols-outlined" style="font-size:14px">person</span>
                                    Active User
                                </p>
                                <p class="text-base font-bold text-white">${state.currentUser?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <span class="material-symbols-outlined" style="font-size:14px">admin_panel_settings</span>
                                    Permission Role
                                </p>
                                <p class="text-base font-bold text-white capitalize">${state.currentUser?.role || 'User'}</p>
                            </div>
                            <div class="sm:col-span-2">
                                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <span class="material-symbols-outlined" style="font-size:14px">fingerprint</span>
                                    Session ID
                                </p>
                                <p class="text-sm text-slate-400 font-mono tracking-tight">${state.currentUser?.id || '---'}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    render();
    loadTripsFromBackend();
});