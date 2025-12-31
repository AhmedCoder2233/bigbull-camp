import { useContext, useState, useEffect } from "react";
import { WorkspaceContext } from "./context/WorkspaceContext";
import CreateWorkspace from "./components/CreateWorkspace";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { 
  FiSearch,
  FiGrid,
  FiUsers,
  FiTrash2,
  FiMoreVertical,
  FiClipboard,
  FiCheckCircle,
  FiPlayCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiPauseCircle,
  FiTrendingUp,
  FiPieChart,
  FiActivity,
  FiTarget,
  FiAlertCircle,
  FiUserPlus,
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiStar,
  FiLayers,
  FiFolder,
  FiBriefcase
} from "react-icons/fi";
import { supabase } from "./lib/supabase";

export default function Workspaces() {
  const { workspaces, loading, removeWorkspace } = useContext(WorkspaceContext);
  const { profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [memberCounts, setMemberCounts] = useState({});
  const [taskCounts, setTaskCounts] = useState({});
  const [taskStatusBreakdown, setTaskStatusBreakdown] = useState({});
  const [membersLoading, setMembersLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenuId, setShowMenuId] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [userTaskStats, setUserTaskStats] = useState({
    planning: 0,
    in_progress: 0,
    at_risk: 0,
    update_required: 0,
    on_hold: 0,
    completed: 0,
    totalAssigned: 0
  });
  
  // Lead Analytics State
  const [leadStats, setLeadStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0
  });
  const [leadLoading, setLeadLoading] = useState(true);

  // Status colors configuration - Red theme
  const statusColors = {
    planning: {
      bg: "bg-gradient-to-r from-red-50 to-red-100",
      text: "text-red-700",
      border: "border-red-200",
      accent: "from-red-300 to-red-400",
      icon: FiClipboard,
      label: "Planning"
    },
    in_progress: {
      bg: "bg-gradient-to-r from-red-100 to-red-200",
      text: "text-red-800",
      border: "border-red-300",
      accent: "from-red-400 to-red-500",
      icon: FiPlayCircle,
      label: "In Progress"
    },
    at_risk: {
      bg: "bg-gradient-to-r from-red-200 to-red-300",
      text: "text-red-900",
      border: "border-red-400",
      accent: "from-red-500 to-red-600",
      icon: FiAlertTriangle,
      label: "At Risk"
    },
    update_required: {
      bg: "bg-gradient-to-r from-orange-50 to-orange-100",
      text: "text-orange-700",
      border: "border-orange-200",
      accent: "from-orange-400 to-orange-500",
      icon: FiRefreshCw,
      label: "Update Required"
    },
    on_hold: {
      bg: "bg-gradient-to-r from-gray-50 to-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
      accent: "from-gray-400 to-gray-500",
      icon: FiPauseCircle,
      label: "On Hold"
    },
    completed: {
      bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      accent: "from-emerald-400 to-emerald-500",
      icon: FiCheckCircle,
      label: "Completed"
    },
  };

  // Lead status colors
  const leadStatusColors = {
    new: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    contacted: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
    qualified: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
    converted: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
    lost: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" }
  };

  // Check if user is admin
  const isAdmin = profile?.role === "admin";

  // Filter workspaces based on search
  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch lead statistics
  useEffect(() => {
    const fetchLeadStats = async () => {
      try {
        setLeadLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('status');

        if (error) throw error;

        const stats = {
          total: data?.length || 0,
          new: data?.filter(l => l.status === 'new').length || 0,
          contacted: data?.filter(l => l.status === 'contacted').length || 0,
          qualified: data?.filter(l => l.status === 'qualified').length || 0,
          converted: data?.filter(l => l.status === 'converted').length || 0,
          lost: data?.filter(l => l.status === 'lost').length || 0
        };

        setLeadStats(stats);
      } catch (error) {
        console.error('Error fetching lead stats:', error);
      } finally {
        setLeadLoading(false);
      }
    };

    fetchLeadStats();
  }, []);

  // Fetch user's assigned tasks stats with all 6 phases
  useEffect(() => {
    const fetchUserTasks = async () => {
      if (profile?.id) {
        try {
          const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_to', profile.id);

          if (error) {
            console.error('Error fetching user tasks:', error);
            return;
          }

          // Initialize stats for all 6 phases
          const stats = {
            planning: 0,
            in_progress: 0,
            at_risk: 0,
            update_required: 0,
            on_hold: 0,
            completed: 0,
            totalAssigned: 0
          };

          if (tasks) {
            tasks.forEach(task => {
              const status = task.status;
              if (stats.hasOwnProperty(status)) {
                stats[status] = (stats[status] || 0) + 1;
              }
            });
            
            stats.totalAssigned = tasks.length;
          }

          setUserTaskStats(stats);
        } catch (error) {
          console.error('Error in fetchUserTasks:', error);
        }
      }
    };

    fetchUserTasks();
  }, [profile?.id]);

  // Fetch real member counts and task analytics for all workspaces
  useEffect(() => {
    const fetchWorkspaceAnalytics = async () => {
      if (!workspaces.length) {
        setMembersLoading(false);
        setAnalyticsLoading(false);
        return;
      }

      setMembersLoading(true);
      setAnalyticsLoading(true);
      
      const memberCountsObj = {};
      const taskCountsObj = {};
      const taskBreakdownObj = {};

      for (const ws of workspaces) {
        try {
          // Fetch workspace members count
          const { count: memberCount, error: memberError } = await supabase
            .from("workspace_members")
            .select("*", { count: 'exact', head: true })
            .eq("workspace_id", ws.id);

          if (memberError) {
            console.error(`Error fetching members for workspace ${ws.id}:`, memberError);
            memberCountsObj[ws.id] = 1;
          } else {
            memberCountsObj[ws.id] = memberCount || 1;
          }

          // Fetch workspace tasks for analytics
          const { data: tasks, error: taskError } = await supabase
            .from("tasks")
            .select('*')
            .eq("workspace_id", ws.id);

          if (taskError) {
            console.error(`Error fetching tasks for workspace ${ws.id}:`, taskError);
            taskCountsObj[ws.id] = 0;
            taskBreakdownObj[ws.id] = {
              planning: 0,
              in_progress: 0,
              at_risk: 0,
              update_required: 0,
              on_hold: 0,
              completed: 0
            };
          } else {
            const totalTasks = tasks?.length || 0;
            taskCountsObj[ws.id] = totalTasks;

            // Calculate task status breakdown for all 6 phases
            taskBreakdownObj[ws.id] = {
              planning: tasks?.filter(task => task.status === 'planning').length || 0,
              in_progress: tasks?.filter(task => task.status === 'in_progress').length || 0,
              at_risk: tasks?.filter(task => task.status === 'at_risk').length || 0,
              update_required: tasks?.filter(task => task.status === 'update_required').length || 0,
              on_hold: tasks?.filter(task => task.status === 'on_hold').length || 0,
              completed: tasks?.filter(task => task.status === 'completed').length || 0
            };
          }
        } catch (error) {
          console.error(`Error processing workspace ${ws.id}:`, error);
          memberCountsObj[ws.id] = 1;
          taskCountsObj[ws.id] = 0;
          taskBreakdownObj[ws.id] = {
            planning: 0,
            in_progress: 0,
            at_risk: 0,
            update_required: 0,
            on_hold: 0,
            completed: 0
          };
        }
      }

      setMemberCounts(memberCountsObj);
      setTaskCounts(taskCountsObj);
      setTaskStatusBreakdown(taskBreakdownObj);
      setMembersLoading(false);
      setAnalyticsLoading(false);
    };

    fetchWorkspaceAnalytics();
  }, [workspaces]);

  // Handle delete workspace
  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceToDelete.id);
      
      if (error) throw error;
      
      setShowDeleteModal(false);
      setWorkspaceToDelete(null);
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alert("Failed to delete workspace. Please try again.");
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return "Recently";
    }
  };

  const openDeleteModal = (workspace, e) => {
    e.stopPropagation();
    setWorkspaceToDelete(workspace);
    setShowDeleteModal(true);
    setShowMenuId(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.workspace-menu')) {
        setShowMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Loading skeleton
  const WorkspaceSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 space-y-3 md:space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-200"></div>
        <div className="space-y-1.5 md:space-y-2 flex-1">
          <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-2.5 md:h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <div className="h-2.5 md:h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-2.5 md:h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  // Calculate completion rate for a workspace
  const calculateCompletionRate = (workspaceId) => {
    const breakdown = taskStatusBreakdown[workspaceId];
    if (!breakdown) return 0;
    
    const totalTasks = taskCounts[workspaceId] || 0;
    const completedTasks = breakdown.completed || 0;
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const WorkspaceCard = ({ ws, index }) => {
    const memberCount = memberCounts[ws.id] || 1;
    const totalTasks = taskCounts[ws.id] || 0;
    const completionRate = calculateCompletionRate(ws.id);
    const breakdown = taskStatusBreakdown[ws.id];
    const isMenuOpen = showMenuId === ws.id;
    
    return (
      <motion.div
        key={ws.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.05,
          duration: 0.3
        }}
        whileHover={{ 
          y: -3,
          transition: { duration: 0.2 }
        }}
        className="group relative"
      >
        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:border-red-300 hover:shadow-md md:hover:shadow-lg transition-all duration-300 overflow-hidden">
          
          {/* Card Header with Menu */}
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div 
              className="flex items-center gap-3 md:gap-4 flex-1 cursor-pointer min-w-0"
              onClick={() => navigate(`/workspace/${ws.id}`)}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white font-semibold text-sm md:text-lg">
                  {ws.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                  {ws.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">
                  Created {formatDate(ws.created_at)}
                </p>
              </div>
            </div>
            
            {/* Actions Menu - Only show if user is admin */}
            {isAdmin && (
              <div className="relative workspace-menu flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenuId(isMenuOpen ? null : ws.id);
                  }}
                  className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Workspace options"
                >
                  <FiMoreVertical className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                </button>
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 md:mt-2 w-40 md:w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1"
                    >
                      <button
                        onClick={(e) => openDeleteModal(ws, e)}
                        className="w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 hover:bg-red-50 text-red-600 transition-colors text-sm md:text-base"
                      >
                        <FiTrash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="font-medium">Delete Workspace</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          {/* Card Content */}
          <div 
            className="space-y-3 md:space-y-4 cursor-pointer"
            onClick={() => navigate(`/workspace/${ws.id}`)}
          >
            {/* Basic Stats Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm">
                  <FiUsers className="w-3 h-3 md:w-4 md:h-4" />
                  {membersLoading ? (
                    <span>...</span>
                  ) : (
                    <>
                      {memberCount} member{memberCount !== 1 ? 's' : ''}
                    </>
                  )}
                </span>
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm">
                  <FiClipboard className="w-3 h-3 md:w-4 md:h-4" />
                  {analyticsLoading ? (
                    <span>...</span>
                  ) : (
                    <>
                      {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                    </>
                  )}
                </span>
              </div>
              
              {/* Completion Rate */}
              {totalTasks > 0 && (
                <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium ${
                  completionRate >= 70 ? 'bg-emerald-50 text-emerald-700' :
                  completionRate >= 40 ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {completionRate}% Complete
                </span>
              )}
            </div>

            {/* Task Status Distribution - Mini Version */}
            {totalTasks > 0 && breakdown && (
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-gray-700">Task Distribution</span>
                  <FiPieChart className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
                </div>
                
                {/* Progress Bar showing completion rate */}
                <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-600"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                
                {/* Status Indicators - Responsive grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
                  {Object.entries(statusColors).map(([status, config]) => {
                    const count = breakdown[status] || 0;
                    if (count === 0) return null;
                    
                    return (
                      <div key={status} className="flex items-center gap-1 text-[10px] md:text-xs">
                        <config.icon className={`w-2.5 h-2.5 md:w-3 md:h-3 ${config.text}`} />
                        <span className="text-gray-700 font-medium">{count}</span>
                        <span className="text-gray-500 truncate">{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Analytics Summary */}
            {totalTasks > 0 && breakdown && (
              <div className="pt-2 md:pt-3 border-t border-gray-100">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1.5 md:gap-2 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <FiTrendingUp className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
                    <span className="text-gray-700">Productivity:</span>
                    <span className="font-medium text-emerald-700">
                      {breakdown.completed} completed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <FiActivity className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                    <span className="text-gray-700">Active:</span>
                    <span className="font-medium text-red-700">
                      {breakdown.in_progress} in progress
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats for empty workspaces */}
            {totalTasks === 0 && (
              <div className="pt-2 md:pt-3 border-t border-gray-100">
                <div className="text-center py-2 md:py-3">
                  <p className="text-xs md:text-sm text-gray-500">
                    No tasks yet. Start adding tasks to see analytics!
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/workspace/${ws.id}?tab=tasks`);
                    }}
                    className="mt-1.5 md:mt-2 text-xs md:text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Add First Task →
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Hover Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-red-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      
      {/* Page Header - Centered */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Workspaces
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Manage and access your team workspaces with detailed analytics and task management
        </p>
      </div>
      
      {/* Lead Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-8 md:mb-10"
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Leads Analytics
            </h2>
            <p className="text-gray-600">Overview of all leads in the system</p>
          </div>
          
          {leadLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
                {/* Total Leads */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 md:p-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-700 mb-1">
                    {leadStats.total}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Total Leads</div>
                  <FiUserPlus className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mx-auto mt-2" />
                </div>
                
                {/* New Leads */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 rounded-xl p-4 md:p-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-800 mb-1">
                    {leadStats.new}
                  </div>
                  <div className="text-sm font-medium text-gray-700">New</div>
                  <FiStar className="w-5 h-5 md:w-6 md:h-6 text-blue-700 mx-auto mt-2" />
                </div>
                
                {/* Contacted */}
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300 rounded-xl p-4 md:p-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-purple-800 mb-1">
                    {leadStats.contacted}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Contacted</div>
                  <FiClock className="w-5 h-5 md:w-6 md:h-6 text-purple-700 mx-auto mt-2" />
                </div>
                
                {/* Qualified */}
                <div className="bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 rounded-xl p-4 md:p-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-amber-800 mb-1">
                    {leadStats.qualified}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Qualified</div>
                  <FiBarChart2 className="w-5 h-5 md:w-6 md:h-6 text-amber-700 mx-auto mt-2" />
                </div>
                
                {/* Converted */}
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 rounded-xl p-4 md:p-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-800 mb-1">
                    {leadStats.converted}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Converted</div>
                  <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-700 mx-auto mt-2" />
                </div>
                
                {/* Lost */}
                <div className="bg-gradient-to-br from-red-100 to-red-200 border border-red-300 rounded-xl p-4 md:p-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-red-800 mb-1">
                    {leadStats.lost}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Lost</div>
                  <FiAlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-700 mx-auto mt-2" />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Conversion Rate: {leadStats.total > 0 ? 
                    Math.round((leadStats.converted / leadStats.total) * 100) : 0
                  }%
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
      
      {/* User Tasks Statistics */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8"
        >
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-md">
                <FiTarget className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Your Assigned Tasks</h3>
                <p className="text-sm md:text-base text-gray-500">Across all workspaces</p>
              </div>
            </div>
            
            {/* Total Tasks Summary */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 md:p-5">
                <div className="flex items-center gap-3">
                  <FiClipboard className="w-6 h-6 md:w-7 md:h-7 text-red-600" />
                  <span className="text-lg md:text-xl font-medium text-gray-900">Total Assigned Tasks</span>
                </div>
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{userTaskStats.totalAssigned}</span>
              </div>
            </div>
            
            {/* 6 Phases Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
              {/* Planning */}
              <div className="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-md transition-shadow">
                <div className="text-xl md:text-2xl font-bold text-red-700 mb-2">
                  {userTaskStats.planning}
                </div>
                <div className="text-sm font-medium text-gray-700">Planning</div>
                <FiClipboard className="w-5 h-5 md:w-6 md:h-6 text-red-600 mx-auto mt-2" />
              </div>
              
              {/* In Progress */}
              <div className="text-center p-4 bg-gradient-to-r from-red-100 to-red-200 rounded-xl border border-red-300 hover:shadow-md transition-shadow">
                <div className="text-xl md:text-2xl font-bold text-red-800 mb-2">
                  {userTaskStats.in_progress}
                </div>
                <div className="text-sm font-medium text-gray-700">In Progress</div>
                <FiPlayCircle className="w-5 h-5 md:w-6 md:h-6 text-red-700 mx-auto mt-2" />
              </div>
              
              {/* At Risk */}
              <div className="text-center p-4 bg-gradient-to-r from-red-200 to-red-300 rounded-xl border border-red-400 hover:shadow-md transition-shadow">
                <div className="text-xl md:text-2xl font-bold text-red-900 mb-2">
                  {userTaskStats.at_risk}
                </div>
                <div className="text-sm font-medium text-gray-700">At Risk</div>
                <FiAlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-800 mx-auto mt-2" />
              </div>
              
              {/* Update Required */}
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
                <div className="text-xl md:text-2xl font-bold text-orange-700 mb-2">
                  {userTaskStats.update_required}
                </div>
                <div className="text-sm font-medium text-gray-700">Update Required</div>
                <FiRefreshCw className="w-5 h-5 md:w-6 md:h-6 text-orange-600 mx-auto mt-2" />
              </div>
              
              {/* On Hold */}
              <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
                  {userTaskStats.on_hold}
                </div>
                <div className="text-sm font-medium text-gray-700">On Hold</div>
                <FiPauseCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-600 mx-auto mt-2" />
              </div>
              
              {/* Completed */}
              <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:shadow-md transition-shadow">
                <div className="text-xl md:text-2xl font-bold text-emerald-700 mb-2">
                  {userTaskStats.completed}
                </div>
                <div className="text-sm font-medium text-gray-700">Completed</div>
                <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 mx-auto mt-2" />
              </div>
            </div>
            
            {/* Summary Stats */}
            {userTaskStats.totalAssigned > 0 && (
              <div className="mt-6 md:mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-red-600" />
                    <span className="text-gray-600">Active Tasks:</span>
                    <span className="font-semibold text-red-700">
                      {userTaskStats.in_progress + userTaskStats.at_risk}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-semibold text-emerald-700">
                      {userTaskStats.totalAssigned > 0 
                        ? Math.round((userTaskStats.completed / userTaskStats.totalAssigned) * 100) 
                        : 0
                      }%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Find Your Workspace</h2>
            <p className="text-gray-600">Search and filter through all available workspaces</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-3 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all duration-300 text-base placeholder-gray-500 hover:border-gray-300"
                  placeholder="Search workspaces by name, member, or tasks..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                    aria-label="Clear search"
                  >
                    <span className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex justify-center">
              <CreateWorkspace />
            </div>
          </div>
          
          {/* Search Stats */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-gray-600">
                Found <span className="font-semibold text-red-600">{filteredWorkspaces.length}</span> workspace{filteredWorkspaces.length !== 1 ? 's' : ''} matching "<span className="font-medium text-gray-800">{searchQuery}</span>"
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Overall Analytics Section - Improved with flex wrap */}
      {!loading && workspaces.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mb-8 md:mb-12"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-md">
                  <FiActivity className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Overall Analytics</h2>
                  <p className="text-gray-600">Summary of all workspaces performance</p>
                </div>
              </div>
            </div>
            
            {/* Analytics Boxes - Using flex-wrap for better responsiveness */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {/* Total Workspaces */}
              <div className="flex-1 min-w-[200px] max-w-[250px] bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                    <FiFolder className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Total Workspaces</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {workspaces.length}
                </div>
                <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                    style={{ width: `${Math.min(100, (workspaces.length / 10) * 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Total Members */}
              <div className="flex-1 min-w-[200px] max-w-[250px] bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Total Members</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {Object.values(memberCounts).reduce((a, b) => a + b, 0)}
                </div>
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, (Object.values(memberCounts).reduce((a, b) => a + b, 0) / 50) * 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Total Tasks */}
              <div className="flex-1 min-w-[200px] max-w-[250px] bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
                    <FiClipboard className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Total Tasks</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {Object.values(taskCounts).reduce((a, b) => a + b, 0)}
                </div>
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                    style={{ width: `${Math.min(100, (Object.values(taskCounts).reduce((a, b) => a + b, 0) / 100) * 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Avg Tasks per Workspace */}
              <div className="flex-1 min-w-[200px] max-w-[250px] bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-5 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <FiLayers className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Avg Tasks/Workspace</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {workspaces.length > 0 
                    ? Math.round(Object.values(taskCounts).reduce((a, b) => a + b, 0) / workspaces.length)
                    : 0
                  }
                </div>
                <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, ((Object.values(taskCounts).reduce((a, b) => a + b, 0) / Math.max(1, workspaces.length)) / 20) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Stats Row */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">Avg Members/Workspace</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {workspaces.length > 0 
                      ? Math.round(Object.values(memberCounts).reduce((a, b) => a + b, 0) / workspaces.length)
                      : 0
                    }
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">Avg Completion Rate</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {workspaces.length > 0 
                      ? Math.round(
                          Object.keys(taskStatusBreakdown).reduce((total, wsId) => {
                            const breakdown = taskStatusBreakdown[wsId];
                            const totalTasks = taskCounts[wsId] || 0;
                            const completedTasks = breakdown?.completed || 0;
                            return total + (totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
                          }, 0) / workspaces.length
                        )
                      : 0
                    }%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">Most Active Status</div>
                  <div className="text-2xl font-bold text-red-600">
                    {workspaces.length > 0 
                      ? (() => {
                          const statusCounts = {};
                          Object.values(taskStatusBreakdown).forEach(breakdown => {
                            Object.entries(breakdown).forEach(([status, count]) => {
                              statusCounts[status] = (statusCounts[status] || 0) + count;
                            });
                          });
                          
                          const maxStatus = Object.keys(statusCounts).reduce((a, b) => 
                            statusCounts[a] > statusCounts[b] ? a : b
                          );
                          
                          return statusColors[maxStatus]?.label || 'N/A';
                        })()
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Workspace Content */}
      <div className="max-w-7xl mx-auto">
        {/* Content Header */}
        {workspaces.length > 0 && (
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                <FiBriefcase className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Your Workspaces
                {filteredWorkspaces.length > 0 && (
                  <span className="ml-2 text-base font-normal text-gray-500">
                    ({filteredWorkspaces.length} total)
                  </span>
                )}
              </h2>
            </div>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              Click on any workspace to view detailed analytics, manage tasks, and collaborate with team members
            </p>
          </div>
        )}

        {/* Show message when no workspaces exist */}
        {!loading && workspaces.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 md:py-16 lg:py-20"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 flex items-center justify-center">
              <FiGrid className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
              No workspaces yet
            </h3>
            <p className="text-base text-gray-600 mb-6 max-w-md mx-auto">
              You haven't created or joined any workspaces. Create your first workspace to get started with team collaboration!
            </p>
            <div className="flex justify-center">
              <CreateWorkspace />
            </div>
          </motion.div>
        )}

        {/* Workspace Grid */}
        {workspaces.length > 0 && (
          <AnimatePresence mode="wait">
            {loading || membersLoading || analyticsLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {[...Array(8)].map((_, i) => (
                  <WorkspaceSkeleton key={i} />
                ))}
              </motion.div>
            ) : filteredWorkspaces.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 md:py-16 lg:py-20"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiGrid className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  {searchQuery ? "No matching workspaces" : "No workspaces found"}
                </h3>
                <p className="text-base text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery ? `No results found for "${searchQuery}"` : "Start by creating your first workspace"}
                </p>
                {!searchQuery && (
                  <div className="flex justify-center">
                    <CreateWorkspace />
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="workspaces"
                layout
                className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {filteredWorkspaces.map((ws, index) => (
                  <WorkspaceCard key={ws.id} ws={ws} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && workspaceToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleteLoading && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden z-[10000] mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <FiTrash2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate">Delete Workspace</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium mb-1">
                    Are you sure you want to delete this workspace?
                  </p>
                  <p className="text-red-600 text-sm">
                    All data including tasks, members, and settings will be permanently removed.
                  </p>
                </div>
              </div>

              {/* Workspace Info with Analytics */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {workspaceToDelete.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{workspaceToDelete.name}</h4>
                    <p className="text-sm text-gray-500">
                      Created {formatDate(workspaceToDelete.created_at)}
                    </p>
                  </div>
                </div>
                
                {/* Analytics Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {memberCounts[workspaceToDelete.id] || 1}
                    </div>
                    <div className="text-xs text-gray-600">Members</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {taskCounts[workspaceToDelete.id] || 0}
                    </div>
                    <div className="text-xs text-gray-600">Tasks</div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 flex gap-3">
                <button
                  onClick={() => {
                    if (!deleteLoading) {
                      setShowDeleteModal(false);
                      setWorkspaceToDelete(null);
                    }
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkspace}
                  disabled={deleteLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-5 h-5" />
                      Delete Workspace
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
