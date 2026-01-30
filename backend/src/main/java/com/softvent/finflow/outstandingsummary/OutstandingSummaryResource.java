package com.softvent.finflow.outstandingsummary;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/outstanding-summary")
@Produces(MediaType.APPLICATION_JSON)
public class OutstandingSummaryResource {

    @GET
    public List<OutstandingSummary> getAll() {
        return OutstandingSummary.listAll();
    }
}
