package com.softvent.finflow.transactions.paymentapplications;

import com.softvent.finflow.common.BusinessException;
import com.softvent.finflow.transactions.enums.InvoiceStatus;
import com.softvent.finflow.transactions.invoices.entity.Invoice;
import com.softvent.finflow.transactions.paymentapplications.dto.*;
import com.softvent.finflow.transactions.paymentapplications.entity.PaymentApplication;
import com.softvent.finflow.transactions.receipts.dto.ReceiptApplicationResponse;
import com.softvent.finflow.transactions.receipts.entity.Receipt;

import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class PaymentApplicationService {

    // CREATE PAYMENT APPLICATION
    @Transactional
    public PaymentApplicationResponse applyPayment(PaymentApplicationRequest request) {

        // --- 1. Fetch Receipt ---
        Receipt receipt = Receipt.find(
                "SELECT r " +
                        "FROM Receipt r " +
                        "JOIN FETCH r.customer " +
                        "WHERE r.receiptNumber = :receiptNumber " +
                        "AND r.deletedAt IS NULL",
                Parameters.with("receiptNumber", request.receiptNumber)
        ).firstResult();

        if (receipt == null) {
            throw new BusinessException(
                    "Receipt not found.",
                    Response.Status.NOT_FOUND.getStatusCode() // 404
            );
        }
        if (receipt.unappliedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(
                    "No remaining balance in receipt.",
                    Response.Status.BAD_REQUEST.getStatusCode() // 400
            );
        }

        // --- 2. Validate Applications ---
        Map<String, Invoice> invoiceMap = new HashMap<>();
        BigDecimal totalApplied = BigDecimal.ZERO;
        {
            // --- Duplicate Invoice Check ---
            Set<String> uniqueInvoices = new HashSet<>();
            for (PaymentApplicationItems app : request.applications) {
                if (!uniqueInvoices.add(app.invoiceNumber)) {
                    throw new BusinessException(
                            "Duplicate invoice in request: " + app.invoiceNumber,
                            Response.Status.BAD_REQUEST.getStatusCode()
                    );
                }
            }

            // --- Total Applied Check (Null Safe) ---
            totalApplied = request.applications.stream()
                    .map(app -> app.appliedAmount == null
                            ? BigDecimal.ZERO
                            : app.appliedAmount
                    )
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalApplied.compareTo(receipt.unappliedAmount) > 0) {
                throw new BusinessException(
                        "Total applied amount exceeds receipt balance.",
                        Response.Status.BAD_REQUEST.getStatusCode()
                );
            }

            // --- Bulk Fetch to fix N+1 Query Problem ---
            List<String> invoiceNumbers = request.applications.stream()
                    .map(app -> app.invoiceNumber)
                    .toList();

            List<Invoice> fetchedInvoices = Invoice.find(
                    "SELECT i " +
                            "FROM Invoice i " +
                            "JOIN FETCH i.customer " +
                            "WHERE i.invoiceNumber IN (:invoiceNumbers) " +
                            "AND i.deletedAt IS NULL",
                    Parameters.with("invoiceNumbers", invoiceNumbers)
            ).list();

            invoiceMap = fetchedInvoices.stream()
                    .collect(Collectors.toMap(inv -> inv.invoiceNumber, inv -> inv));

            // --- Validation Loop (NO DB WRITES) ---
            for (PaymentApplicationItems appReq : request.applications) {

                Invoice invoice = invoiceMap.get(appReq.invoiceNumber);

                if (invoice == null) {
                    throw new BusinessException(
                            "Invoice not found: " + appReq.invoiceNumber,
                            Response.Status.NOT_FOUND.getStatusCode() // 404
                    );
                }
                if (!invoice.customer.cid.equals(receipt.customer.cid)) {
                    throw new BusinessException(
                            "Invoice does not belong to receipt customer: " + appReq.invoiceNumber,
                            Response.Status.BAD_REQUEST.getStatusCode() // 400
                    );
                }
                if (invoice.status == InvoiceStatus.VOID) {
                    throw new BusinessException(
                            "Cannot apply to void invoice: " + appReq.invoiceNumber,
                            Response.Status.BAD_REQUEST.getStatusCode() // 400
                    );
                }
                if (appReq.appliedAmount.compareTo(invoice.balanceDue) > 0) {
                    throw new BusinessException(
                            "Applied amount exceeds invoice balance: " + appReq.invoiceNumber,
                            Response.Status.BAD_REQUEST.getStatusCode() // 400
                    );
                }
            }
        }


        List<ReceiptApplicationResponse> responses = new ArrayList<>();

        // --- 3. Execution Loop (Apply Payments) ---
        for (PaymentApplicationItems appReq : request.applications) {

            Invoice invoice = invoiceMap.get(appReq.invoiceNumber);

            // Persist application
            PaymentApplication payment = new PaymentApplication();
            payment.invoice = invoice;
            payment.receipt = receipt;
            payment.appliedAmount = appReq.appliedAmount;

            payment.persist();

            // Map response
            ReceiptApplicationResponse res = new ReceiptApplicationResponse();
            res.invoiceNumber = invoice.invoiceNumber;
            res.appliedAmount = payment.appliedAmount;
            res.appliedAt = payment.appliedAt;

            responses.add(res);

            // Update cached balances
            invoice.balanceDue = invoice.balanceDue.subtract(appReq.appliedAmount);
            receipt.unappliedAmount = receipt.unappliedAmount.subtract(appReq.appliedAmount);

            updateInvoiceStatus(invoice);
        }


        // --- 4. Return Application Response ---
        return new PaymentApplicationResponse(
                receipt.receiptNumber,
                totalApplied,
                receipt.unappliedAmount,
                responses
        );
    }

    private void updateInvoiceStatus(Invoice invoice) {

        if (invoice.balanceDue.compareTo(invoice.totalAmount) == 0) {
            invoice.status = InvoiceStatus.UNPAID;
        }
        else if (invoice.balanceDue.compareTo(BigDecimal.ZERO) == 0) {
            invoice.status = InvoiceStatus.PAID;
        }
        else {
            invoice.status = InvoiceStatus.PARTIAL;
        }
    }
}