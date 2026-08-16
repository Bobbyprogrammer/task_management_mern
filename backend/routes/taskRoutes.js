import { Router } from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/taskController.js";
import auth from "../middlewares/auth.js";

const router = Router();
router.use(auth);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").patch(updateTask).delete(deleteTask);

export default router;
