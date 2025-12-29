import { motion, useAnimation } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { FiArrowRight, FiCheck, FiUsers, FiFolder, FiZap, FiShield, FiGlobe, FiBarChart, FiTrendingUp, FiClock, FiTarget, FiAward, FiActivity, FiClipboard, FiAlertCircle, FiCheckCircle, FiPlayCircle, FiPauseCircle, FiAlertTriangle, FiRefreshCw, FiMenu, FiX } from "react-icons/fi";
import { HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineFire, HiOutlineChartBar } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { WorkspaceContext } from "../context/WorkspaceContext";
import { supabase } from "../lib/supabase";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, profile } = useContext(AuthContext);
  const { workspaces } = useContext(WorkspaceContext);
  const controls = useAnimation();
  const [stats, setStats] = useState({ 
    workspaces: 0, 
    tasks: 0, 
    pending: 0,
    completed: 0,
    inProgress: 0,
    // New detailed status counts
    planning: 0,
    in_progress: 0,
    at_risk: 0,
    update_required: 0,
    on_hold: 0,
    completed_tasks: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Status colors configuration
  const statusColors = {
    planning: {
      bg: "bg-gradient-to-r from-blue-50 to-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      accent: "from-blue-500 to-blue-600",
      icon: "📋",
      label: "Planning",
      iconComponent: FiClipboard
    },
    in_progress: {
      bg: "bg-gradient-to-r from-amber-50 to-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      accent: "from-amber-500 to-amber-600",
      icon: "⚡",
      label: "In Progress",
      iconComponent: FiPlayCircle
    },
    at_risk: {
      bg: "bg-gradient-to-r from-rose-50 to-rose-100",
      text: "text-rose-700",
      border: "border-rose-200",
      accent: "from-rose-500 to-rose-600",
      icon: "⚠️",
      label: "At Risk",
      iconComponent: FiAlertTriangle
    },
    update_required: {
      bg: "bg-gradient-to-r from-orange-50 to-orange-100",
      text: "text-orange-700",
      border: "border-orange-200",
      accent: "from-orange-500 to-orange-600",
      icon: "🔄",
      label: "Update Required",
      iconComponent: FiRefreshCw
    },
    on_hold: {
      bg: "bg-gradient-to-r from-gray-50 to-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
      accent: "from-gray-500 to-gray-600",
      icon: "⏸️",
      label: "On Hold",
      iconComponent: FiPauseCircle
    },
    completed: {
      bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      accent: "from-emerald-500 to-emerald-600",
      icon: "✅",
      label: "Completed",
      iconComponent: FiCheckCircle
    },
  };

  // Calculate scroll progress for animations
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min(scrolled / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch task count from tasks table using profile ID with all statuses
  useEffect(() => {
    const fetchUserTasks = async () => {
      if (profile?.id) {
        try {
          // Fetch all tasks assigned to this user
          const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_to', profile.id);

          if (error) {
            console.error('Error fetching tasks:', error);
            return;
          }

          // Calculate detailed task stats for all 6 statuses
          const totalTasks = tasks?.length || 0;
          const planningTasks = tasks?.filter(task => task.status === 'planning').length || 0;
          const inProgressTasks = tasks?.filter(task => task.status === 'in_progress').length || 0;
          const atRiskTasks = tasks?.filter(task => task.status === 'at_risk').length || 0;
          const updateRequiredTasks = tasks?.filter(task => task.status === 'update_required').length || 0;
          const onHoldTasks = tasks?.filter(task => task.status === 'on_hold').length || 0;
          const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;

          // Legacy status calculations for compatibility
          const pendingTasks = planningTasks + updateRequiredTasks + onHoldTasks;

          setStats(prev => ({
            ...prev,
            tasks: totalTasks,
            pending: pendingTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            // Detailed status counts
            planning: planningTasks,
            in_progress: inProgressTasks,
            at_risk: atRiskTasks,
            update_required: updateRequiredTasks,
            on_hold: onHoldTasks,
            completed_tasks: completedTasks
          }));
        } catch (error) {
          console.error('Error in fetchUserTasks:', error);
        }
      }
    };

    fetchUserTasks();
  }, [profile?.id]);

  // Calculate workspace count from context
  useEffect(() => {
    if (workspaces) {
      setStats(prev => ({
        ...prev,
        workspaces: workspaces.length
      }));
    }
  }, [workspaces]);

  // Animation triggers
  useEffect(() => {
    setIsVisible(true);
    controls.start("visible");
  }, [controls]);

  // Advanced features with red + white theme
  const features = [
    {
      icon: FiTarget,
      title: "Smart Workspaces",
      description: "Organize projects with AI-powered task allocation and intelligent resource management",
      gradient: "from-red-500 to-red-600",
      accent: "bg-gradient-to-r from-red-50 to-red-100",
      action: () => navigate("/workspaces")
    },
    {
      icon: HiOutlineFire,
      title: "Team Collaboration",
      description: "Real-time chat, file sharing, and collaborative editing with instant synchronization",
      gradient: "from-red-600 to-red-700",
      accent: "bg-gradient-to-r from-red-100 to-red-200",
      action: () => navigate("/invites")
    },
    {
      icon: FiTrendingUp,
      title: "Performance Analytics",
      description: "Advanced workspaces & task report analytics to measure everything",
      gradient: "from-red-700 to-red-800",
      accent: "bg-gradient-to-r from-red-200 to-red-300",
      action: () => navigate("/workspaces")
    }
  ];

  // Premium benefits
  const benefits = [
    { icon: FiShield, text: "Enterprise Security", subtext: "SOC2 compliant, GDPR ready", color: "text-red-600" },
    { icon: FiClock, text: "24/7 Support", subtext: "Dedicated success team", color: "text-red-600" },
    { icon: FiGlobe, text: "Global Scale", subtext: "Multi-region deployment", color: "text-red-600" },
  ];

  // Success metrics
  const metrics = [
    { value: "99.9%", label: "Platform Uptime", icon: FiActivity },
    { value: "10x", label: "Team Productivity", icon: FiZap },
    { value: "24/7", label: "Support Response", icon: FiClock },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Task status cards data - Updated with 6 statuses
  const taskStatusCards = [
    {
      title: "Total Workspaces",
      value: stats.workspaces,
      icon: FiFolder,
      color: "bg-gradient-to-r from-red-500 to-red-600",
      trend: "Active Projects",
      description: "Your active workspaces"
    },
    {
      title: "Your Current Tasks",
      value: stats.tasks,
      icon: FiClipboard,
      color: "bg-gradient-to-r from-red-600 to-red-700",
      trend: `${stats.completed_tasks} completed`,
      description: "Total assigned tasks"
    },
    {
      title: "Task Completion",
      value: stats.tasks > 0 ? `${Math.round((stats.completed_tasks / stats.tasks) * 100)}%` : "0%",
      icon: FiCheckCircle,
      color: "bg-gradient-to-r from-red-700 to-red-800",
      trend: `${stats.completed_tasks}/${stats.tasks} done`,
      description: "Completion rate"
    }
  ];

  // Get all status cards for detailed breakdown
  const detailedStatusCards = Object.entries(statusColors).map(([status, config]) => ({
    status,
    label: config.label,
    value: stats[status] || 0,
    icon: config.icon,
    color: config.bg,
    textColor: config.text,
    borderColor: config.border,
    iconComponent: config.iconComponent
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-red-50/20 to-white overflow-hidden relative" >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-red-100 to-red-200 rounded-full mix-blend-multiply opacity-20 blur-3xl animate-pulse hidden md:block"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-red-50 to-red-100 rounded-full mix-blend-multiply opacity-10 blur-3xl hidden lg:block"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" stroke="none"/>
          </svg>
        </div>

        {/* Animated progress line */}
        <motion.div
          animate={{ scaleX: scrollProgress }}
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 origin-left"
          style={{ transformOrigin: '0% 50%' }}
        />
      </div>

     
      {/* Hero Section with Splash Background Image */}
      <section className="relative pt-20 pb-20 md:pt-0 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 min-h-screen md:min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image - Professional Project Management */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        
        {/* Dark Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50"></div>
        
        {/* Red Accent Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/10 mix-blend-overlay"></div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Animated Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="text-center"
          >
            {/* Premium Badge - Improved Visibility */}
            <motion.div 
              variants={itemVariants}
              className="inline-block mb-6 md:mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  <HiOutlineLightningBolt className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">
                  ENTERPRISE-GRADE • TRUSTED BY INDUSTRY LEADERS
                </span>
              </div>
            </motion.div>

            {/* Main Title - Better Mobile Typography */}
            <motion.div variants={itemVariants} className="relative mb-6 md:mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight tracking-tight">
                <span className="block text-white mb-2 md:mb-4 drop-shadow-lg">Modern Project</span>
                <span className="block">
                  <span className="relative">
                    <span className="absolute inset-0 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent blur-xl opacity-30">
                      Management Redefined
                    </span>
                    <span className="relative bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent drop-shadow-lg">
                      Management Redefined
                    </span>
                  </span>
                </span>
              </h1>

              {/* Animated underline */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-1.5 bg-gradient-to-r from-white via-red-300 to-white rounded-full mx-auto mt-6 md:mt-8 overflow-hidden max-w-xs md:max-w-md"
              >
                <motion.div
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="h-full w-20 md:w-40 bg-gradient-to-r from-transparent via-white to-transparent"
                />
              </motion.div>
            </motion.div>

            {/* Description - Improved Readability */}
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed px-4 md:px-0 drop-shadow-md"
            >
              Streamline your workflow with our intelligent platform that combines powerful project management, 
              real-time collaboration, and actionable insights—all in one beautiful interface.
            </motion.p>

            {/* CTA Buttons - Better Mobile Layout */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 md:px-0"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(user ? "/workspaces" : "/auth")}
                className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto min-w-[200px] overflow-hidden border-2 border-red-500/30"
              >
                {/* Button shine effect */}
                <motion.div
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                <span className="relative z-10">{user ? "Go to Dashboard" : "Start Free Trial"}</span>
                <FiArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(user ? "/invites": "/auth")}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:border-white/50 hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
              >
                Manage Team Invites
              </motion.button>
            </motion.div>

            {/* Benefits Grid - Mobile Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto px-4 md:px-0"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl hover:border-white/40 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 flex items-center justify-center mb-2 sm:mb-0 border border-white/20">
                      <benefit.icon className={`w-5 h-5 text-white`} />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{benefit.text}</div>
                      <div className="text-white/70 text-xs mt-1">{benefit.subtext}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center backdrop-blur-sm">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Stats Dashboard - Only for logged in users - IMPROVED MOBILE RESPONSIVE */}
      {user && profile && (
        <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mb-8 md:mb-12"
            >
              {/* Dashboard Header */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 md:p-8 border border-red-200 shadow-lg mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Your Work Dashboard</h3>
                    <p className="text-gray-600 mt-1 text-sm md:text-base">Real-time overview of your workspaces and tasks</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-sm text-red-600 font-medium">Live Updates</span>
                  </div>
                </div>
                
                {/* Top Stats Cards - IMPROVED MOBILE LAYOUT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                  {taskStatusCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + (index * 0.1) }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 15px 30px rgba(239, 68, 68, 0.15)"
                      }}
                      className="bg-white rounded-xl p-5 md:p-6 border border-gray-100 hover:border-red-200 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${card.color} flex items-center justify-center shadow-lg`}>
                          <card.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-gray-500 bg-gray-50 px-2 md:px-3 py-1 rounded-full">
                          {card.trend}
                        </span>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
                      <div className="text-gray-600 font-medium text-sm md:text-base">{card.title}</div>
                      <div className="text-gray-400 text-xs md:text-sm mt-2">{card.description}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Detailed Task Status Breakdown - IMPROVED MOBILE */}
                <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900">Detailed Task Status</h4>
                    <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{stats.tasks} total tasks</span>
                  </div>
                  
                  {/* 6 Status Cards Grid - RESPONSIVE */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
                    {detailedStatusCards.map((statusCard, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + (index * 0.05) }}
                        whileHover={{ y: -5 }}
                        className={`${statusCard.color} ${statusCard.borderColor} rounded-xl p-3 md:p-4 border text-center hover:shadow-md transition-all duration-300`}
                      >
                        <div className="text-xl md:text-2xl mb-2">{statusCard.icon}</div>
                        <div className={`text-lg md:text-xl font-bold ${statusCard.textColor} mb-1`}>
                          {statusCard.value}
                        </div>
                        <div className="text-xs text-gray-600 font-medium truncate">{statusCard.label}</div>
                        {statusCard.value > 0 && (
                          <div className="mt-2">
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ 
                                  width: `${stats.tasks > 0 ? (statusCard.value / stats.tasks) * 100 : 0}%` 
                                }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`h-full bg-gradient-to-r ${statusColors[statusCard.status].accent}`}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {stats.tasks > 0 ? Math.round((statusCard.value / stats.tasks) * 100) : 0}%
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Task Summary Progress Bar */}
                  {stats.tasks > 0 && (
                    <div className="mt-8">
                      <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 mb-2 gap-2">
                        <span>Overall Task Progress</span>
                        <span className="font-medium">
                          {stats.completed_tasks} of {stats.tasks} completed • 
                          {stats.tasks > 0 ? Math.round((stats.completed_tasks / stats.tasks) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 md:h-3 bg-gray-200 rounded-full overflow-hidden relative">
                        {/* Background segments showing all statuses */}
                        <div className="absolute inset-0 flex">
                          {detailedStatusCards.map((statusCard, index) => {
                            const widthPercent = (statusCard.value / stats.tasks) * 100;
                            return widthPercent > 0 ? (
                              <div
                                key={index}
                                style={{ width: `${widthPercent}%` }}
                                className={`h-full ${statusCard.color.split(' ')[0]}`}
                              />
                            ) : null;
                          })}
                        </div>
                        {/* Progress bar for completed tasks */}
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(stats.completed_tasks / stats.tasks) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 relative"
                        >
                          <motion.div
                            animate={{
                              x: ["-100%", "100%"]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>
                      
                      {/* Legend - RESPONSIVE */}
                      <div className="flex flex-wrap gap-2 md:gap-3 mt-4 text-xs">
                        {detailedStatusCards.map((statusCard, index) => (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
                            <div className={`w-2 h-2 md:w-3 md:h-3 rounded ${statusCard.color.split(' ')[0]}`} />
                            <span className="text-gray-600 truncate">{statusCard.label}:</span>
                            <span className="font-medium text-gray-900">{statusCard.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {stats.tasks > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2 md:gap-3">
                      <button
                        onClick={() => navigate("/workspaces")}
                        className="px-3 md:px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex-1 sm:flex-none"
                      >
                        View All Tasks
                      </button>
                      {stats.update_required > 0 && (
                        <button
                          onClick={() => navigate("/workspaces")}
                          className="px-3 md:px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex-1 sm:flex-none"
                        >
                          {stats.update_required} Need Updates
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Show workspace count even if no tasks - IMPROVED MOBILE */}
              {(!stats.tasks || stats.tasks === 0) && workspaces && workspaces.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 md:p-8 border border-red-200 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Your Workspaces</h3>
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    {[
                      { 
                        label: "Active Workspaces", 
                        value: stats.workspaces, 
                        color: "bg-gradient-to-r from-red-500 to-red-600",
                        icon: FiFolder,
                        trend: "Ready for tasks"
                      },
                      { 
                        label: "Your Tasks", 
                        value: "0", 
                        color: "bg-gradient-to-r from-red-600 to-red-700",
                        icon: FiClipboard,
                        trend: "No tasks yet"
                      },
                      { 
                        label: "Get Started", 
                        value: "→", 
                        color: "bg-gradient-to-r from-red-700 to-red-800",
                        icon: FiArrowRight,
                        trend: "Create first task"
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 10px 25px rgba(239, 68, 68, 0.1)"
                        }}
                        className="bg-white rounded-xl p-5 md:p-6 border border-gray-100 hover:border-red-200 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <span className={`text-xs md:text-sm font-medium px-2 py-1 rounded ${
                            stat.trend === "No tasks yet" 
                              ? "text-yellow-600 bg-yellow-50" 
                              : stat.trend === "Create first task"
                              ? "text-blue-600 bg-blue-50"
                              : "text-green-600 bg-green-50"
                          }`}>
                            {stat.trend}
                          </span>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-12 md:mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-100 flex items-center justify-center shadow-lg">
                <HiOutlineSparkles className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
              </div>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-4">
              Powerful Features for <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Modern Teams</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4">
              Everything you need to manage projects, collaborate with your team, and deliver results faster
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 25px 50px rgba(239, 68, 68, 0.1)"
                }}
                className="group cursor-pointer"
                onClick={feature.action}
              >
                <div className={`relative bg-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 hover:border-red-200 transition-all duration-500 h-full overflow-hidden`}>
                  {/* Feature accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${feature.gradient.replace('from-', 'bg-gradient-to-r ')}`} />
                  
                  {/* Hover effect */}
                  <div className={`absolute inset-0 ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl ${feature.gradient} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                      <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-black" />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-red-700 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center text-red-600 font-semibold text-sm md:text-base group-hover:text-red-700 transition-colors">
                      <span>Explore Feature</span>
                      <FiArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 md:ml-3 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-red-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 px-4">
              Trusted by <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">High-Performance Teams</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4">
              See why industry leaders choose our platform for their mission-critical projects
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-red-50 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <metric.icon className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{metric.value}</div>
                <div className="text-gray-600 text-xs md:text-sm">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Background glow */}
            <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl md:rounded-3xl blur-xl opacity-50"></div>
            
            {/* Main CTA Card */}
            <div className="relative bg-gradient-to-br from-white to-red-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 border-2 border-red-100 shadow-xl overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-gradient-to-bl from-red-100 to-transparent rounded-full -translate-y-8 translate-x-8 md:-translate-y-16 md:translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 md:w-32 md:h-32 bg-gradient-to-tr from-red-50 to-transparent rounded-full translate-y-8 -translate-x-8 md:translate-y-16 md:-translate-x-16"></div>

              <div className="relative z-10 text-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 md:mb-8 rounded-full border-4 border-red-100 flex items-center justify-center"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r flex items-center justify-center">
                    <img 
                      src="/logo.png" 
                      alt="BigBull CAMP Logo" 
                      className="w-12 h-12 md:w-16 md:h-16 object-contain"
                    />
                  </div>
                </motion.div>

                <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 md:mb-6 px-4">
                  Ready to Transform Your <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Workflow?</span>
                </h2>
                
                <p className="text-gray-600 text-base md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
                  Join thousands of teams who have streamlined their project management and boosted productivity with our platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(239, 68, 68, 0.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/pricing")}
                    className="group px-6 md:px-8 lg:px-10 py-3 md:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-base md:text-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center"
                  >
                    <span>Purchase a Plan</span>
                    <FiArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/invites")}
                    className="px-6 md:px-8 py-3 md:py-4 bg-white text-red-700 rounded-xl font-semibold text-base md:text-lg border-2 border-red-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
                  >
                   Check Invites
                  </motion.button>
                </div>

                {/* Security trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-8 md:mt-12 flex flex-wrap justify-center gap-3 md:gap-6"
                >
                  {[
                    { text: "Real Time Chatting", icon: FiShield },
                    { text: "Task Management", icon: FiGlobe },
                    { text: "Secure Data Storage", icon: FiAward }
                  ].map((badge, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                      <badge.icon className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                      <span className="text-xs md:text-sm text-gray-700">{badge.text}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 mb-6 md:mb-8">
            {/* Logo and Brand */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 md:gap-4 group cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg">
                <img 
                  src="/logo.png" 
                  alt="BigBull CAMP Logo" 
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              </div>
              <div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  BIG BULL CAMP
                </div>
                <div className="text-gray-500 text-xs md:text-sm">Professional Project Management</div>
              </div>
            </motion.div>
            
            {/* Navigation Links */}
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05, color: "#dc2626" }}
                onClick={() => navigate("/workspaces")}
                className="text-gray-600 hover:text-red-600 font-medium text-sm md:text-base transition-colors"
              >
                Dashboard
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, color: "#dc2626" }}
                onClick={() => navigate("/invites")}
                className="text-gray-600 hover:text-red-600 font-medium text-sm md:text-base transition-colors"
              >
                Team Management
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, color: "#dc2626" }}
                onClick={() => navigate("/pricing")}
                className="text-gray-600 hover:text-red-600 font-medium text-sm md:text-base transition-colors"
              >
                Pricing
              </motion.button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6 md:my-8"></div>
          
          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-gray-500 text-sm md:text-base">© {new Date().getFullYear()} BigBull CAMP. All rights reserved.</p>
            <p className="mt-2 text-xs md:text-sm text-gray-400">Built with ❤️ for teams that deliver excellence</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}


