import packageJson from '../../package.json'

export const getPackageJson = (): { name: string; version: string } => {
  return {
    name: packageJson.name,
    version: packageJson.version,
  }
}
