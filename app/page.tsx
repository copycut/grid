import { Card } from 'antd'
import NavBar from '@/app/components/NavBar'
import HomePageSignInButton from '@/app/components/auth/HomePageSignInButton'
import { ProjectFilled, TeamOutlined, RocketOutlined, LockOutlined } from '@ant-design/icons'

export default function Home() {
  const features = [
    {
      icon: ProjectFilled,
      title: 'Task Management',
      description: 'Organize your tasks with intuitive drag-and-drop boards'
    },
    {
      icon: TeamOutlined,
      title: 'Team Collaboration',
      description: 'Work together with your team in real-time'
    },
    {
      icon: RocketOutlined,
      title: 'Lightning Fast',
      description: 'Built with Next.js 15 for optimal performance'
    },
    {
      icon: LockOutlined,
      title: 'Secure',
      description: 'Enterprise-grade security with Clerk authentication'
    }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-950 dark:to-purple-950 text-gray-900 dark:text-gray-300">
      <NavBar />

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-300 mb-6">
            Organize work and life, <span className="text-primary-600">finally.</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Grid helps teams move work forward. Collaborate, manage projects, and reach new productivity peaks. From
            high rises to the home office, the way your team works is unique—accomplish it all with Grid.
          </p>
          <HomePageSignInButton>Get Started</HomePageSignInButton>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-300 mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features to help your team collaborate and get more done.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-500 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="text-2xl text-primary-600! dark:text-primary-300!" />
              </div>
              <div className="text-lg">{feature.title}</div>
              <div className="text-center">{feature.description}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who are already using Grid to organize their work.
          </p>

          <HomePageSignInButton color="default">Start your free trial</HomePageSignInButton>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ProjectFilled className="text-2xl" />
              <span className="text-xl font-bold">Grid</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© {new Date().getFullYear()} Grid. Free Project.</span>
              <span>Built with Next.js & Clerk</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
