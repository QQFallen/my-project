import { Router } from 'express';
import { eventParticipantController } from '../controllers/eventParticipantController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:eventId/participate', authenticate, eventParticipantController.participate);
router.get('/:eventId/count', eventParticipantController.getCount);
router.get('/:eventId/isParticipating', authenticate, eventParticipantController.isParticipating);
router.get('/:eventId/list', eventParticipantController.getParticipantsList);

export default router; 