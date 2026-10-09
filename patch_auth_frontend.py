with open('frontend/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace renderLogin and loginAs
old_login_start = content.find('function renderLogin() {')
old_login_end = content.find('function renderSidebar() {')

new_login_block = r"""function renderLogin() {
    const isDriverForm = state.loginMode === 'driver';
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
                    <div class="flex flex-col items-center mb-8">
                        <div class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-[0_0_30px_rgba(236,91,19,0.3)] mb-4">
                            <svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M4 4h16v4H14v12h-4V8H4V4z"/></svg>
                        </div>
                        <div class="flex items-center tracking-tight text-3xl mb-1">
                            <span class="text-white font-bold">Trip</span>
                            <span class="text-primary font-black">Flow</span>
                        </div>
                        <p class="text-sm text-slate-400 font-medium">${isDriverForm ? 'Driver Authentication' : 'Select your role to continue'}</p>
                    </div>

                    ${!isDriverForm ? `
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
                            
                            <button onclick="setLoginMode('driver')" class="group w-full flex items-center justify-between p-4 bg-[#090D16]/50 hover:bg-primary/10 border border-white/5 hover:border-primary/40 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:shadow-[0_0_20px_rgba(236,91,19,0.1)] hover:-translate-y-0.5">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                        <span class="material-symbols-outlined" style="font-size:24px">directions_car</span>
                                    </div>
                                    <div class="text-left">
                                        <p class="text-white font-bold text-base group-hover:text-primary transition-colors">Login as Driver</p>
                                        <p class="text-slate-500 text-xs mt-0.5">Verify license & view assigned trips</p>
                                    </div>
                                </div>
                                <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:translate-x-1 transition-all">
                                    <span class="material-symbols-outlined text-slate-400 group-hover:text-primary" style="font-size:18px">arrow_forward</span>
                                </div>
                            </button>
                        </div>
                    ` : `
                        <!-- Driver Login Form -->
                        <form onsubmit="handleDriverLoginForm(event)" class="space-y-4">
                            ${state.loginError ? `
                                <div class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-fadeIn">
                                    <span class="material-symbols-outlined" style="font-size:16px">error</span>
                                    <span>${state.loginError}</span>
                                </div>
                            ` : ''}
                            
                            <div>
                                <label class="block text-slate-400 text-[11px] font-bold uppercase mb-2">Driver License Number or ID *</label>
                                <div class="relative">
                                    <input type="text" id="driver_identifier" required placeholder="e.g. DL-99887766 or DRV-01" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all">
                                    <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" style="font-size:18px">badge</span>
                                </div>
                                <p class="text-[11px] text-slate-500 mt-1.5">Enter your license (e.g. DL-99887766) or assigned Driver ID.</p>
                            </div>

                            <button type="submit" class="w-full py-3 bg-primary hover:bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all">
                                <span class="material-symbols-outlined" style="font-size:18px">login</span>
                                Authenticate & Enter
                            </button>

                            <div class="pt-2 text-center">
                                <button type="button" onclick="setLoginMode('select')" class="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto">
                                    <span class="material-symbols-outlined" style="font-size:14px">arrow_back</span>
                                    Switch to Role Selection
                                </button>
                            </div>
                        </form>
                    `}

                    <div class="mt-8 text-center pt-6 border-t border-white/5">
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <span class="material-symbols-outlined" style="font-size:14px">lock</span>
                            Backend Verified Access
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.setLoginMode = function (mode) {
    state.loginMode = mode;
    state.loginError = null;
    render();
};

window.handleDriverLoginForm = async function (e) {
    e.preventDefault();
    const identifier = document.getElementById('driver_identifier').value;
    state.loginError = null;
    try {
        const user = await driverLogin(identifier);
        state.currentUser = user;
        saveState();
        state.currentRoute = 'driver_dashboard';
        render();
        loadTripsFromBackend();
        loadDriversFromBackend();
    } catch (error) {
        state.loginError = error.message || 'Invalid driver credentials.';
        render();
    }
};

window.loginAs = function (role, id = 'OWNER', name = 'Admin Owner') {
    state.currentUser = { role, id, name };
    saveState();
    state.currentRoute = role === 'owner' ? 'dashboard' : 'driver_dashboard';
    render();
}
"""

content = content[:old_login_start] + new_login_block + content[old_login_end:]

# 2. Update renderDriverDashboard to include driver availability badge and self-toggle
old_dd_start = content.find('function renderDriverDashboard() {')
old_dd_end = content.find('function renderDrivers() {')

new_dd_block = r"""function renderDriverDashboard() {
    const currentDriver = state.drivers.find(d => d.id === state.currentUser.id || d.name === state.currentUser.name);
    const driverAvailability = currentDriver ? currentDriver.availability : (state.currentUser.availability || 'Available');
    const myTrips = state.trips.filter(t => t.driverName === state.currentUser.name || t.driverId === state.currentUser.id);

    return `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
            
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Driver Portal</h1>
                    <p class="text-sm text-slate-400 mt-1">Manage your assigned trips and update your availability</p>
                </div>
                <div class="flex items-center gap-3 flex-wrap">
                    <div class="flex items-center gap-2 bg-[#0F172A] border border-white/10 px-3 py-2 rounded-xl">
                        ${renderBadge(driverAvailability)}
                        <button onclick="toggleOwnDriverAvailability('${currentDriver ? currentDriver.id : state.currentUser.id}', '${driverAvailability}')" class="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/10 transition-all flex items-center gap-1">
                            <span class="material-symbols-outlined" style="font-size:14px">sync_alt</span>
                            Change
                        </button>
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

window.toggleOwnDriverAvailability = async function (id, currentStatus) {
    const newStatus = currentStatus === 'Available' ? 'Not Available' : 'Available';
    try {
        await apiPut('/drivers/' + id + '/availability', { available: newStatus === 'Available' });
        if (state.currentUser && (state.currentUser.id === id || state.currentUser.role === 'driver')) {
            state.currentUser.availability = newStatus;
            saveState();
        }
        await loadDriversFromBackend();
        render();
    } catch (e) {
        alert('Failed to update availability: ' + e.message);
    }
};
"""

content = content[:old_dd_start] + new_dd_block + content[old_dd_end:]

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('SUCCESS: Updated renderLogin, login handlers, and renderDriverDashboard in app.js')

