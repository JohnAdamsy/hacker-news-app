const request = require('supertest');
const {server} = require('../app.js');


beforeAll(async () => {
 console.log('Jest is Starting...');
});


afterAll(() => {
 server.close();
 console.log('Server closed');
});

describe('Test Default Endpoint', () => {
 test('get default route GET /', async () => {
 const response = await request(server).get('/');
 expect(response.status).toEqual(200);
 expect(response.body.name).toContain('hacker-news-app');
 });
});