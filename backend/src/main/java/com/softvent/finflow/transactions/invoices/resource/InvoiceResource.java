package com.softvent.finflow.transactions.invoices.resource;

import com.softvent.finflow.transactions.invoices.dto.InvoiceCreateRequest;
import com.softvent.finflow.transactions.invoices.dto.InvoiceCreateResponse;
import com.softvent.finflow.transactions.invoices.dto.InvoiceDetailResponse;
import com.softvent.finflow.transactions.invoices.dto.InvoiceSummaryResponse;
import com.softvent.finflow.transactions.invoices.service.InvoiceService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@RolesAllowed("USER")
@Path("/invoices")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class InvoiceResource {

    @Inject
    InvoiceService invoiceService;

    // CREATE
    @POST
    public Response create(InvoiceCreateRequest request) {

        InvoiceCreateResponse response = invoiceService.createInvoice(request);

        return Response
                .status(Response.Status.CREATED)
                .entity(response)
                .build(); // 201
    }

    // GETTERS

    @GET
    public Response getAll() {

        List<InvoiceSummaryResponse> response = invoiceService.getInvoices();

        return Response.ok(response).build(); // 200
    }

    @GET
    @Path("/{invoiceNumber}")
    public Response getByInvoiceNumber(
            @PathParam("invoiceNumber") String invoiceNumber) {

        InvoiceDetailResponse response =
                invoiceService.getInvoiceByNumber(invoiceNumber);

        return Response.ok(response).build(); // 200
    }

    // SOFT DELETE

    @DELETE
    @Path("/{invoiceNumber}")
    public Response voidInvoice(
            @PathParam("invoiceNumber") String invoiceNumber) {

        invoiceService.deleteInvoiceByNumber(invoiceNumber);

        return Response.noContent().build(); // 204
    }
}