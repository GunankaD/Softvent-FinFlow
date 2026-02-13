package com.softvent.finflow.customers;

import com.softvent.finflow.customers.dto.AvailabilityResponse;
import com.softvent.finflow.customers.dto.CustomerDetailResponse;
import com.softvent.finflow.customers.entity.Customer;

import com.softvent.finflow.customers.dto.CustomerCreateRequest;
import com.softvent.finflow.customers.dto.CustomerSummaryResponse;
import com.softvent.finflow.common.BusinessException;
import jakarta.ws.rs.core.Response;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class CustomerService {

    // CREATE NEW CUSTOMER
    @Transactional
    public CustomerSummaryResponse createCustomer(CustomerCreateRequest request) {
        if (Customer.find("ccode", request.ccode).firstResultOptional().isPresent()) {
            throw new BusinessException(
                    "Customer code already exists",
                    Response.Status.CONFLICT.getStatusCode()); // 409
        }

        if (Customer.find("emailId", request.emailId).firstResultOptional().isPresent()) {
            throw new BusinessException(
                    "Email already exists",
                    Response.Status.CONFLICT.getStatusCode()); // 409
        }

        // All good? Create record and persist in db.
        Customer customer = new Customer();

        customer.ccode = request.ccode;
        customer.cname = request.cname;
        customer.address = request.address;
        customer.city = request.city;
        customer.state = request.state;
        customer.country = request.country;
        customer.pincode = request.pincode;
        customer.mobileNumber = request.mobileNumber;
        customer.emailId = request.emailId;
        customer.gstNo = request.gstNo;
        customer.panNo = request.panNo;
        customer.bankName = request.bankName;
        customer.branchName = request.branchName;
        customer.accountNo = request.accountNo;
        customer.createdAt = LocalDateTime.now();

        customer.persist();

        return mapToSummaryResponse(customer);
    }

    // GET CUSTOMER DETAILS
    public CustomerDetailResponse getCustomerById(Long id) {
        Customer customer = Customer.findById(id);

        if (customer == null) {
            throw new BusinessException(
                    "Customer not found",
                    Response.Status.NOT_FOUND.getStatusCode()
            );
        }

        return mapToDetailResponse(customer);
    }
    public CustomerDetailResponse getCustomerByCcode(String ccode){
        if (ccode == null || ccode.isBlank()) {
            throw new BusinessException("Invalid customer code", 400); // BAD_REQUEST
        }
        Customer customer = Customer.<Customer>find("ccode", ccode)
                .firstResultOptional()
                .orElseThrow(() ->
                        new BusinessException(
                            "Customer not found",
                            Response.Status.NOT_FOUND.getStatusCode() // 404
                        )
                );
        return mapToDetailResponse(customer);
    }
    public List<CustomerSummaryResponse> getAllCustomers() {
        return Customer.<Customer>listAll()
                .stream()
                .map(this::mapToSummaryResponse)
                .toList();
    }

    // AVAILABILITY CHECKERS
    public AvailabilityResponse checkCcodeAvailability(String ccode) {
        boolean exists = Customer.find("ccode", ccode)
                .firstResultOptional()
                .isPresent();

        return new AvailabilityResponse(!exists);
    }
    public AvailabilityResponse checkEmailAvailability(String email) {
        boolean exists = Customer.find("emailId", email)
                .firstResultOptional()
                .isPresent();

        return new AvailabilityResponse(!exists);
    }

    // MAPPERS: TABLE RECORD TO DTO
    private CustomerSummaryResponse mapToSummaryResponse(Customer customer) {

        CustomerSummaryResponse dto = new CustomerSummaryResponse();

        dto.cid = customer.cid;
        dto.ccode = customer.ccode;
        dto.cname = customer.cname;
        dto.city = customer.city;
        dto.state = customer.state;
        dto.mobileNumber = customer.mobileNumber;
        dto.emailId = customer.emailId;
        dto.createdAt = customer.createdAt;

        return dto;
    }
    private CustomerDetailResponse mapToDetailResponse(Customer customer) {

        CustomerDetailResponse dto = new CustomerDetailResponse();

        dto.cid = customer.cid;
        dto.ccode = customer.ccode;
        dto.cname = customer.cname;
        dto.address = customer.address;
        dto.city = customer.city;
        dto.state = customer.state;
        dto.country = customer.country;
        dto.pincode = customer.pincode;
        dto.mobileNumber = customer.mobileNumber;
        dto.emailId = customer.emailId;
        dto.gstNo = customer.gstNo;
        dto.panNo = customer.panNo;
        dto.bankName = customer.bankName;
        dto.branchName = customer.branchName;
        dto.accountNo = customer.accountNo;
        dto.createdAt = customer.createdAt;

        return dto;
    }
}
