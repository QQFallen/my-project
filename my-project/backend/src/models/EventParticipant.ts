import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export class EventParticipant extends Model {
  public id!: number;
  public eventId!: number;
  public userId!: number;
}

EventParticipant.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    eventId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'event_participants',
    timestamps: false,
  }
);

EventParticipant.belongsTo(User, { foreignKey: 'userId' }); 