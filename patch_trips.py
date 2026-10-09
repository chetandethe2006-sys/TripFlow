import re
with open('frontend/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("state.drivers.map", "state.drivers.filter(d => d.availability === 'Available' || d.availability === '🟢 Available').map")
content = content.replace("state.vehicles.map", "state.vehicles.filter(v => v.availability === 'Available' || v.availability === '🟢 Available').map")

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
