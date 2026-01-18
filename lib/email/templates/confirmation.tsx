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

interface ConfirmationEmailProps {
  email: string;
  confirmationUrl: string;
}

export function ConfirmationEmail({
  email,
  confirmationUrl,
}: ConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>Confirm Your Subscription</Text>
            <Text style={text}>
              Thanks for subscribing to our newsletter! Please confirm your email
              address to start receiving our updates.
            </Text>
            <Button style={button} href={confirmationUrl}>
              Confirm Subscription
            </Button>
            <Text style={text}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={link}>{confirmationUrl}</Text>
            <Hr style={hr} />
            <Text style={footer}>
              If you didn't request this, you can safely ignore this email.
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

const link = {
  fontSize: "14px",
  color: "#0066cc",
  wordBreak: "break-all" as const,
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
