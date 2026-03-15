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

// ─── Date helpers ─────────────────────────────────────────────────────────────
const toDateStr = (d: Date) => d.toISOString().split('T')[0];
const todayStr  = () => toDateStr(new Date());

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

function displayDate(dateStr: string) {
  const t = todayStr();
  if (dateStr === t)              return 'Today';
  if (dateStr === addDays(t, -1)) return 'Yesterday';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading]           = useState(true);
  const [calories, setCalories]         = useState<any[]>([]);
  const [workouts, setWorkouts]         = useState<Workout[]>([]);
  const [activeDays, setActiveDays]     = useState<Set<string>>(new Set());
  const [summary, setSummary]           = useState<DailySummary>({
    totalCalories: 0, totalProtein: 0,
    totalCarbs: 0, totalFats: 0, mealCount: 0,
  });

  const [showMealForm,    setShowMealForm]    = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);

  const [mealName,     setMealName]     = useState('');
  const [mealType,     setMealType]     = useState('breakfast');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein,  setMealProtein]  = useState('');
  const [mealCarbs,    setMealCarbs]    = useState('');
  const [mealFats,     setMealFats]     = useState('');

  const [workoutName,     setWorkoutName]     = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');

  // ── Fetch data for one day ─────────────────────────────────────────────────
  const fetchDayData = async (date: string) => {
    setLoading(true);
    try {
      const [calRes, woRes] = await Promise.all([
        caloriesAPI.getAll(date, date),
        workoutsAPI.getAll(date, date),   // ← now passes date params
      ]);

      const calData: any[]   = calRes.data  || [];
      const woData: Workout[] = woRes.data  || [];

      setCalories(calData);
      setWorkouts(woData);

      const s = calData.reduce(
        (acc: DailySummary, log: any) => ({
          totalCalories: acc.totalCalories + (log.calories || 0),
          totalProtein:  acc.totalProtein  + (log.protein  || 0),
          totalCarbs:    acc.totalCarbs    + (log.carbs    || 0),
          totalFats:     acc.totalFats     + (log.fats     || 0),
          mealCount:     acc.mealCount     + 1,
        }),
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0, mealCount: 0 }
      );
      setSummary(s);

      if (calData.length > 0 || woData.length > 0) {
        setActiveDays(prev => new Set([...prev, date]));
      }
    } catch (err) {
      console.error('fetchDayData error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── On mount: load history to populate dot strip ───────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const from = addDays(todayStr(), -29);
        const to   = todayStr();
        const [calRes, woRes] = await Promise.all([
          caloriesAPI.getAll(from, to),
          workoutsAPI.getAll(from, to),
        ]);
        const days = new Set<string>();
        (calRes.data || []).forEach((l: any) => { if (l.date) days.add(l.date); });
        (woRes.data  || []).forEach((w: any) => { if (w.date) days.add(w.date); });
        setActiveDays(days);
      } catch (e) {
        // history strip is best-effort, silently ignore
      }
    };
    loadHistory();
  }, []);

  // ── Re-fetch whenever selected date changes ────────────────────────────────
  useEffect(() => {
    fetchDayData(selectedDate);
    setShowMealForm(false);
    setShowWorkoutForm(false);
  }, [selectedDate]);

  // ── Add meal ───────────────────────────────────────────────────────────────
  const handleAddMeal = async () => {
    if (!mealName || !mealCalories) return;
    const payload = {
      meal_name: mealName,
      meal_type: mealType,
      calories:  Number(mealCalories),
      protein:   Number(mealProtein) || 0,
      carbs:     Number(mealCarbs)   || 0,
      fats:      Number(mealFats)    || 0,
      date:      selectedDate,
    };

    // Optimistic update so UI responds instantly
    const tempEntry = { ...payload, id: `temp-${Date.now()}` };
    setCalories(prev => [...prev, tempEntry]);
    setSummary(prev => ({
      totalCalories: prev.totalCalories + payload.calories,
      totalProtein:  prev.totalProtein  + payload.protein,
      totalCarbs:    prev.totalCarbs    + payload.carbs,
      totalFats:     prev.totalFats     + payload.fats,
      mealCount:     prev.mealCount     + 1,
    }));
    setActiveDays(prev => new Set([...prev, selectedDate]));

    setMealName(''); setMealType('breakfast');
    setMealCalories(''); setMealProtein('');
    setMealCarbs(''); setMealFats('');
    setShowMealForm(false);

    try {
      await caloriesAPI.create(payload);
      // Re-fetch to replace temp entry with real server data (real id etc.)
      fetchDayData(selectedDate);
    } catch (e) {
      console.error('create meal error:', e);
    }
  };

  // ── Add workout ────────────────────────────────────────────────────────────
  const handleAddWorkout = async () => {
    if (!workoutName || !workoutDuration) return;
    const payload = {
      workout_name: workoutName,
      duration:     Number(workoutDuration),
      date:         selectedDate,
      exercises:    [],
    };

    const tempEntry: Workout = { ...payload, id: `temp-${Date.now()}` };
    setWorkouts(prev => [tempEntry, ...prev]);
    setActiveDays(prev => new Set([...prev, selectedDate]));

    setWorkoutName(''); setWorkoutDuration('');
    setShowWorkoutForm(false);

    try {
      await workoutsAPI.create(payload);
      fetchDayData(selectedDate);
    } catch (e) {
      console.error('create workout error:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // ── 30-day strip ───────────────────────────────────────────────────────────
  const last30 = Array.from({ length: 30 }, (_, i) => addDays(todayStr(), -29 + i));

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: 8, color: '#e0e0e0', fontSize: 13, padding: '9px 12px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#e0e0e0', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

      {/* Header */}
      <header style={{ backgroundColor: '#0e0e0e', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '0.05em' }}>🏋️ Fitness Dashboard</h1>
          <button onClick={handleLogout} style={{ padding: '8px 18px', backgroundColor: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Day Navigator ── */}
        <div style={{ backgroundColor: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>

          {/* Arrow + label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button onClick={() => setSelectedDate(d => addDays(d, -1))}
              style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid #222', backgroundColor: '#141414', color: '#aaa', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
              ‹
            </button>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>{displayDate(selectedDate)}</p>
              <p style={{ fontSize: 12, color: '#444', margin: 0, marginTop: 2 }}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <button onClick={() => setSelectedDate(d => addDays(d, 1))}
              disabled={selectedDate >= todayStr()}
              style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid #222', backgroundColor: selectedDate >= todayStr() ? '#0a0a0a' : '#141414', color: selectedDate >= todayStr() ? '#2a2a2a' : '#aaa', cursor: selectedDate >= todayStr() ? 'not-allowed' : 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
              ›
            </button>
          </div>

          {/* 30-day dot strip */}
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {last30.map(d => {
              const isSelected = d === selectedDate;
              const hasData    = activeDays.has(d);
              const isToday    = d === todayStr();
              return (
                <button key={d} onClick={() => setSelectedDate(d)} title={d}
                  style={{ width: 28, height: 28, borderRadius: 6, border: isSelected ? '2px solid #4DA6FF' : '1px solid #1f1f1f', backgroundColor: isSelected ? '#0d1a2a' : hasData ? '#0d2010' : '#111', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontSize: 9, color: isSelected ? '#4DA6FF' : isToday ? '#FFD700' : '#555', fontWeight: isToday || isSelected ? 700 : 400, lineHeight: 1 }}>
                    {new Date(d + 'T00:00:00').getDate()}
                  </span>
                  {hasData && <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: isSelected ? '#4DA6FF' : '#4DFFB4', display: 'block' }} />}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
            {[
              { dot: '#4DFFB4', label: 'Has data' },
              { dot: '#4DA6FF', label: 'Selected', border: true },
              { dot: '#FFD700', label: 'Today' },
            ].map(l => (
              <span key={l.label} style={{ fontSize: 10, color: '#444', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: l.border ? 2 : '50%', backgroundColor: l.dot, border: l.border ? `2px solid ${l.dot}` : 'none', display: 'inline-block', flexShrink: 0 }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Calories', value: summary.totalCalories,              unit: '',  icon: '🔥', accent: '#FF4D4D' },
            { label: 'Protein',        value: Math.round(summary.totalProtein),   unit: 'g', icon: '💪', accent: '#4DFFB4' },
            { label: 'Meals Logged',   value: summary.mealCount,                  unit: '',  icon: '🍽️', accent: '#FFD700' },
            { label: 'Workouts',       value: workouts.length,                    unit: '',  icon: '🏃', accent: '#4DA6FF' },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: '#0e0e0e', borderRadius: 12, padding: '24px 20px 18px', border: '1px solid #1a1a1a', borderTop: `3px solid ${stat.accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, marginBottom: 6 }}>{stat.label}</p>
                  <p style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1, margin: 0 }}>
                    {loading ? <span style={{ color: '#333' }}>—</span> : stat.value}
                    {!loading && stat.unit && <span style={{ fontSize: 18, fontWeight: 400, color: '#666' }}>{stat.unit}</span>}
                  </p>
                </div>
                <span style={{ fontSize: 28 }}>{stat.icon}</span>
              </div>
              <p style={{ fontSize: 11, color: '#444', marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{displayDate(selectedDate)}</p>
            </div>
          ))}
        </div>

        {/* ── Two Column ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>

          {/* Meals */}
          <div style={{ backgroundColor: '#0e0e0e', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Meals 🍎</h3>
              <button onClick={() => { setShowMealForm(v => !v); setShowWorkoutForm(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', backgroundColor: '#0d1a2a', border: '1px solid #1a3a5a', color: '#4DA6FF', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{showMealForm ? '−' : '+'}</span> Add
              </button>
            </div>

            {showMealForm && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', backgroundColor: '#0a1520' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <input style={inp} placeholder="Meal name *" value={mealName} onChange={e => setMealName(e.target.value)} />
                  </div>
                  <select style={{ ...inp, cursor: 'pointer' }} value={mealType} onChange={e => setMealType(e.target.value)}>
                    {['breakfast','lunch','dinner','snack','pre-workout','post-workout'].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  <input style={inp} type="number" placeholder="Calories *" value={mealCalories} onChange={e => setMealCalories(e.target.value)} />
                  <input style={inp} type="number" placeholder="Protein (g)" value={mealProtein}  onChange={e => setMealProtein(e.target.value)} />
                  <input style={inp} type="number" placeholder="Carbs (g)"   value={mealCarbs}    onChange={e => setMealCarbs(e.target.value)} />
                  <input style={inp} type="number" placeholder="Fats (g)"    value={mealFats}     onChange={e => setMealFats(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowMealForm(false)} style={{ flex: 1, padding: '9px', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#666', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
                  <button onClick={handleAddMeal} disabled={!mealName || !mealCalories}
                    style={{ flex: 1, padding: '9px', backgroundColor: mealName && mealCalories ? '#1a4a7a' : '#1a2a3a', border: 'none', color: mealName && mealCalories ? '#4DA6FF' : '#345', borderRadius: 8, cursor: mealName && mealCalories ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                    Add
                  </button>
                </div>
              </div>
            )}

            <div style={{ padding: '20px 24px' }}>
              {loading ? (
                <p style={{ color: '#333', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>Loading...</p>
              ) : calories.length === 0 ? (
                <p style={{ color: '#444', textAlign: 'center', padding: '32px 0', fontSize: 14 }}>No meals logged for {displayDate(selectedDate).toLowerCase()}.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {calories.map((meal: any) => (
                    <div key={meal.id} style={{ backgroundColor: '#121212', border: '1px solid #1f1f1f', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0', margin: 0, marginBottom: 2 }}>{meal.meal_name}</h4>
                          <p style={{ fontSize: 12, color: '#555', margin: 0, textTransform: 'capitalize' }}>{meal.meal_type}</p>
                        </div>
                        <span style={{ padding: '4px 12px', backgroundColor: '#0d1a2a', color: '#4DA6FF', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          {meal.calories} cal
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#555' }}>
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

          {/* Workouts */}
          <div style={{ backgroundColor: '#0e0e0e', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Workouts 💪</h3>
              <button onClick={() => { setShowWorkoutForm(v => !v); setShowMealForm(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', backgroundColor: '#0d2118', border: '1px solid #1a3a28', color: '#4DFFB4', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{showWorkoutForm ? '−' : '+'}</span> Add
              </button>
            </div>

            {showWorkoutForm && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', backgroundColor: '#0a1a10' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
                  <input style={inp} placeholder="Workout name * (e.g. Push Day, Morning Run)" value={workoutName} onChange={e => setWorkoutName(e.target.value)} />
                  <input style={inp} type="number" placeholder="Duration (minutes) *" value={workoutDuration} onChange={e => setWorkoutDuration(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowWorkoutForm(false)} style={{ flex: 1, padding: '9px', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#666', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
                  <button onClick={handleAddWorkout} disabled={!workoutName || !workoutDuration}
                    style={{ flex: 1, padding: '9px', backgroundColor: workoutName && workoutDuration ? '#0d2a18' : '#0d1a12', border: 'none', color: workoutName && workoutDuration ? '#4DFFB4' : '#2a5a38', borderRadius: 8, cursor: workoutName && workoutDuration ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                    Add
                  </button>
                </div>
              </div>
            )}

            <div style={{ padding: '20px 24px' }}>
              {loading ? (
                <p style={{ color: '#333', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>Loading...</p>
              ) : workouts.length === 0 ? (
                <p style={{ color: '#444', textAlign: 'center', padding: '32px 0', fontSize: 14 }}>No workouts logged for {displayDate(selectedDate).toLowerCase()}.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {workouts.map((workout) => (
                    <div key={workout.id} style={{ backgroundColor: '#121212', border: '1px solid #1f1f1f', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0', margin: 0, marginBottom: 2 }}>{workout.workout_name}</h4>
                          <p style={{ fontSize: 12, color: '#555', margin: 0 }}>{new Date(workout.date + 'T00:00:00').toLocaleDateString()}</p>
                        </div>
                        <span style={{ padding: '4px 12px', backgroundColor: '#0d2118', color: '#4DFFB4', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          {workout.duration} min
                        </span>
                      </div>
                      {workout.exercises?.length > 0 && (
                        <p style={{ fontSize: 12, color: '#555', margin: '8px 0 0' }}>{workout.exercises.length} exercises</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 24, backgroundColor: '#0e0e0e', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Quick Actions</h3>
          </div>
          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
            {[
              { icon: '🍎', label: 'Log Meal',    bg: '#0d1a2a', onClick: () => { setShowMealForm(true); setShowWorkoutForm(false); window.scrollTo({ top: 300, behavior: 'smooth' }); } },
              { icon: '💪', label: 'Log Workout', bg: '#0d2118', onClick: () => { setShowWorkoutForm(true); setShowMealForm(false); window.scrollTo({ top: 300, behavior: 'smooth' }); } },
              { icon: '📅', label: 'Calendar',    bg: '#1a0d2a', onClick: () => navigate('/calendar') },
              { icon: '🤖', label: 'AI Coach',    bg: '#2a1a0d', onClick: () => navigate('/chatbot') },
            ].map(action => (
              <button key={action.label} onClick={action.onClick}
                style={{ padding: '20px 12px', backgroundColor: action.bg, border: '1px solid #1f1f1f', borderRadius: 12, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', transition: 'transform 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{action.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#aaa' }}>{action.label}</div>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}