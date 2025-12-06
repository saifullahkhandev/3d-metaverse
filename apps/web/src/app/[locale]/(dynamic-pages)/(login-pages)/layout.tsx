import { StackedCards } from "./stacked-cards";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen border-2 border-black lg:flex">
      <div className="relative flex h-full items-center justify-center bg-background p-8 lg:w-2/5">
        <div className="max-w-xl md:min-w-[450px]">{children}</div>
      </div>
      <div className="relative hidden h-full w-3/5 items-center justify-center border-l-2 lg:flex">
        <div className="w-full px-32">
          <StackedCards
            images={[
              "/assets/marketing/landing-1.jpg",
              "/assets/marketing/dashboard-2.jpg",
              "/assets/marketing/docs-3.jpg",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
