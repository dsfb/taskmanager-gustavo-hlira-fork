import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Users, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import logoImage from '../assets/logo.webp'

const LandingPage = () => {
  const features = [
    {
      icon: CheckCircle,
      title: 'Organização Inteligente',
      description: 'Organize suas tarefas com categorias, tags e listas personalizadas.'
    },
    {
      icon: Zap,
      title: 'Produtividade Máxima',
      description: 'Acompanhe seu progresso e otimize seu tempo com relatórios detalhados.'
    },
    {
      icon: Users,
      title: 'Colaboração Eficiente',
      description: 'Trabalhe em equipe e mantenha todos alinhados com os objetivos.'
    },
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Seus dados estão protegidos com criptografia de ponta a ponta.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-accent rounded-sm transform rotate-45"></div>
            </div>
            <span className="text-xl font-bold text-foreground">TaskMaster</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Da ideia à realização:
                <span className="text-primary block">faça acontecer.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transforme suas ideias em resultados concretos com o TaskMaster. 
                A plataforma completa para gerenciar tarefas, projetos e alcançar seus objetivos.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Começar Agora
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver Demonstração
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Grátis para começar</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img 
                src={logoImage} 
                alt="TaskMaster" 
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Tudo que você precisa para ser produtivo
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Recursos poderosos que se adaptam ao seu fluxo de trabalho
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-primary rounded-2xl p-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Pronto para transformar sua produtividade?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão alcançando seus objetivos com o TaskMaster.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Começar Gratuitamente
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-border">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 TaskMaster. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

