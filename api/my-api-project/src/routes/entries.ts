import { Router } from 'express';
import EntriesController from '../controllers/entriesController';

const router = Router();
const entriesController = new EntriesController();

export function setRoutes(app) {
    app.use('/api/entries', router);
    
    router.post('/', entriesController.createEntry.bind(entriesController));
    router.get('/', entriesController.getEntries.bind(entriesController));
}