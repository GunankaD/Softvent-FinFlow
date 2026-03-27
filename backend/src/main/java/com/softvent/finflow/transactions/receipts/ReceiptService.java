package com.softvent.finflow.transactions.receipts;

import com.softvent.finflow.common.BusinessException;
import com.softvent.finflow.customers.entity.Customer;
import com.softvent.finflow.transactions.paymentapplications.entity.PaymentApplication;
import com.softvent.finflow.transactions.receipts.dto.*;
import com.softvent.finflow.transactions.receipts.entity.Receipt;

import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import java.util.*;

@ApplicationScoped
public class ReceiptService {

    // CREATE RECEIPT
    @Transactional
    public ReceiptCreateResponse createReceipt(ReceiptCreateRequest request) {

        // --- 1. Fetch Customer ---
        Customer customer = Customer.<Customer>find("ccode", request.ccode)
                .firstResultOptional()
                .orElseThrow(() -> new BusinessException(
                        "Customer not found: " + request.ccode,
                        Response.Status.NOT_FOUND.getStatusCode() // 404
                ));

        // --- 2. Create Receipt ---
        Receipt receipt = new Receipt();
        receipt.customer = customer;
        receipt.paymentMode = request.paymentMode;
        receipt.referenceNumber = request.referenceNumber;
        receipt.totalReceived = request.totalReceived;
        receipt.unappliedAmount = request.totalReceived;
        receipt.receiptDate = request.receiptDate;
        receipt.receiptNumber = generateReceiptNumber();

        receipt.persist();

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
            res.appliedAt = app.appliedAt;

            appResponses.add(res);
        }

        response.applications = appResponses;

        return response;
    }

    // DELETE RECEIPTS
    @Transactional
    public void deleteReceiptByNumber(String receiptNumber) {

        Receipt receipt = Receipt.find(
                "receiptNumber = :receiptNumber AND deletedAt IS NULL",
                Parameters.with("receiptNumber", receiptNumber)
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