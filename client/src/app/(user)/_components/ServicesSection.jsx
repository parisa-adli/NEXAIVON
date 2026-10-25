import { services } from "@/constants/home";

export default function ServicesSection() {
  return (
    <section aria-label="خدمات فروشگاه">
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 rounded-xl bg-secondary-100 px-4 py-6 lg:divide-x lg:divide-x-reverse divide-secondary-200">
        {services.map(({ title, subtitle, icon: Icon }) => (
          <li key={title} className="flex items-center justify-center gap-x-3">
            <Icon aria-hidden className="w-7 h-7 text-secondary-800" />
            <div>
              <p className="text-sm font-bold text-secondary-900">{title}</p>
              <p className="text-xs text-secondary-500">{subtitle}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
