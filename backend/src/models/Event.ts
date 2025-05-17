import { Model, Optional, DataTypes } from 'sequelize';
import { sequelize } from '@config/db';

// Определяем интерфейс для атрибутов события
interface EventAttributes {
    id: number;
    title: string;
    description?: string;
    date: Date;
    createdBy: number;
    location: string;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
    public id!: number;
    public title!: string;
    public description!: string;
    public date!: Date;
    public createdBy!: number;
    public location!: string;
}

// Определяем структуру модели
Event.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    },
    {
        sequelize,
        modelName: 'Event',
        tableName: 'Events',
        timestamps: true,
    }
);

// Определяем связь с пользователем после создания таблиц
const setupAssociations = async () => {
    try {
        await sequelize.getQueryInterface().addConstraint('Events', {
            fields: ['createdBy'],
            type: 'foreign key',
            name: 'events_createdby_fkey',
            references: {
                table: 'Users',
                field: 'id',
            },
            onDelete: 'NO ACTION',
            onUpdate: 'CASCADE',
        });
        console.log('Внешний ключ успешно добавлен');
    } catch (error) {
        console.error('Ошибка при добавлении внешнего ключа:', error);
    }
};

// Вызываем функцию настройки связей после синхронизации
Event.afterSync(() => {
    setupAssociations();
});

export default Event;
