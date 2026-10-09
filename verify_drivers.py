content = open('frontend/app.js', 'r', encoding='utf-8').read()
start = content.find('function renderDrivers()')
end = content.find('function renderVehicles()')
block = content[start:end]

results = []

# Check 1: No .filter on drivers (shows ALL)
no_filter = ('.filter(d =>' not in block) and ('state.drivers.map(d =>' in block)
results.append(('Shows ALL drivers (no filter)', no_filter))

# Check 2: Add Driver button conditional on role
add_btn = 'create_driver' in block and 'isAdminUser' in block
results.append(('Add Driver button conditional on isAdminUser', add_btn))

# Check 3: Toggle uses template expression (d.id inside the onclick)
toggle_id = "toggleDriverAvailability('" in block
results.append(('toggleDriverAvailability has id param', toggle_id))

# Check 4: Delete uses template expression
del_id = "deleteDriverAdmin('" in block
results.append(('deleteDriverAdmin has id param', del_id))

# Check 5: empty state
empty = 'drivers.length === 0' in block
results.append(('Empty state handled', empty))

# Check 6: local role variable
role_var = 'const isAdminUser' in block
results.append(('isAdminUser defined locally', role_var))

all_pass = True
for label, passed in results:
    tag = 'PASS' if passed else 'FAIL'
    if not passed:
        all_pass = False
    print(f'  [{tag}] {label}')

print()
if all_pass:
    print('All checks passed!')
else:
    print('SOME CHECKS FAILED')

