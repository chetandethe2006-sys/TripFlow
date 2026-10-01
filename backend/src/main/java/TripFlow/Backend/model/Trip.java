package TripFlow.Backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "trips")
public class Trip {
    @Id
    private String id;
    private String customer;
    private String customerEmail;
    private String customerPhone;
    private String pickup;
    private String destination;
    private String goods;
    private String quantity;
    private String pickupDate;
    private String expectedDelivery;
    private String driverId;
    private String driverName;
    private String vehicleNumber;
    private String status;
    private String notes;
    private String date;
}
