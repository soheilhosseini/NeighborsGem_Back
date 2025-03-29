import allowedOrigins from "../config/allowedOrigin";
import { Request, Response, NextFunction } from "express";

const filters = (req: Request, res: Response, next: NextFunction) => {
  const { coordinate } = req.query;
  const transformedCoordinate = coordinate?.toString().split(",");
  if (transformedCoordinate) {
    filters = {
      ...filters,
      "coordinate.0": { $eq: transformedCoordinate[0] },
      "coordinate.1": { $eq: transformedCoordinate[1] },
    };
  }
  next();
};

export default credentials;
