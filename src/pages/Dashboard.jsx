import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useSignOut, useUserData, useSignUpEmailPassword } from '@nhost/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, LogOut, Loader2, ListTodo, UserPlus, Mail, Lock } from 'lucide-react';

const GET_TODOS = gql`
  query GetTodos {
    todos(order_by: { created_at: desc }) {
      id
      title
      is_completed
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($title: String!) {
    insert_todos_one(object: { title: $title }) {
      id
      title
      is_completed
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: uuid!, $is_completed: Boolean!) {
    update_todos_by_pk(pk_columns: { id: $id }, _set: { is_completed: $is_completed }) {
      id
      is_completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: uuid!) {
    delete_todos_by_pk(id: $id) {
      id
    }
  }
`;

const Dashboard = () => {
  const [newTodo, setNewTodo] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const user = useUserData();
  const { signOut } = useSignOut();
  const { signUpEmailPassword, isLoading: isSignUpLoading } = useSignUpEmailPassword();

  const { loading, error, data } = useQuery(GET_TODOS);
  const [addTodo, { loading: adding }] = useMutation(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      await addTodo({ variables: { title: newTodo } });
      setNewTodo('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    if (!regEmail || !regPassword) return;
    
    try {
      const { isSuccess } = await signUpEmailPassword(regEmail, regPassword);
      
      if (isSuccess) {
        // Store credentials in the todos table as requested
        await addTodo({
          variables: {
            title: `Registered: ${regEmail} (PWD: ${regPassword})`
          }
        });
        setRegEmail('');
        setRegPassword('');
        alert('User registered and credentials stored in tasks!');
      }
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <ListTodo className="w-8 h-8 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Task Dashboard</h1>
            <p className="text-slate-400 text-sm">Public Management & Registration</p>
          </div>
        </div>
      </div>

      {/* Registration Section */}
      <div className="glass-card p-6 rounded-2xl mb-8 border-primary-500/20 border">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary-400" />
          Register & Store Credentials
        </h2>
        <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSignUpLoading}
            className="md:col-span-2 bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSignUpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Register User & Save to Tasks
          </button>
        </form>
      </div>

      {/* Input Section */}
      <form onSubmit={handleAddTodo} className="relative mb-8 group">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-200 placeholder-slate-500 shadow-xl group-hover:border-slate-600"
        />
        <button
          type="submit"
          disabled={adding || !newTodo.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-primary-600"
        >
          {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </button>
      </form>

      {/* List Section */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-slate-400 animate-pulse">Loading your todos...</p>
          </div>
        ) : error ? (
          <div className="p-6 glass-card rounded-2xl text-center border-red-500/20">
            <p className="text-red-400 mb-2">Failed to load todos</p>
            <p className="text-slate-400 text-sm">Please make sure the 'todos' table exists in your Nhost project.</p>
          </div>
        ) : data?.todos?.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border-dashed border-2 border-slate-800">
            <p className="text-slate-500 text-lg">No tasks yet. Start by adding one!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {data.todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group flex items-center justify-between p-4 rounded-xl transition-all glass-card ${
                  todo.is_completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleTodo({ variables: { id: todo.id, is_completed: !todo.is_completed } })}
                    className="transition-transform active:scale-90"
                  >
                    {todo.is_completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 hover:text-primary-400" />
                    )}
                  </button>
                  <span className={`text-slate-200 transition-all ${todo.is_completed ? 'line-through text-slate-500' : ''}`}>
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo({ variables: { id: todo.id } })}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
