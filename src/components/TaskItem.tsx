import React, { useState, useRef } from 'react';
import { Trash2, Edit2, Check, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Task } from '../types';
import { supabase } from '../supabaseClient';
import { motion } from 'motion/react';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
  disabled?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(task.image_url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleComplete = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !task.is_completed })
        .eq('id', task.id);
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (disabled) return;
    
    console.log('Intentando borrar tarea con ID:', task.id);
    setLoading(true);
    setError(null);
    
    try {
      const { error, data, status } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
        .select();
      
      console.log('Respuesta de Supabase - Status:', status);
      console.log('Respuesta de Supabase - Data:', data);

      if (error) {
        console.error('Error de Supabase:', error);
        setError(`Error técnico: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        setError('No se pudo borrar. Verifica tus permisos (RLS) en Supabase.');
      } else {
        console.log('Tarea borrada exitosamente');
        onUpdate();
      }
    } catch (err: any) {
      console.error('Error catastrófico:', err);
      setError('Error inesperado: ' + err.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen es demasiado grande (máximo 2MB)');
        return;
      }
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSaveEdit = async () => {
    if (disabled) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró una sesión de usuario activa');

      let finalImageUrl = task.image_url;

      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('task-images')
          .upload(fileName, editImageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('task-images')
          .getPublicUrl(fileName);
        
        finalImageUrl = publicUrl;
      } else if (editImagePreview === null) {
        finalImageUrl = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update({ 
          title: editTitle, 
          description: editDescription || null,
          image_url: finalImageUrl
        })
        .eq('id', task.id);

      if (error) throw error;
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      console.error(err);
      setError('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group bg-white dark:bg-zinc-900 p-4 rounded-2xl border ${
        task.is_completed 
          ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10' 
          : 'border-zinc-200 dark:border-zinc-800'
      } transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggleComplete}
          disabled={disabled || loading}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            task.is_completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500'
          }`}
        >
          {task.is_completed && <Check className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none min-h-[60px]"
              />
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Cambiar Imagen</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {editImagePreview && (
                  <div className="relative w-10 h-10 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setEditImageFile(null);
                        setEditImagePreview(null);
                      }}
                      className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl hover:bg-red-600 transition-colors"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditImagePreview(task.image_url);
                    setEditImageFile(null);
                  }}
                  disabled={loading}
                  className="px-3 py-1 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className={`font-semibold text-zinc-900 dark:text-white truncate ${task.is_completed ? 'line-through text-zinc-400 dark:text-zinc-600' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 ${task.is_completed ? 'text-zinc-300 dark:text-zinc-700' : ''}`}>
                  {task.description}
                </p>
              )}
              {task.image_url && (
                <div className="mt-3 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 max-w-sm">
                  <img 
                    src={task.image_url} 
                    alt={task.title} 
                    className={`w-full h-auto object-cover max-h-64 ${task.is_completed ? 'opacity-50 grayscale' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 p-1 rounded-lg border border-red-100 dark:border-red-900/30">
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 px-1">¿Borrar?</span>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={disabled || loading}
                  className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={disabled || loading}
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {error && (
        <div className="mt-3 p-2 text-xs bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
};
