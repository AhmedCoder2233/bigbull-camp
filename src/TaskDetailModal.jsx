import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { 
  FiX, 
  FiUser, 
  FiCalendar, 
  FiMessageSquare, 
  FiPaperclip, 
  FiDownload,
  FiTrash2,
  FiEdit2,
  FiSend,
  FiFile,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader
} from "react-icons/fi";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export default function TaskDetailPanel({ 
  task, 
  isOpen, 
  onClose, 
  currentUserId, 
  userRole, 
  workspaceId 
}) {
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [userName, setUserName] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);
  const [assignedUserName, setAssignedUserName] = useState("");
  
  // Debug logging
  useEffect(() => {
    console.log("TaskDetailPanel - Current User ID:", currentUserId);
    console.log("TaskDetailPanel - Task:", task);
    console.log("TaskDetailPanel - User Role:", userRole);
    console.log("TaskDetailPanel - Workspace ID:", workspaceId);
  }, [currentUserId, task, userRole, workspaceId]);

  // Get current user's name from profiles table
  useEffect(() => {
    const fetchCurrentUserName = async () => {
      console.log("Fetching user name for ID:", currentUserId);
      
      if (!currentUserId) {
        console.log("No currentUserId provided, setting to Guest");
        setUserName("Guest");
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("id", currentUserId)
          .single();
        
        if (error) {
          console.error("Error fetching user profile:", error);
          setUserName("User");
          return;
        }
        
        if (data) {
          console.log("User profile found:", data);
          setUserName(data.name || data.email?.split('@')[0] || "User");
        } else {
          console.log("No profile data found");
          setUserName("User");
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("User");
      }
    };
    
    fetchCurrentUserName();
  }, [currentUserId]);

  // Fetch task details and comments
  useEffect(() => {
    if (!task) return;

    const fetchTaskDetails = async () => {
      console.log("Fetching details for task:", task.id);
      setEditedDescription(task.description || "");
      setError(null);
      
      // Fetch attachments
      try {
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from("task_attachments")
          .select("*")
          .eq("task_id", task.id)
          .order("created_at", { ascending: false });

        if (attachmentsError) {
          console.error("Error fetching attachments:", attachmentsError);
        } else {
          console.log("Attachments fetched:", attachmentsData?.length || 0);
          setAttachments(attachmentsData || []);
        }
      } catch (err) {
        console.error("Error in attachments fetch:", err);
      }

      // Fetch comments
      await fetchComments();
      
      // Fetch assigned user name
      if (task.assigned_to) {
        await fetchAssignedUserName();
      } else {
        setAssignedUserName("Unassigned");
      }
    };

    fetchTaskDetails();
  }, [task]);

  // Function to fetch comments with user names
  const fetchComments = async () => {
    if (!task) return;
    
    try {
      const { data: commentsData, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        setError("Failed to load comments");
        return;
      }

      console.log("Comments fetched:", commentsData?.length || 0, "comments");

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id).filter(Boolean))];
        console.log("User IDs in comments:", userIds);
        
        let userProfiles = {};
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, name, email")
            .in("id", userIds);

          console.log("Profiles fetched for comments:", profilesData);

          if (profilesData) {
            profilesData.forEach(profile => {
              userProfiles[profile.id] = profile.name || profile.email?.split('@')[0] || "User";
            });
          }
        }

        const commentsWithUsers = commentsData.map(comment => ({
          ...comment,
          user_name: comment.user_id ? 
            (userProfiles[comment.user_id] || "User") : 
            "Anonymous"
        }));

        setComments(commentsWithUsers);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments");
      setComments([]);
    }
  };

  // Function to fetch assigned user name
  const fetchAssignedUserName = async () => {
    if (!task?.assigned_to) {
      setAssignedUserName("Unassigned");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", task.assigned_to)
        .single();
      
      if (error) {
        console.error("Error fetching assigned user:", error);
        setAssignedUserName("User");
        return;
      }
      
      if (data) {
        setAssignedUserName(data.name || data.email?.split('@')[0] || "User");
      } else {
        setAssignedUserName("User");
      }
    } catch (error) {
      console.error("Error fetching assigned user:", error);
      setAssignedUserName("User");
    }
  };

  const handleAddComment = async () => {
    console.log("handleAddComment called");
    console.log("newComment:", newComment);
    console.log("currentUserId:", currentUserId);
    console.log("task:", task);
    
    setError(null);
    
    // Check for empty comment
    if (!newComment.trim()) {
      setError("Please enter a comment");
      return;
    }
    
    // Check if user is authenticated
    if (!currentUserId) {
      console.error("currentUserId is null/undefined");
      setError("You must be logged in to comment. Please refresh the page or log in again.");
      return;
    }
    
    // Check if task exists
    if (!task) {
      setError("Task not found");
      return;
    }

    setIsPosting(true);
    
    const commentText = newComment.trim();
    
    try {
      console.log("Adding comment to task:", task.id);
      console.log("User ID:", currentUserId);
      console.log("Comment text:", commentText);

      const { data: comment, error: insertError } = await supabase
        .from("task_comments")
        .insert({
          id: uuidv4(),
          task_id: task.id,
          user_id: currentUserId,
          comment: commentText,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error details:", insertError);
        
        if (insertError.code === '42501') {
          setError("Permission denied. You may not have permission to add comments.");
        } else if (insertError.code === '23503') {
          setError("Invalid task or user reference.");
        } else if (insertError.code === '23505') {
          setError("Duplicate comment ID. Please try again.");
        } else {
          setError(`Failed to add comment: ${insertError.message}`);
        }
        
        setIsPosting(false);
        return;
      }

      console.log("Comment inserted successfully:", comment);

      const newCommentWithUser = {
        ...comment,
        user_name: userName
      };

      setComments(prev => [...prev, newCommentWithUser]);
      setNewComment("");
      
      try {
        await supabase
          .from("tasks")
          .update({ 
            updated_at: new Date().toISOString()
          })
          .eq("id", task.id);
      } catch (updateError) {
        console.error("Error updating task timestamp:", updateError);
      }

    } catch (error) {
      console.error("Unexpected error adding comment:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    if (error && error.includes("Please enter a comment")) {
      setError(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !task) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${task.id}_${Date.now()}.${fileExt}`;
      const filePath = `task-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: attachment, error: dbError } = await supabase
        .from("task_attachments")
        .insert({
          task_id: task.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: currentUserId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setAttachments(prev => [...prev, attachment]);
      
      await supabase
        .from("tasks")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", task.id);

    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm("Delete this attachment?")) return;

    try {
      const attachment = attachments.find(a => a.id === attachmentId);
      
      if (attachment?.file_path) {
        await supabase.storage
          .from('task-attachments')
          .remove([attachment.file_path]);
      }

      await supabase
        .from("task_attachments")
        .delete()
        .eq("id", attachmentId);

      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      
      await supabase
        .from("tasks")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", task.id);

    } catch (error) {
      console.error("Error deleting attachment:", error);
      alert("Failed to delete attachment");
    }
  };

  const handleUpdateDescription = async () => {
    if (!task) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          description: editedDescription,
          updated_at: new Date().toISOString()
        })
        .eq("id", task.id);

      if (error) throw error;

      task.description = editedDescription;
      setEditing(false);
      alert("Description updated successfully!");
    } catch (error) {
      console.error("Error updating description:", error);
      alert("Failed to update description");
    }
  };

  if (!task) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 truncate">{task.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                task.status === 'at_risk' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                Created: {format(new Date(task.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-60px)] overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs">
            <p className="font-medium text-blue-800 mb-1">User Status:</p>
            <p>Logged In: <span className="font-medium">{currentUserId ? "✅ Yes" : "❌ No"}</span></p>
            <p>User ID: <span className="font-mono">{currentUserId ? currentUserId.slice(0, 8) + "..." : "null"}</span></p>
            <p>Display Name: <span className="font-medium">{userName}</span></p>
            <p>Role: <span className="font-medium">{userRole}</span></p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Comments Section - Moved to top */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>Comments</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {comments.length}
              </span>
            </h3>
            
            <div className="mb-6">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-900">{userName}</span>
                    {!currentUserId && (
                      <span className="text-xs text-red-600 ml-2">
                        (Please log in to comment)
                      </span>
                    )}
                  </div>
                  <textarea
                    value={newComment}
                    onChange={handleCommentChange}
                    onKeyDown={handleKeyDown}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none disabled:opacity-50"
                    placeholder={currentUserId ? "Write a comment..." : "Please log in to comment"}
                    rows="3"
                    disabled={isPosting || !currentUserId}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {isPosting ? (
                        <span className="flex items-center gap-2">
                          <FiLoader className="w-3 h-3 animate-spin" />
                          Posting comment...
                        </span>
                      ) : currentUserId ? (
                        "Press Ctrl+Enter to send"
                      ) : (
                        "Log in to enable commenting"
                      )}
                    </p>
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isPosting || !currentUserId}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 transition-colors"
                    >
                      {isPosting ? (
                        <>
                          <FiLoader className="w-4 h-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <FiSend className="w-4 h-4" />
                          Post Comment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No comments yet</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to comment</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 text-sm font-medium">
                          {(comment.user_name || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900">
                              {comment.user_name || "User"}
                            </span>
                            {comment.user_id === currentUserId && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiMessageSquare className="w-5 h-5" />
                Description
              </h3>
              {(userRole === "admin" || task.created_by === currentUserId) && (
                <button
                  onClick={() => {
                    if (!editing) {
                      setEditedDescription(task.description || "");
                    }
                    setEditing(!editing);
                  }}
                  className="text-sm flex items-center gap-1 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                  disabled={isPosting}
                >
                  <FiEdit2 className="w-4 h-4" />
                  {editing ? "Cancel" : "Edit"}
                </button>
              )}
            </div>

            {editing ? (
              <div>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                  placeholder="Enter task description..."
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleUpdateDescription}
                    disabled={!editedDescription.trim() || isPosting}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50"
                    disabled={isPosting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description || (
                  <span className="text-gray-400 italic">No description provided</span>
                )}
              </p>
            )}
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FiUser className="w-4 h-4" />
                <span className="text-sm font-medium">Assigned To</span>
              </div>
              <p className="font-semibold text-gray-900 truncate">
                {assignedUserName}
              </p>
              {task.assigned_to && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  ID: {task.assigned_to.slice(0, 8)}...
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FiCalendar className="w-4 h-4" />
                <span className="text-sm font-medium">Due Date</span>
              </div>
              <p className="font-semibold text-gray-900">
                {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : (
                  <span className="text-gray-400">No due date</span>
                )}
              </p>
              {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed' && (
                <p className="text-xs text-red-600 mt-1">Overdue</p>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiPaperclip className="w-5 h-5" />
                Attachments ({attachments.length})
              </h3>
              <label className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <FiFile className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading || isPosting || !currentUserId}
                />
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <FiLoader className="w-3 h-3 animate-spin" />
                    Uploading...
                  </span>
                ) : "Add File"}
              </label>
            </div>

            {attachments.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <FiFile className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No attachments yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload files to share with your team</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FiFile className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate text-gray-900">
                          {attachment.file_name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{(attachment.file_size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>{attachment.file_type || "File"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownload(attachment)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                        disabled={isPosting}
                      >
                        <FiDownload className="w-4 h-4 text-gray-600" />
                      </button>
                      {(userRole === "admin" || attachment.uploaded_by === currentUserId) && (
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          disabled={isPosting}
                        >
                          <FiTrash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}