// SeoHead.jsx
import React, { useEffect } from 'react';

const SeoHead = ({ title, description, keywords, ogTitle, ogDescription, ogImage, canonical }) => {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let metaDesc = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    if (keywords) {
      let metaKeywords = document.querySelector("meta[name='keywords']");
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = keywords;
    }

    if (canonical) {
      let linkCanonical = document.querySelector("link[rel='canonical']");
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.rel = 'canonical';
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.href = canonical;
    }

    if (ogTitle || ogDescription || ogImage) {
      const ogProps = [
        { property: 'og:title', content: ogTitle },
        { property: 'og:description', content: ogDescription },
        { property: 'og:image', content: ogImage },
      ];

      ogProps.forEach(({ property, content }) => {
        if (!content) return;
        let metaTag = document.querySelector(`meta[property='${property}']`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('property', property);
          document.head.appendChild(metaTag);
        }
        metaTag.content = content;
      });
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical]);

  return null; 
};

export default SeoHead;
