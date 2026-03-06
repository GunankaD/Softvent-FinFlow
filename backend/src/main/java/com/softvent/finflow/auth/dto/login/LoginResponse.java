package com.softvent.finflow.auth.dto.login;

public class LoginResponse {

    public String accessToken;
    public String refreshToken;
    public String email;

    public LoginResponse() {}

    public LoginResponse(String accessToken, String refreshToken, String email) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.email = email;
    }
}