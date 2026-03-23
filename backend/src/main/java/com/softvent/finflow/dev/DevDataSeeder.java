package com.softvent.finflow.dev;

import com.softvent.finflow.transactions.invoices.InvoiceService;
import com.softvent.finflow.transactions.invoices.dto.InvoiceCreateRequest;
import com.softvent.finflow.transactions.receipts.ReceiptService;
import com.softvent.finflow.transactions.receipts.dto.ReceiptCreateRequest;
import com.softvent.finflow.transactions.paymentapplications.PaymentApplicationService;
import com.softvent.finflow.transactions.paymentapplications.dto.*;
import com.softvent.finflow.transactions.enums.PaymentMode;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@ApplicationScoped
public class DevDataSeeder {

    @Inject InvoiceService invoiceService;
    @Inject ReceiptService receiptService;
    @Inject PaymentApplicationService paymentService;

    private final List<String> ccodes = List.of(
            "CUST2087","CUST7416","CUST4950","CUST4673","CUST7054","CUST0225","CUST5053",
            "CUST2095","CUST6146","CUST6858","CUST5330","CUST3105","CUST8032","CUST8966",
            "CUST6235","CUST2743","CUST7643","CUST7402","CUST4954","CUST4427","CUST4324",
            "CUST2687","CUST3824","CUST9517","CUST8470","CUST6543","CUST0738","CUST9881",
            "CUST8150","CUST8174","CUST2680","CUST2741","CUST0494","CUST3148","CUST6839",
            "CUST8897","CUST1579","CUST2864"
    );

    private final List<String> icodes = List.of(
            "ITM3034", "ITM7373", "ITM5652", "ITM5055",
            "ITM9762", "ITM8577", "ITM8004", "ITM9282", "ITM4275", "ITM6204", "ITM0217", "ITM0509",
            "ITM9541", "ITM7473", "ITM3230", "ITM1891", "ITM3185", "ITM4116", "ITM9689", "ITM2145",
            "ITM7370", "ITM0515", "ITM4871", "ITM9987", "ITM6052", "ITM8666", "ITM0329", "ITM1124",
            "ITM6469", "ITM8808", "ITM5351", "ITM8671", "ITM3816", "ITM1811", "ITM6559", "ITM9720",
            "ITM2355", "ITM4505"
    );

    @Transactional
    public void seed() {

        Random rand = new Random(42); // deterministic

        for (int i = 0; i < ccodes.size(); i++) {

            String ccode = ccodes.get(i);

            // pick 2 items
            List<String> shuffled = new ArrayList<>(icodes);
            Collections.shuffle(shuffled, rand);

            String item1 = shuffled.get(0);
            String item2 = shuffled.get(1);

            String invoiceNumber = createInvoice(ccode, item1, item2);

            BigDecimal receiptAmount = BigDecimal.valueOf(500 + rand.nextInt(1000));
            String receiptNumber = createReceipt(ccode, receiptAmount);

            // apply partial or full randomly
            BigDecimal applyAmount = receiptAmount.divide(BigDecimal.valueOf(2), 2,
                    RoundingMode.HALF_UP);

            applyPayment(receiptNumber, invoiceNumber, applyAmount);
        }
    }

    private String createInvoice(String ccode, String i1, String i2) {

        InvoiceCreateRequest req = new InvoiceCreateRequest();
        req.ccode = ccode;
        req.invoiceDate = LocalDate.now();
        req.dueDate = LocalDate.now().plusDays(7);

        req.items = List.of(
                buildItem(i1, new BigDecimal("2")),
                buildItem(i2, new BigDecimal("3"))
        );

        return invoiceService.createInvoice(req).invoiceNumber;
    }

    private InvoiceCreateRequest.InvoiceItemRequest buildItem(String icode, BigDecimal qty) {
        var item = new InvoiceCreateRequest.InvoiceItemRequest();
        item.icode = icode;
        item.quantity = qty;
        item.discountPercent = BigDecimal.ZERO;
        return item;
    }

    private String createReceipt(String ccode, BigDecimal amount) {

        ReceiptCreateRequest req = new ReceiptCreateRequest();
        req.ccode = ccode;
        req.paymentMode = PaymentMode.UPI;
        req.referenceNumber = "SEED";
        req.totalReceived = amount;
        req.receiptDate = LocalDate.now();

        return receiptService.createReceipt(req).receiptNumber;
    }

    private void applyPayment(String receiptNumber, String invoiceNumber, BigDecimal amount) {

        PaymentApplicationRequest app = new PaymentApplicationRequest();
        app.invoiceNumber = invoiceNumber;
        app.appliedAmount = amount;

        PaymentApplyRequest req = new PaymentApplyRequest();
        req.receiptNumber = receiptNumber;
        req.applications = List.of(app);

        paymentService.applyPayment(req);
    }
}
