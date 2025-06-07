import { Request, Response } from 'express';
import { EventParticipant } from '../models/EventParticipant';
import User from '../models/User';

export const eventParticipantController = {
  async participate(req: Request, res: Response) {
    const { eventId } = req.params;
    const userId = req.auth?.user?.id;
    if (!userId) return res.status(401).json({ message: 'Необходима авторизация' });

    // Проверка на повторное участие
    const exists = await EventParticipant.findOne({ where: { eventId, userId } });
    if (exists) return res.status(400).json({ message: 'Вы уже участвуете' });

    await EventParticipant.create({ eventId, userId });
    res.json({ success: true });
  },

  async getCount(req: Request, res: Response) {
    const { eventId } = req.params;
    const count = await EventParticipant.count({ where: { eventId } });
    res.json({ count });
  },

  async isParticipating(req: Request, res: Response) {
    const { eventId } = req.params;
    const userId = req.auth?.user?.id;
    if (!userId) return res.json({ isParticipating: false });
    const exists = await EventParticipant.findOne({ where: { eventId, userId } });
    res.json({ isParticipating: !!exists });
  },

  async getParticipantsList(req: Request, res: Response) {
    const { eventId } = req.params;
    const participants = await EventParticipant.findAll({
      where: { eventId },
      include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }]
    });
    res.json(participants.map((p: any) => p.User));
  }
}; 