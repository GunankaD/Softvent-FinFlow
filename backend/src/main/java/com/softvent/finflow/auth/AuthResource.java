package com.softvent.finflow.auth;

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

}