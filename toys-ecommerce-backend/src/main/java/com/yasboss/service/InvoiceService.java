package com.yasboss.service;

import java.io.ByteArrayOutputStream;

import org.openpdf.text.Document;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import com.yasboss.model.Order;

@Service
public class InvoiceService {

    public byte[] generateInvoicePdf(Order order) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Add Title
            Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            document.add(new Paragraph("TOY STORE INVOICE", font));
            document.add(new Paragraph("Order ID: " + order.getOrderId()));
            document.add(new Paragraph("Customer: " + order.getUserEmail()));
            document.add(new Paragraph("Date: " + order.getCreatedAt()));
            document.add(new Paragraph("--------------------------------------------------"));

            // Add Table or Item Details
            document.add(new Paragraph("Total Amount Paid: INR " + order.getTotalAmount()));
            document.add(new Paragraph("\nThank you for shopping with us!"));

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }
}