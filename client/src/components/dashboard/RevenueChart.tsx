import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";

export default function RevenueChart() {
  return (
    <Card className="glass-effect border-0 shadow-xl" data-testid="revenue-chart-card">
      <CardHeader className="border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Revenue Analytics</h3>
              <p className="text-xs text-muted-foreground">Last 7 days performance</p>
            </div>
          </div>
          <Select defaultValue="7days" data-testid="revenue-chart-period-select">
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* SVG Chart */}
        <div className="relative h-[300px] w-full" data-testid="revenue-chart-svg">
          <svg className="h-full w-full" viewBox="0 0 800 300">
            {/* Grid lines */}
            <line x1="50" y1="0" x2="50" y2="250" stroke="hsl(var(--border))" strokeWidth="1" />
            <line x1="50" y1="250" x2="800" y2="250" stroke="hsl(var(--border))" strokeWidth="1" />
            
            {/* Horizontal grid */}
            <line x1="50" y1="50" x2="800" y2="50" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="5,5" />
            <line x1="50" y1="125" x2="800" y2="125" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="5,5" />
            <line x1="50" y1="200" x2="800" y2="200" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="5,5" />
            
            {/* Revenue line chart */}
            <polyline 
              points="50,150 150,120 250,140 350,90 450,110 550,80 650,100 750,60" 
              fill="none" 
              stroke="hsl(var(--primary))" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            
            {/* Area under curve */}
            <path 
              d="M 50,150 L 150,120 L 250,140 L 350,90 L 450,110 L 550,80 L 650,100 L 750,60 L 750,250 L 50,250 Z" 
              fill="url(#gradient)" 
              opacity="0.2"
            />
            
            {/* Data points */}
            <circle cx="50" cy="150" r="4" fill="hsl(var(--primary))" />
            <circle cx="150" cy="120" r="4" fill="hsl(var(--primary))" />
            <circle cx="250" cy="140" r="4" fill="hsl(var(--primary))" />
            <circle cx="350" cy="90" r="4" fill="hsl(var(--primary))" />
            <circle cx="450" cy="110" r="4" fill="hsl(var(--primary))" />
            <circle cx="550" cy="80" r="4" fill="hsl(var(--primary))" />
            <circle cx="650" cy="100" r="4" fill="hsl(var(--primary))" />
            <circle cx="750" cy="60" r="4" fill="hsl(var(--primary))" />
            
            {/* Labels */}
            <text x="50" y="270" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Mon</text>
            <text x="150" y="270" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Tue</text>
            <text x="250" y="270" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Wed</text>
            <text x="350" y="270" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Thu</text>
            <text x="450" y="270" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Fri</text>
            <text x="550" y="270" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Sat</text>
            <text x="650" y="270" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">Sun</text>
            
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Average</p>
            <p className="text-lg font-semibold text-foreground">$7,755</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Highest</p>
            <p className="text-lg font-semibold text-green-600">$9,240</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Lowest</p>
            <p className="text-lg font-semibold text-red-600">$6,180</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
