'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('drops', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      total_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      available_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      starts_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'live', 'ended'),
        allowNull: false,
        defaultValue: 'scheduled',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE drops
      ADD CONSTRAINT drops_available_stock_gte_zero
      CHECK (available_stock >= 0);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE drops
      ADD CONSTRAINT drops_available_stock_lte_total_stock
      CHECK (available_stock <= total_stock);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE drops DROP CONSTRAINT IF EXISTS drops_available_stock_lte_total_stock;'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE drops DROP CONSTRAINT IF EXISTS drops_available_stock_gte_zero;'
    );
    await queryInterface.dropTable('drops');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_drops_status";'
    );
  },
};
