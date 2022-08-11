import 'mocha';
import { expect } from 'chai';
import { agent as request } from 'supertest';
import { Repository } from 'typeorm';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';

import { app } from '../../';

describe('Users', () => {
  let userRepository: Repository<User>;
  const userPassword = 'pass1';
  let adminUserToken = null;
  const adminUser = new User();
  adminUser.username = 'Badger';
  adminUser.firstName = 'Brandon';
  adminUser.lastName = 'Mayhew';
  adminUser.email = 'brandon.mayhew@test.com';
  adminUser.hashedPassword = userPassword;
  adminUser.hashPassword();
  adminUser.isAdmin = true;

  let standardUserToken = null;
  const standardUser = new User();
  standardUser.username = 'Toddy';
  standardUser.firstName = 'Todd';
  standardUser.firstName = 'Alquist';
  standardUser.email = 'todd.alquist@test.com';
  standardUser.hashedPassword = userPassword;
  standardUser.hashPassword();
  standardUser.isAdmin = false;

  before(async () => {
    await AppDataSource.initialize();
    userRepository = AppDataSource.getRepository(User);
  });

  beforeEach(async () => {
    await userRepository.save([adminUser, standardUser]);
    let res = await request(app).post('/v1/auth/login').send({ email: adminUser.email, password: userPassword });
    adminUserToken = res.body.data;
    res = await request(app).post('/v1/auth/login').send({ email: standardUser.email, password: userPassword });
    standardUserToken = res.body.data;
  });

  afterEach(async () => {
    await userRepository.delete([adminUser.id, standardUser.id]);
  });

  describe('GET /v1/auth/users', () => {
    it('should get all users', async () => {
      const res = await request(app).get('/v1/users').set('Authorization', adminUserToken);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('List of users.');
      expect(res.body.data[3].email).to.eql('hank.schrader@test.com');
    });

    it('should report error of unauthorized user', async () => {
      const res = await request(app).get('/v1/users').set('Authorization', standardUserToken);
      expect(res.status).to.equal(401);
      expect(res.body.errorType).to.equal('Unauthorized');
      expect(res.body.errorMessage).to.equal('Unauthorized - Insufficient user rights');
      expect(res.body.errors).to.eql([
        'Unauthorized - Insufficient user rights',
        'Current role: STANDARD. Required role: ADMINISTRATOR',
      ]);
      expect(res.body.errorRaw).to.an('null');
      expect(res.body.errorsValidation).to.an('null');
    });
  });

  describe('GET /v1/auth/users//:id([0-9]+)', () => {
    it('should get user', async () => {
      const user = await userRepository.findOne({ where: { email: adminUser.email } });
      const res = await request(app).get(`/v1/users/${user.id}`).set('Authorization', adminUserToken);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('User found');
      expect(res.body.data.email).to.eql(adminUser.email);
    });
  });
});
