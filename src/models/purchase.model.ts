import {
  BelongsToGetAssociationMixin,
  DataTypes,
  Model,
  ModelStatic,
  Optional,
  Sequelize,
} from 'sequelize';
import type { DropInstance } from './drop.model';
import type { ReservationInstance } from './reservation.model';
import type { UserInstance } from './user.model';

export interface PurchaseAttributes {
  id: string;
  reservationId: string;
  dropId: string;
  userId: string;
  priceAtPurchase: string;
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PurchaseCreationAttributes = Optional<
  PurchaseAttributes,
  'id' | 'purchasedAt' | 'createdAt' | 'updatedAt'
>;

export type PurchaseInstance = Model<
  PurchaseAttributes,
  PurchaseCreationAttributes
> &
  PurchaseAttributes & {
    getReservation: BelongsToGetAssociationMixin<ReservationInstance>;
    getDrop: BelongsToGetAssociationMixin<DropInstance>;
    getUser: BelongsToGetAssociationMixin<UserInstance>;
  };

export function initPurchaseModel(
  sequelize: Sequelize
): ModelStatic<PurchaseInstance> {
  const Purchase = sequelize.define<PurchaseInstance>(
    'Purchase',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reservationId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      dropId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      priceAtPurchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      purchasedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
      tableName: 'purchases',
      underscored: true,
      timestamps: true,
    }
  );

  return Purchase;
}
