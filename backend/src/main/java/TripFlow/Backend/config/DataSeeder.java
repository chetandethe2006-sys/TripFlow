package TripFlow.Backend.config;

import TripFlow.Backend.model.Customer;
import TripFlow.Backend.model.Driver;
import TripFlow.Backend.model.Notification;
import TripFlow.Backend.model.Trip;
import TripFlow.Backend.model.Vehicle;
import TripFlow.Backend.repository.CustomerRepository;
import TripFlow.Backend.repository.DriverRepository;
import TripFlow.Backend.repository.NotificationRepository;
import TripFlow.Backend.repository.TripRepository;
import TripFlow.Backend.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(
            DriverRepository driverRepository,
            CustomerRepository customerRepository,
            VehicleRepository vehicleRepository,
            TripRepository tripRepository,
            NotificationRepository notificationRepository
    ) {
        return args -> {
            // Seed Drivers
            if (driverRepository.count() == 0) {
                driverRepository.saveAll(List.of(
                        new Driver("DRV-01", "Amit Sharma", "+1 (555) 111-2233", "DL-99887766", "On Trip", 48),
                        new Driver("DRV-02", "Rajesh Kumar", "+1 (555) 222-3344", "DL-44332211", "Available", 62),
                        new Driver("DRV-03", "Suresh Patel", "+1 (555) 333-4455", "DL-55667788", "On Trip", 31)
                ));
            }

            // Seed Customers
            if (customerRepository.count() == 0) {
                customerRepository.saveAll(List.of(
                        new Customer("CUS-01", "Acme Logistics Corp", "+1 (555) 234-5678", "logistics@acme.com", 14, "Active"),
                        new Customer("CUS-02", "Global Retailers Inc", "+1 (555) 876-5432", "supply@globalretail.com", 28, "Active"),
                        new Customer("CUS-03", "Apex Agro Foods", "+1 (555) 345-6789", "orders@apexagro.com", 9, "Active")
                ));
            }

            // Seed Vehicles
            if (vehicleRepository.count() == 0) {
                vehicleRepository.saveAll(List.of(
                        new Vehicle("VEH-101", "IL-04-AB-9876", "Heavy Truck (20T)", "Amit Sharma", "20,000 kg", "On Trip"),
                        new Vehicle("VEH-102", "FL-08-XY-4321", "Medium Container", "Rajesh Kumar", "12,000 kg", "Available"),
                        new Vehicle("VEH-103", "NE-12-ZZ-5566", "Refrigerated Van", "Suresh Patel", "8,000 kg", "On Trip")
                ));
            }

            // Seed Trips
            if (tripRepository.count() == 0) {
                tripRepository.saveAll(List.of(
                        new Trip("TRP1024", "Acme Logistics Corp", "logistics@acme.com", "+1 (555) 234-5678", "Warehouse A, Chicago, IL", "Distribution Hub, Dallas, TX", "Industrial Steel Pipes", "12 Pallets", "2026-06-01", "2026-06-04", "DRV-01", "Amit Sharma", "IL-04-AB-9876", "In Transit", "Handle with care.", "2026-06-01"),
                        new Trip("TRP1023", "Global Retailers Inc", "supply@globalretail.com", "+1 (555) 876-5432", "Port Terminal 4, Miami, FL", "Retail Center, Atlanta, GA", "Consumer Electronics", "25 Cartons", "2026-05-28", "2026-05-30", "DRV-02", "Rajesh Kumar", "FL-08-XY-4321", "Delivered", "Direct handover.", "2026-05-28"),
                        new Trip("TRP1025", "Apex Agro Foods", "orders@apexagro.com", "+1 (555) 345-6789", "Cold Storage 2, Omaha, NE", "Supermarket Chain, Denver, CO", "Frozen Produce", "8 Tons", "2026-06-03", "2026-06-06", "DRV-03", "Suresh Patel", "NE-12-ZZ-5566", "Driver Assigned", "Maintain temp.", "2026-06-02")
                ));
            }

            // Seed Notifications
            if (notificationRepository.count() == 0) {
                notificationRepository.saveAll(List.of(
                        new Notification("NOT-1", "Trip #TRP1024 status changed to In Transit.", "10 mins ago", false),
                        new Notification("NOT-2", "Driver Rajesh Kumar completed Trip #TRP1018.", "2 hours ago", false)
                ));
            }
            
            System.out.println("✅ DataSeeder completed: Backend database populated with initial values.");
        };
    }
}

