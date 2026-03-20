const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

function fNum(n) {
    return Number(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 });
}

function fFecha(d) {
    if (!d) return '—';
    const str = typeof d === 'string' ? d : d.toISOString();
    return new Date(str.includes('T') ? str : str + 'T00:00:00')
        .toLocaleDateString('es-HN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function htmlBase(contenido) {
    return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #EDD5DE;">
        <div style="background:linear-gradient(135deg,#880E4F,#C2185B);padding:28px 32px;">
            <h1 style="color:#fff;margin:0;font-size:1.3rem;">🌈 Rainbow School</h1>
            <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:0.85rem;">Sistema de Crédito Escolar · EduCredit</p>
        </div>
        <div style="padding:28px 32px;">${contenido}</div>
        <div style="background:#FDF8FA;padding:14px 32px;text-align:center;border-top:1px solid #EDD5DE;">
            <p style="color:#C9A0AE;font-size:0.75rem;margin:0;">Rainbow School · Este es un correo automático, no responder.</p>
        </div>
    </div>`;
}


async function enviarFacturaGenerada(factura, detalles, padre) {
    if (!padre?.email) return;

    const filas = detalles.map(d => `
        <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #F2D4DA;color:#3D1A22;">${d.descripcion ?? '—'}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #F2D4DA;text-align:center;color:#3D1A22;">${d.cantidad}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #F2D4DA;text-align:right;color:#3D1A22;">L ${fNum(d.precio_unitario)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #F2D4DA;text-align:right;font-weight:700;color:#C2185B;">L ${fNum(d.total)}</td>
        </tr>`).join('');

    const contenido = `
        <p style="color:#3D1A22;font-size:1rem;margin-bottom:6px;">Estimado/a <strong>${padre.nombre_completo}</strong>,</p>
        <p style="color:#7A5060;font-size:0.88rem;margin-bottom:20px;">
            Se ha generado una nueva factura para su hijo/a <strong>${factura.estudiante?.nombre_completo ?? '—'}</strong>.
        </p>

        <div style="background:#FDF8FA;border-radius:8px;padding:14px 16px;margin-bottom:20px;border-left:4px solid #C2185B;">
            <table style="width:100%;font-size:0.85rem;">
                <tr>
                    <td style="color:#7A5060;padding:3px 0;">N° Factura</td>
                    <td style="text-align:right;font-weight:700;color:#3D1A22;">${factura.numero_factura}</td>
                </tr>
                <tr>
                    <td style="color:#7A5060;padding:3px 0;">Período</td>
                    <td style="text-align:right;color:#3D1A22;">${fFecha(factura.fecha_inicio)} — ${fFecha(factura.fecha_fin)}</td>
                </tr>
                <tr>
                    <td style="color:#7A5060;padding:3px 0;">Emisión</td>
                    <td style="text-align:right;color:#3D1A22;">${fFecha(factura.fecha_emision ?? factura.created_at)}</td>
                </tr>
                <tr>
                    <td style="color:#7A5060;padding:3px 0;">Estado</td>
                    <td style="text-align:right;">
                        <span style="background:#FCE8F0;color:#C2185B;padding:2px 10px;border-radius:100px;font-size:0.75rem;font-weight:700;">PENDIENTE DE PAGO</span>
                    </td>
                </tr>
            </table>
        </div>

        <h3 style="color:#3D1A22;font-size:0.9rem;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Detalle de consumos</h3>
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem;margin-bottom:12px;">
            <thead>
                <tr style="background:#FDF0F4;">
                    <th style="padding:8px 12px;text-align:left;color:#7A5060;font-size:0.75rem;text-transform:uppercase;">Descripción</th>
                    <th style="padding:8px 12px;text-align:center;color:#7A5060;font-size:0.75rem;text-transform:uppercase;">Cant.</th>
                    <th style="padding:8px 12px;text-align:right;color:#7A5060;font-size:0.75rem;text-transform:uppercase;">P. Unit.</th>
                    <th style="padding:8px 12px;text-align:right;color:#7A5060;font-size:0.75rem;text-transform:uppercase;">Total</th>
                </tr>
            </thead>
            <tbody>${filas || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#C9A0AE;">Sin detalle disponible</td></tr>'}</tbody>
        </table>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#FDF0F4;border-radius:8px;margin-bottom:20px;">
            <span style="font-weight:700;color:#3D1A22;font-size:0.95rem;">Total a pagar</span>
            <span style="font-size:1.3rem;font-weight:800;color:#C2185B;">L ${fNum(factura.total)}</span>
        </div>

        <p style="color:#7A5060;font-size:0.82rem;">
            Por favor acérquese a la administración de Rainbow School para realizar el pago.<br/>
            Para consultas comuníquese con nosotros.
        </p>`;

    await transporter.sendMail({
        from:    process.env.MAIL_FROM,
        to:      padre.email,
        subject: `📋 Factura ${factura.numero_factura} — ${factura.estudiante?.nombre_completo} · Rainbow School`,
        html:    htmlBase(contenido)
    });

    console.log(`✉️  Factura enviada a ${padre.email}`);
}


async function enviarConfirmacionPago(factura, padre) {
    if (!padre?.email) return;

    const contenido = `
        <p style="color:#3D1A22;font-size:1rem;margin-bottom:6px;">Estimado/a <strong>${padre.nombre_completo}</strong>,</p>
        <p style="color:#7A5060;font-size:0.88rem;margin-bottom:20px;">
            Le confirmamos que se ha registrado el pago de la factura de su hijo/a <strong>${factura.estudiante?.nombre_completo ?? '—'}</strong>.
        </p>

        <div style="background:#E8F5E9;border-radius:8px;padding:14px 16px;margin-bottom:20px;border-left:4px solid #00796B;">
            <table style="width:100%;font-size:0.85rem;">
                <tr>
                    <td style="color:#7A5060;padding:3px 0;">N° Factura</td>
                    <td style="text-align:right;font-weight:700;color:#3D1A22;">${factura.numero_factura}</td>
                </tr>
                <tr>
                    <td style="color:#7A5060;padding:3px 0;">Monto pagado</td>
                    <td style="text-align:right;font-weight:800;color:#00796B;font-size:1.1rem;">L ${fNum(factura.total)}</td>
                </tr>
                <tr>
                    <td style="color:#7A5060;padding:3px 0;">Método de pago</td>
                    <td style="text-align:right;color:#3D1A22;text-transform:capitalize;">${factura.metodo_pago ?? '—'}</td>
                </tr>
                <tr>
                    <td style="color:#7A5060;padding:3px 0;">Fecha de pago</td>
                    <td style="text-align:right;color:#3D1A22;">${fFecha(factura.fecha_pago ?? new Date())}</td>
                </tr>
                <tr>
                    <td style="color:#7A5060;padding:3px 0;">Estado</td>
                    <td style="text-align:right;">
                        <span style="background:#E0F5F1;color:#00796B;padding:2px 10px;border-radius:100px;font-size:0.75rem;font-weight:700;">✓ PAGADA</span>
                    </td>
                </tr>
            </table>
        </div>

        <p style="color:#7A5060;font-size:0.82rem;">
            Gracias por su pago puntual. Conserve este correo como comprobante.<br/>
            Rainbow School agradece su confianza.
        </p>`;

    await transporter.sendMail({
        from:    process.env.MAIL_FROM,
        to:      padre.email,
        subject: `✅ Pago confirmado — Factura ${factura.numero_factura} · Rainbow School`,
        html:    htmlBase(contenido)
    });

    console.log(`✉️  Confirmación de pago enviada a ${padre.email}`);
}

module.exports = { enviarFacturaGenerada, enviarConfirmacionPago };
