import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
  Sparkles,
} from 'lucide-react';

export function MinimalFooter() {
  const year = new Date().getFullYear();

  const company = [
    {
      title: 'About Us',
      href: '#',
    },
    {
      title: 'Privacy Policy',
      href: '#',
    },
    {
      title: 'Terms of Service',
      href: '#',
    },
    {
      title: 'Contact',
      href: '#',
    },
    {
      title: 'Support',
      href: '#',
    },
  ];

  // const resources = [
  //   {
  //     title: 'Blog',
  //     href: '#',
  //   },
  //   {
  //     title: 'Help Center',
  //     href: '#',
  //   },
  //   {
  //     title: 'Documentation',
  //     href: '#',
  //   },
  //   {
  //     title: 'Community',
  //     href: '#',
  //   },
  //   {
  //     title: 'Security',
  //     href: '#',
  //   },
  // ];

  const socialLinks = [
    {
      icon: <FacebookIcon className="size-4" />,
      link: '#',
    },
    {
      icon: <GithubIcon className="size-4" />,
      link: '#',
    },
    {
      icon: <InstagramIcon className="size-4" />,
      link: '#',
    },
    {
      icon: <LinkedinIcon className="size-4" />,
      link: '#',
    },
    {
      icon: <TwitterIcon className="size-4" />,
      link: '#',
    },
    {
      icon: <YoutubeIcon className="size-4" />,
      link: '#',
    },
  ];
  return (
    <footer className="relative">
      <div className="bg-[radial-gradient(35%_80%_at_30%_0%,hsl(var(--foreground)/0.1),transparent)] mx-auto max-w-4xl md:border-x">
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="grid max-w-4xl grid-cols-6 gap-6 p-4">
          <div className="col-span-6 flex flex-col gap-5 md:col-span-4">
            <a href="#" className="w-max">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">MeetAlma</span>
              </div>
            </a>
            <p className="text-muted-foreground max-w-sm font-mono text-sm text-balance">
              Your AI-powered personal memory companion. Never forget the moments that matter.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  className="hover:bg-accent rounded-md border p-1.5 transition-colors"
                  target="_blank"
                  href={item.link}
                  rel="noopener noreferrer"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            {/* <span className="text-muted-foreground mb-1 text-xs">
              Resources
            </span>
            <div className="flex flex-col gap-1">
              {resources.map(({ href, title }, i) => (
                <a
                  key={i}
                  className={`w-max py-1 text-sm duration-200 hover:underline`}
                  href={href}
                >
                  {title}
                </a>
              ))}
            </div> */}
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-muted-foreground mb-1 text-xs">Company</span>
            <div className="flex flex-col gap-1">
              {company.map(({ href, title }, i) => (
                <a
                  key={i}
                  className={`w-max py-1 text-sm duration-200 hover:underline`}
                  href={href}
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="flex max-w-4xl flex-col justify-between gap-2 pt-2 pb-5">
          <p className="text-muted-foreground text-center font-thin">
            © {year} MeetAlma.ai • Made with ❤️ for your memories
          </p>
        </div>
      </div>
    </footer>
  );
}
