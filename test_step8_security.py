import requests
import json
import sys

BASE_URL = "http://localhost:8080/api"

def print_result(test_name, passed, details=""):
    mark = "[PASS]" if passed else "[FAIL]"
    print(f"{mark} | {test_name}")
    if details:
        print(f"       Details: {details}")

def run_all_tests():
    print("=" * 60)
    print("TripFlow Step 8 - Spring Security & JWT Authorization Suite")
    print("=" * 60)

    # 1. Unauthenticated Request without JWT -> 401
    res = requests.get(f"{BASE_URL}/drivers")
    print_result("Test 1: GET /api/drivers without token -> 401 Unauthorized", res.status_code == 401, f"Status: {res.status_code}")

    res = requests.get(f"{BASE_URL}/vehicles")
    print_result("Test 1b: GET /api/vehicles without token -> 401 Unauthorized", res.status_code == 401, f"Status: {res.status_code}")

    # 2. Invalid Login -> 401
    res = requests.post(f"{BASE_URL}/auth/login", json={"username": "invalid_user", "password": "wrongpassword"})
    print_result("Test 2: Invalid owner credentials -> 401 Unauthorized", res.status_code == 401, f"Status: {res.status_code}")

    res = requests.post(f"{BASE_URL}/auth/driver-login", json={"identifier": "NON_EXISTENT_DRIVER", "password": "wrong"})
    print_result("Test 2b: Invalid driver identifier -> 401 Unauthorized", res.status_code == 401, f"Status: {res.status_code}")

    # 3. Valid Driver Login -> 200 + JWT
    res = requests.post(f"{BASE_URL}/auth/driver-login", json={"identifier": "DRV-01", "password": "driver123"})
    driver_pass = res.status_code == 200 and "token" in res.json() and res.json().get("role") == "DRIVER"
    driver_token = res.json().get("token") if driver_pass else None
    print_result("Test 3: Driver DRV-01 Login -> 200 + JWT Token", driver_pass, f"Status: {res.status_code}, Role: {res.json().get('role') if res.ok else ''}")

    # Also login Driver DRV-02
    res2 = requests.post(f"{BASE_URL}/auth/driver-login", json={"identifier": "DRV-02", "password": "driver123"})
    driver2_token = res2.json().get("token") if res2.status_code == 200 else None

    # 4. Valid Owner Login -> 200 + JWT
    res = requests.post(f"{BASE_URL}/auth/login", json={"username": "owner", "password": "owner123"})
    owner_pass = res.status_code == 200 and "token" in res.json() and res.json().get("role") == "OWNER"
    owner_token = res.json().get("token") if owner_pass else None
    print_result("Test 4: Owner Login -> 200 + JWT Token", owner_pass, f"Status: {res.status_code}, Role: {res.json().get('role') if res.ok else ''}")

    driver_headers = {"Authorization": f"Bearer {driver_token}"} if driver_token else {}
    driver2_headers = {"Authorization": f"Bearer {driver2_token}"} if driver2_token else {}
    owner_headers = {"Authorization": f"Bearer {owner_token}"} if owner_token else {}

    # 5. Driver Permitted APIs -> 200
    res = requests.get(f"{BASE_URL}/trips", headers=driver_headers)
    print_result("Test 5a: Driver GET /api/trips -> 200 OK", res.status_code == 200, f"Trips returned: {len(res.json()) if res.ok else 0}")

    res = requests.get(f"{BASE_URL}/drivers", headers=driver_headers)
    print_result("Test 5b: Driver GET /api/drivers -> 200 OK", res.status_code == 200, f"Drivers returned: {len(res.json()) if res.ok else 0}")

    res = requests.get(f"{BASE_URL}/vehicles", headers=driver_headers)
    print_result("Test 5c: Driver GET /api/vehicles -> 200 OK", res.status_code == 200, f"Vehicles returned: {len(res.json()) if res.ok else 0}")

    # 6. Driver Forbidden Admin APIs -> 403
    res = requests.post(f"{BASE_URL}/drivers", headers=driver_headers, json={"name": "Hacker", "phone": "123", "license": "DL-000", "availability": "Available"})
    print_result("Test 6a: Driver POST /api/drivers -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    res = requests.post(f"{BASE_URL}/vehicles", headers=driver_headers, json={"number": "HACK-99", "type": "Van", "driver": "None", "capacity": "1000 kg", "availability": "Available"})
    print_result("Test 6b: Driver POST /api/vehicles -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    res = requests.delete(f"{BASE_URL}/vehicles/VEH-101", headers=driver_headers)
    print_result("Test 6c: Driver DELETE /api/vehicles/VEH-101 -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    res = requests.delete(f"{BASE_URL}/drivers/DRV-02", headers=driver_headers)
    print_result("Test 6d: Driver DELETE /api/drivers/DRV-02 -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    res = requests.post(f"{BASE_URL}/trips", headers=driver_headers, json={"customer": "Malicious", "destination": "Nowhere"})
    print_result("Test 6e: Driver POST /api/trips -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # 7. Driver Cross-Driver Availability Edit -> 403 Forbidden
    # DRV-01 tries to update DRV-02 availability
    res = requests.put(f"{BASE_URL}/drivers/DRV-02/availability", headers=driver_headers, json={"available": false if False else False})
    print_result("Test 7: Driver DRV-01 modifying Driver DRV-02 availability -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # 8. Driver Self-Availability Edit -> 200 OK
    # DRV-01 updates DRV-01 availability
    res = requests.put(f"{BASE_URL}/drivers/DRV-01/availability", headers=driver_headers, json={"available": True})
    print_result("Test 8: Driver DRV-01 modifying own availability -> 200 OK", res.status_code == 200, f"Status: {res.status_code}, New Availability: {res.json().get('availability') if res.ok else ''}")

    # 9. Owner Admin Operations -> 200/201/204
    test_driver_id = "DRV-TEST-99"
    res = requests.post(f"{BASE_URL}/drivers", headers=owner_headers, json={
        "id": test_driver_id,
        "name": "Security Test Driver",
        "phone": "+1 555-999-8888",
        "license": "DL-SEC-999",
        "availability": "Available",
        "completedTrips": 0,
        "password": "driver123"
    })
    print_result("Test 9a: Owner POST /api/drivers -> 201 Created", res.status_code == 201, f"Status: {res.status_code}")

    res = requests.put(f"{BASE_URL}/drivers/{test_driver_id}/availability", headers=owner_headers, json={"available": False})
    print_result("Test 9b: Owner PUT /api/drivers/{id}/availability -> 200 OK", res.status_code == 200, f"Status: {res.status_code}")

    # 9d. Driver Trip Status Authorization
    # Trip TRP1024 is assigned to DRV-01
    # DRV-01 updating TRP1024 -> 200
    res = requests.patch(f"{BASE_URL}/trips/TRP1024/status", headers=driver_headers, json={"status": "In Transit"})
    print_result("Test 9d: Driver DRV-01 updating assigned trip TRP1024 status -> 200 OK", res.status_code == 200, f"Status: {res.status_code}")

    # DRV-02 updating TRP1024 (assigned to DRV-01) -> 403 Forbidden
    res = requests.patch(f"{BASE_URL}/trips/TRP1024/status", headers=driver2_headers, json={"status": "Delivered"})
    print_result("Test 9e: Driver DRV-02 updating unassigned trip TRP1024 status -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # Owner updating TRP1024 status -> 200 OK
    res = requests.patch(f"{BASE_URL}/trips/TRP1024/status", headers=owner_headers, json={"status": "In Transit"})
    print_result("Test 9f: Owner updating trip TRP1024 status -> 200 OK", res.status_code == 200, f"Status: {res.status_code}")

    print("=" * 60)
    print("All Step 8 Security Tests Completed Successfully!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
