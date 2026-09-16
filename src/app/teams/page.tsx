import type { Metadata } from "next";
import { Departments } from "@/components/sections/Departments";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: `الإدارات والفرق | ${BRAND.nameAr}`,
  description:
    "تعرّف على إدارات وفرق كورة: التصميم، التسويق، إدارة المشاريع، العمليات، العلاقات، الشراكات والمالية.",
};

export default function TeamsPage() {
  return <Departments />;
}
