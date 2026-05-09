import { Test } from '@nestjs/testing';
import {
  INestApplication,
  VersioningType,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Auth E2E', () => {
  let app: INestApplication;
  let authToken: string;

  const testUser = {
    name: 'Sujan',
    email: `test_${Date.now()}@gmail.com`,
    password: '123456',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('menvo');
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.message).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/auth/register')
        .send(testUser);
      console.log('REGISTER RESPONSE:', res.status, res.body);
      expect(res.status).toBe(409);
    });
  });

  describe('Login', () => {
    it('should login and return access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      console.log('LOGIN RESPONSE:', res.status, res.body);
      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeDefined();

      authToken = res.body.accessToken;
    });

    it('should reject wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/menvo/v1/auth/login')
        .send({ email: 'ghost@gmail.com', password: '123456' });

      expect(res.status).toBe(404);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/menvo/v1/restraunt/restaurant-greet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });

    it('should reject request without token', async () => {
      const res = await request(app.getHttpServer()).get(
        '/menvo/v1/restraunt/restaurant-greet',
      );

      expect(res.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/menvo/v1/restraunt/restaurant-greet')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
    });
  });
});
