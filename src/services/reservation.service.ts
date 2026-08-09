import { QueryTypes, UniqueConstraintError, Op } from "sequelize";
import { db, sequelize } from "../config/db";
import {
  RESERVATION_ERRORS,
  RESERVATION_WINDOW_SECONDS,
} from "../constants/reservation.constants";
import { ReservationInstance } from "../models/reservation.model";
import { getIO } from "../sockets";
import { SOCKET_EVENTS } from "../sockets/events.constants";
import { AppError } from "../utils/app-error";

interface StockUpdateRow {
  id: string;
  available_stock: number;
}

export async function getActiveReservationsForUser(
  userId: string,
): Promise<ReservationInstance[]> {
  return db.Reservation.findAll({
    where: {
      userId,
      status: "active",
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [["expiresAt", "ASC"]],
  });
}

export async function reserveDrop(
  dropId: string,
  userId: string,
): Promise<ReservationInstance> {
  const { reservation, availableStock } = await sequelize.transaction(
    async (t) => {
      const [rows] = (await sequelize.query(
        `UPDATE drops
         SET available_stock = available_stock - 1
         WHERE id = :dropId AND available_stock > 0
         RETURNING id, available_stock`,
        {
          replacements: { dropId },
          type: QueryTypes.UPDATE,
          transaction: t,
        },
      )) as unknown as [StockUpdateRow[], number];

      if (rows.length === 0) {
        const drop = await db.Drop.findByPk(dropId, { transaction: t });

        if (!drop) {
          throw new AppError(RESERVATION_ERRORS.DROP_NOT_FOUND, 404);
        }

        throw new AppError(RESERVATION_ERRORS.SOLD_OUT, 409);
      }

      const availableStock = Number(rows[0].available_stock);

      try {
        const reservation = await db.Reservation.create(
          {
            dropId,
            userId,
            expiresAt: new Date(Date.now() + RESERVATION_WINDOW_SECONDS * 1000),
          },
          { transaction: t },
        );

        return { reservation, availableStock };
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new AppError(RESERVATION_ERRORS.ALREADY_RESERVED, 409);
        }

        throw error;
      }
    },
  );

  getIO().emit(SOCKET_EVENTS.STOCK_UPDATED, { dropId, availableStock });

  return reservation;
}
