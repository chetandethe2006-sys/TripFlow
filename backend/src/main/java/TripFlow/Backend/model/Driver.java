package TripFlow.Backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
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
@Table(name = "drivers")
public class Driver {
    @Id
    private String id;
    private String name;
    private String phone;
    private String license;
    private String availability;
    private int completedTrips;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String role; // "DRIVER"

    public Driver(String id, String name, String phone, String license, String availability, int completedTrips) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.license = license;
        this.availability = availability;
        this.completedTrips = completedTrips;
        this.role = "DRIVER";
    }
}
