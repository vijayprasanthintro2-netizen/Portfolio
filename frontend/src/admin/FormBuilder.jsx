import { Plus, Trash2, ChevronUp, ChevronDown, Copy } from 'lucide-react';

function clone(value) {
  return Array.isArray(value) ? [...value] : value && typeof value === 'object' ? { ...value } : value;
}

function StringsEditor({ value = [], onChange, addLabel = 'Add item' }) {
  const items = Array.isArray(value) ? value : [];
  const set = (i, v) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div className="af-strings">
      {items.map((item, i) => (
        <div className="af-strings-row" key={i}>
          <input
            className="af-input"
            value={item}
            onChange={(e) => set(i, e.target.value)}
            placeholder="Type and press the trash to remove"
          />
          <button type="button" className="af-icon-btn danger" onClick={() => remove(i)} aria-label="Remove" title="Remove">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button type="button" className="af-add" onClick={add}>
        <Plus size={15} />
        {addLabel}
      </button>
    </div>
  );
}

function RecordListEditor({
  value = [],
  onChange,
  fields,
  addLabel = 'Add item',
  maxItems,
  nameKey,
}) {
  const items = Array.isArray(value) ? value : [];
  const updateItem = (i, v) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const duplicate = (i) => onChange([...items.slice(0, i + 1), clone(items[i]), ...items.slice(i + 1)]);
  const add = () => {
    if (maxItems && items.length >= maxItems) return;
    const seed = {};
    fields.forEach((f) => {
      seed[f.key] = f.type === 'toggle' ? false : f.type === 'number' ? 0 : f.type === 'strings' ? [] : f.type === 'list' ? [] : '';
    });
    onChange([...items, seed]);
  };

  return (
    <div className="af-records">
      {items.map((item, i) => (
        <div className="af-record" key={i}>
          <div className="af-record-head">
            <span className="af-record-index">{String(i + 1).padStart(2, '0')}</span>
            <span className="af-record-title">
              {nameKey ? item[nameKey] || `Record ${i + 1}` : `Record ${i + 1}`}
            </span>
            <span className="af-record-actions">
              <button type="button" className="af-icon-btn" onClick={() => duplicate(i)} title="Duplicate" aria-label="Duplicate">
                <Copy size={14} />
              </button>
              <button type="button" className="af-icon-btn" onClick={() => move(i, -1)} title="Move up" aria-label="Move up">
                <ChevronUp size={15} />
              </button>
              <button type="button" className="af-icon-btn" onClick={() => move(i, 1)} title="Move down" aria-label="Move down">
                <ChevronDown size={15} />
              </button>
              <button type="button" className="af-icon-btn danger" onClick={() => remove(i)} title="Delete" aria-label="Delete">
                <Trash2 size={15} />
              </button>
            </span>
          </div>
          <div className="af-record-body">
            <Fields fields={fields} value={item} onChange={(v) => updateItem(i, v)} />
          </div>
        </div>
      ))}
      {(!maxItems || items.length < maxItems) && (
        <button type="button" className="af-add" onClick={add}>
          <Plus size={15} />
          {addLabel}
        </button>
      )}
    </div>
  );
}

export function Fields({ fields, value = {}, onChange }) {
  return (
    <div className="af-fields">
      {fields.map((field) => (
        <Field key={field.key} field={field} value={value ? value[field.key] : undefined} onChange={(v) => onChange({ ...clone(value), [field.key]: v })} />
      ))}
    </div>
  );
}

function Field({ field, value, onChange }) {
  const { label, type, hint } = field;

  const labelEl = (
    <label className="af-label" htmlFor={field.key}>
      {label}
      {hint && <span className="af-hint">{hint}</span>}
    </label>
  );

  switch (type) {
    case 'textarea':
      return (
        <div className="af-field">
          {labelEl}
          <textarea className="af-input area" rows={4} value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case 'number':
      return (
        <div className="af-field">
          {labelEl}
          <input
            className="af-input"
            type="number"
            value={value ?? ''}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
      );
    case 'toggle':
      return (
        <div className="af-field">
          <label className="af-toggle">
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
            <span className="af-toggle-track" />
            <span className="af-toggle-text">{label}</span>
          </label>
        </div>
      );
    case 'color':
      return (
        <div className="af-field">
          {labelEl}
          <div className="af-color">
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#3b82f6'} onChange={(e) => onChange(e.target.value)} />
            <input className="af-input" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="#3b82f6" />
          </div>
        </div>
      );
    case 'strings':
      return (
        <div className="af-field">
          {labelEl}
          <StringsEditor value={value} onChange={onChange} addLabel={field.addLabel} />
        </div>
      );
    case 'list':
      return (
        <div className="af-field">
          {labelEl}
          <RecordListEditor
            value={value}
            onChange={onChange}
            fields={field.fields}
            addLabel={field.addLabel}
            maxItems={field.maxItems}
            nameKey={field.nameKey}
          />
        </div>
      );
    case 'object':
      return (
        <div className="af-field">
          {labelEl}
          <div className="af-object">
            <Fields fields={field.fields} value={value} onChange={onChange} />
          </div>
        </div>
      );
    default:
      return (
        <div className="af-field">
          {labelEl}
          <input className="af-input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
  }
}

// Renders any section based on its meta (object / records / strings).
export function SectionForm({ meta, value, onChange }) {
  if (meta.type === 'records') {
    return (
      <RecordListEditor value={value} onChange={onChange} fields={meta.fields} addLabel={meta.addLabel} nameKey={meta.nameKey} />
    );
  }
  if (meta.type === 'strings') {
    return <StringsEditor value={value} onChange={onChange} addLabel={meta.addLabel} />;
  }
  return <Fields fields={meta.schema} value={value} onChange={onChange} />;
}