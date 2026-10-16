import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7.5-4.6-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2 4.4-9.5 9-9.5 9Z" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.6-3.6 5-5.5 7.5-5.5s5.9 1.9 7.5 5.5" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.9-1-2.7-2-.7-.9-1.1-1.6-1.3-1.9-.1-.2 0-.4.1-.5.2-.2.4-.5.5-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.6 2.6 4 3.6 2 .8 2.4.7 2.8.6.4 0 1.4-.6 1.6-1.1.2-.6.2-1.1.1-1.2-.1-.1-.2-.1-.4-.1ZM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
    </svg>
  );
}

export function RulerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="9" width="18" height="6" rx="1" transform="rotate(0 12 12)" />
      <path d="M7 9v3M11 9v3M15 9v3" />
    </svg>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12.5 3.5H6a1 1 0 0 0-1 1v6.5a1 1 0 0 0 .3.7l9 9a1 1 0 0 0 1.4 0l6.5-6.5a1 1 0 0 0 0-1.4l-9-9a1 1 0 0 0-.7-.3Z" />
      <circle cx="9" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.6A9.9 9.9 0 0 1 12 5.5c6.5 0 9.5 6.5 9.5 6.5a16.7 16.7 0 0 1-3.2 4.1M6.3 7.3C3.9 8.9 2.5 12 2.5 12S5.5 18.5 12 18.5a9.6 9.6 0 0 0 3.2-.6" />
      <path d="M9.9 10.1a3 3 0 0 0 4.1 4.1" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.7 7.7 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9c.8.7 1.6 1.2 2.6 1.5l.5 2.5h4l.5-2.5a7.7 7.7 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.5Z" />
    </svg>
  );
}

export function QuestionIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8" />
      <circle cx="12" cy="17" r="0.2" fill="currentColor" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4h3.5l1.3 4.5-2 1.5a12 12 0 0 0 6.2 6.2l1.5-2 4.5 1.3V19a2 2 0 0 1-2 2C10.5 21 3 13.5 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7.5" cy="18" r="1.5" />
      <circle cx="17.5" cy="18" r="1.5" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6.5 8 6 8-6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 10a6 6 0 1 1 12 0c0 3.5 1 5 1.5 5.5H4.5C5 15 6 13.5 6 10Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M16.5 4.5 19.5 7.5 8.5 18.5 4 20l1.5-4.5Z" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0-.7 12.1a2 2 0 0 1-2 1.9H9.7a2 2 0 0 1-2-1.9L7 7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.3 1.4-1.3h1.5V5.1C15.9 5 15 5 14 5c-2.2 0-3.7 1.3-3.7 3.8V11H7.9v2.8h2.4V21h3.2Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.5 3h2.6c.2 1.4 1.2 2.9 3.1 3.2v2.7c-1.2 0-2.3-.4-3.1-1v6.4a5 5 0 1 1-5-5c.3 0 .6 0 .9.1v2.7a2.3 2.3 0 1 0 1.6 2.2V3Z" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 5 6v5.5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-2.5Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}
