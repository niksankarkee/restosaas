import { Hero } from '@/components/hero';
import { SearchForm } from '@/components/search-form';
import { Features } from '@/components/features';
import { CTA } from '@/components/cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SearchForm />
      <Features />
      <CTA />
    </>
  );
}
