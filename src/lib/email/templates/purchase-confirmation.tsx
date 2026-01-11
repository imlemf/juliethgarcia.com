import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PurchaseConfirmationEmailProps {
  productName: string;
  productDescription?: string;
  buyerEmail: string;
  purchaseCode: string;
  downloadToken: string;
  downloadUrl: string;
  amount: number;
  currency: string;
  expiresAt: Date;
  maxDownloads: number;
}

export default function PurchaseConfirmationEmail({
  productName,
  productDescription,
  buyerEmail,
  purchaseCode,
  downloadToken,
  downloadUrl,
  amount,
  currency,
  expiresAt,
  maxDownloads,
}: PurchaseConfirmationEmailProps) {
  const formattedAmount = (amount / 100).toFixed(2);
  const formattedExpiry = expiresAt.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>¡Gracias por tu compra! Tu producto digital está listo para descargar</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Compra exitosa! 🎉</Heading>

          <Text style={text}>
            Hola,
          </Text>

          <Text style={text}>
            Gracias por tu compra. Tu pago ha sido procesado correctamente y tu producto digital está listo.
          </Text>

          <Section style={productSection}>
            <Heading as="h2" style={h2}>
              {productName}
            </Heading>
            {productDescription && (
              <Text style={productDescription_style}>
                {productDescription}
              </Text>
            )}
            <Text style={amountText}>
              Monto pagado: <strong>{currency} ${formattedAmount}</strong>
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={downloadSection}>
            <Heading as="h3" style={h3}>
              📥 Descarga tu producto
            </Heading>

            <Text style={highlightText}>
              Tu primera descarga es <strong>completamente directa</strong> - no necesitas crear una cuenta.
            </Text>

            <Button style={button} href={downloadUrl}>
              Descargar ahora
            </Button>

            <Text style={linkText}>
              O copia este enlace en tu navegador:
            </Text>
            <Link href={downloadUrl} style={link}>
              {downloadUrl}
            </Link>
          </Section>

          <Hr style={hr} />

          <Section style={codeSection}>
            <Heading as="h3" style={h3}>
              🔑 Tu código de compra
            </Heading>

            <Text style={text}>
              Guarda este código para futuras descargas:
            </Text>

            <Text style={codeText}>
              {purchaseCode}
            </Text>

            <Text style={smallText}>
              Necesitarás este código <strong>solo si eres un usuario nuevo</strong> y quieres crear una cuenta para descargas adicionales.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={infoSection}>
            <Heading as="h3" style={h3}>
              ℹ️ Información importante
            </Heading>

            <Text style={text}>
              <strong>Primera descarga:</strong>
            </Text>
            <Text style={infoText}>
              • Haz clic en el botón de arriba - no requiere autenticación
              <br />
              • Tu descarga comenzará automáticamente
              <br />
              • No necesitas registrarte ni iniciar sesión
            </Text>

            <Text style={text}>
              <strong>Descargas adicionales:</strong>
            </Text>
            <Text style={infoText}>
              • Tienes hasta {maxDownloads} descargas disponibles
              <br />
              • Válido hasta: {formattedExpiry}
              <br />
              • Para descargas futuras necesitarás autenticarte
            </Text>

            <Text style={text}>
              <strong>¿Ya tienes cuenta?</strong>
            </Text>
            <Text style={infoText}>
              Solo inicia sesión - no necesitas usar el código de compra. Podrás acceder a todos tus productos desde tu dashboard.
            </Text>

            <Text style={text}>
              <strong>¿Primera vez?</strong>
            </Text>
            <Text style={infoText}>
              Cuando quieras descargar nuevamente, crea tu cuenta usando tu email ({buyerEmail}) y el código de compra de arriba. Este código solo se usa una vez para crear tu cuenta.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Si tienes algún problema con tu descarga, no dudes en contactarnos.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} Julieth Garcia. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '40px 0 20px',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: '600',
  margin: '0 0 10px',
};

const h3 = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 10px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 10px',
  padding: '0 40px',
};

const highlightText = {
  color: '#059669',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '10px 0',
  padding: '0 40px',
};

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '10px 0',
  padding: '0 40px',
};

const productSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '20px 40px',
  padding: '20px',
};

const productDescription_style = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 10px',
};

const amountText = {
  color: '#374151',
  fontSize: '16px',
  margin: '10px 0 0',
};

const downloadSection = {
  padding: '0 40px',
  margin: '20px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 20px',
  margin: '20px 0',
};

const linkText = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '10px 0 5px',
};

const link = {
  color: '#2563eb',
  fontSize: '13px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const codeSection = {
  padding: '0 40px',
  margin: '20px 0',
};

const codeText = {
  backgroundColor: '#f3f4f6',
  border: '2px dashed #d1d5db',
  borderRadius: '6px',
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700',
  fontFamily: 'monospace',
  letterSpacing: '2px',
  margin: '15px 0',
  padding: '20px',
  textAlign: 'center' as const,
};

const infoSection = {
  padding: '0 40px',
  margin: '20px 0',
};

const infoText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '5px 0 15px',
  padding: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 40px',
};

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '10px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};
