import { describe, expect, it } from "vitest";
import { ProductModalHistory } from "@/app/_ui/product-modal-history";
import { MemoryHistory } from "./memory-history";

describe("ProductModalHistory", () => {
  it("opens a product in a new entry, and closing steps back over it", () => {
    // Arrange
    const history = new MemoryHistory("/?q=watches");
    const modal = new ProductModalHistory(history);

    // Act
    modal.open("rolex");
    const opened = history.currentUrl();
    const outcome = modal.close();
    history.landBack();

    // Assert
    expect(opened).toBe("/?q=watches&product=rolex");
    expect(outcome).toBe("stepping-back");
    expect(modal.followHistory()).toBeNull();
    expect(history.currentUrl()).toBe("/?q=watches");
  });

  it("steps back once, however often it is closed before Back lands", () => {
    const history = new MemoryHistory("/?q=watches");
    const modal = new ProductModalHistory(history);
    modal.open("rolex");

    expect([modal.close(), modal.close()]).toEqual(["stepping-back", "already-stepping-back"]);
    history.landBack();
    expect(history.currentUrl()).toBe("/?q=watches");
  });

  it("closes a shared link in place, without leaving the page", () => {
    // Arrange
    const history = new MemoryHistory("/?q=watches&product=rolex");
    const modal = new ProductModalHistory(history);

    // Act
    const outcome = modal.close();

    // Assert
    expect(outcome).toBe("closed");
    expect(history.currentUrl()).toBe("/?q=watches");
    expect(history.entryCount()).toBe(1);
  });

  it("reads the product from the address after Back or Forward", () => {
    const history = new MemoryHistory("/deals");
    const modal = new ProductModalHistory(history);
    modal.open("lamp");

    expect(modal.followHistory()).toBe("lamp");
  });
});
