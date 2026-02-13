package com.softvent.finflow.customers.dto;

import jakarta.validation.constraints.*;

public class CustomerCreateRequest {

    @NotBlank(message = "Customer code is required")
    @Size(max = 20, message = "Customer code must not exceed 20 characters")
    public String ccode;

    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Customer name must not exceed 100 characters")
    public String cname;

    @NotBlank(message = "Address is required")
    public String address;

    @NotBlank(message = "City is required")
    @Size(max = 50, message = "City must not exceed 50 characters")
    public String city;

    @NotBlank(message = "State is required")
    @Size(max = 50, message = "State must not exceed 50 characters")
    public String state;

    @NotBlank(message = "Country is required")
    @Size(max = 50, message = "Country must not exceed 50 characters")
    public String country;

    @NotBlank(message = "Pincode is required")
    @Size(max = 10, message = "Pincode must not exceed 10 characters")
    public String pincode;

    @NotBlank(message = "Mobile number is required")
    @Size(max = 15, message = "Mobile number must not exceed 15 characters")
    public String mobileNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    public String emailId;

    @NotBlank(message = "GST number is required")
    @Size(max = 15, message = "GST number must not exceed 15 characters")
    public String gstNo;

    @NotBlank(message = "PAN number is required")
    @Size(max = 10, message = "PAN number must not exceed 10 characters")
    public String panNo;

    @NotBlank(message = "Bank name is required")
    @Size(max = 100, message = "Bank name must not exceed 100 characters")
    public String bankName;

    @NotBlank(message = "Branch name is required")
    @Size(max = 100, message = "Branch name must not exceed 100 characters")
    public String branchName;

    @NotBlank(message = "Account number is required")
    @Size(max = 20, message = "Account number must not exceed 20 characters")
    public String accountNo;
}
