content = open('frontend/app.js', 'r', encoding='utf-8').read()

start_marker = 'function renderVehicles() {'
end_marker = 'function renderCustomers() {'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1:
    print('ERROR: renderVehicles() not found')
    exit(1)
if end_idx == -1:
    print('ERROR: renderCustomers() not found')
    exit(1)

old_block = content[start_idx:end_idx]
print('Found old renderVehicles block: ' + str(len(old_block)) + ' chars')
print('--- First 120 chars ---')
print(repr(old_block[:120]))

new_block = r"""function renderVehicles() {
    const isAdminUser = state.currentUser && state.currentUser.role === 'owner';
    return `
        <div class="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Fleet Vehicles</h1>
                    <p class="text-sm text-slate-400 mt-1">Monitor transport inventory and deployment status</p>
                </div>
                ${isAdminUser ? `<button onclick="navigate('create_vehicle')" class="bg-primary hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Vehicle</button>` : ''}
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

                            <!-- Admin Actions -->
                            ${isAdminUser ? `
                                <div class="flex gap-2 w-full mt-4 pt-4 border-t border-white/5 relative z-10">
                                    <button onclick="toggleVehicleAvailability('${v.id}', '${v.availability}')" class="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2 rounded-lg transition-all">Toggle Status</button>
                                    <button onclick="deleteVehicleAdmin('${v.id}')" class="flex-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold py-2 rounded-lg transition-all">Delete</button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

"""

new_content = content[:start_idx] + new_block + content[end_idx:]

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('SUCCESS: renderVehicles() replaced.')
print('File size before: ' + str(len(content)) + ' chars, after: ' + str(len(new_content)) + ' chars')

