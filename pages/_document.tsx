import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'
import { getGoogleAnalyticsID } from '../lib/analytics'

export default function Document() {
  return (
    <Html>
			<Head>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
				/>
        <link 
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter"
        />
        {/* Google tag (gtag.js) for analytics*/}
        <Script
          src={"https://www.googletagmanager.com/gtag/js?id=" + getGoogleAnalyticsID()}
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${getGoogleAnalyticsID()}');`
          }}
        />
			</Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}