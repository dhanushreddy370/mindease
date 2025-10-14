from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

import time

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the index page
        time.sleep(15)
        page.goto("http://localhost:5173/")

        # Verify the questionnaire is visible
        expect(page.get_by_text("Personalize Your AI")).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/onboarding_questionnaire.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)