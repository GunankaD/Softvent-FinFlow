package com.softvent.finflow.auth.dto.token;

public class RefreshResponse {

    public String accessToken;

    public RefreshResponse() {}

    public RefreshResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}