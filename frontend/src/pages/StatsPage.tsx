import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  ChartBarIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  TagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { getStats, getHealth, StatsResponse, HealthResponse } from '../lib/api'
import { formatTime, formatNumber } from '../lib/utils'
import { cn } from '../lib/utils'

const StatCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  description,
  color = "text-primary",
  bgColor = "bg-primary/10" 
}: {
  title: string
  value: string | number
  unit?: string
  icon: any
  trend?: 'up' | 'down' | 'stable'
  description?: string
  color?: string
  bgColor?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${bgColor} mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      
      {trend && (
        <div className={cn(
          "text-xs px-2 py-1 rounded-full",
          trend === 'up' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
          trend === 'down' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
          trend === 'stable' && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
        )}>
          {trend === 'up' && '↗'}
          {trend === 'down' && '↘'}
          {trend === 'stable' && '→'}
        </div>
      )}
    </div>
    
    {/* Hover glow effect */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </motion.div>
)

const HealthIndicator = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'configured':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Healthy'
        }
      case 'degraded':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          label: 'Degraded'
        }
      case 'error':
      case 'not_configured':
        return {
          icon: XCircleIcon,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: 'Error'
        }
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          label: 'Unknown'
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${config.bgColor}`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  )
}

export function StatsPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<StatsResponse>({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: health, isLoading: healthLoading } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 15000, // Refetch every 15 seconds
  })

  if (statsLoading || healthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading system statistics...</p>
        </div>
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load statistics</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            <ChartBarIcon className="inline-block h-10 w-10 text-primary mr-3" />
            System Statistics
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time performance metrics and system health monitoring
          </p>
        </motion.div>

        {/* System Health */}
        {health && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold mb-6">System Health</h2>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="col-span-full">
                <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Overall Status</h3>
                    <HealthIndicator status={health?.data.status || 'error'} />
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <p className="text-lg font-semibold">{formatTime(health.data.uptime)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Memory Used</p>
                      <p className="text-lg font-semibold">{health.data.memory.used} MB</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Environment</p>
                      <p className="text-lg font-semibold capitalize">{health.data.environment}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Version</p>
                      <p className="text-lg font-semibold">{health.data.version}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Status */}
              <div className="col-span-full">
                <h3 className="text-lg font-semibold mb-4">Service Status</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {Object.entries(health.data.services).map(([service, status]) => (
                    <div key={service} className="rounded-lg border border-border/50 bg-card/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {service.replace('_', ' ')}
                        </span>
                        <HealthIndicator status={status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Performance Metrics */}
        {stats && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold mb-6">Performance Metrics</h2>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Knowledge Base"
                value={formatNumber(stats.data.totalChunks)}
                unit="Chunks"
                icon={BookOpenIcon}
                description="High-quality processed chunks"
                color="text-blue-500"
                bgColor="bg-blue-500/10"
                trend="stable"
              />
              
              <StatCard
                title="Categories"
                value={stats.data.categories.length}
                unit="Topics"
                icon={TagIcon}
                description="Organized topic categories"
                color="text-purple-500"
                bgColor="bg-purple-500/10"
                trend="stable"
              />
              
              <StatCard
                title="Avg Response Time"
                value={stats.data.averageQueryTime > 0 ? formatTime(stats.data.averageQueryTime / 1000) : 'N/A'}
                icon={ClockIcon}
                description="Average query processing time"
                color="text-green-500"
                bgColor="bg-green-500/10"
                trend={stats.data.averageQueryTime < 30000 ? 'up' : 'down'}
              />
              
              <StatCard
                title="Total Queries"
                value={formatNumber(stats.data.totalQueries)}
                unit="Requests"
                icon={SparklesIcon}
                description="Processed since startup"
                color="text-orange-500"
                bgColor="bg-orange-500/10"
                trend="up"
              />
            </div>
          </motion.section>
        )}

        {/* Categories */}
        {stats && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-6">Knowledge Categories</h2>
            
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.data.categories.map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border/30"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/70"></div>
                    <span className="text-sm font-medium capitalize">
                      {category.replace('_', ' ')}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* System Health Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="fixed bottom-6 right-6"
        >
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-foreground">System Online</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}