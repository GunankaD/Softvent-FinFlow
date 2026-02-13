package com.softvent.finflow.auth;

import com.softvent.finflow.auth.dto.ForgotPasswordRequest;
import com.softvent.finflow.auth.dto.ResetPasswordRequest;
import com.softvent.finflow.auth.dto.ResetPasswordResponse;
import com.softvent.finflow.auth.entity.Auth;
import com.softvent.finflow.auth.entity.PasswordReset;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.mindrot.jbcrypt.BCrypt;

import java.time.LocalDateTime;
import java.util.UUID;

@Path("/auth/reset")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ResetPasswordResource {

    @Inject
    EmailService emailService;

    @POST
    @Path("/forgot-password")
    @Transactional
    public Response forgotPassword(ForgotPasswordRequest req) {

        // cleanup expired tokens
        PasswordReset.delete("expiresAt < ?1", LocalDateTime.now());

        if (req == null || req.emailid == null) {
            return Response.status(Response.Status.BAD_REQUEST).build(); // 400
        }

        Auth user = Auth.find("emailid", req.emailid).firstResult();
        if (user == null) {
            // security: don’t reveal email existence
            return Response.status(Response.Status.OK).build(); // 200
        }

        // allow only one active token per email
        PasswordReset.delete("emailid", req.emailid);

        PasswordReset reset = new PasswordReset();
        reset.emailid = req.emailid;
        reset.token = UUID.randomUUID().toString();
        reset.expiresAt = LocalDateTime.now().plusMinutes(15);

        reset.persist();

        emailService.sendResetPasswordEmail(req.emailid, reset.token);

        return Response.status(Response.Status.OK).build(); // 200
    }

    @POST
    @Path("/reset-password")
    @Transactional
    public Response resetPassword(ResetPasswordRequest req) {

        // cleanup expired tokens
        PasswordReset.delete("expiresAt < ?1", LocalDateTime.now());

        if (req == null || req.token == null || req.newPassword == null) {
            return Response.status(Response.Status.BAD_REQUEST).build(); // 400
        }

        PasswordReset reset =
                PasswordReset.find("token", req.token).firstResult();

        if (reset == null || reset.expiresAt.isBefore(LocalDateTime.now())) {
            return Response.status(Response.Status.UNAUTHORIZED).build(); // 401
        }

        Auth user = Auth.find("emailid", reset.emailid).firstResult();
        user.pwdHash = BCrypt.hashpw(req.newPassword, BCrypt.gensalt());

        reset.delete(); // invalidate token after use

        return Response.status(Response.Status.OK).build(); // 200
    }

    @GET
    @Path("/reset-password/emailid/{token}")
    public Response getEmailForReset(@PathParam("token") String token) {

        if (token == null || token.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).build(); // 400
        }

        PasswordReset reset =
                PasswordReset.find("token", token).firstResult();

        if (reset == null || reset.expiresAt.isBefore(java.time.LocalDateTime.now())) {
            return Response.status(Response.Status.UNAUTHORIZED).build(); // 401
        }

        ResetPasswordResponse res = new ResetPasswordResponse();
        res.emailid = reset.emailid;

        return Response.ok(res).build(); // 200 + Data
    }

}

