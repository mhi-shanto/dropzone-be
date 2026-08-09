'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_reservations_expiry_sweep
      ON reservations (expires_at)
      WHERE status = 'active';
    `);

    await queryInterface.addIndex('reservations', ['drop_id', 'status'], {
      name: 'idx_reservations_drop_status',
    });

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_purchases_drop_recent
      ON purchases (drop_id, purchased_at DESC);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_reservations_expiry_sweep;'
    );
    await queryInterface.removeIndex(
      'reservations',
      'idx_reservations_drop_status'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_purchases_drop_recent;'
    );
  },
};
