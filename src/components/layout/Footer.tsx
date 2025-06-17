import Link from 'next/link'
import { Building, Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Imobiliária Moderna
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Há mais de 10 anos no mercado imobiliário, oferecendo os melhores imóveis 
              com atendimento personalizado e tecnologia de ponta.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/imoveis" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Todos os Imóveis
                </Link>
              </li>
              <li>
                <Link href="/imoveis?tipo=casa" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Casas
                </Link>
              </li>
              <li>
                <Link href="/imoveis?tipo=apartamento" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Apartamentos
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Serviços</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Venda de Imóveis</li>
              <li className="text-gray-400">Locação de Imóveis</li>
              <li className="text-gray-400">Avaliação Imobiliária</li>
              <li className="text-gray-400">Consultoria Imobiliária</li>
              <li className="text-gray-400">Financiamento</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Av. Europa, 559<br />
                  Jardim Piza - Londrina/PR<br />
                  CEP: 86041-000
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <div className="text-gray-400 text-sm">
                  <div>(43) 3017-3121</div>
                  
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  contato@imobiliariamoderna.com.br
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Imobiliária Moderna. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacidade" className="text-gray-400 hover:text-white transition-colors duration-200">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="text-gray-400 hover:text-white transition-colors duration-200">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer