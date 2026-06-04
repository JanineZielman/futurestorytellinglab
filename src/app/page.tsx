import { type Metadata } from "next";

import { asText } from "@prismicio/client";
import { PrismicRichText, SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function Home() {
  const client = createClient();
  const home = await client.getByUID("page", "home");

  return (
    <div>
      <section className="hero">
        <div>
          {home.data.image.url && <img src={home.data.image.url} alt={home.data.image.alt || ""} />}
          <h1>{home.data.title}</h1>
        </div>
        <PrismicRichText field={home.data.text} />
      </section>
      <SliceZone slices={home.data.slices} components={components} />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const home = await client.getByUID("page", "home");

  return {
    title: home.data.title,
    description: home.data.meta_description,
    openGraph: {
      title: home.data.meta_title ?? undefined,
      images: [{ url: home.data.meta_image.url ?? "" }],
    },
  };
}
