export interface PackageDependencies {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
}

export interface ExternalDependenciesOptions {
    include?: Array<string | RegExp>;
}

export function externalDependencies(
    packageJson: PackageDependencies,
    options: ExternalDependenciesOptions = {},
): (id: string) => boolean {
    const modules = [
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.peerDependencies ?? {}),
        ...Object.keys(packageJson.optionalDependencies ?? {}),
        ...(options.include ?? []),
    ];

    return (id) =>
        modules.some((module) => {
            if (typeof module === 'string') {
                return id === module || id.startsWith(`${module}/`);
            }

            module.lastIndex = 0;

            return module.test(id);
        });
}
