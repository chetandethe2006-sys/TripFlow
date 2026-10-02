package TripFlow.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TripFlow.Backend.model.Trip;

public interface TripRepository extends JpaRepository<Trip, String> {
}

