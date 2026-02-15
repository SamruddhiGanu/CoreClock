import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { caloriesAPI, workoutsAPI } from '@/lib/api';

interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  mealCount: number;
}

interface Workout {
  id: string;
  date: string;
  workout_name: string;
  duration: number;
  exercises: any[];
}

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calories, setCalories] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealCount: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's calories
      const caloriesRes = await caloriesAPI.getAll(today, today);
      const caloriesData = caloriesRes.data;
      setCalories(caloriesData);

      // Calculate summary
      const summary = caloriesData.reduce((acc: DailySummary, log: any) => ({
        totalCalories: acc.totalCalories + (log.calories || 0),
        totalProtein: acc.totalProtein + (log.protein || 0),
        totalCarbs: acc.totalCarbs + (log.carbs || 0),
        totalFats: acc.totalFats + (log.fats || 0),
        mealCount: acc.mealCount + 1
      }), {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        mealCount: 0
      });
      setSummary(summary);

      // Fetch recent workouts
      const workoutsRes = await workoutsAPI.getAll();
      setWorkouts(workoutsRes.data.slice(0, 5));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center ">
          <h1 className="text-3xl font-bold text-gray-900">🏋️ Fitness Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Calories</p>
                <p className="text-3xl font-bold text-gray-900">
                  {summary.totalCalories}
                </p>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Today</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Protein</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(summary.totalProtein)}g
                </p>
              </div>
              <div className="text-4xl">💪</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Today</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meals Logged</p>
                <p className="text-3xl font-bold text-gray-900">
                  {summary.mealCount}
                </p>
              </div>
              <div className="text-4xl">🍽️</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Today</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Workouts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {workouts.length}
                </p>
              </div>
              <div className="text-4xl">🏃</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Recent</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Meals */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Today's Meals 🍎
              </h3>
            </div>
            <div className="p-6">
              {calories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No meals logged today. Start tracking your nutrition!
                </p>
              ) : (
                <div className="space-y-4">
                  {calories.map((meal: any) => (
                    <div 
                      key={meal.id} 
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {meal.meal_name}
                          </h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {meal.meal_type}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {meal.calories} cal
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>P: {meal.protein || 0}g</span>
                        <span>C: {meal.carbs || 0}g</span>
                        <span>F: {meal.fats || 0}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Recent Workouts 💪
              </h3>
            </div>
            <div className="p-6">
              {workouts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No workouts logged yet. Time to get moving!
                </p>
              ) : (
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <div 
                      key={workout.id} 
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {workout.workout_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(workout.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {workout.duration} min
                        </span>
                      </div>
                      {workout.exercises && workout.exercises.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {workout.exercises.length} exercises
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
<div className="mt-8 bg-white rounded-lg shadow p-6">
  <h3 className="text-xl font-semibold text-gray-900 mb-4">
    Quick Actions
  </h3>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <button 
      onClick={() => alert('Meal logging coming soon!')}
      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition group"
    >
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🍎</div>
      <div className="font-medium text-gray-700">Log Meal</div>
    </button>
    
    <button 
      onClick={() => alert('Workout logging coming soon!')}
      className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition group"
    >
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💪</div>
      <div className="font-medium text-gray-700">Log Workout</div>
    </button>
    
    <button 
      onClick={() => navigate('/calendar')}
      className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition group"
    >
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</div>
      <div className="font-medium text-gray-700">Calendar</div>
    </button>
    
    <button 
      onClick={() => navigate('/chatbot')}
      className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition group"
    >
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🤖</div>
      <div className="font-medium text-gray-700">AI Coach</div>
    </button>
  </div>
</div>
      </main>
    </div>
  );
}

export default Dashboard;