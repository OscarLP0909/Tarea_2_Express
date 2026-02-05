import express, { Express, Request, Response } from "express";
import { readTasks, writeTasks } from "./file-ops";
import { Task } from "./types";
import { error } from "console";

const app: Express = express();
const port: number = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.sendFile("form.html", { root: "public" });
});

// All endpoints will use the file tasks.json as a way to persist the data

app.get("/search", (req: Request, res: Response) => {
  if(!req.query.index){
    const result = readAllTasks();
    res.send(result);
  } else {
    const index = Number(req.query.index);
    const tasks = readAllTasks();
    if (isNaN(index) || index < 0 || index >= tasks.length) {
      res.statusCode = 400;
      res.send({"error": "Índice inválido"});
    } else {
      const result = readTaskWithIndex(index, tasks);
      res.send(result);
    }
  }
});

function readAllTasks() {
  const tasks: Task[] = readTasks();
  return tasks;
}

function readTaskWithIndex(index: number, tasks: Task[]) {
  const result = tasks[index];
  return result;
}

app.post("/create", (req: Request, res: Response) => {
  const name = req.body.name;
  const description = req.body.description;

  if(!name) {
    res.statusCode = 400;
    res.send({"error": "El nombre es obligatorio"});
  } else {
    const result = createTarea(name, description);
    res.statusCode = 201;
    res.send(result);
  }
});

function createTarea(name: string, description: string) {
    const tasks: Task[] = readTasks();
    tasks.push({"name": name, "description": description});
    writeTasks(tasks);
    return({"name": name, "description": description});
}

app.post("/delete", (req: Request, res: Response) => {
  if(req.body.index === undefined || req.body.index === null) {
    res.statusCode = 400
    res.send({"error": "Hace falta un índice"});
    return;
  }
  const index = Number(req.body.index);
  const tasks: Task[] = readTasks();
    if (isNaN(index) || index < 0 || index >= tasks.length) {
    res.statusCode = 400
    res.send({"error": "Índice no válido"});
  } else {
    const deleted = deleteTask(tasks, index);
    res.statusCode = 200;
    res.send(deleted);
  }
});

function deleteTask(tasks: Task[], index: number) {
  tasks.splice(index, 1);
  writeTasks(tasks);
  return {"message": "Se ha eliminado correctamente"};
}

app.post("/update", (req: Request, res: Response) => {
  if(req.body.index === undefined || req.body.index === null || !req.body.name ) {
    res.statusCode = 400;
    res.send({"error": "Necesita introducir índice y nombre"});
    return;
  } 
  const tasks: Task[] = readTasks();
  const index = Number(req.body.index);
  if (isNaN(index) || index < 0 || index >= tasks.length) {
    res.statusCode = 400;
    res.send({"error": "Índice no válido"});
  } else {
    const name = req.body.name;
    const description = req.body.description;
    const result = updateTask(name, description, tasks, index)
    res.statusCode = 200;
    res.send(result);
  }
});

function updateTask(name: string, description: string, tasks:Task[], index: number) {
  tasks[index] = {"name": name, "description": description};
  writeTasks(tasks);
  return tasks[index];
}

// Start only if it's executed directly, not imported
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export { app };