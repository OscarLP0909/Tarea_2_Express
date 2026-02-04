import express, { Express, Request, Response } from "express";
import { readTasks, writeTasks } from "./file-ops";
import { Task } from "./types";

const app: Express = express();
const port: number = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.sendFile("form.html", { root: "public" });
});

// All endpoints will use the file tasks.json as a way to persist the data

app.get("/search", (req: Request, res: Response) => {
  // - Get all tasks if no index is given
  // - If req.query.index is provided, use that to get a task.
  // - If the index is out of bounds, return 404
  // TODO
  const tasks: Task[] = readTasks();
  const index = Number(req.query.index);

  if(!req.query.index){
    res.send(tasks);
  } else {
  if (isNaN(index) || index < 0 || index >= tasks.length) {
      res.statusCode = 404;
      res.send(`<p>Índice incorrecto</p>`);
    } else {
      res.send(tasks[index]);
    }
  }
});

app.post("/create", (req: Request, res: Response) => {
  // - A task is given in the body (name + description)
  // - If the name is not in the body or is empty, a 400 will be returned
  // - The description can be empty or not present
  // - The task is written to the file and 201 is returned
  // REMEMBER: The body is given URL Encoded (from a form)
  // TODO
  const name = req.body.name;
  const body = req.body;
  const tasks: Task[] = readTasks();

  if(!name) {
    res.statusCode = 400;
    res.send(`<p>Necesita un nombre la tarea`);
  } else {
    tasks.push(body);
    writeTasks(tasks);
    res.statusCode = 201;
    res.send(tasks);
  }
});

app.post("/delete", (req: Request, res: Response) => {
  // - If no req.body.index is given or it's unmatched, return 400
  // - If req.body.index is matched, remove the task from the file
  // IMPORTANT: This is a POST, the data is in the body!
  // TODO
  const index = Number(req.body.index);
  const tasks: Task[] = readTasks();

  if(!req.body.index) {
    res.statusCode = 400
    res.send(`No se ha enviado un índice`);
  } else if (isNaN(index) || index < 0 || index >= tasks.length) {
    res.statusCode = 400
    res.send(`Índice no válido`);
  } else {
    const deleted = tasks.splice(index, 1);
    writeTasks(tasks);
    res.statusCode = 200;
    res.send(tasks);
  }
});

app.post("/update", (req: Request, res: Response) => {

  const index = Number(req.body.index);
  const tasks: Task[] = readTasks();

  if(!req.body.index || !req.body.name) {
    res.statusCode = 400;
    res.send(`Necesita introducir índice y nombre`);
  } else if (isNaN(index) || index < 0 || index >= tasks.length) {
    res.statusCode = 400;
    res.send(`El índice es inválido`);
  } else {
    tasks[index] = {"name": req.body.name, "description": req.body.description};
    writeTasks(tasks);
    res.statusCode = 200;
    res.send(tasks);
  }
});

// Start only if it's executed directly, not imported
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export { app };