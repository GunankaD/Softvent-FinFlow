package com.softvent.finflow.auth.service;

import com.softvent.finflow.auth.dto.signup.*;
import com.softvent.finflow.auth.entity.Auth;
import com.softvent.finflow.auth.entity.SignUpEmailVerification;
import com.softvent.finflow.common.BusinessException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

@ApplicationScoped
public class SignUpEmailVerificationService {

    @Inject
    EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 15;

    @Transactional
    public void initiateSignup(SignUpInitRequest req) {

        if (req == null || req.email == null || req.email.isBlank()) {
            throw new BusinessException("Invalid email", 400);
        }

        boolean exists = Auth.find("email", req.email)
                .firstResultOptional()
                .isPresent();

        if (exists) {
            throw new BusinessException("Email already exists", 409);
        }

        // delete old verification if exists
        SignUpEmailVerification.delete("email", req.email);

        String otp = generateOtp();
        String otpHash = BCrypt.hashpw(otp, BCrypt.gensalt());

        SignUpEmailVerification verification = new SignUpEmailVerification();
        verification.email = req.email;
        verification.otpHash = otpHash;
        verification.expiresAt = Instant.now().plusSeconds(OTP_EXPIRY_MINUTES * 60L);
        verification.verified = false;

        verification.persist();

        emailService.sendSignUpOtpEmail(req.email, otp);
    }

    @Transactional
    public SignUpVerifyResponse verifyOtp(SignUpVerifyRequest req) {

        if (req == null || req.email == null || req.otp == null) {
            throw new BusinessException("Invalid verification request", 400);
        }

        SignUpEmailVerification verification =
                SignUpEmailVerification.find("email", req.email).firstResult();

        if (verification == null) {
            throw new BusinessException("Verification not found", 404);
        }

        if (verification.expiresAt.isBefore(Instant.now())) {
            throw new BusinessException("OTP expired", 400);
        }

        if (!BCrypt.checkpw(req.otp, verification.otpHash)) {
            throw new BusinessException("Invalid OTP", 401);
        }

        verification.verified = true;
        verification.verificationToken = UUID.randomUUID().toString();

        SignUpVerifyResponse response = new SignUpVerifyResponse();
        response.verificationToken = verification.verificationToken;

        return response;
    }

    @Transactional
    public void completeSignup(SignUpCompleteRequest req) {

        if (req == null || req.verificationToken == null || req.password == null) {
            throw new BusinessException("Invalid signup request", 400);
        }

        SignUpEmailVerification verification =
                SignUpEmailVerification.find("verificationToken", req.verificationToken)
                        .firstResult();

        if (verification == null || !verification.verified) {
            throw new BusinessException("Invalid verification token", 401);
        }

        boolean exists = Auth.find("email", verification.email)
                .firstResultOptional()
                .isPresent();

        if (exists) {
            throw new BusinessException("Email already exists", 409);
        }

        Auth user = new Auth();
        user.email = verification.email;
        user.pwdHash = BCrypt.hashpw(req.password, BCrypt.gensalt());
        user.persist();

        verification.delete();
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
