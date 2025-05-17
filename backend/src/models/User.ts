import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@config/db';

class User extends Model {
    declare id: number;
    declare email: string;
    declare name: string;
    declare password: string;
    declare role: 'user' | 'admin';
    declare createdAt: Date;
    declare updatedAt: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user',
            validate: {
                isIn: [['user', 'admin']]
            }
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: true
    }
);

export default User;
