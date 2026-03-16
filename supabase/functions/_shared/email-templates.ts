/**
 * Branded HTML email templates for Escuela Segura.
 * All templates share a consistent layout with header and footer.
 * All content is in Spanish.
 *
 * Design tokens (from globals.css):
 *   --primary: #18181b  --primary-foreground: #fafafa
 *   --foreground: #09090b  --muted-foreground: #71717a
 *   --muted: #f4f4f5  --border: #e4e4e7  --background: #ffffff
 *   --radius: 10px  --info: #2563eb  --destructive: #e40014
 */

// ─── HTML escaping (XSS prevention) ────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ─── Base layout ─────────────────────────────────────────────

function layout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e4e4e7;">

<!-- Header -->
<tr>
<td style="background-color:#18181b;padding:20px 32px;">
  <table cellpadding="0" cellspacing="0"><tr>
    <td style="background-color:#ffffff;border-radius:6px;width:28px;height:28px;text-align:center;vertical-align:middle;">
      <span style="font-size:11px;font-weight:700;color:#18181b;line-height:28px;">ES</span>
    </td>
    <td style="padding-left:10px;">
      <span style="font-size:16px;font-weight:700;color:#fafafa;letter-spacing:0.3px;">Escuela Segura</span>
    </td>
  </tr></table>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:32px;">
  ${content}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
  <p style="margin:0;font-size:12px;color:#71717a;">
    Este email fue enviado por Escuela Segura.<br>
    Si no esperabas este mensaje, podés ignorarlo.
  </p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Shared helpers ──────────────────────────────────────────

function greeting(name: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;color:#09090b;">Hola <strong>${escapeHtml(name)}</strong>,</p>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:14px;color:#71717a;border-bottom:1px solid #f4f4f5;">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;font-size:14px;color:#09090b;font-weight:500;border-bottom:1px solid #f4f4f5;text-align:right;">${escapeHtml(value)}</td>
  </tr>`;
}

function infoTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;">
    ${rows}
  </table>`;
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'USD') return `US$${amount.toFixed(2)}`;
  if (currency === 'ARS') return `$${amount.toLocaleString('es-AR')}`;
  return `${currency} ${amount}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Templates ───────────────────────────────────────────────

/** Sent when a subscription is activated. */
export function subscriptionActivatedEmail(
  name: string,
  planName: string,
  amount: number,
  currency: string,
): string {
  return layout('Suscripción activa', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#09090b;">
      ¡Tu suscripción a Escuela Segura está activa! Ya podés comenzar a gestionar
      la seguridad de tu institución.
    </p>
    ${infoTable(
      infoRow('Plan', planName) +
      infoRow('Monto mensual', formatCurrency(amount, currency))
    )}
    <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
      Podés gestionar tu suscripción desde la sección de Configuración en cualquier momento.
    </p>
  `);
}

/** Sent on each successful payment. */
export function paymentReceiptEmail(
  name: string,
  amount: number,
  currency: string,
  date: string,
  planName: string,
): string {
  return layout('Recibo de pago', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#09090b;">
      Tu pago fue procesado exitosamente. Acá tenés el detalle:
    </p>
    ${infoTable(
      infoRow('Plan', planName) +
      infoRow('Monto', formatCurrency(amount, currency)) +
      infoRow('Fecha', formatDate(date))
    )}
    <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
      Este recibo es solo informativo. Podés ver tu historial de pagos completo en Configuración.
    </p>
  `);
}

/** Sent when the payment card is changed (MP only). */
export function cardChangedEmail(name: string, last4: string): string {
  return layout('Medio de pago actualizado', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#09090b;">
      Tu medio de pago fue actualizado correctamente.
    </p>
    ${infoTable(
      infoRow('Tarjeta', `•••• •••• •••• ${last4}`)
    )}
    <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
      Si no realizaste este cambio, contactanos de inmediato.
    </p>
  `);
}

