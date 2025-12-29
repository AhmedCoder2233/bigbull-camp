import { useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabase";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "../Column";
import TaskCard from "../TaskCard";
import TaskDetailPanel from "../TaskDetailModal";
import { FiCheckCircle, FiAlertCircle, FiGrid, FiFilter, FiPlus, FiSearch, FiUsers, FiRefreshCw, FiBell } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

const STAGES = [
  { 
    id: "planning", 
    title: "Planning", 
    icon: "📋",
    color: "red",
    gradient: "from-red-50 via-red-100 to-red-50",
    border: "border-red-200",
    accent: "bg-gradient-to-r from-red-500 to-red-600"
  },
  { 
    id: "in_progress", 
    title: "In Progress", 
    icon: "⚡",
    color: "red",
    gradient: "from-red-50 via-red-100 to-red-50",
    border: "border-red-200",
    accent: "bg-gradient-to-r from-red-500 to-red-600"
  },
  { 
    id: "at_risk", 
    title: "At Risk", 
    icon: "⚠️",
    color: "red",
    gradient: "from-red-50 via-red-100 to-red-50",
    border: "border-red-200",
    accent: "bg-gradient-to-r from-red-500 to-red-600"
  },
  { 
    id: "update_required", 
    title: "Update Required", 
    icon: "🔄",
    color: "red",
    gradient: "from-red-50 via-red-100 to-red-50",
    border: "border-red-200",
    accent: "bg-gradient-to-r from-red-500 to-red-600"
  },
  { 
    id: "on_hold", 
    title: "On Hold", 
    icon: "⏸️",
    color: "red",
    gradient: "from-red-50 via-red-100 to-red-50",
    border: "border-red-200",
    accent: "bg-gradient-to-r from-red-500 to-red-600"
  },
  { 
    id: "completed", 
    title: "Completed", 
    icon: "✅",
    color: "red",
    gradient: "from-red-50 via-red-100 to-red-50",
    border: "border-red-200",
    accent: "bg-gradient-to-r from-red-500 to-red-600"
  },
];

export default function TaskBoard({ workspaceId, userRole }) {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;
  
  const [tasks, setTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, atRisk: 0, overdue: 0 });
  
  // ✅ NAYA STATES FOR NOTIFICATIONS
  const [realtimeNotification, setRealtimeNotification] = useState(null);
  const [showRealtimeToast, setShowRealtimeToast] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, { 
      coordinateGetter: sortableKeyboardCoordinates 
    })
  );

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ✅ NAYA FUNCTION: Task movement record karne ke liye
  const recordTaskMovement = async (taskId, fromStatus, toStatus) => {
    try {
      const { data, error } = await supabase
        .from('task_movements')
        .insert({
          task_id: taskId,
          moved_by_user_id: currentUserId,
          from_status: fromStatus,
          to_status: toStatus,
          workspace_id: workspaceId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording task movement:', error);
      return null;
    }
  };

  // ✅ NAYA FUNCTION: Realtime notification show karna
  const showRealtimeNotification = async (movementData) => {
    // Agar humne khud move kiya hai, toh notification na dikhao
    if (movementData.moved_by_user_id === currentUserId) return;

    try {
      // Task details get karo
      const { data: taskData } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', movementData.task_id)
        .single();

      // User details get karo jisne move kiya
      const { data: userData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', movementData.moved_by_user_id)
        .single();

      if (taskData && userData) {
        const fromStage = STAGES.find(s => s.id === movementData.from_status)?.title || movementData.from_status;
        const toStage = STAGES.find(s => s.id === movementData.to_status)?.title || movementData.to_status;
        
        const notification = {
          id: movementData.id,
          title: 'Task Moved! 📋',
          message: `${userData.name} moved "${taskData.title}" from ${fromStage} to ${toStage}`,
          time: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          type: 'info'
        };

        // Recent activities mein add karo
        setRecentActivities(prev => [notification, ...prev.slice(0, 4)]);
        
        // Realtime toast show karo
        setRealtimeNotification(notification);
        setShowRealtimeToast(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowRealtimeToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;

      const userIds = [...new Set(tasksData
        .filter(t => t.assigned_to)
        .map(t => t.assigned_to)
      )];

      let userProfiles = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);

        if (profilesData) {
          profilesData.forEach(profile => {
            userProfiles[profile.id] = profile.name || "Team Member";
          });
        }
      }

      const tasksWithDetails = await Promise.all(
        (tasksData || []).map(async (task) => {
          const { count } = await supabase
            .from("task_attachments")
            .select("*", { count: 'exact', head: true })
            .eq("task_id", task.id);
          
          // Check if task is overdue
          const isOverdue = task.due_date && new Date(task.due_date) < new Date();
          
          return {
            ...task,
            attachments_count: count || 0,
            assigned_user_name: task.assigned_to ? userProfiles[task.assigned_to] || "Team Member" : null,
            draggable: true,
            isOverdue
          };
        })
      );

      setTasks(tasksWithDetails);
      
      // Calculate real stats
      const completed = tasksWithDetails.filter(t => t.status === 'completed').length;
      const inProgress = tasksWithDetails.filter(t => t.status === 'in_progress').length;
      const atRisk = tasksWithDetails.filter(t => t.status === 'at_risk').length;
      const overdue = tasksWithDetails.filter(t => t.isOverdue).length;
      
      setStats({
        total: tasksWithDetails.length,
        completed,
        inProgress,
        atRisk,
        overdue
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      showNotification("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceId) return;

    fetchTasks();

    // ✅ NAYA: Task movements ke liye real-time subscription
    const movementsChannel = supabase
      .channel(`task-movements-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_movements',
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => {
          showRealtimeNotification(payload.new);
        }
      )
      .subscribe();

    // ✅ EXISTING: Tasks ke liye subscription
    const tasksChannel = supabase
      .channel(`tasks-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `workspace_id=eq.${workspaceId}`
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(movementsChannel);
    };
  }, [workspaceId]);

  const handleDragStart = (event) => {
    const task = tasks.find(t => t.id === event.active.id);

    if (!task) return;

    // Only allow drag if user is admin or the creator of the task
    if (userRole !== "admin" && task.assigned_to !== currentUserId) {
      showNotification("You don't have permission to move this task", "error");
      return;
    }

    setActiveId(event.active.id);
    setActiveTask(task);
  };

  // ✅ UPDATE: handleDragEnd mein notification record karo
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const validColumns = STAGES.map(stage => stage.id);
    if (!validColumns.includes(over.id)) return;

    const taskId = active.id;
    const newStatus = over.id;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    const originalStatus = taskToUpdate.status;

    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    try {
      // ✅ PEHLE TASK MOVEMENT RECORD KARO
      await recordTaskMovement(taskId, originalStatus, newStatus);

      // Phir task update karo
      const { error } = await supabase
        .from("tasks")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", taskId);

      if (error) throw error;

      const oldStage = STAGES.find(s => s.id === originalStatus)?.title || originalStatus;
      const newStage = STAGES.find(s => s.id === newStatus)?.title || newStatus;
      showNotification(`Task moved from ${oldStage} to ${newStage}`);
      
    } catch (error) {
      console.error("Error updating task status:", error);
      
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status: originalStatus } : task
      ));
      
      showNotification("Failed to move task", "error");
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTasksForStage = (stageId) => {
    return filteredTasks.filter((task) => task.status === stageId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50">
      {/* ✅ NAYA: Realtime Notification Toast (5 seconds ke liye show hoga) */}
      {showRealtimeToast && realtimeNotification && (
        <div className="fixed top-6 right-6 z-[60] animate-slideIn">
          <div className="relative p-4 rounded-xl shadow-xl bg-gradient-to-r from-red-50/95 to-red-100/95 border border-red-200/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white">📋</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900">{realtimeNotification.title}</p>
                <p className="text-sm text-red-700 mt-1">{realtimeNotification.message}</p>
                <p className="text-xs text-red-500 mt-2">{realtimeNotification.time}</p>
              </div>
              <button 
                onClick={() => setShowRealtimeToast(false)}
                className="ml-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400/50 via-red-500/50 to-red-400/50 animate-progress"></div>
          </div>
        </div>
      )}

      {/* Existing Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 animate-slideIn ${showRealtimeToast ? 'top-24' : ''}`}>
          <div className={`relative p-4 rounded-xl shadow-xl backdrop-blur-sm border ${
            notification.type === "error" 
              ? 'bg-gradient-to-r from-red-50/90 to-red-100/90 border-red-200/50 text-red-800' 
              : 'bg-gradient-to-r from-red-50/90 to-red-100/90 border-red-200/50 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                notification.type === "error" 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}>
                {notification.type === "error" ? 
                  <FiAlertCircle className="w-5 h-5 text-white" /> : 
                  <FiCheckCircle className="w-5 h-5 text-white" />
                }
              </div>
              <div className="flex-1">
                <p className="font-semibold">{notification.message}</p>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 animate-progress"></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isPanelOpen ? 'pr-[520px]' : ''}`}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
                      <FiGrid className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center border border-white">
                      <span className="text-[10px] font-bold text-white">{stats.total}</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
                    <p className="text-red-600 text-sm">
                      {stats.total} task{stats.total !== 1 ? 's' : ''} • {stats.completed} completed
                      {recentActivities.length > 0 && ` • ${recentActivities.length} updates`}
                    </p>
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{stats.total}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-red-700">Total Tasks</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{stats.completed}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-red-700">Completed</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{stats.inProgress}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-red-700">In Progress</p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ NAYA: Recent Updates Card */}
                  {recentActivities.length > 0 && (
                    <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                          <FiBell className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-700">Recent Updates</p>
                          <p className="text-[10px] text-red-600">{recentActivities.length} new</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.overdue > 0 && (
                    <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{stats.overdue}</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-700">Overdue</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <div className="flex items-center bg-white border border-red-200 rounded-lg px-3 py-2">
                    <FiSearch className="w-4 h-4 text-red-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="outline-none flex-1 text-sm placeholder-red-400 w-40"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-1 text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                
                {/* ✅ NAYA: Clear Activities Button */}
                {recentActivities.length > 0 && (
                  <button
                    onClick={() => setRecentActivities([])}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200 hover:border-red-300 transition-all duration-200"
                  >
                    <span className="text-sm text-red-600">Clear Updates</span>
                  </button>
                )}
                
                {/* Refresh Button */}
                <button
                  onClick={fetchTasks}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200 hover:border-red-300 transition-all duration-200 disabled:opacity-50"
                >
                  <FiRefreshCw className={`w-4 h-4 text-red-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* ✅ NAYA: Recent Activity Section (Optional - show only if activities exist) */}
          {recentActivities.length > 0 && (
            <div className="mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-50/80 to-red-100/80 border border-red-200/50">
                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <FiBell className="w-4 h-4" />
                  Recent Activity
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="p-3 bg-white/80 rounded-lg border border-red-100 hover:border-red-200 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-white">📋</span>
                        </div>
                        <div>
                          <p className="text-sm text-red-900 font-medium">{activity.message}</p>
                          <p className="text-xs text-red-600 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Task Board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {STAGES.map((stage) => (
                <Column
                  key={stage.id}
                  id={stage.id}
                  title={stage.title}
                  icon={stage.icon}
                  gradient={stage.gradient}
                  border={stage.border}
                  accent={stage.accent}
                  tasks={getTasksForStage(stage.id)}
                  onTaskClick={handleTaskClick}
                  currentUserId={currentUserId}
                  userRole={userRole}
                  searchQuery={searchQuery}
                />
              ))}
            </div>

            {/* Drag Overlay */}
            <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
              {activeTask && (
                <div className="relative w-64">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-500/20 rounded-xl blur-lg"></div>
                  <div className="relative transform rotate-1 shadow-2xl border border-red-400/30">
                    <TaskCard 
                      task={activeTask} 
                      isDragging 
                      currentUserId={currentUserId}
                      userRole={userRole}
                    />
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {/* Empty State */}
          {tasks.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-red-600 mb-6 max-w-md mx-auto">
                Create your first task to get started
              </p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && tasks.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/50 rounded-lg border border-red-200 p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-red-200 rounded w-24"></div>
                    <div className="h-6 w-6 bg-red-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2].map((j) => (
                      <div key={j} className="h-16 bg-red-100 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={closePanel}
        currentUserId={currentUserId}
        userRole={userRole}
        workspaceId={workspaceId}
      />
    </div>
  );
}
