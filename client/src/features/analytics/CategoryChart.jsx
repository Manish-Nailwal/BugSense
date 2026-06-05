import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useThemeStore } from '../../store/themeStore';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const CategoryChart = ({ data }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 text-sm italic py-10">
        No category data available yet.
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item._id || 'Unfinished',
    value: item.count
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-full w-full relative">
      {/* Decorative Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-40 h-40 bg-emerald-500/30 blur-[80px] rounded-full" />
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={8}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          
          {/* Custom Center Label */}
          <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" className="fill-zinc-900 dark:fill-white text-2xl font-bold tracking-tight">
            {total}
          </text>
          <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" className="fill-zinc-400 dark:fill-zinc-600 text-[10px] font-semibold uppercase tracking-wider">
            Total Fixes
          </text>

          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#18181b' : '#ffffff', 
              border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
              borderRadius: '12px',
              fontSize: '12px',
              color: isDark ? '#f4f4f5' : '#18181b',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ color: isDark ? '#f4f4f5' : '#18181b', fontWeight: 'bold' }}
          />
          {/* Removed default legend to prevent overflow; using parent's toggle view instead */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
