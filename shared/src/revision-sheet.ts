export type RevisionModuleSection = {
  slug: string;
  title: string;
  sortOrder: number;
  takeaways: string[];
};

export type RevisionModuleInput = {
  slug: string;
  title: string;
  sortOrder?: number;
  keyTakeaways?: string[];
};

/** Agrège les points clés par module pour la fiche révision (4 modules typiques). */
export function buildRevisionSections(modules: RevisionModuleInput[]): RevisionModuleSection[] {
  return modules
    .filter((module) => (module.keyTakeaways?.length ?? 0) > 0)
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((module) => ({
      slug: module.slug,
      title: module.title,
      sortOrder: module.sortOrder ?? 0,
      takeaways: module.keyTakeaways ?? [],
    }));
}

export function countRevisionTakeaways(sections: RevisionModuleSection[]): number {
  return sections.reduce((sum, section) => sum + section.takeaways.length, 0);
}
