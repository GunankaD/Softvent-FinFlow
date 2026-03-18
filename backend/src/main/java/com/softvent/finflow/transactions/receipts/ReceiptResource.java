package com.softvent.finflow.transactions.receipts;

import com.softvent.finflow.transactions.receipts.dto.ReceiptCreateRequest;
import com.softvent.finflow.transactions.receipts.dto.ReceiptCreateResponse;
import com.softvent.finflow.transactions.receipts.dto.ReceiptDetailResponse;
import com.softvent.finflow.transactions.receipts.dto.ReceiptSummaryResponse;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@RolesAllowed("USER")
@Path("/receipts")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ReceiptResource {

    @Inject
    ReceiptService receiptService;

    // CREATE
    @POST
    public Response create(@Valid ReceiptCreateRequest request) {
        ReceiptCreateResponse response = receiptService.createReceipt(request);
        return Response
                .status(Response.Status.CREATED)
                .entity(response)
                .build(); // 201
    }

    // GETTERS
    @GET
    public Response getAll() {
        List<ReceiptSummaryResponse> response = receiptService.getReceipts();
        return Response.ok(response).build(); // 200
    }

    @GET
    @Path("/{receiptNumber}")
    public Response getByReceiptNumber(@PathParam("receiptNumber") String receiptNumber) {
        ReceiptDetailResponse response =
                receiptService.getReceiptByNumber(receiptNumber);
        return Response.ok(response).build(); // 200
    }

    // SOFT DELETE
    @DELETE
    @Path("/{receiptNumber}")
    public Response delete(@PathParam("receiptNumber") String receiptNumber) {
        receiptService.deleteReceiptByNumber(receiptNumber);
        return Response.noContent().build(); // 204
    }
}