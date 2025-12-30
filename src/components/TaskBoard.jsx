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
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, atRisk: 0, overdue: 0 });
  const [notification, setNotification] = useState(null);
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

  const showRealtimeNotification = async (movementData) => {
    // ✅ FIX: Agar humne khud move kiya hai, toh notification na dikhao
    if (movementData.moved_by_user_id === currentUserId) return;

    try {
      const { data: taskData } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', movementData.task_id)
        .single();

      const { data: userData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', movementData.moved_by_user_id)
        .single();

      if (taskData && userData) {
        const fromStage = STAGES.find(s => s.id === movementData.from_status)?.title || movementData.from_status;
        const toStage = STAGES.find(s => s.id === movementData.to_status)?.title || movementData.to_status;
        
        const activity = {
          id: movementData.id,
          title: 'Task Moved! 📋',
          message: `${userData.name} moved "${taskData.title}" from ${fromStage} to ${toStage}`,
          time: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          type: 'info'
        };

        setRecentActivities(prev => [activity, ...prev.slice(0, 4)]);
        
        // Show notification only if task was moved by someone else
        showNotification(`${userData.name} moved "${taskData.title}"`, "info");
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  // ✅ NEW: Fetch task movements for each task
  const fetchTaskMovements = async (taskId) => {
    try {
      const { data, error } = await supabase
        .from('task_movements')
        .select(`
          *,
          moved_by:profiles!task_movements_moved_by_user_id_fkey(name)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching movements:', error);
      return [];
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
          
          const isOverdue = task.due_date && new Date(task.due_date) < new Date();
          
          // ✅ NEW: Fetch recent movements for this task
          const movements = await fetchTaskMovements(task.id);
          
          return {
            ...task,
            attachments_count: count || 0,
            assigned_user_name: task.assigned_to ? userProfiles[task.assigned_to] || "Team Member" : null,
            draggable: true,
            isOverdue,
            recent_movements: movements
          };
        })
      );

      setTasks(tasksWithDetails);
      
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
          fetchTasks();
        }
      )
      .subscribe();

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
        (payload) => {
          // ✅ FIX: Agar event UPDATE hai aur status change nahi hua, tab hi refresh karo
          if (payload.eventType !== 'UPDATE' || 
              (payload.old?.status === payload.new?.status)) {
            fetchTasks();
          }
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

    if (userRole !== "admin" && task.created_by !== currentUserId && task.assigned_to !== currentUserId) {
      showNotification("You don't have permission to move this task", "error");
      return;
    }

    setActiveId(event.active.id);
    setActiveTask(task);
  };

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
    const fromStage = STAGES.find(s => s.id === originalStatus)?.title || originalStatus;
    const toStage = STAGES.find(s => s.id === newStatus)?.title || newStatus;

    // ✅ Optimistic update
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    try {
      // ✅ PEHLE task movement record karo (yeh notification trigger karega)
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

      // ✅ SUCCESS MESSAGE: Jab user khud task move kare to success message dikhao
      showNotification(`Task moved from ${fromStage} to ${toStage}`, "success");
      
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
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800'
              : notification.type === 'error'
              ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800'
              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <FiCheckCircle className="w-4 h-4" />}
              {notification.type === 'error' && <FiAlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      <div className={`transition-all duration-300 ${isPanelOpen ? 'pr-[520px]' : ''}`}>
        <div className="p-6">
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
                
                {recentActivities.length > 0 && (
                  <button
                    onClick={() => setRecentActivities([])}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200 hover:border-red-300 transition-all duration-200"
                  >
                    <span className="text-sm text-red-600">Clear Updates</span>
                  </button>
                )}
                
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
