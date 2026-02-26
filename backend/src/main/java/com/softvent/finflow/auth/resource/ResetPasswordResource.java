package com.softvent.finflow.auth.resource;

import com.softvent.finflow.auth.dto.reset.password.ForgotPasswordRequest;
import com.softvent.finflow.auth.dto.reset.password.ResetPasswordRequest;
import com.softvent.finflow.auth.service.ResetPasswordService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth/reset")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ResetPasswordResource {

    @Inject
    ResetPasswordService resetPasswordService;

    @POST
    @Path("/forgot-password")
    public Response forgotPassword(ForgotPasswordRequest req) {
        resetPasswordService.forgotPassword(req);
        return Response.ok().build();
    }

    @POST
    @Path("/reset-password")
    public Response resetPassword(ResetPasswordRequest req) {
        resetPasswordService.resetPassword(req);
        return Response.ok().build();
    }

    @GET
    @Path("/reset-password/emailid/{token}")
    public Response getEmailForReset(@PathParam("token") String token) {
        return Response.ok(
                resetPasswordService.getEmailForToken(token)
        ).build();
    }
}
