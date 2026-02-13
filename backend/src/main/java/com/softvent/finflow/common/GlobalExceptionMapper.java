package com.softvent.finflow.common;

import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.List;
import java.util.stream.Collectors;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable exception) {

        if (exception instanceof BusinessException be) {
            ApiError error = new ApiError(
                    be.getStatus(),
                    be.getMessage(),
                    List.of(be.getMessage())
            );
            return Response.status(be.getStatus()).entity(error).build();
        }

        if (exception instanceof ConstraintViolationException cve) {

            List<String> errors = cve.getConstraintViolations()
                    .stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .collect(Collectors.toList());

            ApiError error = new ApiError(
                    400,
                    "Validation Failed",
                    errors
            );

            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }

        ApiError error = new ApiError(
                500,
                "Internal Server Error",
                List.of(exception.getMessage())
        );

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(error)
                .build();
    }
}
