import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Advanced AI Architecture',
    description: 'Built with state-of-the-art retrieval-augmented generation (RAG) technology, combining semantic search with language model intelligence.',
    icon: CpuChipIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    name: 'Optimized Performance',
    description: 'Achieving 87% accuracy through advanced optimization techniques including hybrid retrieval, category-aware search, and quality filtering.',
    icon: BoltIcon,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    name: 'Comprehensive Knowledge',
    description: 'Trained on the complete MTO Driver\'s Handbook with 397 high-quality chunks covering all aspects of Ontario driving regulations.',
    icon: BookOpenIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    name: 'Real-time Processing',
    description: 'Lightning-fast responses with average query times under 30 seconds, powered by optimized vector search and intelligent caching.',
    icon: ClockIcon,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
]

const techSpecs = [
  {
    category: 'AI Technology',
    items: [
      'Grok-4 Language Model (X.AI)',
      'Hybrid Retrieval (BM25 + TF-IDF + Semantic)',
      'Category-Aware Processing',
      'Advanced Fusion Ranking'
    ]
  },
  {
    category: 'Data Processing',
    items: [
      '397 High-Quality Knowledge Chunks',
      '8 Organized Categories',
      'OCR Text Extraction',
      'Quality-Based Filtering'
    ]
  },
  {
    category: 'Performance',
    items: [
      '87% Overall Accuracy',
      '<30s Average Response Time',
      '97.8% Speed Limits Accuracy',
      '87.3% Traffic Rules Accuracy'
    ]
  },
  {
    category: 'Infrastructure',
    items: [
      'React/TypeScript Frontend',
      'Node.js/Express Backend',
      'Chroma Vector Database',
      'Real-time Health Monitoring'
    ]
  }
]

const timeline = [
  {
    phase: 'Research & Development',
    description: 'Initial system design and RAG architecture development',
    status: 'completed'
  },
  {
    phase: 'Data Processing',
    description: 'MTO handbook processing, OCR extraction, and chunk optimization',
    status: 'completed'
  },
  {
    phase: 'AI Integration',
    description: 'Grok-4 integration, retrieval system optimization, and performance tuning',
    status: 'completed'
  },
  {
    phase: 'Performance Optimization',
    description: 'Achieved 87% accuracy through advanced optimization techniques',
    status: 'completed'
  },
  {
    phase: 'Frontend Development',
    description: 'Beautiful, responsive UI with real-time chat and statistics',
    status: 'completed'
  },
  {
    phase: 'Production Ready',
    description: 'Commercial-grade system ready for deployment',
    status: 'current'
  }
]

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <SparklesIcon className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              About <span className="gradient-text">MTO RAG</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              An advanced AI-powered assistant that provides instant, accurate answers about 
              Ontario driving rules and regulations. Built with cutting-edge retrieval-augmented 
              generation technology for optimal performance and reliability.
            </p>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Engineered for accuracy, speed, and user experience
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>

                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Technical Specifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Technical Specifications</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern technologies and optimized for performance
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {techSpecs.map((spec, index) => (
              <motion.div
                key={spec.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold mb-4 text-primary">
                  {spec.category}
                </h3>
                <ul className="space-y-2">
                  {spec.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Development Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Development Timeline</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From concept to production-ready AI assistant
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative flex items-start space-x-4 pb-8 last:pb-0"
              >
                {/* Timeline line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-border/50"></div>
                )}
                
                {/* Status indicator */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  phase.status === 'completed' 
                    ? 'bg-green-500/20 border-2 border-green-500' 
                    : phase.status === 'current'
                    ? 'bg-primary/20 border-2 border-primary animate-pulse'
                    : 'bg-muted border-2 border-border'
                }`}>
                  {phase.status === 'completed' && (
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  )}
                  {phase.status === 'current' && (
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">
                    {phase.phase}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {phase.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Performance Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-card/50 to-muted/20 backdrop-blur-sm p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Performance Achievements</h2>
              <p className="text-muted-foreground">
                Measurable results through rigorous testing and optimization
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Overall Accuracy', value: '87%', icon: ShieldCheckIcon, color: 'text-green-500' },
                { label: 'Knowledge Base', value: '397', icon: BookOpenIcon, color: 'text-blue-500' },
                { label: 'Response Time', value: '<30s', icon: ClockIcon, color: 'text-purple-500' },
                { label: 'Categories', value: '8', icon: ChartBarIcon, color: 'text-orange-500' }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="text-center"
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
            <BeakerIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Built with cutting-edge AI technology
            </span>
          </div>
        </motion.section>
      </div>
    </div>
  )
}