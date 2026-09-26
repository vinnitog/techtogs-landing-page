const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function contactEmail(lead, recipient) {
  return {
    from: 'TechTogs <support@techtogs.com.br>',
    to: [recipient],
    subject: `Novo contato TechTogs: ${lead.challenge}`,
    ...(EMAIL.test(lead.contact) ? { reply_to: lead.contact } : {}),
    text: [
      'Nova solicitação pelo site https://techtogs.com.br',
      '', `Nome: ${lead.name}`, `Empresa: ${lead.company || 'Não informada'}`,
      `Contato: ${lead.contact}`, `Desafio: ${lead.challenge}`, '', lead.message,
      '', `Identificador: ${lead.id}`, `Recebida em: ${lead.createdAt}`,
      'Consentimento para contato: confirmado.'
    ].join('\n')
  };
}

export async function sendContactEmail(lead, { apiKey, recipient, fetcher = fetch }) {
  if (!apiKey || !EMAIL.test(recipient)) throw new Error('Email configuration missing');
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json',
      'Idempotency-Key': `contact/${lead.id}`
    },
    body: JSON.stringify(contactEmail(lead, recipient)),
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error('Email delivery failed');
  const result = await response.json();
  if (!result.id) throw new Error('Email delivery unconfirmed');
  return result.id;
}
