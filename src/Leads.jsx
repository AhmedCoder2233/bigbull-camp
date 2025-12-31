// pages/Leads.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import {
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiUser,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiX,
  FiChevronDown,
  FiCheck,
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiGlobe,
  FiMoreVertical
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Leads() {
  const { profile } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignModal, setAssignModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const assignDropdownRef = useRef(null);
  const dropdownRefs = useRef({});
  
  const isAhmedMemon = profile?.email === "sot@bigbulldigital.com";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(event.target)) {
        setAssignDropdownOpen(false);
      }
      
      // Close action dropdown if clicked outside
      if (activeDropdown !== null) {
        const dropdownElement = dropdownRefs.current[activeDropdown];
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          setActiveDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  useEffect(() => {
    fetchLeads();
    fetchAllUsers();
  }, []);

  const showToast = (message, type = 'info') => {
    const toastOptions = {
      position: window.innerWidth < 768 ? "bottom-center" : "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      default:
        toast.info(message, toastOptions);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      const leadsWithAssignments = await Promise.all(
        (leadsData || []).map(async (lead) => {
          const { data: assignments, error: assignmentsError } = await supabase
            .from('lead_assignments')
            .select('user_id')
            .eq('lead_id', lead.id);

          if (assignmentsError) {
            console.error('Error fetching assignments:', assignmentsError);
            return { ...lead, assigned_to: [], assigned_users: [] };
          }

          const assignedUserIds = assignments?.map(a => a.user_id) || [];
          
          let assignedUsers = [];
          if (assignedUserIds.length > 0) {
            const { data: usersData } = await supabase
              .from('profiles')
              .select('id, name, email')
              .in('id', assignedUserIds);
            
            assignedUsers = usersData || [];
          }

          return {
            ...lead,
            assigned_to: assignedUserIds,
            assigned_users: assignedUsers,
            assigned_to_names: assignedUsers.map(u => u.name || u.email).join(', ')
          };
        })
      );

      setLeads(leadsWithAssignments);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('Failed to load leads. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load team members.', 'error');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);

    const matchesStatus = 
      statusFilter === "all" || 
      lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const canEditDeleteLead = (lead) => {
    if (isAhmedMemon) return true;
    if (!lead.assigned_to || !Array.isArray(lead.assigned_to)) return false;
    return lead.assigned_to.includes(profile?.id);
  };

  const isAssignedToCurrentUser = (lead) => {
    if (!lead.assigned_to || !Array.isArray(lead.assigned_to)) return false;
    return lead.assigned_to.includes(profile?.id);
  };

  const handleDeleteLead = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    
    if (!canEditDeleteLead(lead)) {
      showToast("You don't have permission to delete this lead. Please contact Ahmed Memon or the assigned team member.", 'warning');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this lead? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const { error: assignmentError } = await supabase
        .from('lead_assignments')
        .delete()
        .eq('lead_id', leadId);

      if (assignmentError) throw assignmentError;

      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(leads.filter(lead => lead.id !== leadId));
      showToast('✅ Lead deleted successfully!', 'success');
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast('❌ Failed to delete lead. Please try again.', 'error');
    }
  };

  const handleAssignLead = async () => {
    if (!assignModal || selectedUsers.length === 0) {
      showToast('Please select at least one team member to assign', 'warning');
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('lead_assignments')
        .delete()
        .eq('lead_id', assignModal.id);

      if (deleteError) throw deleteError;

      const assignments = selectedUsers.map(userId => ({
        lead_id: assignModal.id,
        user_id: userId
      }));

      const { error: insertError } = await supabase
        .from('lead_assignments')
        .insert(assignments);

      if (insertError) throw insertError;

      const assignedUsers = allUsers.filter(user => selectedUsers.includes(user.id));
      const assignedToNames = assignedUsers.map(u => u.name || u.email).join(', ');

      setLeads(leads.map(lead => 
        lead.id === assignModal.id 
          ? { 
              ...lead, 
              assigned_to: selectedUsers,
              assigned_users: assignedUsers,
              assigned_to_names: assignedToNames
            }
          : lead
      ));

      setAssignModal(null);
      setSelectedUsers([]);
      
      const userCount = selectedUsers.length;
      const message = userCount === 1 
        ? '✅ Lead assigned to 1 team member successfully!' 
        : `✅ Lead assigned to ${userCount} team members successfully!`;
      
      showToast(message, 'success');
    } catch (error) {
      console.error('Error assigning lead:', error);
      showToast('❌ Failed to assign lead. Please try again.', 'error');
    }
  };

  const handleUnassignLead = async (leadId) => {
    if (!isAhmedMemon) {
      showToast("Only Ahmed Memon can unassign leads", 'warning');
      return;
    }

    try {
      const { error } = await supabase
        .from('lead_assignments')
        .delete()
        .eq('lead_id', leadId);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === leadId 
          ? { 
              ...lead, 
              assigned_to: [],
              assigned_users: [],
              assigned_to_names: 'Not assigned'
            }
          : lead
      ));

      showToast('✅ All team members unassigned from lead successfully!', 'success');
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error unassigning lead:', error);
      showToast('❌ Failed to unassign lead. Please try again.', 'error');
    }
  };

  const handleEditLead = async () => {
    if (!editModal) return;
    
    const originalLead = leads.find(l => l.id === editModal.id);
    
    if (!canEditDeleteLead(originalLead)) {
      showToast("You don't have permission to edit this lead. Please contact Ahmed Memon or the assigned team member.", 'warning');
      return;
    }

    if (!editModal.name?.trim() || !editModal.email?.trim()) {
      showToast('Name and email are required fields', 'warning');
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name: editModal.name.trim(),
          email: editModal.email.trim(),
          phone: editModal.phone?.trim() || null,
          company: editModal.company?.trim() || null,
          status: editModal.status,
          notes: editModal.notes?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editModal.id);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === editModal.id 
          ? { ...lead, ...editModal }
          : lead
      ));

      setEditModal(null);
      showToast('✅ Lead updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating lead:', error);
      showToast('❌ Failed to update lead. Please try again.', 'error');
    }
  };

  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-purple-100 text-purple-800",
    qualified: "bg-amber-100 text-amber-800",
    proposal: "bg-indigo-100 text-indigo-800",
    negotiation: "bg-yellow-100 text-yellow-800",
    converted: "bg-emerald-100 text-emerald-800",
    lost: "bg-red-100 text-red-800"
  };

  const statusIcons = {
    new: "🆕",
    contacted: "📞",
    qualified: "⭐",
    proposal: "📄",
    negotiation: "🤝",
    converted: "✅",
    lost: "❌"
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: window.innerWidth < 640 ? undefined : 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length
  };

  const shouldHideInfo = (lead) => {
    if (isAhmedMemon) return false;
    return !isAssignedToCurrentUser(lead);
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    return name.charAt(0) + '•••@' + domain;
  };

  const maskPhone = (phone) => {
    if (!phone) return '';
    return phone.slice(0, 3) + '•••••••';
  };

  const maskName = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0].charAt(0) + '••• ' + parts[1].charAt(0) + '•••';
    }
    return name.charAt(0) + '•••';
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const isUserInAssignedList = (lead, userId) => {
    if (!lead.assigned_to || !Array.isArray(lead.assigned_to)) return false;
    return lead.assigned_to.includes(userId);
  };

  const getAssignedUserCount = (lead) => {
    if (!lead.assigned_to || !Array.isArray(lead.assigned_to)) return 0;
    return lead.assigned_to.length;
  };

  const toggleDropdown = (leadId) => {
    setActiveDropdown(activeDropdown === leadId ? null : leadId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6 sm:pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <ToastContainer />
        
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Leads Management
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
            {isAhmedMemon 
              ? "Manage all leads in the system. You have full access to edit, delete, and assign leads."
              : "View all leads in the system. You can only edit/delete leads assigned to you."
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              {leadStats.total}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Leads</div>
          </div>
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-0.5 sm:mb-1">
              {leadStats.new}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">New Leads</div>
          </div>
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 mb-0.5 sm:mb-1">
              {leadStats.converted}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Converted</div>
          </div>
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-0.5 sm:mb-1">
              {leadStats.lost}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Lost</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                placeholder="Search by name, email, company..."
              />
            </div>
            
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1 sm:flex-none sm:w-48">
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                
                <button
                  onClick={fetchLeads}
                  className="p-2 sm:p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Refresh leads"
                >
                  <FiRefreshCw className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <Link
                to="/lead-form"
                className="px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <FiUser className="w-4 h-4" />
                <span>Add Lead</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Leads Table/Cards */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600">Loading leads...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FiUserX className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-600">No leads found</p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const hideInfo = shouldHideInfo(lead);
                    const canEdit = canEditDeleteLead(lead);
                    const isAssignedToMe = isAssignedToCurrentUser(lead);
                    const assignedCount = getAssignedUserCount(lead);
                    
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold">
                                {lead.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {hideInfo ? maskName(lead.name) : lead.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {hideInfo ? '•••••••••' : (lead.company || 'No company')}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 xl:px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              {hideInfo ? (
                                <span className="text-gray-600 truncate">{maskEmail(lead.email)}</span>
                              ) : (
                                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800 truncate">
                                  {lead.email}
                                </a>
                              )}
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                {hideInfo ? (
                                  <span className="text-gray-600">{maskPhone(lead.phone)}</span>
                                ) : (
                                  <a href={`tel:${lead.phone}`} className="text-gray-600 hover:text-gray-800">
                                    {lead.phone}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 xl:px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                            <span>{statusIcons[lead.status]}</span>
                            <span>{lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}</span>
                          </span>
                        </td>

                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <FiGlobe className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{lead.source}</span>
                          </div>
                        </td>

                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(lead.created_at)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {isAhmedMemon || isAssignedToCurrentUser(lead) 
                              ? `by ${lead.created_by_name}` 
                              : 'by •••'}
                          </div>
                        </td>

                        <td className="px-4 xl:px-6 py-4">
                          <div className="text-sm">
                            {lead.assigned_to_names && lead.assigned_to_names !== 'Not assigned' ? (
                              <div className="space-y-1">
                                <div className={`font-medium ${isAssignedToMe ? 'text-green-600' : 'text-gray-900'} truncate`}>
                                  {lead.assigned_to_names}
                                  {isAssignedToMe && " (You)"}
                                </div>
                                {assignedCount > 1 && (
                                  <div className="text-xs text-gray-500">
                                    {assignedCount} team member{assignedCount > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">Not assigned</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewModal(lead)}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            
                            {canEdit && (
                              <>
                                <button
                                  onClick={() => setEditModal(lead)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
title="Edit"
>
<FiEdit2 className="w-4 h-4" />
</button>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {isAhmedMemon && (
                          <>
                            <button
                              onClick={() => {
                                setAssignModal(lead);
                                setSelectedUsers(Array.isArray(lead.assigned_to) ? lead.assigned_to : []);
                              }}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Assign"
                            >
                              <FiUsers className="w-4 h-4" />
                            </button>
                            
                            {assignedCount > 0 && (
                              <button
                                onClick={() => handleUnassignLead(lead.id)}
                                className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Unassign all"
                              >
                                <FiUserX className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm">Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <FiUserX className="w-12 h-12 text-gray-400" />
            <p className="text-gray-600">No leads found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeads.map((lead) => {
              const hideInfo = shouldHideInfo(lead);
              const canEdit = canEditDeleteLead(lead);
              const isAssignedToMe = isAssignedToCurrentUser(lead);
              const assignedCount = getAssignedUserCount(lead);
              
              return (
                <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {lead.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {hideInfo ? maskName(lead.name) : lead.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {hideInfo ? '•••••••••' : (lead.company || 'No company')}
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="relative" ref={el => dropdownRefs.current[lead.id] = el}>
                      <button
                        onClick={() => toggleDropdown(lead.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FiMoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeDropdown === lead.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                          <button
                            onClick={() => {
                              setViewModal(lead);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiEye className="w-4 h-4" />
                            View Details
                          </button>
                          
                          {canEdit && (
                            <>
                              <button
                                onClick={() => {
                                  setEditModal(lead);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <FiEdit2 className="w-4 h-4" />
                                Edit Lead
                              </button>
                              
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <FiTrash2 className="w-4 h-4" />
                                Delete Lead
                              </button>
                            </>
                          )}
                          
                          {isAhmedMemon && (
                            <>
                              <button
                                onClick={() => {
                                  setAssignModal(lead);
                                  setSelectedUsers(Array.isArray(lead.assigned_to) ? lead.assigned_to : []);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <FiUsers className="w-4 h-4" />
                                Assign Lead
                              </button>
                              
                              {assignedCount > 0 && (
                                <button
                                  onClick={() => handleUnassignLead(lead.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                                >
                                  <FiUserX className="w-4 h-4" />
                                  Unassign All
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                      <span>{statusIcons[lead.status]}</span>
                      <span>{lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}</span>
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <FiMail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {hideInfo ? (
                        <span className="text-gray-600 truncate">{maskEmail(lead.email)}</span>
                      ) : (
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800 truncate">
                          {lead.email}
                        </a>
                      )}
                    </div>
                    
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-xs">
                        <FiPhone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {hideInfo ? (
                          <span className="text-gray-600">{maskPhone(lead.phone)}</span>
                        ) : (
                          <a href={`tel:${lead.phone}`} className="text-gray-600 hover:text-gray-800">
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Source</div>
                      <div className="text-xs font-medium text-gray-900 truncate flex items-center gap-1">
                        <FiGlobe className="w-3 h-3 text-gray-400" />
                        {lead.source}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Created</div>
                      <div className="text-xs font-medium text-gray-900 flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        {formatDate(lead.created_at)}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-0.5">Assigned To</div>
                      <div className={`text-xs font-medium ${isAssignedToMe ? 'text-green-600' : 'text-gray-900'} truncate`}>
                        {lead.assigned_to_names || 'Not assigned'}
                        {isAssignedToMe && " (You)"}
                      </div>
                    </div>
                  </div>

                  {hideInfo && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
                      <p className="text-xs text-yellow-800 flex items-center gap-2">
                        <FiEyeOff className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Contact details hidden - not assigned to you</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    {/* Footer Info */}
    <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
      Showing {filteredLeads.length} of {leads.length} leads
      {searchTerm && ` • Filtered by: "${searchTerm}"`}
      {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
    </div>
  </div>

  {/* View Modal */}
  {viewModal && (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
      <div className="bg-white w-full max-w-[100vw] sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-none">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Lead Details</h3>
          <button
            onClick={() => setViewModal(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm sm:text-lg">
                {viewModal.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 truncate text-sm sm:text-base">
                {shouldHideInfo(viewModal) ? maskName(viewModal.name) : viewModal.name}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {shouldHideInfo(viewModal) ? '•••••••••' : (viewModal.company || 'No company')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="col-span-full sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <p className="text-sm text-gray-900 break-all">
                {shouldHideInfo(viewModal) ? (
                  <span className="text-gray-600">{maskEmail(viewModal.email)}</span>
                ) : (
                  <a href={`mailto:${viewModal.email}`} className="text-blue-600 hover:text-blue-800 break-all">
                    {viewModal.email}
                  </a>
                )}
              </p>
            </div>
            
            <div className="col-span-full sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
              <p className="text-sm text-gray-900 break-all">
                {shouldHideInfo(viewModal) ? (
                  <span className="text-gray-600">{maskPhone(viewModal.phone)}</span>
                ) : (
                  viewModal.phone ? (
                    <a href={`tel:${viewModal.phone}`} className="text-gray-600 hover:text-gray-800 break-all">
                      {viewModal.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )
                )}
              </p>
            </div>
            
            <div className="col-span-full sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <div className="w-fit">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[viewModal.status]}`}>
                  <span>{statusIcons[viewModal.status]}</span>
                  <span>{viewModal.status?.charAt(0).toUpperCase() + viewModal.status?.slice(1)}</span>
                </span>
              </div>
            </div>
            
            <div className="col-span-full sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Source</label>
              <p className="text-sm text-gray-900 flex items-center gap-1 truncate">
                <FiGlobe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{viewModal.source}</span>
              </p>
            </div>
            
            <div className="col-span-full sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Created</label>
              <p className="text-sm text-gray-900 flex items-center gap-1">
                <FiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{formatDate(viewModal.created_at)}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {isAhmedMemon || isAssignedToCurrentUser(viewModal) 
                  ? `by ${viewModal.created_by_name}` 
                  : 'by •••'}
              </p>
            </div>
            
            <div className="col-span-full sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Assigned To</label>
              <p className="text-sm text-gray-900 truncate">
                {viewModal.assigned_to_names || 'Not assigned'}
                {isAssignedToCurrentUser(viewModal) && " (You)"}
              </p>
            </div>
          </div>
          
          {viewModal.notes && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4" />
                Notes
              </label>
              <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                  {viewModal.notes}
                </p>
              </div>
            </div>
          )}
          
          {shouldHideInfo(viewModal) && (
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-xs sm:text-sm text-yellow-800 flex items-center gap-2">
                <FiEyeOff className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">This lead is assigned to another team member. Contact details are hidden.</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setViewModal(null)}
            className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
          >
            Close
          </button>
          {canEditDeleteLead(viewModal) && (
            <button
              onClick={() => {
                setViewModal(null);
                setEditModal(viewModal);
              }}
              className="w-full sm:flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm sm:text-base"
            >
              Edit Lead
            </button>
          )}
        </div>
      </div>
    </div>
  )}

  {/* Assign Modal */}
  {assignModal && (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
      <div className="bg-white w-full max-w-[100vw] sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto" ref={assignDropdownRef}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Assign Lead</h3>
          <button
            onClick={() => {
              setAssignModal(null);
              setSelectedUsers([]);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
          <p className="text-gray-600 mb-4 text-sm break-words">
            Assign <span className="font-semibold">"{assignModal.name}"</span> to team members
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Team Members ({selectedUsers.length} selected)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAssignDropdownOpen(!assignDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiUsers className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 text-sm truncate">
                    {selectedUsers.length === 0 
                      ? 'Select team members...' 
                      : `${selectedUsers.length} team member${selectedUsers.length !== 1 ? 's' : ''} selected`}
                  </span>
                </div>
                <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${assignDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {assignDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {allUsers.map(user => {
                    const isSelected = selectedUsers.includes(user.id);
                    const isCurrentlyAssigned = isUserInAssignedList(assignModal, user.id);
                    
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleUserSelection(user.id)}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                          isCurrentlyAssigned ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0) || user.email?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-medium text-gray-900 text-sm truncate">{user.name || 'No name'}</div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                          {isCurrentlyAssigned && (
                            <div className="text-xs text-blue-600 mt-0.5">Currently assigned</div>
                          )}
                        </div>
                        {isSelected && (
                          <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Selected Team Members:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(userId => {
                    const user = allUsers.find(u => u.id === userId);
                    return (
                      <div key={userId} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full max-w-full">
                        <span className="text-sm truncate">{user?.name || user?.email}</span>
                        <button
                          type="button"
                          onClick={() => toggleUserSelection(userId)}
                          className="text-blue-700 hover:text-blue-900 flex-shrink-0"
                          title="Remove"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => {
              setAssignModal(null);
              setSelectedUsers([]);
            }}
            className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignLead}
            disabled={selectedUsers.length === 0}
            className="w-full sm:flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
          >
            {selectedUsers.length === 0 
              ? 'Select Members' 
              : `Assign to ${selectedUsers.length}`}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Edit Modal */}
  {editModal && (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
      <div className="bg-white w-full max-w-[100vw] sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Edit Lead</h3>
          <button
            onClick={() => setEditModal(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={editModal.name}
              onChange={(e) => setEditModal({...editModal, name: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={editModal.email}
              onChange={(e) => setEditModal({...editModal, email: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="flex items-center gap-2">
              <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="tel"
                value={editModal.phone || ''}
                onChange={(e) => setEditModal({...editModal, phone: e.target.value})}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="+1234567890"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={editModal.company || ''}
              onChange={(e) => setEditModal({...editModal, company: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Company name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setEditModal({...editModal, status})}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium transition-colors ${
                    editModal.status === status 
                      ? statusColors[status] 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FiMessageSquare className="w-4 h-4" />
              Notes
            </label>
            <textarea
              value={editModal.notes || ''}
              onChange={(e) => setEditModal({...editModal, notes: e.target.value})}
              rows="3"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              placeholder="Add notes about this lead..."
            />
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setEditModal(null)}
            className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleEditLead}
            className="w-full sm:flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm sm:text-base"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
}
