package com.softvent.finflow.transactionitems;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/transaction-items")
@Produces(MediaType.APPLICATION_JSON)
public class TransactionItemResource {

    @GET
    public List<TransactionItem> getAll() {
        return TransactionItem.listAll();
    }
}

