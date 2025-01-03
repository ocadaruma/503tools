import type { User } from '@auth0/auth0-vue'

export interface Auth0Config {
  domain: string
  clientId: string
}

const auth0ConfigKey = "auth0.config"

export class Auth0ConfigStore {
  static load(): Auth0Config | null {
    const text = localStorage.getItem(auth0ConfigKey)
    if (text) {
      return JSON.parse(text)
    }
    return null
  }

  static save(config: Auth0Config) {
    localStorage.setItem(auth0ConfigKey, JSON.stringify(config))
  }
}

export interface Credentials {
  githubToken: string,
  geminiApiKey: string
}

export class CredentialsStore {
  readonly auth0Domain: string
  // auth0 management API token
  readonly auth0Token: string
  readonly user: User

  constructor(auth0Domain: string, auth0Token: string, user: User) {
    this.auth0Domain = auth0Domain
    this.auth0Token = auth0Token
    this.user = user
  }

  async load(): Promise<Credentials | null> {
    const response = await fetch(`https://${this.auth0Domain}/api/v2/users/${this.user.sub}`, {
      headers: {
        Authorization: `Bearer ${this.auth0Token}`
      }
    })
    const result = await response.json()
    const metadata = result["user_metadata"] || {}
    const githubToken = metadata["github_personal_access_token"] || ""
    const geminiApiKey = metadata["gemini_api_key"] || ""

    if (githubToken && geminiApiKey) {
      return {
        githubToken,
        geminiApiKey
      }
    }
    return null
  }

  async save(credentials: Credentials): Promise<void> {
    return fetch(`https://${this.auth0Domain}/api/v2/users/${this.user.sub}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.auth0Token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_metadata: {
          github_personal_access_token: credentials.githubToken,
          gemini_api_key: credentials.geminiApiKey,
        }
      })
    }).then(() => {})
  }
}

export interface GitHubConfig {
  owner: string
  repo: string
  root: string
}

const githubConfigKey = "github.config"

export class GitHubConfigStore {
  static load(): GitHubConfig | null {
    const text = localStorage.getItem(githubConfigKey)
    if (text) {
      return JSON.parse(text)
    }
    return null
  }

  static save(config: GitHubConfig) {
    localStorage.setItem(githubConfigKey, JSON.stringify(config))
  }
}
