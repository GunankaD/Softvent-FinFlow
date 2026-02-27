package com.softvent.finflow.items.resource;

import com.softvent.finflow.items.dto.ItemCreateRequest;
import com.softvent.finflow.items.dto.ItemDetailResponse;
import com.softvent.finflow.items.dto.ItemSummaryResponse;
import com.softvent.finflow.items.dto.ItemUpdateRequest;

import com.softvent.finflow.items.service.ItemService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/items")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ItemResource {

    @Inject
    ItemService itemService;

    /* ---------------- CREATE ---------------- */

    @POST
    public Response create(ItemCreateRequest request) {
        itemService.createItem(request);
        return Response.status(Response.Status.CREATED).build();
    }

    /* ---------------- UPDATE ---------------- */

    @PUT
    @Path("/{icode}")
    public Response update(@PathParam("icode") String icode,
                           ItemUpdateRequest request) {
        itemService.updateItem(icode, request);
        return Response.ok().build();
    }

    /* ---------------- FETCH ALL ---------------- */

    @GET
    public List<ItemSummaryResponse> getAll() {
        return itemService.getAllItems();
    }

    /* ---------------- FETCH BY CODE ---------------- */

    @GET
    @Path("/{icode}")
    public ItemDetailResponse getByCode(@PathParam("icode") String icode) {
        return itemService.getItemByCode(icode);
    }

    /* ---------------- SOFT DELETE ---------------- */

    @DELETE
    @Path("/{icode}")
    public Response deactivate(@PathParam("icode") String icode) {
        itemService.deactivateItem(icode);
        return Response.noContent().build();
    }
}

