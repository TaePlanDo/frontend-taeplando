import { expect, type Locator } from "@playwright/test";

export async function setSliderValue(
  slider: Locator,
  target: number,
): Promise<void> {
  const difference =
    target - Number(await slider.getAttribute("aria-valuenow"));
  for (let i = 0; i < Math.floor(Math.abs(difference) / 10); i++) {
    await slider.press(difference > 0 ? "PageUp" : "PageDown");
  }
  for (let i = 0; i < Math.abs(difference) % 10; i++) {
    await slider.press(difference > 0 ? "ArrowRight" : "ArrowLeft");
  }
  await expect(slider).toHaveAttribute("aria-valuenow", String(target));
}
