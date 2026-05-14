package com.softvent.finflow.outstandingsummary;

import com.softvent.finflow.outstandingsummary.dto.OutstandingSummaryResponse;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@RolesAllowed("USER")
@Path("/outstanding-summary")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OutstandingSummaryResource {

    @Inject
    OutstandingSummaryService outstandingSummaryService;

    // GETTERS
    @GET
    public Response getOutstandingSummary() {

        List<OutstandingSummaryResponse> response =
                outstandingSummaryService.getOutstandingSummary();

        return Response.ok(response).build();
    }
}