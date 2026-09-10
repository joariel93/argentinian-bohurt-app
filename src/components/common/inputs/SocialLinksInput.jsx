import React from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

function mapIconClass(icono) {
  const map = {
    'fa-facebook-f': 'pi pi-facebook',
    'fa-instagram': 'pi pi-instagram',
    'fa-twitter': 'pi pi-twitter',
    'fa-tiktok': 'pi pi-tiktok',
    'fa-youtube': 'pi pi-youtube',
    'fa-twitch': 'pi pi-twitch',
    'fa-discord': 'pi pi-discord',
  };
  return map[icono] || 'pi pi-globe';
}

export default function SocialLinksInput({ value = [], options = [], onChange, label = 'Redes sociales' }) {
  const socialOptions = options.map((o) => ({
    label: o.valor,
    value: o.id,
    iconClass: mapIconClass(o.icono),
  }));

  const handleAdd = () => {
    onChange([...value, { idRedSocial: socialOptions[0]?.value || null, link: '' }]);
  };

  const handleRemove = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, newValue) => {
    onChange(value.map((item, i) => (i === index ? { ...item, [field]: newValue } : item)));
  };

  const selectedValues = value.map((v) => v.idRedSocial).filter(Boolean);

  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
      <div className="flex flex-column gap-2">
        {value.map((item, index) => {
          const selectedOption = socialOptions.find((o) => o.value === item.idRedSocial);
          const availableOptions = socialOptions.filter(
            (o) => o.value === item.idRedSocial || !selectedValues.includes(o.value)
          );

          return (
            <div key={index} className="flex gap-2 align-items-center">
              <Dropdown
                value={item.idRedSocial}
                options={availableOptions}
                onChange={(e) => handleChange(index, 'idRedSocial', e.value)}
                optionLabel="label"
                optionValue="value"
                placeholder="Tipo"
                className="w-10rem"
                valueTemplate={(option) =>
                  option ? (
                    <div className="flex align-items-center gap-2">
                      <i className={option.iconClass} />
                      <span>{option.label}</span>
                    </div>
                  ) : (
                    <span>Seleccione</span>
                  )
                }
                itemTemplate={(option) => (
                  <div className="flex align-items-center gap-2">
                    <i className={option.iconClass} />
                    <span>{option.label}</span>
                  </div>
                )}
              />
              <InputText
                value={item.link || ''}
                onChange={(e) => handleChange(index, 'link', e.target.value)}
                placeholder="https://..."
                className="w-full"
              />
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-text"
                onClick={() => handleRemove(index)}
                tooltip="Eliminar"
              />
            </div>
          );
        })}
        <div>
          <Button
            label="Agregar red social"
            icon="pi pi-plus"
            className="p-button-sm p-button-outlined"
            onClick={handleAdd}
            disabled={socialOptions.length === 0 || value.length >= socialOptions.length}
          />
        </div>
      </div>
    </div>
  );
}
