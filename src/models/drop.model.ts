import {
  DataTypes,
  HasManyGetAssociationsMixin,
  Model,
  ModelStatic,
  Optional,
  Sequelize,
} from 'sequelize';
import type { PurchaseInstance } from './purchase.model';
import type { ReservationInstance } from './reservation.model';

export type DropStatus = 'scheduled' | 'live' | 'ended';

export interface DropAttributes {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: string;
  totalStock: number;
  availableStock: number;
  startsAt: Date | null;
  status: DropStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type DropCreationAttributes = Optional<
  DropAttributes,
  'id' | 'description' | 'imageUrl' | 'startsAt' | 'status' | 'createdAt' | 'updatedAt'
>;

export type DropInstance = Model<DropAttributes, DropCreationAttributes> &
  DropAttributes & {
    getReservations: HasManyGetAssociationsMixin<ReservationInstance>;
    getPurchases: HasManyGetAssociationsMixin<PurchaseInstance>;
  };

export function initDropModel(sequelize: Sequelize): ModelStatic<DropInstance> {
  const Drop = sequelize.define<DropInstance>(
    'Drop',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      totalStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      availableStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      startsAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'live', 'ended'),
        allowNull: false,
        defaultValue: 'scheduled',
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
      tableName: 'drops',
      underscored: true,
      timestamps: true,
    }
  );

  return Drop;
}
