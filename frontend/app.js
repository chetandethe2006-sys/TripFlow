// --- MOCK DATA & STATE ---
let state = {
    currentUser: (() => { try { return JSON.parse(localStorage.getItem('tf_user')); } catch(e) { localStorage.removeItem('tf_user'); return null; } })() || null,
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
        'Created': 'bg-blue-50 text-blue-700 border-blue-200',
        'Driver Assigned': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'Picked Up': 'bg-amber-50 text-amber-700 border-amber-200',
        'In Transit': 'bg-purple-50 text-purple-700 border-purple-200',
        'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200',
        'Available': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'On Trip': 'bg-amber-50 text-amber-700 border-amber-200',
        'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    const cls = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
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
                <main class="flex-1 overflow-y-auto p-8 bg-slate-50">
                    ${renderPageContent()}
                </main>
            </div>
        </div>
    `;
}

window.goToLogin = function() {
    state.showLogin = true;
    render();
};

window.goToLanding = function() {
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
            dx: Math.round((canvas.width  - img.width  * ratio) / 2),
            dy: Math.round((canvas.height - img.height * ratio) / 2),
            dw: Math.round(img.width  * ratio),
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
            img.onload  = () => { animationImages[index] = img; resolve(img); };
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
                if      (fraction < 0.1) scrollText.textContent = "Warehouse A, Chicago, IL";
                else if (fraction < 0.5) scrollText.textContent = "In Transit...";
                else if (fraction < 0.9) scrollText.textContent = "Approaching Destination";
                else                     scrollText.textContent = "Distribution Hub, Dallas, TX";
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
        <div class="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative">
            <button onclick="goToLanding()" class="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 font-semibold bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 transition-colors">
                ← Back to Home
            </button>
            <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8">
                <div class="text-center mb-8">
                    <div class="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg shadow-blue-500/20">
                        🚚
                    </div>
                    <h1 class="text-2xl font-bold text-white tracking-tight">Elite TripFlow Portal</h1>
                    <p class="text-sm text-slate-400 mt-1">Select your role to login</p>
                </div>
                <div class="space-y-4">
                    <button onclick="loginAs('owner')" class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all">
                        🛡️ Login as Owner
                    </button>
                    <button onclick="loginAs('driver', 'DRV-01', 'Amit Sharma')" class="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
                        👤 Login as Driver 
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.loginAs = function(role, id = 'OWNER', name = 'Admin Owner') {
    state.currentUser = { role, id, name };
    saveState();
    state.currentRoute = role === 'owner' ? 'dashboard' : 'driver_dashboard';
    render();
}

function renderSidebar() {
    const isOwner = state.currentUser.role === 'owner';
    const unread = state.notifications.filter(n => !n.read).length;
    
    const ownerLinks = [
        { route: 'dashboard', label: 'Dashboard', icon: '📊' },
        { route: 'trips', label: 'Trips', icon: '📦' },
        { route: 'drivers', label: 'Drivers', icon: '👥' },
        { route: 'vehicles', label: 'Vehicles', icon: '🚙' },
        { route: 'customers', label: 'Customers', icon: '🏢' },
        { route: 'notifications', label: 'Notifications', icon: '🔔', badge: unread },
        { route: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    const driverLinks = [
        { route: 'driver_dashboard', label: 'My Assigned Trips', icon: '📍' },
        { route: 'notifications', label: 'Notifications', icon: '🔔', badge: unread }
    ];

    const links = isOwner ? ownerLinks : driverLinks;

    return `
        <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
            <div class="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/50">
                <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">TF</div>
                <h1 class="font-bold text-white text-lg">TripFlow</h1>
            </div>
            <div class="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
                <span class="text-xs uppercase tracking-wider text-slate-500 font-bold">Role: ${state.currentUser.role}</span>
                <p class="text-sm font-medium text-white mt-0.5">${state.currentUser.name}</p>
            </div>
            <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                ${links.map(l => `
                    <button onclick="navigate('${l.route}')" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${state.currentRoute === l.route ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}">
                        <div class="flex items-center gap-3">
                            <span>${l.icon}</span>
                            <span>${l.label}</span>
                        </div>
                        ${l.badge > 0 ? `<span class="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">${l.badge}</span>` : ''}
                    </button>
                `).join('')}
            </nav>
            <div class="p-4 border-t border-slate-800">
                <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10">
                    🚪 Logout
                </button>
            </div>
        </aside>
    `;
}

window.logout = function() {
    state.currentUser = null;
    localStorage.removeItem('tf_user');
    state.showLogin = false;
    render();
}

function renderNavbar() {
    return `
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
            <div class="relative w-80">
                <input type="text" placeholder="Search trips, drivers..." class="w-full pl-4 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            </div>
            <div class="flex items-center gap-4">
                <button onclick="navigate('notifications')" class="p-2 text-slate-600 hover:bg-slate-100 rounded-xl relative">
                    🔔
                </button>
                <div class="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        ${state.currentUser.name.charAt(0)}
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-slate-800 leading-none">${state.currentUser.name}</p>
                        <p class="text-xs text-slate-500 capitalize mt-0.5">${state.currentUser.role}</p>
                    </div>
                </div>
            </div>
        </header>
    `;
}

function renderPageContent() {
    switch(state.currentRoute) {
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
    const total = state.trips.length;
    const active = state.trips.filter(t => ['Driver Assigned', 'Picked Up', 'In Transit'].includes(t.status)).length;
    const delivered = state.trips.filter(t => t.status === 'Delivered').length;
    const pending = state.trips.filter(t => t.status === 'Created').length;

    return `
        <div class="space-y-8 animate-fadeIn">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-slate-900">Owner Dashboard</h1>
                    <p class="text-sm text-slate-500 mt-1">Operations and transport overview.</p>
                </div>
                <button onclick="navigate('create_trip')" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/25">
                    + Create New Trip
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div><p class="text-xs font-bold uppercase text-slate-500">Total Trips</p><h3 class="text-3xl font-bold mt-2">${total}</h3></div>
                    <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">📦</div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div><p class="text-xs font-bold uppercase text-slate-500">Active Trips</p><h3 class="text-3xl font-bold mt-2">${active}</h3></div>
                    <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl">⏳</div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div><p class="text-xs font-bold uppercase text-slate-500">Completed</p><h3 class="text-3xl font-bold mt-2">${delivered}</h3></div>
                    <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">✅</div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div><p class="text-xs font-bold uppercase text-slate-500">Pending</p><h3 class="text-3xl font-bold mt-2">${pending}</h3></div>
                    <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">⚠️</div>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h3 class="font-bold text-lg">Recent Trips</h3>
                    <button onclick="navigate('trips')" class="text-sm font-semibold text-blue-600">View All</button>
                </div>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                            <th class="py-3 px-4">Trip ID</th>
                            <th class="py-3 px-4">Customer</th>
                            <th class="py-3 px-4">Destination</th>
                            <th class="py-3 px-4">Driver</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm">
                        ${state.trips.slice(0, 5).map(t => `
                            <tr class="hover:bg-slate-50">
                                <td class="py-4 px-4 font-bold">${t.id}</td>
                                <td class="py-4 px-4">${t.customer}</td>
                                <td class="py-4 px-4 text-slate-500">${t.destination}</td>
                                <td class="py-4 px-4">${t.driverName}</td>
                                <td class="py-4 px-4">${renderBadge(t.status)}</td>
                                <td class="py-4 px-4 text-right">
                                    <button onclick="navigate('trip_details', '${t.id}')" class="text-xs bg-slate-100 hover:bg-slate-200 font-semibold px-3 py-1.5 rounded-lg">View</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderTripsList() {
    return `
        <div class="space-y-6 animate-fadeIn">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-slate-900">Trip Management</h1>
                    <p class="text-sm text-slate-500 mt-1">All transport schedules and dispatches.</p>
                </div>
                <button onclick="navigate('create_trip')" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/25">
                    + Create Trip
                </button>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                            <th class="py-3.5 px-4">Trip ID</th>
                            <th class="py-3.5 px-4">Customer</th>
                            <th class="py-3.5 px-4">Pickup</th>
                            <th class="py-3.5 px-4">Destination</th>
                            <th class="py-3.5 px-4">Driver</th>
                            <th class="py-3.5 px-4">Status</th>
                            <th class="py-3.5 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm">
                        ${state.trips.map(t => `
                            <tr class="hover:bg-slate-50">
                                <td class="py-4 px-4 font-bold">${t.id}</td>
                                <td class="py-4 px-4 font-medium">${t.customer}</td>
                                <td class="py-4 px-4 text-slate-500">${t.pickup}</td>
                                <td class="py-4 px-4 text-slate-500">${t.destination}</td>
                                <td class="py-4 px-4">${t.driverName}</td>
                                <td class="py-4 px-4">${renderBadge(t.status)}</td>
                                <td class="py-4 px-4 text-right">
                                    <button onclick="navigate('trip_details', '${t.id}')" class="text-xs bg-slate-100 hover:bg-slate-200 font-semibold px-3 py-1.5 rounded-lg">View</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderCreateTrip() {
    return `
        <div class="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div class="flex items-center gap-4">
                <button onclick="navigate('trips')" class="p-2 bg-white border border-slate-200 rounded-xl">←</button>
                <h1 class="text-2xl font-bold">Create New Trip</h1>
            </div>
            <form onsubmit="handleCreateTrip(event)" class="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Customer Name *</label>
                        <input type="text" id="cust" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Email *</label>
                        <input type="email" id="email" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Pickup Location *</label>
                        <input type="text" id="pickup" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Destination *</label>
                        <input type="text" id="dest" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Goods *</label>
                        <input type="text" id="goods" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Quantity *</label>
                        <input type="text" id="qty" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Assign Driver</label>
                        <select id="driver" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                            ${state.drivers.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30">Submit Trip</button>
            </form>
        </div>
    `;
}

window.handleCreateTrip = async function(e) {
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
    if (!trip) return `<div>Trip not found</div>`;

    const steps = ['Created', 'Driver Assigned', 'Picked Up', 'In Transit', 'Delivered'];

    return `
        <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <button onclick="navigate('trips')" class="p-2 bg-white border border-slate-200 rounded-xl">←</button>
                    <div><h1 class="text-2xl font-bold">Trip #${trip.id}</h1>${renderBadge(trip.status)}</div>
                </div>
                <select onchange="updateStatus('${trip.id}', this.value)" class="px-4 py-2 border rounded-xl font-semibold text-sm">
                    ${steps.map(s => `<option value="${s}" ${trip.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div><span class="text-xs text-slate-400 font-bold uppercase">Customer</span><p class="font-semibold">${trip.customer}</p></div>
                    <div><span class="text-xs text-slate-400 font-bold uppercase">Driver</span><p class="font-semibold">${trip.driverName}</p></div>
                    <div><span class="text-xs text-slate-400 font-bold uppercase">Pickup</span><p class="font-semibold">${trip.pickup}</p></div>
                    <div><span class="text-xs text-slate-400 font-bold uppercase">Destination</span><p class="font-semibold">${trip.destination}</p></div>
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
        <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <h1 class="text-2xl font-bold">Driver Portal</h1>
            ${myTrips.length === 0 ? `<div class="bg-white p-8 rounded-2xl text-center">No assigned trips.</div>` : myTrips.map(t => `
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="font-bold text-lg">Trip #${t.id}</h3>
                        ${renderBadge(t.status)}
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Pickup:</strong> ${t.pickup}</div>
                        <div><strong>Destination:</strong> ${t.destination}</div>
                    </div>
                    <div class="pt-4 border-t flex items-center justify-between">
                        <span class="text-xs text-slate-500">Update Status:</span>
                        <select onchange="updateStatus('${t.id}', this.value)" class="px-3 py-1.5 border rounded-lg text-sm font-semibold">
                            <option value="Driver Assigned" ${t.status==='Driver Assigned'?'selected':''}>Driver Assigned</option>
                            <option value="Picked Up" ${t.status==='Picked Up'?'selected':''}>Picked Up</option>
                            <option value="In Transit" ${t.status==='In Transit'?'selected':''}>In Transit</option>
                            <option value="Delivered" ${t.status==='Delivered'?'selected':''}>Delivered</option>
                        </select>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderDrivers() {
    return `<div class="space-y-6 animate-fadeIn"><h1 class="text-2xl font-bold">Drivers</h1><div class="grid grid-cols-3 gap-6">${state.drivers.map(d => `<div class="bg-white p-6 rounded-2xl border shadow-sm"><h3 class="font-bold text-lg">${d.name}</h3><p class="text-xs text-slate-500">${d.phone}</p><div class="mt-4">${renderBadge(d.availability)}</div></div>`).join('')}</div></div>`;
}
function renderVehicles() {
    return `<div class="space-y-6 animate-fadeIn"><h1 class="text-2xl font-bold">Vehicles</h1><div class="grid grid-cols-3 gap-6">${state.vehicles.map(v => `<div class="bg-white p-6 rounded-2xl border shadow-sm"><h3 class="font-bold text-lg">${v.number}</h3><p class="text-xs text-slate-500">${v.type}</p><div class="mt-4">${renderBadge(v.availability)}</div></div>`).join('')}</div></div>`;
}
function renderCustomers() {
    return `<div class="space-y-6 animate-fadeIn"><h1 class="text-2xl font-bold">Customers</h1><div class="grid grid-cols-3 gap-6">${state.customers.map(c => `<div class="bg-white p-6 rounded-2xl border shadow-sm"><h3 class="font-bold text-lg">${c.name}</h3><p class="text-xs text-slate-500">${c.email}</p><div class="mt-4">${renderBadge(c.status)}</div></div>`).join('')}</div></div>`;
}
function renderNotifications() {
    return `<div class="max-w-3xl mx-auto space-y-4 animate-fadeIn"><h1 class="text-2xl font-bold">Notifications</h1><div class="bg-white rounded-2xl border divide-y">${state.notifications.map(n => `<div class="p-4 flex items-center justify-between text-sm"><span>${n.text}</span><span class="text-xs text-slate-400">${n.time}</span></div>`).join('')}</div></div>`;
}
function renderSettings() {
    return `<div class="max-w-2xl mx-auto bg-white p-6 rounded-2xl border shadow-sm"><h1 class="text-2xl font-bold mb-4">Settings</h1><p class="text-sm text-slate-600">Company Name: TripFlow Logistics Ltd.</p></div>`;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    render();
    loadTripsFromBackend();
});