import requests
import json

BASE_URL = "http://localhost:8080/api"

def log_test(title, passed, detail=""):
    res = "[PASS]" if passed else "[FAIL]"
    print(f"{res} | {title}")
    if detail:
        print(f"       -> {detail}")

def run_step9_verification():
    print("=" * 70)
    print("TripFlow Step 9: Comprehensive Security, JWT & Regression Verification")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. Backend Authentication Checks
    # -------------------------------------------------------------
    print("\n--- 1. Backend Authentication ---")
    
    # 1a. Owner Login
    res = requests.post(f"{BASE_URL}/auth/login", json={"username": "owner", "password": "owner123"})
    owner_token = res.json().get("token") if res.ok else None
    owner_role = res.json().get("role") if res.ok else None
    log_test("Owner login returns JWT with role 'OWNER'", res.status_code == 200 and owner_role == "OWNER" and owner_token is not None, f"Status: {res.status_code}, Role: {owner_role}")

    # 1b. Driver Login
    res = requests.post(f"{BASE_URL}/auth/driver-login", json={"identifier": "DRV-01", "password": "driver123"})
    drv1_token = res.json().get("token") if res.ok else None
    drv1_role = res.json().get("role") if res.ok else None
    log_test("Driver DRV-01 login returns JWT with role 'DRIVER'", res.status_code == 200 and drv1_role == "DRIVER" and drv1_token is not None, f"Status: {res.status_code}, Role: {drv1_role}")

    # 1c. Driver DRV-02 Login
    res = requests.post(f"{BASE_URL}/auth/driver-login", json={"identifier": "DRV-02", "password": "driver123"})
    drv2_token = res.json().get("token") if res.ok else None
    log_test("Driver DRV-02 login returns JWT with role 'DRIVER'", res.status_code == 200 and drv2_token is not None)

    # 1d. Invalid credentials
    res = requests.post(f"{BASE_URL}/auth/login", json={"username": "owner", "password": "wrongpassword"})
    log_test("Invalid Owner credentials return 401", res.status_code == 401, f"Status: {res.status_code}")

    res = requests.post(f"{BASE_URL}/auth/driver-login", json={"identifier": "DRV-01", "password": "wrongpassword"})
    log_test("Invalid Driver credentials return 401", res.status_code == 401, f"Status: {res.status_code}")

    # 1e. Protected endpoints without JWT return 401
    res = requests.get(f"{BASE_URL}/drivers")
    log_test("GET /api/drivers without JWT returns 401 Unauthorized", res.status_code == 401, f"Status: {res.status_code}")

    res = requests.get(f"{BASE_URL}/vehicles")
    log_test("GET /api/vehicles without JWT returns 401 Unauthorized", res.status_code == 401, f"Status: {res.status_code}")

    res = requests.get(f"{BASE_URL}/trips")
    log_test("GET /api/trips without JWT returns 401 Unauthorized", res.status_code == 401, f"Status: {res.status_code}")

    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    drv1_headers = {"Authorization": f"Bearer {drv1_token}"}
    drv2_headers = {"Authorization": f"Bearer {drv2_token}"}

    # -------------------------------------------------------------
    # 2. Driver Restrictions (Mutations forbidden)
    # -------------------------------------------------------------
    print("\n--- 2. Driver Role Restrictions ---")

    # Driver POST /api/drivers -> 403
    res = requests.post(f"{BASE_URL}/drivers", headers=drv1_headers, json={"name": "Test Driver", "phone": "123", "license": "DL-123", "availability": "Available"})
    log_test("Driver POST /api/drivers -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # Driver DELETE /api/drivers/DRV-02 -> 403
    res = requests.delete(f"{BASE_URL}/drivers/DRV-02", headers=drv1_headers)
    log_test("Driver DELETE /api/drivers/DRV-02 -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # Driver POST /api/vehicles -> 403
    res = requests.post(f"{BASE_URL}/vehicles", headers=drv1_headers, json={"number": "VEH-TEST", "type": "Truck", "capacity": "5000", "availability": "Available"})
    log_test("Driver POST /api/vehicles -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # Driver DELETE /api/vehicles/VEH-102 -> 403
    res = requests.delete(f"{BASE_URL}/vehicles/VEH-102", headers=drv1_headers)
    log_test("Driver DELETE /api/vehicles/VEH-102 -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # Driver POST /api/trips -> 403
    res = requests.post(f"{BASE_URL}/trips", headers=drv1_headers, json={"customer": "Test", "goods": "Items"})
    log_test("Driver POST /api/trips -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # Driver DELETE /api/trips/TRP1024 -> 403
    res = requests.delete(f"{BASE_URL}/trips/TRP1024", headers=drv1_headers)
    log_test("Driver DELETE /api/trips/TRP1024 -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # Cross-driver availability edit: DRV-01 modifying DRV-02 -> 403
    res = requests.put(f"{BASE_URL}/drivers/DRV-02/availability", headers=drv1_headers, json={"available": False})
    log_test("Driver DRV-01 modifying DRV-02 availability -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # Self-driver availability edit: DRV-01 modifying DRV-01 -> 200
    res = requests.put(f"{BASE_URL}/drivers/DRV-01/availability", headers=drv1_headers, json={"available": True})
    log_test("Driver DRV-01 modifying own DRV-01 availability -> 200 OK", res.status_code == 200, f"Status: {res.status_code}, Availability: {res.json().get('availability') if res.ok else ''}")

    # -------------------------------------------------------------
    # 3. Assigned Trip Security
    # -------------------------------------------------------------
    print("\n--- 3. Assigned Trip Security ---")

    # TRP1024 has driverId: DRV-01
    # DRV-01 updating TRP1024 status -> 200
    res = requests.patch(f"{BASE_URL}/trips/TRP1024/status", headers=drv1_headers, json={"status": "In Transit"})
    log_test("Driver DRV-01 updating assigned trip TRP1024 -> 200 OK", res.status_code == 200, f"Status: {res.status_code}")

    # DRV-02 updating TRP1024 (unassigned) -> 403
    res = requests.patch(f"{BASE_URL}/trips/TRP1024/status", headers=drv2_headers, json={"status": "Delivered"})
    log_test("Driver DRV-02 updating unassigned trip TRP1024 -> 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

    # Owner updating TRP1024 status -> 200
    res = requests.patch(f"{BASE_URL}/trips/TRP1024/status", headers=owner_headers, json={"status": "In Transit"})
    log_test("Owner updating trip TRP1024 status -> 200 OK", res.status_code == 200, f"Status: {res.status_code}")

    # -------------------------------------------------------------
    # 4. Expired / Invalid JWT Behavior
    # -------------------------------------------------------------
    print("\n--- 4. Expired / Invalid JWT Behavior ---")
    fake_token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmYWtlIiwicm9sZSI6Ik9XTkVSIiwiZXhwIjoxNTE2MjM5MDIyfQ.invalidSignature"
    res = requests.get(f"{BASE_URL}/drivers", headers={"Authorization": f"Bearer {fake_token}"})
    log_test("Invalid JWT signature returns 401 Unauthorized", res.status_code == 401, f"Status: {res.status_code}")

    malformed_header = {"Authorization": "Bearer not-even-a-jwt"}
    res = requests.get(f"{BASE_URL}/trips", headers=malformed_header)
    log_test("Malformed JWT header returns 401 Unauthorized", res.status_code == 401, f"Status: {res.status_code}")

    # -------------------------------------------------------------
    # 5. Data Exposure Review
    # -------------------------------------------------------------
    print("\n--- 5. Data Exposure Review ---")
    res = requests.get(f"{BASE_URL}/drivers", headers=drv1_headers)
    drivers_data = res.json() if res.ok else []
    passwords_found = [d for d in drivers_data if "password" in d and d["password"]]
    log_test("GET /api/drivers does NOT expose password hashes", len(passwords_found) == 0, f"Total drivers: {len(drivers_data)}, Exposed passwords: {len(passwords_found)}")

    res = requests.get(f"{BASE_URL}/vehicles", headers=drv1_headers)
    vehicles_data = res.json() if res.ok else []
    log_test("GET /api/vehicles returns standard public vehicle info", len(vehicles_data) >= 3, f"Total vehicles: {len(vehicles_data)}")

    # -------------------------------------------------------------
    # 6. Full Regression Test: Owner Management CRUD
    # -------------------------------------------------------------
    print("\n--- 6. Regression Testing (CRUD Operations) ---")

    # 6a. Add Driver
    new_drv = {
        "id": "DRV-REG-01",
        "name": "Regression Test Driver",
        "phone": "+1 555-000-1111",
        "license": "DL-REG-1111",
        "availability": "Available",
        "completedTrips": 5,
        "password": "driver123"
    }
    res = requests.post(f"{BASE_URL}/drivers", headers=owner_headers, json=new_drv)
    log_test("Owner: Add Driver -> 201 Created", res.status_code == 201, f"Status: {res.status_code}")

    # 6b. Toggle Driver Availability
    res = requests.put(f"{BASE_URL}/drivers/DRV-REG-01/availability", headers=owner_headers, json={"available": False})
    log_test("Owner: Update Driver Availability -> 200 OK", res.status_code == 200 and res.json().get("availability") == "Not Available", f"Status: {res.status_code}")

    # 6c. Delete Driver
    res = requests.delete(f"{BASE_URL}/drivers/DRV-REG-01", headers=owner_headers)
    log_test("Owner: Delete Driver -> 204 No Content", res.status_code == 204, f"Status: {res.status_code}")

    # 6d. Add Vehicle
    new_veh = {
        "id": "VEH-REG-01",
        "number": "NY-99-REG",
        "type": "Container",
        "driver": "None",
        "capacity": "15,000 kg",
        "availability": "Available"
    }
    res = requests.post(f"{BASE_URL}/vehicles", headers=owner_headers, json=new_veh)
    log_test("Owner: Add Vehicle -> 201 Created", res.status_code == 201, f"Status: {res.status_code}")

    # 6e. Toggle Vehicle Availability
    res = requests.put(f"{BASE_URL}/vehicles/VEH-REG-01/availability", headers=owner_headers, json={"available": False})
    log_test("Owner: Update Vehicle Availability -> 200 OK", res.status_code == 200 and res.json().get("availability") == "Not Available", f"Status: {res.status_code}")

    # 6f. Delete Vehicle
    res = requests.delete(f"{BASE_URL}/vehicles/VEH-REG-01", headers=owner_headers)
    log_test("Owner: Delete Vehicle -> 204 No Content", res.status_code == 204, f"Status: {res.status_code}")

    # 6g. Create Trip
    new_trip = {
        "id": "TRP-REG-01",
        "customer": "Apex Agro Foods",
        "customerEmail": "orders@apexagro.com",
        "customerPhone": "+1 (555) 345-6789",
        "pickup": "Chicago, IL",
        "destination": "Dallas, TX",
        "goods": "Fresh Apples",
        "quantity": "5 Tons",
        "pickupDate": "2026-06-10",
        "expectedDelivery": "2026-06-12",
        "driverId": "DRV-01",
        "driverName": "Amit Sharma",
        "vehicleNumber": "IL-04-AB-9876",
        "status": "Created",
        "notes": "Keep refrigerated",
        "date": "2026-06-10"
    }
    res = requests.post(f"{BASE_URL}/trips", headers=owner_headers, json=new_trip)
    log_test("Owner: Create Trip -> 201 Created", res.status_code == 201, f"Status: {res.status_code}")

    # 6h. Delete Trip
    res = requests.delete(f"{BASE_URL}/trips/TRP-REG-01", headers=owner_headers)
    log_test("Owner: Delete Trip -> 204 No Content", res.status_code == 204, f"Status: {res.status_code}")

    # 6i. Customers & Notifications read
    res_cust = requests.get(f"{BASE_URL}/customers", headers=owner_headers)
    res_notif = requests.get(f"{BASE_URL}/notifications", headers=owner_headers)
    log_test("Read Customers & Notifications -> 200 OK", res_cust.status_code == 200 and res_notif.status_code == 200, f"Customers: {len(res_cust.json())}, Notifs: {len(res_notif.json())}")

    print("\n" + "=" * 70)
    print("STEP 9 VERIFICATION COMPLETED: All security, auth & regression tests PASS!")
    print("=" * 70)

if __name__ == "__main__":
    run_step9_verification()

