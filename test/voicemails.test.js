const app = require('../server');
const db = require('../config/connection');
const expect = require('chai').expect;
const request = require('supertest');
const axios = require('axios');
const sinon = require('sinon');

let axiosStub;

describe('Requesting', () => {
    before(async () => {
        // create temporary table before running tests
        const query = `
        CREATE TEMP TABLE IF NOT EXISTS voicemails (
            id SERIAL,
            transcript TEXT NOT NULL,
            phone VARCHAR(20),
            duration INTEGER,
            date TIMESTAMP DEFAULT NOW(),
            read BOOLEAN DEFAULT FALSE
        );

        INSERT INTO voicemails (transcript, phone, duration)
        VALUES ('hello', 5555555555, 5500);
        `;

        await db.query(query);
        
        // mock third-party api call
        axiosStub = sinon.stub(axios, 'post').resolves('Call me back, please');

        after(() => {
            // stop server after running all tests
            app.close(() => {
              process.exit(0);
            });
          });

          
    });
    // TODO all the tests!
    // get voicemails
    describe('GET /api/voicemails', () => {
        it('should respond with JSON', async () => {
          const res = await request(app)
            .get('/api/voicemails')
            .expect('Content-Type', /json/)
            .expect(200);
    
          expect(res.body).to.be.a('array').that.is.not.empty;
        });
      });
      // Post voicemails
      describe('POST /api/voicemails', () => {
        it('should error if missing required fields', async () => {
          await request(app)
            .post('/api/voicemails')
            .expect(400);
        });

        it('should call the transcription API', async () => {
          axiosStub.resetHistory();
        
          await request(app)
            .post('/api/voicemails')
            .send({ audio: 'abcdefg' })
            .expect(200);
        
          expect(axiosStub.called).to.equal(true);
        });

        it('should return the new record from database', async () => {      
          const res = await request(app)
            .post('/api/voicemails')
            .send({ audio: 'abcdefg' })
            .expect('Content-Type', /json/)
            .expect(200);
        
          expect(res.body).to.be.a('object').with.property('id').to.be.above(1);
        });
      });
      // patch voicemails 
      describe('PATCH /api/voicemails/:id', () => {
        it('should error if missing required field', async () => {
          await request(app)
            .patch('/api/voicemails/1')
            .expect(400);
        });
    
        it('should send correct status code', async () => {
          await request(app)
            .patch('/api/voicemails/1')
            .send({ read: true })
            .expect(204);
    
          // second attempt will fail because record doesn't exist
          await request(app)
            .patch('/api/voicemails/100')
            .send({ read: true })
            .expect(404);
        });
      });
       
      // delete voicemails
      describe('DELETE /api/voicemails/:id', () => {
        it('should send correct status code', async () => {
          await request(app)
            .delete('/api/voicemails/1')
            .expect(204);
    
          // second attempt will fail because record should no longer exist
          await request(app)
          .delete('/api/voicemails/1')
          .expect(404);
        });
      });
});