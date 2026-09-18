import { Fieldset } from 'primereact/fieldset';
import { bohurtContent } from '@/data/bohurt-content';
import SeoHead from '@/components/common/SeoHead';

export default function BohurtPage() {
  const { title, subtitle, whatIs, rules } = bohurtContent;

  return (
    <>
      <SeoHead
        title="¿Qué es el Bohurt?"
        description="Conocé qué es el Bohurt o combate medieval histórico: reglas, modalidades y cómo se practica en Argentina."
        pathname="/bohurt"
      />
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
      </div>
    </>
  );
}
