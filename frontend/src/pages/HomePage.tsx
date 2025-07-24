import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  BoltIcon, 
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClockIcon,
  BookOpenIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'

const features = [
  {
    name: 'AI-Powered Answers',
    description: 'Get instant, accurate answers about Ontario driving rules powered by advanced AI.',
    icon: SparklesIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    name: 'Lightning Fast',
    description: 'Average response time under 30 seconds with optimized retrieval algorithms.',
    icon: BoltIcon,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    name: '87% Accuracy',
    description: 'Proven high accuracy with comprehensive evaluation and continuous improvement.',
    icon: ShieldCheckIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    name: 'Smart Categories',
    description: 'Automatically categorizes questions for more relevant and targeted responses.',
    icon: BookOpenIcon,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
]

const stats = [
  { name: 'Knowledge Base', value: '397', unit: 'Chunks', icon: BookOpenIcon },
  { name: 'Categories', value: '8', unit: 'Topics', icon: LightBulbIcon },
  { name: 'Response Time', value: '<30', unit: 'Seconds', icon: ClockIcon },
  { name: 'Accuracy Rate', value: '87', unit: 'Percent', icon: ChartBarIcon },
]

const quickQuestions = [
  "What is the speed limit on highways in Ontario?",
  "What documents do I need for a G1 test?",
  "Can G1 drivers drive on 400-series highways?",
  "What should you do when a school bus has flashing red lights?",
  "What is the blood alcohol limit for drivers?",
  "What are the penalties for distracted driving?"
]

export function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                <span className="gradient-text">AI-Powered</span>
                <br />
                <span className="text-foreground">Ontario Driving Assistant</span>
              </h1>
              
              <p className="text-lg leading-8 text-muted-foreground mb-8">
                Get instant, accurate answers about Ontario driving rules and regulations. 
                Powered by advanced AI with 87% accuracy and lightning-fast responses.
              </p>

              <div className="flex items-center justify-center gap-4">
                <Button asChild size="lg" variant="gradient" className="group">
                  <Link to="/chat">
                    <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Start Chatting
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Quick Questions Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Popular Questions
              </h2>
              <p className="text-muted-foreground">
                Try asking about these common driving topics
              </p>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Link
                    to="/chat"
                    state={{ question }}
                    className="block p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-lg transition-all duration-200 hover:border-primary/20"
                  >
                    <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                      "{question}"
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built with cutting-edge AI technology to provide the best driving assistance experience
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
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  onHoverStart={() => setHoveredFeature(index)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feature.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>

                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${hoveredFeature === index ? 'opacity-100' : ''}`} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-card/50 to-muted/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              System Performance
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Real-time metrics showing the power and efficiency of our AI system
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className="text-center p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                    <Icon className="mx-auto h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                      {stat.name === 'Accuracy Rate' && <span className="text-lg">%</span>}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-1">
                      {stat.unit}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {stat.name}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to Get Started?
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who rely on our AI assistant for accurate driving information.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button asChild size="xl" variant="gradient" className="group">
                <Link to="/chat">
                  <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Start Your First Query
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}