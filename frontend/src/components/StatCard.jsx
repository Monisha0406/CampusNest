import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color = 'primary', trend, trendUp = true }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
