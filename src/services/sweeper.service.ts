import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/db';
import { getIO } from '../sockets';
import { SOCKET_EVENTS } from '../sockets/events.constants';
import {
  expiredReservationRowSchema,
  updatedDropRowSchema,
  UpdatedDropRow,
} from '../validations/sweeper.validation';

export async function runExpiryCycle(): Promise<void> {
  const { expiredRows, updatedDrops } = await sequelize.transaction(
    async (t) => {
      const [rawExpiredRows] = (await sequelize.query(
        `UPDATE reservations
         SET status = 'expired', updated_at = NOW()
         WHERE status = 'active' AND expires_at < NOW()
         RETURNING drop_id`,
        { type: QueryTypes.UPDATE, transaction: t }
      )) as unknown as [{ drop_id: string }[], number];

      const expiredRows = rawExpiredRows.map((row) =>
        expiredReservationRowSchema.parse(row)
      );

      if (expiredRows.length === 0) {
        return { expiredRows, updatedDrops: [] as UpdatedDropRow[] };
      }

      const dropCounts = expiredRows.reduce<Record<string, number>>(
        (acc, row) => {
          acc[row.drop_id] = (acc[row.drop_id] || 0) + 1;
          return acc;
        },
        {}
      );

      const updatedDrops: UpdatedDropRow[] = [];

      for (const [dropId, count] of Object.entries(dropCounts)) {
        const [rawUpdatedDrops] = (await sequelize.query(
          `UPDATE drops
           SET available_stock = available_stock + :count, updated_at = NOW()
           WHERE id = :dropId
           RETURNING id, available_stock`,
          {
            replacements: { dropId, count },
            type: QueryTypes.UPDATE,
            transaction: t,
          }
        )) as unknown as [{ id: string; available_stock: number }[], number];

        if (rawUpdatedDrops.length > 0) {
          updatedDrops.push(updatedDropRowSchema.parse(rawUpdatedDrops[0]));
        }
      }

      return { expiredRows, updatedDrops };
    }
  );

  if (expiredRows.length === 0) {
    return;
  }

  for (const drop of updatedDrops) {
    getIO().emit(SOCKET_EVENTS.STOCK_UPDATED, {
      dropId: drop.id,
      availableStock: drop.available_stock,
    });
  }

  for (const row of expiredRows) {
    getIO().emit(SOCKET_EVENTS.RESERVATION_EXPIRED, {
      dropId: row.drop_id,
    });
  }

  const dropCount = new Set(expiredRows.map((row) => row.drop_id)).size;
  console.log(
    `[Sweeper] Expired ${expiredRows.length} reservation(s) across ${dropCount} drop(s).`
  );
}
