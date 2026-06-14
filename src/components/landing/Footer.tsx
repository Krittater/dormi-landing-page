type FooterLinkItem = string | { name: string; url: string };

export function Footer() {
  return (
    <footer className="border-t border-teal/10 bg-white px-6 pb-8 pt-12 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="mb-3 font-display text-lg font-bold tracking-tight text-teal">
              Dormi
            </div>
            <p className="max-w-xs text-sm text-ink-muted">
              ระบบบริหารหอพักอัจฉริยะที่ออกแบบมาเพื่อเจ้าของและผู้ดูแลอสังหาริมทรัพย์ในประเทศไทย
            </p>
          </div>

          <FooterCol
            title="ผลิตภัณฑ์"
            links={['ฟีเจอร์', 'ราคา']}
          />
          <FooterCol
            title="เกี่ยวกับเรา"
            links={[
              { name: 'Instagram', url: 'https://www.instagram.com/dormilinkandrent/' },
              { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61570977235805' },
              { name: 'Youtube', url: 'https://www.youtube.com/@DormiLinkAndRent' },
              { name: 'Tiktok', url: 'https://www.tiktok.com/@dormilinkandrent' },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-teal/10 pt-6 text-sm text-ink-muted">
          <p>© {new Date().getFullYear()} dormi Link and Rent. High-end property concierge.</p>
          {/* <p className="flex items-center gap-1.5 text-xs">
            Made with <Heart className="size-3.5 fill-teal/35 text-teal" aria-hidden strokeWidth={1.5} /> in
            Thailand
          </p> */}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLinkItem[] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-ink">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => {
          const label =
            typeof l === 'string' ? l : l.name.replace(/^\w/, (c) => c.toUpperCase());
          const href = typeof l === 'string' ? '#' : l.url;
          const key = typeof l === 'string' ? l : l.name;
          const isExternal = typeof l === 'object';

          return (
            <li key={key}>
              <a
                href={href}
                className="text-sm text-ink-muted transition hover:text-teal"
                {...(isExternal
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
