'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_one_active_reservation_per_user_per_drop
      ON reservations (drop_id, user_id)
      WHERE status = 'active';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_one_active_reservation_per_user_per_drop;'
    );
  },
};
