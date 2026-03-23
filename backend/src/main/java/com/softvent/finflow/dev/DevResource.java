package com.softvent.finflow.dev;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/dev")
@ApplicationScoped
public class DevResource {

    @Inject
    DevDataSeeder seeder;

    @GET
    @Path("/seed")
    public void seed() {
        seeder.seed();
    }
}