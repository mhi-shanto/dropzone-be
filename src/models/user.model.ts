import {
  DataTypes,
  HasManyGetAssociationsMixin,
  Model,
  ModelStatic,
  Optional,
  Sequelize,
} from "sequelize";
import type { PurchaseInstance } from "./purchase.model";
import type { ReservationInstance } from "./reservation.model";

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export type UserInstance = Model<UserAttributes, UserCreationAttributes> &
  UserAttributes & {
    getReservations: HasManyGetAssociationsMixin<ReservationInstance>;
    getPurchases: HasManyGetAssociationsMixin<PurchaseInstance>;
  };

export function initUserModel(sequelize: Sequelize): ModelStatic<UserInstance> {
  const User = sequelize.define<UserInstance>(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING(60),
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
      tableName: "users",
      underscored: true,
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['passwordHash'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['passwordHash'] },
        },
      },
    },
  );

  return User;
}
