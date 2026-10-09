import re

with open('backend/src/main/java/TripFlow/Backend/repository/VehicleRepository.java', 'r', encoding='utf-8') as f:
    content = f.read()

if 'findByNumber' not in content:
    content = content.replace(
        '''public interface VehicleRepository extends JpaRepository<Vehicle, String> {
}''',
        '''public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    java.util.Optional<TripFlow.Backend.model.Vehicle> findByNumber(String number);
}'''
    )
    with open('backend/src/main/java/TripFlow/Backend/repository/VehicleRepository.java', 'w', encoding='utf-8') as f:
        f.write(content)

with open('backend/src/main/java/TripFlow/Backend/service/TripService.java', 'r', encoding='utf-8') as f:
    content = f.read()

if 'VehicleRepository' not in content:
    content = content.replace(
        'import TripFlow.Backend.repository.DriverRepository;',
        '''import TripFlow.Backend.repository.DriverRepository;
import TripFlow.Backend.model.Vehicle;
import TripFlow.Backend.repository.VehicleRepository;'''
    )
    content = content.replace(
        '''    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;

    public TripService(TripRepository tripRepository, DriverRepository driverRepository) {
        this.tripRepository = tripRepository;
        this.driverRepository = driverRepository;
    }''',
        '''    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    public TripService(TripRepository tripRepository, DriverRepository driverRepository, VehicleRepository vehicleRepository) {
        this.tripRepository = tripRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
    }'''
    )
    
    replacement = """
    public Trip createTrip(Trip trip) {
        if (trip.getDriverId() != null) {
            Driver driver = driverRepository.findById(trip.getDriverId()).orElse(null);
            if (driver != null && !"Available".equalsIgnoreCase(driver.getAvailability())) {
                throw new RuntimeException("Driver is currently unavailable.");
            }
        }
        if (trip.getVehicleNumber() != null && !trip.getVehicleNumber().equals("Unassigned")) {
            Vehicle vehicle = vehicleRepository.findByNumber(trip.getVehicleNumber()).orElse(null);
            if (vehicle != null && !"Available".equalsIgnoreCase(vehicle.getAvailability())) {
                throw new RuntimeException("Vehicle is currently unavailable.");
            }
        }
        return tripRepository.save(trip);
    }
"""
    content = re.sub(r'public Trip createTrip\(Trip trip\)\s*\{[^}]*return tripRepository\.save\(trip\);\s*\}', replacement, content, flags=re.DOTALL)
    
    with open('backend/src/main/java/TripFlow/Backend/service/TripService.java', 'w', encoding='utf-8') as f:
        f.write(content)
