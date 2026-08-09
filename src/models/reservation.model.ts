import {
  BelongsToGetAssociationMixin,
  DataTypes,
  HasOneGetAssociationMixin,
  Model,
  ModelStatic,
  Optional,
  Sequelize,
} from 'sequelize';
import type { DropInstance } from './drop.model';
import type { PurchaseInstance } from './purchase.model';
import type { UserInstance } from './user.model';

export type ReservationStatus =
  | 'active'
  | 'expired'
  | 'completed'
  | 'cancelled';

export interface ReservationAttributes {
  id: string;
  dropId: string;
  userId: string;
  status: ReservationStatus;
  reservedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ReservationCreationAttributes = Optional<
  ReservationAttributes,
  'id' | 'status' | 'reservedAt' | 'createdAt' | 'updatedAt'
>;

export type ReservationInstance = Model<
  ReservationAttributes,
  ReservationCreationAttributes
> &
  ReservationAttributes & {
    getDrop: BelongsToGetAssociationMixin<DropInstance>;
    getUser: BelongsToGetAssociationMixin<UserInstance>;
    getPurchase: HasOneGetAssociationMixin<PurchaseInstance>;
  };

export function initReservationModel(
  sequelize: Sequelize
): ModelStatic<ReservationInstance> {
  const Reservation = sequelize.define<ReservationInstance>(
    'Reservation',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dropId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'expired', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'active',
      },
      reservedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'reservations',
      underscored: true,
      timestamps: true,
    }
  );

  return Reservation;
}
