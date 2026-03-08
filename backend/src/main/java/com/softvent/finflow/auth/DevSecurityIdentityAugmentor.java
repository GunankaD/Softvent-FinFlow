package com.softvent.finflow.auth;

import io.quarkus.security.identity.AuthenticationRequestContext;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.SecurityIdentityAugmentor;
import io.quarkus.security.runtime.QuarkusSecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class DevSecurityIdentityAugmentor implements SecurityIdentityAugmentor {

    @ConfigProperty(name = "auth.enabled")
    boolean authEnabled;

    @Override
    public Uni<SecurityIdentity> augment(SecurityIdentity identity, AuthenticationRequestContext context) {

        // In production, just return the identity as-is (validated by JWT)
        if (authEnabled) {
            return Uni.createFrom().item(identity);
        }

        // In dev mode, transform the anonymous identity into our logged-in user
        QuarkusSecurityIdentity fakeIdentity = QuarkusSecurityIdentity.builder(identity)
                .setPrincipal(() -> "dev-user")
                .addRole("USER")
                .build();

        return Uni.createFrom().item(fakeIdentity);
    }
}