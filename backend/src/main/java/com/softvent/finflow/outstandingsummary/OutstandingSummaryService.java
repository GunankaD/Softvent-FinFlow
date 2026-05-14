package com.softvent.finflow.outstandingsummary;

import com.softvent.finflow.outstandingsummary.dto.OutstandingSummaryResponse;

import com.softvent.finflow.customers.entity.Customer;

import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class OutstandingSummaryService {

    // GET OUTSTANDING SUMMARY
    public List<OutstandingSummaryResponse> getOutstandingSummary() {

        @SuppressWarnings("unchecked")
        List<Object[]> rows = Customer.getEntityManager()
                .createNativeQuery("""
                    SELECT
                        c.ccode,
                        c.cname,

                        COALESCE((
                            SELECT SUM(i.total_amount)
                            FROM invoices i
                            WHERE i.cid = c.cid
                              AND i.deleted_at IS NULL
                              AND i.status != 'VOID'
                        ), 0) AS total_invoice_amount,

                        COALESCE((
                            SELECT SUM(r.total_received)
                            FROM receipts r
                            WHERE r.cid = c.cid
                              AND r.deleted_at IS NULL
                        ), 0) AS total_receipt_amount,

                        COALESCE((
                            SELECT SUM(pa.applied_amount)
                            FROM payment_applications pa
                            JOIN receipts r
                              ON r.rid = pa.rid
                            WHERE r.cid = c.cid
                              AND r.deleted_at IS NULL
                        ), 0) AS total_applied_amount

                    FROM customers c
                    WHERE EXISTS (
                                SELECT 1
                                FROM invoices i
                                WHERE i.cid = c.cid
                                  AND i.deleted_at IS NULL
                                  AND i.status != 'VOID'
                            )
                            OR EXISTS (
                                SELECT 1
                                FROM receipts r
                                WHERE r.cid = c.cid
                                  AND r.deleted_at IS NULL
                            )
                    ORDER BY c.created_at DESC
                """)
                .getResultList();

        List<OutstandingSummaryResponse> responses = new ArrayList<>();

        for (Object[] row : rows) {

            OutstandingSummaryResponse response =
                    new OutstandingSummaryResponse();

            response.ccode = (String) row[0];
            response.cname = (String) row[1];

            response.totalInvoiceAmount = (BigDecimal) row[2];
            response.totalReceiptAmount = (BigDecimal) row[3];
            response.totalAppliedAmount = (BigDecimal) row[4];

            response.netOutstanding =
                    response.totalInvoiceAmount.subtract(
                            response.totalAppliedAmount
                    );

            responses.add(response);
        }

        return responses;
    }
}