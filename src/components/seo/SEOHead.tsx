
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  availability?: 'in_stock' | 'out_of_stock';
  brand?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image = '/logo.png',
  url = window.location.href,
  type = 'website',
  price,
  availability,
  brand = 'Riziky Boutique'
}) => {
  const fullTitle = `${title} | Riziky Boutique - Produits Capillaires Premium`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Riziky Boutique" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Product Schema for e-commerce */}
      {type === 'product' && price && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: title,
            description: description,
            brand: {
              "@type": "Brand",
              name: brand
            },
            image: image,
            offers: {
              "@type": "Offer",
              price: price,
              priceCurrency: "EUR",
              availability: `https://schema.org/${availability === 'in_stock' ? 'InStock' : 'OutOfStock'}`
            }
          })}
        </script>
      )}
      
      {/* Website Schema */}
      {type === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Riziky Boutique",
            description: "Spécialiste en produits capillaires premium - Perruques, tissages, accessoires",
            url: "https://riziky-boutique.com"
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
