import { deflateSync } from "node:zlib"

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type: string, data: Uint8Array): Buffer {
  const typeBytes = Buffer.from(type)
  const chunk = Buffer.alloc(data.length + 12)
  chunk.writeUInt32BE(data.length, 0)
  typeBytes.copy(chunk, 4)
  Buffer.from(data).copy(chunk, 8)
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBytes, Buffer.from(data)])), data.length + 8)
  return chunk
}

export function gridPngDataUrl(grid: boolean[][], scale = 16): string {
  const width = (grid[0]?.length ?? 0) * scale
  const height = grid.length * scale
  if (!width || !height) throw new Error("Cannot render an empty puzzle grid")

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 0 // grayscale

  const scanlines = Buffer.alloc((width + 1) * height)
  for (let y = 0; y < height; y++) {
    const offset = y * (width + 1)
    scanlines[offset] = 0 // no PNG row filter
    for (let x = 0; x < width; x++) scanlines[offset + x + 1] = grid[Math.floor(y / scale)]![Math.floor(x / scale)] ? 0 : 255
  }

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(scanlines)),
    pngChunk("IEND", Buffer.alloc(0)),
  ])
  return `data:image/png;base64,${png.toString("base64")}`
}
