import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";

type ManagementPageLayoutProps = {
  title: string;
  description: string;
  action: ReactNode;
  sectionTitle: string;
  sectionAccessory?: ReactNode;
  toolbar?: ReactNode;
  pagination?: ReactNode;
  children: ReactNode;
};

export function ManagementPageLayout({
  title,
  description,
  action,
  sectionTitle,
  sectionAccessory,
  toolbar,
  pagination,
  children,
}: ManagementPageLayoutProps) {
  return (
    <div className="flex flex-1 justify-center">
      <div className="mb-12 flex h-full max-w-96 flex-col gap-4 lg:max-w-220">
        <div className="mt-12 flex h-full flex-row gap-4">
          <div className="flex w-2/3 flex-col gap-2">
            <h1 className="text-2xl font-bold text-primary">{title}</h1>
            <p className="hidden text-lg text-foreground lg:flex">
              {description}
            </p>
          </div>
          <div className="flex w-1/3 flex-col items-end justify-end gap-2">
            {action}
          </div>
        </div>
        <div
          className={
            sectionAccessory
              ? "mt-4 flex flex-row items-end justify-between"
              : "mt-4"
          }
        >
          <h2 className="text-xl font-semibold text-foreground">
            {sectionTitle}
          </h2>
          {sectionAccessory}
        </div>
        {toolbar}
        <Separator className="my-4" />
        {children}
        {pagination}
      </div>
    </div>
  );
}
