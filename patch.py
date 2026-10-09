import re

with open('frontend/app.js', 'r') as f:
    content = f.read()

# Replace drivers Add Button
content = content.replace(
    '''<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Fleet Drivers</h1>
                    <p class="text-sm text-slate-400 mt-1">Manage your driver roster and current availability</p>
                </div>
            </div>''',
    '''<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Fleet Drivers</h1>
                    <p class="text-sm text-slate-400 mt-1">Manage your driver roster and current availability</p>
                </div>
                \ + (isOwner() ? \<button onclick="navigate('create_driver')" class="bg-primary hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Driver</button>\ : \\) + \
            </div>'''
)

# Replace driver Actions
content = content.replace(
    '''
                        </div>
                        
                        <div class="pt-4 border-t border-white/5 relative z-10">''',
    '''
                        </div>
                        \ + (isOwner() ? \<div class="flex gap-2 w-full mt-4 border-t border-white/5 pt-4">
                            <button onclick="toggleDriverAvailability('\', '\')" class="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2 rounded-lg transition-all">Toggle Status</button>
                            <button onclick="deleteDriverAdmin('\')" class="flex-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold py-2 rounded-lg transition-all">Delete</button>
                        </div>\ : \\) + \
                        <div class="pt-4 border-t border-white/5 relative z-10">'''
)

# Replace vehicles Add Button
content = content.replace(
    '''<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Fleet Vehicles</h1>
                    <p class="text-sm text-slate-400 mt-1">Manage your transport fleet and assignments</p>
                </div>
            </div>''',
    '''<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Fleet Vehicles</h1>
                    <p class="text-sm text-slate-400 mt-1">Manage your transport fleet and assignments</p>
                </div>
                \ + (isOwner() ? \<button onclick="navigate('create_vehicle')" class="bg-primary hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all"><span class="material-symbols-outlined" style="font-size:18px">add</span> Add Vehicle</button>\ : \\) + \
            </div>'''
)

# Replace vehicle Actions
content = content.replace(
    '''
                        </div>
                        
                        <div class="pt-4 border-t border-white/5 relative z-10">''',
    '''
                        </div>
                        \ + (isOwner() ? \<div class="flex gap-2 w-full mt-4 border-t border-white/5 pt-4">
                            <button onclick="toggleVehicleAvailability('\', '\')" class="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2 rounded-lg transition-all">Toggle Status</button>
                            <button onclick="deleteVehicleAdmin('\')" class="flex-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold py-2 rounded-lg transition-all">Delete</button>
                        </div>\ : \\) + \
                        <div class="pt-4 border-t border-white/5 relative z-10">'''
)

# Fix Driver Dashboard to add availability toggle
content = content.replace(
    '''<div class="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                        <span class="material-symbols-outlined" style="font-size:20px">verified_user</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white tracking-tight">Driver Profile</h3>
                        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Personal Information</p>
                    </div>
                </div>''',
    '''<div class="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                            <span class="material-symbols-outlined" style="font-size:20px">verified_user</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-white tracking-tight">Driver Profile</h3>
                            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Personal Information</p>
                        </div>
                    </div>
                    \ + (function() { 
                        const d = state.drivers.find(drv => drv.name === state.currentUser.name);
                        return d ? \<button onclick="toggleDriverAvailability('\', '\')" class="bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all">My Availability: \</button>\ : \\;
                    })() + \
                </div>'''
)

with open('frontend/app.js', 'w') as f:
    f.write(content)
