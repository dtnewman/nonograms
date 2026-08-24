import { describe, expect, test } from "bun:test"
import { gridPngDataUrl } from "../src/grid-image"

describe("grid PNG rendering", () => {
  test("renders a valid, correctly sized PNG data URL", () => {
    const url = gridPngDataUrl([
      [true, false],
      [false, true],
    ], 4)
    const png = Buffer.from(url.slice("data:image/png;base64,".length), "base64")

    expect(url.startsWith("data:image/png;base64,")).toBe(true)
    expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    expect(png.readUInt32BE(16)).toBe(8)
    expect(png.readUInt32BE(20)).toBe(8)
  })
})
