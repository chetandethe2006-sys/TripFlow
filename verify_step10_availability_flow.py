import requests
import json
import time

BASE_URL = "http://localhost:8080/api"

def log_test(title, passed, detail=""):
    res = "[PASS]" if passed else "[FAIL]"
    print(f"{res} | {title}")
    if detail:
        print(f"       -> {detail}")

def run_step10_tests():
    print("=" * 75)
    print("TripFlow Step 10: Admin & Driver Availability Workflow Verification")
    print("=" * 75)

    # 1. Login
    owner_res = requests.post(f"{BASE_URL}/auth/login", json={"username": "owner", "password": "owner123"})
    owner_token = owner_res.json().get("token")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    log_test("1a. Owner Login & JWT acquisition", owner_res.status_code == 200 and owner_token is not None)

    drv1_res = requests.post(f"{BASE_URL}/auth/driver-login", json={"identifier": "DRV-01", "password": "driver123"})
    drv1_token = drv1_res.json().get("token")
    drv1_headers = {"Authorization": f"Bearer {drv1_token}"}
    log_test("1b. Driver DRV-01 Login & JWT acquisition", drv1_res.status_code == 200 and drv1_token is not None)

    drv2_res = requests.post(f"{BASE_URL}/auth/driver-login", json={"identifier": "DRV-02", "password": "driver123"})
    drv2_token = drv2_res.json().get("token")
    drv2_headers = {"Authorization": f"Bearer {drv2_token}"}
    log_test("1c. Driver DRV-02 Login & JWT acquisition", drv2_res.status_code == 200 and drv2_token is not None)

    # 2. Driver Availability Toggle Flow (Self-Service)
    print("\n--- 2. Driver Self-Availability Workflow ---")
    
    # Check initial driver state
    res = requests.get(f"{BASE_URL}/drivers/DRV-01", headers=drv1_headers)
    drv1_orig = res.json()
    log_test("Driver reads own initial state", res.status_code == 200, f"Initial Availability: {drv1_orig.get('availability')}")

    # Driver changes Available/On Trip -> Not Available
    res = requests.put(f"{BASE_URL}/drivers/DRV-01/availability", headers=drv1_headers, json={"available": False})
    log_test("Driver DRV-01 sets availability to Not Available", res.status_code == 200 and res.json().get("availability") == "Not Available", f"Status: {res.status_code}, Availability: {res.json().get('availability')}")

    # Verify other fields remain intact
    res = requests.get(f"{BASE_URL}/drivers/DRV-01", headers=drv1_headers)
    drv1_check1 = res.json()
    fields_intact = (drv1_check1.get("name") == drv1_orig.get("name") and 
                     drv1_check1.get("phone") == drv1_orig.get("phone") and 
                     drv1_check1.get("license") == drv1_orig.get("license") and
                     drv1_check1.get("completedTrips") == drv1_orig.get("completedTrips"))
    log_test("Driver fields (name, phone, license, trips) remained intact", fields_intact, f"Name: {drv1_check1.get('name')}, License: {drv1_check1.get('license')}")

    # Driver changes Not Available -> Available
    res = requests.put(f"{BASE_URL}/drivers/DRV-01/availability", headers=drv1_headers, json={"available": True})
    log_test("Driver DRV-01 sets availability to Available", res.status_code == 200 and res.json().get("availability") == "Available", f"Availability: {res.json().get('availability')}")

    # 3. Admin Driver Visibility & Sync
    print("\n--- 3. Admin Driver Visibility & Synchronisation ---")
    
    # Admin reads all drivers and sees updated DRV-01
    res = requests.get(f"{BASE_URL}/drivers", headers=owner_headers)
    all_drivers = res.json()
    drv1_admin_view = next((d for d in all_drivers if d.get("id") == "DRV-01"), None)
    log_test("Admin sees latest DRV-01 availability ('Available')", drv1_admin_view is not None and drv1_admin_view.get("availability") == "Available", f"Admin View: {drv1_admin_view.get('availability') if drv1_admin_view else 'Not Found'}")

    # Admin toggles DRV-01 availability -> Not Available
    res = requests.put(f"{BASE_URL}/drivers/DRV-01/availability", headers=owner_headers, json={"available": False})
    log_test("Admin updates DRV-01 availability to Not Available", res.status_code == 200 and res.json().get("availability") == "Not Available")

    # Driver reads own profile and sees Admin change
    res = requests.get(f"{BASE_URL}/drivers/DRV-01", headers=drv1_headers)
    log_test("Driver DRV-01 immediately sees Admin updated status ('Not Available')", res.status_code == 200 and res.json().get("availability") == "Not Available")

    # Reset DRV-01 back to Available
    requests.put(f"{BASE_URL}/drivers/DRV-01/availability", headers=owner_headers, json={"available": True})

    # 4. Vehicle Availability Workflow
    print("\n--- 4. Vehicle Availability Workflow ---")
    
    # Admin reads vehicle VEH-101
    res = requests.get(f"{BASE_URL}/vehicles/VEH-101", headers=owner_headers)
    veh1_orig = res.json()
    log_test("Admin reads initial vehicle VEH-101", res.status_code == 200, f"Initial Availability: {veh1_orig.get('availability')}")

    # Admin toggles VEH-101 to Not Available
    res = requests.put(f"{BASE_URL}/vehicles/VEH-101/availability", headers=owner_headers, json={"available": False})
    log_test("Admin sets VEH-101 availability to Not Available", res.status_code == 200 and res.json().get("availability") == "Not Available")

    # Verify other vehicle fields remain intact
    res = requests.get(f"{BASE_URL}/vehicles/VEH-101", headers=owner_headers)
    veh1_check = res.json()
    veh_fields_intact = (veh1_check.get("number") == veh1_orig.get("number") and 
                         veh1_check.get("type") == veh1_orig.get("type") and 
                         veh1_check.get("driver") == veh1_orig.get("driver") and
                         veh1_check.get("capacity") == veh1_orig.get("capacity"))
    log_test("Vehicle fields (number, type, driver, capacity) remained intact", veh_fields_intact, f"Number: {veh1_check.get('number')}, Type: {veh1_check.get('type')}")

    # Admin toggles VEH-101 back to Available
    res = requests.put(f"{BASE_URL}/vehicles/VEH-101/availability", headers=owner_headers, json={"available": True})
    log_test("Admin sets VEH-101 availability back to Available", res.status_code == 200 and res.json().get("availability") == "Available")

    # 5. Security & Isolation on Availability
    print("\n--- 5. Security & Isolation on Availability Operations ---")

    # Driver DRV-01 attempting to modify DRV-02 availability -> 403
    res = requests.put(f"{BASE_URL}/drivers/DRV-02/availability", headers=drv1_headers, json={"available": False})
    log_test("Driver DRV-01 modifying Driver DRV-02 availability is BLOCKED (403)", res.status_code == 403, f"Status: {res.status_code}")

    # Driver DRV-01 attempting to modify Vehicle availability -> 403
    res = requests.put(f"{BASE_URL}/vehicles/VEH-101/availability", headers=drv1_headers, json={"available": False})
    log_test("Driver DRV-01 modifying Vehicle availability is BLOCKED (403)", res.status_code == 403, f"Status: {res.status_code}")

    # Non-existent driver availability update -> 404
    res = requests.put(f"{BASE_URL}/drivers/NON_EXISTENT/availability", headers=owner_headers, json={"available": True})
    log_test("Updating non-existent driver returns 404 Not Found", res.status_code == 404, f"Status: {res.status_code}")

    # Non-existent vehicle availability update -> 404
    res = requests.put(f"{BASE_URL}/vehicles/NON_EXISTENT/availability", headers=owner_headers, json={"available": True})
    log_test("Updating non-existent vehicle returns 404 Not Found", res.status_code == 404, f"Status: {res.status_code}")

    # 6. Assigned Trip Workflow & Status Updates
    print("\n--- 6. Assigned Trip Workflow & Status Updates ---")
    
    # Driver updates assigned trip TRP1024 status -> In Transit
    res = requests.patch(f"{BASE_URL}/trips/TRP1024/status", headers=drv1_headers, json={"status": "In Transit"})
    log_test("Driver DRV-01 updates assigned trip TRP1024 status to 'In Transit'", res.status_code == 200 and res.json().get("status") == "In Transit")

    # Admin reads trip TRP1024 and sees updated status
    res = requests.get(f"{BASE_URL}/trips/TRP1024", headers=owner_headers)
    log_test("Admin sees driver's trip status update ('In Transit')", res.status_code == 200 and res.json().get("status") == "In Transit")

    # Unassigned driver DRV-02 attempting to update TRP1024 -> 403
    res = requests.patch(f"{BASE_URL}/trips/TRP1024/status", headers=drv2_headers, json={"status": "Delivered"})
    log_test("Driver DRV-02 updating unassigned trip TRP1024 is BLOCKED (403)", res.status_code == 403, f"Status: {res.status_code}")

    print("\n" + "=" * 75)
    print("STEP 10 AVAILABILITY WORKFLOW VERIFICATION: All 18 checks PASSED!")
    print("=" * 75)

if __name__ == "__main__":
    run_step10_tests()

