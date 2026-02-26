package com.softvent.finflow.auth.resource;

import com.softvent.finflow.auth.dto.*;
import com.softvent.finflow.auth.dto.signup.*;
import com.softvent.finflow.auth.dto.reset.password.ChangePasswordRequest;
import com.softvent.finflow.auth.entity.Auth;
import com.softvent.finflow.auth.service.AuthService;
import com.softvent.finflow.auth.service.SignupEmailVerificationService;
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
    @Inject
    SignupEmailVerificationService signUpEmailVerificationService;

    @GET
    public List<Auth> getAll() {
        return Auth.listAll();
    }

    @POST
    @Path("/signup/init")
    public Response signupInit(SignupInitRequest req) {
        signUpEmailVerificationService.initiateSignup(req);
        return Response.ok().build(); // 200
    }

    @POST
    @Path("/signup/verify")
    public Response signupVerify(SignupVerifyRequest req) {
        SignupVerifyResponse response =
                signUpEmailVerificationService.verifyOtp(req);

        return Response.ok(response).build(); // 200 + token
    }

    @POST
    @Path("/signup/complete")
    public Response signupComplete(SignupCompleteRequest req) {
        signUpEmailVerificationService.completeSignup(req);
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
    public Response deleteByEmail(@PathParam("email") String email) {
        authService.deleteByEmail(email);
        return Response.noContent().build();
    }

}