package TripFlow.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TripFlow.Backend.model.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {
}

