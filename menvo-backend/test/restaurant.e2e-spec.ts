import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { createAuthenticatedUser } from './helpers/auth.helper';

describe('Restaurant E2E', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const { accessToken } = await createAuthenticatedUser(app);
    authToken = accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /restaurant-greet', () => {
    it('should return greet message with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/menvo/v1/restraunt/restaurant-greet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.text).toBe('hii this is restaurant protected route');
    });

    it('should reject without token', async () => {
      const res = await request(app.getHttpServer()).get(
        '/menvo/v1/restraunt/restaurant-greet',
      );

      expect(res.status).toBe(401);
    });

    it('should reject with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/menvo/v1/restraunt/restaurant-greet')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /register', () => {
    it('should register a restaurant successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/restraunt/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurantName: "Sujan's Kitchen",
          restaurantBio: 'Best food in town',
        });
      console.log('RESTAURANT REGISTER RESPONSE:', res.body);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Sujan's Kitchen");
      expect(res.body.bio).toBe('Best food in town');
    });

    it('should register without optional restaurantBio', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/restraunt/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurantName: "Sujan's Kitchen 2",
          // restaurantBio is optional so omitting it
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Sujan's Kitchen 2");
    });

    it('should reject missing restaurantName', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/restraunt/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurantBio: 'Best food in town',
          // restaurantName missing
        });

      expect(res.status).toBe(400);
    });

    it('should reject empty restaurantName', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/restraunt/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurantName: '', // @IsNotEmpty() should reject this
          restaurantBio: 'Best food in town',
        });

      expect(res.status).toBe(400);
    });

    it('should reject unknown fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/restraunt/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurantName: "Sujan's Kitchen",
          restaurantBio: 'Best food in town',
          unknownField: 'hacker', // forbidNonWhitelisted should reject
        });

      expect(res.status).toBe(400);
    });

    it('should reject without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/restraunt/register')
        .send({
          restaurantName: "Sujan's Kitchen",
          restaurantBio: 'Best food in town',
        });

      expect(res.status).toBe(401);
    });
  });
});
