import type { PrismaClient } from "@prisma/client";

export class BaseService {
  protected readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }
}
