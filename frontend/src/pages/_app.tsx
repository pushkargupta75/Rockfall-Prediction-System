import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '@/components/Layout';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Rockfall Prediction System</title>
        <meta name="description" content="AI-powered rockfall prediction and monitoring system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Container>
            <Box sx={{ my: 4 }}>
              <Component {...pageProps} />
            </Box>
          </Container>
        </Layout>
      </ThemeProvider>
    </>
  );
}
