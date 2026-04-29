import { useState, useEffect } from 'react';
import { 
  Megaphone, MessageSquare, ThumbsUp, CheckCheck, Send, Clock, X, Trash2, Users
} from 'lucide-react';

import { db } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import type { SystemUser, Role } from '../types/index';

// --- INTERFACES LOCALES ---
interface Announcement {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: string[]; // Array de IDs de usuarios que dieron like
  seenBy: string[]; // Array de IDs de usuarios que marcaron como visto
}

interface Comment {
  id?: string;
  announcementId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface NoticeBoardViewProps {
  onOpenMenu: () => void;
  currentUser?: SystemUser | null;
  activeRole?: Role | null;
  isSuperAdmin?: boolean;
}

export default function NoticeBoardView({ onOpenMenu, currentUser, isSuperAdmin }: NoticeBoardViewProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [usersList, setUsersList] = useState<SystemUser[]>([]); // Lista oficial de usuarios
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para crear nuevo post (Solo Admin)
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Estado para nuevos comentarios
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  // Mostrar u ocultar sección de comentarios por post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Descargamos posts, comentarios y usuarios del sistema al mismo tiempo
      const [postsSnap, commentsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'announcements')),
        getDocs(collection(db, 'announcement_comments')),
        getDocs(collection(db, 'system_users'))
      ]);
      
      const loadedPosts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
      loadedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const loadedComments = commentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
      loadedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const loadedUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as SystemUser));

      setAnnouncements(loadedPosts);
      setComments(loadedComments);
      setUsersList(loadedUsers);
    } catch (error) {
      console.error("Error fetching notice board data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para traducir IDs de usuarios a sus nombres reales
  const getUserNamesList = (userIds: string[]) => {
    if (!userIds || userIds.length === 0) return '';
    return userIds.map(id => {
      // Si el ID es el de respaldo del sistema
      if (id === 'system_admin') return 'Administrator';
      
      // Buscar en la base de datos de usuarios
      const user = usersList.find(u => u.id === id);
      return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    }).join(', ');
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    setIsSaving(true);
    try {
      const authorId = currentUser?.id || 'system_admin';
      const authorName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'Administrator';

      const newPost: Announcement = {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        authorId: authorId,
        authorName: authorName || 'Administrator',
        createdAt: new Date().toISOString(),
        likes: [],
        seenBy: []
      };
      
      const docRef = await addDoc(collection(db, 'announcements'), newPost);
      
      setAnnouncements([{ ...newPost, id: docRef.id }, ...announcements]);
      setNewPostTitle('');
      setNewPostContent('');
      setIsCreatingPost(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to publish announcement. Make sure you have internet connection and permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setAnnouncements(announcements.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLike = async (post: Announcement) => {
    if (!post.id) return;
    const currentUserId = currentUser?.id || 'system_admin';
    
    const isLiked = post.likes.includes(currentUserId);
    const newLikes = isLiked 
      ? post.likes.filter(id => id !== currentUserId)
      : [...post.likes, currentUserId];
    
    // Actualización Optimista (UI Inmediata)
    setAnnouncements(announcements.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));

    try {
      await updateDoc(doc(db, 'announcements', post.id), { likes: newLikes });
    } catch (error) {
      console.error("Error updating likes:", error);
      setAnnouncements(announcements.map(p => p.id === post.id ? { ...p, likes: post.likes } : p));
    }
  };

  const handleMarkAsSeen = async (post: Announcement) => {
    if (!post.id) return;
    const currentUserId = currentUser?.id || 'system_admin';
    
    if (post.seenBy.includes(currentUserId)) return;
    
    const newSeenBy = [...post.seenBy, currentUserId];

    // Actualización Optimista
    setAnnouncements(announcements.map(p => p.id === post.id ? { ...p, seenBy: newSeenBy } : p));

    try {
      await updateDoc(doc(db, 'announcements', post.id), { seenBy: newSeenBy });
    } catch (error) {
      console.error("Error marking as seen:", error);
      setAnnouncements(announcements.map(p => p.id === post.id ? { ...p, seenBy: post.seenBy } : p));
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = newComments[postId];
    if (!text || !text.trim()) return;
    
    setIsSaving(true);
    try {
      const authorId = currentUser?.id || 'system_admin';
      const authorName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'Administrator';

      const newComment: Comment = {
        announcementId: postId,
        authorId: authorId,
        authorName: authorName || 'Administrator',
        content: text.trim(),
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'announcement_comments'), newComment);
      setComments([...comments, { ...newComment, id: docRef.id }]);
      setNewComments({ ...newComments, [postId]: '' });
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fade-in" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <style>{`
        .post-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
        .post-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px; border-bottom: 1px solid #f1f5f9; }
        .post-avatar { width: 40px; height: 40px; border-radius: 50%; background-color: #e0f2fe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
        .post-body { padding: 20px; color: #334155; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; }
        .post-actions { display: flex; gap: 16px; padding: 12px 20px; border-top: 1px solid #f1f5f9; background-color: #f8fafc; align-items: center; }
        .action-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; padding: 6px 10px; border-radius: 6px; }
        .action-btn:hover { background-color: #e2e8f0; }
        .comments-section { padding: 20px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
        .comment-bubble { background: white; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 16px; border-top-left-radius: 4px; margin-bottom: 12px; display: inline-block; max-width: 90%; }
        
        .hamburger-btn { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; cursor: pointer; color: #111827; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      `}</style>

      {/* HEADER */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="hamburger-btn" onClick={onOpenMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#111827', fontWeight: 800 }}>Notice Board</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Company announcements and news</p>
          </div>
        </div>
        
        {isSuperAdmin && !isCreatingPost && (
          <button 
            onClick={() => setIsCreatingPost(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.3)' }}
          >
            <Megaphone size={16} /> New Announcement
          </button>
        )}
      </header>

      {/* CREATE POST BOX */}
      {isCreatingPost && (
        <div style={{ backgroundColor: 'white', border: '2px solid #3b82f6', borderRadius: '12px', padding: '24px', marginBottom: '30px', boxShadow: '0 10px 25px -5px rgba(59,130,246,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Megaphone size={18} /> Create Announcement</h3>
            <button onClick={() => setIsCreatingPost(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
          </div>
          
          <input 
            type="text" 
            placeholder="Important: Write a catchy title here..." 
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', 
              marginBottom: '12px', fontSize: '1rem', fontWeight: 600, outline: 'none', 
              boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#111827'
            }}
          />
          <textarea 
            placeholder="What do you want to communicate to the team?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            style={{ 
              width: '100%', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', 
              minHeight: '120px', fontSize: '0.95rem', resize: 'vertical', outline: 'none', 
              boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: '#ffffff', color: '#111827'
            }}
          ></textarea>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              onClick={handleCreatePost} 
              disabled={isSaving || !newPostTitle.trim() || !newPostContent.trim()}
              style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: (isSaving || !newPostTitle.trim() || !newPostContent.trim()) ? 0.5 : 1 }}
            >
              {isSaving ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </div>
      )}

      {/* FEED */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading board...</div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
          <Megaphone size={48} style={{ margin: '0 auto 16px auto', opacity: 0.3 }} />
          <h3>No announcements yet.</h3>
          <p>When administrators post news, they will appear here.</p>
        </div>
      ) : (
        announcements.map((post) => {
          const postComments = comments.filter(c => c.announcementId === post.id);
          
          const currentUserId = currentUser?.id || 'system_admin';
          const hasLiked = post.likes.includes(currentUserId);
          const hasSeen = post.seenBy.includes(currentUserId);
          const isExpanded = expandedComments[post.id as string] || false;

          return (
            <div key={post.id} className="post-card">
              {/* Post Header */}
              <div className="post-header">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="post-avatar">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{post.authorName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                      <Clock size={12} /> {formatDateTime(post.createdAt)}
                      {(post.authorName === 'System' || post.authorName === 'Administrator') && <span style={{backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700}}>ADMIN</span>}
                    </div>
                  </div>
                </div>
                {isSuperAdmin && (
                  <button onClick={() => handleDeletePost(post.id as string)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', opacity: 0.5 }} title="Delete Post"><Trash2 size={16} /></button>
                )}
              </div>

              {/* Post Body */}
              <div className="post-body">
                <h3 style={{ margin: '0 0 12px 0', color: '#111827', fontSize: '1.25rem' }}>{post.title}</h3>
                <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
              </div>

              {/* Information Stats & Viewer Lists */}
              <div style={{ padding: '0 20px 12px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span>{post.likes.length} Likes</span>
                    <span>{postComments.length} Comments</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCheck size={14} color="#10b981" /> {post.seenBy.length} Seen
                  </div>
                </div>

                {/* Listas Detalladas explícitas de quién vio y dio like */}
                {(post.likes.length > 0 || post.seenBy.length > 0) && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {post.seenBy.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <Users size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} /> 
                        <span><strong style={{color: '#475569'}}>Seen by:</strong> {getUserNamesList(post.seenBy)}</span>
                      </div>
                    )}
                    {post.likes.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <ThumbsUp size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} /> 
                        <span><strong style={{color: '#475569'}}>Liked by:</strong> {getUserNamesList(post.likes)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Interaction Bar */}
              <div className="post-actions">
                <button 
                  className="action-btn" 
                  onClick={() => handleToggleLike(post)}
                  style={{ color: hasLiked ? '#3b82f6' : '#64748b', flex: 1, justifyContent: 'center' }}
                >
                  <ThumbsUp size={18} fill={hasLiked ? '#3b82f6' : 'none'} /> {hasLiked ? 'Liked' : 'Like'}
                </button>

                <button 
                  className="action-btn" 
                  onClick={() => toggleComments(post.id as string)}
                  style={{ color: '#64748b', flex: 1, justifyContent: 'center' }}
                >
                  <MessageSquare size={18} /> Comment
                </button>

                {!hasSeen ? (
                  <button 
                    className="action-btn" 
                    onClick={() => handleMarkAsSeen(post)}
                    style={{ color: '#10b981', flex: 1, justifyContent: 'center', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}
                  >
                    <CheckCheck size={18} /> Mark as Seen
                  </button>
                ) : (
                  <div style={{ color: '#10b981', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <CheckCheck size={18} /> Seen by you
                  </div>
                )}
              </div>

              {/* Comments Section */}
              {isExpanded && (
                <div className="comments-section">
                  {postComments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                      {postComments.map(comment => (
                        <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                            {comment.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="comment-bubble">
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '4px' }}>{comment.authorName}</div>
                              <div style={{ fontSize: '0.9rem', color: '#334155' }}>{comment.content}</div>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '8px' }}>{formatDateTime(comment.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                      {currentUser?.firstName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <textarea
                        value={newComments[post.id as string] || ''}
                        onChange={(e) => setNewComments({...newComments, [post.id as string]: e.target.value})}
                        placeholder="Write a comment..."
                        style={{ 
                          width: '100%', padding: '12px 45px 12px 16px', border: '1px solid #cbd5e1', 
                          borderRadius: '16px', outline: 'none', fontSize: '0.9rem', resize: 'none', 
                          minHeight: '45px', boxSizing: 'border-box', fontFamily: 'inherit',
                          backgroundColor: '#ffffff', color: '#111827'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id as string);
                          }
                        }}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id as string)}
                        disabled={isSaving || !(newComments[post.id as string] || '').trim()}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: (newComments[post.id as string] || '').trim() ? '#3b82f6' : '#cbd5e1', cursor: 'pointer', padding: '4px' }}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )
        })
      )}
    </div>
  );
}