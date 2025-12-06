import { expect, test } from "@playwright/test";

test.describe
  .serial("Blog Post Management", () => {
    let blogPostId: string | undefined;
    let blogPostTitle: string | undefined;

    test("Admin creates a new blog post", async ({ browser }) => {
      const adminContext = await browser.newContext({
        storageState: "playwright/.auth/app-admin.json",
      });
      const adminPage = await adminContext.newPage();

      await adminPage.goto("/en/app-admin/marketing/blog");
      const createButton = adminPage.getByRole("button", {
        name: "Create Blog Post",
      });
      await createButton.waitFor({ state: "visible" });
      await createButton.click();

      // Wait for either URL change (success) OR error toast (failure)
      const result = await Promise.race([
        adminPage
          .waitForURL(/\/en\/app-admin\/marketing\/blog\/[a-zA-Z0-9-]+$/, {
            timeout: 10_000,
          })
          .then(() => ({ type: "success" as const })),
        adminPage
          .getByText(/Failed to create blog post/)
          .waitFor({ timeout: 10_000 })
          .then(() => ({ type: "error" as const })),
        adminPage
          .getByText(/User is not an admin/)
          .waitFor({ timeout: 10_000 })
          .then(() => ({ type: "auth_error" as const })),
      ]).catch(() => ({ type: "timeout" as const }));

      if (
        result.type === "error" ||
        result.type === "auth_error" ||
        result.type === "timeout"
      ) {
        // Capture error details
        const pageContent = await adminPage.content();
        const toasts = await adminPage
          .locator("[data-sonner-toast]")
          .allTextContents();
        console.log("=== BLOG CREATION DEBUG INFO ===");
        console.log("Result type:", result.type);
        console.log("Toast messages:", toasts);
        console.log("Current URL:", adminPage.url());

        // Try to get more specific error
        const errorToast = adminPage
          .locator("[data-sonner-toast]")
          .filter({ hasText: /Failed|error|Error/ });
        if ((await errorToast.count()) > 0) {
          const errorText = await errorToast.first().textContent();
          console.log("Error toast content:", errorText);
        }

        throw new Error(
          `Blog post creation failed: ${result.type}. Check console for details.`
        );
      }

      const url = await adminPage.url();
      blogPostId = url.split("/").pop();
      expect(blogPostId).toBeDefined();

      const randomTitleSuffix = Math.random().toString(36).substring(2, 15);
      blogPostTitle = `Test Blog Post ${randomTitleSuffix}`;

      await adminPage.getByLabel("Title").fill(blogPostTitle);
      await adminPage.locator("#status").click();
      await adminPage.getByLabel("Published").click();

      // Expand the Summary accordion
      await adminPage
        .getByRole("button", { name: "Summary (Optional)" })
        .click();
      await adminPage
        .getByRole("textbox", { name: "Summary" })
        .fill("This is a test summary");

      await adminPage.getByRole("button", { name: "Update Blog Post" }).click();

      // Wait for update to complete before navigating away
      await expect(
        adminPage.getByRole("button", { name: /Updated!/i })
      ).toBeVisible({ timeout: 10_000 });

      await adminPage.goto("/en/app-admin/marketing/blog");

      // Wait for the list page to fully load
      await adminPage
        .getByRole("button", { name: "Create Blog Post" })
        .waitFor({ state: "visible" });

      // Verify the blog post appears in the list using the specific row test ID
      const blogTitle = adminPage.getByTestId(
        `admin-blog-list-title-${blogPostId}`
      );
      await expect(blogTitle).toBeVisible({ timeout: 10_000 });

      await adminContext.close();
    });

    test("Anonymous user can see the published blog post", async ({
      page,
      request,
    }) => {
      // Force revalidation of the blog list page
      await request.get("/api/revalidate?path=/blog");
      await page.waitForTimeout(1000);

      await page.goto("/en/blog", { waitUntil: "networkidle" });

      // Look for the blog post title in the card - the blog posts are rendered as cards with CardTitle
      // The title is inside a Link -> Card -> CardHeader -> CardTitle
      await expect(async () => {
        const titleElement = page.locator(`text="${blogPostTitle}"`).first();
        await expect(titleElement).toBeVisible();
      }).toPass({ timeout: 15_000, intervals: [2000, 3000, 5000] });

      // Click on the card/link containing the blog post
      await page.locator(`text="${blogPostTitle}"`).first().click();

      await page.waitForURL(/\/en\/blog\/[a-zA-Z0-9-]+$/);
      await expect(
        page.getByRole("heading", { name: blogPostTitle })
      ).toBeVisible();
    });

    test("Admin can edit the blog post", async ({ browser }) => {
      const adminContext = await browser.newContext({
        storageState: "playwright/.auth/app-admin.json",
      });
      const adminPage = await adminContext.newPage();

      await adminPage.goto(`/en/app-admin/marketing/blog/${blogPostId}`);

      const updatedTitle = `${blogPostTitle} (Updated)`;
      await adminPage.getByLabel("Title").fill(updatedTitle);
      await adminPage.getByRole("button", { name: "Update Blog Post" }).click();

      // Wait for update to complete before navigating away
      await expect(
        adminPage.getByRole("button", { name: /Updated!/i })
      ).toBeVisible({ timeout: 10_000 });

      await adminPage.goto("/en/app-admin/marketing/blog");

      // Wait for the list page to fully load
      await adminPage
        .getByRole("button", { name: "Create Blog Post" })
        .waitFor({ state: "visible" });

      // Verify the updated blog post appears in the list with polling
      const blogTitle = adminPage.getByTestId(
        `admin-blog-list-title-${blogPostId}`
      );
      await expect(blogTitle).toBeVisible({ timeout: 10_000 });

      // Poll for the updated title to appear (may take time for cache invalidation)
      await expect
        .poll(
          async () => {
            const text = await blogTitle.textContent();
            return text?.includes(updatedTitle);
          },
          {
            intervals: [500, 1000, 2000],
            timeout: 15_000,
          }
        )
        .toBe(true);

      if (!blogPostTitle) {
        throw new Error("Blog post title is undefined");
      }
      blogPostTitle = updatedTitle;

      await adminContext.close();
    });

    test("Anonymous user can see the updated blog post", async ({ page }) => {
      await page.goto("/en/blog");

      const updatedBlogPostLink = page.getByRole("link", {
        name: blogPostTitle,
      });
      await expect(updatedBlogPostLink).toBeVisible();

      await updatedBlogPostLink.click();

      await page.waitForURL(/\/en\/blog\/[a-zA-Z0-9-]+$/);
      await expect(
        page.getByRole("heading", { name: blogPostTitle })
      ).toBeVisible();
    });

    test("Admin can change blog post status", async ({ browser }) => {
      const adminContext = await browser.newContext({
        storageState: "playwright/.auth/app-admin.json",
      });
      const adminPage = await adminContext.newPage();

      await adminPage.goto(`/en/app-admin/marketing/blog/${blogPostId}`);

      await adminPage.locator("#status").first().click();
      await adminPage.getByLabel("Draft").click();
      await adminPage.getByRole("button", { name: "Update Blog Post" }).click();

      // Wait for update to complete before navigating away
      await expect(
        adminPage.getByRole("button", { name: /Updated!/i })
      ).toBeVisible({ timeout: 10_000 });

      await adminPage.goto("/en/app-admin/marketing/blog");
      const row = adminPage.getByTestId(`admin-blog-list-row-${blogPostId}`);
      // Use case-insensitive regex - status cell shows lowercase "draft"
      const statusCell = row.getByRole("cell", { name: /draft/i });
      await expect(statusCell).toBeVisible({ timeout: 10_000 });

      await adminContext.close();
    });

    test("Anonymous user cannot see the draft blog post", async ({ page }) => {
      await page.goto("/en/blog");

      const blogPostLink = page.getByRole("link", { name: blogPostTitle });
      await expect(blogPostLink).not.toBeVisible();
    });

    test("Admin can delete the blog post", async ({ browser }) => {
      const adminContext = await browser.newContext({
        storageState: "playwright/.auth/app-admin.json",
      });
      const adminPage = await adminContext.newPage();

      await adminPage.goto("/en/app-admin/marketing/blog");

      const deleteButton = adminPage
        .getByRole("row", { name: blogPostTitle })
        .getByTestId("delete-blog-post-dialog-trigger");
      await deleteButton.click();
      await adminPage.getByTestId("confirm-delete-button").waitFor();
      await adminPage.getByTestId("confirm-delete-button").click();

      if (!blogPostTitle) {
        throw new Error("Blog post title is undefined");
      }

      // Verify the blog post is gone
      await expect(
        adminPage.getByRole("row", { name: blogPostTitle })
      ).not.toBeVisible();

      await adminContext.close();
    });
  });
