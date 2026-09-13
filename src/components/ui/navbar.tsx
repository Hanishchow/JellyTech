"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Book, Sunset, Trees, Zap, Menu, X, ChevronDown } from "lucide-react";

const demoData = {
  logo: {
    url: "/",
    src: "https://cdn.21st.dev/assets/mirror/06/067c72836298829da27d230af61c2b4be0e09da5103dc2789639d18beea789f4.svg",
    alt: "JellyTech",
    title: "JellyTech",
  },
  menu: [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "Events",
      url: "#",
      items: [
        {
          title: "Upcoming Events",
          description: "View all upcoming tech events and workshops",
          icon: <Book className="size-5 shrink-0" />,
          url: "/events/upcoming",
        },
        {
          title: "Past Events",
          description: "Browse our event history and recordings",
          icon: <Trees className="size-5 shrink-0" />,
          url: "/events/past",
        },
        {
          title: "Speakers",
          description: "Meet our distinguished speakers",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "/events/speakers",
        },
        {
          title: "Industry Visits",
          description: "Company visits and industry exposure programs",
          icon: <Zap className="size-5 shrink-0" />,
          url: "/events/visits",
        },
      ],
    },
    {
      title: "Research",
      url: "#",
      items: [
        {
          title: "Paper Presentations",
          description: "Student research paper presentations",
          icon: <Zap className="size-5 shrink-0" />,
          url: "/research/papers",
        },
        {
          title: "Research Updates",
          description: "Latest research news from Bio Infinity",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "/research/updates",
        },
        {
          title: "Publications",
          description: "Published papers and articles",
          icon: <Trees className="size-5 shrink-0" />,
          url: "/research/publications",
        },
        {
          title: "Collaborations",
          description: "Industry and academic collaborations",
          icon: <Book className="size-5 shrink-0" />,
          url: "/research/collaborations",
        },
      ],
    },
    {
      title: "Podcasts",
      url: "/podcasts",
    },
    {
      title: "Team",
      url: "/team",
    },
  ],
  mobileExtraLinks: [
    { name: "About Us", url: "/about" },
    { name: "Contact", url: "/contact" },
    { name: "Join Us", url: "/signup" },
    { name: "Blog", url: "/blog" },
  ],
  auth: {
    login: { text: "Log in", url: "/login" },
    signup: { text: "Sign up", url: "/signup" },
  },
};

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <Link to={demoData.logo.url} className="flex items-center gap-2" aria-label={demoData.logo.title}>
            <img src={demoData.logo.src} alt={demoData.logo.alt} className="h-8 w-auto" />
            <span className="text-xl font-bold text-white">JellyTech</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6">
            {demoData.menu.map((item) => (
              item.items ? (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <Link
                      to={item.url}
                      className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors"
                    >
                      {item.title}
                      <ChevronDown className="h-4 w-4" />
                    </Link>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-zinc-900/95 border border-white/10 backdrop-blur-lg">
                    {item.items.map((subItem) => (
                      <DropdownMenuItem key={subItem.title} className="flex flex-col gap-1 p-3 hover:bg-white/5">
                        <div className="flex items-center gap-2">
                          {subItem.icon}
                          <span className="font-medium text-white">{subItem.title}</span>
                        </div>
                        <p className="text-xs text-white/50 ml-7">{subItem.description}</p>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.title}
                  to={item.url}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  {item.title}
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="hidden md:flex md:items-center md:gap-3">
          <Link to={demoData.auth.login.url} className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            {demoData.auth.login.text}
          </Link>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to={demoData.auth.signup.url}>{demoData.auth.signup.text}</Link>
          </Button>
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 text-white" aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-zinc-950 border-l border-white/10 p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <img src={demoData.logo.src} alt={demoData.logo.alt} className="h-8 w-auto" />
                <span className="text-xl font-bold text-white">JellyTech</span>
              </div>

              <nav className="flex flex-col gap-4">
                {demoData.menu.map((item) => (
                  item.items ? (
                    <div key={item.title} className="space-y-2">
                      <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{item.title}</h4>
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.title}
                          to={subItem.url}
                          className="flex items-center gap-2 px-2 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.icon}
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={item.title}
                      to={item.url}
                      className="px-2 py-2 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  )
                ))}
              </nav>

              <div className="border-t border-white/10 pt-4 space-y-2">
                {demoData.mobileExtraLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.url}
                    className="px-2 py-2 text-sm text-white/60 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Link
                  to={demoData.auth.login.url}
                  className="px-4 py-2 text-center text-sm font-medium text-white/80 hover:text-white border border-white/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {demoData.auth.login.text}
                </Link>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to={demoData.auth.signup.url} onClick={() => setMobileMenuOpen(false)}>
                    {demoData.auth.signup.text}
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}