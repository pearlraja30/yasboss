package com.yasboss.service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

import org.apache.commons.io.IOUtils;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Picture;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openpdf.text.Document;
import org.openpdf.text.Image;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.yasboss.repository.OrderRepository;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    public byte[] generateExcel(String type, String start, String end) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("GST Sales Report");

            // 1. Add Logo Image
            try (InputStream is = new ClassPathResource("static/images/logo.png").getInputStream()) {
                byte[] bytes = IOUtils.toByteArray(is);
                int pictureIdx = workbook.addPicture(bytes, Workbook.PICTURE_TYPE_PNG);
                CreationHelper helper = workbook.getCreationHelper();
                Drawing<?> drawing = sheet.createDrawingPatriarch();
                ClientAnchor anchor = helper.createClientAnchor();
                
                // Position at Col 0, Row 0
                anchor.setCol1(0);
                anchor.setRow1(0);
                Picture pict = drawing.createPicture(anchor, pictureIdx);
                pict.resize(1.0); // Keep original size
            }

            // 2. Adjust data rows to start below the logo (e.g., Row 5)
            String[] columns = {"Invoice No", "Date", "Customer", "Total"};
            Row headerRow = sheet.createRow(5); 
            // ... (rest of header and data logic)

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            return new byte[0];
        }
    }

    // --- 🔴 PDF WITH LOGO ---
    public byte[] generatePdf(String type, String start, String end) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. Add Logo
            try {
                Image logo = Image.getInstance(new ClassPathResource("static/images/logo.png").getURL());
                logo.scaleToFit(100, 100);
                logo.setAlignment(Image.ALIGN_RIGHT);
                document.add(logo);
            } catch (Exception e) {
                document.add(new Paragraph("YASBOSS TOYS")); // Fallback text
            }

            document.add(new Paragraph("GST SALES REPORT (" + start + " to " + end + ")"));
        
        // Create the Table
        PdfPTable table = new PdfPTable(7); // 7 columns based on your image
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        // Header Cells
        String[] headers = {"GSTIN", "Receiver", "Inv No", "Date", "Value", "Taxable", "Total"};
        for (String header : headers) {
            table.addCell(header);
        }

        // Add Data Rows (Fetch from DB based on start/end dates)
        // table.addCell("29ARLPK..."); 

        document.add(table);
        
        // 5. Close the document to flush all data to the stream
        document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    // --- ⚪ CSV GENERATION (Existing) ---
    public String generateCsv(String type, String start, String end) {
        return "Invoice,Date,Customer,Total\nINV-001,2026-01-09,Customer Name,1500.00";
    }
} 