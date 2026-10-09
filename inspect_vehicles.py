import re

content = open('frontend/app.js', 'r', encoding='utf-8').read()

# Find handleCreateVehicle
m = re.search(r'window\.handleCreateVehicle\s*=.*?(?=\nwindow\.|\nfunction |\Z)', content, re.DOTALL)
if m:
    print('=== handleCreateVehicle ===')
    print(m.group(0)[:1500])
else:
    print('handleCreateVehicle NOT FOUND')

print()

# Check for the key vehicle functions
fns = ['deleteVehicleAdmin', 'toggleVehicleAvailability', 'loadVehiclesFromBackend', 'handleCreateVehicle']
for fn in fns:
    found = fn in content
    status = 'EXISTS' if found else 'MISSING'
    print(fn + ': ' + status)

