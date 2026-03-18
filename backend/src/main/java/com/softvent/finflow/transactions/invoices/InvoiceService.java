package com.softvent.finflow.transactions.invoices;

import com.softvent.finflow.common.BusinessException;
import com.softvent.finflow.customers.entity.Customer;
import com.softvent.finflow.items.entity.Item;
import com.softvent.finflow.transactions.enums.InvoiceStatus;
import com.softvent.finflow.transactions.invoiceitems.entity.InvoiceItem;
import com.softvent.finflow.transactions.invoices.dto.*;
import com.softvent.finflow.transactions.invoices.entity.Invoice;

import com.softvent.finflow.transactions.paymentapplications.entity.PaymentApplication;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class InvoiceService {

    // CREATE INVOICE
    @Transactional
    public InvoiceCreateResponse createInvoice(InvoiceCreateRequest request) {

        Customer customer = Customer.findById(request.cid);
        if (customer == null) {
            throw new BusinessException(
                    "Customer not found.",
                    Response.Status.NOT_FOUND.getStatusCode()
            );
        }

        // --- Bulk Fetch Items (N+1 Fix) ---
        // Extract all requested item IDs
        List<Long> itemIds = request.items.stream()
                .map(item -> item.iid)
                .collect(Collectors.toList());

        // Fetch all matching active items in one query
        List<Item> fetchedItems = Item.find(
                "iid IN (:ids) " +
                "AND isActive = true",
                Parameters.with("ids", itemIds)
        ).list();

        // Map them for O(1) lookups: Map<iid, Item>
        Map<Long, Item> itemMap = fetchedItems.stream()
                .collect(Collectors.toMap(item -> item.iid, item -> item));

        // --- Validate all items BEFORE persisting anything ---
        Set<Long> uniqueItems = new HashSet<>();
        for (InvoiceCreateRequest.InvoiceItemRequest itemReq : request.items) {

            // INVALID ITEM CHECK
            if (!itemMap.containsKey(itemReq.iid)) {
                throw new BusinessException(
                        "Invalid or inactive item ID: " + itemReq.iid,
                        Response.Status.BAD_REQUEST.getStatusCode()
                );
            }

            // DUPLICATE ITEM CHECK
            if (!uniqueItems.add(itemReq.iid)) {
                throw new BusinessException(
                        "Duplicate item in invoice: " + itemReq.iid,
                        Response.Status.BAD_REQUEST.getStatusCode()
                );
            }
        }

        // --- Setup the invoice ---
        Invoice invoice = new Invoice();
        invoice.customer = customer;
        invoice.invoiceDate = request.invoiceDate;
        invoice.dueDate = request.dueDate;
        invoice.invoiceNumber = generateInvoiceNumber();

        // We need it persisted here so it generates an ID for the InvoiceItems to reference.
        invoice.persist();

        BigDecimal invoiceTotal = BigDecimal.ZERO;

        // Loop over all line items, process and persist them
        for (InvoiceCreateRequest.InvoiceItemRequest itemReq : request.items) {

            Item item = itemMap.get(itemReq.iid);

            InvoiceItem invoiceItem = new InvoiceItem();
            invoiceItem.invoice = invoice;
            invoiceItem.item = item;

            invoiceItem.itemCode = item.icode;
            invoiceItem.itemName = item.name;

            invoiceItem.quantity = itemReq.quantity;
            invoiceItem.rate = item.salesRate;
            invoiceItem.gstRate = item.gstRate;
            invoiceItem.discountPercent = itemReq.discountPercent != null ? itemReq.discountPercent : BigDecimal.ZERO;
            calculateAmounts(invoiceItem);

            invoiceTotal = invoiceTotal.add(invoiceItem.lineTotal);

            invoiceItem.persist();
        }

        invoice.totalAmount = invoiceTotal;
        invoice.balanceDue = invoiceTotal;
        // No need to call persist() again;
        // Hibernate automatically flushes changes to managed entities at the end of the transaction!

        return new InvoiceCreateResponse(invoice.invoiceNumber);
    }

    // GET INVOICES
    public List<InvoiceSummaryResponse> getInvoices() {

        // 1. Fetch Invoices and Customers together in exactly 1 query (N+1 Fix)
        List<Invoice> invoices = Invoice.find(
                "SELECT i " +
                        "FROM Invoice i " +
                        "JOIN FETCH i.customer " +
                        "WHERE i.deletedAt IS NULL " +
                        "ORDER BY i.createdAt DESC"
        ).list();

        // 2. Initialize the empty response list
        List<InvoiceSummaryResponse> responses = new ArrayList<>();

        // 3. Loop and map the data
        for (Invoice invoice : invoices) {

            InvoiceSummaryResponse res = new InvoiceSummaryResponse();

            res.invid = invoice.invid;
            res.invoiceNumber = invoice.invoiceNumber;

            // This is safe and fast because the customer was already fetched!
            res.ccode = invoice.customer.ccode;
            res.cname = invoice.customer.cname;

            res.totalAmount = invoice.totalAmount;
            res.status = invoice.status;
            res.invoiceDate = invoice.invoiceDate;
            res.dueDate = invoice.dueDate;
            res.balanceAmount = invoice.balanceDue;

            responses.add(res);
        }

        return responses;
    }
    public InvoiceDetailResponse getInvoiceByNumber(String invoiceNumber) {

        // --- Fetch Invoice + Customer in 1 query ---
        Invoice invoice = Invoice.find(
                "SELECT i " +
                        "FROM Invoice i " +
                        "JOIN FETCH i.customer " +
                        "WHERE i.invoiceNumber = :invoiceNumber " +
                        "AND i.deletedAt IS NULL",
                Parameters.with("invoiceNumber", invoiceNumber)
        ).firstResult();

        if (invoice == null) {
            throw new BusinessException(
                    "Invoice not found.",
                    Response.Status.NOT_FOUND.getStatusCode()
            );
        }

        InvoiceDetailResponse response = new InvoiceDetailResponse();

        response.invid = invoice.invid;
        response.invoiceNumber = invoice.invoiceNumber;
        response.ccode = invoice.customer.ccode; // No extra query!
        response.cname = invoice.customer.cname;

        response.invoiceDate = invoice.invoiceDate;
        response.dueDate = invoice.dueDate;
        response.status = invoice.status;
        response.totalAmount = invoice.totalAmount;
        response.balanceAmount = invoice.balanceDue;
        response.paidAmount = invoice.totalAmount.subtract(invoice.balanceDue);

        // --- Fetch Items + Master Items in 1 query ---
        List<InvoiceItem> items = InvoiceItem.find(
                "SELECT ii " +
                        "FROM InvoiceItem ii " +
                        "JOIN FETCH ii.item " +
                        "WHERE ii.invoice = :invoice",
                Parameters.with("invoice", invoice)
        ).list();

        List<InvoiceItemResponse> itemResponses = new ArrayList<>();
        for (InvoiceItem item : items) {

            InvoiceItemResponse itemRes = new InvoiceItemResponse();

            itemRes.iid = item.item.iid; // No extra query!
            itemRes.itemCode = item.itemCode;
            itemRes.itemName = item.itemName;
            itemRes.quantity = item.quantity;
            itemRes.rate = item.rate;
            itemRes.gstRate = item.gstRate;
            itemRes.lineTotal = item.lineTotal;

            itemResponses.add(itemRes);
        }
        response.items = itemResponses;

        // --- Fetch Payment Applications & Receipts ---
        List<PaymentApplication> payments = PaymentApplication.find(
                "SELECT p " +
                        "FROM PaymentApplication p " +
                        "JOIN FETCH p.receipt " +
                        "WHERE p.invoice = :invoice" +
                        "ORDER BY p.appliedAt ASC",

                Parameters.with("invoice", invoice)
        ).list();

        List<InvoicePaymentResponse> paymentResponses = new ArrayList<>();
        for (PaymentApplication p : payments) {

            InvoicePaymentResponse payRes = new InvoicePaymentResponse();

            payRes.receiptNumber = p.receipt.receiptNumber;
            payRes.appliedAmount = p.appliedAmount;
            payRes.appliedAt = p.appliedAt;

            paymentResponses.add(payRes);
        }
        response.payments = paymentResponses;

        return response;
    }

    // DELETE INVOICE
    @Transactional
    public void deleteInvoiceByNumber(String invoiceNumber) {

        Invoice invoice = Invoice.find(
                "invoiceNumber = :invoiceNumber AND deletedAt IS NULL",
                Parameters.with("invoiceNumber", invoiceNumber)
        ).firstResult();

        if (invoice == null) {
            throw new BusinessException(
                    "Invoice not found.",
                    Response.Status.NOT_FOUND.getStatusCode() // 404
            );
        }

        long paymentCount = PaymentApplication.count(
                "invoice = :invoice",
                Parameters.with("invoice", invoice)
        );
        if (paymentCount > 0) {
            throw new BusinessException(
                    "Cannot void invoice with applied payments.",
                    Response.Status.BAD_REQUEST.getStatusCode() // 400
            );
        }

        invoice.status = InvoiceStatus.VOID;
        invoice.deletedAt = Instant.now();
    }

    // HELPERS
    private void calculateAmounts(InvoiceItem invoiceItem) {

        BigDecimal baseAmount = invoiceItem.quantity.multiply(invoiceItem.rate);

        BigDecimal discountAmount = baseAmount.multiply(invoiceItem.discountPercent)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal lineAmount = baseAmount.subtract(discountAmount);

        BigDecimal gstAmount = lineAmount.multiply(invoiceItem.gstRate)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal lineTotal = lineAmount.add(gstAmount);

        invoiceItem.lineAmount = lineAmount;
        invoiceItem.gstAmount = gstAmount;
        invoiceItem.lineTotal = lineTotal;
    }
    private String generateInvoiceNumber() {

        java.time.YearMonth ym = java.time.YearMonth.now();
        String year = String.valueOf(ym.getYear());

        Long seq = ((Number) Invoice.getEntityManager()
                .createNativeQuery("SELECT nextval('invoice_number_seq')")
                .getSingleResult())
                .longValue();

        return "INV-" + year + "-" + String.format("%05d", seq);
    }
}
