import { Sequelize } from 'sequelize';
import { initUserModel } from './user.model';
import { initDropModel } from './drop.model';
import { initReservationModel } from './reservation.model';
import { initPurchaseModel } from './purchase.model';

export function initModels(sequelize: Sequelize) {
  const User = initUserModel(sequelize);
  const Drop = initDropModel(sequelize);
  const Reservation = initReservationModel(sequelize);
  const Purchase = initPurchaseModel(sequelize);

  Drop.hasMany(Reservation, { foreignKey: 'dropId', as: 'reservations' });
  Reservation.belongsTo(Drop, { foreignKey: 'dropId', as: 'drop' });

  User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
  Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Reservation.hasOne(Purchase, { foreignKey: 'reservationId', as: 'purchase' });
  Purchase.belongsTo(Reservation, {
    foreignKey: 'reservationId',
    as: 'reservation',
  });

  Drop.hasMany(Purchase, { foreignKey: 'dropId', as: 'purchases' });
  Purchase.belongsTo(Drop, { foreignKey: 'dropId', as: 'drop' });

  User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
  Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  return { User, Drop, Reservation, Purchase };
}

export type {
  UserAttributes,
  UserCreationAttributes,
  UserInstance,
} from './user.model';
export type {
  DropAttributes,
  DropCreationAttributes,
  DropInstance,
  DropStatus,
} from './drop.model';
export type {
  ReservationAttributes,
  ReservationCreationAttributes,
  ReservationInstance,
  ReservationStatus,
} from './reservation.model';
export type {
  PurchaseAttributes,
  PurchaseCreationAttributes,
  PurchaseInstance,
} from './purchase.model';
