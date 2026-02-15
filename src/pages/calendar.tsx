import { useState, useEffect } from 'react';
import { calendarAPI } from '@/lib/api';
import { Calendar as CalendarIcon, Plus, X, Check } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'workout' | 'meal' | 'reminder' | 'other';
  start_time: string;
  end_time?: string;
  is_completed: boolean;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'workout' | 'meal' | 'reminder' | 'other'>('workout');
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await calendarAPI.getAll();
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await calendarAPI.create({
        title,
        description,
        eventType,
        startTime,
        endTime: null
      });

      // Reset form
      setTitle('');
      setDescription('');
      setEventType('workout');
      setStartTime('');
      setShowAddModal(false);

      // Refresh events
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'workout': return '💪';
      case 'meal': return '🍎';
      case 'reminder': return '⏰';
      default: return '📌';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'workout': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'meal': return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
      case 'reminder': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      default: return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
    }
  };

  const upcomingEvents = events
    .filter(e => new Date(e.start_time) >= new Date() && !e.is_completed)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-cyan-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-cyan-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30">
                <CalendarIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Calendar
              </h1>
            </div>
            <p className="text-gray-400 text-lg ml-16">
              Plan your fitness journey
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/50 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-4xl mb-2">📅</div>
            <div className="text-3xl font-bold text-white">{events.length}</div>
            <div className="text-sm text-gray-400">Total Events</div>
          </div>

          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-4xl mb-2">💪</div>
            <div className="text-3xl font-bold text-white">
              {events.filter(e => e.event_type === 'workout').length}
            </div>
            <div className="text-sm text-gray-400">Workouts</div>
          </div>

          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-4xl mb-2">🍎</div>
            <div className="text-3xl font-bold text-white">
              {events.filter(e => e.event_type === 'meal').length}
            </div>
            <div className="text-sm text-gray-400">Meals</div>
          </div>

          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-white">
              {events.filter(e => e.is_completed).length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No upcoming events</p>
              <p className="text-gray-500 text-sm">Click "Add Event" to schedule your first activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`backdrop-blur-xl bg-gradient-to-r ${getEventColor(event.event_type)} border rounded-2xl p-6 hover:scale-[1.02] transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{getEventIcon(event.event_type)}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-gray-400 mb-3">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>📅 {new Date(event.start_time).toLocaleDateString()}</span>
                          <span>🕐 {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="px-3 py-1 bg-white/10 rounded-full capitalize">
                            {event.event_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Check className="w-5 h-5 text-gray-400 hover:text-green-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Add New Event</h2>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Morning Workout"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                  placeholder="Details about your event..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="workout">💪 Workout</option>
                  <option value="meal">🍎 Meal</option>
                  <option value="reminder">⏰ Reminder</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/50 transition-all"
              >
                Add Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}