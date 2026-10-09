package TripFlow.Backend.controller;

import TripFlow.Backend.model.Driver;
import TripFlow.Backend.service.DriverService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;
    private final PasswordEncoder passwordEncoder;

    public DriverController(DriverService driverService, PasswordEncoder passwordEncoder) {
        this.driverService = driverService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<Driver> createDriver(@RequestBody Driver driver) {
        if (driver.getPassword() == null || driver.getPassword().isEmpty()) {
            driver.setPassword(passwordEncoder.encode("driver123"));
        } else {
            driver.setPassword(passwordEncoder.encode(driver.getPassword()));
        }
        if (driver.getRole() == null || driver.getRole().isEmpty()) {
            driver.setRole("DRIVER");
        }
        Driver created = driverService.createDriver(driver);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Driver>> getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriverById(@PathVariable String id) {
        return driverService.getDriverById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Driver> updateDriver(@PathVariable String id, @RequestBody Driver driver) {
        try {
            Driver updated = driverService.updateDriver(id, driver);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    public static class AvailabilityRequest {
        public boolean available;
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<Driver> updateAvailability(
            @PathVariable String id,
            @RequestBody AvailabilityRequest req,
            Principal principal,
            Authentication auth
    ) {
        boolean isOwner = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"));
        String callerId = principal != null ? principal.getName() : null;

        if (!isOwner && (callerId == null || !callerId.equalsIgnoreCase(id))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            String status = req.available ? "Available" : "Not Available";
            Driver updated = driverService.updateAvailability(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable String id) {
        try {
            driverService.deleteDriver(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
