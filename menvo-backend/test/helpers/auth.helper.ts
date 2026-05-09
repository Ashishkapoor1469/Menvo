import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export async function createAuthenticatedUser(app: INestApplication) {
  const testUser = {
    name: 'Sujan',
    email: `test_${Date.now()}@gmail.com`,
    password: '123456',
  };

  await request(app.getHttpServer())
    .post('/menvo/v1/auth/register')
    .send(testUser);

  const loginRes = await request(app.getHttpServer())
    .post('/menvo/v1/auth/login')
    .send({ email: testUser.email, password: testUser.password });

  return {
    user: testUser,
    accessToken: loginRes.body.accessToken,
  };
}
