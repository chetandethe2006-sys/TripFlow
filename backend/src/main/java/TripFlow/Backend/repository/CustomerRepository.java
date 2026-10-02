package TripFlow.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TripFlow.Backend.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, String> {
}

