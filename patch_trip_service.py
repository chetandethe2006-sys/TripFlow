import re
with open('backend/src/main/java/TripFlow/Backend/service/TripService.java', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
    public Trip createTrip(Trip trip) {
        if (trip.getDriverId() != null) {
            Driver driver = driverRepository.findById(trip.getDriverId()).orElse(null);
            if (driver != null && !"Available".equalsIgnoreCase(driver.getAvailability())) {
                throw new RuntimeException("Driver is currently unavailable.");
            }
        }
        return tripRepository.save(trip);
    }
"""

content = re.sub(r'public Trip createTrip\(Trip trip\)\s*\{\s*return tripRepository.save\(trip\);\s*\}', replacement, content)

with open('backend/src/main/java/TripFlow/Backend/service/TripService.java', 'w', encoding='utf-8') as f:
    f.write(content)
