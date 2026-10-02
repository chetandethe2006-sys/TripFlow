package TripFlow.Backend.service;

import TripFlow.Backend.model.Trip;
import TripFlow.Backend.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TripService {

    private final TripRepository tripRepository;

    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    public Trip createTrip(Trip trip) {
        return tripRepository.save(trip);
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

        return tripRepository.save(existing);
    }

    public void deleteTrip(String id) {
        if (!tripRepository.existsById(id)) {
            throw new RuntimeException("Trip not found with id: " + id);
        }
        tripRepository.deleteById(id);
    }
}
