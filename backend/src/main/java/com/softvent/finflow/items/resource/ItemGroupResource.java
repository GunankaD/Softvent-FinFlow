package com.softvent.finflow.items.resource;

import com.softvent.finflow.items.dto.ItemGroupResponse;

import com.softvent.finflow.items.service.ItemGroupService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@RolesAllowed("USER")
@Path("/item-groups")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ItemGroupResource {

    @Inject
    ItemGroupService itemGroupService;

    /* ---------------- FETCH ALL ---------------- */

    @GET
    public List<ItemGroupResponse> getAll() {
        return itemGroupService.getAllGroups();
    }

    /* ---------------- FETCH BY ID ---------------- */

    @GET
    @Path("/{igid:\\d+}")
    public ItemGroupResponse getById(@PathParam("igid") Long igid) {
        return itemGroupService.getById(igid);
    }
}