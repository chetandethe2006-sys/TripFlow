package TripFlow.Backend.service;

import TripFlow.Backend.model.Trip;
import TripFlow.Backend.repository.TripRepository;
import TripFlow.Backend.model.Driver;
import TripFlow.Backend.repository.DriverRepository;
import TripFlow.Backend.model.Vehicle;
import TripFlow.Backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final EmailNotificationService emailService;

    public TripService(TripRepository tripRepository, DriverRepository driverRepository, VehicleRepository vehicleRepository, EmailNotificationService emailService) {
        this.tripRepository = tripRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.emailService = emailService;
    }

    
    public Trip createTrip(Trip trip) {
        if (trip.getDriverId() != null) {
            Driver driver = driverRepository.findById(trip.getDriverId()).orElse(null);
            if (driver != null && !"Available".equalsIgnoreCase(driver.getAvailability())) {
                throw new RuntimeException("Driver is currently unavailable.");
            }
        }
        Trip saved = tripRepository.save(trip);
        String details = "Pickup: " + saved.getPickup() + " -> Destination: " + saved.getDestination();
        emailService.sendTripAssignmentEmail(saved.getId(), saved.getCustomerEmail(), details);
        return saved;
    }


    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Optional<Trip> getTripById(String id) {
        return tripRepository.findById(id);
    }

    public Trip updateTrip(String id, Trip updatedTrip) {
        Trip existing = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));

        String oldStatus = existing.getStatus();

        existing.setCustomer(updatedTrip.getCustomer());
        existing.setCustomerEmail(updatedTrip.getCustomerEmail());
        existing.setCustomerPhone(updatedTrip.getCustomerPhone());
        existing.setPickup(updatedTrip.getPickup());
        existing.setDestination(updatedTrip.getDestination());
        existing.setGoods(updatedTrip.getGoods());
        existing.setQuantity(updatedTrip.getQuantity());
        existing.setPickupDate(updatedTrip.getPickupDate());
        existing.setExpectedDelivery(updatedTrip.getExpectedDelivery());
        existing.setDriverId(updatedTrip.getDriverId());
        existing.setDriverName(updatedTrip.getDriverName());
        existing.setVehicleNumber(updatedTrip.getVehicleNumber());
        existing.setStatus(updatedTrip.getStatus());
        existing.setNotes(updatedTrip.getNotes());
        existing.setDate(updatedTrip.getDate());

        Trip saved = tripRepository.save(existing);
        
        if (oldStatus == null ? saved.getStatus() != null : !oldStatus.equals(saved.getStatus())) {
            emailService.sendTripStatusUpdateEmail(saved.getId(), saved.getCustomerEmail(), oldStatus, saved.getStatus());
        }
        
        return saved;
    }

    public Trip updateTripStatus(String id, String newStatus) {
        Trip existing = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));

        String oldStatus = existing.getStatus();
        existing.setStatus(newStatus);
        
        Trip saved = tripRepository.save(existing);
        
        if (oldStatus == null ? saved.getStatus() != null : !oldStatus.equals(saved.getStatus())) {
            emailService.sendTripStatusUpdateEmail(saved.getId(), saved.getCustomerEmail(), oldStatus, saved.getStatus());
        }
        
        return saved;
    }

    public void deleteTrip(String id) {
        if (!tripRepository.existsById(id)) {
            throw new RuntimeException("Trip not found with id: " + id);
        }
        tripRepository.deleteById(id);
    }
}
