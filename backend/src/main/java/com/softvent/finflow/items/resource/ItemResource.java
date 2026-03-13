package com.softvent.finflow.items.resource;

import com.softvent.finflow.items.dto.*;

import com.softvent.finflow.items.service.ItemService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@RolesAllowed("USER")
@Path("/items")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ItemResource {

    @Inject
    ItemService itemService;

    // CREATE
    @POST
    public Response create(ItemCreateRequest request) {
        ItemCreateResponse response = itemService.createItem(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    // AVAILABILITY CHECKERS
    @GET
    @Path("/availability/{icode}")
    public Response checkIcodeAvailability(@PathParam("icode") String icode) {
        return Response.ok(itemService.isIcodeAvailable(icode)).build();
    }

    // UPDATE
    @PUT
    @Path("/{icode}")
    public Response update(@PathParam("icode") String icode, ItemUpdateRequest request) {
        ItemDetailResponse response = itemService.updateItem(icode, request);
        return Response.ok(response).build();
    }

    // GETTERS
    @GET
    public List<ItemSummaryResponse> getAll() {
        return itemService.getAllItems();
    }

    @GET
    @Path("/{icode}")
    public ItemDetailResponse getByCode(@PathParam("icode") String icode) {
        return itemService.getItemByCode(icode);
    }

    // SOFT DELETE
    @DELETE
    @Path("/{icode}")
    public Response deactivate(@PathParam("icode") String icode) {
        itemService.deactivateItem(icode);
        return Response.noContent().build();
    }
}

