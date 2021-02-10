/* eslint-disable no-undef */
const { connect } = require('../lib/orm');
const { TodoSchema } = require('../todo.model');
const { config } = require('../config');
const server = require('../server');
const fetch = require('node-fetch');

const nock = require('nock');

const { list, truncate, add } = require('../todo');

describe('todos', () => {
  let connection;
  beforeAll(async () => {
    connection = await connect([TodoSchema], config.database, false);
    server.run();
  });
  beforeEach(async () => {
    await truncate();

    await add({
      task: 'task 1',
      done: false,
    });
  });
  afterAll(async () => {
    await truncate();
    await connection.close();
    server.stop();
  });

  describe('list', () => {
    it.skip('get list', async () => {
      const todos = await list();
      expect(todos).toHaveLength(1);
    });
    it('get list by fetch', async () => {
      const mutation = await fetch('http://localhost:7767/add', {
        method: 'post',
        body: JSON.stringify({
          task: 'task 2',
          done: false,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await mutation.json();
      console.log(res);
      expect(res.task).toBe('task 2');

      // intercept with nock
      nock('http://localhost:7767')
        .get('/list')
        .reply(200, [
          {
            id: 1,
            task: 'buy the milk',
            done: false,
          },
          {
            id: 2,
            task: 'buy the tea',
            done: false,
          },
        ]);

      const response = await fetch('http://localhost:7767/list', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log(data);
      expect(data).toHaveLength(2);
    });
  });
});
