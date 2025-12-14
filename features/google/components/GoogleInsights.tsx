
import React from 'react';
import { GoogleInsightMetric } from '../types';
import GlassPanel from '../../../components/common/GlassPanel';
import CompactNumber from '../../../components/common/CompactNumber';
import { TrendingUp, TrendingDown, Eye, Map, MousePointerClick, PhoneCall } from 'lucide-react';

interface GoogleInsightsProps {
    metrics: GoogleInsightMetric[];
}

const GoogleInsights: React.FC<GoogleInsightsProps> = ({ metrics }) => {
    const getIcon = (label: string) => {
        if(label.includes('Penelusuran')) return <Eye size={20} />;
        if(label.includes('Maps')) return <Map size={20} />;
        if(label.includes('Website')) return <MousePointerClick size={20} />;
        return <PhoneCall size={20} />;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {metrics.map((metric, idx) => (
                <GlassPanel key={idx} className="p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         {getIcon(metric.label)}
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{metric.label}</p>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-3xl font-black text-white"><CompactNumber value={metric.value} currency={false} /></span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1 mb-1 ${metric.trend >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                            {metric.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {Math.abs(metric.trend)}%
                        </span>
                    </div>
                    
                    {/* Sparkline Mock */}
                    <div className="h-10 flex items-end gap-1 opacity-50">
                        {metric.data.map((val, i) => {
                            const max = Math.max(...metric.data);
                            const h = (val / max) * 100;
                            return (
                                <div key={i} className="flex-1 bg-white rounded-t-sm transition-all group-hover:bg-orange-500" style={{ height: `${h}%` }}></div>
                            )
                        })}
                    </div>
                </GlassPanel>
            ))}
        </div>
    );
};

export default GoogleInsights;
