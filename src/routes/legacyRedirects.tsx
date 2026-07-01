import React, { useEffect, useState } from 'react';
import { Route, Navigate, useParams } from 'react-router-dom';
import { api } from '@/api/client';
import { PageLoader } from '@/components/ui/PageLoader';

const LegacyResolver: React.FC<{ type: 'work' | 'event' | 'trail' }> = ({ type }) => {
  const { id } = useParams();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchUrl = async () => {
      try {
        const endpoints: Record<string, string> = {
          work: `/public/works/${id}/resolve-url`,
          event: `/public/events/${id}/resolve-url`,
          trail: `/public/trails/${id}/resolve-url`,
        };
        const res = await api.get(endpoints[type]);
        if (res.data && res.data.redirectUrl) {
          setRedirectUrl(res.data.redirectUrl);
        } else {
          setRedirectUrl('/hub');
        }
      } catch {
        setRedirectUrl('/hub');
      }
    };
    fetchUrl();
  }, [id, type]);

  if (!redirectUrl) return <PageLoader />;
  return <Navigate to={redirectUrl} replace />;
};

export const legacyRedirects = () => (
  <>
    <Route path="/home" element={<Navigate to="/hub" replace />} />
    <Route path="/hub-cidades" element={<Navigate to="/hub" replace />} />
    <Route path="/select-museum" element={<Navigate to="/cidades" replace />} />
    <Route path="/my-tickets" element={<Navigate to="/meus-ingressos" replace />} />
    <Route path="/mapa" element={<Navigate to="/hub" replace />} />
    <Route path="/agenda" element={<Navigate to="/hub" replace />} />
    
    <Route path="/obras/:id" element={<LegacyResolver type="work" />} />
    <Route path="/eventos/:id" element={<LegacyResolver type="event" />} />
    <Route path="/trilhas/:id" element={<LegacyResolver type="trail" />} />
  </>
);
