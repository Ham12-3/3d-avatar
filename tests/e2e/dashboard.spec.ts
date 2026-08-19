import { expect, test } from "@playwright/test";

test("core dashboard flow remains usable with the browser avatar",async({page})=>{
  // Turbopack can spend over a minute compiling several cold routes on Windows CI.
  test.setTimeout(180_000);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading",{name:"Good afternoon, Alex."})).toBeVisible();
  await page.getByRole("link",{name:"Revenue",exact:true}).click();
  await page.waitForURL("**/dashboard/revenue");
  await expect(page.getByRole("heading",{name:"Revenue",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"90 days"}).click();
  await expect(page.getByText("90-day net")).toBeVisible();
  await page.getByRole("link",{name:"Tickets"}).click();
  await page.waitForURL("**/dashboard/tickets");
  await page.getByLabel("Priority").selectOption("URGENT");
  await page.getByLabel("Status").selectOption("OPEN");
  await expect(page.getByText("#1042")).toBeVisible();
});
