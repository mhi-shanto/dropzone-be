import { QueryTypes, UniqueConstraintError } from "sequelize";
import { db, sequelize } from "../config/db";
import { PURCHASE_ERRORS } from "../constants/purchase.constants";
import { DropInstance } from "../models/drop.model";
import { PurchaseInstance } from "../models/purchase.model";
import { ReservationInstance } from "../models/reservation.model";
import { getIO } from "../sockets";
import { SOCKET_EVENTS } from "../sockets/events.constants";
import { AppError } from "../utils/app-error";
import {
  purchaseDropRowSchema,
  PurchaseDropRow,
} from "../validations/purchase.validation";

type ReservationWithDrop = ReservationInstance & { drop: DropInstance };

export async function completePurchase(
  reservationId: string,
  userId: string,
): Promise<{ purchase: PurchaseInstance; drop: PurchaseDropRow }> {
  const reservation = (await db.Reservation.findOne({
    where: { id: reservationId },
    include: [{ model: db.Drop, as: "drop" }],
  })) as ReservationWithDrop | null;

  if (!reservation) {
    throw new AppError(PURCHASE_ERRORS.RESERVATION_NOT_FOUND, 404);
  }

  if (reservation.userId !== userId) {
    throw new AppError(PURCHASE_ERRORS.NOT_YOUR_RESERVATION, 403);
  }

  if (reservation.status === "completed") {
    throw new AppError(PURCHASE_ERRORS.ALREADY_PURCHASED, 409);
  }

  if (reservation.status === "expired") {
    throw new AppError(PURCHASE_ERRORS.RESERVATION_EXPIRED, 409);
  }

  if (reservation.status === "cancelled") {
    throw new AppError(PURCHASE_ERRORS.RESERVATION_NOT_ACTIVE, 409);
  }

  if (reservation.status === "active" && reservation.expiresAt < new Date()) {
    throw new AppError(PURCHASE_ERRORS.RESERVATION_EXPIRED, 409);
  }

  const { purchase, drop } = await sequelize.transaction(async (t) => {
    await db.Reservation.update(
      { status: "completed" },
      { where: { id: reservationId }, transaction: t },
    );

    let purchase: PurchaseInstance;

    try {
      purchase = await db.Purchase.create(
        {
          reservationId,
          dropId: reservation.dropId,
          userId,
          priceAtPurchase: reservation.drop.price,
        },
        { transaction: t },
      );
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError(PURCHASE_ERRORS.ALREADY_PURCHASED, 409);
      }

      throw error;
    }

    const dropRows = (await sequelize.query(
      `SELECT id, name, available_stock, price FROM drops WHERE id = :dropId`,
      {
        replacements: { dropId: reservation.dropId },
        type: QueryTypes.SELECT,
        transaction: t,
      },
    )) as PurchaseDropRow[];

    const drop = purchaseDropRowSchema.parse(dropRows[0]);

    return { purchase, drop };
  });

  const user = await db.User.findByPk(userId, { attributes: ["email"] });
  const username = user?.email.split("@")[0] ?? "user";

  getIO().emit(SOCKET_EVENTS.PURCHASE_COMPLETED, {
    dropId: drop.id,
    dropName: drop.name,
    userId,
    username,
    purchasedAt: purchase.purchasedAt,
  });

  getIO().emit(SOCKET_EVENTS.STOCK_UPDATED, {
    dropId: drop.id,
    availableStock: drop.available_stock,
  });

  return { purchase, drop };
}
