package TripFlow.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TripflowBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TripflowBackendApplication.class, args);
	}

}
