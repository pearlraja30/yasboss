package com.yasboss.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yasboss.dto.OrderRequest;
import com.yasboss.model.CartItem;
import com.yasboss.model.Order;
import com.yasboss.model.OrderItem;
import com.yasboss.model.User;
import com.yasboss.repository.OrderItemRepository;
import com.yasboss.repository.OrderRepository;
import com.yasboss.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepo;

    @Autowired 
    private OrderItemRepository itemRepo;

    @Autowired
    private UserRepository userRepo;

    @Transactional
    public String placeOrder(OrderRequest req) {
        String orderId = "YB-" + System.currentTimeMillis(); 
        
        Order order = new Order();
        order.setOrderId(orderId);
        order.setUserEmail(req.getUserEmail());
        order.setTotalAmount(req.getTotalAmount());
        order.setShippingAddress(req.getShippingAddress());
        order.setPaymentMethod(req.getPaymentMethod());
        order.setStatus("PENDING");
        
        // Requirement #4: Reward Points Logic
        int pointsToEarn = (int) Math.floor(req.getTotalAmount() / 100);
        order.setPointsToEarn(pointsToEarn);
        order.setPointsCredited(false);

        userRepo.findByEmail(req.getUserEmail()).ifPresent(order::setUser);

        Order savedOrder = orderRepo.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : req.getItems()) {
            OrderItem oi = new OrderItem();
            oi.setOrder(savedOrder); 
            oi.setProductId(item.getId());
            oi.setProductName(item.getName());
            oi.setPrice(item.getPrice());       
            oi.setQuantity(item.getQuantity());
            oi.setImageUrl(item.getImageUrl()); 
            orderItems.add(oi);
        }
        
        itemRepo.saveAll(orderItems);
        return orderId;
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
}