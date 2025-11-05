const request = require('supertest');
const app = require('../app');

describe('API smoke tests', () => {
  test('GET /api/bookings returns 200', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .query({ building: 'HLL', roomNumber: '101', day: 'Monday' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  test('GET /api/unique returns 200 and an array', async () => {
    const res = await request(app).get('/api/unique');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });



//   test('GET /api/add adds a building (skipped for now)', async () => {
//   });

});
