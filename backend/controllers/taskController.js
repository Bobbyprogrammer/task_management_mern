import Task from "../models/Task.js";

export async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) { next(error); }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Task title is required." });
    const task = await Task.create({ user: req.user.id, title: title.trim(), description, status, priority, dueDate: dueDate || null });
    res.status(201).json({ task });
  } catch (error) { next(error); }
}

export async function updateTask(req, res, next) {
  try {
    const allowed = ["title", "description", "status", "priority", "dueDate"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (updates.title !== undefined && !updates.title.trim()) return res.status(400).json({ message: "Task title is required." });
    if (updates.dueDate === "") updates.dueDate = null;
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ task });
  } catch (error) { next(error); }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.status(204).end();
  } catch (error) { next(error); }
}
