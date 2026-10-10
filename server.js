import http from 'node:http';
import { readFile, mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import { sendContactEmail } from './contact-email.js';
import { publicRepresentation } from './static-response.js';
import { validateContactAttempt } from './contact-request.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || (process.env.RAILWAY_ENVIRONMENT_ID ? '0.0.0.0' : '127.0.0.1');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const WEBHOOK_URL = process.env.CONTACT_WEBHOOK_URL || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const CONTACT_RECIPIENT = process.env.CONTACT_RECIPIENT || '';
const EMAIL_READY = Boolean(RESEND_API_KEY && CONTACT_RECIPIENT);
const PRODUCTION = process.env.NODE_ENV === 'production';
const CHALLENGES = new Set(['Atendimento pelo WhatsApp', 'Tarefas manuais', 'Organização de clientes ou pedidos', 'Integração entre ferramentas', 'Sistema interno', 'Automação com inteligência artificial', 'Ainda não sei exatamente']);
const STATIC_FILES = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/motion', ['motion.html', 'text/html']],
  ['/motion.html', ['motion.html', 'text/html']],
  ['/gsap', ['gsap.html', 'text/html']],
  ['/gsap.html', ['gsap.html', 'text/html']],
  ['/motion-gsap', ['motion-gsap.html', 'text/html']],
  ['/motion-gsap.html', ['motion-gsap.html', 'text/html']],
  ['/assets/variants/motion.js', ['assets/variants/motion.js', 'text/javascript']],
  ['/assets/variants/gsap.js', ['assets/variants/gsap.js', 'text/javascript']],
  ['/assets/variants/motion-gsap.js', ['assets/variants/motion-gsap.js', 'text/javascript']],
  ['/sistemas-sob-medida', ['sistemas-sob-medida.html', 'text/html']],
  ['/sistemas-sob-medida.html', ['sistemas-sob-medida.html', 'text/html']],
  ['/politica-de-privacidade', ['politica-de-privacidade.html', 'text/html']],
  ['/politica-de-privacidade.html', ['politica-de-privacidade.html', 'text/html']],
  ['/styles.css', ['styles.css', 'text/css']],
  ['/app.js', ['app.js', 'text/javascript']],
  ['/contact-request.js', ['contact-request.js', 'text/javascript']],
  ['/assets/symbol.svg', ['assets/symbol.svg', 'image/svg+xml']],
  ['/assets/logo.svg', ['assets/logo.svg', 'image/svg+xml']],
  ['/assets/logo-mono.svg', ['assets/logo-mono.svg', 'image/svg+xml']],
  ['/assets/techtogs-logo.jpeg', ['assets/techtogs-logo.jpeg', 'image/jpeg']],
  ['/assets/brand-horizontal.svg', ['assets/brand-horizontal.svg', 'image/svg+xml']],
  ['/assets/brand-symbol.svg', ['assets/brand-symbol.svg', 'image/svg+xml']],
  ['/assets/favicon.svg', ['assets/favicon.svg', 'image/svg+xml']],
  ['/robots.txt', ['robots.txt', 'text/plain']],
  ['/sitemap.xml', ['sitemap.xml', 'application/xml']]
]);
const submissions = new Map();
const RATE_WINDOW = 15 * 60 * 1000;
setInterval(() => {
  for (const [key, value] of submissions) if (Date.now() - value.start > RATE_WINDOW) submissions.delete(key);
}, RATE_WINDOW).unref();

function sendJson(response, code, data) {
  response.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
}

