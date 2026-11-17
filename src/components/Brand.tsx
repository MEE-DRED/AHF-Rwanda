import Image from 'next/image';

export function Brand({ suffix }: { suffix?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/ahf-logo.jpg"
        alt="AIDS Healthcare Foundation logo"
        width={44}
        height={44}
        className="h-11 w-11 rounded-lg object-contain"
      />
      <div className="leading-tight">
        <div className="text-base font-bold text-ahf-charcoal">AHF Rwanda</div>
        <div className="text-xs text-ahf-grey">{suffix ?? 'AIDS Healthcare Foundation'}</div>
      </div>
    </div>
  );
}
