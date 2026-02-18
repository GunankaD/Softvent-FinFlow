package com.softvent.finflow.customers.dto;

import jakarta.validation.constraints.*;

public class CustomerUpdateRequest {

    @NotBlank(message = "Customer name is required")
    @Size(max = 100)
    public String cname;

    @NotBlank(message = "Address is required")
    public String address;

    @NotBlank(message = "City is required")
    @Size(max = 50)
    public String city;

    @NotBlank(message = "State is required")
    @Size(max = 50)
    public String state;

    @NotBlank(message = "Country is required")
    @Size(max = 50)
    public String country;

    @NotBlank(message = "Pincode is required")
    @Size(max = 10)
    public String pincode;

    @NotBlank(message = "Mobile number is required")
    @Size(max = 15)
    public String mobileNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100)
    public String emailId;

    @NotBlank(message = "GST is required")
    @Size(max = 15)
    public String gstNo;

    @NotBlank(message = "PAN is required")
    @Size(max = 10)
    public String panNo;

    @NotBlank(message = "Bank name is required")
    @Size(max = 100)
    public String bankName;

    @NotBlank(message = "Branch name is required")
    @Size(max = 100)
    public String branchName;

    @NotBlank(message = "Account number is required")
    @Size(max = 20)
    public String accountNo;
}

