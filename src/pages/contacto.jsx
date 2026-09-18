import { useState } from 'react';
import { Button } from 'primereact/button';

const CONTACT_EMAIL = 'bohurtargentina@gmail.com';

export default function ContactoPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores que no soporten clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = CONTACT_EMAIL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-4">
        <h1>Contacto</h1>
        <p className="text-color-secondary m-0">
          Escribinos para cualquier consulta, sugerencia o propuesta.
        </p>
      </div>

      <div className="flex flex-column align-items-center gap-4 py-4">
        <p className="m-0 text-center line-height-3" style={{ maxWidth: '600px' }}>
          Si tenés un club que no aparece en la página, vas a organizar un torneo
          y querés difusión, o simplemente querés hacernos una consulta, podés
          escribirnos al siguiente correo.
        </p>

        <div
          className="flex align-items-center gap-2 p-3 border-round"
          style={{ background: 'var(--surface-section)', border: '1px solid var(--surface-border)' }}
        >
          <span className="text-lg font-medium">{CONTACT_EMAIL}</span>
          <Button
            icon={copied ? 'pi pi-check' : 'pi pi-copy'}
            label={copied ? 'Copiado' : 'Copiar'}
            className="p-button-sm p-button-outlined"
            onClick={handleCopy}
          />
        </div>

        <div className="text-color-secondary text-sm">
          {copied && 'El mail se copió al portapapeles.'}
        </div>
      </div>
    </div>
  );
}
