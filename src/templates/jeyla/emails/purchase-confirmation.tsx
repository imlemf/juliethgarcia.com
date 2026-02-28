import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

export interface JeylaPurchaseConfirmationEmailProps {
  siteName: string;
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
  isRegistered?: boolean;
}

export default function JeylaPurchaseConfirmationEmail({
  siteName,
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
  isRegistered = false,
}: JeylaPurchaseConfirmationEmailProps) {
  const formattedAmount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);

  const formattedExpiry = expiresAt.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu compra de {productName} esta lista para descargar</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={logoText}>{siteName}</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <div style={iconCircle}>
              <Text style={iconEmoji}>&#10003;</Text>
            </div>
            <Heading style={heroTitle}>Compra exitosa</Heading>
            <Text style={heroSubtitle}>
              Gracias por tu compra. Tu producto digital esta listo para descargar.
            </Text>
          </Section>

          {/* Product Card */}
          <Section style={productCardWrapper}>
            <Section style={productCard}>
              <Text style={productLabel}>Producto</Text>
              <Heading as="h2" style={productName_style}>
                {productName}
              </Heading>
              {productDescription && (
                <Text style={productDesc}>{productDescription}</Text>
              )}
              <Hr style={productDivider} />
              <Row>
                <Column style={priceLabel}>Total pagado</Column>
                <Column style={priceValue}>{formattedAmount}</Column>
              </Row>
            </Section>
          </Section>

          {/* Download CTA */}
          <Section style={downloadSection}>
            <Heading as="h3" style={sectionTitle}>
              Descarga tu producto
            </Heading>
            <Text style={downloadHint}>
              {isRegistered
                ? 'Haz clic en el boton para descargar tu producto.'
                : `Tienes hasta ${maxDownloads} descargas sin necesidad de cuenta. Valido hasta el ${formattedExpiry}.`}
            </Text>
            <Button style={downloadButton} href={downloadUrl}>
              Descargar ahora
            </Button>
            <Text style={linkFallback}>
              Si el boton no funciona, copia este enlace:
            </Text>
            <Link href={downloadUrl} style={linkUrl}>
              {downloadUrl}
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Purchase Code - always shown */}
          <Section style={codeSection}>
            <Heading as="h3" style={sectionTitle}>
              Tu codigo de compra
            </Heading>
            <Text style={codeHint}>
              {isRegistered
                ? 'Este es tu codigo de referencia para esta compra:'
                : 'Guarda este codigo, lo necesitaras para crear tu cuenta:'}
            </Text>
            <Section style={codeBox}>
              <Text style={codeValue}>{purchaseCode}</Text>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Info Section - different content based on registration status */}
          <Section style={infoSection}>
            <Heading as="h3" style={sectionTitle}>
              {isRegistered ? 'Acceso a tu producto' : 'Crea tu cuenta'}
            </Heading>

            {isRegistered ? (
              <>
                <Section style={infoCard}>
                  <Text style={infoCardTitle}>Descargas ilimitadas</Text>
                  <Text style={infoCardText}>
                    Como usuario registrado, puedes descargar tu producto las veces que necesites desde la seccion "Mis Compras".
                  </Text>
                </Section>

                <Section style={infoCard}>
                  <Text style={infoCardTitle}>Contenido premium</Text>
                  <Text style={infoCardText}>
                    Inicia sesion para acceder a todas las recetas premium y contenido exclusivo incluido con tu compra.
                  </Text>
                </Section>
              </>
            ) : (
              <>
                <Section style={infoCard}>
                  <Text style={infoCardTitle}>Por que crear una cuenta?</Text>
                  <Text style={infoCardText}>
                    Con una cuenta tendras descargas ilimitadas, acceso a recetas premium y contenido exclusivo.
                  </Text>
                </Section>

                <Section style={infoCard}>
                  <Text style={infoCardTitle}>Como registrarte</Text>
                  <Text style={infoCardText}>
                    Registrate con tu email ({buyerEmail}) y usa el codigo de compra de arriba para vincular tu producto a tu cuenta.
                  </Text>
                </Section>

                <Section style={infoCard}>
                  <Text style={infoCardTitle}>Sin cuenta</Text>
                  <Text style={infoCardText}>
                    Puedes descargar hasta {maxDownloads} veces usando el enlace de arriba, valido hasta el {formattedExpiry}. Despues necesitaras una cuenta.
                  </Text>
                </Section>
              </>
            )}
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerHelp}>
              Si tienes algun problema con tu descarga, no dudes en contactarnos.
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerCopy}>
              &copy; {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for development
JeylaPurchaseConfirmationEmail.PreviewProps = {
  siteName: 'Jeyla Fitness',
  productName: 'Plan de Entrenamiento 12 Semanas',
  productDescription: 'Programa completo de entrenamiento con rutinas diarias, guia de nutricion y seguimiento de progreso.',
  buyerEmail: 'maria@ejemplo.com',
  purchaseCode: 'JF-2024-ABCD',
  downloadToken: 'tok_abc123def456',
  downloadUrl: 'https://jeyla.com/downloads/tok_abc123def456',
  amount: 4900000,
  currency: 'COP',
  expiresAt: new Date('2026-03-15'),
  maxDownloads: 5,
  isRegistered: false,
} satisfies JeylaPurchaseConfirmationEmailProps;

// ========================
// Jeyla Pastel Design System
// ========================

const colors = {
  pink: '#FFD6E8',
  peach: '#FFDAB9',
  mint: '#C7EAE4',
  lavender: '#E6E6FA',
  cream: '#FFF8E7',
  greenMint: '#B8E6B8',
  textDark: '#5A4A42',
  textMedium: '#8B7D77',
  background: '#FFF8F5',
  white: '#FFFFFF',
};

const main = {
  backgroundColor: colors.background,
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: colors.white,
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '24px',
  overflow: 'hidden' as const,
  marginTop: '40px',
  marginBottom: '40px',
};

// Header
const headerSection = {
  backgroundColor: colors.peach,
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const logoText = {
  color: colors.textDark,
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '0.5px',
};

// Hero
const heroSection = {
  padding: '40px 40px 32px',
  textAlign: 'center' as const,
};

const iconCircle = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: `${colors.greenMint}60`,
  margin: '0 auto 20px',
  lineHeight: '64px',
  textAlign: 'center' as const,
};

const iconEmoji = {
  fontSize: '28px',
  lineHeight: '64px',
  margin: '0',
  color: colors.textDark,
};

const heroTitle = {
  color: colors.textDark,
  fontSize: '26px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const heroSubtitle = {
  color: colors.textMedium,
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

// Product Card
const productCardWrapper = {
  padding: '0 32px 32px',
};

const productCard = {
  backgroundColor: colors.cream,
  borderRadius: '16px',
  padding: '24px',
};

const productLabel = {
  color: colors.textMedium,
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const productName_style = {
  color: colors.textDark,
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const productDesc = {
  color: colors.textMedium,
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
};

const productDivider = {
  borderColor: `${colors.peach}80`,
  margin: '16px 0',
};

const priceLabel = {
  color: colors.textMedium,
  fontSize: '14px',
  textAlign: 'left' as const,
  verticalAlign: 'middle' as const,
};

const priceValue = {
  color: colors.textDark,
  fontSize: '22px',
  fontWeight: '700',
  textAlign: 'right' as const,
  verticalAlign: 'middle' as const,
};

// Download Section
const downloadSection = {
  padding: '0 40px 32px',
  textAlign: 'center' as const,
};

const sectionTitle = {
  color: colors.textDark,
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};

const downloadHint = {
  color: colors.textMedium,
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 20px',
};

const downloadButton = {
  backgroundColor: colors.greenMint,
  borderRadius: '12px',
  color: colors.textDark,
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 24px',
  margin: '0 0 16px',
  boxSizing: 'border-box' as const,
};

const linkFallback = {
  color: colors.textMedium,
  fontSize: '12px',
  margin: '0 0 4px',
};

const linkUrl = {
  color: colors.textMedium,
  fontSize: '12px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

// Divider
const divider = {
  borderColor: `${colors.mint}60`,
  margin: '0 40px',
};

// Code Section
const codeSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const codeHint = {
  color: colors.textMedium,
  fontSize: '14px',
  margin: '0 0 16px',
};

const codeBox = {
  backgroundColor: `${colors.lavender}40`,
  borderRadius: '12px',
  border: `2px dashed ${colors.lavender}`,
  padding: '20px',
  margin: '0 0 12px',
};

const codeValue = {
  color: colors.textDark,
  fontSize: '24px',
  fontWeight: '700',
  fontFamily: 'monospace',
  letterSpacing: '3px',
  margin: '0',
};

const codeNote = {
  color: colors.textMedium,
  fontSize: '13px',
  lineHeight: '18px',
  margin: '0',
};

// Info Section
const infoSection = {
  padding: '32px 40px',
};

const infoCard = {
  backgroundColor: `${colors.mint}20`,
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '0 0 12px',
};

const infoCardTitle = {
  color: colors.textDark,
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 4px',
};

const infoCardText = {
  color: colors.textMedium,
  fontSize: '13px',
  lineHeight: '19px',
  margin: '0',
};

// Footer
const footerSection = {
  backgroundColor: colors.peach,
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const footerHelp = {
  color: colors.textMedium,
  fontSize: '13px',
  lineHeight: '18px',
  margin: '0 0 16px',
};

const footerDivider = {
  borderColor: `${colors.textMedium}20`,
  margin: '0 0 16px',
};

const footerCopy = {
  color: colors.textMedium,
  fontSize: '12px',
  margin: '0',
};
