// Premium VP monogram: the V's right stroke becomes the P stem so the two
// letters share a single connected form. Dark ink with one blue accent.
export function LogoMark({ size = 30, title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <path
        d="M6.5 9.5 13 23l6.5-13.5"
        stroke="#111827"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 23V9.5"
        stroke="#111827"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 9.5h3.1a4.2 4.2 0 0 1 0 8.4h-3.1"
        stroke="#2563EB"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
