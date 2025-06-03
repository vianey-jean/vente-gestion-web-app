
import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

const DynamicSEO = () => {
  const { generalSettings } = useSettings();

  useEffect(() => {
    if (generalSettings) {
      // Mettre à jour le titre de la page
      document.title = generalSettings.metaTitle || 'Riziky-Boutic';

      // Mettre à jour les meta tags
      const updateMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      const updateMetaProperty = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      // Meta tags standards
      updateMetaTag('description', generalSettings.metaDescription);
      updateMetaTag('keywords', generalSettings.metaKeywords);

      // Open Graph tags
      updateMetaProperty('og:title', generalSettings.metaTitle);
      updateMetaProperty('og:description', generalSettings.metaDescription);
      updateMetaProperty('og:url', generalSettings.siteUrl);
      updateMetaProperty('og:site_name', generalSettings.siteName);

      // Twitter Card tags
      updateMetaTag('twitter:title', generalSettings.metaTitle);
      updateMetaTag('twitter:description', generalSettings.metaDescription);

      // Injecter Google Analytics si configuré
      if (generalSettings.googleAnalyticsId) {
        const existingGA = document.querySelector('script[src*="gtag"]');
        if (!existingGA) {
          const script1 = document.createElement('script');
          script1.async = true;
          script1.src = `https://www.googletagmanager.com/gtag/js?id=${generalSettings.googleAnalyticsId}`;
          document.head.appendChild(script1);

          const script2 = document.createElement('script');
          script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${generalSettings.googleAnalyticsId}');
          `;
          document.head.appendChild(script2);
        }
      }

      // Injecter Facebook Pixel si configuré
      if (generalSettings.facebookPixelId) {
        const existingFB = document.querySelector('script[src*="fbevents"]');
        if (!existingFB) {
          const script = document.createElement('script');
          script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${generalSettings.facebookPixelId}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(script);
        }
      }
    }
  }, [generalSettings]);

  return null;
};

export default DynamicSEO;
