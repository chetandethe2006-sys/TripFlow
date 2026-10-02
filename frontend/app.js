// --- MOCK DATA & STATE ---
let state = {
    currentUser: JSON.parse(localStorage.getItem('tf_user')) || null,
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
    selectedTripId: null
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
        app.innerHTML = renderLogin();
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

function renderLogin() {
    return `
        <div class="min-h-screen bg-slate-950 flex items-center justify-center p-6">
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