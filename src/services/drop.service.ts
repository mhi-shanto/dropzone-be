import { QueryTypes } from 'sequelize';
import { db, sequelize } from '../config/db';
import {
  ACTIVITY_FEED_LIMIT,
  DROP_ERRORS,
} from '../constants/drop.constants';
import { DropInstance } from '../models/drop.model';
import { AppError } from '../utils/app-error';
import {
  activityFeedRowSchema,
  ActivityFeedRow,
  CreateDropInput,
  enrichedDropSchema,
  EnrichedDrop,
  RecentPurchaser,
} from '../validations/drop.validation';

const ACTIVITY_FEED_QUERY = `
  SELECT
    p.drop_id,
    SPLIT_PART(u.email, '@', 1) AS username,
    p.purchased_at
  FROM (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY drop_id
        ORDER BY purchased_at DESC
      ) AS rn
    FROM purchases
  ) p
  JOIN users u ON u.id = p.user_id
  WHERE p.rn <= :limit
  ORDER BY p.drop_id, p.purchased_at DESC
`;

const ACTIVITY_FEED_BY_DROP_QUERY = `
  SELECT
    p.drop_id,
    SPLIT_PART(u.email, '@', 1) AS username,
    p.purchased_at
  FROM (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY drop_id
        ORDER BY purchased_at DESC
      ) AS rn
    FROM purchases
    WHERE drop_id = :dropId
  ) p
  JOIN users u ON u.id = p.user_id
  WHERE p.rn <= :limit
  ORDER BY p.purchased_at DESC
`;

function groupPurchasersByDrop(
  feedRows: ActivityFeedRow[]
): Record<string, RecentPurchaser[]> {
  return feedRows.reduce<Record<string, RecentPurchaser[]>>((acc, row) => {
    if (!acc[row.drop_id]) {
      acc[row.drop_id] = [];
    }

    acc[row.drop_id].push({
      username: row.username,
      purchasedAt: row.purchased_at,
    });

    return acc;
  }, {});
}

function enrichDrop(
  drop: DropInstance,
  purchasersByDrop: Record<string, RecentPurchaser[]>
): EnrichedDrop {
  return enrichedDropSchema.parse({
    ...drop.toJSON(),
    recentPurchasers: purchasersByDrop[drop.id] || [],
  });
}

async function fetchActivityFeedRows(
  query: string,
  replacements: Record<string, string | number>
): Promise<ActivityFeedRow[]> {
  const feedRows = (await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT,
  })) as ActivityFeedRow[];

  return feedRows.map((row) => activityFeedRowSchema.parse(row));
}

export async function createDrop(input: CreateDropInput): Promise<DropInstance> {
  if (input.price <= 0) {
    throw new AppError(DROP_ERRORS.INVALID_PRICE, 400);
  }

  if (input.totalStock < 1) {
    throw new AppError(DROP_ERRORS.INVALID_STOCK, 400);
  }

  const drop = await db.Drop.create({
    name: input.name,
    description: input.description,
    imageUrl: input.imageUrl,
    price: input.price.toFixed(2),
    totalStock: input.totalStock,
    availableStock: input.totalStock,
    startsAt: input.startsAt,
    status: 'live',
  });

  return drop;
}

export async function listDrops(): Promise<EnrichedDrop[]> {
  const drops = await db.Drop.findAll({
    order: [
      ['createdAt', 'DESC'],
      ['id', 'ASC'],
    ],
  });

  if (drops.length === 0) {
    return [];
  }

  const validatedFeedRows = await fetchActivityFeedRows(ACTIVITY_FEED_QUERY, {
    limit: ACTIVITY_FEED_LIMIT,
  });

  const purchasersByDrop = groupPurchasersByDrop(validatedFeedRows);

  return drops.map((drop) => enrichDrop(drop, purchasersByDrop));
}

export async function getDropById(id: string): Promise<EnrichedDrop> {
  const drop = await db.Drop.findByPk(id);

  if (!drop) {
    throw new AppError(DROP_ERRORS.NOT_FOUND, 404);
  }

  const validatedFeedRows = await fetchActivityFeedRows(
    ACTIVITY_FEED_BY_DROP_QUERY,
    { dropId: id, limit: ACTIVITY_FEED_LIMIT }
  );

  const purchasersByDrop = groupPurchasersByDrop(validatedFeedRows);

  return enrichDrop(drop, purchasersByDrop);
}
