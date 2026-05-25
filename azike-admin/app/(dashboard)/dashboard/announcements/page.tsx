// admin/app/(dashboard)/announcements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  target_audience: string;
  push_notification_sent: boolean;
  created_by: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    body: '',
    image_url: '',
    target_audience: 'all',
    send_push_notification: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data.announcements || []);
      }
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body) {
      toast.error('Title and message are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Announcement created!');
        setShowForm(false);
        setForm({ title: '', body: '', image_url: '', target_audience: 'all', send_push_notification: true });
        fetchAnnouncements();
      } else {
        toast.error(data.message || 'Failed to create announcement');
      }
    } catch (error) {
      toast.error('Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 skeleton" />
          <div className="h-64 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Send community updates</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Announcement
        </button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Announcement</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="announce-title">Title *</label>
                <input
                  id="announce-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Important Update"
                  required
                />
              </div>
              <div>
                <label htmlFor="announce-body">Message *</label>
                <textarea
                  id="announce-body"
                  rows={4}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Write your announcement..."
                  required
                />
              </div>
              <div>
                <label htmlFor="announce-image">Image URL (Optional)</label>
                <input
                  id="announce-image"
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label htmlFor="announce-audience">Target Audience</label>
                <select
                  id="announce-audience"
                  value={form.target_audience}
                  onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                >
                  <option value="all">Everyone</option>
                  <option value="members_only">Members Only</option>
                  <option value="expired_members">Expired Members</option>
                  <option value="event_attendees">Event Attendees</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="send-push"
                  type="checkbox"
                  checked={form.send_push_notification}
                  onChange={(e) => setForm({ ...form, send_push_notification: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <label htmlFor="send-push" className="!mb-0 text-sm">Send push notification</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Creating...' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.488.488 0 01-.684-.211" />
                </svg>
              </div>
              <p className="text-gray-500">No announcements yet</p>
            </div>
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      <span className="badge badge-neutral text-xs">{a.target_audience}</span>
                      {a.push_notification_sent && (
                        <span className="badge badge-success text-xs">Push Sent</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{a.body}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>By {a.created_by}</span>
                      <span>{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}