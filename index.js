const express = require('express');
const server = express();

server.use(express.json());

const projects = [
  { id: "0", title: "Angular", tasks: [] },
  { id: "1", title: "React", tasks: [] },
  { id: "2", title: "Reactive Native", tasks: [] }
];

// Middlewares

// Middleware global:
server.use((req, res, next) => {
  console.time('Request');
  console.log(`Method: ${req.method}, URL: ${req.url}`);
  console.count('Number of total requests:');
  next();
  console.timeEnd('Request');
});

// Middleware local
function checkIdExists(req, res, next) {
  const { id } = req.body;
  if (projects.find(project => project.id === id)) {
    return res.status(400).json({ error: 'Project id already exists' })
  }
  return next();
} 

// Middleware local 
// Verifica se o projeto com aquele ID existe. (Para rotas que recebem o ID do 
// projeto nos parâmetros da URL.)
function checkIdAlreadyExistsAndAllow(req, res, next) {
  const { id } = req.params;
  const auxVal = projects.findIndex(project => project.id === id);
  if (auxVal < 0) {
    return res.status(400).json({ error: 'Project id not found' })
  }
  return next();
}

// Lists all projects and tasks
server.get('/projects', (req, res) => {
  return res.json(projects);
});

// Register a new project within the array:
server.post('/projects', checkIdExists, (req, res) => {
  const { id, title } = req.body;
  const project = {
    id,
    title,
    tasks: []
  };
  projects.push(project);

  return res.json(projects);
});

// Only change the project title; id present in the route parameters
server.put('/projects/:id', checkIdAlreadyExistsAndAllow, (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  projects.find(project => project.id === id).title = title;

  return res.json(projects);
});

// delete the project with the id present in the route parameters
server.delete('/projects/:id', checkIdAlreadyExistsAndAllow, (req, res) => {
  const { id } = req.params;
  
  // find index of the element in the array through a key called id
  const index = projects.findIndex(project => project.id === id);
  if (index>0){
    projects.splice(index, 1);
  }else{ // esta redundante atualmente, mas sem teste, deixa assim por enquanto
    console.log(`The id(${id}) informed does not exist.`);
  }
  
  return res.json(projects);
});

// Stores a new task in the tasks of a specific project chosen through the id 
// present in the route parameters; route receives a title field.
server.post('/projects/:id/tasks', checkIdAlreadyExistsAndAllow, (req, res) => {
  const { title } = req.body;
  const { id } = req.params;

  // find element with id in the array and add task to the element
  projects.find(project => project.id === id).tasks.push(title);
  return res.json(projects);
});


server.listen(3008);