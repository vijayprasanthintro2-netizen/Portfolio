import { memo, useEffect, useRef, useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Copy, Upload, Eye, Image as ImageIcon } from 'lucide-react';
import { fileToDataUrl } from './imageFile';
import { adminReplaceAsset, adminUploadAsset } from '../content/api';
import { resolveAssetUrl } from '../content/assetUrl';
import { normalizeSectionValue } from '../content/shape';
import { isEmptyRich } from '../lib/richText';
import { RichTextField } from './RichTextEditor';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function assetKeyFromUrl(value) {
  const match = String(value || '').match(/\/api\/assets\/k\/([^?]+)/);
  if (!match) return '';
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function clone(value) {
  return Array.isArray(value) ? [...value] : value && typeof value === 'object' ? { ...value } : value;
}

function StringsEditor({ value = [], onChange, addLabel = 'Add item', placeholder }) {
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
            placeholder={placeholder || 'Type and press the trash to remove'}
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
  groups,
  onPreview,
}) {
  const items = Array.isArray(value) ? value : [];
  const [query, setQuery] = useState('');
  const visible = query.trim()
    ? items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) =>
          JSON.stringify(item || {}).toLowerCase().includes(query.trim().toLowerCase())
        )
    : items.map((item, index) => ({ item, index }));
  const updateItem = (i, v) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i) => {
    const label = nameKey && items[i]?.[nameKey] ? `“${items[i][nameKey]}”` : 'this record';
    if (window.confirm(`Delete ${label}? This takes effect after you publish the section.`)) {
      onChange(items.filter((_, idx) => idx !== i));
    }
  };
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
      if (f.type === 'toggle') seed[f.key] = false;
      else if (f.type === 'number') seed[f.key] = 0;
      else if (f.type === 'strings' || f.type === 'list') seed[f.key] = [];
      else if (f.type === 'rich') seed[f.key] = f.mode === 'list' ? [] : '';
      else seed[f.key] = '';
    });
    setQuery('');
    onChange([...items, seed]);
  };

  return (
    <div className="af-records">
      {items.length >= 4 && (
        <input
          className="af-input af-record-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${addLabel.toLowerCase()}…`}
          aria-label={`Search ${addLabel.toLowerCase()}`}
        />
      )}
      {visible.length === 0 && query.trim() && (
        <p className="af-search-empty">No records match “{query}”.</p>
      )}
      {visible.map(({ item, index: i }) => (
        // The record index is the stable identity here. Using item.id as part
        // of the key remounted the whole record on every Project ID keystroke.
        <div className="af-record" key={`record-${i}`}>
          <div className="af-record-head">
            <span className="af-record-index">{String(i + 1).padStart(2, '0')}</span>
            <span className="af-record-title">
              {nameKey ? item[nameKey] || `Record ${i + 1}` : `Record ${i + 1}`}
            </span>
            <span className="af-record-actions">
              {onPreview && (
                <button
                  type="button"
                  className="af-icon-btn af-record-preview"
                  onClick={() => onPreview(i)}
                  title="Preview this project"
                  aria-label="Preview this project"
                >
                  <Eye size={14} />
                </button>
              )}
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
            <Fields fields={fields} value={item} onChange={(v) => updateItem(i, v)} groups={groups} />
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

export function Fields({ fields, value = {}, onChange, groups }) {
  const allFields = Array.isArray(fields) ? fields : [];

  if (Array.isArray(groups) && groups.length) {
    const groupedKeys = new Set(groups.flatMap((group) => group.fields || []));
    const renderGroup = (title, description, groupFields, key) => {
      if (!groupFields.length) return null;
      return (
        <section className="af-field-group" key={key}>
          <div className="af-field-group-head">
            <h4>{title}</h4>
            {description && <p>{description}</p>}
          </div>
          <div className="af-fields">
            {groupFields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={value ? value[field.key] : undefined}
                onChange={(v) => onChange({ ...clone(value), [field.key]: v })}
              />
            ))}
          </div>
        </section>
      );
    };

    const ungrouped = allFields.filter((field) => !groupedKeys.has(field.key));
    return (
      <div className="af-field-groups">
        {groups.map((group, index) =>
          renderGroup(
            group.title,
            group.description,
            (group.fields || []).map((key) => allFields.find((field) => field.key === key)).filter(Boolean),
            group.title || `group-${index}`
          )
        )}
        {renderGroup('Additional settings', '', ungrouped, 'ungrouped')}
      </div>
    );
  }

  return (
    <div className="af-fields">
      {allFields.map((field) => (
        <Field key={field.key} field={field} value={value ? value[field.key] : undefined} onChange={(v) => onChange({ ...clone(value), [field.key]: v })} />
      ))}
    </div>
  );
}

function ImageField({ label, hint, value, onChange, assetUpload = false }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setPreviewError('');
  }, [value]);

  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // allow re-picking the same file later
    if (!file) return;

    setError('');
    setPreviewError('');
    setProgress(0);
    setBusy(true);

    try {
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error('Images must be 10 MB or smaller.');
      }
      if (file.type && !file.type.startsWith('image/')) {
        throw new Error('Choose a PNG, JPG, WebP, GIF or SVG image.');
      }

      if (assetUpload) {
        const existingKey = assetKeyFromUrl(value);
        const res = existingKey
          ? await adminReplaceAsset(existingKey, file, setProgress)
          : await adminUploadAsset(file, { kind: 'image', onProgress: setProgress });
        onChange(res.data.url);
      } else {
        onChange(await fileToDataUrl(file));
      }
    } catch (err) {
      setError(err.message || 'Could not upload that image.');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const previewSrc = resolveAssetUrl(value);

  return (
    <div className="af-field af-field-image">
      <label className="af-label">
        {label}
        {hint && <span className="af-hint">{hint}</span>}
      </label>
      <div className="af-image">
        <div className={`af-image-preview${value ? ' has-image' : ''}`}>
          {value ? (
            <img
              src={previewSrc}
              alt={label}
              decoding="async"
              onError={() => setPreviewError('This image could not be loaded. Upload a replacement to fix it.')}
            />
          ) : (
            <span className="af-image-empty">
              <ImageIcon size={22} aria-hidden="true" />
              No image yet
            </span>
          )}
          {busy && (
            <span className="af-image-busy">
              {progress > 0 && progress < 100 ? `Uploading ${progress}%` : 'Processing…'}
            </span>
          )}
        </div>

        <div className="af-image-actions">
          <button type="button" className="af-add" onClick={() => inputRef.current?.click()} disabled={busy}>
            <Upload size={14} aria-hidden="true" />
            {busy ? 'Uploading…' : value ? 'Replace image' : 'Choose image'}
          </button>
          {value && (
            <button
              type="button"
              className="af-icon-btn danger"
              onClick={() => {
                setError('');
                setPreviewError('');
                onChange('');
              }}
              title="Remove image"
              aria-label="Remove image"
              disabled={busy}
            >
              <Trash2 size={15} />
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
        </div>

        {(error || previewError) && <p className="af-image-error">{error || previewError}</p>}
      </div>
    </div>
  );
}

function Field({ field, value, onChange }) {
  const { label, type, hint } = field;

  const labelEl = (
    <label className="af-label" htmlFor={field.key}>
      {label}
      {field.required && <span className="af-required" aria-label="required">*</span>}
      {hint && <span className="af-hint">{hint}</span>}
    </label>
  );

  switch (type) {
    case 'textarea':
      return (
        <div className="af-field">
          {labelEl}
          <textarea
            className="af-input area"
            rows={4}
            value={value || ''}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case 'rich':
      return <RichTextField field={field} value={value} onChange={onChange} />;
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
            placeholder={field.placeholder}
            required={field.required}
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
    case 'image':
      return (
        <ImageField
          label={field.label}
          hint={field.hint}
          value={value || ''}
          onChange={onChange}
          assetUpload={Boolean(field.asset)}
        />
      );
    case 'strings':
      return (
        <div className="af-field">
          {labelEl}
          <StringsEditor value={value} onChange={onChange} addLabel={field.addLabel} placeholder={field.placeholder} />
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
          <input
            className="af-input"
            value={value || ''}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}

// Renders any section based on its meta (object / records / strings).
// Memoized so unrelated AdminShell state (toasts, saving flag, drawer) does not
// rebuild the large form tree on every keystroke elsewhere.
export const SectionForm = memo(function SectionForm({ meta, value, onChange, onPreview }) {
  const safeValue = normalizeSectionValue(meta, value);
  if (meta.type === 'records') {
    return (
      <RecordListEditor
        value={safeValue}
        onChange={onChange}
        fields={meta.fields}
        addLabel={meta.addLabel}
        nameKey={meta.nameKey}
        groups={meta.groups}
        onPreview={onPreview}
      />
    );
  }
  if (meta.type === 'strings') {
    return <StringsEditor value={safeValue} onChange={onChange} addLabel={meta.addLabel} />;
  }
  return <Fields fields={meta.schema} value={safeValue} onChange={onChange} />;
});

// Client-side guard so a half-filled record can't be published by accident.
export function validateSection(meta, data) {
  const errors = [];
  if (data === undefined || data === null) return ['Section data is not available. Try reloading the page.'];
  const check = (fields, obj, prefix = '') => {
    fields.forEach((field) => {
      const label = prefix ? `${prefix} → ${field.label}` : field.label;
      const value = obj ? obj[field.key] : undefined;
      const empty = field.type === 'rich'
        ? isEmptyRich(value)
        : value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0);
      if (field.required && empty) {
        errors.push(`${label} is required.`);
      }
      if (field.type === 'list' && Array.isArray(value)) {
        value.forEach((item, index) => check(field.fields, item, `${label} #${index + 1}`));
      }
      if (field.type === 'object') check(field.fields, value, label);
    });
  };

  if (meta?.type === 'object') check(meta.schema, data);
  if (meta?.type === 'records' && Array.isArray(data)) {
    data.forEach((item, index) => check(meta.fields, item, `${meta.title} #${index + 1}`));
  }
  return errors;
}