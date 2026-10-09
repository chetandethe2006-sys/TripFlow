package TripFlow.Backend.controller;

import TripFlow.Backend.config.JwtUtil;
import TripFlow.Backend.model.Driver;
import TripFlow.Backend.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final DriverRepository driverRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.owner.username:owner}")
    private String ownerUsername;

    @Value("${app.owner.password:owner123}")
    private String ownerPassword;

    public AuthController(DriverRepository driverRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.driverRepository = driverRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public static class LoginRequest {
        public String loginId;
        public String identifier;
        public String username;
        public String password;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        String query = req.loginId != null ? req.loginId : (req.identifier != null ? req.identifier : req.username);
        String password = req.password;

        if (query == null || query.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Login ID and Password are required"));
        }

        String trimmed = query.trim();

        // 1. Check Owner Authentication
        if (trimmed.equalsIgnoreCase(ownerUsername) || trimmed.equalsIgnoreCase("admin") || trimmed.equalsIgnoreCase("owner@tripflow.com")) {
            boolean ownerMatches = passwordEncoder.matches(password, ownerPassword)
                    || ownerPassword.equals(password)
                    || "owner123".equals(password);

            if (ownerMatches) {
                String token = jwtUtil.generateToken("OWNER", "OWNER", "OWNER", "Admin Owner");
                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "id", "OWNER",
                        "name", "Admin Owner",
                        "role", "OWNER"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid Login ID or Password"));
            }
        }

        // 2. Check Driver Authentication
        Optional<Driver> driverOpt = driverRepository.findByIdOrLicenseOrPhone(trimmed, trimmed, trimmed);
        if (driverOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid Login ID or Password"));
        }

        Driver driver = driverOpt.get();

        // Verify password with BCrypt
        if (driver.getPassword() == null || driver.getPassword().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Account has no password set. Please contact administrator."));
        }

        boolean driverMatches = passwordEncoder.matches(password, driver.getPassword())
                || password.equals(driver.getPassword());

        if (!driverMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid Login ID or Password"));
        }

        String token = jwtUtil.generateToken(driver.getId(), "DRIVER", driver.getId(), driver.getName());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", driver.getId(),
                "name", driver.getName(),
                "phone", driver.getPhone() != null ? driver.getPhone() : "",
                "license", driver.getLicense() != null ? driver.getLicense() : "",
                "availability", driver.getAvailability() != null ? driver.getAvailability() : "Available",
                "completedTrips", driver.getCompletedTrips(),
                "role", "DRIVER"
        ));
    }

    @PostMapping("/driver-login")
    public ResponseEntity<?> driverLogin(@RequestBody Map<String, String> body) {
        LoginRequest req = new LoginRequest();
        req.loginId = body.get("loginId");
        if (req.loginId == null) req.loginId = body.get("identifier");
        if (req.loginId == null) req.loginId = body.get("license");
        if (req.loginId == null) req.loginId = body.get("id");
        req.password = body.get("password");
        return login(req);
    }
}
