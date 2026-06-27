import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.path} not found`, code: "ROUTE_NOT_FOUND" },
  });
};

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code, details: err.details },
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid identifier format", code: "INVALID_ID" },
    });
  }

  console.error("[unhandled error]", err);
  return res.status(500).json({
    success: false,
    error: { message: "Internal server error", code: "INTERNAL_ERROR" },
  });
};
