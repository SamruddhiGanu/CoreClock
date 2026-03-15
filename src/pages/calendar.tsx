import { useState, useEffect } from 'react';
import { calendarAPI, workoutsAPI } from '@/lib/api';
import { Calendar as CalendarIcon, Plus, X, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'workout' | 'meal' | 'reminder' | 'other';
  start_time: string;
  end_time?: string;
  is_completed: boolean;
}

interface Workout {
  id: string;
  date: string;
  workout_name: string;
}

export default function Calendar() {
  const navigate = useNavigate();  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'workout' | 'meal' | 'reminder' | 'other'>('workout');
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const eventsResponse = await calendarAPI.getAll();
      setEvents(eventsResponse.data);
      
      const workoutsResponse = await workoutsAPI.getAll();
      setWorkouts(workoutsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
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

      setTitle('');
      setDescription('');
      setEventType('workout');
      setStartTime('');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const hasWorkoutOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return workouts.some(w => w.date.startsWith(dateStr));
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.start_time.startsWith(dateStr));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[100px] md:min-h-[120px] bg-white/5 rounded-lg"></div>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const hasWorkout = hasWorkoutOnDate(date);
      const dayEvents = getEventsForDate(date);
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`min-h-[100px] md:min-h-[120px] p-2 md:p-3 border-2 rounded-xl transition-all cursor-pointer relative overflow-hidden ${
            hasWorkout 
              ? 'bg-gradient-to-br from-green-500/30 to-emerald-600/30 border-green-500/50 shadow-lg shadow-green-500/20' 
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          } ${isToday ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-gray-900' : ''}`}
        >
          {/* Date number */}
          <div className={`text-lg md:text-xl font-bold mb-2 ${
            isToday 
              ? 'text-cyan-400' 
              : hasWorkout 
                ? 'text-green-300' 
                : isPast 
                  ? 'text-gray-500' 
                  : 'text-white'
          }`}>
            {day}
          </div>

          {/* Workout indicator */}
          {hasWorkout && (
            <div className="absolute top-2 right-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 animate-pulse">
                <span className="text-lg">💪</span>
              </div>
            </div>
          )}

          {/* Events list */}
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div 
                key={idx} 
                className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300 truncate backdrop-blur-sm"
                title={event.title}
              >
                {event.event_type === 'workout' && '💪 '}
                {event.event_type === 'meal' && '🍎 '}
                {event.event_type === 'reminder' && '⏰ '}
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-400 px-2">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>

          {/* Today indicator */}
          {isToday && (
            <div className="absolute bottom-2 left-2 text-xs font-bold text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded-full">
              Today
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'workout': return '💪';
      case 'meal': return '🍎';
      case 'reminder': return '⏰';
      default: return '📌';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-cyan-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading calendar...</div>
      </div>
    );
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedDateHasWorkout = selectedDate ? hasWorkoutOnDate(selectedDate) : false;

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
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30">
                <CalendarIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Calendar
              </h1>
            </div>
            <p className="text-gray-400 text-lg ml-16">
              Track your fitness journey
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/50 transition-all flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-3xl mb-1">💪</div>
            <div className="text-2xl font-bold text-white">
              {workouts.filter(w => {
                const date = new Date(w.date);
                const today = new Date();
                return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
              }).length}
            </div>
            <div className="text-sm text-gray-400">Workouts This Month</div>
          </div>

          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-2xl font-bold text-white">
              {workouts.filter(w => {
                const workoutDate = new Date(w.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return workoutDate >= weekAgo;
              }).length}
            </div>
            <div className="text-sm text-gray-400">This Week</div>
          </div>

          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-3xl mb-1">📅</div>
            <div className="text-2xl font-bold text-white">{events.length}</div>
            <div className="text-sm text-gray-400">Total Events</div>
          </div>

          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-3xl mb-1">🎯</div>
            <div className="text-2xl font-bold text-white">
              {Math.round((workouts.filter(w => {
                const workoutDate = new Date(w.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return workoutDate >= weekAgo;
              }).length / 4) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Weekly Goal</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-4 md:p-6 mb-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            
            <button
              onClick={nextMonth}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm md:text-base font-bold text-gray-300 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-600/30 border-2 border-green-500/50"></div>
              <span className="text-sm text-gray-300">Workout Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg ring-4 ring-cyan-400 bg-white/10"></div>
              <span className="text-sm text-gray-300">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-sm">💪</span>
              </div>
              <span className="text-sm text-gray-300">Completed Workout</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedDateHasWorkout && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💪</span>
                  <span className="text-green-400 font-semibold">Workout completed on this day!</span>
                </div>
              </div>
            )}

            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-gray-400 text-sm mb-2">{event.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-white/10 rounded capitalize">
                            {event.event_type}
                          </span>
                          <span>
                            {new Date(event.start_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No events scheduled for this day
              </p>
            )}
          </div>
        )}
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