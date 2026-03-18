package com.softvent.finflow.transactions.paymentapplications;

import com.softvent.finflow.common.BusinessException;
import com.softvent.finflow.transactions.enums.InvoiceStatus;
import com.softvent.finflow.transactions.invoices.entity.Invoice;
import com.softvent.finflow.transactions.paymentapplications.dto.*;
import com.softvent.finflow.transactions.paymentapplications.entity.PaymentApplication;
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
    public PaymentApplyResponse applyPayment(PaymentApplyRequest request) {

        Receipt receipt = Receipt.find(
                "receiptNumber = :receiptNumber AND deletedAt IS NULL",
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

        // --- Duplicate invoice check ---
        Set<String> uniqueInvoices = new HashSet<>();
        for (PaymentApplicationRequest app : request.applications) {
            if (!uniqueInvoices.add(app.invoiceNumber)) {
                throw new BusinessException(
                        "Duplicate invoice in request: " + app.invoiceNumber,
                        Response.Status.BAD_REQUEST.getStatusCode()
                );
            }
        }

        // --- Pre-calc total applied ---
        BigDecimal totalApplied = request.applications.stream()
                .map(a -> a.appliedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalApplied.compareTo(receipt.unappliedAmount) > 0) {
            throw new BusinessException(
                    "Total applied amount exceeds receipt balance.",
                    Response.Status.BAD_REQUEST.getStatusCode()
            );
        }

        // Bulk fetch invoices
        List<String> invoiceNumbers = request.applications.stream()
                .map(a -> a.invoiceNumber)
                .collect(Collectors.toList());

        List<Invoice> invoices = Invoice.find(
                "invoiceNumber IN (:invNumbers) AND deletedAt IS NULL",
                Parameters.with("invNumbers", invoiceNumbers)
        ).list();

        Map<String, Invoice> invoiceMap = invoices.stream()
                .collect(Collectors.toMap(i -> i.invoiceNumber, i -> i));

        // Loop and process each invoice
        for (PaymentApplicationRequest appReq : request.applications) {

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
            if (appReq.appliedAmount.compareTo(receipt.unappliedAmount) > 0) {
                throw new BusinessException(
                        "Applied amount exceeds receipt balance.",
                        Response.Status.BAD_REQUEST.getStatusCode() // 400
                );
            }

            // Persist application
            PaymentApplication payment = new PaymentApplication();
            payment.invoice = invoice;
            payment.receipt = receipt;
            payment.appliedAmount = appReq.appliedAmount;

            payment.persist();

            // Update cached balances
            invoice.balanceDue = invoice.balanceDue.subtract(appReq.appliedAmount);
            receipt.unappliedAmount = receipt.unappliedAmount.subtract(appReq.appliedAmount);

            updateInvoiceStatus(invoice);
        }

        return new PaymentApplyResponse(
                receipt.receiptNumber,
                totalApplied,
                receipt.unappliedAmount
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