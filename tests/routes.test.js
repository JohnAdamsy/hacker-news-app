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

describe('Test Wrong Endpoint', () => {
    test('get wrong route GET /words', async () => {
    const response = await request(server).get('/words');
    expect(response.status).toEqual(404);
    expect(response.text).toContain('Not Found');
    });
   });

describe('Test words/occurrences Endpoint', () => {
    //jest.setTimeout(2500);
    test('get 10 most occurring words from last 25 stories GET /words/occurrences', async () => {
    const response = await request(server).get('/words/occurrences');
    expect(response.status).toEqual(200);
    expect(Object.keys(response.body)).toEqual(['data','title']);
 });
});

describe('Test words/occurrences/last-week Endpoint', () => {
    jest.setTimeout(10000);
    test('get 10 most occurring words from posts of last week GET /words/occurrences/last-week', async () => {
    const response = await request(server).get('/words/occurrences/last-week');
    expect(response.status).toEqual(200);
    expect(Object.keys(response.body)).toEqual(['data','title','posts']);
 });
});

describe('Test words/occurrences/users Endpoint', () => {
    jest.setTimeout(30000);
    test('get 10 most occurring words from last stories of users with karma > 10000 GET /words/occurrences/users', async () => {
    const response = await request(server).get('/words/occurrences/users');
    expect(response.status).toEqual(200);
    expect(Object.keys(response.body)).toEqual(['data','title','users','posts']);
 });
});