import re

with open('frontend/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the exact start and end of renderDrivers()
start_marker = 'function renderDrivers() {'
end_marker = 'function renderVehicles() {'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1:
    print('ERROR: renderDrivers() not found')
    exit(1)
if end_idx == -1:
    print('ERROR: renderVehicles() not found')
    exit(1)

# The old block is everything from renderDrivers up to (not including) renderVehicles
old_block = content[start_idx:end_idx]
print(f'Found old block: {len(old_block)} chars')
print('--- OLD BLOCK FIRST 300 chars ---')
print(repr(old_block[:300]))

new_block = r"""function renderDrivers() {
    const isAdminUser = state.currentUser && state.currentUser.role === 'owner';
    return `
        <div class="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Fleet Drivers</h1>
                    <p class="text-sm text-slate-400 mt-1">Manage your driver roster and current availability</p>
                </div>
                ${isAdminUser ? `<button onclick="navigate('create_driver')" class="bg-primary hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Driver</button>` : ''}
            </div>

            ${state.drivers.length === 0 ? `
                <div class="bg-[#0F172A] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center shadow-xl">
                    <span class="material-symbols-outlined text-slate-600 text-6xl mb-4">group_off</span>
                    <h3 class="text-xl font-bold text-white mb-2">No Drivers Found</h3>
                    <p class="text-slate-400 text-sm">No drivers are registered yet.</p>
                </div>
            ` : `
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
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <span class="material-symbols-outlined text-slate-600" style="font-size:14px">call</span>
                                        Phone
                                    </span>
                                    <span class="text-sm font-semibold text-white">${d.phone}</span>
                                </div>
                                ${isAdminUser ? `
                                    <div class="flex gap-2 w-full mt-3">
                                        <button onclick="toggleDriverAvailability('${d.id}', '${d.availability}')" class="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2 rounded-lg transition-all">Toggle Status</button>
                                        <button onclick="deleteDriverAdmin('${d.id}')" class="flex-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold py-2 rounded-lg transition-all">Delete</button>
                                    </div>
                                ` : ''}
                            </div>
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

print('SUCCESS: renderDrivers() has been replaced.')
print(f'File size before: {len(content)} chars, after: {len(new_content)} chars')

