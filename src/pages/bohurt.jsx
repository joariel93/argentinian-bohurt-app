import { useState, useEffect } from 'react';
import { Fieldset } from 'primereact/fieldset';
import { ProgressSpinner } from 'primereact/progressspinner';
import apiService from '@/services/apiService';
import { bohurtContent } from '@/data/bohurt-content';
import ArgentinaMap from '@/components/ArgentinaMap/ArgentinaMap';

export default function BohurtPage() {
  const { title, subtitle, whatIs, rules, map } = bohurtContent;
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClubs = async () => {
      setLoading(true);
      const allClubs = await apiService.fetchClubs();
      const argentinaClubs = (allClubs || []).filter((club) => {
        const pais = club.country || '';
        return pais.toLowerCase() === 'ar';
      });
      setClubs(argentinaClubs);
      setLoading(false);
    };
    loadClubs();
  }, []);

  return (
    <div className="card">
      <div className="text-center mb-4">
        <h1>{title}</h1>
        <p className="text-color-secondary m-0">{subtitle}</p>
      </div>

      <Fieldset legend={whatIs.title} toggleable>
        <div className="flex flex-column gap-2">
          {whatIs.paragraphs.map((p, i) => (
            <p key={i} className="m-0 line-height-3">
              {p}
            </p>
          ))}
        </div>
      </Fieldset>
      <br />

      <Fieldset legend={rules.title} toggleable>
        <div className="flex flex-column gap-2">
          {rules.paragraphs.map((p, i) => (
            <p key={i} className="m-0 line-height-3">
              {p}
            </p>
          ))}
        </div>
      </Fieldset>
      <br />

      <Fieldset legend={map.title} toggleable>
        <p className="m-0 mb-3 text-color-secondary">{map.description}</p>
        {loading ? (
          <div className="flex justify-content-center align-items-center p-4">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          </div>
        ) : (
          <ArgentinaMap clubs={clubs} />
        )}
      </Fieldset>
    </div>
  );
}
