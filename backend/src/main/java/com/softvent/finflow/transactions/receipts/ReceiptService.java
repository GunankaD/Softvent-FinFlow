package com.softvent.finflow.transactions.receipts;

import com.softvent.finflow.common.BusinessException;
import com.softvent.finflow.customers.entity.Customer;
import com.softvent.finflow.transactions.enums.InvoiceStatus;
import com.softvent.finflow.transactions.invoices.entity.Invoice;
import com.softvent.finflow.transactions.paymentapplications.entity.PaymentApplication;
import com.softvent.finflow.transactions.receipts.dto.*;
import com.softvent.finflow.transactions.receipts.entity.Receipt;

import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class ReceiptService {

    // CREATE RECEIPT
    @Transactional
    public ReceiptCreateResponse createReceipt(ReceiptCreateRequest request) {

        Customer customer = Customer.<Customer>find("ccode", request.ccode)
                .firstResultOptional()
                .orElseThrow(() -> new BusinessException(
                        "Customer not found: " + request.ccode,
                        Response.Status.NOT_FOUND.getStatusCode() // 404
                ));

        // --- Pre-validate total applied amount ---
        // Sum up all applied amounts before hitting the database or creating the receipt.
        if (request.applications != null && !request.applications.isEmpty()) {
            BigDecimal totalApplied = request.applications.stream()
                    .map(
                            app -> app.appliedAmount == null
                                    ? BigDecimal.ZERO
                                    : app.appliedAmount
                    )
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalApplied.compareTo(request.totalReceived) > 0) {
                throw new BusinessException(
                        "Total applied amount across all invoices cannot exceed the receipt total.",
                        Response.Status.BAD_REQUEST.getStatusCode() // 400
                );
            }

            Set<String> uniqueInvoices = new HashSet<>();
            for (ReceiptApplicationRequest app : request.applications) {
                if (!uniqueInvoices.add(app.invoiceNumber)) {
                    throw new BusinessException(
                            "Duplicate invoice in request: " + app.invoiceNumber,
                            Response.Status.BAD_REQUEST.getStatusCode() // 400
                    );
                }
            }
        }

        Receipt receipt = new Receipt();
        receipt.customer = customer;
        receipt.paymentMode = request.paymentMode;
        receipt.referenceNumber = request.referenceNumber;
        receipt.totalReceived = request.totalReceived;
        receipt.unappliedAmount = request.totalReceived;
        receipt.receiptDate = request.receiptDate;
        receipt.receiptNumber = generateReceiptNumber();

        receipt.persist();

        // Loop over each invoice application and apply
        if (request.applications != null && !request.applications.isEmpty()) {

            // --- Bulk Fetch to fix N+1 Query Problem ---
            // 1. Extract all invoice numbers into a list
            List<String> invoiceNumbers = request.applications.stream()
                    .map(app -> app.invoiceNumber)
                    .collect(Collectors.toList());

            // 2. Fetch all matching invoices in a single database round-trip
            List<Invoice> fetchedInvoices = Invoice.find(
                    "invoiceNumber IN (:invoiceNumbers) AND deletedAt IS NULL",
                    Parameters.with("invoiceNumbers", invoiceNumbers)
            ).list();

            // 3. Convert the list to a Map for lightning-fast O(1) lookups inside the loop
            Map<String, Invoice> invoiceMap = fetchedInvoices.stream()
                    .collect(Collectors.toMap(inv -> inv.invoiceNumber, inv -> inv));

            for (ReceiptApplicationRequest appReq : request.applications) {

                // Grab the invoice from our pre-fetched map instead of querying the DB
                Invoice invoice = invoiceMap.get(appReq.invoiceNumber);

                // --- Validity Checks ---
                if (invoice == null) {
                    throw new BusinessException(
                            "Invoice not found: " + appReq.invoiceNumber,
                            Response.Status.NOT_FOUND.getStatusCode()
                    );
                }
                if (!invoice.customer.cid.equals(customer.cid)) {
                    throw new BusinessException(
                            "Invoice " + appReq.invoiceNumber + " does not belong to this customer.",
                            Response.Status.BAD_REQUEST.getStatusCode()
                    );
                }
                if (invoice.status == InvoiceStatus.VOID) {
                    throw new BusinessException(
                            "Cannot apply payment to void invoice: " + appReq.invoiceNumber,
                            Response.Status.BAD_REQUEST.getStatusCode()
                    );
                }
                if (appReq.appliedAmount.compareTo(invoice.balanceDue) > 0) {
                    throw new BusinessException(
                            "Applied amount exceeds invoice balance for: " + appReq.invoiceNumber,
                            Response.Status.BAD_REQUEST.getStatusCode()
                    );
                }
                if (appReq.appliedAmount.compareTo(receipt.unappliedAmount) > 0) {
                    throw new BusinessException(
                            "Applied amount exceeds remaining receipt balance.",
                            Response.Status.BAD_REQUEST.getStatusCode()
                    );
                }

                PaymentApplication payment = new PaymentApplication();
                payment.invoice = invoice;
                payment.receipt = receipt;
                payment.appliedAmount = appReq.appliedAmount;

                payment.persist();

                invoice.balanceDue = invoice.balanceDue.subtract(appReq.appliedAmount);
                receipt.unappliedAmount = receipt.unappliedAmount.subtract(appReq.appliedAmount);

                updateInvoiceStatus(invoice);
            }
        }

        return new ReceiptCreateResponse(receipt.receiptNumber);
    }

    // GET RECEIPTS
    public List<ReceiptSummaryResponse> getReceipts() {

        // Use a custom JPQL query to fetch the customer simultaneously
        List<Receipt> receipts = Receipt.find(
                "SELECT r " +
                        "FROM Receipt r " +
                        "JOIN FETCH r.customer " +
                        "WHERE r.deletedAt IS NULL " +
                        "ORDER BY r.createdAt DESC"
        ).list();

        List<ReceiptSummaryResponse> responses = new ArrayList<>();

        for (Receipt receipt : receipts) {
            ReceiptSummaryResponse res = new ReceiptSummaryResponse();
            res.receiptNumber = receipt.receiptNumber;
            res.ccode = receipt.customer.ccode;
            res.cname = receipt.customer.cname;
            res.paymentMode = receipt.paymentMode;
            res.totalReceived = receipt.totalReceived;
            res.unappliedAmount = receipt.unappliedAmount;
            res.receiptDate = receipt.receiptDate;

            responses.add(res);
        }

        return responses;
    }
    public ReceiptDetailResponse getReceiptByNumber(String receiptNumber) {

        // --- Fetch Receipt + Customer ---
        Receipt receipt = Receipt.find(
                "SELECT r " +
                        "FROM Receipt r " +
                        "JOIN FETCH r.customer " +
                        "WHERE r.receiptNumber = :receiptNumber " +
                        "AND r.deletedAt IS NULL",
                Parameters.with("receiptNumber", receiptNumber)
        ).firstResult();

        if (receipt == null) {
            throw new BusinessException(
                    "Receipt not found.",
                    Response.Status.NOT_FOUND.getStatusCode()
            );
        }

        ReceiptDetailResponse response = new ReceiptDetailResponse();

        response.receiptNumber = receipt.receiptNumber;
        response.ccode = receipt.customer.ccode;
        response.cname = receipt.customer.cname;

        response.paymentMode = receipt.paymentMode;
        response.referenceNumber = receipt.referenceNumber;
        response.totalReceived = receipt.totalReceived;
        response.unappliedAmount = receipt.unappliedAmount;
        response.receiptDate = receipt.receiptDate;

        // --- Fetch Payment Applications + Invoice in one go ---
        List<PaymentApplication> applications = PaymentApplication.find(
                "SELECT p " +
                        "FROM PaymentApplication p " +
                        "JOIN FETCH p.invoice " +
                        "WHERE p.receipt = :receipt",
                Parameters.with("receipt", receipt)
        ).list();

        List<ReceiptApplicationResponse> appResponses = new ArrayList<>();

        for (PaymentApplication app : applications) {

            ReceiptApplicationResponse res = new ReceiptApplicationResponse();

            res.invoiceNumber = app.invoice.invoiceNumber;
            res.appliedAmount = app.appliedAmount;

            appResponses.add(res);
        }

        response.applications = appResponses;

        return response;
    }

    // DELETE RECEIPTS
    @Transactional
    public void deleteReceiptByNumber(String receiptNumber) {

        Receipt receipt = Receipt.find(
                "receiptNumber = ?1 AND deletedAt IS NULL",
                receiptNumber
        ).firstResult();

        if (receipt == null) {
            throw new BusinessException(
                    "Receipt not found.",
                    Response.Status.NOT_FOUND.getStatusCode() // 404
            );
        }

        // Check if any payments applied
        long applicationCount = PaymentApplication.count(
                "receipt = :receipt",
                Parameters.with("receipt", receipt));

        if (applicationCount > 0) {
            throw new BusinessException(
                    "Cannot delete receipt with applied payments.",
                    Response.Status.BAD_REQUEST.getStatusCode() // 400
            );
        }

        receipt.deletedAt = java.time.Instant.now();
    }

    private void updateInvoiceStatus(Invoice invoice) {
        if (invoice.balanceDue.compareTo(invoice.totalAmount) == 0) {
            invoice.status = InvoiceStatus.UNPAID;
        } else if (invoice.balanceDue.compareTo(BigDecimal.ZERO) == 0) {
            invoice.status = InvoiceStatus.PAID;
        } else {
            invoice.status = InvoiceStatus.PARTIAL;
        }
    }

    private String generateReceiptNumber() {
        java.time.YearMonth ym = java.time.YearMonth.now();
        String year = String.valueOf(ym.getYear());

        Long seq = ((Number) Receipt.getEntityManager()
                .createNativeQuery("SELECT nextval('receipt_number_seq')")
                .getSingleResult())
                .longValue();

        return "REC-" + year + "-" + String.format("%05d", seq);
    }
}