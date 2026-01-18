import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
  email: string;
  dashboardUrl?: string;
}

export function WelcomeEmail({ email, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>Welcome to Our Newsletter!</Text>
            <Text style={text}>
              Your subscription has been confirmed. You'll now receive our latest
              updates, news, and exclusive content directly in your inbox.
            </Text>
            {dashboardUrl && (
              <>
                <Button style={button} href={dashboardUrl}>
                  Manage Preferences
                </Button>
                <Text style={text}>
                  You can manage your subscription preferences anytime from your
                  dashboard.
                </Text>
              </>
            )}
            <Hr style={hr} />
            <Text style={footer}>
              Thank you for subscribing! We're excited to have you with us.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
  marginTop: "16px",
  marginBottom: "16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
