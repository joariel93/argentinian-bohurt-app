import { useState, useEffect } from 'react';
import { Fieldset } from 'primereact/fieldset';
import apiService from '@/services/apiService';
import { bohurtContent } from '@/data/bohurt-content';

export default function BohurtPage() {
  const { title, subtitle, whatIs, rules } = bohurtContent;

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

    </div>
  );
}
