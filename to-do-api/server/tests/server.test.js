const expect =  require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {Todo} = require('./../models/todo');
const {app} = require('./../server');
const { todos, populateTodos, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('create a new todo', (done) => {
    const text = "Test todo text";
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
    .end((err, res) => {
      if(err) {
          return done(err);
      }
      Todo.find({'text': 'Test todo text'})
        .then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
    });
  });

  it('should not create todo with invalid body-data', (done) => {
    const text = "Test todo text";
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
            return done(err);
        }
        Todo.find()
          .then((todos) => {
            expect(todos.length).toBe(2);
            done();
          }).catch((e) => done(e));
      });
  });
});

describe('GET todos', () => {
  it('GET all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        Todo.find()
          .then((todos) => {
            expect(todos.length).toBe(2);
            done();
          }).catch((e) => done(e));
      })
  })
});

describe('GET todos :/id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  })
  it('should return 404 if not found', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  })
  it('should return 404 if not found', (done) => {
    const objectId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${objectId}`)
      .expect(404)
      .end(done);
  })
});

describe('DELETE todos :/id', () => {
  it('should remove a todo doc', (done) => {
    const hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        Todo.findById(hexId)
          .then((todo) => {
            expect(todo).toBe(null)
            done();
        }).catch((e) => done(e));
      });
  })
  it('should return 404 if not found', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  })
  it('should return 404 if not found', (done) => {
    const objectId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${objectId}`)
      .expect(404)
      .end(done);
  })
});

describe('PATCH todos :/id', () => {
  it('should update a todo doc', (done) => {
    const hexId = todos[1]._id.toHexString();
    const body = {
      completed: true,
      text: 'changed'
    }
    request(app)
      .patch(`/todos/${hexId}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.text).toBe('changed');
        // check if complatedAt is a number
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        done();
      });
  })
});
