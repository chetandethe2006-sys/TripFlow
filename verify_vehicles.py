content = open('frontend/app.js', 'r', encoding='utf-8').read()

# Isolate the renderVehicles block
v_start = content.find('function renderVehicles()')
v_end = content.find('function renderCustomers()')
block = content[v_start:v_end]

print('=== Step 2 Verification: renderVehicles() ===')
print()

results = []

# 1 - No filter: shows all vehicles
no_filter = ('.filter(v =>' not in block) and ('state.vehicles.map(v =>' in block)
results.append(('Shows ALL vehicles (no availability filter)', no_filter))

# 2 - Add Vehicle button exists and is conditional on isAdminUser
add_btn = 'create_vehicle' in block and 'isAdminUser' in block
results.append(('Add Vehicle button conditional on isAdminUser', add_btn))

# 3 - isAdminUser defined locally
role_var = 'const isAdminUser' in block
results.append(('isAdminUser role check defined locally', role_var))

# 4 - Toggle button passes real v.id and v.availability
toggle_ok = "toggleVehicleAvailability('" in block
results.append(('toggleVehicleAvailability called with template arg', toggle_ok))

# 5 - Delete button passes real v.id
delete_ok = "deleteVehicleAdmin('" in block
results.append(('deleteVehicleAdmin called with template arg', delete_ok))

# 6 - Empty state exists
empty_ok = 'vehicles.length === 0' in block
results.append(('Empty vehicles state handled', empty_ok))

# 7 - Availability badge shown per vehicle
badge_ok = 'renderBadge(v.availability)' in block
results.append(('renderBadge shows availability per vehicle', badge_ok))

# 8 - Vehicle fields displayed: number, type, capacity, driver
field_checks = [('v.number', 'Vehicle number shown'), ('v.type', 'Vehicle type shown'),
                ('v.capacity', 'Capacity shown'), ('v.driver', 'Driver shown')]
for field, label in field_checks:
    results.append((label, field in block))

# Now verify renderCreateVehicle has all 3 fields the handler needs
cv_start = content.find('function renderCreateVehicle()')
cv_end = content.find('};', content.find('function renderCreateVehicle()')) + 2
cv_block = content[cv_start:cv_end + 500]

fields = [('veh_number', 'renderCreateVehicle has veh_number input'),
          ('veh_type', 'renderCreateVehicle has veh_type input'),
          ('veh_capacity', 'renderCreateVehicle has veh_capacity input')]
for field_id, label in fields:
    results.append((label, field_id in cv_block))

# Verify handleCreateVehicle reads these fields
hcv = 'getElementById(\'veh_number\')' in content and \
      'getElementById(\'veh_type\')' in content and \
      'getElementById(\'veh_capacity\')' in content
results.append(('handleCreateVehicle reads all 3 form fields', hcv))

# Verify driver renderDrivers was NOT broken by this patch
rd_start = content.find('function renderDrivers()')
rd_end = content.find('function renderVehicles()')
rd_block = content[rd_start:rd_end]
driver_intact = ('state.drivers.map(d =>' in rd_block) and ('const isAdminUser' in rd_block)
results.append(('renderDrivers() is still intact after this patch', driver_intact))

all_pass = True
for label, passed in results:
    tag = 'PASS' if passed else 'FAIL'
    if not passed:
        all_pass = False
    print('  [' + tag + '] ' + label)

print()
if all_pass:
    print('All checks passed!')
else:
    print('SOME CHECKS FAILED - review above')

