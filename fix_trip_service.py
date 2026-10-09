import re

with open('backend/src/main/java/TripFlow/Backend/service/TripService.java', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
content = content.replace(
    'import TripFlow.Backend.repository.TripRepository;',
    '''import TripFlow.Backend.repository.TripRepository;
import TripFlow.Backend.model.Driver;
import TripFlow.Backend.repository.DriverRepository;'''
)

# Add driverRepository injection
content = content.replace(
    '''    private final TripRepository tripRepository;

    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }''',
    '''    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;

    public TripService(TripRepository tripRepository, DriverRepository driverRepository) {
        this.tripRepository = tripRepository;
        this.driverRepository = driverRepository;
    }'''
)

with open('backend/src/main/java/TripFlow/Backend/service/TripService.java', 'w', encoding='utf-8') as f:
    f.write(content)
