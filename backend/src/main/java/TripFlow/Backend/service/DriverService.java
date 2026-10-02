package TripFlow.Backend.service;

import TripFlow.Backend.model.Driver;
import TripFlow.Backend.repository.DriverRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public Driver createDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Optional<Driver> getDriverById(String id) {
        return driverRepository.findById(id);
    }

    public Driver updateDriver(String id, Driver updatedDriver) {
        Driver existing = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));

        existing.setName(updatedDriver.getName());
        existing.setPhone(updatedDriver.getPhone());
        existing.setLicense(updatedDriver.getLicense());
        existing.setAvailability(updatedDriver.getAvailability());
        existing.setCompletedTrips(updatedDriver.getCompletedTrips());

        return driverRepository.save(existing);
    }

    public void deleteDriver(String id) {
        if (!driverRepository.existsById(id)) {
            throw new RuntimeException("Driver not found with id: " + id);
        }
        driverRepository.deleteById(id);
    }
}
