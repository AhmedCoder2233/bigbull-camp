import { useState, useEffect, useRef, useCallback, useMemo, useContext } from "react";
import { supabase } from "./lib/supabase";
import { 
  FiMessageSquare, 
  FiSearch, 
  FiSend, 
  FiUsers,
  FiUserPlus,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiCheckCircle,
  FiPlus,
  FiWifi,
  FiWifiOff,
  FiAlertCircle,
  FiEdit2,
  FiSettings,
  FiTrash2,
  FiLogOut,
  FiChevronsDown,
  FiUser,
  FiUserMinus,
  FiUserCheck,
  FiMoreVertical,
  FiClock,
  FiRefreshCw,
  FiHeart,
  FiStar
} from "react-icons/fi";

import { AuthContext } from "./context/AuthContext";

// ✅ ENHANCED Components with Red + White Theme and Advanced Animations
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case "danger": return { 
        bg: "from-red-50 to-rose-50", 
        border: "border-red-200", 
        text: "text-red-700", 
        button: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
        iconBg: "from-red-100 to-rose-100",
        icon: "text-red-600"
      };
      case "warning": return { 
        bg: "from-amber-50 to-orange-50", 
        border: "border-amber-200", 
        text: "text-amber-700", 
        button: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
        iconBg: "from-amber-100 to-orange-100",
        icon: "text-amber-600"
      };
      case "success": return { 
        bg: "from-emerald-50 to-green-50", 
        border: "border-emerald-200", 
        text: "text-emerald-700", 
        button: "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600",
        iconBg: "from-emerald-100 to-green-100",
        icon: "text-emerald-600"
      };
      default: return { 
        bg: "from-red-50 to-pink-50", 
        border: "border-red-200", 
        text: "text-red-700", 
        button: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
        iconBg: "from-red-100 to-pink-100",
        icon: "text-red-600"
      };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-modal-fade-in">
      <div className={`bg-gradient-to-br ${colors.bg} rounded-3xl shadow-[0_20px_60px_-15px_rgba(239,68,68,0.3)] w-full max-w-md overflow-hidden border ${colors.border} animate-modal-slide-up`}>
        <div className="p-8">
          <div className="flex items-center justify-center mb-6 relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.iconBg} blur-xl opacity-60`}></div>
            <div className={`w-20 h-20 rounded-full ${colors.iconBg} flex items-center justify-center relative z-10 animate-bounce-subtle`}>
              <FiAlertCircle className={`w-10 h-10 ${colors.icon}`} />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-4 animate-text-slide-up" style={{animationDelay: '0.1s'}}>{title}</h3>
          <p className={`text-lg ${colors.text} text-center mb-8 animate-text-slide-up`} style={{animationDelay: '0.2s'}}>{message}</p>
          
          <div className="flex flex-col gap-3 animate-text-slide-up" style={{animationDelay: '0.3s'}}>
            <button
              onClick={onConfirm}
              className={`py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${colors.button}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 hover:border-gray-400"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ ENHANCED LOADING COMPONENTS
const LoadingAnimation = ({ type = "spinner", size = "medium", className = "" }) => {
  const sizes = {
    small: "w-6 h-6",
    medium: "w-12 h-12",
    large: "w-16 h-16",
    xlarge: "w-24 h-24"
  };

  const themes = {
    red: "from-red-500 to-rose-500",
    pink: "from-pink-500 to-rose-500",
    white: "from-white/90 to-white/70"
  };

  if (type === "spinner") {
    return (
      <div className={`relative ${sizes[size]} ${className}`}>
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/30 to-rose-400/30 animate-ping-slow"></div>
        
        {/* Main spinner */}
        <div className="relative w-full h-full">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${themes.red} animate-gradient-shift opacity-80`}></div>
          <div className="absolute inset-[3px] bg-white rounded-full"></div>
          <div className={`absolute inset-[3px] rounded-full border-[3px] border-transparent border-t-gradient-to-r ${themes.red} animate-spin-gentle`}></div>
        </div>
        
        {/* Inner dot */}
        <div className="absolute inset-1/4 rounded-full bg-gradient-to-r from-red-500 to-rose-500 animate-pulse-slow"></div>
      </div>
    );
  }

  if (type === "dots") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full bg-gradient-to-r ${themes.red} animate-typing-dot`}
            style={{ animationDelay: `${(i - 1) * 0.2}s` }}
          ></div>
        ))}
      </div>
    );
  }

  if (type === "pulse") {
    return (
      <div className={`relative ${sizes[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/40 to-rose-500/40 animate-pulse-slow"></div>
        <div className={`absolute inset-2 rounded-full bg-gradient-to-r ${themes.red} animate-pulse-slow`}></div>
      </div>
    );
  }

  if (type === "bars") {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-1.5 bg-gradient-to-b from-red-500 to-rose-500 rounded-full animate-bar-wave"
            style={{ 
              animationDelay: `${(i - 1) * 0.1}s`,
              height: `${i * 8}px`
            }}
          ></div>
        ))}
      </div>
    );
  }

  return null;
};