async function receiveContact(request, response) {
  const origin = request.headers.origin;
  if (origin && origin !== `http://${request.headers.host}` && origin !== `https://${request.headers.host}`) {
    return sendJson(response, 403, { message: 'Origem da solicitação não permitida.' });
  }
  if (!request.headers['content-type']?.startsWith('application/json')) {
    return sendJson(response, 415, { message: 'Formato de envio inválido.' });
  }
  const forwarded = request.headers['x-forwarded-for']?.split(',').at(-1)?.trim();
  const client = process.env.RAILWAY_ENVIRONMENT_ID && isIP(forwarded || '') ? forwarded : request.socket.remoteAddress;
  const rate = submissions.get(client);
  if (rate && Date.now() - rate.start < RATE_WINDOW && rate.count >= 8) {
    response.setHeader('Retry-After', '900');
    return sendJson(response, 429, { message: 'Muitas solicitações em pouco tempo. Aguarde alguns minutos e tente novamente.' });
  }
  const chunks = [];
  let size = 0;
  let inputValidated = false;
  try {
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 20000) return sendJson(response, 413, { message: 'A mensagem é muito longa.' });
      chunks.push(chunk);
    }
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid');
    if (input.website) return sendJson(response, 400, { message: 'Não foi possível enviar sua mensagem.' });
    const fields = ['name', 'company', 'contact', 'challenge', 'message'];
    if (fields.some(key => input[key] !== undefined && typeof input[key] !== 'string')) throw new Error('invalid');
    const data = Object.fromEntries(fields.map(key => [key, (input[key] || '').trim()]));
    const digits = data.contact.replace(/\D/g, '');
    const validContact = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact) || (/^[+()\d\s.-]+$/.test(data.contact) && digits.length >= 10 && digits.length <= 15);
    if (data.name.length < 2 || data.name.length > 120 || data.company.length > 160 || !validContact || data.contact.length > 180 || !CHALLENGES.has(data.challenge) || data.message.length < 10 || data.message.length > 5000 || input.consent !== true) {
      return sendJson(response, 400, { message: 'Verifique seu nome, contato, desafio e mensagem, e confirme o consentimento.' });
    }
    const identity = validateContactAttempt(input) || { id: randomUUID(), createdAt: new Date().toISOString() };
    inputValidated = true;
    const lead = { ...identity, ...data, consent: true, privacyVersion: '2026-09-26' };
    if (rate && Date.now() - rate.start < RATE_WINDOW) rate.count++;
    else submissions.set(client, { start: Date.now(), count: 1 });
    if (EMAIL_READY) {
      await sendContactEmail(lead, { apiKey: RESEND_API_KEY, recipient: CONTACT_RECIPIENT });
    } else if (WEBHOOK_URL) {
      const result = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(process.env.CONTACT_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.CONTACT_WEBHOOK_TOKEN}` } : {}) },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(10000)
      });
      if (!result.ok) throw new Error('delivery');
    } else if (PRODUCTION) {
      return sendJson(response, 503, { message: 'O formulário está temporariamente indisponível. Escreva para support@techtogs.com.br.' });
    } else {
      await mkdir(DATA_DIR, { recursive: true });
      await appendFile(path.join(DATA_DIR, 'leads.jsonl'), `${JSON.stringify(lead)}\n`, 'utf8');
    }
    return sendJson(response, 201, {
      message: EMAIL_READY || WEBHOOK_URL
        ? 'Recebemos sua mensagem. Em breve, entraremos em contato para entender melhor o seu cenário.'
        : 'Seu desafio foi registrado nesta prévia. O envio para a equipe ainda não está conectado; nenhum e-mail ou WhatsApp foi enviado.',
      id: lead.id
    });
  } catch (error) {
    if (!inputValidated && [400, 409].includes(error.status)) return sendJson(response, error.status, { message: error.message });
    if (!inputValidated && (error instanceof SyntaxError || error.message === 'invalid')) return sendJson(response, 400, { message: 'Dados inválidos. Verifique os campos e tente novamente.' });
    console.error('Falha no recebimento de contato:', error.name);
    return sendJson(response, 503, { message: 'Não foi possível confirmar o recebimento da sua mensagem. Confira com a equipe pelos contatos da página antes de reenviar.' });
  }
}

const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  let pathname;
  try { pathname = new URL(request.url, 'http://localhost').pathname; }
  catch { return sendJson(response, 400, { message: 'Endereço inválido.' }); }
  if (request.headers.host?.split(':')[0].toLowerCase() === 'www.techtogs.com.br') {
    const target = new URL(request.url, 'https://techtogs.com.br');
    response.writeHead(308, { Location: `https://techtogs.com.br${target.pathname}${target.search}` });
    return response.end();
  }
  if (pathname === '/api/contact' && request.method === 'POST') return receiveContact(request, response);
  if (!['GET', 'HEAD'].includes(request.method)) return sendJson(response, 405, { message: 'Método não permitido.' });
  if (pathname === '/health') return sendJson(response, 200, { status: 'ok' });
  if (pathname === '/api/config') return sendJson(response, 200, { email: 'support@techtogs.com.br', whatsapp: '5514959781077', demo: !PRODUCTION && !EMAIL_READY && !WEBHOOK_URL, contactAvailable: !PRODUCTION || EMAIL_READY || Boolean(WEBHOOK_URL) });
  const file = STATIC_FILES.get(pathname);
  if (!file) { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return response.end('Página não encontrada.'); }
  try {
    const content = await readFile(path.join(ROOT, file[0]));
    const representation = await publicRepresentation(content, file[1], request.headers);
    response.writeHead(representation.status, representation.headers);
    response.end(request.method === 'HEAD' || representation.status !== 200 ? undefined : representation.body);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Não foi possível carregar esta página.');
  }
});

server.requestTimeout = 20000;
server.listen(PORT, HOST, () => console.log(`TechTogs disponível em http://${HOST}:${server.address().port}`));
