import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useSignOut, useUserData } from '@nhost/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, LogOut, Loader2, ListTodo } from 'lucide-react';

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
  const user = useUserData();
  const { signOut } = useSignOut();

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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <ListTodo className="w-8 h-8 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Tasks</h1>
            <p className="text-slate-400 text-sm">Welcome back, {user?.displayName || user?.email.split('@')[0]}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors glass-card rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
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
