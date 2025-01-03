import { Octokit } from '@octokit/rest'
import type { Result } from '@/core/result.ts'
import { toBase64 } from '@/core/image.ts'

export class GithubApi {
  readonly token: string
  readonly octokit: Octokit
  readonly owner: string
  readonly repo: string

  constructor(token: string, owner: string, repo: string) {
    this.token = token
    this.owner = owner
    this.repo = repo
    this.octokit = new Octokit({
      auth: token
    })
  }

  checkAccess(): Promise<Result<void>> {
    return this.octokit.rest.repos.get({ owner: this.owner, repo: this.repo })
      .then(() => ({ key: "ok", value: null }))
      .catch((e) => ({ key: "err", error: e }))
  }

  commitText(message: string, path: string, text: string): Promise<void> {
    const textBytes = new TextEncoder().encode(text)
    const base64 = btoa(Array.from(textBytes, (b) => String.fromCharCode(b)).join(""))
    return this.octokit.rest.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message,
      content: base64
    })
  }

  async commitImage(message: string, path: string, image: Blob): Promise<void> {
    const base64 = await toBase64(image)
    return this.octokit.rest.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message,
      content: base64
    })
  }
}
