package com.yasboss.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yasboss.dto.OrderRequestDTO;
import com.yasboss.model.GlobalSettings;
import com.yasboss.model.Order;
import com.yasboss.model.OrderItem;
import com.yasboss.model.User;
import com.yasboss.repository.OrderItemRepository;
import com.yasboss.repository.OrderRepository;
import com.yasboss.repository.SettingsRepository;
import com.yasboss.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class OrderService {

    private final AuditService auditService;
    
    @Autowired
    private OrderRepository orderRepo;

    @Autowired 
    private OrderItemRepository itemRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private CouponService couponService;

    @Autowired
    private UserService userService;

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    OrderService(AuditService auditService) {
        this.auditService = auditService;
    }

    @Transactional
    public Order placeOrder(OrderRequestDTO request) {
        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(request.getShippingAddress());
        order.setCustomerNotes(request.getCustomerNotes());
        order.setUserEmail(request.getEmail());
        order.setStatus("PENDING");

        // 1. Calculate Base Subtotal from Database (Safety check)
        double subtotal = 0;
        for (var itemReq : request.getItems()) {
            subtotal += (itemReq.getPrice() * itemReq.getQuantity());
        }

        // 2. ✨ HANDLE COUPON LOGIC
        double couponDiscount = 0;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            // Validate one last time server-side
            couponDiscount = couponService.validateAndCalculateDiscount(
                request.getCouponCode(), 
                subtotal
            );
            
            // Increment the used count in DB
            couponService.incrementUsage(request.getCouponCode());
            order.setAppliedCoupon(request.getCouponCode());
        }

        // 3. Handle Delivery Charges
        double delivery = subtotal >= 500 ? 0 : 49;

        // 4. Final Total Calculation
        double finalAmount = (subtotal - couponDiscount) + delivery;
        order.setTotalAmount(finalAmount);
        order.setDiscountAmount(couponDiscount);

        // 5. Save and Return
        return orderRepo.save(order);
    }

    @Transactional
    public void updateOrderStatus(Long id, String newStatus) {
        Order order = orderRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));

        order.setStatus(newStatus);

        if ("DELIVERED".equalsIgnoreCase(newStatus) && !order.isPointsCredited()) {
            User user = order.getUser();
            if (user != null) {
                int currentPoints = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
                user.setRewardPoints(currentPoints + order.getPointsToEarn());
                order.setPointsCredited(true); 
                userRepo.save(user);
            }
        }
        orderRepo.save(order);
    }

    /**
     * Requirement #1: Generate GST Invoice PDF using OpenPDF
     */
    public byte[] generateInvoicePdf(Order order) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            
            // Add Logo or Header
            document.add(new Paragraph("YAS BOSS TOYS - GST INVOICE"));
            document.add(new Paragraph("----------------------------------------------------------------"));
            document.add(new Paragraph("Order Reference: " + order.getOrderId()));
            document.add(new Paragraph("Customer Email: " + order.getUserEmail()));
            document.add(new Paragraph("Shipping Address: " + order.getShippingAddress()));
            document.add(new Paragraph(" ")); // Empty line
            
            // Build Table
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            
            table.addCell("Toy Name");
            table.addCell("Price");
            table.addCell("Quantity");
            table.addCell("Subtotal");
            
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    table.addCell(item.getProductName());
                    table.addCell("Rs. " + item.getPrice());
                    table.addCell(String.valueOf(item.getQuantity()));
                    table.addCell("Rs. " + (item.getPrice() * item.getQuantity()));
                }
            }
            
            document.add(table);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Final Total Amount (GST Inclusive): Rs. " + order.getTotalAmount()));
            document.add(new Paragraph("\nThank you for shopping at YAS BOSS!"));
            
        } catch (DocumentException e) {
            // Log properly in a real application
            e.printStackTrace();
        } finally {
            // CRITICAL: Close the document to flush bytes to stream
            if (document.isOpen()) {
                document.close();
            }
        }
        
        return out.toByteArray();
    }

    public List<Order> getOrdersByPhone(String phone) {
        return orderRepo.findByCustomerPhoneOrderByOrderDateDesc(phone);
    }

    @Transactional
    public Order placeOrder(Order order, String userEmail) {
        // 1. Fetch user profile to get the registered phone number
        User user = userRepo.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Automatically populate the tracking phone number
        order.setUserEmail(userEmail);
        order.setCustomerPhone(user.getPhone()); // Auto-sync from profile
        
        // 3. Set initial status and date
        order.setStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());
        order.setOrderId("YB-" + System.currentTimeMillis());

        return orderRepo.save(order);
    }

    public Order createPendingOrder(String email, Long productId, int quantity) {
        Order order = new Order();
        order.setOrderId("YB-" + System.currentTimeMillis());
        order.setUserEmail(email);
        order.setStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());
        
        // Additional logic to add the specific product as an OrderItem can be added here
        
        return orderRepo.save(order);
    }

    public List<Order> getOrdersByEmail(String email) {
        return orderRepo.findByUserEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public Order requestSupport(String orderId, String type) {
        Order order = orderRepo.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"DELIVERED".equals(order.getStatus())) {
            throw new RuntimeException("Only delivered orders can be returned.");
        }

        if ("RETURN".equals(type)) {
            order.setStatus("RETURN_REQUESTED");
            order.setRefundStatus("PENDING");
        } else {
            order.setStatus("REPLACEMENT_REQUESTED");
        }

        return orderRepo.save(order);
    }

    @Transactional
    public Order processSupportRequest(String orderId, String type) {
        Order order = orderRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // 🛡️ Security Check: Only allow requests for DELIVERED orders
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Requests can only be raised for delivered orders.");
        }

        if ("RETURN".equalsIgnoreCase(type)) {
            order.setStatus("RETURN_REQUESTED");
            order.setRefundStatus("PENDING"); // Automatically trigger refund flow
        } else if ("REPLACEMENT".equalsIgnoreCase(type)) {
            order.setStatus("REPLACEMENT_REQUESTED");
        }

        return orderRepo.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId, String email) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 🛡️ Security Check: Ensure user owns the order
        if (!order.getUserEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        // 🚫 Business Rule: Cannot cancel if already dispatched
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Order cannot be cancelled once dispatched.");
        }

        order.setStatus("CANCELLED");
        
        // 🔄 Optional: Refund points if used
        if (order.getPointsUsed() > 0) {
            userService.refundPoints(email, order.getPointsUsed());
        }

        return orderRepo.save(order);
    }

    @Transactional
    public Order requestReplacement(Long orderId, String email) {
        // 1. Fetch Order and User
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✨ FIX: Role Check Logic
        // We check if the Set of roles contains an entry with the name "ROLE_ADMIN"
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));

        // 🛡️ Security: Ensure user owns the order (or is Admin)
        if (!order.getUserEmail().equals(email) && !isAdmin) {
            throw new IllegalStateException("You are not authorized to modify this order.");
        }

        // 2. Fetch configurable window from DB
        int windowDays = Integer.parseInt(
            settingsRepository.findById("RETURN_WINDOW")
                .map(GlobalSettings::getSettingValue)
                .orElse("7")
        );

        // 🛠️ Convert java.util.Date to LocalDateTime
        LocalDateTime orderDateTime = order.getCreatedAt().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        // 3. Calculate Days
        long daysSinceCreation = ChronoUnit.DAYS.between(orderDateTime, LocalDateTime.now());
        
        // 4. Enforce window with Admin Override (Using the isAdmin boolean)
        if (daysSinceCreation > windowDays && !isAdmin) {
            throw new IllegalStateException("The window for replacements has closed (" + windowDays + " days).");
        }

        // 5. Business Logic: Ensure order status is 'DELIVERED'
        if (!order.getStatus().equals("DELIVERED") && !isAdmin) {
            throw new IllegalStateException("Replacements can only be requested for delivered orders.");
        }

        // 6. Update and Save
        order.setStatus("REPLACEMENT_REQUESTED");
        log.info("Replacement requested for Order ID: {} by User: {}", orderId, email);
        return orderRepo.save(order);
    }
    public double calculateFinalTotal(double subtotal) {
        // Fetch current tax from DB
        double taxPercent = Double.parseDouble(
            settingsRepository.findById("TAX_PERCENTAGE")
                .map(s -> s.getSettingValue())
                .orElse("18.0") // Default if not set
        );

        double taxAmount = (subtotal * taxPercent) / 100;
        
        // Check if subtotal qualifies for free shipping
        double threshold = Double.parseDouble(
            settingsRepository.findById("FREE_DELIVERY_THRESHOLD")
                .map(s -> s.getSettingValue())
                .orElse("500.0")
        );
        
        double shipping = (subtotal >= threshold) ? 0.0 : 50.0; // ₹50 shipping if below threshold

        return subtotal + taxAmount + shipping;
    }


    /**
     * ✨ Update order to DELIVERED
     */
    @Transactional
    public Order markAsDelivered(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("DELIVERED");
        order.setDeliveredAt(LocalDateTime.now()); // Capture delivery time for Return Policy
        
        // If it was a COD order, mark payment as completed now
        if ("COD".equals(order.getPaymentMethod())) {
            order.setPaymentStatus("COMPLETED");
        }

        return orderRepo.save(order);
    }

    @Transactional
    public void processPaymentSuccess(Long orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        
        order.setPaymentStatus("COMPLETED");
        order.setStatus("PAID");
        orderRepo.save(order);

        // 🚀 Automatically send the email
        emailService.sendOrderConfirmationWithInvoice(order);
    }

    @Transactional
    public Order markAsOutForDelivery(Long orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setStatus("OUT_FOR_DELIVERY");

        // 🚀 Trigger Push Notification
        String userToken = order.getUser().getFcmToken(); // Assume you stored this
        if (userToken != null) {
            notificationService.sendPushNotification(
                userToken, 
                "Your Toy is Nearby! 🚚", 
                "Order #" + order.getOrderId() + " is out for delivery. Get ready!"
            );
        }

        return orderRepo.save(order);
    }

   @Transactional
    public Order completeOrderPayment(Long orderId) {
        // 1. Fetch the order
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // 2. Existing Payment Logic: Update Status
        log.info("Completing payment for Order ID: {}", orderId);
        order.setStatus("PAID");

        // 3. ✨ NEW: Increment coupon usage if a code was stored during checkout
        // This now works because we added the field to the Order model above
        if (order.getCouponCode() != null && !order.getCouponCode().isEmpty()) {
            try {
                couponService.incrementUsage(order.getCouponCode());
            } catch (Exception e) {
                // We log the error but don't crash the payment if coupon increment fails
                log.error("Failed to increment coupon usage for code: {}", order.getCouponCode());
            }
        }

        // 4. Optional: Loyalty points logic
        userRepo.findByEmail(order.getUserEmail()).ifPresent(user -> {
            int points = (int) (order.getTotalAmount() / 100);
            user.setRewardPoints(user.getRewardPoints() + points);
            userRepo.save(user);
        });

        return orderRepo.save(order);
    }

    public void updateStatus(Long orderId, String status, String adminEmail) {
        // ... update logic
        auditService.log("ORDER", "Order #" + orderId + " marked as " + status, adminEmail, "info");
    }
}