/**
 * Branded HTML email templates for Escuela Segura.
 * All templates share a consistent layout with header and footer.
 * All content is in Spanish.
 */

// ─── Base layout ─────────────────────────────────────────────

function layout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background-color:#111827;padding:24px 32px;text-align:center;">
  <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Escuela Segura</span>
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
<td style="padding:24px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
  <p style="margin:0;font-size:12px;color:#9ca3af;">
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
  return `<p style="margin:0 0 16px;font-size:16px;color:#374151;">Hola <strong>${name}</strong>,</p>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${label}</td>
    <td style="padding:8px 12px;font-size:14px;color:#111827;font-weight:500;border-bottom:1px solid #f3f4f6;text-align:right;">${value}</td>
  </tr>`;
}

function infoTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
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
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      ¡Tu suscripción a Escuela Segura está activa! Ya podés comenzar a gestionar
      la seguridad de tu institución.
    </p>
    ${infoTable(
      infoRow('Plan', planName) +
      infoRow('Monto mensual', formatCurrency(amount, currency))
    )}
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">
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
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      Tu pago fue procesado exitosamente. Acá tenés el detalle:
    </p>
    ${infoTable(
      infoRow('Plan', planName) +
      infoRow('Monto', formatCurrency(amount, currency)) +
      infoRow('Fecha', formatDate(date))
    )}
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">
      Este recibo es solo informativo. Podés ver tu historial de pagos completo en Configuración.
    </p>
  `);
}

/** Sent when the payment card is changed (MP only). */
export function cardChangedEmail(name: string, last4: string): string {
  return layout('Medio de pago actualizado', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      Tu medio de pago fue actualizado correctamente.
    </p>
    ${infoTable(
      infoRow('Tarjeta', `•••• •••• •••• ${last4}`)
    )}
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">
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
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      Tu plan fue actualizado exitosamente.
    </p>
    ${infoTable(
      infoRow('Plan anterior', oldPlan) +
      infoRow('Nuevo plan', newPlan) +
      infoRow('Nuevo monto mensual', formatCurrency(newAmount, currency))
    )}
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">
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
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      Tu suscripción a Escuela Segura fue cancelada.
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      ${accessMsg} Después de esa fecha, no podrás acceder a las funcionalidades del plan.
    </p>
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">
      Podés reactivar tu suscripción en cualquier momento desde Configuración.
    </p>
  `);
}

/** Sent when a subscription is suspended. */
export function subscriptionSuspendedEmail(name: string): string {
  return layout('Suscripción suspendida', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      Tu suscripción a Escuela Segura fue suspendida. Mientras esté suspendida,
      no tendrás acceso a las funcionalidades del plan.
    </p>
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">
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
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
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
        <td style="padding:8px 12px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${item.name}</td>
        <td style="padding:8px 12px;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${item.type}</td>
        <td style="padding:8px 12px;font-size:14px;border-bottom:1px solid #f3f4f6;text-align:right;${
          item.daysLeft <= 3 ? 'color:#dc2626;font-weight:600;' : 'color:#374151;'
        }">${item.daysLeft <= 0 ? 'Vencido' : `${item.daysLeft} días`}</td>
      </tr>
    `).join('');
  }

  function section(title: string, color: string, list: typeof items): string {
    if (list.length === 0) return '';
    return `
      <p style="margin:16px 0 8px;font-size:14px;font-weight:600;color:${color};">${title}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr style="background-color:#f9fafb;">
          <th style="padding:8px 12px;font-size:12px;color:#6b7280;text-align:left;font-weight:500;">Nombre</th>
          <th style="padding:8px 12px;font-size:12px;color:#6b7280;text-align:left;font-weight:500;">Tipo</th>
          <th style="padding:8px 12px;font-size:12px;color:#6b7280;text-align:right;font-weight:500;">Vencimiento</th>
        </tr>
        ${itemRows(list)}
      </table>
    `;
  }

  return layout('Vencimientos próximos', `
    ${greeting(name)}
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      Tenés <strong>${items.length}</strong> elemento${items.length > 1 ? 's' : ''} con vencimiento próximo
      que requieren tu atención:
    </p>
    ${section('Urgente — menos de 3 días', '#dc2626', urgentItems)}
    ${section('Atención — menos de 10 días', '#d97706', warningItems)}
    ${section('Aviso — menos de 30 días', '#2563eb', noticeItems)}
    <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">
      Ingresá a Escuela Segura para gestionar estos vencimientos.
    </p>
  `);
}
