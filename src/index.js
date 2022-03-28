const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { response } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

function checkDeadLine(deadline){
  return new Date() > new Date(deadline);
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());

  if(userAlreadyExists){
    return response.status(400).json({ error: "User already exists!" });
  };

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  
  if(checkDeadLine(deadline)){
    return response.status(400).send({ error: "Creation date cannot be greater than deadline!" })
  }

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  
  if(checkDeadLine(deadline)){
    return response.status(400).send({ error: "Creation date cannot be greater than deadline!" });
  };

  todoExists = user.todos.some(todo => todo.id === id);
  if(!todoExists){
    return response.status(400).json({ error: "Todo item not found!" });
  };

  todoItem = user.todos.find(todo => todo.id === id);
  todoItem.title = title;
  todoItem.deadline = deadline;

  return response.status(200).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  todoExists = user.todos.some(todo => todo.id === id);
  if(!todoExists){
    return response.status(400).json({ error: "Todo item not found!" });
  };

  todoItem = user.todos.find(todo => todo.id === id);
  todoItem.done = !todoItem.done;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  todoExists = user.todos.some(todo => todo.id === id);
  if(!todoExists){
    return response.status(400).json({ error: "Todo item not found!" })
  }

  todoItem = user.todos.find(todo => todo.id === id);
  user.todos.splice(user.todos.indexOf(todoItem), 1);

  return response.status(200).json(user.todos);
});

module.exports = app;