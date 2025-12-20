import { supabase } from "./lib/supabase";
import { 
  FiUser, 
  FiCalendar, 
  FiMessageSquare, 
  FiPaperclip, 
  FiLock, 
  FiChevronRight,
  FiFlag,
  FiMoreVertical,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiTrash2,
  FiAlertTriangle,
  FiX
} from "react-icons/fi";
import { HiOutlineExclamationCircle, HiOutlineFire } from "react-icons/hi";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useRef } from "react";

const TASK_STATUSES = [
  { id: "planning", label: "Planning", color: "blue", priority: 1 },
  { id: "in_progress", label: "In Progress", color: "amber", priority: 2 },
  { id: "at_risk", label: "At Risk", color: "rose", priority: 3 },
  { id: "update_required", label: "Update Required", color: "orange", priority: 4 },
  { id: "on_hold", label: "On Hold", color: "gray", priority: 5 },
  { id: "completed", label: "Completed", color: "emerald", priority: 6 },
];

export default function TaskCard({ 
  task, 
  isDragging = false, 
  currentUserId, 
  userRole, 
  onTaskClick, 
  onStatusChange,
  onDeleteTask,
  canDrag = true
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled: !task.draggable,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const menuRef = useRef(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSortableDragging ? 'none' : transition,
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 1: return 'text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200';
      case 2: return 'text-amber-600 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200';
      case 3: return 'text-rose-600 bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200';
      case 4: return 'text-orange-600 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200';
      default: return 'text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200';
    }
  };

  const statusColors = {
    planning: {
      bg: "bg-gradient-to-r from-blue-50 to-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      accent: "from-blue-500 to-blue-600",
      icon: "📋"
    },
    in_progress: {
      bg: "bg-gradient-to-r from-amber-50 to-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      accent: "from-amber-500 to-amber-600",
      icon: "⚡"
    },
    at_risk: {
      bg: "bg-gradient-to-r from-rose-50 to-rose-100",
      text: "text-rose-700",
      border: "border-rose-200",
      accent: "from-rose-500 to-rose-600",
      icon: "⚠️"
    },
    update_required: {
      bg: "bg-gradient-to-r from-orange-50 to-orange-100",
      text: "text-orange-700",
      border: "border-orange-200",
      accent: "from-orange-500 to-orange-600",
      icon: "🔄"
    },
    on_hold: {
      bg: "bg-gradient-to-r from-gray-50 to-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
      accent: "from-gray-500 to-gray-600",
      icon: "⏸️"
    },
    completed: {
      bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      accent: "from-emerald-500 to-emerald-600",
      icon: "✅"
    },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTimeRemaining = () => {
    if (!task.due_date) return null;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { days: Math.abs(diffDays), type: 'overdue' };
    if (diffDays === 0) return { days: 0, type: 'today' };
    if (diffDays <= 3) return { days: diffDays, type: 'soon' };
    return { days: diffDays, type: 'normal' };
  };

  const timeRemaining = getTimeRemaining();
  const statusConfig = statusColors[task.status] || statusColors.planning;

  const handleCardClick = (e) => {
    if (e.defaultPrevented || isDragging || showMenu) return;
    onTaskClick(task);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(!showMenu);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    
    if (userRole !== 'admin') {
      setDeleteError('Only administrators can delete tasks');
      setShowMenu(false);
      return;
    }
    
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      // Delete task from database
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      // Call the onDeleteTask prop function if provided
      if (onDeleteTask) {
        await onDeleteTask(task.id);
      }

      // Show success message
      setShowDeleteConfirm(false);
      window.location.reload()
      
    } catch (error) {
      console.error('Error deleting task:', error);
      setDeleteError(error.message || 'Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  return (
    <>
            <div 
        // REMOVE these props from here
        // ref={setNodeRef}
        // style={style}
        // {...attributes}
        // {...listeners}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { 
          if (!showMenu) {
            setIsHovered(false); 
          }
        }}
        className={`
          group relative bg-white rounded-2xl border transition-all duration-300 w-full
          ${isDragging 
            ? 'shadow-2xl opacity-95 scale-[1.02] z-50 rotate-1 shadow-blue-500/20' 
            : 'shadow-sm hover:shadow-xl'
          }
          ${isHovered && !isDragging ? 'border-gray-300 -translate-y-1' : 'border-gray-200'}
          ${!canDrag ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'} // Change cursor
          min-h-[180px] flex flex-col overflow-hidden
          hover:ring-1 hover:ring-blue-200
        `}
        onClick={handleCardClick}
      >
        {/* Top accent line */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${statusConfig.accent}`}></div>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{statusConfig.icon}</span>
                {task.priority && (
                  <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                    <HiOutlineFire className="w-3 h-3" />
                    <span>P{task.priority}</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">
                {task.title}
              </h3>
            </div>
            
            {/* Action menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuClick}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  showMenu ? 'bg-gray-100' : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100'
                }`}
              >
                <FiMoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Description - Only show if exists */}
          {task.description && (
            <p className="text-xs text-gray-600 mb-4 line-clamp-2 flex-1">
              {task.description}
            </p>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {/* Assignee */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <FiUser className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900 truncate">
                  {task.assigned_to === currentUserId ? "You" : (task.assigned_user_name?.split(' ')[0] || 'Unassigned')}
                </p>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                timeRemaining?.type === 'overdue' 
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600' 
                  : timeRemaining?.type === 'today' || timeRemaining?.type === 'soon'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
              }`}>
                <FiCalendar className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className={`text-xs font-medium truncate ${
                  timeRemaining?.type === 'overdue' 
                    ? 'text-rose-600' 
                    : timeRemaining?.type === 'today' || timeRemaining?.type === 'soon'
                    ? 'text-amber-600'
                    : 'text-gray-900'
                }`}>
                  {timeRemaining?.type === 'overdue' 
                    ? `Overdue`
                    : timeRemaining?.type === 'today'
                    ? 'Today'
                    : timeRemaining?.type === 'soon'
                    ? `${timeRemaining.days}d`
                    : formatDate(task.due_date)
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Attachments */}
            <div className="flex items-center gap-3">
              {task.attachments_count > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                    <FiPaperclip className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="font-semibold text-blue-700">{task.attachments_count}</span>
                </div>
              )}
              
              {task.comments_count > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                    <FiMessageSquare className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="font-semibold text-purple-700">{task.comments_count}</span>
                </div>
              )}
            </div>

            {/* View indicator */}
            <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <FiChevronRight className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown menu */}
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute right-0 top-12 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                setShowMenu(false);
                onTaskClick(task);
              }}
              className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left"
            >
              <FiEye className="w-4 h-4" />
              View Details
            </button>
            
            {userRole === 'admin' && (
              <button 
                onClick={handleDeleteClick}
                className="w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 flex items-center justify-center">
                    <FiAlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Task</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={cancelDelete}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineExclamationCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-rose-900">You are about to delete:</p>
                    <p className="text-base font-bold text-gray-900 mt-1">"{task.title}"</p>
                    <p className="text-xs text-gray-600 mt-2">
                      • All task data will be permanently removed<br />
                      • This includes attachments, comments, and history<br />
                      • This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{deleteError}</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-500">
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      <span>Deleting task...</span>
                    </div>
                  ) : (
                    "Are you sure you want to continue?"
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    disabled={isDeleting}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="w-4 h-4" />
                        Delete Permanently
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}