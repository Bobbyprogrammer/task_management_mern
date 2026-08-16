import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  ListTodo,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
const emptyTask = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };
const statusLabels = { todo: 'To Do', 'in-progress': 'In progress', completed: 'Completed' };

function Auth({ mode, onAuth }) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post(`/auth/${mode}`, form);
      localStorage.setItem('taskflow_token', data.token);
      onAuth(data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Your workspace is ready!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-brand">
        <a className="brand brand-light">
          <span className="brand-mark">
            <Check />
          </span>
          TaskFlow
        </a>
        <div className="auth-pitch">
          <span className="eyebrow">
            <Sparkles size={15} /> Your day, simplified
          </span>
          <h1>
            Turn your plans into <em>progress.</em>
          </h1>
          <p>A calm, focused space to organize work, meet deadlines, and celebrate every win.</p>
          <div className="quote">
            <div className="quote-stars">★★★★★</div>
            <p>
              “TaskFlow has completely changed how I organize my week. Simple, beautiful, and
              actually enjoyable to use.”
            </p>
            <span>— Maya, Product Designer</span>
          </div>
        </div>
        <div className="orb orb-one" />
        <div className="orb orb-two" />
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <div className="mobile-brand">
            <span className="brand-mark">
              <Check />
            </span>
            TaskFlow
          </div>
          <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p>
            {isLogin
              ? 'Sign in to continue to your workspace.'
              : 'Start organizing your best work today.'}
          </p>
          {!isLogin && (
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Alex Morgan"
                required
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength="6"
              value={form.password}
              onChange={update}
              placeholder="At least 6 characters"
              required
            />
          </label>
          <button className="primary wide" disabled={loading}>
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
            <ArrowRight size={18} />
          </button>
          <div className="auth-switch">
            {isLogin ? 'New to TaskFlow?' : 'Already have an account?'}{' '}
            <button type="button" onClick={() => navigate(isLogin ? '/register' : '/login')}>
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(
    task ? { ...task, dueDate: task.dueDate?.slice(0, 10) || '' } : emptyTask,
  );
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <h2>{task ? 'Edit task' : 'Create a new task'}</h2>
            <p>
              {task
                ? 'Update the details of your task.'
                : 'Add the details and get it on your list.'}
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </div>
        <label>
          Task title
          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What needs to be done?"
            required
          />
        </label>
        <label>
          Description <span className="optional">Optional</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Add a few helpful details…"
            rows="4"
          />
        </label>
        <div className="form-row">
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <label>
          Due date
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" disabled={saving}>
            {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Dashboard({ user, logout }) {
  const [tasks, setTasks] = useState([]),
    [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'),
    [search, setSearch] = useState('');
  const [modal, setModal] = useState(null),
    [editing, setEditing] = useState(null),
    [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    API.get('/tasks')
      .then(({ data }) => setTasks(data.tasks))
      .catch((e) => {
        toast.error(e.response?.data?.message || 'Could not load tasks.');
        if (e.response?.status === 401) logout();
      })
      .finally(() => setLoading(false));
  }, [logout]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    }),
    [tasks],
  );
  const visible = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (filter === 'all' || t.status === filter) &&
          `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [tasks, filter, search],
  );
  const today = new Date();

  async function saveTask(form) {
    try {
      if (editing) {
        const { data } = await API.patch(`/tasks/${editing._id}`, form);
        setTasks(tasks.map((t) => (t._id === editing._id ? data.task : t)));
        toast.success('Task updated');
      } else {
        const { data } = await API.post('/tasks', form);
        setTasks([data.task, ...tasks]);
        toast.success('Task created');
      }
      setModal(null);
      setEditing(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not save task.');
    }
  }
  async function removeTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Could not delete task.');
    }
  }
  async function toggleTask(task) {
    const status = task.status === 'completed' ? 'todo' : 'completed';
    try {
      const { data } = await API.patch(`/tasks/${task._id}`, { status });
      setTasks(tasks.map((t) => (t._id === task._id ? data.task : t)));
    } catch {
      toast.error('Could not update task.');
    }
  }
  const openEdit = (task) => {
    setEditing(task);
    setModal('edit');
  };

  return (
    <div className="app-shell">
      <aside className={mobileNav ? 'sidebar open' : 'sidebar'}>
        <div className="sidebar-top">
          <a className="brand">
            <span className="brand-mark">
              <Check />
            </span>
            TaskFlow
          </a>
          <button className="mobile-close" onClick={() => setMobileNav(false)}>
            <X />
          </button>
        </div>
        <button
          className="primary add-task"
          onClick={() => {
            setEditing(null);
            setModal('new');
          }}
        >
          <Plus size={19} /> New task
        </button>
        <nav>
          <p>Workspace</p>
          {[
            ['all', ListTodo, 'All tasks'],
            ['todo', Circle, 'To do'],
            ['in-progress', Clock3, 'In progress'],
            ['completed', CheckCircle2, 'Completed'],
          ].map(([key, Icon, label]) => (
            <button
              key={key}
              className={filter === key ? 'active' : ''}
              onClick={() => {
                setFilter(key);
                setMobileNav(false);
              }}
            >
              <Icon size={19} />
              {label}
              <span>{counts[key]}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{user.name?.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
          <button title="Sign out" onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main>
        <header>
          <button className="menu-btn" onClick={() => setMobileNav(true)}>
            <Menu />
          </button>
          <div className="search">
            <Search size={19} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your tasks…"
            />
          </div>
          <button
            className="primary header-add"
            onClick={() => {
              setEditing(null);
              setModal('new');
            }}
          >
            <Plus size={18} /> Add task
          </button>
        </header>
        <div className="content">
          <section className="welcome">
            <div>
              <p className="date-kicker">
                {today.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <h1>
                Good{' '}
                {today.getHours() < 12
                  ? 'morning'
                  : today.getHours() < 18
                    ? 'afternoon'
                    : 'evening'}
                , {user.name?.split(' ')[0]} <span>👋</span>
              </h1>
              <p>Here’s what’s happening with your tasks today.</p>
            </div>
            <button
              className="primary desktop-create"
              onClick={() => {
                setEditing(null);
                setModal('new');
              }}
            >
              <Plus size={18} /> Create task
            </button>
          </section>
          <section className="stats">
            <div>
              <span className="stat-icon purple">
                <ListTodo />
              </span>
              <p>
                Total tasks<strong>{counts.all}</strong>
              </p>
            </div>
            <div>
              <span className="stat-icon amber">
                <Clock3 />
              </span>
              <p>
                In progress<strong>{counts['in-progress']}</strong>
              </p>
            </div>
            <div>
              <span className="stat-icon green">
                <CheckCircle2 />
              </span>
              <p>
                Completed<strong>{counts.completed}</strong>
              </p>
            </div>
          </section>
          <section className="task-section">
            <div className="task-heading">
              <div>
                <h2>{filter === 'all' ? 'All tasks' : statusLabels[filter]}</h2>
                <p>
                  {visible.length} {visible.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>
              <div className="filter-select">
                <span>Show:</span>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All tasks</option>
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
            {loading ? (
              <div className="empty">
                <div className="spinner" />
                <h3>Loading your tasks…</h3>
              </div>
            ) : visible.length === 0 ? (
              <div className="empty">
                <span>
                  <CheckCircle2 />
                </span>
                <h3>{search ? 'No matching tasks' : 'Your list is clear'}</h3>
                <p>
                  {search
                    ? 'Try a different search term.'
                    : 'Create a task and start making progress.'}
                </p>
                {!search && (
                  <button className="primary" onClick={() => setModal('new')}>
                    <Plus size={18} /> Create first task
                  </button>
                )}
              </div>
            ) : (
              <div className="task-list">
                {visible.map((task) => (
                  <article
                    className={task.status === 'completed' ? 'task-card done' : 'task-card'}
                    key={task._id}
                  >
                    <button className="check-btn" onClick={() => toggleTask(task)}>
                      {task.status === 'completed' ? <Check size={17} /> : null}
                    </button>
                    <div className="task-body">
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                      <div className="meta">
                        <span className={`priority ${task.priority}`}>
                          <i /> {task.priority}
                        </span>
                        <span className={`status status-${task.status}`}>
                          {statusLabels[task.status]}
                        </span>
                        {task.dueDate && (
                          <span className="due">
                            <CalendarDays size={14} />
                            {new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="task-actions">
                      <button onClick={() => openEdit(task)} title="Edit">
                        <Pencil size={17} />
                      </button>
                      <button
                        className="delete"
                        onClick={() => removeTask(task._id)}
                        title="Delete"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      {modal && (
        <TaskModal
          task={editing}
          onClose={() => {
            setModal(null);
            setEditing(null);
          }}
          onSave={saveTask}
        />
      )}{' '}
      {mobileNav && <div className="nav-backdrop" onClick={() => setMobileNav(false)} />}
    </div>
  );
}

function AppRoutes() {
  const hasToken = Boolean(localStorage.getItem('taskflow_token'));
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(hasToken);
  useEffect(() => {
    if (!hasToken) return;
    API.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('taskflow_token'))
      .finally(() => setChecking(false));
  }, [hasToken]);
  const logout = useCallback(() => {
    localStorage.removeItem('taskflow_token');
    setUser(null);
    toast.success('Signed out');
  }, []);
  if (checking)
    return (
      <div className="splash">
        <span className="brand-mark">
          <Check />
        </span>
        <strong>TaskFlow</strong>
        <div className="spinner" />
      </div>
    );
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Auth mode="login" onAuth={setUser} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <Auth mode="register" onAuth={setUser} />}
      />
      <Route
        path="/"
        element={user ? <Dashboard user={user} logout={logout} /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <AppRoutes />
    </BrowserRouter>
  );
}
