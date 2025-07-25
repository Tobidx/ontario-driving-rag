import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon,
  InformationCircleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Stats', href: '/stats', icon: ChartBarIcon },
  { name: 'About', href: '/about', icon: InformationCircleIcon },
]

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return SunIcon
      case 'dark': return MoonIcon
      default: return ComputerDesktopIcon
    }
  }

  const ThemeIcon = getThemeIcon()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-primary-foreground font-bold text-sm">M</span>
                  </div>
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
                </div>
                <span className="text-xl font-bold gradient-text">MTO RAG</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Theme Toggle & Mobile Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={cycleTheme}
                className="relative group"
              >
                <ThemeIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <XMarkIcon className="h-5 w-5" />
                  ) : (
                    <Bars3Icon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg"
            >
              <div className="space-y-1 px-4 pb-3 pt-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "group flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-secondary/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
}