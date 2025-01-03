export async function toBase64(data: Blob): Promise<string> {
  const reader = new FileReader()
  const readPromise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      resolve((reader.result as string).split(",")[1])
    }
  })
  reader.readAsDataURL(data)
  return readPromise
}

export async function resizeAsJpeg(data: Blob, maxWidth: number, maxHeight: number): Promise<Blob> {
  const ctx = document.createElement("canvas").getContext("2d")!
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const i = new Image()
    i.addEventListener("load", () => resolve(i))
    i.addEventListener("error", reject)
    i.src = URL.createObjectURL(data)
  })
  const { naturalWidth, naturalHeight } = img
  const w = Math.min(maxWidth, naturalWidth)
  const h = Math.min(maxHeight, naturalHeight)

  const ratio = Math.min(w / naturalWidth, h / naturalHeight)
  const resizedW = Math.floor(naturalWidth * ratio)
  const resizedH = Math.floor(naturalHeight * ratio)

  ctx.canvas.width = resizedW
  ctx.canvas.height = resizedH
  ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight, 0, 0, resizedW, resizedH)

  return await new Promise((resolve) => ctx.canvas.toBlob((blob) => {
    resolve(blob!)
  }, "image/jpeg", 0.9))
}
