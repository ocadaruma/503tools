// TODO: Move to more secure way to store token

const configVersion = 1
const configKey = "com.mayreh.503tools.config"
const configVersionKey = "com.mayreh.503tools.config.version"

export interface Config {
  githubToken: string,
  geminiApiKey: string,
  githubOwner: string,
  githubRepo: string,
  githubDataRoot: string,
}

export class ConfigStore {
  static load(): Config | null {
    const text = localStorage.getItem(configKey)
    if (text) {
      return JSON.parse(text)
    }
    return null
  }

  static save(config: Config) {
    localStorage.setItem(configVersionKey, configVersion.toString())
    localStorage.setItem(configKey, JSON.stringify(config))
  }
}
