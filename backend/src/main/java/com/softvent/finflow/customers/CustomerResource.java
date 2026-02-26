package com.softvent.finflow.customers;

import com.softvent.finflow.customers.dto.CustomerCreateRequest;
import com.softvent.finflow.customers.dto.CustomerSummaryResponse;
import com.softvent.finflow.customers.dto.CustomerDetailResponse;
import com.softvent.finflow.customers.dto.CustomerUpdateRequest;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/customers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CustomerResource {

    @Inject
    CustomerService customerService;

    // CREATE CUSTOMER ENTRY
    @POST
    public Response createCustomer(@Valid CustomerCreateRequest request) {

        CustomerSummaryResponse response =
                customerService.createCustomer(request);

        return Response.status(Response.Status.CREATED)
                .entity(response)
                .build();
    }

    // GET CUSTOMER INFO FUNCTIONS
    @GET
    @Path("/id/{id}")
    public Response getCustomerById(@PathParam("id") Long id) {
        CustomerDetailResponse response = customerService.getCustomerById(id);
        return Response.ok(response).build();
    }

    @GET
    @Path("/ccode/{ccode}")
    public Response getCustomerByCcode(@PathParam("ccode") String ccode) {
        CustomerDetailResponse response = customerService.getCustomerByCcode(ccode);
        return Response.ok(response).build();
    }

    @GET
    public Response getAllCustomers() {
        List<CustomerSummaryResponse> customers = customerService.getAllCustomers();
        return Response.ok(customers).build();
    }

    // UPDATE CUSTOMER INFO
    @PUT
    @Path("/ccode/{ccode}")
    public Response updateCustomer(@PathParam("ccode") String ccode, @Valid CustomerUpdateRequest request) {
        CustomerDetailResponse response = customerService.updateCustomer(ccode, request);
        return Response.ok(response).build(); // 200 SUCCESS
    }

    // DELETE CUSTOMER
    @DELETE
    @Path("/ccode/{ccode}")
    public Response deleteCustomer(@PathParam("ccode") String ccode) {
        customerService.deleteCustomer(ccode);
        return Response.status(Response.Status.NO_CONTENT).build(); // 204
    }

    // AVAILABILITY FUNCTIONS
    @GET
    @Path("/availability/ccode")
    public Response checkCcode(@QueryParam("ccode") String ccode) {
        return Response.ok(customerService.checkCcodeAvailability(ccode)).build();
    }

    @GET
    @Path("/availability/email")
    public Response checkEmail(@QueryParam("email") String email) {
        return Response.ok(customerService.checkEmailAvailability(email)).build();
    }

}
