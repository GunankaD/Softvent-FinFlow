package com.softvent.finflow.auth.resource;

import com.softvent.finflow.auth.dto.*;
import com.softvent.finflow.auth.dto.reset.password.ChangePasswordRequest;
import com.softvent.finflow.auth.entity.Auth;
import com.softvent.finflow.auth.service.AuthService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @GET
    public List<Auth> getAll() {
        return Auth.listAll();
    }

    @POST
    @Path("/signup")
    public Response signup(SignupRequest req) {
        authService.signup(req);
        return Response.status(Response.Status.CREATED).build(); // 201
    }

    @POST
    @Path("/login")
    public Response login(LoginRequest req) {
        authService.login(req);
        return Response.ok().build(); // 200
    }

    /* DEVELOPMENT PURPOSE ONLY RESOURCES */
    @POST
    @Path("/change-password")
    public Response changePassword(ChangePasswordRequest req) {
        authService.changePassword(req);
        return Response.ok().build();
    }

    @DELETE
    @Path("/delete/{email}")
    public Response deleteByEmailId(@PathParam("email") String email) {
        authService.deleteByEmailId(email);
        return Response.noContent().build();
    }

}