import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from '../appMeta';

type Props = {
  className?: string;
  /** When true, hide from assistive tech (use if a visible heading repeats the name). */
  decorative?: boolean;
};

export function BrandLogo({ className, decorative }: Props) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt={decorative ? '' : BRAND_LOGO_ALT}
      className={className}
      width={260}
      height={100}
      decoding="async"
      {...(decorative ? { 'aria-hidden': true as const } : {})}
    />
  );
}
