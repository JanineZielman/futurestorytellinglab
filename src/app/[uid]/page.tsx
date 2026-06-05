import { Metadata } from "next";
import { notFound } from "next/navigation";

import { filter } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient, getPrismicLang } from "@/prismicio";
import { components } from "@/slices";

type Params = { uid: string };
type SearchParams = { lang?: string };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { uid } = await params;
  const query = await searchParams;
  const lang = getPrismicLang(query.lang);
  const client = createClient();
  const page = await client
    .getByUID("page", uid, lang ? { lang } : undefined)
    .catch(async () => {
      return client.getByUID("page", uid).catch(() => notFound());
    });

  // <SliceZone> renders the page's slices.
  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { uid } = await params;
  const query = await searchParams;
  const lang = getPrismicLang(query.lang);
  const client = createClient();
  const page = await client
    .getByUID("page", uid, lang ? { lang } : undefined)
    .catch(async () => {
      return client.getByUID("page", uid).catch(() => notFound());
    });

  return {
    title: page.data.title,
    description: page.data.meta_description,
    openGraph: {
      title: page.data.meta_title ?? undefined,
      images: [{ url: page.data.meta_image.url ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();

  // Get all pages from Prismic, except the homepage.
  const pages = await client.getAllByType("page", {
    filters: [filter.not("my.page.uid", "home")],
  });

  return pages.map((page) => ({ uid: page.uid }));
}
