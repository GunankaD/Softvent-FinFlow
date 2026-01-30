package com.softvent.finflow.auth;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @GET
    public List<Auth> getAll() {
        return Auth.listAll();
    }
}

