package com.softvent.finflow.auth.dto.login;

public class LoginResponse {

    public String accessToken;
    public String email;

    public LoginResponse() {}

    public LoginResponse(String accessToken, String email) {
        this.accessToken = accessToken;
        this.email = email;
    }
}