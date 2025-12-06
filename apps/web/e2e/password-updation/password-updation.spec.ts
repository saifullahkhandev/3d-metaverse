import { expect, request, test } from "@playwright/test";
import { uniqueId } from "lodash";
import { getDefaultWorkspaceInfoHelper } from "../_helpers/workspace.helper";

const INBUCKET_URL = "http://localhost:54324";

test.describe
  .serial("Password management", () => {
    test("Users can update password", async ({ page, browser }) => {
      await page.goto("/user/settings/security");
      const emailInput = page.getByRole("textbox", { name: "Email" });
      await expect(emailInput).toBeVisible();
      const email = await emailInput.inputValue();
      expect(email).toBeTruthy();
      if (!email) {
        throw new Error("Email not found");
      }
      const newPassword = `password-${uniqueId()}`;
      await page.getByRole("textbox", { name: "Password" }).fill(newPassword);
      await page.getByRole("button", { name: "Update Password" }).click();

      // Create a fresh context without storage state for unauthenticated login test
      const freshContext = await browser.newContext({
        storageState: { cookies: [], origins: [] },
      });
      const newPage = await freshContext.newPage();
      await newPage.goto("/login");
      const loginEmailInput = newPage.getByRole("textbox", { name: "email" });
      await expect(loginEmailInput).toBeVisible();
      await loginEmailInput.fill(email);
      await newPage
        .getByRole("textbox", { name: "password" })
        .fill(newPassword);
      await newPage.getByTestId("password-login-button").click();
      await expect(newPage.getByText("Logged in!")).toBeVisible();
      await freshContext.close();
    });

    test("Users can forget password and reset", async ({ page, browser }) => {
      async function getResetPasswordEmail(
        username: string
      ): Promise<{ url: string }> {
        const requestContext = await request.newContext();

        try {
          const response = await requestContext.get(
            `${INBUCKET_URL}/api/v1/search?query=${username}&limit=50`
          );

          if (!response.ok()) {
            throw new Error(
              `Mailbox not found or not ready yet ${response.status()} for ${username}`
            );
          }

          const emailResponse = await response.json().catch((error) => {
            throw new Error(
              `Failed to parse mailbox response: ${error.message}`
            );
          });

          const messages = emailResponse.messages;

          // Get messages from the last 2 minutes, sorted by date
          const TWO_MINUTES = 2 * 60 * 1000;
          const now = new Date().getTime();
          const recentMessages = messages
            .filter((message) => {
              const messageDate = new Date(message.Created).getTime();
              return now - messageDate < TWO_MINUTES;
            })
            .sort(
              (a, b) =>
                new Date(b.Created).getTime() - new Date(a.Created).getTime()
            );

          if (recentMessages.length === 0) {
            throw new Error(`No recent messages found for user ${username}`);
          }

          // Try each recent message until we find one with the correct format
          for (const message of recentMessages) {
            try {
              const messageResponse = await requestContext.get(
                `${INBUCKET_URL}/api/v1/message/${message.ID}`
              );

              if (!messageResponse.ok()) {
                continue; // Try next message if this one fails
              }

              const messageDetails = await messageResponse.json();

              try {
                // Try to extract URL from this message
                const urlMatch = messageDetails.Text.match(
                  /Reset password \( (.+) \)/
                );
                if (!urlMatch?.[1]) {
                  continue; // Try next message if format doesn't match
                }

                return {
                  url: urlMatch[1],
                };
              } catch (e) {}
            } catch (e) {}
          }

          throw new Error(
            "No valid reset password emails found in the last 2 minutes"
          );
        } finally {
          await requestContext.dispose();
        }
      }

      await getDefaultWorkspaceInfoHelper({ page });
      await page.goto("/user/settings/security");
      // get email of user
      const emailInput = page.getByRole("textbox", { name: "Email" });
      await expect(emailInput).toBeVisible();
      const email = await emailInput.inputValue();
      expect(email).toBeTruthy();
      if (!email) {
        throw new Error("Email not found");
      }

      // Create a fresh context without storage state for unauthenticated forgot-password flow
      const freshContext = await browser.newContext({
        storageState: { cookies: [], origins: [] },
      });
      const newPage = await freshContext.newPage();
      await newPage.goto("/forgot-password");
      const forgotPasswordEmailInput = newPage.getByPlaceholder(
        "placeholder@email.com"
      );
      await expect(forgotPasswordEmailInput).toBeVisible();
      await forgotPasswordEmailInput.fill(email);
      await newPage.getByRole("button", { name: "Reset password" }).click();
      await expect(
        newPage.getByText("A password reset link has been sent to your email!")
      ).toBeVisible();

      const identifier = email.split("@")[0];
      let resetPasswordUrl: string | undefined;
      await expect
        .poll(
          () =>
            getResetPasswordEmail(identifier).then((data) => {
              resetPasswordUrl = data.url;
              return true;
            }),
          {
            intervals: [1000, 2000, 5000, 10_000, 20_000],
          }
        )
        .toBe(true);

      if (!resetPasswordUrl) {
        throw new Error("No reset password URL received");
      }

      await newPage.goto(resetPasswordUrl);
      const resetPasswordForm = newPage.getByTestId("password-form");
      await expect(resetPasswordForm).toBeVisible();
      await resetPasswordForm.getByRole("textbox").fill("newpassword");
      await resetPasswordForm.getByRole("button").click();
      await newPage.waitForURL("/en/home");
      await freshContext.close();
    });
  });
