package com.yasboss.service;

import jakarta.mail.internet.MimeMessage; // Required import

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper; // Required import
import org.springframework.stereotype.Service;

import com.yasboss.model.Order;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private InvoiceService invoiceService; // Service that generates the PDF byte[]

    public void sendOrderConfirmationWithInvoice(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(order.getUserEmail());
            helper.setSubject("Your Toy Store Order #" + order.getOrderId() + " is Confirmed!");
            
            // Email Body (HTML)
            String htmlBody = "<h1>Hi " + order.getUser() + "!</h1>" +
                              "<p>Thank you for your purchase. Your toys are being prepared for dispatch.</p>" +
                              "<p><strong>Order ID:</strong> " + order.getOrderId() + "</p>" +
                              "<p>We've attached your official GST invoice to this email.</p>";
            
            helper.setText(htmlBody, true);

            // ✨ Attach the PDF Invoice
            byte[] pdfContent = invoiceService.generateInvoicePdf(order);
            helper.addAttachment("Invoice_" + order.getOrderId() + ".pdf", 
                                new ByteArrayResource(pdfContent));

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    // 1. Simple text version (useful for quick alerts or testing)
    public void sendSimpleOrderStatusEmail(String to, String orderId, String newStatus) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Order Update: #DB-" + orderId);
        message.setText("Great news! Your order status has been updated to: " + newStatus);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send simple email: " + e.getMessage());
        }
    }

    // 2. Professional HTML version (renamed to avoid duplicate method error)
    public void sendHtmlOrderStatusEmail(String to, String orderId, String newStatus) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        
        try {
            // "true" indicates multipart message for HTML and images
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Update on your YasBoss Order #DB-" + orderId);

            String htmlMsg = "<html><body style='font-family: Arial, sans-serif;'>" +
                    "<div style='text-align: center;'>" +
                    "<img src='https://yourdomain.com/logo.png' alt='YasBoss Logo' style='width: 150px;'>" +
                    "</div>" +
                    "<h2 style='color: #db2777;'>Good news!</h2>" +
                    "<p>Hi there,</p>" +
                    "<p>Your order <strong>#DB-" + orderId + "</strong> has been updated to: " +
                    "<span style='color: #2563eb; font-weight: bold;'>" + newStatus + "</span></p>" +
                    "<p>Thank you for shopping for educational toys with us!</p>" +
                    "<br><p>Best regards,<br>The YasBoss Team</p>" +
                    "</body></html>";

            helper.setText(htmlMsg, true); 
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send HTML email: " + e.getMessage());
        }
    }
}