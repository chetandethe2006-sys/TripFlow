import urllib.request
import urllib.error
import json

BASE_URL = 'http://localhost:8080/api'

def send_req(endpoint, method='GET', data=None):
    url = f"{BASE_URL}{endpoint}"
    req_data = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=req_data, method=method)
    if req_data:
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
            return resp.status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return e.code, json.loads(body) if body else None
    except Exception as ex:
        return 0, str(ex)

print('=== AUDIT OF BACKEND ENDPOINT SECURITY ===\n')

endpoints = [
    ('POST', '/drivers', {'id':'DRV-TEST','name':'Audit Driver','phone':'111','license':'AUDIT123','availability':'Available','completedTrips':0}, 'Admin-Only: Create Driver'),
    ('DELETE', '/drivers/DRV-TEST', None, 'Admin-Only: Delete Driver'),
    ('POST', '/vehicles', {'id':'VEH-TEST','number':'TEST-99','type':'Van','capacity':'1000kg','driver':'Unassigned','availability':'Available'}, 'Admin-Only: Create Vehicle'),
    ('DELETE', '/vehicles/VEH-TEST', None, 'Admin-Only: Delete Vehicle'),
    ('PUT', '/drivers/DRV-02/availability', {'available': True}, 'Driver-Restricted: Change Another Driver Availability (e.g. from DRV-01)'),
    ('PUT', '/drivers/DRV-01/availability', {'available': True}, 'Driver-Permitted: Change Own Availability'),
    ('GET', '/trips', None, 'Shared: View Trips'),
    ('POST', '/trips', {'id':'TRP-TEST','customer':'Test Cust','goods':'Test','status':'Created'}, 'Admin-Only: Create Trip'),
    ('DELETE', '/trips/TRP-TEST', None, 'Admin-Only: Delete Trip'),
    ('POST', '/customers', {'id':'CUS-TEST','name':'Test','phone':'111','email':'t@t.com','status':'Active','totalTrips':0}, 'Admin-Only: Create Customer'),
    ('DELETE', '/customers/CUS-TEST', None, 'Admin-Only: Delete Customer'),
]

for method, path, payload, description in endpoints:
    status, body = send_req(path, method, payload)
    is_open = status in (200, 201, 204)
    print(f"[{'UNPROTECTED' if is_open else 'REJECTED'}] {description}")
    print(f"   -> HTTP {method} {path} => Response {status}\n")

print('Audit scan complete.')

