package com.softvent.finflow.auth.resource;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import com.softvent.finflow.auth.dto.login.LoginRequest;
import com.softvent.finflow.auth.dto.login.LoginResponse;
import com.softvent.finflow.auth.dto.signup.*;
import com.softvent.finflow.auth.dto.reset.password.ChangePasswordRequest;
import com.softvent.finflow.auth.entity.Auth;
import com.softvent.finflow.auth.service.AuthService;
import com.softvent.finflow.auth.service.SignupEmailVerificationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
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

    @ConfigProperty(name = "auth.cookie.secure")
    boolean cookieSecure;

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
        LoginResponse response = authService.login(req);

        NewCookie refreshCookie = new NewCookie.Builder("refresh_token")
                .value(response.refreshToken)
                .path("/auth")
                .httpOnly(true)
                .secure(cookieSecure)
                .maxAge(60 * 60 * 24 * 7)
                .sameSite(NewCookie.SameSite.LAX)
                .build();

        return Response.ok(new LoginResponse(response.accessToken, null, response.email))
                .cookie(refreshCookie)
                .build(); // 200
    }

    @POST
    @Path("/logout")
    public Response logout(@CookieParam("refresh_token") String refreshToken) {

        authService.logout(refreshToken);

        NewCookie deleteCookie = new NewCookie.Builder("refresh_token")
                .value("")
                .path("/auth")
                .maxAge(0)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(NewCookie.SameSite.LAX)
                .build();

        return Response.noContent()
                .cookie(deleteCookie)
                .build();
    }

    @POST
    @Path("/refresh")
    public Response refresh(@CookieParam("refresh_token") String refreshToken) {

        LoginResponse response = authService.refresh(refreshToken);

        NewCookie refreshCookie = new NewCookie.Builder("refresh_token")
                .value(response.refreshToken)
                .path("/auth")
                .httpOnly(true)
                .secure(cookieSecure)
                .maxAge(60 * 60 * 24 * 7)
                .sameSite(NewCookie.SameSite.LAX)
                .build();

        return Response.ok(new LoginResponse(response.accessToken, null, response.email))
                .cookie(refreshCookie)
                .build();
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