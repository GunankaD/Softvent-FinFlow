package com.softvent.finflow.auth;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.mindrot.jbcrypt.BCrypt;

import java.util.List;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    EmailService emailService;

    @GET
    public List<Auth> getAll() {
        return Auth.listAll();
    }

    @POST
    @Path("/signup")
    @Transactional
    public Response signup(SignupRequest req) {

        if (req == null || req.emailid == null || req.password == null) {
            return Response.status(Response.Status.BAD_REQUEST).build(); // 400
        }

        boolean exists = Auth.find("emailid", req.emailid).firstResultOptional().isPresent();

        // email id already present, make them login or try resetting password instead.
        if (exists) {
            return Response.status(Response.Status.CONFLICT).build(); // 409
        }

        // Auth class = Panache Entity representing Auth table but,
        // Auth obj = A specific record that is being populated as shown below
        Auth user = new Auth();
        user.emailid = req.emailid;
        user.pwdHash = BCrypt.hashpw(req.password, BCrypt.gensalt());

        // Writes the record into the table
        user.persist();

        return Response.status(Response.Status.CREATED).build(); // 201
    }

    @POST
    @Path("/login")
    @Transactional
    public Response login(LoginRequest req) {

        if (req == null || req.emailid == null || req.password == null) {
            return Response.status(Response.Status.BAD_REQUEST).build(); // 400
        }

        Auth user = Auth.find("emailid", req.emailid).firstResult();

        // even if the user doesnt exist, return 401 error only. do not reveal.
        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build(); // 401
        }

        boolean passwordMatch = BCrypt.checkpw(req.password, user.pwdHash);

        if (!passwordMatch) {
            return Response.status(Response.Status.UNAUTHORIZED).build(); // 401
        }

        return Response.ok().build(); // 200
    }

    @POST
    @Path("/forgot-password")
    @Transactional
    public Response forgotPassword(ForgotPasswordRequest req) {

        if (req == null || req.emailid == null) {
            return Response.status(Response.Status.BAD_REQUEST).build(); // 400
        }

        Auth user = Auth.find("emailid", req.emailid).firstResult();
        if (user == null) {
            // security: don’t reveal email existence
            return Response.status(Response.Status.NOT_FOUND).build(); // 404
        }

        PasswordReset reset = new PasswordReset();
        reset.emailid = req.emailid;
        reset.token = java.util.UUID.randomUUID().toString();
        reset.expiresAt = java.time.LocalDateTime.now().plusMinutes(15);

        reset.persist();

        emailService.sendResetPasswordEmail(req.emailid, reset.token);

        return Response.status(Response.Status.OK).build(); // 200
    }

    @POST
    @Path("/reset-password")
    @Transactional
    public Response resetPassword(ResetPasswordRequest req) {

        if (req == null || req.token == null || req.newPassword == null) {
            return Response.status(Response.Status.BAD_REQUEST).build(); // 400
        }

        PasswordReset reset =
                PasswordReset.find("token", req.token).firstResult();

        if (reset == null || reset.expiresAt.isBefore(java.time.LocalDateTime.now())) {
            return Response.status(Response.Status.UNAUTHORIZED).build(); // 409
        }

        Auth user = Auth.find("emailid", reset.emailid).firstResult();
        user.pwdHash = BCrypt.hashpw(req.newPassword, BCrypt.gensalt());

        reset.delete(); // invalidate token

        return Response.status(Response.Status.OK).build(); // 200
    }


    /*
     * DEVELOPMENT PURPOSE FUNCTIONS
     */
    @DELETE
    @Path("/delete/{emailid}")
    @Transactional
    public Response deleteByEmailId(@PathParam("emailid") String emailid){
        if(emailid == null || emailid.isBlank()){
            return Response.status(Response.Status.BAD_REQUEST).build(); // 400
        }

        long deleted = Auth.delete("emailid", emailid);

        if(deleted == 0) {
            return Response.status(Response.Status.NOT_FOUND).build(); // 404
        }

        return Response.status(Response.Status.NO_CONTENT).build(); // 204
    }

    @POST
    @Path("/change-password")
    @Transactional
    public Response changePassword(ChangePasswordRequest req) {

        if (req == null || req.emailid == null || req.newPassword == null) {
            return Response.status(Response.Status.BAD_REQUEST).build(); // 400
        }

        Auth user = Auth.find("emailid", req.emailid).firstResult();

        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build(); // 404
        }

        user.pwdHash = BCrypt.hashpw(req.newPassword, BCrypt.gensalt());

        return Response.ok().build(); // 200
    }

}