const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const form = document.querySelector('#contact-form');
const dialog = document.querySelector('#project-dialog');
const isStaticDemo = document.documentElement.dataset.hosting === 'static';
let restoreMenuFocus = true;

if (isStaticDemo) form.querySelector('[type=submit]').disabled = false;

function closeMenu() {
  if (mobileNav.open) mobileNav.close();
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
}

menuToggle.addEventListener('click', () => {
  restoreMenuFocus = true;
  mobileNav.showModal();
  document.body.style.overflow = 'hidden';
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Fechar menu');
});
mobileNav.querySelector('.mobile-nav-close').addEventListener('click', closeMenu);
mobileNav.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  restoreMenuFocus = false;
  closeMenu();
});
mobileNav.addEventListener('close', () => {
  document.body.style.overflow = '';
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  if (restoreMenuFocus) menuToggle.focus();
});
window.matchMedia('(min-width: 1024px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const sectionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    navLinks.forEach(link => {
      const active = link.hash === `#${entry.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-15% 0px -65% 0px' });
sections.forEach(section => sectionObserver.observe(section));
document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelectorAll('[data-challenge]').forEach(link => {
  link.addEventListener('click', () => { form.elements.challenge.value = link.dataset.challenge; });
});

const projectDetails = {
  central: {
    title: 'Sua operação em uma central.',
    problem: 'Pedidos em uma planilha, contatos no WhatsApp e informações que dependem de alguém procurar. Fica difícil saber o que precisa de atenção.',
    solution: 'Um sistema personalizado para acompanhar clientes e pedidos em um só lugar, com telas desenhadas para a rotina da equipe.',
    features: ['Cadastro e histórico dos clientes', 'Acompanhamento de pedidos por etapa', 'Painel com a visão da operação', 'Filtros, busca e níveis de acesso'],
    challenge: 'Sistema interno'
  },
  atendimento: {
    title: 'Um próximo passo para cada conversa.',
    problem: 'A equipe responde às mesmas perguntas enquanto novos clientes ficam esperando. Solicitações importantes se perdem entre as mensagens.',
    solution: 'Um fluxo de atendimento que identifica a necessidade, organiza as informações e encaminha a conversa para a pessoa certa quando necessário.',
    features: ['Triagem das solicitações', 'Respostas baseadas nas informações da empresa', 'Encaminhamento para atendimento humano', 'Histórico conectado ao sistema interno'],
    challenge: 'Atendimento pelo WhatsApp'
  },
  integracao: {
    title: 'Informação que chega onde precisa.',
    problem: 'Cada ferramenta tem uma parte da informação. Copiar dados entre sistemas ocupa tempo e abre espaço para erros.',
    solution: 'Uma integração desenhada a partir das ferramentas já utilizadas, das permissões disponíveis e do caminho que cada informação precisa percorrer.',
    features: ['Sincronização de clientes e pedidos', 'Conexão entre APIs e bancos de dados', 'Notificações de eventos importantes', 'Registro de operações e tratamento de falhas'],
    challenge: 'Integração entre ferramentas'
  }
};

function showProject(key) {
  const project = projectDetails[key];
  document.querySelector('#dialog-title').textContent = project.title;
  const content = document.querySelector('#dialog-content');
  content.replaceChildren();
  for (const [title, description] of [['O desafio', project.problem], ['O que podemos construir', project.solution]]) {
    const heading = document.createElement('h3');
    heading.textContent = title;
    const paragraph = document.createElement('p');
    paragraph.textContent = description;
    content.append(heading, paragraph);
  }
  const list = document.createElement('ul');
  project.features.forEach(feature => {
    const item = document.createElement('li');
    item.textContent = feature;
    list.append(item);
  });
  content.append(list);
  document.querySelector('#dialog-cta').dataset.challenge = project.challenge;
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => showProject(button.dataset.project)));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
document.querySelector('#dialog-cta').addEventListener('click', event => {
  form.elements.challenge.value = event.currentTarget.dataset.challenge;
  dialog.close();
});

const simulateButton = document.querySelector('#simulate-flow');
const flowStatus = document.querySelector('#flow-status');
const flowVisual = document.querySelector('.hero-visual');
let isSimulating = false;
const flowSteps = [
  ['.flow-input', 'Nova mensagem recebida.'],
  ['.flow-ai', 'IA identificando a solicitação…'],
  ['.flow-outputs .output-node:first-child', 'Informações organizadas no sistema.'],
  ['.flow-outputs .output-node:last-child', 'Pronto! Cliente encaminhado.']
];
simulateButton.addEventListener('click', async () => {
  if (isSimulating) return;
  isSimulating = true;
  simulateButton.setAttribute('aria-busy', 'true');
  simulateButton.setAttribute('aria-disabled', 'true');
  flowVisual.classList.add('is-simulating');
  try {
    for (const [selector, message] of flowSteps) {
      document.querySelectorAll('.is-running').forEach(node => node.classList.remove('is-running'));
      document.querySelector(selector).classList.add('is-running');
      flowStatus.textContent = message;
      window.dispatchEvent(new CustomEvent('techtogs:flow-step', { detail: { selector } }));
      await new Promise(resolve => setTimeout(resolve, 950));
    }
    flowStatus.textContent = 'Demonstração concluída. Tudo conectado.';
  } finally {
    document.querySelectorAll('.is-running').forEach(node => node.classList.remove('is-running'));
    flowVisual.classList.remove('is-simulating');
    simulateButton.removeAttribute('aria-busy');
    simulateButton.removeAttribute('aria-disabled');
    isSimulating = false;
  }
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidContact(value) {
  return emailPattern.test(value) || (/^[+()\d\s.-]+$/.test(value) && value.replace(/\D/g, '').length >= 10 && value.replace(/\D/g, '').length <= 15);
}
const contactInput = form.elements.contact;
const contactError = document.createElement('span');
contactError.id = 'contact-error';
contactError.className = 'field-error';
contactInput.after(contactError);
contactInput.setAttribute('aria-describedby', contactError.id);
contactInput.addEventListener('input', () => {
  contactInput.setCustomValidity('');
  contactInput.removeAttribute('aria-invalid');
  contactError.textContent = '';
});
let isSubmitting = false;
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (isSubmitting) return;
  const data = Object.fromEntries(new FormData(form));
  const status = form.querySelector('.form-status');
  if (!isValidContact(data.contact.trim())) {
    const message = 'Informe um e-mail válido ou WhatsApp com DDD.';
    contactInput.setCustomValidity(message);
    contactInput.setAttribute('aria-invalid', 'true');
    contactError.textContent = message;
    contactInput.reportValidity();
    return;
  }
  const submitButton = form.querySelector('[type=submit]');
  if (isStaticDemo) {
    status.classList.remove('error');
    status.textContent = 'Simulação concluída! Esta é uma demonstração: nenhum dado foi enviado ou armazenado e a equipe não receberá esta solicitação.';
    form.reset();
    return;
  }
  isSubmitting = true;
  const originalMarkup = submitButton.innerHTML;
  submitButton.setAttribute('aria-busy', 'true');
  submitButton.setAttribute('aria-disabled', 'true');
  submitButton.textContent = 'Enviando seu desafio…';
  status.classList.remove('error');
  status.textContent = '';
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, consent: data.consent === 'on' }),
      signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Não foi possível enviar sua mensagem. Tente novamente.');
    status.textContent = result.message;
    form.reset();
  } catch (error) {
    status.classList.add('error');
    status.textContent = error.name === 'TimeoutError'
      ? 'O envio demorou mais que o esperado. Verifique sua conexão e tente novamente.'
      : error instanceof TypeError || error instanceof SyntaxError
        ? 'Não foi possível conectar ao formulário. Tente novamente em alguns instantes.'
        : error.message;
  } finally {
    submitButton.innerHTML = originalMarkup;
    submitButton.removeAttribute('aria-busy');
    submitButton.removeAttribute('aria-disabled');
    isSubmitting = false;
  }
});

if (!isStaticDemo) fetch('/api/config').then(response => response.json()).then(config => {
  if (config.demo) {
    form.querySelector('.form-footnote').textContent = 'Prévia: solicitações registradas apenas neste ambiente.';
  }
  if (config.contactAvailable === false) {
    form.querySelector('[type=submit]').disabled = true;
    form.querySelector('.form-footnote').textContent = 'Formulário temporariamente indisponível. Fale conosco pelos contatos ao lado.';
  }
  const contacts = document.querySelector('.configured-contacts');
  if (config.email && emailPattern.test(config.email) && !contacts.querySelector('a[href^="mailto:"]')) {
    const link = document.createElement('a');
    link.href = `mailto:${config.email}`;
    link.textContent = config.email;
    contacts.append(link);
  }
  contacts.hidden = !contacts.childElementCount;
}).catch(() => {});
