package com.softvent.finflow.auth.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import io.quarkus.mailer.Mailer;
import io.quarkus.mailer.Mail;

@ApplicationScoped
public class EmailService {

    @Inject
    Mailer mailer;

    public void sendResetPasswordEmail(String to, String token) {

        String resetLink =
                "http://localhost:4200/reset-password?token=" + token;

        mailer.send(
                Mail.withText(
                        to,
                        "FinFlow - Reset your password",
                        "Click the link to reset your password:\n\n" + resetLink +
                                "\n\nThis link expires in 15 minutes."
                )
        );
    }

    public void sendSignUpOtpEmail(String to, String otp) {

        mailer.send(
                Mail.withText(
                        to,
                        "FinFlow - Verify your email",
                        "Your OTP is: " + otp +
                                "\n\nThis OTP expires in 15 minutes."
                )
        );
    }
}
