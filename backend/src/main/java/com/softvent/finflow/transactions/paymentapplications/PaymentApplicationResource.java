package com.softvent.finflow.transactions.paymentapplications;

import com.softvent.finflow.transactions.paymentapplications.dto.PaymentApplyRequest;
import com.softvent.finflow.transactions.paymentapplications.dto.PaymentApplyResponse;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@RolesAllowed("USER")
@Path("/payments")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PaymentApplicationResource {

    @Inject
    PaymentApplicationService paymentApplicationService;

    // APPLY PAYMENT
    @POST
    @Path("/apply")
    public Response apply(PaymentApplyRequest request) {

        PaymentApplyResponse response =
                paymentApplicationService.applyPayment(request);

        return Response
                .status(Response.Status.OK)
                .entity(response)
                .build(); // 200
    }
}