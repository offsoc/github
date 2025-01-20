export class FilesCollection {
  // Files are stored as a simple array of blobs, since we don't support deleting them
  #files: Array<Blob>

  constructor(files: Array<Blob> = []) {
    this.#files = [...files]
  }

  public byId(id: number): Blob | undefined {
    return this.#files[id]
  }

  public add(file: Blob): number {
    return this.#files.push(file) - 1
  }
}
