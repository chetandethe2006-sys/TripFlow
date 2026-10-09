import urllib.request
import urllib.error
import json

print('=== 1. TEST DRIVER AUTH BY LICENSE ===')
req = urllib.request.Request(
    'http://localhost:8080/api/auth/driver-login',
    data=json.dumps({'identifier': 'DL-99887766'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    print('Driver authenticated successfully:', data)
    assert resp.status == 200
    assert data['role'] == 'driver'
    assert data['id'] == 'DRV-01'
    assert data['name'] == 'Amit Sharma'
    assert data['license'] == 'DL-99887766'

print('=== 2. TEST DRIVER AUTH BY DRIVER ID ===')
req2 = urllib.request.Request(
    'http://localhost:8080/api/auth/driver-login',
    data=json.dumps({'identifier': 'DRV-02'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
with urllib.request.urlopen(req2) as resp2:
    data2 = json.loads(resp2.read().decode())
    print('Driver 2 authenticated successfully:', data2)
    assert resp2.status == 200
    assert data2['role'] == 'driver'
    assert data2['id'] == 'DRV-02'
    assert data2['name'] == 'Rajesh Kumar'

print('=== 3. TEST INVALID DRIVER AUTH ===')
req3 = urllib.request.Request(
    'http://localhost:8080/api/auth/driver-login',
    data=json.dumps({'identifier': 'FAKE-LICENSE-999'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    with urllib.request.urlopen(req3) as resp3:
        assert False, 'Should have failed with 401'
except urllib.error.HTTPError as err:
    err_data = json.loads(err.read().decode())
    print(f'Expected 401 rejection: HTTP {err.code} -> {err_data}')
    assert err.code == 401
    assert 'Invalid credentials' in err_data['error']

print('=== 4. TEST DRIVER SELF-AVAILABILITY TOGGLE ===')
req4 = urllib.request.Request(
    'http://localhost:8080/api/drivers/DRV-01/availability',
    data=json.dumps({'available': True}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='PUT'
)
with urllib.request.urlopen(req4) as resp4:
    d4 = json.loads(resp4.read().decode())
    print('Driver availability updated to Available:', d4['availability'])
    assert d4['availability'] == 'Available'

print('\n>>> ALL STEP 5 INTEGRATION TESTS PASSED!')

