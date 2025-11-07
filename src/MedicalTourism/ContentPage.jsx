import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import baseApi from '../api/baseApi';
import { FiArrowRight, FiAlertCircle } from 'react-icons/fi';

const ContentPage = ({ slugProp }) => {
  const { slug: slugFromUrl } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use prop slug if provided, otherwise use URL slug
  const slug = slugProp || slugFromUrl;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        
        const response = await baseApi.get('/ContentPages');
        
        
        if (response.data.success && response.data.data) {
          
          
          const foundContent = response.data.data.find(item => {
            
            return item.slug === slug;
          });
          
          
          
          if (foundContent) {
            setContent(foundContent);
          } else {
            setError('المحتوى غير موجود');
          }
        } else {
          setError('فشل في تحميل البيانات');
        }
      } catch (err) {

        setError('حدث خطأ أثناء تحميل المحتوى');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchContent();
    } else {
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-second"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">عذراً!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-second hover:bg-primary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <FiArrowRight />
            <span>العودة</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-second text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {content?.title}
          </h1>
          <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div
            className="text-right text-lg leading-relaxed [&_h1]:text-primary [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:mt-8 [&_h1]:border-r-4 [&_h1]:border-primary [&_h1]:pr-4 [&_h2]:text-second [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-4 [&_h2]:mt-6 [&_h3]:text-second [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-5 [&_p]:mb-5 [&_p]:leading-relaxed [&_p]:text-base [&_ul]:pr-8 [&_ul]:mb-6 [&_ol]:pr-8 [&_ol]:mb-6 [&_li]:mb-3 [&_a]:text-primary [&_a]:underline hover:[&_a]:text-second [&_strong]:text-second [&_strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: content?.htmlBody }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentPage;