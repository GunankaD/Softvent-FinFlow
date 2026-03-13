package com.softvent.finflow.transactions.invoices.service;

import com.softvent.finflow.common.BusinessException;
import com.softvent.finflow.customers.entity.Customer;
import com.softvent.finflow.items.entity.Item;
import com.softvent.finflow.transactions.enums.InvoiceStatus;
import com.softvent.finflow.transactions.invoiceitems.entity.InvoiceItem;
import com.softvent.finflow.transactions.invoices.dto.InvoiceCreateRequest;
import com.softvent.finflow.transactions.invoices.dto.InvoiceDetailResponse;
import com.softvent.finflow.transactions.invoices.entity.Invoice;

import com.softvent.finflow.transactions.paymentapplications.entity.PaymentApplication;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class InvoiceService {

    // CREATE INVOICE
    @Transactional
    public String createInvoice(InvoiceCreateRequest request) {

        Customer customer = Customer.findById(request.cid);
        if (customer == null) {
            throw new BusinessException(
                    "Customer not found.",
                    Response.Status.NOT_FOUND.getStatusCode()
            );
        }

        Invoice invoice = new Invoice();
        invoice.customer = customer;
        invoice.invoiceDate = request.invoiceDate;
        invoice.dueDate = request.dueDate;
        invoice.invoiceNumber = generateInvoiceNumber();
        invoice.persist();

        BigDecimal invoiceTotal = BigDecimal.ZERO;

        // Create new row in InvoiceItem for each item
        for (InvoiceCreateRequest.InvoiceItemRequest itemReq : request.items) {

            Item item = Item.findById(itemReq.iid);
            if (item == null || !item.isActive) {
                throw new BusinessException(
                        "Invalid or inactive item.",
                        Response.Status.BAD_REQUEST.getStatusCode()
                );
            }

            InvoiceItem invoiceItem = new InvoiceItem();
            invoiceItem.invoice = invoice;
            invoiceItem.item = item;

            invoiceItem.itemCode = item.icode;
            invoiceItem.itemName = item.name;

            invoiceItem.quantity = itemReq.quantity;
            invoiceItem.rate = item.salesRate;
            invoiceItem.gstRate = item.gstRate;
            invoiceItem.discountPercent = itemReq.discountPercent;

            calculateAmounts(invoiceItem);

            invoiceTotal = invoiceTotal.add(invoiceItem.lineTotal);

            invoiceItem.persist();
        }

        invoice.totalAmount = invoiceTotal;
        invoice.persist();

        return invoice.invoiceNumber;
    }

    // GET INVOICE
    public InvoiceDetailResponse getInvoiceByNumber(String invoiceNumber) {

        Invoice invoice = Invoice.find(
                "invoiceNumber = ?1 AND deletedAt IS NULL",
                invoiceNumber
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
        response.ccode = invoice.customer.ccode;
        response.cname = invoice.customer.cname;

        response.invoiceDate = invoice.invoiceDate;
        response.dueDate = invoice.dueDate;
        response.status = invoice.status;

        response.totalAmount = invoice.totalAmount;

        // Fetch invoice items
        List<InvoiceItem> items = InvoiceItem.list("invoice = ?1", invoice);

        List<InvoiceDetailResponse.InvoiceItemResponse> itemResponses = new ArrayList<>();

        // Fetch all invoice items
        for (InvoiceItem item : items) {

            InvoiceDetailResponse.InvoiceItemResponse itemRes =
                    new InvoiceDetailResponse.InvoiceItemResponse();

            itemRes.iid = item.item.iid;
            itemRes.itemCode = item.itemCode;
            itemRes.itemName = item.itemName;
            itemRes.quantity = item.quantity;
            itemRes.rate = item.rate;
            itemRes.gstRate = item.gstRate;
            itemRes.lineTotal = item.lineTotal;

            itemResponses.add(itemRes);
        }

        response.items = itemResponses;

        // Calculate payments
        BigDecimal paidAmount = (BigDecimal) PaymentApplication
                .getEntityManager()
                .createQuery(
                        "SELECT COALESCE(SUM(p.appliedAmount), 0) " +
                                "FROM PaymentApplication p " +
                                "WHERE p.invoice = :invoice"
                )
                .setParameter("invoice", invoice)
                .getSingleResult();

        response.paidAmount = paidAmount;
        response.balanceAmount = invoice.totalAmount.subtract(paidAmount);

        return response;
    }

    // DELETE INVOICE
    @Transactional
    public void deleteInvoiceByNumber(String invoiceNumber) {

        Invoice invoice = Invoice.find(
                "invoiceNumber = ?1 AND deletedAt IS NULL",
                invoiceNumber
        ).firstResult();

        if (invoice == null || invoice.deletedAt != null) {
            throw new BusinessException(
                    "Invoice not found.",
                    Response.Status.NOT_FOUND.getStatusCode()
            );
        }
        if (!PaymentApplication.list("invoice = ?1", invoice).isEmpty()) {
            throw new BusinessException(
                    "Cannot void invoice with applied payments.",
                    Response.Status.BAD_REQUEST.getStatusCode()
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
