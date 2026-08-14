import type { Metadata } from "next";
import Image from "next/image";
import { AppFooter } from "../_components/app-footer";
import { AppHeader } from "../_components/app-header";

export const metadata: Metadata = {
  title: "Developer",
  description: "Profil developer MScrape, Muh Amin Arsyad, beserta kanal kontak resminya.",
  alternates: { canonical: "/developer" },
  openGraph: { url: "/developer" },
};

const contacts = [
  { label: "Kirim email ke Muh Amin Arsyad", href: "mailto:alienrektz@gmail.com", icon: "/media/social/gmail.svg", name: "Email" },
  { label: "Facebook Muh Amin Arsyad", href: "https://www.facebook.com/share/1C6po4Tj86/", icon: "/media/social/facebook.svg", name: "Facebook" },
  { label: "WhatsApp Muh Amin Arsyad", href: "https://wa.me/6285111349699", icon: "/media/social/whatsapp.svg", name: "WhatsApp" },
  { label: "TikTok Muh Amin Arsyad", href: "https://www.tiktok.com/@rektxkz?_r=1&_t=ZS-98ry9zZuC7Z", icon: "/media/social/tiktok.svg", name: "TikTok" },
];

export default function DeveloperPage() {
  return (
    <>
      <AppHeader current="info" />
      <main className="developer-page">
        <section className="developer-profile wb-shell" aria-labelledby="developer-title">
          <div className="developer-profile__image-wrap">
            <Image
              className="developer-profile__image"
              src="/media/developer/muh-amin-arsyad.jpg"
              alt="Muh Amin Arsyad"
              width={1080}
              height={1083}
              priority
              sizes="(max-width: 47.99rem) 11rem, 22rem"
            />
          </div>
          <div className="developer-profile__copy">
            <p className="info-kicker">03 / DEVELOPER</p>
            <h1 id="developer-title">MUH AMIN ARSYAD</h1>
            <p>Developer MScrape. Hubungi melalui kanal berikut untuk pertanyaan terkait aplikasi, pengembangan, atau kolaborasi.</p>
            <div className="developer-profile__socials" aria-label="Kontak Muh Amin Arsyad">
              {contacts.map((contact) => (
                <a key={contact.name} href={contact.href} target={contact.href.startsWith("http") ? "_blank" : undefined} rel={contact.href.startsWith("http") ? "noreferrer" : undefined} aria-label={contact.label} title={contact.name}>
                  <img src={contact.icon} alt="" aria-hidden="true" />
                  <span>{contact.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
        <AppFooter />
      </main>
    </>
  );
}
