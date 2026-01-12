package com.yasboss.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderId; // Format: YB-123456789

    private String userEmail;
    private Double totalAmount;
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "gift_message", columnDefinition = "TEXT")
    private String giftMessage;

    @Column(name = "billing_address", columnDefinition = "TEXT")
    private String billingAddress;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isGift = false;

    private String refundStatus = "NONE";

    private String paymentMethod;

    private java.util.Date createdAt = new java.util.Date();


    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference // Prevents recursion when sending JSON to React
    private List<OrderItem> items;

    // GST and Redemption fields
    private BigDecimal gstAmount;
    private BigDecimal cgst;
    private BigDecimal sgst;
    private Integer pointsRedeemed;

    private String orderReference;

    private LocalDateTime OrderDate;

    // Track points associated with this order
    private Integer pointsToEarn;
    private boolean pointsCredited = false;

    private String customerPhone;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String deliveryAgentName;
    private String deliveryAgentPhone;
    private String customerNotes;
    private LocalDateTime estimatedDelivery;
    
    // JSONB tracking history
    private String trackingStatusHistory;

    private String appliedCoupon;
    private Double discountAmount;

    private String customerGstin; // GSTIN/UIN of Recipient
    private String placeOfSupply; // e.g., "29-Karnataka"
    private String invoiceNumber; // e.g., "MAA4-563"
    private LocalDateTime invoiceDate;
    
    private Double taxableValue;
    private Double igstAmount;
    private Double cgstAmount;
    private Double sgstAmount;
    private Double totalInvoiceValue;
    
    private String invoiceType; // e.g., "Regular B2B"
    private String ecommerceGstin; // 33AAICA3918J1C0

    private String shiprocketOrderId; // ✨ Added for ShipRocket integration
    private String trackingId;         // ✨ Added
    private String trackingUrl;        // ✨ Added for ShipRocket
    private String trackingStatus;     // ✨ Added
    private Integer pointsUsed;

    private LocalDateTime deliveredAt;

    private String paymentStatus;


}