'use strict';

const SNEAKER_DROPS = [
  {
    name: 'Air Jordan 1 High OG "Chicago"',
    description: 'Jordan',
    image_url:
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    price: 180.0,
    total_stock: 25,
    available_stock: 12,
    status: 'live',
  },
  {
    name: 'Yeezy Boost 350 V2 "Onyx"',
    description: 'Adidas',
    image_url:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
    price: 230.0,
    total_stock: 20,
    available_stock: 3,
    status: 'live',
  },
  {
    name: 'Travis Scott x AJ1 Low "Reverse Mocha"',
    description: 'Jordan',
    image_url:
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    price: 150.0,
    total_stock: 15,
    available_stock: 0,
    status: 'live',
  },
  {
    name: 'Nike Dunk Low "Panda"',
    description: 'Nike',
    image_url:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    price: 115.0,
    total_stock: 40,
    available_stock: 18,
    status: 'live',
  },
  {
    name: 'New Balance 9060 "Shadow Grey"',
    description: 'New Balance',
    image_url:
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    price: 160.0,
    total_stock: 15,
    available_stock: 5,
    status: 'live',
  },
  {
    name: 'Off-White x Nike Air Force 1 "MCA"',
    description: 'Nike',
    image_url:
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
    price: 190.0,
    total_stock: 10,
    available_stock: 2,
    status: 'live',
  },
  {
    name: 'Air Jordan 4 Retro "Military Black"',
    description: 'Jordan',
    image_url:
      'https://images.unsplash.com/photo-1606107557195-0a29dd4a43d1?auto=format&fit=crop&w=800&q=80',
    price: 210.0,
    total_stock: 30,
    available_stock: 14,
    status: 'live',
  },
  {
    name: 'Adidas Samba OG "White/Black"',
    description: 'Adidas',
    image_url:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    price: 100.0,
    total_stock: 50,
    available_stock: 22,
    status: 'live',
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      'drops',
      SNEAKER_DROPS.map((drop) => ({
        ...drop,
        starts_at: now,
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('drops', {
      name: {
        [Sequelize.Op.in]: SNEAKER_DROPS.map((drop) => drop.name),
      },
    });
  },
};
