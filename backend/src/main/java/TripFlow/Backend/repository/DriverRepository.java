package TripFlow.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TripFlow.Backend.model.Driver;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, String> {
    boolean existsByLicense(String license);
    Optional<Driver> findByLicense(String license);
    Optional<Driver> findByPhone(String phone);
    Optional<Driver> findByIdOrLicenseOrPhone(String id, String license, String phone);
}
