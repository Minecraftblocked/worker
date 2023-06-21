import supertest from 'supertest';
import app from '../app';

const superApp = supertest(app);

describe('Test example', () => {
  it('should respond to GET /', (done) => {
    superApp
      .get('/')
      .expect(200)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
});
