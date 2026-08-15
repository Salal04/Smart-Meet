import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

class PostSQLClient {
  private static postSql: PrismaClient;

  private constructor() {}

  public static getClient(): PrismaClient {
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ["error", "warn"],
      });
    }
    this.postSql = global.prisma;
    return this.postSql;
  }

  public static async connectWithRetry(retries = 5): Promise<void> {
    const prisma = this.getClient();

    while (retries) {
      try {
        await prisma.$connect();
        break;
      } catch (err) {
        retries--;
        if (!retries) throw err;
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
  }

  public static async closeConnection(): Promise<void> {
    if (global.prisma) {
      await global.prisma.$disconnect();
      global.prisma = undefined;
    }
  }
}

export default PostSQLClient;