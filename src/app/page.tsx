'use client';

import Link from 'next/link';
import { Motion, spring } from 'react-motion';
import { Search, Radio, BookOpen, Settings } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

export default function Home() {
  const introRef = useInView();
  const responsabilitiesRef = useInView();
  return (
    <div className="w-full min-h-screen">
      <section className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <Motion defaultStyle={{ opacity: 0, y: -40 }} style={{ opacity: spring(1), y: spring(0) }}>
            {(style) => (
              <>
                <h1 className="text-7xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500" style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                  V.I.G.I.A.
                </h1>
                <p className="text-xl md:text-2xl text-orange-300 mb-8 font-light">Os Guardiões do Fluxo Temporal</p>
              </>
            )}
          </Motion>

          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 300 }), y: spring(0, { delay: 300 }) }}>
            {(style) => (
              <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed" style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                "O tempo é um tecido que sangra. Nós somos os que contam as gotas."
              </p>
            )}
          </Motion>

          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 600 }), y: spring(0, { delay: 600 }) }}>
            {(style) => (
              <div className="flex flex-col md:flex-row gap-4 justify-center" style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                <Link href="/characters" className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-lg">
                  Explorar Missões
                </Link>
                <Link href="/ranking" className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition border border-slate-500">
                  Ranking Global
                </Link>
              </div>
            )}
          </Motion>
        </div>

        <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 1200 }) }}>
          {(style) => (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" style={{ opacity: style.opacity }}>
              <div className="animate-bounce text-orange-400 text-2xl">↓</div>
            </div>
          )}
        </Motion>
      </section>

      <section className="w-full py-20 px-6 bg-slate-800 flex justify-center" ref={introRef.ref}>
        <div className="w-full max-w-5xl">
          <Motion defaultStyle={{ opacity: 0, y: 40 }} style={{ opacity: introRef.isInView ? spring(1) : spring(0), y: introRef.isInView ? spring(0) : spring(40) }}>
            {(style) => (
              <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                <p className="text-center text-gray-200 text-lg leading-relaxed mb-8">
                  Nós somos o grupo responsável por ser os olhos que a história não possui. Enquanto as equipes de campo mergulham nas rupturas do passado, a V.I.G.I.A. permanece na frequência estática, filtrando o ruído entre o que deveria ser e o que o Paranormal corrompeu.
                </p>
                <p className="text-center text-gray-300 text-lg leading-relaxed">
                  Nossa jurisdição não é o combate, mas a verdade absoluta. Se uma missão falha e ninguém retorna para relatar, para o mundo a história mudou para sempre. Para a V.I.G.I.A., aquele evento se torna um log de sistema — uma cicatriz que precisamos documentar.
                </p>
              </div>
            )}
          </Motion>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-800 flex justify-center" ref={responsabilitiesRef.ref}>
        <div className="w-full max-w-6xl">
          <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 300 }) }}>
            {(style) => (
              <div className="text-center mb-16" style={{ opacity: style.opacity }}>
                <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4">
                  Nossas Responsabilidades
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto"></div>
              </div>
            )}
          </Motion>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                title: "Triagem de Anomalias Históricas",
                icon: <Search className="w-12 h-12 text-blue-400" />,
                description: "Detectamos flutuações no fluxo temporal. Se um imperador morre antes da hora ou se um ritual em 1800 ecoa em 2026, nossos terminais são os primeiros a soar o alarme.",
                delay: 600
              },
              {
                title: "Monitoramento de Vetores",
                icon: <Radio className="w-12 h-12 text-blue-400" />,
                description: "Acompanhamos em tempo real o status vital e a Exposição Paranormal (NEX) de cada equipe. Se seu relógio biológico dessincronizar com o tempo presente, seremos os primeiros a saber.",
                delay: 800
              },
              {
                title: "Catalogação do Ocultismo",
                icon: <BookOpen className="w-12 h-12 text-blue-400" />,
                description: "Cada entidade enfrentada, ritual descoberto e artefato recuperado é processado e indexado em nosso banco de dados confidencial para uso futuro da Ordem.",
                delay: 1000
              },
              {
                title: "Gestão de Limbo e Expurgos",
                icon: <Settings className="w-12 h-12 text-blue-400" />,
                description: "Quando uma linha do tempo é 'corrigida', os resíduos de realidade são arquivados por nós. O que o mundo esquece, nós guardamos em servidores isolados.",
                delay: 1200
              }
            ].map((item, index) => (
              <Motion
                key={index}
                defaultStyle={{ opacity: 0, y: 40 }}
                style={{ opacity: responsabilitiesRef.isInView ? spring(1, { delay: item.delay }) : spring(0), y: responsabilitiesRef.isInView ? spring(0, { delay: item.delay }) : spring(40) }}
              >
                {(style) => (
                  <div
                    className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-8 transition transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
                    style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                  >
                    <div className="mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-orange-400 mb-4">{item.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{item.description}</p>
                  </div>
                )}
              </Motion>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-slate-800 flex justify-center">
        <div className="w-full max-w-4xl">
          <Motion defaultStyle={{ opacity: 0, y: 40 }} style={{ opacity: spring(1), y: spring(0) }}>
            {(style) => (
              <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Pronto para se juntar?
                </h3>
                <p className="text-gray-300 text-xl mb-8">
                  Explore as missões disponíveis e descubra seu potencial como agente da V.I.G.I.A.
                </p>
                <Link
                  href="/characters"
                  className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-lg"
                >
                  Começar Agora
                </Link>
              </div>
            )}
          </Motion>
        </div>
      </section>
    </div>
  );
}
