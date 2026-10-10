package TripFlow.Backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${tripflow.owner.email:owner@tripflow.com}")
    private String ownerEmail;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendTripAssignmentEmail(String tripId, String customerEmail, String details) {
        String subject = "Trip Assigned: " + tripId;
        String text = "Trip " + tripId + " has been assigned/created.\nDetails: " + details;
        
        sendEmail(customerEmail, subject, text);
        sendEmail(ownerEmail, subject, "Customer Notification: " + text);
    }

    @Async
    public void sendTripStatusUpdateEmail(String tripId, String customerEmail, String oldStatus, String newStatus) {
        if (oldStatus != null && oldStatus.equals(newStatus)) {
            return;
        }
        
        String subject = "Trip Status Update: " + tripId;
        String text = "The status of trip " + tripId + " has changed from " + (oldStatus == null ? "None" : oldStatus) + " to " + newStatus + ".";
        
        sendEmail(customerEmail, subject, text);
        sendEmail(ownerEmail, subject, "Customer Notification: " + text);
    }

    private void sendEmail(String to, String subject, String text) {
        if (to == null || to.isBlank()) {
            System.err.println("Cannot send email, recipient is null or blank. Subject: " + subject);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromEmail != null && !fromEmail.isBlank()) {
                message.setFrom(fromEmail);
            }
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to: " + to + ". Error: " + e.getMessage());
        }
    }
}