const LoadingOverlay = ({ message = "Loading...", progress, subMessage }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-white/95 to-red-50/95 backdrop-blur-sm z-50 flex items-center justify-center animate-modal-fade-in">
    <div className="relative max-w-sm w-full mx-4 animate-modal-slide-up">
      {/* Background effects */}
      <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-xl animate-pulse-slow"></div>
      <div className="absolute -inset-2 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-3xl blur-lg animate-gradient-shift"></div>
      
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(239,68,68,0.2)] border border-red-100 overflow-hidden p-8">
        {/* Animated border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-border-flow"></div>
        
        <div className="flex flex-col items-center text-center">
          {/* Main loader */}
          <div className="relative mb-6">
            <LoadingAnimation type="spinner" size="xlarge" />
            
            {/* Floating dots */}
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 animate-float" 
              style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-float" 
              style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          {/* Text content */}
          <div className="space-y-4 w-full">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 animate-text-slide-up" 
                style={{animationDelay: '0.1s'}}>
                {message}
              </h3>
              {subMessage && (
                <p className="text-sm text-red-600/70 animate-text-slide-up" 
                  style={{animationDelay: '0.2s'}}>
                  {subMessage}
                </p>
              )}
            </div>
            
            {/* Progress bar if provided */}
            {progress !== undefined && (
              <div className="space-y-2 animate-text-slide-up" style={{animationDelay: '0.3s'}}>
                <div className="h-2 bg-red-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  ></div>
                </div>
                <p className="text-xs text-red-600/70 font-medium">
                  {Math.round(progress)}%
                </p>
              </div>
            )}
            
            {/* Loading dots for indication */}
            <div className="flex justify-center pt-2">
              <LoadingAnimation type="dots" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LoadingSkeleton = ({ type = "message", count = 1 }) => {
  if (type === "message") {
    return Array(count).fill(0).map((_, i) => (
      <div key={i} className="animate-pulse-slow" style={{ animationDelay: `${i * 0.1}s` }}>
        <div className="flex gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
            <div className="h-3 w-32 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
          </div>
        </div>
      </div>
    ));
  }

  if (type === "conversation") {
    return Array(count).fill(0).map((_, i) => (
      <div key={i} className="animate-pulse-slow" style={{ animationDelay: `${i * 0.1}s` }}>
        <div className="p-4 border-b border-red-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
              <div className="h-3 w-24 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    ));
  }

  if (type === "card") {
    return Array(count).fill(0).map((_, i) => (
      <div key={i} className="animate-pulse-slow" style={{ animationDelay: `${i * 0.1}s` }}>
        <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
            <div className="h-3 w-2/3 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
          </div>
        </div>
      </div>
    ));
  }

  return null;
};

export default function WorkspaceChat({ workspaceId, currentUser }) {
  // State variables
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationMembers, setConversationMembers] = useState({});
  const [conversationOtherMembers, setConversationOtherMembers] = useState({});
  const [conversationAdmins, setConversationAdmins] = useState({});
  const [conversationOwner, setConversationOwner] = useState({});
  
  // Online status states
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  // Group management states
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [membersToAdd, setMembersToAdd] = useState([]);

  // ✅ ENHANCED LOADING STATES
  const [isLoading, setIsLoading] = useState({
    initial: true,
    messages: false,
    members: false,
    conversations: false
  });
  
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Initializing workspace...",
    "Connecting to chat service...",
    "Loading team members...",
    "Fetching conversations...",
    "Setting up real-time features...",
    "Ready to chat!"
  ];
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning"
  });
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const messageChannelRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(0);
  const groupNameInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const editGroupInputRef = useRef(null);
  const addMembersInputRef = useRef(null);
  
  const isInitializedRef = useRef(false);
  const typingTimeoutsRef = useRef({});

  const { profile } = useContext(AuthContext);
  const isAdmin = profile?.role === "admin";

  // ✅ ENHANCED ANIMATION STYLES - Optimized and Simplified
  const styles = `
    /* Enhanced Animations for Red Theme */
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slide-up {
      from { 
        transform: translateY(20px) scale(0.98); 
        opacity: 0; 
      }
      to { 
        transform: translateY(0) scale(1); 
        opacity: 1; 
      }
    }
    
    @keyframes slide-in {
      from { 
        transform: translateX(-10px); 
        opacity: 0; 
      }
      to { 
        transform: translateX(0); 
        opacity: 1; 
      }
    }
    
    @keyframes slide-in-right {
      from { 
        transform: translateX(10px); 
        opacity: 0; 
      }
      to { 
        transform: translateX(0); 
        opacity: 1; 
      }
    }
    
    @keyframes scale-in {
      from { 
        transform: scale(0.95); 
        opacity: 0; 
      }
      to { 
        transform: scale(1); 
        opacity: 1; 
      }
    }
    
    @keyframes float {
      0%, 100% { 
        transform: translateY(0) rotate(0); 
      }
      50% { 
        transform: translateY(-6px) rotate(1deg); 
      }
    }
    
    @keyframes shimmer {
      0% { 
        background-position: -1000px 0; 
      }
      100% { 
        background-position: 1000px 0; 
      }
    }
    
    @keyframes gradient-shift {
      0%, 100% { 
        background-position: 0% 50%; 
      }
      50% { 
        background-position: 100% 50%; 
      }
    }
    
    @keyframes pulse-glow {
      0%, 100% { 
        opacity: 1; 
        filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.2));
      }
      50% { 
        opacity: 0.8; 
        filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.3));
      }
    }
    
    @keyframes bounce-subtle {
      0%, 100% { 
        transform: translateY(0); 
      }
      50% { 
        transform: translateY(-3px); 
      }
    }
    
    @keyframes spin-gentle {
      from { 
        transform: rotate(0deg); 
      }
      to { 
        transform: rotate(360deg); 
      }
    }
    
    @keyframes modal-fade-in {
      from { 
        opacity: 0; 
        backdrop-filter: blur(0px);
      }
      to { 
        opacity: 1; 
        backdrop-filter: blur(8px);
      }
    }
    
    @keyframes modal-slide-up {
      from { 
        transform: translateY(20px); 
        opacity: 0; 
      }
      to { 
        transform: translateY(0); 
        opacity: 1; 
      }
    }
    
    @keyframes text-slide-up {
      from { 
        transform: translateY(10px); 
        opacity: 0; 
      }
      to { 
        transform: translateY(0); 
        opacity: 1; 
      }
    }
    
    @keyframes ping-slow {
      0% { 
        transform: scale(1); 
        opacity: 0.8; 
      }
      100% { 
        transform: scale(1.5); 
        opacity: 0; 
      }
    }
    
    @keyframes pulse-slow {
      0%, 100% { 
        opacity: 1; 
      }
      50% { 
        opacity: 0.6; 
      }
    }
    
    @keyframes ripple {
      0% { 
        transform: scale(0); 
        opacity: 1; 
      }
      100% { 
        transform: scale(4); 
        opacity: 0; 
      }
    }
    
    @keyframes typing-dots {
      0%, 60%, 100% { 
        transform: translateY(0); 
      }
      30% { 
        transform: translateY(-5px); 
      }
    }
    
    @keyframes bar-wave {
      0%, 100% { 
        transform: scaleY(1); 
      }
      50% { 
        transform: scaleY(0.5); 
      }
    }
    
    @keyframes border-flow {
      0% { 
        transform: translateX(-100%); 
      }
      100% { 
        transform: translateX(100%); 
      }
    }
    
    @keyframes wave {
      0%, 100% { 
        transform: translateX(0); 
      }
      50% { 
        transform: translateX(5px); 
      }
    }
    
    /* Animation Classes */
    .animate-fade-in { 
      animation: fade-in 0.3s ease-out; 
    }
    
    .animate-slide-up { 
      animation: slide-up 0.4s cubic-bezier(0.2, 0, 0.1, 1); 
    }
    
    .animate-slide-in { 
      animation: slide-in 0.4s cubic-bezier(0.2, 0, 0.1, 1); 
    }
    
    .animate-slide-in-right { 
      animation: slide-in-right 0.4s cubic-bezier(0.2, 0, 0.1, 1); 
    }
    
    .animate-scale-in { 
      animation: scale-in 0.4s cubic-bezier(0.2, 0, 0.1, 1); 
    }
    
    .animate-float { 
      animation: float 3s ease-in-out infinite; 
    }
    
    .animate-pulse-glow { 
      animation: pulse-glow 2s ease-in-out infinite; 
    }
    
    .animate-bounce-subtle { 
      animation: bounce-subtle 2s ease-in-out infinite; 
    }
    
    .animate-spin-gentle { 
      animation: spin-gentle 1.2s linear infinite; 
    }
    
    .animate-modal-fade-in { 
      animation: modal-fade-in 0.3s ease-out; 
    }
    
    .animate-modal-slide-up { 
      animation: modal-slide-up 0.4s cubic-bezier(0.2, 0, 0.1, 1); 
    }
    
    .animate-text-slide-up { 
      animation: text-slide-up 0.5s cubic-bezier(0.2, 0, 0.1, 1) forwards; 
    }
    
    .animate-ping-slow { 
      animation: ping-slow 2s ease-out infinite; 
    }
    
    .animate-pulse-slow { 
      animation: pulse-slow 2s ease-in-out infinite; 
    }
    
    .animate-ripple { 
      animation: ripple 1s ease-out; 
    }
    
    .animate-typing-dot { 
      animation: typing-dots 1.2s ease-in-out infinite; 
    }
    
    .animate-bar-wave { 
      animation: bar-wave 1s ease-in-out infinite; 
    }
    
    .animate-border-flow { 
      animation: border-flow 2s linear infinite; 
    }
    
    .animate-wave { 
      animation: wave 1.5s ease-in-out infinite; 
    }
    
    .animate-gradient-shift { 
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite; 
    }
    
    .shimmer { 
      background: linear-gradient(
        90deg, 
        rgba(254, 202, 202, 0.1) 25%, 
        rgba(254, 202, 202, 0.2) 50%, 
        rgba(254, 202, 202, 0.1) 75%
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite; 
    }
    
    /* Smooth transitions */
    .transition-all-300 { 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
    }
    
    /* Stagger animations */
    .stagger > * { 
      opacity: 0; 
      animation: slide-up 0.5s cubic-bezier(0.2, 0, 0.1, 1) forwards; 
    }
    
    .stagger > *:nth-child(1) { animation-delay: 0.1s; }
    .stagger > *:nth-child(2) { animation-delay: 0.2s; }
    .stagger > *:nth-child(3) { animation-delay: 0.3s; }
    .stagger > *:nth-child(4) { animation-delay: 0.4s; }
    .stagger > *:nth-child(5) { animation-delay: 0.5s; }
    
    /* Red Theme Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: #fecaca;
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #ef4444, #dc2626);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, #dc2626, #b91c1c);
    }
    
    /* Responsive animations */
    @media (max-width: 768px) {
      .animate-slide-up,
      .animate-slide-in,
      .animate-slide-in-right {
        animation-duration: 0.3s;
      }
      
      .animate-text-slide-up {
        animation-duration: 0.4s;
      }
    }
  `;

  // ✅ CLEANUP: Only on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting - cleaning up all channels");
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear all typing timeouts
      Object.values(typingTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // ✅ ENHANCED INITIAL LOAD: With progress tracking
  useEffect(() => {
    if (!workspaceId || !currentUser?.id || isInitializedRef.current) {
      return;
    }

    console.log("🚀 Starting enhanced loading flow...");
    isInitializedRef.current = true;
    
    const startLoadingFlow = async () => {
      try {
        // Step 1: Initialize
        setLoadingStep(0);
        setLoadingProgress(10);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 2: Connect services
        setLoadingStep(1);
        setLoadingProgress(30);
        await setupPresence();
        
        // Step 3: Load members
        setLoadingStep(2);
        setLoadingProgress(50);
        await loadWorkspaceMembers();
        
        // Step 4: Load conversations
        setLoadingStep(3);
        setLoadingProgress(70);
        await loadConversations();
        
        // Step 5: Setup realtime
        setLoadingStep(4);
        setLoadingProgress(90);
        await setupRealtimeServices();
        
        // Complete
        setLoadingStep(5);
        setLoadingProgress(100);
        
        // Small delay to show completion
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clear loading states
        setIsLoading(prev => ({ ...prev, initial: false }));
        setPageTransition(true);
        
      } catch (error) {
        console.error("❌ Error in loading flow:", error);
        setError("Failed to initialize workspace");
      }
    };

    startLoadingFlow();
  }, [workspaceId, currentUser?.id]);

  // ✅ ENHANCED: Functions to show specific loading states
  const showMessageLoading = () => {
    setIsLoading(prev => ({ ...prev, messages: true }));
  };

  const hideMessageLoading = () => {
    setIsLoading(prev => ({ ...prev, messages: false }));
  };

  const showConversationLoading = () => {
    setIsLoading(prev => ({ ...prev, conversations: true }));
  };

  const hideConversationLoading = () => {
    setIsLoading(prev => ({ ...prev, conversations: false }));
  };

  // Load workspace members with enhanced loading state
  const loadWorkspaceMembers = async () => {
    setIsLoading(prev => ({ ...prev, members: true }));
    try {
      const { data: workspaceMembers, error: membersError } = await supabase
        .from("workspace_members")
        .select("user_id, role")
        .eq("workspace_id", workspaceId);

      if (membersError) throw membersError;

      if (!workspaceMembers || workspaceMembers.length === 0) {
        setAllMembers([]);
        return;
      }

      const userIds = workspaceMembers.map(member => member.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const combinedData = workspaceMembers.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        return {
          id: member.user_id,
          user_id: member.user_id,
          role: member.role,
          name: profile?.name || "Unknown User",
          email: profile?.email || "",
          avatar: profile?.name?.charAt(0).toUpperCase() || "U"
        };
      }).filter(member => member.name !== "Unknown User");

      setAllMembers(combinedData);
      
    } catch (error) {
      console.error("Error fetching members:", error);
      setAllMembers([]);
    } finally {
      setIsLoading(prev => ({ ...prev, members: false }));
    }
  };

  // Load conversations with enhanced animations
  const loadConversations = async () => {
    showConversationLoading();
    try {
      const { data: convData, error: convError } = await supabase
        .from("conversation_members")
        .select(`
          conversation_id,
          role,
          conversations (
            id,
            workspace_id,
            name,
            is_group,
            created_at,
            created_by,
            last_message_at,
            last_message
          )
        `)
        .eq("user_id", currentUser?.id);

      if (convError) throw convError;

      const userConversations = convData
        ?.map(item => item.conversations)
        ?.filter(conv => conv?.workspace_id === workspaceId)
        ?.sort((a, b) => new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at)) || [];

      setConversations(userConversations);
      
      if (userConversations.length > 0) {
        await loadConversationDetails(userConversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    } finally {
      hideConversationLoading();
    }
  };

  // Load conversation details including members, admins, and owner
  const loadConversationDetails = async (conversationsList) => {
    try {
      const conversationIds = conversationsList.map(conv => conv.id);
      
      const { data: membersData, error } = await supabase
        .from("conversation_members")
        .select("conversation_id, user_id, role")
        .in("conversation_id", conversationIds);

      if (error) throw error;

      const allUserIds = [...new Set(membersData?.map(item => item.user_id) || [])];
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", allUserIds);

      if (profilesError) throw profilesError;

      const membersByConversation = {};
      const otherMembersByConversation = {};
      const adminsByConversation = {};
      const ownerByConversation = {};
      
      membersData?.forEach(item => {
        const convId = item.conversation_id;
        const userId = item.user_id;
        const role = item.role;
        const profile = profiles?.find(p => p.id === userId);
        const userName = profile?.name || "Unknown User";
        
        // Store members
        if (!membersByConversation[convId]) {
          membersByConversation[convId] = [];
        }
        membersByConversation[convId].push({
          user_id: userId,
          name: userName,
          email: profile?.email || "",
          avatar: userName?.charAt(0).toUpperCase() || "U",
          role: role
        });

        // Store admins
        if (role === 'admin' || role === 'owner') {
          if (!adminsByConversation[convId]) {
            adminsByConversation[convId] = [];
          }
          adminsByConversation[convId].push(userId);
        }

        // Store owner
        if (role === 'owner') {
          ownerByConversation[convId] = {
            user_id: userId,
            name: userName,
            email: profile?.email || "",
            avatar: userName?.charAt(0).toUpperCase() || "U"
          };
        }

        const conversation = conversationsList.find(c => c.id === convId);
        if (conversation && !conversation.is_group) {
          if (userId !== currentUser?.id) {
            otherMembersByConversation[convId] = {
              user_id: userId,
              name: userName,
              email: profile?.email || "",
              avatar: userName?.charAt(0).toUpperCase() || "U",
              role: role
            };
          }
        }
      });

      setConversationMembers(membersByConversation);
      setConversationOtherMembers(otherMembersByConversation);
      setConversationAdmins(adminsByConversation);
      setConversationOwner(ownerByConversation);
      
    } catch (error) {
      console.error("Error loading conversation members:", error);
    }
  };

  // Check if user is owner of a conversation
  const isConversationOwner = (conversationId) => {
    return conversationOwner[conversationId]?.user_id === currentUser?.id;
  };

  // Check if user is admin of a conversation
  const isConversationAdmin = (conversationId) => {
    const admins = conversationAdmins[conversationId] || [];
    return admins.includes(currentUser?.id) || isConversationOwner(conversationId);
  };

  // ✅ ENHANCED PRESENCE: Setup with red theme
  const setupPresence = async () => {
    if (!currentUser?.id || !workspaceId) return;

    console.log("🟢 Setting up presence channel with red theme");
    let presenceChannel = null;

    try {
      if (presenceChannelRef.current) {
        await supabase.removeChannel(presenceChannelRef.current);
      }

      presenceChannel = supabase.channel(`workspace:${workspaceId}:presence`, {
        config: {
          presence: {
            key: currentUser.id,
          },
        },
      });

      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const online = new Set();
          
          Object.keys(state).forEach(key => {
            const presences = state[key];
            if (presences && presences.length > 0) {
              online.add(key);
            }
          });
          
          setOnlineUsers(online);
          console.log("🟢 Online users synced:", online.size);
        })
        .on('presence', { event: 'join' }, ({ key }) => {
          console.log("👋 User joined:", key);
          setOnlineUsers(prev => new Set([...prev, key]));
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          console.log("👋 User left:", key);
          setOnlineUsers(prev => {
            const updated = new Set(prev);
            updated.delete(key);
            return updated;
          });
        });

      await presenceChannel.subscribe(async (status) => {
        console.log("📡 Presence status:", status);
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            online_at: new Date().toISOString(),
          });
          
          setConnectionStatus('connected');
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

      presenceChannelRef.current = presenceChannel;

    } catch (error) {
      console.error('❌ Error setting up presence:', error);
      setConnectionStatus('error');
    }
  };

  // Setup realtime services
  const setupRealtimeServices = async () => {
    // Already handled in setupPresence
  };

  // ✅ ENHANCED MESSAGE CHANNEL: Setup with smooth transitions
  useEffect(() => {
    if (!activeConversation?.id) {
      setMessages([]);
      
      if (messageChannelRef.current) {
        console.log("🔌 Removing previous message channel");
        supabase.removeChannel(messageChannelRef.current);
        messageChannelRef.current = null;
      }
      
      return;
    }

    console.log('🔄 Setting up realtime for conversation:', activeConversation.id);
    
    const initializeChat = async () => {
      // Cleanup existing channel
      if (messageChannelRef.current) {
        await supabase.removeChannel(messageChannelRef.current);
        messageChannelRef.current = null;
      }
      
      // Load messages first with loading state
      showMessageLoading();
      await loadMessages(activeConversation.id);
      
      // Setup realtime subscription
      setupRealtimeSubscription(activeConversation.id);
      
      // Focus input with delay
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 400);
    };

    initializeChat();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTypingUsers({});
    };
  }, [activeConversation?.id]);

  // Focus inputs when modals open with enhanced animations
  useEffect(() => {
    if (showGroupCreator && groupNameInputRef.current) {
      setTimeout(() => groupNameInputRef.current?.focus(), 300);
    }
  }, [showGroupCreator]);

  useEffect(() => {
    if (showMemberSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [showMemberSearch]);

  useEffect(() => {
    if (isEditingGroup && editGroupInputRef.current) {
      setTimeout(() => editGroupInputRef.current?.focus(), 300);
    }
  }, [isEditingGroup]);

  useEffect(() => {
    if (showAddMembers && addMembersInputRef.current) {
      setTimeout(() => addMembersInputRef.current?.focus(), 300);
    }
  }, [showAddMembers]);

  // ✅ ENHANCED LOAD MESSAGES: With smooth animations
  const loadMessages = async (conversationId) => {
    try {
      console.log("📥 Loading messages for conversation:", conversationId);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      
      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        console.log("📭 No messages found");
        return;
      }
      
      // Get sender profiles
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", senderIds);
      
      if (profilesError) throw profilesError;
      
      // Combine messages with sender info
      const messagesWithSenders = messagesData.map(msg => ({
        ...msg,
        sender: profiles?.find(p => p.id === msg.sender_id) || {
          id: msg.sender_id,
          name: "Unknown User",
          email: ""
        }
      }));
      
      setMessages(messagesWithSenders);
      console.log(`✅ Loaded ${messagesWithSenders.length} messages`);
      
      // Mark as read
      await markMessagesAsRead(conversationId);
      
    } catch (error) {
      console.error("❌ Error loading messages:", error);
      setMessages([]);
    } finally {
      // Small delay for smooth transition
      setTimeout(() => hideMessageLoading(), 300);
    }
  };

  // ✅ ENHANCED REALTIME SUBSCRIPTION
  const setupRealtimeSubscription = (conversationId) => {
    console.log('🔥 Setting up realtime subscription for:', conversationId);

    // Unsubscribe from previous channel if exists
    if (messageChannelRef.current) {
      console.log('🗑️ Removing previous channel');
      supabase.removeChannel(messageChannelRef.current);
      messageChannelRef.current = null;
    }

    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: {
        broadcast: {
          self: false,
          ack: true,
        },
      },
    });

    // Listen for INSERT events on messages table
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('✅ NEW MESSAGE RECEIVED:', payload.new);

          try {
            // Fetch sender info
            const { data: sender, error } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('id', payload.new.sender_id)
              .single();

            if (error) {
              console.error('❌ Error fetching sender:', error);
            }

            const newMessage = {
              ...payload.new,
              sender: sender || {
                id: payload.new.sender_id,
                name: "Unknown User",
                email: ""
              }
            };

            // Add message to state with animation
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMessage.id);
              if (exists) {
                console.log("⚠️ Message already exists, skipping");
                return prev;
              }

              console.log("➕ Adding new message to state");
              return [...prev, newMessage];
            });

            // Update conversation list
            await loadConversations();
            
          } catch (error) {
            console.error('❌ Error processing new message:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('🗑️ MESSAGE DELETED:', payload.old);
          
          // Remove message from state
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          
          // Update conversation list
          loadConversations();
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== currentUser?.id && payload.conversation_id === conversationId) {
          console.log('✍️ User typing:', payload.user_name);
          setTypingUsers(prev => ({
            ...prev,
            [payload.user_id]: {
              name: payload.user_name,
              timestamp: Date.now(),
              conversation_id: payload.conversation_id
            }
          }));

          // Clear previous timeout for this user
          if (typingTimeoutsRef.current[payload.user_id]) {
            clearTimeout(typingTimeoutsRef.current[payload.user_id]);
          }

          // Set new timeout to clear typing indicator
          typingTimeoutsRef.current[payload.user_id] = setTimeout(() => {
            setTypingUsers(prev => {
              const updated = { ...prev };
              delete updated[payload.user_id];
              return updated;
            });
            delete typingTimeoutsRef.current[payload.user_id];
          }, 3000);
        }
      })
      .on('broadcast', { event: 'typing_stop' }, ({ payload }) => {
        if (payload.conversation_id === conversationId) {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[payload.user_id];
            return updated;
          });
          
          // Clear the timeout
          if (typingTimeoutsRef.current[payload.user_id]) {
            clearTimeout(typingTimeoutsRef.current[payload.user_id]);
            delete typingTimeoutsRef.current[payload.user_id];
          }
        }
      })
      .subscribe((status, err) => {
        console.log('📡 Realtime channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to conversation messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error:', err);
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Channel timed out');
        } else if (status === 'CLOSED') {
          console.log('🔒 Channel closed');
        }
      });

    messageChannelRef.current = channel;
    return channel;
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    if (!currentUser?.id || !conversationId) return;

    try {
      const unreadMessages = messages.filter(msg => 
        msg.sender_id !== currentUser.id &&
        (!msg.read_by || !msg.read_by.includes(currentUser.id))
      );

      if (unreadMessages.length === 0) return;

      const messageIds = unreadMessages.map(msg => msg.id);
      
      const { data: updatedMessages } = await supabase
        .from("messages")
        .select("id, read_by")
        .in("id", messageIds);

      const updates = updatedMessages?.map(msg => {
        const updatedReadBy = [...(msg.read_by || []), currentUser.id];
        return supabase
          .from("messages")
          .update({ read_by: updatedReadBy })
          .eq("id", msg.id);
      }) || [];

      await Promise.all(updates);

      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg.id) 
            ? { ...msg, read_by: [...(msg.read_by || []), currentUser.id] }
            : msg
        )
      );

    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // ✅ ENHANCED: Delete message function with animation
  const deleteMessage = async (message) => {
    if (!message || message.sender_id !== currentUser?.id) {
      setError("You can only delete your own messages");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsDeletingMessage(true);
    
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", message.id);

      if (error) throw error;

      // Remove message from state immediately
      setMessages(prev => prev.filter(msg => msg.id !== message.id));
      
      // Update conversation last message if needed
      if (messages.length > 1) {
        const lastRemainingMessage = messages
          .filter(msg => msg.id !== message.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        if (lastRemainingMessage) {
          await supabase
            .from("conversations")
            .update({ 
              last_message_at: lastRemainingMessage.created_at,
              last_message: lastRemainingMessage.content.substring(0, 50) + (lastRemainingMessage.content.length > 50 ? '...' : '')
            })
            .eq("id", activeConversation.id);
        }
      }

      await loadConversations();
      setError("Message deleted successfully");
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error("❌ Error deleting message:", error);
      setError("Failed to delete message");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsDeletingMessage(false);
    }
  };

  // ✅ ENHANCED: Show confirmation dialog
  const showDeleteMessageConfirmation = (message) => {
    setConfirmationConfig({
      title: "Delete Message",
      message: "Are you sure you want to delete this message? This action cannot be undone.",
      onConfirm: () => deleteMessage(message),
      type: "danger",
      confirmText: "Delete Message",
      cancelText: "Cancel"
    });
    setShowConfirmation(true);
  };

  // Handle typing with enhanced animations
  const handleTyping = useCallback(() => {
    if (!activeConversation || !messageChannelRef.current || !newMessage.trim()) return;

    const now = Date.now();
    if (now - lastTypingTimeRef.current < 500) return;
    
    lastTypingTimeRef.current = now;
    clearTimeout(typingTimeoutRef.current);

    // Broadcast typing event
    messageChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        conversation_id: activeConversation.id,
        user_id: currentUser.id,
        user_name: currentUser.name,
        timestamp: now
      }
    });

    // Stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (messageChannelRef.current) {
        messageChannelRef.current.send({
          type: 'broadcast',
          event: 'typing_stop',
          payload: {
            conversation_id: activeConversation.id,
            user_id: currentUser.id,
          }
        });
      }
    }, 2000);
  }, [activeConversation, currentUser, newMessage]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (value.trim()) {
      handleTyping();
    }
  };

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEditGroupNameChange = (e) => {
    setEditingGroupName(e.target.value);
  };

  // ✅ ENHANCED SEND MESSAGE: With advanced animations
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || messageLoading) return;

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}`;
    
    // Create sending animation
    const sendButton = document.querySelector('button[onClick*="sendMessage"]');
    if (sendButton) {
      sendButton.classList.add('animate-pulse-slow');
    }

    // Enhanced optimistic update with ripple effect
    const optimisticMessage = {
      id: null,
      temp_id: tempId,
      conversation_id: activeConversation.id,
      sender_id: currentUser.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      read_by: [currentUser.id],
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email
      }
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    setMessageLoading(true);
    
    // Create ripple effect
    if (messageInputRef.current) {
      const ripple = document.createElement('div');
      ripple.className = 'absolute inset-0 bg-red-500/20 rounded-full animate-ripple';
      ripple.style.pointerEvents = 'none';
      messageInputRef.current.parentElement.style.position = 'relative';
      messageInputRef.current.parentElement.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    }

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (messageChannelRef.current) {
      messageChannelRef.current.send({
        type: 'broadcast',
        event: 'typing_stop',
        payload: {
          conversation_id: activeConversation.id,
          user_id: currentUser.id,
        }
      });
    }

    try {
      console.log("📤 Sending message to database...");
      
      const { data, error } = await supabase
        .from("messages")
        .insert([{
          conversation_id: activeConversation.id,
          sender_id: currentUser.id,
          content: messageContent,
          read_by: [currentUser.id]
        }])
        .select("*")
        .single();

      if (error) throw error;

      console.log("✅ Message saved:", data.id);

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.temp_id === tempId 
          ? { ...data, sender: optimisticMessage.sender }
          : msg
      ));

      // Update conversation
      await supabase
        .from("conversations")
        .update({ 
          last_message_at: new Date().toISOString(),
          last_message: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : '')
        })
        .eq("id", activeConversation.id);

      await loadConversations();
      
      // Success animation
      if (sendButton) {
        sendButton.classList.add('animate-bounce-subtle');
        setTimeout(() => {
          sendButton.classList.remove('animate-bounce-subtle');
          sendButton.classList.remove('animate-pulse-slow');
        }, 1000);
      }
      
    } catch (error) {
      console.error("❌ Error sending message:", error);
      
      // Remove optimistic message on error with shake animation
      setMessages(prev => prev.filter(msg => msg.temp_id !== tempId));
      setNewMessage(messageContent);
      setError("Message failed to send");
      
      // Shake animation for error
      if (messageInputRef.current) {
        messageInputRef.current.classList.add('animate-shake');
        setTimeout(() => messageInputRef.current.classList.remove('animate-shake'), 500);
      }
      
      // Remove pulse animation
      if (sendButton) {
        sendButton.classList.remove('animate-pulse-slow');
      }
      
      setTimeout(() => setError(null), 3000);
    } finally {
      setMessageLoading(false);
      messageInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Create one-on-one conversation with animation
  const createOneOnOneConversation = async (memberId) => {
    try {
      const { data: existingConvs, error: checkError } = await supabase
        .from("conversation_members")
        .select(`
          conversation_id,
          conversations!inner(id, is_group)
        `)
        .eq("user_id", currentUser?.id);

      if (checkError) throw checkError;

      const conversationIds = existingConvs?.map(item => item.conversation_id) || [];
      
      const { data: sharedConvs, error: sharedError } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", memberId)
        .in("conversation_id", conversationIds);

      if (sharedError) throw sharedError;

      if (sharedConvs && sharedConvs.length > 0) {
        const { data: convData } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", sharedConvs[0].conversation_id)
          .single();
        
        if (convData) {
          setActiveConversation(convData);
          setShowMemberSearch(false);
          return;
        }
      }

      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert([
          {
            workspace_id: workspaceId,
            is_group: false,
            created_by: currentUser?.id,
            last_message_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (convError) throw convError;

      const membersToAdd = [
        { conversation_id: newConv.id, user_id: currentUser?.id, joined_at: new Date().toISOString(), role: 'member' },
        { conversation_id: newConv.id, user_id: memberId, joined_at: new Date().toISOString(), role: 'member' }
      ];

      const { error: membersError } = await supabase
        .from("conversation_members")
        .insert(membersToAdd);

      if (membersError) throw membersError;

      await loadConversations();
      
      setActiveConversation(newConv);
      setShowMemberSearch(false);
      
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError("Failed to start conversation");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Create group conversation - only admins can create
  const createGroupConversation = async () => {
    if (!isAdmin) {
      setError("Only admins can create groups");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (selectedMembers.length < 1) {
      setError("Please select at least 1 member");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!groupName.trim()) {
      setError("Please enter a group name");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert([
          {
            workspace_id: workspaceId,
            name: groupName.trim(),
            is_group: true,
            created_by: currentUser?.id,
            last_message_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (convError) throw convError;

      // Add current user as owner
      const membersToAdd = [
        { conversation_id: newConv.id, user_id: currentUser?.id, joined_at: new Date().toISOString(), role: 'owner' },
        // Add selected members as regular members
        ...selectedMembers.map(member => ({
          conversation_id: newConv.id,
          user_id: member.id,
          joined_at: new Date().toISOString(),
          role: 'member'
        }))
      ];

      const { error: membersError } = await supabase
        .from("conversation_members")
        .insert(membersToAdd);

      if (membersError) throw membersError;

      await loadConversations();
      
      setActiveConversation(newConv);
      setSelectedMembers([]);
      setGroupName("");
      setShowGroupCreator(false);
      setShowMemberSearch(false);
      
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error("Error creating group chat:", error);
      setError("Failed to create group chat");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ ENHANCED: Show create group confirmation
  const showCreateGroupConfirmation = () => {
    if (!isAdmin) {
      setError("Only admins can create groups");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (selectedMembers.length < 1) {
      setError("Please select at least 1 member");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!groupName.trim()) {
      setError("Please enter a group name");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setConfirmationConfig({
      title: "Create Group Chat",
      message: `Create "${groupName.trim()}" with ${selectedMembers.length} member${selectedMembers.length !== 1 ? 's' : ''}?`,
      onConfirm: createGroupConversation,
      type: "success",
      confirmText: "Create Group",
      cancelText: "Cancel"
    });
    setShowConfirmation(true);
  };

  // Update group name - only owner can update
  const updateGroupName = async () => {
    if (!activeConversation || !activeConversation.is_group) {
      setError("This is not a group conversation");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!isConversationOwner(activeConversation.id)) {
      setError("Only group owner can update group name");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!editingGroupName.trim()) {
      setError("Please enter a group name");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from("conversations")
        .update({ name: editingGroupName.trim() })
        .eq("id", activeConversation.id);

      if (error) throw error;

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, name: editingGroupName.trim() }
          : conv
      ));
      
      setActiveConversation(prev => ({ ...prev, name: editingGroupName.trim() }));
      
      setIsEditingGroup(false);
      setEditingGroupName("");
      setError("Group name updated");
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error("Error updating group name:", error);
      setError("Failed to update group name");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ ENHANCED: Show update group name confirmation
  const showUpdateGroupNameConfirmation = () => {
    if (!activeConversation || !activeConversation.is_group) {
      setError("This is not a group conversation");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!isConversationOwner(activeConversation.id)) {
      setError("Only group owner can update group name");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!editingGroupName.trim()) {
      setError("Please enter a group name");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setConfirmationConfig({
      title: "Update Group Name",
      message: `Change group name to "${editingGroupName.trim()}"?`,
      onConfirm: updateGroupName,
      type: "warning",
      confirmText: "Update Name",
      cancelText: "Cancel"
    });
    setShowConfirmation(true);
  };

  // Add members to group - only owner and admins can add
  const addMembersToGroup = async () => {
    if (!activeConversation || !activeConversation.is_group) {
      setError("This is not a group conversation");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!isConversationAdmin(activeConversation.id)) {
      setError("Only group admins can add members");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (membersToAdd.length === 0) {
      setError("Please select members to add");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      // Check which members are already in the group
      const currentMemberIds = conversationMembers[activeConversation?.id]?.map(m => m.user_id) || [];
      const newMembers = membersToAdd.filter(member => !currentMemberIds.includes(member.id));

      if (newMembers.length === 0) {
        setError("Selected members are already in the group");
        setTimeout(() => setError(null), 3000);
        return;
      }

      const membersToInsert = newMembers.map(member => ({
        conversation_id: activeConversation.id,
        user_id: member.id,
        joined_at: new Date().toISOString(),
        role: 'member'
      }));

      const { error } = await supabase
        .from("conversation_members")
        .insert(membersToInsert);

      if (error) throw error;

      // Refresh conversation details
      await loadConversationDetails([activeConversation]);
      
      setMembersToAdd([]);
      setShowAddMembers(false);
      setError(`${newMembers.length} member(s) added to group`);
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error("Error adding members to group:", error);
      setError("Failed to add members");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ ENHANCED: Show add members confirmation
  const showAddMembersConfirmation = () => {
    if (!activeConversation || !activeConversation.is_group) {
      setError("This is not a group conversation");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!isConversationAdmin(activeConversation.id)) {
      setError("Only group admins can add members");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (membersToAdd.length === 0) {
      setError("Please select members to add");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setConfirmationConfig({
      title: "Add Members",
      message: `Add ${membersToAdd.length} member${membersToAdd.length !== 1 ? 's' : ''} to the group?`,
      onConfirm: addMembersToGroup,
      type: "success",
      confirmText: "Add Members",
      cancelText: "Cancel"
    });
    setShowConfirmation(true);
  };

  // Remove member from group - only owner and admins can remove
  const removeMemberFromGroup = async (memberId) => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (!isConversationAdmin(activeConversation.id)) {
      setError("Only group admins can remove members");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Owner cannot be removed
    if (memberId === conversationOwner[activeConversation.id]?.user_id) {
      setError("Group owner cannot be removed");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from("conversation_members")
        .delete()
        .eq("conversation_id", activeConversation.id)
        .eq("user_id", memberId);

      if (error) throw error;

      // Refresh conversation details
      await loadConversationDetails([activeConversation]);
      
      setError("Member removed from group");
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error("Error removing member from group:", error);
      setError("Failed to remove member");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ ENHANCED: Show remove member confirmation
  const showRemoveMemberConfirmation = (memberId, memberName) => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (!isConversationAdmin(activeConversation.id)) {
      setError("Only group admins can remove members");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (memberId === conversationOwner[activeConversation.id]?.user_id) {
      setError("Group owner cannot be removed");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setConfirmationConfig({
      title: "Remove Member",
      message: `Remove ${memberName} from the group? They will no longer have access to group messages.`,
      onConfirm: () => removeMemberFromGroup(memberId),
      type: "danger",
      confirmText: "Remove Member",
      cancelText: "Cancel"
    });
    setShowConfirmation(true);
  };

  // Make member admin - only owner can do this
  const makeMemberAdmin = async (memberId) => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (!isConversationOwner(activeConversation.id)) {
      setError("Only group owner can make admins");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from("conversation_members")
        .update({ role: 'admin' })
        .eq("conversation_id", activeConversation.id)
        .eq("user_id", memberId);

      if (error) throw error;

      // Refresh conversation details
      await loadConversationDetails([activeConversation]);
      
      setError("Member promoted to admin");
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error("Error making member admin:", error);
      setError("Failed to promote member");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ ENHANCED: Show make admin confirmation
  const showMakeAdminConfirmation = (memberId, memberName) => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (!isConversationOwner(activeConversation.id)) {
      setError("Only group owner can make admins");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setConfirmationConfig({
      title: "Make Admin",
      message: `Make ${memberName} a group admin? They will be able to add/remove members.`,
      onConfirm: () => makeMemberAdmin(memberId),
      type: "warning",
      confirmText: "Make Admin",
      cancelText: "Cancel"
    });
    setShowConfirmation(true);
  };

  // Transfer ownership - only owner can transfer
  const transferOwnership = async (memberId) => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (!isConversationOwner(activeConversation.id)) {
      setError("Only current owner can transfer ownership");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      // First, make current user admin
      await supabase
        .from("conversation_members")
        .update({ role: 'admin' })
        .eq("conversation_id", activeConversation.id)
        .eq("user_id", currentUser?.id);

      // Then make new member owner
      const { error } = await supabase
        .from("conversation_members")
        .update({ role: 'owner' })
        .eq("conversation_id", activeConversation.id)
        .eq("user_id", memberId);

      if (error) throw error;

      // Update conversation created_by
      await supabase
        .from("conversations")
        .update({ created_by: memberId })
        .eq("id", activeConversation.id);

      // Refresh conversation details
      await loadConversationDetails([activeConversation]);
      
      setError("Ownership transferred successfully");
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error("Error transferring ownership:", error);
      setError("Failed to transfer ownership");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ ENHANCED: Show transfer ownership confirmation
  const showTransferOwnershipConfirmation = (memberId, memberName) => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (!isConversationOwner(activeConversation.id)) {
      setError("Only current owner can transfer ownership");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setConfirmationConfig({
      title: "Transfer Ownership",
      message: `Transfer group ownership to ${memberName}? You will become an admin instead.`,
      onConfirm: () => transferOwnership(memberId),
      type: "danger",
      confirmText: "Transfer Ownership",
      cancelText: "Cancel"
    });
    setShowConfirmation(true);
  };

  // Delete group - only owner can delete
  const deleteGroup = async () => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (!isConversationOwner(activeConversation.id)) {
      setError("Only group owner can delete group");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      // First delete all messages
      await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", activeConversation.id);

      // Then delete all conversation members
      await supabase
        .from("conversation_members")
        .delete()
        .eq("conversation_id", activeConversation.id);

      // Finally delete the conversation
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", activeConversation.id);

      if (error) throw error;

      // Refresh conversations
      await loadConversations();
      
      setActiveConversation(null);
      setShowGroupSettings(false);
      setError("Group deleted successfully");
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error("Error deleting group:", error);
      setError("Failed to delete group");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ ENHANCED: Show delete group confirmation
  const showDeleteGroupConfirmation = () => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (!isConversationOwner(activeConversation.id)) {
      setError("Only group owner can delete group");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setConfirmationConfig({
      title: "Delete Group",
      message: "Are you sure you want to delete this group? All messages and members will be permanently removed. This action cannot be undone.",
      onConfirm: deleteGroup,
      type: "danger",
      confirmText: "Delete Group",
      cancelText: "Cancel"
    });
    setShowConfirmation(true);
  };

  // Leave group - members can leave, owner cannot
  const leaveGroup = async () => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (isConversationOwner(activeConversation.id)) {
      setError("Group owner cannot leave. Transfer ownership first or delete the group.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from("conversation_members")
        .delete()
        .eq("conversation_id", activeConversation.id)
        .eq("user_id", currentUser?.id);

      if (error) throw error;

      // Refresh conversations
      await loadConversations();
      
      setActiveConversation(null);
      setShowGroupSettings(false);
      setError("You have left the group");
      setTimeout(() => setError(null), 3000);
      
    } catch (error) {
      console.error("Error leaving group:", error);
      setError("Failed to leave group");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ ENHANCED: Show leave group confirmation
  const showLeaveGroupConfirmation = () => {
    if (!activeConversation || !activeConversation.is_group) {
      return;
    }

    if (isConversationOwner(activeConversation.id)) {
      setError("Group owner cannot leave. Transfer ownership first or delete the group.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setConfirmationConfig({
      title: "Leave Group",
      message: "Are you sure you want to leave this group? You will no longer have access to group messages.",
      onConfirm: leaveGroup,
      type: "danger",
      confirmText: "Leave Group",
      cancelText: "Cancel"
    });
    setShowConfirmation(true);
  };

  const toggleMemberSelection = (member) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const toggleMemberToAdd = (member) => {
    setMembersToAdd(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId?.toString());
  };

  const getOtherMemberName = useCallback((conversation) => {
    if (!conversation) return "Select Chat";
    
    if (conversation.is_group) {
      return conversation?.name || "Group Chat";
    }
    
    const otherMember = conversationOtherMembers[conversation.id];
    if (otherMember) {
      return otherMember.name;
    }
    
    const members = conversationMembers[conversation.id];
    if (members && members.length > 0) {
      const otherMember = members.find(m => m.user_id !== currentUser?.id);
      if (otherMember) {
        return otherMember.name;
      }
    }
    
    return conversation?.name || "Team Member";
  }, [conversationOtherMembers, conversationMembers, currentUser?.id]);

  const getConversationMembers = useCallback((conversationId) => {
    return conversationMembers[conversationId] || [];
  }, [conversationMembers]);

  const getTypingUsersText = () => {
    const typingUserList = Object.values(typingUsers);
    if (typingUserList.length === 0) return null;
    
    if (typingUserList.length === 1) {
      return `${typingUserList[0].name} is typing`;
    }
    
    if (typingUserList.length === 2) {
      return `${typingUserList[0].name} and ${typingUserList[1].name} are typing`;
    }
    
    return `${typingUserList[0].name} and ${typingUserList.length - 1} others are typing`;
  };

  const getFilteredMembers = useMemo(() => {
    if (!allMembers || allMembers.length === 0) return [];
    
    return allMembers.filter(member =>
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ).filter(member => member.user_id !== currentUser?.id);
  }, [allMembers, searchQuery, currentUser?.id]);

  const getAvailableMembersToAdd = useMemo(() => {
    if (!allMembers || allMembers.length === 0) return [];
    
    const currentMemberIds = conversationMembers[activeConversation?.id]?.map(m => m.user_id) || [];
    
    return allMembers.filter(member =>
      (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       member.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !currentMemberIds.includes(member.user_id) &&
      member.user_id !== currentUser?.id
    );
  }, [allMembers, searchQuery, activeConversation?.id, conversationMembers, currentUser?.id]);

  const handleStartNewChat = () => {
    setShowMemberSearch(true);
    setSelectedMembers([]);
    setShowGroupCreator(false);
    setSearchQuery("");
  };

  const handleStartNewGroupChat = () => {
    if (!isAdmin) {
      setError("Only admins can create groups");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setShowMemberSearch(true);
    setSelectedMembers([]);
    setShowGroupCreator(true);
    setSearchQuery("");
    setGroupName("");
  };

  const handleOpenGroupSettings = () => {
    setShowGroupSettings(true);
    setEditingGroupName(activeConversation?.name || "");
    setIsEditingGroup(false);
    setShowAddMembers(false);
    setMembersToAdd([]);
    setSearchQuery("");
  };

  const handleOpenAddMembers = () => {
    setShowAddMembers(true);
    setMembersToAdd([]);
    setSearchQuery("");
  };

  // ✅ ENHANCED: Loading indicator in message area
  const renderMessageArea = () => {
    if (isLoading.messages) {
      return (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="stagger space-y-4 lg:space-y-6">
            <LoadingSkeleton type="message" count={3} />
            <div className="text-center py-8">
              <LoadingAnimation type="dots" className="mx-auto" />
              <p className="text-red-600/70 mt-4 text-sm animate-pulse-slow">
                Loading messages...
              </p>
            </div>
            <LoadingSkeleton type="message" count={2} />
          </div>
        </div>
      );
    }

    if (messages.length > 0) {
      return (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="space-y-4 lg:space-y-6 stagger">
            {messages.map((message, index) => {
              const isCurrentUser = message.sender_id === currentUser?.id;
              const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
              const senderName = message.sender?.name || "Unknown User";
              const isSenderOnline = isUserOnline(message.sender_id);
              
              return (
                <div
                  key={message.id || message.temp_id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4 lg:mt-6' : 'mt-2 lg:mt-3'}`}
                >
                  <div className={`max-w-[85%] lg:max-w-2xl ${isCurrentUser ? 'ml-auto' : ''}`}>
                    {!isCurrentUser && showAvatar && (
                      <div className="flex items-center gap-2 mb-1 lg:mb-2">
                        <div className="relative">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm lg:text-base">
                              {senderName?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          {isSenderOnline && (
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500 animate-pulse-slow"></div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-sm lg:text-base">
                            {senderName}
                          </span>
                          {isSenderOnline && (
                            <span className="text-xs text-green-600 ml-2 animate-pulse-slow">• Online</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className={`relative group rounded-2xl lg:rounded-3xl px-4 lg:px-6 py-3 lg:py-4 ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-br-none shadow-lg hover:shadow-xl transition-all duration-300'
                        : 'bg-white border border-red-200 rounded-bl-none shadow-sm hover:shadow-md transition-all duration-300'
                    } ${message.id ? '' : 'opacity-70'}`}>
                      <p className="break-words text-sm lg:text-base">{message.content}</p>
                      <div className={`flex items-center justify-end gap-2 mt-2 ${
                        isCurrentUser ? 'text-red-200' : 'text-red-600/70'
                      }`}>
                        <span className="text-xs lg:text-sm">
                          {new Date(message.created_at + 'Z').toLocaleString('en-PK', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Asia/Karachi'
                          })}
                        </span>
                        {isCurrentUser && message.read_by && message.read_by.length > 1 && (
                          <FiCheckCircle className="w-4 h-4 lg:w-5 lg:h-5" title="Read" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={messagesEndRef} />
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="text-center py-12 lg:py-24 animate-slide-up">
          <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-6 lg:mb-10 rounded-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center animate-float">
            <FiMessageSquare className="w-12 h-12 lg:w-16 lg:h-16 text-red-400" />
          </div>
          <h3 className="text-xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-4 animate-text-slide-up" style={{animationDelay: '0.1s'}}>No messages yet</h3>
          <p className="text-red-600/70 text-base lg:text-xl mb-8 lg:mb-12 max-w-md lg:max-w-2xl mx-auto animate-text-slide-up" style={{animationDelay: '0.2s'}}>
            Start the conversation by sending your first message
          </p>
          <div className="flex gap-3 justify-center animate-text-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce-subtle"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce-subtle" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce-subtle" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ ENHANCED: Loading indicator in conversation list
  const renderConversationList = () => {
    if (isLoading.conversations) {
      return (
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-lg mb-4 px-2">Your Conversations</h3>
          <LoadingSkeleton type="conversation" count={4} />
        </div>
      );
    }

    if (conversations.length > 0) {
      return (
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-lg mb-4 px-2">Your Conversations</h3>
          {conversations.map((conv, index) => {
            const unreadCount = messages.filter(msg => 
              msg.conversation_id === conv.id && 
              !msg.read_by?.includes(currentUser?.id) &&
              msg.sender_id !== currentUser?.id
            ).length;

            const otherMemberName = getOtherMemberName(conv);
            const convMembers = getConversationMembers(conv.id);
            const memberCount = convMembers.length;

            const otherMember = conversationOtherMembers[conv.id];
            const isOtherMemberOnline = otherMember ? isUserOnline(otherMember.user_id) : false;

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 mb-3 animate-slide-in ${
                  activeConversation?.id === conv.id
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-500 shadow-lg animate-pulse-glow'
                    : 'hover:bg-red-50 border border-transparent hover:border-red-200'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 ${
                    conv.is_group
                      ? 'bg-gradient-to-br from-pink-500 to-rose-600'
                      : 'bg-gradient-to-br from-red-500 to-pink-600'
                  }`}>
                    {conv.is_group ? (
                      <FiUsers className="w-7 h-7 text-white" />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {otherMemberName?.charAt(0).toUpperCase() || "T"}
                      </span>
                    )}
                    {!conv.is_group && (
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        isOtherMemberOnline ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-400'
                      }`}></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900 truncate text-lg">
                        {otherMemberName}
                      </p>
                      {conv.last_message_at && (
                        <span className="text-xs text-red-600/70 whitespace-nowrap">
                          {new Date(conv.last_message_at + 'Z').toLocaleString('en-PK', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Asia/Karachi'
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-600 truncate text-sm flex-1">
                        {conv.last_message || "Start a conversation..."}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ml-2 flex-shrink-0 shadow-sm animate-pulse-glow">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.is_group && memberCount > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-red-600/70">
                          {memberCount} member{memberCount !== 1 ? 's' : ''}
                        </p>
                        {conversationOwner[conv.id] && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                            Owner: {conversationOwner[conv.id]?.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-4 px-2">Your Conversations</h3>
        <div className="text-center py-12 animate-slide-up">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center animate-float">
            <FiMessageSquare className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-red-600/70 mb-4">Start chatting with your team</p>
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleStartNewChat}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              Start Direct Message
            </button>
            <button
              onClick={handleStartNewGroupChat}
              disabled={!isAdmin}
              className={`px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-slide-up ${
                !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ animationDelay: '200ms' }}
            >
              {isAdmin ? 'Create Group Chat' : 'Only Admins Can Create Groups'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add CSS animations
  return (
    <>
      <style>{styles}</style>
      
      {/* Main Loading Overlay */}
      {isLoading.initial && (
        <LoadingOverlay 
          message={loadingSteps[loadingStep]}
          progress={loadingProgress}
          subMessage={loadingStep < loadingSteps.length - 1 ? "Please wait..." : "Almost ready!"}
        />
      )}

      {/* Message Loading Overlay (when switching conversations) */}
      {isLoading.messages && !isLoading.initial && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <LoadingAnimation type="spinner" size="large" />
            <p className="text-red-600/70 mt-4 text-sm font-medium animate-pulse-slow">
              Loading conversation...
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          confirmationConfig.onConfirm();
          setShowConfirmation(false);
        }}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        confirmText={confirmationConfig.confirmText}
        cancelText={confirmationConfig.cancelText}
        type={confirmationConfig.type}
      />

      <div className={`h-full flex flex-col md:flex-row rounded-2xl overflow-hidden bg-gradient-to-br from-white to-red-50/30 shadow-2xl transition-all duration-300 ${
        pageTransition ? 'animate-scale-in' : ''
      }`}>
        {/* Member Search Modal */}
        <div 
          className={`fixed inset-0 md:absolute md:inset-auto md:top-20 md:right-6 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 ${
            showMemberSearch ? 'block' : 'hidden'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMemberSearch(false);
              setShowGroupCreator(false);
              setSelectedMembers([]);
              setGroupName("");
            }
          }}
        >
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(239,68,68,0.3)] w-full max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-hidden border border-red-100 animate-modal-slide-up">
            <div className="sticky top-0 bg-white p-6 border-b border-red-100">
              <div className="flex items-center justify-between mb-4">
                <div className="animate-text-slide-up">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {showGroupCreator ? "New Group Chat" : "New Message"}
                  </h3>
                  <p className="text-red-600/70 mt-1">
                    {showGroupCreator ? "Create a group with team members" : "Select a member to chat with"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMemberSearch(false);
                    setShowGroupCreator(false);
                    setSelectedMembers([]);
                    setGroupName("");
                  }}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors animate-text-slide-up"
                  style={{animationDelay: '0.1s'}}
                >
                  <FiX className="w-6 h-6 text-red-600" />
                </button>
              </div>
              
              {showGroupCreator && !isAdmin && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-text-slide-up" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center gap-3">
                    <FiAlertCircle className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-700 font-medium">
                      Only workspace admins can create groups
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 mb-4 animate-text-slide-up" style={{animationDelay: '0.3s'}}>
                <button
                  onClick={() => {
                    setShowGroupCreator(false);
                    setSelectedMembers([]);
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] ${
                    !showGroupCreator 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  Direct Message
                </button>
                <button
                  onClick={() => {
                    if (isAdmin) {
                      setShowGroupCreator(true);
                    } else {
                      setError("Only admins can create groups");
                      setTimeout(() => setError(null), 3000);
                    }
                  }}
                  disabled={!isAdmin}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] ${
                    showGroupCreator 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' 
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Group Chat
                </button>
              </div>
              
              <div className="relative animate-text-slide-up" style={{animationDelay: '0.4s'}}>
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search team members..."
                  className="w-full pl-12 pr-4 py-4 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-base placeholder-red-300"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {getFilteredMembers.length > 0 ? (
                <>
                  <div className="mb-4 animate-text-slide-up" style={{animationDelay: '0.5s'}}>
                    <h4 className="font-semibold text-gray-700 mb-3 px-2">
                      Team Members ({getFilteredMembers.length})
                    </h4>
                    <div className="space-y-2">
                      {getFilteredMembers.map((member, index) => {
                        const isOnline = isUserOnline(member.user_id);
                        return (
                          <div
                            key={member.user_id}
                            className="flex items-center justify-between p-4 hover:bg-red-50 rounded-xl cursor-pointer transition-all duration-300 group animate-slide-up"
                            style={{animationDelay: `${index * 50}ms`}}
                            onClick={() => {
                              if (!showGroupCreator) {
                                createOneOnOneConversation(member.user_id);
                              }
                            }}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                                  {member.avatar}
                                </div>
                                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                  isOnline ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-400'
                                }`}></span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-900 text-lg truncate">
                                    {member.name}
                                  </p>
                                  {isOnline && (
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full animate-pulse-slow">
                                      Online
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 truncate">{member.email}</p>
                                <span className={`text-xs px-3 py-1 rounded-full mt-1 inline-block ${
                                  member.role === 'owner' 
                                    ? 'bg-purple-100 text-purple-700'
                                    : member.role === 'admin'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {member.role}
                                </span>
                              </div>
                            </div>

                            {showGroupCreator && isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMemberSelection({
                                    id: member.user_id,
                                    username: member.name,
                                    email: member.email
                                  });
                                }}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 ${
                                  selectedMembers.some(m => m.id === member.user_id)
                                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white animate-bounce-subtle"
                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                }`}
                              >
                                {selectedMembers.some(m => m.id === member.user_id) ? (
                                  <FiCheck className="w-6 h-6" />
                                ) : (
                                  <FiPlus className="w-6 h-6" />
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {showGroupCreator && isAdmin && selectedMembers.length > 0 && (
                    <div className="bg-gradient-to-r h-[650px] from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100 mt-6 animate-slide-up">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="font-bold text-gray-900 text-xl">
                            Create Group
                          </h4>
                          <p className="text-red-600/70 mt-1">
                            {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedMembers([])}
                          className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors font-medium"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-6">
                        {selectedMembers.map((member, index) => (
                          <div
                            key={member.id}
                            className="px-4 py-3 bg-white border border-red-200 rounded-xl flex items-center gap-3 shadow-sm animate-slide-in"
                            style={{animationDelay: `${index * 50}ms`}}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center animate-bounce-subtle">
                              <span className="text-white font-medium">
                                {member.username?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{member.username}</p>
                              <p className="text-sm text-gray-500 truncate max-w-[150px]">{member.email}</p>
                            </div>
                            <button
                              onClick={() => toggleMemberSelection(member)}
                              className="ml-2 p-1 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <FiX className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Group Name
                          </label>
                          <input
                            ref={groupNameInputRef}
                            type="text"
                            value={groupName}
                            onChange={handleGroupNameChange}
                            placeholder="Enter group name..."
                            className="w-full px-5 py-4 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-base bg-white placeholder-red-300"
                          />
                        </div>
                        
                        <div className="flex gap-4">
                          <button
                            onClick={showCreateGroupConfirmation}
                            disabled={!groupName.trim()}
                            className={`flex-1 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                              groupName.trim() 
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Create Group
                          </button>
                          <button
                            onClick={() => {
                              setShowGroupCreator(false);
                              setSelectedMembers([]);
                              setGroupName("");
                            }}
                            className="px-8 py-4 border-2 border-red-300 text-red-700 rounded-xl font-medium hover:bg-red-50 transition-all duration-300 hover:border-red-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 animate-slide-up">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center animate-float">
                    <FiUsers className="w-12 h-12 text-red-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No members found</h4>
                  <p className="text-red-600/70">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Group Settings Modal */}
        <div 
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 ${
            showGroupSettings ? 'block' : 'hidden'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGroupSettings(false);
              setIsEditingGroup(false);
              setEditingGroupName("");
              setShowAddMembers(false);
              setMembersToAdd([]);
            }
          }}
        >
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(239,68,68,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden border border-red-100 animate-modal-slide-up">
            <div className="sticky top-0 bg-white p-6 border-b border-red-100">
              <div className="flex items-center justify-between mb-4">
                <div className="animate-text-slide-up">
                  <h3 className="text-2xl font-bold text-gray-900">Group Settings</h3>
                  <p className="text-red-600/70 mt-1">Manage your group chat</p>
                </div>
                <button
                  onClick={() => {
                    setShowGroupSettings(false);
                    setIsEditingGroup(false);
                    setEditingGroupName("");
                    setShowAddMembers(false);
                    setMembersToAdd([]);
                  }}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors animate-text-slide-up"
                  style={{animationDelay: '0.1s'}}
                >
                  <FiX className="w-6 h-6 text-red-600" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {showAddMembers ? (
                <div className="space-y-6 animate-text-slide-up" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl">Add Members</h4>
                      <p className="text-red-600/70 mt-1">
                        Add new members to {activeConversation?.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddMembers(false)}
                      className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-xl transition-colors font-medium"
                    >
                      Back
                    </button>
                  </div>

                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
                    <input
                      ref={addMembersInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search team members to add..."
                      className="w-full pl-12 pr-4 py-4 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-base placeholder-red-300"
                    />
                  </div>

                  {getAvailableMembersToAdd.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {getAvailableMembersToAdd.map((member, index) => {
                          const isOnline = isUserOnline(member.user_id);
                          const isSelected = membersToAdd.some(m => m.id === member.user_id);
                          
                          return (
                            <div
                              key={member.user_id}
                              className="flex items-center justify-between p-4 hover:bg-red-50 rounded-xl cursor-pointer transition-all duration-300 border border-red-200 animate-slide-in"
                              style={{animationDelay: `${index * 30}ms`}}
                              onClick={() => toggleMemberToAdd({
                                id: member.user_id,
                                username: member.name,
                                email: member.email
                              })}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {member.avatar}
                                  </div>
                                  <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                    isOnline ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-400'
                                  }`}></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900 truncate">
                                      {member.name}
                                    </p>
                                    {isOnline && (
                                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full animate-pulse-slow">
                                        Online
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-sm truncate">{member.email}</p>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMemberToAdd({
                                    id: member.user_id,
                                    username: member.name,
                                    email: member.email
                                  });
                                }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                                  isSelected
                                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white animate-bounce-subtle"
                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                }`}
                              >
                                {isSelected ? (
                                  <FiCheck className="w-5 h-5" />
                                ) : (
                                  <FiPlus className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {membersToAdd.length > 0 && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100 animate-slide-up">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h5 className="font-bold text-gray-900">
                                {membersToAdd.length} member{membersToAdd.length !== 1 ? 's' : ''} selected
                              </h5>
                              <p className="text-red-600/70 text-sm mt-1">
                                Click "Add Members" to add them to the group
                              </p>
                            </div>
                            <button
                              onClick={() => setMembersToAdd([])}
                              className="px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                            >
                              Clear All
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-6">
                            {membersToAdd.map((member, index) => (
                              <div
                                key={member.id}
                                className="px-3 py-2 bg-white border border-red-200 rounded-lg flex items-center gap-2 shadow-sm animate-slide-in"
                                style={{animationDelay: `${index * 50}ms`}}
                              >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {member.username?.charAt(0).toUpperCase() || "U"}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{member.username}</span>
                                <button
                                  onClick={() => toggleMemberToAdd(member)}
                                  className="ml-1 p-0.5 hover:bg-red-100 rounded transition-colors"
                                >
                                  <FiX className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={showAddMembersConfirmation}
                              className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-pulse-glow"
                            >
                              Add Members
                            </button>
                            <button
                              onClick={() => setShowAddMembers(false)}
                              className="px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl font-medium hover:bg-red-50 transition-all duration-300 hover:border-red-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 animate-slide-up">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center animate-float">
                        <FiUsers className="w-8 h-8 text-red-400" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">No members found</h5>
                      <p className="text-red-600/70">All workspace members are already in this group</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-8 animate-text-slide-up" style={{animationDelay: '0.2s'}}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 text-lg">Group Name</h4>
                      {!isEditingGroup && isConversationOwner(activeConversation?.id) && (
                        <button
                          onClick={() => {
                            setIsEditingGroup(true);
                            setEditingGroupName(activeConversation?.name || "");
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors animate-text-slide-up"
                          style={{animationDelay: '0.3s'}}
                        >
                          <FiEdit2 className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>
                    
                    {isEditingGroup ? (
                      <div className="space-y-4 animate-slide-up">
                        <input
                          ref={editGroupInputRef}
                          type="text"
                          value={editingGroupName}
                          onChange={handleEditGroupNameChange}
                          placeholder="Enter new group name..."
                          className="w-full px-5 py-4 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-base placeholder-red-300"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={showUpdateGroupNameConfirmation}
                            disabled={!editingGroupName.trim()}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] ${
                              editingGroupName.trim() 
                                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-lg' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingGroup(false);
                              setEditingGroupName("");
                            }}
                            className="px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl font-medium hover:bg-red-50 transition-all duration-300 hover:border-red-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 text-lg font-medium px-4 py-3 bg-red-50 rounded-xl animate-text-slide-up" style={{animationDelay: '0.4s'}}>
                        {activeConversation?.name}
                      </p>
                    )}
                  </div>

                  <div className="mb-8 animate-text-slide-up" style={{animationDelay: '0.5s'}}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 text-lg">
                        Group Members ({getConversationMembers(activeConversation?.id).length})
                      </h4>
                      {isConversationAdmin(activeConversation?.id) && (
                        <button
                          onClick={handleOpenAddMembers}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-text-slide-up"
                          style={{animationDelay: '0.6s'}}
                        >
                          <FiUserPlus className="w-4 h-4" />
                          Add Members
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {getConversationMembers(activeConversation?.id).map((member, index) => {
                        const isCurrentUser = member.user_id === currentUser?.id;
                        const isOnline = isUserOnline(member.user_id);
                        const isOwner = conversationOwner[activeConversation?.id]?.user_id === member.user_id;
                        const isAdmin = member.role === 'admin' || isOwner;
                        
                        return (
                          <div 
                            key={member.user_id}
                            className={`px-4 py-3 rounded-xl flex items-center justify-between animate-slide-in ${
                              isCurrentUser 
                                ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200' 
                                : 'bg-red-50 border border-red-200'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center animate-bounce-subtle">
                                  <span className="text-white font-bold">
                                    {member.avatar}
                                  </span>
                                </div>
                                {isOnline && !isCurrentUser && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-green-500 animate-pulse-slow"></div>
                                )}
                                {isOwner && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center">
                                    <FiStar className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${isCurrentUser ? 'text-red-700' : 'text-gray-900'}`}>
                                    {member.name}
                                    {isCurrentUser && ' (You)'}
                                  </span>
                                  {isOwner ? (
                                    <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                      Owner
                                    </span>
                                  ) : isAdmin ? (
                                    <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                      Admin
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                      Member
                                    </span>
                                )}
                                </div>
                                <p className="text-sm text-gray-500">{member.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isOnline && !isCurrentUser && (
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full animate-pulse-slow">
                                  Online
                                </span>
                              )}
                              
                              {/* Action buttons - only show for admins/owner */}
                              {!isCurrentUser && isConversationAdmin(activeConversation?.id) && (
                                <div className="flex gap-1">
                                  {/* Make Admin/Owner buttons - only for owner */}
                                  {isConversationOwner(activeConversation?.id) && !isOwner && (
                                    <>
                                      {!isAdmin && (
                                        <button
                                          onClick={() => showMakeAdminConfirmation(member.user_id, member.name)}
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                          title="Make Admin"
                                        >
                                          <FiUserCheck className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => showTransferOwnershipConfirmation(member.user_id, member.name)}
                                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                        title="Transfer Ownership"
                                      >
                                        <FiChevronsDown className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  
                                  {/* Remove button - admins can remove members, owner cannot remove owner */}
                                  {!isOwner && (
                                    <button
                                      onClick={() => showRemoveMemberConfirmation(member.user_id, member.name)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Remove from Group"
                                    >
                                      <FiUserMinus className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-red-200 pt-6 animate-text-slide-up" style={{animationDelay: '0.7s'}}>
                    <h4 className="font-bold text-gray-900 text-lg mb-4">Danger Zone</h4>
                    
                    <div className="space-y-3">
                      {/* Leave Group button - for members, not owner */}
                      {!isConversationOwner(activeConversation?.id) && (
                        <button
                          onClick={showLeaveGroupConfirmation}
                          className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors duration-300 text-red-700 font-medium animate-pulse-glow"
                        >
                          <div className="flex items-center gap-3">
                            <FiLogOut className="w-5 h-5" />
                            <span>Leave Group</span>
                          </div>
                          <span className="text-sm opacity-75">You will no longer be a member</span>
                        </button>
                      )}
                      
                      {/* Delete Group button - only for owner */}
                      {isConversationOwner(activeConversation?.id) && (
                        <button
                          onClick={showDeleteGroupConfirmation}
                          className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors duration-300 text-red-700 font-medium animate-pulse-glow"
                        >
                          <div className="flex items-center gap-3">
                            <FiTrash2 className="w-5 h-5" />
                            <span>Delete Group</span>
                          </div>
                          <span className="text-sm opacity-75">Permanently delete this group</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 h-full">
          {/* Conversation List - Red Themed */}
          <div className="w-full md:w-96 lg:w-80 xl:w-96 border-r border-red-200 bg-gradient-to-b from-white to-red-50/30 overflow-y-auto h-full">
            <div className="sticky top-0 bg-gradient-to-b from-white to-red-50/70 p-6 border-b border-red-100 z-10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="animate-slide-in">
                  <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                  <div className="flex items-center gap-2 mt-2">
                    {connectionStatus === 'connecting' ? (
                      <div className="flex items-center gap-2">
                        <LoadingAnimation type="dots" size="small" />
                        <span className="text-sm text-red-600/70 animate-pulse-slow">
                          Connecting...
                        </span>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        connectionStatus === 'connected' 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 animate-pulse-glow' 
                          : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800'
                      }`}>
                        {connectionStatus === 'connected' ? 
                          <FiWifi className="w-4 h-4" /> : 
                          <FiWifiOff className="w-4 h-4" />
                        }
                        {connectionStatus === 'connected' ? 'Live' : 'Offline'}
                      </span>
                    )}
                    <span className="text-sm text-red-600/70">
                      • {onlineUsers.size} online
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 animate-slide-in" style={{ animationDelay: '100ms' }}>
                  <button
                    onClick={handleStartNewGroupChat}
                    className={`p-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:shadow-xl transition-all duration-300 shadow-lg hover:scale-105 animate-pulse-glow ${
                      !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={isAdmin ? "New group chat" : "Only admins can create groups"}
                    disabled={!isAdmin}
                  >
                    <FiUsers className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleStartNewChat}
                    className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-xl transition-all duration-300 shadow-lg hover:scale-105 animate-pulse-glow"
                    title="New direct message"
                  >
                    <FiUserPlus className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* All Workspace Members List - Left Sidebar */}
              <div className="mb-6 animate-slide-up">
                <h3 className="font-bold text-gray-900 text-lg mb-4">
                  All Members {allMembers.length > 0 ? `(${allMembers.length})` : ''}
                </h3>
                {allMembers.length === 0 ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse-slow" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="flex items-center gap-3 p-3 rounded-xl">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
                            <div className="h-2 w-16 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 stagger">
                    {allMembers.map((member, index) => {
                      const isOnline = isUserOnline(member.user_id);
                      const isCurrentUser = member.user_id === currentUser?.id;
                      
                      return (
                        <div 
                          key={member.user_id}
                          className={`flex items-center gap-3 p-3 rounded-xl ${
                            isCurrentUser 
                              ? 'bg-gradient-to-r from-red-50 to-pink-50 animate-pulse-glow' 
                              : 'hover:bg-red-50'
                          }`}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold">
                                {member.avatar}
                              </span>
                            </div>
                            <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              isOnline ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-400'
                            }`}></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {member.name}
                                {isCurrentUser && ' (You)'}
                              </p>
                              {isOnline && (
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full animate-pulse-slow">
                                  Online
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Conversations List */}
            {renderConversationList()}
          </div>

          {/* Chat Messages Area */}
          {activeConversation ? (
            <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-red-50/20 to-white animate-slide-in">
              <div className="sticky top-0 bg-gradient-to-b from-white to-red-50/70 p-4 lg:p-6 border-b border-red-200 shadow-sm z-10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 lg:gap-4">
                    {isLoading.messages ? (
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-r from-red-100 to-pink-100 shimmer animate-pulse-slow"></div>
                        <div className="space-y-2">
                          <div className="h-6 w-32 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
                          <div className="h-4 w-24 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 ${
                          activeConversation?.is_group
                            ? 'bg-gradient-to-br from-pink-500 to-rose-600'
                            : 'bg-gradient-to-br from-red-500 to-pink-600'
                        }`}>
                          {activeConversation?.is_group ? (
                            <FiUsers className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                          ) : (
                            <span className="text-white font-bold text-xl lg:text-2xl">
                              {getOtherMemberName(activeConversation)?.charAt(0).toUpperCase() || "T"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-bold text-gray-900 text-lg lg:text-2xl truncate">
                            {getOtherMemberName(activeConversation)}
                          </h2>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {activeConversation?.is_group ? (
                              <div className="flex items-center gap-2">
                                <span className="text-red-600/70 text-sm lg:text-base">
                                  Group • {getConversationMembers(activeConversation.id).length} members
                                </span>
                                {conversationOwner[activeConversation.id] && (
                                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                    Owner: {conversationOwner[activeConversation.id]?.name}
                                  </span>
                                )}
                                <button
                                  onClick={handleOpenGroupSettings}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors duration-300"
                                  title="Group settings"
                                >
                                  <FiSettings className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-red-600/70 text-sm lg:text-base">
                                  Direct message
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  conversationOtherMembers[activeConversation.id] && isUserOnline(conversationOtherMembers[activeConversation.id].user_id)
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 animate-pulse-slow'
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  {conversationOtherMembers[activeConversation.id] && isUserOnline(conversationOtherMembers[activeConversation.id].user_id) ? 'Online' : 'Offline'}
                                </span>
                              </div>
                            )}
                            {getTypingUsersText() && (
                              <span className="text-red-600 font-medium text-sm animate-pulse flex items-center gap-1">
                                <div className="flex gap-1">
                                  <span className="w-2 h-2 bg-red-600 rounded-full animate-typing-dot"></span>
                                  <span className="w-2 h-2 bg-red-600 rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></span>
                                  <span className="w-2 h-2 bg-red-600 rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                                {getTypingUsersText()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {activeConversation?.is_group && (
                    <button
                      onClick={handleOpenGroupSettings}
                      className="p-2.5 hover:bg-red-50 rounded-xl transition-colors duration-300"
                      title="Group settings"
                    >
                      <FiSettings className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              {renderMessageArea()}

              {/* Message Input with Loading State */}
              <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white to-red-50/70 p-4 lg:p-6 border-t border-red-200 shadow-lg backdrop-blur-sm animate-slide-up">
                {getTypingUsersText() && (
                  <div className="mb-3 lg:mb-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl animate-slide-in">
                    <LoadingAnimation type="dots" />
                    <span className="font-medium text-sm lg:text-base animate-wave">
                      {getTypingUsersText()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 lg:gap-4">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder={`Message ${getOtherMemberName(activeConversation)}...`}
                    className="flex-1 px-4 lg:px-6 py-3 lg:py-4 border border-red-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm lg:text-base bg-white placeholder-red-300 transition-all-300"
                    disabled={messageLoading || isLoading.messages}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || messageLoading || isLoading.messages}
                    className="p-3 lg:p-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl lg:rounded-2xl hover:shadow-lg transition-all-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    {messageLoading ? (
                      <LoadingAnimation type="spinner" size="small" className="text-white" />
                    ) : (
                      <FiSend className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white to-red-50 animate-fade-in">
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center shadow-2xl animate-float">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 animate-ping-slow"></div>
                  <FiMessageSquare className="w-16 h-16 text-red-500 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-text-slide-up" style={{animationDelay: '0.1s'}}>Select a conversation</h3>
                <p className="text-red-600/70 text-lg mb-8 max-w-md animate-text-slide-up" style={{animationDelay: '0.2s'}}>
                  Choose a chat from the sidebar or start a new conversation
                </p>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleStartNewChat}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 justify-center animate-slide-up"
                    style={{ animationDelay: '300ms' }}
                  >
                    <FiUserPlus className="w-6 h-6" />
                    Start Direct Message
                  </button>
                  <button
                    onClick={handleStartNewGroupChat}
                    disabled={!isAdmin}
                    className={`px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 justify-center animate-slide-up ${
                      !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{ animationDelay: '400ms' }}
                  >
                    <FiUsers className="w-6 h-6" />
                    {isAdmin ? 'Create Group Chat' : 'Only Admins Can Create Groups'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 h-full">
          {activeConversation ? (
            <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-red-50/20 to-white animate-slide-in">
              <div className="sticky top-0 bg-white p-4 border-b border-red-200 shadow-sm z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors duration-300"
                    >
                      <FiChevronLeft className="w-6 h-6 text-red-600" />
                    </button>
                    <div className="flex items-center gap-3">
                      {isLoading.messages ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-100 to-pink-100 shimmer animate-pulse-slow"></div>
                          <div className="space-y-2">
                            <div className="h-5 w-24 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
                            <div className="h-3 w-16 rounded-full bg-gradient-to-r from-red-100 to-pink-100 shimmer"></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                            activeConversation?.is_group
                              ? 'bg-gradient-to-br from-pink-500 to-rose-600'
                              : 'bg-gradient-to-br from-red-500 to-pink-600'
                          }`}>
                            {activeConversation?.is_group ? (
                              <FiUsers className="w-6 h-6 text-white" />
                            ) : (
                              <span className="text-white font-bold text-xl">
                                {getOtherMemberName(activeConversation)?.charAt(0).toUpperCase() || "T"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-gray-900 text-lg truncate">
                              {getOtherMemberName(activeConversation)}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                              {activeConversation?.is_group ? (
                                <span className="text-red-600/70 text-sm">
                                  {getConversationMembers(activeConversation.id).length} members
                                </span>
                              ) : (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  conversationOtherMembers[activeConversation.id] && isUserOnline(conversationOtherMembers[activeConversation.id].user_id)
                                    ? 'bg-green-100 text-green-800 animate-pulse-slow'
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  {conversationOtherMembers[activeConversation.id] && isUserOnline(conversationOtherMembers[activeConversation.id].user_id) ? 'Online' : 'Offline'}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {activeConversation?.is_group && (
                    <button
                      onClick={handleOpenGroupSettings}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors duration-300"
                    >
                      <FiSettings className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {isLoading.messages ? (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="stagger space-y-4">
                    <LoadingSkeleton type="message" count={3} />
                    <div className="text-center py-8">
                      <LoadingAnimation type="dots" className="mx-auto" />
                      <p className="text-red-600/70 mt-4 text-sm animate-pulse-slow">
                        Loading messages...
                      </p>
                    </div>
                    <LoadingSkeleton type="message" count={2} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length > 0 ? (
                    <div className="space-y-4 stagger">
                      {messages.map((message, index) => {
                        const isCurrentUser = message.sender_id === currentUser?.id;
                        const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
                        const senderName = message.sender?.name || "Unknown User";
                        
                        return (
                          <div
                            key={message.id || message.temp_id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-6' : 'mt-2'}`}
                          >
                            <div className={`max-w-[85%] ${isCurrentUser ? 'ml-auto' : ''}`}>
                              {!isCurrentUser && showAvatar && (
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-sm">
                                      {senderName?.charAt(0).toUpperCase() || "U"}
                                    </span>
                                  </div>
                                  <span className="font-bold text-gray-900 text-sm">
                                    {senderName}
                                  </span>
                                </div>
                              )}

                              <div className={`relative group rounded-2xl px-4 py-3 ${
                                isCurrentUser
                                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-br-none shadow-lg'
                                  : 'bg-white border border-red-200 rounded-bl-none shadow-sm'
                              } ${message.id ? '' : 'opacity-70'}`}>
                                <p className="break-words text-sm">{message.content}</p>
                                <div className={`flex items-center justify-end gap-2 mt-2 ${
                                  isCurrentUser ? 'text-red-200' : 'text-red-600/70'
                                }`}>
                                  <span className="text-xs">
                                    {new Date(message.created_at + 'Z').toLocaleString('en-PK', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
                                      timeZone: 'Asia/Karachi'
                                    })}
                                  </span>
                                  {isCurrentUser && message.read_by && message.read_by.length > 1 && (
                                    <FiCheckCircle className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center animate-float">
                        <FiMessageSquare className="w-12 h-12 text-red-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-red-600/70 text-base">
                        Start the conversation
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              <div className="sticky bottom-0 bg-white p-4 border-t border-red-200 shadow-lg">
                <div className="flex items-center gap-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder={`Message...`}
                    className="flex-1 px-4 py-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm placeholder-red-300"
                    disabled={messageLoading || isLoading.messages}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || messageLoading || isLoading.messages}
                    className="p-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {messageLoading ? (
                      <LoadingAnimation type="spinner" size="small" className="text-white" />
                    ) : (
                      <FiSend className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {/* Same conversation list as desktop */}
              <div className="w-full border-r border-red-200 bg-gradient-to-b from-white to-red-50/30 overflow-y-auto h-full">
                <div className="sticky top-0 bg-white p-6 border-b border-red-100 z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                      <div className="flex items-center gap-2 mt-2">
                        {connectionStatus === 'connecting' ? (
                          <div className="flex items-center gap-2">
                            <LoadingAnimation type="dots" size="small" />
                            <span className="text-sm text-red-600/70 animate-pulse-slow">
                              Connecting...
                            </span>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            connectionStatus === 'connected' 
                              ? 'bg-green-100 text-green-800 animate-pulse-glow' 
                              : 'bg-amber-100 text-amber-800 animate-pulse-slow'
                          }`}>
                            {connectionStatus === 'connected' ? 
                              <FiWifi className="w-4 h-4" /> : 
                              <FiWifiOff className="w-4 h-4" />
                            }
                            {connectionStatus === 'connected' ? 'Live' : 'Connecting'}
                          </span>
                        )}
                        <span className="text-sm text-red-600/70">
                          • {onlineUsers.size} online
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleStartNewGroupChat}
                        disabled={!isAdmin}
                        className={`p-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:shadow-xl transition-all duration-300 ${
                          !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <FiUsers className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleStartNewChat}
                        className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-xl transition-all duration-300"
                      >
                        <FiUserPlus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile: All Members List */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">All Members</h3>
                    <div className="flex overflow-x-auto pb-4 space-x-3">
                      {allMembers.slice(0, 5).map((member, index) => {
                        const isOnline = isUserOnline(member.user_id);
                        const isCurrentUser = member.user_id === currentUser?.id;
                        
                        return (
                          <div 
                            key={member.user_id}
                            className="flex-shrink-0 w-16 text-center animate-slide-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="relative mx-auto">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mx-auto shadow-md">
                                <span className="text-white font-bold">
                                  {member.avatar}
                                </span>
                              </div>
                              <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                isOnline ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-400'
                              }`}></span>
                            </div>
                            <p className="text-xs font-medium text-gray-900 truncate mt-2">
                              {isCurrentUser ? 'You' : member.name.split(' ')[0]}
                            </p>
                          </div>
                        );
                      })}
                      {allMembers.length > 5 && (
                        <div className="flex-shrink-0 w-16 text-center animate-slide-in" style={{ animationDelay: '500ms' }}>
                          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto">
                            <span className="text-red-600 font-bold text-sm">
                              +{allMembers.length - 5}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-900 truncate mt-2">
                            More
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {renderConversationList()}
              </div>
            </div>
          )}
        </div>

        {/* Error Toast with Red Theme */}
        {error && (
          <div className="fixed bottom-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(239,68,68,0.3)] p-4 max-w-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FiAlertCircle className="w-5 h-5 text-red-600 animate-pulse-slow relative z-10" />
                  <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping-slow"></div>
                </div>
                <p className="text-red-700 font-medium flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded-lg"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