/** Sent when the subscription plan is changed. */
export function planChangedEmail(
  name: string,
  oldPlan: string,
  newPlan: string,
  newAmount: number,
  currency: string,
): string {
  return layout('Cambio de plan', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#09090b;">
      Tu plan fue actualizado exitosamente.
    </p>
    ${infoTable(
      infoRow('Plan anterior', oldPlan) +
      infoRow('Nuevo plan', newPlan) +
      infoRow('Nuevo monto mensual', formatCurrency(newAmount, currency))
    )}
    <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
      El cambio se aplicará en tu próximo ciclo de facturación.
    </p>
  `);
}

/** Sent when a subscription is cancelled. */
export function subscriptionCancelledEmail(
  name: string,
  periodEnd: string | null,
): string {
  const accessMsg = periodEnd
    ? `Vas a mantener acceso hasta el <strong>${formatDate(periodEnd)}</strong>.`
    : 'Tu acceso se mantendrá hasta el final del período actual.';

  return layout('Suscripción cancelada', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#09090b;">
      Tu suscripción a Escuela Segura fue cancelada.
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#09090b;">
      ${accessMsg} Después de esa fecha, no podrás acceder a las funcionalidades del plan.
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
      Podés reactivar tu suscripción en cualquier momento desde Configuración.
    </p>
  `);
}

/** Sent when a subscription is suspended. */
export function subscriptionSuspendedEmail(name: string): string {
  return layout('Suscripción suspendida', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#09090b;">
      Tu suscripción a Escuela Segura fue suspendida. Mientras esté suspendida,
      no tendrás acceso a las funcionalidades del plan.
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
      Podés reactivarla en cualquier momento desde la sección de Configuración.
    </p>
  `);
}

/** Sent when a subscription is reactivated. */
export function subscriptionReactivatedEmail(
  name: string,
  planName: string,
): string {
  return layout('Suscripción reactivada', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#09090b;">
      ¡Tu suscripción fue reactivada exitosamente! Ya tenés acceso completo a Escuela Segura.
    </p>
    ${infoTable(
      infoRow('Plan', planName)
    )}
  `);
}

/** Sent as a digest of upcoming expirations. */
export function expirationWarningEmail(
  name: string,
  items: Array<{ type: string; name: string; expiresAt: string; daysLeft: number }>,
): string {
  const urgentItems = items.filter((i) => i.daysLeft <= 3);
  const warningItems = items.filter((i) => i.daysLeft > 3 && i.daysLeft <= 10);
  const noticeItems = items.filter((i) => i.daysLeft > 10);

  function itemRows(list: typeof items): string {
    return list.map((item) => `
      <tr>
        <td style="padding:8px 12px;font-size:14px;color:#09090b;border-bottom:1px solid #f4f4f5;">${escapeHtml(item.name)}</td>
        <td style="padding:8px 12px;font-size:14px;color:#71717a;border-bottom:1px solid #f4f4f5;">${escapeHtml(item.type)}</td>
        <td style="padding:8px 12px;font-size:14px;border-bottom:1px solid #f4f4f5;text-align:right;${
          item.daysLeft <= 3 ? 'color:#e40014;font-weight:600;' : 'color:#09090b;'
        }">${item.daysLeft <= 0 ? 'Vencido' : `${item.daysLeft} días`}</td>
      </tr>
    `).join('');
  }

  function section(title: string, color: string, list: typeof items): string {
    if (list.length === 0) return '';
    return `
      <p style="margin:16px 0 8px;font-size:14px;font-weight:600;color:${color};">${title}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;">
        <tr style="background-color:#fafafa;">
          <th style="padding:8px 12px;font-size:12px;color:#71717a;text-align:left;font-weight:500;">Nombre</th>
          <th style="padding:8px 12px;font-size:12px;color:#71717a;text-align:left;font-weight:500;">Tipo</th>
          <th style="padding:8px 12px;font-size:12px;color:#71717a;text-align:right;font-weight:500;">Vencimiento</th>
        </tr>
        ${itemRows(list)}
      </table>
    `;
  }

  return layout('Vencimientos próximos', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#09090b;">
      Tenés <strong>${items.length}</strong> elemento${items.length > 1 ? 's' : ''} con vencimiento próximo
      que requieren tu atención:
    </p>
    ${section('Urgente — menos de 3 días', '#e40014', urgentItems)}
    ${section('Atención — menos de 10 días', '#d97706', warningItems)}
    ${section('Aviso — menos de 30 días', '#2563eb', noticeItems)}
    <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
      Ingresá a Escuela Segura para gestionar estos vencimientos.
    </p>
  `);
}
