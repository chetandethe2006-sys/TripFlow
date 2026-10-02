package TripFlow.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TripFlow.Backend.model.Driver;

public interface DriverRepository extends JpaRepository<Driver, String> {
}

