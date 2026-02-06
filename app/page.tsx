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
            Enter the <span className="text-primary-600">Grid.</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            A digital realm where your ideas take form and your work comes to life. Navigate through your projects with
            precision, organize tasks in a space designed for clarity, and watch your productivity materialize in
            real-time.
          </p>
          <HomePageSignInButton>Start Building</HomePageSignInButton>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-300 mb-4">
            Built for the digital workspace
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Seamlessly navigate your projects in a space where efficiency meets innovation.
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to enter the Grid?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Step into a digital workspace where your projects flow seamlessly and productivity becomes second nature.
          </p>

          <HomePageSignInButton color="default">Enter the Grid</HomePageSignInButton>
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
