package TripFlow.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TripFlow.Backend.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, String> {
}

