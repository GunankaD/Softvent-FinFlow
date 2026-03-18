package com.softvent.finflow.common;

import jakarta.persistence.OptimisticLockException;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;
import java.util.List;
import java.util.stream.Collectors;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {
    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @Override
    public Response toResponse(Throwable exception) {

        if (exception instanceof BusinessException be) {
            ApiError error = new ApiError(
                    be.getStatus(),
                    be.getMessage(),
                    List.of(be.getMessage())
            );
            return Response.status(be.getStatus())
                    .entity(error)
                    .build();
        }

        if (exception instanceof ConstraintViolationException cve) {

            List<String> errors = cve.getConstraintViolations()
                    .stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .collect(Collectors.toList());

            ApiError error = new ApiError(
                    Response.Status.BAD_REQUEST.getStatusCode(), // 400
                    "Validation Failed",
                    errors
            );

            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }

        if (exception instanceof OptimisticLockException) {
            ApiError error = new ApiError(
                    Response.Status.CONFLICT.getStatusCode(),
                    "Data Conflict",
                    List.of("The record was updated by another user. Please refresh and try again.")
            );
            return Response.status(Response.Status.CONFLICT)
                    .entity(error)
                    .build();
        }
        
        LOG.error("Unhandled exception caught in REST API", exception);
        ApiError error = new ApiError(
                Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), // 500
                "Internal Server Error",
                List.of("Unexpected error occurred")
        );

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR) // 500
                .entity(error)
                .build();
    }
}