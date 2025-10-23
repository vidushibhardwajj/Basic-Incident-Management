import request from 'supertest';
import app from '../src/app'; // Adjust the path if necessary

describe('Entries API', () => {
    it('should create a new entry', async () => {
        const newEntry = {
            title: 'Test Entry',
            content: 'This is a test entry content.',
        };

        const response = await request(app)
            .post('/api/entries') // Adjust the endpoint if necessary
            .send(newEntry)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newEntry.title);
        expect(response.body.content).toBe(newEntry.content);
    });

    it('should retrieve all entries', async () => {
        const response = await request(app)
            .get('/api/entries') // Adjust the endpoint if necessary
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should retrieve a specific entry by ID', async () => {
        const entryId = '1'; // Replace with a valid entry ID

        const response = await request(app)
            .get(`/api/entries/${entryId}`) // Adjust the endpoint if necessary
            .expect(200);

        expect(response.body).toHaveProperty('id', entryId);
    });

    it('should return 404 for a non-existent entry', async () => {
        const nonExistentId = '999'; // Use an ID that does not exist

        const response = await request(app)
            .get(`/api/entries/${nonExistentId}`) // Adjust the endpoint if necessary
            .expect(404);
    });
});