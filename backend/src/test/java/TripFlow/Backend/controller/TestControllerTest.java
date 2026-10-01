package TripFlow.Backend.controller;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TestControllerTest {

    @Test
    void testReturnsBackendWorkingMessage() {
        TestController controller = new TestController();

        assertEquals("TripFlow Backend is Working!", controller.testApi());
    }
}
