'use client';

import { useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';
type View = 'visao-geral' | 'envio' | 'contatos' | 'aquecimento' | 'ia' | 'logs';
const navigation: { id: View; label: string; detail: string }[] = [
  { id: 'visao-geral', label: 'Visão geral', detail: 'Conectividade, operações em andamento e alertas.' },
  { id: 'envio', label: 'Envio padrão', detail: 'Grupo(s), contato único, lista de contatos ou todos os contatos da Evolution.' },
  { id: 'contatos', label: 'Contatos', detail: 'Adicionar manualmente, importar VCF/XLSX, ler ou puxar contatos da Evolution e exportar CSV/XLSX.' },
  { id: 'aquecimento', label: 'Aquecimento', detail: 'Rotina independente com limites, pausas, acompanhamento e logs próprios.' },
  { id: 'ia', label: 'IA e templates', detail: 'Provider, modelo, personas, regras e templates de mensagens.' },
  { id: 'logs', label: 'Logs', detail: 'Envio: somente sucesso/falha. Desenvolvimento: eventos e integrações detalhadas.' },
];

export default function Home() {
  const [view, setView] = useState<View>('visao-geral');
  const [apiState, setApiState] = useState<'checking' | 'online' | 'offline'>('checking');
  useEffect(() => { fetch(`${apiUrl}/health`).then((r) => setApiState(r.ok ? 'online' : 'offline')).catch(() => setApiState('offline')); }, []);
  const current = navigation.find((item) => item.id === view)!;
  return <main className="shell">
    <aside><h1>WhatsApp<br /><span>Control Center</span></h1><p className={`status ${apiState}`}>API {apiState === 'online' ? 'online' : apiState === 'offline' ? 'indisponível' : 'verificando...'}</p>
      <nav>{navigation.map((item) => <button className={item.id === view ? 'active' : ''} key={item.id} onClick={() => setView(item.id)}>{item.label}</button>)}</nav>
    </aside>
    <section className="content"><header><div><p className="eyebrow">OPERAÇÃO WEB</p><h2>{current.label}</h2><p>{current.detail}</p></div><button className="primary">+ Nova campanha</button></header>
      {view === 'visao-geral' && <div className="cards"><Card title="Evolution API" value="Verificar instância" text="O backend consulta a conexão real; não depende de PID ou arquivo local." /><Card title="Campanhas" value="0 ativas" text="Disparos são jobs duráveis no banco e continuam se o painel fechar." /><Card title="Logs" value="Separados" text="Envio e desenvolvimento têm telas e retenções diferentes." /></div>}
      {view === 'envio' && <div className="grid"><Action title="Por grupo(s)" text="Busca grupos, revisa participantes e cria a campanha." /><Action title="Contato único" text="Envio individual com preview e confirmação." /><Action title="Lista de contatos" text="Escolhe lista, acrescenta contatos ou importa arquivo." /><Action title="Todos os contatos" text="Puxa e filtra os contatos da instância Evolution." /></div>}
      {view === 'contatos' && <div className="panel"><h3>Fluxo de contatos</h3><ol><li>Cadastrar manualmente ou subir VCF/XLSX.</li><li>Ler/puxar contatos e grupos da Evolution.</li><li>Revisar, deduplicar, bloquear e classificar.</li><li>Exportar seleção para CSV/XLSX.</li></ol></div>}
      {view === 'aquecimento' && <div className="panel"><h3>Aquecimento é uma operação separada</h3><p>Tem campanhas, limites diários, espera de resposta, pausa/cancelamento e histórico próprios. Não mistura métricas nem logs com disparo padrão.</p></div>}
      {view === 'ia' && <div className="panel"><h3>IA configurável por campanha</h3><p>O painel terá provider/modelo, teste de conexão, persona, regras e preview antes de entrar na fila.</p></div>}
      {view === 'logs' && <div className="grid"><Action title="Logs de envio" text="Destinatário, campanha, data, sucesso/falha e motivo." /><Action title="Logs de desenvolvimento" text="Requisições, tempo, job, erro e contexto sanitizado — sem tokens." /></div>}
    </section>
  </main>;
}
function Card({ title, value, text }: { title: string; value: string; text: string }) { return <article className="card"><p>{title}</p><strong>{value}</strong><small>{text}</small></article>; }
function Action({ title, text }: { title: string; text: string }) { return <article className="action"><h3>{title}</h3><p>{text}</p><button>Configurar →</button></article>; }

