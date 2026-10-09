import urllib.request
import urllib.error
import json

def test_login(identifier, expected_code):
    req = urllib.request.Request(
        'http://localhost:8080/api/auth/driver-login',
        data=json.dumps({'identifier': identifier}).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f'Login with "{identifier}" -> Code {resp.status}, Body: {data}')
            assert resp.status == expected_code
    except urllib.error.HTTPError as e:
        data = json.loads(e.read().decode())
        print(f'Login with "{identifier}" -> Expected error HTTP {e.code}, Body: {data}')
        assert e.code == expected_code

print('=== TESTING POST /api/auth/driver-login ===')
test_login('DL-99887766', 200) # By license
test_login('DRV-02', 200)      # By ID
test_login('DL-INVALID', 401)  # Invalid
test_login('', 400)            # Empty
print('ALL BACKEND AUTH TESTS PASSED!')

