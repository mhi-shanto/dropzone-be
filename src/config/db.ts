import { Sequelize } from "sequelize";
import { env } from "./env";
import { initModels } from "../models";

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",
  logging: env.NODE_ENV === "development" ? false : false,
  ...(env.NODE_ENV === "production" && {
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  }),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const db = initModels(sequelize);

export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log(
      "✅ Database connection established successfully via Sequelize.",
    );
    return true;
  } catch (error) {
    console.warn("⚠️ Unable to connect to PostgreSQL database:");
    if (error instanceof Error) {
      console.warn(`   Reason: ${error.message}`);
    } else {
      console.warn("   Reason: Unknown database connection error");
    }
    return false;
  }
}
