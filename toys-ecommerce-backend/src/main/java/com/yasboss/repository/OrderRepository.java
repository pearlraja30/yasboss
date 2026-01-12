package com.yasboss.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.yasboss.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // FIX: Changed from findByUserEmailOrderByDateDesc to findByUserEmailOrderByCreatedAtDesc
    List<Order> findByUserEmailOrderByCreatedAtDesc(String email);

    // FIX: Changed from findAllByOrderByDateDesc to findAllByOrderByCreatedAtDesc
    List<Order> findAllByOrderByCreatedAtDesc();

    Optional<Order> findByOrderId(String orderId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o")
    Double getTotalRevenue();

    // FIX: Count orders based on their status (PENDING, SHIPPED, etc.)
    long countByStatus(String status);

    List<Order> findByCustomerPhoneOrderByOrderDateDesc(String phone);

    @Query(value = "SELECT o.id as orderId, o.order_date as orderDate, u.full_name as customerName, " +
           "p.name as productName, p.hsn_code as hsnCode, oi.quantity as quantity, oi.price as unitPrice, " +
           "(oi.quantity * oi.price) as taxableValue, " +
           "((oi.quantity * oi.price) * 0.09) as cgst, " +
           "((oi.quantity * oi.price) * 0.09) as sgst, " +
           "(oi.quantity * oi.price * 1.18) as totalAmount " +
           "FROM orders o " +
           "JOIN users u ON o.user_id = u.id " +
           "JOIN order_items oi ON o.id = oi.order_db_id " +
           "JOIN products p ON oi.product_id = p.id " +
           "WHERE o.order_date BETWEEN :startDate AND :endDate", nativeQuery = true)
    List<GstReportProjection> findGstReportData(LocalDateTime startDate, LocalDateTime endDate);

    // Projection Interface to map result columns
    interface GstReportProjection {
        Long getOrderId();
        LocalDateTime getOrderDate();
        String getCustomerName();
        String getProductName();
        String getHsnCode();
        Integer getQuantity();
        Double getUnitPrice();
        Double getTaxableValue();
        Double getCgst();
        Double getSgst();
        Double getTotalAmount();
    }

    public  Optional<Order> findByTrackingId(String trackingId);

    public List<Order> findByStatusIn(List<String> statuses);


}