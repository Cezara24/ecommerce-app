console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const bcrypt = require('bcrypt');
const sequelize = require('../db'); // Importă conexiunea Sequelize
const { DataTypes } = require('sequelize');
const moment = require('moment');

// Inițializează modelele
const Role = require('../models/Role')(sequelize, DataTypes);
const Permission = require('../models/Permission')(sequelize, DataTypes);
const RolePermission = require('../models/RolePermission')(sequelize, DataTypes);
const User = require('../models/User')(sequelize, DataTypes);
const UserAddress = require('../models/UserAddress')(sequelize, DataTypes);

async function seedDatabase() {
    const transaction = await sequelize.transaction(); // Inițializează o tranzacție
    try {
        // Ştergerea tuturor datelor din tabele
        await sequelize.query('TRUNCATE "RolePermissions" CASCADE;', { transaction });
        await sequelize.query('TRUNCATE "Permissions" CASCADE;', { transaction });
        await sequelize.query('TRUNCATE "Roles" CASCADE;', { transaction });
        await sequelize.query('TRUNCATE "UserAddresses" CASCADE;', { transaction });
        await sequelize.query('TRUNCATE "Users" CASCADE;', { transaction });

        // 1. Crearea rolurilor
        const roles = await Role.bulkCreate([
            { name: 'admin', description: 'Administrator with full access' },
            { name: 'customer', description: 'Regular customer' },
            { name: 'merchant', description: 'Merchant who sells products' },
        ], { transaction });

        // 2. Crearea permisiunilor
        const permissions = await Permission.bulkCreate([
            { name: 'view_users', description: 'Can view all users' },
            { name: 'create_user', description: 'Can create users' },
            { name: 'update_user', description: 'Can update user profiles' },
            { name: 'delete_user', description: 'Can delete users' },

            { name: 'view_analytics', description: 'Can view analytics' },
            { name: 'create_analytics_event', description: 'Can create analytics events' },
            { name: 'delete_analytics_event', description: 'Can delete analytics events' },

            { name: 'assign_role', description: 'Can assign roles' },

            { name: 'view_cart', description: 'Can view cart' },
            { name: 'manage_cart', description: 'Can manage cart' },
            { name: 'delete_cart', description: 'Can delete cart' },

            { name: 'view_categories', description: 'Can view categories' },
            { name: 'view_category', description: 'Can view a specific category' },
            { name: 'create_category', description: 'Can create a category' },
            { name: 'update_category', description: 'Can update a category' },
            { name: 'delete_category', description: 'Can delete a category' },

            { name: 'view_coupons', description: 'Can view coupons' },
            { name: 'view_coupon', description: 'Can view a specific coupon' },
            { name: 'create_coupon', description: 'Can create a coupon' },
            { name: 'update_coupon', description: 'Can update a coupon' },
            { name: 'delete_coupon', description: 'Can delete a coupon' },
            { name: 'redeem_coupon', description: 'Can redeem a coupon' },

            { name: 'create_notification', description: 'Can create notifications' },
            { name: 'delete_notification', description: 'Can delete notifications' },

            { name: 'view_orders', description: 'Can view orders' },
            { name: 'view_order', description: 'Can view a specific order' },
            { name: 'create_order', description: 'Can create orders' },
            { name: 'update_order', description: 'Can update orders' },
            { name: 'delete_order', description: 'Can delete orders' },
            { name: 'manage_orders', description: 'Can manage orders' },
            { name: 'view_transactions', description: 'Can view transactions' },

            { name: 'create_product', description: 'Can create products' },

            { name: 'view_reviews', description: 'Can view reviews' },
            { name: 'create_review', description: 'Can create reviews' },
            { name: 'delete_review', description: 'Can delete reviews' },

            { name: 'view_roles', description: 'Can view roles' },
            { name: 'create_role', description: 'Can create roles' },
            { name: 'update_role', description: 'Can update roles' },
            { name: 'delete_role', description: 'Can delete roles' },
            { name: 'view_permissions', description: 'Can view permissions' },
            { name: 'create_permission', description: 'Can create permissions' },
            { name: 'assign_permission', description: 'Can assign permissions' },
            { name: 'revoke_permission', description: 'Can revoke permissions' },

            { name: 'view_addresses', description: 'Can view addresses' },

            { name: 'view_wishlist', description: 'Can view wishlist' },
            { name: 'manage_wishlist', description: 'Can manage wishlist' },
        ], { transaction });

        // 3. Maparea rol-permisii (admin are toate permisiunile)
        const adminRole = roles.find(r => r.name === 'admin');
        const rolePermissions = permissions.map(p => ({
            roleId: adminRole.id,
            permissionId: p.id,
        }));
        await RolePermission.bulkCreate(rolePermissions, { transaction });

        // 4. Crearea unui utilizator admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS Z');
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: adminPassword,
            roleId: adminRole.id,
            phoneNumber: '1234567890',
            isVerified: true,
            verifiedAt: currentTime,
        }, { transaction });

        // 5. Crearea unei adrese pentru utilizatorul admin
        await UserAddress.create({
            userId: adminUser.id,
            addressLine1: '123 Admin St',
            city: 'Admin City',
            state: 'Admin State',
            zipCode: '12345',
            country: 'Admin Country',
            isDefault: true,
        }, { transaction });

        await transaction.commit();
        console.log('Seed completed successfully!');
    } catch (error) {
        await transaction.rollback();
        console.error('Seed failed:', error);
    }
}

seedDatabase();
