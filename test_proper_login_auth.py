import requests
import json
import sys

BASE_URL = "http://localhost:8080/api"

def run_tests():
    print("========================================")
    print("TripFlow Authentication & Security Tests")
    print("========================================")

    # 1. Test Owner Login - Success
    print("\n1. Testing Owner Login (owner / owner123)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "owner", "password": "owner123"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    owner_data = res.json()
    assert "token" in owner_data, "Owner login did not return a token"
    assert owner_data.get("role") == "OWNER", f"Expected role OWNER, got {owner_data.get('role')}"
    owner_token = owner_data["token"]
    print("PASS: Owner login succeeded with JWT and role OWNER")

    # 2. Test Owner Login - Invalid Password
    print("\n2. Testing Owner Login with Wrong Password (owner / wrongpass)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "owner", "password": "wrongpass"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("PASS: Rejected invalid owner password with 401")

    # 3. Test Driver Login - Success by ID
    print("\n3. Testing Driver Login by ID (DRV-01 / driver123)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "DRV-01", "password": "driver123"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    driver_data = res.json()
    assert "token" in driver_data, "Driver login did not return a token"
    assert driver_data.get("role") == "DRIVER", f"Expected role DRIVER, got {driver_data.get('role')}"
    driver_token = driver_data["token"]
    print("PASS: Driver login succeeded with JWT and role DRIVER")

    # 4. Test Driver Login - Success by License
    print("\n4. Testing Driver Login by License (DL-99887766 / driver123)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "DL-99887766", "password": "driver123"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("PASS: Driver login by license succeeded")

    # 5. Test Driver Login - Invalid Password
    print("\n5. Testing Driver Login with Wrong Password (DRV-01 / wrongpass)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "DRV-01", "password": "wrongpass"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("PASS: Rejected invalid driver password with 401")

    # 6. Test Non-existent User Login
    print("\n6. Testing Unknown User Login (unknown_user / somepass)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "unknown_user", "password": "somepass"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("PASS: Rejected unknown user with 401")

    # 7. Test Missing Fields (Bad Request)
    print("\n7. Testing Missing Password (owner / '')...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "owner", "password": ""})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 400, f"Expected 400, got {res.status_code}"
    print("PASS: Returned 400 for empty password")

    # 8. Test Owner creating new driver with custom password
    print("\n8. Testing Owner creating new driver with custom password...")
    custom_driver = {
        "id": "DRV-999",
        "name": "Test Driver 999",
        "phone": "+1 (555) 999-0000",
        "license": "DL-999999",
        "password": "customSecretPassword123",
        "availability": "Available",
        "completedTrips": 0
    }
    headers_owner = {"Authorization": f"Bearer {owner_token}"}
    res = requests.post(f"{BASE_URL}/drivers", json=custom_driver, headers=headers_owner)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code in (200, 201), f"Expected 200/201, got {res.status_code}"
    created_driver = res.json()
    assert "password" not in created_driver or created_driver["password"] is None, "Password should not be exposed in JSON response!"
    print("PASS: Driver created securely; password write-only verification passed")

    # 9. Test Logging in as newly created driver with custom password
    print("\n9. Testing Login as new Driver with custom password...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"loginId": "DRV-999", "password": "customSecretPassword123"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    new_driver_token = res.json()["token"]
    print("PASS: New driver logged in with custom password")

    # 10. Test Driver updating own availability vs other driver availability
    print("\n10. Testing Driver self availability update vs modifying other driver...")
    headers_driver999 = {"Authorization": f"Bearer {new_driver_token}"}
    # Update own availability
    res = requests.put(f"{BASE_URL}/drivers/DRV-999/availability", json={"available": False}, headers=headers_driver999)
    print(f"Self update status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("PASS: Driver updated own availability")

    # Driver trying to update another driver's availability (should be 403)
    res = requests.put(f"{BASE_URL}/drivers/DRV-01/availability", json={"available": False}, headers=headers_driver999)
    print(f"Forbidden update status: {res.status_code}")
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print("PASS: Driver blocked from modifying other driver (403)")

    # Clean up test driver
    print("\n11. Cleaning up test driver...")
    res = requests.delete(f"{BASE_URL}/drivers/DRV-999", headers=headers_owner)
    print(f"Cleanup status: {res.status_code}")
    assert res.status_code in (200, 204), f"Expected 200/204, got {res.status_code}"
    print("PASS: Test driver cleaned up")

    print("\n========================================")
    print("ALL 11 AUTHENTICATION & ROLE TESTS PASSED!")
    print("========================================")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\nTEST SUITE FAILED: {e}")
        sys.exit(1)
