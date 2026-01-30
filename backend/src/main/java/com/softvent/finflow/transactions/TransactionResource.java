package com.softvent.finflow.transactions;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/transactions")
@Produces(MediaType.APPLICATION_JSON)
public class TransactionResource {

    @GET
    public List<Transaction> getAll() {
        return Transaction.listAll();
    }
}
