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
    imageUrl?: string;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
    public id!: number;
    public title!: string;
    public description!: string;
    public date!: Date;
    public createdBy!: number;
    public location!: string;
    public imageUrl!: string;
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
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: 'Event',
        tableName: 'Events',
        timestamps: true,
    }
);

const setupAssociations = async () => {
    try {
    // Получаем список всех ограничений таблицы Events через прямой SQL-запрос
    const [constraints] = await sequelize.query(`
      SELECT conname as "constraintName"
      FROM pg_constraint
      WHERE conrelid = '\"Events\"'::regclass
    `);
    const exists = (constraints as any[]).some(
      (c: any) => c.constraintName === 'events_createdby_fkey'
    );
    if (exists) {
      console.log('Внешний ключ уже существует, пропускаем добавление.');
      return;
    }
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

Event.afterSync(() => {
    setupAssociations();
});

export default Event;
